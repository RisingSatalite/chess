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
    WG: "/WhiteGoldGeneral.png",
    BG: "/BlackGoldGeneral.png",

    WDR: "/WhiteRook.png",
    WDB: "/WhiteBishop.png",
    WGS: "/WhiteGoldGeneral.png",
    WGL: "/WhiteGoldGeneral.png",
    WGN: "/WhiteGoldGeneral.png",
    WGP: "/WhiteGoldGeneral.png",

    BDR: "/BlackRook.png",
    BDB: "/BlackBishop.png",
    BGS: "/BlackGoldGeneral.png",
    BGL: "/BlackGoldGeneral.png",
    BGN: "/BlackGoldGeneral.png",
    BGP: "/BlackGoldGeneral.png",
};

const overlayPieceImage = {
    WDB: "/WhiteBishop.png",
    WDR: "/WhiteRook.png",
    BDB: "/BlackBishop.png",
    BDR: "/BlackRook.png",

    WGN: "/WhiteKnight.png",
    WGP: "/WhitePawn.png",
    BGN: "/BlackKnight.png",
    BGP: "/BlackPawn.png",
    WGS: "/WhitePawn.png",
    BGS: "/BlackPawn.png",
    WGL: "/WhiteLancer.png",
    BGL: "/BlackLancer.png",
}

export default function Square({ prop, onClickFunction, onDragStart, onDragOver, onDrop, number = 0, selected = -1, row=0, lastMove = null, dataTestId = null }) {
    const [imageError, setImageError] = useState(false);

    let bgColor;
    let textColour;
    let display = prop

    if(display == ""){
        display = "-"
    }

    const imageSrc = pieceImages[display];
    const overlay = overlayPieceImage[display];

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
                <div>
                <Image
                    src={imageSrc}
                    alt={display}
                    width={pieceWidth}
                    height={pieceHeight}
                    onError={() => setImageError(true)}
                    className="transition-transform"
                    style={{ transform: `rotate(${rotation}deg)` }}
                />
                {overlay && !imageError ? (
                    <Image
                        src={overlay}
                        alt={display}
                        width={pieceWidth/2}
                        height={pieceHeight/2}
                        onError={() => setImageError(true)}
                        className="transition-transform"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    />
                ):(<div/>)}
                </div>
            ) : (
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {display}
                </span>
            )}
        </button>
    );
}