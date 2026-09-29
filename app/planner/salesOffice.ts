import type {Project} from './model';
import type {OfficeFormat,OfficeProgramme} from './programmeTypes';
import {spaces} from './geometry';
export const SPACE_GROUPS=[{id:'public',name:'Клиентский зал',color:'#e9dfcd'},{id:'sales',name:'Продажи и сделки',color:'#d7e7df'},{id:'team',name:'Команда',color:'#dde4ef'},{id:'service',name:'Сервис и быт',color:'#e5e4e0'}] as const;
export type SpacePurpose={id:string;name:string;group:typeof SPACE_GROUPS[number]['id'];mode:'room'|'zone'|'niche';areas:[number,number,number];quantities:[number,number,number];minW:number;minD:number;near:string[];away:string[];note:string;combined?:string;upper?:boolean};
const def=(id:string,name:string,group:SpacePurpose['group'],mode:SpacePurpose['mode'],areas:SpacePurpose['areas'],note:string,near:string[]=[],away:string[]=[],quantities:SpacePurpose['quantities']=[1,1,1],minW=1.5,minD=1.5,extra:Partial<SpacePurpose>={}):SpacePurpose=>({id,name,group,mode,areas,quantities,minW,minD,note,near,away,...extra});
// Areas are the user's preliminary programme, not statutory minima.
export const SPACE_PURPOSES:SpacePurpose[]=[
 def('entry','Входная группа','public','zone',[4,6,8],'Тамбур и понятный вход. Фактическое положение привяжите к входной двери.',['reception'],['kids']),
 def('reception','Ресепшен','public','zone',[9,12,18],'Администратор видит вход и направляет покупателя. Пост охраны при необходимости включается сюда.',['entry','waiting','model'],[],[1,1,1],3.2,2.6),
 def('guest-storage','Гардероб гостей','public','niche',[2,3,4],'Шкаф и место для коляски рядом со входом. Не перекрывать основной проход.',['entry','waiting'],[],[1,1,1],1.5,1.2),
 def('waiting','Ожидание / лаунж','public','zone',[15,22,30],'Мягкая зона рядом с ресепшеном. Из неё должна быть видна детская.',['reception','kids','coffee'],[],[1,1,1],3.6,3.2),
 def('coffee','Кофе-бар','public','zone',[5,12,18],'Приготовление и выдача напитков. Это не производственная кухня кафе.',['waiting','coffee-support'],['kids'],[1,1,1],3.2,1.5),
 def('kids','Детская зона','public','zone',[6,10,16],'В поле зрения родителей, вне основного прохода, подальше от входа и горячих напитков.',['waiting'],['entry','coffee'],[1,1,1],2.4,2.4),
 def('model','Макет и презентация','public','zone',[20,32,40],'Главная презентация проекта. В компактном офисе здесь же экран и образцы отделки.',['reception','sales-office','digital','materials'],[],[1,1,1],5,3.5),
 def('digital','Цифровая презентация','public','zone',[0,12,20],'Экран, конфигуратор или виртуальный тур.',['model'],[],[0,1,1],3,2.5,{combined:'В 200 м² объединена с зоной макета.'}),
 def('materials','Образцы материалов','public','zone',[0,8,16],'Отделка, двери, окна и комплектация. Полноценная шоу-квартира в площадь не включена.',['model'],[],[0,1,1],2.5,2,{combined:'В 200 м² объединены с зоной макета.'}),
 def('sales-office','Кабинет продаж','sales','room',[12,14,15],'Одно рабочее место менеджера и приём семьи. Этот кабинет уже является переговорной с покупателем.',['model','bank','signing'],['call-center'],[3,4,5],2.8,3.6),
 def('vip','VIP-переговорная','sales','room',[0,0,18],'Приватные встречи. В часы пик может принять ещё одного покупателя.',['sales-office'],['kids','call-center'],[0,0,1],3.6,4),
 def('meeting','Общая переговорная','sales','room',[12,18,24],'Совещания и групповые встречи. В 200 м² также подписание и банковский специалист по записи.',['sales-office','signing'],['call-center'],[1,1,1],3,3.6),
 def('signing','Оформление сделок','sales','room',[0,12,14],'Обсуждение и подписание документов. Простую подпись можно оставить у менеджера.',['sales-office','bank','support'],['call-center'],[0,1,1],2.8,3.6,{combined:'В 200 м² совмещено с универсальной переговорной.'}),
 def('bank','Банк / ипотека','sales','room',[0,12,12],'Консультации и документы. Касса и хранение наличных в этот модуль не входят.',['sales-office','signing'],['call-center'],[0,1,2],2.8,3.6,{combined:'В 200 м² приглашённый специалист принимает в переговорной.'}),
 def('director','Кабинет директора','team','room',[0,12,17],'Руководитель офиса. В компактном формате работает в общем служебном кабинете.',['support'],[],[0,1,1],2.8,3.6,{upper:true,combined:'В 200 м² рабочее место находится в служебном кабинете.'}),
 def('marketing','Маркетинг','team','room',[0,12,18],'Ориентир: два места в 400 м², два-три в 600 м². Посадку уточнить по мебели.',['support'],[],[0,1,1],3,3.6,{upper:true,combined:'В 200 м² отдельная команда не размещается.'}),
 def('call-center','Колл-центр','team','room',[0,12,18],'Отделить постоянные телефонные разговоры от переговоров с покупателями.',['support'],['sales-office','vip','meeting'],[0,1,1],3,3.6,{upper:true,combined:'В 200 м² предполагается работа команды вне офиса.'}),
 def('support','Служебный кабинет','team','room',[12,10,14],'Подготовка договоров и работа с базой. Приём клиента проходит у менеджера или в оформлении.',['archive','signing','director'],[],[1,1,1],2.8,3.4,{upper:true}),
 def('archive','Архив документов','team','room',[2,4,6],'Закрытое хранение. В 200 м² это запираемые шкафы с доступом, без отдельной комнаты.',['support'],['cleaning','staff-kitchen'],[1,1,1],1.5,1.2,{upper:true}),
 def('staff-kitchen','Кухня персонала','service','room',[10,14,20],'Разогрев и приём готовой еды. Размещать за границей клиентской части.',['staff-storage','staff-wc'],['cleaning','archive'],[1,1,1],3.2,2.8,{upper:true}),
 def('staff-storage','Шкафы персонала','service','niche',[2,4,6],'Одежда и личные вещи сотрудников. Отдельный кабинет не требуется.',['staff-kitchen'],[],[1,1,1],1.5,1.2,{upper:true}),
 def('guest-wc','Гостевые санузлы','service','room',[8,14,20],'Резерв гостевого блока с доступным санузлом. Число приборов, разделение и доступность уточняет проектировщик.',['waiting'],[],[1,1,1],2.4,2.4),
 def('staff-wc','Санузел персонала','service','room',[4,4,8],'Отдельно от гостевого блока. В большом офисе возможны два индивидуальных санузла.',['staff-kitchen'],[],[1,1,1],1.5,2,{upper:true}),
 def('cleaning','Моповая / уборочная','service','room',[3,3,4],'Мойка, инвентарь, тележка и закрытое хранение химии. Отдельное помещение.',['storage'],['staff-kitchen','coffee-support','archive'],[1,1,1],1.5,1.8,{upper:true}),
 def('storage','Склад расходников','service','room',[4,4,6],'Полиграфия, подарки и расходные материалы. Подвоз со служебной стороны.',['support'],[],[1,1,1],1.6,1.8,{upper:true}),
 def('server','Серверная / связь','service','room',[2,4,6],'Телекоммуникации. В компактном формате возможен технический шкаф; условия оборудования уточняются.',['technical'],[],[1,1,1],1.5,1.2,{upper:true}),
 def('technical','Техническая зона','service','room',[2,4,6],'Электрооборудование и инженерные узлы. Состав зависит от конкретного здания.',['server'],[],[1,1,1],1.5,1.2,{upper:true}),
 def('coffee-support','Подсобная кофе-бара','service','room',[2,4,6],'Посуда, мойка, запасы. Отделить от уборочной химии.',['coffee'],['cleaning'],[1,1,1],1.5,1.2)
];
export const purpose=(id:string)=>SPACE_PURPOSES.find(d=>d.id===id);
export const spaceColor=(id:string)=>SPACE_GROUPS.find(g=>g.id===purpose(id)?.group)?.color||'#e4eade';
export const spaceMode=(id:string,format:OfficeFormat)=>format===200&&['archive','server','technical','coffee-support'].includes(id)?'niche':purpose(id)?.mode||'zone';
export function createProgramme(format:OfficeFormat):OfficeProgramme{const index=[200,400,600].indexOf(format);return {format,reservePercent:20,items:SPACE_PURPOSES.map(d=>({purposeId:d.id,quantity:d.quantities[index],unitArea:d.areas[index]||d.areas.find(a=>a>0)!}))}}
export function programmeTotals(p:OfficeProgramme){const net=p.items.reduce((s,r)=>s+r.quantity*r.unitArea,0),gross=net/(1-p.reservePercent/100);return {net,gross,reserve:gross-net,groups:SPACE_GROUPS.map(g=>({...g,area:p.items.filter(r=>purpose(r.purposeId)?.group===g.id).reduce((s,r)=>s+r.quantity*r.unitArea,0)}))}}
export const buildingCapacity=(p:Project)=>p.width*p.depth+(p.mezzanine.enabled?(p.width-p.mezzanine.start)*p.depth:0);
export const programmeFor=(p:Project)=>p.programme||createProgramme(buildingCapacity(p)>=500?600:buildingCapacity(p)>=300?400:200);
export function placedProgramme(p:Project){const result=(p.plannedSpaces||[]).filter(z=>!z.level||p.mezzanine.enabled).map(z=>({id:z.id,purposeId:z.purposeId,name:z.name,area:z.w*z.d,level:z.level}));for(const l of p.mezzanine.enabled?[0,1]:[0])for(const r of spaces(p,l)){if(r.tag?.purposeId&&!result.some(z=>z.id===r.tag!.id))result.push({id:r.id,purposeId:r.tag.purposeId,name:r.name,area:r.area,level:l})}return result}
export function programmeChecks(p:OfficeProgramme){const qty=(id:string)=>p.items.find(r=>r.purposeId===id)?.quantity||0,out:string[]=[];
 for(const [id,msg]of[['guest-wc','Не предусмотрен гостевой санузел.'],['staff-wc','Не предусмотрен отдельный санузел персонала.'],['cleaning','Не предусмотрена отдельная моповая.'],['staff-kitchen','Не предусмотрена кухня персонала.'],['sales-office','Нет кабинетов продаж.']])if(!qty(id))out.push(msg);
 if(p.format===600&&qty('bank')<2)out.push('В исходном составе 600 м² предусмотрены два кабинета банка / ипотеки.');
 if(p.format===200&&!qty('bank')&&!qty('signing'))out.push('Банк и подписание используют общую переговорную по очереди; отдельные площади им не добавляются.');
 if(p.reservePercent<20)out.push('Резерв меньше исходных 20%: проверьте проходы, лестницу и перегородки на плане.');
 return out;
}
export const CUSTOMER_ROUTE=['Вход','Ресепшен','Макет / презентация','Менеджер','Банк при необходимости','Оформление','Выход'];
