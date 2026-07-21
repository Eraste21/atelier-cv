"use client";

import { ChangeEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import type { CvElement, ElementKind, SavedProject } from "./types";
import { cloneElements as clone, cvFileName, downloadBlob } from "./utils/project";

const W = 794;
const H = 1123;
const STORAGE_KEY = "studio-cv-project-v3";
const SAVES_KEY = "studio-cv-saves-v3";
const LEGACY_STORAGE_KEY = "atelier-cv-syntiche-v2";
const LEGACY_SAVES_KEY = "atelier-cv-syntiche-saves-v2";

const initialElements: CvElement[] = [
  { id:"bgMintBlob",kind:"shape",x:-112,y:-64,w:430,h:1250,content:"",background:"linear-gradient(160deg,#bce9e5 0%,#91d3cc 62%,#6ebfb7 100%)",opacity:1,radius:0,clipPath:"ellipse(67% 58% at 32% 50%)",z:0,label:"Grande forme organique",locked:true,backgroundLayer:true },
  { id:"bgMintHalo",kind:"shape",x:210,y:-95,w:270,h:260,content:"",background:"#eaf8f6",opacity:1,radius:999,z:1,label:"Halo supérieur",locked:true,backgroundLayer:true },
  { id:"bgMintDrop",kind:"shape",x:690,y:940,w:190,h:230,content:"",background:"#d8f1ed",opacity:.75,radius:0,clipPath:"polygon(51% 0,90% 20%,100% 65%,70% 100%,25% 91%,0 52%,15% 14%)",rotation:18,z:1,label:"Forme basse",locked:true,backgroundLayer:true },
  { id:"bgWhisk",kind:"icon",x:45,y:992,w:76,h:76,content:"🥄",fontSize:48,color:"#276e69",opacity:.18,rotation:24,z:2,label:"Dessin cuillère",locked:true,backgroundLayer:true },
  { id:"bgCookie",kind:"icon",x:675,y:1007,w:70,h:70,content:"🍪",fontSize:46,color:"#7d5a36",opacity:.24,rotation:-12,z:2,label:"Dessin cookie",locked:true,backgroundLayer:true },
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
];

const kitchenItems = ["🍪","🥄","🍴","🥣","🍰","🧁","🥐","🍞","☕","🫖","🍳","🥘","🧑‍🍳","🍽️","🥕","🍋","🌿","🧂","🔪","🥗"];
const palettes = [
  {name:"Menthe",sidebar:"#a9ddda",accent:"#287f7a",soft:"#ecf8f7"},
  {name:"Terracotta",sidebar:"#e8b39d",accent:"#9f4f39",soft:"#fff4ef"},
  {name:"Sauge",sidebar:"#c9d6bf",accent:"#52684d",soft:"#f3f6f0"},
  {name:"Vanille",sidebar:"#f4dca4",accent:"#8a6723",soft:"#fff9e9"},
  {name:"Bleu glacier",sidebar:"#bddde8",accent:"#2b6579",soft:"#eff8fb"},
];
const fonts = [
  {name:"Moderne",value:"Inter, Arial, sans-serif"},{name:"Élégante",value:"Georgia, 'Times New Roman', serif"},
  {name:"Classique",value:"'Times New Roman', Times, serif"},{name:"Arrondie",value:"'Trebuchet MS', Arial, sans-serif"},
  {name:"Contemporaine",value:"Verdana, Geneva, sans-serif"},{name:"Impact",value:"Impact, 'Arial Black', sans-serif"},
  {name:"Humaniste",value:"Calibri, Candara, Arial, sans-serif"},{name:"Monospace",value:"'Courier New', Courier, monospace"}
];

type BackgroundPreset = { id:string; name:string; subtitle:string; page:string; preview:string; accents:string[]; items:CvElement[] };
const bgShape=(id:string,x:number,y:number,w:number,h:number,background:string,clipPath:string,radius=0,rotation=0,opacity=1):CvElement=>({id,kind:"shape",x,y,w,h,content:"",background,clipPath,radius,rotation,opacity,z:0,label:"Décor de fond",locked:true,backgroundLayer:true});
const bgIcon=(id:string,x:number,y:number,content:string,size:number,rotation=0,opacity=.18):CvElement=>({id,kind:"icon",x,y,w:size+24,h:size+24,content,fontSize:size,rotation,opacity,z:2,label:`Dessin ${content}`,locked:true,backgroundLayer:true});
const backgrounds:BackgroundPreset[] = [
  {id:"mint",name:"Menthe organique",subtitle:"Frais & professionnel",page:"#ffffff",preview:"linear-gradient(125deg,#9bd8d2 0 38%,#e8f7f5 38% 55%,#fff 55%)",accents:["#287f7a","#173f3d"],items:[
    bgShape("mint-main",-115,-65,435,1250,"linear-gradient(160deg,#bce9e5,#72c3bb)","ellipse(67% 58% at 32% 50%)"),bgShape("mint-halo",210,-95,270,260,"#eaf8f6","circle(50%)",999),bgShape("mint-drop",690,940,190,230,"#d8f1ed","polygon(51% 0,90% 20%,100% 65%,70% 100%,25% 91%,0 52%,15% 14%)",0,18,.75),bgIcon("mint-spoon",42,990,"🥄",48,24,.17),bgIcon("mint-cookie",675,1006,"🍪",46,-12,.22)]},
  {id:"patisserie",name:"Pâtisserie douce",subtitle:"Rose, crème & gourmande",page:"#fffaf7",preview:"radial-gradient(circle at 20% 20%,#efb8c5 0 20%,transparent 21%),linear-gradient(145deg,#fff7ef 50%,#f5d7c8 50%)",accents:["#a24f6b","#6f3c4d"],items:[
    bgShape("pat-arch",-55,-15,340,1160,"linear-gradient(180deg,#f5d1d9,#edb7c4)","ellipse(72% 61% at 28% 48%)"),bgShape("pat-corner",575,-95,300,280,"#f8dfd3","circle(50%)",999,0,.8),bgShape("pat-wave",510,1000,360,180,"#f6e8cf","polygon(0 50%,14% 30%,30% 54%,47% 25%,64% 55%,82% 29%,100% 45%,100% 100%,0 100%)"),bgIcon("pat-cupcake",36,980,"🧁",47,-8,.22),bgIcon("pat-cookie",687,49,"🍪",40,15,.2)]},
  {id:"bistro",name:"Bistro élégant",subtitle:"Sauge, ivoire & doré",page:"#fffdf6",preview:"linear-gradient(120deg,#7e9680 0 40%,#f5edcf 40% 48%,#fffdf6 48%)",accents:["#566f5c","#9b762f"],items:[
    bgShape("bis-main",-145,-100,455,1300,"linear-gradient(165deg,#a9bda8,#6f8c75)","ellipse(68% 58% at 33% 50%)"),bgShape("bis-gold",225,-40,92,1200,"linear-gradient(180deg,#d9bd72,#f3e6bd)","polygon(42% 0,100% 0,58% 100%,0 100%)",0,0,.9),bgShape("bis-plate",640,930,260,260,"#eef1e4","circle(50%)",999),bgIcon("bis-fork",45,995,"🍴",48,-15,.2),bgIcon("bis-coffee",674,1002,"☕",44,10,.18)]},
  {id:"terracotta",name:"Cuisine terracotta",subtitle:"Chaleureux & authentique",page:"#fffaf3",preview:"linear-gradient(140deg,#c97859 0 35%,#f2c6a9 35% 58%,#fff9ef 58%)",accents:["#a55237","#6d3827"],items:[
    bgShape("ter-wave",-80,-30,390,1190,"linear-gradient(165deg,#e7a184,#c96f50)","polygon(0 0,73% 0,88% 12%,70% 26%,92% 42%,68% 59%,89% 76%,65% 100%,0 100%)"),bgShape("ter-sun",620,-95,250,250,"#f5d2a8","circle(50%)",999),bgShape("ter-blob",610,930,260,230,"#f5e1c8","polygon(25% 0,75% 7%,100% 45%,78% 100%,20% 88%,0 48%)",0,-8),bgIcon("ter-pan",35,985,"🍳",48,-16,.18),bgIcon("ter-lemon",687,1010,"🍋",42,18,.24)]},
  {id:"market",name:"Marché frais",subtitle:"Vert feuille & citron",page:"#fffef7",preview:"radial-gradient(circle at 80% 20%,#f3d45f 0 16%,transparent 17%),linear-gradient(125deg,#88b78b 0 40%,#eef5df 40% 58%,#fff 58%)",accents:["#477c52","#7d681c"],items:[
    bgShape("mar-leaf",-145,-120,470,1320,"linear-gradient(165deg,#b8d6a7,#77ad7d)","ellipse(68% 58% at 33% 50%)"),bgShape("mar-lemon",625,-85,270,260,"#f6df72","circle(50%)",999,0,.65),bgShape("mar-leaf2",625,920,250,270,"#dcebc9","ellipse(44% 58% at 50% 50%)",0,-32,.8),bgIcon("mar-carrot",32,992,"🥕",47,-18,.2),bgIcon("mar-herb",682,1005,"🌿",44,16,.25)]},
  {id:"coffee",name:"Coffee shop",subtitle:"Moka, latte & crème",page:"#fffaf2",preview:"linear-gradient(130deg,#8b6249 0 38%,#d9b99d 38% 57%,#fff8ed 57%)",accents:["#77513b","#3f2c23"],items:[
    bgShape("cof-main",-130,-60,430,1240,"linear-gradient(160deg,#c9a98e,#8c654c)","ellipse(68% 58% at 31% 50%)"),bgShape("cof-foam",205,-60,210,240,"#f3e5d2","circle(50%)",999),bgShape("cof-bean",650,955,240,220,"#ead8c2","ellipse(42% 58% at 50% 50%)",0,30,.8),bgIcon("cof-cup",40,995,"☕",48,-8,.22),bgIcon("cof-croi",680,1004,"🥐",45,12,.22)]},
  {id:"minimal",name:"Minimal abstrait",subtitle:"Formes aériennes",page:"#fbfcfc",preview:"radial-gradient(circle at 20% 20%,#c6dedb 0 24%,transparent 25%),radial-gradient(circle at 80% 80%,#e7d9c7 0 20%,transparent 21%),#fff",accents:["#4a7471","#324c4a"],items:[
    bgShape("min-blob",-130,-80,420,560,"#c6dedb","polygon(15% 0,82% 8%,100% 48%,72% 100%,10% 86%,0 35%)",0,-8,.9),bgShape("min-ring",620,-80,260,260,"#e9f2f1","circle(50%)",999),bgShape("min-bottom",590,940,300,260,"#eadfce","polygon(20% 0,78% 10%,100% 50%,70% 100%,10% 87%,0 38%)",0,12,.7),bgIcon("min-star",40,1000,"✦",40,0,.2),bgIcon("min-dots",690,1010,"•••",30,0,.2)]},
  {id:"night",name:"Soirée gastronomique",subtitle:"Bleu nuit & champagne",page:"#fffdf8",preview:"linear-gradient(130deg,#283744 0 43%,#d8bd77 43% 51%,#fffdf8 51%)",accents:["#334958","#9b782f"],items:[
    bgShape("nig-main",-120,-70,430,1250,"linear-gradient(160deg,#405563,#243542)","ellipse(67% 58% at 32% 50%)"),bgShape("nig-gold",220,-30,70,1190,"linear-gradient(180deg,#d9bd72,#f5e7b7)","polygon(35% 0,100% 0,65% 100%,0 100%)",0,0,.9),bgShape("nig-moon",650,-95,260,260,"#f3e9ca","circle(50%)",999),bgIcon("nig-plate",38,995,"🍽️",46,-8,.2),bgIcon("nig-star",690,1010,"✦",40,0,.22)]},
  {id:"berry",name:"Dessert fruits rouges",subtitle:"Créatif & délicat",page:"#fff9fb",preview:"linear-gradient(135deg,#9b365d 0 35%,#efb8c9 35% 55%,#fff9fb 55%)",accents:["#96395c","#57243a"],items:[bgShape("ber-main",-125,-70,430,1250,"linear-gradient(160deg,#c9698a,#8e3155)","ellipse(66% 59% at 31% 50%)"),bgShape("ber-cream",205,-90,260,250,"#f8dce5","circle(50%)",999),bgShape("ber-drop",625,930,280,250,"#f3cbd8","polygon(20% 0,78% 8%,100% 52%,69% 100%,8% 84%,0 34%)",0,-10,.7),bgIcon("ber-cake",38,995,"🍰",46,-10,.22),bgIcon("ber-fruit",680,1000,"🍓",44,14,.22)]},
  {id:"marine",name:"Brasserie marine",subtitle:"Net & contemporain",page:"#f9fcfd",preview:"linear-gradient(125deg,#17677a 0 38%,#8fd2d8 38% 53%,#f9fcfd 53%)",accents:["#17677a","#123f4b"],items:[bgShape("sea-main",-135,-60,440,1240,"linear-gradient(165deg,#4aa8b3,#17677a)","polygon(0 0,78% 0,93% 14%,72% 31%,92% 48%,70% 67%,90% 83%,66% 100%,0 100%)"),bgShape("sea-sun",620,-100,270,270,"#ccecf0","circle(50%)",999),bgShape("sea-wave",560,985,350,180,"#d9f0f2","polygon(0 45%,16% 20%,34% 48%,51% 18%,69% 50%,84% 25%,100% 43%,100% 100%,0 100%)"),bgIcon("sea-plate",38,995,"🍽️",45,-12,.2),bgIcon("sea-lemon",684,1002,"🍋",42,12,.22)]},
  {id:"lavender",name:"Lavande éditoriale",subtitle:"Doux & sophistiqué",page:"#fdfbff",preview:"linear-gradient(140deg,#74608d 0 34%,#cfc2df 34% 58%,#fdfbff 58%)",accents:["#69537f","#3f3150"],items:[bgShape("lav-main",-125,-70,430,1250,"linear-gradient(165deg,#aa97c1,#705986)","ellipse(67% 58% at 32% 50%)"),bgShape("lav-ring",205,-100,275,260,"#ebe4f3","circle(50%)",999),bgShape("lav-bottom",610,930,280,270,"#e8dded","ellipse(45% 60% at 50% 50%)",0,24,.78),bgIcon("lav-cup",38,995,"🫖",45,-10,.2),bgIcon("lav-star",686,1008,"✦",38,0,.2)]},
  {id:"mustard",name:"Cantine graphique",subtitle:"Audacieux & chaleureux",page:"#fffdf7",preview:"linear-gradient(130deg,#d39a24 0 36%,#2f5550 36% 51%,#fffdf7 51%)",accents:["#a66f08","#294e49"],items:[bgShape("mus-main",-90,-40,365,1200,"linear-gradient(165deg,#f0c55c,#d0951d)","polygon(0 0,74% 0,100% 18%,77% 39%,98% 61%,72% 82%,89% 100%,0 100%)"),bgShape("mus-stripe",215,-30,72,1190,"#315a54","polygon(40% 0,100% 0,60% 100%,0 100%)"),bgShape("mus-circle",635,945,250,250,"#f5e8bd","circle(50%)",999),bgIcon("mus-bowl",35,993,"🥣",46,-8,.2),bgIcon("mus-herb",681,1003,"🌿",44,16,.2)]},
];

type CvPreset={id:string;name:string;subtitle:string;preview:string;background:string;font:string;layout:"sidebar"|"editorial"|"compact"|"centered"};
const cvPresets:CvPreset[]=[
  {id:"fresh",name:"Restauration fraîche",subtitle:"Sidebar organique",preview:"linear-gradient(120deg,#78c7bf 0 40%,#fff 40%)",background:"mint",font:fonts[0].value,layout:"sidebar"},
  {id:"bistro-cv",name:"Bistro premium",subtitle:"Élégant et raffiné",preview:"linear-gradient(120deg,#6f8c75 0 32%,#d9bd72 32% 39%,#fffdf6 39%)",background:"bistro",font:fonts[1].value,layout:"editorial"},
  {id:"brasserie-cv",name:"Brasserie moderne",subtitle:"Compact et dynamique",preview:"linear-gradient(135deg,#17677a 0 28%,#e7f5f6 28% 62%,#fff 62%)",background:"marine",font:fonts[4].value,layout:"compact"},
  {id:"pastry-cv",name:"Pâtisserie créative",subtitle:"Doux et expressif",preview:"radial-gradient(circle at 18% 30%,#c9698a 0 22%,transparent 23%),linear-gradient(145deg,#fff5f8,#f4d7df)",background:"berry",font:fonts[3].value,layout:"centered"},
  {id:"editorial-cv",name:"Éditorial lavande",subtitle:"Sophistiqué et aéré",preview:"linear-gradient(125deg,#705986 0 30%,#e9e1f0 30% 52%,#fff 52%)",background:"lavender",font:fonts[1].value,layout:"editorial"},
  {id:"graphic-cv",name:"Cantine graphique",subtitle:"Fort et original",preview:"linear-gradient(120deg,#d0951d 0 34%,#315a54 34% 43%,#fffdf7 43%)",background:"mustard",font:fonts[0].value,layout:"compact"}
];

const uid = () => Math.random().toString(36).slice(2,9);

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
  const [savedProjects,setSavedProjects] = useState<SavedProject[]>([]);
  const [mobilePanel,setMobilePanel] = useState<"left"|"right"|null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{id:string;mode:"move"|"resize";sx:number;sy:number;ox:number;oy:number;ow:number;oh:number}|null>(null);

  const active = useMemo(()=>elements.find(e=>e.id===selected)||null,[elements,selected]);
  const flash=(msg:string)=>{setToast(msg); window.setTimeout(()=>setToast(""),1800)};
  const checkpoint=()=>{setHistory(h=>[...h.slice(-39),clone(elements)]);setFuture([])};
  const patch=(id:string,changes:Partial<CvElement>,save=false)=>{if(save) checkpoint();setElements(es=>es.map(e=>e.id===id?{...e,...changes}:e));};

  useEffect(()=>{
    const saved=localStorage.getItem(STORAGE_KEY)||localStorage.getItem(LEGACY_STORAGE_KEY);
    if(saved){try{const parsed=JSON.parse(saved); if(parsed.elements) {setElements(parsed.elements);setBg(parsed.bg||"#fff");}}catch{}}
    const versions=localStorage.getItem(SAVES_KEY)||localStorage.getItem(LEGACY_SAVES_KEY);
    if(versions){try{setSavedProjects(JSON.parse(versions))}catch{}}
  },[]);
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify({elements,bg}))},[elements,bg]);
  useEffect(()=>{localStorage.setItem(SAVES_KEY,JSON.stringify(savedProjects))},[savedProjects]);
  useEffect(()=>{
    const fit=()=>{if(window.innerWidth<=760)setZoom(Math.max(.35,Math.min(.56,(window.innerWidth-24)/W)))};
    fit();window.addEventListener("resize",fit);return()=>window.removeEventListener("resize",fit);
  },[]);

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
  const addShape=(label:string,clipPath:string,radius=0,rotation=0)=>{
    checkpoint(); const z=Math.max(...elements.map(e=>e.z),1)+1;
    const e:CvElement={id:uid(),kind:"shape",x:330,y:180,w:190,h:130,content:"",background:"linear-gradient(145deg,#bce9e5,#74c6bd)",opacity:.92,rotation,radius,clipPath,align:"left",z,label};
    setElements(es=>[...es,e]);setSelected(e.id);flash(`${label} ajoutée`);
  };
  const remove=()=>{if(!active||active.locked)return;checkpoint();setElements(es=>es.filter(e=>e.id!==active.id));setSelected(null)};
  const duplicate=()=>{if(!active)return;checkpoint();const e={...active,id:uid(),x:active.x+18,y:active.y+18,label:active.label+" (copie)",locked:false,z:Math.max(...elements.map(x=>x.z))+1};setElements(es=>[...es,e]);setSelected(e.id)};
  const undo=()=>{if(!history.length)return;setFuture(f=>[clone(elements),...f]);setElements(history[history.length-1]);setHistory(h=>h.slice(0,-1))};
  const redo=()=>{if(!future.length)return;setHistory(h=>[...h,clone(elements)]);setElements(future[0]);setFuture(f=>f.slice(1))};
  const zMove=(dir:"up"|"down"|"top"|"bottom")=>{if(!active)return;checkpoint();const values=elements.map(e=>e.z);const z=dir==="top"?Math.max(...values)+1:dir==="bottom"?Math.min(...values)-1:active.z+(dir==="up"?1:-1);patch(active.id,{z})};
  const alignPage=(pos:"left"|"center"|"right"|"top"|"middle"|"bottom")=>{if(!active||active.locked)return;checkpoint();const c:Partial<CvElement>={}; if(pos==="left")c.x=24;if(pos==="center")c.x=(W-active.w)/2;if(pos==="right")c.x=W-active.w-24;if(pos==="top")c.y=24;if(pos==="middle")c.y=(H-active.h)/2;if(pos==="bottom")c.y=H-active.h-24;patch(active.id,c)};
  const applyPalette=(p:typeof palettes[number])=>{checkpoint();let shapeIndex=0;setElements(es=>es.map(e=>{if(e.backgroundLayer&&e.kind==="shape"){shapeIndex++;return{...e,background:shapeIndex===1?p.sidebar:p.soft}}if(e.kind==="text"&&e.fontWeight&&e.fontWeight>=700)return{...e,color:p.accent};return e}));flash(`Palette ${p.name}`)};
  const applyBackground=(preset:BackgroundPreset)=>{
    checkpoint();
    const backgroundItems=preset.items.map(i=>({...i,id:`${preset.id}-${i.id}-${uid()}`}));
    const lightSidebar=["night","coffee","terracotta","bistro"].includes(preset.id);
    setElements(es=>[...backgroundItems,...es.filter(e=>!e.backgroundLayer).map(e=>{
      if(e.kind!=="text")return e;
      if(e.x<260)return{...e,color:lightSidebar?"#fffaf0":"#173f3d"};
      if(e.label.startsWith("Titre")||e.id==="role")return{...e,color:preset.accents[0]};
      return{...e,color:"#304445"};
    })]);
    setBg(preset.page);setSelected(null);flash(`Fond « ${preset.name} » appliqué`);
  };
  const applyCvPreset=(preset:CvPreset)=>{
    checkpoint();const backdrop=backgrounds.find(x=>x.id===preset.background)!;
    const edits:Record<string,Partial<CvElement>>={};
    if(preset.layout==="editorial")Object.assign(edits,{name:{x:282,y:52,w:465,fontSize:40},role:{x:282,y:116,w:465},profileTitle:{x:282,y:190},profile:{x:282,y:230,w:460},pathTitle:{x:282,y:378},hei:{x:282,y:428},bem:{x:282,y:554},bac:{x:282,y:680},availabilityTitle:{x:282,y:842},availability:{x:282,y:886,w:460}});
    if(preset.layout==="compact")Object.assign(edits,{name:{x:300,y:46,w:445,fontSize:36},role:{x:300,y:105,w:445},profileTitle:{x:300,y:175},profile:{x:300,y:211,w:445,h:104},pathTitle:{x:300,y:350},hei:{x:300,y:395,h:96},bem:{x:300,y:505,h:96},bac:{x:300,y:615,h:104},availabilityTitle:{x:300,y:765},availability:{x:300,y:808,w:440}});
    if(preset.layout==="centered")Object.assign(edits,{name:{x:270,y:48,w:475,fontSize:39,align:"center"},role:{x:270,y:111,w:475,align:"center"},profileTitle:{x:295,y:190,align:"center"},profile:{x:285,y:228,w:455,align:"center"},pathTitle:{x:295,y:380,align:"center"},hei:{x:295,y:425,align:"center"},bem:{x:295,y:550,align:"center"},bac:{x:295,y:675,align:"center"},availabilityTitle:{x:295,y:838,align:"center"},availability:{x:285,y:880,w:455,align:"center"}});
    const light=["bistro","berry","marine","lavender","mustard"].includes(backdrop.id);
    const next=elements.filter(e=>!e.backgroundLayer).map(e=>{
      const heading=e.kind==="text"&&(e.label.startsWith("Titre")||e.id==="role");const isName=e.id==="name";
      const typography:Partial<CvElement>=e.kind==="text"?{fontFamily:preset.font,...(heading?{fontWeight:800,letterSpacing:preset.layout==="compact"?1.2:.5}:{}),...(isName?{fontWeight:800,letterSpacing:preset.layout==="editorial"?.3:0}:{}),...(preset.layout==="compact"&&heading&&e.id!=="role"?{fontSize:17}:{})}:{};
      return{...e,...(edits[e.id]||{}),...typography,...(e.kind==="text"&&e.x<260?{color:light?"#fffdf7":"#173f3d"}:{}),...(heading?{color:backdrop.accents[0]}:{})};
    });
    setElements([...backdrop.items.map(i=>({...i,id:`${preset.id}-${i.id}-${uid()}`})),...next]);setBg(backdrop.page);setSelected(null);flash(`Modèle « ${preset.name} » appliqué`);
  };
  const applyFontToAll=(font:string)=>{checkpoint();setElements(es=>es.map(e=>e.kind==="text"?{...e,fontFamily:font}:e));flash("Police appliquée à tout le CV")};
  const reset=()=>{if(!confirm("Réinitialiser le modèle ?"))return;checkpoint();setElements(clone(initialElements));setBg("#fff");setSelected("name")};
  const newBlankCv=()=>{
    if(!confirm("Créer un CV vierge ? Pensez à créer une version locale du projet actuel si vous souhaitez le conserver."))return;checkpoint();
    const blanks:Record<string,string>={name:"Prénom NOM",role:"POSTE RECHERCHÉ",phone:"☎  Téléphone",address:"⌖  Ville, pays",email:"✉  adresse@email.com",profile:"Présentez votre profil, vos qualités et votre objectif professionnel.",hei:"ANNÉE - ANNÉE\nIntitulé de la formation\nÉtablissement - Ville",bem:"ANNÉE - ANNÉE\nIntitulé de la formation\nÉtablissement - Ville",bac:"ANNÉE - ANNÉE\nDiplôme ou certification\nÉtablissement - Ville",qualities:"• Qualité\n• Qualité\n• Qualité\n• Qualité",languages:"Langue - Niveau\nLangue - Niveau",interests:"• Centre d’intérêt\n• Centre d’intérêt\n• Centre d’intérêt",availability:"Décrivez votre objectif professionnel et ce que vous souhaitez apporter à l’entreprise."};
    setElements(clone(initialElements).map(e=>blanks[e.id]!==undefined?{...e,content:blanks[e.id]}:e));setBg("#fff");setSelected("name");flash("Nouveau CV vierge créé");
  };
  const save=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify({elements,bg}));flash("CV sauvegardé sur cet appareil")};
  const saveVersion=()=>{
    const now=new Date(); const stamp=now.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})+" à "+now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
    const item:SavedProject={id:uid(),name:`Version du ${stamp}`,savedAt:now.toISOString(),elements:clone(elements),bg};
    setSavedProjects(s=>[item,...s].slice(0,12));flash("Nouvelle version locale créée");
  };
  const restoreVersion=(item:SavedProject)=>{checkpoint();setElements(clone(item.elements));setBg(item.bg);setSelected(null);flash("Version restaurée")};
  const deleteVersion=(id:string)=>{setSavedProjects(s=>s.filter(x=>x.id!==id));flash("Sauvegarde supprimée")};
  const exportName=()=>cvFileName(elements.find(e=>e.id==="name")?.content||"Mon CV");
  const exportJson=()=>downloadBlob(JSON.stringify({version:1,elements,bg},null,2),`${exportName()}.json`,"application/json");
  const importJson=(ev:ChangeEvent<HTMLInputElement>)=>{const f=ev.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const p=JSON.parse(String(reader.result));checkpoint();setElements(p.elements);setBg(p.bg||"#fff");flash("Projet importé")}catch{alert("Fichier de projet invalide")}};reader.readAsText(f);ev.target.value=""};

  const downloadHtml=()=>{
    const html=`<!doctype html><html lang="fr"><meta charset="utf-8"><title>${escapeHtml(elements.find(e=>e.id==="name")?.content||"Mon CV")}</title><style>${exportCss}</style><body><main class="cv-stage" style="background:${bg}">${renderStatic(elements)}</main></body></html>`;
    downloadBlob(html,`${exportName()}.html`,"text/html");
  };
  const downloadPng=async()=>{
    const html=renderStatic(elements);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${exportCss}</style><main class="cv-stage" style="background:${bg}">${html}</main></div></foreignObject></svg>`;
    const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));const img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=W*2;c.height=H*2;const ctx=c.getContext("2d")!;ctx.scale(2,2);ctx.drawImage(img,0,0);URL.revokeObjectURL(url);c.toBlob(b=>{if(b)downloadBlob(b,`${exportName()}.png`,"image/png")});};img.src=url;
  };

  return <main className="app-shell">
    <header className="topbar">
      <button className="mobile-tool mobile-left" onClick={()=>setMobilePanel(p=>p==="left"?null:"left")} aria-label="Ouvrir les outils">☰</button>
      <div className="brand"><span className="brand-mark">CV</span><div><strong>Studio CV</strong><small>Créateur de CV pour tous</small></div></div>
      <div className="history-tools"><button onClick={undo} disabled={!history.length} title="Annuler (Ctrl+Z)">↶</button><button onClick={redo} disabled={!future.length} title="Rétablir">↷</button><span className="save-state">● Sauvegarde automatique</span></div>
      <div className="export-tools"><button className="ghost" onClick={save}>Sauvegarder</button><div className="menu"><button className="primary">Télécharger ▾</button><div className="menu-pop"><button onClick={()=>window.print()}>PDF / Imprimer</button><button onClick={downloadPng}>Image PNG</button><button onClick={downloadHtml}>Page HTML</button><button onClick={exportJson}>Projet JSON</button></div></div></div>
      <button className="mobile-tool mobile-right" onClick={()=>setMobilePanel(p=>p==="right"?null:"right")} aria-label="Ouvrir les propriétés">⚙</button>
    </header>

    {mobilePanel&&<button className="mobile-scrim" onClick={()=>setMobilePanel(null)} aria-label="Fermer le panneau"/>}
    <aside className={`left-panel ${mobilePanel==="left"?"mobile-open":""}`}>
      <button className="mobile-close" onClick={()=>setMobilePanel(null)} aria-label="Fermer">×</button>
      <nav className="tabbar">
        <button className={tab==="design"?"active":""} onClick={()=>setTab("design")}>◈<span>Design</span></button>
        <button className={tab==="elements"?"active":""} onClick={()=>setTab("elements")}>✦<span>Éléments</span></button>
        <button className={tab==="layers"?"active":""} onClick={()=>setTab("layers")}>▱<span>Calques</span></button>
      </nav>
      <div className="panel-content">
        {tab==="design"&&<>
          <h2>Design du CV</h2><p className="muted">Personnalise le modèle sans perdre l’alignement.</p>
          <h3>Modèles de CV prêts à l’emploi</h3><p className="muted">Applique une composition complète tout en conservant tes textes.</p><div className="preset-grid">{cvPresets.map(p=><button key={p.id} onClick={()=>applyCvPreset(p)}><i style={{background:p.preview}}/><span><b>{p.name}</b><small>{p.subtitle}</small></span></button>)}</div>
          <h3>Fonds complets</h3><p className="muted">Chaque fond combine formes organiques, couleurs et dessins culinaires.</p><div className="background-grid">{backgrounds.map(p=><button key={p.id} onClick={()=>applyBackground(p)}><i style={{background:p.preview}}/><span><b>{p.name}</b><small>{p.subtitle}</small></span></button>)}</div>
          <label className="field"><span>Couleur de base</span><input type="color" value={bg} onChange={e=>setBg(e.target.value)}/></label>
          <h3>Police globale</h3><label className="field"><span>Appliquer à tous les textes</span><select defaultValue="" onChange={e=>{if(e.target.value)applyFontToAll(e.target.value);e.currentTarget.value=""}}><option value="" disabled>Choisir une police…</option>{fonts.map(f=><option key={f.name} value={f.value} style={{fontFamily:f.value}}>{f.name}</option>)}</select></label>
          <h3>Palettes</h3><div className="palette-grid">{palettes.map(p=><button key={p.name} onClick={()=>applyPalette(p)} title={p.name}><i style={{background:p.sidebar}}/><i style={{background:p.accent}}/><i style={{background:p.soft}}/><span>{p.name}</span></button>)}</div>
          <h3>Affichage</h3><label className="switch"><input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)}/><span/>Magnétisme 8 px</label><label className="switch"><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/><span/>Afficher la grille</label>
          <h3>Sauvegardes locales</h3><button className="wide save-version" onClick={saveVersion}>＋ Créer une version</button><p className="storage-note">Stockées uniquement dans ce navigateur.</p><div className="save-list">{savedProjects.length?savedProjects.map(item=><div key={item.id}><span><b>{item.name}</b><small>{new Date(item.savedAt).toLocaleString("fr-FR")}</small></span><button onClick={()=>restoreVersion(item)} title="Restaurer">↺</button><button onClick={()=>deleteVersion(item.id)} title="Supprimer">×</button></div>):<em>Aucune version enregistrée.</em>}</div>
          <h3>Projet</h3><button className="wide new-project" onClick={newBlankCv}>＋ Créer un CV vierge</button><button className="wide" onClick={reset}>Charger l’exemple Syntiche</button><label className="wide file">Importer un projet<input type="file" accept="application/json" onChange={importJson}/></label>
        </>}
        {tab==="elements"&&<>
          <h2>Ajouter</h2><div className="add-grid"><button onClick={()=>addElement("text","Double-cliquez pour modifier","Texte")}>T<span>Texte</span></button><button onClick={()=>addElement("text","NOUVELLE RUBRIQUE","Titre")}>H<span>Titre</span></button><button onClick={()=>addShape("Forme organique","polygon(14% 3%,78% 0,100% 38%,88% 86%,34% 100%,0 66%)",32,-6)}>〰<span>Blob</span></button><button onClick={()=>addShape("Cercle","circle(50%)",999)}>●<span>Cercle</span></button><button onClick={()=>addShape("Arche","ellipse(58% 82% at 50% 100%)",100)}>⌒<span>Arche</span></button><button onClick={()=>addShape("Vague","polygon(0 38%,16% 18%,33% 46%,50% 17%,67% 47%,84% 20%,100% 40%,100% 100%,0 100%)")}>≈<span>Vague</span></button></div>
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

    <aside className={`right-panel ${mobilePanel==="right"?"mobile-open":""}`}>
      <button className="mobile-close" onClick={()=>setMobilePanel(null)} aria-label="Fermer">×</button>
      <div className="property-head"><h2>Propriétés</h2>{active&&<span>{active.label}</span>}</div>
      {!active?<div className="empty-state"><b>✦</b><p>Sélectionne un élément du CV pour le personnaliser.</p></div>:<div className="properties">
        <div className="action-row"><button onClick={duplicate}>Dupliquer</button><button onClick={()=>patch(active.id,{locked:!active.locked},true)}>{active.locked?"Déverrouiller":"Verrouiller"}</button><button className="danger" onClick={remove} disabled={active.locked}>Supprimer</button></div>
        {active.kind==="text"&&<><label className="field"><span>Texte</span><textarea value={active.content} onChange={e=>patch(active.id,{content:e.target.value})}/></label><label className="field"><span>Police d’écriture</span><select value={active.fontFamily||fonts[0].value} onChange={e=>patch(active.id,{fontFamily:e.target.value},true)}>{fonts.map(f=><option key={f.name} value={f.value} style={{fontFamily:f.value}}>{f.name}</option>)}</select></label><div className="field-row"><label className="field"><span>Taille</span><input type="number" min="7" max="90" value={active.fontSize||14} onChange={e=>patch(active.id,{fontSize:+e.target.value})}/></label><label className="field"><span>Graisse</span><select value={active.fontWeight||400} onChange={e=>patch(active.id,{fontWeight:+e.target.value})}><option value="400">Normal</option><option value="500">Moyen</option><option value="600">Semi-gras</option><option value="700">Gras</option><option value="800">Extra-gras</option></select></label></div><label className="field"><span>Couleur du texte</span><input type="color" value={active.color||"#263b3c"} onChange={e=>patch(active.id,{color:e.target.value})}/></label><div className="segmented"><button className={active.align==="left"?"active":""} onClick={()=>patch(active.id,{align:"left"})}>≡</button><button className={active.align==="center"?"active":""} onClick={()=>patch(active.id,{align:"center"})}>≣</button><button className={active.align==="right"?"active":""} onClick={()=>patch(active.id,{align:"right"})}>≡</button></div></>}
        {active.kind==="shape"&&<><label className="field"><span>Couleur de la forme</span><input type="color" value={/^#[0-9a-f]{6}$/i.test(active.background||"")?active.background:"#a9ddda"} onChange={e=>patch(active.id,{background:e.target.value})}/></label><label className="field"><span>Arrondi <output>{active.radius||0}px</output></span><input type="range" min="0" max="100" value={active.radius||0} onChange={e=>patch(active.id,{radius:+e.target.value})}/></label><label className="field"><span>Découpe libre</span><select value={active.clipPath||"none"} onChange={e=>patch(active.id,{clipPath:e.target.value})}><option value="none">Rectangle</option><option value="circle(50%)">Cercle</option><option value="ellipse(68% 58% at 32% 50%)">Ovale organique</option><option value="polygon(14% 3%,78% 0,100% 38%,88% 86%,34% 100%,0 66%)">Blob</option><option value="polygon(0 38%,16% 18%,33% 46%,50% 17%,67% 47%,84% 20%,100% 40%,100% 100%,0 100%)">Vague</option></select></label></>}
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

function elementStyle(e:CvElement){return {left:e.x,top:e.y,width:e.w,height:e.h,zIndex:e.z,opacity:e.opacity??1,transform:`rotate(${e.rotation||0}deg)`,borderRadius:e.radius||0,clipPath:e.clipPath&&e.clipPath!=="none"?e.clipPath:undefined,background:e.background||"transparent",color:e.color||"#263b3c",fontSize:e.fontSize,fontWeight:e.fontWeight,fontFamily:e.fontFamily,textAlign:e.align||"left",letterSpacing:e.letterSpacing} as React.CSSProperties}
function escapeHtml(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]!)).replace(/\n/g,"<br>")}
function renderStatic(els:CvElement[]){return els.filter(e=>!e.hidden).sort((a,b)=>a.z-b.z).map(e=>`<div class="cv-item ${e.kind}" style="left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;z-index:${e.z};opacity:${e.opacity??1};transform:rotate(${e.rotation||0}deg);border-radius:${e.radius||0}px;clip-path:${e.clipPath||"none"};background:${e.background||"transparent"};color:${e.color||"#263b3c"};font-size:${e.fontSize||14}px;font-weight:${e.fontWeight||400};font-family:${e.fontFamily||"Arial, sans-serif"};text-align:${e.align||"left"}">${e.kind==="shape"?"":escapeHtml(e.content)}</div>`).join("")}
const exportCss=`*{box-sizing:border-box}body{margin:0;background:#eee}.cv-stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:Arial,Helvetica,sans-serif}.cv-item{position:absolute;white-space:pre-wrap;line-height:1.35;padding:2px;box-sizing:border-box}.cv-item.icon{display:flex;align-items:center;justify-content:center;line-height:1}.cv-item.shape{padding:0}@media print{body{background:white}.cv-stage{margin:0}}`;
