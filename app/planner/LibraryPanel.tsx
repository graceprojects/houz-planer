'use client';
import {useState,useEffect,useRef} from 'react';
import {useLibraryDrag,type LibraryDrop,type ClientPoint} from './useLibraryDrag';
import {Search,X,ArrowLeft,Check,Layers,MousePointer2} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {CATALOG,mm} from './model';
import {KITS} from './kits';
import {IsoFurniture,IsoStructure} from './IsoPreview';
import {WALL_PRESETS,OPENING_PRESETS,type WallPreset,type OpeningPreset} from './presets';
export type LibrarySection='furniture'|'spaces'|'walls'|'glass'|'doors'|'windows'|'rooms';
function Dimension({label,value,onChange,min=.05,max=15}:{label:string;value:number;onChange:(n:number)=>void;min?:number;max?:number}){
 const [draft,setDraft]=useState(String(Math.round(value*1000)));useEffect(()=>setDraft(String(Math.round(value*1000))),[value]);
 const commit=()=>{const n=Number(draft)/1000;if(Number.isFinite(n)&&n>=min&&n<=max)onChange(n);else setDraft(String(Math.round(value*1000)))};
 return <label className="library-dimension">{label}<span><input aria-label={label} type="number" value={draft} min={min*1000} max={max*1000} step={50} onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur()}}/><small>мм</small></span></label>
}
export default function LibraryPanel({section,placing,wall,opening,roomName,onSection,onWall,onOpening,onPlace,onRoomName,onDrag,onDrop}:{section:LibrarySection;placing:string|null;wall:WallPreset;opening:OpeningPreset;roomName:string;onSection:(s:LibrarySection)=>void;onWall:(p:WallPreset)=>void;onOpening:(p:OpeningPreset)=>void;onPlace:(id:string)=>void;onRoomName:(s:string)=>void;onDrag:()=>void;onDrop:(payload:LibraryDrop,p:ClientPoint)=>void}){
 const [search,setSearch]=useState(''),[category,setCategory]=useState('Все'),[tab,setTab]=useState('furniture');
 const items=CATALOG.filter(t=>(category==='Все'||category===t.category)&&(`${t.name} ${t.category}`).toLowerCase().includes(search.toLowerCase()));
 const titles={spaces:'Пространства',furniture:'Мебель и предметы',walls:'Стены и перегородки',glass:'Витражи',doors:'Двери и проёмы',windows:'Окна',rooms:'Новое помещение'};
 const drag=useLibraryDrag(onDrag,onDrop),panel=useRef<HTMLElement>(null);useEffect(()=>{if(panel.current)panel.current.scrollTop=0},[section]);
 return <aside ref={panel} className="catalog-panel" aria-label="Каталог элементов"><div className="library-heading"><div><span className="library-eyebrow">БИБЛИОТЕКА</span><h2>{titles[section]}</h2></div>{section!=='furniture'&&<button className="icon-button" aria-label="Вернуться к мебели" title="Мебель" onClick={()=>onSection('furniture')}><ArrowLeft size={18}/></button>}</div>
 {section==='furniture'?<>
 <div className="search-field"><Search size={17}/><input aria-label="Поиск мебели" placeholder="Стол, диван, ресепшен…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Очистить поиск" onClick={()=>setSearch('')}><X size={15}/></button>}</div>
 <Tabs value={tab} onValueChange={setTab}><TabsList className="wide-tabs"><TabsTrigger value="furniture">Мебель</TabsTrigger><TabsTrigger value="kits">Комплекты</TabsTrigger></TabsList></Tabs>
 {tab==='furniture'?<><Select value={category} onValueChange={setCategory}><SelectTrigger className="category-select"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Все">Все предметы · {CATALOG.length}</SelectItem>{[...new Set(CATALOG.map(t=>t.category))].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><div className="library-result-count">Предметы: {items.length} · вид в объёме</div><div className="catalog-list">{items.map(t=><button className={'catalog-card'+(placing===t.id?' selected':'')} key={t.id} {...drag.handlers({itemId:t.id},t.name)} onClick={()=>drag.activate(()=>onPlace(t.id))} title={`Перетащите на план: ${t.name}`}><IsoFurniture item={t}/><strong>{t.name}</strong><span>{mm(t.w)} × {mm(t.d)} мм</span>{placing===t.id&&<Check className="card-check" size={16}/>}</button>)}</div>{!items.length&&<p className="empty-message">Ничего не найдено. Попробуйте другое название или категорию.</p>}</>:<div className="kit-list">{KITS.filter(k=>k.name.toLowerCase().includes(search.toLowerCase())).map(k=><button key={k.id} className={'kit-card'+(placing==='kit:'+k.id?' selected':'')} {...drag.handlers({itemId:'kit:'+k.id},k.name)} onClick={()=>drag.activate(()=>onPlace('kit:'+k.id))}><div className="kit-mark"><Layers size={24}/><span>{k.size}</span></div><b>{k.name}</b><span>{k.desc}</span></button>)}</div>}
 <p className="catalog-note">Перетащите карточку на план или нажмите её, затем нужное место. Размеры можно изменить.</p></>:section==='doors'||section==='windows'?<>
 <p className="library-instruction"><MousePointer2 size={17}/><span>Выберите вариант и нажмите на стену. Или перетащите карточку прямо на стену.</span></p>
 <div className="structure-list">{OPENING_PRESETS.filter(o=>section==='windows'?o.kind==='window':o.kind!=='window').map(o=><button key={o.id} className={'structure-card'+(o.id===opening.id?' selected':'')} {...drag.handlers({opening:opening.id===o.id?opening:o},o.name)} onClick={()=>drag.activate(()=>onOpening(o))}><IsoStructure opening={o.id===opening.id?opening:o}/><div><strong>{o.name}</strong><span>{mm(o.id===opening.id?opening.width:o.width)} × {mm(o.id===opening.id?opening.height:o.height)} мм</span><small>{o.description}</small></div>{o.id===opening.id&&<Check size={16}/>}</button>)}</div>
 <div className="library-settings"><h3>Размеры нового проёма</h3><div className="field-pair"><Dimension label="Ширина нового проёма" value={opening.width} min={.3} max={10} onChange={width=>onOpening({...opening,width})}/><Dimension label="Высота нового проёма" value={opening.height} min={.3} max={12} onChange={height=>onOpening({...opening,height})}/></div>{section==='windows'&&<Dimension label="Подоконник нового окна" value={opening.sill} min={0} max={5} onChange={sill=>onOpening({...opening,sill})}/>}</div>
 <p className="catalog-note">Проём остаётся привязан к стене. Точные размеры, секции окна и створки двери можно менять в свойствах.</p>
 </>:<>
 {section==='rooms'&&<label className="room-purpose-picker">Назначение помещения<select aria-label="Назначение нового помещения" value={roomName} onChange={e=>onRoomName(e.target.value)}>{['Новое помещение','Менеджер','Переговорная','Зона ожидания','Ресепшен','Кухня / отдых','Касса','Санузел','Бэк-офис','Кабинет руководителя'].map(n=><option key={n}>{n}</option>)}</select></label>}
 <p className="library-instruction"><MousePointer2 size={17}/><span>{section==='rooms'?'Нарисуйте прямоугольник. Стены, дверь и площадь появятся автоматически.':'Выберите тип, затем проведите стену на плане. Пробел временно включает руку.'}</span></p>
 <div className="structure-list">{WALL_PRESETS.filter(w=>section==='glass'?w.kind==='glass':section==='walls'?w.kind==='wall':true).map(w=><button key={w.id} className={'structure-card'+(w.id===wall.id?' selected':'')} onClick={()=>onWall(w)}><IsoStructure wall={w}/><div><strong>{w.name}</strong><span>{mm(w.thickness)} мм · h {mm(w.height)}</span><small>{w.description}</small></div>{w.id===wall.id&&<Check size={16}/>}</button>)}</div>
 <div className="library-settings"><h3>Параметры новой стены</h3><div className="field-pair"><Dimension label="Толщина новой стены" value={wall.thickness} min={.05} max={.6} onChange={thickness=>onWall({...wall,thickness})}/><Dimension label="Высота новой стены" value={wall.height} min={.3} max={15} onChange={height=>onWall({...wall,height})}/></div></div>
 <p className="catalog-note">Типы задают начальную толщину и высоту. Существующие стены меняются отдельно в свойствах.</p>
 </>}
 {drag.ghost}</aside>
}
