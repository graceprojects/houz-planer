import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {furnitureParts,type Part} from './furnitureGeometry';
import type {Furniture} from './model';

export function primitiveGeometry(p:Part,quality:'detailed'|'simple'){
 let g:THREE.BufferGeometry;
 if(p.shape==='cylinder'){g=new THREE.CylinderGeometry(.5,.5,1,quality==='simple'?10:18);g.scale(p.w,p.h,p.d)}
 else if(p.shape==='ellipsoid'){g=new THREE.SphereGeometry(.5,quality==='simple'?8:12,quality==='simple'?5:8);g.scale(p.w,p.h,p.d)}
 else if(p.shape==='soft'&&quality==='detailed')g=new RoundedBoxGeometry(p.w,p.h,p.d,1,Math.min(p.radius||.035,p.w/4,p.h/4,p.d/4));
 else g=new THREE.BoxGeometry(p.w,p.h,p.d);
 return g;
}
function texture(surface:'wood'|'fabric'){
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const value=surface==='wood'?240+Math.sin(x*.62+Math.sin(y*.13)*.8)*8+Math.sin(x*2.8+y*.05)*4:246+((x+y)%2?5:-5);
  const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(surface==='wood'?2:8,surface==='wood'?1:8);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;
}

/** Repeated legs, cushions and complete objects share GPU geometry and draw batches. */
export function buildFurnitureBatches(items:{item:Furniture;base:number}[],quality:'detailed'|'simple'){
 const group=new THREE.Group(),geometries=new Map<string,THREE.BufferGeometry>(),materials=new Map<string,THREE.MeshStandardMaterial>(),textures=new Map<string,THREE.DataTexture>();
 const batches=new Map<string,{geometry:THREE.BufferGeometry;material:THREE.MeshStandardMaterial;matrices:THREE.Matrix4[];ids:string[]}>();
 let partCount=0;
 for(const {item:f,base} of items){
  const parent=new THREE.Matrix4().makeRotationY(-f.rotation*Math.PI/180);parent.setPosition(f.x,f.kind==='stair'?0:base,f.y);
  for(const part of furnitureParts(f,quality)){
   const geometryId=[part.shape,part.w,part.h,part.d,part.radius||0].join('|'),materialId=[part.surface,part.color].join('|'),key=geometryId+'|'+materialId;
   let geometry=geometries.get(geometryId);if(!geometry){geometry=primitiveGeometry(part,quality);geometries.set(geometryId,geometry)}
   let material=materials.get(materialId);
   if(!material){let map:THREE.DataTexture|null=null;if(quality==='detailed'&&(part.surface==='wood'||part.surface==='fabric')){map=textures.get(part.surface)||texture(part.surface);textures.set(part.surface,map)}
    material=new THREE.MeshStandardMaterial({color:part.color,roughness:part.surface==='fabric'?.97:part.surface==='metal'?.35:part.surface==='glass'?.17:.68,metalness:part.surface==='metal'?.55:0,map});materials.set(materialId,material);
   }
   let batch=batches.get(key);if(!batch){batch={geometry,material,matrices:[],ids:[]};batches.set(key,batch)}
   const local=new THREE.Matrix4().compose(new THREE.Vector3(part.x,part.y,part.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(part.rx||0,part.ry||0,part.rz||0)),new THREE.Vector3(1,1,1));
   batch.matrices.push(parent.clone().multiply(local));batch.ids.push(f.id);partCount++;
  }
 }
 for(const b of batches.values()){
  const mesh=new THREE.InstancedMesh(b.geometry,b.material,b.matrices.length);b.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.itemIds=b.ids;group.add(mesh);
 }
 group.userData.stats={objects:items.length,parts:partCount,drawCalls:batches.size,geometries:geometries.size};
 group.userData.dispose=()=>{group.children.forEach(mesh=>(mesh as THREE.InstancedMesh).dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose())};
 return group;
}

export function furnitureIdFromHit(hit:THREE.Intersection){return hit.instanceId!==undefined?hit.object.userData.itemIds?.[hit.instanceId] as string|undefined:hit.object.userData.itemId as string|undefined}
