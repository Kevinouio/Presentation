import React, { useEffect, useState } from "react";
import "../styles/DroppingPiece.css";

interface DroppingPieceProps {
    colIndex: number;
    targetRow: number;
    color: string;
    onDropComplete: () => void;
}

const cellSize = 100; // 100px cell + 5px gap

const DroppingPiece: React.FC<DroppingPieceProps> = ({
                                                         colIndex,
                                                         targetRow,
                                                         color,
                                                         onDropComplete,
                                                     }) => {
    const [top, setTop] = useState(-cellSize);

    useEffect(() => {
        const timer = setTimeout(() => {
            setTop(targetRow * cellSize);
        }, 50);
        return () => clearTimeout(timer);
    }, [targetRow]);

    return (
        <div
            className={`dropping-piece ${color}`}
            style={{
                left: `${(colIndex * (cellSize + 5)) + 10}px`,
                top: `${top + 120}px`,
                transition: "top 0.5s ease-out",
            }}
            onTransitionEnd={onDropComplete}
        />
    );
};

export default DroppingPiece;
