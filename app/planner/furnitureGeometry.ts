import type {Furniture} from './model';

export type Finish='original'|'oak'|'walnut'|'white'|'graphite';
export type FurnitureSpec=Pick<Furniture,'kind'|'w'|'d'|'h'|'color'> & {catalogId?:string;id?:string;finish?:Finish;accessories?:boolean};
export type Part={shape:'box'|'soft'|'cylinder'|'ellipsoid';x:number;y:number;z:number;w:number;h:number;d:number;color:string;surface:'matte'|'wood'|'fabric'|'metal'|'glass'|'leaf';radius?:number;rx?:number;ry?:number;rz?:number;detail?:boolean;accessory?:boolean};
export const FINISHES:{id:Finish;name:string;color:string}[]=[{id:'original',name:'Свой цвет',color:'#aac0b2'},{id:'oak',name:'Дуб',color:'#ceb58e'},{id:'walnut',name:'Орех',color:'#82593e'},{id:'white',name:'Белый',color:'#ecece5'},{id:'graphite',name:'Графит',color:'#444e50'}];
export const furnitureId=(f:FurnitureSpec)=>f.catalogId||f.id||'';
export function mainColor(f:FurnitureSpec){return f.finish&&f.finish!=='original'?FINISHES.find(v=>v.id===f.finish)!.color:f.color}
export const tint=(hex:string,amount:number)=>'#'+hex.slice(1).match(/../g)!.map(v=>Math.max(0,Math.min(255,parseInt(v,16)+amount)).toString(16).padStart(2,'0')).join('');
export function finishName(f:FurnitureSpec){const soft=['chair','sofa','armchair','stool','rug'].includes(f.kind),id=f.finish||'original';return id==='original'?'Цвет '+f.color:soft?({oak:'Песочный',walnut:'Карамель',white:'Молочный',graphite:'Графит'}[id]):FINISHES.find(v=>v.id===id)!.name}
export function supportsAccessories(f:FurnitureSpec){return ['desk','meeting','table','round','reception','kitchen'].includes(f.kind)}
export function furnitureDescription(f:FurnitureSpec){
 const id=furnitureId(f);
 if(f.accessories===false&&f.kind==='desk')return id==='work-bench'?'Два рабочих места с перегородкой и общим металлическим каркасом.':'Столешница со скруглением, металлические опоры и тумба с ящиками.';
 if(f.accessories===false&&id==='bar')return 'Стойка с рабочей поверхностью, фасадами и закрытым хранением.';
 if(id==='office-chair')return 'Мягкое сиденье, тканевая спинка, подлокотники и пятилучевая база на колёсиках.';
 if(id==='work-bench')return 'Два рабочих места с экранами, перегородкой и общим металлическим каркасом.';
 if(id==='bar')return 'Стойка с рабочей поверхностью, кофемашиной, чашками и закрытым хранением.';
 if(id==='sample')return 'Стенд с отдельными образцами дерева, камня и цветных покрытий.';
 if(id==='toy-storage')return 'Открытые секции с корзинами и игрушками.';
 return ({desk:'Столешница со скруглением, металлические опоры, тумба, монитор и клавиатура.',chair:'Сиденье и спинка со скруглением, отдельные опоры.',sofa:'Отдельные подушки сиденья и спинки, подлокотники, швы и низкие ножки.',armchair:'Мягкое сиденье, спинка, подлокотники и деревянные опоры.',meeting:'Столешница со скруглением, опоры и встроенный блок подключения.',plant:'Кашпо, грунт, стебли и отдельные листья.',kitchen:'Отдельные фасады и ящики, ручки, цоколь, столешница и мойка.',cabinet:'Корпус, отдельные фасады, ручки, полки и цоколь.',fridge:'Две дверцы с уплотнениями и ручками.',wc:'Округлая чаша, сиденье, бачок и кнопка смыва.',sink:'Тумба или пьедестал, чаша, слив и смеситель.',reception:'Два уровня столешницы, фасад с рейками, рабочее место и хранение.',model:'Стол с основанием, озеленение, дорожки и объёмная застройка макета.',stool:'Мягкое сиденье, металлическая стойка, подножка и основание.',screen:'Экран с тонкой рамкой, подставка и основание.',safe:'Корпус, отдельная дверца, петли, клавиатура и рукоять.',printer:'Тумба с ящиками, принтер, лоток бумаги и панель управления.',rug:'Ковёр с окантовкой и спокойной фактурой.',stair:'Два марша, площадка, ступени и ограждение.'} as Record<string,string>)[f.kind]||'Столешница со скруглением и отдельные опоры.';
}

/** One parametric definition for catalog thumbnails and the actual 3D furniture. */
export function furnitureParts(f:FurnitureSpec,quality:'detailed'|'simple'='detailed'):Part[]{
 const {w,d,h,kind}=f,id=furnitureId(f),c=mainColor(f),parts:Part[]=[];
 const metal='#485653',dark='#344348',wood=f.finish==='walnut'?'#82593e':'#b99870',light='#eceee8';
 const surface:Part['surface']=f.finish==='oak'||f.finish==='walnut'||(!f.finish||f.finish==='original')&&['desk','meeting','round','table'].includes(kind)?'wood':'matte';
 const add=(shape:Part['shape'],x:number,y:number,z:number,a:number,b:number,e:number,color=c,surf:Part['surface']=surface,detail=false,extra:Partial<Part>={})=>{parts.push({shape,x:x*w,y:y*h,z:z*d,w:Math.max(.001,a*w),h:Math.max(.001,b*h),d:Math.max(.001,e*d),color,surface:surf,detail,...extra})};
 const box=(x:number,y:number,z:number,a:number,b:number,e:number,color=c,surf:Part['surface']=surface,detail=false,extra:Partial<Part>={})=>add('box',x,y,z,a,b,e,color,surf,detail,extra);
 const soft=(x:number,y:number,z:number,a:number,b:number,e:number,color=c,surf:Part['surface']=surface,detail=false,extra:Partial<Part>={})=>add('soft',x,y,z,a,b,e,color,surf,detail,extra);
 const cyl=(x:number,y:number,z:number,a:number,b:number,e:number,color=c,surf:Part['surface']=surface,detail=false,extra:Partial<Part>={})=>add('cylinder',x,y,z,a,b,e,color,surf,detail,extra);
 const oval=(x:number,y:number,z:number,a:number,b:number,e:number,color=c,surf:Part['surface']='matte',detail=false,extra:Partial<Part>={})=>add('ellipsoid',x,y,z,a,b,e,color,surf,detail,extra);
 const legs=(height=.92,insetX=.40,insetZ=.37,col=metal)=>{for(const x of[-insetX,insetX])for(const z of[-insetZ,insetZ])box(x,height/2,z,.032,height,.045,col,'metal')};
 const computer=(x=0,z=-.22,flip=1)=>{if(f.accessories===false)return;const yy=1;box(x,yy+.025,z,.18,.025,.14,metal,'metal',true,{accessory:true});box(x,yy+.13,z-.025*flip,.025,.23,.026,metal,'metal',true,{accessory:true});soft(x,yy+.31,z-.04*flip,.32,.35,.04,dark,'matte',true,{accessory:true});box(x,yy+.32,z-.063*flip,.292,.305,.008,'#82a5aa','glass',true,{accessory:true});soft(x,yy+.024,z+.26*flip,.25,.024,.12,'#e4e8e5','matte',true,{accessory:true});oval(x+.19,yy+.029,z+.25*flip,.038,.029,.063,metal,'matte',true,{accessory:true})};
 const handle=(x:number,y:number,z:number,width=.15)=>box(x,y,z,width,.012,.025,metal,'metal',true);
 const pot=(x:number,z:number,scale=.12)=>{if(f.accessories===false)return;cyl(x,1.06,z,scale,.12,scale,'#e2dcd0','matte',true,{accessory:true});for(let i=0;i<5;i++)oval(x+Math.sin(i*2)*scale*.22,1.16+i*.02,z+Math.cos(i*2)*scale*.22,scale*.55,.09,scale*.37,'#6c8e64','leaf',true,{accessory:true})};
 if(['desk','table','meeting','round'].includes(kind)){
  if(kind==='round'){cyl(0,.97,0,1,.06,1,c);cyl(0,.025,0,.5,.05,.5,metal,'metal');cyl(0,.48,0,.06,.9,.06,metal,'metal')}
  else{soft(0,.975,0,1,.05,1,c,surface,false,{radius:Math.min(w,d)*.065});legs(.94);box(0,.84,-.35,.8,.075,.028,metal,'metal',true);if(kind==='meeting')box(0,.84,.35,.8,.075,.028,metal,'metal',true)}
  if(kind==='desk'){
   if(id==='work-bench'){computer(-.2,-.19,-1);computer(.2,.19,1);soft(0,1.11,0,.88,.23,.023,'#8faaa2','fabric');}
   else{box(.31,.44,-.01,.23,.81,.75,tint(c,12));for(let i=0;i<3;i++){box(.31,.23+i*.25,.379,.218,.235,.014,tint(c,6),'matte',true);handle(.31,.26+i*.25,.397,.11)}computer();}
   for(const x of[-.33,.33])cyl(x,1.001,-.36,.028,.005,.05,metal,'matte',true);
  }
  if(kind==='meeting'){soft(0,1.004,0,.16,.008,.09,metal,'metal',true);if(f.accessories!==false){box(-.29,1.011,.19,.12,.012,.19,'#d0d9d4','matte',true,{accessory:true});cyl(.30,1.06,.19,.038,.12,.068,light,'matte',true,{accessory:true})}}
  if((kind==='table'||kind==='round')&&id!=='coffee-table'&&id!=='coffee-round'&&f.accessories!==false){box(-.17,1.013,.05,.22,.023,.23,'#7c9488','matte',true,{accessory:true});cyl(.24,1.06,.12,.075,.12,.075,light,'matte',true,{accessory:true})}
  if(id==='coffee-table'||id==='coffee-round'){if(f.accessories!==false){box(-.14,1.03,.02,.24,.055,.30,'#657e73','matte',true,{accessory:true});box(-.12,1.063,.015,.22,.015,.29,light,'matte',true,{accessory:true});pot(.24,-.13,.14)}}
 }
 else if(kind==='chair'){
  const office=id==='office-chair',seat=office?.48:.51;
  soft(0,seat,0,.82,.10,.78,c,'fabric');soft(0,.79,-.34,.80,.41,.115,c,'fabric',false,{rx:-.09,radius:.035});
  if(office){cyl(0,.24,0,.095,.40,.095,metal,'metal');for(let i=0;i<5;i++){const a=i*Math.PI*2/5;box(Math.sin(a)*.19,.085,Math.cos(a)*.19,.038,.045,.46,metal,'metal',false,{ry:a});cyl(Math.sin(a)*.395,.046,Math.cos(a)*.395,.075,.05,.075,'#303a38','matte',true,{rx:Math.PI/2})}
   for(const x of[-.43,.43]){box(x,.59,.04,.038,.25,.04,metal,'metal');soft(x,.71,.02,.10,.055,.43,metal,'matte')}
   soft(0,.79,-.277,.69,.35,.013,tint(c,8),'fabric',true,{rx:-.09});box(0,.68,-.38,.05,.31,.05,metal,'metal',true);for(let i=0;i<7;i++)box(0,.65+i*.044,-.409,.69,.009,.006,tint(c,25),'fabric',true);
  }else legs(.47,.32,.31,id==='kids-chair'?wood:metal);
 }
 else if(kind==='sofa'||kind==='armchair'){
  const n=kind==='armchair'?1:w>2.1?3:2;
  for(const x of[-.39,.39])for(const z of[-.33,.33])box(x,.09,z,.037,.18,.055,wood,'wood');
  soft(0,.29,0,.98,.24,.96,tint(c,-9),'fabric');soft(0,.71,-.39,.94,.54,.20,c,'fabric');
  for(const x of[-.435,.435])soft(x,.55,.02,.13,.43,.92,c,'fabric');
  for(let i=0;i<n;i++){const x=-.365+(i+.5)*.73/n;soft(x,.50,.085,.715/n,.19,.71,tint(c,9),'fabric');soft(x,.77,-.285,.715/n,.39,.155,tint(c,4),'fabric',false,{rx:-.10});box(x,.59,.31,.67/n,.006,.007,tint(c,-13),'fabric',true)}
  if(kind==='armchair')soft(.22,.68,-.02,.25,.21,.17,tint(c,23),'fabric',true,{rz:-.24});
 }
 else if(kind==='stool'){
  cyl(0,.032,0,.71,.064,.71,metal,'metal');cyl(0,.46,0,.08,.84,.08,metal,'metal');cyl(0,.93,0,1,.14,1,c,'fabric');
  box(0,.43,.24,.5,.025,.036,metal,'metal',true);for(const x of[-.23,.23])box(x,.43,.11,.025,.025,.27,metal,'metal',true);
 }
 else if(['cabinet','safe','fridge'].includes(kind)){
  box(0,.055,0,.90,.11,.86,metal,'matte');soft(0,.54,0,.99,.92,.98,c,'matte');
  if(id==='sample'){box(0,.56,.477,.91,.8,.038,wood,'wood');for(let row=0;row<3;row++)for(let col=0;col<4;col++)soft(-.33+col*.22,.27+row*.25,.499,.19,.20,.015,['#cbb493','#e8e5db','#84998f','#b8b6b0'][(row+col)%4],'matte',true)}
  else if(id==='toy-storage'){box(0,.56,.495,.90,.77,.012,tint(c,-24));for(let col=0;col<3;col++){box(-.16+col*.32,.57,.30,.025,.80,.38,c);for(let row=0;row<2;row++){box(-.32+col*.32,.27+row*.42,.38,.27,.33,.22,['#a6bbae','#c7aa8b','#ced1b2'][col]);handle(-.32+col*.32,.31+row*.42,.495,.09)}}box(0,.51,.30,.94,.03,.4,c)}
  else if(kind==='fridge'){for(const [y,hh] of[[.32,.44],[.775,.42]]){soft(0,y,.49,.96,hh,.035,tint(c,4));box(-.36,y+.10,.514,.028,.20,.02,metal,'metal',true)}box(0,.554,.50,.91,.01,.012,metal,'matte',true)}
  else if(kind==='safe'){soft(0,.53,.499,.86,.83,.027,tint(c,9));for(const y of[.25,.80])cyl(-.43,y,.495,.047,.09,.035,metal,'metal',true);box(.20,.69,.518,.20,.13,.018,dark,'matte',true);for(let i=0;i<6;i++)box(.15+(i%3)*.045,.68+Math.floor(i/3)*.035,.53,.023,.018,.008,light,'matte',true);cyl(-.04,.47,.527,.10,.018,.10,metal,'metal',true,{rx:Math.PI/2});box(-.04,.47,.54,.20,.025,.02,metal,'metal',true)}
  else{const n=w>.9?2:1;for(let i=0;i<n;i++){const x=-.48+(i+.5)*.96/n;box(x,.54,.49,.94/n,.89,.025,tint(c,5));handle(x+(n===1?.22:i===0?.16:-.16),.54,.515,.025)}for(const y of[.33,.65])box(0,y,-.20,.9,.015,.40,c,'matte',true)}
 }
 else if(kind==='kitchen'||kind==='reception'){
  const reception=kind==='reception',bar=id==='bar',n=Math.min(10,Math.max(2,Math.round(w/.6)));
  box(0,.05,0,.94,.10,.84,metal,'matte');box(0,.49,0,.98,.86,.94,c);soft(0,.965,0,1,.07,1,reception?'#e4e8e0':light,'matte');
  for(let i=0;i<n;i++){const x=-.49+(i+.5)*.98/n;box(x,.50,.474,.96/n,.81,.018,c);handle(x,.80,.49,.45/n);if(!reception&&i===n-1)for(const y of[.35,.6])box(x,y,.488,.94/n,.006,.006,metal,'matte',true)}
  if(reception){box(0,.73,-.41,.99,.53,.15,c);soft(0,1,-.38,1,.035,.24,light,'matte');for(let i=0;i<18;i++)box(-.46+i*.054,.58,-.491,.017,.52,.012,wood,'wood',true);computer(.15,.1,-1);pot(-.37,-.35,.11)}
  else if(bar&&f.accessories!==false){soft(-.27,1.16,-.03,.21,.30,.60,metal,'metal',true,{accessory:true});box(-.27,1.29,.08,.11,.09,.014,'#9cbdc0','glass',true,{accessory:true});box(-.27,1.04,.17,.19,.018,.32,'#b5c0bd','metal',true,{accessory:true});for(const x of[.19,.29])cyl(x,1.055,.1,.05,.11,.16,light,'matte',true,{accessory:true})}
  else if(!bar){soft(-.29,1.003,0,.23,.012,.64,'#829ca0','metal',true);soft(-.29,1.01,0,.19,.012,.52,'#c3d5d5','matte',true);cyl(-.29,1.11,-.32,.013,.22,.04,metal,'metal',true);box(-.29,1.22,-.23,.015,.025,.19,metal,'metal',true);if(f.accessories!==false){soft(.28,1.004,0,.26,.008,.68,dark,'matte',true,{accessory:true});for(const x of[.22,.34])for(const z of[-.17,.17])cyl(x,1.01,z,.075,.006,.19,'#657373','metal',true,{accessory:true})}}
 }
 else if(kind==='sink'){
  if(id==='basin')soft(0,.44,-.16,.38,.86,.42,c);else{box(0,.43,0,.95,.86,.91,c);box(0,.43,.46,.90,.80,.02,tint(c,7));handle(.18,.61,.485,.03)}
  soft(0,.94,0,1,.11,1,light);oval(0,.983,.05,.73,.024,.68,'#9eb8bd');oval(0,.99,.05,.56,.015,.51,'#dce8e7', 'matte',true);cyl(0,1,-.33,.065,.19,.065,metal,'metal',true);box(0,1.09,-.19,.055,.028,.28,metal,'metal',true);cyl(0,1.005,.06,.05,.005,.05,metal,'metal',true);
 }
 else if(kind==='wc'){
  oval(0,.23,.07,.72,.46,.66,c);oval(0,.50,.12,.98,.17,.74,light);oval(0,.587,.13,.72,.035,.54,'#9eb8bd');oval(0,.60,.13,.56,.025,.42,'#e0e9e7','matte',true);soft(0,.71,-.34,.89,.57,.24,c);soft(0,.995,-.34,.94,.018,.27,light);cyl(0,1.008,-.34,.17,.008,.055,'#9caba7','metal',true);
 }
 else if(kind==='plant'){
  cyl(0,.145,0,.67,.29,.67,'#c6c4b8');cyl(0,.29,0,.60,.012,.60,'#5f5842','matte',true);cyl(0,.52,0,.025,.48,.025,'#756e46','matte');
  for(let i=0;i<12;i++){const a=i*2.4,y=.42+i*.044;oval(Math.cos(a)*.22,y,Math.sin(a)*.22,.41,.11,.19,tint(c,(i%3-1)*12),'leaf',i%3===0,{ry:-a,rz:Math.cos(a)*.35})}oval(0,.94,0,.16,.12,.16,c,'leaf');
 }
 else if(kind==='model'){
  box(0,.43,0,.88,.86,.85,tint(c,-8));soft(0,.96,0,1,.08,1,c);box(0,1.008,0,.92,.016,.91,'#b7c7ac');box(0,1.023,0,.05,.012,.88,'#e4e5db','matte',true);for(let i=0;i<4;i++){box(-.33+i*.22,1.18,(i%2-.5)*.23,.14,.32+i%2*.19,.45,light);box(-.33+i*.22,1.36+i%2*.19,(i%2-.5)*.23,.12,.015,.42,'#d1d7d0','matte',true)}for(let i=0;i<7;i++)oval(-.4+i*.13,1.057,.4,.043,.067,.066,'#648668','leaf',true);
 }
 else if(kind==='printer'){
  box(0,.32,0,.98,.64,.97,c);for(const y of[.16,.45]){box(0,y,.49,.94,.26,.02,tint(c,7));handle(0,y+.05,.51,.30)}soft(0,.79,0,.77,.30,.72,'#536260');soft(0,.96,-.03,.79,.04,.73,light);box(0,.87,.373,.58,.095,.01,dark,'matte',true);box(0,.81,.41,.50,.012,.12,light,'matte',true);box(.24,.94,.30,.13,.012,.15,'#9bbcc0','glass',true);
 }
 else if(kind==='screen'){
  soft(0,.025,0,.42,.05,.96,metal,'metal');box(0,.20,-.12,.04,.36,.15,metal,'metal');soft(0,.60,0,1,.80,.39,dark);box(0,.61,-.204,.947,.718,.017,'#809ca3','glass');box(0,.21,-.21,.035,.008,.007,light,'matte',true);
 }
 else if(kind==='rug'){
  soft(0,.5,0,1,1,1,c,'fabric',false,{radius:.025});for(const z of[-.465,.465])box(0,1.001,z,.94,.05,.006,tint(c,-20),'fabric',true);for(const x of[-.475,.475])box(x,1.001,0,.004,.05,.93,tint(c,-20),'fabric',true);
 }
 else if(kind==='stair'){
  for(let i=0;i<10;i++){box(-.26,(i+1)/40,.46-i*.071,.46,(i+1)/20,.072,c);box(.26,(20-i)/40,.46-i*.071,.46,(20-i)/20,.072,c)}box(0,.485,-.37,.98,.03,.26,c);
  for(const x of[-.49,.49]){for(let i=0;i<5;i++)box(x,.28+i*.105,.40-i*.13,.008,.25,.009,metal,'metal',true);box(x,.65,0,.012,.015,.93,metal,'metal',true,{rx:-.39})}
 }
 else box(0,.5,0,1,1,1,c);
 return quality==='simple'?parts.filter(p=>!p.detail):parts;
}

export function geometryKey(f:FurnitureSpec,quality='detailed'){return [furnitureId(f),f.kind,f.w,f.d,f.h,mainColor(f),f.finish,f.accessories!==false,quality].join('|')}
