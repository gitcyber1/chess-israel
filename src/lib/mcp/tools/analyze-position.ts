import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { Chess } from "chess.js";

export default defineTool({
  name: "analyze_position",
  title: "Analyze chess position",
  description:
    "Describe the state of a chess position: whose turn it is, check/checkmate/stalemate/draw status, material balance, and move count.",
  inputSchema: {
    fen: z.string().min(1).describe("Chess position in FEN."),
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
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let white = 0;
    let black = 0;
    for (const row of game.board()) {
      for (const sq of row) {
        if (!sq) continue;
        const v = values[sq.type] ?? 0;
        if (sq.color === "w") white += v;
        else black += v;
      }
    }
    const summary = {
      turn: game.turn() === "w" ? "white" : "black",
      inCheck: game.inCheck(),
      isCheckmate: game.isCheckmate(),
      isStalemate: game.isStalemate(),
      isDraw: game.isDraw(),
      isGameOver: game.isGameOver(),
      material: { white, black, diff: white - black },
      moveNumber: game.moveNumber(),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
