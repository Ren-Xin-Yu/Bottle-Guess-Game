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
  const [lastResult, setLastResult] = useState(null); // 新增：保存最后一次猜测结果

  /* ---------- 拖拽 ---------- */
  const [dragIndex, setDragIndex] = useState(null);
  const [dragColor, setDragColor] = useState(null);

  /* ---------- 触摸拖拽状态 ---------- */
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBottle, setDraggedBottle] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  /* ---------- 开始游戏 ---------- */
  const startGame = () => {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    setAnswer(shuffled.slice(0, numSlots));
    setGuess(Array(numSlots).fill(null));
    setHistory([]);
    setGameStarted(true);
    setGameWon(false);
    setShowAnswer(false);
    setLastResult(null); // 重置结果
  };

  /* ---------- 返回开始 ---------- */
  const backToStart = () => {
    setGameStarted(false);
    setGameWon(false);
    setAnswer([]);
    setGuess(Array(numSlots).fill(null));
    setHistory([]);
    setShowAnswer(false);
    setLastResult(null);
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
    setLastResult({ guess: [...guess], correctCount }); // 保存结果

    if (correctCount === numSlots) {
      setGameWon(true);
      setGuess(Array(numSlots).fill(null));
    }
  };

  /* ---------- 桌面端拖拽逻辑 ---------- */
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

  /* ---------- 移动端触摸逻辑 ---------- */
  const handleTouchStartPool = (e, color) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();

    setIsDragging(true);
    setDraggedBottle({ type: 'pool', color });
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    setDragStartPos({ x: rect.left, y: rect.top });

    // 防止页面滚动
    e.preventDefault();
  };

  const handleTouchStartSlot = (e, index) => {
    if (!guess[index]) return; // 空槽位不能拖拽

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();

    setIsDragging(true);
    setDraggedBottle({ type: 'slot', index, color: guess[index] });
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    setDragStartPos({ x: rect.left, y: rect.top });

    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });

    // 高亮目标槽位
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    document.querySelectorAll('.slot').forEach(slot => {
      slot.classList.remove('touch-over');
    });

    const slot = element?.closest('.slot');
    if (slot) {
      slot.classList.add('touch-over');
    }

    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || !draggedBottle) {
      setIsDragging(false);
      setDraggedBottle(null);
      return;
    }

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetSlot = element?.closest('.slot');

    if (targetSlot) {
      const slots = Array.from(targetSlot.parentElement.children);
      const targetIndex = slots.indexOf(targetSlot);

      if (targetIndex !== -1) {
        setGuess(prev => {
          const next = [...prev];

          if (draggedBottle.type === 'pool') {
            // 从颜色池拖到槽位
            next[targetIndex] = draggedBottle.color;
          } else if (draggedBottle.type === 'slot') {
            // 槽位之间交换
            const sourceIndex = draggedBottle.index;
            const tmp = next[targetIndex];
            next[targetIndex] = next[sourceIndex];
            next[sourceIndex] = tmp;
          }

          return next;
        });
      }
    }

    // 清理状态
    setIsDragging(false);
    setDraggedBottle(null);
    document.querySelectorAll('.slot').forEach(slot => {
      slot.classList.remove('touch-over');
    });

    e.preventDefault();
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
    <div className="app" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* 拖拽中的瓶子 */}
      {isDragging && draggedBottle && (
        <div
          className={`bottle dragging ${draggedBottle.color}`}
          style={{
            position: 'fixed',
            left: dragPosition.x - 30,
            top: dragPosition.y - 40,
            pointerEvents: 'none',
            zIndex: 1000,
            opacity: 0.8,
          }}
        >
          <div className="bottle-cap"></div>
          <div className="bottle-body"></div>
          <div className="bottle-shine"></div>
        </div>
      )}

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
                  className={`bottle ${c} ${isDragging && draggedBottle?.type === 'pool' && draggedBottle?.color === c ? 'dragging-source' : ''}`}
                  draggable
                  onDragStart={() => handleDragStartPool(c)}
                  onTouchStart={(e) => handleTouchStartPool(e, c)}
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
                      className={`bottle ${c} ${isDragging && draggedBottle?.type === 'slot' && draggedBottle?.index === i ? 'dragging-source' : ''}`}
                      draggable
                      onDragStart={() => handleDragStartSlot(i)}
                      onTouchStart={(e) => handleTouchStartSlot(e, i)}
                      onDoubleClick={() => removeFromSlot(i)}
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

          {/* 新增：当前结果显示 */}
          {lastResult && !gameWon && (
            <div className="current-result">
              <div className="result-icon">
                {lastResult.correctCount === numSlots ? '✅' : '🎯'}
              </div>
              <div className="result-text">
                Last attempt: <span className="result-number">{lastResult.correctCount}</span> / {numSlots} correct
              </div>
            </div>
          )}

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