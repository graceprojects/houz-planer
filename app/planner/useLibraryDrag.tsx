'use client';
import {useEffect,useRef,useState} from 'react';
import type {OpeningPreset} from './presets';
export type LibraryDrop={itemId?:string;opening?:OpeningPreset};
export type ClientPoint={clientX:number;clientY:number};
export function useLibraryDrag(onStart:()=>void,onDrop:(payload:LibraryDrop,p:ClientPoint)=>void){
 const current=useRef<{x:number;y:number;payload:LibraryDrop;label:string;moving:boolean}|null>(null);
 const suppressClick=useRef(false),[ghost,setGhost]=useState<{x:number;y:number;label:string}|null>(null);
 useEffect(()=>{const reset=()=>{if(current.current?.moving)suppressClick.current=true;current.current=null;setGhost(null)};const cancel=(e:KeyboardEvent)=>{if(e.key==='Escape')reset()};window.addEventListener('keydown',cancel);window.addEventListener('blur',reset);return()=>{window.removeEventListener('keydown',cancel);window.removeEventListener('blur',reset)}},[]);
 const handlers=(payload:LibraryDrop,label:string)=>({
  draggable:false,
  onPointerDown:(e:React.PointerEvent<HTMLButtonElement>)=>{if(e.button!==0)return;suppressClick.current=false;current.current={x:e.clientX,y:e.clientY,payload,label,moving:false};e.currentTarget.setPointerCapture(e.pointerId)},
  onPointerMove:(e:React.PointerEvent<HTMLButtonElement>)=>{const d=current.current;if(!d||Math.hypot(e.clientX-d.x,e.clientY-d.y)<6&&!d.moving)return;e.preventDefault();if(!d.moving){d.moving=true;onStart()}setGhost({x:e.clientX,y:e.clientY,label:d.label})},
  onPointerUp:(e:React.PointerEvent<HTMLButtonElement>)=>{const d=current.current;current.current=null;setGhost(null);if(d?.moving){e.preventDefault();suppressClick.current=true;onDrop(d.payload,{clientX:e.clientX,clientY:e.clientY})}},
  onPointerCancel:()=>{current.current=null;setGhost(null)},
 });
 const activate=(fn:()=>void)=>{if(suppressClick.current){suppressClick.current=false;return}fn()};
 return {handlers,activate,ghost:ghost?<div className="library-drag-ghost" style={{left:ghost.x+15,top:ghost.y+15}}>{ghost.label}<small>Отпустите на плане</small></div>:null};
}
