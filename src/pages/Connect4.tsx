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
    const [droppingPiece, setDroppingPiece] = useState<DroppingPieceInfo | null>(
        null
    );

    const handleColumnClick = (colIndex: number) => {
        if (winner || droppingPiece) return; // prevent new drop while animating
        const newBoard = board.map(row => [...row]);
        // Find the target row for this column
        let targetRow = -1;
        for (let row = 5; row >= 0; row--) {
            if (!newBoard[row][colIndex]) {
                targetRow = row;
                break;
            }
        }
        if (targetRow === -1) return; // column is full

        // Set the dropping piece info (animation will start)
        setDroppingPiece({ col: colIndex, targetRow, color: currentPlayer });
    };

    // Called when the dropping animation completes
    const onDropComplete = () => {
        if (droppingPiece) {
            const { col, targetRow, color } = droppingPiece;
            const newBoard = board.map(row => [...row]);
            newBoard[targetRow][col] = color;
            // Check for a win
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
                <Board board={board} onColumnClick={handleColumnClick} />
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
