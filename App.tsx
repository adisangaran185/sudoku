
import React, { useState, useEffect, useCallback } from 'react';
import { SudokuBoard, GameStatus, HintResponse } from './types';
import { generateGame, checkBoard } from './services/sudokuLogic';
import Cell from './components/Cell';
import Coach from './components/Coach';

const App: React.FC = () => {
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setBoard(generateGame());
    setSelectedCell(null);
    setStatus(GameStatus.PLAYING);
    setMessage(null);
  };

  const handleCellSelect = (r: number, c: number) => {
    if (status === GameStatus.WON) return;
    setSelectedCell({ r, c });
    setMessage(null);
  };

  const updateCellValue = (val: number | null) => {
    if (!selectedCell || status === GameStatus.WON) return;
    const { r, c } = selectedCell;
    if (board[r][c].isFixed) return;

    const newBoard = board.map((row, ri) => 
      row.map((cell, ci) => {
        if (ri === r && ci === c) {
          return { ...cell, value: val, isError: false };
        }
        return cell;
      })
    );
    setBoard(newBoard);
  };

  const validate = () => {
    const { isValid, errorMap } = checkBoard(board);
    
    if (isValid) {
      setStatus(GameStatus.WON);
      setMessage("Perfect! You've solved the puzzle! 🎉");
    } else {
      const newBoard = board.map((row, ri) => 
        row.map((cell, ci) => ({
          ...cell,
          isError: errorMap[ri][ci]
        }))
      );
      setBoard(newBoard);
      setMessage("Oops! Some numbers are misplaced. Look for red cells.");
    }
  };

  const handleApplyHint = (hint: HintResponse) => {
    const newBoard = board.map((row, ri) => 
      row.map((cell, ci) => {
        if (ri === hint.row && ci === hint.col) {
          return { ...cell, value: hint.value, isError: false };
        }
        return cell;
      })
    );
    setBoard(newBoard);
    setSelectedCell({ r: hint.row, c: hint.col });
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || status === GameStatus.WON) return;
      if (e.key >= '1' && e.key <= '4') {
        updateCellValue(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        updateCellValue(null);
      } else if (e.key === 'ArrowUp' && selectedCell.r > 0) {
        setSelectedCell(prev => ({ ...prev!, r: prev!.r - 1 }));
      } else if (e.key === 'ArrowDown' && selectedCell.r < 3) {
        setSelectedCell(prev => ({ ...prev!, r: prev!.r + 1 }));
      } else if (e.key === 'ArrowLeft' && selectedCell.c > 0) {
        setSelectedCell(prev => ({ ...prev!, c: prev!.c - 1 }));
      } else if (e.key === 'ArrowRight' && selectedCell.c < 3) {
        setSelectedCell(prev => ({ ...prev!, c: prev!.c + 1 }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, status, board]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 select-none">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight mb-2">ZenSudoku 4x4</h1>
        <p className="text-slate-600 font-medium">Simple. Elegant. Mindful.</p>
      </header>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white p-2 rounded-xl shadow-2xl border-4 border-indigo-900 grid grid-cols-4 overflow-hidden">
          {board.map((row, rIdx) => 
            row.map((cell, cIdx) => (
              <Cell 
                key={`${rIdx}-${cIdx}`}
                data={cell}
                row={rIdx}
                col={cIdx}
                isSelected={selectedCell?.r === rIdx && selectedCell?.c === cIdx}
                onSelect={handleCellSelect}
                isWinning={status === GameStatus.WON}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md">
        {/* Interaction Info */}
        <div className="text-center">
          {message ? (
            <p className={`text-lg font-bold animate-bounce ${status === GameStatus.WON ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          ) : (
            <p className="text-slate-500 text-sm italic">
              Use your keyboard (1-4) or tap a cell to enter a value.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <button
            onClick={validate}
            className="flex-1 py-4 bg-indigo-900 text-white rounded-xl font-bold text-lg hover:bg-indigo-800 transition-all shadow-lg active:scale-95"
          >
            Check Solution
          </button>
          <button
            onClick={startNewGame}
            className="px-6 py-4 bg-white border-2 border-indigo-900 text-indigo-900 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-md active:scale-95"
          >
            Reset
          </button>
        </div>

        {/* Input Palette for Mobile */}
        <div className="grid grid-cols-5 gap-2 w-full mt-2">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => updateCellValue(num)}
              className="py-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg font-bold text-xl hover:bg-indigo-50 shadow-sm active:bg-indigo-100 transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => updateCellValue(null)}
            className="py-3 bg-slate-100 text-slate-500 rounded-lg font-bold text-sm hover:bg-slate-200 shadow-sm"
          >
            Clear
          </button>
        </div>

        {/* AI Coach */}
        <Coach board={board} onApplyHint={handleApplyHint} />
      </div>

      <footer className="mt-auto pt-12 text-slate-400 text-sm">
        Crafted with React & Gemini AI
      </footer>
    </div>
  );
};

export default App;
