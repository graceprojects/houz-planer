import {test} from 'node:test';
import assert from 'node:assert/strict';
import {zoomAt,panBy,wheelAction,type WheelInput} from '../app/planner/navigation';
import {bindSpacePan} from '../app/planner/spacePan';
import {OPENING_PRESETS,openingForWall,normalizeOpening,decodeOpeningPreset} from '../app/planner/presets';
import {createDefault,type Wall} from '../app/planner/model';
import {projectSchema} from '../app/planner/validation';
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const event:WheelInput={deltaX:0,deltaY:80,deltaMode:0,ctrlKey:false,metaKey:false,altKey:false,shiftKey:false};
test('Magic Mouse scroll pans both axes; Shift pans horizontally',()=>{
 assert.deepEqual(wheelAction({...event,deltaX:24},'magic'),{type:'pan',dx:-24,dy:-80});
 assert.deepEqual(wheelAction({...event,shiftKey:true},'magic'),{type:'pan',dx:-80,dy:-0});
});
test('Option, pinch and ordinary mouse zoom, with bounded sensitivity',()=>{
 for(const e of [{...event,altKey:true},{...event,ctrlKey:true}])assert.equal(wheelAction(e,'magic').type,'zoom');
 const a=wheelAction(event,'mouse');assert.equal(a.type,'zoom');if(a.type==='zoom')assert.ok(a.factor<1&&a.factor>=Math.exp(-.2));
 assert.deepEqual(wheelAction({...event,deltaY:1,deltaMode:1},'magic'),{type:'pan',dx:-0,dy:-16});
});
test('Zoom stays anchored under cursor, remains reversible, has finite limits',()=>{
 const v={x:-4,y:-8,w:44,h:24},q={x:12,y:9};
 const z=zoomAt(v,1.8,q);close((q.x-z.x)/z.w,(q.x-v.x)/v.w);close((q.y-z.y)/z.h,(q.y-v.y)/v.h);
 const back=zoomAt(z,1/1.8,q);for(const k of ['x','y','w','h'] as const)close(back[k],v[k]);
 assert.equal(zoomAt(v,100000,q).w,2);assert.equal(zoomAt(v,.000001,q).w,240);
});
test('Pan moves view by physical pixel distance without altering scale',()=>{
 const v={x:0,y:0,w:40,h:20};assert.deepEqual(panBy(v,100,50,{w:1000,h:500}),{x:-4,y:-2,w:40,h:20});
});
test('Space hand releases on keyup, blur and hidden page; ignores text input',()=>{
 const keyboard=new EventTarget(),visibility=Object.assign(new EventTarget(),{hidden:false}),changes:boolean[]=[];
 let blocked=false;const unbind=bindSpacePan(keyboard,visibility,()=>blocked,v=>changes.push(v));
 const key=(type:string,repeat=false)=>{const e=Object.assign(new Event(type,{cancelable:true}),{code:'Space',repeat});keyboard.dispatchEvent(e);return e};
 assert.ok(key('keydown').defaultPrevented);key('keydown',true);key('keyup');
 key('keydown');keyboard.dispatchEvent(new Event('blur'));
 key('keydown');visibility.hidden=true;visibility.dispatchEvent(new Event('visibilitychange'));
 blocked=true;assert.equal(key('keydown').defaultPrevented,false);key('keyup');
 assert.deepEqual(changes,[true,false,true,false,true,false]);
 unbind();blocked=false;key('keydown');assert.equal(changes.length,6);
});
const wall:Wall={id:'test-wall',a:{x:0,y:0},b:{x:8,y:0},height:3.1,thickness:.15,kind:'wall',level:0};
test('Drag payload preserves custom dimensions and rejects invalid data',()=>{
 const custom={...OPENING_PRESETS[3],width:1.9,height:2.4};
 assert.equal(decodeOpeningPreset(JSON.stringify(custom))?.width,1.9);
 assert.equal(decodeOpeningPreset(JSON.stringify({...custom,width:-1})),null);
 assert.equal(decodeOpeningPreset('unknown'),null);
 assert.equal(decodeOpeningPreset(OPENING_PRESETS[3].id)?.style,'double');
});
test('All door/window variants fit, persist and round-trip through validation',()=>{
 for(const preset of OPENING_PRESETS){const p=createDefault(),o=openingForWall(wall,{x:4,y:0},preset)!;assert.ok(o);p.walls.push(wall);p.openings.push(o);
 const parsed=projectSchema.parse(JSON.parse(JSON.stringify(p))).openings.at(-1)!;
 assert.equal(parsed.style,preset.style);assert.equal(parsed.material,preset.material);assert.equal(parsed.panels,preset.panels);assert.equal(parsed.width,preset.width);
 }
});
test('New openings reject overlap, short walls and low partitions',()=>{
 const door=OPENING_PRESETS[3],first=openingForWall(wall,{x:4,y:0},door)!;
 assert.equal(openingForWall(wall,{x:4.1,y:0},door,[first]),null);
 assert.equal(openingForWall({...wall,b:{x:1,y:0}},{x:.5,y:0},door),null);
 assert.equal(openingForWall({...wall,height:1.2},{x:4,y:0},door),null);
 assert.ok(openingForWall(wall,{x:1,y:0},door,[first]));
});
test('Opening placement respects reversed wall direction and clamps ends',()=>{
 const reverse={...wall,a:wall.b,b:wall.a},preset=OPENING_PRESETS[1];
 const placed=openingForWall(reverse,{x:6,y:0},preset)!;close(placed.offset,2-preset.width/2);
 assert.equal(openingForWall(wall,{x:-100,y:0},preset)!.offset,.02);
});
test('Editing an opening keeps dimensions and offsets within the wall',()=>{
 const o=openingForWall(wall,{x:4,y:0},OPENING_PRESETS[6])!;
 const n=normalizeOpening({...o,width:12,height:8,sill:2.9,offset:15},wall);
 assert.equal(n.width,8);assert.equal(n.offset,0);close(n.sill+n.height,wall.height);
});
