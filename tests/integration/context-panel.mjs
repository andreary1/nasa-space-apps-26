import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
class Element {
 constructor(){this.children=[];this.attrs={};this.listeners={};this.textContent='';}
 append(...x){this.children.push(...x)}
 replaceChildren(...x){this.children=x}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,v){this.listeners[k]=v}
 focus(){}
}
const elements={};
globalThis.document={getElementById:id=>elements[id] ||= new Element(),createElement:()=>new Element()};
const catalog=JSON.parse(readFileSync('deliverables/demo/js/data/geographical-context.json','utf8'));
globalThis.fetch=async()=>({ok:true,json:async()=>catalog});
const {GeographicalContext}=await import('../../deliverables/demo/js/components/geographicalContext.js');
const panel=new GeographicalContext();
assert.equal(elements['context-tab'].attrs['aria-selected'],'true');
await panel.prepare({id:'jericoacoara',region:'CE'});
assert.ok(panel.container.children.some(e=>e.className==='context-fact'));
panel.activate('comparison');
await panel.prepare({id:'unknown',region:'Nova localidade'});
assert.equal(elements['comparison-tab'].attrs['aria-selected'],'true');
assert.equal(panel.container.children.length,2);
panel.render({biome:null,vegetation:' ',sources:[],review_status:'reviewed'},{region:'Teste'});
assert.equal(panel.container.children.length,1);
let resolve;
panel.catalog=new Promise(r=>resolve=r);
const first=panel.prepare({id:'jericoacoara',region:'Antiga'});
const second=panel.prepare({id:'unknown',region:'Atual'});
resolve(catalog);await Promise.all([first,second]);
assert.equal(panel.container.children[0].textContent,'Atual');
console.log('PASS: context tabs, catalog, empty fields, missing site, rapid selection');
