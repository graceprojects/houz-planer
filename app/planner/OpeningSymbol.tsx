import type {Opening} from './model';
export default function OpeningSymbol({o,width}:{o:Opening;width:number}){
 const stroke=o.material==='glass'?'#6599a7':'#69877f';
 if(o.kind==='opening')return null;
 if(o.kind==='window')return <g stroke="#5897ad" strokeWidth={.035}><line x1={0} y1={-.04} x2={width} y2={-.04}/><line x1={0} y1={.04} x2={width} y2={.04}/>{Array.from({length:Math.max(0,(o.panels||2)-1)},(_,i)=><line key={i} x1={width*(i+1)/(o.panels||2)} x2={width*(i+1)/(o.panels||2)} y1={-.06} y2={.06}/>)}</g>;
 if(o.style==='sliding')return <g stroke={stroke} strokeWidth={.04} fill="none"><path d={`M 0 -.06 H ${width*.55} M ${width*.45} .04 H ${width}`}/><path d={`M ${width*.3} -.2 H ${width*.1} l .1 -.06 M ${width*.7} .2 H ${width*.9} l -.1 -.06`} strokeWidth={.025}/></g>;
 const leaf=(w:number)=><g stroke={stroke} fill="none"><path d={`M 0 0 V ${-w}`} strokeWidth={.03}/><path d={`M ${w} 0 A ${w} ${w} 0 0 0 0 ${-w}`} strokeWidth={.02}/></g>;
 return <g transform={o.flip?'scale(1 -1)':undefined}>{o.style==='double'?<>{leaf(width/2)}<g transform={`translate(${width} 0) scale(-1 1)`}>{leaf(width/2)}</g></>:leaf(width)}</g>;
}
