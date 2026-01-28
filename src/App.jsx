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

  /* ---------- 拖拽 + 触摸 ---------- */
  const [dragIndex, setDragIndex] = useState(null);
  const [dragColor, setDragColor] = useState(null);
  const [touchedElement, setTouchedElement] = useState(null);

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
      // 只在猜对时清空
      setGuess(Array(numSlots).fill(null));
    }
    // 猜错时不清空，允许继续调整
  };

  /* ---------- 拖拽逻辑（桌面端） ---------- */
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

  /* ---------- 触摸事件处理（移动端） ---------- */
  const handleTouchStartPool = (e, color) => {
    e.preventDefault();
    setDragColor(color);
    setDragIndex(null);
    setTouchedElement({ type: 'pool', color });
  };

  const handleTouchStartSlot = (e, index) => {
    e.preventDefault();
    setDragIndex(index);
    setDragColor(null);
    setTouchedElement({ type: 'slot', index });
  };

  const handleTouchMove = (e) => {
    if (!touchedElement) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    // 添加视觉反馈
    document.querySelectorAll('.slot').forEach(slot => {
      slot.classList.remove('touch-over');
    });

    if (element && element.closest('.slot')) {
      element.closest('.slot').classList.add('touch-over');
    }
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = element?.closest('.slot');

    if (slot && touchedElement) {
      const slotIndex = Array.from(slot.parentElement.children).indexOf(slot);
      handleDropSlot(slotIndex);
    }

    setTouchedElement(null);
    document.querySelectorAll('.slot').forEach(slot => {
      slot.classList.remove('touch-over');
    });
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
      <div className="game-header">
        <h1>🧪 Color Bottle Puzzle</h1>
        <p className="subtitle">Drag bottles to crack the color code!</p>
      </div>

      {!gameStarted ? (
        <div className="start-screen">
          <div className="game-card">
            <div className="card-icon">🎮</div>
            <h2>Game Rules</h2>
            <p>Drag colorful bottles into slots</p>
            <p>Guess the correct color sequence</p>
            <div className="difficulty-badge">
              Difficulty: {numSlots} Bottles
            </div>

            <div className="difficulty-controls">
              <button
                className="control-btn minus"
                onClick={removeColor}
                disabled={numSlots <= 2}
              >
                <span>−</span>
              </button>

              <button
                className="start-btn primary"
                onClick={startGame}
              >
                Start Game
              </button>

              <button
                className="control-btn plus"
                onClick={addColor}
                disabled={numSlots >= 8}
              >
                <span>+</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {gameWon && (
            <div className="win-message">
              <div className="win-content">
                <div className="trophy">🏆</div>
                <h2>Perfect!</h2>
                <p>You solved it in {history.length} {history.length === 1 ? 'attempt' : 'attempts'}!</p>
                <button
                  className="restart-btn"
                  onClick={startGame}
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          <div className="controls">
            <button className="control-btn-small" onClick={toggleHistory}>
              {showHistory ? "📋 Hide History" : "📋 Show History"}
            </button>

            <button
              className="control-btn-small"
              onClick={() => setShowAnswer(p => !p)}
            >
              {showAnswer ? "🔒 Hide Answer" : "🔓 Show Answer"}
            </button>

            <button className="control-btn-small back" onClick={backToStart}>
              ⬅️ Back
            </button>
          </div>

          <div className="bottle-pool">
            <div className="pool-label">Available Bottles</div>
            <div className="pool-bottles">
              {colors.map(c => (
                <div
                  key={c}
                  className={`bottle ${c}`}
                  draggable
                  onDragStart={() => handleDragStartPool(c)}
                  onTouchStart={(e) => handleTouchStartPool(e, c)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="bottle-cap"></div>
                  <div className="bottle-body"></div>
                  <div className="bottle-shine"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="guess-area">
            <div className="area-label">Your Guess</div>
            <div className="slots-container">
              {guess.map((c, i) => (
                <div
                  key={i}
                  className="slot"
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDropSlot(i)}
                >
                  <div className="slot-number">{i + 1}</div>
                  {c ? (
                    <div
                      className={`bottle ${c}`}
                      draggable
                      onDragStart={() => handleDragStartSlot(i)}
                      onTouchStart={(e) => handleTouchStartSlot(e, i)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onClick={() => removeFromSlot(i)}
                    >
                      <div className="bottle-cap"></div>
                      <div className="bottle-body"></div>
                      <div className="bottle-shine"></div>
                    </div>
                  ) : (
                    <div className="empty-slot">?</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            className="submit-btn"
            onClick={submitGuess}
            disabled={!isGuessFull || gameWon}
          >
            {isGuessFull
              ? "🎯 Submit Answer"
              : `Need ${numSlots - filledCount} more ${numSlots - filledCount === 1 ? 'bottle' : 'bottles'}`}
          </button>

          {showAnswer && (
            <div className="answer">
              <h3>🔑 Correct Answer</h3>
              <div className="answer-bottles">
                {answer.map((c, i) => (
                  <div key={i} className={`bottle ${c}`}>
                    <div className="bottle-cap"></div>
                    <div className="bottle-body"></div>
                    <div className="bottle-shine"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showHistory && history.length > 0 && (
            <div className="history">
              <h3>📜 History</h3>
              <div className="history-list">
                {history.map((h, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-round">#{idx + 1}</div>
                    <div className="history-bottles">
                      {h.guess.map((color, i) => (
                        <div
                          key={i}
                          className={`bottle small ${color}`}
                        >
                          <div className="bottle-cap"></div>
                          <div className="bottle-body"></div>
                        </div>
                      ))}
                    </div>
                    <div className="history-result">
                      <span className="correct-count">{h.correctCount}</span>
                      <span className="correct-label">correct</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}