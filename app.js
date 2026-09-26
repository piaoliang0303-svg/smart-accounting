const KEY="simple-accounting-v1";
const expenseCats=["餐饮","交通","购物","住房","娱乐","医疗","孩子","人情","其他"],incomeCats=["工资","奖金","兼职","生意","红包","其他"];
let data=JSON.parse(localStorage.getItem(KEY)||"[]"),type="expense";
const $=id=>document.getElementById(id);
$("date").value=new Date().toISOString().slice(0,10);$("monthFilter").value=new Date().toISOString().slice(0,7);
function cats(){let a=type==="expense"?expenseCats:incomeCats;$("category").innerHTML=a.map(x=>`<option>${x}</option>`).join("")}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function money(n){return "¥"+Number(n).toFixed(2)}
function month(){return $("monthFilter").value}
function render(){
 const m=month(),rows=data.filter(x=>x.date.startsWith(m));
 let inc=rows.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0),out=rows.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
 $("income").textContent=money(inc);$("expense").textContent=money(out);$("balance").textContent=money(inc-out);$("monthLabel").textContent=m;
 let map={};rows.filter(x=>x.type==="expense").forEach(x=>map[x.category]=(map[x.category]||0)+x.amount);draw(map);
 $("list").innerHTML=rows.sort((a,b)=>b.created-a.created).map(x=>`<div class="item"><div><b>${x.category}</b><small>${x.date} ${x.note||""}</small></div><div class="amt ${x.type==="income"?"plus":"minus"}">${x.type==="income"?"+":"-"}${money(x.amount)} <button class="delete" onclick="del('${x.id}')">删除</button></div></div>`).join("")||'<p class="muted">这个月还没有账单。</p>'
}
function draw(map){
 let c=$("chart"),ctx=c.getContext("2d"),vals=Object.values(map),sum=vals.reduce((a,b)=>a+b,0);ctx.clearRect(0,0,c.width,c.height);
 if(!sum){ctx.beginPath();ctx.arc(110,110,70,0,Math.PI*2);ctx.strokeStyle="#e5e7eb";ctx.lineWidth=24;ctx.stroke();$("legend").innerHTML='<p class="muted">暂无支出数据</p>';return}
 let start=-Math.PI/2,keys=Object.keys(map),html="";
 keys.forEach((k,i)=>{let a=map[k]/sum*Math.PI*2;ctx.beginPath();ctx.moveTo(110,110);ctx.arc(110,110,82,start,start+a);ctx.closePath();ctx.fillStyle=`hsl(${i*45+20} 65% 55%)`;ctx.fill();start+=a;html+=`<div><span><i class="dot"></i>${k}</span><b>${money(map[k])}</b></div>`});
 $("legend").innerHTML=html
}
function del(id){if(confirm("确定删除这笔账单吗？")){data=data.filter(x=>x.id!==id);save();render()}}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");type=b.dataset.type;cats()});
$("form").onsubmit=e=>{e.preventDefault();let amount=Number($("amount").value);if(!amount)return;data.push({id:crypto.randomUUID(),type,amount,category:$("category").value,date:$("date").value,note:$("note").value.trim(),created:Date.now()});save();$("amount").value="";$("note").value="";render();navigator.vibrate?.(25)};
$("monthFilter").onchange=render;
$("exportBtn").onclick=()=>{let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="简记备份-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(a.href)};
$("importBtn").onclick=()=>$("fileInput").click();
$("fileInput").onchange=async e=>{try{let arr=JSON.parse(await e.target.files[0].text());if(!Array.isArray(arr))throw 0;data=arr;save();render();alert("导入成功")}catch{alert("备份文件格式不正确")}};
$("clearBtn").onclick=()=>{if(confirm("确定清空全部账单？此操作不可恢复，建议先导出备份。")){data=[];save();render()}};
cats();render();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");