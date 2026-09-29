import type {Opening,Wall,Project,Point} from './model';
import {uid,wallLength} from './model';
export type WallPreset={id:string;name:string;description:string;kind:Wall['kind'];thickness:number;height:number};
export const WALL_PRESETS:WallPreset[]=[
 {id:'light',name:'Лёгкая перегородка',description:'Для кабинетов и подсобных помещений',kind:'wall',thickness:.1,height:3.1},
 {id:'office',name:'Офисная перегородка',description:'Стартовый вариант для переговорных',kind:'wall',thickness:.15,height:3.1},
 {id:'thick',name:'Стена 200 мм',description:'Более массивная граница помещения',kind:'wall',thickness:.2,height:3.1},
 {id:'low',name:'Низкая перегородка',description:'Разделить зоны, сохранив обзор',kind:'wall',thickness:.12,height:1.2},
 {id:'glass',name:'Стеклянная перегородка',description:'Прозрачное разделение кабинетов',kind:'glass',thickness:.08,height:3.1},
 {id:'framed',name:'Витраж в профиле',description:'Для переговорной или входной зоны',kind:'glass',thickness:.12,height:3.1},
 {id:'facade',name:'Высокий витраж',description:'Остекление на высоту зала',kind:'glass',thickness:.18,height:6.6},
];
export type OpeningPreset={id:string;name:string;description:string;kind:Opening['kind'];width:number;height:number;sill:number;style:NonNullable<Opening['style']>;material:NonNullable<Opening['material']>;panels:number};
export const OPENING_PRESETS:OpeningPreset[]=[
 {id:'door-800',name:'Дверь 800',description:'Одностворчатая',kind:'door',width:.8,height:2.1,sill:0,style:'single',material:'solid',panels:1},
 {id:'door-900',name:'Дверь 900',description:'Одностворчатая',kind:'door',width:.9,height:2.2,sill:0,style:'single',material:'solid',panels:1},
 {id:'door-glass',name:'Стеклянная дверь',description:'Для переговорной и офиса',kind:'door',width:1,height:2.3,sill:0,style:'single',material:'glass',panels:1},
 {id:'door-double',name:'Двустворчатая дверь',description:'Две створки по 800 мм',kind:'door',width:1.6,height:2.3,sill:0,style:'double',material:'glass',panels:2},
 {id:'door-sliding',name:'Раздвижная дверь',description:'Две раздвижные створки',kind:'door',width:1.8,height:2.3,sill:0,style:'sliding',material:'glass',panels:2},
 {id:'open',name:'Открытый проём',description:'Свободный проход без двери',kind:'opening',width:1.2,height:2.3,sill:0,style:'single',material:'solid',panels:1},
 {id:'window',name:'Окно стандартное',description:'Подоконник 900 мм',kind:'window',width:1.2,height:1.4,sill:.9,style:'single',material:'glass',panels:2},
 {id:'window-wide',name:'Широкое окно',description:'Подоконник 900 мм',kind:'window',width:1.8,height:1.5,sill:.9,style:'single',material:'glass',panels:3},
 {id:'window-floor',name:'Панорамное окно',description:'Остекление от пола',kind:'window',width:2.4,height:2.6,sill:0,style:'single',material:'glass',panels:3},
 {id:'window-high',name:'Верхнее окно',description:'Подоконник 1800 мм',kind:'window',width:1.2,height:.6,sill:1.8,style:'single',material:'glass',panels:2},
];
export const DEFAULT_WALL=WALL_PRESETS[1];
export const DEFAULT_DOOR=OPENING_PRESETS[1];
export const DEFAULT_WINDOW=OPENING_PRESETS[6];
export function decodeOpeningPreset(payload:string):OpeningPreset|null {
 try {
  const data=JSON.parse(payload),base=OPENING_PRESETS.find(o=>o.id===data.id);
  if(!base||!Number.isFinite(data.width)||data.width<.3||data.width>10||!Number.isFinite(data.height)||data.height<.3||data.height>12||!Number.isFinite(data.sill)||data.sill<0||data.sill>5)return null;
  return {...base,width:data.width,height:data.height,sill:base.kind==='window'?data.sill:0};
 } catch { return OPENING_PRESETS.find(o=>o.id===payload)||null; }
}
export function openingForWall(w:Wall,q:Point,preset:OpeningPreset,others:Opening[]=[]):Opening|null {
 const length=wallLength(w),width=preset.width;
 if(width>length-.04||preset.sill+preset.height>w.height+.001)return null;
 const projection=((q.x-w.a.x)*(w.b.x-w.a.x)+(q.y-w.a.y)*(w.b.y-w.a.y))/length;
 const offset=Math.max(.02,Math.min(length-width-.02,projection-width/2));
 if(others.some(o=>o.wallId===w.id&&offset<o.offset+o.width+.03&&offset+width>o.offset-.03))return null;
 return {id:uid(),wallId:w.id,offset,width,height:preset.height,sill:preset.sill,kind:preset.kind,flip:false,style:preset.style,material:preset.material,panels:preset.panels,name:preset.name};
}
export function normalizeOpening(o:Opening,w:Wall):Opening {
 const width=Math.min(o.width,wallLength(w));
 const sill=Math.min(o.sill,Math.max(0,w.height-.3)),height=Math.min(o.height,w.height-sill);
 return {...o,width,sill,height,offset:Math.max(0,Math.min(wallLength(w)-width,o.offset))};
}
