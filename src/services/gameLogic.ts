import type { Board, Cell } from '../types';

/**
 * Create an empty board with all cells hidden
 */
export function createEmptyBoard(rows: number, cols: number): Board {
  const cells: Cell[][] = [];
  for (let row = 0; row < rows; row++) {
    cells[row] = [];
    for (let col = 0; col < cols; col++) {
      cells[row][col] = {
        state: 'hidden',
        value: null,
        isMine: false,
        adjacentMines: 0,
      };
    }
  }
  return { cells, rows, cols };
}

/**
 * Place mines randomly on the board, excluding the safe start cell and its neighbors
 */
export function placeMines(
  board: Board,
  mineCount: number,
  safeRow: number,
  safeCol: number
): Board {
  const newCells = board.cells.map((row) => row.map((cell) => ({ ...cell })));

  // Get all valid positions excluding safe start area (clicked cell + 8 neighbors)
  const safePositions = getAdjacentPositions(safeRow, safeCol, board.rows, board.cols);
  safePositions.add(`${safeRow},${safeCol}`);

  const validPositions: [number, number][] = [];
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      if (!safePositions.has(`${row},${col}`)) {
        validPositions.push([row, col]);
      }
    }
  }

  // Shuffle and pick mineCount positions
  shuffleArray(validPositions);
  const minePositions = validPositions.slice(0, Math.min(mineCount, validPositions.length));

  // Place mines
  for (const [row, col] of minePositions) {
    newCells[row][col].isMine = true;
  }

  // Calculate adjacent mines for all cells
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      if (!newCells[row][col].isMine) {
        newCells[row][col].adjacentMines = countAdjacentMines(newCells, row, col);
      }
    }
  }

  return { ...board, cells: newCells };
}

/**
 * Reveal a cell. If it's a mine, return lost game state.
 * If it has zero adjacent mines, recursively reveal neighbors.
 * Returns new board and whether the game is lost.
 */
export function revealCell(board: Board, row: number, col: number): {
  newBoard: Board;
  isMine: boolean;
} {
  const newCells = board.cells.map((r) => r.map((cell) => ({ ...cell })));
  const cell = newCells[row][col];

  // Already revealed or flagged
  if (cell.state === 'revealed' || cell.state === 'flagged') {
    return { newBoard: { ...board, cells: newCells }, isMine: false };
  }

  // Clicked on a mine
  if (cell.isMine) {
    newCells[row][col].state = 'revealed';
    newCells[row][col].value = 'mine';
    return { newBoard: { ...board, cells: newCells }, isMine: true };
  }

  // Reveal the cell
  newCells[row][col].state = 'revealed';
  newCells[row][col].value = cell.adjacentMines;

  // If zero adjacent mines, flood fill reveal neighbors
  if (cell.adjacentMines === 0) {
    const neighbors = getAdjacentPositions(row, col, board.rows, board.cols);
    for (const pos of neighbors) {
      const [nRow, nCol] = pos.split(',').map(Number);
      const neighborCell = newCells[nRow][nCol];
      if (neighborCell.state === 'hidden' && !neighborCell.isMine) {
        // Recursively reveal (using the new state)
        const result = revealCell({ ...board, cells: newCells }, nRow, nCol);
        // Merge the result back
        for (let r = 0; r < board.rows; r++) {
          for (let c = 0; c < board.cols; c++) {
            newCells[r][c] = result.newBoard.cells[r][c];
          }
        }
      }
    }
  }

  return { newBoard: { ...board, cells: newCells }, isMine: false };
}

/**
 * Toggle flag on a cell
 */
export function toggleFlag(board: Board, row: number, col: number): Board {
  const newCells = board.cells.map((r) => r.map((cell) => ({ ...cell })));
  const cell = newCells[row][col];

  if (cell.state === 'hidden') {
    cell.state = 'flagged';
  } else if (cell.state === 'flagged') {
    cell.state = 'hidden';
  }

  return { ...board, cells: newCells };
}

/**
 * Count the number of flags on the board
 */
export function countFlags(board: Board): number {
  let count = 0;
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      if (board.cells[row][col].state === 'flagged') {
        count++;
      }
    }
  }
  return count;
}

/**
 * Check if the game is won (all non-mine cells are revealed)
 */
export function checkWin(board: Board): boolean {
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      const cell = board.cells[row][col];
      // If there's a non-mine cell that's still hidden, game is not won
      if (!cell.isMine && cell.state !== 'revealed') {
        return false;
      }
    }
  }
  return true;
}

/**
 * Reveal all mines (used when game is lost)
 */
export function revealAllMines(board: Board): Board {
  const newCells = board.cells.map((r) => r.map((cell) => ({ ...cell })));

  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      if (newCells[row][col].isMine && newCells[row][col].state !== 'flagged') {
        newCells[row][col].state = 'revealed';
        newCells[row][col].value = 'mine';
      }
    }
  }

  return { ...board, cells: newCells };
}

// Helper: Get adjacent cell positions as a Set of "row,col" strings
function getAdjacentPositions(
  row: number,
  col: number,
  rows: number,
  cols: number
): Set<string> {
  const positions = new Set<string>();

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;

      const newRow = row + dr;
      const newCol = col + dc;

      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        positions.add(`${newRow},${newCol}`);
      }
    }
  }

  return positions;
}

// Helper: Count mines adjacent to a cell
function countAdjacentMines(cells: Cell[][], row: number, col: number): number {
  let count = 0;
  const rows = cells.length;
  const cols = cells[0].length;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;

      const newRow = row + dr;
      const newCol = col + dc;

      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        if (cells[newRow][newCol].isMine) {
          count++;
        }
      }
    }
  }

  return count;
}

// Helper: Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
