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
  
  useEffect(() => {
    console.log("Square 2 selected");
    if (selectedSquare1 === 64 || selectedSquare2 === 64) {
      return;
    } else if (checkIfPossibleMove()) {
      makeMove();
      turnChange();
    } else {
      setSelectedSquare1(64);
      setSelectedSquare2(64);
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
      if (horizontallyConnecting()) {
        return true;
      } else {
        setSelectedSquare1(64);
        setSelectedSquare2(64);
        return false;
      }
    }else if(board[selectedSquare1][1] === 'B') {
    }else if(board[selectedSquare1][1] === 'N') {
      if (connectKnight()) {
        return true;
      } else {
        setSelectedSquare1(64);
        setSelectedSquare2(64);
        return false;
      }
    }else if(board[selectedSquare1][1] === 'P') {
      if (connectPawn()) {
        return true;
      } else {
        setSelectedSquare1(64);
        setSelectedSquare2(64);
        return false;
      }
    }else if(board[selectedSquare1][1] === 'Q') {
    }else if(board[selectedSquare1][1] === 'K') {
      if (connectNeighboring()) {
        return true;
      } else {
        setSelectedSquare1(64);
        setSelectedSquare2(64);
        return false;
      }
    }
    
    setSelectedSquare1(64);
    setSelectedSquare2(64);
    return false;
  };
  
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

  const diagonalConnecting = () => {
    let square = selectedSquare1;
    let row = 0;

    let square2 = selectedSquare2;
    let row2 = 0;

    //Bishop can only hop to square on the same diangol, meaning only odd or even square, so if both are not, then the bishop can not make that move
    if(square%2 != square2%2){
      return false
    }
    
    while (square - 8 > 0) {
      row += 1;
      square -= 8;
    }
  
    while (square2 - 8 > 0) {
      row2 += 1;
      square2 -= 8;
    }

    if((row+square)%2==(row2+square2)%2){
      return false
    }
  
    return row === row2 || square === square2;
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

    if(row+1 == row2 && square+2 == square2){
      return true
    }
    if(row-1 == row2 && square+2 == square2){
      return true
    }
    if(row+1 == row2 && square-2 == square2){
      return true
    }
    if(row+1 == row2 && square-2 == square2){
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
    
    while (square - 8 > 0) {
      row += 1;
      square -= 8;
    }
    console.log(square)
    console.log(row)
  
    while (square2 - 8 > 0) {
      row2 += 1;
      square2 -= 8;
    }
    console.log(square2)
    console.log(row2)

    const otherSquareType = board[selectedSquare2][0]
    console.log(otherSquareType)

    if(type == "W"){
      if((row == row2 - 1) && (square == square2)){
        if(otherSquareType == undefined){
          return true
        }
      }else if((row == row2 - 1) && (square == square2 + 1)){
        if(otherSquareType == "B"){
          return true
        }
      }else if((row == row2 - 1) && (square == square2 - 1)){
        if(otherSquareType == "B"){
          return true
        }
      }
      return false
    }else if(type === "B"){
      if((row = row2 + 1) && (square == square2)){
        if(otherSquareType == undefined){
          return true
        }
      }else if((row == row2 + 1) && (square == square2 + 1)){
        if(otherSquareType == "W"){
          return true
        }
      }else if((row == row2 + 1) && (square == square2 - 1)){
        if(otherSquareType == "W"){
          return true
        }
      }
      return false
    }
    
    return false//Because no colour type
  }
  
  const makeMove = () => {
    const newBoard = [...board];
    newBoard[selectedSquare2] = newBoard[selectedSquare1];
    newBoard[selectedSquare1] = "";
    setBoard(newBoard);
  
    setSelectedSquare1(64);
    setSelectedSquare2(64);
  };
  
  const turnChange = () => {
    setTurn(turn === "W" ? "B" : "W");
  };
  

  return (
    <div>Chess
      It is {turn}
      <div>
        {Array.from({ length: Math.ceil(board.length / 8) }, (_, rowIndex) => (
          <div key={rowIndex} className="row">
            {board.slice(rowIndex * 8, rowIndex * 8 + 8).map((item, index) => (
              <Square
                key={rowIndex * 8 + index}
                onClickFunction={() => selectSquare(rowIndex * 8 + index)}
                prop={item}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )}