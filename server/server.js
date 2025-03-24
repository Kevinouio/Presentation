import express from "express";
import { spawn } from "child_process";
import { createServer } from "http";
import cors from 'cors';
const app = express();
app.use(express.json());

// Store game sessions with their CLI processes
const activeGames = new Map();

// POST /api/start-game
app.post("/api/start-game", (req, res) => {
    console.log("Received start-game request:", req.body);
    const { gameId, playerOrder } = req.body;
    console.log(`Starting new game ${gameId}`);

    // Clean up any existing game with same ID
    if (activeGames.has(gameId)) {
        const oldProcess = activeGames.get(gameId).cliProcess;
        oldProcess.kill();
        activeGames.delete(gameId);
    }

    // Spawn new CLI process
    const cliArgs = [
        "--game=connect_four",
        "--az_path=../connect_four",
        "--az_checkpoint=50",
        playerOrder === "first"
            ? "--player1=human --player2=az"
            : "--player1=az --player2=human"
    ];
    const cliProcess = spawn("../build/examples/alpha_zero_torch_game_example", cliArgs);
    // Initialize game session
    const gameSession = {
        cliProcess,
        buffer: "",
        moveResolver: null,
        currentMove: null
    };

    activeGames.set(gameId, gameSession);

    // Handle CLI output


    // Add immediate model move handling for "second" player
    if (playerOrder === "second") {
        cliProcess.stdout.once('data', (data) => {
            const output = data.toString();
            const moveMatch = output.match(/AI move: (\d+)/);
            if (moveMatch) {
                const session = activeGames.get(gameId);
                if (session) {
                    session.currentMove = parseInt(moveMatch[1]);
                }
            }
        });
    }


    cliProcess.stderr.on('data', (data) => {
        console.error(`CLI [${gameId}] stderr:`, data.toString());
    });

    cliProcess.on('close', (code) => {
        console.log(`CLI [${gameId}] process exited with code ${code}`);
        activeGames.delete(gameId);
    });

    res.json({ success: true, message: "Game started" });

    cliProcess.on('error', (err) => {
        console.error(`CLI process error [${gameId}]:`, err);
        res.status(500).json({ error: "CLI process failed to start" });
    });
});

// POST /api/send-move
app.post("/api/send-move", (req, res) => {
    const { gameId, move } = req.body;
    const session = activeGames.get(gameId);

    if (!session) {
        return res.status(404).json({ error: "Game not found" });
    }

    if (typeof move !== 'number' || move < 0 || move > 6) {
        return res.status(400).json({ error: "Invalid move" });
    }

    try {
        session.cliProcess.stdin.write(`${move}\n`);
        res.json({ success: true, message: "Move sent to CLI" });
    } catch (error) {
        console.error(`Error sending move to CLI [${gameId}]:`, error);
        res.status(500).json({ error: "Failed to send move" });
    }
});

// GET /api/get-model-move
app.get("/api/get-model-move", async (req, res) => {
    const { gameId } = req.query;
    const session = activeGames.get(gameId);

    if (!session) {
        return res.status(404).json({ error: "Game not found" });
    }

    // If we already have a move, return it immediately
    if (session.currentMove !== null) {
        const move = session.currentMove;
        session.currentMove = null;
        return res.json({ move });
    }

    // Wait for new move with timeout
    try {
        const move = await new Promise((resolve, reject) => {
            // Set timeout for 10 seconds
            const timeout = setTimeout(() => {
                reject(new Error("Model move timeout"));
            }, 120000); // 120 seconds

            // Add cleanup on timeout
            session.moveResolver = (receivedMove) => {
                clearTimeout(timeout);
                resolve(receivedMove);
            };
        });

        res.json({ move });
    } catch (error) {
        console.error(`Error getting model move [${gameId}]:`, error.message);
        res.status(504).json({ error: "Model move timeout" });
    }
});

// Cleanup dead games periodically
setInterval(() => {
    activeGames.forEach((session, gameId) => {
        if (session.cliProcess.killed) {
            activeGames.delete(gameId);
        }
    });
}, 60000);

app.use(cors({
    origin: 'http://localhost:5173', // Update with your frontend port
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));


const PORT = 5001;
const httpServer = createServer(app);
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});