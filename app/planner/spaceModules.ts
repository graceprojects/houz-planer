import {clone,makeItem,uid,wallLength,type Project,type Point,type Furniture} from './model';
import type {PlannedSpace} from './programmeTypes';
import {purpose,spaceMode,spaceColor,programmeFor} from './salesOffice';
import {itemBounds,wallRect,type Rect} from './geometry';
const T=.15;
const overlap=(a:Rect,b:Rect)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>.025&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>.025;
export function moduleDimensions(id:string,area:number){const def=purpose(id)!;let w=Math.max(def.minW,Math.round(Math.sqrt(area*1.15)*20)/20),d=area/w;if(d<def.minD){d=def.minD;w=area/d}if(w<def.minW-.01||d<def.minD-.01)throw new Error(`Для готовой расстановки «${def.name}» нужно не менее ${(def.minW*def.minD).toFixed(1)} м².`);return {w:Math.round(w*1000)/1000,d:Math.round(d*1000)/1000}}
const envelope=(z:PlannedSpace):Rect=>{const t=z.enclosed?T:0;return {x:z.x-t,y:z.y-t,w:z.w+2*t,h:z.d+2*t}};
export function placementIssue(p:Project,z:PlannedSpace,ignore=z.id){const r=envelope(z),left=(z.level?p.mezzanine.start:0)+p.wallThickness;
 if(z.level&&!p.mezzanine.enabled)return 'На этом этаже нет перекрытия.';
 if(r.x<left-.005||r.y<p.wallThickness-.005||r.x+r.w>p.width-p.wallThickness+.005||r.y+r.h>p.depth-p.wallThickness+.005)return 'Пространство выходит за внутренний контур этажа. Выберите свободное место.';
 if((p.plannedSpaces||[]).some(other=>other.id!==ignore&&other.level===z.level&&overlap(r,envelope(other))))return 'Это место занято другим пространством.';
 if(p.walls.some(w=>w.level===z.level&&w.group!==ignore&&overlap(r,wallRect(w))))return 'Пространство пересекает существующую перегородку.';
 if(p.furniture.some(f=>f.level===z.level&&f.group!==ignore&&overlap(r,itemBounds(f))))return 'Внутри уже стоит мебель. Выберите свободное место или назначьте функцию существующей комнате.';
 return null;
}
export function moduleFurniture(z:PlannedSpace):Furniture[]{const items:Furniture[]=[],w=z.w,d=z.d,id=z.purposeId;
 const add=(catalog:string,x:number,y:number,rotation=0)=>{const f=makeItem(catalog,z.x+x,z.y+y,z.level);f.group=z.id;f.rotation=rotation;const r=itemBounds(f);if(r.x<z.x+.04||r.y<z.y+.04||r.x+r.w>z.x+w-.04||r.y+r.h>z.y+d-.04)return;items.push(f)};
 const desk=(cx=w/2,cy=d*.43)=>{add('desk',cx,cy);add('office-chair',cx,cy-.90);add('guest-chair',cx-.43,cy+.85,180);add('guest-chair',cx+.43,cy+.85,180)};
 if(['sales-office','signing','bank','director'].includes(id)){desk();add('cabinet',w-.66,.30)}
 else if(['support','marketing','call-center'].includes(id)){add('work-bench',w/2,d/2);add('office-chair',w/2,d/2-1.17);add('office-chair',w/2,d/2+1.17,180);add('cabinet',.30,d/2,90)}
 else if(id==='meeting'||id==='vip'){const large=w*d>=17;add(large?'meeting-six':'dining',w/2,d/2);for(const x of large?[-.8,0,.8]:[-.42,.42]){add('guest-chair',w/2+x,d/2-.98);add('guest-chair',w/2+x,d/2+.98,180)}add('screen',w/2,.18,180)}
 else if(id==='reception'){add('reception',w/2,d/2+.35);add('office-chair',w/2,d/2-.66)}
 else if(id==='waiting'){add('sofa-three',w/2,.60);add('sofa-three',w/2,d-.6,180);add('coffee-table',w/2,d/2);add('plant',w-.4,d/2)}
 else if(id==='coffee'){add('bar',w/2,.40);for(const x of [-.85,0,.85])add('bar-stool',w/2+x,d-.36)}
 else if(id==='kids'){if(w>=3.1&&d>=2.1)add('rug',w/2,d/2);add('kids-table',w/2,d/2);for(const [x,y]of[[-.72,0],[.72,0],[0,.72]])add('kids-chair',w/2+x,d/2+y);add('toy-storage',w/2,.26)}
 else if(id==='model'){add('model',w/2,d/2);add('screen',w/2,.18,180)}
 else if(id==='digital'){add('screen',w/2,.18,180);add('sofa-two',w/2,d-.6,180)}
 else if(id==='materials')add('sample',w/2,.3);
 else if(id==='staff-kitchen'){add('kitchen',1.28,.36);add('fridge',w-.38,.4);add('dining',w/2,d/2+.3);add('guest-chair',w/2-.4,d/2+1.04,180);add('guest-chair',w/2+.4,d/2+1.04,180)}
 else if(id==='guest-wc'||id==='staff-wc'){add('wc',w-.48,.49);add('basin',.45,d/2,90)}
 else if(id==='cleaning'){add('cleaning',w-.47,.39);add('sink',.38,d/2)}
 else if(id==='coffee-support'){add('sink',.38,.4);add('cabinet',w-.67,.3)}
 else if(id!=='entry'){add('cabinet',w/2,.3);if(d>2.5)add('cabinet',w/2,d-.3,180)}
 return items;
}
export function insertSpace(p:Project,purposeId:string,center:Point,level:number){const def=purpose(purposeId);if(!def)throw new Error('Неизвестный тип пространства.');const programme=programmeFor(p),row=programme.items.find(r=>r.purposeId===purposeId),area=row?.unitArea||def.areas[[200,400,600].indexOf(programme.format)]||12,{w,d}=moduleDimensions(purposeId,area),id=uid();const count=(p.plannedSpaces||[]).filter(z=>z.purposeId===purposeId).length;
 const z:PlannedSpace={id,purposeId,name:def.name+(count?' '+(count+1):''),x:Math.round((center.x-w/2)*20)/20,y:Math.round((center.y-d/2)*20)/20,w,d,level,color:spaceColor(purposeId),enclosed:spaceMode(purposeId,programme.format)==='room'};
 const problem=placementIssue(p,z);if(problem)throw new Error(problem);const q=clone(p),furniture=moduleFurniture(z);if(q.furniture.length+furniture.length>600||(q.plannedSpaces?.length||0)>=60||q.walls.length+(z.enclosed?4:0)>180||q.tags.length+(z.enclosed?1:0)>180||q.openings.length+(z.enclosed?1:0)>240)throw new Error('В проекте достигнут лимит элементов.');q.programme=clone(programme);const pr=q.programme.items.find(r=>r.purposeId===purposeId);if(pr&&!pr.quantity)pr.quantity=1;q.plannedSpaces=[...(q.plannedSpaces||[]),z];q.furniture.push(...furniture);
 if(z.enclosed){const x=z.x-T/2,y=z.y-T/2,ww=w+T,dd=d+T,pts=[{x,y},{x:x+ww,y},{x:x+ww,y:y+dd},{x,y:y+dd}],walls=pts.map((a,i)=>({id:uid(),a,b:pts[(i+1)%4],thickness:T,height:Math.min(3.1,level?p.height-p.mezzanine.height:p.height),kind:'wall' as const,level,group:id}));q.walls.push(...walls);q.openings.push({id:uid(),wallId:walls[2].id,offset:ww-1.2,width:.9,height:Math.min(2.2,walls[2].height),sill:0,kind:'door',flip:false});q.tags.push({id,x:z.x+w/2,y:z.y+d/2,name:z.name,color:z.color,level,notes:def.note,purposeId});}
 return {project:q,space:z};
}
export function transformSpace(p:Project,id:string,r:{x:number;y:number;w:number;d:number}){const old=p.plannedSpaces?.find(z=>z.id===id);if(!old)throw new Error('Пространство не найдено.');const spec=purpose(old.purposeId)!,z={...old,...r};if(!Object.values(r).every(Number.isFinite)||z.w<spec.minW-.01||z.d<spec.minD-.01)throw new Error(`Минимальный габарит этой заготовки: ${spec.minW} × ${spec.minD} м.`);if(z.w>50||z.d>50)throw new Error('Габарит пространства не должен превышать 50 м.');if(p.furniture.some(f=>f.group===id&&f.locked))throw new Error('В пространстве есть закреплённая мебель. Сначала снимите закрепление.');const problem=placementIssue(p,z);if(problem)throw new Error(problem);const q=clone(p),sx=z.w/old.w,sy=z.d/old.d;
 const pt=(a:Point)=>({x:z.x+(a.x-old.x)*sx,y:z.y+(a.y-old.y)*sy});
 q.plannedSpaces=q.plannedSpaces!.map(a=>a.id===id?z:a);
 for(const f of q.furniture.filter(f=>f.group===id)){Object.assign(f,pt(f));const b=itemBounds(f);if(b.x<z.x||b.y<z.y||b.x+b.w>z.x+z.w||b.y+b.h>z.y+z.d)throw new Error('Мебель не помещается в новом габарите. Увеличьте пространство или сначала измените расстановку.');}
 for(const wall of q.walls.filter(w=>w.group===id)){
  // Clear dimensions remain exact: the wall centre is always half its thickness outside the zone.
  const coordinate=(v:number,axis:'x'|'y')=>{const start=old[axis],end=start+(axis==='x'?old.w:old.d),next=z[axis],len=axis==='x'?z.w:z.d;if(Math.abs(v-(start-T/2))<.01)return next-T/2;if(Math.abs(v-(end+T/2))<.01)return next+len+T/2;return next+(v-start)*(axis==='x'?sx:sy)};
  const prev=wallLength(wall);for(const a of[wall.a,wall.b]){a.x=coordinate(a.x,'x');a.y=coordinate(a.y,'y')};const next=wallLength(wall);for(const o of q.openings.filter(o=>o.wallId===wall.id)){if(next<o.width+.1)throw new Error('Дверь не помещается в новую стену.');o.offset=Math.max(.02,Math.min(next-o.width-.02,o.offset*next/prev));}
 }
 for(const t of q.tags.filter(t=>t.id===id))Object.assign(t,{x:z.x+z.w/2,y:z.y+z.d/2});return q;
}
export function removeSpace(p:Project,id:string,keepContents=false){const q=clone(p),wallIds=new Set(q.walls.filter(w=>w.group===id).map(w=>w.id));if(!keepContents&&q.furniture.some(f=>f.group===id&&f.locked))throw new Error('В пространстве есть закреплённая мебель.');q.plannedSpaces=q.plannedSpaces?.filter(z=>z.id!==id);
 if(keepContents){q.walls.forEach(w=>{if(w.group===id)delete w.group});q.furniture.forEach(f=>{if(f.group===id)delete f.group})}else{q.walls=q.walls.filter(w=>!wallIds.has(w.id));q.openings=q.openings.filter(o=>!wallIds.has(o.wallId));q.furniture=q.furniture.filter(f=>f.group!==id);q.tags=q.tags.filter(t=>t.id!==id)}return q;
}
