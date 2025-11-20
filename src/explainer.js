
const pieceNames = {
    p: 'الجندي',
    n: 'الحصان',
    b: 'الفيل',
    r: 'القلعة',
    q: 'الوزير',
    k: 'الملك'
};

const squares = {
    a: 'أ', b: 'ب', c: 'ج', d: 'د', e: 'هـ', f: 'و', g: 'ز', h: 'ح'
};

function translateSquare(square) {
    // square is e.g. "e4"
    const file = square[0];
    const rank = square[1];
    return squares[file] + rank;
}

export function explainMove(move) {
    if (!move) return "لا توجد نقلة.";

    // move object from chess.js has:
    // color: 'w', from: 'e2', to: 'e4', flags: 'b', piece: 'p', san: 'e4'
    // captured: 'p' (optional)
    // promotion: 'q' (optional)

    const pieceName = pieceNames[move.piece] || 'القطعة';
    const fromSquare = move.from; // Keep English for clarity or translate? Let's keep simple English letters for coordinates mostly used in chess.
    const toSquare = move.to;

    let explanation = `${pieceName} يتحرك من ${fromSquare} إلى ${toSquare}.`;

    if (move.flags.includes('c') || move.captured) {
        const capturedPiece = pieceNames[move.captured] || 'قطعة';
        explanation += ` وقام بأكل ${capturedPiece}.`;
    }

    if (move.flags.includes('k')) {
        explanation = "تبييت قصير (جهة الملك).";
    }

    if (move.flags.includes('q')) {
        explanation = "تبييت طويل (جهة الوزير).";
    }

    if (move.flags.includes('e')) {
        explanation += " (أكل بالمرور).";
    }

    if (move.promotion) {
        const promotedTo = pieceNames[move.promotion];
        explanation += ` وترقى إلى ${promotedTo}.`;
    }

    // Check / Checkmate detection is usually on the game state, but SAN might have it.
    if (move.san.includes('#')) {
        explanation += " كش ملك (نهاية اللعبة)!";
    } else if (move.san.includes('+')) {
        explanation += " كش ملك!";
    }

    return explanation;
}
