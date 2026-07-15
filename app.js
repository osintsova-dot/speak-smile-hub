// ── Speak&Smile Teaching Hub · прототип «сегодня» ──
// Расписание (нормализовано из «!расписание 226-27.xlsx»): одна группа = одна программа.
// Дни недели: 1=Пн 2=Вт 3=Ср 4=Чт 5=Пт 6=Сб 0=Вс
// Живой источник расписания (Google-таблица, gviz CSV). Если недоступен — берётся встроенное GROUPS_FALLBACK.
const SCHEDULE_URL = "https://docs.google.com/spreadsheets/d/1_WRow7pefA4iF7SOQkkWIxjGU69TcpMjQv_wMS0Rb3A/gviz/tq?tqx=out:csv";
const GROUPS_FALLBACK = [
  // Пн/Пт
  {name:"GMF 4A",  program:"GMF4",    room:"Discovery", teacher:"Ксения",    days:[{d:1,t:"15:00"},{d:5,t:"15:00"}]},
  {name:"GMF 2B",  program:"GMF2",    room:"Discovery", teacher:"Ксения",    days:[{d:1,t:"16:05"},{d:5,t:"16:05"}]},
  {name:"Prepare 4A", program:"Prepare4", room:"Discovery", teacher:"Ксения", days:[{d:1,t:"17:10"},{d:5,t:"17:10"}]},
  {name:"Prepare 5A", program:"Prepare5", room:"Discovery", teacher:"Ксения", days:[{d:1,t:"18:45"},{d:5,t:"18:45"}]},
  {name:"GMF 4B",  program:"GMF4",    room:"Adventure", teacher:"Екатерина", days:[{d:1,t:"15:00"},{d:5,t:"15:00"}]},
  {name:"GMF 3B",  program:"GMF3",    room:"Adventure", teacher:"Екатерина", days:[{d:1,t:"16:05"},{d:5,t:"16:05"}]},
  {name:"Get Involved 2A", program:"GIA2", room:"Adventure", teacher:"Екатерина", days:[{d:1,t:"17:10"},{d:5,t:"17:10"}]},
  {name:"Gateway B2", program:"Gateway", room:"Adventure", teacher:"Екатерина", days:[{d:1,t:"18:45"},{d:5,t:"18:45"}]},
  // Вт/Чт
  {name:"GMF 3A",  program:"GMF3",    room:"Discovery", teacher:"Ксения",    days:[{d:2,t:"15:00"},{d:4,t:"15:00"}]},
  {name:"GMF 2C",  program:"GMF2zero",room:"Discovery", teacher:"Ксения",    days:[{d:2,t:"16:05"},{d:4,t:"16:05"}]},
  {name:"GMF 2D",  program:"GMF2zero",room:"Discovery", teacher:"Ксения",    days:[{d:2,t:"17:10"},{d:4,t:"17:10"}]},
  {name:"Mimi 3",  program:"MW3",     room:"Discovery", teacher:"Оксана",    days:[{d:2,t:"18:20"},{d:4,t:"18:20"}]},
  {name:"GMF 1A",  program:"GMF1",    room:"Discovery", teacher:"Оксана",    days:[{d:2,t:"19:30"},{d:4,t:"19:30"}]},
  {name:"Get Involved 1A", program:"GIA1", room:"Adventure", teacher:"Екатерина", days:[{d:2,t:"15:00"},{d:4,t:"15:00"}]},
  {name:"Prepare 3A", program:"Prepare3", room:"Adventure", teacher:"Екатерина", days:[{d:2,t:"16:35"},{d:4,t:"16:35"}]},
  {name:"GMF 1B",  program:"GMF1zero",room:"Adventure", teacher:"Екатерина", days:[{d:2,t:"18:10"},{d:4,t:"18:10"}]},
  {name:"GMF 2A",  program:"GMF2",    room:"Adventure", teacher:"Екатерина", days:[{d:2,t:"19:15"},{d:4,t:"19:15"}]},
  // Китайский временно отключён (нет КТП и не нужен на этом этапе)
  // Ср/Сб
  {name:"Genki 1A", program:"Genki",  room:"Discovery", teacher:"Оксана",    days:[{d:3,t:"18:20"},{d:6,t:"12:10"}]},
  {name:"Genki 1B", program:"Genki",  room:"Discovery", teacher:"Оксана",    days:[{d:3,t:"19:30"},{d:6,t:"13:20"}]},
  {name:"Get Involved 1B", program:"GIA1", room:"Discovery", teacher:"Катя", days:[{d:3,t:"16:40"},{d:6,t:"14:30"}]},
  {name:"GMF 3C",  program:"GMF3",    room:"Adventure", teacher:"Ксения",    days:[{d:3,t:"15:00"},{d:6,t:"12:10"}]},
  {name:"GMF 3D",  program:"GMF3",    room:"Adventure", teacher:"Ксения",    days:[{d:3,t:"16:05"},{d:6,t:"13:20"}]},
  {name:"Get Involved 2B", program:"GIA2", room:"Adventure", teacher:"Ксения", days:[{d:3,t:"17:10"},{d:6,t:"14:30"}]},
  {name:"GMF 1C",  program:"GMF1zero",room:"Adventure", teacher:"Ксения",    days:[{d:3,t:"18:50"},{d:6,t:"11:00"}]},
];
let GROUPS = GROUPS_FALLBACK;

// Программы, для которых КТП ещё не готов (показываем «в работе»)
const PROGRAM_LABELS = {
  GMF1:"Give Me Five! 1", GMF2:"Give Me Five! 2", GMF3:"Give Me Five! 3", GMF4:"Give Me Five! 4",
  GMF1zero:"Give Me Five! 1 (нулевой)", GMF2zero:"Give Me Five! 2 (нулевой)",
  Prepare3:"Prepare 3", Prepare4:"Prepare 4", Prepare5:"Prepare 5",
  GIA1:"Get Involved! A1+", GIA2:"Get Involved! A2", Gateway:"Gateway to the World B2",
  MW3:"Mimi's Wheel 3+", Genki:"Genki English", Chinese:"Китайский",
};

const SCHOOL_START = new Date(2026,8,1);    // 01.09.2026
const YEAR_END     = new Date(2027,4,26);   // 26.05.2027
const HOL_A = new Date(2026,11,28), HOL_B = new Date(2027,0,10); // каникулы 28.12–10.01
const WD = ["вс","пн","вт","ср","чт","пт","сб"];
const WD_FULL = ["ВОСКРЕСЕНЬЕ","ПОНЕДЕЛЬНИК","ВТОРНИК","СРЕДА","ЧЕТВЕРГ","ПЯТНИЦА","СУББОТА"];
const MONTHS_GEN = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

let current = startDate();
function startDate(){
  const t = new Date(); t.setHours(0,0,0,0);
  if (t < SCHOOL_START || t > YEAR_END) return new Date(2026,8,3); // 03.09.2026 (первый учебный день)
  return t;
}
function inHoliday(d){ return d >= HOL_A && d <= HOL_B; }
function mkDate(dm){ const [d,m]=dm.split(".").map(Number); const y=(m>=9)?2026:2027; return new Date(y,m-1,d); }
function weekRange(w){ const [a,b]=w.split(/[–-]/); const s=mkDate(a),e=mkDate(b); e.setHours(23,59,59); return {start:s,end:e}; }
function iso(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fmtDate(d){ return WD_FULL[d.getDay()]+" · "+d.getDate()+" "+MONTHS_GEN[d.getMonth()]; }

// какой урок у группы в выбранную дату
function lessonForGroup(g, date){
  if (inHoliday(date)) return {status:"holiday"};
  if (date < SCHOOL_START || date > YEAR_END) return {status:"offyear"};
  const prog = window.PROGRAMS[g.program];
  if (!prog) return {status:"noktp"};
  const matched = prog.lessons.filter(L=>{ const r=weekRange(L.week); return date>=r.start && date<=r.end; });
  if (!matched.length) return {status:"nolesson"};
  matched.sort((a,b)=>a.n-b.n);
  const days = g.days.map(x=>x.d).sort((a,b)=>a-b);
  let rank = days.indexOf(date.getDay()); if (rank<0) rank=0;
  return {status:"ok", lesson:matched[Math.min(rank, matched.length-1)], prog};
}

// поля урока приходят готовыми из L.fields (парсер собирает их по заголовкам КТП)

const ROOM_DOT = {Discovery:"#4B89C9", Adventure:"#D58A2E", Innovation:"#45A06B"};
function roomColor(r){ return ROOM_DOT[r] || "#9aa"; }
function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function doneKey(g,date){ return "done:"+g.name+":"+iso(date); }

// Ключ готового плана: программа + номер юнита (из L.unit) + номер типа урока (L1..L7 из L.type).
// Возвращает ключ (напр. "GMF1-U2-L1"), только если такой план реально есть в window.PLANS.
function planKeyFor(program, L){
  if (!window.PLANS) return null;
  const um = /unit\s*(\d+)/i.exec(L.unit||L.sec||"");
  const lm = /\bL(\d+)\b/i.exec(L.type||"");
  if (!um || !lm) return null;
  const key = `${program}-U${um[1]}-L${lm[1]}`;
  return window.PLANS[key] ? key : null;
}

// Оверлей с планом урока (iframe — у плана свой CSS/тёмная тема, изолируем).
function openPlan(key){
  const ov = document.getElementById("planview");
  const fr = document.getElementById("planframe");
  fr.src = `plans/${key}.html`;
  ov.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closePlan(){
  const ov = document.getElementById("planview");
  ov.classList.remove("show");
  document.getElementById("planframe").src = "about:blank";
  document.body.style.overflow = "";
}

function render(){
  const root = document.getElementById("day");
  const wd = current.getDay();
  document.getElementById("dayhead").textContent = fmtDate(current);
  const wr = weekRangeLabel(current);
  document.getElementById("weeklabel").textContent = wr;

  let banner = "";
  const today = new Date(); today.setHours(0,0,0,0);
  if (current.getTime()===new Date(2026,8,3).getTime() && (today<SCHOOL_START||today>YEAR_END)){
    banner = `<div class="banner">Учебный год начинается <b>03.09.2026</b> — показываю первый день. Листай дни стрелками ниже.</div>`;
  }
  if (inHoliday(current)) banner = `<div class="banner">❄ Зимние каникулы 28.12.2026 – 10.01.2027 — занятий нет.</div>`;

  // группы этого дня
  const todays = GROUPS
    .map(g=>{ const slot=g.days.find(x=>x.d===wd); return slot?{g,t:slot.t}:null; })
    .filter(Boolean)
    .sort((a,b)=>a.t.localeCompare(b.t));

  if (!todays.length){
    root.innerHTML = banner + `<div class="empty">В этот день занятий нет.</div>`;
    return;
  }

  let html = banner;
  for (const {g,t} of todays){
    const res = lessonForGroup(g, current);
    const done = localStorage.getItem(doneKey(g,current))==="1";
    const id = "c_"+g.name.replace(/\W/g,"_");
    const progName = PROGRAM_LABELS[g.program]||g.program;

    let head, body="";
    if (res.status==="ok"){
      const L=res.lesson;
      head = `<div class="title">Урок ${L.n} · ${esc(L.type||L.sec||"")}</div>
              <div class="ltitle">${esc(L.title)}</div>
              <div class="unit">${esc(L.sec)}</div>`;
      const fields = L.fields || [];
      const planKey = planKeyFor(g.program, L);
      const planBtn = planKey ? `<button class="planbtn" data-plan="${esc(planKey)}">📋 Открыть план урока</button>` : "";
      body = `<div class="detail">` + planBtn + fields.map(([lab,val])=>`
        <div class="field">
          <div class="flabel">${esc(lab)}</div>
          <div class="frow"><div class="fval">${esc(val)}</div>
          <button class="copy" data-copy="${esc(val)}">📋</button></div>
        </div>`).join("") +
        `<label class="donebox"><input type="checkbox" class="chk" data-group="${esc(g.name)}" ${done?"checked":""}> Внесено в BigBen</label>
        </div>`;
    } else {
      const msg = {noktp:"КТП в работе", nolesson:"Нет урока в КТП на этот день", holiday:"Каникулы", offyear:"Вне учебного года"}[res.status]||"—";
      head = `<div class="title muted">${esc(msg)}</div><div class="unit">${esc(progName)}</div>`;
    }

    html += `<div class="card ${res.status} ${done?"done":""}" data-room="${esc(g.room)}" data-id="${id}">
      <div class="cardhead" data-toggle>
        <div class="time">${t}</div>
        <div class="grp">
          <div class="gname">${esc(g.name)} <span class="prog">${esc(progName)}</span></div>
          ${head}
        </div>
        <div class="meta"><span class="roomdot" style="background:${roomColor(g.room)}"></span>${esc(g.room)} · ${esc(g.teacher)}${res.status==="ok"?'<span class="arrow">›</span>':""}</div>
      </div>
      ${body}
    </div>`;
  }
  root.innerHTML = html;

  // раскрытие карточек
  root.querySelectorAll(".cardhead[data-toggle]").forEach(h=>{
    h.addEventListener("click", e=>{
      if (e.target.closest(".copy")||e.target.closest(".chk")) return;
      h.parentElement.classList.toggle("open");
    });
  });
  // открыть план урока
  root.querySelectorAll(".planbtn").forEach(b=>{
    b.addEventListener("click", e=>{ e.stopPropagation(); openPlan(b.dataset.plan); });
  });
  // копирование
  root.querySelectorAll(".copy").forEach(b=>{
    b.addEventListener("click", async ()=>{
      try{ await navigator.clipboard.writeText(b.dataset.copy); }
      catch{ const ta=document.createElement("textarea"); ta.value=b.dataset.copy; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      const o=b.textContent; b.textContent="✓"; b.classList.add("ok"); setTimeout(()=>{b.textContent=o; b.classList.remove("ok");},1000);
    });
  });
  // «внесено»
  root.querySelectorAll(".chk").forEach(c=>{
    c.addEventListener("change", ()=>{
      const g = GROUPS.find(x=>x.name===c.dataset.group);
      localStorage.setItem(doneKey(g,current), c.checked?"1":"0");
      c.closest(".card").classList.toggle("done", c.checked);
    });
  });
}

function weekRangeLabel(d){
  // понедельник–воскресенье выбранной даты
  const m=(d.getDay()+6)%7; const mon=new Date(d); mon.setDate(d.getDate()-m); const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  const p=x=>String(x.getDate()).padStart(2,"0")+"."+String(x.getMonth()+1).padStart(2,"0");
  return "неделя "+p(mon)+"–"+p(sun);
}

function shift(days){ current=new Date(current); current.setDate(current.getDate()+days); render(); }
document.getElementById("prev").onclick = ()=>shift(-1);
document.getElementById("next").onclick = ()=>shift(1);
document.getElementById("todaybtn").onclick = ()=>{ current=startDate(); render(); };
document.getElementById("datepick").onchange = e=>{ const [y,m,d]=e.target.value.split("-").map(Number); current=new Date(y,m-1,d); render(); };

// ── живое расписание из Google-таблицы ──
const DAYNUM = {"Пн":1,"Вт":2,"Ср":3,"Чт":4,"Пт":5,"Сб":6,"Вс":0};
function normTime(t){ const m=(t||"").match(/\d{1,2}:\d{2}/); return m?m[0]:""; }
function parseSchedule(csv){
  const lines=csv.replace(/\r/g,"").split("\n").filter(x=>x.trim());
  lines.shift(); // заголовок
  const gs=[];
  for(const ln of lines){
    const c=ln.split(",").map(s=>s.trim().replace(/^"|"$/g,""));
    if(c.length<6 || !c[0]) continue;
    const [name,program,room,teacher,d1,t1,d2,t2]=c;
    const days=[];
    if(DAYNUM[d1]!==undefined && normTime(t1)) days.push({d:DAYNUM[d1], t:normTime(t1)});
    if(DAYNUM[d2]!==undefined && normTime(t2)) days.push({d:DAYNUM[d2], t:normTime(t2)});
    if(name && days.length) gs.push({name,program,room:room||"",teacher:teacher||"",days});
  }
  return gs;
}
async function loadSchedule(){
  try{
    const r=await fetch(SCHEDULE_URL,{cache:"no-store"});
    if(!r.ok) throw 0;
    const gs=parseSchedule(await r.text());
    if(gs.length){ GROUPS=gs; render(); const n=document.getElementById("srcnote"); if(n) n.textContent="🟢 живое из Google Таблицы"; }
  }catch(e){ /* нет связи / таблица закрыта → остаёмся на встроенном расписании */ }
}

render();
document.getElementById("datepick").value = iso(current);
loadSchedule();
