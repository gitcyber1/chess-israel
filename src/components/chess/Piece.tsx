const PIECE_SYMBOLS: Record<string, string> = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
};

export function Piece({ color, type }: { color: "w" | "b"; type: string }) {
  const symbol = PIECE_SYMBOLS[`${color}${type}`];
  return (
    <span
      className="select-none leading-none drop-shadow-md"
      style={{
        fontSize: "min(8vw, 2.75rem)",
        color: color === "w" ? "#f8f4e9" : "#1a1410",
        textShadow:
          color === "w"
            ? "0 1px 2px rgba(0,0,0,0.6)"
            : "0 1px 1px rgba(255,255,255,0.15)",
      }}
    >
      {symbol}
    </span>
  );
}
