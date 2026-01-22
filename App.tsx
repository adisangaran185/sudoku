
import React, { useState, useEffect } from 'react';
import { SudokuBoard, GameStatus, HintResponse } from './types';
import { generateGame, checkBoard } from './services/sudokuLogic';
import Cell from './components/Cell';
import Coach from './components/Coach';

const App: React.FC = () => {
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [message, setMessage] = useState<{ text: string, type: 'info' | 'error' | 'success' } | null>(null);

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
    if (message?.type === 'error') setMessage(null);
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
      setMessage({ text: "Brilliant! The puzzle is complete.", type: 'success' });
    } else {
      const newBoard = board.map((row, ri) => 
        row.map((cell, ci) => ({
          ...cell,
          isError: errorMap[ri][ci]
        }))
      );
      setBoard(newBoard);
      setMessage({ text: "Some placements need adjustment.", type: 'error' });
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
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'ArrowUp' && selectedCell.r > 0) setSelectedCell(p => ({ ...p!, r: p!.r - 1 }));
        if (e.key === 'ArrowDown' && selectedCell.r < 3) setSelectedCell(p => ({ ...p!, r: p!.r + 1 }));
        if (e.key === 'ArrowLeft' && selectedCell.c > 0) setSelectedCell(p => ({ ...p!, c: p!.c - 1 }));
        if (e.key === 'ArrowRight' && selectedCell.c < 3) setSelectedCell(p => ({ ...p!, c: p!.c + 1 }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, status, board]);

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:py-16">
      {/* Victory Overlay */}
      {status === GameStatus.WON && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/40 backdrop-blur-sm fade-in p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full glass-card border-none">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-indigo-900 mb-2">Zen Master!</h2>
            <p className="text-slate-600 mb-8">You solved the puzzle with focus and clarity.</p>
            <button
              onClick={startNewGame}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
            >
              New Journey
            </button>
          </div>
        </div>
      )}

      <header className="text-center mb-10 max-w-md w-full">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2 tracking-tight">ZenSudoku</h1>
        <div className="h-1 w-16 bg-indigo-400 mx-auto rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium">A mindful 4x4 challenge for beginners.</p>
      </header>

      <main className="w-full max-w-lg flex flex-col items-center gap-8">
        {/* Game Board Container */}
        <div className="relative p-1 bg-indigo-900/5 rounded-3xl border border-indigo-100 shadow-inner">
          <div className="bg-white p-2 rounded-2xl shadow-xl grid grid-cols-4 overflow-hidden border-4 border-indigo-900/80">
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

        {/* Dynamic Controls Area */}
        <div className="w-full max-w-xs space-y-6">
          {message && (
            <div className={`text-center py-2 px-4 rounded-full text-sm font-bold ${
              message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
            }`}>
              {message.text}
            </div>
          )}

          {/* Number Selection Grid */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => updateCellValue(num)}
                className="aspect-square flex items-center justify-center bg-white border-2 border-slate-100 text-indigo-600 rounded-2xl font-bold text-2xl hover:border-indigo-400 hover:text-indigo-700 shadow-sm active:scale-90 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => updateCellValue(null)}
              className="aspect-square flex items-center justify-center bg-slate-50 border-2 border-slate-100 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 shadow-sm"
            >
              DEL
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={validate}
              className="flex-1 py-4 bg-indigo-900 text-white rounded-2xl font-bold hover:bg-indigo-800 transition-all shadow-lg active:scale-95"
            >
              Verify
            </button>
            <button
              onClick={startNewGame}
              className="px-6 py-4 bg-white border-2 border-indigo-900 text-indigo-900 rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95"
            >
              ↻
            </button>
          </div>
        </div>

        {/* AI Coach Integration */}
        <div className="w-full">
          <Coach board={board} onApplyHint={handleApplyHint} />
        </div>
      </main>

      <footer className="mt-16 text-slate-400 text-xs tracking-widest uppercase">
        Logic Powered by Gemini AI
      </footer>
    </div>
  );
};

export default App;
