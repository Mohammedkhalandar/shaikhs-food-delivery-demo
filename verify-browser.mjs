import fs from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createDemoServer} from './server.mjs';
import {BASE_PATH,REPOSITORY} from './pages-config.mjs';
const live=process.env.DEMO_TEST_URL;
const expectedLive='https://'+REPOSITORY.split('/')[0].toLowerCase()+'.github.io'+BASE_PATH;
if(live&&live!==expectedLive)throw Error('Live checks are restricted to the fictional public demo');
const server=live?null:createDemoServer();if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=live?new URL(live).origin:'http://127.0.0.1:'+server.address().port;
const base=live||origin+BASE_PATH,suffix=live?'live':'local';
let browser;let checks=0;const scans=[];
try{
 await fs.mkdir('.test-artifacts/demo-screens',{recursive:true});
 browser=await chromium.launch({headless:true,...(process.env.DEMO_BROWSER_EXECUTABLE?{executablePath:process.env.DEMO_BROWSER_EXECUTABLE}:{})});
 for(const width of [360,390,430,768,1440]){
  const context=await browser.newContext({viewport:{width,height:width<=430?844:1000},reducedMotion:'reduce'}),page=await context.newPage(),outbound=[],escaped=[];
  page.on('request',r=>{const url=new URL(r.url());if(url.origin!==origin)outbound.push(r.url());else if(!url.pathname.startsWith(BASE_PATH)&&url.pathname!==BASE_PATH.slice(0,-1))escaped.push(url.pathname);});
  await page.goto(base.slice(0,-1));if(new URL(page.url()).pathname!==BASE_PATH)throw Error('Missing project-path redirect');checks++;await page.getByRole('link',{name:'Explore menu',exact:true}).click();if(new URL(page.url()).pathname!==BASE_PATH||new URL(page.url()).hash!=='#menu')throw Error('Hash navigation escaped project path');checks++;await expect(page.getByRole('heading',{level:1})).toBeVisible();checks++;
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');checks++;
  const placeholderContrast=await page.locator('#search').evaluate(node=>{const luminance=color=>{const values=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;});return values[0]*0.2126+values[1]*0.7152+values[2]*0.0722;};const foreground=luminance(getComputedStyle(node,'::placeholder').color),background=luminance(getComputedStyle(node).backgroundColor);return (Math.max(foreground,background)+0.05)/(Math.min(foreground,background)+0.05);});if(placeholderContrast<4.5)throw Error('Search placeholder contrast below 4.5:1');checks++;
  const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(n=>n.id));if(new Set(ids).size!==ids.length)throw Error('Duplicate control IDs');checks++;
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',expectedLive+'assets/hero-biryani.jpg');checks++;
  await expect(page.locator('#restaurants-list .kitchen-card')).toHaveCount(3);checks++;
  await page.locator('.client-intro summary').click();await expect(page.locator('.client-intro')).toHaveAttribute('open','');checks++;await page.locator('.client-intro summary').click();
  await expect(page.getByRole('link',{name:'open the public demo issue tracker'})).toHaveAttribute('href','https://github.com/'+REPOSITORY+'/issues');checks++;
  await page.getByRole('button',{name:'Explore Meadow Table',exact:true}).click();await expect(page.locator('#products .card')).toHaveCount(2);await expect(page.locator('#search')).toBeFocused();checks++;
  await page.locator('#category').selectOption('Treat');await expect(page.locator('#empty-menu')).toBeVisible();checks++;
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();await expect(page.locator('#products .card')).toHaveCount(6);checks++;
  await page.getByLabel('Search fictional dishes',{exact:true}).fill('PANEER');await expect(page.locator('#products .card')).toHaveCount(1);checks++;
  await page.getByLabel('Search fictional dishes',{exact:true}).fill('<img src=x onerror=alert(1)>');await expect(page.locator('#empty-menu')).toBeVisible();await expect(page.locator('[onerror]')).toHaveCount(0);checks++;
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();await expect(page.locator('#products .card')).toHaveCount(6);checks++;
  async function scan(role){const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();if(audit.violations.length)throw Error('Accessibility violation: '+audit.violations.map(v=>v.id).join(','));scans.push({width,role});}
  await scan('CUSTOMER');
  await page.locator('#open-cart').click();await expect(page.locator('#place-order')).toBeDisabled();checks++;await page.getByRole('button',{name:'Close basket',exact:true}).click();
  await page.getByRole('button',{name:'Add Meadow biryani bowl',exact:true}).click();
  await expect(page.getByRole('button',{name:'Add Meadow biryani bowl',exact:true})).toBeFocused();checks++;
  await page.locator('#open-cart').click();await expect(page.getByRole('dialog')).toBeVisible();checks++;
  for(let i=0;i<3;i++)await page.getByRole('button',{name:'Add one Meadow biryani bowl',exact:true}).click();await expect(page.getByRole('button',{name:'Add one Meadow biryani bowl',exact:true})).toBeDisabled();checks++;
  for(let i=0;i<3;i++)await page.getByRole('button',{name:'Remove one Meadow biryani bowl',exact:true}).click();await expect(page.getByRole('button',{name:'Remove one Meadow biryani bowl',exact:true})).toBeFocused();await expect(page.locator('#totals')).toContainText('284');checks++;
  await scan('BASKET');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();checks++;
  await page.locator('#open-cart').click();await page.getByRole('button',{name:'Simulate COD order',exact:true}).click();
  await expect(page.locator('#order-summary')).toContainText('QUEUED');checks++;
  for(const [role,actions]of [['RESTAURANT',['Simulate acceptance','Simulate preparation','Simulate ready for pickup']],['RIDER',['Simulate pickup','Simulate delivery']],['ADMIN',['Simulate COD reconciliation']]]){
   await page.locator('#role').selectOption(role);
   for(const action of actions){await page.getByRole('button',{name:action,exact:true}).click();checks++;}
   await scan(role);
  }
  await expect(page.locator('#order-summary')).toContainText('RECONCILED');checks++;
  for(const image of await page.locator('#products img').all()){await image.scrollIntoViewIfNeeded();await expect(image).toHaveJSProperty('complete',true);if(!await image.evaluate(n=>n.naturalWidth>0))throw Error('Menu image missing');}checks++;
  await page.screenshot({path:`.test-artifacts/demo-screens/${suffix}-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Reset demo',exact:true}).click();await expect(page.locator('#cart-count')).toHaveText('0');checks++;
  if(escaped.length)throw Error('Asset escaped repository subpath');if(outbound.length){await fs.writeFile('.test-artifacts/demo-outbound.json',JSON.stringify(outbound,null,2));throw Error('Unexpected external request: '+outbound.map(u=>new URL(u).protocol+' '+new URL(u).origin).join(','));}checks++;
  await page.reload();await expect(page.locator('#cart-count')).toHaveText('0');checks++;
  const probe=await context.newPage();await probe.goto(base);const directive=await probe.evaluate(()=>new Promise(resolve=>{addEventListener('securitypolicyviolation',event=>resolve(event.effectiveDirective),{once:true});fetch('https://example.invalid/demo-csp-probe').catch(()=>{});setTimeout(()=>resolve('not-enforced'),1500);}));if(directive!=='connect-src')throw Error('HTML CSP did not block connection');checks++;await probe.close();
  await context.close();
 }
 await fs.writeFile(`.test-artifacts/handoff-browser-${suffix}.json`,JSON.stringify({checks,scans,physicalDeviceTesting:false,outboundRequests:0},null,2));
 console.log(JSON.stringify({scope:suffix,checks,accessibilityScans:scans.length,outboundRequests:0,physicalDeviceTesting:false}));
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));}
