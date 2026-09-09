'use client'

import Square from "./shogiPiece";
import { useEffect, useState } from "react";

export default function Chess() {
  const initialBoard = [
    'BL','BN','BS','BG','BK','BG','BS','BN','BL',
    '','BR','','','','','','BB','',
    'BP','BP','BP','BP','BP','BP','BP','BP','BP',
    '','','','','','','','','',
    '','','','','','','','','',
    '','','','','','','','','',
    'WP','WP','WP','WP','WP','WP','WP','WP','WP',
    '','WB','','','','','','WR','',
    'WL','WN','WS','WG','WK','WG','WS','WN','WL',
  ];

  const [board, setBoard] = useState(initialBoard);
  const initialCaptured = { W: [], B: [] };
  const [capturedPieces, setCapturedPieces] = useState(initialCaptured);

  const boardLenght = 9
  const boardHeight = 9
  const boardSquareCount = boardLenght * boardHeight
  
  const [turn, setTurn] = useState("W");
  const [selectedSquare1, setSelectedSquare1] = useState(boardSquareCount);
  const [selectedSquare2, setSelectedSquare2] = useState(boardSquareCount);
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "check", "checkmate", "stalemate"
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [feedback, setFeedback] = useState("Select a piece to begin");
  const [pendingPromotion, setPendingPromotion] = useState(null);

  useEffect(() => {
    //console.log("Square 2 selected");
    if (selectedSquare1 === boardSquareCount || selectedSquare2 === boardSquareCount) {
      return;
    }

    //Pass in a varible incase the move is valid, but an additional square is needed, for castle or enpassent
    var possibleMove = checkIfPossibleMove();
    console.log("Possible move: " + possibleMove);
    if (possibleMove === true) {
      if (canPromote(selectedSquare1, selectedSquare2)) {
        setPendingPromotion({ from: selectedSquare1, to: selectedSquare2 });
        reset();
        setFeedback("Choose whether to promote");
      } else {
        makeMove();
        turnChange();
      }
    } else if (possibleMove) {
      if (canPromote(selectedSquare1, possibleMove)) {
        setPendingPromotion({ from: selectedSquare1, to: possibleMove });
        reset();
        setFeedback("Choose whether to promote");
      } else {
        makeMove(possibleMove);
        turnChange();
      }
    }else {
      ineligableMoveClear()
    }
  }, [selectedSquare2]);

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

  const attemptMove = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) {
      setSelectedSquare1(boardSquareCount);
      setSelectedSquare2(boardSquareCount);
      return;
    }

    if (board[fromIndex] && board[fromIndex][0] !== turn) {
      setFeedback("That piece does not belong to the current player");
      return;
    }

    setSelectedSquare1(fromIndex);
    setSelectedSquare2(toIndex);
  };

  const handleDragStart = (event, id) => {
    if (!board[id] || board[id][0] !== turn) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(id));
    setSelectedSquare1(id);
    setFeedback("Drag to a destination square");
  };

  const normalizeCapturedPiece = (pieceCode) => {
    if (!pieceCode) return null;
    return pieceCode[1] || pieceCode;
  };

  const isValidCapturedDrop = (pieceType, playerColor, targetIndex) => {
    if (!pieceType || board[targetIndex]) return false;

    const targetRow = Math.floor(targetIndex / boardLenght);
    const targetCol = targetIndex % boardLenght;

    if (pieceType === 'P') {
      const sameFilePawnExists = board.some((square, index) => square === `${playerColor}P` && index % boardLenght === targetCol);
      if (sameFilePawnExists) return false;
      if (playerColor === 'W' && targetRow === 0) return false;
      if (playerColor === 'B' && targetRow === boardHeight - 1) return false;
    }

    return true;
  };

  const handleCapturedDragStart = (event, pieceType, playerColor, pieceIndex) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-shogi-drop', JSON.stringify({ pieceType, playerColor, pieceIndex }));
    setFeedback(`Drag ${pieceType} onto the board`);
  };

  const handleDrop = (event, targetIndex) => {
    event.preventDefault();

    const droppedPieceData = event.dataTransfer.getData('application/x-shogi-drop');
    if (droppedPieceData) {
      try {
        const { pieceType, playerColor, pieceIndex } = JSON.parse(droppedPieceData);
        if (!pieceType || !playerColor || playerColor !== turn || !Number.isInteger(pieceIndex)) {
          return;
        }

        if (!isValidCapturedDrop(pieceType, playerColor, targetIndex)) {
          setFeedback('That drop is not legal');
          return;
        }

        const nextBoard = [...board];
        const droppedPieceCode = `${playerColor}${pieceType}`;
        nextBoard[targetIndex] = droppedPieceCode;
        setBoard(nextBoard);
        setCapturedPieces((previous) => ({
          ...previous,
          [playerColor]: previous[playerColor].filter((piece, index) => index !== pieceIndex),
        }));
        setFeedback(`${pieceType} dropped`);
        setSelectedSquare1(boardSquareCount);
        setSelectedSquare2(boardSquareCount);
        setTurn(playerColor === 'W' ? 'B' : 'W');
        return;
      } catch (error) {
        console.error('Failed to parse captured drop payload', error);
      }
    }

    const draggedFrom = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(draggedFrom)) {
      return;
    }

    attemptMove(draggedFrom, targetIndex);
  };

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
        if (connectPawn(i, targetSquare, boardToCheck, true)) return true;
      } else if (pieceName === 'R') {
        if (canRookAttack(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'B') {
        if (canBishopAttack(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'N') {
        if (canKnightAttack(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'K') {
        if (canKingAttack(i, targetSquare)) return true;
      }
    }
    return false;
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

  const canDragonRookAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2, boardToCheck = board) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;

    //The kingish movement
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(fromCol - toCol);
    if(rowDiff == 1 && colDiff == 1){
      return true
    }
    
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

  const canDragonBishopAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2, boardToCheck = board) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(fromCol - toCol);
    if(rowDiff == 1 && colDiff == 0){
      return true
    }
    if(rowDiff == 0 && colDiff == 1){
      return true
    }
    
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
  const canKnightAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2, boardToCheck = board) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;

    const type = boardToCheck[fromSquare]?.[0]; // 'W' or 'B'
    const isWhite = type === 'W';
    const direction = isWhite ? -1 : 1;

    const rowDiff = (toRow - fromRow);
    const colDiff = Math.abs(fromCol - toCol);
    
    return (rowDiff === (2 * direction) && colDiff === 1);
  };

  // King attack check
  const canKingAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;
    
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
  };

  const canGoldGeneralAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2, boardToCheck = board) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;

    const type = boardToCheck[fromSquare]?.[0]; // 'W' or 'B'
    const isWhite = type === 'W';
    const direction = isWhite ? -1 : 1;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(fromCol - toCol);
    if(rowDiff == 1 && colDiff == 0){
      return true
    }
    if(rowDiff == 0 && colDiff == 1){
      return true
    }

    if(direction == (toRow - fromRow) && colDiff == 1){
      return true
    }
    return false
  };

  const canSliverGeneralAttack = (fromSquare = selectedSquare1, toSquare = selectedSquare2, boardToCheck = board) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(fromCol - toCol);
    if(rowDiff == 1 && colDiff == 1){
      return true
    }

    const type = boardToCheck[fromSquare]?.[0]; // 'W' or 'B'
    const isWhite = type === 'W';
    const direction = isWhite ? -1 : 1;
    
    return (((toRow - fromRow) == direction) && (colDiff == 0))
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

  // Check if piece move is valid
  const isValidPieceMove = (from, to, boardToCheck, color) => {
    const piece = boardToCheck[from];
    if (!piece || piece[0] !== color) return false;
    
    // Can't move to a square with friendly piece
    if (boardToCheck[to] && boardToCheck[to][0] === color) return false;
    
    const pieceName = piece[1];
    
    if (pieceName === 'P') return connectPawn(from, to, boardToCheck);
    if (pieceName === 'R') return canRookAttack(from, to, boardToCheck);
    if (pieceName === 'B') return canBishopAttack(from, to, boardToCheck);
    if (pieceName === 'N') return canKnightAttack(from, to, boardToCheck);
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
    }else if(board[selectedSquare1][2] === 'R') {//DR
      if (canDragonRookAttack() && noFriendlyFire()) {
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
    }else if(board[selectedSquare1][2] === 'B') {//DB
      if (canDragonBishopAttack() && noFriendlyFire()) {
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
      if (connectPawn() && noFriendlyFire()) { //Check if promoting
        return true
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'G') {
      if (canGoldGeneralAttack() && noFriendlyFire()) { //Check if promoting
        return true
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'S') {
      if (canSliverGeneralAttack() && noFriendlyFire()) { //Check if promoting
        return true
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'L') {
      if (connectLance() && noFriendlyFire()) { //Check if promoting
        return true
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'K') {
      //console.log("Can castle?" + checkCastle())
      if ((canKingAttack(selectedSquare1, selectedSquare2) && noFriendlyFire())) {
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
    setCapturedPieces(initialCaptured);
    setTurn("W");
    setGameStatus("playing");
    setMoveHistory([]);
    setLastMove(null);
    setFeedback("Select a piece to begin");
    setPendingPromotion(null);
    reset();
  };

  const getPromotionCode = (piece, promote) => {
    if (!promote) return piece;

    const color = piece[0];
    const pieceType = piece[1];
    const promotedType = pieceType === 'R' ? 'DR' :
                         pieceType === 'B' ? 'DB' :
                         pieceType === 'S' ? 'GS' :
                         pieceType === 'L' ? 'GL' :
                         pieceType === 'N' ? 'GN' :
                         pieceType === 'P' ? 'GP' :
                         'NA';
    return color + promotedType;
  };

  const isPromotionZone = (square, color) => {
    const row = Math.floor(square / boardLenght);
    return color === 'W' ? row <= 2 : row >= boardHeight - 3;
  };

  const canPromote = (fromSquare, toSquare) => {
    const piece = board[fromSquare];
    if (!piece || !['P', 'L', 'N', 'S', 'R', 'B'].includes(piece[1])) return false;
    return isPromotionZone(fromSquare, piece[0]) || isPromotionZone(toSquare, piece[0]);
  };

  const mustPromote = (piece, toSquare) => {
    const row = Math.floor(toSquare / boardLenght);
    return (piece[1] === 'P' || piece[1] === 'L')
      ? (piece[0] === 'W' ? row === 0 : row === boardHeight - 1)
      : piece[1] === 'N' && (piece[0] === 'W' ? row <= 1 : row >= boardHeight - 2);
  };

  const finishPromotion = (promote) => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    const movingPiece = board[from];
    const shouldPromote = promote || mustPromote(movingPiece, to);
    setPendingPromotion(null);
    makeMove(to, shouldPromote, from);
    turnChange();
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

  const noFriendlyFire = () => {
    if(board[selectedSquare1][0] == "W" && (board[selectedSquare2][0] == "B" || board[selectedSquare2][0] == undefined)){
      return true
    }else if(board[selectedSquare1][0] == "B" && (board[selectedSquare2][0] == "W" || board[selectedSquare2][0] == undefined)){
      return true
    }
    console.log("No friendly fire allowed")
    return false
  }

  //See if it is a legal pawn move or attack
  const connectPawn = (from = selectedSquare1, to = selectedSquare2, boardToCheck = board) => {
    const piece = boardToCheck[from];
    if (!piece || piece[1] !== 'P') return false;
  
    const type = piece[0]; // 'W' or 'B'
    const isWhite = type === 'W';
    const direction = isWhite ? -1 : 1;
  
    const getCoords = (index) => [Math.floor(index / boardLenght), index % boardLenght];
    const [row1, col1] = getCoords(from);
    const [row2, col2] = getCoords(to);
  
    const deltaRow = row2 - row1;
    const deltaCol = col2 - col1;

    if (deltaRow === direction && deltaCol === 0) {
      return true;
    }
  
    return false;
  };

  const connectLance = () => {
    const piece = board[selectedSquare1];
    if (!piece || piece[1] !== 'L') return false;
  
    const type = piece[0]; // 'W' or 'B'
    const isWhite = type === 'W';
    const direction = isWhite ? -1 : 1;
  
    // Calculate row and col from square index
    const getCoords = (index) => [Math.floor(index / boardLenght), index % boardLenght];
    const [row1, col1] = getCoords(selectedSquare1);
    const [row2, col2] = getCoords(selectedSquare2);
  
    const deltaRow = row2 - row1;
    const deltaCol = col2 - col1;
  
    // Rush attack
    if (deltaRow < 0 && direction == -1 && deltaCol === 0) {
      return noGhostingHorizontal();
    }
    if (deltaRow > 0 && direction == 1 && deltaCol === 0) {
      return noGhostingHorizontal();
    }
  
    //Doesn't do anything else
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
  
  const makeMove = (specialSquare = -2, promote = false, fromOverride = null) => {
    const newBoard = [...board];
    const fromSquare = fromOverride ?? selectedSquare1;
    const toSquare = typeof specialSquare === "number" && specialSquare !== -2 ? specialSquare : selectedSquare2;
    const movingPiece = newBoard[fromSquare];
    const capturedPiece = newBoard[toSquare];

    if (!movingPiece) {
      reset();
      return;
    }

    if (capturedPiece) {
      const normalizedCapture = normalizeCapturedPiece(capturedPiece);
      if (normalizedCapture) {
        setCapturedPieces((previous) => ({
          ...previous,
          [movingPiece[0]]: [...(previous[movingPiece[0]] || []), normalizedCapture],
        }));
      }
    }

    newBoard[toSquare] = movingPiece;
    newBoard[fromSquare] = '';

    newBoard[toSquare] = getPromotionCode(movingPiece, promote);

    setBoard(newBoard);
    setLastMove({ from: fromSquare, to: toSquare });
    setMoveHistory((history) => [
      ...history,
      { piece: newBoard[toSquare], from: fromSquare, to: toSquare, captured: Boolean(capturedPiece) },
    ]);
    setFeedback(capturedPiece ? "Capture made" : "Move made");

    reset();
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
          <h1>Shogi</h1>
        </div>
        <button className="majorButton" onClick={resetGame} type="button">New game</button>
      </header>

      {pendingPromotion && (
        <div className="promotion-dialog" role="dialog" aria-modal="true" aria-labelledby="promotion-title">
          <h2 id="promotion-title">Promote this piece?</h2>
          <p>Choose whether the moved piece should promote.</p>
          <div className="promotion-actions">
            <button type="button" onClick={() => finishPromotion(true)} data-testid="promote-piece">
              Promote
            </button>
            <button
              type="button"
              onClick={() => finishPromotion(false)}
              disabled={mustPromote(board[pendingPromotion.from], pendingPromotion.to)}
              data-testid="keep-piece"
            >
              Keep
            </button>
          </div>
        </div>
      )}

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', minHeight: '3rem', alignItems: 'center', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.75rem', background: '#f9fafb' }}>
              <strong style={{ width: '100%', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>Black captured</strong>
              {capturedPieces.B.length === 0 ? (
                <span style={{ opacity: 0.6 }}>None</span>
              ) : (
                capturedPieces.B.map((pieceCode, index) => (
                  <button
                    key={`B-${pieceCode}-${index}`}
                    type="button"
                    draggable={turn === 'B'}
                    data-testid={`captured-piece-B-${pieceCode}-${index}`}
                    onDragStart={(event) => handleCapturedDragStart(event, pieceCode, 'B', index)}
                    onDragOver={(event) => event.preventDefault()}
                    style={{
                      minWidth: '2.5rem',
                      minHeight: '2.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: '1.1rem',
                      cursor: turn === 'B' ? 'grab' : 'not-allowed',
                      opacity: turn === 'B' ? 1 : 0.7,
                    }}
                    aria-label={`Black captured ${pieceCode}`}
                  >
                    {pieceCode}
                  </button>
                ))
              )}
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
                          onDragStart={(event) => handleDragStart(event, squareNumber)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => handleDrop(event, squareNumber)}
                          prop={item}
                          selected={selectedSquare1}
                          row={rowIndex}
                          lastMove={lastMove}
                          dataTestId={`board-square-${squareNumber}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', minHeight: '3rem', alignItems: 'center', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.75rem', background: '#f9fafb' }}>
              <strong style={{ width: '100%', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>White captured</strong>
              {capturedPieces.W.length === 0 ? (
                <span style={{ opacity: 0.6 }}>None</span>
              ) : (
                capturedPieces.W.map((pieceCode, index) => (
                  <button
                    key={`W-${pieceCode}-${index}`}
                    type="button"
                    draggable={turn === 'W'}
                    data-testid={`captured-piece-W-${pieceCode}-${index}`}
                    onDragStart={(event) => handleCapturedDragStart(event, pieceCode, 'W', index)}
                    onDragOver={(event) => event.preventDefault()}
                    style={{
                      minWidth: '2.5rem',
                      minHeight: '2.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: '1.1rem',
                      cursor: turn === 'W' ? 'grab' : 'not-allowed',
                      opacity: turn === 'W' ? 1 : 0.7,
                    }}
                    aria-label={`White captured ${pieceCode}`}
                  >
                    {pieceCode}
                  </button>
                ))
              )}
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
