import {Project,Point,makeItem,uid} from './model';
export const KITS=[{id:'manager',name:'Кабинет менеджера',size:'4 × 4 м',desc:'Стол, кресло и два стула',w:4,d:4},{id:'meeting',name:'Переговорная на 6',size:'5 × 4 м',desc:'Стол, шесть стульев, экран',w:5,d:4},{id:'waiting',name:'Зона ожидания',size:'4 × 4 м',desc:'Два дивана и журнальный стол',w:4,d:4},{id:'kitchen',name:'Кухня персонала',size:'4 × 3 м',desc:'Кухня, холодильник и стол',w:4,d:3},{id:'reception',name:'Ресепшен',size:'4 × 3 м',desc:'Стойка и два кресла',w:4,d:3},{id:'kids',name:'Детский уголок',size:'3 × 3 м',desc:'Стол, стулья и шкаф игрушек',w:3,d:3},{id:'backoffice',name:'Бэк-офис на 4',size:'5 × 4 м',desc:'Рабочие столы, кресла и шкаф',w:5,d:4}];
export function insertKit(p:Project,id:string,q:Point,level:number){const group=uid();const add=(id:string,x:number,y:number,rotation=0)=>{const f=makeItem(id,q.x+x,q.y+y,level);f.group=group;f.rotation=rotation;p.furniture.push(f)};
 if(id==='manager'){add('desk',0,0);add('office-chair',0,-1);add('guest-chair',-.5,1);add('guest-chair',.5,1)}
 if(id==='meeting'){add('meeting-six',0,0);for(const x of[-.8,0,.8]){add('guest-chair',x,-1);add('guest-chair',x,1,180)}add('screen',2,0,90)}
 if(id==='waiting'){add('sofa-three',0,-1.4);add('sofa-three',0,1.4,180);add('coffee-table',0,0);add('plant',1.5,1.3)}
 if(id==='kitchen'){add('kitchen',-.4,-1);add('fridge',1.5,-1);add('dining',0,.5);add('guest-chair',-.35,1.3,180);add('guest-chair',.4,1.3,180)}
 if(id==='reception'){add('reception',0,.2);add('office-chair',-.6,-.8);add('office-chair',.6,-.8)}
 if(id==='kids'){add('rug',0,0);add('kids-table',0,0);for(const[x,y]of[[-.7,0],[.7,0],[0,-.7],[0,.7]])add('kids-chair',x,y);add('toy-storage',0,-1.3)}
 if(id==='backoffice'){add('work-bench',-1.25,0);add('work-bench',1.25,0);for(const x of[-1.25,1.25]){add('office-chair',x,-1.3);add('office-chair',x,1.3,180)}add('cabinet',0,-1.75)}
 return p.furniture.filter(f=>f.group===group)[0]?.id;
}
