const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cores=["#13293D","#006494","#247BA0","#13293D","#006494","#247BA0"];
const SAFE=["Biblioteca Municipal","Escola Estadual do bairro","Praça central","Shopping (praça de alimentação)"];
let user=null,books=[
 {id:1,t:"Dom Casmurro",a:"Machado de Assis",g:"Romance",m:"Doação",c:"Bom",b:"Centro",s:"Disponível",own:"Ana",syn:"Bentinho narra suas dúvidas sobre Capitu em um clássico da literatura brasileira."},
 {id:2,t:"O Hobbit",a:"J. R. R. Tolkien",g:"Fantasia",m:"Troca",c:"Usado",b:"Manaíra",s:"Disponível",own:"Beto",syn:"Bilbo Bolseiro parte numa aventura inesperada com treze anões."},
 {id:3,t:"Matemática Básica",a:"Gelson Iezzi",g:"Didático",m:"Doação",c:"Novo",b:"Bancários",s:"Disponível",own:"Carla",syn:"Livro de apoio para o ensino médio, com exercícios resolvidos."},
 {id:4,t:"Capitães da Areia",a:"Jorge Amado",g:"Romance",m:"Doação",c:"Usado",b:"Mangabeira",s:"Disponível",own:"Davi",syn:"A vida de meninos de rua em Salvador, narrada com poesia e crítica social."},
 {id:5,t:"O Pequeno Príncipe",a:"Antoine de Saint-Exupéry",g:"Infantil",m:"Troca",c:"Bom",b:"Tambaú",s:"Disponível",own:"Elisa",syn:"Um pequeno viajante de outro planeta ensina sobre amizade e essência."}
];
let reqs=[{id:101,bid:0,t:"Dom Quixote (exemplo)",who:"Fábio",dir:"rec",s:"Em negociação",ok:{me:false,out:false}}];
let cur=null,tab="env",chats={};
const ISBN={"9788535914849":["Sagarana","Guimarães Rosa","Ficção"],"9788525406958":["1984","George Orwell","Ficção"],"9788532530787":["Harry Potter e a Pedra Filosofal","J. K. Rowling","Fantasia"]};
const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove("on"),2600)};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cover=b=>`<div class="cover" role="img" aria-label="Capa do livro ${esc(b.t)}, de ${esc(b.a)}" style="--c:${b.img?`center/cover url(${b.img})`:cores[b.id%6]}">${b.img?"":esc(b.t)}</div>`;

function go(v){
  $$(".v").forEach(e=>e.classList.toggle("on",e.id==="v-"+v));
  $$("#nav button").forEach(b=>b.toggleAttribute("aria-current",b.dataset.go===v)||0);
  $$("#nav button").forEach(b=>b.dataset.go===v?b.setAttribute("aria-current","page"):b.removeAttribute("aria-current"));
  if(v==="vitrine")renderVit();if(v==="trocas")renderTr();if(v==="chat")renderChat();
  try{history.replaceState(null,"","#"+v)}catch(e){}
  $("#main").focus();scrollTo(0,0);
}
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(g)go(g.dataset.go)});

$("#fLogin").onsubmit=e=>{e.preventDefault();user={n:$("#nome").value,b:$("#bairro").value};$("#nav").hidden=false;toast("Olá, "+user.n+"! Bairro: "+user.b);$("#fb").value=user.b;go("vitrine");$("#fb").value=user.b;renderVit()};

function fillFilters(){
  const bs=[...new Set(books.map(b=>b.b))],gs=[...new Set(books.map(b=>b.g))];
  const keep=[$("#fb").value,$("#fg").value];
  $("#fb").innerHTML='<option value="">Todos</option>'+bs.map(x=>`<option>${x}</option>`).join("");
  $("#fg").innerHTML='<option value="">Todos</option>'+gs.map(x=>`<option>${x}</option>`).join("");
  $("#fb").value=keep[0];$("#fg").value=keep[1];
}
function renderVit(){
  fillFilters();
  const q=$("#q").value.toLowerCase(),m=$("#fm").value,b=$("#fb").value,g=$("#fg").value;
  const r=books.filter(x=>x.s==="Disponível"&&(!q||(x.t+x.a).toLowerCase().includes(q))&&(!m||x.m===m)&&(!b||x.b===b)&&(!g||x.g===g));
  $("#count").textContent=r.length?r.length+" livro(s) encontrado(s)":"";
  $("#grid").innerHTML=r.length?r.map(x=>`<article class="card">${cover(x)}<strong>${esc(x.t)}</strong><div class="mu">${esc(x.a)}</div>
   <div><span class="tag">${x.m}</span><span class="tag">${x.c}</span></div>
   <div class="mu">Bairro: ${x.b}${x.b===user?.b?" (seu bairro)":""}</div>
   <p style="margin:8px 0 0"><button class="btn sm" data-id="${x.id}">Ver detalhes</button></p></article>`).join("")
   :'<p class="card">Nenhum livro encontrado com esses filtros. Tente limpar a busca ou escolher outro bairro.</p>';
}
["#q","#fm","#fb","#fg"].forEach(s=>$(s).addEventListener("input",renderVit));
$("#grid").onclick=e=>{const id=e.target.dataset.id;if(id)abrir(+id)};

function abrir(id){
  cur=books.find(b=>b.id===id);
  const mine=cur.own==="Você";
  $("#det").innerHTML=`${cover(cur)}<h2 id="t-det">${esc(cur.t)}</h2><p class="mu">${esc(cur.a)}</p><p>${esc(cur.syn||"Sem sinopse informada.")}</p>
   <p><span class="tag">${cur.g}</span><span class="tag">${cur.m}</span><span class="tag">Conservação: ${cur.c}</span></p>
   <p>Oferecido por <strong>${esc(cur.own)}</strong> • bairro ${cur.b}<br><span class="mu">O endereço exato não é exibido.</span></p>
   <button class="btn" id="bSol" ${mine?"disabled":""}>${mine?"Este livro é seu":"Solicitar "+cur.m}</button>`;
  go("detalhe");
  const s=$("#bSol");if(s&&!mine)s.onclick=()=>{
    if(reqs.some(r=>r.bid===cur.id&&r.dir==="env")){toast("Você já solicitou este livro.");return}
    cur.s="Reservado";reqs.push({id:Date.now(),bid:cur.id,t:cur.t,who:cur.own,dir:"env",s:"Em negociação",ok:{me:false,out:false}});
    chats[cur.id]=[{me:false,x:`Oi! Vi que você quer "${cur.t}". Podemos combinar a entrega?`}];
    toast("Solicitação enviada! Status: Em negociação");go("chat");
  };
}

$("#bIsbn").onclick=()=>{const d=ISBN[$("#isbn").value.trim()];
  if(!d){toast("ISBN não encontrado na demonstração. Preencha manualmente.");return}
  $("#ct").value=d[0];$("#ca").value=d[1];$("#cg").value=d[2];toast("Dados preenchidos pelo ISBN")};
$("#fCad").onsubmit=e=>{e.preventDefault();
  const f=$("#cf").files[0],add=img=>{books.unshift({id:Date.now(),t:$("#ct").value,a:$("#ca").value,g:$("#cg").value,m:$("#cm").value,c:$("#cc").value,b:user.b,s:"Disponível",own:"Você",syn:"",img});
    e.target.reset();toast("Livro publicado na vitrine!");go("vitrine")};
  if(f){const r=new FileReader();r.onload=()=>add(r.result);r.readAsDataURL(f)}else add()};

function chatKey(){const r=reqs.find(r=>r.dir==="env"&&r.s==="Em negociação");return r?r.bid:null}
function renderChat(){
  const k=chatKey(),c=$("#fMsg").querySelector("button"),i=$("#msg");
  c.disabled=i.disabled=!k;
  $("#chatInfo").textContent=k?"Conversa sobre “"+books.find(b=>b.id===k).t+"”. Telefones não são compartilhados.":"Solicite um livro na vitrine para abrir uma conversa.";
  $("#msgs").innerHTML=(chats[k]||[]).map(m=>`<div class="m ${m.me?"me":""}">${esc(m.x)}</div>`).join("");
  $("#chips").innerHTML=SAFE.map(p=>`<button class="chip" data-p="${p}">${p}</button>`).join("");
  $("#msgs").scrollTop=1e5;
}
function say(x,me=true){const k=chatKey();if(!k)return;chats[k].push({me,x});renderChat()}
$("#fMsg").onsubmit=e=>{e.preventDefault();const v=$("#msg").value;$("#msg").value="";say(v);
  setTimeout(()=>say("Combinado! Confirmo por aqui.",false),900)};
$("#chips").onclick=e=>{const p=e.target.dataset.p;if(p){say("Sugiro nos encontrarmos em: "+p);setTimeout(()=>say("Pode ser! Levo o livro lá.",false),900)}};
$("#rep").onclick=()=>toast("Denúncia registrada para análise (demonstração).");

$$(".tabs button").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;$$(".tabs button").forEach(x=>{const on=x===b;x.setAttribute("aria-pressed",on);x.classList.toggle("alt",!on)});renderTr()});
function renderTr(){
  const l=reqs.filter(r=>r.dir===tab);
  $("#lista").innerHTML=l.length?l.map(r=>`<div class="card"><strong>${esc(r.t)}</strong><br><span class="mu">${tab==="env"?"Doador: ":"Solicitante: "}${esc(r.who)}</span>
   <p><span class="tag">${r.s}</span>${r.s==="Em negociação"?`<span class="tag">Sua confirmação: ${r.ok.me?"feita":"pendente"}</span><span class="tag">Outra parte: ${r.ok.out?"feita":"pendente"}</span>`:""}</p>
   ${r.s==="Em negociação"?`<button class="btn sm" data-conf="${r.id}" ${r.ok.me?"disabled":""}>Confirmar entrega concluída</button>`:""}</div>`).join("")
   :'<p class="card">Nenhum pedido aqui ainda.</p>';
}
$("#lista").onclick=e=>{const id=e.target.dataset.conf;if(!id)return;
  const r=reqs.find(x=>x.id==id);r.ok.me=true;toast("Confirmação registrada. Aguardando a outra parte…");renderTr();
  setTimeout(()=>{r.ok.out=true;r.s="Concluído";const b=books.find(x=>x.id===r.bid);if(b)b.s="Concluído";toast("Entrega concluída! Livro removido da vitrine.");renderTr()},1400)};

$("#rd").onclick=e=>{const on=document.documentElement.dataset.read!=="1";
  if(on)document.documentElement.dataset.read="1";else delete document.documentElement.dataset.read;
  e.target.setAttribute("aria-pressed",on);toast(on?"Modo leitura ativado":"Modo leitura desativado")};
$("#dk").onclick=e=>{const on=document.documentElement.dataset.theme!=="dark";
  if(on)document.documentElement.dataset.theme="dark";else delete document.documentElement.dataset.theme;
  e.target.setAttribute("aria-pressed",on);e.target.textContent=on?"Modo claro":"Modo escuro";toast(on?"Modo escuro ativado":"Modo escuro desativado")};
go("login");
