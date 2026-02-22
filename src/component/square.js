'use client'

import Image from "next/image";
import { useState } from "react";

const pieceImages = {
    WK: "/WhiteKing.png",
    WQ: "/WhiteQueen.png",
    WB: "/WhiteBishop.png",
    WR: "/WhiteRook.png",
    WN: "/WhiteKnight.png",
    WP: "/WhitePawn.png",
    BK: "/BlackKing.png",
    BQ: "/BlackQueen.png",
    BB: "/BlackBishop.png",
    BR: "/BlackRook.png",
    BN: "/BlackKnight.png",
    BP: "/BlackPawn.png",

    WS: "/WhitePawn.png",
    BS: "/BlackPawn.png",
    WH: "/WhiteKnight.png",
    BH: "/BlackKnight.png",
    WG: "/WhiteKing.png",
    BG: "/BlackKing.png",
};

export default function Square({ prop, onClickFunction, number = 0, selected = 64, row=0 }) {
    const [imageError, setImageError] = useState(false);

    let bgColor;
    let textColour;
    let display = prop

    if(display == ""){
        display = "-"
    }

    const imageSrc = pieceImages[display];

    var black = "#353535";
    var white = "#f6f6f6";

    if (number === selected) {
        bgColor = "yellow";
        textColour = black
    } else if ((number + row) % 2 === 0) {
        bgColor = black;
        if(prop == ""){
            textColour = black
        }else{
            textColour = white
        }
    } else {
        bgColor = white;
        if(prop == ""){
            textColour = white
        }else{
            textColour = black
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
            {imageSrc && !imageError ? (
                <Image
                    src={imageSrc}
                    alt={display}
                    width={pieceWidth}
                    height={pieceHeight}
                    onError={() => setImageError(true)}
                />
            ) : (
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {display}
                </span>
            )}
        </button>
    );
}