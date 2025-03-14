import React from "react";
import Cell from "./Cell";
import "../styles/Board.css";

interface BoardProps {
    board: (string | null)[][];
    onColumnClick: (colIndex: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onColumnClick }) => {
    return (
        <div className="board">
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <Cell
                        key={`${rowIndex}-${colIndex}`}
                        value={cell}
                        onClick={() => onColumnClick(colIndex)}
                    />
                ))
            )}
        </div>
    );
};

export default Board;
