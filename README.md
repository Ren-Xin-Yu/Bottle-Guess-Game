# Guess the Bottle Color Game 🎯

A simple React-based game where players drag and drop colored bottles into slots to guess the correct color order. The game keeps track of your guesses and provides feedback on how many colors are correctly placed.

---

## Features

* Drag bottles from the pool to the slots.
* Swap bottles between slots by dragging.
* Submit guesses and get feedback on how many bottles are correct.
* View history of all previous guesses.
* Reset and restart the game anytime.
* Click a bottle in a slot to remove it.

---

## Technologies Used

* **React** (functional components + hooks)
* **SortableJS** for drag-and-drop functionality
* **CSS** for styling and animations

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/guess-bottle-color.git
cd guess-bottle-color
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser at `http://localhost:3000`.

---

## How to Play

1. Click **Start Game**.
2. Drag bottles from the pool into the four slots.
3. Fill all four slots, then click **Submit**.
4. The game will show how many bottles are in the correct position.
5. Continue guessing until all bottles are correctly placed.
6. Click a bottle in a slot to remove it if you want to change it.

---

## Project Structure

```
src/
├── App.jsx       # Main React component
├── index.css     # Styles
└── index.js      # React entry point
```

---

## Customization

* You can change the number of colors or slots by modifying the `COLORS` array in `App.jsx`.
* Adjust drag-and-drop animation speed via `animation` option in SortableJS.
* Style bottles, slots, and history in `index.css`.

---

## License

This pr
