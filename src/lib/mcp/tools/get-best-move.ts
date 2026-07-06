import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { Chess } from "chess.js";

export default defineTool({
  name: "get_best_move",
  title: "Get best chess move",
  description:
    "Given a chess position in FEN notation, return the best legal move in UCI (e.g. e2e4). Uses a lightweight heuristic search over legal moves — no engine required.",
  inputSchema: {
    fen: z
      .string()
      .min(1)
      .describe("Chess position in Forsyth-Edwards Notation (FEN)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ fen }) => {
    let game: Chess;
    try {
      game = new Chess(fen);
    } catch (err) {
      return {
        content: [
          { type: "text", text: `Invalid FEN: ${(err as Error).message}` },
        ],
        isError: true,
      };
    }

    if (game.isGameOver()) {
      return {
        content: [{ type: "text", text: "Game is already over." }],
        structuredContent: { move: null, gameOver: true },
      };
    }

    const moves = game.moves({ verbose: true });
    // Simple heuristic: prefer checkmate > check > capture > any.
    const pieceValue: Record<string, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };
    let best = moves[0];
    let bestScore = -Infinity;
    for (const m of moves) {
      const probe = new Chess(fen);
      probe.move(m);
      let score = 0;
      if (probe.isCheckmate()) score += 1000;
      if (probe.inCheck()) score += 5;
      if (m.captured) score += 10 * (pieceValue[m.captured] ?? 0);
      score += Math.random() * 0.1;
      if (score > bestScore) {
        bestScore = score;
        best = m;
      }
    }
    const uci = `${best.from}${best.to}${best.promotion ?? ""}`;
    return {
      content: [{ type: "text", text: uci }],
      structuredContent: { move: uci, san: best.san },
    };
  },
});
