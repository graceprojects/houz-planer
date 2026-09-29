import {Box,Check} from 'lucide-react';
import {Switch} from '@/components/ui/switch';
import {FINISHES,furnitureDescription,supportsAccessories,type FurnitureSpec,type Finish} from './furnitureGeometry';
import {FurniturePreview} from './FurniturePreview';
export function finishOptions(item:FurnitureSpec){
 const soft=['chair','sofa','armchair','stool','rug'].includes(item.kind);
 return FINISHES.map(f=>({...f,name:soft?({original:'Свой цвет',oak:'Песочный',walnut:'Карамель',white:'Молочный',graphite:'Графит'}[f.id]):f.name}));
}
export function FurnitureInspect({item,onInspect}:{item:FurnitureSpec;onInspect:()=>void}){
 return <><button className="furniture-inspect" onClick={onInspect} aria-label="Рассмотреть предмет в 3D"><FurniturePreview item={item}/><span><Box size={15}/>Рассмотреть в 3D</span></button><p className="furniture-description">{furnitureDescription(item)}</p></>;
}
export function FurnitureOptions({item,onChange}:{item:FurnitureSpec;onChange:(patch:{finish?:Finish;accessories?:boolean})=>void}){
 const finishes=['desk','table','meeting','round','chair','sofa','armchair','stool','cabinet','kitchen','reception','rug'].includes(item.kind);
 return <>{finishes&&<div className="finish-options"><span className="field-caption">{['chair','sofa','armchair','stool','rug'].includes(item.kind)?'Обивка и цвет':'Отделка'}</span><div className="finish-grid">{finishOptions(item).map(f=><button key={f.id} title={f.name} aria-label={'Отделка: '+f.name} aria-pressed={(item.finish||'original')===f.id} onClick={()=>onChange({finish:f.id})}><i style={{background:f.id==='original'?item.color:f.color}}>{(item.finish||'original')===f.id&&<Check size={14}/>}</i><span>{f.name}</span></button>)}</div></div>}{supportsAccessories(item)&&<label className="switch-row"><Switch checked={item.accessories!==false} onCheckedChange={accessories=>onChange({accessories})}/>Предметы на поверхности</label>}</>;
}
