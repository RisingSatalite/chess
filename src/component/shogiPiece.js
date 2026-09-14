'use client'

import Image from "next/image";
import { useState } from "react";

const pieceImages = {
    WK: "/WhiteKing.png",
    WB: "/WhiteBishop.png",
    WR: "/WhiteRook.png",
    WN: "/WhiteKnight.png",
    WP: "/WhitePawn.png",
    BK: "/BlackKing.png",
    BB: "/BlackBishop.png",
    BR: "/BlackRook.png",
    BN: "/BlackKnight.png",
    BP: "/BlackPawn.png",

    WS: "/WhitePawn.png",
    BS: "/BlackPawn.png",
    WL: "/WhiteLancer.png",
    BL: "/BlackLancer.png",
    WG: "/WhiteKing.png",
    BG: "/BlackGoldGeneral.png",
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

    var rotation = 0;
    if(display.slice(0, 2) == "BG"){
        rotation = 180;
    }else if(display == "BS"){
        rotation = 180;
    }

    var black = "#353535";
    var white = "#f6f6f6";
    var selected = "ffffbb";
    var yellow = "#ffdaa4";

    const isSelected = number === selected;
    const isLastMove = lastMove && (number === lastMove.from || number === lastMove.to);

    if (isSelected) {
        bgColor = selected;
        textColour = black
    } else {
        bgColor = yellow;
        textColour = black
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
                    className="transition-transform"
                    style={{ transform: `rotate(${rotation}deg)` }}
                />
            ) : (
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {display}
                </span>
            )}
        </button>
    );
}