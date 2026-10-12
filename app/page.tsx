"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type CollectionTab = "motor" | "wagons" | "compositions";
type Tab = CollectionTab | "data";
type Control = "analogica" | "digital";
type ImportantCv = { number: number; initial: string; current: string };
type Loco = {
  id: string; name: string; manufacturer: string; reference: string; company: string;
  series: string; locomotiveType: string; scale: string; era: string; powerSystem: string;
  control: Control; address: string; decoder: string; importantCvs: ImportantCv[];
  sound: boolean; smoke: boolean; runningState: string; aestheticState: string;
  originalBox: boolean; accessories: boolean; lastMaintenance: string;
  maintenanceState: string; notes: string; photo: string; createdAt: number;
  purchaseDate: string; purchasePrice: string; purchaseStore: string; secondHand: boolean;
  weightGrams: string; lengthMm: string;
};
type LocoForm = Omit<Loco, "id" | "createdAt">;
type WagonKind = "Coche de viajeros" | "Vagón de mercancías" | "Furgón" | "Otro";
type Wagon = {
  id: string; createdAt: number; photo: string; name: string; kind: WagonKind | "";
  manufacturer: string; reference: string; company: string; registration: string;
  scale: string; era: string; administration: string; system: string; coupling: string;
  conservation: string; originalBox: boolean; purchaseDate: string; purchasePrice: string;
  purchaseStore: string; secondHand: boolean; weightGrams: string; lengthMm: string;
  notes: string; passengerClass: string; family: string; axles: string;
  interiorLighting: boolean; tailLights: boolean; wheelPickup: boolean; livery: string;
  assignedTrain: string; freightCategory: string; railwayCode: string; representedLoad: string;
  loadIncluded: boolean; removableLoad: boolean; commercialDecoration: string;
  brakeCabin: boolean; setName: string; usualComposition: string; quantity: string;
  runningState: string; modifications: string; maintenanceHistory: string;
};
type WagonForm = Omit<Wagon, "id" | "createdAt">;
type Composition = { id: string; createdAt: number; name: string; locomotiveId: string; wagonIds: string[]; notes: string };
type CompositionForm = Omit<Composition, "id" | "createdAt">;

const LOCO_KEY = "deposito-avaf-v1";
const WAGON_KEY = "deposito-avaf-wagons-v2";
const COMPOSITION_KEY = "deposito-avaf-compositions-v2";
const APP_VERSION = "2.3";
const APP_DATE = "Octubre 2026";

const BLANK_LOCO: LocoForm = {
  name:"",manufacturer:"",reference:"",company:"",series:"",locomotiveType:"",scale:"",
  era:"",powerSystem:"",control:"analogica",address:"",decoder:"",importantCvs:[],
  sound:false,smoke:false,runningState:"",aestheticState:"",originalBox:false,accessories:false,
  lastMaintenance:"",maintenanceState:"",notes:"",photo:"",
  purchaseDate:"",purchasePrice:"",purchaseStore:"",secondHand:false,weightGrams:"",lengthMm:"",
};
const BLANK_WAGON: WagonForm = {
  photo:"",name:"",kind:"",manufacturer:"",reference:"",company:"",registration:"",scale:"",
  era:"",administration:"",system:"",coupling:"",conservation:"",originalBox:false,purchaseDate:"",
  purchasePrice:"",purchaseStore:"",secondHand:false,weightGrams:"",lengthMm:"",
  notes:"",passengerClass:"",family:"",axles:"",interiorLighting:false,
  tailLights:false,wheelPickup:false,livery:"",assignedTrain:"",freightCategory:"",
  railwayCode:"",representedLoad:"",loadIncluded:false,removableLoad:false,
  commercialDecoration:"",brakeCabin:false,setName:"",usualComposition:"",quantity:"1",
  runningState:"",modifications:"",maintenanceHistory:"",
};
const BLANK_COMPOSITION: CompositionForm = { name:"", locomotiveId:"", wagonIds:[], notes:"" };
const OPTIONS = {
  locomotiveType:["Vapor","Diésel","Eléctrica","Automotor diésel","Automotor eléctrico","Tranvía","Otra"],
  scale:["H0","N","Z","0","1","G","TT","Otra"], era:["I","II","III","IV","V","VI","Sin determinar"],
  powerSystem:["2 carriles CC","3 carriles CA","Otro"],
  runningState:["Funciona correctamente","Necesita revisión","Averiada","En reparación"],
  aestheticState:["Excelente","Bueno","Con señales de uso","Necesita restauración"],
  maintenanceState:["Al día","Próximo a revisión","Pendiente","No consta"],
  kind:["Coche de viajeros","Vagón de mercancías","Furgón","Otro"],
  system:["2 carriles","3 carriles"], conservation:["Excelente","Bueno","Con señales de uso","Necesita restauración"],
  passengerClass:["Primera","Segunda","Mixto","Literas","Camas","Restaurante","Salón","Furgón","Otro"],
  freightCategory:["Cerrado","Plataforma","Borde bajo","Borde alto","Tolva","Cisterna","Portacontenedores","Frigorífico","Transporte de vehículos","Ganado","Especial","Otro"],
  wagonRunning:["Listo para circular","Necesita revisión","Fuera de servicio","En reparación"],
};

function Icon({ name }: { name: "train"|"plus"|"search"|"edit"|"trash"|"close"|"camera"|"check"|"download"|"upload"|"transfer"|"chevron"|"copy"|"left"|"right" }) {
  const paths = {
    train:<><path d="M7 3.5h10a3 3 0 0 1 3 3V17H4V6.5a3 3 0 0 1 3-3Z"/><path d="M7 7h10v6H7zM7 17l-3 4M17 17l3 4M8 20h8"/><circle cx="8" cy="17" r="1.3"/><circle cx="16" cy="17" r="1.3"/></>,
    plus:<path d="M12 5v14M5 12h14"/>, search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m19 19-4-4"/></>,
    transfer:<><path d="M7 16V4m0 0L3.5 7.5M7 4l3.5 3.5M17 8v12m0 0 3.5-3.5M17 20l-3.5-3.5"/></>,
    edit:<path d="m14 5 5 5M5 19l1-4L16 5a2 2 0 0 1 3 3L9 18z"/>,
    trash:<><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></>,
    close:<path d="m6 6 12 12M18 6 6 18"/>, camera:<><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.2"/></>,
    check:<path d="m5 12 4 4L19 6"/>, download:<><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 20h14"/></>,
    upload:<><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>, chevron:<path d="m8 10 4 4 4-4"/>,
    copy:<><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    left:<path d="m15 18-6-6 6-6"/>, right:<path d="m9 18 6-6-6-6"/>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">{paths[name]}</svg>;
}

function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function normalizeLoco(item: Partial<Loco>): Loco {
  return {
    ...BLANK_LOCO,...item,id:item.id||makeId(),createdAt:item.createdAt||Date.now(),
    importantCvs:Array.isArray(item.importantCvs) ? item.importantCvs.filter((cv)=>Number.isInteger(cv?.number)).map((cv)=>({number:cv.number,initial:String(cv.initial??""),current:String(cv.current??"")})) : [],
  };
}
function normalizeWagon(item: Partial<Wagon>): Wagon {
  return {...BLANK_WAGON,...item,id:item.id||makeId(),createdAt:item.createdAt||Date.now()};
}
function normalizeComposition(item: Partial<Composition>): Composition {
  return {...BLANK_COMPOSITION,...item,id:item.id||makeId(),createdAt:item.createdAt||Date.now(),wagonIds:Array.isArray(item.wagonIds)?item.wagonIds.filter((id)=>typeof id==="string"):[]};
}
function isRecord(value:unknown):value is Record<string,unknown> {return typeof value==="object"&&value!==null&&!Array.isArray(value)}
function text(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").trim(); }
function shrinkPhoto(file: File): Promise<string> {
  return new Promise((resolve,reject)=>{
    const reader=new FileReader(); reader.onerror=reject; reader.onload=()=>{
      const image=new Image(); image.onerror=reject; image.onload=()=>{
        const ratio=Math.min(1,720/Math.max(image.width,image.height)); const canvas=document.createElement("canvas");
        canvas.width=Math.round(image.width*ratio); canvas.height=Math.round(image.height*ratio);
        const ctx=canvas.getContext("2d"); if(!ctx) return reject(); ctx.drawImage(image,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",.78));
      }; image.src=String(reader.result);
    }; reader.readAsDataURL(file);
  });
}
function SelectField({label,value,options,onChange,required=false}:{label:string;value:string;options:string[];onChange:(v:string)=>void;required?:boolean}) {
  return <label className="field"><span>{label}{required?" *":""}</span><select required={required} value={value} onChange={(e)=>onChange(e.target.value)}><option value="">Seleccionar…</option>{options.map((o)=><option key={o}>{o}</option>)}</select></label>;
}
function Photo({src,alt}:{src:string;alt:string}) {
  return <span className="loco-thumb">{src ? <img src={src} alt={alt}/> : <span className="placeholder"><Icon name="train"/></span>}</span>;
}
function Check({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}) {
  return <label className="check-card"><input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)}/><span><i><Icon name="check"/></i><strong>{label}</strong></span></label>;
}

export default function Home() {
  const [tab,setTab]=useState<Tab>("motor");
  const previousTab=useRef<CollectionTab>("motor");
  const [locos,setLocos]=useState<Loco[]>([]);
  const [wagons,setWagons]=useState<Wagon[]>([]);
  const [compositions,setCompositions]=useState<Composition[]>([]);
  const [ready,setReady]=useState(false);
  const [toast,setToast]=useState("");
  const [availableVersion,setAvailableVersion]=useState("");
  const importInput=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    let active=true;
    const checkVersion=async()=>{
      if(document.visibilityState==="hidden")return;
      try{
        const url=new URL("version.json",location.href);
        url.searchParams.set("check",String(Date.now()));
        const response=await fetch(url,{cache:"no-store"});
        if(!response.ok)return;
        const manifest=await response.json() as {version?:string};
        const version=manifest.version;
        if(!active||!version||version.localeCompare(APP_VERSION,undefined,{numeric:true})<=0)return;
        setAvailableVersion(version);
        if(document.querySelector(".overlay form")||sessionStorage.getItem("material-rodante-reload")==version)return;
        sessionStorage.setItem("material-rodante-reload",version);
        const next=new URL(location.href);
        next.searchParams.set("app-version",version);
        location.replace(next.href);
      }catch{/* La colección sigue disponible sin conexión. */}
    };
    void checkVersion();
    const interval=window.setInterval(()=>void checkVersion(),5*60*1000);
    const onFocus=()=>void checkVersion();
    window.addEventListener("focus",onFocus);
    document.addEventListener("visibilitychange",onFocus);
    return()=>{active=false;window.clearInterval(interval);window.removeEventListener("focus",onFocus);document.removeEventListener("visibilitychange",onFocus)};
  },[]);

  useEffect(()=>{
    let nextLocos:Loco[]=[];let nextWagons:Wagon[]=[];let nextCompositions:Composition[]=[];let loadError=false;
    try {
      const old=JSON.parse(localStorage.getItem(LOCO_KEY)||"[]") as Partial<Loco>[];
      const savedWagons=JSON.parse(localStorage.getItem(WAGON_KEY)||"[]") as Partial<Wagon>[];
      const savedCompositions=JSON.parse(localStorage.getItem(COMPOSITION_KEY)||"[]") as Partial<Composition>[];
      nextLocos=Array.isArray(old)?old.map(normalizeLoco):[];
      nextWagons=Array.isArray(savedWagons)?savedWagons.map(normalizeWagon):[];
      nextCompositions=Array.isArray(savedCompositions)?savedCompositions.map(normalizeComposition):[];
    } catch { loadError=true; }
    const timer=window.setTimeout(()=>{setLocos(nextLocos);setWagons(nextWagons);setCompositions(nextCompositions);setReady(true);if(loadError)setToast("No se pudieron recuperar todos los datos guardados")},0);
    return()=>clearTimeout(timer);
  },[]);
  useEffect(()=>{ if(ready) try{localStorage.setItem(LOCO_KEY,JSON.stringify(locos));}catch{const timer=window.setTimeout(()=>setToast("No queda espacio de almacenamiento"),0);return()=>clearTimeout(timer)}},[locos,ready]);
  useEffect(()=>{ if(ready) try{localStorage.setItem(WAGON_KEY,JSON.stringify(wagons));}catch{const timer=window.setTimeout(()=>setToast("No queda espacio de almacenamiento"),0);return()=>clearTimeout(timer)}},[wagons,ready]);
  useEffect(()=>{ if(ready) try{localStorage.setItem(COMPOSITION_KEY,JSON.stringify(compositions));}catch{const timer=window.setTimeout(()=>setToast("No queda espacio de almacenamiento"),0);return()=>clearTimeout(timer)}},[compositions,ready]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(""),3500);return()=>clearTimeout(timer)},[toast]);

  const openData=()=>{if(tab!=="data")previousTab.current=tab;setTab("data")};
  const closeData=()=>setTab(previousTab.current);
  const exportData=()=>{
    const payload={application:"Mi material rodante",version:APP_VERSION,exportedAt:new Date().toISOString(),locomotives:locos,wagons,compositions};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download=`material-rodante-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
    setToast("Copia completa exportada");
  };
  const importData=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    try{
      const parsed:unknown=JSON.parse(await file.text());
      let rawLocos:unknown[];let rawWagons:unknown[]=[];let rawCompositions:unknown[]=[];
      if(Array.isArray(parsed))rawLocos=parsed;
      else if(isRecord(parsed)&&Array.isArray(parsed.locomotives)
        &&(parsed.application===undefined||parsed.application==="Mi material rodante")
        &&(parsed.version===undefined||(typeof parsed.version==="string"&&parsed.version.localeCompare(APP_VERSION,undefined,{numeric:true})<=0))
        &&(parsed.wagons===undefined||Array.isArray(parsed.wagons))
        &&(parsed.compositions===undefined||Array.isArray(parsed.compositions))){
        rawLocos=parsed.locomotives;rawWagons=(parsed.wagons||[]) as unknown[];rawCompositions=(parsed.compositions||[]) as unknown[];
      }else throw new Error("Formato incompatible");
      const validItem=(item:unknown,defaults:Record<string,unknown>)=>isRecord(item)&&typeof item.name==="string"
        &&(item.id===undefined||typeof item.id==="string")
        &&(item.createdAt===undefined||(typeof item.createdAt==="number"&&Number.isFinite(item.createdAt)))
        &&Object.entries(defaults).every(([key,initial])=>item[key]===undefined||(Array.isArray(initial)?Array.isArray(item[key]):typeof item[key]===typeof initial));
      if(!rawLocos.every((item)=>validItem(item,BLANK_LOCO)
          &&isRecord(item)&&(item.importantCvs===undefined||(Array.isArray(item.importantCvs)
            &&item.importantCvs.every((cv)=>isRecord(cv)&&Number.isInteger(cv.number)
              &&(cv.initial===undefined||typeof cv.initial==="string"||typeof cv.initial==="number")
              &&(cv.current===undefined||typeof cv.current==="string"||typeof cv.current==="number")))))
        ||!rawWagons.every((item)=>validItem(item,BLANK_WAGON))
        ||!rawCompositions.every((item)=>validItem(item,BLANK_COMPOSITION)
          &&isRecord(item)&&(item.wagonIds===undefined||(Array.isArray(item.wagonIds)
            &&item.wagonIds.every((id)=>typeof id==="string")))))throw new Error("Registros inválidos");
      const newLocos=(rawLocos as Partial<Loco>[]).map(normalizeLoco);
      const newWagons=(rawWagons as Partial<Wagon>[]).map(normalizeWagon);
      const newCompositions=(rawCompositions as Partial<Composition>[]).map(normalizeComposition);
      const message=`La copia contiene ${newLocos.length} locomotoras, ${newWagons.length} vagones y ${newCompositions.length} composiciones. Al importarla se sustituirán todos los datos y fotografías actuales; únicamente quedarán los de este archivo. ¿Continuar?`;
      if(!confirm(message))return;
      setLocos(newLocos);setWagons(newWagons);setCompositions(newCompositions);
      setToast("Datos importados correctamente");
    }catch{setToast("El archivo no contiene una copia válida");}
  };

  return <main>
    <header className="topbar"><div className="bar-inner">
      <a className="brand" href="#" aria-label="Volver a la colección" onClick={(event)=>{event.preventDefault();closeData()}}><img className="brand-shield" src="escudo-avaf.png" alt="Escudo de la Asociación Valenciana de Amigos del Ferrocarril"/><span><strong>MI MATERIAL RODANTE</strong><small>COLECCIÓN FERROVIARIA</small></span></a>
      <button className="data-access" type="button" onClick={openData} aria-current={tab==="data"?"page":undefined}><Icon name="transfer"/><span>Importar / exportar datos</span></button>
    </div></header>
    {tab!=="data"&&<nav className="main-tabs" aria-label="Secciones principales">
      {([["motor","Material motor"],["wagons","Vagones"],["compositions","Composiciones"]] as [CollectionTab,string][]).map(([key,label])=>
        <button key={key} className={tab===key?"active":""} type="button" onClick={()=>setTab(key)}>{label}<small>{key==="motor"?locos.length:key==="wagons"?wagons.length:compositions.length}</small></button>
      )}
    </nav>}

    {!ready?<section className="content"><div className="empty"><p>Abriendo tu colección…</p></div></section>:
      tab==="data"?<section className="content data-content">
        <button className="data-back" type="button" onClick={closeData}><Icon name="left"/> Volver a la colección</button>
        <header className="data-intro"><p className="eyebrow dark">TU COLECCIÓN</p><h1>Gestión de datos</h1><p>Los datos de tu colección se guardan en este navegador. Desde aquí puedes crear una copia de seguridad o recuperar una copia guardada anteriormente.</p></header>
        <div className="data-cards">
          <article className="data-card"><span className="data-card-icon"><Icon name="upload"/></span><h2>Exportar datos</h2><p>Guarda una copia de tus datos para tenerlos en un lugar seguro y poder llevártelos a otro dispositivo y utilizarlos en esta misma aplicación.</p><button className="primary" type="button" onClick={exportData}><Icon name="upload"/> Exportar datos</button></article>
          <article className="data-card"><span className="data-card-icon"><Icon name="download"/></span><h2>Importar datos</h2><p>Recupera tus datos previamente guardados seleccionando el archivo de copia de seguridad. Los datos contenidos en ese archivo sustituirán completamente a los actuales. Desde ese momento, únicamente aparecerán los datos de la copia importada.</p><button className="primary" type="button" onClick={()=>importInput.current?.click()}><Icon name="download"/> Importar datos</button><input ref={importInput} hidden type="file" accept="application/json,.json" onChange={importData}/></article>
        </div>
        <aside className="data-recommendation"><strong>Recomendación</strong><p>Realiza copias de seguridad periódicas, especialmente antes de cambiar de dispositivo o realizar modificaciones importantes.</p></aside>
      </section>:
      tab==="motor"?<MotorTab locos={locos} setLocos={setLocos} compositions={compositions} setToast={setToast}/>:
      tab==="wagons"?<WagonsTab wagons={wagons} setWagons={setWagons} compositions={compositions} setToast={setToast}/>:
      <CompositionsTab compositions={compositions} setCompositions={setCompositions} locos={locos} wagons={wagons} setToast={setToast}/>
    }
    <footer className="app-footer"><div className="footer-inner"><p>Creada por <strong>V. Fluixá (Socio 482 AVAF).</strong><span>Versión {APP_VERSION} · {APP_DATE}</span></p><img className="footer-shield" src="escudo-avaf.png" alt="Escudo AVAF"/></div></footer>
    {availableVersion&&<div className="update-notice" role="status"><span>Versión {availableVersion} disponible. Guarda la ficha antes de actualizar.</span><button type="button" onClick={()=>{if(document.querySelector(".overlay form")){setToast("Guarda o cierra la ficha primero");return}sessionStorage.removeItem("material-rodante-reload");const next=new URL(location.href);next.searchParams.set("app-version",availableVersion);location.replace(next.href)}}>Actualizar</button></div>}
    {toast&&<div className="toast" role="status">{toast}</div>}
  </main>;
}

function MotorTab({locos,setLocos,compositions,setToast}:{locos:Loco[];setLocos:React.Dispatch<React.SetStateAction<Loco[]>>;compositions:Composition[];setToast:(s:string)=>void}) {
  const [control,setControl]=useState<"todas"|Control>("todas");
  const [typeFilter,setTypeFilter]=useState("todos");
  const [draft,setDraft]=useState(""); const [query,setQuery]=useState("");
  const [editing,setEditing]=useState<Loco|null>(null); const [viewing,setViewing]=useState<Loco|null>(null); const [removing,setRemoving]=useState<Loco|null>(null);
  const [form,setForm]=useState<LocoForm>(BLANK_LOCO); const [cvOpen,setCvOpen]=useState(false);
  const [nearFooter,setNearFooter]=useState(false);
  const photoInput=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    const footer=document.querySelector(".app-footer");
    if(!footer||!('IntersectionObserver' in window))return;
    const observer=new IntersectionObserver(([entry])=>setNearFooter(entry.isIntersecting),{rootMargin:"0px 0px 110px 0px"});
    observer.observe(footer);
    return()=>observer.disconnect();
  },[]);
  const visible=useMemo(()=>locos.filter((l)=>control==="todas"||l.control===control).filter((l)=>{
    if(typeFilter==="todos")return true;const t=text(l.locomotiveType);return typeFilter==="automotor"?t.startsWith("automotor"):t===typeFilter;
  }).filter((l)=>!query||text([l.name,l.manufacturer,l.reference,l.company,l.series,l.locomotiveType,l.address].join(" ")).includes(text(query))).sort((a,b)=>b.createdAt-a.createdAt),[locos,control,typeFilter,query]);
  const update=<K extends keyof LocoForm>(key:K,value:LocoForm[K])=>setForm((f)=>({...f,[key]:value}));
  const openNew=()=>{setEditing({} as Loco);setForm(BLANK_LOCO);setCvOpen(false)};
  const openEdit=(l:Loco)=>{const{id:_,createdAt:__,...fields}=l;void _;void __;setViewing(null);setEditing(l);setForm(fields);setCvOpen(false)};
  const save=(e:FormEvent)=>{e.preventDefault();const clean={...form,name:form.name.trim(),manufacturer:form.manufacturer.trim(),reference:form.reference.trim(),company:form.company.trim(),series:form.series.trim(),purchaseStore:form.secondHand?"":form.purchaseStore.trim(),address:form.control==="digital"?form.address:"",decoder:form.control==="digital"?form.decoder:"",importantCvs:form.control==="digital"?form.importantCvs:[],sound:form.control==="digital"&&form.sound};
    if(editing?.id){setLocos((list)=>list.map((l)=>l.id===editing.id?{...l,...clean}:l));setToast("Ficha actualizada");}else{setLocos((list)=>[...list,{...clean,id:makeId(),createdAt:Date.now()}]);setToast("Locomotora añadida");}setEditing(null);
  };
  const addPhoto=async(e:ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(file)try{update("photo",await shrinkPhoto(file));}catch{setToast("No se pudo preparar la imagen")}};
  const usedIn=(id:string)=>compositions.filter((c)=>c.locomotiveId===id).map((c)=>c.name);
  const deleteNow=()=>{if(!removing)return;setLocos((list)=>list.filter((l)=>l.id!==removing.id));setRemoving(null);setToast("Locomotora eliminada")};
  const typeLabel:Record<string,string>={vapor:"Vapor",electrica:"Eléctricas",diesel:"Diésel",automotor:"Automotores",tranvia:"Tranvías"};
  return <section className="content tab-content">
    <div className="stats">{([["todas","Total",locos.length],["digital","Digitales",locos.filter((l)=>l.control==="digital").length],["analogica","Analógicas",locos.filter((l)=>l.control==="analogica").length]] as const).map(([k,label,count])=><button className={`stat ${control===k?"active":""}`} key={k} onClick={()=>setControl(k)}><strong>{count}</strong><span>{label}</span></button>)}</div>
    <div className="toolbar"><form className="search-form" onSubmit={(e)=>{e.preventDefault();setQuery(draft)}}><label className="searchbox"><Icon name="search"/><input value={draft} onChange={(e)=>setDraft(e.target.value)} placeholder="Buscar por modelo, fabricante, referencia o compañía…"/>{(draft||query)&&<button type="button" onClick={()=>{setDraft("");setQuery("")}}><Icon name="close"/></button>}</label><button className="search-submit">Buscar</button></form><button className="primary desktop-add" onClick={openNew}><Icon name="plus"/> Nueva locomotora</button></div>
    <div className="type-filter-bar"><label>Filtrar por tipo</label><select value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)}><option value="todos">Todos los tipos</option><option value="vapor">Vapor</option><option value="electrica">Eléctrica</option><option value="diesel">Diésel</option><option value="automotor">Automotor</option><option value="tranvia">Tranvía</option></select></div>
    <div className="section-title"><div><p className="eyebrow dark">{typeFilter==="todos"?"MATERIAL MOTOR":`MATERIAL MOTOR · ${typeLabel[typeFilter]}`}</p><h2>{typeFilter!=="todos"?typeLabel[typeFilter]:control==="todas"?"Todas las locomotoras":control==="digital"?"Locomotoras digitales":"Locomotoras analógicas"}</h2></div><span>{visible.length} unidades</span></div>
    {visible.length?<div className="loco-table"><div className="loco-table-head"><span>Fotografía</span><span>Locomotora</span><span>Dirección digital</span></div>{visible.map((l)=><button className="loco-row" key={l.id} onClick={()=>setViewing(l)}><Photo src={l.photo} alt={l.name}/><span className="loco-name">{l.name}</span><span className="loco-address">{l.control==="digital"?(l.address||"Sin asignar"):"—"}</span></button>)}</div>:<Empty title={locos.length?"No hay coincidencias":"Tu depósito está esperando"} text={locos.length?"Prueba con otros filtros.":"Añade tu primera locomotora."} action={openNew}/>}
    <button className={`fab ${nearFooter?"near-footer":""}`} type="button" onClick={openNew} aria-label="Nueva locomotora"><Icon name="plus"/></button>
    {editing&&<div className="overlay" onMouseDown={()=>setEditing(null)}><section className="sheet" onMouseDown={(e)=>e.stopPropagation()}><div className="handle"/><header className="sheet-head"><div><p className="eyebrow dark">{editing.id?"EDITAR MATERIAL":"ALTA DE MATERIAL"}</p><h2>{editing.id?"Editar locomotora":"Nueva locomotora"}</h2></div><button className="icon-btn" onClick={()=>setEditing(null)}><Icon name="close"/></button></header>
      <form onSubmit={save}><PhotoPicker photo={form.photo} inputRef={photoInput} onPhoto={addPhoto} onRemove={()=>update("photo","")}/>
        <fieldset className="form-section"><legend>Datos básicos</legend><div className="two-cols">
          <Field label="Nombre o título *" required value={form.name} onChange={(v)=>update("name",v)}/><Field label="Fabricante *" required value={form.manufacturer} onChange={(v)=>update("manufacturer",v)}/>
          <Field label="Referencia del fabricante" value={form.reference} onChange={(v)=>update("reference",v)}/><Field label="Compañía ferroviaria" value={form.company} onChange={(v)=>update("company",v)}/>
          <Field label="Serie o matrícula" value={form.series} onChange={(v)=>update("series",v)}/><SelectField label="Tipo de locomotora" value={form.locomotiveType} options={OPTIONS.locomotiveType} onChange={(v)=>update("locomotiveType",v)}/>
          <SelectField label="Escala" value={form.scale} options={OPTIONS.scale} onChange={(v)=>update("scale",v)}/><SelectField label="Época ferroviaria" value={form.era} options={OPTIONS.era} onChange={(v)=>update("era",v)}/>
        </div></fieldset>
        <fieldset className="form-section"><legend>Características técnicas</legend><div className="two-cols"><SelectField label="Sistema de alimentación" value={form.powerSystem} options={OPTIONS.powerSystem} onChange={(v)=>update("powerSystem",v)}/><SelectField label="Estado de funcionamiento" value={form.runningState} options={OPTIONS.runningState} onChange={(v)=>update("runningState",v)}/><SelectField label="Estado estético" value={form.aestheticState} options={OPTIONS.aestheticState} onChange={(v)=>update("aestheticState",v)}/></div><div className="check-grid"><Check label="Embalaje original" checked={form.originalBox} onChange={(v)=>update("originalBox",v)}/><Check label="Accesorios" checked={form.accessories} onChange={(v)=>update("accessories",v)}/></div></fieldset>
        <fieldset className="form-section"><legend>Digitalización</legend><div className="control-options">{(["analogica","digital"] as Control[]).map((k)=><label key={k}><input type="radio" checked={form.control===k} onChange={()=>update("control",k)}/><span><i className={`dot ${k}`}/><strong>{k==="digital"?"Digital":"Analógica"}</strong></span></label>)}</div>{form.control==="digital"&&<><div className="two-cols"><Field label="Decodificador" value={form.decoder} onChange={(v)=>update("decoder",v)}/><Field label="Dirección digital" value={form.address} onChange={(v)=>update("address",v.replace(/\D/g,""))}/></div><button className="cv-picker-button" type="button" onClick={()=>setCvOpen(!cvOpen)}><span><strong>CVs importantes</strong><small>{form.importantCvs.length} seleccionadas</small></span><Icon name="chevron"/></button>{cvOpen&&<div className="cv-picker">{Array.from({length:300},(_,i)=>i+1).map((n)=><label key={n}><input type="checkbox" checked={form.importantCvs.some((cv)=>cv.number===n)} onChange={()=>update("importantCvs",form.importantCvs.some((cv)=>cv.number===n)?form.importantCvs.filter((cv)=>cv.number!==n):[...form.importantCvs,{number:n,initial:"",current:""}].sort((a,b)=>a.number-b.number))}/><span>CV{n}</span></label>)}</div>}{form.importantCvs.length>0&&<div className="cv-list"><div className="cv-list-head"><span>CV</span><span>Inicial</span><span>Actual</span><span/></div>{form.importantCvs.map((cv)=><div className="cv-row" key={cv.number}><strong>CV{cv.number}</strong><input value={cv.initial} onChange={(e)=>update("importantCvs",form.importantCvs.map((x)=>x.number===cv.number?{...x,initial:e.target.value.replace(/\D/g,"")}:x))}/><input value={cv.current} onChange={(e)=>update("importantCvs",form.importantCvs.map((x)=>x.number===cv.number?{...x,current:e.target.value.replace(/\D/g,"")}:x))}/><button type="button" onClick={()=>update("importantCvs",form.importantCvs.filter((x)=>x.number!==cv.number))}><Icon name="close"/></button></div>)}</div>}</>}<div className="check-grid"><Check label="Sonido" checked={form.sound} onChange={(v)=>update("sound",v)}/><Check label="Generador de humo" checked={form.smoke} onChange={(v)=>update("smoke",v)}/></div></fieldset>
        <fieldset className="form-section"><legend>Compra y medidas</legend><div className="two-cols purchase-grid">
          <Field type="date" label="Fecha de compra" value={form.purchaseDate} onChange={(v)=>update("purchaseDate",v)}/>
          <Field type="number" label="Precio de compra (€)" value={form.purchasePrice} onChange={(v)=>update("purchasePrice",v)}/>
          <Field label="Establecimiento" value={form.purchaseStore} disabled={form.secondHand} onChange={(v)=>update("purchaseStore",v)}/>
          <Check label="Segunda mano" checked={form.secondHand} onChange={(v)=>setForm((f)=>({...f,secondHand:v,purchaseStore:v?"":f.purchaseStore}))}/>
          <div className="purchase-full"><Field type="number" label="Longitud (mm)" value={form.lengthMm} onChange={(v)=>update("lengthMm",v)}/></div>
          <div className="purchase-full"><Field type="number" label="Peso (g)" value={form.weightGrams} onChange={(v)=>update("weightGrams",v)}/></div>
        </div></fieldset>
        <fieldset className="form-section"><legend>Mantenimiento</legend><div className="two-cols"><Field type="date" label="Último mantenimiento" value={form.lastMaintenance} onChange={(v)=>update("lastMaintenance",v)}/><SelectField label="Situación de mantenimiento" value={form.maintenanceState} options={OPTIONS.maintenanceState} onChange={(v)=>update("maintenanceState",v)}/></div></fieldset>
        <fieldset className="form-section"><legend>Notas</legend><Area label="Información adicional" value={form.notes} onChange={(v)=>update("notes",v)}/></fieldset>
        <div className="form-actions"><button type="button" onClick={()=>setEditing(null)}>Cancelar</button><button className="save">Guardar</button></div>
      </form></section></div>}
    {viewing&&<Detail title={viewing.name} photo={viewing.photo} rows={[["Fabricante",viewing.manufacturer],["Referencia",viewing.reference],["Compañía",viewing.company],["Serie o matrícula",viewing.series],["Tipo",viewing.locomotiveType],["Escala",viewing.scale],["Época",viewing.era],["Sistema",viewing.powerSystem],["Control",viewing.control],["Dirección",viewing.address],["Decodificador",viewing.decoder],["Funcionamiento",viewing.runningState],["Estado estético",viewing.aestheticState],["Mantenimiento",viewing.maintenanceState],["Fecha de compra",viewing.purchaseDate],["Precio de compra (€)",viewing.purchasePrice],["Establecimiento",viewing.secondHand?"":viewing.purchaseStore],["Segunda mano",viewing.secondHand?"Sí":"No"],["Peso (g)",viewing.weightGrams],["Longitud (mm)",viewing.lengthMm]]} notes={viewing.notes} onClose={()=>setViewing(null)} onEdit={()=>openEdit(viewing)} onDelete={()=>{setViewing(null);setRemoving(viewing)}}/>}
    {removing&&<DeleteConfirm title="¿Eliminar esta locomotora?" name={removing.name} usages={usedIn(removing.id)} onCancel={()=>setRemoving(null)} onConfirm={deleteNow}/>}
  </section>;
}

function WagonsTab({wagons,setWagons,compositions,setToast}:{wagons:Wagon[];setWagons:React.Dispatch<React.SetStateAction<Wagon[]>>;compositions:Composition[];setToast:(s:string)=>void}) {
  const emptyFilters={photo:"",name:"",company:"",registration:"",reference:""};const [filters,setFilters]=useState(emptyFilters);
  const [editing,setEditing]=useState<Wagon|null>(null);const [viewing,setViewing]=useState<Wagon|null>(null);const [removing,setRemoving]=useState<Wagon|null>(null);const [form,setForm]=useState<WagonForm>(BLANK_WAGON);
  const photoInput=useRef<HTMLInputElement>(null);
  const visible=useMemo(()=>wagons.filter((w)=>Object.entries(filters).every(([key,value])=>!value||text(String(w[key as keyof Wagon]||"")).includes(text(value)))).sort((a,b)=>b.createdAt-a.createdAt),[wagons,filters]);
  const update=<K extends keyof WagonForm>(key:K,value:WagonForm[K])=>setForm((f)=>({...f,[key]:value}));
  const openNew=()=>{setEditing({} as Wagon);setForm(BLANK_WAGON)};const openEdit=(w:Wagon)=>{const{id:_,createdAt:__,...rest}=w;void _;void __;setViewing(null);setEditing(w);setForm(rest)};
  const save=(e:FormEvent)=>{e.preventDefault();const clean={...form,name:form.name.trim(),reference:form.reference.trim(),company:form.company.trim(),registration:form.registration.trim(),purchaseStore:form.secondHand?"":form.purchaseStore.trim()};if(editing?.id){setWagons((list)=>list.map((w)=>w.id===editing.id?{...w,...clean}:w));setToast("Ficha actualizada");}else{setWagons((list)=>[...list,{...clean,id:makeId(),createdAt:Date.now()}]);setToast("Vehículo añadido");}setEditing(null)};
  const addPhoto=async(e:ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(file)try{update("photo",await shrinkPhoto(file));}catch{setToast("No se pudo preparar la imagen")}};
  const usedIn=(id:string)=>compositions.filter((c)=>c.wagonIds.includes(id)).map((c)=>c.name);
  const details=(w:Wagon):[string,string][]=>[["Tipo",w.kind],["Fabricante",w.manufacturer],["Referencia",w.reference],["Compañía",w.company],["Matrícula",w.registration],["Escala",w.scale],["Época",w.era],["Administración o país",w.administration],["Sistema",w.system],["Enganche",w.coupling],["Conservación",w.conservation],["Fecha de compra",w.purchaseDate],["Precio de compra (€)",w.purchasePrice],["Establecimiento",w.secondHand?"":w.purchaseStore],["Segunda mano",w.secondHand?"Sí":"No"],["Peso (g)",w.weightGrams],["Longitud (mm)",w.lengthMm],["Clase",w.passengerClass],["Serie o familia",w.family],["Ejes o bogies",w.axles],["Librea",w.livery],["Tren",w.assignedTrain],["Categoría",w.freightCategory],["Código ferroviario",w.railwayCode],["Carga",w.representedLoad],["Decoración comercial",w.commercialDecoration],["Set",w.setName],["Composición habitual",w.usualComposition],["Unidades iguales",w.quantity],["Estado de circulación",w.runningState],["Modificaciones",w.modifications],["Historial de mantenimiento",w.maintenanceHistory]];
  return <section className="content tab-content wagons-content">
    <div className="section-title collection-heading"><div><p className="eyebrow dark">COCHES Y VAGONES</p><h2>Vagones</h2></div><button className="primary" onClick={openNew}><Icon name="plus"/> Nuevo vehículo</button></div>
    <div className="filter-panel"><div className="filter-panel-head"><strong>Filtros combinables</strong><button type="button" onClick={()=>setFilters(emptyFilters)}>Limpiar todos</button></div><div className="wagon-filter-grid">{[["name","Nombre o tipo"],["company","Compañía"],["registration","Matrícula"],["reference","Referencia"]].map(([key,label])=><label key={key}><span>{label}</span><input value={filters[key as keyof typeof filters]} onChange={(e)=>setFilters((f)=>({...f,[key]:e.target.value}))} placeholder={`Filtrar ${label.toLowerCase()}`}/></label>)}</div></div>
    <div className="section-title results-title"><span>{visible.length} {visible.length===1?"registro":"registros"}</span></div>
    {visible.length?<div className="wagon-table"><div className="wagon-table-head"><span>Fotografía</span><span>Nombre o tipo</span><span>Compañía</span><span>Matrícula</span><span>Referencia</span></div>{visible.map((w)=><button className="wagon-row" key={w.id} onClick={()=>setViewing(w)}><Photo src={w.photo} alt={w.name}/><span><strong>{w.name||w.kind}</strong><small>{w.kind}</small></span><span>{w.company||"—"}</span><span>{w.registration||"—"}</span><span>{w.reference||"—"}</span></button>)}</div>:<Empty title={wagons.length?"No hay coincidencias":"Aún no hay vagones"} text={wagons.length?"Limpia o cambia alguno de los filtros.":"Añade coches de viajeros y vagones de mercancías."} action={openNew}/>}
    {editing&&<div className="overlay" onMouseDown={()=>setEditing(null)}><section className="sheet wagon-sheet" onMouseDown={(e)=>e.stopPropagation()}><div className="handle"/><header className="sheet-head"><div><p className="eyebrow dark">GESTIÓN DE VAGONES</p><h2>{editing.id?"Editar vehículo":"Nuevo vehículo"}</h2></div><button className="icon-btn" onClick={()=>setEditing(null)}><Icon name="close"/></button></header><form onSubmit={save}>
      <PhotoPicker photo={form.photo} inputRef={photoInput} onPhoto={addPhoto} onRemove={()=>update("photo","")}/>
      <fieldset className="form-section"><legend>Datos comunes</legend><div className="two-cols"><SelectField required label="Tipo de material" value={form.kind} options={OPTIONS.kind} onChange={(v)=>update("kind",v as WagonKind)}/><Field required label="Nombre personalizado *" value={form.name} onChange={(v)=>update("name",v)}/><Field label="Fabricante" value={form.manufacturer} onChange={(v)=>update("manufacturer",v)}/><Field label="Referencia del fabricante" value={form.reference} onChange={(v)=>update("reference",v)}/><Field label="Compañía ferroviaria" value={form.company} onChange={(v)=>update("company",v)}/><Field label="Matrícula o numeración" value={form.registration} onChange={(v)=>update("registration",v)}/><SelectField label="Escala" value={form.scale} options={OPTIONS.scale} onChange={(v)=>update("scale",v)}/><SelectField label="Época ferroviaria" value={form.era} options={OPTIONS.era} onChange={(v)=>update("era",v)}/><Field label="Administración o país" value={form.administration} onChange={(v)=>update("administration",v)}/><SelectField label="Sistema" value={form.system} options={OPTIONS.system} onChange={(v)=>update("system",v)}/><Field label="Tipo de enganche" value={form.coupling} onChange={(v)=>update("coupling",v)}/><SelectField label="Estado de conservación" value={form.conservation} options={OPTIONS.conservation} onChange={(v)=>update("conservation",v)}/></div><Check label="Embalaje original" checked={form.originalBox} onChange={(v)=>update("originalBox",v)}/></fieldset>
      <fieldset className="form-section"><legend>Compra y medidas</legend><div className="two-cols purchase-grid">
        <Field type="date" label="Fecha de compra" value={form.purchaseDate} onChange={(v)=>update("purchaseDate",v)}/>
        <Field type="number" label="Precio de compra (€)" value={form.purchasePrice} onChange={(v)=>update("purchasePrice",v)}/>
        <Field label="Establecimiento" value={form.purchaseStore} disabled={form.secondHand} onChange={(v)=>update("purchaseStore",v)}/>
        <Check label="Segunda mano" checked={form.secondHand} onChange={(v)=>setForm((f)=>({...f,secondHand:v,purchaseStore:v?"":f.purchaseStore}))}/>
        <div className="purchase-full"><Field type="number" label="Longitud (mm)" value={form.lengthMm} onChange={(v)=>update("lengthMm",v)}/></div>
        <div className="purchase-full"><Field type="number" label="Peso (g)" value={form.weightGrams} onChange={(v)=>update("weightGrams",v)}/></div>
      </div></fieldset>
      {form.kind==="Coche de viajeros"&&<fieldset className="form-section dynamic-section"><legend>Coche de viajeros</legend><div className="two-cols"><SelectField label="Clase" value={form.passengerClass} options={OPTIONS.passengerClass} onChange={(v)=>update("passengerClass",v)}/><Field label="Serie o familia" value={form.family} onChange={(v)=>update("family",v)}/><Field label="Número de ejes o tipo de bogie" value={form.axles} onChange={(v)=>update("axles",v)}/><Field label="Decoración o librea" value={form.livery} onChange={(v)=>update("livery",v)}/><Field label="Composición o tren al que pertenece" value={form.assignedTrain} onChange={(v)=>update("assignedTrain",v)}/></div><div className="check-grid"><Check label="Iluminación interior" checked={form.interiorLighting} onChange={(v)=>update("interiorLighting",v)}/><Check label="Luces de cola" checked={form.tailLights} onChange={(v)=>update("tailLights",v)}/><Check label="Toma de corriente por ruedas" checked={form.wheelPickup} onChange={(v)=>update("wheelPickup",v)}/></div></fieldset>}
      {form.kind==="Vagón de mercancías"&&<fieldset className="form-section dynamic-section"><legend>Vagón de mercancías</legend><div className="two-cols"><SelectField label="Categoría" value={form.freightCategory} options={OPTIONS.freightCategory} onChange={(v)=>update("freightCategory",v)}/><Field label="Código o tipo ferroviario" value={form.railwayCode} onChange={(v)=>update("railwayCode",v)}/><Field label="Número de ejes o bogies" value={form.axles} onChange={(v)=>update("axles",v)}/><Field label="Tipo de carga representada" value={form.representedLoad} onChange={(v)=>update("representedLoad",v)}/><Field label="Empresa o decoración comercial" value={form.commercialDecoration} onChange={(v)=>update("commercialDecoration",v)}/></div><div className="check-grid"><Check label="Carga incluida" checked={form.loadIncluded} onChange={(v)=>update("loadIncluded",v)}/><Check label="Carga desmontable" checked={form.removableLoad} onChange={(v)=>update("removableLoad",v)}/><Check label="Garita de freno" checked={form.brakeCabin} onChange={(v)=>update("brakeCabin",v)}/></div></fieldset>}
      <fieldset className="form-section"><legend>Gestión de la colección</legend><div className="two-cols"><Field label="Conjunto o set" value={form.setName} onChange={(v)=>update("setName",v)}/><Field label="Composición habitual" value={form.usualComposition} onChange={(v)=>update("usualComposition",v)}/><Field type="number" label="Cantidad de unidades iguales" value={form.quantity} onChange={(v)=>update("quantity",v)}/><SelectField label="Estado de circulación" value={form.runningState} options={OPTIONS.wagonRunning} onChange={(v)=>update("runningState",v)}/></div><Area label="Modificaciones realizadas" value={form.modifications} onChange={(v)=>update("modifications",v)}/><Area label="Historial de mantenimiento" value={form.maintenanceHistory} onChange={(v)=>update("maintenanceHistory",v)}/><Area label="Notas" value={form.notes} onChange={(v)=>update("notes",v)}/></fieldset>
      <div className="form-actions"><button type="button" onClick={()=>setEditing(null)}>Cancelar</button><button className="save">Guardar ficha</button></div>
    </form></section></div>}
    {viewing&&<Detail title={viewing.name||viewing.kind} photo={viewing.photo} rows={details(viewing)} notes={viewing.notes} onClose={()=>setViewing(null)} onEdit={()=>openEdit(viewing)} onDelete={()=>{setViewing(null);setRemoving(viewing)}}/>}
    {removing&&<DeleteConfirm title="¿Eliminar este vehículo?" name={removing.name||removing.kind} usages={usedIn(removing.id)} onCancel={()=>setRemoving(null)} onConfirm={()=>{setWagons((list)=>list.filter((w)=>w.id!==removing.id));setRemoving(null);setToast("Vehículo eliminado")}}/>}
  </section>;
}

function CompositionsTab({compositions,setCompositions,locos,wagons,setToast}:{compositions:Composition[];setCompositions:React.Dispatch<React.SetStateAction<Composition[]>>;locos:Loco[];wagons:Wagon[];setToast:(s:string)=>void}) {
  const [editing,setEditing]=useState<Composition|null>(null);const [form,setForm]=useState<CompositionForm>(BLANK_COMPOSITION);const [removing,setRemoving]=useState<Composition|null>(null);const [dragIndex,setDragIndex]=useState<number|null>(null);
  const getLoco=(id:string)=>locos.find((l)=>l.id===id);const getWagon=(id:string)=>wagons.find((w)=>w.id===id);
  const openNew=()=>{setEditing({} as Composition);setForm(BLANK_COMPOSITION)};const openEdit=(c:Composition)=>{setEditing(c);setForm({name:c.name,locomotiveId:c.locomotiveId,wagonIds:[...c.wagonIds],notes:c.notes})};
  const move=(from:number,to:number)=>{if(to<0||to>=form.wagonIds.length)return;setForm((f)=>{const ids=[...f.wagonIds];const[item]=ids.splice(from,1);ids.splice(to,0,item);return{...f,wagonIds:ids}})};
  const drop=(to:number,e:DragEvent)=>{e.preventDefault();if(dragIndex!==null)move(dragIndex,to);setDragIndex(null)};
  const save=(e:FormEvent)=>{e.preventDefault();if(!form.locomotiveId||form.wagonIds.length===0){setToast("Selecciona una locomotora y al menos un vagón");return}if(editing?.id){setCompositions((list)=>list.map((c)=>c.id===editing.id?{...c,...form}:c));setToast("Composición actualizada")}else{setCompositions((list)=>[...list,{...form,id:makeId(),createdAt:Date.now()}]);setToast("Composición guardada")}setEditing(null)};
  return <section className="content tab-content compositions-content"><div className="section-title collection-heading"><div><p className="eyebrow dark">TRENES GUARDADOS</p><h2>Composiciones</h2></div><button className="primary" onClick={openNew}><Icon name="plus"/> Nueva composición</button></div>
    {compositions.length?<div className="composition-grid">{compositions.map((c)=>{const loco=getLoco(c.locomotiveId);return <article className="composition-card" key={c.id}><header><div><p className="eyebrow dark">COMPOSICIÓN</p><h3>{c.name}</h3></div><span>{c.wagonIds.length} vehículos</span></header><div className="train-strip compact">{loco?<TrainUnit photo={loco.photo} label={loco.name} locomotive/>:<MissingUnit label="Locomotora eliminada"/>}{c.wagonIds.map((id,i)=>{const w=getWagon(id);return w?<TrainUnit key={`${id}-${i}`} photo={w.photo} label={w.registration||w.name}/>:<MissingUnit key={`${id}-${i}`} label="Vehículo eliminado"/>})}</div>{c.notes&&<p className="composition-notes">{c.notes}</p>}<div className="card-actions"><button onClick={()=>openEdit(c)}><Icon name="edit"/> Editar</button><button onClick={()=>{setCompositions((list)=>[...list,{...c,id:makeId(),createdAt:Date.now(),name:`${c.name} (copia)`,wagonIds:[...c.wagonIds]}]);setToast("Composición duplicada")}}><Icon name="copy"/> Duplicar</button><button className="delete" onClick={()=>setRemoving(c)}><Icon name="trash"/></button></div></article>})}</div>:<Empty title="Aún no hay composiciones" text="Combina una locomotora y tus vagones en el orden real del tren." action={openNew}/>}
    {editing&&<div className="overlay composition-overlay" onMouseDown={()=>setEditing(null)}><section className="sheet composition-sheet" onMouseDown={(e)=>e.stopPropagation()}><div className="handle"/><header className="sheet-head"><div><p className="eyebrow dark">CONSTRUCTOR DE TRENES</p><h2>{editing.id?"Editar composición":"Nueva composición"}</h2></div><button className="icon-btn" onClick={()=>setEditing(null)}><Icon name="close"/></button></header><form onSubmit={save}>
      <fieldset className="form-section"><legend>Datos básicos</legend><Field required label="Nombre de la composición *" value={form.name} onChange={(v)=>setForm((f)=>({...f,name:v}))}/><label className="field"><span>Locomotora *</span><select required value={form.locomotiveId} onChange={(e)=>setForm((f)=>({...f,locomotiveId:e.target.value}))}><option value="">Seleccionar…</option>{locos.map((l)=><option value={l.id} key={l.id}>{l.name}</option>)}</select></label>{locos.length>0&&<div className="select-labels">{locos.map((l)=><button type="button" className={form.locomotiveId===l.id?"selected":""} key={l.id} onClick={()=>setForm((f)=>({...f,locomotiveId:l.id}))}><Photo src={l.photo} alt={l.name}/><span>{l.name}</span></button>)}</div>}</fieldset>
      <fieldset className="form-section"><legend>Añadir vagones</legend>{wagons.length?<div className="select-labels">{wagons.map((w)=><button type="button" key={w.id} onClick={()=>setForm((f)=>({...f,wagonIds:[...f.wagonIds,w.id]}))}><Photo src={w.photo} alt={w.name}/><span>{w.registration||w.name}</span><i><Icon name="plus"/></i></button>)}</div>:<p className="form-help">Primero debes registrar algún vehículo en la pestaña Vagones.</p>}</fieldset>
      <fieldset className="form-section train-builder"><legend>Orden real del tren</legend><div className="train-strip">{form.locomotiveId&&getLoco(form.locomotiveId)?<TrainUnit photo={getLoco(form.locomotiveId)!.photo} label={getLoco(form.locomotiveId)!.name} locomotive/>:<MissingUnit label="Elige locomotora"/>}{form.wagonIds.map((id,index)=>{const w=getWagon(id);return <div className="sortable-unit" key={`${id}-${index}`} draggable onDragStart={()=>setDragIndex(index)} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>drop(index,e)}>{w?<TrainUnit photo={w.photo} label={w.registration||w.name}/>:<MissingUnit label="No disponible"/>}<div className="unit-actions"><button type="button" disabled={index===0} onClick={()=>move(index,index-1)}><Icon name="left"/></button><button type="button" onClick={()=>setForm((f)=>({...f,wagonIds:f.wagonIds.filter((_,i)=>i!==index)}))}><Icon name="trash"/></button><button type="button" disabled={index===form.wagonIds.length-1} onClick={()=>move(index,index+1)}><Icon name="right"/></button></div></div>})}</div><p className="form-help">Arrastra las miniaturas o usa las flechas para cambiar el orden.</p></fieldset>
      <fieldset className="form-section"><legend>Notas</legend><Area label="Notas opcionales" value={form.notes} onChange={(v)=>setForm((f)=>({...f,notes:v}))}/></fieldset>
      <div className="form-actions"><button type="button" onClick={()=>setEditing(null)}>Cancelar</button><button className="save">Guardar composición</button></div>
    </form></section></div>}
    {removing&&<DeleteConfirm title="¿Eliminar esta composición?" name={removing.name} usages={[]} onCancel={()=>setRemoving(null)} onConfirm={()=>{setCompositions((list)=>list.filter((c)=>c.id!==removing.id));setRemoving(null);setToast("Composición eliminada")}}/>}
  </section>;
}

function Field({label,value,onChange,required=false,type="text",disabled=false}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;type?:string;disabled?:boolean}) {return <label className={`field ${disabled?"disabled":""}`}><span>{label}</span><input required={required} type={type} min={type==="number"?"0":undefined} step={type==="number"?"any":undefined} disabled={disabled} value={value} onChange={(e)=>onChange(e.target.value)}/></label>}
function Area({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) {return <label className="field"><span>{label}</span><textarea rows={4} value={value} onChange={(e)=>onChange(e.target.value)}/></label>}
function PhotoPicker({photo,inputRef,onPhoto,onRemove}:{photo:string;inputRef:React.RefObject<HTMLInputElement|null>;onPhoto:(e:ChangeEvent<HTMLInputElement>)=>void;onRemove:()=>void}) {return <div className="photo-row"><button className={`photo-pick ${photo?"has-photo":""}`} type="button" onClick={()=>inputRef.current?.click()}>{photo?<img src={photo} alt="Vista previa"/>:<><Icon name="camera"/><span>Añadir foto</span></>}</button><div><strong>Fotografía principal</strong><p>Haz una foto o selecciónala de tu galería.</p>{photo&&<button className="text-btn" type="button" onClick={onRemove}>Quitar foto</button>}</div><input ref={inputRef} hidden type="file" accept="image/*" capture="environment" onChange={onPhoto}/></div>}
function Empty({title,text:description,action}:{title:string;text:string;action:()=>void}) {return <div className="empty"><span className="empty-sign"><Icon name="train"/></span><h3>{title}</h3><p>{description}</p><button className="primary" onClick={action}><Icon name="plus"/> Añadir</button></div>}
function Detail({title,photo,rows,notes,onClose,onEdit,onDelete}:{title:string;photo:string;rows:[string,string][];notes:string;onClose:()=>void;onEdit:()=>void;onDelete:()=>void}) {return <div className="overlay" onMouseDown={onClose}><section className="sheet" onMouseDown={(e)=>e.stopPropagation()}><div className="handle"/><header className="sheet-head"><div><p className="eyebrow dark">FICHA COMPLETA</p><h2>{title}</h2></div><button className="icon-btn" onClick={onClose}><Icon name="close"/></button></header><div className="detail-photo">{photo?<img src={photo} alt={title}/>:<span className="placeholder"><Icon name="train"/></span>}</div><dl className="detail-grid">{rows.filter(([,v])=>v).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{notes&&<section className="detail-notes"><h3>Notas</h3><p>{notes}</p></section>}<div className="detail-actions"><button className="delete-detail" onClick={onDelete}><Icon name="trash"/> Eliminar</button><button className="save" onClick={onEdit}><Icon name="edit"/> Editar ficha</button></div></section></div>}
function DeleteConfirm({title,name,usages,onCancel,onConfirm}:{title:string;name:string;usages:string[];onCancel:()=>void;onConfirm:()=>void}) {return <div className="overlay centered"><section className="confirm"><span className="warning"><Icon name="trash"/></span><h2>{title}</h2><p>Vas a borrar <strong>{name}</strong>. {usages.length>0&&<>Este material aparece en: <strong>{usages.join(", ")}</strong>. La composición conservará el aviso de material no disponible. </>}Esta acción no se puede deshacer.</p><div><button onClick={onCancel}>Conservar</button><button className="danger" onClick={onConfirm}>Sí, eliminar</button></div></section></div>}
function TrainUnit({photo,label,locomotive=false}:{photo:string;label:string;locomotive?:boolean}) {return <div className={`train-unit ${locomotive?"locomotive":""}`}><div>{photo?<img src={photo} alt={label}/>:<span className="placeholder"><Icon name="train"/></span>}</div><small>{label}</small></div>}
function MissingUnit({label}:{label:string}) {return <div className="train-unit missing"><div><Icon name="train"/></div><small>{label}</small></div>}
