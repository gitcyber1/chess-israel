import { useEffect, useMemo, useState, useCallback } from "react";
import { Chess, type Square as ChessSquare, type Move } from "chess.js";
import { Piece } from "./Piece";
import { VictoryOverlay } from "./VictoryOverlay";
import { getBestMove, warmupEngine } from "@/lib/stockfish-engine";

type Difficulty = "easy" | "medium" | "hard";

const ENGINE_SETTINGS: Record<Difficulty, { skill: number; movetime: number; randomness?: number }> = {
  easy: { skill: 0, movetime: 50, randomness: 0.95 },
  medium: { skill: 8, movetime: 500 },
  hard: { skill: 20, movetime: 1500 },
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function Board() {
  const [game, setGame] = useState(() => new Chess());
  const [, setTick] = useState(0);
  const [selected, setSelected] = useState<ChessSquare | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  );

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const board = game.board();
  const turn = game.turn();
  const isPlayerTurn = turn === "w" && !game.isGameOver();

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    const moves = game.moves({ square: selected, verbose: true }) as Move[];
    return new Set(moves.map((m) => m.to));
  }, [selected, game]);

  // Pre-warm the engine once on mount
  useEffect(() => {
    warmupEngine();
  }, []);

  // Computer move
  useEffect(() => {
    if (game.isGameOver() || turn !== "b") return;
    let cancelled = false;
    setThinking(true);
    (async () => {
      try {
        const fen = game.fen();
        const settings = ENGINE_SETTINGS[difficulty];
        let move: { from: string; to: string; promotion?: string } | null = null;
        if (settings.randomness && Math.random() < settings.randomness) {
          const legal = game.moves({ verbose: true }) as Move[];
          if (legal.length) {
            const pick = legal[Math.floor(Math.random() * legal.length)];
            move = { from: pick.from, to: pick.to, promotion: pick.promotion };
          }
        } else {
          move = await getBestMove(fen, settings);
        }
        if (cancelled) return;
        if (move) {
          const result = game.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion ?? "q",
          });
          if (result) {
            setLastMove({ from: result.from, to: result.to });
            refresh();
          }
        }
      } finally {
        if (!cancelled) setThinking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [turn, game, difficulty, refresh]);

  const handleSquareClick = (square: ChessSquare) => {
    if (!isPlayerTurn) return;
    const piece = game.get(square);

    if (selected) {
      if (selected === square) {
        setSelected(null);
        return;
      }
      // Try move
      try {
        const moveOpts: { from: string; to: string; promotion?: string } = {
          from: selected,
          to: square,
        };
        // Auto-promote to queen
        const pieceAtSelected = game.get(selected);
        if (
          pieceAtSelected?.type === "p" &&
          (square[1] === "8" || square[1] === "1")
        ) {
          moveOpts.promotion = "q";
        }
        const result = game.move(moveOpts);
        if (result) {
          setLastMove({ from: result.from, to: result.to });
          setSelected(null);
          refresh();
          return;
        }
      } catch {
        // invalid move
      }
      // If clicked own piece, switch selection
      if (piece && piece.color === "w") {
        setSelected(square);
      } else {
        setSelected(null);
      }
    } else if (piece && piece.color === "w") {
      setSelected(square);
    }
  };

  const newGame = () => {
    const fresh = new Chess();
    setGame(fresh);
    setSelected(null);
    setLastMove(null);
    refresh();
  };

  const undo = () => {
    // Undo computer + player
    game.undo();
    game.undo();
    setSelected(null);
    setLastMove(null);
    refresh();
  };

  const status = (() => {
    if (game.isCheckmate())
      return turn === "w" ? "מט! המחשב ניצח 😔" : "מט! ניצחת 🎉";
    if (game.isStalemate()) return "פט — תיקו";
    if (game.isDraw()) return "תיקו";
    if (game.inCheck()) return turn === "w" ? "שח! תורך" : "שח!";
    if (thinking) return "המחשב חושב...";
    return turn === "w" ? "תורך (לבן)" : "תור המחשב (שחור)";
  })();

  const history = game.history();

  const gameOver = game.isGameOver();
  const winner: "player" | "computer" | "draw" | null = gameOver
    ? game.isCheckmate()
      ? turn === "w"
        ? "computer"
        : "player"
      : "draw"
    : null;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      {/* Status bar */}
      <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--board-border)] bg-[var(--panel)] px-4 py-3 shadow-sm">
        <span className="font-serif text-lg font-medium text-[var(--ink)]">
          {status}
        </span>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--ink-muted)]">קושי:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="rounded border border-[var(--board-border)] bg-[var(--panel)] px-2 py-1 text-sm text-[var(--ink)]"
          >
            <option value="easy">קל</option>
            <option value="medium">בינוני</option>
            <option value="hard">קשה</option>
          </select>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative rounded-md p-2 shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, #4a6b35 0%, #5d8043 50%, #4a6b35 100%)",
        }}
        dir="ltr"
      >
        {winner && (
          <VictoryOverlay
            key={game.fen()}
            winner={winner}
            onNewGame={newGame}
          />
        )}
        <div className="grid grid-cols-8 overflow-hidden rounded-sm">
          {board.map((row, r) =>
            row.map((piece, f) => {
              const square = (FILES[f] + (8 - r)) as ChessSquare;
              const isLight = (r + f) % 2 === 0;
              const isSelected = selected === square;
              const isTarget = legalTargets.has(square);
              const isLast =
                lastMove && (lastMove.from === square || lastMove.to === square);
              const inCheck =
                piece?.type === "k" &&
                piece.color === turn &&
                game.inCheck();

              return (
                <button
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  aria-label={piece ? `משבצת ${square}` : `משבצת ריקה ${square}`}
                  className="relative flex aspect-square items-center justify-center transition-colors"
                  style={{
                    width: "min(11vw, 4rem)",
                    backgroundColor:
                      isSelected || isLast
                        ? isLight
                          ? "#f6f669"
                          : "#baca44"
                        : isLight
                          ? "#ebecd0"
                          : "#779556",
                    boxShadow: inCheck
                      ? "inset 0 0 0 3px #c0392b"
                      : undefined,
                  }}
                >

                  {piece && <Piece color={piece.color} type={piece.type} />}
                  {isTarget && !piece && (
                    <span className="absolute h-3 w-3 rounded-full bg-black/30" />
                  )}
                  {isTarget && piece && (
                    <span className="absolute inset-1 rounded-full ring-4 ring-black/30" />
                  )}
                  {f === 0 && (
                    <span className="absolute top-0.5 left-1 text-[10px] font-bold opacity-60">
                      {8 - r}
                    </span>
                  )}
                  {r === 7 && (
                    <span className="absolute bottom-0.5 right-1 text-[10px] font-bold opacity-60">
                      {FILES[f]}
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={newGame}
          className="rounded-md bg-[var(--ink)] px-5 py-2 font-medium text-[var(--panel)] shadow transition-transform hover:scale-105 active:scale-95"
        >
          משחק חדש
        </button>
        <button
          onClick={undo}
          disabled={history.length < 2 || thinking}
          className="rounded-md border border-[var(--board-border)] bg-[var(--panel)] px-5 py-2 font-medium text-[var(--ink)] shadow transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          בטל מהלך
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="w-full rounded-lg border border-[var(--board-border)] bg-[var(--panel)] p-4 shadow-sm">
          <h2 className="mb-2 font-serif text-sm font-semibold text-[var(--ink-muted)]">
            היסטוריית מהלכים
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-[var(--ink)]" dir="ltr">
            {history.map((m, i) => (
              <span key={i}>
                {i % 2 === 0 && (
                  <span className="text-[var(--ink-muted)]">
                    {Math.floor(i / 2) + 1}.
                  </span>
                )}{" "}
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
