import { useState } from "react";
import "./index.css";

const BASE_COLORS = ["red", "blue", "green", "yellow"];
const EXTRA_COLORS = ["purple", "orange", "pink", "cyan"];

export default function App() {
  const [colors, setColors] = useState([...BASE_COLORS]);
  const [numSlots, setNumSlots] = useState(4); // 初始槽位数量

  const [answer, setAnswer] = useState([]);
  const [guess, setGuess] = useState(Array(numSlots).fill(null));
  const [history, setHistory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);
  const [dragColor, setDragColor] = useState(null);

  const [showHistory, setShowHistory] = useState(true);

  const startGame = () => {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    setAnswer(shuffled.slice(0, numSlots));
    setGuess(Array(numSlots).fill(null));
    setHistory([]);
    setGameStarted(true);
    setGameWon(false);
  };

  const filledCount = guess.filter(c => c !== null).length;
  const isGuessFull = filledCount === numSlots;

  const submitGuess = () => {
    if (!isGuessFull) return;
    const correctCount = guess.filter((color, i) => color === answer[i]).length;
    setHistory(prev => [...prev, { guess: [...guess], correctCount }]);
    if (correctCount === numSlots) setGameWon(true);
    else setGuess(Array(numSlots).fill(null));
  };

  // 拖拽逻辑
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

  const toggleHistory = () => setShowHistory(prev => !prev);

  const addColor = () => {
    if (colors.length >= 8) return;
    const nextColor = EXTRA_COLORS[colors.length - BASE_COLORS.length];
    setColors(prev => [...prev, nextColor]);
    setNumSlots(prev => prev + 1);
    setGuess(prev => [...prev, null]);
  };

  return (
    <div className="app">
      <h1>🎯 猜瓶子颜色游戏</h1>

      {!gameStarted ? (
        <div className="start-screen">
          <p>拖拽瓶子到槽位，猜出正确的颜色顺序！</p>
          <div>
            <button className="start-btn" onClick={startGame}>开始游戏</button>
            <button className="start-btn" onClick={addColor} disabled={colors.length >= 8}>
              增加难度 (+1 瓶子)
            </button>
          </div>
        </div>
      ) : (
        <>
          {gameWon && (
            <div className="win-message">
              🎉 恭喜你！用 {history.length} 次猜对了！
              <button className="restart-btn" onClick={startGame}>再玩一次</button>
            </div>
          )}

          <div className="controls">
            <button className="start-btn" onClick={toggleHistory}>
              {showHistory ? "隐藏历史" : "显示历史"}
            </button>
          </div>

          <div className="bottle-pool">
            {colors.map(c => (
              <div
                key={c}
                className={`bottle ${c}`}
                draggable
                onDragStart={() => handleDragStartPool(c)}
              />
            ))}
          </div>

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
            {isGuessFull ? "确定" : `还需填入 ${numSlots - filledCount} 个瓶子`}
          </button>

          {showHistory && history.length > 0 && (
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
