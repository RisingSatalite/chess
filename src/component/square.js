'use client'

import Image from "next/image";

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

    const pieceWidth = 25;
    const pieceHeight = 25;
    
    return (
        <button onClick={onClickFunction} style={buttonStyle} className="square">
            {display === "-" && display}
            {display === "WK" && <Image src="/WhiteKing.png" alt={display} width={50} height={50} />}
            {display === "WQ" && <Image src="/WhiteQueen.png" alt={display} width={50} height={50} />}
            {display === "WB" && <Image src="/WhiteBishop.png" alt={display} width={50} height={50} />}
            {display === "WR" && <Image src="/WhiteRook.png" alt={display} width={50} height={50} />}
            {display === "WN" && <Image src="/WhiteKnight.png" alt={display} width={50} height={50} />}
            {display === "WP" && <Image src="/WhitePawn.png" alt={display} width={50} height={50} />}
            {display === "BK" && <Image src="/BlackKing.png" alt={display} width={50} height={50} />}
            {display === "BQ" && <Image src="/BlackQueen.png" alt={display} width={50} height={50} />}
            {display === "BB" && <Image src="/BlackBishop.png" alt={display} width={50} height={50} />}
            {display === "BR" && <Image src="/BlackRook.png" alt={display} width={50} height={50} />}
            {display === "BN" && <Image src="/BlackKnight.png" alt={display} width={50} height={50} />}
            {display === "BP" && <Image src="/BlackPawn.png" alt={display} width={50} height={50} />}
        </button>
    );
}