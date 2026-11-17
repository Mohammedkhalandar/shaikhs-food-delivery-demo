import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {BASE_PATH,REPOSITORY} from './pages-config.mjs';
const url='https://'+REPOSITORY.split('/')[0].toLowerCase()+'.github.io'+BASE_PATH;
const browser=await chromium.launch({headless:true,...(process.env.DEMO_BROWSER_EXECUTABLE?{executablePath:process.env.DEMO_BROWSER_EXECUTABLE}:{})});
const samples=[];
try{
 for(const profile of [{name:'mobile',width:390,height:844,latency:150,bytesPerSecond:200000,cpu:4},{name:'desktop',width:1440,height:1000,latency:40,bytesPerSecond:1250000,cpu:1}])for(let run=1;run<=3;run++){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height}}),page=await context.newPage();
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:profile.latency,downloadThroughput:profile.bytesPerSecond,uploadThroughput:profile.bytesPerSecond});await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.cpu});
  await page.addInitScript(()=>{window.__demoMetrics={lcp:0,cls:0};let first=0,last=0,total=0;new PerformanceObserver(list=>{for(const e of list.getEntries())window.__demoMetrics.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries()){if(e.hadRecentInput)continue;if(!first||e.startTime-last>1000||e.startTime-first>5000){first=e.startTime;total=0;}last=e.startTime;total+=e.value;window.__demoMetrics.cls=Math.max(window.__demoMetrics.cls,total);}}).observe({type:'layout-shift',buffered:true});});
  const response=await page.goto(url,{waitUntil:'networkidle'});assert.equal(response.status(),200);await page.waitForTimeout(300);
  const metrics=await page.evaluate(()=>({...window.__demoMetrics,loadMs:performance.getEntriesByType('navigation')[0].duration,transferBytes:performance.getEntriesByType('navigation').concat(performance.getEntriesByType('resource')).reduce((n,e)=>n+e.transferSize,0)}));assert.ok(metrics.lcp>0,'LCP actually observed');samples.push({profile,run,...metrics});await context.close();
 }
 const median=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)];const summary={};
 for(const name of ['mobile','desktop']){const values=samples.filter(s=>s.profile.name===name);summary[name]={medianLcpMs:Math.round(median(values.map(s=>s.lcp))),maxCls:Math.max(...values.map(s=>s.cls)),medianTransferBytes:median(values.map(s=>s.transferBytes))};}
 await fs.mkdir('.test-artifacts',{recursive:true});await fs.writeFile('.test-artifacts/handoff-performance.json',JSON.stringify({url,scope:'Chromium lab emulation; fresh contexts, cache disabled, actual CDP throttling; not physical devices, field p75 or INP',samples,summary},null,2));console.log(JSON.stringify(summary));
}finally{await browser.close();}
