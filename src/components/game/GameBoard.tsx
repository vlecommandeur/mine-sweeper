import { useDispatch, useSelector } from "react-redux";
import { Cell } from "./Cell";
import type { RootState } from "../../store";
import { useEffect } from "react";
import { setBoard, setDifficulty, setMinesRemaining } from "../../store/gameSlice";
import { createEmptyBoard } from "../../services/gameLogic";

export const GameBoard = () => {
  const dispatch = useDispatch();
  const { board, status, difficulty, minesRemaining, isFirstClick } = useSelector(
    (state: RootState) => state.game
  );

  useEffect(() => {
    if (status === "idle" && !board) {
      dispatch(setBoard(createEmptyBoard(9, 9)));
      dispatch(setDifficulty(difficulty));
      dispatch(setMinesRemaining(10));
    }
  }, [difficulty, dispatch, status, board]);

  if (!board) return null;

  return (
    <div className="flex flex-col gap-1">
      {board.cells.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              board={board}
              minesRemaining={minesRemaining}
              isFirstClick={isFirstClick}
              currentStatus={status}
              row={rowIndex}
              col={colIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
