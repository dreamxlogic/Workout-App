/* ============================================================================
   app.js — Coach (Beginner Gym Tracker) controller
   ----------------------------------------------------------------------------
   Sections:
     1.  Small helpers
     2.  State + localStorage persistence
     3.  Equipment helpers / defaults / progression logic
     4.  Render helpers (icons, avatars, coach)
     5.  Router + bottom nav
     6.  Screens (Home, Active Workout, Add Exercise, Plans, Plan Builder,
         History, Workout Detail, Calendar, Muscle Map, Profile, Settings,
         Theme, Avatar, Defaults, Manage Equipment, Backup, Badges)
     7.  Overlays (Add Set sheet, Exercise Complete, Finish Summary,
         Machine Help, Machine History, Badge Earned, 3-dot menu)
     8.  Onboarding
     9.  Badges engine
     10. Action dispatch + boot
   ========================================================================== */
(function () {
"use strict";

/* ============================ 1. HELPERS ================================= */
var screenEl = document.getElementById("screen");
var navEl    = document.getElementById("nav");
var layerEl  = document.getElementById("layer");
var onbHost  = document.getElementById("onb-host");
var toastEl  = document.getElementById("toast");

function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function icon(name){ return '<span class="icon">' + ICON(name) + '</span>'; }
function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
function plural(n,w){ return n + " " + w + (n===1?"":"s"); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function dayKey(d){ return new Date(d).toISOString().slice(0,10); }
function fmtDate(iso){
  var d = new Date(iso + (iso.length===10?"T12:00:00":""));
  return d.toLocaleDateString(undefined,{ month:"short", day:"numeric" });
}
function relDay(iso){
  var t = todayISO();
  if (iso === t) return "Today";
  var y = new Date(Date.now()-86400000).toISOString().slice(0,10);
  if (iso === y) return "Yesterday";
  return fmtDate(iso);
}

/* ============================ 2. STATE ================================== */
var KEY = "coach.v1";
var DEFAULT_STATE = {
  profile: { name: "" },
  setupDone: false,
  avatar: { id: "woman-ponytail", skin: "rgb(128,87,64)" },
  theme: "purple",
  defaults: {
    firstWeight: 40, firstReps: 10, firstSets: 3, firstCardioMin: 30,
    weightInc: 10, repInc: 1, cardioInc: 5, useLast: true
  },
  fav: ["leg-press","chest-press","dumbbells","treadmill"],
  hidden: [],
  lastUsed: {},          /* eqId -> {weight,reps,sets,minutes,distance,intensity, diffs:[]} */
  active: null,          /* {id,name,planId,startedAt,exercises:[{eqId,done,sets:[],difficulty}]} */
  history: [],           /* saved workouts */
  plans: [],             /* {id,name,favorite,exercises:[eqId]} */
  badges: {},            /* id -> earnedISO */
  backupDate: null,
  seenMuscleHelp: false
};

var S = load();
function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    var p = JSON.parse(raw);
    /* shallow-merge to tolerate older saves */
    var s = JSON.parse(JSON.stringify(DEFAULT_STATE));
    Object.keys(p).forEach(function(k){ s[k] = p[k]; });
    s.defaults = Object.assign({}, DEFAULT_STATE.defaults, p.defaults || {});
    return s;
  }catch(e){ return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

/* apply favorite/hidden flags from state onto EQUIPMENT objects */
function applyEquipmentFlags(){
  EQUIPMENT.forEach(function(e){
    e.favorite = S.fav.indexOf(e.id) >= 0;
    e.hidden   = S.hidden.indexOf(e.id) >= 0;
  });
}

/* ============================ 3. EQUIPMENT HELPERS ====================== */
function eqById(id){ return EQUIPMENT.find(function(e){ return e.id === id; }); }
function musclesLabel(e){ return e.muscles.map(function(m){ return MUSCLE_NAMES[m]||m; }).slice(0,3).join(" · "); }

/* resolve the starting values for logging an exercise */
function resolveDefaults(e){
  var last = S.lastUsed[e.id];
  if(e.type === "cardio"){
    if(S.defaults.useLast && last && last.minutes!=null)
      return { minutes:last.minutes, distance:last.distance||0, intensity:last.intensity||"Moderate" };
    return { minutes: e.defaults.minutes || S.defaults.firstCardioMin,
             distance: e.defaults.distance || 0,
             intensity: e.defaults.intensity || "Moderate" };
  }
  if(S.defaults.useLast && last && last.weight!=null)
    return { weight:last.weight, reps:last.reps, sets:e.defaults.sets||S.defaults.firstSets };
  return { weight: (e.defaults.weight!=null?e.defaults.weight:S.defaults.firstWeight),
           reps:   (e.defaults.reps!=null?e.defaults.reps:S.defaults.firstReps),
           sets:   (e.defaults.sets!=null?e.defaults.sets:S.defaults.firstSets) };
}

/* gentle, beginner-safe progression suggestion (internal logic) */
function progressionSuggestion(e){
  var last = S.lastUsed[e.id];
  if(!last || !last.diffs || !last.diffs.length) return null;
  var d = last.diffs.slice(-2);
  var w = last.weight, inc = S.defaults.weightInc, repInc = S.defaults.repInc;
  var recent = d[d.length-1];
  var twoEasy = d.length===2 && d.every(function(x){ return x==="easy"; });
  var twoTooEasy = d.length===2 && d.every(function(x){ return x==="too-easy"; });
  if(e.type === "cardio"){
    if(recent==="too-hard") return "Ease off a little next time and keep it steady.";
    if(twoTooEasy) return "Add a few minutes or a little intensity next time.";
    if(twoEasy) return "Try a touch more time or pace if it feels right.";
    return "Keep this pace and stay consistent.";
  }
  if(recent==="too-hard") return "Consider lowering to " + Math.max(0, w-inc) + " lb next time and focus on form.";
  if(recent==="hard") return "Stay at " + w + " lb next time and nail your form.";
  if(twoTooEasy) return "Try " + (w+inc) + " lb next time if that feels right.";
  if(twoEasy) return "Maybe nudge up to " + (w+Math.round(inc/2||5)) + " lb or +" + repInc + " rep next time.";
  if(recent==="good") return "Great zone — keep " + w + " lb next time.";
  return null;
}

function recordLast(e, payload, difficulty){
  var l = S.lastUsed[e.id] || {};
  Object.assign(l, payload);
  if(difficulty){ l.diffs = (l.diffs||[]).concat(difficulty).slice(-4); }
  S.lastUsed[e.id] = l;
}

/* ============================ 4. RENDER HELPERS ========================= */
function avatarHTML(sizeClass){
  var sh = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#7B5EA7";
  return '<span class="avatar-bubble '+(sizeClass||"")+'">'+ AVATAR_SVG(S.avatar.id, S.avatar.skin, sh) +'</span>';
}
function coachBust(){ return '<img src="images/coach/coach-bust.png" alt="Coach" />'; }
/* coach hero image (head-to-shoulders). Swap this file or wire to selected avatar later. */
function coachHero(){ return "images/coach/coach-hero.png"; }
function greetingWord(){
  var h = new Date().getHours();
  return h<12 ? "Good morning" : h<18 ? "Good afternoon" : "Good evening";
}
function firstName(){ return (S.profile.name||"there").split(" ")[0]; }

var COACH_TIPS = [
  "Focus on form, not speed — good reps build real strength.",
  "Breathe out as you push, in as you return.",
  "Rest 60–90 seconds between sets. It's part of the work.",
  "If your form breaks down, it's okay to go lighter.",
  "Warm up with 5 easy minutes before you load up.",
  "Slow and controlled beats fast and sloppy every time.",
  "Hydrate — a few sips between sets keeps you sharp.",
  "Consistency beats intensity. Showing up is the win."
];
function tipOfDay(){ var d = new Date().getDate(); return COACH_TIPS[d % COACH_TIPS.length]; }

/* ============================ 5. ROUTER + NAV ========================== */
var TABS = [
  { id:"home",    label:"Home",    icon:"home"     },
  { id:"workout", label:"Workout", icon:"workout"  },
  { id:"plans",   label:"Plans",   icon:"plans"    },
  { id:"history", label:"History", icon:"history"  },
  { id:"profile", label:"Profile", icon:"profile"  }
];
var route = { name:"home", params:{} };
var stack = [];

function renderNav(){
  var tab = ROUTES[route.name] ? ROUTES[route.name].tab : "home";
  navEl.innerHTML = TABS.map(function(t){
    return '<button class="nav-btn '+(t.id===tab?"active":"")+'" data-act="tab" data-tab="'+t.id+'">'+
      '<span class="nav-pill">'+icon(t.id===tab?t.icon+"Filled":t.icon)+'<span>'+t.label+'</span></span></button>';
  }).join("");
}

function go(name, params, opts){
  opts = opts || {};
  if(opts.push !== false && route.name) stack.push({ name:route.name, params:route.params });
  route = { name:name, params:params||{} };
  render();
}
function back(){
  var prev = stack.pop();
  if(prev){ route = prev; render(); }
  else { route = { name:"home", params:{} }; render(); }
}
function goTab(id){
  stack = [];
  var root = id==="workout" ? "workout" : id;
  route = { name:root, params:{} };
  render();
}

function render(){
  var r = ROUTES[route.name] || ROUTES.home;
  screenEl.innerHTML = r.render(route.params);
  screenEl.scrollTop = 0;
  renderNav();
  if(r.after) r.after(route.params);
}

/* header used by sub-screens */
function subHeader(title, opts){
  opts = opts || {};
  var right = opts.right || '<span class="shead-spacer"></span>';
  return '<div class="shead">'+
    '<button class="iconbtn" data-act="back" aria-label="Back">'+icon("chevronLeft")+'</button>'+
    '<h2>'+esc(title)+'</h2>'+ right +'</div>';
}

/* ============================ TOAST / UNDO ============================= */
var toastTimer=null, undoFn=null;
function toast(msg, undo){
  toastEl.innerHTML = esc(msg) + (undo? '<button data-act="undo">Undo</button>':'');
  toastEl.classList.add("show");
  undoFn = undo || null;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); undoFn=null; }, undo?4200:2200);
}

/* ============================ 6. SCREENS =============================== */
var ROUTES = {};

/* -------- HOME (inspo-matched) -------- */
ROUTES.home = { tab:"home", render: function(){
  var recent = S.history.slice(-3).reverse();
  var lastBadge = lastEarnedBadge();
  var suggestion = suggestToday();
  var html = '<div class="view">';

  html += '<section class="home-approved-hero">'+
    '<button class="home-bell" data-act="goto" data-name="settings" aria-label="Notifications">'+icon("bulb")+'<i></i></button>'+
    '<div class="home-approved-copy">'+
      '<h1>Hi '+esc(firstName())+'</h1>'+
      '<p>Small steps today,<br>stronger tomorrow.</p>'+
      '<button class="btn btn-primary home-start" data-act="start-workout">'+
        '<span class="home-play">'+icon("play")+'</span>Start Workout</button>'+
    '</div>'+
    '<span class="home-coach-halo"></span><img class="home-approved-coach" src="'+coachHero()+'" alt="Coach holding dumbbells">'+
  '</section>';

  if(S.active){
    var exCount = S.active.exercises.length;
    html += '<div class="resume-card" data-act="goto" data-name="workout">'+
      '<div class="resume-ring">'+icon("refresh")+'</div>'+
      '<div class="grow"><div style="font-weight:800">Resume Workout</div>'+
        '<div style="font-size:12.5px;opacity:.85">'+esc(S.active.name)+' · '+plural(exCount,"exercise")+'</div></div>'+
      icon("chevronRight")+'</div>';
  }

  html += '<div class="card approved-tip">'+
    '<div class="approved-tip-icon">'+icon("bulb")+'</div>'+
    '<div class="approved-tip-copy"><strong>Today\'s Coach Tip</strong>'+
      '<b>Focus on form, not speed.</b><span>'+esc(tipOfDay())+'</span></div>'+
    '<div class="approved-checklist">'+icon("plans")+'<i>'+icon("heart")+'</i></div></div>';

  html += '<div class="approved-section-head"><strong>Suggested Today</strong>'+
    '<button data-act="tab" data-tab="plans">View All <span>›</span></button></div>'+
    '<div class="approved-suggestion">'+
      '<div class="approved-suggestion-img"><img src="'+suggestion.img+'" alt=""></div>'+
      '<div class="approved-suggestion-copy"><strong>'+esc(suggestion.title)+'</strong>'+
        '<div><span>'+icon("clock")+'25 min</span><span>'+icon("dumbbell")+'Beginner</span></div>'+
        '<p>A perfect all-round routine to build strength and confidence.</p></div>'+
      '<button class="approved-arrow" data-act="start-workout" aria-label="Start suggested workout">'+icon("arrowRight")+'</button></div>';

  if(lastBadge){
    html += '<div class="badge-feature approved-badge" data-act="goto" data-name="badges" style="cursor:pointer">'+
      medalArt(lastBadge,{size:"sz-md"})+
      '<div class="bf-main"><div class="bf-label">'+icon("shield")+'Latest badge</div>'+
        '<div class="bf-title">'+esc(lastBadge.name)+'</div>'+
        '<div class="bf-sub">'+esc(lastBadge.blurb)+'</div>'+
        '<button class="bf-btn" data-act="goto" data-name="badges">'+icon("trophy")+'View All Badges</button></div></div>';
  } else {
    html += '<div class="badge-feature approved-badge" data-act="goto" data-name="badges" style="cursor:pointer">'+
      '<span class="badge-medal sz-md"><img src="images/badges/First Workout-transparent.png" alt="" class="badge-png"></span>'+
      '<div class="bf-main"><div class="bf-label">'+icon("shield")+'First badge</div>'+
        '<div class="bf-title">Not earned yet</div>'+
        '<div class="bf-sub">Finish a workout to unlock your first badge.</div>'+
        '<button class="bf-btn" data-act="goto" data-name="badges">'+icon("trophy")+'View All Badges</button></div></div>';
  }

  html += '<div class="approved-section-head"><strong>Recent Workouts</strong>'+
    (S.history.length>3?'<button data-act="tab" data-tab="history">View All <span>›</span></button>':'')+'</div>';
  if(recent.length){
    html += '<div class="approved-recent">';
    recent.forEach(function(w){ html += recentItem(w); });
    html += '</div>';
  } else {
    html += '<div class="approved-recent-empty">Your completed workouts will appear here.</div>';
  }

  html += '</div>';
  return html;
}};

/* Illustrated medal helper.
   Renders the vector medal, with an optional painted PNG layered on top:
   drop images/badges/{id}.png in later and it auto-replaces the SVG (the <img>
   removes itself if the file is missing). Zero code changes needed to swap. */
function medalArt(b, opts){
  opts = opts || {};
  var png = b.id==="first-workout"
    ? "images/badges/First Workout-transparent.png"
    : "images/badges/"+b.id+".png";
  return '<span class="badge-medal '+(opts.size||"sz-md")+(opts.locked?" locked":"")+'">'+
    '<img src="'+png+'" alt="" class="badge-png" onerror="this.remove()">'+
    BADGE_ART(b.medal, { center: BADGE_CENTER[b.id], confetti: opts.confetti }) + '</span>';
}

function recentItem(w){
  var mach = w.exercises.map(function(x){ return (eqById(x.eqId)||{}).name; }).filter(Boolean);
  var sets = w.exercises.reduce(function(a,x){ return a + (x.sets?x.sets.length:0); },0);
  return '<div class="list-item" data-act="open-workout" data-id="'+w.id+'">'+
    '<div class="li-ico">'+icon("dumbbell")+'</div>'+
    '<div class="li-main"><div class="li-title">'+esc(w.name)+'</div>'+
      '<div class="li-sub">'+relDay(w.date)+' · '+plural(w.exercises.length,"exercise")+' · '+plural(sets,"set")+'</div></div>'+
    icon("chevronRight")+'</div>';
}
function suggestToday(){
  var favs = EQUIPMENT.filter(function(e){ return e.favorite && !e.hidden; });
  var pick = favs[0] || eqById("leg-press");
  return { title:"Full Body Beginner", sub:"A balanced starter routine", tag:"Beginner friendly",
    img: pick.img, eqId: pick.id };
}

/* -------- ACTIVE WORKOUT -------- */
ROUTES.workout = { tab:"workout", render: function(){
  if(!S.active){
    return '<div class="view"><div class="aw-top"><div class="aw-title"><h2>Workout</h2></div></div>'+
      '<div class="empty"><div class="e-ico">'+icon("dumbbell")+'</div>'+
      '<h3>No active workout</h3><p>Start a fresh session and log as you go.</p>'+
      '<button class="btn btn-primary mt16" data-act="start-workout">'+icon("play")+'Start Workout</button></div></div>';
  }
  var a = S.active;
  var current = a.exercises.find(function(x){ return !x.done; }) || a.exercises[a.exercises.length-1];
  var upnext = a.exercises.filter(function(x){ return x!==current; });
  var html = '<div class="view">';

  html += '<div class="aw-top">'+
    '<div class="aw-title"><div class="planname">'+esc(a.name)+'</div><h2>Active Workout</h2></div>'+
    '<button class="btn btn-danger btn-sm" data-act="finish-workout" style="width:auto">'+icon("flag")+'End Workout</button>'+
  '</div>';

  if(!a.exercises.length){
    html += '<div class="empty"><div class="e-ico">'+icon("search")+'</div><h3>Add your first machine</h3>'+
      '<p>Search the equipment list to begin logging.</p>'+
      '<button class="btn btn-primary mt16" data-act="add-exercise">'+icon("plus")+'Add Exercise</button></div></div>';
    return html;
  }

  if(current) html += exerciseCard(current, a.exercises.indexOf(current));

  html += '<div class="inline-tip approved-workout-tip"><div class="coach-ava">'+coachBust()+'</div>'+
    '<div class="grow"><div class="t-label">Coach Tip</div>'+
      '<p>Keep your movement controlled and stop before your form changes.</p></div>'+
    icon("chevronRight")+'</div>';

  html += '<div class="approved-upnext-head"><strong>Up Next</strong><span>Reorder &amp; Edit</span></div>';
  if(upnext.length){
    upnext.forEach(function(x){
      var ue = eqById(x.eqId);
      html += '<div class="upnext-item approved-upnext '+(x.done?"done":"")+'">'+
        '<div class="thumb sm"><img src="'+ue.img+'" alt=""></div>'+
        '<div class="grow"><div style="font-weight:700;font-size:14px">'+esc(ue.name)+'</div>'+
          '<div class="li-sub">'+(x.done? plural(x.sets.length,"set")+" logged" : musclesLabel(ue))+'</div></div>'+
        (x.done? '<span class="tag tag-good">'+icon("check")+'Done</span>'
               : '<button class="iconbtn plain" data-act="make-current" data-i="'+a.exercises.indexOf(x)+'" aria-label="Switch to">'+icon("chevronRight")+'</button>')+
      '</div>';
    });
  } else {
    html += '<div class="approved-upnext-empty">Add another exercise when you are ready.</div>';
  }

  html += '<button class="approved-dashed-add" data-act="add-exercise">'+icon("plus")+'Add Exercise</button>';
  html += '<button class="btn btn-primary mt16" data-act="finish-workout">'+icon("flag")+'Finish Workout</button>';
  html += '</div>';
  return html;
}};

function exerciseCard(x, idx){
  var e = eqById(x.eqId);
  var last = S.lastUsed[e.id];
  var lastTxt = "";
  if(last){
    lastTxt = e.type==="cardio"
      ? ("Last time: "+last.minutes+" min"+(last.distance?(" · "+last.distance+" mi"):""))
      : ("Last time: "+last.weight+" lb · "+last.reps+" reps");
  } else lastTxt = "First time — nice!";
  /* vertical set rows with a subtle repeat control */
  var rows = "";
  x.sets.forEach(function(s,i){
    var val = e.type==="cardio"
      ? (s.minutes+' min <small>· '+(s.distance||0)+' mi</small>')
      : (s.weight+' lb <small>× '+s.reps+' reps</small>');
    rows += '<div class="set-row approved-set-row"><span class="set-n">Set '+(i+1)+'</span>'+
      '<span class="set-val">'+val+'</span>'+
      '<button class="set-dup" data-act="dup-set-row" data-i="'+idx+'" data-s="'+i+'" aria-label="Repeat this set">'+icon("copy")+'</button>'+
      '<button class="set-x2" data-act="del-set" data-i="'+idx+'" data-s="'+i+'" aria-label="Delete set">'+icon("close")+'</button></div>';
  });
  if(!x.sets.length) rows = '<div class="set-empty">No sets yet — tap “Add Set” below.</div>';

  return '<div class="card ex-card approved-ex-card">'+
    '<span class="approved-active-chip">ACTIVE</span>'+
    '<button class="ex-3dot" data-act="ex-menu" data-i="'+idx+'" aria-label="More">'+icon("more")+'</button>'+
    '<div class="approved-ex-grid"><div class="approved-ex-copy">'+
      '<h3>'+esc(e.name)+'</h3><div class="approved-ex-muscle-label">'+esc(musclesLabel(e))+'</div>'+
      '<div class="ex-muscles">'+ e.muscles.slice(0,3).map(function(m){ return '<span class="tag tag-accent">'+esc(MUSCLE_NAMES[m]||m)+'</span>'; }).join("")+'</div>'+
      '<div class="ex-lastinline">'+icon("history")+esc(lastTxt)+'</div>'+
      '<div class="set-list-v">'+ rows +'</div></div>'+
      '<div class="approved-ex-image"><img src="'+e.imgUse+'" alt="'+esc(e.name)+' in use"></div></div>'+
    '</div>'+
    '<div class="approved-ex-actions">'+
      '<button class="btn btn-primary" data-act="add-set" data-i="'+idx+'">'+icon("plus")+'Add Set</button>'+
      '<button class="btn btn-soft btn-sm" data-act="machine-history" data-id="'+e.id+'">'+icon("history")+'History</button>'+
      '<button class="btn btn-outline btn-sm" data-act="done-exercise" data-i="'+idx+'">'+icon("check")+'Done</button>'+
    '</div>';
}

/* -------- ADD EXERCISE / SEARCH -------- */
var addState = { q:"", cat:"all", favOnly:false };
ROUTES.addExercise = { tab:"workout", render: function(){
  addState = { q:"", cat:"all", favOnly:false };
  return '<div class="view">'+
    subHeader("Add Exercise", { right:'<button class="iconbtn" data-act="back" aria-label="Close">'+icon("close")+'</button>' }) +
    '<div class="searchbar mb12">'+icon("search")+
      '<input class="in" id="eq-search" placeholder="Search machines…" autocomplete="off"></div>'+
    '<div class="scroll-x" id="cat-chips">'+ catChips() +'</div>'+
    '<div id="eq-results">'+ resultsHTML() +'</div></div>';
}, after: function(){
  var inp = document.getElementById("eq-search");
  if(inp){
    inp.addEventListener("input", function(){ addState.q = inp.value; document.getElementById("eq-results").innerHTML = resultsHTML(); });
  }
}};
/* Quicklist: All, Favorites, then recent machines (tap a machine to add it). */
function catChips(){
  var html = '<button class="chip '+(!addState.favOnly&&addState.cat==="all"?"active":"")+'" data-act="cat" data-cat="all">All</button>'+
    '<button class="chip '+(addState.favOnly?"active soft":"")+'" data-act="cat" data-cat="favorites"><span class="icon">'+ICON("star")+'</span>Favorites</button>';
  recentMachines(6).forEach(function(e){
    html += '<button class="chip" data-act="add-machine" data-id="'+e.id+'">'+esc(e.name)+'</button>';
  });
  return html;
}
function resultsHTML(){
  var q = addState.q.trim().toLowerCase();
  var recent = !q ? recentMachines() : [];
  var list = EQUIPMENT.filter(function(e){
    if(e.hidden) return false;
    if(addState.favOnly && !e.favorite) return false;
    if(!addState.favOnly && addState.cat!=="all" && e.category!==addState.cat) return false;
    if(q && (e.name.toLowerCase().indexOf(q)<0 && musclesLabel(e).toLowerCase().indexOf(q)<0)) return false;
    return true;
  }).sort(function(a,b){ return a.name.localeCompare(b.name); });

  var html = "";
  html += '<div class="label no-line">'+(addState.favOnly?"Favorites":addState.q?"Results":"All machines")+'</div>';
  if(!list.length) html += '<div class="empty"><div class="e-ico">'+icon("search")+'</div><h3>No matches</h3><p>Try a different search.</p></div>';
  list.forEach(function(e){ html += machineResult(e); });
  return html;
}
function recentMachines(n){
  var ids = Object.keys(S.lastUsed);
  return ids.map(eqById).filter(function(e){ return e && !e.hidden; }).slice(0, n||3);
}
function machineResult(e){
  var inActive = S.active && S.active.exercises.some(function(x){ return x.eqId===e.id; });
  return '<div class="mres approved-machine-row"><div class="thumb approved-machine-thumb"><img src="'+e.img+'" alt=""></div>'+
    '<div class="grow approved-machine-copy"><div class="approved-machine-name">'+esc(e.name)+'</div>'+
      '<div class="li-sub">'+esc(musclesLabel(e))+'</div><span class="approved-machine-tag">'+esc(e.category)+'</span></div>'+
    '<div class="approved-machine-actions"><button class="fav-star '+(e.favorite?"":"off")+'" data-act="toggle-fav" data-id="'+e.id+'" aria-label="Favorite">'+(e.favorite?icon("starFilled"):icon("star"))+'</button>'+
    '<button class="add-btn '+(inActive?"added":"")+'" data-act="add-machine" data-id="'+e.id+'" aria-label="Add">'+(inActive?icon("check"):icon("plus"))+'</button></div>'+
  '</div>';
}

/* -------- PLANS -------- */
ROUTES.plans = { tab:"plans", render: function(){
  var html = '<div class="view"><div class="aw-top"><div class="aw-title"><h2>Plans</h2>'+
    '<div class="planname">Build your own routines</div></div>'+
    '<button class="iconbtn tint" data-act="new-plan" aria-label="New plan">'+icon("plus")+'</button></div>';

  html += '<div class="card create-card mt16" data-act="new-plan">'+
    '<div class="pc-ico">'+icon("plus")+'</div>'+
    '<div class="grow"><div style="font-weight:800">Create New Plan</div>'+
      '<div class="li-sub">Pick machines in the order you like.</div></div>'+icon("chevronRight")+'</div>';

  if(S.plans.length){
    html += '<div class="label">Saved plans</div>';
    S.plans.forEach(function(p){
      var firstEq = eqById(p.exercises[0]);
      html += '<div class="card plan-card mb12">'+
        '<div class="plan-thumb">'+(firstEq?'<img src="'+firstEq.img+'" style="width:100%;height:100%;object-fit:cover">':icon("plans"))+'</div>'+
        '<div class="grow" data-act="start-plan" data-id="'+p.id+'" style="cursor:pointer">'+
          '<div style="font-weight:800">'+esc(p.name)+'</div>'+
          '<div class="li-sub">'+plural(p.exercises.length,"exercise")+'</div></div>'+
        '<span class="fav-star '+(p.favorite?"":"off")+'" data-act="fav-plan" data-id="'+p.id+'">'+(p.favorite?icon("starFilled"):icon("star"))+'</span>'+
        '<button class="iconbtn plain" data-act="plan-menu" data-id="'+p.id+'" aria-label="More" style="width:34px;height:34px">'+icon("more")+'</button>'+
      '</div>';
    });
  } else {
    html += '<div class="empty mt20"><div class="e-ico">'+icon("plans")+'</div><h3>No plans yet</h3>'+
      '<p>Create a plan to start workouts faster.</p></div>';
  }
  html += '</div>';
  return html;
}};

/* -------- PLAN BUILDER -------- */
var builder = null;
ROUTES.planBuilder = { tab:"plans", render: function(p){
  if(!builder){
    var existing = p && p.id ? S.plans.find(function(x){return x.id===p.id;}) : null;
    builder = existing ? { id:existing.id, name:existing.name, exercises:existing.exercises.slice() }
                       : { id:null, name:"", exercises:[] };
  }
  var html = '<div class="view">'+ subHeader(builder.id?"Edit Plan":"New Plan") ;
  html += '<div class="card coach-card mb12"><div class="coach-ava">'+coachBust()+'</div>'+
    '<div class="grow"><p style="font-weight:700;font-size:13.5px">Add machines in the order you\'ll do them. You can reorder anytime.</p></div></div>';
  html += '<div class="field"><span>Plan name</span><input class="in" id="plan-name" placeholder="e.g. Leg Day" value="'+esc(builder.name)+'"></div>';

  if(builder.exercises.length){
    html += '<div class="label">In this plan</div>';
    builder.exercises.forEach(function(id,i){
      var e = eqById(id);
      html += '<div class="upnext-item"><span class="grip">'+icon("grip")+'</span>'+
        '<div class="thumb sm"><img src="'+e.img+'" alt=""></div>'+
        '<div class="grow"><div style="font-weight:700;font-size:14px">'+esc(e.name)+'</div><div class="li-sub">'+esc(musclesLabel(e))+'</div></div>'+
        '<button class="iconbtn plain" data-act="builder-up" data-i="'+i+'" aria-label="Move up" style="width:32px;height:32px;'+(i===0?"opacity:.3;pointer-events:none":"")+'">'+icon("chevronLeft")+'</button>'+
        '<button class="iconbtn plain" data-act="builder-down" data-i="'+i+'" aria-label="Move down" style="width:32px;height:32px;'+(i===builder.exercises.length-1?"opacity:.3;pointer-events:none":"")+'">'+icon("chevronRight")+'</button>'+
        '<button class="iconbtn plain" data-act="builder-remove" data-i="'+i+'" aria-label="Remove" style="width:32px;height:32px;color:var(--danger)">'+icon("trash")+'</button>'+
      '</div>';
    });
  } else {
    html += '<div class="empty" style="padding:24px"><div class="e-ico">'+icon("plans")+'</div><p>No exercises yet — add your first below.</p></div>';
  }

  /* Add Exercise CTA below the list */
  html += '<div class="card create-card mt12" data-act="builder-add"><div class="pc-ico">'+icon("plus")+'</div>'+
    '<div class="grow"><div style="font-weight:800">Add Exercise</div><div class="li-sub">Choose from your equipment</div></div>'+icon("chevronRight")+'</div>';

  html += '<div class="row gap12 mt20">'+
    '<button class="btn btn-ghost" data-act="builder-clear" style="flex:.6">Clear</button>'+
    '<button class="btn btn-primary" data-act="builder-save">'+icon("check")+'Save Plan</button></div>';
  html += '</div>';
  return html;
}, after:function(){
  var n = document.getElementById("plan-name");
  if(n) n.addEventListener("input", function(){ builder.name = n.value; });
}};

/* -------- HISTORY -------- */
ROUTES.history = { tab:"history", render: function(){
  var stats = weekStats();
  var html = '<div class="view"><div class="aw-top"><div class="aw-title"><h2>History</h2>'+
    '<div class="planname">Everything you\'ve logged</div></div>'+
    '<button class="iconbtn tint" data-act="goto" data-name="calendar" aria-label="Calendar">'+icon("calendar")+'</button></div>';

  html += '<div class="label">This week</div>';
  html += '<div class="stat-grid two">'+
    '<div class="stat"><div class="n">'+stats.workouts+'</div><div class="l">Workouts</div></div>'+
    '<div class="stat"><div class="n">'+stats.machines+'</div><div class="l">Machines</div></div></div>';

  html += '<div class="label">Recent workouts</div>';
  if(S.history.length){
    html += '<div class="card flat" style="padding:4px 16px">';
    S.history.slice().reverse().forEach(function(w){ html += recentItem(w); });
    html += '</div>';
    html += '<div class="row gap12 mt12">'+
      '<button class="btn btn-ghost btn-sm" data-act="goto" data-name="calendar">'+icon("calendar")+'Calendar</button>'+
      '<button class="btn btn-ghost btn-sm" data-act="goto" data-name="muscleMap">'+icon("target")+'Body activity</button></div>';
  } else {
    html += '<div class="empty"><div class="e-ico">'+icon("history")+'</div><h3>No history yet</h3><p>Finish a workout and it shows up here.</p>'+
      '<button class="btn btn-primary mt16" data-act="start-workout">'+icon("play")+'Start Workout</button></div>';
  }
  html += '</div>';
  return html;
}};
function weekStats(){
  var weekAgo = Date.now()-6*86400000;
  var ws = S.history.filter(function(w){ return new Date(w.date+"T12:00").getTime()>=weekAgo; });
  var sets=0, machines={};
  ws.forEach(function(w){ w.exercises.forEach(function(x){ sets+=x.sets.length; machines[x.eqId]=1; }); });
  return { workouts:ws.length, sets:sets, machines:Object.keys(machines).length };
}

/* -------- WORKOUT DETAIL -------- */
ROUTES.workoutDetail = { tab:"history", render: function(p){
  var w = S.history.find(function(x){ return x.id===p.id; });
  if(!w) return '<div class="view">'+subHeader("Workout")+'<div class="empty"><p>Not found.</p></div></div>';
  var sets = w.exercises.reduce(function(a,x){ return a+x.sets.length; },0);
  var html = '<div class="view">'+ subHeader(w.name) ;
  html += '<div class="card tint mt8"><div class="row gap12"><div class="li-ico">'+icon("calendar")+'</div><div class="grow">'+
    '<div style="font-weight:800;font-size:18px">'+esc(w.name)+'</div>'+
    '<div class="li-sub">'+relDay(w.date)+'</div></div></div>'+
    '<div class="stat-grid mt16">'+
      '<div class="stat"><div class="n">'+w.exercises.length+'</div><div class="l">Exercises</div></div>'+
      '<div class="stat"><div class="n">'+sets+'</div><div class="l">Sets</div></div>'+
      '<div class="stat"><div class="n">'+new Set(w.exercises.map(function(x){return x.eqId;})).size+'</div><div class="l">Machines</div></div></div></div>';

  html += '<div class="label">Exercises</div>';
  w.exercises.forEach(function(x){
    var e = eqById(x.eqId);
    var rows = x.sets.map(function(s,i){
      var v = e.type==="cardio"? (s.minutes+' min · '+(s.distance||0)+' mi · '+esc(s.intensity||""))
                               : (s.weight+' lb × '+s.reps+' reps');
      return '<div class="set-row"><span class="set-n">'+(i+1)+'</span><span class="set-val">'+v+'</span></div>';
    }).join("");
    html += '<div class="card ex-card mb12"><div class="ex-media"><div class="ex-photo"><img src="'+e.imgUse+'" alt=""></div>'+
      '<div class="ex-info"><h3>'+esc(e.name)+'</h3>'+
        '<div class="ex-muscles">'+e.muscles.slice(0,3).map(function(m){return '<span class="tag tag-muscle">'+esc(MUSCLE_NAMES[m]||m)+'</span>';}).join("")+'</div>'+
        (x.difficulty?'<div class="ex-lasttime">'+diffFace(x.difficulty)+'<span style="margin-left:5px">Felt '+esc(diffLabel(x.difficulty))+'</span></div>':'')+
      '</div></div><div class="ex-body">'+rows+'</div></div>';
  });

  /* mini muscle section */
  html += '<div class="label">Body activity</div>';
  html += muscleMini(w.exercises);
  html += '<button class="btn btn-ghost mt16" data-act="tab" data-tab="history">'+icon("history")+'View all workouts</button>';
  html += '</div>';
  return html;
}};
function muscleMini(exercises){
  var levels = muscleLevels(exercises);
  var rgb = themeRGB();
  return '<div class="card"><div class="body-wrap">'+
    '<div class="body-col"><div class="bc-label">Front</div>'+MUSCLE_MAP("front",levels,rgb)+'</div>'+
    '<div class="body-col"><div class="bc-label">Back</div>'+MUSCLE_MAP("back",levels,rgb)+'</div></div></div>';
}

/* -------- CALENDAR -------- */
var calCursor = null;
ROUTES.calendar = { tab:"history", render: function(){
  if(!calCursor){ var n=new Date(); calCursor={ y:n.getFullYear(), m:n.getMonth() }; }
  var html = '<div class="view">'+ subHeader("Calendar") ;
  html += '<div class="card"><div class="cal-head">'+
    '<button class="iconbtn plain" data-act="cal-prev" aria-label="Previous month">'+icon("chevronLeft")+'</button>'+
    '<div style="font-weight:800">'+ new Date(calCursor.y,calCursor.m,1).toLocaleDateString(undefined,{month:"long",year:"numeric"}) +'</div>'+
    '<button class="iconbtn plain" data-act="cal-next" aria-label="Next month">'+icon("chevronRight")+'</button></div>';
  html += '<div class="cal-grid">'+ ["S","M","T","W","T","F","S"].map(function(d){return '<div class="cal-dow">'+d+'</div>';}).join("");
  var first = new Date(calCursor.y,calCursor.m,1);
  var startDow = first.getDay();
  var days = new Date(calCursor.y,calCursor.m+1,0).getDate();
  var workoutDays = {};
  S.history.forEach(function(w){ var d=new Date(w.date+"T12:00"); if(d.getFullYear()===calCursor.y&&d.getMonth()===calCursor.m) workoutDays[d.getDate()]=w.id; });
  for(var i=0;i<startDow;i++) html += '<div class="cal-cell muted"></div>';
  for(var day=1; day<=days; day++){
    var iso = calCursor.y+"-"+String(calCursor.m+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
    var isToday = iso===todayISO();
    var has = workoutDays[day];
    html += '<div class="cal-cell '+(isToday?"today":"")+' '+(has?"has":"")+'" '+(has?'data-act="open-workout" data-id="'+has+'"':"")+'>'+
      day + (has?'<span class="cal-dot"></span>':'') +'</div>';
  }
  html += '</div></div>';

  /* recent workout days */
  var recent = S.history.slice().reverse().slice(0,5);
  if(recent.length){
    html += '<div class="label">Recent workout days</div>';
    recent.forEach(function(w){
      html += '<div class="card row gap12 mb12" data-act="open-workout" data-id="'+w.id+'" style="cursor:pointer">'+
        '<div class="li-ico">'+icon("calendar")+'</div>'+
        '<div class="grow"><div style="font-weight:800">'+esc(w.name)+'</div><div class="li-sub">'+relDay(w.date)+' · '+plural(w.exercises.length,"exercise")+'</div></div>'+
        icon("chevronRight")+'</div>';
    });
  }
  html += '</div>';
  return html;
}};

/* -------- MUSCLE MAP (Body Activity) -------- */
var muscleView = "today";
ROUTES.muscleMap = { tab:"history", render: function(){
  var exercises = muscleView==="today" ? todaysExercises() : last7Exercises();
  var levels = muscleLevels(exercises, muscleView==="week");
  var rgb = themeRGB();
  var html = '<div class="view">'+ subHeader("Body Activity") ;
  html += '<div class="seg mb12"><button class="'+(muscleView==="today"?"active":"")+'" data-act="muscle-view" data-v="today">Today</button>'+
    '<button class="'+(muscleView==="week"?"active":"")+'" data-act="muscle-view" data-v="week">Last 7 Days</button></div>';

  html += '<div class="card"><div class="body-wrap">'+
    '<div class="body-col"><div class="bc-label">Front</div>'+MUSCLE_MAP("front",levels,rgb)+'</div>'+
    '<div class="body-col"><div class="bc-label">Back</div>'+MUSCLE_MAP("back",levels,rgb)+'</div></div>'+
    '<div class="legend">'+
      '<span><i style="background:#DEDAEC"></i>Rested</span>'+
      '<span><i style="background:rgba('+rgb+',.3)"></i>Light</span>'+
      '<span><i style="background:rgba('+rgb+',.58)"></i>Worked</span>'+
      '<span><i style="background:rgba('+rgb+',.92)"></i>Focused</span></div></div>';

  /* checklist (today) or freq (week) */
  var counts = muscleCounts(exercises);
  var keys = Object.keys(counts).sort(function(a,b){ return counts[b]-counts[a]; });
  if(muscleView==="today"){
    html += '<div class="label">Worked out today</div><div class="card">';
    if(keys.length){
      keys.forEach(function(k){ html += '<div class="check-row"><span class="cb on">'+icon("check")+'</span>'+
        '<div class="grow" style="font-weight:600">'+esc(MUSCLE_NAMES[k]||k)+'</div>'+
        '<span class="tag tag-accent">'+plural(counts[k],"set")+'</span></div>'; });
    } else html += '<p class="hint center">No muscles logged today yet. Start a workout!</p>';
    html += '</div>';
  } else {
    html += '<div class="label">Muscle group frequency</div><div class="card">';
    if(keys.length){
      var max = Math.max.apply(null, keys.map(function(k){return counts[k];}));
      keys.forEach(function(k){
        var pct = Math.round(counts[k]/max*100);
        html += '<div class="freq-row"><div class="fn">'+esc(MUSCLE_NAMES[k]||k)+'</div>'+
          '<div class="pbar"><i style="width:'+pct+'%"></i></div><div class="fc">'+counts[k]+'</div></div>';
      });
    } else html += '<p class="hint center">No activity in the last 7 days.</p>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}};
function todaysExercises(){
  var ex=[]; S.history.forEach(function(w){ if(w.date===todayISO()) ex=ex.concat(w.exercises); });
  if(S.active) ex = ex.concat(S.active.exercises.filter(function(x){return x.sets.length;}));
  return ex;
}
function last7Exercises(){
  var weekAgo = Date.now()-6*86400000, ex=[];
  S.history.forEach(function(w){ if(new Date(w.date+"T12:00").getTime()>=weekAgo) ex=ex.concat(w.exercises); });
  return ex;
}
function muscleCounts(exercises){
  var c={}; exercises.forEach(function(x){ var e=eqById(x.eqId); if(!e)return; var n=Math.max(1,x.sets.length);
    e.muscles.forEach(function(m){ if(m==="cardio")return; c[m]=(c[m]||0)+n; }); }); return c;
}
function muscleLevels(exercises, lighter){
  var c = muscleCounts(exercises), lv={};
  Object.keys(c).forEach(function(k){
    var n=c[k];
    var level = n>=6?3 : n>=3?2 : 1;
    if(lighter) level = Math.max(1, level-1);
    lv[k]=level;
  });
  return lv;
}
function themeRGB(){
  var map={ purple:"123,94,167", pink:"232,90,156", blue:"59,134,240", red:"239,90,82", orange:"244,137,47" };
  return map[S.theme]||map.purple;
}

/* -------- PROFILE -------- */
ROUTES.profile = { tab:"profile", render: function(){
  var meta = AVATAR_META(S.avatar.id);
  var earned = Object.keys(S.badges).length;
  var html = '<div class="view"><div class="aw-top"><div class="aw-title"><h2>Profile</h2></div></div>';
  html += '<div class="card row gap12 mt8">'+ avatarHTML("") .replace('class="avatar-bubble ','class="avatar-bubble " style="width:64px;height:64px"  data-x="') +
    '<div class="grow"><div style="font-weight:800;font-size:18px">'+esc(S.profile.name||"Welcome")+'</div>'+
      '<div class="li-sub">'+esc(meta.trait)+'</div></div>'+
    '<div class="stat" style="border:none;background:var(--accent-soft);padding:10px 14px"><div class="n">'+earned+'</div><div class="l">Badges</div></div></div>';

  html += '<div class="label">Personalize</div>';
  html += '<div class="set-list">'+
    settingRow("user","Avatar","Choose your gym buddy","avatar")+
    settingRow("palette","Theme color","Switch the app accent","theme")+
    settingRow("weight","Workout defaults","Increments & starting values","defaults")+
  '</div>';

  html += '<div class="label">Equipment & data</div>';
  html += '<div class="set-list">'+
    settingRow("dumbbell","Manage Equipment","Favorites & hidden machines","manageEquipment")+
    settingRow("trophy","Badge Library","See earned & locked badges","badges")+
    settingRow("download","Backup & Restore","Export or import your data","backup")+
  '</div>';

  html += '<div class="label">App</div>';
  html += '<div class="set-list">'+
    settingRow("settings","Settings","All preferences in one place","settings")+
    settingRow("sparkle","First-Time Setup","Run the welcome journey again","onboarding")+
  '</div>';
  html += '<p class="hint center mt20" style="font-size:11px">Coach · saved on this device only</p>';
  html += '</div>';
  return html;
}};
function settingRow(ic,title,sub,name){
  return '<button class="set-row2" data-act="goto" data-name="'+name+'">'+
    '<div class="sr-ico">'+icon(ic)+'</div>'+
    '<div class="sr-main"><div class="sr-title">'+esc(title)+'</div><div class="sr-sub">'+esc(sub)+'</div></div>'+
    '<span class="icon chev">'+ICON("chevronRight")+'</span></button>';
}

/* -------- SETTINGS -------- */
ROUTES.settings = { tab:"profile", render: function(){
  var d = S.defaults;
  var html = '<div class="view">'+ subHeader("Settings");
  html += '<div class="label no-line">Profile & personalization</div>';
  html += '<div class="field"><span>Your name</span><input class="in" id="set-name" value="'+esc(S.profile.name)+'" placeholder="Your name"></div>';
  html += '<div class="set-list">'+
    settingRow("user","Avatar","Current: "+esc(AVATAR_META(S.avatar.id).name),"avatar")+
    settingRow("palette","Appearance","Theme: "+cap(S.theme),"theme")+'</div>';

  html += '<div class="label">Workout preferences</div>';
  html += '<div class="set-list">'+
    stepRow("Weight increment", d.weightInc+" lb","weightInc",5)+
    stepRow("Rep increment", d.repInc+"","repInc",1)+
    stepRow("Cardio time increment", d.cardioInc+" min","cardioInc",1)+
    toggleRow("Use last logged values","Pre-fill from your last session","useLast",d.useLast)+
  '</div>';
  html += '<button class="btn btn-ghost btn-sm mt12" data-act="goto" data-name="defaults">'+icon("sparkle")+'Open full defaults & preview</button>';

  html += '<div class="label">Equipment</div>';
  html += '<div class="set-list">'+
    settingRow("star","Favorites",plural(S.fav.length,"machine"),"manageEquipment")+
    settingRow("eyeOff","Hidden machines",plural(S.hidden.length,"hidden"),"manageEquipment")+'</div>';

  html += '<div class="label">Backup</div>';
  html += '<div class="card"><div class="row between mb12"><div class="row gap8"><span class="tag tag-good">'+icon("check")+'Auto-save on</span></div>'+
    '<span class="hint" style="font-size:11px">'+(S.backupDate?("Backed up "+relDay(S.backupDate)):"No backup yet")+'</span></div>'+
    '<div class="row gap8"><button class="btn btn-soft btn-sm" data-act="export-data">'+icon("download")+'Export</button>'+
    '<button class="btn btn-ghost btn-sm" data-act="import-data">'+icon("upload")+'Import</button></div></div>';
  html += '</div>';
  return html;
}, after:function(){
  var n=document.getElementById("set-name");
  if(n) n.addEventListener("change", function(){ S.profile.name=n.value.trim(); save(); });
}};
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function stepRow(title,val,key,step){
  return '<div class="set-row2" style="cursor:default">'+
    '<div class="sr-ico">'+icon("weight")+'</div>'+
    '<div class="sr-main"><div class="sr-title">'+esc(title)+'</div></div>'+
    '<div class="car-wrap"><button class="car-step" data-act="pref-step" data-key="'+key+'" data-step="-'+step+'">−</button>'+
    '<div style="min-width:54px;text-align:center;font-weight:800">'+esc(val)+'</div>'+
    '<button class="car-step" data-act="pref-step" data-key="'+key+'" data-step="'+step+'">+</button></div></div>';
}
function toggleRow(title,sub,key,on){
  return '<div class="set-row2" style="cursor:default">'+
    '<div class="sr-ico">'+icon("refresh")+'</div>'+
    '<div class="sr-main"><div class="sr-title">'+esc(title)+'</div><div class="sr-sub">'+esc(sub)+'</div></div>'+
    '<button class="switch '+(on?"on":"")+'" data-act="pref-toggle" data-key="'+key+'" aria-label="'+esc(title)+'"></button></div>';
}

/* -------- THEME SELECTOR -------- */
var THEMES = [
  { id:"pink",   c:"#E85A9C" },{ id:"blue", c:"#3B86F0" },{ id:"purple", c:"#7B5EA7" },
  { id:"red",    c:"#EF5A52" },{ id:"orange", c:"#F4892F" }
];
var themeDraft = null;
ROUTES.theme = { tab:"profile", render: function(){
  themeDraft = themeDraft || S.theme;
  var html = '<div class="view">'+ subHeader("Theme Color");
  /* live preview card */
  document.body.setAttribute("data-theme", themeDraft);
  html += '<div class="card hero" style="min-height:150px;margin-top:8px"><div class="hero-blob"></div>'+
    '<div class="hero-text"><div class="tag tag-accent" style="align-self:flex-start">'+icon("palette")+cap(themeDraft)+'</div>'+
      '<h2 class="mt8">Live preview</h2><button class="btn btn-primary btn-sm mt12" style="width:auto;pointer-events:none">'+icon("play")+'Start Workout</button></div>'+
    '<div class="hero-coach" style="width:108px"><img src="images/coach/coach-hero.png" alt=""></div></div>';

  html += '<div class="label">Choose a color</div>';
  html += '<div class="theme-grid">'+ THEMES.map(function(t){
    return '<button class="swatch '+(t.id===themeDraft?"sel":"")+'" data-act="theme-pick" data-id="'+t.id+'" style="background:'+t.c+'" aria-label="'+t.id+'"><small>'+cap(t.id)+'</small></button>';
  }).join("") +'</div>';

  html += '<div class="card coach-card mt20"><div class="coach-ava">'+coachBust()+'</div>'+
    '<div class="grow"><p style="font-weight:700;font-size:13.5px">Your coach and avatar tops will match this color.</p></div></div>';
  html += '<button class="btn btn-primary mt20" data-act="apply-theme">'+icon("check")+'Apply Theme</button>';
  html += '</div>';
  return html;
}};

/* -------- AVATAR SELECTOR -------- */
var avatarDraft = null;
ROUTES.avatar = { tab:"profile", render: function(){
  avatarDraft = avatarDraft || { id:S.avatar.id, skin:S.avatar.skin };
  var sh = getComputedStyle(document.body).getPropertyValue("--accent").trim();
  var meta = AVATAR_META(avatarDraft.id);
  var html = '<div class="view">'+ subHeader("Choose Your Avatar");
  html += '<p class="hint mb12">Pick your gym buddy and skin tone.</p>';
  html += '<div class="ava-grid">'+ AVATARS.map(function(a){
    return '<button class="ava-pick '+(a.id===avatarDraft.id?"sel":"")+'" data-act="ava-pick" data-id="'+a.id+'">'+
      AVATAR_SVG(a.id, avatarDraft.skin, sh) +'</button>';
  }).join("") +'</div>';

  /* selected preview */
  html += '<div class="card mt20 row gap12" style="align-items:center">'+
    '<span class="avatar-bubble" style="width:72px;height:72px">'+AVATAR_SVG(avatarDraft.id, avatarDraft.skin, sh)+'</span>'+
    '<div class="grow"><div style="font-weight:800;font-size:17px">'+esc(meta.name)+'</div>'+
      '<div class="tag tag-accent mt8" style="display:inline-flex">'+icon("sparkle")+esc(meta.trait)+'</div></div></div>';

  html += '<div class="label">Skin tone</div>';
  html += '<div class="tone-row">'+ SKIN_TONES.map(function(t){
    return '<button class="tone '+(t.hex===avatarDraft.skin?"sel":"")+'" data-act="ava-tone" data-hex="'+t.hex+'" style="background:'+t.hex+'" aria-label="'+t.id+' tone"></button>';
  }).join("") +'</div>';

  html += '<button class="btn btn-primary mt20" data-act="apply-avatar">'+icon("check")+'Apply Avatar</button>';
  html += '</div>';
  return html;
}};

/* -------- INCREMENTS & DEFAULTS -------- */
ROUTES.defaults = { tab:"profile", render: function(){
  var d = S.defaults;
  var html = '<div class="view">'+ subHeader("Increments & Defaults");
  html += '<p class="hint" style="margin:-2px 2px 12px;font-size:13px">Choose how the pickers behave for new exercises and cardio.</p>';
  /* add set preview — 3 columns with faded neighbours */
  html += '<div class="card tint"><div class="t-label" style="color:var(--accent-strong);margin-bottom:10px">Add Set preview</div>'+
    '<div class="dpv">'+ dcol("Weight","lb",d.firstWeight,d.weightInc) + dcol("Reps","",d.firstReps,d.repInc) + dcol("Sets","",d.firstSets,1) +'</div>'+
    '<p class="hint center mt12" style="font-size:11.5px">Example values based on your defaults.</p></div>';

  html += '<div class="label">Strength defaults</div><div class="set-list">'+
    stepRow("First-time weight", d.firstWeight+" lb","firstWeight",5)+
    stepRow("First-time reps", d.firstReps+"","firstReps",1)+
    stepRow("Target sets", d.firstSets+"","firstSets",1)+
    stepRow("Weight increment", d.weightInc+" lb","weightInc",5)+
    stepRow("Rep increment", d.repInc+"","repInc",1)+'</div>';

  html += '<div class="label">Cardio defaults</div><div class="set-list">'+
    stepRow("First-time minutes", d.firstCardioMin+" min","firstCardioMin",5)+
    stepRow("Minute increment", d.cardioInc+" min","cardioInc",1)+'</div>';

  html += '<div class="label">Smart behavior</div><div class="set-list">'+
    toggleRow("Use last logged values","Default to your last session for each machine","useLast",d.useLast)+'</div>';

  html += '<div class="row gap12 mt20"><button class="btn btn-ghost" data-act="reset-defaults" style="flex:.7">'+icon("refresh")+'Reset</button>'+
    '<button class="btn btn-primary" data-act="save-defaults">'+icon("check")+'Save Defaults</button></div>';
  html += '</div>';
  return html;
}};

function dcol(label, unit, v, inc){
  return '<div class="dcol"><div class="dl">'+esc(label)+(unit?' <small>('+esc(unit)+')</small>':'')+'</div>'+
    '<div class="dn dim">'+Math.max(0, v-inc)+'</div>'+
    '<div class="dn big">'+v+'</div>'+
    '<div class="dn dim">'+(v+inc)+'</div></div>';
}

/* -------- MANAGE EQUIPMENT -------- */
var manageState = { q:"", filter:"all" };
ROUTES.manageEquipment = { tab:"profile", render: function(){
  manageState = { q:"", filter:"all" };
  var html = '<div class="view">'+ subHeader("Manage Equipment");
  html += '<div class="searchbar mb12">'+icon("search")+'<input class="in" id="mg-search" placeholder="Search equipment…" autocomplete="off"></div>';
  html += '<div class="seg mb12"><button class="active" data-act="mg-filter" data-f="all">All</button>'+
    '<button data-act="mg-filter" data-f="favorites">Favorites</button>'+
    '<button data-act="mg-filter" data-f="hidden">Hidden</button></div>';
  html += '<div id="mg-list">'+ manageList() +'</div></div>';
  return html;
}, after:function(){
  var s=document.getElementById("mg-search");
  if(s) s.addEventListener("input", function(){ manageState.q=s.value; document.getElementById("mg-list").innerHTML=manageList(); });
}};
function manageList(){
  var q=manageState.q.trim().toLowerCase();
  var list = EQUIPMENT.filter(function(e){
    if(manageState.filter==="favorites" && !e.favorite) return false;
    if(manageState.filter==="hidden" && !e.hidden) return false;
    if(q && e.name.toLowerCase().indexOf(q)<0) return false;
    return true;
  }).sort(function(a,b){ return a.name.localeCompare(b.name); });
  var html="";
  if(manageState.filter==="hidden") html += '<p class="hint mb12" style="font-size:12px">Hidden machines won\'t appear when adding exercises.</p>';
  if(!list.length) html += '<div class="empty"><p>No equipment here.</p></div>';
  list.forEach(function(e){
    html += '<div class="eq-row '+(e.hidden?"hidden-item":"")+'"><div class="thumb sm"><img src="'+e.img+'" alt=""></div>'+
      '<div class="grow"><div style="font-weight:700;font-size:14px">'+esc(e.name)+'</div><div class="li-sub">'+esc(e.category)+'</div></div>'+
      '<span class="icon-act '+(e.favorite?"fav":"")+'" data-act="toggle-fav" data-id="'+e.id+'" aria-label="Favorite">'+(e.favorite?icon("starFilled"):icon("star"))+'</span>'+
      '<span class="icon-act" data-act="toggle-hide" data-id="'+e.id+'" aria-label="Hide">'+(e.hidden?icon("eyeOff"):icon("eye"))+'</span></div>';
  });
  return html;
}

/* -------- BACKUP & RESTORE -------- */
ROUTES.backup = { tab:"profile", render: function(){
  var html = '<div class="view">'+ subHeader("Backup & Restore");
  html += '<div class="card row gap12 mt8"><div class="li-ico" style="background:var(--good-soft);color:#2E7D49">'+icon("check")+'</div>'+
    '<div class="grow"><div style="font-weight:800">Auto-save is on</div><div class="li-sub">Your data saves to this device automatically.</div></div></div>';
  html += '<div class="card flat mt12"><p class="hint" style="font-size:12.5px">'+icon("info")+' Everything lives in your browser\'s local storage — nothing is uploaded anywhere. Make a backup before clearing your browser data or switching devices.</p></div>';

  html += '<div class="label">Backup</div>';
  html += '<button class="btn btn-primary" data-act="export-data">'+icon("download")+'Create / Export Backup</button>';
  html += '<button class="btn btn-ghost mt12" data-act="import-data">'+icon("upload")+'Import Backup</button>';
  html += '<p class="hint center mt12" style="font-size:11.5px">'+(S.backupDate?("Last backup: "+relDay(S.backupDate)):"No backup created yet")+'</p>';

  html += '<div class="label" style="color:var(--danger)">Danger zone</div>';
  html += '<div class="card" style="border-color:var(--danger-soft)"><div style="font-weight:700">Clear local data</div>'+
    '<p class="hint mt8" style="font-size:12.5px">This permanently deletes your profile, workouts, plans and badges from this device.</p>'+
    '<button class="btn btn-danger mt12" data-act="clear-data">'+icon("trash")+'Clear All Data</button></div>';
  html += '<input type="file" id="import-file" accept="application/json" style="display:none">';
  html += '</div>';
  return html;
}, after:function(){
  var f=document.getElementById("import-file");
  if(f) f.addEventListener("change", handleImportFile);
}};

/* -------- BADGE LIBRARY -------- */
var badgeTab = "earned";
ROUTES.badges = { tab:"profile", render: function(){
  var stats = computeBadgeStats();
  var earned = BADGES.filter(function(b){ return S.badges[b.id]; });
  var locked = BADGES.filter(function(b){ return !S.badges[b.id]; });
  var html = '<div class="view">'+ subHeader("Badge Library");
  html += '<div class="tabs mb12"><button class="'+(badgeTab==="earned"?"active":"")+'" data-act="badge-tab" data-t="earned">Earned ('+earned.length+')</button>'+
    '<button class="'+(badgeTab==="locked"?"active":"")+'" data-act="badge-tab" data-t="locked">Locked ('+locked.length+')</button></div>';
  var list = badgeTab==="earned"?earned:locked;
  if(!list.length){
    html += '<div class="empty"><div class="e-ico">'+icon("trophy")+'</div><h3>'+(badgeTab==="earned"?"No badges yet":"All unlocked!")+'</h3>'+
      '<p>'+(badgeTab==="earned"?"Finish a workout to earn your first.":"You\'ve earned every badge — amazing.")+'</p></div>';
  } else {
    html += '<div class="badge-grid">'+ list.map(function(b){
      var cur = b.progress(stats), pct = Math.round(cur/b.goal*100);
      var got = !!S.badges[b.id];
      return '<div class="badge-cell '+(got?"":"locked")+'" data-act="badge-detail" data-id="'+b.id+'">'+
        medalArt(b,{size:"sz-md",locked:!got})+
        '<div class="bn">'+esc(b.name)+'</div>'+
        (got? '<div class="bp">'+esc(relDay(S.badges[b.id]))+'</div>'
            : '<div class="pbar mt8"><i style="width:'+pct+'%"></i></div><div class="bp">'+cur+' / '+b.goal+'</div>')+
      '</div>';
    }).join("") +'</div>';
  }
  html += '</div>';
  return html;
}};

/* ============================ 7. OVERLAYS ============================== */
function openLayer(html){ layerEl.innerHTML = html; layerEl.classList.add("show"); }
function closeLayer(){ layerEl.classList.remove("show"); layerEl.innerHTML=""; }

/* ---- Add Set bottom sheet ---- */
var sheet = null;
function openAddSet(exIdx){
  var x = S.active.exercises[exIdx];
  var e = eqById(x.eqId);
  var base = x.sets.length ? x.sets[x.sets.length-1] : resolveDefaults(e);
  if(e.type==="cardio"){
    sheet = { exIdx:exIdx, cardio:true, minutes:base.minutes||resolveDefaults(e).minutes, distance:base.distance||0, intensity:base.intensity||"Moderate" };
  } else {
    sheet = { exIdx:exIdx, cardio:false, weight:base.weight!=null?base.weight:resolveDefaults(e).weight, reps:base.reps!=null?base.reps:resolveDefaults(e).reps };
  }
  renderSheet();
}
function renderSheet(){
  var x = S.active.exercises[sheet.exIdx];
  var e = eqById(x.eqId);
  var setNo = x.sets.length+1;
  var last = S.lastUsed[e.id];
  var lastTxt = last ? (e.type==="cardio"? (last.minutes+" min · "+(last.distance||0)+" mi") : (last.weight+" lb · "+last.reps+" reps")) : "First time — nice!";
  var body = '<div class="scrim" data-act="close-sheet"></div><div class="sheet"><div class="sheet-grab"></div>'+
    '<div class="sheet-head"><div class="thumb"><img src="'+e.img+'" alt=""></div>'+
      '<div class="grow"><div class="sheet-title">Add Set</div>'+
        '<div style="font-weight:700;font-size:14px">'+esc(e.name)+'</div>'+
        '<div class="li-sub">Last time: '+esc(lastTxt)+'</div></div></div>'+
    '<div class="setpill-row"><span class="chev-dim">'+icon("chevronLeft")+'</span>'+
      '<span class="setpill">Set '+setNo+'</span>'+
      '<span class="chev-dim">'+icon("chevronRight")+'</span></div>';

  if(sheet.cardio){
    body += swiper("Minutes","minutes",sheet.minutes,S.defaults.cardioInc,"min",1);
    body += '<div class="field mt16"><span>Distance (miles)</span><input class="in" id="cardio-dist" inputmode="decimal" value="'+sheet.distance+'"></div>';
    body += '<div class="field"><span>Intensity</span><div class="row gap8">'+
      ["Easy","Moderate","Hard"].map(function(i){ return '<button class="chip '+(sheet.intensity===i?"active soft":"")+'" data-act="sheet-intensity" data-i="'+i+'" style="flex:1;justify-content:center">'+i+'</button>'; }).join("")+'</div></div>';
  } else {
    body += swiper("Weight","weight",sheet.weight,S.defaults.weightInc,"lb",0);
    body += swiper("Reps","reps",sheet.reps,S.defaults.repInc,"reps",1);
  }

  body += '<div class="hint center" style="font-size:12.5px;margin:16px 0 10px">Swipe to choose, then tap Save to log this set.</div>'+
    '<button class="btn btn-primary" data-act="save-set">'+icon("check")+'Save Set</button>'+
    '<button class="btn btn-soft btn-sm mt12" data-act="close-sheet">Cancel</button></div>';
  openLayer(body);
  var di = document.getElementById("cardio-dist");
  if(di) di.addEventListener("change", function(){ sheet.distance = parseFloat(di.value)||0; });
  initSwipers();
}

/* swipeable value picker: selected value snaps to the centre and enlarges */
var SW_W = 64;
function swiper(label, kind, value, inc, unit, min){
  min = (min==null)?0:min;
  var maxV = kind==="reps" ? 60 : kind==="minutes" ? 180 : Math.max(value+200, 200);
  var vals = []; for(var v=min; v<=maxV; v+=inc){ vals.push(v); }
  if(vals.indexOf(value)<0){ vals.push(value); vals.sort(function(a,b){ return a-b; }); }
  var idx = vals.indexOf(value);
  var items = vals.map(function(v){ return '<div class="cv" data-act="cv" data-v="'+v+'">'+v+'</div>'; }).join("");
  var ic = kind==="weight" ? "weight" : kind==="reps" ? "refresh" : "clock";
  return '<div class="swipe-label">'+icon(ic)+esc(label)+' <small>('+esc(unit)+')</small></div>'+
    '<div class="swiper" data-kind="'+kind+'" data-idx="'+idx+'">'+
      '<div class="centerbox"></div><div class="track">'+items+'</div></div>';
}
function initSwipers(){
  document.querySelectorAll(".swiper").forEach(function(sw){
    var kind = sw.getAttribute("data-kind");
    var track = sw.querySelector(".track");
    var items = track.querySelectorAll(".cv");
    var idx = parseInt(sw.getAttribute("data-idx"),10) || 0;
    function mark(i){ items.forEach(function(el,j){ el.classList.toggle("sel", j===i); el.classList.toggle("near", Math.abs(j-i)===1); }); }
    track.scrollLeft = idx*SW_W; mark(idx);
    var t;
    track.addEventListener("scroll", function(){
      var i = Math.max(0, Math.min(items.length-1, Math.round(track.scrollLeft/SW_W)));
      mark(i);
      clearTimeout(t);
      t = setTimeout(function(){ var el=items[i]; if(el) sheet[kind] = parseInt(el.getAttribute("data-v"),10); }, 70);
    });
  });
}

/* ---- Exercise Complete modal ---- */
var DIFFS = [
  { id:"too-easy", label:"Too Easy",  sub:"Barely felt it",       img:"images/faces/Too Easy.png" },
  { id:"easy",     label:"Easy",      sub:"Comfortable",          img:"images/faces/Easy.png" },
  { id:"good",     label:"Good",      sub:"Just right",           img:"images/faces/Good.png" },
  { id:"hard",     label:"Hard",      sub:"Real effort",          img:"images/faces/Hard.png" },
  { id:"too-hard", label:"Too Hard",  sub:"Couldn't finish well", img:"images/faces/Too Hard.png" }
];
function diffLabel(id){ var d=DIFFS.find(function(x){return x.id===id;}); return d?d.label:id; }
function diffFace(id){ var d=DIFFS.find(function(x){return x.id===id;}); return d ? '<img class="face" src="'+d.img+'" alt="">' : ''; }
function faceSvg(kind){
  var mouth = { grin:'<path d="M11 19 q6 6 12 0" stroke="#7A4A2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    smile:'<path d="M12 19 q5 4 10 0" stroke="#7A4A2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    "neutral-happy":'<path d="M12 19 q5 2.5 10 0" stroke="#7A4A2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    effort:'<path d="M12 20 h10" stroke="#7A4A2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    strain:'<path d="M12 21 q5 -3 10 0" stroke="#7A4A2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>' }[kind];
  return '<svg viewBox="0 0 34 34" class="face"><circle cx="17" cy="17" r="16" fill="var(--accent-soft)"/>'+
    '<circle cx="12" cy="14" r="1.8" fill="#3A2A1E"/><circle cx="22" cy="14" r="1.8" fill="#3A2A1E"/>'+mouth+'</svg>';
}
var pendingDiff = null;
function openExerciseComplete(exIdx){
  var x = S.active.exercises[exIdx];
  var e = eqById(x.eqId);
  pendingDiff = { exIdx:exIdx, value:"good" };
  var lastSet = x.sets[x.sets.length-1];
  var lastTxt = lastSet ? (e.type==="cardio"? (lastSet.minutes+" min · "+(lastSet.distance||0)+" mi") : (lastSet.weight+" lb · "+lastSet.reps+" reps")) : "No sets logged";
  var body = '<div class="scrim" data-act="close-modal"></div><div class="modal-wrap"><div class="modal approved-complete-modal">'+
    '<button class="approved-modal-close" data-act="close-modal" aria-label="Close">'+icon("close")+'</button>'+
    '<h2>Exercise Complete</h2><p class="muted mt8">How did that feel?</p>'+
    '<div class="approved-complete-machine"><img src="'+e.img+'" alt=""><div><strong>'+esc(e.name)+'</strong>'+
      '<span>Last set: '+esc(lastTxt)+'</span></div></div>'+
    '<div class="diff-grid approved-face-row">'+ DIFFS.map(function(d){
      return '<button class="diff-opt '+(d.id==="good"?"sel":"")+'" data-act="select-diff" data-i="'+exIdx+'" data-d="'+d.id+'">'+
        '<img class="face" src="'+d.img+'" alt=""><span class="d-name">'+d.label+'</span></button>';
    }).join("") +'</div>'+
    '<p class="hint approved-diff-help">Your input helps personalize future suggestions.</p>'+
    '<button class="btn btn-primary" data-act="save-diff">Save</button>'+
    '<button class="btn approved-tertiary" data-act="skip-diff" data-i="'+exIdx+'">Skip</button>'+
  '</div></div>';
  openLayer(body);
}

/* ---- Finish Workout summary (full screen overlay) ---- */
function openFinishSummary(){
  var a = S.active;
  var done = a.exercises.filter(function(x){ return x.sets.length; });
  var totalSets = done.reduce(function(s,x){ return s+x.sets.length; },0);
  var machines = new Set(done.map(function(x){ return x.eqId; }));
  var body = '<div class="overlay-screen"><div class="ov-scroll">'+
    '<div class="shead"><span class="shead-spacer"></span><h2 style="text-align:center">Workout Summary</h2>'+
    '<button class="iconbtn" data-act="close-overlay" aria-label="Close">'+icon("close")+'</button></div>'+
    '<p class="center" style="color:var(--accent-strong);font-weight:700;margin-top:-2px">You completed '+plural(done.length,"exercise")+'.</p>';

  /* coach card */
  body += '<div class="card coach-card mt16"><div class="coach-ava">'+coachBust()+'</div>'+
    '<div class="grow"><div class="t-label" style="color:var(--accent-strong)">Your coach</div>'+
      '<p style="font-weight:700;font-size:14px;margin-top:2px">'+esc(summaryNote(done))+'</p></div></div>';

  /* exercise rows: sets × reps + weight */
  body += '<div class="label">Exercises</div>';
  if(!done.length){
    body += '<div class="card center"><p class="hint">No sets were logged. Add a set before saving, or just save an empty session.</p></div>';
  }
  done.forEach(function(x){
    var e = eqById(x.eqId);
    var nSets = x.sets.length;
    var reps = x.sets.length ? x.sets[x.sets.length-1].reps : 0;
    var topW = x.sets.length ? Math.max.apply(null, x.sets.map(function(s){ return s.weight||0; })) : 0;
    var mid, right;
    if(e.type==="cardio"){
      mid = '<div class="v">'+nSets+'</div><div class="l">Rounds</div>';
      right = '<div class="v">'+(x.sets.length?x.sets[x.sets.length-1].minutes:0)+' min</div><div class="l">Time</div>';
    } else {
      mid = '<div class="v">'+nSets+' × '+reps+'</div><div class="l">Sets × Reps</div>';
      right = '<div class="v">'+topW+' lb</div><div class="l">Weight</div>';
    }
    body += '<div class="card sum-row mb12"><div class="thumb sm"><img src="'+e.img+'" alt=""></div>'+
      '<div class="grow" style="font-weight:700">'+esc(e.name)+'</div>'+
      '<div class="sum-col">'+mid+'</div><div class="sum-col">'+right+'</div></div>';
  });

  body += '<div class="stat-grid two approved-summary-stats mt16">'+
    '<div class="stat"><div class="n">'+machines.size+'</div><div class="l">Machines used</div></div>'+
    '<div class="stat"><div class="n">'+totalSets+'</div><div class="l">Total sets</div></div></div>';

  body += '<div class="approved-summary-actions">'+
    '<button class="btn btn-primary" data-act="save-workout">'+icon("check")+'Save Workout</button>'+
    '<button class="btn btn-outline" data-act="close-overlay">View Details</button></div>';
  body += '</div></div>';
  openLayer(body);
}
function summaryNote(done){
  if(!done.length) return "Even showing up matters. Next time, log a set or two and watch your progress build.";
  var notes = ["Consistency like this is exactly how beginners get strong.",
    "You moved with control today — that's the habit that lasts.",
    "Proud of you for finishing. Rest up and come back ready.",
    "Great balance of work today. Keep this rhythm going."];
  return notes[done.length % notes.length];
}

/* ---- Machine Help (full-screen overlay) ---- */
function openMachineHelp(id){
  var e = eqById(id);
  var body = '<div class="overlay-screen"><div class="ov-scroll">'+
    '<div class="shead"><h2>'+esc(e.name)+'</h2><span class="grow"></span>'+
    '<button class="iconbtn" data-act="close-overlay" aria-label="Close">'+icon("close")+'</button></div>';

  body += '<div class="help-hero"><div class="hh-photo"><img src="'+e.imgUse+'" alt=""></div>'+
    '<div><div class="row wrap gap8 mb6">'+e.muscles.slice(0,3).map(function(m){return '<span class="tag tag-muscle">'+esc(MUSCLE_NAMES[m]||m)+'</span>';}).join("")+'</div>'+
    '<div class="tag tag-accent">'+icon("target")+esc(e.category)+'</div></div></div>';

  body += '<div class="help-sec"><div class="label no-line">'+icon("info")+'How to use</div><div class="card">';
  e.instructions.forEach(function(s,i){ body += '<div class="help-step"><span class="step-num">'+(i+1)+'</span><p style="font-size:14px;padding-top:2px">'+esc(s)+'</p></div>'; });
  body += '</div></div>';

  body += '<div class="help-sec"><div class="label">Common mistakes</div><div class="card">';
  e.mistakes.forEach(function(m){ body += '<div class="help-bullet"><span class="bdot warn">'+icon("close")+'</span><p style="font-size:14px">'+esc(m)+'</p></div>'; });
  body += '</div></div>';

  body += '<div class="help-sec"><div class="label">Beginner tip</div>'+
    '<div class="card coach-card"><div class="coach-ava">'+coachBust()+'</div><div class="grow"><p style="font-weight:700;font-size:14px">'+esc(e.tip)+'</p></div></div></div>';
  body += '</div></div>';
  openLayer(body);
}

/* ---- Machine History (full-screen overlay) ---- */
function openMachineHistory(id){
  var e = eqById(id);
  var sessions = machineSessions(id);
  var last = S.lastUsed[id];
  var body = '<div class="overlay-screen"><div class="ov-scroll">'+
    '<div class="shead"><h2>'+esc(e.name)+'</h2><span class="grow"></span>'+
    '<button class="iconbtn" data-act="close-overlay" aria-label="Close">'+icon("close")+'</button></div>';

  body += '<div class="help-hero"><div class="hh-photo"><img src="'+e.img+'" alt=""></div>'+
    '<div><div class="row wrap gap8 mb6">'+e.muscles.slice(0,3).map(function(m){return '<span class="tag tag-muscle">'+esc(MUSCLE_NAMES[m]||m)+'</span>';}).join("")+'</div>'+
    (last? '<div class="tag tag-accent">'+icon("clock")+(e.type==="cardio"? (last.minutes+" min") : (last.weight+" lb · "+last.reps+" reps"))+'</div>' : '<div class="tag tag-muscle">No sessions yet</div>')+'</div></div>';

  if(sessions.length){
    body += '<div class="label">Progress</div><div class="card">'+ sparkChart(sessions, e) +'</div>';
    body += '<div class="label">Recent sessions</div>';
    sessions.slice().reverse().forEach(function(s){
      body += '<div class="card row gap12 mb12"><div class="li-ico">'+icon("calendar")+'</div>'+
        '<div class="grow"><div style="font-weight:700">'+relDay(s.date)+'</div>'+
        '<div class="li-sub">'+esc(s.summary)+'</div></div>'+(s.diff?'<span class="tag tag-accent">'+esc(diffLabel(s.diff))+'</span>':'')+'</div>';
    });
    var sugg = progressionSuggestion(e);
    if(sugg) body += '<div class="inline-tip mt12"><div class="coach-ava">'+coachBust()+'</div><div><div class="t-label">Suggested next</div><p>'+esc(sugg)+'</p></div></div>';
  } else {
    body += '<div class="empty"><div class="e-ico">'+icon("chart")+'</div><h3>No history yet</h3><p>Log this machine in a workout to see your progress here.</p></div>';
  }
  body += '</div></div>';
  openLayer(body);
}
function machineSessions(id){
  var e = eqById(id), out=[];
  S.history.forEach(function(w){
    w.exercises.forEach(function(x){
      if(x.eqId!==id || !x.sets.length) return;
      var val, sum;
      if(e.type==="cardio"){ val = x.sets[x.sets.length-1].minutes; sum = plural(x.sets.length,"round")+" · "+val+" min"; }
      else { val = Math.max.apply(null,x.sets.map(function(s){return s.weight;})); sum = plural(x.sets.length,"set")+" · top "+val+" lb"; }
      out.push({ date:w.date, val:val, summary:sum, diff:x.difficulty });
    });
  });
  return out;
}
function sparkChart(sessions, e){
  var vals = sessions.map(function(s){return s.val;});
  var max = Math.max.apply(null,vals)||1;
  return '<div class="spark">'+ sessions.slice(-6).map(function(s){
    var hpct = Math.round(s.val/max*100);
    return '<div class="bar" style="height:'+Math.max(12,hpct)+'%"><span>'+s.val+'</span><small>'+fmtDate(s.date)+'</small></div>';
  }).join("") +'</div><div style="height:20px"></div>';
}

/* ---- Badge earned popup ---- */
var badgeQueue=[];
function showBadgeEarned(b){
  var body = '<div class="scrim"></div><div class="modal-wrap"><div class="modal">'+
    confettiHTML()+
    '<div style="margin:0 auto 12px;text-align:center">'+medalArt(b,{size:"sz-lg"})+'</div>'+
    '<div class="tag tag-gold" style="margin:0 auto">Badge Earned</div>'+
    '<h2 class="mt12">'+esc(b.name)+'</h2><p class="muted mt8">'+esc(b.blurb)+'</p>'+
    '<button class="btn btn-primary mt20" data-act="badge-nice">Nice!</button>'+
    '<button class="btn btn-soft btn-sm mt12" data-act="badge-view">View Badges</button>'+
  '</div></div>';
  openLayer(body);
}
function confettiHTML(){
  var cols=["var(--accent)","var(--gold)","var(--grad-2)","#45B26B","#F4892F"]; var s="";
  for(var i=0;i<16;i++){ s+='<span class="conf" style="left:'+(8+Math.random()*84)+'%;background:'+cols[i%cols.length]+';animation-delay:'+(Math.random()*0.5)+'s"></span>'; }
  return s;
}

/* ---- Badge detail sheet ---- */
function openBadgeDetail(id){
  var b = BADGES.find(function(x){return x.id===id;});
  var stats = computeBadgeStats();
  var cur = b.progress(stats), pct=Math.round(cur/b.goal*100);
  var got = !!S.badges[id];
  var body = '<div class="scrim" data-act="close-sheet"></div><div class="sheet"><div class="sheet-grab"></div>'+
    '<div class="row gap12 mb12">'+medalArt(b,{size:"sz-lg",locked:!got})+
    '<div class="grow"><h2>'+esc(b.name)+'</h2>'+
      (got? '<span class="tag tag-good mt8" style="display:inline-flex">'+icon("check")+'Earned '+esc(relDay(S.badges[id]))+'</span>'
          : '<span class="tag tag-accent mt8" style="display:inline-flex">'+icon("lock")+'In progress</span>')+'</div></div>';
  if(!got){ body += '<div class="pbar mb6"><i style="width:'+pct+'%"></i></div><div class="li-sub mb12">'+cur+' / '+b.goal+'</div>'; }
  body += '<div class="label no-line">Why it matters</div><p class="muted mb12" style="font-size:14px">'+esc(b.why)+'</p>';
  body += '<div class="label no-line">How to earn</div><p class="muted" style="font-size:14px">'+esc(b.how)+'</p>';
  body += '<button class="btn btn-soft mt20" data-act="close-sheet">Close</button></div>';
  openLayer(body);
}

/* ---- 3-dot menus ---- */
function openExMenu(idx, el){
  var r = el.getBoundingClientRect(), pr = document.getElementById("phone").getBoundingClientRect();
  var body = '<div class="scrim" data-act="close-menu" style="background:transparent"></div>'+
    '<div class="menu-pop" style="top:'+(r.bottom-pr.top+4)+'px;right:'+(pr.right-r.right)+'px">'+
    '<button data-act="edit-exercise" data-i="'+idx+'">'+icon("edit")+'Edit sets</button>'+
    '<button class="danger" data-act="remove-exercise" data-i="'+idx+'">'+icon("trash")+'Remove from workout</button></div>';
  openLayer(body);
}
function openPlanMenu(id, el){
  var r = el.getBoundingClientRect(), pr = document.getElementById("phone").getBoundingClientRect();
  var body = '<div class="scrim" data-act="close-menu" style="background:transparent"></div>'+
    '<div class="menu-pop" style="top:'+(r.bottom-pr.top+4)+'px;right:'+(pr.right-r.right)+'px">'+
    '<button data-act="edit-plan" data-id="'+id+'">'+icon("edit")+'Edit plan</button>'+
    '<button data-act="start-plan" data-id="'+id+'">'+icon("play")+'Start workout</button>'+
    '<button class="danger" data-act="delete-plan" data-id="'+id+'">'+icon("trash")+'Delete plan</button></div>';
  openLayer(body);
}

/* ============================ 8. ONBOARDING =========================== */
var onb = null;
function startOnboarding(){
  onb = { step:0, name:S.profile.name, theme:S.theme, avatar:{id:S.avatar.id,skin:S.avatar.skin}, fav:S.fav.slice(), hidden:S.hidden.slice() };
  renderOnb();
}
var ONB_STEPS = ["welcome","name","theme","avatar","favorites","backup","done"];
function renderOnb(){
  var step = ONB_STEPS[onb.step];
  var sh = themeSwatchHex(onb.theme);
  document.body.setAttribute("data-theme", onb.theme);
  var body = '<div class="onb"><div class="onb-prog">'+
    ONB_STEPS.map(function(_,i){ return '<i class="'+(i<=onb.step?"on":"")+'"></i>'; }).join("")+'</div>'+
    '<div class="onb-body">';

  if(step==="welcome"){
    body += '<div class="onb-illus">'+coachBust()+'</div>'+
      '<h1 class="center">Welcome to Coach</h1>'+
      '<p class="center muted mt12" style="padding:0 10px">Your friendly, beginner-first gym buddy. I\'ll help you log machines, remember your weights, and celebrate your wins — all saved right on your phone.</p>'+
      '<div class="card mt20"><div class="help-bullet"><span class="bdot good">'+icon("check")+'</span><p>No login, no cloud — your data stays with you.</p></div>'+
      '<div class="help-bullet"><span class="bdot good">'+icon("check")+'</span><p>I remember your last weights so you don\'t have to.</p></div>'+
      '<div class="help-bullet"><span class="bdot good">'+icon("check")+'</span><p>Step-by-step machine guides whenever you need them.</p></div></div>';
  }
  if(step==="name"){
    body += '<h1>What should I<br>call you?</h1><p class="muted mt8">This shows up on your home screen.</p>'+
      '<div class="field mt20"><span>Your name</span><input class="in" id="onb-name" placeholder="e.g. Atiya" value="'+esc(onb.name)+'"></div>';
  }
  if(step==="theme"){
    body += '<h1>Pick your color</h1><p class="muted mt8">Set the vibe — you can change it anytime.</p>'+
      '<div class="card hero mt16" style="min-height:120px"><div class="hero-blob"></div><div class="hero-text"><div class="tag tag-accent" style="align-self:flex-start">'+cap(onb.theme)+'</div><h2 class="mt8">Looking good</h2></div><div class="hero-coach" style="width:96px"><img src="images/coach/coach-hero.png" alt=""></div></div>'+
      '<div class="theme-grid mt20">'+ THEMES.map(function(t){ return '<button class="swatch '+(t.id===onb.theme?"sel":"")+'" data-act="onb-theme" data-id="'+t.id+'" style="background:'+t.c+'"><small>'+cap(t.id)+'</small></button>'; }).join("")+'</div>';
  }
  if(step==="avatar"){
    body += '<h1>Choose your<br>gym buddy</h1><p class="muted mt8">Pick an avatar and skin tone.</p>'+
      '<div class="ava-grid mt16">'+ AVATARS.map(function(a){ return '<button class="ava-pick '+(a.id===onb.avatar.id?"sel":"")+'" data-act="onb-ava" data-id="'+a.id+'">'+AVATAR_SVG(a.id,onb.avatar.skin,sh)+'</button>'; }).join("")+'</div>'+
      '<div class="label">Skin tone</div><div class="tone-row">'+ SKIN_TONES.map(function(t){ return '<button class="tone '+(t.hex===onb.avatar.skin?"sel":"")+'" data-act="onb-tone" data-hex="'+t.hex+'" style="background:'+t.hex+'"></button>'; }).join("")+'</div>';
  }
  if(step==="favorites"){
    body += '<h1>Favorite a few<br>machines</h1><p class="muted mt8">Tap the ones you already like — they\'ll be quick to find. (Optional)</p>'+
      '<div class="mt16">'+ EQUIPMENT.filter(function(e){return ["Strength Machines","Cardio","Free Weights"].indexOf(e.category)>=0;}).slice(0,10).map(function(e){
        var on = onb.fav.indexOf(e.id)>=0;
        return '<div class="eq-row"><div class="thumb sm"><img src="'+e.img+'" alt=""></div><div class="grow"><div style="font-weight:700;font-size:14px">'+esc(e.name)+'</div><div class="li-sub">'+esc(musclesLabel(e))+'</div></div>'+
          '<span class="icon-act '+(on?"fav":"")+'" data-act="onb-fav" data-id="'+e.id+'">'+(on?icon("starFilled"):icon("star"))+'</span></div>';
      }).join("")+'</div>';
  }
  if(step==="backup"){
    body += '<div class="onb-illus">'+icon("download")+'</div>'+
      '<h1 class="center">A quick heads-up</h1>'+
      '<p class="center muted mt12" style="padding:0 6px">Your workouts save only on this device. Every so often, pop into <b>Backup &amp; Restore</b> to export a copy — so you never lose your progress.</p>'+
      '<div class="card mt20 coach-card"><div class="coach-ava">'+coachBust()+'</div><div class="grow"><p style="font-weight:700;font-size:13.5px">I\'ll remind you now and then. You can back up anytime from Profile.</p></div></div>';
  }
  if(step==="done"){
    body += '<div class="onb-illus"><img src="images/coach/coach-hero.png" style="width:70%;margin-bottom:-4px" alt=""></div>'+
      '<h1 class="center">You\'re all set,<br>'+esc(onb.name||"friend")+'!</h1>'+
      '<p class="center muted mt12">Let\'s make today a great one. Tap below and I\'ll guide your first workout.</p>';
  }

  body += '</div><div class="onb-foot">';
  if(onb.step>0 && step!=="done") body += '<button class="btn btn-ghost" data-act="onb-back" style="flex:.5">Back</button>';
  if(step!=="done"){
    body += '<button class="btn btn-soft" data-act="onb-skip" style="flex:.5">Skip</button>';
    body += '<button class="btn btn-primary" data-act="onb-next">'+(onb.step===0?"Get started":"Continue")+'</button>';
  } else {
    body += '<button class="btn btn-primary" data-act="onb-finish">'+icon("play")+'Start my first workout</button>';
  }
  body += '</div></div>';
  onbHost.innerHTML = body;

  var ni = document.getElementById("onb-name");
  if(ni) ni.addEventListener("input", function(){ onb.name = ni.value; });
}
function themeSwatchHex(id){ var t=THEMES.find(function(x){return x.id===id;}); return t?t.c:"#7B5EA7"; }

/* ============================ 9. BADGES ENGINE ======================== */
function computeBadgeStats(){
  var machines={}, cardioDone=false, legDay=false, monthCount={}, dayset={};
  var thisMonth = new Date().toISOString().slice(0,7);
  S.history.forEach(function(w){
    var mon = w.date.slice(0,7);
    monthCount[mon] = (monthCount[mon]||0)+1;
    dayset[w.date]=1;
    var hasLeg=false;
    w.exercises.forEach(function(x){
      if(!x.sets.length) return;
      machines[x.eqId]=1;
      var e=eqById(x.eqId);
      if(e && e.type==="cardio") cardioDone=true;
      if(e && (e.muscles.indexOf("quads")>=0||e.muscles.indexOf("glutes")>=0||e.muscles.indexOf("hamstrings")>=0)) hasLeg=true;
    });
    if(hasLeg) legDay=true;
  });
  var weekAgo = Date.now()-6*86400000;
  var distinctDaysThisWeek = Object.keys(dayset).filter(function(d){ return new Date(d+"T12:00").getTime()>=weekAgo; }).length;
  return {
    workoutCount: S.history.length,
    planCount: S.plans.length,
    cardioDone: cardioDone?1:0,
    legDay: legDay?1:0,
    uniqueMachines: Object.keys(machines).length,
    workoutsThisMonth: monthCount[thisMonth]||0,
    distinctDaysThisWeek: distinctDaysThisWeek
  };
}
function checkBadges(){
  var stats = computeBadgeStats();
  var newly=[];
  BADGES.forEach(function(b){
    if(!S.badges[b.id] && b.progress(stats) >= b.goal){
      S.badges[b.id] = todayISO();
      newly.push(b);
    }
  });
  if(newly.length){ save(); badgeQueue = newly.slice(); showNextBadge(); }
  return newly;
}
function showNextBadge(){
  if(!badgeQueue.length){ return; }
  showBadgeEarned(badgeQueue[0]);
}
function lastEarnedBadge(){
  var ids = Object.keys(S.badges);
  if(!ids.length) return null;
  ids.sort(function(a,b){ return (S.badges[a]<S.badges[b])?1:-1; });
  return BADGES.find(function(x){ return x.id===ids[0]; });
}

/* ============================ WORKOUT LOGIC =========================== */
function startWorkout(name, planId, eqIds){
  S.active = { id:uid(), name:name||"Quick Workout", planId:planId||null, startedAt:Date.now(),
    exercises:(eqIds||[]).map(function(id){ return { eqId:id, done:false, sets:[], difficulty:null }; }) };
  save();
}
function addMachineToActive(id){
  if(!S.active) startWorkout("Quick Workout");
  if(S.active.exercises.some(function(x){return x.eqId===id;})) return false;
  S.active.exercises.push({ eqId:id, done:false, sets:[], difficulty:null });
  save();
  return true;
}
function saveWorkout(){
  var a = S.active;
  var done = a.exercises.filter(function(x){ return x.sets.length; });
  var w = { id:a.id, name:a.name, date:todayISO(),
    exercises: done.map(function(x){ return { eqId:x.eqId, sets:x.sets.slice(), difficulty:x.difficulty }; }),
    note: summaryNote(done) };
  S.history.push(w);
  /* keep plan in sync if started from a plan */
  if(a.planId){
    var p = S.plans.find(function(x){ return x.id===a.planId; });
    if(p) { p.exercises = a.exercises.map(function(x){ return x.eqId; }); }
  }
  S.active = null;
  save();
  return w;   /* badge check happens after the summary overlay closes */
}

/* ============================ 10. ACTION DISPATCH ===================== */
var ACTIONS = {
  tab: function(el,d){ goTab(d.tab); },
  back: function(){ back(); },
  goto: function(el,d){ go(d.name, d.id?{id:d.id}:{}); },
  "goto-name": function(el,d){ go(d.name,{}); },

  "start-workout": function(){ startWorkout("Quick Workout"); go("workout",{}); go("addExercise",{}); },
  "suggest-start": function(){ var s=suggestToday(); startWorkout("Full Body Beginner",null,[s.eqId]); go("workout",{}); },

  "add-exercise": function(){ go("addExercise",{}); },
  cat: function(el,d){ if(d.cat==="favorites"){ addState.favOnly=true; } else { addState.favOnly=false; addState.cat=d.cat; }
    document.getElementById("cat-chips").innerHTML=catChips(); document.getElementById("eq-results").innerHTML=resultsHTML(); },
  "add-machine": function(el,d){ if(!S.active) startWorkout("Quick Workout"); addMachineToActive(d.id); go("workout",{}); toast("Added to workout"); },
  "toggle-fav": function(el,d){ toggleFav(d.id); rerenderLists(); },
  "toggle-hide": function(el,d){ toggleHide(d.id); document.getElementById("mg-list").innerHTML=manageList(); },

  "add-set": function(el,d){ openAddSet(+d.i); },
  "del-set": function(el,d){ delSet(+d.i, +d.s); },
  "dup-set-row": function(el,d){ dupSetRow(+d.i, +d.s); },
  "close-sheet": function(){ closeLayer(); },
  "cv": function(el){ var sw=el.closest(".swiper"); if(!sw) return; var track=sw.querySelector(".track"); var items=[].slice.call(track.querySelectorAll(".cv")); var i=items.indexOf(el); if(i>=0) track.scrollTo({left:i*64, behavior:"smooth"}); },
  "car-step": function(el,d){ carStep(d.key, +d.step); },
  "car-set": function(el,d){ sheet[d.key]=+d.v; renderSheet(); },
  "sheet-intensity": function(el,d){ sheet.intensity=d.i; renderSheet(); },
  "dup-set": function(){ saveSet(true); },
  "save-set": function(){ saveSet(false); },

  "done-exercise": function(el,d){ openExerciseComplete(+d.i); },
  "close-modal": function(){ closeLayer(); },
  "select-diff": function(el,d){
    pendingDiff = { exIdx:+d.i, value:d.d };
    document.querySelectorAll(".approved-face-row .diff-opt").forEach(function(x){ x.classList.remove("sel"); });
    el.classList.add("sel");
  },
  "save-diff": function(){ if(pendingDiff) finishExercise(pendingDiff.exIdx, pendingDiff.value); },
  "skip-diff": function(el,d){ finishExercise(+d.i, null); },

  "ex-menu": function(el,d){ openExMenu(+d.i, el); },
  "close-menu": function(){ closeLayer(); },
  "edit-exercise": function(el,d){ closeLayer(); openAddSet(+d.i); },
  "remove-exercise": function(el,d){ removeExercise(+d.i); },
  "make-current": function(el,d){ makeCurrent(+d.i); },

  "machine-help": function(el,d){ openMachineHelp(d.id); },
  "machine-history": function(el,d){ openMachineHistory(d.id); },
  "close-overlay": function(){ closeLayer(); },

  "finish-workout": function(){ if(!S.active||!S.active.exercises.some(function(x){return x.sets.length;})){ toast("Log at least one set first"); return; } openFinishSummary(); },
  "save-workout": function(){ saveWorkout(); closeLayer(); go("home",{}); var earned=checkBadges(); if(!earned.length) toast("Workout saved"); },

  /* plans */
  "new-plan": function(){ builder=null; go("planBuilder",{}); },
  "builder-add": function(){ go("addExercise",{forPlan:true}); },
  "start-plan": function(el,d){ var p=S.plans.find(function(x){return x.id===d.id;}); if(p){ startWorkout(p.name,p.id,p.exercises.slice()); closeLayer(); go("workout",{}); } },
  "fav-plan": function(el,d){ var p=S.plans.find(function(x){return x.id===d.id;}); if(p){ p.favorite=!p.favorite; save(); render(); } },
  "plan-menu": function(el,d){ openPlanMenu(d.id, el); },
  "edit-plan": function(el,d){ closeLayer(); builder=null; go("planBuilder",{id:d.id}); },
  "delete-plan": function(el,d){ S.plans=S.plans.filter(function(x){return x.id!==d.id;}); save(); closeLayer(); render(); toast("Plan deleted"); },
  "builder-remove": function(el,d){ builder.exercises.splice(+d.i,1); render(); },
  "builder-up": function(el,d){ var i=+d.i; if(i>0){ var t=builder.exercises[i]; builder.exercises[i]=builder.exercises[i-1]; builder.exercises[i-1]=t; render(); } },
  "builder-down": function(el,d){ var i=+d.i; if(i<builder.exercises.length-1){ var t=builder.exercises[i]; builder.exercises[i]=builder.exercises[i+1]; builder.exercises[i+1]=t; render(); } },
  "builder-clear": function(){ builder.exercises=[]; render(); },
  "builder-save": function(){ saveBuilder(); },

  /* history / detail / calendar */
  "open-workout": function(el,d){ closeLayer(); go("workoutDetail",{id:d.id}); },
  "cal-prev": function(){ calCursor.m--; if(calCursor.m<0){calCursor.m=11;calCursor.y--;} render(); },
  "cal-next": function(){ calCursor.m++; if(calCursor.m>11){calCursor.m=0;calCursor.y++;} render(); },
  "muscle-view": function(el,d){ muscleView=d.v; render(); },

  /* profile sub-nav handled by goto; settings prefs */
  "pref-step": function(el,d){ prefStep(d.key, +d.step); },
  "pref-toggle": function(el,d){ S.defaults[d.key]=!S.defaults[d.key]; save(); render(); },
  "save-defaults": function(){ save(); toast("Defaults saved"); back(); },
  "reset-defaults": function(){ S.defaults=Object.assign({},DEFAULT_STATE.defaults); save(); render(); toast("Reset to recommended"); },

  /* theme */
  "theme-pick": function(el,d){ themeDraft=d.id; render(); },
  "apply-theme": function(){ S.theme=themeDraft; document.body.setAttribute("data-theme",S.theme); save(); themeDraft=null; toast("Theme applied"); back(); },

  /* avatar */
  "ava-pick": function(el,d){ avatarDraft.id=d.id; render(); },
  "ava-tone": function(el,d){ avatarDraft.skin=d.hex; render(); },
  "apply-avatar": function(){ S.avatar={id:avatarDraft.id,skin:avatarDraft.skin}; save(); avatarDraft=null; toast("Avatar saved"); back(); },

  /* manage equipment */
  "mg-filter": function(el,d){ manageState.filter=d.f; document.querySelectorAll('[data-act="mg-filter"]').forEach(function(b){ b.classList.toggle("active", b.getAttribute("data-f")===d.f); }); document.getElementById("mg-list").innerHTML=manageList(); },

  /* backup */
  "export-data": function(){ exportData(); },
  "import-data": function(){ var f=document.getElementById("import-file"); if(f) f.click(); else { go("backup",{}); setTimeout(function(){document.getElementById("import-file").click();},120); } },
  "clear-data": function(){ confirmClear(); },

  /* badges */
  "badge-tab": function(el,d){ badgeTab=d.t; render(); },
  "badge-detail": function(el,d){ openBadgeDetail(d.id); },
  "badge-nice": function(){ badgeQueue.shift(); closeLayer(); if(badgeQueue.length) setTimeout(showNextBadge,180); },
  "badge-view": function(){ badgeQueue=[]; closeLayer(); go("badges",{}); },

  /* onboarding */
  onboarding: function(){ startOnboarding(); },
  "onb-next": function(){ onbNext(); },
  "onb-back": function(){ onb.step=Math.max(0,onb.step-1); renderOnb(); },
  "onb-skip": function(){ finishOnboarding(true); },
  "onb-theme": function(el,d){ onb.theme=d.id; renderOnb(); },
  "onb-ava": function(el,d){ onb.avatar.id=d.id; renderOnb(); },
  "onb-tone": function(el,d){ onb.avatar.skin=d.hex; renderOnb(); },
  "onb-fav": function(el,d){ var i=onb.fav.indexOf(d.id); if(i>=0)onb.fav.splice(i,1); else onb.fav.push(d.id); renderOnb(); },
  "onb-finish": function(){ finishOnboarding(false); },

  undo: function(){ if(undoFn){ undoFn(); undoFn=null; toastEl.classList.remove("show"); } }
};

/* ---- action helpers ---- */
function toggleFav(id){ var i=S.fav.indexOf(id); if(i>=0)S.fav.splice(i,1); else S.fav.push(id); applyEquipmentFlags(); save(); }
function toggleHide(id){ var i=S.hidden.indexOf(id); if(i>=0)S.hidden.splice(i,1); else S.hidden.push(id); applyEquipmentFlags(); save(); }
function rerenderLists(){
  var r=document.getElementById("eq-results"); if(r) r.innerHTML=resultsHTML();
  var m=document.getElementById("mg-list"); if(m) m.innerHTML=manageList();
  if(route.name==="plans") render();
}
function prefStep(key,delta){
  var min = { firstWeight:0, firstReps:1, firstSets:1, firstCardioMin:5, weightInc:5, repInc:1, cardioInc:1 };
  S.defaults[key] = Math.max(min[key]!=null?min[key]:0, (S.defaults[key]||0)+delta);
  save(); render();
}
function carStep(key, delta){
  if(sheet.cardio && key==="minutes"){ sheet.minutes = Math.max(0, sheet.minutes+delta); }
  else if(!sheet.cardio && key==="weight"){ sheet.weight = Math.max(0, sheet.weight+delta); }
  else if(!sheet.cardio && key==="reps"){ sheet.reps = Math.max(1, sheet.reps+delta); }
  renderSheet();
}
function saveSet(duplicate){
  var x = S.active.exercises[sheet.exIdx];
  var e = eqById(x.eqId);
  var set;
  if(sheet.cardio){
    var di=document.getElementById("cardio-dist"); if(di) sheet.distance=parseFloat(di.value)||0;
    set = { minutes:sheet.minutes, distance:sheet.distance, intensity:sheet.intensity };
    recordLast(e, { minutes:set.minutes, distance:set.distance, intensity:set.intensity });
  } else {
    set = { weight:sheet.weight, reps:sheet.reps };
    recordLast(e, { weight:set.weight, reps:set.reps });
  }
  x.sets.push(set);
  save();
  if(duplicate){ x.sets.push(Object.assign({},set)); save(); }
  closeLayer();
  if(route.name!=="workout") go("workout",{}); else render();
  var removed=set;
  toast(duplicate?"2 sets added":"Set added", function(){ x.sets.pop(); if(duplicate)x.sets.pop(); save(); render(); });
}
function delSet(exIdx, setIdx){
  var x = S.active.exercises[exIdx];
  var removed = x.sets.splice(setIdx,1)[0];
  save(); render();
  toast("Set removed", function(){ x.sets.splice(setIdx,0,removed); save(); render(); });
}
function dupSetRow(exIdx, setIdx){
  var x = S.active.exercises[exIdx];
  var e = eqById(x.eqId);
  var s = Object.assign({}, x.sets[setIdx]);
  x.sets.push(s);
  recordLast(e, e.type==="cardio" ? { minutes:s.minutes, distance:s.distance, intensity:s.intensity } : { weight:s.weight, reps:s.reps });
  save(); render();
  toast("Set repeated", function(){ x.sets.pop(); save(); render(); });
}
function finishExercise(idx, diff){
  var x = S.active.exercises[idx];
  var e = eqById(x.eqId);
  x.done = true; x.difficulty = diff;
  if(diff) recordLast(e, {}, diff);
  save(); closeLayer();
  /* if more exercises remain, stay; else suggest finishing */
  render();
  var remaining = S.active.exercises.some(function(y){ return !y.done; });
  if(!remaining) toast("All exercises done — finish when ready");
}
function removeExercise(idx){
  var removed = S.active.exercises.splice(idx,1)[0];
  save(); closeLayer(); render();
  toast("Exercise removed", function(){ S.active.exercises.splice(idx,0,removed); save(); render(); });
}
function makeCurrent(idx){
  /* move chosen exercise to front of not-done so it becomes current */
  var ex = S.active.exercises;
  var item = ex.splice(idx,1)[0];
  var firstUndone = ex.findIndex(function(x){return !x.done;});
  if(firstUndone<0) firstUndone = ex.length;
  ex.splice(firstUndone,0,item);
  save(); render();
}
function saveBuilder(){
  var name = (builder.name||"").trim();
  if(!name){ toast("Give your plan a name"); return; }
  if(!builder.exercises.length){ toast("Add at least one exercise"); return; }
  if(builder.id){ var p=S.plans.find(function(x){return x.id===builder.id;}); if(p){ p.name=name; p.exercises=builder.exercises.slice(); } }
  else { S.plans.push({ id:uid(), name:name, favorite:false, exercises:builder.exercises.slice() }); }
  save(); builder=null; go("plans",{}); var earned=checkBadges(); if(!earned.length) toast("Plan saved");
}
function onbNext(){
  if(ONB_STEPS[onb.step]==="name" && !onb.name.trim()){ /* allow empty but nudge */ }
  onb.step++;
  renderOnb();
}
function finishOnboarding(skipped){
  S.profile.name = (onb.name||"").trim();
  S.theme = onb.theme; S.avatar={id:onb.avatar.id,skin:onb.avatar.skin};
  S.fav = onb.fav.slice(); S.hidden = onb.hidden.slice();
  S.setupDone = true; document.body.setAttribute("data-theme",S.theme);
  applyEquipmentFlags(); save();
  onbHost.innerHTML=""; onb=null;
  go("home",{});
  if(skipped) toast("You can finish setup anytime in Profile");
}

/* ---- backup / restore ---- */
function exportData(){
  S.backupDate = todayISO(); save();
  var blob = new Blob([JSON.stringify(S,null,2)], {type:"application/json"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href=url; a.download="coach-backup-"+todayISO()+".json"; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  toast("Backup downloaded");
  if(route.name==="backup"||route.name==="settings") render();
}
function handleImportFile(ev){
  var file = ev.target.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    try{
      var data = JSON.parse(reader.result);
      if(!data || typeof data!=="object") throw 0;
      Object.keys(DEFAULT_STATE).forEach(function(k){ if(data[k]!=null) S[k]=data[k]; });
      S.defaults = Object.assign({}, DEFAULT_STATE.defaults, data.defaults||{});
      applyEquipmentFlags(); document.body.setAttribute("data-theme",S.theme||"purple"); save();
      go("home",{}); toast("Backup restored");
    }catch(e){ toast("Couldn't read that file"); }
  };
  reader.readAsText(file);
  ev.target.value="";
}
function confirmClear(){
  var body = '<div class="scrim" data-act="close-modal"></div><div class="modal-wrap"><div class="modal">'+
    '<div class="medal" style="background:var(--danger-soft);color:var(--danger);margin:0 auto 10px">'+icon("trash")+'</div>'+
    '<h2>Clear all data?</h2><p class="muted mt8">This permanently deletes your profile, workouts, plans and badges from this device. This can\'t be undone.</p>'+
    '<button class="btn btn-danger mt20" data-act="really-clear">Yes, clear everything</button>'+
    '<button class="btn btn-soft btn-sm mt12" data-act="close-modal">Cancel</button></div></div>';
  openLayer(body);
}
ACTIONS["really-clear"] = function(){
  localStorage.removeItem(KEY);
  S = JSON.parse(JSON.stringify(DEFAULT_STATE));
  applyEquipmentFlags(); document.body.setAttribute("data-theme","purple");
  closeLayer(); startOnboarding();
};

/* global click delegation */
document.addEventListener("click", function(ev){
  var t = ev.target.closest("[data-act]");
  if(!t) return;
  var act = t.getAttribute("data-act");
  var fn = ACTIONS[act];
  if(fn){ ev.preventDefault(); fn(t, t.dataset); }
});

/* when returning from Add Exercise that was opened for a plan, route adds to builder */
var _origAddMachine = ACTIONS["add-machine"];
ACTIONS["add-machine"] = function(el,d){
  if(route.params && route.params.forPlan){
    if(builder.exercises.indexOf(d.id)<0){ builder.exercises.push(d.id); toast("Added to plan"); }
    document.getElementById("eq-results").innerHTML=resultsHTML();
    return;
  }
  _origAddMachine(el,d);
};
/* mark machine as in-builder for the add screen */
var _origMachineResult = machineResult;
machineResult = function(e){
  if(route.params && route.params.forPlan){
    var inPlan = builder && builder.exercises.indexOf(e.id)>=0;
    return '<div class="mres"><div class="thumb"><img src="'+e.img+'" alt=""></div>'+
      '<div class="grow"><div style="font-weight:700;font-size:14.5px">'+esc(e.name)+'</div><div class="li-sub">'+esc(musclesLabel(e))+'</div></div>'+
      '<span class="fav-star '+(e.favorite?"":"off")+'" data-act="toggle-fav" data-id="'+e.id+'">'+(e.favorite?icon("starFilled"):icon("star"))+'</span>'+
      '<button class="add-btn '+(inPlan?"added":"")+'" data-act="add-machine" data-id="'+e.id+'">'+(inPlan?icon("check"):icon("plus"))+'</button></div>';
  }
  return _origMachineResult(e);
};

/* Add Exercise back button should return to builder if forPlan */
var _origBack = back;
back = function(){
  if(route.name==="addExercise" && route.params.forPlan){ route={name:"planBuilder",params:builder&&builder.id?{id:builder.id}:{}}; render(); return; }
  _origBack();
};

/* ============================ BOOT ==================================== */
function boot(){
  applyEquipmentFlags();
  document.body.setAttribute("data-theme", S.theme||"purple");
  /* live clock in status bar */
  var sbt=document.getElementById("sb-time");
  function clock(){ if(sbt) sbt.textContent = new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}); }
  clock(); setInterval(clock, 30000);

  if(!S.setupDone){ startOnboarding(); }
  else { render(); }
}
boot();

})();
