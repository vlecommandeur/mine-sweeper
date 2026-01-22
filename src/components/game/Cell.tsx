import { useDispatch } from "react-redux";
import type { Cell as CellType, Board } from "../../types";
import {
  placeMines,
  revealCell as revealCellLogic,
  checkWin,
  revealAllMines,
} from "../../services/gameLogic";
import { setBoard, setStatus, setIsFirstClick } from "../../store/gameSlice";

interface CellProps {
  cell: CellType;
  board: Board;
  minesRemaining: number;
  isFirstClick: boolean;
  currentStatus: string;
  row: number;
  col: number;
}

export const Cell = ({
  cell,
  board,
  minesRemaining,
  isFirstClick,
  currentStatus,
  row,
  col,
}: CellProps) => {
  const dispatch = useDispatch();

  const { state, value } = cell;

  const handleCellClick = () => {
    let newBoard = board;

    if (isFirstClick) {
      newBoard = placeMines(board, minesRemaining, row, col);
      dispatch(setIsFirstClick(false));
    }

    const { newBoard: revealedBoard, isMine } = revealCellLogic(
      newBoard,
      row,
      col,
    );
    dispatch(setBoard(revealedBoard));

    if (isMine) {
      dispatch(setStatus("lost"));
      dispatch(setBoard(revealAllMines(revealedBoard)));
    } else if (checkWin(revealedBoard)) {
      dispatch(setStatus("won"));
    } else if (currentStatus === "idle") {
      dispatch(setStatus("playing"));
    }
  };

  const getCellDisplay = () => {
    if (state === "revealed") return value === "mine" ? "💣" : value;
    if (state === "flagged") return "⛳️";
    return "🟫";
  };

  return (
    <button
      className="w-8 h-8 cursor-pointer border border-gray-400 flex items-center justify-center text-sm font-bold"
      onClick={handleCellClick}
      disabled={state === "revealed" || currentStatus === "lost"}
    >
      {getCellDisplay()}
    </button>
  );
};
