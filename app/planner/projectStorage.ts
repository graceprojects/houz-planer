import {browserStorage} from './runtime';
import {projectSchema} from './validation';
import type {Project} from './model';
type Record = {id:string; name:string; updatedAt:number; revision:number; document:Project};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
let database:Promise<IDBDatabase>|undefined;
function openDatabase(){
 if(!database)database=new Promise<IDBDatabase>((resolve,reject)=>{
  const request=indexedDB.open('houz-planer-pages',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('projects',{keyPath:'id'});
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();database=undefined};resolve(db)};
  request.onerror=()=>{database=undefined;reject(request.error)};
  request.onblocked=()=>{database=undefined;reject(new Error('Закройте другие вкладки HOUZ PLANER и повторите.'))};
 });
 return database;
}
/** Same response contract as the hosted API; read/write revisions are atomic. */
export async function browserProjectRequest(url:string,init?:RequestInit):Promise<Response>{
 try{
  const write=init?.method==='POST';
  const body=write?JSON.parse(String(init?.body)):null;
  const document=write?projectSchema.parse(body.document):null;
  if(write&&(!Number.isInteger(body.revision)||body.revision<0))return json({error:'Некорректная версия проекта'},400);
  const db=await openDatabase();
  return await new Promise<Response>((resolve,reject)=>{
   const tx=db.transaction('projects',write?'readwrite':'readonly'),store=tx.objectStore('projects');
   let result:Response;
   tx.oncomplete=()=>resolve(result);
   tx.onerror=()=>reject(tx.error);
   tx.onabort=()=>reject(tx.error);
   if(write&&document){
    const request=store.get(document.id);
    request.onsuccess=()=>{
     const old=request.result as Record|undefined;
     if((old?.revision??0)!==body.revision){result=json({error:'Проект изменён в другом окне. Сохраните текущий план как копию.'},409);return}
     const revision=body.revision+1,updatedAt=Date.now();
     store.put({id:document.id,name:document.name,updatedAt,revision,document});
     result=json({revision,updatedAt});
    };
   }else{
    const id=new URL(url,'https://houz.local').searchParams.get('id');
    const request=id?store.get(id):store.getAll();
    request.onsuccess=()=>{if(id){result=request.result?json(request.result):json({error:'Проект не найден'},404)}else{
     const rows=(request.result as Record[]).sort((a,b)=>b.updatedAt-a.updatedAt);
     result=json({projects:rows.map(({id,name,updatedAt,revision})=>({id,name,updatedAt,revision}))});
    }};
   }
  });
 }catch{return json({error:'Не удалось сохранить или прочитать данные браузера. Скачайте файл проекта для резервной копии.'},503)}
}
export const projectRequest=(url:string,init?:RequestInit)=>browserStorage?browserProjectRequest(url,init):fetch(url,init);
