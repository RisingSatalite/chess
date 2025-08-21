'use client'

import Square from "./square"
import { useEffect, useState } from "react";

export default function Chess() {
  const [board, setBoard] = useState([
    'BR','BN','BB','BK','BQ','BB','BN','BR',
    'BP','BP','BP','BP','BP','BP','BP','BP',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    'WP','WP','WP','WP','WP','WP','WP','WP',
    'WR','WN','WB','WK','WQ','WB','WN','WR'
  ]);
  
  const [turn, setTurn] = useState("W");
  const [selectedSquare1, setSelectedSquare1] = useState(64);
  const [selectedSquare2, setSelectedSquare2] = useState(64);
  const [enpassent, setEnpassent] = useState(-2)//Stores the square where enpassent can occur, -2 default for uninteractable

  useEffect(() => {
    //console.log("Square 2 selected");
    if (selectedSquare1 === 64 || selectedSquare2 === 64) {
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
    //alert("Enpassent square set to: " + enpassent);
    console.log("Enpassent square set to: " + enpassent);
  }, [enpassent]);

  const selectSquare = (id) => {
    console.log(id);
    console.log(board[id][0]);
    console.log(board[id][0] === turn);
    console.log(selectedSquare1 !== 64);
    console.log(selectedSquare1);
  
    if (selectedSquare1 !== 64) {
      setSelectedSquare2(id);
      console.log("Square selected", id);
    } else if (board[id][0] === turn) {
      console.log("Square selected", id);
      setSelectedSquare1(id);
    }
  };
  
  const checkIfPossibleMove = () => {
    console.log(board[selectedSquare1][1]);
    
    if (board[selectedSquare1][1] === 'R') {
      console.log(noGhostingHorizontal())
      if (horizontallyConnecting() && noFriendlyFire() && noGhostingHorizontal()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'B') {
      if ((connectingBishop() && noGhostingDiagonal()) && noFriendlyFire()) {
        return true;
      } else {
        return ineligableMoveClear()
      }
    }else if(board[selectedSquare1][1] === 'N') {
      if (connectKnight() && noFriendlyFire()) {
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
      if ((connectNeighboring() && noFriendlyFire())) {
        return true;
      } else if(checkCastle()/*Add castle here */ && noGhostingHorizontal()){
        return checkCastle()
      } else{
        return ineligableMoveClear()
      }
    }
    
    return ineligableMoveClear()
  };

  //Clear just the selected squarces, but not the enpassent
  const ineligableMoveClear = () => {
    setSelectedSquare1(64);
    setSelectedSquare2(64);
    return false;
  }

  const reset = () => {
    setSelectedSquare1(64);
    setSelectedSquare2(64);
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
    //Subtracts by 8s to get the row, and what is left is the column
    let square = selectedSquare1;
    let row = 0;
    
    while (square - 8 >= 0) {
      row += 1;
      square -= 8;
    }
  
    let square2 = selectedSquare2;
    let row2 = 0;
  
    while (square2 - 8 >= 0) {
      row2 += 1;
      square2 -= 8;
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
    
    while (square - 8 >= 0) {
      row += 1;
      square -= 8;
    }
  
    while (square2 - 8 >= 0) {
      row2 += 1;
      square2 -= 8;
    }
  
    console.log(Math.abs(square-square2)==Math.abs(row-row2))
    return (Math.abs(square-square2)==Math.abs(row-row2))
  };

  //Check if the 2 seclected squares are a valid king move 
  const connectNeighboring = () => {
    let square = selectedSquare1;
    let row = 0;

    let square2 = selectedSquare2;
    let row2 = 0;
    
    while (square - 8 > 0) {
      row += 1;
      square -= 8;
    }
  
    while (square2 - 8 > 0) {
      row2 += 1;
      square2 -= 8;
    }
    
    return(row+1 >= row2 && row-1 <=row2 && square+1 >= square2 && square-1 <=square2)
  }

  const connectKnight = () => {
    let square = selectedSquare1;
    let row = 0;
    
    while (square - 8 >= 0) {
      row += 1;
      square -= 8;
    }
  
    let square2 = selectedSquare2;
    let row2 = 0;
  
    while (square2 - 8 >= 0) {
      row2 += 1;
      square2 -= 8;
    }

    console.log(row)
    console.log(row2)
    console.log(square)
    console.log(square2)

    if(row+1 == row2 && square+2 == square2){
      return true
    }
    if(row-1 == row2 && square+2 == square2){
      return true
    }
    if(row+1 == row2 && square-2 == square2){
      return true
    }
    if(row-1 == row2 && square-2 == square2){
      return true
    }
    if(row+2 == row2 && square+1 == square2){
      return true
    }
    if(row+2 == row2 && square-1 == square2){
      return true
    }
    if(row-2 == row2 && square+1 == square2){
      return true
    }
    if(row-2 == row2 && square-1 == square2){
      return true
    }
    return false
  }

  const checkEnpassent = () => {
    //setEnpassent(9) // Yes the setEnpassent works
    console.log("Enpassent" + enpassent)
  }

  //See if it is a legal pawn move
  const connectPawn = () => {
    const piece = board[selectedSquare1];
    if (!piece || piece[1] !== 'P') return false;
  
    const type = piece[0]; // 'W' or 'B'
    const isWhite = type === 'W';
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const doubleStepRow = isWhite ? 4 : 3;
    const capturedOffset = isWhite ? 8 : -8;
  
    // Calculate row and col from square index
    const getCoords = (index) => [Math.floor(index / 8), index % 8];
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
    //Determine which way then if anything inbetween
    let square = selectedSquare1
    let column = selectedSquare1;
    let row = 0;

    let square2 = selectedSquare2
    let column2 = selectedSquare2;
    let row2 = 0;
    
    //Convert the data, in the row and columns, to chekc which need to be checked
    while (column - 8 >= 0) {
      row += 1;
      column -= 8;
    }
  
    while (column2 - 8 >= 0) {
      row2 += 1;
      column2 -= 8;
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
          square += 8//Move closer to the other square, using 8 because checking by moving pass rows
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
          square -= 8//Move closer to the other square, using 8 because checking by moving pass rows
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
  
    let row1 = Math.floor(square1 / 8);
    let col1 = square1 % 8;
    let row2 = Math.floor(square2 / 8);
    let col2 = square2 % 8;
  
    // Not a diagonal move
    if (Math.abs(row2 - row1) !== Math.abs(col2 - col1)) {
      return false;
    }
  
    let rowStep = row2 > row1 ? 1 : -1;
    let colStep = col2 > col1 ? 1 : -1;
  
    let r = row1 + rowStep;
    let c = col1 + colStep;
  
    while (r !== row2 && c !== col2) {
      let squareToCheck = r * 8 + c;
  
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
    console.log("Checking if possible castle")
    //Get the row and columns of the 2 pieces
    let initial = selectedSquare1;
    let initial2 = selectedSquare2
    let square = selectedSquare1;
    let row = 0;
    let square2 = selectedSquare2;
    let row2 = 0;
    
    while (square >= 8) {
      row += 1;
      square -= 8;
    }
    while (square2 >= 8) {
      row2 += 1;
      square2 -= 8;
    }

    //The king and rook have to be on the same square
    if(row != row2){
      console.log("Different rows")
      return false
    }

    if(square == square2){
      console.log("Same columns")
      return false
    }

    //Add check for no check


    //Add check for not moving though check
    if(board[selectedSquare1][1] == "K" && board[selectedSquare2][1] == "R" && board[selectedSquare1][0] == board[selectedSquare2][0]){
      console.log("Possible valid castle")
      if(square < square2){
        let newKingLocation = "K" + String(initial+2)
        let newRookLocation = "R" + String(initial+1)
        return newKingLocation + newRookLocation
      }

      if(square > square2){
        let newKingLocation = "K" + String(initial-2)
        let newRookLocation = "R" + String(initial-1)
        return newKingLocation + newRookLocation
      }
      return false
    }

    return false
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
    while (column2 - 8 >= 0) {
      row2 += 1;
      column2 -= 8;
    }
    if(newBoard[selectedSquare2] == "WP" && row2 == 0){
      newBoard[selectedSquare2] = "WQ"
    }else if(newBoard[selectedSquare2] == "BP" && row2 == 7){
      newBoard[selectedSquare2] = "BQ"
    }

    setBoard(newBoard);
  
    reset()
  };

  const removePiece = (id) => {
    const newBoard = [...board];
    newBoard[id] = "";
    console.log("Piece removed at square: " + id)
    console.log(board)
    console.log(newBoard)
    console.log(board[id])
    console.log(newBoard[id])
    setBoard(newBoard);
  }
  
  const turnChange = () => {
    setTurn(turn === "W" ? "B" : "W");
  };

  return (
    <div id="chess">
      <span>
        Chess
        <button className="majorButton" onClick={() =>{ setBoard([
          'BR','BN','BB','BK','BQ','BB','BN','BR',
          'BP','BP','BP','BP','BP','BP','BP','BP',
          '','','','','','','','',
          '','','','','','','','',
          '','','','','','','','',
          '','','','','','','','',
          'WP','WP','WP','WP','WP','WP','WP','WP',
          'WR','WN','WB','WK','WQ','WB','WN','WR'
        ]);
          setTurn("W");
        }}>Reset</button>
        It is {turn} turn
        {Array.from({ length: Math.ceil(board.length / 8) }, (_, rowIndex) => (
          <div key={rowIndex} className="row">
            {board.slice(rowIndex * 8, rowIndex * 8 + 8).map((item, index) => (
              <Square
                key={rowIndex * 8 + index}
                number={rowIndex * 8 + index}
                onClickFunction={() => selectSquare(rowIndex * 8 + index)}
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
