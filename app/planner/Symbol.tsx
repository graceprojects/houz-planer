import type {Furniture} from './model';
export default function Symbol({item}:{item:Pick<Furniture,'kind'|'w'|'d'|'color'>}){
 const {kind,w,d,color}=item;const st={stroke:'#566664',strokeWidth:.025,fill:color};
 const box=(x:number,y:number,a:number,b:number,r=.04)=><rect x={x} y={y} width={a} height={b} rx={r} {...st}/>;
 const base=box(-w/2,-d/2,w,d);
 if(kind==='round'||kind==='stool')return <ellipse rx={w/2} ry={d/2} {...st}/>;
 if(kind==='rug')return <rect x={-w/2} y={-d/2} width={w} height={d} rx={.12} fill={color} stroke="#c4bda9" strokeWidth={.015} strokeDasharray=".08 .05"/>;
 if(kind==='plant')return <g><circle r={Math.min(w,d)*.38} fill="#cbd6c7" stroke="#6b8774" strokeWidth={.025}/>{[0,60,120,180,240,300].map(a=><ellipse key={a} cx={w*.16} rx={w*.27} ry={d*.13} transform={`rotate(${a})`} fill={color} stroke="#53745c" strokeWidth={.02}/>)}</g>;
 if(kind==='chair'||kind==='armchair')return <g>{base}{box(-w*.46,-d*.46,w*.92,d*.22)}{kind==='armchair'&&<>{box(-w/2,-d*.3,w*.14,d*.8)}{box(w*.36,-d*.3,w*.14,d*.8)}</>}</g>;
 if(kind==='sofa')return <g>{base}{box(-w*.45,-d*.43,w*.9,d*.18)}{box(-w*.49,-d*.23,w*.08,d*.68)}{box(w*.41,-d*.23,w*.08,d*.68)}{Array.from({length:w>2?3:2},(_,i)=><line key={i} x1={-w*.4+i*w*.8/(w>2?3:2)} x2={-w*.4+i*w*.8/(w>2?3:2)} y1={-d*.23} y2={d*.42} stroke="#768a81" strokeWidth={.02}/>)}</g>;
 if(kind==='desk')return <g>{base}<rect x={-w*.15} y={-d*.3} width={w*.3} height={d*.15} rx={.025} fill="#617d80"/><rect x={-w*.13} y={-.015} width={w*.26} height={.11} fill="#f5f4ee" stroke="#96a5a3" strokeWidth={.015}/></g>;
 if(kind==='model')return <g>{base}<rect x={-w*.44} y={-d*.4} width={w*.88} height={d*.8} fill="#c4d7c6" stroke="#819a8b" strokeWidth={.02}/>{[0,1,2,3].map(i=><rect key={i} x={-w*.36+i*w*.2} y={-d*.28+(i%2)*d*.18} width={w*.13} height={d*.5} fill="#fffef9" stroke="#91a895" strokeWidth={.015}/>)}</g>;
 if(kind==='reception')return <g>{base}<rect x={-w*.44} y={-d*.34} width={w*.88} height={d*.26} fill="#f0f4ed" stroke="#7a9e93" strokeWidth={.018}/></g>;
 if(kind==='wc')return <g><ellipse cx={0} cy={d*.11} rx={w*.45} ry={d*.35} {...st}/>{box(-w/2,-d/2,w,d*.28)}<ellipse cx={0} cy={d*.12} rx={w*.29} ry={d*.21} fill="#fff" stroke="#a2b4b7" strokeWidth={.015}/></g>;
 if(kind==='sink')return <g>{base}<ellipse rx={w*.31} ry={d*.3} fill="#fbfcfc" stroke="#8ca7b1" strokeWidth={.025}/><circle cy={-d*.37} r={.035} fill="#708788"/></g>;
 if(kind==='stair')return <g>{base}<line x1={0} x2={0} y1={-d*.22} y2={d*.5} stroke="#637774" strokeWidth={.035}/>{Array.from({length:10},(_,i)=><line key={i} x1={-w/2} x2={w/2} y1={-d*.2+i*d*.07} y2={-d*.2+i*d*.07} stroke="#81918e" strokeWidth={.02}/>)}<path d={`M ${-w*.25} ${d*.37} V ${-d*.38} H ${w*.25} V ${d*.37}`} fill="none" stroke="#4f6f68" strokeWidth={.035}/><path d={`M ${w*.19} ${d*.27} L ${w*.25} ${d*.37} L ${w*.31} ${d*.27}`} fill="none" stroke="#4f6f68" strokeWidth={.035}/></g>;
 if(kind==='kitchen')return <g>{base}{Array.from({length:Math.max(1,Math.round(w/.6))},(_,i)=><line key={i} x1={-w/2+i*.6} x2={-w/2+i*.6} y1={-d/2} y2={d/2} stroke="#7c9490" strokeWidth={.02}/>)}<rect x={-w*.4} y={-d*.3} width={Math.min(.5,w*.3)} height={d*.6} rx={.07} fill="#edf4f2" stroke="#829c98" strokeWidth={.02}/></g>;
 if(kind==='cabinet'||kind==='fridge'||kind==='safe')return <g>{base}<line x1={-w*.35} x2={w*.35} y1={d*.25} y2={d*.25} stroke="#627976" strokeWidth={.025}/></g>;
 return <g>{base}</g>;
}
