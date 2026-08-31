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
    WL: "/WhiteRook.png",
    BL: "/BlackRook.png",
    WG: "/WhiteKing.png",
    BG: "/BlackKing.png",
};

export default function Square({ prop, onClickFunction, onDragStart, onDragOver, onDrop, number = 0, selected = -1, row=0, lastMove = null, dataTestId = null }) {
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

    const isSelected = number === selected;
    const isLastMove = lastMove && (number === lastMove.from || number === lastMove.to);

    if (isSelected) {
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
        <button
            onClick={onClickFunction}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            draggable={Boolean(prop)}
            style={buttonStyle}
            className={`square chess-square${isLastMove ? " last-move" : ""}${isSelected ? " selected" : ""}`}
            type="button"
            data-testid={dataTestId ?? `board-square-${number}`}
            aria-label={prop ? `Square ${number + 1}, ${prop}` : `Square ${number + 1}, empty`}
        >
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