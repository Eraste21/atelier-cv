export type Align = "left" | "center" | "right";
export type ElementKind = "text" | "icon" | "shape";

export type CvElement = {
  id:string; kind:ElementKind; x:number; y:number; w:number; h:number; content:string;
  fontSize?:number; fontWeight?:number; fontFamily?:string; color?:string; background?:string;
  align?:Align; opacity?:number; rotation?:number; radius?:number; locked?:boolean; hidden?:boolean;
  z:number; label:string; clipPath?:string; backgroundLayer?:boolean; letterSpacing?:number;
};

export type SavedProject={id:string;name:string;savedAt:string;elements:CvElement[];bg:string};
