'use client';
import {useEffect,useState,useRef} from 'react';
import {blocksCanvasKeys} from './navigation';
import {bindSpacePan} from './spacePan';
export function useSpacePan(){
 const [held,setHeld]=useState(false),active=useRef(false);
 useEffect(()=>bindSpacePan(window,document,target=>blocksCanvasKeys(target)||!!document.querySelector('[role="dialog"]'),value=>{active.current=value;setHeld(value)}),[]);
 return {held,active};
}
