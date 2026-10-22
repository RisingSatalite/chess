'use client'

import Square from "./xiangqiboard";
import { useEffect, useState } from "react";

export default function XiangqiChess() {
  const initialBoard = [
    'BR','BH','BE','BA','BG','BA','BE','BH','BR',
    '','','','','','','','','',
    '','BC','','','','','','BC','',
    'BS','','BS','','BS','','BS','','BS',
    '','','','','','','','','',
    '','','','','','','','','',
    'WS','','WS','','WS','','WS','','WS',
    '','WC','','','','','','WC','',
    '','','','','','','','','',
    'WR','WH','WE','WA','WG','WA','WE','WH','WR',
  ];

  const [board, setBoard] = useState(initialBoard);

  const boardLenght = 9
  const boardHeight = 10
  const boardSquareCount = 90
  
  const [turn, setTurn] = useState("W");
  const [selectedSquare1, setSelectedSquare1] = useState(boardSquareCount);
  const [selectedSquare2, setSelectedSquare2] = useState(boardSquareCount);
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

  const handleDrop = (event, targetIndex) => {
    event.preventDefault();

    const draggedFrom = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(draggedFrom)) {
      return;
    }

    attemptMove(draggedFrom, targetIndex);
  };

  const selectSquare = (id) => {
    if (selectedSquare1 !== boardSquareCount) {
      if (board[id] && board[id][0] === turn) {
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

  // Check if a square is attacked by a specific color, for checks and checkmates
  const isSquareAttackedByColor = (targetSquare, attackingColor, boardToCheck = board) => {
    for (let i = 0; i < boardSquareCount; i++) {
      if (!boardToCheck[i] || boardToCheck[i][0] !== attackingColor) continue;
      
      const piece = boardToCheck[i];
      const pieceName = piece[1];
      
      // Check each piece type for possible attack
      if (pieceName === 'S') {
        if (connectSolider(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'R') {
        if (canRookAttack(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'E') {
        if (connectingElephant(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'A') {
        if (connectAdvisor(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'C') {
        if (connectCannon(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'H') {
        if (connectHorse(i, targetSquare, boardToCheck)) return true;
      } else if (pieceName === 'G') {
        if (connectGeneral(i, targetSquare, boardToCheck)) return true;
      }
    }
    if(connectFlyingGeneral(boardToCheck)) return true;//Check if the flying general can attack
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

  // Check if piece move is valid
  const isValidPieceMove = (from, to, boardToCheck, color) => {
    const piece = boardToCheck[from];
    if (!piece || piece[0] !== color) return false;
    
    // Can't move to a square with friendly piece
    if (boardToCheck[to] && boardToCheck[to][0] === color) return false;
    
    const pieceName = piece[1];
    
    if (pieceName === 'S') return connectSolider(from, to, boardToCheck);
    //Does not matter if we check adiviors, elephant from attacking as defends type pieces
    if (pieceName === 'R') return canRookAttack(from, to, boardToCheck);
    if (pieceName === 'C') return connectCannon(from, to, boardToCheck);
    if (pieceName === 'H') return connectHorse(from, to, boardToCheck);
    if (pieceName === 'E') return connectingElephant(from, to, boardToCheck);
    if (pieceName === 'A') return connectAdvisor(from, to, boardToCheck);
    if (pieceName === 'G') return connectGeneral(from, to, boardToCheck);
    
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
      if (horizontallyConnecting() && noFriendlyFire() && noGhostingHorizontal()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'E') {
      if (connectingElephant() && noFriendlyFire()){
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
    }else if(board[selectedSquare1][1] === 'C') {
      console.log("Checking if cannon can move")
      if (connectCannon() && noFriendlyFire()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'S') {
      console.log("Checking if solider can move")
      if (connectSolider() && noFriendlyFire()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'A') {
      console.log("Checking if advisor can move")
      if (connectAdvisor() && noFriendlyFire()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'G') {
      console.log("Checking if general can move")
      if (connectGeneral() && noFriendlyFire()) {
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

  const connectCannon = (from = selectedSquare1, to   = selectedSquare2, boardToCheck = board) => {
    var r  = Math.floor(from / boardLenght);
    var c  = from % boardLenght;
    var r2 = Math.floor(to / boardLenght);
    var c2 = to % boardLenght;

    if(!(r === r2 || c === c2)){
      console.log("Neithor squre is in the same file or row")
      return false
    }

    //Preforming a rook like move, not taking
    if(boardToCheck[to] == ""){
      return noGhostingHorizontal(from, to, boardToCheck)//We only care that the cannon is not phasing thought another piece

    //Preforming a cannon capture attack
    }else{
      //Math.sign return 1,0,or -1 which give the direction to change.
      //The one with 0 is not change, but as the loop progress the other row or column is moved until it is the same as respective target 
      const dr = Math.sign(r2 - r);
      const dc = Math.sign(c2 - c);

      //Avoid checking the initial square here
      let curR = r + dr;
      let curC = c + dc;
      let piecesBetween = 0;

      while (curR !== r2 || curC !== c2) {
        if (boardToCheck[getPositionFromRowAndColumn(curR, curC)] !== '') {
          piecesBetween++;
          if (piecesBetween > 1) return false;
        }

        curR += dr;
        curC += dc;
      }
      //Make sure there is a piece in the way, then true, or else return false
      return piecesBetween === 1;
    }
    return false
  };

  const getPositionFromRowAndColumn = (rr, cc) => rr * boardLenght + cc;

  const connectingElephant = (from = selectedSquare1, to = selectedSquare2, boardToCheck = board) => {

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
    const piece = boardToCheck[from];

    if (piece[0] === "W" && r2 < 5) return false;
    if (piece[0] === "B" && r2 > 4) return false;

    // Check eye (middle square)
    const middleRow = (r + r2) / 2;
    const middleCol = (c + c2) / 2;

    if (boardToCheck[getPositionFromRowAndColumn(middleRow, middleCol)] !== "") {
      return false;
    }

    return true;
  };

  const noFriendlyFire = (boardToCheck = board) => {
    if(boardToCheck[selectedSquare1][0] == "W" && (boardToCheck[selectedSquare2][0] == "B" || boardToCheck[selectedSquare2][0] == undefined)){
      return true
    }else if(boardToCheck[selectedSquare1][0] == "B" && (boardToCheck[selectedSquare2][0] == "W" || boardToCheck[selectedSquare2][0] == undefined)){
      return true
    }
    console.log("No friendly fire allowed")
    return false
  }

  const connectAdvisor = (from = selectedSquare1, to = selectedSquare2, boardToCheck = board) => {
    const r  = Math.floor(from / boardLenght);
    const c  = from % boardLenght;
    const r2 = Math.floor(to / boardLenght);
    const c2 = to % boardLenght;

    if(c2 == 3 || c2 == 4 || c2 == 5){
      if(boardToCheck[from][0] == "B"){
        if(r2 == 0 || r2 == 1 || r2 == 2){
        }else{
          console.log("Move goes outside of the palace row", r2)
          return false;//Move is outside of the palace
        }
      }
      if(boardToCheck[from][0] == "W"){
        if(r2 == 7 || r2 == 8 || r2 == 9){
        }else{
          console.log("Move goes outside of the palace row", r2)
          return false;//Move is outside of the palace
        }
      }

      if (r + 1 === r2 && c - 1 === c2){
        return true;
      }
      if (r + 1 === r2 && c + 1 === c2){
        return true;
      }
      if (r - 1 === r2 && c + 1 === c2){
        return true;
      }
      if (r - 1 === r2 && c - 1 === c2){
        return true;
      }

    }else{
      console.log("Move goes outside of the palace column")
      return false;//Move is outside of the palace
    }
  }

  const connectFlyingGeneral = (boardToCheck = board) => {
    //Flying general rule
    const whiteGeneralPosition = findGeneral('W', boardToCheck);
    const blackGeneralPosition = findGeneral('B', boardToCheck);

    if (whiteGeneralPosition === -1 || blackGeneralPosition === -1) return false;

    const cWhiteGeneral  = whiteGeneralPosition % boardLenght;
    const cBlackGeneral = blackGeneralPosition % boardLenght;

    if(cWhiteGeneral !== cBlackGeneral){
      return false;
    }
    if(noGhostingHorizontal(whiteGeneralPosition, blackGeneralPosition, boardToCheck)){
      return true;
    }
    return false;
  }

  const connectGeneral = (from = selectedSquare1, to = selectedSquare2, boardToCheck = board) => {
    const r  = Math.floor(from / boardLenght);
    const c  = from % boardLenght;
    const r2 = Math.floor(to / boardLenght);
    const c2 = to % boardLenght;

    const generalColour = boardToCheck[from][0];

    if(c2 == 3 || c2 == 4 || c2 == 5){
      if(generalColour == "B"){
        if(r2 == 0 || r2 == 1 || r2 == 2){
        }else{
          console.log("Move goes outside of the palace row", r2)
          return false;//Move is outside of the palace
        }
      }
      if(generalColour == "W"){
        if(r2 == 7 || r2 == 8 || r2 == 9){
        }else{
          console.log("Move goes outside of the palace row", r2)
          return false;//Move is outside of the palace
        }
      }

      if (r + 1 === r2 && c === c2){
        return true;
      }
      if (r === r2 && c + 1 === c2){
        return true;
      }
      if (r - 1 === r2 && c === c2){
        return true;
      }
      if (r === r2 && c - 1 === c2){
        return true;
      }

    }else{
      console.log("Move goes outside of the palace column")
      return false;//Move is outside of the palace
    }
  }

  const connectSolider = (from = selectedSquare1, to = selectedSquare2, boardToCheck = board) => {
    const r  = Math.floor(from / boardLenght);
    const c  = from % boardLenght;
    const r2 = Math.floor(to / boardLenght);
    const c2 = to % boardLenght;

    
    if(boardToCheck[from][0] == "B"){
      if (r + 1 === r2 && c === c2){
        return true;
      }
      if (r > (boardHeight/2)){
        if (r === r2 && c + 1 === c2){
          return true;
        }
        if (r === r2 && c - 1 === c2){
          return true;
        }
      }
    }

    if(boardToCheck[from][0] == "W"){
      if (r - 1 === r2 && c === c2){
        return true;
      }
      if (r < (boardHeight/2)){
        if (r === r2 && c + 1 === c2){
          return true;
        }
        if (r === r2 && c - 1 === c2){
          return true;
        }
      }
    }
    return false
  }

  const connectHorse = (from = selectedSquare1, to = selectedSquare2, boardToCheck = board) => {
    const r  = Math.floor(from / boardLenght);
    const c  = from % boardLenght;
    const r2 = Math.floor(to / boardLenght);
    const c2 = to % boardLenght;

    // Right leg
    if (c + 1 < 9 && boardToCheck[getPositionFromRowAndColumn(r, c + 1)] === "") {
      if ((r + 1 === r2 && c + 2 === c2) ||
          (r - 1 === r2 && c + 2 === c2)) return true;
    }

    // Left leg
    if (c - 1 >= 0 && boardToCheck[getPositionFromRowAndColumn(r, c - 1)] === "") {
      if ((r + 1 === r2 && c - 2 === c2) ||
          (r - 1 === r2 && c - 2 === c2)) return true;
    }

    // Down leg
    if (r + 1 < 10 && boardToCheck[getPositionFromRowAndColumn(r + 1, c)] === "") {
      if ((r + 2 === r2 && c + 1 === c2) ||
          (r + 2 === r2 && c - 1 === c2)) return true;
    }

    // Up leg
    if (r - 1 >= 0 && boardToCheck[getPositionFromRowAndColumn(r - 1, c)] === "") {
      if ((r - 2 === r2 && c + 1 === c2) ||
          (r - 2 === r2 && c - 1 === c2)) return true;
    }

    return false;
  };
  
  const noGhostingHorizontal = (from = selectedSquare1, to = selectedSquare2, boardToCheck = board) => {

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
      if (boardToCheck[current] !== '') {
        return false; // piece blocking the path
      }
      current += step;
    }

    return true;
  };

  const makeMove = () => {
    const newBoard = [...board];
    const movingPiece = newBoard[selectedSquare1];
    const capturedPiece = newBoard[selectedSquare2];

    newBoard[selectedSquare2] = movingPiece;
    newBoard[selectedSquare1] = "";

    setBoard(newBoard);
    setLastMove({ from: selectedSquare1, to: selectedSquare2 });
    setMoveHistory((history) => [
      ...history,
      { piece: movingPiece, from: selectedSquare1, to: selectedSquare2, captured: Boolean(capturedPiece) },
    ]);
    setFeedback(capturedPiece ? "Capture made" : "Move made");
  
    reset()
  };

  const turnChange = () => {
    setTurn(turn === "W" ? "B" : "W");
  };

  const statusMessage = gameStatus === "checkmate"
    ? `${turn === "W" ? "Black" : "Red"} wins the match.`
    : gameStatus === "check"
      ? `${turn === "W" ? "Red" : "Black"} general is under attack.`
      : gameStatus === "stalemate"
        ? "No legal moves remain."
        : "Capture the opposing general to win.";

  return (
    <main className="xiangqi-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">Two-player board game</p>
          <h1>Xiangqi</h1>
          <p className="subtitle">Chinese chess on a river board</p>
        </div>
        <button className="majorButton" onClick={resetGame} type="button">New game</button>
      </header>

      <div className="game-layout">
        <section className="board-panel" aria-label="Xiangqi board">
          <div className={`turn-bar turn-bar-${gameStatus}`}>
            <span className={`turn-marker ${turn === "W" ? "red" : "black"}`} />
            <div>
              <strong>{turn === "W" ? "Red" : "Black"} to move</strong>
              <span className="feedback">{feedback}</span>
            </div>
            <span className={`status status-${gameStatus}`}>{gameStatus}</span>
          </div>
          <div className="board-frame">
            <div className="board-grid">
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
                        lastMove={lastMove}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="river-label">楚河 <span>漢界</span></div>
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
