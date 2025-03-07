'use client'

import { useEffect } from "react"

export default function Square({ prop, onClickFunction }) {
    var display = prop

    useEffect(() => {
        if(prop == "" || prop == undefined){
            display = "00"
        }
        else{
            display = prop
        }

    },[prop])

    return (
        <button  onClick={onClickFunction} className="square">-{prop}</button>
    )}