import { Chess, type Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables (from white's perspective)
const PAWN_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
  20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10,
  0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];
const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
  0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20,
  20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20,
  -40, -50, -40, -30, -30, -30, -30, -40, -50,
];

function squareIndex(square: string, color: "w" | "b"): number {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  const idx = color === "w" ? (7 - rank) * 8 + file : rank * 8 + file;
  return idx;
}

function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -100000 : 100000;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const val = PIECE_VALUES[sq.type];
      const sign = sq.color === "w" ? 1 : -1;
      score += sign * val;
      const square = String.fromCharCode(97 + f) + (8 - r);
      const idx = squareIndex(square, sq.color);
      if (sq.type === "p") score += sign * PAWN_TABLE[idx];
      else if (sq.type === "n") score += sign * KNIGHT_TABLE[idx];
    }
  }
  return score;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
): number {
  if (depth === 0 || chess.isGameOver()) return evaluate(chess);

  const moves = chess.moves({ verbose: true }) as Move[];
  // Order: captures first
  moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

  if (maximizing) {
    let max = -Infinity;
    for (const m of moves) {
      chess.move(m);
      const score = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      if (score > max) max = score;
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return max;
  } else {
    let min = Infinity;
    for (const m of moves) {
      chess.move(m);
      const score = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      if (score < min) min = score;
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return min;
  }
}

export function findBestMove(fen: string, depth: number): Move | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true }) as Move[];
  if (moves.length === 0) return null;

  const maximizing = chess.turn() === "w";
  let bestMove: Move = moves[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  // Shuffle for variety at equal scores
  moves.sort(() => Math.random() - 0.5);

  for (const m of moves) {
    chess.move(m);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !maximizing);
    chess.undo();
    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }
  return bestMove;
}
