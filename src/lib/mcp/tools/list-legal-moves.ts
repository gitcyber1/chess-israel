import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { Chess } from "chess.js";

export default defineTool({
  name: "list_legal_moves",
  title: "List legal chess moves",
  description:
    "Given a chess position in FEN notation, return every legal move in SAN and UCI notation.",
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
    const moves = game.moves({ verbose: true }).map((m) => ({
      san: m.san,
      uci: `${m.from}${m.to}${m.promotion ?? ""}`,
      from: m.from,
      to: m.to,
      piece: m.piece,
      captured: m.captured ?? null,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(moves, null, 2) }],
      structuredContent: { moves, turn: game.turn() },
    };
  },
});
