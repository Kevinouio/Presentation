import React, { useState } from "react";
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
    const [board, setBoard] = useState(
        Array(6)
            .fill(null)
            .map(() => Array(7).fill(null))
    );
    const [currentPlayer, setCurrentPlayer] = useState("red");
    const [winner, setWinner] = useState<string | null>(null);
    const [droppingPiece, setDroppingPiece] = useState<DroppingPieceInfo | null>(null);
    const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

    const handleColumnClick = (colIndex: number) => {
        if (winner || droppingPiece) return;
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

    const onDropComplete = () => {
        if (droppingPiece) {
            const { col, targetRow, color } = droppingPiece;
            const newBoard = board.map((row) => [...row]);
            newBoard[targetRow][col] = color;
            if (checkWinner(newBoard, targetRow, col, color)) {
                setWinner(color);
            } else {
                setCurrentPlayer(color === "red" ? "yellow" : "red");
            }
            setBoard(newBoard);
            setDroppingPiece(null);
        }
    };

    const resetGame = () => {
        setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
        setCurrentPlayer("red");
        setWinner(null);
        setDroppingPiece(null);
    };

    return (
        <div className="connect4-page">
            <h2 className="status">
                {winner ? `${winner} wins!` : `Turn: ${currentPlayer}`}
            </h2>
            <div className="board-container">
                {/* Preview row above the board */}
                <div className="preview-row">
                    {Array(7)
                        .fill(null)
                        .map((_, colIndex) => (
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
                {/* Actual game board */}
                <Board board={board} onColumnClick={handleColumnClick} />
                {/* Overlay on top of the board to capture hover events */}
                <div className="board-hover-overlay">
                    {Array(7)
                        .fill(null)
                        .map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className="hover-overlay-column"
                                onMouseEnter={() => setHoveredColumn(colIndex)}
                                onMouseLeave={() => setHoveredColumn(null)}
                                onClick={() => handleColumnClick(colIndex)}
                            />
                        ))}
                </div>
                {/* Dropping piece animation */}
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
