export type NavigationMode = 'magic' | 'mouse';
export type Viewport = {x:number;y:number;w:number;h:number};
export type WheelInput = {deltaX:number;deltaY:number;deltaMode:number;ctrlKey:boolean;metaKey:boolean;altKey:boolean;shiftKey:boolean};
export function zoomAt(v:Viewport,factor:number,q:{x:number;y:number}):Viewport {
 const w=Math.min(240,Math.max(2,v.w/factor)),ratio=w/v.w;
 return {x:q.x-(q.x-v.x)*ratio,y:q.y-(q.y-v.y)*ratio,w,h:v.h*ratio};
}
export function panBy(v:Viewport,dx:number,dy:number,pixels:{w:number;h:number}):Viewport {
 return {...v,x:v.x-dx*v.w/pixels.w,y:v.y-dy*v.h/pixels.h};
}
export function wheelAction(e:WheelInput,mode:NavigationMode){
 const multiplier=e.deltaMode===1?16:e.deltaMode===2?500:1;
 const zoom=e.ctrlKey||e.metaKey||e.altKey||mode==='mouse';
 if(zoom)return {type:'zoom' as const,factor:Math.exp(Math.max(-.2,Math.min(.2,-e.deltaY*multiplier*(e.ctrlKey?.008:.003))))};
 return {type:'pan' as const,dx:-(e.shiftKey&&!e.deltaX?e.deltaY:e.deltaX)*multiplier,dy:-(e.shiftKey&&!e.deltaX?0:e.deltaY)*multiplier};
}
export function blocksCanvasKeys(target:EventTarget|null){
 return target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"],[role="combobox"],[role="menu"]');
}
