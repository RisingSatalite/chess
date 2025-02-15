'use client'

import Square from "./square"
import { useEffect, useState } from "react";

export default function Chess() {
  const [board, setBoard] = useState(['BR','BN','BB','BK','BQ','BB','BN','BR',
                                      'BP','BP','BP','BP','BP','BP','BP','BP',
                                      '','','','','','','','',
                                      '','','','','','','','',
                                      '','','','','','','','',
                                      '','','','','','','','',
                                      'WP','WP','WP','WP','WP','WP','WP','WP',
                                      'WR','WN','WB','WK','WQ','WB','WN','WR']);
  
  const [turn, setTurn] = useState("W")                                    
  const [selectedSquare1, setSelectedSquare1] = useState(64)
  const [selectedSquare2, setSelectedSquare2] = useState(64)

  useEffect(() => {
    console.log("Square 2 selected")
    if(selectedSquare1 == 64 || selectedSquare2 == 64){
      return
    }else if(checkIfPossibleMove){
      makeMove()
      turnChange()
    }else{
      //selectedSquare1(64)
      //selectedSquare2(64)
    }

  },[selectedSquare2]);

  useEffect(() => {//Make sure square 1 updates
    console.log("Updated selectedSquare1:", selectedSquare1);
    console.log("Is selectedSquare1 not 64?", selectedSquare1 !== 64);
  }, [selectedSquare1]); // Runs when selectedSquare1 changes
  
  const selectSquare = (id) => {
    console.log(id)
    console.log(board[id][0])
    console.log(board[id][0] == turn)
    console.log(selectedSquare1 != 64)
    console.log(selectedSquare1)

    if(selectedSquare1 != 64){
      setSelectedSquare2(id)
      console.log("Square selected", id)
    }else if(board[id][0] == turn){
      console.log("Square selected", id)
      setSelectedSquare1[id]
    }
  }

  const checkIfPossibleMove = () => {
    console.log(board[selectedSquare1][1])
    if(board[selectedSquare1][1]=='R'){
      if(horizontallyConnecting){
        //Check for mate
        //No piece in the way
        //Make move
        return true
      }else{
        //Not possible move
        selectedSquare1(64)
        selectedSquare2(64)
        return false
      }

    }else if(board[selectedSquare1][1]=='B'){

    }else if(board[selectedSquare1][1]=='N'){

    }else if(board[selectedSquare1][1]=='Q'){

    }else if(board[selectedSquare1][1]=='P'){

    }else if(board[selectedSquare1][1]=='K'){

    }else{
      selectedSquare1(64)
      selectedSquare2(64)
      return false
    }
  }

  const horizontallyConnecting = () => {
    square = selectedSquare1
    row = 0
    while(true){
      if(square-8>=0){
        row+1
        square -= 8
      }else{
        break
      }
    }

    square2 = selectedSquare2
    row2 = 0
    while(true){
      if(square2-8>=0){
        row2+1
        square2 -= 8
      }else{
        break
      }
    }

    if(row == row2){
      return true
    }else if(square == square2){
      return true
    }
    return false
  }

  const makeMove = () => {
    board[selectedSquare2] = board[selectedSquare1]
    board[selectedSquare1] = ""
    selectedSquare1(64)
    selectedSquare2(64)
  }

  const turnChange = () => {
    if(turn == "W"){
      setTurn = "B"
    }else if(turn == "B"){
      setTurn = "W"
    }else{
      console.log("Somehow something went wrong :(, I dont know whose turn it is now")
    }
  }

  return (
    <div>Chess
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