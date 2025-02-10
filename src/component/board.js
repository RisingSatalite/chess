'use client'

import Square from "./square"
import { useState } from "react";

export default function Chess() {
  const [board, setBoard] = useState([['BR'],['BN'],['BB'],['BK'],['BQ'],['BB'],['BN'],['BR'],
                                      ['BP'],['BP'],['BP'],['BP'],['BP'],['BP'],['BP'],['BP'],
                                      [''],[''],[''],[''],[''],[''],[''],[''],
                                      [''],[''],[''],[''],[''],[''],[''],[''],
                                      [''],[''],[''],[''],[''],[''],[''],[''],
                                      [''],[''],[''],[''],[''],[''],[''],[''],
                                      ['WP'],['WP'],['WP'],['WP'],['WP'],['WP'],['WP'],['WP'],
                                      ['WR'],['WN'],['WB'],['WK'],['WQ'],['WB'],['WN'],['WR']]);
  const selectSquare = (id) => {
    console.log(id)
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