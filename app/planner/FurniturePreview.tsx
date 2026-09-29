import {memo,useMemo} from 'react';
import {furnitureParts,tint,geometryKey,type Part,type FurnitureSpec} from './furnitureGeometry';
type V=[number,number,number];
type Face={points:number[][];depth:number;color:string;surface:Part['surface']};
function rotate(v:V,p:Part):V{
 let [x,y,z]=v;const a=p.rx||0,b=p.ry||0,c=p.rz||0;
 [x,y]=[x*Math.cos(c)-y*Math.sin(c),x*Math.sin(c)+y*Math.cos(c)];
 [x,z]=[x*Math.cos(b)+z*Math.sin(b),-x*Math.sin(b)+z*Math.cos(b)];
 [y,z]=[y*Math.cos(a)-z*Math.sin(a),y*Math.sin(a)+z*Math.cos(a)];
 return [x+p.x,y+p.y,z+p.z];
}
const project=([x,y,z]:V)=>[(x-z)*.866,(x+z)*.46-y];
function hull(points:number[][]){
 const p=points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(o:number[],a:number[],b:number[])=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const half=(a:number[][])=>{const h:number[][]=[];for(const q of a){while(h.length>1&&cross(h[h.length-2],h[h.length-1],q)<=0)h.pop();h.push(q)}return h};
 return [...half(p).slice(0,-1),...half([...p].reverse()).slice(0,-1)];
}
function facesForPart(p:Part,view:"iso"|"plan"="iso"):Face[]{
 const projection=view==='plan'?([x,,z]:V)=>[x,z]:project;
 const {w,h,d}=p,faces:Face[]=[];
 const face=(vertices:V[])=>{
  const v=vertices.map(v=>rotate(v,p)),a=v[0],b=v[1],c=v[2];
  const u=b.map((n,i)=>n-a[i]),t=c.map((n,i)=>n-a[i]);const normal=[u[1]*t[2]-u[2]*t[1],u[2]*t[0]-u[0]*t[2],u[0]*t[1]-u[1]*t[0]],length=Math.hypot(...normal)||1;
  const [nx,ny,nz]=normal.map(n=>n/length);if((view==='plan'?ny:nx+ny*1.4+nz)<.001)return;
  faces.push({points:v.map(projection),depth:v.reduce((s,[x,y,z])=>s+(view==='plan'?y:x+y*1.4+z),0)/v.length,color:tint(p.color,Math.round(ny*22-nx*20-nz*4)),surface:p.surface});
 };
 if(p.shape==='ellipsoid'){
  const points:V[]=[];for(let j=0;j<=6;j++)for(let i=0;i<12;i++){const a=j*Math.PI/6,b=i*Math.PI/6;points.push(rotate([Math.sin(a)*Math.cos(b)*w/2,Math.cos(a)*h/2,Math.sin(a)*Math.sin(b)*d/2],p))}
  return [{points:hull(points.map(projection)),depth:view==='plan'?p.y:p.x+p.y*1.4+p.z,color:p.color,surface:p.surface}];
 }
 if(p.shape==='box'){
  const v:V[]=[[-w/2,-h/2,-d/2],[w/2,-h/2,-d/2],[w/2,-h/2,d/2],[-w/2,-h/2,d/2],[-w/2,h/2,-d/2],[w/2,h/2,-d/2],[w/2,h/2,d/2],[-w/2,h/2,d/2]];
  for(const indices of[[4,7,6,5],[3,2,6,7],[1,5,6,2],[0,4,5,1],[0,3,7,4],[0,1,2,3]])face(indices.map(i=>v[i]));
 }else{
  const ring:V[]=[];
  if(p.shape==='cylinder')for(let i=0;i<16;i++){const a=i*Math.PI/8;ring.push([Math.cos(a)*w/2,0,Math.sin(a)*d/2])}
  else{const r=Math.min(p.radius||.04,w*.20,d*.20);for(let k=0;k<4;k++){const a=k*Math.PI/2,cx=(k===0||k===3?1:-1)*(w/2-r),cz=(k<2?1:-1)*(d/2-r);for(let i=0;i<4;i++){const t=a+i*Math.PI/6;ring.push([cx+Math.cos(t)*r,0,cz+Math.sin(t)*r])}}}
  const top=ring.map(([x,,z])=>[x,h/2,z] as V),bottom=ring.map(([x,,z])=>[x,-h/2,z] as V);
  face([...top].reverse());for(let i=0;i<ring.length;i++){const j=(i+1)%ring.length;face([bottom[i],top[i],top[j],bottom[j]])}
 }
 return faces;
}
const faceCache=new Map<string,Face[]>();
export function furnitureFaces(item:FurnitureSpec,view:'iso'|'plan',quality:'detailed'|'simple'='detailed'){
 const key=geometryKey(item,quality)+'|'+view;const found=faceCache.get(key);if(found)return found;
 const faces=furnitureParts(item,quality).flatMap(p=>facesForPart(p,view)).sort((a,b)=>a.depth-b.depth);
 if(faceCache.size>=256)faceCache.delete(faceCache.keys().next().value!);faceCache.set(key,faces);return faces;
}
export const FurniturePreview=memo(function FurniturePreview({item}:{item:FurnitureSpec}){
 const data=useMemo(()=>{const faces=furnitureFaces(item,'iso'),points=faces.flatMap(f=>f.points),xs=points.map(v=>v[0]),ys=points.map(v=>v[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),pad=Math.max(right-left,bottom-top)*.1;return {faces,left,right,top,bottom,pad}},[item]);
 const {left,right,top,bottom,pad}=data;
 return <svg className="iso-preview detailed-furniture-preview" viewBox={`${left-pad} ${top-pad} ${right-left+pad*2} ${bottom-top+pad*2}`} aria-hidden="true"><ellipse cx={(left+right)/2} cy={bottom-pad*.55} rx={(right-left)*.37} ry={pad*.48} fill="#2a4436" opacity={.11}/><g strokeLinejoin="round" strokeWidth={Math.max(right-left,bottom-top)*.0015}>{data.faces.map((f,i)=><polygon key={i} points={f.points.map(p=>p.map(v=>v.toFixed(4)).join(',')).join(' ')} fill={f.color} stroke={tint(f.color,-8)} opacity={f.surface==='glass'?.86:1}/>)}</g></svg>;
});
