import assert from 'node:assert/strict';
import {callModel} from '../../scripts/ai_reports/ai_client.mjs';
const config={baseUrl:'https://example.invalid',apiKey:'test',model:'primary',models:['primary','backup'],timeoutMs:20,totalTimeoutMs:100};
let calls=[];
const success=()=>new Response(JSON.stringify({choices:[{message:{content:'{"ok":true}'}}]}),{status:200});
for (const mode of ['timeout','404']) {
 calls=[];
 globalThis.fetch=async(url,options)=>{const model=JSON.parse(options.body).model;calls.push(model);if(model==='backup')return success();if(mode==='timeout')throw new DOMException('timeout','TimeoutError');return new Response('{}',{status:404});};
 const result=await callModel(config,[],{log:()=>{}});assert.equal(result.model,'backup');assert.deepEqual(calls,['primary','backup']);
}
calls=[];globalThis.fetch=async()=>{calls.push(1);return new Response('{}',{status:401})};
await assert.rejects(callModel(config,[],{log:()=>{}}),/401/);assert.equal(calls.length,1);
globalThis.fetch=(url,{signal})=>new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>reject(signal.reason));});
const keepAlive=setInterval(()=>{},1000);
try{await assert.rejects(callModel({...config,timeoutMs:1000,totalTimeoutMs:15},[],{log:()=>{}}),/Total generation time/)}finally{clearInterval(keepAlive)}
console.log('PASS: timeout and 404 fallback; auth fails immediately; total deadline enforced');
