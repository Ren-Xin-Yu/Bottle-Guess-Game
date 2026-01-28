import { useState, useEffect, useRef } from "react";
import Sortable from "sortablejs";
import "./index.css";

const COLORS = ["red", "blue", "green", "yellow"];

export default function App() {
  const [answer, setAnswer] = useState([]);
  const [guess, setGuess] = useState([null, null, null, null]);
  const [history, setHistory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const poolRef = useRef(null);
  const slotRefs = useRef([]);
  const sortablesRef = useRef([]);

  const startGame = () => {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    setAnswer(shuffled);
    setGuess([null, null, null, null]);
    setHistory([]);
    setGameStarted(true);
    setGameWon(false);
  };

  // 修复：明确计算已填入的瓶子数量
  const filledCount = guess.filter(color => color !== null).length;
  const isGuessFull = filledCount === 4;

  const submitGuess = () => {
    if (!isGuessFull) return;

    const correctCount = guess.filter((color, i) => color === answer[i]).length;

    setHistory(prev => [...prev, {
      guess: [...guess],
      correctCount
    }]);

    if (correctCount === 4) {
      setGameWon(true);
    } else {
      setGuess([null, null, null, null]);
    }
  };

  useEffect(() => {
    if (!gameStarted) return;

    // 清理之前的 sortable
    sortablesRef.current.forEach(s => s?.destroy());
    sortablesRef.current = [];

    // 瓶子池
    const poolSortable = Sortable.create(poolRef.current, {
      group: {
        name: "bottles",
        pull: "clone",
        put: false,
      },
      sort: false,
      animation: 150,
      ghostClass: "drag-ghost",
      // 关键修复：阻止 DOM 操作
      onClone: (evt) => {
        // 克隆时不做任何操作
      },
    });
    sortablesRef.current.push(poolSortable);

    // 每个槽位
    slotRefs.current.forEach((slotEl, index) => {
      if (!slotEl) return;

      const slotSortable = Sortable.create(slotEl, {
        group: "bottles",
        animation: 150,
        ghostClass: "drag-ghost",

        onAdd: (evt) => {
          // 关键修复：立即移除 DOM 元素，只用 React 状态管理
          evt.item.remove();

          const toSlotIndex = parseInt(evt.to.dataset.slotIndex);
          const color = evt.clone?.dataset.color || evt.item.dataset.color;
          const fromSlotIndexStr = evt.from.dataset?.slotIndex;
          const fromSlotIndex = fromSlotIndexStr !== undefined ? parseInt(fromSlotIndexStr) : undefined;

          console.log("onAdd:", { fromSlotIndex, toSlotIndex, color });

          // 从池子拖到槽位
          if (fromSlotIndex === undefined) {
            setGuess(prev => {
              const newGuess = [...prev];
              newGuess[toSlotIndex] = color;
              console.log("New guess:", newGuess);
              return newGuess;
            });
          }
          // 槽位之间移动
          else {
            setGuess(prev => {
              const newGuess = [...prev];
              if (newGuess[toSlotIndex] === null) {
                newGuess[toSlotIndex] = newGuess[fromSlotIndex];
                newGuess[fromSlotIndex] = null;
              } else {
                // 交换
                const temp = newGuess[toSlotIndex];
                newGuess[toSlotIndex] = newGuess[fromSlotIndex];
                newGuess[fromSlotIndex] = temp;
              }
              console.log("New guess:", newGuess);
              return newGuess;
            });
          }
        },

        onRemove: (evt) => {
          // 移除时也立即清理 DOM
          evt.item.remove();
        },
      });

      sortablesRef.current.push(slotSortable);
    });

    return () => {
      sortablesRef.current.forEach(s => s?.destroy());
      sortablesRef.current = [];
    };
  }, [gameStarted, gameWon]); // 添加 gameWon 依赖

  const removeFromSlot = (index) => {
    setGuess(prev => {
      const newGuess = [...prev];
      newGuess[index] = null;
      return newGuess;
    });
  };

  return (
    <div className="app">
      <h1>🎯 猜瓶子颜色游戏</h1>

      {!gameStarted ? (
        <div className="start-screen">
          <p>拖拽瓶子到槽位，猜出正确的颜色顺序！</p>
          <p className="rule">只有位置和颜色都正确才算分</p>
          <button className="start-btn" onClick={startGame}>开始游戏</button>
        </div>
      ) : (
        <>
          {gameWon && (
            <div className="win-message">
              🎉 恭喜你！你用 {history.length} 次猜对了！
              <button className="restart-btn" onClick={startGame}>再玩一次</button>
            </div>
          )}

          <div className="bottle-pool" ref={poolRef}>
            {COLORS.map(color => (
              <div key={color} className={`bottle ${color}`} data-color={color} />
            ))}
          </div>

          <div className="game-section">
            <h3>当前猜测 (第 {history.length + 1} 次)</h3>
            <div className="guess-area">
              {guess.map((color, i) => (
                <div
                  key={i}
                  className="slot"
                  ref={el => slotRefs.current[i] = el}
                  data-slot-index={i}
                >
                  {color && (
                    <div
                      className={`bottle ${color}`}
                      data-color={color}
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
              {isGuessFull ? "确定" : `还需填入 ${4 - filledCount} 个瓶子`}
            </button>

            {/* 调试信息 */}
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              调试: {guess.map((c, i) => `[${i}:${c || 'null'}]`).join(' ')} | 已填: {filledCount}
            </div>
          </div>

          {history.length > 0 && (
            <div className="history">
              <h3>历史记录</h3>
              {history.map((record, idx) => (
                <div key={idx} className="history-item">
                  <span className="round">第 {idx + 1} 次:</span>
                  <div className="history-bottles">
                    {record.guess.map((color, i) => (
                      <div key={i} className={`bottle small ${color}`} />
                    ))}
                  </div>
                  <span className="result">✓ {record.correctCount} 个正确</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}