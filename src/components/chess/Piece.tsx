const COLOR_HE: Record<string, string> = { w: "לבן", b: "שחור" };
const TYPE_HE: Record<string, string> = {
  p: "רגלי",
  n: "פרש",
  b: "רץ",
  r: "צריח",
  q: "מלכה",
  k: "מלך",
};

export function Piece({ color, type }: { color: "w" | "b"; type: string }) {
  const name = `${color}${type.toUpperCase()}`;
  const alt = `${COLOR_HE[color] ?? color} ${TYPE_HE[type.toLowerCase()] ?? type}`;
  return (
    <img
      src={`/pieces/${name}.svg`}
      alt={alt}
      draggable={false}
      className="pointer-events-none select-none"
      style={{
        width: "88%",
        height: "88%",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
      }}
    />
  );
}
