import { useState } from "react";
import "./index.css";

const BASE_COLORS = ["red", "blue", "green", "yellow"];
const EXTRA_COLORS = ["purple", "orange", "pink", "cyan"];

export default function App() {
  /* ---------- 难度 ---------- */
  const [colors, setColors] = useState([...BASE_COLORS]);
  const [numSlots, setNumSlots] = useState(4);

  /* ---------- 游戏状态 ---------- */
  const [answer, setAnswer] = useState([]);
  const [guess, setGuess] = useState(Array(4).fill(null));
  const [history, setHistory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  /* ---------- 拖拽 ---------- */
  const [dragIndex, setDragIndex] = useState(null);
  const [dragColor, setDragColor] = useState(null);

  /* ---------- 开始游戏 ---------- */
  const startGame = () => {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    setAnswer(shuffled.slice(0, numSlots));
    setGuess(Array(numSlots).fill(null));
    setHistory([]);
    setGameStarted(true);
    setGameWon(false);
    setShowAnswer(false);
  };

  /* ---------- 返回开始 ---------- */
  const backToStart = () => {
    setGameStarted(false);
    setGameWon(false);
    setAnswer([]);
    setGuess(Array(numSlots).fill(null));
    setHistory([]);
    setShowAnswer(false);
  };

  /* ---------- 提交 ---------- */
  const filledCount = guess.filter(c => c !== null).length;
  const isGuessFull = filledCount === numSlots;

  const submitGuess = () => {
    if (!isGuessFull) return;

    const correctCount = guess.filter(
      (color, i) => color === answer[i]
    ).length;

    setHistory(prev => [...prev, { guess: [...guess], correctCount }]);

    if (correctCount === numSlots) {
      setGameWon(true);
    } else {
      setGuess(Array(numSlots).fill(null));
    }
  };

  /* ---------- 拖拽逻辑 ---------- */
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
      const next = [...prev];

      if (dragIndex !== null) {
        const tmp = next[index];
        next[index] = next[dragIndex];
        next[dragIndex] = tmp;
      } else if (dragColor !== null) {
        next[index] = dragColor;
      }

      return next;
    });

    setDragIndex(null);
    setDragColor(null);
  };

  const removeFromSlot = (i) => {
    setGuess(prev => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  };

  /* ---------- 其他 ---------- */
  const toggleHistory = () => setShowHistory(p => !p);

  const addColor = () => {
    if (numSlots >= 8) return;

    const nextColor =
      colors.length < BASE_COLORS.length
        ? BASE_COLORS[colors.length]
        : EXTRA_COLORS[colors.length - BASE_COLORS.length];

    setColors(prev => [...prev, nextColor]);
    setNumSlots(prev => prev + 1);
    setGuess(prev => [...prev, null]);
  };

  const removeColor = () => {
    if (numSlots <= 2) return;

    setColors(prev => prev.slice(0, -1));
    setNumSlots(prev => prev - 1);
    setGuess(prev => prev.slice(0, -1));
  };

  /* ---------- UI ---------- */
  return (
    <div className="app">
      <h1>🎯 猜瓶子颜色游戏</h1>

      {!gameStarted ? (
        <div className="start-screen">
          <p>拖拽瓶子到槽位，猜出正确的颜色顺序！</p>
          <p className="rule">当前难度：{numSlots} 个瓶子</p>

          <div className="difficulty-controls">
            <button
              className="start-btn"
              onClick={removeColor}
              disabled={numSlots <= 2}
            >
              −1 瓶子
            </button>

            <button
              className="start-btn"
              onClick={startGame}
            >
              开始游戏
            </button>

            <button
              className="start-btn"
              onClick={addColor}
              disabled={numSlots >= 8}
            >
              +1 瓶子
            </button>
          </div>
        </div>
      ) : (
        <>
          {gameWon && (
            <div className="win-message">
              🎉 恭喜你！用 {history.length} 次猜对了！
              <button
                className="restart-btn"
                onClick={startGame}
              >
                再玩一次
              </button>
            </div>
          )}

          <div className="controls">
            <button className="start-btn" onClick={toggleHistory}>
              {showHistory ? "隐藏历史" : "显示历史"}
            </button>

            <button
              className="start-btn"
              onClick={() => setShowAnswer(p => !p)}
            >
              {showAnswer ? "隐藏答案" : "查看答案"}
            </button>

            <button className="start-btn" onClick={backToStart}>
              返回开始
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
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDropSlot(i)}
              >
                {c && (
                  <div
                    className={`bottle ${c}`}
                    draggable
                    onDragStart={() => handleDragStartSlot(i)}
                    onClick={() => removeFromSlot(i)}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            className="submit-btn"
            onClick={submitGuess}
            disabled={!isGuessFull || gameWon}
          >
            {isGuessFull
              ? "确定"
              : `还需填入 ${numSlots - filledCount} 个瓶子`}
          </button>

          {showAnswer && (
            <div className="answer">
              <h3>答案</h3>
              <div className="answer-bottles">
                {answer.map((c, i) => (
                  <div key={i} className={`bottle ${c}`} />
                ))}
              </div>
            </div>
          )}

          {showHistory && history.length > 0 && (
            <div className="history">
              <h3>历史记录</h3>
              {history.map((h, idx) => (
                <div key={idx} className="history-item">
                  <span className="round">
                    第 {idx + 1} 次:
                  </span>
                  <div className="history-bottles">
                    {h.guess.map((color, i) => (
                      <div
                        key={i}
                        className={`bottle small ${color}`}
                      />
                    ))}
                  </div>
                  <span className="result">
                    ✓ {h.correctCount} 个正确
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
