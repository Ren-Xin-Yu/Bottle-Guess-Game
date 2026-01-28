import { useState } from "react";
import "./index.css";

const COLORS = ["red", "blue", "green", "yellow"];

export default function App() {
  const [answer, setAnswer] = useState([]);
  const [guess, setGuess] = useState([null, null, null, null]);
  const [history, setHistory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragColor, setDragColor] = useState(null);

  const startGame = () => {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    setAnswer(shuffled);
    setGuess([null, null, null, null]);
    setHistory([]);
    setGameStarted(true);
    setGameWon(false);
  };

  const filledCount = guess.filter(c => c !== null).length;
  const isGuessFull = filledCount === 4;

  const submitGuess = () => {
    if (!isGuessFull) return;
    const correctCount = guess.filter((color, i) => color === answer[i]).length;
    setHistory(prev => [...prev, { guess: [...guess], correctCount }]);
    if (correctCount === 4) setGameWon(true);
    else setGuess([null, null, null, null]);
  };

  const handleDragStartPool = (color) => {
    setDragColor(color);
    setDragIndex(null);
  };
  const handleDragStartSlot = (index) => {
    setDragIndex(index);
    setDragColor(null);
  };
  const handleDropSlot = (index) => {
    setGuess(prev => {
      const newGuess = [...prev];
      if (dragIndex !== null) {
        const temp = newGuess[index];
        newGuess[index] = newGuess[dragIndex];
        newGuess[dragIndex] = temp;
      } else if (dragColor !== null) {
        newGuess[index] = dragColor;
      }
      return newGuess;
    });
    setDragIndex(null);
    setDragColor(null);
  };
  const removeFromSlot = (i) => setGuess(prev => {
    const newGuess = [...prev];
    newGuess[i] = null;
    return newGuess;
  });

  return (
    <div className="app">
      <h1>🎯 猜瓶子颜色游戏</h1>

      {!gameStarted ? (
        <div className="start-screen">
          <p>拖拽瓶子到槽位，猜出正确的颜色顺序！</p>
          <button className="start-btn" onClick={startGame}>开始游戏</button>
        </div>
      ) : (
        <>
          {gameWon && (
            <div className="win-message">
              🎉 恭喜你！用 {history.length} 次猜对了！
              <button className="restart-btn" onClick={startGame}>再玩一次</button>
            </div>
          )}

          {/* 瓶子池 */}
          <div className="bottle-pool">
            {COLORS.map(c => (
              <div
                key={c}
                className={`bottle ${c}`}
                draggable
                onDragStart={() => handleDragStartPool(c)}
              />
            ))}
          </div>

          {/* 当前猜测 */}
          <div className="guess-area">
            {guess.map((c, i) => (
              <div
                key={i}
                className="slot"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropSlot(i)}
              >
                {c && (
                  <div
                    key={`${c}-${i}`}
                    className={`bottle ${c}`}
                    draggable
                    onDragStart={() => handleDragStartSlot(i)}
                    onClick={() => removeFromSlot(i)}
                  />
                )}
              </div>
            ))}
          </div>

          <button className="submit-btn" onClick={submitGuess} disabled={!isGuessFull || gameWon}>
            {isGuessFull ? "确定" : `还需填入 ${4 - filledCount} 个瓶子`}
          </button>

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="history">
              <h3>历史记录</h3>
              {history.map((h, idx) => (
                <div key={idx} className="history-item">
                  <span className="round">第 {idx + 1} 次:</span>
                  <div className="history-bottles">
                    {h.guess.map((color, i) => (
                      <div key={i} className={`bottle small ${color}`} />
                    ))}
                  </div>
                  <span className="result">✓ {h.correctCount} 个正确</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
