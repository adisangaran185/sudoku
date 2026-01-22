
import React, { useState } from 'react';
import { getGeminiHint } from '../services/geminiService';
import { SudokuBoard, HintResponse } from '../types';

interface CoachProps {
  board: SudokuBoard;
  onApplyHint: (hint: HintResponse) => void;
}

const Coach: React.FC<CoachProps> = ({ board, onApplyHint }) => {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<HintResponse | null>(null);

  const fetchHint = async () => {
    setLoading(true);
    setHint(null);
    const result = await getGeminiHint(board);
    setHint(result);
    setLoading(false);
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl shadow-xl border border-indigo-100 w-full max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl">
          ✨
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Gemini Coach</h3>
          <p className="text-sm text-gray-500">Need a little help with the next move?</p>
        </div>
      </div>

      {hint ? (
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 animate-fade-in">
          <p className="text-indigo-900 font-medium mb-2 italic">
            "Psst! Try putting a <span className="font-bold underline">{hint.value}</span> in row {hint.row + 1}, column {hint.col + 1}."
          </p>
          <p className="text-sm text-indigo-700 mb-4">{hint.reason}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => onApplyHint(hint)}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Apply Hint
            </button>
            <button 
              onClick={() => setHint(null)}
              className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={fetchHint}
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-indigo-300 transition-all shadow-md active:scale-95"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Consulting Gemini...
            </span>
          ) : 'Ask for a Hint'}
        </button>
      )}
    </div>
  );
};

export default Coach;
