import { defineMcp } from "@lovable.dev/mcp-js";
import getBestMoveTool from "./tools/get-best-move";
import listLegalMovesTool from "./tools/list-legal-moves";
import analyzePositionTool from "./tools/analyze-position";

export default defineMcp({
  name: "chess-israel-mcp",
  title: "שח-מט ישראל MCP",
  version: "0.1.0",
  instructions:
    "Chess helper tools for the שח-מט ישראל app. Use `list_legal_moves` to enumerate moves, `analyze_position` to inspect a FEN, and `get_best_move` to suggest a move.",
  tools: [getBestMoveTool, listLegalMovesTool, analyzePositionTool],
});
