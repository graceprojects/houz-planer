import type {OpeningPreset,WallPreset} from './presets';
type Part={x:number;y:number;z:number;w:number;d:number;h:number;color:string;glass?:boolean};
const project=(x:number,y:number,z:number)=>[(x-y)*.866,(x+y)*.5-z];
const shade=(hex:string,n:number)=>'#'+hex.replace('#','').match(/../g)!.map(c=>Math.max(0,Math.min(255,parseInt(c,16)+n)).toString(16).padStart(2,'0')).join('');
function IsoScene({parts}:{parts:Part[]}){
 const points=parts.flatMap(p=>[0,p.w].flatMap(x=>[0,p.d].flatMap(y=>[0,p.h].map(z=>project(p.x+x,p.y+y,p.z+z)))));
 const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
 const extent=Math.max(maxX-minX,maxY-minY),pad=extent*.14;
 const polygon=(pts:number[][])=>pts.map(p=>p.join(',')).join(' ');
 return <svg className="iso-preview" viewBox={`${minX-pad} ${minY-pad} ${maxX-minX+2*pad} ${maxY-minY+2*pad}`} aria-hidden="true"><g strokeLinejoin="round" strokeWidth={extent*.004}>
 {parts.map((p,i)=>{const {x,y,z,w,d,h,color}=p;const a=project(x,y,z+h),b=project(x+w,y,z+h),c=project(x+w,y+d,z+h),e=project(x,y+d,z+h),bb=project(x+w,y,z),cc=project(x+w,y+d,z),ee=project(x,y+d,z);return <g key={i} stroke={shade(color,-28)} opacity={p.glass?.74:1}><polygon points={polygon([b,c,cc,bb])} fill={shade(color,-23)}/><polygon points={polygon([e,c,cc,ee])} fill={shade(color,-5)}/><polygon points={polygon([a,b,c,e])} fill={shade(color,18)}/>{p.glass&&<path d={`M ${b[0]} ${b[1]} L ${cc[0]} ${cc[1]}`} stroke="#fff" strokeWidth={extent*.008} opacity={.65}/>}</g>})}
 </g></svg>;
}
export {FurniturePreview as IsoFurniture} from './FurniturePreview';
export function IsoStructure({wall,opening}:{wall?:WallPreset;opening?:OpeningPreset}){
 if(wall)return <IsoScene parts={[{x:0,y:0,z:0,w:2.6,d:.6,h:.08,color:'#e1e8e5'},{x:0,y:.1,z:.08,w:2.6,d:wall.thickness*1.5,h:Math.min(wall.height,3.5),color:wall.kind==='glass'?'#b1d3db':'#d8dedb',glass:wall.kind==='glass'}]}/>;
 const o=opening!;const w=o.width,h=o.height,parts:Part[]=[{x:0,y:0,z:0,w:w+.18,d:.35,h:.07,color:'#e1e8e5'}];
 const frame='#7b918d',col=o.material==='glass'?'#b4d4df':'#d4bda1';
 parts.push({x:0,y:.12,z:0,w:.07,d:.12,h:h+.07,color:frame},{x:w+.07,y:.12,z:0,w:.07,d:.12,h:h+.07,color:frame},{x:0,y:.12,z:h,w:w+.14,d:.12,h:.07,color:frame});
 if(o.kind!=='opening'){
  const n=o.kind==='window'?o.panels:o.style==='single'?1:2;
  for(let i=0;i<n;i++)parts.push({x:.08+i*w/n,y:o.style==='sliding'?.16+(i%2)*.06:.15,z:.06,w:w/n-.025,d:.045,h:h-.09,color:col,glass:o.material==='glass'});
  for(let i=1;i<n;i++)parts.push({x:.07+i*w/n,y:.16,z:.07,w:.025,d:.08,h:h-.08,color:frame});
  if(o.kind==='door'&&o.style!=='sliding')parts.push({x:o.style==='double'?w*.48:w*.8,y:.23,z:h*.45,w:.07,d:.035,h:.035,color:'#526c68'});
 }
 return <IsoScene parts={parts}/>;
}
