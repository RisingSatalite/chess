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
  const [enpassentNextMove, setEnpassentNextMove] = useState(false)//True for next move may be enpassent, but false will not be enpassent
  
  useEffect(() => {
    console.log("Square 2 selected");
    if (selectedSquare1 === 64 || selectedSquare2 === 64) {
      return;
    } else if (checkIfPossibleMove()) {
      makeMove();
      turnChange();
    } else {
      reset()
    }
  }, [selectedSquare2]);
  
  useEffect(() => {
    console.log("Updated selectedSquare1:", selectedSquare1);
  }, [selectedSquare1]);
  
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
        return reset()
      }
    }else if(board[selectedSquare1][1] === 'B') {
      if ((connectingBishop() && noGhostingDiagonal()) && noFriendlyFire()) {
        return true;
      } else {
        return reset()
      }
    }else if(board[selectedSquare1][1] === 'N') {
      if (connectKnight() && noFriendlyFire()) {
        return true;
      } else {
        return reset()
      }
    }else if(board[selectedSquare1][1] === 'P') {
      if (connectPawn()) { //Check if promoting
        console.log('Enpassent')
        console.log(enpassent)
        console.log(enpassentNextMove)
        return true;
      } else {
        return reset()
      }
    }else if(board[selectedSquare1][1] === 'Q') {
      if (((horizontallyConnecting() && noGhostingHorizontal()) || (connectingBishop() && noGhostingDiagonal())) && noFriendlyFire()) {
        return true;
      } else {
        return reset()
      }
    }else if(board[selectedSquare1][1] === 'K') {
      if ((connectNeighboring() && noFriendlyFire()) /*Add castle here */) {
        return true;
      } else {
        return reset()
      }
    }
    
    return reset()
  };

  const reset = () => {
    setSelectedSquare1(64);
    setSelectedSquare2(64);
    if(enpassentNextMove){//If true, set it to false, and let the next move occur, it may be enpassent
      setEnpassentNextMove(false)
    }else{//Mean false, so that the next move should not be enpassent, clear data from enpassent
      setEnpassent(-2)
    }
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

  //See if it is a legal pawn move
  const connectPawn = () => {
    if(board[selectedSquare1][1] != 'P'){
      console.log("Not pawn")
      return false
    }
    console.log('Checking pawn move')

    const type = board[selectedSquare1][0]

    //square and square2 represent column
    let square = selectedSquare1;
    let row = 0;

    let square2 = selectedSquare2;
    let row2 = 0;
    
    while (square - 8 >= 0) {
      row += 1;
      square -= 8;
    }
    console.log(square)
    console.log(row)
  
    while (square2 - 8 >= 0) {
      row2 += 1;
      square2 -= 8;
    }
    console.log(square2)
    console.log(row2)

    const otherSquareType = board[selectedSquare2][0]
    console.log(otherSquareType)

    console.log("Calculation")
    console.log(row == (row2 - 1))
    console.log(row == (row2 + 1))
    //return false

    if(type == "W"){
      if((row == (row2 + 1)) && (square == square2)){
        if(otherSquareType == undefined){
          return true
        }else{
          return false
        }
      }
      console.log("Enpassent check")
      console.log(enpassent)
      console.log(selectedSquare2)
      if((row == (row2 + 1)) && (square == (square2 + 1))){
        if(otherSquareType == "B"){
          return true
        }else if(enpassent == selectedSquare2){
          setEnpassent(-2)
          return true
        }
      }
      if((row == (row2 + 1)) && (square == (square2 - 1))){
        if(otherSquareType == "B"){
          return true
        }else if(enpassent == selectedSquare2){
          setEnpassent(-2)
          //Delete the pawn
          return true
        }
      }
      if((row == 6)&&(row2==4)&&(square == square2)){
        console.log("Double jump")
        if(otherSquareType == undefined){
          console.log(selectedSquare1-((selectedSquare1 - selectedSquare2)/2))
          console.log(board[selectedSquare1-((selectedSquare1 - selectedSquare2)/2)])
          console.log(board[selectedSquare1-((selectedSquare1 - selectedSquare2)/2)] == "")
          if(board[selectedSquare1-((selectedSquare1 - selectedSquare2)/2)] == ""){
            setEnpassent(selectedSquare1-((selectedSquare1 - selectedSquare2)/2))
            setEnpassentNextMove(true)
            console.log("Setting enpassent")
            console.log(selectedSquare1-((selectedSquare1 - selectedSquare2)/2))
            return true
          }else{
            console.log("Piece in the way of pawn")
            return false
          }
        }else{
          return false
        }
      }
      return false
    }else if(type === "B"){
      if((row = (row2 - 1)) && (square == square2)){
        if(otherSquareType == undefined){
          return true
        }else{
          return false
        }
      }
      console.log("Enpassent check")
      console.log(enpassent)
      console.log(selectedSquare2)
      if((row == (row2 - 1)) && (square == (square2 + 1))){
        if(otherSquareType == "W"){
          return true
        }else if(enpassent == selectedSquare2){
          setEnpassent(-2)
          return true
        }
      }
      if((row == (row2 - 1)) && (square == (square2 - 1))){
        if(otherSquareType == "W"){
          return true
        }else if(enpassent == selectedSquare2){
          setEnpassent(-2)
          return true
        }
      }
      if((row == 1)&&(row2==3)&&(square == square2)){
        console.log("Double jump")
        if(otherSquareType == undefined){
          console.log(selectedSquare2-((selectedSquare2 - selectedSquare1)/2))
          console.log(board[selectedSquare2+((selectedSquare2 - selectedSquare1)/2)])
          console.log(board[selectedSquare2+((selectedSquare2 - selectedSquare1)/2)] == "")
          if(board[selectedSquare2-((selectedSquare2 + selectedSquare1)/2)] == ""){
            setEnpassent(selectedSquare2-((selectedSquare2 + selectedSquare1)/2))
            setEnpassentNextMove(true)
            console.log("Setting enpassent")
            console.log(selectedSquare2-((selectedSquare2 + selectedSquare1)/2))
            return true
          }else{
            console.log("Piece in the way of pawn")
            return false
          }
        }else{
          return false
        }
      }
      return false
    }
    
    return false//Because no colour type
  }

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
    //Check if king or that rook has already moved
    //return reset()

    if(board[selectedSquare1][1] == "K" && board[selectedSquare2][1] == "R" && board[selectedSquare1][0] == board[selectedSquare2][0]){
      console.log("Possible valid castle")
    }
  }
  
  const makeMove = () => {
    const newBoard = [...board];

    newBoard[selectedSquare2] = newBoard[selectedSquare1];
    newBoard[selectedSquare1] = "";

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
  
  const turnChange = () => {
    setTurn(turn === "W" ? "B" : "W");
  };
  

  return (
    <div id="chess">
      <div>
      Chess
      It is {turn}
      <div>
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
      </div>
      </div>
    </div>
  )}