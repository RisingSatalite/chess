'use client'

import Square from "./square"
import { useEffect, useState } from "react";

export default function Chess() {
  const initialBoard = [
    'BR','BN','BB','BK','BQ','BB','BN','BR',
    'BP','BP','BP','BP','BP','BP','BP','BP',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    'WP','WP','WP','WP','WP','WP','WP','WP',
    'WR','WN','WB','WK','WQ','WB','WN','WR'
  ];

  const [board, setBoard] = useState(initialBoard);

  const boardLenght = 8
  const boardHeight = 8
  const boardSquareCount = 64
  
  const [turn, setTurn] = useState("W");
  const [selectedSquare1, setSelectedSquare1] = useState(boardSquareCount);
  const [selectedSquare2, setSelectedSquare2] = useState(boardSquareCount);
  const [enpassent, setEnpassent] = useState(-2)//Stores the square where enpassent can occur, -2 default for uninteractable
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "check", "checkmate", "stalemate"
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [feedback, setFeedback] = useState("Select a piece to begin");

  useEffect(() => {
    //console.log("Square 2 selected");
    if (selectedSquare1 === boardSquareCount || selectedSquare2 === boardSquareCount) {
      return;
    }

    //Pass in a varible incase the move is valid, but an additional square is needed, for castle or enpassent
    var possibleMove = checkIfPossibleMove();
    console.log("Possible move: " + possibleMove);
    if (possibleMove === true) {
      makeMove();
      turnChange();
    } else if (possibleMove) {
      makeMove(possibleMove);
      turnChange();
    }else {
      ineligableMoveClear()
    }
  }, [selectedSquare2]);

  useEffect(() => {
    //alert("Enpassent square set to: " + enpassent);
    console.log("Enpassent square set to: " + enpassent);
  }, [enpassent]);

  useEffect(() => {
    // Check game status after board changes
    const playersColor = turn// === "W" ? "B" : "W";
    const playerInCheck = isInCheck(playersColor);

    console.log(`Does ${playersColor} have a legal move ${hasLegalMoves(playersColor)}`)

    if (playerInCheck && !hasLegalMoves(playersColor)) {
      setGameStatus("checkmate");
      console.log(playersColor + " is in checkmate!");
    } else if (playerInCheck) {
      setGameStatus("check");
      console.log(playersColor + " is in check!");
    } else if (!hasLegalMoves(playersColor)) {
      setGameStatus("stalemate");
      console.log("Stalemate!");
    } else {
      setGameStatus("playing");
      console.log("Next move")
    }
  }, [turn]);

  const selectSquare = (id) => {
    if (selectedSquare1 !== boardSquareCount) {
      const selectingCastlingRook = board[selectedSquare1]?.[1] === "K" && board[id]?.[1] === "R" && board[selectedSquare1][0] === board[id][0];
      if (board[id] && board[id][0] === turn && !selectingCastlingRook) {
        setSelectedSquare1(id);
        setFeedback("Choose a destination square");
        return;
      }
      setSelectedSquare2(id);
    } else if (board[id] && board[id][0] === turn) {
      setSelectedSquare1(id);
      setFeedback("Choose a destination square");
    }
  };

  // Check if a square is attacked by a specific color
  const isSquareAttackedByColor = (targetSquare, attackingColor, boardToCheck = board) => {
    for (let i = 0; i < boardSquareCount; i++) {
      if (!boardToCheck[i] || boardToCheck[i][0] !== attackingColor) continue;
      
      const piece = boardToCheck[i];
      const pieceName = piece[1];
      
      // Check each piece type for possible attack
      if (pieceName === 'P') {
        if (canPawnAttack(i, targetSquare, attackingColor, boardToCheck)) return true;
      } else if (pieceName === 'R') {
        if (canRookAttack(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'B') {
        if (canBishopAttack(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'N') {
        if (canKnightAttack(i, targetSquare)) return true;
      } else if (pieceName === 'Q') {
        if (canQueenAttack(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'K') {
        if (canKingAttack(i, targetSquare)) return true;
      }
    }
    return false;
  };

  // Pawn attack check
  const canPawnAttack = (fromSquare, toSquare, color, boardToCheck) => {
    const direction = color === 'W' ? -1 : 1;
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;
    
    return toRow === fromRow + direction && Math.abs(toCol - fromCol) === 1;
  };

  // Rook attack check
  const canRookAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2, boardToCheck = board) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;
    
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    if (fromRow === toRow) {
      const start = Math.min(fromCol, toCol) + 1;
      const end = Math.max(fromCol, toCol);
      for (let col = start; col < end; col++) {
        if (boardToCheck[fromRow * boardLenght + col] !== '') return false;
      }
      return true;
    } else {
      const start = Math.min(fromRow, toRow) + 1;
      const end = Math.max(fromRow, toRow);
      for (let row = start; row < end; row++) {
        if (boardToCheck[row * boardLenght + fromCol] !== '') return false;
      }
      return true;
    }
  };

  // Bishop attack check
  const canBishopAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2, boardToCheck = board) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;
    
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
    
    const rowStep = toRow > fromRow ? 1 : -1;
    const colStep = toCol > fromCol ? 1 : -1;
    let r = fromRow + rowStep;
    let c = fromCol + colStep;
    
    while (r !== toRow) {
      if (boardToCheck[r * boardLenght + c] !== '') return false;
      r += rowStep;
      c += colStep;
    }
    return true;
  };

  // Knight attack check
  const canKnightAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;
    
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  // Queen attack check
  const canQueenAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2, boardToCheck = board) => {
    return canRookAttack(fromSquare, toSquare, boardToCheck) || canBishopAttack(fromSquare, toSquare, boardToCheck);
  };

  // King attack check
  const canKingAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;
    
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
  };

  // Find king position
  const findKing = (color, boardToCheck = board) => {
    for (let i = 0; i < boardSquareCount; i++) {
      if (boardToCheck[i] === color + 'K') return i;
    }
    return -1;
  };

  // Check if a player is in check
  const isInCheck = (color, boardToCheck = board) => {
    const kingSquare = findKing(color, boardToCheck);
    if (kingSquare === -1) return false;
    
    const opponentColor = color === 'W' ? 'B' : 'W';
    return isSquareAttackedByColor(kingSquare, opponentColor, boardToCheck);
  };

  // Check if a move would leave king in check
  const wouldMoveLeaveKingInCheck = (fromSquare, toSquare, boardToCheck = board) => {
    const testBoard = [...boardToCheck];
    testBoard[toSquare] = testBoard[fromSquare];
    testBoard[fromSquare] = '';
    
    const colorMoving = boardToCheck[fromSquare][0];
    return isInCheck(colorMoving, testBoard);
  };

  // Check if player has any legal moves
  const hasLegalMoves = (color, boardToCheck = board) => {
    for (let from = 0; from < boardSquareCount; from++) {
      if (!boardToCheck[from] || boardToCheck[from][0] !== color) continue;
      
      for (let to = 0; to < boardSquareCount; to++) {
        if (!wouldMoveLeaveKingInCheck(from, to, boardToCheck)) {
          // Check if move is actually possible based on piece rules
          if (isValidPieceMove(from, to, boardToCheck, color)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check if a simple move is valid
  const isSimpleMove = (from, to, boardToCheck, color) => {
    const piece = boardToCheck[from];
    if (!piece || piece[0] !== color) return false;
    
    // Can't move to a square with friendly piece
    if (boardToCheck[to] && boardToCheck[to][0] === color) return false;
    
    return true;
  };

  // Check if pawn move is valid
  const canPawnMove = (from, to, boardToCheck, color) => {
    if (!isSimpleMove(from, to, boardToCheck, color)) return false;
    
    const fromRow = Math.floor(from / boardLenght);
    const fromCol = from % boardLenght;
    const toRow = Math.floor(to / boardLenght);
    const toCol = to % boardLenght;
    
    const direction = color === 'W' ? -1 : 1;
    const startRow = color === 'W' ? 6 : 1;
    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;
    
    // Single forward move
    if (deltaRow === direction && deltaCol === 0 && !boardToCheck[to]) {
      return true;
    }
    
    // Double forward move from start
    if (fromRow === startRow && toRow === fromRow + 2 * direction && deltaCol === 0 && !boardToCheck[to]) {
      const middleSquare = from + boardLenght * direction;
      return !boardToCheck[middleSquare];
    }
    
    // Diagonal capture
    if (deltaRow === direction && Math.abs(deltaCol) === 1 && boardToCheck[to] && boardToCheck[to][0] !== color) {
      return true;
    }
    
    return false;
  };

  // Check if piece move is valid
  const isValidPieceMove = (from, to, boardToCheck, color) => {
    const piece = boardToCheck[from];
    if (!piece || piece[0] !== color) return false;
    
    // Can't move to a square with friendly piece
    if (boardToCheck[to] && boardToCheck[to][0] === color) return false;
    
    const pieceName = piece[1];
    
    if (pieceName === 'P') return canPawnMove(from, to, boardToCheck, color);
    if (pieceName === 'R') return canRookAttack(from, to, boardToCheck);
    if (pieceName === 'B') return canBishopAttack(from, to, boardToCheck);
    if (pieceName === 'N') return canKnightAttack(from, to);
    if (pieceName === 'Q') return canQueenAttack(from, to, boardToCheck);
    if (pieceName === 'K') return canKingAttack(from, to);
    
    return false;
  };

  const checkIfPossibleMove = () => {
    console.log("Checking if possible")

    // Check if the move would leave own king in check
    if (wouldMoveLeaveKingInCheck(selectedSquare1, selectedSquare2)) {
      console.log("Move would leave king in check!");
      return ineligableMoveClear();
    }

    console.log(board[selectedSquare1][1]);
    
    if (board[selectedSquare1][1] === 'R') {
      if (horizontallyConnecting() && noFriendlyFire() && noGhostingHorizontal()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'B') {
      if (canBishopAttack() && noFriendlyFire()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'N') {
      if (canKnightAttack() && noFriendlyFire()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'P') {
      const pawnMove = connectPawn();
      if (pawnMove) { //Check if promoting
        console.log('Enpassent square: ' + enpassent)
        return pawnMove;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'Q') {
      if (((horizontallyConnecting() && noGhostingHorizontal()) || (connectingBishop() && noGhostingDiagonal())) && noFriendlyFire()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'K') {
      console.log("Can castle?" + checkCastle())
      if ((canKingAttack(selectedSquare1, selectedSquare2) && noFriendlyFire())) {
        return true;
      } else if(checkCastle()){
        return true;
      } else {
        return ineligableMoveClear()
      }
    }
    
    return ineligableMoveClear()
  };

  //Clear just the selected squarces, but not the enpassent
  const ineligableMoveClear = () => {
    setSelectedSquare1(boardSquareCount);
    setSelectedSquare2(boardSquareCount);
    setFeedback("That move is not legal");
    return false;
  }

  const reset = () => {
    setSelectedSquare1(boardSquareCount);
    setSelectedSquare2(boardSquareCount);
    return false;
  }

  const resetGame = () => {
    setBoard(initialBoard);
    setTurn("W");
    setEnpassent(-2);
    setGameStatus("playing");
    setMoveHistory([]);
    setLastMove(null);
    setFeedback("Select a piece to begin");
    reset();
  };
  
  //Make sure the 2 selected squares make a valid rook move
  const horizontallyConnecting = () => {
    //Get the row or column
    //Subtracts by boardLenghts to get the row, and what is left is the column
    let square = selectedSquare1;
    let row = 0;
    
    while (square - boardLenght >= 0) {
      row += 1;
      square -= boardLenght;
    }
  
    let square2 = selectedSquare2;
    let row2 = 0;
  
    while (square2 - boardLenght >= 0) {
      row2 += 1;
      square2 -= boardLenght;
    }
  
    return row === row2 || square === square2;
  };

  const connectingBishop = () => {
    if(diagonalConnecting()){
      if(noFriendlyFire()){
        return true
      }
    }else{
      return false
    }
    return false
  }

  const noFriendlyFire = () => {
    if(board[selectedSquare1][0] == "W" && (board[selectedSquare2][0] == "B" || board[selectedSquare2][0] == undefined)){
      return true
    }else if(board[selectedSquare1][0] == "B" && (board[selectedSquare2][0] == "W" || board[selectedSquare2][0] == undefined)){
      return true
    }
    console.log("No friendly fire allowed")
    return false
  }

  const diagonalConnecting = () => {
    let square = selectedSquare1;
    let row = 0;

    let square2 = selectedSquare2;
    let row2 = 0;
    
    while (square - boardLenght >= 0) {
      row += 1;
      square -= boardLenght;
    }
  
    while (square2 - boardLenght >= 0) {
      row2 += 1;
      square2 -= boardLenght;
    }
  
    console.log(Math.abs(square-square2)==Math.abs(row-row2))
    return (Math.abs(square-square2)==Math.abs(row-row2))
  };

  //See if it is a legal pawn move
  const connectPawn = () => {
    const piece = board[selectedSquare1];
    if (!piece || piece[1] !== 'P') return false;
  
    const type = piece[0]; // 'W' or 'B'
    const isWhite = type === 'W';
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const doubleStepRow = isWhite ? 4 : 3;
    const capturedOffset = isWhite ? boardLenght : -boardLenght;
  
    // Calculate row and col from square index
    const getCoords = (index) => [Math.floor(index / boardLenght), index % boardLenght];
    const [row1, col1] = getCoords(selectedSquare1);
    const [row2, col2] = getCoords(selectedSquare2);
  
    const deltaRow = row2 - row1;
    const deltaCol = col2 - col1;
  
    const targetPiece = board[selectedSquare2];
    const targetType = targetPiece?.[0];
  
    // 1. Regular single forward move
    if (deltaRow === direction && deltaCol === 0 && !targetPiece) {
      return true;
    }
  
    // 2. Diagonal capture or en passant
    if (deltaRow === direction && Math.abs(deltaCol) === 1) {
      // Normal capture
      if (targetType && targetType !== type) {
        return true;
      }
  
      // En passant
      if (selectedSquare2 === enpassent) {
        const capturedSquare = selectedSquare2 + capturedOffset;
        console.log("Enpassent move");
        console.log("Captured square: " + capturedSquare);
        //removePiece(capturedSquare);
        return capturedSquare;
      }
    }
  
    // 3. Double move from starting row
    if (row1 === startRow && row2 === doubleStepRow && deltaCol === 0 && !targetPiece) {
      const middleSquare = (selectedSquare1 + selectedSquare2) / 2;
      if (board[middleSquare] === '') {
        //alert("Enpassent possible next move");
        console.log("Enpassent possible next move");
        setEnpassent(middleSquare);
        return middleSquare;// Set en passant square, it will be evaluated as true and be stored for the next move
      } else {
        console.log("Piece in the way of pawn");
        return false;
      }
    }
  
    return false;
  };
  
  const noGhostingHorizontal = () => {
    const from = selectedSquare1;
    const to   = selectedSquare2;

    const r1 = Math.floor(from / boardLenght);
    const c1 = from % boardLenght;
    const r2 = Math.floor(to / boardLenght);
    const c2 = to % boardLenght;

    // Must be strictly horizontal or vertical
    if (!(r1 === r2 || c1 === c2)) return false;

    const step =
      r1 === r2
        ? Math.sign(to - from)          // horizontal
        : Math.sign(r2 - r1) * boardLenght; // vertical

    let current = from + step;

    while (current !== to) {
      if (board[current] !== '') {
        return false; // piece blocking the path
      }
      current += step;
    }

    return true;
  };

  const noGhostingDiagonal = () => {
    let square1 = selectedSquare1;
    let square2 = selectedSquare2;
  
    let row1 = Math.floor(square1 / boardLenght);
    let col1 = square1 % boardLenght;
    let row2 = Math.floor(square2 / boardLenght);
    let col2 = square2 % boardLenght;
  
    // Not a diagonal move
    if (Math.abs(row2 - row1) !== Math.abs(col2 - col1)) {
      return false;
    }
  
    let rowStep = row2 > row1 ? 1 : -1;
    let colStep = col2 > col1 ? 1 : -1;
  
    let r = row1 + rowStep;
    let c = col1 + colStep;
  
    while (r !== row2 && c !== col2) {
      let squareToCheck = r * boardLenght + c;
  
      if (board[squareToCheck] !== '') {
        console.log("Piece in the way at", squareToCheck);
        return false;
      }
  
      r += rowStep;
      c += colStep;
    }
  
    return true;
  }  

  const checkCastle = () => {
    const king = board[selectedSquare1];
    const rook = board[selectedSquare2];
    if (!king || !rook || king[1] !== "K" || rook[1] !== "R" || king[0] !== rook[0]) {
      console.log("Not king and or rook")
      return false;
    }

    const color = king[0];
    const homeRow = color === "W" ? 7 : 0;
    const kingHome = homeRow * boardLenght + 4;
    const kingsideRookHome = homeRow * boardLenght + 7;
    const queensideRookHome = homeRow * boardLenght;

    if (selectedSquare1 !== kingHome) {
      console.log("Not original king square")
      return false;
    }

    const isKingsideCastle = selectedSquare2 === kingsideRookHome;
    const isQueensideCastle = selectedSquare2 === queensideRookHome;
    if (!isKingsideCastle && !isQueensideCastle) {
      return false;
    }

    const rookHome = isKingsideCastle ? kingsideRookHome : queensideRookHome;
    if (moveHistory.some((move) => move.from === kingHome || move.from === rookHome)) {
      return false;
    }

    const pathSquares = isKingsideCastle
      ? [homeRow * boardLenght + 5, homeRow * boardLenght + 6]
      : [homeRow * boardLenght + 1, homeRow * boardLenght + 2, homeRow * boardLenght + 3];

    if (pathSquares.some((square) => board[square] !== "")) {
      return false;
    }

    const opponentColor = color === "W" ? "B" : "W";
    if (isInCheck(color)) {
      return false;
    }

    const kingDestination = isKingsideCastle ? kingHome + 2 : kingHome - 2;
    const rookDestination = isKingsideCastle ? kingHome + 1 : kingHome - 1;
    const squaresKingMustNotCross = isKingsideCastle
      ? [kingHome + 1, kingHome + 2]
      : [kingHome - 1, kingHome - 2];

    for (const square of squaresKingMustNotCross) {
      const simulatedBoard = [...board];
      simulatedBoard[kingHome] = "";
      simulatedBoard[square] = king;
      if (isSquareAttackedByColor(square, opponentColor, simulatedBoard)) {
        return false;
      }
    }

    const finalBoard = [...board];
    finalBoard[kingHome] = "";
    finalBoard[rookHome] = "";
    finalBoard[kingDestination] = king;
    finalBoard[rookDestination] = rook;
    if (isSquareAttackedByColor(kingDestination, opponentColor, finalBoard)) {
      return false;
    }

    return "K" + String(kingDestination) + "R" + String(rookDestination);
  }
  
  const makeMove = (specialSquare = -2) => {
    const newBoard = [...board];

    let oldPiece = newBoard[selectedSquare1]
    let oldPiece2 = newBoard[selectedSquare2]
    const wasCapture = Boolean(oldPiece2) || (typeof specialSquare === "number" && specialSquare !== -2 && newBoard[specialSquare]);

    newBoard[selectedSquare2] = newBoard[selectedSquare1];
    newBoard[selectedSquare1] = "";
    if(typeof specialSquare === "string") {
      if(specialSquare && specialSquare.includes("K") && specialSquare.includes("R")){
        newBoard[selectedSquare2] = "";
        const newSquares = specialSquare.replace("K", "").split("R")

        newBoard[newSquares[0]] = oldPiece
        newBoard[newSquares[1]] = oldPiece2
      }
    }else if(specialSquare != -2){
      if(newBoard[specialSquare] == ""){//If the square is empty, then save it for enpassent
        setEnpassent(specialSquare);
      }else{//Otherwise, remove the piece
        console.log("Piece removed at square: " + specialSquare)
        newBoard[specialSquare] = "";
      }
    }else{
      setEnpassent(-2)//Because the next move can not be enpassent, set it to -2
    }

    //Move the pawn promote to queen if it reaches the end
    let column2 = selectedSquare2;
    let row2 = 0;
    while (column2 - boardLenght >= 0) {
      row2 += 1;
      column2 -= boardLenght;
    }
    if(newBoard[selectedSquare2] == "WP" && row2 == 0){
      newBoard[selectedSquare2] = "WQ"
    }else if(newBoard[selectedSquare2] == "BP" && row2 == 7){
      newBoard[selectedSquare2] = "BQ"
    }

    setBoard(newBoard);
    setLastMove({ from: selectedSquare1, to: selectedSquare2 });
    setMoveHistory((history) => [
      ...history,
      { piece: oldPiece, from: selectedSquare1, to: selectedSquare2, captured: Boolean(wasCapture) },
    ]);
    setFeedback(wasCapture ? "Capture made" : "Move made");
  
    reset()
  };

  const turnChange = () => {
    setTurn(turn === "W" ? "B" : "W");
  };

  const statusMessage = gameStatus === "checkmate"
    ? `${turn === "W" ? "Black" : "White"} wins the match.`
    : gameStatus === "check"
      ? `${turn === "W" ? "White" : "Black"} king is under attack.`
      : gameStatus === "stalemate"
        ? "No legal moves remain."
        : "Checkmate the opposing king to win.";

  return (
    <main className="xiangqi-shell chess-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">Two-player board game</p>
          <h1>Chess</h1>
          <p className="subtitle">Classic chess on an 8 x 8 board</p>
        </div>
        <button className="majorButton" onClick={resetGame} type="button">New game</button>
      </header>

      <div className="game-layout">
        <section className="board-panel" aria-label="Chess board">
          <div className={`turn-bar turn-bar-${gameStatus}`}>
            <span className={`turn-marker ${turn === "W" ? "red" : "black"}`} />
            <div>
              <strong>{turn === "W" ? "White" : "Black"} to move</strong>
              <span className="feedback">{feedback}</span>
            </div>
            <span className={`status status-${gameStatus}`}>{gameStatus}</span>
          </div>
          <div className="board-frame chess-board-frame">
            <div className="board-grid chess-board-grid">
              {Array.from({ length: Math.ceil(board.length / boardLenght) }, (_, rowIndex) => (
                <div key={rowIndex} className="row">
                  {board.slice(rowIndex * boardLenght, rowIndex * boardLenght + boardLenght).map((item, index) => {
                    const squareNumber = rowIndex * boardLenght + index;
                    return (
                      <Square
                        key={squareNumber}
                        number={squareNumber}
                        onClickFunction={() => selectSquare(squareNumber)}
                        prop={item}
                        selected={selectedSquare1}
                        row={rowIndex}
                        lastMove={lastMove}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="game-sidebar">
          <div className={`rules-panel status-panel status-panel-${gameStatus}`} role="status" aria-live="polite">
            <p className="eyebrow">Match status</p>
            <h2 className="status-title">
              {gameStatus === "playing" ? "In play" : gameStatus === "check" ? "Check" : gameStatus === "checkmate" ? "Checkmate" : "Stalemate"}
            </h2>
            <p className="status-message">{statusMessage}</p>
          </div>
          <div className="history-panel">
            <div className="history-heading"><h2>Move history</h2><span>{moveHistory.length}</span></div>
            {moveHistory.length === 0 ? (
              <p className="empty-history">Moves will appear here.</p>
            ) : (
              <ol className="move-list">
                {moveHistory.slice(-8).map((move, index) => (
                  <li key={`${move.from}-${move.to}-${index}`}>
                    <span>{Math.floor(move.from / boardLenght) + 1}.{move.piece}</span>
                    <span>{Math.floor(move.to / boardLenght) + 1}-{(move.to % boardLenght) + 1}{move.captured ? " x" : ""}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </main>
  )}
