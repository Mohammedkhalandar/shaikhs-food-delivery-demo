import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {CSP,BASE_PATH} from './pages-config.mjs';
const root=path.dirname(fileURLToPath(import.meta.url)),dist=path.join(root,'dist');
await fs.mkdir(dist,{recursive:true});
const html=await fs.readFile(path.join(root,'index.html'),'utf8');
const meta=`<meta http-equiv="Content-Security-Policy" content="${CSP}"><meta name="referrer" content="no-referrer">`;
await fs.writeFile(path.join(dist,'index.html'),html.replace('<head>','<head>'+meta));
for(const file of ['style.css','app.js'])await fs.copyFile(path.join(root,file),path.join(dist,file));
await fs.cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
await fs.writeFile(path.join(dist,'.nojekyll'),'');
await fs.writeFile(path.join(dist,'404.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>Demo page not found</title></head><body><main><h1>Demo page not found</h1><p>This fictional walkthrough has no real ordering service.</p><a href="'+BASE_PATH+'">Return to the demo</a></main></body></html>');
const inventory=[];async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())await walk(full);else inventory.push({file:path.relative(dist,full).replaceAll('\\','/'),sha256:createHash('sha256').update(await fs.readFile(full)).digest('hex')});}}
await walk(dist);await fs.mkdir(path.join(root,'.test-artifacts'),{recursive:true});await fs.writeFile(path.join(root,'.test-artifacts/build-manifest.json'),JSON.stringify(inventory,null,2));
console.log(`Built ${inventory.length} static files for ${BASE_PATH}; no server-only dependencies exported`);
