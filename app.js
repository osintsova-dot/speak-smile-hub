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
  {name:"Get Involved 1B", program:"GIA1zero", room:"Discovery", teacher:"Катя", days:[{d:3,t:"16:40"},{d:6,t:"14:30"}]},
  {name:"GMF 3C",  program:"GMF3",    room:"Adventure", teacher:"Ксения",    days:[{d:3,t:"15:00"},{d:6,t:"12:10"}]},
  {name:"GMF 3D",  program:"GMF3",    room:"Adventure", teacher:"Ксения",    days:[{d:3,t:"16:05"},{d:6,t:"13:20"}]},
  {name:"Get Involved 2B", program:"GIA2new", room:"Adventure", teacher:"Ксения", days:[{d:3,t:"17:10"},{d:6,t:"14:30"}]},
  {name:"GMF 1C",  program:"GMF1zero",room:"Adventure", teacher:"Ксения",    days:[{d:3,t:"18:50"},{d:6,t:"11:00"}]},
];
let GROUPS = GROUPS_FALLBACK;

// GIA2new идёт по той же КТП, что GIA2 (единая сетка двух линий)
(function(){
  function aliasKtp(){
    if (window.PROGRAMS && window.PROGRAMS.GIA2 && !window.PROGRAMS.GIA2new)
      window.PROGRAMS.GIA2new = window.PROGRAMS.GIA2;
  }
  aliasKtp(); document.addEventListener("DOMContentLoaded", aliasKtp);
})();

// Программы, для которых КТП ещё не готов (показываем «в работе»)
const PROGRAM_LABELS = {
  GMF1:"Give Me Five! 1", GMF2:"Give Me Five! 2", GMF3:"Give Me Five! 3", GMF4:"Give Me Five! 4",
  GMF1zero:"Give Me Five! 1 (нулевой)", GMF2zero:"Give Me Five! 2 (нулевой)",
  Prepare3:"Prepare 3", Prepare4:"Prepare 4", Prepare5:"Prepare 5",
  GIA1:"Get Involved! A1+", GIA1zero:"Get Involved! A1+ (с нуля)",
  GIA2:"Get Involved! A2 (продолжающие)", GIA2new:"Get Involved! A2 (с нуля)", Gateway:"Gateway to the World B2",
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

// ---- панель учителя: генераторы отчётов (по итогам юнита) + письма родителям (начало юнита) ----
const REPORTS = {
  Genki:   "https://osintsova-dot.github.io/Genkireport/",
  MW3:     "https://osintsova-dot.github.io/MWreport/?v=2",
  GMF1:    "https://osintsova-dot.github.io/GMF1letters/?v=2",
  GMF1zero:"https://osintsova-dot.github.io/GMF1zero/",
  GMF2:    "https://osintsova-dot.github.io/GMF2letters/?v=2",
  GMF2zero:"https://osintsova-dot.github.io/Gmf2zero/",
  GMF3:    "https://osintsova-dot.github.io/GMF3letters/?v=2",
  GMF4:    "https://osintsova-dot.github.io/GMF4letters/?v=2",
  GIA1:    "https://osintsova-dot.github.io/Get1report/",
  GIA1zero:"https://osintsova-dot.github.io/Get1report/",   // сетка юнитов общая с 1A
  GIA2:    "https://osintsova-dot.github.io/Get2report/",
  GIA2new: "https://osintsova-dot.github.io/Get2report/",
  Prepare3:"https://osintsova-dot.github.io/Prepare3report/",
  Prepare4:"https://osintsova-dot.github.io/Prepare4/",
  Prepare5:"https://osintsova-dot.github.io/Prepare5report/",
  Gateway: "https://osintsova-dot.github.io/Gatewayb2/"
};
const LETTERS = {  // письма родителям в начале юнита (последние версии с Drive)
  Genki:   "https://drive.google.com/file/d/1qjoPdPmlTsbbkJrR_9tu4hZCzPIARBlm/view",
  MW3:     "https://drive.google.com/file/d/1-YMZgKCwOney4-42jS1XqxcgFAKyQ71c/view",
  GMF1:    "https://drive.google.com/file/d/14Kv_0_iEWKYT2hRyKdI0q9iGJ5HVjBGi/view",
  GMF1zero:"https://drive.google.com/file/d/1GyfAf-nI5YZBLu-0ooFHkW1ZuevrHhYX/view",
  GMF2:    "https://drive.google.com/file/d/1OiBTDh-Ue9caV794kXuB6u4KM-CM5LPm/view",
  GMF2zero:"https://drive.google.com/file/d/1slIyjoewMYP-ZLs1ccoAMK-2UM5uPO9g/view",
  GMF3:    "https://drive.google.com/file/d/1SxWBOWwGPWbhnz2wbDaWybhNXbAxEWJx/view",
  GMF4:    "https://drive.google.com/file/d/1CgyxoDi3Pq7sx87QZ3NWQt9sx_Y7miz8/view",
  GIA1:    "https://docs.google.com/document/d/13gugWCBs-sekQB88k-pBK_iJm0Yv51bY-oYng7GVcl8/edit",
  GIA1zero:"https://docs.google.com/document/d/13gugWCBs-sekQB88k-pBK_iJm0Yv51bY-oYng7GVcl8/edit",
  GIA2:    "https://drive.google.com/file/d/1U-MHrJ1CtCnOR_oURK_X_FKkqIBemxhN/view",
  GIA2new: "https://drive.google.com/file/d/1U-MHrJ1CtCnOR_oURK_X_FKkqIBemxhN/view",
  Prepare3:"https://drive.google.com/file/d/1tmihpfCkYp20qXZmXbByGEHy074rjQfQ/view",
  Prepare4:"https://drive.google.com/file/d/1uT5vmOP4DZz_Jt3w2YOJNzHAGTyraLwy/view",
  Prepare5:"https://drive.google.com/file/d/1g7_YTrHjauko9clyJJobyeuTXWLy7r5D/view",
  Gateway: "https://drive.google.com/file/d/10S6pa8Aj9nrpqCoyA9PP4yWNY3wX8DJC/view"
};
const JOURNALS = { // журнал наблюдений (печать)
  Genki:   "https://drive.google.com/file/d/1YLKF5n37RotvlRt0SGJZ2YqdMO-xtJYw/view",
  MW3:     "https://drive.google.com/file/d/1iVx-SV0ACpR7tETR64uxZ5-ObIwqVrou/view",
  GMF1:    "https://drive.google.com/file/d/1waWSKU9LAVhV6fO5MemcK-6EPKmhGqfD/view",
  GMF1zero:"https://drive.google.com/file/d/1waWSKU9LAVhV6fO5MemcK-6EPKmhGqfD/view",
  GMF2:    "https://drive.google.com/file/d/1MlQFpo04DjeYUOlGUdQSx62fSFFIm9ZT/view",
  GMF2zero:"https://drive.google.com/file/d/1MlQFpo04DjeYUOlGUdQSx62fSFFIm9ZT/view",
  GMF3:    "https://drive.google.com/file/d/1krPTkektmquhYnuIpF2ZKZx6SX_pplVL/view",
  GMF4:    "https://drive.google.com/file/d/1CAMf2BxCXMRwC8hwvyTmllwDu_YpRa5U/view",
  GIA1:    "https://drive.google.com/file/d/191eWQIYlDh-0N26eKB-bW7AL_N3oi5U9/view",
  GIA1zero:"https://drive.google.com/file/d/191eWQIYlDh-0N26eKB-bW7AL_N3oi5U9/view",
  GIA2:    "https://drive.google.com/file/d/1wHdolz7eG9K4b9Ch5zkorJdfexvh3KE_/view",
  GIA2new: "https://drive.google.com/file/d/1wHdolz7eG9K4b9Ch5zkorJdfexvh3KE_/view",
  Prepare3:"https://drive.google.com/file/d/1z9ElIruPY8EoJ5wWKjw0Z48AiTHC0FG7/view"
};
// первый/последний ли это урок юнита (секции ≥4 уроков, чтобы не дёргать на Genki-однострочных секциях)
function unitEdge(program, L){
  const prog = window.PROGRAMS[program]; if(!prog || !L.sec) return {first:false,last:false};
  const same = prog.lessons.filter(x=>x.sec===L.sec);
  if (same.length < 4) return {first:false,last:false};
  const ns = same.map(x=>x.n);
  return {first: L.n===Math.min(...ns), last: L.n===Math.max(...ns)};
}
function reminderHtml(program, L){
  const e = unitEdge(program, L); let out="";
  if (e.first){
    const btn = LETTERS[program] ? ` <a class="rembtn" href="${LETTERS[program]}" target="_blank" rel="noopener">Открыть письма ↗</a>` : "";
    out += `<div class="remind letter">📩 Начало юнита — отправь родителям письмо «что будем учить»${btn}</div>`;
  }
  if (e.last && REPORTS[program]){
    out += `<div class="remind report">📊 Конец юнита — сгенерируй индивидуальные отчёты <a class="rembtn" href="${REPORTS[program]}" target="_blank" rel="noopener">Генератор ↗</a></div>`;
  }
  return out;
}

const ROOM_DOT = {Discovery:"#4B89C9", Adventure:"#D58A2E", Innovation:"#45A06B"};
function roomColor(r){ return ROOM_DOT[r] || "#9aa"; }

// длительность урока по программе (мин): детские 60, экзаменационные/подростковые 90
const LESSON_MIN = {GIA1:90, GIA1zero:90, GIA2:90, GIA2new:90, Prepare3:90, Prepare4:90, Prepare5:90, Gateway:90};
function lessonEnd(program, t){
  const [h,m] = t.split(":").map(Number);
  const total = h*60 + m + (LESSON_MIN[program]||60);
  return String(Math.floor(total/60)).padStart(2,"0")+":"+String(total%60).padStart(2,"0");
}

// ---- фильтры: педагог / кабинет / вид «неделя» ----
let fltTeacher = localStorage.getItem("fltTeacher") || "";
let fltRoom    = localStorage.getItem("fltRoom") || "";
let weekMode   = false;
let roomsMode  = localStorage.getItem("roomsMode")==="1";
const canonTeacher = t => (t==="Катя" ? "Екатерина" : (t||""));
function bindFilters(root){
  root.querySelectorAll(".fchip.ft").forEach(b=>b.addEventListener("click",()=>{ fltTeacher=b.dataset.v; localStorage.setItem("fltTeacher",fltTeacher); render(); }));
  root.querySelectorAll(".fchip.fr").forEach(b=>b.addEventListener("click",()=>{ fltRoom=b.dataset.v; localStorage.setItem("fltRoom",fltRoom); render(); }));
  const wk=root.querySelector("#wkbtn"); if(wk) wk.addEventListener("click",()=>{ weekMode=!weekMode; render(); });
  const rm=root.querySelector("#rmbtn"); if(rm) rm.addEventListener("click",()=>{ roomsMode=!roomsMode; localStorage.setItem("roomsMode",roomsMode?"1":"0"); render(); });
}
function renderWeek(root, headHtml, matchF){
  const mon=new Date(current); const off=(mon.getDay()+6)%7; mon.setDate(mon.getDate()-off);
  let html=headHtml, any=false;
  for(let i=0;i<7;i++){
    const d=new Date(mon); d.setDate(mon.getDate()+i);
    if (d < SCHOOL_START || d > YEAR_END || inHoliday(d)) continue; // вне года/каникулы — не показываем
    const rows=GROUPS.map(g=>{const s=g.days.find(x=>x.d===d.getDay());return s?{g,t:s.t}:null}).filter(Boolean)
      .filter(x=>matchF(x.g)).sort((a,b)=>a.t.localeCompare(b.t));
    if(!rows.length) continue;
    any=true;
    html+=`<div class="wkday">${fmtDate(d)}</div>`;
    rows.forEach(({g,t})=>{
      const res=lessonForGroup(g,d);
      const lt=res.status==="ok"?esc(res.lesson.title||res.lesson.type||""):({holiday:"каникулы",nolesson:"нет урока по КТП",noktp:"КТП в работе",offyear:"вне года"}[res.status]||"—");
      html+=`<div class="wkrow" data-d="${iso(d)}"><div class="wkr1"><b>${t}–${lessonEnd(g.program,t)}</b> · ${esc(g.name)} <span class="prog">${esc(PROGRAM_LABELS[g.program]||g.program)}</span><span class="wkmeta"><span class="roomdot" style="background:${roomColor(g.room)}"></span>${esc(g.room)} · ${esc(canonTeacher(g.teacher))}</span></div><div class="wkl">${lt}</div></div>`;
    });
  }
  if(!any) html+=`<div class="empty">Нет занятий на этой неделе под выбранный фильтр.</div>`;
  root.innerHTML=html;
  bindFilters(root);
  root.querySelectorAll(".wkrow").forEach(r=>r.addEventListener("click",()=>{
    const [y,m,dd]=r.dataset.d.split("-").map(Number);
    current=new Date(y,m-1,dd); weekMode=false; render();
    const dp=document.getElementById("datepick"); if(dp) dp.value=r.dataset.d;
  }));
}
function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function doneKey(g,date){ return "done:"+g.name+":"+iso(date); }

// Ключ готового плана: программа + номер юнита (из L.unit) + номер типа урока (L1..L7 из L.type).
// Ссылка на колоду слайдов для проектора (имя файла = ключ плана в нижнем регистре)
const SLIDES_BASES = {GIA1:"https://speakandsmile.ru/gia1/slides/", GIA1zero:"https://speakandsmile.ru/gia1/slides/",
                      GIA2:"https://speakandsmile.ru/gia2/slides/", GIA2new:"https://speakandsmile.ru/gia2/slides/"};
function slidesUrl(program, key){
  const base = SLIDES_BASES[program];
  if (!key || !base) return null;
  return base + key.toLowerCase() + ".html";
}
function slidesBtnHtml(program, key){
  const u = slidesUrl(program, key);
  return u ? `<a class="slidesbtn" href="${u}" target="_blank" rel="noopener">🖥 Слайды на проектор</a>` : "";
}

// Возвращает ключ (напр. "GMF1-U2-L1"), только если такой план реально есть в window.PLANS.
function planKeyFor(program, L){
  if (!window.PLANS) return null;
  const src = L.unit || L.sec || "";
  // Get Involved: пары нумеруются сквозняком 1–72, план = <prog>-<Блок>-P<№ пары внутри блока>
  if (program==="GIA2" || program==="GIA2new"){
    let part = null;
    const um = /UNIT\s*(\d+)/i.exec(src);
    if (um) part = "U"+um[1];
    else if (/STARTER/i.test(src)) part = "Starter";
    else if (/MIDTERM|MID-?YEAR/i.test(src)) part = "Mid";
    if (!part) return null;
    const prog = window.PROGRAMS[program];
    const same = (prog?.lessons||[]).filter(x=>x.sec===L.sec).map(x=>x.n).sort((a,b)=>a-b);
    const idx = same.indexOf(L.n);
    if (idx < 0) return null;
    const k = `${program}-${part}-P${idx+1}`;
    return window.PLANS[k] ? k : null;
  }
  // Prepare 3/4/5: год разбит на блоки, план = <prog>-U<номер блока>-P<№ урока внутри блока>
  if (program==="Prepare3" || program==="Prepare4" || program==="Prepare5"){
    const sec = L.sec || "";
    let part = null;
    const bm = /БЛОК\s*(\d+)/i.exec(sec);
    if (bm) part = "U"+bm[1];
    else if (/ВВОДН/i.test(sec)) part = "Intro";
    else if (/ПОЛУГОД|MID/i.test(sec)) part = "Mid";
    else if (/ФИНАЛ|ИТОГ|MOCK/i.test(sec)) part = "Final";
    if (!part) return null;
    const prog = window.PROGRAMS[program];
    const same = (prog?.lessons||[]).filter(x=>x.sec===L.sec).map(x=>x.n).sort((a,b)=>a-b);
    const idx = same.indexOf(L.n);
    if (idx < 0) return null;
    const k = `${program}-${part}-P${idx+1}`;
    return window.PLANS[k] ? k : null;
  }
  if (program==="GIA1" || program==="GIA1zero"){
    let part = null;
    const um = /UNIT\s*(\d+)/i.exec(src);
    if (um) part = "U"+um[1];
    else if (/STARTER/i.test(src)) part = "Starter";
    else if (/MID-?YEAR|MIDTERM/i.test(src)) part = "Mid";
    else if (/SHOWCASE/i.test(src)) part = "Show";
    else if (/FINAL/i.test(src)) part = "Final";
    if (!part) return null;
    const prog = window.PROGRAMS[program];
    const same = (prog?.lessons||[]).filter(x=>x.sec===L.sec).map(x=>x.n).sort((a,b)=>a-b);
    const idx = same.indexOf(L.n);
    if (idx < 0) return null;
    const k = `${program}-${part}-P${idx+1}`;
    return window.PLANS[k] ? k : null;
  }
  // Genki (новый КТП): юнит = уровень + «Урок N» ИЛИ «Review» → ключ Genki-<Level>-L<N> / -Review
  const gl = /^(Adventure|Brainy|Christmas|Challenge|Danger|Experts|Fantastic|Giant|High)\s+(?:Урок\s*(\d+)|(Review))/i.exec(src);
  if (gl){ const suf = gl[2] ? ("L"+gl[2]) : "Review"; const glkey = `${program}-${gl[1]}-${suf}`; return window.PLANS[glkey] ? glkey : null; }
  // (старый выдуманный Genki-КТП: «Юнит N Урок M» — оставлено на всякий случай)
  const rm = /Юнит\s*(\d+)\s*Урок\s*(\d+)/i.exec(src);
  if (rm){ const rkey = `${program}-U${rm[1]}-L${rm[2]}`; return window.PLANS[rkey] ? rkey : null; }
  // Резерв / Финальный тест / Устный экзамен (в типе нет номера L)
  if (/FINAL TEST/i.test(src) || /^Final/i.test(L.type||"")){ const k=`${program}-Final`; return window.PLANS[k]?k:null; }
  if (/SPEAKING EXAM/i.test(src) || /^Speaking/i.test(L.type||"")){ const k=`${program}-Speaking`; return window.PLANS[k]?k:null; }
  if (/Повторение/i.test(L.type||"") || /РЕЗЕРВ/i.test(src)){ const k=`${program}-Reserve${(L.n<=40?"1":"2")}`; return window.PLANS[k]?k:null; }
  const lm = /\bL(\d+)\b/i.exec(L.type || "");
  if (!lm){
    // Вводный Genki-блок линии «с нуля»: тип урока «Genki N» → план Intro-LN (занятия 1–12)
    const gm = /genki\s*(\d+)/i.exec(L.type || "");
    if (gm){
      const gkey = `${program}-Intro-L${gm[1]}`;
      return window.PLANS[gkey] ? gkey : null;
    }
    return null;
  }
  const um = /(?:unit|Юнит)\s*(\d+)/i.exec(src);
  let unitPart;
  if (um) unitPart = "U" + um[1];
  else if (/starter/i.test(src)) unitPart = "Starter";   // Starter «Hello, friends!» (L1–L3)
  else return null;
  const key = `${program}-${unitPart}-L${lm[1]}`;
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

  // панель фильтров: педагог / кабинет / неделя
  const teachers=[...new Set(GROUPS.map(g=>canonTeacher(g.teacher)))].filter(Boolean).sort();
  const rooms=[...new Set(GROUPS.map(g=>g.room))].filter(Boolean).sort();
  const chip=(cls,v,cur,lab)=>`<button class="fchip ${cls}${v===cur?" on":""}" data-v="${esc(v)}">${lab}</button>`;
  const fbar = `<div class="filters">
    <div class="frow2">👩‍🏫${chip("ft","",fltTeacher,"Все")}${teachers.map(t=>chip("ft",t,fltTeacher,esc(t))).join("")}</div>
    <div class="frow2">🚪${chip("fr","",fltRoom,"Все")}${rooms.map(r=>chip("fr",r,fltRoom,esc(r))).join("")}<button class="fchip wk${roomsMode?" on":""}" id="rmbtn">🏛 Кабинеты</button><button class="fchip wk${weekMode?" on":""}" id="wkbtn">📅 Неделя</button></div>
  </div>`;
  const matchF = g => (!fltTeacher || canonTeacher(g.teacher)===fltTeacher) && (!fltRoom || g.room===fltRoom);

  if (weekMode){ renderWeek(root, banner+fbar, matchF); return; }

  // вне учебного года и в каникулы — ничего не показываем
  if (current < SCHOOL_START || current > YEAR_END || inHoliday(current)){
    root.innerHTML = banner + fbar + `<div class="empty">Занятий нет</div>`;
    bindFilters(root);
    return;
  }

  // группы этого дня
  const todays = GROUPS
    .map(g=>{ const slot=g.days.find(x=>x.d===wd); return slot?{g,t:slot.t}:null; })
    .filter(Boolean)
    .filter(x=>matchF(x.g))
    .sort((a,b)=>a.t.localeCompare(b.t));

  if (!todays.length){
    root.innerHTML = banner + fbar + `<div class="empty">${(fltTeacher||fltRoom)?"Под выбранный фильтр занятий нет.":"В этот день занятий нет."}</div>`;
    bindFilters(root);
    return;
  }

  let html = banner + fbar;
  const cardHtml = ({g,t}) => {
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
      const planBtn = (planKey ? `<button class="planbtn" data-plan="${esc(planKey)}">📋 Открыть план урока</button>` : "")
                    + slidesBtnHtml(g.program, planKey);
      const remind = reminderHtml(g.program, L);
      body = `<div class="detail">` + remind + planBtn + fields.map(([lab,val])=>`
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

    return `<div class="card ${res.status} ${done?"done":""}${(LESSON_MIN[g.program]===90)?" dur90":""}" data-room="${esc(g.room)}" data-id="${id}">
      <div class="cardhead" data-toggle>
        <div class="time">${t}<span class="tend">${lessonEnd(g.program,t)}</span></div>
        <div class="grp">
          <div class="gname">${esc(g.name)} <span class="prog">${esc(progName)}</span></div>
          ${head}
        </div>
        <div class="meta"><span class="roomdot" style="background:${roomColor(g.room)}"></span>${esc(g.room)} · ${esc(g.teacher)}${res.status==="ok"?'<span class="arrow">›</span>':""}</div>
      </div>
      ${body}
    </div>`;
  };
  if (roomsMode){
    // временнáя сетка: 1 строка грида = 1 минута → параллельные уроки на одной линии
    const toMin = t => { const [h,m]=t.split(":").map(Number); return h*60+m; };
    const items = todays.map(x=>({ ...x, s:toMin(x.t), e:toMin(x.t)+(LESSON_MIN[x.g.program]||60) }));
    const cols = rooms.filter(r=>(!fltRoom||r===fltRoom) && items.some(x=>x.g.room===r));
    if (items.length && cols.length){
      const t0=Math.min(...items.map(x=>x.s)), t1=Math.max(...items.map(x=>x.e));
      let grid = `<div class="roomswrap"><div class="tgrid" style="grid-template-columns:repeat(${cols.length},1fr);grid-template-rows:36px repeat(${t1-t0},2.2px)">`;
      cols.forEach((r,ci)=>{ grid += `<div class="roomhead" style="grid-column:${ci+1};grid-row:1;border-color:${roomColor(r)}"><span class="roomdot" style="background:${roomColor(r)}"></span>${esc(r)}</div>`; });
      items.forEach(x=>{
        const ci = cols.indexOf(x.g.room); if (ci<0) return;
        grid += `<div class="tcell" style="grid-column:${ci+1};grid-row:${x.s-t0+2} / span ${x.e-x.s}">${cardHtml(x)}</div>`;
      });
      grid += `</div></div>`;
      html += grid;
    } else {
      html += `<div class="empty">Под выбранный фильтр занятий нет.</div>`;
    }
  } else {
    todays.forEach(x=>{ html += cardHtml(x); });
  }
  root.innerHTML = html;
  bindFilters(root);

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

// ── Браузер программ (все курсы независимо от расписания) ──
function openProg(){
  document.getElementById("progview").classList.add("show");
  document.body.style.overflow = "hidden";
  renderProgList();
}
// Порядок курсов в списке — по нарастанию уровня: от дошкольников к B2
const PROGRAM_ORDER = [
  "Genki",                                  // дошкольники
  "MW3",                                    // Mimi's Wheel 3+
  "GMF1", "GMF1zero", "GMF2", "GMF2zero",   // Give Me Five 1-2 (+ нулевые линии)
  "GMF3", "GMF4", "GMF5",
  "GIA1", "GIA1zero",                       // Get Involved A1+ (обе линии рядом)
  "GIA2", "GIA2new",                        // Get Involved A2 (обе линии рядом)
  "Prepare3", "Prepare4", "Prepare5",
  "Gateway",                                // B2
  "Chinese",
];
function sortPrograms(keys){
  const rank = k => { const i = PROGRAM_ORDER.indexOf(k); return i < 0 ? 999 : i; };
  return keys.slice().sort((a,b) => rank(a) - rank(b) || a.localeCompare(b));
}

function renderProgList(){
  document.getElementById("progtitle").textContent = "📚 Программы";
  document.getElementById("progback").style.display = "none";
  const b = document.getElementById("progbody");
  const P = window.PROGRAMS || {};
  const keys = sortPrograms(Object.keys(P));
  b.innerHTML = keys.length
    ? keys.map(k => `<div class="progcard" data-prog="${esc(k)}"><div><b>${esc(PROGRAM_LABELS[k]||P[k].label||k)}</b></div><div class="c">${(P[k].lessons||[]).length} уроков ›</div></div>`).join("")
    : '<div class="empty">Нет программ с КТП</div>';
  b.querySelectorAll(".progcard").forEach(c => c.addEventListener("click", () => renderProgLessons(c.dataset.prog)));
  b.scrollTop = 0;
}
function renderProgLessons(prog){
  const P = window.PROGRAMS[prog]; if(!P) return;
  document.getElementById("progtitle").textContent = "📚 " + (PROGRAM_LABELS[prog] || P.label || prog);
  document.getElementById("progback").style.display = "";
  const b = document.getElementById("progbody");
  let html = "", lastSec = "";
  // панель программы: генератор отчётов + письма родителям
  const tools = [];
  if (REPORTS[prog]) tools.push(`<a class="toolbtn" href="${REPORTS[prog]}" target="_blank" rel="noopener">📊 Генератор отчётов ↗</a>`);
  if (LETTERS[prog]) tools.push(`<a class="toolbtn" href="${LETTERS[prog]}" target="_blank" rel="noopener">📩 Письма родителям ↗</a>`);
  if (JOURNALS[prog]) tools.push(`<a class="toolbtn" href="${JOURNALS[prog]}" target="_blank" rel="noopener">🖨 Журнал (печать) ↗</a>`);
  if (tools.length) html += `<div class="progtools">${tools.join("")}</div>`;
  (P.lessons||[]).forEach(L => {
    const sec = L.sec || "";
    if (sec && sec !== lastSec){ html += `<div class="secrow">${esc(sec)}</div>`; lastSec = sec; }
    const key = planKeyFor(prog, L);
    const planBtn = (key
      ? `<button class="planbtn" data-plan="${esc(key)}">📋 Открыть план урока</button>`
      : `<div class="unit" style="margin-top:10px">план не создан (резерв/тест/устный)</div>`)
      + slidesBtnHtml(prog, key);
    const remind = reminderHtml(prog, L);
    const fields = (L.fields||[]).map(f => `<div class="field"><div class="flabel">${esc(f[0])}</div><div class="frow"><div class="fval">${esc(f[1])}</div><button class="copy" data-copy="${esc(f[1])}">📋</button></div></div>`).join("");
    html += `<div class="card"><div class="cardhead"><div class="time">${L.n}</div><div><div class="title">${esc(L.title||"")}</div><div class="unit">${esc(L.type||"")}</div></div><div class="arrow">›</div></div><div class="detail">${remind}${fields}${planBtn}</div></div>`;
  });
  b.innerHTML = html || '<div class="empty">Нет уроков</div>';
  b.scrollTop = 0;
  b.querySelectorAll(".cardhead").forEach(h => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
  b.querySelectorAll(".planbtn").forEach(x => x.addEventListener("click", e => { e.stopPropagation(); openPlan(x.dataset.plan); }));
  b.querySelectorAll(".copy").forEach(x => x.addEventListener("click", async e => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(x.dataset.copy); } catch(_){}
    const o = x.textContent; x.textContent = "✓"; x.classList.add("ok");
    setTimeout(() => { x.textContent = o; x.classList.remove("ok"); }, 1000);
  }));
}
loadSchedule();
