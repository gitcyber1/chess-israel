// Stockfish WASM engine wrapper. Loads the single-threaded lite build from
// /stockfish/ and communicates over the UCI protocol via a Web Worker.

let workerPromise: Promise<Worker> | null = null;

function createEngine(): Promise<Worker> {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker("/stockfish/stockfish-18-lite-single.js");
      let ready = false;
      const onMessage = (e: MessageEvent) => {
        const line = typeof e.data === "string" ? e.data : "";
        if (!ready && line === "uciok") {
          worker.postMessage("isready");
        } else if (!ready && line === "readyok") {
          ready = true;
          worker.removeEventListener("message", onMessage);
          resolve(worker);
        }
      };
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", (err) => reject(err));
      worker.postMessage("uci");
    } catch (err) {
      reject(err);
    }
  });
}

function getEngine(): Promise<Worker> {
  if (!workerPromise) workerPromise = createEngine();
  return workerPromise;
}

export interface EngineMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface EngineOptions {
  skill: number; // 0-20
  movetime: number; // ms
}

export async function getBestMove(
  fen: string,
  { skill, movetime }: EngineOptions,
): Promise<EngineMove | null> {
  const engine = await getEngine();

  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent) => {
      const line = typeof e.data === "string" ? e.data : "";
      if (line.startsWith("bestmove")) {
        engine.removeEventListener("message", onMessage);
        const parts = line.split(/\s+/);
        const mv = parts[1];
        if (!mv || mv === "(none)") {
          resolve(null);
          return;
        }
        resolve({
          from: mv.slice(0, 2),
          to: mv.slice(2, 4),
          promotion: mv.length > 4 ? mv.slice(4, 5) : undefined,
        });
      }
    };
    engine.addEventListener("message", onMessage);
    engine.postMessage(`setoption name Skill Level value ${skill}`);
    engine.postMessage("ucinewgame");
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go movetime ${movetime}`);
  });
}

// Pre-warm the engine on idle so the first move feels snappy.
export function warmupEngine() {
  void getEngine().catch(() => {
    workerPromise = null;
  });
}
