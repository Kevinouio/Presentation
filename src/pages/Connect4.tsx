import React, { useState } from "react";
import Board from "../components/Board";
import ResetButton from "../components/ResetButton";
import checkWinner from "../utils/checkWinner";
import "../styles/Connect4.css";

const Connect4: React.FC = () => {
    const [board, setBoard] = useState(
        Array(6).fill(null).map(() => Array(7).fill(null))
    );
    const [currentPlayer, setCurrentPlayer] = useState("red");
    const [winner, setWinner] = useState<string | null>(null);

    const handleColumnClick = (colIndex: number) => {
        if (winner) return;
        const newBoard = board.map(row => [...row]); // Copy board
        for (let row = 5; row >= 0; row--) {
            if (!newBoard[row][colIndex]) {
                newBoard[row][colIndex] = currentPlayer;
                if (checkWinner(newBoard, row, colIndex, currentPlayer)) {
                    setWinner(currentPlayer);
                } else {
                    setCurrentPlayer(currentPlayer === "red" ? "yellow" : "red");
                }
                setBoard(newBoard);
                break;
            }
        }
    };

    const resetGame = () => {
        setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
        setCurrentPlayer("red");
        setWinner(null);
    };

    return (
        <div className="connect4-page">
            <h2 className="status">
                {winner ? `${winner} wins!` : `Turn: ${currentPlayer}`}
            </h2>
            <div>
                <Board board={board} onColumnClick={handleColumnClick} />

            </div>
            <ResetButton onReset={resetGame} />
        </div>
    );
};

export default Connect4;
