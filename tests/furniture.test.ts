import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CATALOG,createDefault,makeItem} from '../app/planner/model';
import {furnitureParts,mainColor,supportsAccessories,geometryKey,FINISHES} from '../app/planner/furnitureGeometry';
import {furnitureFaces} from '../app/planner/FurniturePreview';
import {buildFurnitureBatches,furnitureIdFromHit} from '../app/planner/furnitureMeshes';
import {projectSchema} from '../app/planner/validation';

test('Every catalog object and edited proportion produces finite positive geometry and visible 2D/iso faces',()=>{
 for(const t of CATALOG)for(const factor of [.35,1,3]){
  const f={...t,w:t.w*factor,d:t.d/factor,h:t.h*factor},parts=furnitureParts(f);assert.ok(parts.length>0,t.id);
  for(const part of parts){for(const k of ['x','y','z','w','d','h'] as const)assert.ok(Number.isFinite(part[k]),t.id+' '+k);assert.ok(part.w>0&&part.d>0&&part.h>0);assert.match(part.color,/^#[a-f0-9]{6}$/i)}
  for(const view of ['iso','plan'] as const){const faces=furnitureFaces(f,view);assert.ok(faces.length>0,t.id);assert.ok(faces.every(face=>face.points.length>=3&&face.points.flat().every(Number.isFinite)),t.id)}
 }
});
test('Detailed geometry fits catalog footprints including small hardware tolerance',()=>{
 for(const f of CATALOG){const g=buildFurnitureBatches([{item:makeItem(f.id,0,0),base:0}],'detailed');const b=new THREE.Box3().setFromObject(g);assert.ok(b.min.x>=-f.w*.55-.025&&b.max.x<=f.w*.55+.025,`${f.id} width ${b.min.x}..${b.max.x}`);assert.ok(b.min.z>=-f.d*.55-.025&&b.max.z<=f.d*.55+.025,`${f.id} depth ${b.min.z}..${b.max.z}`);g.userData.dispose()}
});
test('Simple models omit small details; accessories toggle removes only accessories',()=>{
 for(const f of CATALOG){const detailed=furnitureParts(f),simple=furnitureParts(f,'simple');assert.ok(simple.length<=detailed.length);assert.ok(simple.every(p=>!p.detail));if(supportsAccessories(f)){const bare=furnitureParts({...f,accessories:false});assert.ok(bare.length<detailed.length,f.id);assert.ok(!bare.some(p=>p.accessory));assert.deepEqual(bare,detailed.filter(p=>!p.accessory),f.id)}}
});
test('Office and visitor chair silhouettes differ; two-person bench carries two screens',()=>{
 const guest=makeItem('guest-chair',0,0),office=makeItem('office-chair',0,0),bench=makeItem('work-bench',0,0);assert.ok(furnitureParts(office).length>furnitureParts(guest).length*2);assert.equal(furnitureParts(bench).filter(p=>p.accessory&&p.surface==='glass').length,2);
});
test('Finishes and accessory preference survive project round-trip; old files keep colors',()=>{
 const p=createDefault(),before=JSON.stringify(p);assert.equal(projectSchema.parse(p).furniture[0].finish,undefined);
 for(const finish of FINISHES){const f=p.furniture[0];furnitureParts({...f,finish:finish.id});assert.equal(JSON.stringify(p),before);const q=structuredClone(p);q.furniture[0].finish=finish.id;q.furniture[0].accessories=false;const restored=projectSchema.parse(JSON.parse(JSON.stringify(q)));assert.equal(restored.furniture[0].finish,finish.id);assert.equal(restored.furniture[0].accessories,false)}
 assert.equal(mainColor(p.furniture[0]),p.furniture[0].color);
 assert.equal(projectSchema.safeParse({...p,furniture:[{...p.furniture[0],finish:'invalid'}]}).success,false);
});
test('SVG geometry cache ignores position but respects dimensions and finish',()=>{
 const f=makeItem('sofa-two',1,2),other={...f,id:'copy',x:10,y:11,rotation:90};assert.equal(geometryKey(f),geometryKey(other));assert.equal(furnitureFaces(f,'plan'),furnitureFaces(other,'plan'));assert.notEqual(furnitureFaces(f,'plan'),furnitureFaces({...f,w:3},'plan'));assert.notEqual(furnitureFaces(f,'plan'),furnitureFaces({...f,finish:'walnut'},'plan'));
});
test('One hundred repeated chairs share draw calls; picking returns correct instance',()=>{
 const f=makeItem('office-chair',0,0),one=buildFurnitureBatches([{item:f,base:0}],'detailed'),many=buildFurnitureBatches(Array.from({length:100},(_,i)=>({item:{...f,id:'chair'+i,x:i},base:0})),'detailed');assert.equal(many.userData.stats.drawCalls,one.userData.stats.drawCalls);assert.equal(many.userData.stats.parts,100*one.userData.stats.parts);
 const mesh=many.children[0] as THREE.InstancedMesh;assert.equal(furnitureIdFromHit({object:mesh,instanceId:mesh.count-1,distance:1,point:new THREE.Vector3()}),'chair99');one.userData.dispose();many.userData.dispose();
});
test('Disposing batches frees each shared geometry, material, texture and instance buffer once',()=>{
 const group=buildFurnitureBatches([{item:makeItem('desk',0,0),base:0},{item:makeItem('desk',3,0),base:0}],'detailed'),resources=new Set<any>();for(const m of group.children as THREE.InstancedMesh[]){resources.add(m);resources.add(m.geometry);const mat=m.material as THREE.MeshStandardMaterial;resources.add(mat);if(mat.map)resources.add(mat.map)}
 const counts=new Map<any,number>();for(const r of resources)r.addEventListener('dispose',()=>counts.set(r,(counts.get(r)||0)+1));group.userData.dispose();assert.equal(counts.size,resources.size);assert.ok([...counts.values()].every(n=>n===1));
});
test('Complete two-level default office stays within lightweight furniture budget',()=>{
 const p=createDefault(),start=performance.now(),group=buildFurnitureBatches(p.furniture.map(item=>({item,base:item.level?p.mezzanine.height:0})),'detailed');let triangles=0;for(const m of group.children as THREE.InstancedMesh[])triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3*m.count;
 console.log('Furniture budget', {...group.userData.stats,triangles,buildMs:Math.round(performance.now()-start)});assert.ok(triangles<350000);assert.ok(group.children.length<350);group.userData.dispose();
});
