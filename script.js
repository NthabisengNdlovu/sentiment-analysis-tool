const POS = ['love','great','amazing','excellent','happy','wonderful','perfect','awesome','fantastic','best','good','satisfied','delight','quick','helpful','fast','intuitive','smooth','easy','friendly','loved','beautiful','brilliant','outstanding'];
const NEG = ['hate','terrible','bad','awful','disappointed','worst','poor','slow','frustrating','broken','useless','angry','delayed','rude','expensive','horrible','annoying','confusing','buggy','unhelpful','issue','refund','cancel'];

function analyze(text){
  const lower=text.toLowerCase();
  const words=lower.match(/\b\w+\b/g)||[];
  let p=0,n=0,found=[];
  words.forEach(w=>{
    if(POS.includes(w)){p++; if(!found.includes(w)) found.push(w);}
    if(NEG.includes(w)){n++; if(!found.includes(w)) found.push(w);}
  });
  if(lower.includes('not good')) n+=2;
  if(lower.includes('really love')) p+=2;
  let sent='neutral';
  if(p>n) sent='positive';
  else if(n>p) sent='negative';
  const diff=Math.abs(p-n), tot=p+n;
  let conf= tot===0 ? 62 : 62+diff*11+tot*3;
  conf=Math.min(97,Math.max(48,conf+(text.length>80?5:0)));
  if(sent==='neutral' && tot===0) conf=64+Math.floor(Math.random()*8);
  return {sent, conf:Math.round(conf), keywords:found.slice(0,5), p, n};
}

const DATA=[
  {id:1,src:'Review',text:"I absolutely love the new checkout experience! It's so fast and intuitive, best I've used.",sent:'positive',conf:94,keys:['love','fast','best'],date:'2026-02-14'},
  {id:2,src:'Support',text:"Support agent was rude and my issue is still not resolved after 3 days. Terrible experience.",sent:'negative',conf:91,keys:['rude','terrible'],date:'2026-02-13'},
  {id:3,src:'Social',text:"Just got my order - packaging was amazing and delivery was super quick! Happy customer 💜",sent:'positive',conf:89,keys:['amazing','quick','happy'],date:'2026-02-13'},
  {id:4,src:'Review',text:"The product description was confusing and the size chart is broken. Frustrating process.",sent:'negative',conf:86,keys:['confusing','broken'],date:'2026-02-12'},
  {id:5,src:'Support',text:"Helpful agent, resolved my refund quickly. Good support overall.",sent:'positive',conf:76,keys:['helpful','good'],date:'2026-02-12'},
  {id:6,src:'Social',text:"Meh, it's okay I guess. Does what it says but nothing special.",sent:'neutral',conf:67,keys:['okay'],date:'2026-02-11'},
  {id:7,src:'Review',text:"WORST purchase ever. Item arrived damaged and customer service is useless.",sent:'negative',conf:96,keys:['worst','useless'],date:'2026-02-11'},
  {id:8,src:'Review',text:"Excellent quality and fantastic customer journey. The recommendation engine is brilliant.",sent:'positive',conf:92,keys:['excellent','fantastic'],date:'2026-02-10'},
  {id:9,src:'Support',text:"The chatbot is slow and keeps giving me generic answers.",sent:'negative',conf:82,keys:['slow'],date:'2026-02-10'},
  {id:10,src:'Social',text:"Your new AI features are awesome! Love how it predicts my needs.",sent:'positive',conf:90,keys:['awesome','love'],date:'2026-02-09'},
  {id:11,src:'Review',text:"Order was delayed by a week with no updates. Poor communication.",sent:'negative',conf:88,keys:['delayed','poor'],date:'2026-02-09'},
  {id:12,src:'Support',text:"It works. Had a question about invoice and got an answer.",sent:'neutral',conf:71,keys:[],date:'2026-02-08'},
];

let feedbacks=[...DATA];

function render(){
  const total=feedbacks.length;
  const pos=feedbacks.filter(f=>f.sent==='positive').length;
  const neg=feedbacks.filter(f=>f.sent==='negative').length;
  const neu=total-pos-neg;
  const avg=Math.round(feedbacks.reduce((a,b)=>a+b.conf,0)/total);
  document.getElementById('mTotal').textContent=total;
  document.getElementById('mPos').textContent=pos;
  document.getElementById('mPosPct').textContent=Math.round(pos/total*100)+'% positive';
  document.getElementById('mNeg').textContent=neg;
  document.getElementById('mNegPct').textContent=Math.round(neg/total*100)+'% negative';
  document.getElementById('mNeu').textContent=neu;
  document.getElementById('mNeuPct').textContent=Math.round(neu/total*100)+'% neutral • avg '+avg+'%';

  // donut
  const p1=pos/total*360;
  const p2=(pos+neg)/total*360;
  const ring=document.getElementById('donut');
  ring.style.setProperty('--p1', p1+'deg');
  ring.style.setProperty('--p2', p2+'deg');
  document.getElementById('donutCenter').textContent=total;

  // table
  const filter=document.getElementById('filter').value;
  const q=document.getElementById('search').value.toLowerCase();
  const tbody=document.getElementById('tbody');
  tbody.innerHTML='';
  feedbacks.filter(f=>{
    if(filter!=='all' && f.sent!==filter) return false;
    if(q && !f.text.toLowerCase().includes(q)) return false;
    return true;
  }).forEach(f=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td><b>${f.id}</b><br><span style="font-size:11px;color:#9A99B8">${f.src} • ${f.date}</span></td>
      <td>${f.text}</td>
      <td><span class="pill ${f.sent==='positive'?'pos':f.sent==='negative'?'neg':'neu'}">${f.sent.toUpperCase()}</span><div style="margin-top:6px;font-size:11px;color:#6B6A8A">${f.keys.join(', ')||'—'}</div></td>
      <td class="conf"><b>${f.conf}%</b><div class="conf-track"><div class="conf-fill" style="width:${f.conf}%;background:${f.sent==='positive'?'#00C48C':f.sent==='negative'?'#FF3B5C':'#6C5CE7'}"></div></div></td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('analyzeBtn').addEventListener('click',()=>{
  const txt=document.getElementById('inputText').value.trim();
  if(!txt){alert('Paste some text first'); return;}
  const r=analyze(txt);
  const box=document.getElementById('resultBox');
  box.classList.add('show');
  box.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="pill ${r.sent==='positive'?'pos':r.sent==='negative'?'neg':'neu'}">${r.sent.toUpperCase()} • ${r.conf}%</span>
      <span style="font-size:12px;color:#6B6A8A">pos:${r.p} neg:${r.n}</span>
    </div>
    <div style="margin-top:10px;font-size:13px">Keywords: <b>${r.keywords.join(', ')||'none'}</b></div>
    <div style="margin-top:8px" class="bar"><i style="width:${r.conf}%;background:${r.sent==='positive'?'#00C48C':r.sent==='negative'?'#FF3B5C':'#6C5CE7'}"></i></div>
  `;
  // add to dataset
  feedbacks.unshift({id:feedbacks.length+1,src:'Live',text:txt,sent:r.sent,conf:r.conf,keys:r.keywords,date:new Date().toISOString().slice(0,10)});
  render();
});

document.getElementById('filter').addEventListener('change',render);
document.getElementById('search').addEventListener('input',render);
document.getElementById('clearBtn').addEventListener('click',()=>{
  document.getElementById('inputText').value='';
  document.getElementById('resultBox').classList.remove('show');
});

render();
