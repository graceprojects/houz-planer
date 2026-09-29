import {memo} from 'react';
import {furnitureFaces} from './FurniturePreview';
import {geometryKey,tint,type FurnitureSpec} from './furnitureGeometry';
const Symbol=memo(function Symbol({item,detail=true}:{item:FurnitureSpec;detail?:boolean}){
 const faces=furnitureFaces(item,'plan',detail?'detailed':'simple');
 return <g strokeLinejoin="round" strokeWidth={.012}>{faces.map((face,i)=><polygon key={i} points={face.points.map(p=>p.map(v=>v.toFixed(4)).join(',')).join(' ')} fill={face.color} stroke={tint(face.color,-35)}/>)}{item.kind==='stair'&&<path d={`M ${-item.w*.25} ${item.d*.37} V ${-item.d*.38} H ${item.w*.25} V ${item.d*.37} l ${-item.w*.05} ${-item.d*.08} m ${item.w*.05} ${item.d*.08} l ${item.w*.05} ${-item.d*.08}`} fill="none" stroke="#486356" strokeWidth={.03}/>}</g>;
},(a,b)=>a.detail===b.detail&&geometryKey(a.item)===geometryKey(b.item));
export default Symbol;
