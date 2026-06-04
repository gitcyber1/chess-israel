import { useEffect, useState } from "react";

interface VictoryOverlayProps {
  winner: "player" | "computer" | "draw";
  onNewGame: () => void;
}

function Confetti() {
  const colors = ["#f6d365", "#fda085", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 2 + Math.random() * 3;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 4 + Math.random() * 8;
        return (
          <div
            key={i}
            className="absolute top-0 rounded-full"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
              animation: `confetti-fall ${duration}s ${delay}s linear forwards`,
              opacity: 0,
            }}
          />
        );
      })}
    </div>
  );
}

export function VictoryOverlay({ winner, onNewGame }: VictoryOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const isPlayerWin = winner === "player";
  const isDraw = winner === "draw";

  const title = isPlayerWin ? "ניצחת!" : isDraw ? "תיקו!" : "המחשב ניצח";
  const subtitle = isPlayerWin
    ? "כל הכבוד, מט על המלך!"
    : isDraw
      ? "אין מנצח הפעם"
      : "אולי בפעם הבאה...";

  const accentColor = isPlayerWin ? "#d4af37" : isDraw ? "#8899aa" : "#c0392b";
  const glowColor = isPlayerWin
    ? "rgba(212,175,55,0.35)"
    : isDraw
      ? "rgba(136,153,170,0.3)"
      : "rgba(192,57,43,0.3)";

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-700 ${
        visible ? "opacity-100 backdrop-blur-sm" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(20,15,10,0.55)" }}
    >
      {isPlayerWin && <Confetti />}

      <div
        className={`relative mx-4 flex flex-col items-center rounded-2xl border-2 p-8 text-center shadow-2xl transition-all duration-700 sm:p-12 ${
          visible ? "scale-100" : "scale-50"
        }`}
        style={{
          background: `linear-gradient(145deg, var(--panel) 0%, ${glowColor} 100%)`,
          borderColor: accentColor,
          boxShadow: `0 0 60px ${glowColor}, 0 20px 60px rgba(0,0,0,0.4)`,
          maxWidth: "380px",
        }}
      >
        {/* Crown / Icon */}
        <div
          aria-hidden="true"
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${isPlayerWin ? "#f0d78c" : isDraw ? "#aabbcc" : "#e74c3c"})`,
            boxShadow: `0 0 30px ${glowColor}`,
          }}
        >
          {isPlayerWin ? "👑" : isDraw ? "⚖️" : "🤖"}
        </div>

        <h2
          className="font-serif text-4xl font-bold sm:text-5xl"
          style={{
            color: accentColor,
            textShadow: `0 0 30px ${glowColor}`,
          }}
        >
          {title}
        </h2>

        <p className="mt-3 text-lg text-[var(--ink-muted)]" dir="rtl">{subtitle}</p>

        <button
          onClick={onNewGame}
          className="mt-8 rounded-xl px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${isPlayerWin ? "#b8941f" : isDraw ? "#667788" : "#a93226"})`,
            boxShadow: `0 8px 25px ${glowColor}`,
          }}
        >
          משחק חדש
        </button>
      </div>
    </div>
  );
}
