'use client'

import { useEffect } from "react"

export default function Square({ prop, onClickFunction, number = 0, selected = 64, row=0 }) {
    let bgColor;
    let textColour;
    let display = prop

    if(display == ""){
        display = "-"
    }

    if (number === selected) {
        bgColor = "yellow";
        textColour = "black"
    } else if ((number + row) % 2 === 0) {
        bgColor = "black";
        if(prop == ""){
            textColour = "black"
        }else{
            textColour = "white"
        }
    } else {
        bgColor = "white";
        if(prop == ""){
            textColour = "white"
        }else{
            textColour = "black"
        }
    }

    const buttonStyle = {
        backgroundColor: bgColor,
        color: textColour,
    };
    
    return (
        <button onClick={onClickFunction} style={buttonStyle} className="square">
            {display}
        </button>
    );
}