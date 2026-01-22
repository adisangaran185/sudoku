
import { SudokuBoard, CellData } from '../types';

/**
 * Validates if placing a value at (row, col) is legal in a 4x4 grid.
 */
export const isValidMove = (board: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 4; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 4; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 2x2 box
  const startRow = row - (row % 2);
  const startCol = col - (col % 2);
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

/**
 * Solves a 4x4 puzzle using backtracking.
 */
const solve = (board: number[][]): boolean => {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 4; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

/**
 * Generates a new 4x4 Sudoku board with some cells hidden.
 */
export const generateGame = (difficulty: 'easy' | 'medium' = 'easy'): SudokuBoard => {
  const baseBoard: number[][] = Array(4).fill(0).map(() => Array(4).fill(0));
  
  // Fill first row randomly to seed solver
  const nums = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
  for(let i=0; i<4; i++) baseBoard[0][i] = nums[i];
  
  solve(baseBoard);

  const cellsToKeep = difficulty === 'easy' ? 8 : 6;
  const board: SudokuBoard = baseBoard.map((row, rIdx) => 
    row.map((val, cIdx) => ({
      value: val,
      isFixed: true,
      isError: false
    }))
  );

  // Hide cells
  let hidden = 0;
  const totalCells = 16;
  const targetHidden = totalCells - cellsToKeep;
  
  while (hidden < targetHidden) {
    const r = Math.floor(Math.random() * 4);
    const c = Math.floor(Math.random() * 4);
    if (board[r][c].isFixed) {
      board[r][c].value = null;
      board[r][c].isFixed = false;
      hidden++;
    }
  }

  return board;
};

/**
 * Validates the current board state and returns indices of errors.
 */
export const checkBoard = (board: SudokuBoard): { isValid: boolean, errorMap: boolean[][] } => {
  const errorMap = Array(4).fill(false).map(() => Array(4).fill(false));
  let isValid = true;

  const currentValues = board.map(row => row.map(cell => cell.value || 0));

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = currentValues[r][c];
      if (val === 0) {
        isValid = false;
        continue;
      }

      // Temporarily remove to check if valid placement
      currentValues[r][c] = 0;
      if (!isValidMove(currentValues, r, c, val)) {
        errorMap[r][c] = true;
        isValid = false;
      }
      currentValues[r][c] = val;
    }
  }

  return { isValid, errorMap };
};
