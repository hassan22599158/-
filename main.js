import { Chess } from './libs/chess.js';
import { Chessboard } from './src/Chessboard.js';
import { Arrows } from './src/extensions/arrows/Arrows.js';
import { Markers } from './src/extensions/markers/Markers.js';
import { PromotionDialog } from './src/extensions/promotion-dialog/PromotionDialog.js';

const chess = new Chess();

const board = new Chessboard(document.getElementById('board'), {
  position: chess.fen(),
  responsive: true,
  assetsUrl: './assets',
  extensions: [
    { class: Arrows },
    { class: Markers },
    { class: PromotionDialog }
  ]
});

board.enableMoveInput((event) => {
  const { type, square, move } = event;

  if (type === 'showMoveInput') {
    const legalMoves = chess.moves({ square, verbose: true });
    legalMoves.forEach(m => {
      board.addMarker(m.to, { class: 'markerSquare' });
    });
    return legalMoves.map(m => m.to);
  }

  if (type === 'moveInputFinished') {
    const result = chess.move({ from: move.from, to: move.to });
    if (result) {
      board.setPosition(chess.fen(), true);
      board.clearMarkers();
      board.addArrow('highlight', move.from, move.to); // سهم بعد النقلة
    }
  }

  if (type === 'moveInputCanceled') {
    board.clearMarkers();
  }

  return true;
});
