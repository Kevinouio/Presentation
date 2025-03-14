const checkWinner = (
    board: (string | null)[][],
    row: number,
    col: number,
    player: string
) => {
    const directions = [
        { r: 0, c: 1 }, // Horizontal
        { r: 1, c: 0 }, // Vertical
        { r: 1, c: 1 }, // Diagonal down-right
        { r: 1, c: -1 } // Diagonal down-left
    ];

    for (const { r, c } of directions) {
        let count = 1;
        // Check one direction
        for (let i = 1; i < 4; i++) {
            const newRow = row + i * r;
            const newCol = col + i * c;
            if (
                newRow < 0 ||
                newRow >= board.length ||
                newCol < 0 ||
                newCol >= board[0].length ||
                board[newRow][newCol] !== player
            )
                break;
            count++;
        }
        // Check the opposite direction
        for (let i = 1; i < 4; i++) {
            const newRow = row - i * r;
            const newCol = col - i * c;
            if (
                newRow < 0 ||
                newRow >= board.length ||
                newCol < 0 ||
                newCol >= board[0].length ||
                board[newRow][newCol] !== player
            )
                break;
            count++;
        }
        if (count >= 4) return true;
    }
    return false;
};

export default checkWinner;
