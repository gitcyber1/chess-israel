export function Piece({ color, type }: { color: "w" | "b"; type: string }) {
  const name = `${color}${type.toUpperCase()}`;
  return (
    <img
      src={`/pieces/${name}.svg`}
      alt={name}
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
