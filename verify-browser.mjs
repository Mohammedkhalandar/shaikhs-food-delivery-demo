import fs from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createDemoServer} from './server.mjs';
import {BASE_PATH} from './pages-config.mjs';
const server=createDemoServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const base=origin+BASE_PATH;
let browser;let checks=0;const scans=[];
try{
 await fs.mkdir('.test-artifacts/demo-screens',{recursive:true});
 browser=await chromium.launch({headless:true,...(process.env.DEMO_BROWSER_EXECUTABLE?{executablePath:process.env.DEMO_BROWSER_EXECUTABLE}:{})});
 for(const width of [390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),outbound=[],escaped=[];
  page.on('request',r=>{const url=new URL(r.url());if(url.origin!==origin)outbound.push(r.url());else if(!url.pathname.startsWith(BASE_PATH)&&url.pathname!==BASE_PATH.slice(0,-1))escaped.push(url.pathname);});
  await page.goto(base.slice(0,-1));if(new URL(page.url()).pathname!==BASE_PATH)throw Error('Missing project-path redirect');checks++;await page.getByRole('link',{name:'Explore menu',exact:true}).click();if(new URL(page.url()).pathname!==BASE_PATH||new URL(page.url()).hash!=='#menu')throw Error('Hash navigation escaped project path');checks++;await expect(page.getByRole('heading',{level:1})).toBeVisible();checks++;
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');checks++;
  await page.getByRole('button',{name:'Add Meadow biryani bowl',exact:true}).click();
  await page.locator('#open-cart').click();await expect(page.getByRole('dialog')).toBeVisible();checks++;
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();checks++;
  await page.locator('#open-cart').click();await page.getByRole('button',{name:'Simulate COD order',exact:true}).click();
  await expect(page.locator('#order-summary')).toContainText('QUEUED');checks++;
  for(const [role,actions]of [['RESTAURANT',['Simulate acceptance','Simulate preparation','Simulate ready for pickup']],['RIDER',['Simulate pickup','Simulate delivery']],['ADMIN',['Simulate COD reconciliation']]]){
   await page.locator('#role').selectOption(role);
   for(const action of actions){await page.getByRole('button',{name:action,exact:true}).click();checks++;}
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   if(audit.violations.length)throw Error('Accessibility violation: '+audit.violations.map(v=>v.id).join(','));scans.push({width,role});
  }
  await expect(page.locator('#order-summary')).toContainText('RECONCILED');checks++;
  await page.screenshot({path:`.test-artifacts/demo-screens/${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Reset demo',exact:true}).click();await expect(page.locator('#cart-count')).toHaveText('0');checks++;
  if(escaped.length)throw Error('Asset escaped repository subpath');if(outbound.length){await fs.writeFile('.test-artifacts/demo-outbound.json',JSON.stringify(outbound,null,2));throw Error('Unexpected external request: '+outbound.map(u=>new URL(u).protocol+' '+new URL(u).origin).join(','));}checks++;
  await page.reload();await expect(page.locator('#cart-count')).toHaveText('0');checks++;
  const probe=await context.newPage();await probe.goto(base);const directive=await probe.evaluate(()=>new Promise(resolve=>{addEventListener('securitypolicyviolation',event=>resolve(event.effectiveDirective),{once:true});fetch('https://example.invalid/demo-csp-probe').catch(()=>{});setTimeout(()=>resolve('not-enforced'),1500);}));if(directive!=='connect-src')throw Error('HTML CSP did not block connection');checks++;await probe.close();
  await context.close();
 }
 await fs.writeFile('.test-artifacts/demo-browser.json',JSON.stringify({checks,scans,physicalDeviceTesting:false,outboundRequests:0},null,2));
 console.log(JSON.stringify({checks,accessibilityScans:scans.length,outboundRequests:0,physicalDeviceTesting:false}));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
