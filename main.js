import { Chess } from './libs/chess.js';
import { Chessboard } from './src/Chessboard.js';
import { Arrows } from './src/extensions/arrows/Arrows.js';
import { Markers } from './src/extensions/markers/Markers.js';
import { PromotionDialog } from './src/extensions/promotion-dialog/PromotionDialog.js';
import { calculateBestMove } from './src/ai.js';
import { explainMove } from './src/explainer.js';

const chess = new Chess();

const board = new Chessboard(document.getElementById('board'), {
  position: chess.fen(),
  responsive: true,
  assetsUrl: './assets/',
  extensions: [
    { class: Arrows },
    { class: Markers },
    { class: PromotionDialog }
  ]
});

// UI Elements
const statusEl = document.getElementById('status');
const explanationEl = document.getElementById('explanation');

function updateStatus() {
  let status = '';

  let moveColor = 'الأبيض';
  if (chess.turn() === 'b') {
    moveColor = 'الأسود';
  }

  if (chess.in_checkmate()) {
    status = 'انتهت اللعبة، ' + moveColor + ' في وضع كش ملك.';
  } else if (chess.in_draw()) {
    status = 'انتهت اللعبة بالتعادل.';
  } else {
    status = 'دور ' + moveColor;
    if (chess.in_check()) {
      status += '، ' + moveColor + ' في وضع كش.';
    }
  }

  statusEl.innerText = status;
}

function displayExplanation(move) {
    const text = explainMove(move);
    // Append or replace? Let's replace for now to focus on the current move, or append a log.
    // The user asked to "explain every move", implying a log or current status.
    // Let's just show the latest one clearly.
    explanationEl.innerHTML = `<p><strong>${chess.turn() === 'w' ? 'الأسود' : 'الأبيض'}:</strong> ${text}</p>` + explanationEl.innerHTML;
}

function makeAiMove() {
    window.setTimeout(() => {
        const bestMove = calculateBestMove(chess);
        if (bestMove) {
            chess.move(bestMove);
            board.setPosition(chess.fen(), true);
            board.addArrow('highlight', bestMove.from, bestMove.to);

            // Get the move object again from history to be sure we have all flags if needed,
            // though bestMove object from calculateBestMove usually works.
            // Actually calculateBestMove returns a move object from .moves({verbose:true}) which is fine.

            displayExplanation(bestMove);
            updateStatus();
        }
    }, 250);
}

board.enableMoveInput((event) => {
  const { type, square, move } = event;

  if (type === 'showMoveInput') {
    // Allow move only if it is white's turn (player is white)
    if (chess.turn() === 'b') return [];

    const legalMoves = chess.moves({ square, verbose: true });
    legalMoves.forEach(m => {
      board.addMarker(m.to, { class: 'markerSquare' });
    });
    return legalMoves.map(m => m.to);
  }

  if (type === 'moveInputFinished') {
    const result = chess.move({ from: move.from, to: move.to, promotion: 'q' }); // Default to queen promotion for simplicity in UI
    if (result) {
      board.setPosition(chess.fen(), true);
      board.clearMarkers();
      // Remove old arrows
      // Note: board.addArrow adds to a list. We might want to clear previous arrows.
      // But Chessboard.js API usually handles 'highlight' as a unique ID or we can clear.
      // Let's try to just add it.
      board.addArrow('highlight', move.from, move.to);

      displayExplanation(result);
      updateStatus();

      // AI Turn
      if (!chess.game_over()) {
          makeAiMove();
      }
    } else {
        // Invalid move
    }
  }

  if (type === 'moveInputCanceled') {
    board.clearMarkers();
  }

  return true;
});

updateStatus();
