// Grid generation logic for Word Search Game

export const GRID_SIZE = 10;

export const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#F1948A'
];

export const generateGrid = (wordList, size = GRID_SIZE) => {
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(''));

    // Place words
    wordList.forEach(item => {
        placeWord(newGrid, item.word, size);
    });

    // Fill empty spaces
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!newGrid[i][j]) {
                newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }

    return newGrid;
};

const placeWord = (grid, word, size) => {
    // Simple placement logic (horizontal, vertical, diagonal)
    const directions = [
        [0, 1], [1, 0], [1, 1], [-1, 1]
    ];

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (canPlace(grid, word, row, col, dir, size)) {
            for (let i = 0; i < word.length; i++) {
                grid[row + i * dir[0]][col + i * dir[1]] = word[i];
            }
            placed = true;
        }
        attempts++;
    }
};

const canPlace = (grid, word, row, col, dir, size) => {
    for (let i = 0; i < word.length; i++) {
        const r = row + i * dir[0];
        const c = col + i * dir[1];

        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    }
    return true;
};
