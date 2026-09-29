import {Project,Wall,Point,RoomTag,Furniture,shell,clone,wallLength} from './model';
export type Rect={x:number;y:number;w:number;h:number};
export type Space={id:string;name:string;color:string;area:number;rects:Rect[];bounds:Rect;label:Point;tag?:RoomTag;level:number};
const EPS=1e-6;
export const inside=(q:Point,r:Rect)=>q.x>=r.x-EPS&&q.x<=r.x+r.w+EPS&&q.y>=r.y-EPS&&q.y<=r.y+r.h+EPS;
export function wallRect(w:Wall):Rect{const t=w.thickness/2;return {x:Math.min(w.a.x,w.b.x)-t,y:Math.min(w.a.y,w.b.y)-t,w:Math.abs(w.a.x-w.b.x)+2*t,h:Math.abs(w.a.y-w.b.y)+2*t};}
export function spaces(p:Project,level:number):Space[]{
 if(level&&!p.mezzanine.enabled)return [];
 const t=p.wallThickness,x0=level?p.mezzanine.start+t:t,y0=t,x1=p.width-t,y1=p.depth-t;
 if(x1<=x0||y1<=y0)return [];
 const walls=p.walls.filter(w=>w.level===level).map(wallRect);
 // Stair footprints are holes in the upper slab; each footprint is deducted once.
 if(level){for(const f of p.furniture.filter(f=>f.level===1&&f.kind==='stair')){const swap=Math.abs(Math.sin(f.rotation*Math.PI/180))>.7;const w=swap?f.d:f.w,h=swap?f.w:f.d;walls.push({x:f.x-w/2,y:f.y-h/2,w,h});}}
 const xs=[x0,x1],ys=[y0,y1];
 for(const r of walls){xs.push(Math.max(x0,Math.min(x1,r.x)),Math.max(x0,Math.min(x1,r.x+r.w)));ys.push(Math.max(y0,Math.min(y1,r.y)),Math.max(y0,Math.min(y1,r.y+r.h)));}
 const unique=(a:number[])=>[...new Set(a.map(n=>Math.round(n*100000)/100000))].sort((a,b)=>a-b);
 const xx=unique(xs),yy=unique(ys),nx=xx.length-1,ny=yy.length-1,grid=new Int32Array(nx*ny);grid.fill(-1);
 const xm=new Map(xx.map((v,i)=>[v,i])),ym=new Map(yy.map((v,i)=>[v,i]));
 for(const r of walls){const xA=Math.round(Math.max(x0,Math.min(x1,r.x))*100000)/100000,xB=Math.round(Math.max(x0,Math.min(x1,r.x+r.w))*100000)/100000,yA=Math.round(Math.max(y0,Math.min(y1,r.y))*100000)/100000,yB=Math.round(Math.max(y0,Math.min(y1,r.y+r.h))*100000)/100000;for(let y=ym.get(yA)!;y<ym.get(yB)!;y++)for(let x=xm.get(xA)!;x<xm.get(xB)!;x++)grid[y*nx+x]=-2;}
 const regions:number[][]=[];
 for(let i=0;i<grid.length;i++){if(grid[i]!==-1)continue;const id=regions.length,q=[i];grid[i]=id;for(let j=0;j<q.length;j++){const k=q[j],x=k%nx,y=Math.floor(k/nx);for(const n of[x>0?k-1:-1,x<nx-1?k+1:-1,y>0?k-nx:-1,y<ny-1?k+nx:-1])if(n>=0&&grid[n]===-1){grid[n]=id;q.push(n)}}regions.push(q);}
 return regions.map((cells,idx)=>{const rects:Rect[]=[];let area=0,bx=Infinity,by=Infinity,ex=-Infinity,ey=-Infinity;
 for(let y=0;y<ny;y++){let start=-1;for(let x=0;x<=nx;x++){const hit=x<nx&&grid[y*nx+x]===idx;if(hit&&start<0)start=x;if(!hit&&start>=0){const r={x:xx[start],y:yy[y],w:xx[x]-xx[start],h:yy[y+1]-yy[y]};rects.push(r);area+=r.w*r.h;bx=Math.min(bx,r.x);by=Math.min(by,r.y);ex=Math.max(ex,r.x+r.w);ey=Math.max(ey,r.y+r.h);start=-1;}}}
 const tag=p.tags.find(t=>t.level===level&&rects.some(r=>inside(t,r)));const bounds={x:bx,y:by,w:ex-bx,h:ey-by};
 let label={x:bx+(ex-bx)/2,y:by+.45};if(!rects.some(r=>inside(label,r))){const r=rects.reduce((a,b)=>a.w*a.h>b.w*b.h?a:b);label={x:r.x+r.w/2,y:r.y+r.h/2};}
 return {id:tag?.id??`space-${level}-${idx}`,name:tag?.name??`Помещение ${idx+1}`,color:tag?.color??'#efeee6',area,rects,bounds,label,tag,level};}).filter(s=>s.area>.02);
}
export function moveWall(p:Project,id:string,delta:number):Project{
 const q=clone(p),w=q.walls.find(w=>w.id===id);if(!w)return q;const vertical=Math.abs(w.a.x-w.b.x)<EPS,axis=vertical?'x':'y',other=vertical?'y':'x',old=w.a[axis],lo=Math.min(w.a[other],w.b[other]),hi=Math.max(w.a[other],w.b[other]);
 const next=Math.min((vertical?p.width:p.depth)-.3,Math.max(.3,old+delta));
 for(const wall of q.walls.filter(v=>v.level===w.level)){for(const end of['a','b'] as const){const pt=wall[end];if(Math.abs(pt[axis]-old)<.02&&pt[other]>=lo-.15&&pt[other]<=hi+.15)pt[axis]=next;}}
 return q;
}
export function resizeBuilding(p:Project,width:number,depth:number):Project{const q=clone(p),sx=width/p.width,sy=depth/p.depth;q.width=width;q.depth=depth;q.mezzanine.start=Math.min(width-2.1,q.mezzanine.start*sx);for(const w of q.walls){w.a.x*=sx;w.b.x*=sx;w.a.y*=sy;w.b.y*=sy;}for(const f of q.furniture){f.x*=sx;f.y*=sy;}for(const t of q.tags){t.x*=sx;t.y*=sy;}for(const o of q.openings){const old=[...shell(p,0),...shell(p,1),...p.walls].find(w=>w.id===o.wallId);const wall=[...shell(q,0),...shell(q,1),...q.walls].find(w=>w.id===o.wallId);if(old&&wall)o.offset*=wallLength(wall)/wallLength(old);}return q;}
export function openingPosition(w:Wall,offset:number){const l=wallLength(w),v={x:(w.b.x-w.a.x)/l,y:(w.b.y-w.a.y)/l};return {x:w.a.x+v.x*offset,y:w.a.y+v.y*offset,angle:Math.atan2(v.y,v.x)*180/Math.PI};}
export function itemBounds(f:Furniture):Rect{const a=f.rotation*Math.PI/180,w=Math.abs(Math.cos(a))*f.w+Math.abs(Math.sin(a))*f.d,h=Math.abs(Math.sin(a))*f.w+Math.abs(Math.cos(a))*f.d;return {x:f.x-w/2,y:f.y-h/2,w,h};}
export function warnings(p:Project,level:number){const items=p.furniture.filter(f=>f.level===level),walls=p.walls.filter(w=>w.level===level).map(wallRect),out:{id:string;text:string}[]=[];const left=level?p.mezzanine.start:0;
 for(const f of items){const b=itemBounds(f);if(b.x<left||b.y<0||b.x+b.w>p.width||b.y+b.h>p.depth)out.push({id:f.id,text:`${f.name}: за границей этажа`});else if(!['rug','stair'].includes(f.kind)&&walls.some(r=>Math.min(b.x+b.w,r.x+r.w)-Math.max(b.x,r.x)>.04&&Math.min(b.y+b.h,r.y+r.h)-Math.max(b.y,r.y)>.04))out.push({id:f.id,text:`${f.name}: пересекает перегородку`});}
 return out;
}
