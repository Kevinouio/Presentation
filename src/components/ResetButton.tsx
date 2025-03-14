import React from "react";
import "../styles/ResetButton.css";

interface ResetButtonProps {
    onReset: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onReset }) => {
    return (
        <button onClick={onReset} className="reset-button">
            Restart Game
        </button>
    );
};

export default ResetButton;
