(function(){
"use strict";

var screenEl = document.getElementById("screen");
var navEl = document.getElementById("nav");
var layerEl = document.getElementById("layer");
var toastEl = document.getElementById("toast");

function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function icon(name){ return '<span class="icon">'+ICON(name)+'</span>'; }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function plural(n,w){ return n+" "+w+(n===1?"":"s"); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function fmtDate(iso){ return new Date(iso+(iso.length===10?"T12:00":"")).toLocaleDateString(undefined,{month:"short",day:"numeric"}); }
function relDay(iso){
  if(iso===todayISO()) return "Today";
  var y = new Date(Date.now()-86400000).toISOString().slice(0,10);
  return iso===y ? "Yesterday" : fmtDate(iso);
}
function cap(s){ return String(s||"").charAt(0).toUpperCase()+String(s||"").slice(1); }
function money(n){ return (Math.round(n)||0).toLocaleString(); }

var KEY = "coach.v1";
var DEFAULT_STATE = {
  profile:{ name:"Atiya" },
  setupDone:false,
  avatar:{ id:"avatar-2" },
  theme:"pink",
  defaults:{ firstWeight:40, firstReps:10, firstSets:3, firstCardioMin:30, weightInc:10, repInc:1, cardioInc:5, useLast:true },
  fav:["leg-press","chest-press","dumbbells","treadmill"],
  hidden:[],
  lastUsed:{},
  active:null,
  history:[],
  plans:[],
  badges:{},
  backupDate:null
};

var S = load();
var route = { name:"home", params:{} };
var stack = [];
var addState = { q:"", cat:"all", favOnly:false };
var manageState = { q:"", filter:"all" };
var themeDraft = null;
var badgeTab = "all";
var planDraft = null;
var sheet = null;
var pendingDiff = null;
var deletedExercise = null;
var completedOpen = false;
var openMenu = null;
var calCursor = null;
var historyRange = "4W";
var historyPoint = null;
var historyVisible = 3;
var badgeCelebration = null;
var toastTimer = null;
var undoFn = null;

function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(!raw) return copy(DEFAULT_STATE);
    var p = JSON.parse(raw);
    var s = copy(DEFAULT_STATE);
    Object.keys(p).forEach(function(k){ s[k]=p[k]; });
    s.profile = Object.assign({}, DEFAULT_STATE.profile, p.profile||{});
    s.defaults = Object.assign({}, DEFAULT_STATE.defaults, p.defaults||{});
    return s;
  }catch(e){ return copy(DEFAULT_STATE); }
}
function copy(o){ return JSON.parse(JSON.stringify(o)); }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function applyEquipmentFlags(){
  EQUIPMENT.forEach(function(e){
    e.favorite = S.fav.indexOf(e.id)>=0;
    e.hidden = S.hidden.indexOf(e.id)>=0;
  });
}
function ensurePlans(){
  if(S.plans && S.plans.length) return;
  S.plans = [
    { id:uid(), name:"Full Body Beginner", favorite:true, exercises:["leg-press","chest-press","lat-pulldown","row-machine","shoulder-press","treadmill"] },
    { id:uid(), name:"Lower Body", favorite:false, exercises:["leg-press","leg-extension","hip-abductor","glute-kickback","calf-raise"] },
    { id:uid(), name:"Upper Body + Cardio", favorite:false, exercises:["chest-press","lat-pulldown","row-machine","shoulder-press","bicep-curl","triceps-pushdown","treadmill"].filter(eqById) }
  ];
  save();
}

function eqById(id){ return EQUIPMENT.find(function(e){ return e.id===id; }); }
function eqSafe(id){ return eqById(id) || EQUIPMENT[0]; }
function musclesLabel(e){ return (e.muscles||[]).map(function(m){ return MUSCLE_NAMES[m]||m; }).slice(0,3).join(" · "); }
function firstName(){ return (S.profile.name||"Atiya").split(" ")[0]; }
function coachHero(){ return "images/coach/coach-hero.png"; }
function coachBust(){ return "images/coach/coach-bust.png"; }
function selectedAvatarNumber(){
  var legacy={"woman-ponytail":1,"woman-bob":2,"woman-braids":3,"man-fro":5,"man-braids":6,"man-fade":7};
  return +(String(S.avatar.id||"").match(/avatar-(\d+)/)||[])[1] || legacy[S.avatar.id] || 2;
}
function selectedAvatarImage(){
  var n=selectedAvatarNumber();
  if(n===1) return "images/avatars/avatar-1-waist-up-cutout.png";
  return "images/avatars/avatar-"+n+"-cutout.png";
}
var FINAL_AVATARS=[
  {id:"avatar-1",name:"Atiya"},{id:"avatar-2",name:"Imani"},{id:"avatar-3",name:"Avery"},{id:"avatar-4",name:"Zola"},
  {id:"avatar-5",name:"Montez"},{id:"avatar-6",name:"Andre"},{id:"avatar-7",name:"Jordan"},{id:"avatar-8",name:"Miles"}
];
function avatarImgClass(context){ return "avatar-cutout avatar-n"+selectedAvatarNumber()+" avatar-"+context; }
function facePath(id){
  return {
    "too-easy":"images/Faces/Too Easy.png",
    easy:"images/Faces/Easy.png",
    good:"images/Faces/Good.png",
    hard:"images/Faces/Hard.png",
    "too-hard":"images/Faces/Too Hard.png"
  }[id] || "images/Faces/Good.png";
}
function difficultyName(id){
  return ({ "too-easy":"Too Easy", easy:"Easy", good:"Good", hard:"Hard", "too-hard":"Too Hard" })[id] || "Good";
}
function resolveDefaults(e){
  var last = S.lastUsed[e.id];
  if(e.type==="cardio"){
    if(S.defaults.useLast && last && last.minutes!=null) return { minutes:last.minutes, distance:last.distance||0, intensity:last.intensity||"Moderate" };
    return { minutes:S.defaults.firstCardioMin, distance:0, intensity:"Moderate" };
  }
  if(S.defaults.useLast && last && last.weight!=null) return { weight:last.weight, reps:last.reps!=null?last.reps:S.defaults.firstReps, sets:S.defaults.firstSets };
  return { weight:S.defaults.firstWeight, reps:S.defaults.firstReps, sets:S.defaults.firstSets };
}
function recordLast(e,set,diff){
  var l = S.lastUsed[e.id] || {};
  Object.assign(l,set||{});
  if(diff) l.diffs = (l.diffs||[]).concat(diff).slice(-5);
  S.lastUsed[e.id] = l;
}

var TABS = [
  { id:"home", label:"Home", icon:"home", route:"home" },
  { id:"workout", label:"Workout", icon:"workout", route:"activeWorkout" },
  { id:"plans", label:"Plans", icon:"plans", route:"browsePlans" },
  { id:"history", label:"Calendar", icon:"calendar", route:"workoutHistory" },
  { id:"profile", label:"Profile", icon:"profile", route:"settings" }
];
var ROUTES = {};
function renderNav(){
  var current=ROUTES[route.name]||ROUTES.home;
  if(current.hideNav||!S.setupDone){navEl.style.display="none";navEl.innerHTML="";return;}
  navEl.style.display="flex";
  var tab = current.tab || "home";
  navEl.innerHTML = TABS.map(function(t){
    return '<button class="nav-btn '+(tab===t.id?"active":"")+'" data-act="tab" data-tab="'+t.id+'"><span class="nav-pill">'+icon(tab===t.id?t.icon+"Filled":t.icon)+'<span>'+t.label+'</span></span></button>';
  }).join("");
}
function go(name,params,opts){
  opts = opts || {};
  if(opts.push!==false && route.name) stack.push({ name:route.name, params:route.params });
  route = { name:name, params:params||{} };
  closeLayer();
  render();
}
function back(){
  var prev = stack.pop();
  route = prev || { name:"home", params:{} };
  render();
}
function goTab(id){
  stack = [];
  var t = TABS.find(function(x){ return x.id===id; });
  route = { name:t.route, params:{} };
  closeLayer();
  render();
}
function render(){
  var r = ROUTES[route.name] || ROUTES.home;
  screenEl.innerHTML = r.render(route.params||{});
  renderNav();
  if(r.after) r.after(route.params||{});
}
function topbar(title, right){
  return '<div class="topbar"><button class="icon-btn back-btn" data-act="back" aria-label="Back">'+icon("chevronLeft")+'</button><h1>'+esc(title)+'</h1>'+(right||'<span class="topbar-spacer"></span>')+'</div>';
}

function openLayer(html){ layerEl.innerHTML = html; layerEl.classList.add("show"); }
function closeLayer(){ layerEl.classList.remove("show"); layerEl.innerHTML = ""; }
function toast(msg, undo){
  toastEl.innerHTML = esc(msg)+(undo?'<button data-act="undo">Undo</button>':'');
  toastEl.classList.add("show");
  undoFn = undo || null;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); undoFn=null; }, undo?4200:2200);
}

function cardRow(opts){
  opts = opts || {};
  return '<div class="list-row '+(opts.cls||"")+'" '+(opts.act?'data-act="'+opts.act+'" ':'')+(opts.id?'data-id="'+opts.id+'" ':'')+'>'+
    (opts.order?'<span class="order-badge">'+opts.order+'</span>':'')+
    (opts.img?'<div class="thumb '+(opts.thumb||"sm")+'"><img src="'+opts.img+'" alt=""></div>':opts.icon?'<div class="thumb sm">'+icon(opts.icon)+'</div>':'')+
    '<div class="grow"><div class="row-title">'+esc(opts.title||"")+'</div>'+(opts.sub?'<div class="row-sub">'+opts.sub+'</div>':'')+'</div>'+
    (opts.right||'<span class="icon-circle">'+icon("chevronRight")+'</span>')+
  '</div>';
}
function badgeRec(id){ var r=S.badges[id]; if(!r) return null; if(typeof r==="string") return {level:1,date:r}; return r; }
function badgeLevel(b, stats){
  stats = stats || badgeStats();
  var tiers=b.tiers, val=b.progress(stats)||0, lvl=0, i;
  for(i=0;i<tiers.length;i++){ if(val>=tiers[i].goal) lvl=i+1; }
  var idx = lvl>0 ? lvl-1 : 0;
  var next = lvl<tiers.length ? tiers[lvl] : null;
  var base = lvl>0 ? tiers[lvl-1].goal : 0;
  var pct = !next ? 100 : Math.max(0, Math.min(100, Math.round((val-base)/(next.goal-base)*100)));
  return { val:val, level:lvl, got:lvl>0, medal:tiers[idx].medal, tier:tiers[idx], next:next, pct:pct, tiered:tiers.length>1, maxLevel:tiers.length };
}
function medalArt(b, cls, st){
  st = st || badgeLevel(b);
  var pngId = b.tiers.length>1 ? b.id+"-"+st.medal : b.id;
  return '<span class="badge-medal '+(cls||"")+'"><img src="images/badges/'+pngId+'.png" class="badge-png" alt="" onerror="this.remove()">'+BADGE_ART(st.medal,{center:b.emblem||BADGE_CENTER[b.id]||"star"})+'</span>';
}
function badgePng(b, cls, st){
  st=st||badgeLevel(b);
  var pngId=b.tiers.length>1?b.id+"-"+st.medal:b.id;
  return '<span class="badge-medal '+(cls||"")+'"><img src="images/badges/'+pngId+'.png" class="badge-png" alt="'+esc(b.name)+' badge"></span>';
}

ROUTES.home = { tab:"home", render:function(){
  if(!S.setupDone) return onboardingScreen(0);
  var stats = weekStats();
  var recent = S.history.slice(-2).reverse();
  var lastBadge = lastEarnedBadge();
  var html = '<div class="screen home-approved">';
  html += '<section class="home-approved-hero"><div class="home-block block-one"></div><div class="home-block block-two"></div><div class="hero-copy"><div class="hello">'+greeting()+',</div><h1>'+esc(firstName())+'</h1><div class="hero-q">Ready to start today\'s workout?</div><button class="btn hero-start" data-act="start-workout">'+icon("play")+'Start Workout</button></div><img class="hero-avatar '+avatarImgClass("hero")+'" src="'+selectedAvatarImage()+'" alt="Selected avatar"></section>';
  html += '<button class="choose-workout-card" data-act="'+(S.active?'goto':'start-workout')+'" '+(S.active?'data-name="activeWorkout"':'')+'><span><strong>'+(S.active?'Resume your workout':'Choose your workout')+'</strong><small>'+(S.active?esc(S.active.name)+' · '+plural(S.active.exercises.length,'exercise'):'Quick start or use a plan')+'</small></span><span class="choose-arrow">›</span></button>';
  html += '<div class="home-approved-content">';
  html += '<section class="card week-card"><div class="row between mb14"><div class="row-title">This week</div><div class="week-volume"><strong>'+money(stats.volume)+'</strong><span>lbs lifted</span></div></div>'+weekDots()+'</section>';
  html += '<div class="card coach-tip approved-tip"><span class="coach-avatar"><img class="'+avatarImgClass("tip")+'" src="'+selectedAvatarImage()+'" alt="Selected avatar"></span><div class="grow"><div class="tip-label">Coach Tip</div><div class="tip-copy">'+esc(shortTip(tipOfDay()))+'</div></div></div>';
  html += '<div class="row between home-section-head"><div class="label" style="margin:0">Recent workouts</div><button class="btn ghost small" data-act="tab" data-tab="history">History</button></div>';
  if(recent.length) recent.forEach(function(w){ html += workoutRow(w); });
  else html += '<div class="card pad center"><div class="row-title">No workouts yet</div><div class="row-sub">Your completed workouts will appear here.</div></div>';
  if(lastBadge) html += '<div class="list-row badge-home-row" data-act="goto" data-name="badgeLibrary">'+badgePng(lastBadge,"home-badge")+'<div class="grow"><div class="badge-kicker">LATEST BADGE</div><div class="row-title">'+esc(lastBadge.name)+'</div><div class="row-sub">'+esc("Earned "+relDay((badgeRec(lastBadge.id)||{}).date))+'</div></div><span class="icon-circle">'+icon("chevronRight")+'</span></div>';
  html += '</div></div>';
  return html;
}};

function greeting(){ var h=new Date().getHours(); return h<12?"Good morning":h<18?"Good afternoon":"Good evening"; }
var TIPS = [
  "Focus on form, not speed — good reps build real strength.",
  "Breathe out as you push, in as you return.",
  "Rest 60–90 seconds between sets. It's part of the work.",
  "If your form breaks down, it's okay to go lighter.",
  "Warm up with 5 easy minutes before you load up.",
  "Slow and controlled beats fast and sloppy every time.",
  "Hydrate — a few sips between sets keeps you sharp.",
  "Consistency beats intensity. Showing up is the win.",
  "Stop a set when your form changes — that's smart training, not quitting."
];
function tipOfDay(){ return TIPS[new Date().getDate()%TIPS.length]; }
function shortTip(t){
  if(!t) return "";
  var m = String(t).match(/^[\s\S]*?[.!?]['"\u2019\u201d]?(?:\s|$)/);
  return (m ? m[0] : t).trim();
}
function weekDots(){
  var done = {};
  S.history.forEach(function(w){ done[new Date(w.date+"T12:00").getDay()] = true; });
  var days = ["S","M","T","W","T","F","S"];
  return '<div class="week-dots">'+days.map(function(d,i){ return '<div class="day-dot '+(done[i]?"done":"")+'"><i>'+(done[i]?ICON("check"):"")+'</i><span>'+d+'</span></div>'; }).join("")+'</div>';
}
function weekStats(){
  var cutoff = Date.now()-6*86400000, workouts=0, volume=0, machines={};
  S.history.forEach(function(w){
    if(new Date(w.date+"T12:00").getTime()>=cutoff) workouts++;
    w.exercises.forEach(function(x){ machines[x.eqId]=1; x.sets.forEach(function(s){ volume += (s.weight||0)*(s.reps||0); }); });
  });
  return { workouts:workouts, volume:volume, machines:Object.keys(machines).length };
}
function workoutRow(w){
  var sets = w.exercises.reduce(function(a,x){ return a+(x.sets?x.sets.length:0); },0);
  var first=w.exercises[0]&&eqSafe(w.exercises[0].eqId);
  var weekday=new Date(w.date+"T12:00").toLocaleDateString(undefined,{weekday:"long"});
  return cardRow({ cls:"recent-workout-row", img:first&&first.img, title:weekday+" Workout", sub:relDay(w.date)+" · "+plural(w.exercises.length,"exercise")+" · "+plural(sets,"set"), act:"open-workout", id:w.id });
}

ROUTES.activeWorkout = { tab:"workout", render:function(){
  if(!S.active) return emptyScreen("workout","No active workout","Start a fresh session and log as you go.","Start Workout","start-workout");
  var a = S.active;
  var cur = a.exercises.find(function(x){ return !x.done; });
  var curIdx = a.exercises.indexOf(cur);
  var html = '<div class="screen">';
  html += '<div class="active-top"><div><div class="plan-name">'+esc(a.name)+'</div><div class="active-meta">'+plural(a.exercises.filter(function(x){return !x.done;}).length,"upcoming exercise")+' · '+plural(a.exercises.length,"total")+'</div></div><button class="btn soft save-progress" data-act="save-progress">Save</button></div>';
  if(!a.exercises.length){
    html += '<div class="empty" style="min-height:420px;padding-bottom:40px"><div class="empty-tile">'+icon("search")+'</div><h2>Add your first exercise</h2><p>Search the equipment list to begin logging.</p><button class="btn primary mt18" data-act="add-exercise">'+icon("plus")+'Add Exercise</button></div></div>';
    return html;
  }
  if(cur) html += exerciseCard(cur,curIdx);
  else html += '<div class="card pad center mt12"><div class="empty-tile" style="width:76px;height:76px;margin:0 auto 12px">'+icon("check")+'</div><div class="row-title">No upcoming exercises</div><div class="row-sub">Everything in this workout is marked done.</div><button class="btn primary mt14" data-act="finish-workout">'+icon("flag")+'Complete Workout</button></div>';
  html += '<div class="card coach-tip compact approved-tip"><span class="coach-avatar"><img class="'+avatarImgClass("tip")+'" src="'+selectedAvatarImage()+'" alt="Selected avatar"></span><div class="grow"><div class="tip-label">Coach Tip</div><div class="tip-copy">'+esc(shortTip(cur && eqSafe(cur.eqId).tip)||"Add another exercise or finish when you are ready.")+'</div></div></div>';
  html += '<div class="up-next-head"><strong>Up Next</strong></div><div class="list">';
  var n=1;
  a.exercises.forEach(function(x,i){
    if(i===curIdx || x.done) return;
    var e=eqSafe(x.eqId);
    html += '<div class="list-row"><div class="thumb sm"><img src="'+e.img+'" alt=""></div><div class="grow"><div class="row-title">'+esc(e.name)+'</div><div class="row-sub">'+lastMeta(e)+'</div></div><div class="inline-menu"><button class="fav-btn" data-act="toggle-menu" data-i="'+i+'" aria-label="Exercise actions">'+icon("more")+'</button>'+(openMenu===i?exerciseMenu(i):"")+'</div></div>';
  });
  html += '</div>';
  if(!a.exercises.some(function(x,i){ return !x.done && i!==curIdx; })) html += '<div class="card pad center"><div class="row-sub">No upcoming exercises. Add another or finish when you are ready.</div></div>';
  if(deletedExercise) html += '<div class="undo-bar">'+icon("undo")+'<span>Exercise removed</span><button data-act="undo-delete">Undo</button></div>';
  var doneList = a.exercises.filter(function(x){ return x.done; });
  if(doneList.length){
    html += '<div class="completed-label"><span>'+icon("check")+'Completed</span><b>'+doneList.length+'</b></div><div class="completed-list">';
    doneList.forEach(function(x,i){
      var e=eqSafe(x.eqId),actualIndex=a.exercises.indexOf(x);
      html += '<div class="completed-row"><div class="cr-top"><div class="thumb sm"><img src="'+e.img+'" alt=""></div><div class="grow"><div class="row-title">'+esc(e.name)+'</div><div class="row-sub">'+plural(x.sets.length,"set")+(x.difficulty?" · "+esc(difficultyName(x.difficulty)):"")+'</div></div><span class="icon-circle">'+icon("check")+'</span></div><button class="undo-completed" data-act="undo-completed" data-i="'+actualIndex+'">Move back to Up Next</button></div>';
    });
    html += '</div>';
  }
  html += '<button class="btn soft mt12" data-act="add-exercise">'+icon("plus")+'Add Exercise</button><button class="btn primary mt12" data-act="finish-workout">'+icon("flag")+'Complete Workout</button></div>';
  return html;
}};
function exerciseCard(x,idx){
  var e = eqSafe(x.eqId);
  var rows = x.sets.map(function(s,i){
    var val = e.type==="cardio" ? (s.minutes+" min · "+(s.distance||0)+" mi") : (s.weight+" lb × "+s.reps);
    return '<div class="set-line"><span class="n">Set '+(i+1)+'</span><span class="v">'+esc(val)+'</span><button class="remove-set" data-act="remove-set" data-i="'+idx+'" data-set="'+i+'" aria-label="Remove set '+(i+1)+'">×</button></div>';
  }).join("") || '<div class="set-empty">No sets yet. Tap Add Set below.</div>';
  return '<div class="exercise-card approved-active-card"><div class="row between active-card-top"><span class="now-pill"><i></i>NOW</span><button class="info-link" data-act="machine-detail" data-id="'+e.id+'" aria-label="Exercise information">'+icon("info")+'</button></div><div class="exercise-body"><div class="exercise-copy"><h2>'+esc(e.name)+'</h2><div class="muscles">'+esc(musclesLabel(e))+'</div><div class="set-lines">'+rows+'</div></div><div class="machine-art-wrap"><img class="machine-art transparent-asset" src="'+e.imgUse+'" alt="'+esc(e.name)+' in use"></div></div><div class="action-row"><button class="btn primary" data-act="add-set" data-i="'+idx+'">'+icon("plus")+'Add Set</button><button class="btn ghost" data-act="exercise-history" data-id="'+e.id+'">'+icon("history")+'History</button><button class="btn ghost" data-act="done-exercise" data-i="'+idx+'">'+icon("check")+'Done</button></div></div>';
}
function exerciseMenu(i){
  return '<div class="pop-menu"><button data-act="duplicate-exercise" data-i="'+i+'">'+icon("copy")+'Duplicate</button><button class="danger" data-act="remove-exercise" data-i="'+i+'">'+icon("trash")+'Remove</button></div>';
}
function lastMeta(e){
  var l=S.lastUsed[e.id];
  if(!l || (e.type==="cardio" ? l.minutes==null : l.weight==null)) return musclesLabel(e);
  return e.type==="cardio" ? "Last: "+l.minutes+" min" : "Last: "+l.weight+" lb x "+l.reps;
}

ROUTES.addExercise = { tab:"workout", render:function(){
  var html = '<div class="screen"><div class="sticky-head">'+topbar("Add Exercise",'<button class="icon-btn plain" data-act="back">'+icon("close")+'</button>')+'<div class="search">'+icon("search")+'<input id="eq-search" placeholder="Search machines..." value="'+esc(addState.q)+'"><button class="fav-btn" data-act="clear-search">'+icon("close")+'</button></div><div class="scroll-x mt12">'+categoryChips()+'</div></div><div class="list mt14" id="eq-results">'+exerciseResults()+'</div></div>';
  return html;
}, after:function(){
  var i=document.getElementById("eq-search");
  if(i) i.addEventListener("input",function(){ addState.q=i.value; var r=document.getElementById("eq-results"); if(r) r.innerHTML=exerciseResults(); });
}};
function categoryChips(){
  var cats = ["all","favorites","Strength Machines","Cable Machines","Free Weights","Cardio"];
  return cats.map(function(c){
    var active = c==="favorites" ? addState.favOnly : (!addState.favOnly && addState.cat===c);
    return '<button class="chip '+(active?"active":"")+'" data-act="cat" data-cat="'+esc(c)+'">'+esc(c==="all"?"All":c==="favorites"?"Favorites":c.replace(" Machines",""))+'</button>';
  }).join("");
}
function exerciseResults(){
  var q=addState.q.trim().toLowerCase();
  var list = EQUIPMENT.filter(function(e){
    if(e.hidden) return false;
    if(addState.favOnly && !e.favorite) return false;
    if(!addState.favOnly && addState.cat!=="all" && e.category!==addState.cat) return false;
    if(q && (e.name.toLowerCase().indexOf(q)<0 && musclesLabel(e).toLowerCase().indexOf(q)<0)) return false;
    return true;
  }).sort(function(a,b){ return a.name.localeCompare(b.name); });
  if(!list.length) return '<div class="empty" style="min-height:420px;padding-bottom:40px"><div class="empty-tile">'+icon("search")+'</div><h2>No exercises found</h2><p>Try another search or browse all machines.</p><button class="btn soft mt18" data-act="browse-all">Browse all machines</button></div>';
  return list.map(function(e){
    var inActive = S.active && S.active.exercises.some(function(x){ return x.eqId===e.id; });
    return '<div class="list-row"><div class="thumb md"><img src="'+e.img+'" alt=""></div><div class="grow"><div class="row-title">'+esc(e.name)+'</div><div class="row-sub">'+esc(musclesLabel(e))+'</div></div><div style="display:flex;flex-direction:column;gap:10px;align-items:center"><button class="fav-btn '+(e.favorite?"on":"")+'" data-act="toggle-fav" data-id="'+e.id+'">'+(e.favorite?icon("starFilled"):icon("star"))+'</button><button class="icon-circle" data-act="add-machine" data-id="'+e.id+'">'+(inActive?icon("check"):icon("plus"))+'</button></div></div>';
  }).join("");
}

function openAddSet(idx){
  var x = S.active.exercises[idx], e=eqSafe(x.eqId), base = x.sets.length?x.sets[x.sets.length-1]:resolveDefaults(e);
  sheet = e.type==="cardio" ? { exIdx:idx, cardio:true, minutes:base.minutes||resolveDefaults(e).minutes, distance:base.distance||0, intensity:base.intensity||"Moderate" } : { exIdx:idx, cardio:false, weight:base.weight||resolveDefaults(e).weight, reps:base.reps||resolveDefaults(e).reps };
  var last = S.lastUsed[e.id];
  var lastTxt = last ? (e.type==="cardio"?last.minutes+" min · "+(last.distance||0)+" mi":last.weight+" lb x "+last.reps) : "First time";
  var body = '<div class="sheet-screen"><div class="dim-content"><div class="screen-title">Active Workout</div><div class="card tint mt14" style="height:150px"></div></div><div class="scrim" data-act="close-layer"></div><div class="bottom-sheet"><div class="grab"></div><div class="row gap13 mb18"><div class="thumb lg"><img src="'+e.img+'" alt=""></div><div class="grow"><div style="font-size:19px;font-weight:800">Add Set</div><div class="meta">'+esc(e.name)+' · last '+esc(lastTxt)+'</div></div><div class="chip soft">Set '+(x.sets.length+1)+'</div></div>';
  if(sheet.cardio){
    body += picker("Minutes","minutes",sheet.minutes,S.defaults.cardioInc,"min",1);
    body += '<div class="field"><span>Distance (miles)</span><input id="cardio-dist" inputmode="decimal" value="'+sheet.distance+'"></div><div class="row gap8 mb14">'+["Easy","Moderate","Hard"].map(function(v){return '<button class="chip '+(sheet.intensity===v?"active":"")+'" data-act="sheet-intensity" data-v="'+v+'">'+v+'</button>';}).join("")+'</div>';
  } else {
    body += picker("Weight","weight",sheet.weight,S.defaults.weightInc,"lb",0)+picker("Reps","reps",sheet.reps,S.defaults.repInc,"",1);
  }
  body += '<div class="meta center mb10">Tap Save to log this set.</div><button class="btn primary" data-act="save-set">'+icon("check")+'Save Set</button><button class="btn ghost mt8" data-act="close-layer">Cancel</button></div></div>';
  openLayer(body);
}
function picker(label,key,value,inc,unit,min){
  min = min==null?0:min;
  function val(offset){ return Math.max(min, value+(offset*inc)); }
  return '<div class="row gap6 mb8" style="font-size:13px;font-weight:700">'+(key==="weight"?icon("weight"):key==="reps"?icon("refresh"):icon("clock"))+esc(label)+(unit?' <span class="muted">('+esc(unit)+')</span>':'')+'</div><div class="picker"><button class="picker-btn" data-act="picker-step" data-key="'+key+'" data-step="1">▲</button><div class="picker-values"><span class="far">'+val(-3)+'</span><span>'+val(-2)+'</span><span class="near">'+val(-1)+'</span><span class="sel">'+value+'</span><span class="near">'+val(1)+'</span><span>'+val(2)+'</span><span class="far">'+val(3)+'</span></div><button class="picker-btn" data-act="picker-step" data-key="'+key+'" data-step="-1">▼</button></div>';
}

function openDifficulty(idx){
  var x=S.active.exercises[idx], e=eqSafe(x.eqId), last=x.sets[x.sets.length-1];
  pendingDiff = { exIdx:idx, value:"good" };
  var lastTxt = last ? (e.type==="cardio"?last.minutes+" min · "+(last.distance||0)+" mi":last.weight+" lb · "+last.reps+" reps") : "No sets logged";
  var ids=["too-easy","easy","good","hard","too-hard"];
  openLayer('<div class="sheet-screen"><div class="dim-content"><div class="screen-title">Active Workout</div><div class="card tint mt14" style="height:150px"></div></div><div class="scrim dark" data-act="close-layer"></div><div class="modal-wrap"><div class="modal-card rating-modal"><img class="modal-coach-float" src="'+coachBust()+'" alt=""><h2 class="center" style="font-size:22px;font-weight:800">How did that feel?</h2><p class="meta center mt8">Your rating personalizes future suggestions.</p><div class="face-grid">'+ids.map(function(id){return '<button class="face-opt '+(id==="good"?"sel":"")+'" data-act="select-diff" data-d="'+id+'"><img src="'+facePath(id)+'" alt=""><span>'+difficultyName(id)+'</span></button>';}).join("")+'</div><button class="btn primary" data-act="save-diff">Continue</button><button class="btn ghost mt8" data-act="skip-diff">Skip</button><div class="meta center mt8">Last set: '+esc(lastTxt)+'</div></div></div></div>');
}

function openSummary(){
  var a=S.active, done=a.exercises.filter(function(x){ return x.sets.length; });
  var totalSets = done.reduce(function(n,x){ return n+x.sets.length; },0);
  var html = '<div class="sheet-screen"><div class="scrim" data-act="close-layer"></div><div class="screen no-nav" style="position:absolute;inset:0;z-index:2"><div class="center" style="padding:8px 0 4px"><div class="empty-tile" style="width:56px;height:56px;border-radius:50%;margin:0 auto;animation:pop .5s ease">'+icon("check")+'</div><div style="font-size:26px;font-weight:800;margin-top:12px">Workout Summary</div><div style="font-size:14px;color:var(--primary);font-weight:600;margin-top:2px">You completed '+plural(done.length,"exercise")+'</div></div><div class="card coach-tip"><img src="'+coachBust()+'" alt=""><div class="grow"><div class="tip-label">Your Coach</div><div class="tip-copy">'+esc(summaryNote(done))+'</div></div></div><div class="label">Exercises</div><div class="card">';
  if(!done.length) html += '<div class="summary-row"><div class="meta center grow">No sets were logged.</div></div>';
  done.forEach(function(x){
    var e=eqSafe(x.eqId), n=x.sets.length, last=x.sets[n-1]||{}, top=Math.max.apply(null,x.sets.map(function(s){return s.weight||0;}));
    html += '<div class="summary-row"><div class="thumb sm"><img src="'+e.img+'" alt=""></div><div class="grow row-title">'+esc(e.name)+'</div><div class="sum-metric"><div class="v">'+(e.type==="cardio"?n:n+" x "+(last.reps||0))+'</div><div class="k">'+(e.type==="cardio"?"Rounds":"Sets x Reps")+'</div></div><div class="sum-metric" style="width:62px;text-align:right"><div class="v">'+(e.type==="cardio"?(last.minutes||0)+" min":top+" lb")+'</div><div class="k">'+(e.type==="cardio"?"Time":"Weight")+'</div></div></div>';
  });
  html += '</div><div class="stat-row mt16"><div class="stat-tile"><div class="v">'+done.length+'</div><div class="k">Machines used</div></div><div class="stat-tile"><div class="v">'+totalSets+'</div><div class="k">Total sets</div></div></div><button class="btn primary mt18" data-act="save-workout">'+icon("check")+'Save Workout</button><button class="btn soft mt10" data-act="close-layer">View Details</button></div></div>';
  openLayer(html);
}
function summaryNote(done){ return done.length ? "Nice work, "+firstName()+" - you finished strong today." : "Even showing up matters. Next time, log a set or two and watch your progress build."; }

ROUTES.browsePlans = { tab:"plans", render:function(){
  var html='<div class="screen"><div class="row between" style="padding:6px 2px 14px"><div class="screen-title">Plans</div><button class="btn primary small" data-act="new-plan">'+icon("plus")+'Create Plan</button></div><div class="tabs"><button class="chip active">All</button><button class="chip">Favorites</button><button class="chip">Beginner</button></div><div class="list-row" style="border:1.5px dashed var(--border);background:var(--tint);padding:15px" data-act="new-plan"><span class="icon-circle" style="background:#fff;color:var(--primary);border:1px solid var(--border)">'+icon("plus")+'</span><div class="grow"><div class="row-title" style="color:var(--primary)">Create New Plan</div><div class="row-sub">Build a custom workout plan that fits your goals.</div></div><span class="icon-circle">'+icon("chevronRight")+'</span></div><div class="label">Your Saved Plans</div><div class="list">';
  S.plans.forEach(function(p){
    var e=eqSafe(p.exercises[0]);
    html += '<div class="list-row" data-act="plan-detail" data-id="'+p.id+'"><div class="thumb md"><img src="'+e.img+'" alt=""></div><div class="grow"><div class="row-title">'+esc(p.name)+'</div><div class="row-sub">'+plural(p.exercises.length,"exercise")+' · Beginner</div><div class="row-sub">A balanced routine to build confidence.</div></div><button class="fav-btn '+(p.favorite?"on":"")+'" data-act="fav-plan" data-id="'+p.id+'">'+(p.favorite?icon("starFilled"):icon("star"))+'</button></div>';
  });
  html += '</div><div class="card tint pad mt16 row gap10">'+icon("bulb")+'<div class="meta"><b style="color:var(--primary)">Tip:</b> Edit a plan to reorder or add machines.</div></div></div>';
  return html;
}};
ROUTES.planDetail = { tab:"plans", render:function(p){
  var plan=S.plans.find(function(x){return x.id===p.id;}) || S.plans[0], first=eqSafe(plan.exercises[0]);
  return '<div class="screen"><div class="plan-hero"><div class="home-block block-one"></div><div class="home-block block-two"></div><button class="icon-btn back-btn" data-act="back" aria-label="Back">'+icon("chevronLeft")+'</button><img class="transparent-asset" src="'+first.imgUse+'" alt=""></div><div class="pull-card"><span class="chip soft">'+icon("starFilled")+'Coach recommended</span><h1 style="font-size:23px;font-weight:800;margin-top:10px">'+esc(plan.name)+'</h1><div class="scroll-x mt12"><span class="chip soft">30 min</span><span class="chip soft">Beginner</span><span class="chip soft">'+plural(plan.exercises.length,"exercise")+'</span></div><p class="meta mt12">A gentle plan that builds confidence with simple guided movements.</p></div><div class="label">Exercises</div><div class="list">'+plan.exercises.map(function(id,i){var e=eqSafe(id);return cardRow({order:i+1,img:e.img,thumb:"sm",title:e.name,sub:musclesLabel(e),right:""});}).join("")+'</div><button class="btn primary mt20" data-act="start-plan" data-id="'+plan.id+'">'+icon("play")+'Start Plan</button><button class="btn soft mt10" data-act="edit-plan" data-id="'+plan.id+'">'+icon("edit")+'Edit Plan</button></div>';
}};
ROUTES.planBuilder = { tab:"plans", render:function(){
  planDraft = planDraft || { id:null, name:"New Plan", exercises:[] };
  return '<div class="screen">'+topbar(planDraft.id?"Edit Plan":"New Plan")+'<div class="field"><span>Plan name</span><input id="plan-name" value="'+esc(planDraft.name)+'" placeholder="Plan name"></div><div class="label">Exercises</div><div class="list">'+(planDraft.exercises.length?planDraft.exercises.map(function(id,i){var e=eqSafe(id);return '<div class="list-row"><span class="order-badge">'+(i+1)+'</span><div class="thumb sm"><img src="'+e.img+'" alt=""></div><div class="grow"><div class="row-title">'+esc(e.name)+'</div><div class="row-sub">'+esc(musclesLabel(e))+'</div></div><button class="fav-btn" data-act="builder-up" data-i="'+i+'">'+icon("chevronLeft")+'</button><button class="fav-btn" data-act="builder-down" data-i="'+i+'">'+icon("chevronRight")+'</button><button class="fav-btn" data-act="builder-remove" data-i="'+i+'">'+icon("trash")+'</button></div>';}).join(""):'<div class="card pad center meta">No exercises yet.</div>')+'</div><button class="btn soft mt14" data-act="plan-add-exercise">'+icon("plus")+'Add Exercise</button><button class="btn primary mt12" data-act="save-plan">'+icon("check")+'Save Plan</button></div>';
}, after:function(){ var n=document.getElementById("plan-name"); if(n) n.addEventListener("input",function(){ planDraft.name=n.value; }); }};
ROUTES.planAddExercise = { tab:"plans", render:function(){
  var q=addState.q.trim().toLowerCase();
  var list=EQUIPMENT.filter(function(e){ return !e.hidden && (!q || e.name.toLowerCase().indexOf(q)>=0 || musclesLabel(e).toLowerCase().indexOf(q)>=0); }).sort(function(a,b){return a.name.localeCompare(b.name);});
  return '<div class="screen"><div class="sticky-head">'+topbar("Add Exercise",'<button class="icon-btn plain" data-act="back">'+icon("close")+'</button>')+'<div class="search">'+icon("search")+'<input id="plan-eq-search" placeholder="Search machines..." value="'+esc(addState.q)+'"></div></div><div class="list mt14" id="plan-eq-results">'+list.map(function(e){ var inPlan=planDraft.exercises.indexOf(e.id)>=0; return '<div class="list-row"><div class="thumb md"><img src="'+e.img+'" alt=""></div><div class="grow"><div class="row-title">'+esc(e.name)+'</div><div class="row-sub">'+esc(musclesLabel(e))+'</div></div><button class="icon-circle" data-act="builder-add-machine" data-id="'+e.id+'">'+(inPlan?icon("check"):icon("plus"))+'</button></div>'; }).join("")+'</div></div>';
}, after:function(){ var i=document.getElementById("plan-eq-search"); if(i) i.addEventListener("input",function(){ addState.q=i.value; render(); }); }};

ROUTES.workoutHistory = { tab:"history", render:function(){
  var stats=weekStats(), html='<div class="screen"><div class="screen-title" style="padding:6px 2px 14px">History</div><div class="tabs"><button class="chip active">Workouts</button><button class="chip" data-act="goto" data-name="bodyActivity">Stats</button></div><div class="history-section-kicker">THIS WEEK</div>'+weekOverview(stats)+calendarPanel()+'<div class="label">Recent workouts</div>';
  if(!S.history.length) html += '<div class="empty" style="min-height:420px;padding-bottom:40px"><div class="empty-tile">'+icon("history")+'</div><h2>No workouts yet</h2><p>Finish a workout and it shows up here.</p><button class="btn primary mt18" data-act="start-workout">'+icon("play")+'Start Workout</button></div>';
  else S.history.slice().reverse().forEach(function(w){ html+=workoutRow(w); });
  html += '</div>';
  return html;
}};
function weekOverview(stats){
  return '<div class="week-card-grid"><section class="week-depth-card workouts"><div class="week-card-icon">'+icon("calendar")+'</div><div class="week-card-value">'+stats.workouts+'</div><div class="week-card-label">Workouts</div><div class="week-card-note">Sessions completed</div></section><section class="week-depth-card machines"><div class="week-card-icon">'+icon("dumbbell")+'</div><div class="week-card-value">'+stats.machines+'</div><div class="week-card-label">Machines</div><div class="week-card-note">Unique equipment used</div></section><section class="week-depth-card lifted"><div class="week-card-icon">'+icon("weight")+'</div><div class="week-card-value">'+money(stats.volume)+'</div><div class="week-card-label">lbs lifted</div><div class="week-card-note">Weight × reps</div></section></div>';
}
ROUTES.calendar = { tab:"history", render:function(){
  return '<div class="screen">'+topbar("Calendar")+calendarPanel()+'</div>';
}};
function calendarPanel(){
  if(!calCursor){ var now=new Date(); calCursor={y:now.getFullYear(),m:now.getMonth()}; }
  var first=new Date(calCursor.y,calCursor.m,1), start=first.getDay(), days=new Date(calCursor.y,calCursor.m+1,0).getDate(), has={};
  S.history.forEach(function(w){ var d=new Date(w.date+"T12:00"); if(d.getFullYear()===calCursor.y&&d.getMonth()===calCursor.m) has[d.getDate()]=w.id; });
  var cells=["S","M","T","W","T","F","S"].map(function(d){return '<div class="calendar-dow">'+d+'</div>';}).join("");
  for(var i=0;i<start;i++) cells+='<div></div>';
  for(var day=1;day<=days;day++){var id=has[day];cells+='<button class="calendar-day '+(id?'has-workout':'')+'" data-act="'+(id?'open-workout':'noop')+'" '+(id?'data-id="'+id+'"':'')+'>'+day+(id?'<span></span>':'')+'</button>';}
  return '<section class="history-calendar card"><div class="calendar-head"><div><span>WORKOUT CALENDAR</span><strong>'+first.toLocaleDateString(undefined,{month:"long",year:"numeric"})+'</strong></div><div><button class="icon-btn plain" data-act="cal-prev" aria-label="Previous month">'+icon("chevronLeft")+'</button><button class="icon-btn plain" data-act="cal-next" aria-label="Next month">'+icon("chevronRight")+'</button></div></div><div class="calendar-grid">'+cells+'</div></section>';
}
ROUTES.bodyActivity = { tab:"history", render:function(){
  var exercises = [];
  var cutoff = Date.now()-6*86400000;
  S.history.forEach(function(w){ if(new Date(w.date+"T12:00").getTime()>=cutoff) exercises=exercises.concat(w.exercises); });
  if(S.active) exercises = exercises.concat(S.active.exercises.filter(function(x){return x.sets.length;}));
  var counts = {};
  exercises.forEach(function(x){ var e=eqSafe(x.eqId); (e.muscles||[]).forEach(function(m){ if(m!=="cardio") counts[m]=(counts[m]||0)+Math.max(1,x.sets.length); }); });
  var rgb = themeRGB();
  var levels = {};
  Object.keys(counts).forEach(function(k){ levels[k]=counts[k]>=6?3:counts[k]>=3?2:1; });
  var keys=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];});
  return '<div class="screen">'+topbar("Body Activity")+'<div class="card pad"><div class="row gap12" style="align-items:flex-start"><div class="grow center"><div class="meta mb8">Front</div>'+MUSCLE_MAP("front",levels,rgb)+'</div><div class="grow center"><div class="meta mb8">Back</div>'+MUSCLE_MAP("back",levels,rgb)+'</div></div></div><div class="label">Muscle group frequency</div><div class="card pad">'+(keys.length?keys.map(function(k){ var pct=Math.min(100,counts[k]*14); return '<div class="row gap10 mb10"><div class="grow row-title">'+esc(MUSCLE_NAMES[k]||k)+'</div><div class="pbar" style="width:120px"><i style="width:'+pct+'%"></i></div><div class="meta" style="width:24px;text-align:right">'+counts[k]+'</div></div>'; }).join(""):'<p class="meta center">No body activity logged yet.</p>')+'</div></div>';
}};
ROUTES.pastWorkout = { tab:"history", render:function(p){
  var w=S.history.find(function(x){return x.id===p.id;});
  if(!w) return emptyScreen("history","Workout not found","That saved workout is not available.","Back","back");
  var sets=w.exercises.reduce(function(n,x){return n+x.sets.length;},0);
  var html='<div class="screen">'+topbar(w.name)+'<div class="card pad tint"><div class="row gap12"><div class="thumb sm">'+icon("calendar")+'</div><div><div class="row-title">'+esc(w.name)+'</div><div class="row-sub">'+relDay(w.date)+'</div></div></div><div class="stat-row mt16"><div class="stat-tile"><div class="v">'+w.exercises.length+'</div><div class="k">Exercises</div></div><div class="stat-tile"><div class="v">'+sets+'</div><div class="k">Sets</div></div></div></div><div class="label">Exercises</div>';
  w.exercises.forEach(function(x){ var e=eqSafe(x.eqId); html += '<div class="card mb12"><div class="summary-row"><div class="thumb sm"><img src="'+e.img+'" alt=""></div><div class="grow"><div class="row-title">'+esc(e.name)+'</div><div class="row-sub">'+esc(musclesLabel(e))+'</div></div></div>'+x.sets.map(function(s,i){return '<div class="summary-row"><div class="meta">Set '+(i+1)+'</div><div class="grow"></div><div class="row-title">'+(e.type==="cardio"?s.minutes+" min · "+(s.distance||0)+" mi":s.weight+" lb x "+s.reps+" reps")+'</div></div>';}).join("")+'</div>'; });
  return html+'</div>';
}};

ROUTES.machineDetail = { tab:"workout", hideNav:true, render:function(p){
  var e=eqSafe(p.id);
  return '<div class="screen no-nav info-approved">'+topbar(e.name)+'<div class="machine-hero info-machine-hero"><img class="transparent-asset" src="'+e.imgUse+'" alt="'+esc(e.name)+' in use"></div><div class="muscle-chips">'+(e.muscles||[]).slice(0,4).map(function(m){return '<span>'+esc(MUSCLE_NAMES[m]||m)+'</span>';}).join("")+'</div><div class="label">How to use</div><div class="steps approved-steps">'+(e.instructions||[]).slice(0,5).map(function(s,i){return '<div class="step"><span class="step-num">'+(i+1)+'</span><p>'+esc(s)+'</p></div>';}).join("")+'</div><div class="safety-tip"><div class="tip-label">Safety Tip</div><div class="tip-copy">'+esc(e.tip||"Move slowly and keep control throughout the full range of motion.")+'</div></div><div class="label">Common mistakes</div><div class="steps approved-steps">'+(e.mistakes||[]).slice(0,5).map(function(s){return '<div class="step"><span class="warn-icon">!</span><p>'+esc(s)+'</p></div>';}).join("")+'</div></div>';
}};
ROUTES.exerciseHistory = { tab:"workout", hideNav:true, render:function(p){
  var e=eqSafe(p.id), sessions=exerciseSessions(e.id), stats=exerciseStats(e,sessions), series=exerciseHistorySeries(e,sessions,historyRange), selected=Math.min(historyPoint==null?series.points.length-1:historyPoint,Math.max(0,series.points.length-1)), point=series.points[selected], visible=sessions.slice(0,historyVisible);
  var chart=series.points.length?'<div class="history-chart-scroll" tabindex="0" aria-label="Scrollable '+historyRange+' progress chart"><div class="history-bars" style="width:'+Math.max(360,series.points.length*58)+'px">'+series.points.map(function(x,i){var h=series.max===series.min?70:38+Math.round((x.value-series.min)/(series.max-series.min)*58);return '<button class="history-bar-point" data-act="history-point" data-point="'+i+'" aria-pressed="'+(i===selected)+'" aria-label="'+esc(x.label)+', '+esc(historyMetric(e,x.value))+'"><span style="height:'+h+'%"><b>'+esc(x.value)+'</b></span><i>'+esc(x.label)+'</i></button>';}).join("")+'</div></div>':'<div class="history-empty">Complete this exercise to start its progress chart.</div>';
  var pointDetail=point?'<div class="history-point-detail"><strong>'+esc(point.period||point.label)+'</strong><span>'+esc(historyMetric(e,point.value))+' · '+(e.type==="cardio"?esc(point.reps):point.reps+' reps')+' · '+plural(point.sets,'set')+' · '+esc(difficultyName(point.diff||"good"))+'</span></div>':'';
  var cards=visible.length?visible.map(function(s){return '<section class="history-session card"><div class="row between"><div><div class="session-date">'+relDay(s.date)+'</div><div class="session-meta">'+esc(s.workout)+' · '+plural(s.sets,'set')+' · '+esc(difficultyName(s.diff||"good"))+'</div></div><div class="session-value">'+esc(historyMetric(e,s.value))+(e.type==="cardio"?'':' × '+s.reps)+'</div></div></section>';}).join(""):'<div class="card pad center meta">No history for this exercise yet.</div>';
  return '<div class="screen no-nav exercise-history-approved">'+topbar(e.name+' History')+'<div class="muscles history-muscles">'+esc(musclesLabel(e))+'</div><section class="history-best card"><div class="thumb lg"><img class="transparent-asset" src="'+e.img+'" alt=""></div><div class="grow"><div class="mini-label">CURRENT BEST</div><div class="history-best-value">'+esc(stats.best)+'</div><div class="row-sub">Last time: '+esc(stats.last)+'</div></div></section><div class="history-stat-row"><div><strong>'+esc(stats.best)+'</strong><span>Best</span></div><div><strong>'+esc(stats.last)+'</strong><span>Last time</span></div><div><strong>'+sessions.length+'</strong><span>Sessions</span></div></div><section class="history-progress-card card"><div class="row between"><div class="row-title">'+esc(series.title)+'</div><div class="history-delta">'+esc(series.delta)+'</div></div><div class="history-range" role="group" aria-label="History range">'+["4W","3M","1Y","All"].map(function(r){return '<button data-act="history-range" data-range="'+r+'" aria-pressed="'+(historyRange===r)+'">'+r+'</button>';}).join("")+'</div><div class="history-mode"><strong>'+esc(series.mode)+'</strong><span>Swipe timeline →</span></div>'+chart+pointDetail+'<div class="history-note">'+esc(series.note)+'</div></section><div class="label history-list-label">Previous sessions</div><div class="history-session-list">'+cards+'</div>'+(historyVisible<sessions.length?'<button class="history-load" data-act="history-load">Load earlier sessions</button>':(sessions.length?'<div class="history-end">All recorded sessions shown</div>':''))+'</div>';
}, after:function(){var chart=document.querySelector('.history-chart-scroll');if(chart){var points=exerciseHistorySeries(eqSafe(route.params.id),exerciseSessions(route.params.id),historyRange).points,selected=Math.min(historyPoint==null?points.length-1:historyPoint,Math.max(0,points.length-1));chart.scrollLeft=Math.max(0,(selected+1)*58-chart.clientWidth);}}};
function exerciseSessions(id){
  var out=[];
  S.history.slice().reverse().forEach(function(w){ w.exercises.forEach(function(x){ if(x.eqId===id && x.sets.length){ var e=eqSafe(id), best=x.sets.reduce(function(a,b){return (e.type==="cardio"?(b.minutes||0):(b.weight||0))>(e.type==="cardio"?(a.minutes||0):(a.weight||0))?b:a;},x.sets[0]); out.push({date:w.date,workout:w.name,diff:x.difficulty,value:e.type==="cardio"?(best.minutes||0):(best.weight||0),weight:best.weight||0,reps:e.type==="cardio"?(best.intensity||"Moderate"):(best.reps||0),sets:x.sets.length}); } }); });
  return out;
}
function exerciseStats(e,s){
  if(!s.length) return { best:"-", last:"-", sessions:0 };
  var best=Math.max.apply(null,s.map(function(x){return x.value||0;}));
  return { best:historyMetric(e,best), last:e.type==="cardio"?historyMetric(e,s[0].value):(s[0].value+" lb × "+s[0].reps), sessions:s.length };
}
function historyMetric(e,value){ return e.type==="cardio"?value+" min":value+" lb"; }
function exerciseHistorySeries(e,sessions,range){
  var asc=sessions.slice().sort(function(a,b){return a.date.localeCompare(b.date);}),now=new Date(),cutoff=range==="4W"?28:range==="3M"?92:range==="1Y"?366:null;
  if(cutoff){var edge=new Date(now.getTime()-cutoff*86400000);asc=asc.filter(function(s){return new Date(s.date+"T12:00")>=edge;});}
  var grouped={};
  asc.forEach(function(s){
    var d=new Date(s.date+"T12:00"),key,label,period;
    if(range==="4W"){key=s.date;label=relDay(s.date);period=fmtDate(s.date);}
    else if(range==="3M"){var monday=new Date(d);monday.setDate(d.getDate()-((d.getDay()+6)%7));key=monday.toISOString().slice(0,10);label=fmtDate(key);period="Week of "+fmtDate(key);}
    else{key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");label=d.toLocaleDateString(undefined,{month:"short"})+(range==="All"?" ’"+String(d.getFullYear()).slice(-2):"");period=d.toLocaleDateString(undefined,{month:"long",year:"numeric"});}
    var point=Object.assign({label:label,period:period},s);if(!grouped[key]||point.value>grouped[key].value)grouped[key]=point;
  });
  var points=Object.keys(grouped).sort().map(function(k){return grouped[k];}),values=points.map(function(p){return p.value;}),min=values.length?Math.min.apply(null,values):0,max=values.length?Math.max.apply(null,values):0,mode=range==="4W"?"Session best":range==="3M"?"Weekly best":"Monthly best",note=range==="4W"?"Each bar is the best working set from one workout.":range==="3M"?"Multiple workouts in a week roll up to that week’s best working weight.":"Sessions roll up to the best working weight for each month; weights are never averaged.";
  return {points:points,min:min,max:max,mode:mode,note:note,title:e.type==="cardio"?"Duration progression":"Weight progression",delta:points.length>1?"+"+(points[points.length-1].value-points[0].value)+(e.type==="cardio"?" min":" lb"):""};
}

ROUTES.badgeLibrary = { tab:"home", render:function(){
  var stats=badgeStats(), list=BADGES;
  return '<div class="screen">'+topbar("Badge Library")+'<div class="tabs"><button class="chip '+(badgeTab==="all"?"active":"")+'" data-act="badge-tab" data-tabname="all">All</button><button class="chip '+(badgeTab==="earned"?"active":"")+'" data-act="badge-tab" data-tabname="earned">Earned</button><button class="chip '+(badgeTab==="locked"?"active":"")+'" data-act="badge-tab" data-tabname="locked">Locked</button></div><div class="badge-grid">'+list.map(function(b){return {b:b, st:badgeLevel(b,stats)};}).filter(function(o){return badgeTab==="all" || (badgeTab==="earned"?o.st.got:!o.st.got);}).map(function(o){
    var b=o.b, st=o.st, rec=badgeRec(b.id);
    var sub = st.got ? (st.tiered ? (st.tier.label+(st.next?"":" · Max")) : ("Earned "+relDay(rec.date))) : (st.tiered ? (Math.round(st.val)+" / "+st.next.goal) : (Math.round(st.val)+" / "+b.tiers[0].goal));
    return '<button class="badge-cell '+(st.got?"":"locked")+'" data-act="badge-detail" data-id="'+b.id+'">'+medalArt(b,"",st)+'<div class="row-title mt8">'+esc(b.name)+'</div><div class="row-sub">'+esc(sub)+'</div><div class="pbar mt8"><i style="width:'+st.pct+'%"></i></div></button>';
  }).join("")+'</div></div>';
}};
function badgeStats(){
  var GROUPS={quads:"legs",hamstrings:"legs",glutes:"legs",calves:"legs",chest:"chest",lats:"back","upper-back":"back","lower-back":"back",back:"back",shoulders:"shoulders",biceps:"arms",triceps:"arms",forearms:"arms",abs:"core",obliques:"core"};
  var hist=S.history.slice().sort(function(a,b){return a.date.localeCompare(b.date);});
  var unique={}, cardioSessions=0, cardioMinutes=0, volumeTotal=0, setsTotal=0;
  var legDay=0, hybrid=0, strongStart=0, feedbackCount=0, stretchCount=0;
  var allGroups={}, bests={}, personalBest=0, bestWorkoutVolume=0, varietyDayMax=0;
  var months={}, weeks={}, weekIdx={}, comeback=0, last=null;
  hist.forEach(function(w){
    if(last){ var gap=(new Date(w.date+"T12:00")-new Date(last+"T12:00"))/86400000; if(gap>=14) comeback=1; }
    last=w.date;
    var d=new Date(w.date+"T12:00");
    var mKey=d.getFullYear()+"-"+(d.getMonth()+1); months[mKey]=(months[mKey]||0)+1;
    var wi=Math.floor(d.getTime()/604800000); weekIdx[wi]=true; weeks[wi]=weeks[wi]||{}; weeks[wi][w.date]=true;
    var hasCardio=false, hasStrength=false, hasStretch=false, wVol=0, wGroups={};
    w.exercises.forEach(function(x){
      var e=eqById(x.eqId); if(!e) return;
      unique[x.eqId]=1;
      if(e.type==="cardio") hasCardio=true; else hasStrength=true;
      if(e.id==="full-body-stretch") hasStretch=true;
      if(x.difficulty) feedbackCount++;
      (e.muscles||[]).forEach(function(m){ var g=GROUPS[m]; if(g){ allGroups[g]=1; wGroups[g]=1; } });
      var exMax=0;
      (x.sets||[]).forEach(function(st){
        setsTotal++;
        if(st.weight&&st.reps){ strongStart=1; var v=st.weight*st.reps; volumeTotal+=v; wVol+=v; if(st.weight>exMax) exMax=st.weight; }
        if(e.type==="cardio"&&st.minutes) cardioMinutes+=st.minutes;
      });
      if(e.type!=="cardio" && x.sets && x.sets.length){
        if(bests[x.eqId]!=null && exMax>bests[x.eqId]) personalBest=1;
        bests[x.eqId]=Math.max(exMax, bests[x.eqId]||0);
      }
    });
    if(hasCardio) cardioSessions++;
    if(hasCardio&&hasStrength) hybrid=1;
    if(hasStretch) stretchCount++;
    if(wGroups.legs) legDay=1;
    var gc=Object.keys(wGroups).length; if(gc>varietyDayMax) varietyDayMax=gc;
    if(wVol>bestWorkoutVolume) bestWorkoutVolume=wVol;
  });
  var wkeys=Object.keys(weekIdx).map(Number).sort(function(a,b){return a-b;});
  var streak=0, run=0, prev=null;
  wkeys.forEach(function(k){ run=(prev!==null&&k===prev+1)?run+1:1; prev=k; if(run>streak) streak=run; });
  var weekDayMax=0; Object.keys(weeks).forEach(function(k){ var nn=Object.keys(weeks[k]).length; if(nn>weekDayMax) weekDayMax=nn; });
  var monthMax=0; Object.keys(months).forEach(function(k){ if(months[k]>monthMax) monthMax=months[k]; });
  var powerlifter=(unique["bench-press"]&&unique["squat-rack"]&&unique["barbell"])?1:0;
  return {
    workoutCount:hist.length, planCount:(S.plans?S.plans.length:0),
    uniqueMachines:Object.keys(unique).length, cardioSessions:cardioSessions, cardioMinutes:cardioMinutes,
    volumeTotal:volumeTotal, setsTotal:setsTotal, weeklyStreak:streak, legDay:legDay,
    fullBodyGroups:Object.keys(allGroups).length, hybrid:hybrid, comeback:comeback,
    strongStart:strongStart, personalBest:personalBest, monthMax:monthMax, weekDayMax:weekDayMax,
    powerlifter:powerlifter, varietyDayMax:varietyDayMax, bestWorkoutVolume:bestWorkoutVolume,
    stretchCount:stretchCount, feedbackCount:feedbackCount
  };
}
function getWeek(d){ var onejan=new Date(d.getFullYear(),0,1); return Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7); }
function lastEarnedBadge(){ var e=BADGES.filter(function(b){return badgeRec(b.id);}); if(!e.length) return null; return e.sort(function(a,b){return (badgeRec(b.id).date||"").localeCompare(badgeRec(a.id).date||"");})[0]; }
function themeRGB(){
  return ({ pink:"236,72,153", rose:"244,63,110", berry:"192,38,163", purple:"123,94,167", green:"22,143,113", blue:"48,111,190" })[S.theme] || "236,72,153";
}

ROUTES.settings = { tab:"profile", render:function(){
  var themeColors = { pink:"#EC4899", rose:"#F43F6E", berry:"#C026A3", purple:"#7B5EA7", green:"#168F71", blue:"#306FBE" };
  return '<div class="screen">'+topbar("Settings")+'<div class="profile-name-card"><img src="'+selectedAvatarImage()+'" alt=""><div class="field grow"><span>Your name</span><input id="set-name" value="'+esc(S.profile.name)+'" autocomplete="name"></div></div><div class="label">Theme</div><div class="swatches">'+["pink","rose","berry","purple","green","blue"].map(function(t){return '<button class="swatch '+(S.theme===t?"sel":"")+'" data-act="set-theme" data-theme="'+t+'" style="background:'+themeColors[t]+'" aria-label="'+cap(t)+' theme"></button>';}).join("")+'</div><div class="label">Preferences</div><div class="card pad">'+settingRow("weight","Increments & Defaults","Starting values and picker steps","defaults")+settingRow("dumbbell","Manage Equipment","Favorites and hidden machines","manageEquipment")+settingRow("trophy","Badge Library","Earned and locked badges","badgeLibrary")+settingRow("download","Backup & Restore","Export or import local data","backup")+settingRow("user","Avatar","Choose from the 8 finalized portraits","avatar")+'</div><div class="label">Smart Behavior</div><div class="card pad"><div class="setting-row"><span class="set-icon">'+icon("refresh")+'</span><div class="grow"><div class="row-title">Use last logged values</div><div class="row-sub">Pre-fill from your last session.</div></div><button class="switch '+(S.defaults.useLast?"on":"")+'" data-act="toggle-pref" data-key="useLast" aria-label="Use last logged values"></button></div></div></div>';
}, after:function(){ var n=document.getElementById("set-name"); if(n) n.addEventListener("input",function(){S.profile.name=n.value.trim()||"Atiya"; save();}); }};
function settingRow(ic,title,sub,name){ return '<button class="setting-row" data-act="goto" data-name="'+name+'"><span class="set-icon">'+icon(ic)+'</span><span class="grow"><span class="row-title">'+esc(title)+'</span><span class="row-sub" style="display:block">'+esc(sub)+'</span></span>'+icon("chevronRight")+'</button>'; }
ROUTES.defaults = { tab:"home", render:function(){
  var d=S.defaults;
  return '<div class="screen">'+topbar("Increments & Defaults")+'<p class="meta mb14">Choose how Add Set pickers behave for new exercises and cardio.</p><div class="card tint pad"><div class="tip-label">Add Set preview</div><div class="stat-row mt10"><div class="stat-tile"><div class="k">Weight lb</div><div class="v">'+d.firstWeight+'</div></div><div class="stat-tile"><div class="k">Reps</div><div class="v">'+d.firstReps+'</div></div><div class="stat-tile"><div class="k">Sets</div><div class="v">'+d.firstSets+'</div></div></div></div><div class="label">Strength defaults</div><div class="card pad">'+stepSetting("First-time weight","firstWeight",d.firstWeight,5," lb")+stepSetting("First-time reps","firstReps",d.firstReps,1,"")+stepSetting("Target sets","firstSets",d.firstSets,1,"")+stepSetting("Weight increment","weightInc",d.weightInc,5," lb")+stepSetting("Rep increment","repInc",d.repInc,1,"")+'</div><div class="label">Cardio defaults</div><div class="card pad">'+stepSetting("First-time minutes","firstCardioMin",d.firstCardioMin,5," min")+stepSetting("Minute increment","cardioInc",d.cardioInc,1," min")+'</div><button class="btn primary mt18" data-act="save-defaults">Save Defaults</button></div>';
}};
function stepSetting(label,key,val,step,unit){ return '<div class="setting-row"><div class="grow"><div class="row-title">'+label+'</div></div><button class="chip" data-act="pref-step" data-key="'+key+'" data-step="-'+step+'">-</button><strong style="min-width:56px;text-align:center">'+val+unit+'</strong><button class="chip" data-act="pref-step" data-key="'+key+'" data-step="'+step+'">+</button></div>'; }
ROUTES.manageEquipment = { tab:"home", render:function(){
  return '<div class="screen">'+topbar("Manage Equipment")+'<div class="search mb12">'+icon("search")+'<input id="mg-search" placeholder="Search equipment..." value="'+esc(manageState.q)+'"></div><div class="tabs"><button class="chip '+(manageState.filter==="all"?"active":"")+'" data-act="mg-filter" data-filter="all">All</button><button class="chip '+(manageState.filter==="favorites"?"active":"")+'" data-act="mg-filter" data-filter="favorites">Favorites</button><button class="chip '+(manageState.filter==="hidden"?"active":"")+'" data-act="mg-filter" data-filter="hidden">Hidden</button></div><div id="mg-list" class="list manage-equipment-list">'+manageList()+'</div><p class="meta center mt18">All '+EQUIPMENT.length+' exercises include artwork and guidance. Hidden machines will not appear when adding exercises.</p></div>';
}, after:function(){ var s=document.getElementById("mg-search"); if(s) s.addEventListener("input",function(){ manageState.q=s.value; document.getElementById("mg-list").innerHTML=manageList(); }); }};
function manageList(){
  var q=manageState.q.toLowerCase();
  return EQUIPMENT.filter(function(e){ if(manageState.filter==="favorites"&&!e.favorite)return false; if(manageState.filter==="hidden"&&!e.hidden)return false; if(q&&e.name.toLowerCase().indexOf(q)<0)return false; return true; }).sort(function(a,b){return a.name.localeCompare(b.name);}).map(function(e){ return '<div class="list-row" style="'+(e.hidden?'opacity:.7;background:#FAF9FC':'')+'"><div class="thumb md"><img src="'+e.img+'" alt="" style="'+(e.hidden?'filter:grayscale(1)':'')+'"></div><div class="grow"><div class="row-title">'+esc(e.name)+'</div><div class="row-sub">'+esc(e.category)+'</div></div><button class="fav-btn '+(e.favorite?'on':'')+'" data-act="toggle-fav" data-id="'+e.id+'">'+(e.favorite?icon("starFilled"):icon("star"))+'</button><button class="fav-btn" data-act="toggle-hide" data-id="'+e.id+'">'+(e.hidden?icon("eyeOff"):icon("eye"))+'</button></div>'; }).join("") || '<div class="card pad center meta">No equipment here.</div>';
}
ROUTES.backup = { tab:"home", render:function(){ return '<div class="screen">'+topbar("Backup & Restore")+'<div class="card tint pad"><div class="row-title">Auto-save is on</div><div class="row-sub">Your data is saved on this device only.</div></div><button class="btn primary mt18" data-act="export-data">'+icon("download")+'Create / Export Backup</button><button class="btn soft mt10" data-act="import-data">'+icon("upload")+'Import Backup</button><input type="file" id="import-file" accept="application/json" style="display:none"><div class="label" style="color:#D24B4B">Danger zone</div><button class="btn danger" data-act="clear-data">'+icon("trash")+'Clear All Data</button></div>'; }, after:function(){ var f=document.getElementById("import-file"); if(f) f.addEventListener("change",handleImportFile); }};
ROUTES.avatar = { tab:"home", render:function(){ return '<div class="screen avatar-screen">'+topbar("Choose Your Avatar")+'<p class="meta mb14">Your selection follows you across Home, Coach Tips, and setup.</p><div class="avatar-grid">'+FINAL_AVATARS.map(function(a){ var n=+a.id.split("-")[1]; return '<button class="avatar-cell '+(n===selectedAvatarNumber()?"selected":"")+'" data-act="set-avatar" data-id="'+a.id+'"><span><img src="images/avatars/avatar-'+n+'-cutout.png" alt=""></span><b>'+esc(a.name)+'</b><small>'+(n===selectedAvatarNumber()?"Selected":"Tap to choose")+'</small></button>'; }).join("")+'</div></div>'; }};

function emptyScreen(tab,title,body,cta,act){
  return '<div class="screen"><div class="empty"><div class="empty-tile">'+icon(tab==="workout"?"dumbbell":tab==="history"?"history":"trophy")+'</div><h2>'+esc(title)+'</h2><p>'+esc(body)+'</p><button class="btn primary mt18" data-act="'+act+'">'+esc(cta)+'</button></div></div>';
}
function onboardingScreen(step){
  step = step||0;
  var cls='class="onboarding-screen onb-step-'+step+(step>=2?' setup-scroll':'')+'"';
  var progress='<div class="onb-progress">'+[1,2,3,4,5].map(function(i){return '<i class="'+(i===step?'active':'')+'"></i>';}).join("")+'</div>';
  var themeColors={pink:"#EC4899",rose:"#F43F6E",berry:"#C026A3",purple:"#7B5EA7",green:"#168F71",blue:"#306FBE"};
  var setupMachines=["leg-press","chest-press","lat-pulldown","row-machine","shoulder-press","dumbbells","treadmill","elliptical"].map(eqSafe);
  if(step===0) return '<div '+cls+'><div class="onb-block one"></div><div class="onb-block two"></div><div class="onb-copy"><span>MEET YOUR GYM GUIDE</span><h1>Start strong.<br>Stay confident.</h1><p>Coach turns every gym visit into a clear, beginner-friendly plan.</p></div><img class="onb-avatar '+avatarImgClass("onboarding")+'" src="'+selectedAvatarImage()+'" alt="Selected Coach avatar"><button class="btn primary onb-cta" data-act="onb-step" data-step="1">Build my setup '+icon("chevronRight")+'</button></div>';
  if(step===1) return '<div '+cls+'>'+progress+'<section class="onb-guide"><img class="'+avatarImgClass("tip")+'" src="'+selectedAvatarImage()+'" alt=""><div><span>COACH · STEP 1 OF 5</span><p>Let’s personalize your experience. What should I call you?</p></div></section><label class="onb-name"><span>Your first name</span><input id="onb-name" value="'+esc(firstName())+'" autocomplete="given-name"></label><div class="onb-feature-row"><span>'+icon("dumbbell")+'</span><div><b>I’ll guide each workout</b><small>Clear machines, sets, and form tips</small></div></div><div class="onb-feature-row"><span>'+icon("chart")+'</span><div><b>I’ll remember your progress</b><small>Weights, sessions, and milestones</small></div></div><button class="btn primary onb-cta" data-act="onb-step" data-step="2">Choose your Coach '+icon("chevronRight")+'</button></div>';
  if(step===2) return '<div '+cls+'>'+progress+'<section class="onb-guide compact"><img class="'+avatarImgClass("tip")+'" src="'+selectedAvatarImage()+'" alt=""><div><span>COACH · STEP 2 OF 5</span><p>Choose who you want beside you. You can change your Coach anytime.</p></div></section><div class="onb-avatar-strip">'+FINAL_AVATARS.map(function(a){var n=+a.id.split("-")[1];return '<button class="'+(n===selectedAvatarNumber()?"selected":"")+'" data-act="set-avatar" data-id="'+a.id+'"><img src="images/avatars/avatar-'+n+'-cutout.png" alt="'+esc(a.name)+'"><b>'+esc(a.name)+'</b></button>';}).join("")+'</div><button class="btn primary onb-cta" data-act="onb-step" data-step="3">Choose a theme '+icon("chevronRight")+'</button></div>';
  if(step===3) return '<div '+cls+'>'+progress+'<section class="onb-guide compact"><img class="'+avatarImgClass("tip")+'" src="'+selectedAvatarImage()+'" alt=""><div><span>COACH · STEP 3 OF 5</span><p>Pick a color that feels like you. This changes accents, buttons, and highlights.</p></div></section><div class="onb-theme-grid">'+Object.keys(themeColors).map(function(t){return '<button class="onb-theme '+(S.theme===t?'selected':'')+'" data-act="onb-theme" data-theme="'+t+'"><i style="background:'+themeColors[t]+'"></i><b>'+cap(t)+'</b><span>'+(S.theme===t?'Selected':'Choose')+'</span></button>';}).join("")+'</div><button class="btn primary onb-cta" data-act="onb-step" data-step="4">Favorite machines '+icon("chevronRight")+'</button></div>';
  if(step===4) return '<div '+cls+'>'+progress+'<section class="onb-guide compact"><img class="'+avatarImgClass("tip")+'" src="'+selectedAvatarImage()+'" alt=""><div><span>COACH · STEP 4 OF 5</span><p>Tap the machines you use most. I’ll keep them easy to find.</p></div></section><div class="onb-favorites-grid">'+setupMachines.map(function(e){var chosen=S.fav.indexOf(e.id)>=0;return '<button class="onb-machine '+(chosen?'selected':'')+'" data-act="onb-fav" data-id="'+e.id+'"><span><img src="'+e.img+'" alt=""></span><b>'+esc(e.name)+'</b><small>'+(chosen?'★ Favorite':'Tap to favorite')+'</small></button>';}).join("")+'</div><button class="btn primary onb-cta" data-act="onb-step" data-step="5">Set workout defaults '+icon("chevronRight")+'</button></div>';
  return '<div '+cls+'>'+progress+'<section class="onb-guide compact"><img class="'+avatarImgClass("tip")+'" src="'+selectedAvatarImage()+'" alt=""><div><span>COACH · STEP 5 OF 5</span><p>Set the starting values I should use whenever you add a new exercise.</p></div></section><div class="onb-defaults"><h3>Strength</h3>'+onbDefaultRow("Starting weight","firstWeight",S.defaults.firstWeight,5," lb")+onbDefaultRow("Reps per set","firstReps",S.defaults.firstReps,1,"")+onbDefaultRow("Target sets","firstSets",S.defaults.firstSets,1,"")+onbDefaultRow("Weight jump","weightInc",S.defaults.weightInc,5," lb")+'<h3>Cardio</h3>'+onbDefaultRow("Starting time","firstCardioMin",S.defaults.firstCardioMin,5," min")+'</div><p class="onb-default-note">These become the default values for every new exercise. You can edit them anytime in Settings.</p><button class="btn primary onb-cta" data-act="finish-onboarding">Finish setup '+icon("chevronRight")+'</button></div>';
}
function onbDefaultRow(label,key,val,step,unit){ return '<div class="onb-default-row"><span>'+label+'</span><div><button data-act="onb-default-step" data-key="'+key+'" data-step="-'+step+'" aria-label="Decrease '+label+'">−</button><b>'+val+unit+'</b><button data-act="onb-default-step" data-key="'+key+'" data-step="'+step+'" aria-label="Increase '+label+'">+</button></div></div>'; }

/* State-changing actions */
function startWorkout(name,planId,ids){
  S.active = { id:uid(), name:name||"Quick Workout", planId:planId||null, startedAt:Date.now(), exercises:(ids||[]).map(function(id){ return {eqId:id,done:false,sets:[],difficulty:null}; }) };
  save();
}
function addMachine(id){
  if(!S.active) startWorkout("Quick Workout");
  if(S.active.exercises.some(function(x){return x.eqId===id;})){ toast("Already in workout"); return; }
  S.active.exercises.push({ eqId:id, done:false, sets:[], difficulty:null });
  save(); go("activeWorkout",{}, {push:false}); toast("Added to workout");
}
function saveSet(){
  var x=S.active.exercises[sheet.exIdx], e=eqSafe(x.eqId), set;
  if(sheet.cardio){
    var di=document.getElementById("cardio-dist"); if(di) sheet.distance=parseFloat(di.value)||0;
    set={minutes:sheet.minutes,distance:sheet.distance,intensity:sheet.intensity};
  } else set={weight:sheet.weight,reps:sheet.reps};
  x.sets.push(set); recordLast(e,set); save(); closeLayer(); render(); toast("Set added",function(){ x.sets.pop(); save(); render(); });
}
function finishExercise(diff){
  var x=S.active.exercises[pendingDiff.exIdx], e=eqSafe(x.eqId);
  x.done=true; x.difficulty=diff; if(diff) recordLast(e,{},diff);
  save(); closeLayer(); render();
  if(!S.active.exercises.some(function(y){return !y.done;})) toast("All exercises done. Finish when ready.");
}
function saveWorkout(){
  var a=S.active, done=a.exercises.filter(function(x){return x.sets.length;});
  S.history.push({ id:a.id, name:a.name, date:todayISO(), exercises:done.map(function(x){return {eqId:x.eqId,sets:x.sets.slice(),difficulty:x.difficulty};}), note:summaryNote(done) });
  S.active=null; save(); closeLayer(); var newly=checkBadges(); go("home",{}, {push:false});
  if(newly.length) openBadgeCelebration(newly); else toast("Workout saved");
}
function checkBadges(){
  var stats=badgeStats(), newly=[];
  BADGES.forEach(function(b){ var st=badgeLevel(b,stats), rec=badgeRec(b.id), have=rec?rec.level:0; if(st.level>have){ S.badges[b.id]={level:st.level,date:todayISO()}; newly.push(b); } });
  if(newly.length) save();
  return newly;
}
function openBadgeCelebration(newly,index){
  if(newly) badgeCelebration={badges:newly.slice(),index:index||0};
  if(!badgeCelebration||!badgeCelebration.badges.length) return;
  var badges=badgeCelebration.badges, at=badgeCelebration.index, b=badges[at], st=badgeLevel(b), hasNext=at<badges.length-1;
  var bits=Array.from({length:34},function(_,i){return '<i style="--x:'+((i*37)%100)+'%;--r:'+((i*71)%260-130)+'deg;--d:'+((i%7)*.07)+'s;--c:'+((i%4)+1)+'"></i>';}).join("");
  openLayer('<div class="celebration-layer"><div class="scrim" data-act="'+(hasNext?'noop':'close-layer')+'"></div><div class="confetti" aria-hidden="true">'+bits+'</div><section class="badge-celebration" role="dialog" aria-modal="true" aria-labelledby="badge-earned-title"><div class="celebration-kicker">BADGE EARNED'+(badges.length>1?' · '+(at+1)+' OF '+badges.length:'')+'</div>'+badgePng(b,"lg",st)+'<h2 id="badge-earned-title">'+esc(b.name)+'</h2><p>'+esc(b.blurb)+'</p><div class="celebration-tier">'+(st.tiered?cap(st.medal)+" tier":"New achievement")+'</div><button class="btn primary" data-act="'+(hasNext?'next-badge':'close-layer')+'">'+(hasNext?'Next':'Celebrate')+'</button><button class="btn ghost" data-act="badge-detail" data-id="'+b.id+'">View badge details</button></section></div>');
}

var ACTIONS = {
  tab:function(el,d){ goTab(d.tab); },
  back:function(){ back(); },
  goto:function(el,d){ go(d.name||d.id, d.id && d.name?{id:d.id}:{}); },
  "start-workout":function(){ startWorkout("Quick Workout"); go("addExercise"); },
  "add-exercise":function(){ go("addExercise"); },
  "clear-search":function(){ addState.q=""; render(); },
  "browse-all":function(){ addState={q:"",cat:"all",favOnly:false}; render(); },
  cat:function(el,d){ addState.favOnly=d.cat==="favorites"; if(!addState.favOnly) addState.cat=d.cat; render(); },
  "add-machine":function(el,d){ addMachine(d.id); },
  "save-progress":function(){ save(); toast("Workout progress saved"); },
  "toggle-fav":function(el,d){ var i=S.fav.indexOf(d.id); if(i>=0)S.fav.splice(i,1); else S.fav.push(d.id); applyEquipmentFlags(); save(); render(); },
  "toggle-hide":function(el,d){ var i=S.hidden.indexOf(d.id); if(i>=0)S.hidden.splice(i,1); else S.hidden.push(d.id); applyEquipmentFlags(); save(); var m=document.getElementById("mg-list"); if(m)m.innerHTML=manageList(); },
  "add-set":function(el,d){ openAddSet(+d.i); },
  "remove-set":function(el,d){ var x=S.active&&S.active.exercises[+d.i]; if(x&&x.sets[+d.set]){ x.sets.splice(+d.set,1); save(); render(); toast("Set removed"); } },
  "picker-step":function(el,d){ var inc=d.key==="weight"?S.defaults.weightInc:d.key==="reps"?S.defaults.repInc:S.defaults.cardioInc; sheet[d.key]=Math.max(d.key==="reps"?1:0, sheet[d.key]+(+d.step*inc)); openAddSet(sheet.exIdx); },
  "sheet-intensity":function(el,d){ sheet.intensity=d.v; openAddSet(sheet.exIdx); },
  "save-set":function(){ saveSet(); },
  "done-exercise":function(el,d){ openDifficulty(+d.i); },
  "select-diff":function(el,d){ pendingDiff.value=d.d; document.querySelectorAll(".face-opt").forEach(function(x){x.classList.remove("sel");}); el.classList.add("sel"); },
  "save-diff":function(){ finishExercise(pendingDiff.value); },
  "skip-diff":function(){ finishExercise(null); },
  "finish-workout":function(){ if(!S.active||!S.active.exercises.some(function(x){return x.sets.length;})){ toast("Log at least one set first"); return; } openSummary(); },
  "save-workout":function(){ saveWorkout(); },
  "machine-detail":function(el,d){ go("machineDetail",{id:d.id}); },
  "exercise-history":function(el,d){ historyRange="4W"; historyPoint=null; historyVisible=3; go("exerciseHistory",{id:d.id}); },
  "history-range":function(el,d){ historyRange=d.range; historyPoint=null; render(); },
  "history-point":function(el,d){ historyPoint=+d.point; render(); },
  "history-load":function(){ historyVisible+=5; render(); },
  "toggle-menu":function(el,d){ openMenu = openMenu===+d.i ? null : +d.i; render(); },
  "duplicate-exercise":function(el,d){ var x=copy(S.active.exercises[+d.i]); S.active.exercises.splice(+d.i+1,0,x); openMenu=null; save(); render(); },
  "remove-exercise":function(el,d){ deletedExercise={item:S.active.exercises.splice(+d.i,1)[0], index:+d.i}; openMenu=null; save(); render(); },
  "undo-delete":function(){ if(deletedExercise){ S.active.exercises.splice(deletedExercise.index,0,deletedExercise.item); deletedExercise=null; save(); render(); } },
  "toggle-completed":function(){ completedOpen = !completedOpen; render(); },
  "undo-completed":function(el,d){ var x=S.active&&S.active.exercises[+d.i]; if(x){ x.done=false; x.difficulty=null; save(); render(); toast("Exercise moved to Up Next"); } },
  "make-current":function(el,d){ var x=S.active.exercises.splice(+d.i,1)[0]; S.active.exercises.unshift(x); save(); render(); },
  "close-layer":function(){ closeLayer(); },
  "new-plan":function(){ planDraft={id:null,name:"New Plan",exercises:["leg-press","chest-press"]}; go("planBuilder"); },
  "plan-detail":function(el,d){ go("planDetail",{id:d.id}); },
  "start-plan":function(el,d){ var p=S.plans.find(function(x){return x.id===d.id;}); if(p){ startWorkout(p.name,p.id,p.exercises.slice()); go("activeWorkout"); } },
  "fav-plan":function(el,d){ var p=S.plans.find(function(x){return x.id===d.id;}); if(p){ p.favorite=!p.favorite; save(); render(); } },
  "edit-plan":function(el,d){ var p=S.plans.find(function(x){return x.id===d.id;}); if(p){ planDraft={id:p.id,name:p.name,exercises:p.exercises.slice()}; go("planBuilder"); } },
  "plan-add-exercise":function(){ addState.q=""; go("planAddExercise"); },
  "builder-add-machine":function(el,d){ if(planDraft.exercises.indexOf(d.id)<0) planDraft.exercises.push(d.id); render(); },
  "builder-remove":function(el,d){ planDraft.exercises.splice(+d.i,1); render(); },
  "builder-up":function(el,d){ var i=+d.i; if(i>0){ var x=planDraft.exercises[i]; planDraft.exercises[i]=planDraft.exercises[i-1]; planDraft.exercises[i-1]=x; render(); } },
  "builder-down":function(el,d){ var i=+d.i; if(i<planDraft.exercises.length-1){ var x=planDraft.exercises[i]; planDraft.exercises[i]=planDraft.exercises[i+1]; planDraft.exercises[i+1]=x; render(); } },
  "save-plan":function(){ var name=(planDraft.name||"").trim(); if(!name){ toast("Give your plan a name"); return; } if(!planDraft.exercises.length){ toast("Add at least one exercise"); return; } if(planDraft.id){ var p=S.plans.find(function(x){return x.id===planDraft.id;}); if(p){ p.name=name; p.exercises=planDraft.exercises.slice(); } } else { S.plans.push({id:uid(),name:name,favorite:false,exercises:planDraft.exercises.slice()}); } planDraft=null; save(); var newly=checkBadges(); go("browsePlans"); if(newly.length) openBadgeCelebration(newly); else toast("Plan saved"); },
  "open-workout":function(el,d){ go("pastWorkout",{id:d.id}); },
  "cal-prev":function(){ if(!calCursor){var n=new Date(); calCursor={y:n.getFullYear(),m:n.getMonth()};} calCursor.m--; if(calCursor.m<0){calCursor.m=11;calCursor.y--;} render(); },
  "cal-next":function(){ if(!calCursor){var n=new Date(); calCursor={y:n.getFullYear(),m:n.getMonth()};} calCursor.m++; if(calCursor.m>11){calCursor.m=0;calCursor.y++;} render(); },
  noop:function(){},
  "badge-tab":function(el,d){ badgeTab=d.tabname; render(); },
  "badge-detail":function(el,d){ openBadgeDetail(d.id); },
  "next-badge":function(){ if(badgeCelebration&&badgeCelebration.index<badgeCelebration.badges.length-1){ badgeCelebration.index++; openBadgeCelebration(); } },
  "set-theme":function(el,d){ S.theme=d.theme; document.body.setAttribute("data-theme",S.theme); save(); render(); },
  "toggle-pref":function(el,d){ S.defaults[d.key]=!S.defaults[d.key]; save(); render(); },
  "pref-step":function(el,d){ S.defaults[d.key]=Math.max(d.key==="firstReps"||d.key==="firstSets"||d.key==="repInc"?1:0,(S.defaults[d.key]||0)+(+d.step)); save(); render(); },
  "save-defaults":function(){ save(); toast("Defaults saved"); back(); },
  "mg-filter":function(el,d){ manageState.filter=d.filter; render(); },
  "export-data":function(){ exportData(); },
  "import-data":function(){ var f=document.getElementById("import-file"); if(f) f.click(); },
  "clear-data":function(){ if(confirm("Clear all local Coach data?")){ localStorage.removeItem(KEY); S=copy(DEFAULT_STATE); applyEquipmentFlags(); render(); } },
  "set-avatar":function(el,d){ var onb=document.querySelector(".onboarding-screen"); S.avatar.id=d.id; save(); if(onb){ var m=onb.className.match(/onb-step-(\d)/); screenEl.innerHTML=onboardingScreen(m?+m[1]:2); } else { render(); if(route.name!=="home") toast("Avatar saved"); } },
  "onb-step":function(el,d){ var n=document.getElementById("onb-name"); if(n){S.profile.name=n.value.trim()||"Atiya";save();} screenEl.innerHTML=onboardingScreen(+d.step); },
  "onb-theme":function(el,d){ S.theme=d.theme; document.body.setAttribute("data-theme",S.theme); save(); screenEl.innerHTML=onboardingScreen(3); },
  "onb-fav":function(el,d){ var i=S.fav.indexOf(d.id); if(i>=0) S.fav.splice(i,1); else S.fav.push(d.id); applyEquipmentFlags(); save(); screenEl.innerHTML=onboardingScreen(4); },
  "onb-default-step":function(el,d){ S.defaults[d.key]=Math.max(d.key==="firstReps"||d.key==="firstSets"||d.key==="repInc"?1:0,(S.defaults[d.key]||0)+(+d.step)); save(); screenEl.innerHTML=onboardingScreen(5); },
  "finish-onboarding":function(){ S.setupDone=true; save(); go("home",{}, {push:false}); },
  "finish-setup-later":function(){ S.setupDone=true; save(); go("home",{}, {push:false}); },
  undo:function(){ if(undoFn){ undoFn(); undoFn=null; toastEl.classList.remove("show"); } }
};
function openBadgeDetail(id){
  var b=BADGES.find(function(x){return x.id===id;}), stats=badgeStats(), st=badgeLevel(b,stats), rec=badgeRec(id);
  var cap=function(m){return m.charAt(0).toUpperCase()+m.slice(1);};
  var tierRows = st.tiered ? '<div class="card pad mt12">'+b.tiers.map(function(t,i){var done=st.level>=i+1; return '<div class="row between'+(i?" mt8":"")+'"><div class="row gap8"><span class="diff-pill">'+cap(t.medal)+'</span><span class="row-sub">'+esc(t.label)+'</span></div><div class="row-title" style="color:'+(done?"var(--primary)":"var(--muted)")+'">'+(done?"✓ ":"")+Math.round(t.goal).toLocaleString()+'</div></div>';}).join("")+'</div>' : '';
  var goalNow = st.next ? st.next.goal : b.tiers[b.tiers.length-1].goal;
  var statusLine = st.got ? (st.tiered ? (st.tier.label+(st.next?(" · next "+Math.round(st.next.goal).toLocaleString()):" · Max level")) : ("Earned "+relDay(rec.date))) : (Math.round(st.val).toLocaleString()+" of "+Math.round(goalNow).toLocaleString());
  var chip = st.got ? (st.tiered ? cap(st.medal)+" tier" : "Earned") : "Locked";
  openLayer('<div class="sheet-screen"><div class="scrim" data-act="close-layer"></div><div class="bottom-sheet center"><div class="grab"></div>'+medalArt(b,"lg",st)+'<h2 style="font-size:24px;font-weight:800;margin-top:10px">'+esc(b.name)+'</h2><div class="chip soft mt8">'+esc(chip)+'</div><p class="meta mt12">'+esc(b.blurb)+'</p><div class="card pad mt16"><div class="row between mb8"><div class="row-title">Progress</div><div class="row-title" style="color:var(--primary)">'+esc(statusLine)+'</div></div><div class="pbar"><i style="width:'+st.pct+'%"></i></div></div>'+tierRows+'<div class="card tint pad mt14"><div class="tip-label">How to earn it</div><div class="tip-copy">'+esc(b.how)+'</div></div><div class="card tint pad mt10"><div class="tip-label">Why it matters</div><div class="tip-copy">'+esc(b.why)+'</div></div><button class="btn primary mt18" data-act="close-layer">Keep Exploring</button></div></div>');
}
function exportData(){
  var blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
  var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="coach-backup-"+todayISO()+".json"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
  S.backupDate=todayISO(); save();
}
function handleImportFile(ev){
  var file=ev.target.files[0]; if(!file) return;
  var reader=new FileReader();
  reader.onload=function(){ try{ var data=JSON.parse(reader.result); Object.keys(DEFAULT_STATE).forEach(function(k){ if(data[k]!=null) S[k]=data[k]; }); S.defaults=Object.assign({},DEFAULT_STATE.defaults,data.defaults||{}); applyEquipmentFlags(); save(); document.body.setAttribute("data-theme",S.theme); go("home"); toast("Backup restored"); }catch(e){ toast("Could not read that file"); } };
  reader.readAsText(file); ev.target.value="";
}

document.addEventListener("click",function(ev){
  var t=ev.target.closest("[data-act]");
  if(!t) return;
  var fn=ACTIONS[t.getAttribute("data-act")];
  if(fn){ ev.preventDefault(); fn(t,t.dataset); }
});

function seedDemo(){
  S.setupDone = true;
  S.theme = "pink";
  S.profile = { name:"Atiya" };
  var iso = function(daysAgo){ return new Date(Date.now()-daysAgo*86400000).toISOString().slice(0,10); };
  S.history = [
    { id:uid(), name:"Full Body Beginner", date:iso(6), note:"", exercises:[
      { eqId:"leg-press", difficulty:"good", sets:[{weight:90,reps:10},{weight:90,reps:10},{weight:100,reps:8}] },
      { eqId:"chest-press", difficulty:"easy", sets:[{weight:40,reps:12},{weight:45,reps:10}] },
      { eqId:"lat-pulldown", difficulty:"good", sets:[{weight:55,reps:10},{weight:55,reps:10}] },
      { eqId:"treadmill", difficulty:"good", sets:[{minutes:20,distance:1.4,intensity:"Moderate"}] }
    ]},
    { id:uid(), name:"Lower Body", date:iso(3), note:"", exercises:[
      { eqId:"leg-press", difficulty:"good", sets:[{weight:100,reps:10},{weight:110,reps:8}] },
      { eqId:"leg-extension", difficulty:"hard", sets:[{weight:50,reps:12},{weight:50,reps:10}] },
      { eqId:"glute-kickback", difficulty:"good", sets:[{weight:30,reps:12}] },
      { eqId:"calf-raise", difficulty:"easy", sets:[{weight:70,reps:15}] }
    ]},
    { id:uid(), name:"Upper Body", date:iso(1), note:"", exercises:[
      { eqId:"chest-press", difficulty:"good", sets:[{weight:45,reps:10},{weight:50,reps:8}] },
      { eqId:"row-machine", difficulty:"good", sets:[{weight:60,reps:10},{weight:60,reps:10}] },
      { eqId:"shoulder-press", difficulty:"hard", sets:[{weight:30,reps:10}] },
      { eqId:"bicep-curl", difficulty:"good", sets:[{weight:25,reps:12}] }
    ]}
  ];
  S.history.forEach(function(w){ w.exercises.forEach(function(x){ var e=eqById(x.eqId); if(e){ recordLast(e, x.sets[x.sets.length-1]||{}, x.difficulty); } }); });
  S.active = { id:uid(), name:"Full Body Beginner", planId:null, startedAt:Date.now(), exercises:[
    { eqId:"leg-press", done:false, difficulty:null, sets:[{weight:100,reps:10}] },
    { eqId:"lat-pulldown", done:false, difficulty:null, sets:[] },
    { eqId:"shoulder-press", done:false, difficulty:null, sets:[] },
    { eqId:"treadmill", done:false, difficulty:null, sets:[] }
  ]};
  try{ checkBadges(); }catch(e){}
  save();
}
function applyHash(){
  var h = decodeURIComponent((location.hash||"").replace(/^#\/?/,"")).trim();
  if(!h) return false;
  var parts = h.split("/"), name = parts[0], arg = parts[1];
  if(name==="onb"){ render(); navEl.style.display="none"; navEl.innerHTML=""; screenEl.innerHTML = onboardingScreen(+(arg||0)); return true; }
  if(name==="modal"){
    if(!S.active) startWorkout("Full Body Beginner", null, ["leg-press","lat-pulldown","shoulder-press"]);
    go("activeWorkout",{},{push:false});
    if(arg==="addSet") openAddSet(0);
    else if(arg==="difficulty"){ if(!S.active.exercises[0].sets.length) S.active.exercises[0].sets.push({weight:100,reps:10}); openDifficulty(0); }
    else if(arg==="summary") openSummary();
    else if(arg==="badge") openBadgeDetail(lastEarnedBadge()?lastEarnedBadge().id:BADGES[0].id);
    return true;
  }
  if((name==="planAddExercise"||name==="planBuilder") && !planDraft) planDraft = { id:null, name:"New Plan", exercises:["leg-press","chest-press","lat-pulldown"] };
  var params = {};
  if(name==="planDetail") params = { id:(S.plans[0]||{}).id };
  else if(name==="pastWorkout") params = { id:(S.history[S.history.length-1]||{}).id };
  else if(name==="machineDetail") params = { id:arg||"leg-press" };
  else if(name==="exerciseHistory") params = { id:arg||"leg-press" };
  if(ROUTES[name]){ go(name, params, {push:false}); return true; }
  return false;
}
function boot(){
  applyEquipmentFlags();
  ensurePlans();
  if(S.theme==="coral"||S.theme==="blush") S.theme="green";
  if(String(S.avatar.id||"").indexOf("avatar-")!==0) S.avatar.id="avatar-"+selectedAvatarNumber();
  save();
  document.body.setAttribute("data-theme",S.theme||"pink");
  var sb=document.getElementById("sb-time");
  function tick(){ if(sb) sb.textContent=new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}); }
  tick(); setInterval(tick,30000);
  if(!applyHash()) render();
  window.addEventListener("hashchange", function(){ applyHash(); });
  window.addEventListener("message", function(ev){
    var d = ev.data || {};
    if(d.coachTheme){ S.theme = d.coachTheme; document.body.setAttribute("data-theme", S.theme); save(); render(); }
  });
}
boot();
})();
