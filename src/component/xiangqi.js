'use client'

import Square from "./square"
import { useEffect, useState } from "react";

export default function XiangqiChess() {
  const [board, setBoard] = useState([
    'BR','BH','BE','BA','BG','BA','BE','BH','BR',
    '','','','','','','','','',
    '','BC','','','','','','BC','',
    'Bs','','Bs','','Bs','','Bs','','Bs',
    '','','','','','','','','',
    '','','','','','','','','',
    'Ws','','Ws','','Ws','','Ws','','Ws',
    '','WC','','','','','','WC','',
    '','','','','','','','','',
    'WR','WH','WE','WA','WG','WA','WE','WH','WR',
  ]);

  const boardLenght = 9
  const boardHeight = 10
  const boardSquareCount = 90
  
  const [turn, setTurn] = useState("W");
  const [selectedSquare1, setSelectedSquare1] = useState(boardSquareCount);
  const [selectedSquare2, setSelectedSquare2] = useState(boardSquareCount);
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "check", "checkmate", "stalemate"

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
    //console.log("Updated selectedSquare1:", selectedSquare1);
  }, [selectedSquare1]);

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
    console.log(id);
    console.log(board[id][0]);
    console.log(board[id][0] === turn);
    console.log(selectedSquare1 !== boardSquareCount);
    console.log(selectedSquare1);
  
    if (selectedSquare1 !== boardSquareCount) {
      setSelectedSquare2(id);
      console.log("Square selected", id);
    } else if (board[id][0] === turn) {
      console.log("Square selected", id);
      setSelectedSquare1(id);
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
  const canRookAttack = (fromSquare, toSquare, boardToCheck) => {
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
  const canBishopAttack = (fromSquare, toSquare, boardToCheck) => {
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
  const canKnightAttack = (fromSquare, toSquare) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;
    
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  // Queen attack check
  const canQueenAttack = (fromSquare, toSquare, boardToCheck) => {
    return canRookAttack(fromSquare, toSquare, boardToCheck) || canBishopAttack(fromSquare, toSquare, boardToCheck);
  };

  // King attack check
  const canKingAttack = (fromSquare, toSquare) => {
    const fromRow = Math.floor(fromSquare / boardLenght);
    const fromCol = fromSquare % boardLenght;
    const toRow = Math.floor(toSquare / boardLenght);
    const toCol = toSquare % boardLenght;
    
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
  };

  // Find king position
  const findGeneral = (color, boardToCheck = board) => {
    for (let i = 0; i < boardSquareCount; i++) {
      if (boardToCheck[i] === color + 'G') return i;
    }
    return -1;
  };

  // Check if a player is in check
  const isInCheck = (color, boardToCheck = board) => {
    const kingSquare = findGeneral(color, boardToCheck);
    if (kingSquare === -1) return false;
    
    const opponentColor = color === 'W' ? 'B' : 'W';
    return isSquareAttackedByColor(kingSquare, opponentColor, boardToCheck);
  };

  // Check if a move would leave king in check
  const wouldMoveLeaveKingInCheck = (fromSquare, toSquare, boardToCheck = board) => {
    const testBoard = [...boardToCheck];
    testBoard[toSquare] = testBoard[fromSquare];
    testBoard[fromSquare] = '';
    
    //console.log(boardToCheck)
    //console.log(boardToCheck[fromSquare])
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
    // Check if the move would leave own king in check
    if (wouldMoveLeaveKingInCheck(selectedSquare1, selectedSquare2)) {
      console.log("Move would leave king in check!");
      return ineligableMoveClear();
    }

    console.log(board[selectedSquare1][1]);
    
    if (board[selectedSquare1][1] === 'R') {
      console.log(noGhostingHorizontal())
      if (horizontallyConnecting() && noFriendlyFire() && noGhostingHorizontal()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'E') {
      if (connectingElephant()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'H') {
      console.log("Checking if horse can move")
      if (connectHorse() && noFriendlyFire()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'P') {
      const pawnMove = connectPawn();
      if (pawnMove) { //Check if promoting
        return pawnMove;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'K') {
      if ((canKingAttack(selectedSquare1, selectedSquare2) && noFriendlyFire())) {
        return true;
      } else{
        return ineligableMoveClear()
      }
    }
    
    return ineligableMoveClear()
  };

  //Clear just the selected squarces, but not the enpassent
  const ineligableMoveClear = () => {
    setSelectedSquare1(boardSquareCount);
    setSelectedSquare2(boardSquareCount);
    return false;
  }

  const reset = () => {
    setSelectedSquare1(boardSquareCount);
    setSelectedSquare2(boardSquareCount);
    //console.log(board)
    //alert("Can next move be enpassent: " + enpassentNextMove)
    //alert("Enpassent square: " + enpassent)
    /*
    if(enpassentNextMove){//If true, set it to false, and let the next move occur, it may be enpassent
      setEnpassentNextMove(false)
    }else{//Mean false, so that the next move should not be enpassent, clear data from enpassent
      setEnpassent(-2)
    }
    */
    return false   
  }
  
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

  const getPositionFromRowAndColumn = (rr, cc) => rr * boardLenght + cc;

  const connectingElephant = () => {
    if (!noFriendlyFire()) return false;

    const from = selectedSquare1;
    const to   = selectedSquare2;

    const r  = Math.floor(from / boardLenght);
    const c  = from % boardLenght;
    const r2 = Math.floor(to / boardLenght);
    const c2 = to % boardLenght;

    // Elephant must move exactly 2 diagonal
    if (Math.abs(r - r2) !== 2 || Math.abs(c - c2) !== 2) {
      return false;
    }

    // River rule (assuming red bottom, black top)
    // Red cannot go above row 4
    // Black cannot go below row 5
    const piece = board[from];

    if (piece[0] === "W" && r2 < 5) return false;
    if (piece[0] === "B" && r2 > 4) return false;

    // Check eye (middle square)
    const middleRow = (r + r2) / 2;
    const middleCol = (c + c2) / 2;

    if (board[getPositionFromRowAndColumn(middleRow, middleCol)] !== "") {
      return false;
    }

    return true;
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

  const connectHorse = () => {
    const from = selectedSquare1;
    const to   = selectedSquare2;

    const r  = Math.floor(from / boardLenght);
    const c  = from % boardLenght;
    const r2 = Math.floor(to / boardLenght);
    const c2 = to % boardLenght;

    // Right leg
    if (c + 1 < 9 && board[getPositionFromRowAndColumn(r, c + 1)] === "") {
      if ((r + 1 === r2 && c + 2 === c2) ||
          (r - 1 === r2 && c + 2 === c2)) return true;
    }

    // Left leg
    if (c - 1 >= 0 && board[getPositionFromRowAndColumn(r, c - 1)] === "") {
      if ((r + 1 === r2 && c - 2 === c2) ||
          (r - 1 === r2 && c - 2 === c2)) return true;
    }

    // Down leg
    if (r + 1 < 10 && board[getPositionFromRowAndColumn(r + 1, c)] === "") {
      if ((r + 2 === r2 && c + 1 === c2) ||
          (r + 2 === r2 && c - 1 === c2)) return true;
    }

    // Up leg
    if (r - 1 >= 0 && board[getPositionFromRowAndColumn(r - 1, c)] === "") {
      if ((r - 2 === r2 && c + 1 === c2) ||
          (r - 2 === r2 && c - 1 === c2)) return true;
    }

    return false;
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
    return false;
  };
  
  const noGhostingHorizontal = () => {
    //Determine which way then if anything inbetween
    let square = selectedSquare1
    let column = selectedSquare1;
    let row = 0;

    let square2 = selectedSquare2
    let column2 = selectedSquare2;
    let row2 = 0;
    
    //Convert the data, in the row and columns, to chekc which need to be checked
    while (column - boardLenght >= 0) {
      row += 1;
      column -= boardLenght;
    }
  
    while (column2 - boardLenght >= 0) {
      row2 += 1;
      column2 -= boardLenght;
    }

    if(row==row2){
      if(square < square2){
        while (true){
          console.log("Looping")
          console.log(square)
          console.log("Square 2 is ", square2)
          square += 1//Move closer to the other square
          //If no other piece in the way all the way to the other piece, then valid move
          if(square == square2){
            return true
          }
          //If inbetween square is a square, then the move is not valid because another piece in the way
          console.log(board[square])
          console.log("")
          console.log(board[square] != '')
          if(board[square] != ''){
            console.log("Piece in the way")
            return false
          }
          if(square > square2){
            console.log("Squares do not align")
            return false
          }
        }
      }else{
        while (true){
          console.log("Looping")
          console.log(square)
          console.log("Square 2 is ", square2)
          square -= 1//Move closer to the other square
          //If no other piece in the way all the way to the other piece, then valid move
          if(square == square2){
            return true
          }
          //If inbetween square is a square, then the move is not valid because another piece in the way
          console.log(board[square])
          console.log("")
          console.log(board[square] != '')
          if(board[square] != ''){
            return false
          }
          if(square < square2){
            console.log("Squares do not align")
            return false
          }
        }
      }
    }else{
      if(square < square2){
        while (true){
          console.log("Looping")
          console.log(square)
          console.log("Square 2 is ", square2)
          square += boardLenght//Move closer to the other square, using boardLenght because checking by moving pass rows
          //If no other piece in the way all the way to the other piece, then valid move
          if(square == square2){
            return true
          }
          //If inbetween square is a square, then the move is not valid because another piece in the way
          console.log(board[square])
          console.log("")
          console.log(board[square] != '')
          if(board[square] != ''){
            return false
          }
          if(square > square2){
            console.log("Squares do not align")
            return false
          }
        }
      }else{
        while (true){
          console.log("Looping")
          console.log("Square 1 is ", square)
          console.log("Square 2 is ", square2)
          square -= boardLenght//Move closer to the other square, using boardLenght because checking by moving pass rows
          //If no other piece in the way all the way to the other piece, then valid move
          if(square == square2){
            return true
          }
          //If inbetween square is a square, then the move is not valid because another piece in the way
          console.log(board[square])
          console.log("")
          console.log(board[square] != '')
          if(board[square] != ''){
            return false
          }
          if(square < square2){
            console.log("Squares do not align")
            return false
          }
        }
      }
    }
    return false
  }

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

  const makeMove = (specialSquare = -2) => {
    const newBoard = [...board];

    let oldPiece = newBoard[selectedSquare1]
    let oldPiece2 = newBoard[selectedSquare2]

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
      }else{//Otherwise, remove the piece
        console.log("Piece removed at square: " + specialSquare)
        newBoard[specialSquare] = "";
      }
    }else{
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
  
    reset()
  };

  const turnChange = () => {
    setTurn(turn === "W" ? "B" : "W");
  };

  return (
    <div id="chess">
      <span>
        Xiangqi
        <button className="majorButton" onClick={() =>{ setBoard([
    'BR','BH','BE','BA','BG','BA','BE','BH','BR',
    '','','','','','','','','',
    '','BC','','','','','','BC','',
    'Bs','','Bs','','Bs','','Bs','','Bs',
    '','','','','','','','','',
    '','','','','','','','','',
    'Ws','','Ws','','Ws','','Ws','','Ws',
    '','WC','','','','','','WC','',
    '','','','','','','','','',
    'WR','WH','WE','WA','WG','WA','WE','WH','WR',
  ]);
          setTurn("W");
          setGameStatus("playing");
        }}>Reset</button>
        <div>
          <p>It is {turn} turn</p>
          {gameStatus === "checkmate" && <p style={{color: "red", fontWeight: "bold"}}>CHECKMATE! {turn === "W" ? "Black" : "White"} wins!</p>}
          {gameStatus === "check" && <p style={{color: "orange", fontWeight: "bold"}}>CHECK!</p>}
          {gameStatus === "stalemate" && <p style={{color: "blue", fontWeight: "bold"}}>STALEMATE!</p>}
        </div>
        {Array.from({ length: Math.ceil(board.length / boardLenght) }, (_, rowIndex) => (
          <div key={rowIndex} className="row">
            {board.slice(rowIndex * boardLenght, rowIndex * boardLenght + boardLenght).map((item, index) => (
              <Square
                key={rowIndex * boardLenght + index}
                number={rowIndex * boardLenght + index}
                onClickFunction={() => selectSquare(rowIndex * boardLenght + index)}
                prop={item}
                selected={selectedSquare1}
                row={rowIndex}
              />
            ))}
          </div>
        ))}
      </span>
    </div>
  )}
