
import { GoogleGenAI, Type } from "@google/genai";
import { SudokuBoard, HintResponse } from "../types";

export const getGeminiHint = async (board: SudokuBoard): Promise<HintResponse | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Serialize board for the prompt
  const boardSnapshot = board.map(row => 
    row.map(cell => cell.value === null ? 0 : cell.value)
  );

  const prompt = `
    You are a friendly Sudoku Coach. I am playing a 4x4 Sudoku.
    The current board state is: ${JSON.stringify(boardSnapshot)}
    (0 represents an empty cell).
    
    Instructions:
    1. Identify one empty cell (0) that can be logically filled.
    2. Provide the row index (0-3), column index (0-3), and the correct value (1-4).
    3. Briefly explain the logic (e.g., "In row 1, 3 is the only number missing").
    
    Rules for 4x4 Sudoku:
    - Each row contains 1-4.
    - Each column contains 1-4.
    - Each 2x2 subgrid contains 1-4.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            row: { type: Type.INTEGER },
            col: { type: Type.INTEGER },
            value: { type: Type.INTEGER },
            reason: { type: Type.STRING },
          },
          required: ["row", "col", "value", "reason"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error) {
    console.error("Gemini Hint Error:", error);
  }
  return null;
};
