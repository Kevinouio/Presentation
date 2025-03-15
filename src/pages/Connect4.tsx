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

    // Determine colors: player's chosen color versus model's color.
    const playerColor = playerOrder === "first" ? "red" : "yellow";
    const modelColor = playerColor === "red" ? "yellow" : "red";

    // Start game handler
    const handleStartGame = () => {
        const newGameId = Math.random().toString(36).substring(2, 9);
        setGameId(newGameId);
        setGameStarted(true);
    };

    // Handler for column click (user move)
    const handleColumnClick = (colIndex: number, isModelMove = false) => {
        // Prevent moves if there's a winner or a piece is dropping,
        // and if it's a user move, block it when it's the model's turn.
        if (winner || droppingPiece || (!isModelMove && currentPlayer === modelColor)) return;
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

    // Called when the drop animation completes
    const onDropComplete = () => {
        if (droppingPiece) {
            const { col, targetRow, color } = droppingPiece;
            const newBoard = board.map((row) => [...row]);
            newBoard[targetRow][col] = color;
            if (checkWinner(newBoard, targetRow, col, color)) {
                setWinner(color);
            } else {
                const nextPlayer = color === "red" ? "yellow" : "red";
                setCurrentPlayer(nextPlayer);
                // If it's the model's turn, trigger its move.
                if (nextPlayer === modelColor) {
                    getModelMove(newBoard, nextPlayer);
                }
            }
            setBoard(newBoard);
            setDroppingPiece(null);
        }
    };

    const getModelMove = async (currentBoard: any, moveOrder: string) => {
        setIsModelThinking(true);
        const payload = {
            gameId,
            board: currentBoard,
            moveOrder, // should be the model's color
        };

        try {
            // Artificial delay to simulate slow API response
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const response = await fetch("http://127.0.0.1:5000/api/get-move", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            // In getModelMove, when the API returns a move:
            const data = await response.json();
            setIsModelThinking(false);
// Pass 'true' for isModelMove so that the check is bypassed.
            handleColumnClick(data.move, true);

        } catch (error) {
            console.error("Error fetching model move:", error);
            setIsModelThinking(false);
        }
    };

    useEffect(() => {
        console.log("useEffect triggered", { gameStarted, currentPlayer, modelColor, droppingPiece });
        if (gameStarted && currentPlayer === modelColor && !droppingPiece) {
            getModelMove(board, currentPlayer);
        }
    }, [gameStarted, currentPlayer, droppingPiece, board, modelColor]);

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
            {isModelThinking && (
                <div className="thinking-message">Model is thinking...</div>
            )}
            <div className="board-container">
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
                <Board board={board} onColumnClick={handleColumnClick} />
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
