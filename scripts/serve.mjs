import http from 'node:http'; import {readFileSync,existsSync,statSync} from 'node:fs'; import path from 'node:path';
const OUT=path.join(process.cwd(),'dist');
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);let f=path.join(OUT,u);
 if(existsSync(f)&&statSync(f).isDirectory())f=path.join(f,'index.html');
 if(!existsSync(f)){f=path.join(OUT,'404.html');res.statusCode=404;}
 res.setHeader('Content-Type',T[path.extname(f)]||'application/octet-stream');
 res.end(readFileSync(f));}).listen(8099,()=>console.log('up'));
