'use client'

export default function Square({ prop, onClickFunction }) {
    return (
        <button  onClick={onClickFunction} className="square">{prop}</button>
    )}