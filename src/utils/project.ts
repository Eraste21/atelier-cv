import type { CvElement } from "../types";

export const cloneElements=(elements:CvElement[])=>JSON.parse(JSON.stringify(elements)) as CvElement[];

export const cvFileName=(name:string)=>`CV_${name.trim().replace(/[^a-zA-ZÀ-ÿ0-9]+/g,"_").replace(/^_|_$/g,"")||"Mon_CV"}`;

export function downloadBlob(data:BlobPart,name:string,type:string){
  const url=URL.createObjectURL(new Blob([data],{type}));
  const link=document.createElement("a");link.href=url;link.download=name;link.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
