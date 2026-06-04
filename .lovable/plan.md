
## המטרה
הרמה הקשה משחקת חלש כי המנוע הנוכחי הוא Minimax בעומק 3 עם הערכה בסיסית. נחליף את ה-AI ברמה הקשה למנוע **Stockfish** — מנוע השח החזק בעולם, חינמי וקוד פתוח, שרץ ישירות בדפדפן דרך WebAssembly. אין צורך בשירות חיצוני או מפתח API.

## הגישה
- שימוש בחבילה `stockfish` מ-npm (build של WASM שרץ ב-Web Worker בדפדפן).
- ה-Worker מתקשר דרך פרוטוקול UCI (`position fen ...`, `go movetime ...`).
- שלוש הרמות יתאימו לעוצמת המנוע:
  - **קל**: Stockfish עם `Skill Level = 1` ו-`movetime ≈ 200ms` (משחק חלש בכוונה, מתאים למתחילים).
  - **בינוני**: `Skill Level = 8` ו-`movetime ≈ 500ms`.
  - **קשה**: `Skill Level = 20` (מקסימום) ו-`movetime ≈ 1500ms` — רמה ברמת רב-אמן.
- ה-Minimax המקומי (`src/lib/chess-ai.ts`) יוסר; כולם משתמשים ב-Stockfish.

## שינויים בקבצים

**חדש — `src/lib/stockfish-engine.ts`**  
מודול שיוצר Web Worker עם Stockfish, חושף `getBestMove(fen, { skill, movetime })` שמחזיר Promise עם מהלך בפורמט `{ from, to, promotion? }`. אתחול עצלן (singleton) כדי לא לטעון WASM יותר מפעם אחת.

**עריכה — `src/components/chess/Board.tsx`**  
- החלפת הקריאה ל-`findBestMove` בקריאה אסינכרונית ל-`getBestMove` מ-Stockfish.
- מיפוי דרגות קושי לפרמטרים (skill + movetime) במקום עומק.
- הסרת ייבוא של `chess-ai.ts`.

**מחיקה — `src/lib/chess-ai.ts`**  
לא בשימוש יותר.

**חבילה חדשה** — `bun add stockfish`.

## פרטים טכניים
- חבילת `stockfish` ב-npm כוללת קובץ `stockfish.js` שמופעל כ-Web Worker: `new Worker(new URL('stockfish/src/stockfish.js', import.meta.url))`. Vite יודע לקבץ זאת.
- פרוטוקול UCI: שולחים `uci`, `isready`, `position fen <FEN>`, `go movetime <ms>`. המנוע משיב `bestmove e2e4` ואז מפענחים את ה-from/to/promotion.
- בשל גודל ה-WASM (~1MB), המנוע נטען רק כשמתחיל תור המחשב הראשון. במהלך טעינה ראשונית תוצג "המחשב חושב..." כרגיל.
- אם הדפדפן לא תומך ב-WebAssembly (נדיר מאוד), נחזור ל-Minimax כ-fallback (אופציונלי, ניתן לוותר).

## למה לא API חיצוני?
שירותי API חינמיים (כמו Lichess Cloud Eval) מוגבלים בקצב ודורשים חיבור רשת בכל מהלך. Stockfish ב-WASM רץ מקומית, מיידי, ללא הגבלות וללא צורך במפתחות.
