import React, { useState, useEffect } from "react";
import Board from "../components/Board";
import ResetButton from "../components/ResetButton";
import DroppingPiece from "../components/DroppingPiece";
import checkWinner from "../utils/checkWinner";
import "../styles/Connect4.css";

interface DroppingPieceInfo {
    col: number;
    targetRow: number;
    color: string;
}

const Connect4: React.FC = () => {
    // Start screen and session info
    const [gameStarted, setGameStarted] = useState(false);
    const [playerOrder, setPlayerOrder] = useState<"first" | "second">("first");
    const [gameId, setGameId] = useState<string | null>(null);

    // Game state
    const [board, setBoard] = useState(
        Array(6).fill(null).map(() => Array(7).fill(null))
    );
    const [currentPlayer, setCurrentPlayer] = useState("red");
    const [winner, setWinner] = useState<string | null>(null);
    const [droppingPiece, setDroppingPiece] = useState<DroppingPieceInfo | null>(null);
    const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
    const [isModelThinking, setIsModelThinking] = useState(false);

    // Determine colors: player's chosen color vs. model's color
    const playerColor = playerOrder === "first" ? "red" : "yellow";
    const modelColor = playerColor === "red" ? "yellow" : "red";

    // Start game handler
    const handleStartGame = async () => {
        // Reset any existing game state
        resetGame();

        const newGameId = Math.random().toString(36).substring(2, 9);
        setGameId(newGameId);
        setGameStarted(true);

        try {
            const response = await fetch("http://127.0.0.1:5001/api/start-game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId: newGameId,
                    playerOrder: playerOrder
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to start game");
            }

            // If player is second, immediately get model move
            if (playerOrder === "second") {
                setCurrentPlayer(modelColor);
                setTimeout(() => {
                    getModelMove();
                }, 1000);
            }
        } catch (error) {
            console.error("Error starting game:", error);
            alert("Failed to start game. Please try again.");
            resetGame();
        }
    };


    // Handler for column click (human or model moves)
    const handleColumnClick = (colIndex: number, isModelMove = false) => {
        if (winner || droppingPiece) return;
        // Prevent human clicks if it's the model's turn
        if (!isModelMove && currentPlayer === modelColor) return;

        const newBoard = board.map((row) => [...row]);
        let targetRow = -1;
        for (let row = 5; row >= 0; row--) {
            if (!newBoard[row][colIndex]) {
                targetRow = row;
                break;
            }
        }
        if (targetRow === -1) return;

        setDroppingPiece({ col: colIndex, targetRow, color: currentPlayer });
    };

    // Called when the piece drop animation completes
    const onDropComplete = async () => {
        if (!droppingPiece) return;

        const { col, targetRow, color } = droppingPiece;
        const newBoard = board.map((row) => [...row]);
        newBoard[targetRow][col] = color;

        if (checkWinner(newBoard, targetRow, col, color)) {
            setWinner(color);
        } else {
            const nextPlayer = color === "red" ? "yellow" : "red";
            setCurrentPlayer(nextPlayer);

            // If human just played, send the move to the backend
            if (color === playerColor) {
                try {
                    await fetch("http://127.0.0.1:5001/api/send-move", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            move: col,
                            gameId: gameId  // Include gameId here
                        }),
                    });
                } catch (error) {
                    console.error("Error sending human move:", error);
                }
            }

            // If it’s now the model’s turn, fetch the model’s move
            if (nextPlayer === modelColor) {
                getModelMove();
            }
        }
        setBoard(newBoard);
        setDroppingPiece(null);
    };

    const getModelMove = async () => {
        setIsModelThinking(true);
        let retries = 3;

        while (retries > 0) {
            try {
                const response = await fetch(
                    `http://127.0.0.1:5001/api/get-model-move?gameId=${gameId}`
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setIsModelThinking(false);
                    handleColumnClick(data.move, true);
                    return;
                }

                if (response.status === 504) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before retry
                    continue;
                }

                throw new Error("Failed to get model move");

            } catch (error) {
                console.error("Error fetching model move:", error);
                if (retries <= 0) {
                    setIsModelThinking(false);
                    alert("Model failed to respond. Please restart the game.");
                    resetGame();
                }
            }
        }
    };


    // If the game starts and it's the model’s turn, immediately fetch a model move
    useEffect(() => {
        if (gameStarted && currentPlayer === modelColor && !droppingPiece && gameId) {
            getModelMove();
        }
    }, [gameStarted, currentPlayer, droppingPiece, board, modelColor, gameId]); // Add gameId to dependencies

    // Reset game state
    const resetGame = () => {
        setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
        setCurrentPlayer("red");
        setWinner(null);
        setDroppingPiece(null);
        setGameStarted(false);
        setGameId(null);
    };

    if (!gameStarted) {
        return (
            <div className="start-game">
                <h2>Start a New Connect 4 Game</h2>
                <div className="start-options">
                    <button
                        className={`option-button ${playerOrder === "first" ? "selected" : ""}`}
                        onClick={() => setPlayerOrder("first")}
                    >
                        Player 1 (Go First)
                    </button>
                    <button
                        className={`option-button ${playerOrder === "second" ? "selected" : ""}`}
                        onClick={() => setPlayerOrder("second")}
                    >
                        Player 2 (Go Second)
                    </button>
                </div>
                <button className="start-game-button" onClick={handleStartGame}>
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="connect4-page">
            <div className="status-container">
                <div className="status-info">
                    <span className="status-label">Game Status:</span>
                    <span className="status-value">
                        {!gameStarted ? "Not Started" :
                        winner ? "Completed" :
                        isModelThinking ? "Model Thinking..." : "In Progress"}
                    </span>
                </div>
                <div className="status-info">
                    <span className="status-label">Your Color:</span>
                    <span className={`chip ${playerColor}`}></span>
                </div>
                <div className="status-info">
                    <span className="status-label">Current Color:</span>
                    <span className={`chip ${currentPlayer}`}></span>
                </div>
                {winner && (
                    <div className="status-info winner">
                        <span className="status-label">Winner:</span>
                        <span className={`chip ${winner}`}></span>
                    </div>
                )}
            </div>
            <h3 className="game-id">Game ID: {gameId}</h3>
            {isModelThinking && <div className="thinking-message">Model is thinking...</div>}

            <div className="board-container">
                {/* Preview row for hover effect */}
                <div className="preview-row">
                    {Array(7).fill(null).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="preview-cell"
                            onMouseEnter={() => setHoveredColumn(colIndex)}
                            onMouseLeave={() => setHoveredColumn(null)}
                            onClick={() => handleColumnClick(colIndex)}
                        >
                            {hoveredColumn === colIndex && (
                                <div className={`preview-piece ${currentPlayer}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* The main board */}
                <Board board={board} onColumnClick={handleColumnClick} />

                {/* Invisible overlay to handle clicks */}
                <div className="board-hover-overlay">
                    {Array(7).fill(null).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="hover-overlay-column"
                            onMouseEnter={() => setHoveredColumn(colIndex)}
                            onMouseLeave={() => setHoveredColumn(null)}
                            onClick={() => handleColumnClick(colIndex)}
                        />
                    ))}
                </div>

                {/* Animated piece dropping */}
                {droppingPiece && (
                    <DroppingPiece
                        colIndex={droppingPiece.col}
                        targetRow={droppingPiece.targetRow}
                        color={droppingPiece.color}
                        onDropComplete={onDropComplete}
                    />
                )}
            </div>

            <ResetButton onReset={resetGame} />
        </div>
    );
};

export default Connect4;
