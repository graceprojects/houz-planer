
'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Project,Wall,shell,wallLength} from './model';
import {spaces} from './geometry';
import {useSpacePan} from './useSpacePan';
import type {NavigationMode} from './navigation';
import {normalizeOpening} from './presets';
import {buildFurnitureBatches,furnitureIdFromHit} from './furnitureMeshes';
import {Switch} from '@/components/ui/switch';
import {RotateCcw,Camera} from 'lucide-react';
export type FurnitureFocus={id:string;request:number}|null;
function clearGroup(group:THREE.Group){
 for(const child of [...group.children]){
  if(child.userData.dispose)child.userData.dispose();
  else child.traverse((o:any)=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach((m:any)=>m.dispose());else o.material?.dispose()});
  group.remove(child);
 }
}
export default function ThreeView({project:p,level,navigationMode,onSelect,focus=null}:{project:Project;level:number;navigationMode:NavigationMode;onSelect:(id:string)=>void;focus?:FurnitureFocus}){
 const space=useSpacePan(),navigation=useRef(navigationMode);navigation.current=navigationMode;
 const host=useRef<HTMLDivElement>(null),runtime=useRef<any>(null),[error,setError]=useState(''),[cut,setCut]=useState(true),[all,setAll]=useState(false),[detail,setDetail]=useState('auto'),[inspectId,setInspectId]=useState<string|null>(null);
 const detailRef=useRef(detail);detailRef.current=detail;
 const selectRef=useRef(onSelect);selectRef.current=onSelect;
 const reset=()=>{const r=runtime.current;if(!r)return;
  const left=level&&!all?p.mezzanine.start:0,width=p.width-left,base=level&&!all?p.mezzanine.height:0,center=new THREE.Vector3(left+width/2,base+.7,p.depth/2),radius=Math.hypot(width,p.depth,p.height)/2,fov=r.camera.fov*Math.PI/180,angle=Math.min(fov,2*Math.atan(Math.tan(fov/2)*r.camera.aspect)),distance=radius/Math.sin(angle/2)*1.08;
  r.camera.position.copy(center).addScaledVector(new THREE.Vector3(.23,.72,1).normalize(),distance);r.controls.target.copy(center);r.controls.maxDistance=Math.max(180,distance*3);r.camera.far=Math.max(500,distance*5);r.camera.updateProjectionMatrix();r.controls.update();r.invalidate();
 };
 const resetRef=useRef(reset);resetRef.current=reset;
 useEffect(()=>{
  const el=host.current;if(!el)return;let r:THREE.WebGLRenderer;
  try{r=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true})}catch{setError('Браузер не смог включить 3D. План и все размеры доступны в режиме 2D.');return}
  r.setPixelRatio(Math.min(devicePixelRatio,1.75));r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.shadowMap.autoUpdate=false;r.setClearColor('#eef1ec');r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.12;el.appendChild(r.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.04,500),controls=new OrbitControls(camera,r.domElement);controls.enableDamping=true;controls.zoomToCursor=true;controls.zoomSpeed=.55;controls.dampingFactor=.12;controls.maxPolarAngle=Math.PI/2.06;controls.minDistance=.7;controls.maxDistance=180;controls.screenSpacePanning=true;
  scene.add(new THREE.HemisphereLight('#ffffff','#9aaa99',2.3));
  const sun=new THREE.DirectionalLight('#fff4e2',2.6);sun.position.set(-10,35,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;scene.add(sun);
  const group=new THREE.Group();scene.add(group);let frame=0,renderCount=0;
  const invalidate=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(draw)};
  const draw=()=>{frame=0;controls.update();const rt=runtime.current;if(!rt)return;
   const pixelsPerMetre=el.clientHeight/(2*camera.position.distanceTo(controls.target)*Math.tan(camera.fov*Math.PI/360));const detailed=detailRef.current==='detailed'||detailRef.current==='auto'&&pixelsPerMetre>19;
   if(rt.detailed){if(rt.detailed.visible!==detailed)r.shadowMap.needsUpdate=true;rt.detailed.visible=detailed;rt.simple.visible=!detailed}
   r.render(scene,camera);el.dataset.renderedFrames=String(++renderCount);el.dataset.drawCalls=String(r.info.render.calls);el.dataset.triangles=String(r.info.render.triangles);el.dataset.furnitureDetail=detailed?'detailed':'simple';
  };
  runtime.current={r,scene,camera,controls,group,invalidate};controls.addEventListener('change',invalidate);
  let sized=false;const resize=()=>{r.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();if(!sized){sized=true;resetRef.current()}invalidate()};const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else invalidate()};document.addEventListener('visibilitychange',visibility);
  const beforeDown=()=>{controls.mouseButtons.LEFT=space.active.current?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE};
  const wheel=(e:WheelEvent)=>{if(navigation.current!=='magic'||e.ctrlKey||e.metaKey||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();const factor=e.deltaMode===1?16:e.deltaMode===2?500:1,dx=(e.shiftKey&&!e.deltaX?e.deltaY:e.deltaX)*factor,dy=(e.shiftKey&&!e.deltaX?0:e.deltaY)*factor,unit=2*camera.position.distanceTo(controls.target)*Math.tan(camera.fov*Math.PI/360)/el.clientHeight;const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrix,1),shift=right.multiplyScalar(dx*unit).add(up.multiplyScalar(-dy*unit));camera.position.add(shift);controls.target.add(shift);controls.update();invalidate()};
  r.domElement.addEventListener('pointerdown',beforeDown,true);r.domElement.addEventListener('wheel',wheel,{capture:true,passive:false});
  let start={x:0,y:0};const down=(e:PointerEvent)=>{start={x:e.clientX,y:e.clientY}},click=(e:PointerEvent)=>{if(space.active.current||e.button!==0||Math.hypot(start.x-e.clientX,start.y-e.clientY)>5)return;const rect=r.domElement.getBoundingClientRect(),mouse=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);const rt=runtime.current,active=rt.detailed?.visible?rt.detailed:rt.simple;if(!active)return;const hit=ray.intersectObjects(active.children,true).find(h=>furnitureIdFromHit(h));if(hit)selectRef.current(furnitureIdFromHit(hit)!)};
  r.domElement.addEventListener('pointerdown',down);r.domElement.addEventListener('pointerup',click);invalidate();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);controls.removeEventListener('change',invalidate);controls.dispose();r.domElement.removeEventListener('pointerdown',beforeDown,true);r.domElement.removeEventListener('pointerdown',down);r.domElement.removeEventListener('pointerup',click);r.domElement.removeEventListener('wheel',wheel,true);clearGroup(group);sun.shadow.dispose();r.dispose();r.domElement.remove();runtime.current=null};
 },[]);
 useEffect(()=>{runtime.current?.invalidate()},[detail]);
 useEffect(()=>{if(inspectId&&!p.furniture.some(f=>f.id===inspectId)){setInspectId(null);resetRef.current()}},[p,inspectId]);
 useEffect(()=>{setInspectId(null);resetRef.current()},[level,all]);
 useEffect(()=>{const rt=runtime.current;if(!rt||!focus)return;const f=p.furniture.find(f=>f.id===focus.id);if(!f)return;setInspectId(f.id);const base=f.level?p.mezzanine.height:0,center=new THREE.Vector3(f.x,base+f.h*.65,f.y),radius=Math.hypot(f.w,f.d,f.h*1.35)/2,angle=Math.min(rt.camera.fov*Math.PI/180,2*Math.atan(Math.tan(rt.camera.fov*Math.PI/360)*rt.camera.aspect)),distance=Math.max(1.1,radius/Math.sin(angle/2)*1.25);rt.controls.target.copy(center);rt.camera.position.copy(center).addScaledVector(new THREE.Vector3(.8,.75,1).normalize(),distance);rt.controls.update();rt.invalidate()},[focus?.request]);
 useEffect(()=>{const rt=runtime.current;if(!rt)return;const root:THREE.Group=rt.group;clearGroup(root);
 const box=(parent:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,color:string,opacity=1)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.01,w),Math.max(.01,h),Math.max(.01,d)),new THREE.MeshStandardMaterial({color,roughness:.78,transparent:opacity<1,opacity,depthWrite:opacity>=1}));mesh.position.set(x,y,z);mesh.castShadow=opacity===1;mesh.receiveShadow=true;parent.add(mesh);return mesh};
 const wall=(w:Wall,base:number)=>{const length=wallLength(w);if(length<.02)return;const height=cut?Math.min(1.2,w.height):w.height,angle=Math.atan2(w.b.y-w.a.y,w.b.x-w.a.x),g=new THREE.Group();g.position.set(w.a.x,base,w.a.y);g.rotation.y=-angle;root.add(g);const ops=p.openings.filter(o=>o.wallId===w.id).map(o=>normalizeOpening(o,w)).sort((a,b)=>a.offset-b.offset),parts=[];let cursor=0;const solid=(a:number,b:number,bottom=0,top=height)=>{if(b-a>.01&&top-bottom>.01)box(g,(a+b)/2,(bottom+top)/2,0,b-a,top-bottom,w.thickness,w.kind==='glass'?'#9cc9d7':'#e2e7de',w.kind==='glass'?.3:1)};for(const o of ops){const a=Math.max(cursor,Math.min(length,o.offset)),b=Math.min(length,a+o.width);solid(cursor,a);const sill=o.kind==='window'?o.sill:0;solid(a,b,0,Math.min(height,sill));solid(a,b,Math.min(height,sill+o.height),height);if(o.kind==='window'&&height>sill){const paneH=Math.min(o.height,height-sill);box(g,(a+b)/2,sill+paneH/2,0,b-a,paneH,.035,'#9ac9db',.3);for(let i=1;i<(o.panels||2);i++)box(g,a+(b-a)*i/(o.panels||2),sill+paneH/2,0,.025,paneH,.08,'#738b92')}
 if(o.kind==='door'){const doorH=Math.min(height,o.height),glass=o.material==='glass',color=glass?'#a5ccd5':'#cbb89b',leaf=(hinge:number,width:number,direction:number)=>{const pivot=new THREE.Group();pivot.position.x=hinge;pivot.rotation.y=(o.flip?-1:1)*direction*Math.PI/2;g.add(pivot);box(pivot,direction*width/2,doorH/2,0,width,doorH,.045,color,glass?.45:1)};if(o.style==='sliding'){box(g,a+(b-a)*.28,doorH/2,-.07,(b-a)*.55,doorH,.04,color,glass?.45:1);box(g,a+(b-a)*.72,doorH/2,.02,(b-a)*.55,doorH,.04,color,glass?.45:1)}else if(o.style==='double'){leaf(a,(b-a)/2,1);leaf(b,(b-a)/2,-1)}else leaf(a,b-a,1)}
 cursor=b;}solid(cursor,length);};

 const inspected=inspectId?p.furniture.find(f=>f.id===inspectId):undefined;
 const levels=inspected?[]:all&&p.mezzanine.enabled?[0,1]:[level];
 const furniture:{item:Project['furniture'][number];base:number}[]=[];
 for(const l of levels){const base=l?p.mezzanine.height:0;const rs=spaces(p,l);for(const room of rs)for(const rect of room.rects)box(root,rect.x+rect.w/2,base-.07,rect.y+rect.h/2,rect.w,.14,rect.h,room.color);for(const z of p.plannedSpaces||[])if(z.level===l&&!z.enclosed)box(root,z.x+z.w/2,base+.005,z.y+z.d/2,z.w,.01,z.d,z.color);for(const w of[...shell(p,l),...p.walls.filter(w=>w.level===l)])wall(w,base);for(const f of p.furniture.filter(f=>f.level===l&&!(all&&l===1&&f.kind==='stair')))furniture.push({item:f,base})}
 if(inspected){const base=inspected.kind==='stair'?0:inspected.level?p.mezzanine.height:0;furniture.push({item:inspected,base});const size=Math.max(inspected.w,inspected.d)*3;box(root,inspected.x,base-.06,inspected.y,size,.1,size,'#e7ece5')}
 rt.detailed=buildFurnitureBatches(furniture,'detailed');rt.simple=buildFurnitureBatches(furniture,'simple');root.add(rt.detailed,rt.simple);rt.simple.visible=false;
 if(!inspected&&(!level||all)){box(root,p.width/2,-.2,p.depth+2,p.width,.08,1.5,'#d2d9d0');const road=new THREE.GridHelper(p.width,Math.round(p.width),'#e2e7df','#e2e7df');road.position.set(p.width/2,-.3,p.depth/2);root.add(road)}
 rt.r.shadowMap.needsUpdate=true;rt.invalidate();
 },[p,level,cut,all,inspectId]);
 return <div className={'three-container'+(space.held?' space-pan':'')}><div ref={host} className="three-host"/>{error&&<div className="three-error">{error}</div>}<div className="three-settings">{!inspectId&&<label><Switch checked={cut} onCheckedChange={setCut}/>Срез стен</label>}{!inspectId&&p.mezzanine.enabled&&<label><Switch checked={all} onCheckedChange={setAll}/>Оба этажа</label>}<label className="detail-picker">Мебель<select aria-label="Детализация мебели" value={detail} onChange={e=>setDetail(e.target.value)}><option value="auto">Авто</option><option value="detailed">Детально</option><option value="simple">Упрощённо</option></select></label>{focus&&p.furniture.some(f=>f.id===focus.id&&f.level===level)&&<button className="inspect-context" onClick={()=>setInspectId(inspectId?null:focus.id)}>{inspectId?'В интерьере':'Только предмет'}</button>}<button className="icon-button" title="Вернуть вид" onClick={()=>{setInspectId(null);reset()}}><RotateCcw size={17}/></button><button className="icon-button" title="Скачать изображение 3D" onClick={()=>{const r=runtime.current;if(!r)return;r.r.render(r.scene,r.camera);const a=document.createElement('a');a.download='HOUZ-PLANER-3D.png';a.href=r.r.domElement.toDataURL('image/png');a.click()}}><Camera size={17}/></button></div><div className="canvas-hint">Тяните: вращение · Пробел + тянуть: перемещение · ⌥ + жест: масштаб</div></div>
}
