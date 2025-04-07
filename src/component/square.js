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

    const pieceWidth = 50;
    const pieceHeight = 50;
    
    return (
        <button onClick={onClickFunction} style={buttonStyle} className="square">
            {display === "-" && <Image src="/invisible.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "WK" && <Image src="/WhiteKing.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "WQ" && <Image src="/WhiteQueen.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "WB" && <Image src="/WhiteBishop.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "WR" && <Image src="/WhiteRook.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "WN" && <Image src="/WhiteKnight.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "WP" && <Image src="/WhitePawn.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "BK" && <Image src="/BlackKing.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "BQ" && <Image src="/BlackQueen.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "BB" && <Image src="/BlackBishop.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "BR" && <Image src="/BlackRook.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "BN" && <Image src="/BlackKnight.png" alt={display} width={pieceWidth} height={pieceHeight} />}
            {display === "BP" && <Image src="/BlackPawn.png" alt={display} width={pieceWidth} height={pieceHeight} />}
        </button>
    );
}