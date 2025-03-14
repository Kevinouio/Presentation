import React from "react";
import "../styles/Cell.css";

interface CellProps {
    value: string | null;
    onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ value, onClick }) => {
    let cellClass = "cell";
    if (value === "red") {
        cellClass += " red";
    } else if (value === "yellow") {
        cellClass += " yellow";
    }
    return <div className={cellClass} onClick={onClick}></div>;
};

export default Cell;
