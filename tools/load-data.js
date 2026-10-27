/* 与页面使用同一脚本顺序，避免新增城市未进入检查。 */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const scripts=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)" defer><\/script>/g)].map(m=>m[1]);
function boot(storage=new Map(),options={}){
 const context={window:{},URLSearchParams,localStorage:{getItem(k){if(options.blocked)throw Error('blocked');return storage.get(k)??null;},setItem(k,v){if(options.blocked||options.quota)throw Error('unavailable');storage.set(k,v);}}};
 for(const file of scripts.filter(f=>!f.endsWith('main.js')))vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 return {data:context.window.Daytrip,api:context.window.DaytripExperience};
}
module.exports={boot,scripts,root};
