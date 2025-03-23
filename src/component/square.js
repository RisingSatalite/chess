'use client'

import { useEffect } from "react"

export default function Square({ prop, onClickFunction, number = 0, selected = 64, row=0 }) {
    const buttonStyle = {
        backgroundColor: (number + row) % 2 === 0 ? 'black' : 'white',
        color: (number + row) % 2 === 0 ? 'white' : 'black',
    };
    
    return (
        <button onClick={onClickFunction} style={buttonStyle} className="square">
            -{prop}
        </button>
    );
}