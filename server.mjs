import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {BASE_PATH} from './pages-config.mjs';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
// Mount exactly as a Pages project site. No custom security headers: tests rely on HTML CSP.
export function createDemoServer(){return http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
  let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  if(route===BASE_PATH.slice(0,-1)){res.writeHead(301,{Location:BASE_PATH});res.end();return;}
  if(!route.startsWith(BASE_PATH)){res.writeHead(404);res.end();return;}
  const file=route.slice(BASE_PATH.length)||'index.html';
  if(!/^(?:index\.html|404\.html|style\.css|app\.js|assets\/(?:[a-z0-9-]+\.jpg|icon-192\.png))$/.test(file)){res.writeHead(404);res.end();return;}
  try{const bytes=await fs.readFile(path.join(root,file));const type={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'}[path.extname(file)];res.writeHead(200,{'Content-Type':type});res.end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(404);res.end();}
});}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const server=createDemoServer();server.listen(Number(process.env.DEMO_PORT||4175),'127.0.0.1',()=>console.log('Local Pages preview: http://127.0.0.1:'+server.address().port+BASE_PATH));}
