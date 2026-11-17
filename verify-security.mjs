import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import yaml from 'js-yaml';
import {BASE_PATH,CSP,REPOSITORY} from './pages-config.mjs';
const assets=JSON.parse(await fs.readFile('ASSET_MANIFEST.json','utf8'));
const allowed=new Set(['index.html','404.html','style.css','app.js','.nojekyll',...assets.map(a=>a.file)]);
const found=[];
async function walk(dir,prefix=''){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const name=prefix+entry.name,full=path.join(dir,entry.name);assert.ok(!entry.isSymbolicLink(),'No symlinks in export');if(entry.isDirectory())await walk(full,name+'/');else found.push(name);}}
await walk('dist');assert.deepEqual([...found].sort(),[...allowed].sort(),'Only reviewed static files may be exported');
for(const asset of assets){for(const base of ['','dist/'])assert.equal(createHash('sha256').update(await fs.readFile(base+asset.file)).digest('hex'),asset.sha256,'Asset matches its reviewed original illustration');}
const html=await fs.readFile('dist/index.html','utf8'),app=await fs.readFile('dist/app.js','utf8');
assert.ok(html.indexOf(`content="${CSP}"`)>0&&html.indexOf('Content-Security-Policy')<html.indexOf('<script'),'HTML CSP before scripts');
assert.match(html,/FICTIONAL CLIENT DEMO/);assert.match(html,/No real orders, payments, accounts or deliveries/);
assert.doesNotMatch(html,/<(?:form|input|iframe|base)\b|(?:src|href)=["']\//i);
assert.doesNotMatch(app,/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|process|require)\b|razorpay|prisma|DATABASE_URL/i);
const pkg=JSON.parse(await fs.readFile('package.json','utf8'));assert.ok(!pkg.dependencies,'No runtime dependencies');
const verify=yaml.load(await fs.readFile('.github/workflows/verify.yml','utf8'));
const pages=yaml.load(await fs.readFile('.github/workflows/pages.yml','utf8'));
assert.deepEqual(verify.permissions,{contents:'read'});assert.deepEqual(pages.permissions,{contents:'read'});
assert.deepEqual(Object.keys(pages.on),['workflow_dispatch'],'No automatic deployment on push');
assert.ok(pages.jobs.build.if.includes(REPOSITORY)&&pages.jobs.build.if.includes('refs/heads/main')&&pages.jobs.build.if.includes('PUBLISH_STATIC_DEMO'));
assert.equal(pages.jobs.deploy.needs,'build');assert.equal(pages.jobs.deploy.environment.name,'github-pages');
assert.deepEqual(pages.jobs.deploy.permissions,{contents:'read',pages:'write','id-token':'write'});
for(const workflow of [verify,pages])for(const job of Object.values(workflow.jobs))for(const step of job.steps){if(step.uses)assert.match(step.uses,/@[a-f0-9]{40}$/,'Immutable action pins');}
const upload=pages.jobs.build.steps.find(step=>step.uses?.startsWith('actions/upload-pages-artifact@'));assert.equal(upload.with.path,'dist');
const configure=pages.jobs.deploy.steps.find(step=>step.uses?.startsWith('actions/configure-pages@'));assert.equal(configure.with.enablement,false,'Never enable Pages implicitly');
for(const gate of ['npm ci','npm run lint','npm audit --audit-level=moderate','npm run build','npm test','npm run test:security','npm run test:browser'])for(const job of [verify.jobs.verify,pages.jobs.build])assert.ok(job.steps.some(step=>step.run===gate));
const issues=[];let sourceFiles=0;
async function scan(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(['node_modules','.git','.test-artifacts','dist'].includes(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory()){await scan(f);continue;}sourceFiles++;if(/(?:^|[\\/])\.env(?:\.|$)|\.(?:pem|pfx|key|dump|backup|zip|db|sqlite3?)$/i.test(f))issues.push(f+': forbidden private file');const s=await fs.readFile(f,'utf8');if(/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[A-Z0-9]{16})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|[A-Z]:[\\/]Users[\\/][a-zA-Z0-9_-]+|\b[\w-]+\.tail[\w-]+\.ts\.net\b|[a-zA-Z0-9._%+-]+@(?:gmail|yahoo|outlook)\.com/.test(s))issues.push(f+': private identity or credential pattern');}}
await scan('.');assert.deepEqual(issues,[]);
await fs.mkdir('.test-artifacts',{recursive:true});
await fs.writeFile('.test-artifacts/security.json',JSON.stringify({sourceFiles,staticFiles:found.length,basePath:BASE_PATH,runtimeDependencies:0,privateFindings:issues,automaticDeployment:false},null,2));
console.log(`PASS: ${sourceFiles} source files, ${found.length} static files, project-path assets, HTML CSP, no runtime/backend dependencies or private findings; manual deployment only`);
