"use client";

import { ChangeEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";

type Align = "left" | "center" | "right";
type ElementKind = "text" | "icon" | "shape";
type CvElement = {
  id: string;
  kind: ElementKind;
  x: number; y: number; w: number; h: number;
  content: string;
  fontSize?: number; fontWeight?: number; color?: string; background?: string;
  align?: Align; opacity?: number; rotation?: number; radius?: number;
  locked?: boolean; hidden?: boolean; z: number; label: string;
};

const W = 794;
const H = 1123;
const STORAGE_KEY = "atelier-cv-syntiche-v1";

const initialElements: CvElement[] = [
  { id:"sidebar",kind:"shape",x:0,y:0,w:252,h:H,content:"",background:"#a9ddda",opacity:1,radius:0,z:0,label:"Sidebar menthe",locked:true },
  { id:"accent",kind:"shape",x:252,y:0,w:14,h:H,content:"",background:"#ecf8f7",opacity:1,radius:0,z:1,label:"Ligne décorative",locked:true },
  { id:"name",kind:"text",x:288,y:58,w:448,h:60,content:"Syntiche Monney",fontSize:38,fontWeight:800,color:"#203536",align:"left",z:5,label:"Nom" },
  { id:"role",kind:"text",x:290,y:122,w:430,h:34,content:"EMPLOYÉE POLYVALENTE EN RESTAURATION",fontSize:16,fontWeight:800,color:"#287f7a",align:"left",z:5,label:"Poste recherché" },
  { id:"contactTitle",kind:"text",x:30,y:72,w:190,h:32,content:"CONTACT",fontSize:17,fontWeight:800,color:"#173f3d",align:"left",z:5,label:"Titre contact" },
  { id:"phone",kind:"text",x:30,y:122,w:195,h:28,content:"☎  +33 7 43 68 02 04",fontSize:13,fontWeight:600,color:"#203536",align:"left",z:5,label:"Téléphone" },
  { id:"address",kind:"text",x:30,y:158,w:198,h:48,content:"⌖  222 rue des Postes\n59000 Lille",fontSize:12,fontWeight:500,color:"#203536",align:"left",z:5,label:"Adresse" },
  { id:"email",kind:"text",x:30,y:214,w:202,h:44,content:"✉  syntychemonney\n@gmail.com",fontSize:11,fontWeight:500,color:"#203536",align:"left",z:5,label:"E-mail" },
  { id:"profileTitle",kind:"text",x:290,y:198,w:430,h:30,content:"PROFIL",fontSize:18,fontWeight:800,color:"#287f7a",align:"left",z:5,label:"Titre profil" },
  { id:"profile",kind:"text",x:290,y:238,w:440,h:118,content:"Étudiante sérieuse, dynamique et polyvalente, je recherche un poste dans la restauration. Organisée et motivée, je souhaite contribuer efficacement au bon fonctionnement d’un établissement et à la satisfaction de ses clients.",fontSize:13,fontWeight:400,color:"#304445",align:"left",z:5,label:"Profil" },
  { id:"pathTitle",kind:"text",x:290,y:390,w:430,h:34,content:"PARCOURS ACADÉMIQUE",fontSize:18,fontWeight:800,color:"#287f7a",align:"left",z:5,label:"Titre parcours" },
  { id:"hei",kind:"text",x:290,y:440,w:450,h:106,content:"2025 - 2026\nCycle ingénieur - Systèmes énergétiques\nHEI, Hautes Études d’Ingénieur - Lille",fontSize:14,fontWeight:600,color:"#263b3c",align:"left",z:5,label:"HEI Lille" },
  { id:"bem",kind:"text",x:290,y:566,w:450,h:106,content:"2023 - 2025\nDeux premières années d’études supérieures\nBEM School of Technology - Abidjan",fontSize:14,fontWeight:600,color:"#263b3c",align:"left",z:5,label:"BEM Abidjan" },
  { id:"bac",kind:"text",x:290,y:692,w:450,h:110,content:"2022 - 2023\nBaccalauréat scientifique - Série C\nLycée Moderne de Jeunes Filles de Yopougon - Abidjan",fontSize:14,fontWeight:600,color:"#263b3c",align:"left",z:5,label:"Baccalauréat" },
  { id:"qualitiesTitle",kind:"text",x:30,y:328,w:190,h:30,content:"QUALITÉS",fontSize:17,fontWeight:800,color:"#173f3d",align:"left",z:5,label:"Titre qualités" },
  { id:"qualities",kind:"text",x:30,y:374,w:190,h:170,content:"• Fiabilité\n• Organisation\n• Gestion du temps\n• Autonomie\n• Polyvalence\n• Travail en équipe\n• Sens des responsabilités",fontSize:13,fontWeight:600,color:"#203536",align:"left",z:5,label:"Qualités" },
  { id:"languagesTitle",kind:"text",x:30,y:590,w:190,h:30,content:"LANGUES",fontSize:17,fontWeight:800,color:"#173f3d",align:"left",z:5,label:"Titre langues" },
  { id:"languages",kind:"text",x:30,y:632,w:190,h:72,content:"Français - À préciser\nAnglais - À préciser",fontSize:13,fontWeight:600,color:"#203536",align:"left",z:5,label:"Langues" },
  { id:"interestsTitle",kind:"text",x:30,y:750,w:190,h:30,content:"CENTRES D’INTÉRÊT",fontSize:17,fontWeight:800,color:"#173f3d",align:"left",z:5,label:"Titre centres d’intérêt" },
  { id:"interests",kind:"text",x:30,y:794,w:190,h:150,content:"• Sport\n• Mode\n• Danse\n• Musique\n• Lecture et chant\n• Découverte",fontSize:13,fontWeight:600,color:"#203536",align:"left",z:5,label:"Centres d’intérêt" },
  { id:"availabilityTitle",kind:"text",x:290,y:850,w:430,h:32,content:"OBJECTIF",fontSize:18,fontWeight:800,color:"#287f7a",align:"left",z:5,label:"Titre objectif" },
  { id:"availability",kind:"text",x:290,y:894,w:440,h:86,content:"Intégrer une équipe de restauration et mettre mon sérieux, mon dynamisme et ma capacité d’adaptation au service de l’accueil client et du bon déroulement du service.",fontSize:13,fontWeight:500,color:"#304445",align:"left",z:5,label:"Objectif" },
  { id:"cookieDeco",kind:"icon",x:661,y:1020,w:62,h:62,content:"🍪",fontSize:42,color:"#287f7a",opacity:.26,rotation:-14,z:3,label:"Cookie décoratif" },
  { id:"spoonDeco",kind:"icon",x:36,y:1012,w:70,h:70,content:"🥄",fontSize:45,color:"#287f7a",opacity:.2,rotation:22,z:3,label:"Cuillère décorative" },
];

const kitchenItems = ["🍪","🥄","🍴","🥣","🍰","🧁","🥐","🍞","☕","🫖","🍳","🥘","🧑‍🍳","🍽️","🥕","🍋","🌿","🧂","🔪","🥗"];
const palettes = [
  {name:"Menthe",sidebar:"#a9ddda",accent:"#287f7a",soft:"#ecf8f7"},
  {name:"Terracotta",sidebar:"#e8b39d",accent:"#9f4f39",soft:"#fff4ef"},
  {name:"Sauge",sidebar:"#c9d6bf",accent:"#52684d",soft:"#f3f6f0"},
  {name:"Vanille",sidebar:"#f4dca4",accent:"#8a6723",soft:"#fff9e9"},
  {name:"Bleu glacier",sidebar:"#bddde8",accent:"#2b6579",soft:"#eff8fb"},
];

const uid = () => Math.random().toString(36).slice(2,9);
const clone = (els:CvElement[]) => JSON.parse(JSON.stringify(els)) as CvElement[];

export default function Home() {
  const [elements,setElements] = useState<CvElement[]>(initialElements);
  const [selected,setSelected] = useState<string|null>("name");
  const [tab,setTab] = useState<"design"|"elements"|"layers">("design");
  const [zoom,setZoom] = useState(.72);
  const [snap,setSnap] = useState(true);
  const [showGrid,setShowGrid] = useState(false);
  const [bg,setBg] = useState("#ffffff");
  const [history,setHistory] = useState<CvElement[][]>([]);
  const [future,setFuture] = useState<CvElement[][]>([]);
  const [toast,setToast] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{id:string;mode:"move"|"resize";sx:number;sy:number;ox:number;oy:number;ow:number;oh:number}|null>(null);

  const active = useMemo(()=>elements.find(e=>e.id===selected)||null,[elements,selected]);
  const flash=(msg:string)=>{setToast(msg); window.setTimeout(()=>setToast(""),1800)};
  const checkpoint=()=>{setHistory(h=>[...h.slice(-39),clone(elements)]);setFuture([])};
  const patch=(id:string,changes:Partial<CvElement>,save=false)=>{if(save) checkpoint();setElements(es=>es.map(e=>e.id===id?{...e,...changes}:e));};

  useEffect(()=>{
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved){try{const parsed=JSON.parse(saved); if(parsed.elements) {setElements(parsed.elements);setBg(parsed.bg||"#fff");}}catch{}}
  },[]);
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify({elements,bg}))},[elements,bg]);

  useEffect(()=>{
    const onKey=(ev:KeyboardEvent)=>{
      if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="z"){ev.preventDefault();ev.shiftKey?redo():undo();return}
      if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="y"){ev.preventDefault();redo();return}
      if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="d"&&selected){ev.preventDefault();duplicate();return}
      if((ev.key==="Delete"||ev.key==="Backspace")&&selected&&!((ev.target as HTMLElement)?.isContentEditable)){ev.preventDefault();remove();return}
      if(selected&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(ev.key)){
        ev.preventDefault(); const step=ev.shiftKey?10:1; const a=elements.find(e=>e.id===selected); if(!a||a.locked)return;
        patch(selected,{x:a.x+(ev.key==="ArrowRight"?step:ev.key==="ArrowLeft"?-step:0),y:a.y+(ev.key==="ArrowDown"?step:ev.key==="ArrowUp"?-step:0)});
      }
    };
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  });

  const pointerDown=(ev:ReactPointerEvent,id:string,mode:"move"|"resize")=>{
    ev.stopPropagation(); const e=elements.find(x=>x.id===id); if(!e||e.locked)return; setSelected(id); checkpoint();
    dragRef.current={id,mode,sx:ev.clientX,sy:ev.clientY,ox:e.x,oy:e.y,ow:e.w,oh:e.h};
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
  };
  const pointerMove=(ev:ReactPointerEvent)=>{
    const d=dragRef.current;if(!d)return; const dx=(ev.clientX-d.sx)/zoom,dy=(ev.clientY-d.sy)/zoom; const grid=snap?8:1; const q=(n:number)=>Math.round(n/grid)*grid;
    if(d.mode==="move")patch(d.id,{x:Math.max(0,Math.min(W-24,q(d.ox+dx))),y:Math.max(0,Math.min(H-24,q(d.oy+dy)))});
    else patch(d.id,{w:Math.max(50,q(d.ow+dx)),h:Math.max(24,q(d.oh+dy))});
  };
  const pointerUp=()=>{dragRef.current=null};

  const addElement=(kind:ElementKind,content:string,label:string)=>{
    checkpoint(); const z=Math.max(...elements.map(e=>e.z),1)+1;
    const e:CvElement={id:uid(),kind,x:330,y:180,w:kind==="icon"?80:kind==="shape"?180:300,h:kind==="icon"?80:kind==="shape"?100:60,content,fontSize:kind==="icon"?46:18,fontWeight:kind==="text"?600:400,color:"#263b3c",background:kind==="shape"?"#a9ddda":"transparent",opacity:1,rotation:0,radius:kind==="shape"?18:0,align:"left",z,label};
    setElements(es=>[...es,e]);setSelected(e.id);flash(`${label} ajouté`);
  };
  const remove=()=>{if(!active||active.locked)return;checkpoint();setElements(es=>es.filter(e=>e.id!==active.id));setSelected(null)};
  const duplicate=()=>{if(!active)return;checkpoint();const e={...active,id:uid(),x:active.x+18,y:active.y+18,label:active.label+" (copie)",locked:false,z:Math.max(...elements.map(x=>x.z))+1};setElements(es=>[...es,e]);setSelected(e.id)};
  const undo=()=>{if(!history.length)return;setFuture(f=>[clone(elements),...f]);setElements(history[history.length-1]);setHistory(h=>h.slice(0,-1))};
  const redo=()=>{if(!future.length)return;setHistory(h=>[...h,clone(elements)]);setElements(future[0]);setFuture(f=>f.slice(1))};
  const zMove=(dir:"up"|"down"|"top"|"bottom")=>{if(!active)return;checkpoint();const values=elements.map(e=>e.z);const z=dir==="top"?Math.max(...values)+1:dir==="bottom"?Math.min(...values)-1:active.z+(dir==="up"?1:-1);patch(active.id,{z})};
  const alignPage=(pos:"left"|"center"|"right"|"top"|"middle"|"bottom")=>{if(!active||active.locked)return;checkpoint();const c:Partial<CvElement>={}; if(pos==="left")c.x=24;if(pos==="center")c.x=(W-active.w)/2;if(pos==="right")c.x=W-active.w-24;if(pos==="top")c.y=24;if(pos==="middle")c.y=(H-active.h)/2;if(pos==="bottom")c.y=H-active.h-24;patch(active.id,c)};
  const applyPalette=(p:typeof palettes[number])=>{checkpoint();setElements(es=>es.map(e=>e.id==="sidebar"?{...e,background:p.sidebar}:e.id==="accent"?{...e,background:p.soft}:e.color==="#287f7a"?{...e,color:p.accent}:e));flash(`Palette ${p.name}`)};
  const reset=()=>{if(!confirm("Réinitialiser le modèle ?"))return;checkpoint();setElements(clone(initialElements));setBg("#fff");setSelected("name")};
  const save=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify({elements,bg}));flash("CV sauvegardé sur cet appareil")};
  const exportJson=()=>downloadBlob(JSON.stringify({version:1,elements,bg},null,2),"CV_Syntiche_Monney.json","application/json");
  const importJson=(ev:ChangeEvent<HTMLInputElement>)=>{const f=ev.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const p=JSON.parse(String(reader.result));checkpoint();setElements(p.elements);setBg(p.bg||"#fff");flash("Projet importé")}catch{alert("Fichier de projet invalide")}};reader.readAsText(f);ev.target.value=""};

  const downloadHtml=()=>{
    const html=`<!doctype html><html lang="fr"><meta charset="utf-8"><title>CV Syntiche Monney</title><style>${exportCss}</style><body><main class="cv-stage" style="background:${bg}">${renderStatic(elements)}</main></body></html>`;
    downloadBlob(html,"CV_Syntiche_Monney.html","text/html");
  };
  const downloadPng=async()=>{
    const html=renderStatic(elements);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${exportCss}</style><main class="cv-stage" style="background:${bg}">${html}</main></div></foreignObject></svg>`;
    const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));const img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=W*2;c.height=H*2;const ctx=c.getContext("2d")!;ctx.scale(2,2);ctx.drawImage(img,0,0);URL.revokeObjectURL(url);c.toBlob(b=>{if(b)downloadBlob(b,"CV_Syntiche_Monney.png","image/png")});};img.src=url;
  };

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">S</span><div><strong>Atelier CV</strong><small>Syntiche Monney</small></div></div>
      <div className="history-tools"><button onClick={undo} disabled={!history.length} title="Annuler (Ctrl+Z)">↶</button><button onClick={redo} disabled={!future.length} title="Rétablir">↷</button><span className="save-state">● Sauvegarde automatique</span></div>
      <div className="export-tools"><button className="ghost" onClick={save}>Sauvegarder</button><div className="menu"><button className="primary">Télécharger ▾</button><div className="menu-pop"><button onClick={()=>window.print()}>PDF / Imprimer</button><button onClick={downloadPng}>Image PNG</button><button onClick={downloadHtml}>Page HTML</button><button onClick={exportJson}>Projet JSON</button></div></div></div>
    </header>

    <aside className="left-panel">
      <nav className="tabbar">
        <button className={tab==="design"?"active":""} onClick={()=>setTab("design")}>◈<span>Design</span></button>
        <button className={tab==="elements"?"active":""} onClick={()=>setTab("elements")}>✦<span>Éléments</span></button>
        <button className={tab==="layers"?"active":""} onClick={()=>setTab("layers")}>▱<span>Calques</span></button>
      </nav>
      <div className="panel-content">
        {tab==="design"&&<>
          <h2>Design du CV</h2><p className="muted">Personnalise le modèle sans perdre l’alignement.</p>
          <label className="field"><span>Fond de la page</span><input type="color" value={bg} onChange={e=>setBg(e.target.value)}/></label>
          <h3>Palettes</h3><div className="palette-grid">{palettes.map(p=><button key={p.name} onClick={()=>applyPalette(p)} title={p.name}><i style={{background:p.sidebar}}/><i style={{background:p.accent}}/><i style={{background:p.soft}}/><span>{p.name}</span></button>)}</div>
          <h3>Affichage</h3><label className="switch"><input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)}/><span/>Magnétisme 8 px</label><label className="switch"><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/><span/>Afficher la grille</label>
          <h3>Projet</h3><button className="wide" onClick={reset}>Réinitialiser le modèle</button><label className="wide file">Importer un projet<input type="file" accept="application/json" onChange={importJson}/></label>
        </>}
        {tab==="elements"&&<>
          <h2>Ajouter</h2><div className="add-grid"><button onClick={()=>addElement("text","Double-cliquez pour modifier","Texte")}>T<span>Texte</span></button><button onClick={()=>addElement("text","NOUVELLE RUBRIQUE","Titre")}>H<span>Titre</span></button><button onClick={()=>addElement("shape","","Rectangle")}>▰<span>Forme</span></button><button onClick={()=>addElement("shape","","Pastille")}>●<span>Pastille</span></button></div>
          <h3>Objets de cuisine</h3><p className="muted">Clique sur un objet, puis déplace-le librement.</p><div className="emoji-grid">{kitchenItems.map((x,i)=><button key={i} onClick={()=>addElement("icon",x,`Décoration ${x}`)}>{x}</button>)}</div>
          <h3>Blocs utiles</h3><button className="wide" onClick={()=>addElement("text","DISPONIBILITÉS\nÀ compléter","Disponibilités")}>+ Disponibilités</button><button className="wide" onClick={()=>addElement("text","COMPÉTENCES\n• À compléter","Compétences")}>+ Compétences</button><button className="wide" onClick={()=>addElement("text","CERTIFICATIONS\n• À compléter","Certifications")}>+ Certifications</button>
        </>}
        {tab==="layers"&&<><h2>Calques</h2><p className="muted">Sélectionne, masque ou verrouille un élément.</p><div className="layers">{[...elements].sort((a,b)=>b.z-a.z).map(e=><div key={e.id} className={selected===e.id?"selected":""} onClick={()=>setSelected(e.id)}><button onClick={ev=>{ev.stopPropagation();patch(e.id,{hidden:!e.hidden},true)}}>{e.hidden?"○":"◉"}</button><span>{e.label}</span><button onClick={ev=>{ev.stopPropagation();patch(e.id,{locked:!e.locked},true)}}>{e.locked?"🔒":"🔓"}</button></div>)}</div></>}
      </div>
    </aside>

    <section className="workspace" onPointerMove={pointerMove} onPointerUp={pointerUp}>
      <div className="workspace-tools"><span>Page A4</span><button onClick={()=>setZoom(z=>Math.max(.35,z-.1))}>−</button><output>{Math.round(zoom*100)}%</output><button onClick={()=>setZoom(z=>Math.min(1.2,z+.1))}>+</button><button onClick={()=>setZoom(.72)}>Ajuster</button></div>
      <div className="canvas-wrap" style={{width:W*zoom,height:H*zoom}}>
        <div ref={stageRef} className={`cv-stage editor-stage ${showGrid?"grid-on":""}`} style={{width:W,height:H,background:bg,transform:`scale(${zoom})`}} onPointerDown={()=>setSelected(null)}>
          {elements.filter(e=>!e.hidden).sort((a,b)=>a.z-b.z).map(e=><div key={e.id} className={`cv-item ${e.kind} ${selected===e.id?"is-selected":""} ${e.locked?"locked":""}`} style={elementStyle(e)} onPointerDown={ev=>pointerDown(ev,e.id,"move")} onDoubleClick={ev=>{if(e.kind==="text"){const node=ev.currentTarget.querySelector(".editable") as HTMLElement;node?.focus()}}}>
            {e.kind==="text"?<div className="editable" contentEditable={!e.locked} suppressContentEditableWarning onBlur={ev=>patch(e.id,{content:ev.currentTarget.innerText},true)}>{e.content}</div>:e.kind==="icon"?<div className="icon-content">{e.content}</div>:null}
            {selected===e.id&&!e.locked&&<><i className="resize-handle" onPointerDown={ev=>pointerDown(ev,e.id,"resize")}/><span className="size-label">{Math.round(e.w)} × {Math.round(e.h)}</span></>}
          </div>)}
        </div>
      </div>
    </section>

    <aside className="right-panel">
      <div className="property-head"><h2>Propriétés</h2>{active&&<span>{active.label}</span>}</div>
      {!active?<div className="empty-state"><b>✦</b><p>Sélectionne un élément du CV pour le personnaliser.</p></div>:<div className="properties">
        <div className="action-row"><button onClick={duplicate}>Dupliquer</button><button onClick={()=>patch(active.id,{locked:!active.locked},true)}>{active.locked?"Déverrouiller":"Verrouiller"}</button><button className="danger" onClick={remove} disabled={active.locked}>Supprimer</button></div>
        {active.kind==="text"&&<><label className="field"><span>Texte</span><textarea value={active.content} onChange={e=>patch(active.id,{content:e.target.value})}/></label><div className="field-row"><label className="field"><span>Taille</span><input type="number" min="7" max="90" value={active.fontSize||14} onChange={e=>patch(active.id,{fontSize:+e.target.value})}/></label><label className="field"><span>Graisse</span><select value={active.fontWeight||400} onChange={e=>patch(active.id,{fontWeight:+e.target.value})}><option value="400">Normal</option><option value="500">Moyen</option><option value="600">Semi-gras</option><option value="700">Gras</option><option value="800">Extra-gras</option></select></label></div><label className="field"><span>Couleur du texte</span><input type="color" value={active.color||"#263b3c"} onChange={e=>patch(active.id,{color:e.target.value})}/></label><div className="segmented"><button className={active.align==="left"?"active":""} onClick={()=>patch(active.id,{align:"left"})}>≡</button><button className={active.align==="center"?"active":""} onClick={()=>patch(active.id,{align:"center"})}>≣</button><button className={active.align==="right"?"active":""} onClick={()=>patch(active.id,{align:"right"})}>≡</button></div></>}
        {active.kind==="shape"&&<><label className="field"><span>Couleur de la forme</span><input type="color" value={active.background||"#a9ddda"} onChange={e=>patch(active.id,{background:e.target.value})}/></label><label className="field"><span>Arrondi <output>{active.radius||0}px</output></span><input type="range" min="0" max="100" value={active.radius||0} onChange={e=>patch(active.id,{radius:+e.target.value})}/></label></>}
        {active.kind==="icon"&&<label className="field"><span>Taille de l’illustration</span><input type="range" min="16" max="100" value={active.fontSize||40} onChange={e=>patch(active.id,{fontSize:+e.target.value})}/></label>}
        <label className="field"><span>Opacité <output>{Math.round((active.opacity??1)*100)}%</output></span><input type="range" min="0.05" max="1" step="0.05" value={active.opacity??1} onChange={e=>patch(active.id,{opacity:+e.target.value})}/></label>
        <label className="field"><span>Rotation <output>{active.rotation||0}°</output></span><input type="range" min="-180" max="180" value={active.rotation||0} onChange={e=>patch(active.id,{rotation:+e.target.value})}/></label>
        <h3>Aligner sur la page</h3><div className="align-grid"><button onClick={()=>alignPage("left")}>←</button><button onClick={()=>alignPage("center")}>↔</button><button onClick={()=>alignPage("right")}>→</button><button onClick={()=>alignPage("top")}>↑</button><button onClick={()=>alignPage("middle")}>↕</button><button onClick={()=>alignPage("bottom")}>↓</button></div>
        <h3>Position et dimensions</h3><div className="coords">{(["x","y","w","h"] as const).map(k=><label key={k}><span>{k.toUpperCase()}</span><input type="number" value={Math.round(active[k])} onChange={e=>patch(active.id,{[k]:+e.target.value})}/></label>)}</div>
        <h3>Ordre des calques</h3><div className="layer-actions"><button onClick={()=>zMove("top")}>Tout devant</button><button onClick={()=>zMove("up")}>Avancer</button><button onClick={()=>zMove("down")}>Reculer</button><button onClick={()=>zMove("bottom")}>Tout derrière</button></div>
      </div>}
    </aside>
    {toast&&<div className="toast">✓ {toast}</div>}
  </main>;
}

function elementStyle(e:CvElement){return {left:e.x,top:e.y,width:e.w,height:e.h,zIndex:e.z,opacity:e.opacity??1,transform:`rotate(${e.rotation||0}deg)`,borderRadius:e.radius||0,background:e.background||"transparent",color:e.color||"#263b3c",fontSize:e.fontSize,fontWeight:e.fontWeight,textAlign:e.align||"left"} as React.CSSProperties}
function escapeHtml(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]!)).replace(/\n/g,"<br>")}
function renderStatic(els:CvElement[]){return els.filter(e=>!e.hidden).sort((a,b)=>a.z-b.z).map(e=>`<div class="cv-item ${e.kind}" style="left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;z-index:${e.z};opacity:${e.opacity??1};transform:rotate(${e.rotation||0}deg);border-radius:${e.radius||0}px;background:${e.background||"transparent"};color:${e.color||"#263b3c"};font-size:${e.fontSize||14}px;font-weight:${e.fontWeight||400};text-align:${e.align||"left"}">${e.kind==="shape"?"":escapeHtml(e.content)}</div>`).join("")}
function downloadBlob(data:BlobPart,name:string,type:string){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const exportCss=`*{box-sizing:border-box}body{margin:0;background:#eee}.cv-stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:Arial,Helvetica,sans-serif}.cv-item{position:absolute;white-space:pre-wrap;line-height:1.35;padding:2px;box-sizing:border-box}.cv-item.icon{display:flex;align-items:center;justify-content:center;line-height:1}.cv-item.shape{padding:0}@media print{body{background:white}.cv-stage{margin:0}}`;
