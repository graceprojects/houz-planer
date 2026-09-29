import type {OfficeProgramme,PlannedSpace} from './programmeTypes';
export type Point={x:number;y:number};
export type Wall={id:string;a:Point;b:Point;thickness:number;height:number;kind:'wall'|'glass';level:number;group?:string};
export type Opening={id:string;wallId:string;offset:number;width:number;height:number;sill:number;kind:'door'|'window'|'opening';flip:boolean;style?:'single'|'double'|'sliding';material?:'solid'|'glass';panels?:number;name?:string};
export type Furniture={id:string;catalogId:string;name:string;kind:string;x:number;y:number;w:number;d:number;h:number;rotation:number;color:string;level:number;locked?:boolean;group?:string;finish?:'original'|'oak'|'walnut'|'white'|'graphite';accessories?:boolean};
export type RoomTag={id:string;x:number;y:number;name:string;color:string;level:number;notes:string;purposeId?:string};
export type Project={schemaVersion:1;id:string;name:string;width:number;depth:number;height:number;wallThickness:number;mezzanine:{enabled:boolean;start:number;height:number};walls:Wall[];openings:Opening[];furniture:Furniture[];tags:RoomTag[];notes:string;programme?:OfficeProgramme;plannedSpaces?:PlannedSpace[]};
export type CatalogItem={id:string;name:string;kind:string;category:string;w:number;d:number;h:number;color:string};
export const COLORS=['#edf0e9','#e5ebf2','#e9e1d5','#e9dfe4','#d7e6e2','#e8e7ed','#f2e9d0','#c7d4de'];
export const CATALOG:CatalogItem[]=[
 ['desk','Стол менеджера','desk','Работа',1.6,.8,.75,'#d9c5a4'],['desk-big','Большой рабочий стол','desk','Работа',1.8,.9,.75,'#d9c5a4'],['work-bench','Стол на 2 сотрудника','desk','Работа',1.6,1.6,.75,'#d9c5a4'],['office-chair','Кресло сотрудника','chair','Работа',.65,.65,.95,'#52635e'],['guest-chair','Стул посетителя','chair','Работа',.5,.55,.8,'#9cafb1'],['cabinet','Шкаф документов','cabinet','Работа',1.2,.45,2.1,'#b5bfc3'],['printer','Тумба с принтером','printer','Работа',.8,.65,1,'#d9dfe2'],
 ['meeting-six','Переговорный стол · 6','meeting','Переговорные',2.4,1.1,.75,'#d6c1a1'],['meeting-eight','Переговорный стол · 8','meeting','Переговорные',3.2,1.2,.75,'#d6c1a1'],['meeting-round','Круглый стол','round','Переговорные',1.2,1.2,.75,'#d6c1a1'],['screen','Экран / ТВ','screen','Переговорные',1.5,.15,1,'#3b454b'],
 ['sofa-two','Диван двухместный','sofa','Ожидание',1.8,.85,.8,'#afc2b7'],['sofa-three','Диван трёхместный','sofa','Ожидание',2.4,.9,.8,'#afc2b7'],['armchair','Мягкое кресло','armchair','Ожидание',.85,.85,.8,'#c0b2a4'],['coffee-table','Журнальный стол','table','Ожидание',1.2,.65,.42,'#d6c1a1'],['coffee-round','Кофейный столик','round','Ожидание',.65,.65,.48,'#d6c1a1'],['plant','Растение в кашпо','plant','Ожидание',.6,.6,1.4,'#6c987b'],['rug','Ковёр','rug','Ожидание',3,2,.02,'#ddd3be'],
 ['reception','Стойка ресепшена','reception','Продажи',2.6,.8,1.1,'#a3bfb8'],['model','Стол макета','model','Продажи',4,2.6,.85,'#d1ded4'],['sample','Стенд материалов','cabinet','Продажи',1.8,.45,2,'#cbb698'],['safe','Сейф / касса','safe','Продажи',.6,.6,1.1,'#849398'],['kids-table','Детский стол','round','Детская',.8,.8,.5,'#e8c790'],['kids-chair','Детский стул','chair','Детская',.35,.35,.5,'#d3ba93'],['toy-storage','Шкаф игрушек','cabinet','Детская',1.2,.4,.8,'#e4c691'],
 ['kitchen','Кухонный модуль','kitchen','Кухня',2.4,.6,.9,'#c1cdcc'],['bar','Кофе-бар','kitchen','Кухня',3,.65,1.1,'#c1cdcc'],['fridge','Холодильник','fridge','Кухня',.6,.65,1.85,'#d2dadd'],['sink','Мойка','sink','Кухня',.6,.6,.9,'#c4d6dc'],['dining','Обеденный стол','table','Кухня',1.4,.8,.75,'#d6c1a1'],['bar-stool','Барный стул','stool','Кухня',.45,.45,.75,'#a5b8ae'],
 ['wc','Унитаз','wc','Санузлы',.4,.7,.75,'#eaf0f1'],['basin','Умывальник','sink','Санузлы',.65,.5,.85,'#eaf0f1'],['cleaning','Хозяйственный шкаф','cabinet','Санузлы',.8,.6,2.1,'#aebfca'],['stair','Лестница П-образная','stair','Конструкции',2.8,4.1,3.4,'#c4ccd0'],
].map(([id,name,kind,category,w,d,h,color])=>({id,name,kind,category,w,d,h,color} as CatalogItem));
export const uid=()=>crypto.randomUUID();
export const clone=<T,>(x:T):T=>JSON.parse(JSON.stringify(x));
export const round=(n:number,step=.05)=>Math.round(n/step)*step;
export const mm=(n:number)=>Math.round(n*1000).toLocaleString('ru-RU');
export const area=(n:number)=>n.toLocaleString('ru-RU',{maximumFractionDigits:1,minimumFractionDigits:1});
export const wallLength=(w:Wall)=>Math.hypot(w.b.x-w.a.x,w.b.y-w.a.y);
export function makeItem(id:string,x:number,y:number,level=0):Furniture{const t=CATALOG.find(a=>a.id===id)!;return {...t,id:uid(),catalogId:t.id,x,y,rotation:0,level};}
export function shell(p:Project,level=0):Wall[]{const x=level?p.mezzanine.start:0,t=p.wallThickness,h=level?p.height-p.mezzanine.height:p.height;return [
 {id:`shell-${level}-top`,a:{x:x+t/2,y:t/2},b:{x:p.width-t/2,y:t/2}},
 {id:`shell-${level}-right`,a:{x:p.width-t/2,y:t/2},b:{x:p.width-t/2,y:p.depth-t/2}},
 {id:`shell-${level}-bottom`,a:{x:x+t/2,y:p.depth-t/2},b:{x:p.width-t/2,y:p.depth-t/2}},
 {id:`shell-${level}-left`,a:{x:x+t/2,y:t/2},b:{x:x+t/2,y:p.depth-t/2}},
 ].map(w=>({...w,kind:w.id.endsWith('bottom')?'glass':'wall',height:h,thickness:t,level} as Wall));}
export function createDefault():Project{
 const p:Project={schemaVersion:1,id:'broadway-default',name:'HOUZ PLANER · Офис продаж',width:40,depth:12,height:6.6,wallThickness:.25,mezzanine:{enabled:true,start:30,height:3.4},walls:[],openings:[],furniture:[],tags:[],notes:'Офис продаж 40 × 12 м. Длинный фасад вдоль дороги. Высота зала 6,6 м. Второй ярус в правом торце для бэк-офиса. Эскизное задание для проектировщика.'};
 let count=0;
 const wall=(a:Point,b:Point,level=0,kind:'wall'|'glass'='wall',thickness=.15)=>{const w:Wall={id:'w'+(++count),a,b,level,kind,thickness,height:level?3.2:3.1};p.walls.push(w);return w.id};
 const wh=(x:number,x2:number,y:number,l=0,kind:'wall'|'glass'='wall')=>wall({x,y:12-y},{x:x2,y:12-y},l,kind);
 const wv=(x:number,y:number,y2:number,l=0)=>wall({x,y:12-y},{x,y:12-y2},l);
 const door=(wallId:string,offset:number,width=.95)=>p.openings.push({id:'op'+(++count),wallId,offset,width,height:2.2,sill:0,kind:'door',flip:false});
 const item=(id:string,x:number,y:number,l=0,rot=0)=>{const t=CATALOG.find(t=>t.id===id)!;p.furniture.push({...t,id:'f'+(++count),catalogId:id,x,y:12-y,rotation:rot,level:l});};
 const tag=(name:string,x:number,y:number,color=COLORS[0],l=0)=>p.tags.push({id:'r'+(++count),name,x,y:12-y,color,level:l,notes:''});
 const front=wh(.125,30,7.775,0,'glass');
 for(const x of[4,8,12,16,20,25])wv(x,7.775,11.875);
 for(let i=0;i<7;i++){const mid=i<5?2+4*i:22.5+5*(i-5);door(front,(i<5?i*4:20+(i-5)*5)+.75);tag(i<5?`Менеджер ${i+1}`:`Переговорная ${i-4}`,mid,9.8,COLORS[0]);
 if(i<5){item('desk',mid,9.8);item('office-chair',mid,10.8);item('guest-chair',mid-.48,8.9);item('guest-chair',mid+.48,8.9)}
 else{item('meeting-six',mid,9.8);for(const dx of[-.8,0,.8]){item('guest-chair',mid+dx,8.85);item('guest-chair',mid+dx,10.75)}}}
 for(const l of[0,1]){const west=wv(30,.125,11.875,l);if(!l)door(west,4.6,1.8);const low=wh(30,39.875,4.225,l);door(low,l?2.7:1.7);if(!l)door(low,4.55);const high=wh(30,39.875,6.175,l);door(high,1.15);door(high,6.5);wv(33.225,6.175,11.875,l);const a=wv(36.075,6.175,11.875,l),b=wv(37.625,6.175,11.875,l);door(a,.9);door(b,.9);door(b,3.5);wh(37.625,39.875,9.075,l);if(!l){wh(33.225,36.075,9.075,l);door(a,3.5);wv(33.425,.125,4.225,l)}
 item('stair',31.65,9.6,l);item('wc',39.05,8.45,l);item('basin',38.2,6.8,l);item('cabinet',39.2,10.35,l,90);
 tag('Лестница',31.6,8.3,COLORS[1],l);tag('Коридор',36.85,8.7,COLORS[1],l);tag('Холл',34.5,5.1,COLORS[1],l);tag('Санузел',38.8,7.8,COLORS[1],l);tag(l?'Архив':'Хозблок',38.8,10.6,COLORS[1],l);
 }
 tag('Зал продаж',17,5.8,'#f0ece4');tag('Касса',31.7,2.6,COLORS[1]);tag('Кухня / отдых',36.6,2.2,COLORS[1]);tag('С/У универсальный',34.65,7.65,COLORS[1]);tag('Техническая',34.65,10.35,COLORS[1]);
 item('desk',31.7,1.65);item('office-chair',31.7,.8);item('guest-chair',31.7,2.5);item('safe',32.9,.7);item('kitchen',39.15,2.15,0,90);item('dining',36.9,1.8);for(const x of[36.5,37.3])for(const y of[.95,2.7])item('guest-chair',x,y);item('sofa-two',34.7,1);item('wc',33.95,8.5);item('basin',35.5,8.5);item('cabinet',34.6,11.2);
 item('reception',13.2,3.6);item('office-chair',12.6,4.6);item('office-chair',13.7,4.6);item('model',19,3);item('sofa-three',7.5,1.6);item('sofa-three',7.5,4.6,0,180);item('coffee-table',7.5,3);item('armchair',9.4,3,0,90);item('rug',2.9,2.7);item('kids-table',2.9,2.7);for(const [x,y] of[[2.1,2.7],[3.7,2.7],[2.9,1.9],[2.9,3.5]])item('kids-chair',x,y);item('toy-storage',2,1.3);item('bar',29.1,3,0,90);for(const y of[2,2.8,3.6])item('bar-stool',28.15,y);for(const [x,y] of[[24.1,2.1],[25.8,4.1]]){item('coffee-round',x,y);item('guest-chair',x-.8,y);item('guest-chair',x+.8,y)}for(const [x,y] of[[.8,5],[10.8,1],[22.5,5.2]])item('plant',x,y);
 tag('Бэк-офис',35.3,2.4,COLORS[2],1);tag('Руководитель',34.6,9.8,COLORS[2],1);item('desk-big',34.6,9.6,1);item('office-chair',34.6,10.65,1);item('guest-chair',34.2,8.75,1);item('guest-chair',35,8.75,1);
 for(const x of[31.7,34.7,37.7]){item('work-bench',x,1.9,1);item('office-chair',x,.65,1);item('office-chair',x,3.1,1)}
 p.openings.push({id:'main-entry',wallId:'shell-0-bottom',offset:13.9,width:2,height:2.6,sill:0,kind:'door',flip:true},{id:'side-entry',wallId:'shell-0-left',offset:5.3,width:1.2,height:2.2,sill:0,kind:'door',flip:true},{id:'staff-entry',wallId:'shell-0-right',offset:6.15,width:1.2,height:2.2,sill:0,kind:'door',flip:true});
 for(const tag of p.tags)if(tag.level===1&&tag.name==='Лестница')tag.y=5.0;
 return p;
}
