(function(){
"use strict";

var params = new URLSearchParams(window.location.search);
var enabled = params.has("annotate") || localStorage.getItem("coachAnnotatorEnabled") === "1";
if(!enabled) return;

var STORAGE_KEY = "coachAnnotationNotes";
var SKIP = "coach-annotator-skip";
var REPO_ISSUE_URL = "https://github.com/dreamxlogic/Workout-App/issues/new";
var state = {
  armed:true,
  collapsed:false,
  position:loadPosition(),
  drag:null,
  selected:null,
  notes:loadNotes(),
  hover:null
};

function loadNotes(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    return [];
  }
}
function loadPosition(){
  try{
    var raw = localStorage.getItem("coachAnnotatorPosition");
    return raw ? JSON.parse(raw) : null;
  }catch(e){
    return null;
  }
}
function saveNotes(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
  }catch(e){
    setStatus("Could not save locally.");
  }
  renderList();
}
function escapeHtml(value){
  return String(value || "").replace(/[&<>"']/g,function(ch){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}
function cssEscape(value){
  if(window.CSS && CSS.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g,"\\$&");
}
function cssPath(el){
  if(!el || el === document.body) return "body";
  var parts = [];
  var node = el;
  while(node && node.nodeType === 1 && node !== document.body && parts.length < 6){
    var part = node.tagName.toLowerCase();
    if(node.id){
      part += "#"+cssEscape(node.id);
      parts.unshift(part);
      break;
    }
    var cls = Array.prototype.slice.call(node.classList || []).filter(Boolean).slice(0,2);
    if(cls.length) part += "."+cls.map(cssEscape).join(".");
    var parent = node.parentElement;
    if(parent){
      var same = Array.prototype.slice.call(parent.children).filter(function(x){ return x.tagName === node.tagName; });
      if(same.length > 1) part += ":nth-of-type("+(same.indexOf(node)+1)+")";
    }
    parts.unshift(part);
    node = parent;
  }
  return parts.join(" > ");
}
function elementLabel(el){
  var text = (el.innerText || el.textContent || "").replace(/\s+/g," ").trim();
  var aria = el.getAttribute("aria-label");
  var id = el.id ? "#"+el.id : "";
  var placeholder = el.getAttribute("placeholder");
  var title = el.getAttribute("title");
  var action = el.dataset && el.dataset.act ? "Action: "+el.dataset.act : "";
  return (aria || text || placeholder || title || action || el.tagName.toLowerCase()+id).slice(0,90);
}
function screenLabel(el){
  var labeled = el.closest("[data-screen-label]");
  if(labeled) return labeled.getAttribute("data-screen-label");
  var headings = Array.prototype.slice.call(document.querySelectorAll("#screen .topbar h1,#screen .screen-title,#screen h1,#screen h2,#screen .label"))
    .filter(function(node){
      var r = node.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    })
    .map(function(node){ return (node.innerText || node.textContent || "").replace(/\s+/g," ").trim(); })
    .filter(Boolean);
  var activeNav = document.querySelector("#nav .nav-btn.active span:last-child");
  return headings[0] || (activeNav && activeNav.textContent.trim()) || document.title || "Current screen";
}
function snapshot(el,event){
  var rect = el.getBoundingClientRect();
  var styles = getComputedStyle(el);
  return {
    id:"ann-"+Date.now()+"-"+Math.random().toString(16).slice(2,7),
    createdAt:new Date().toISOString(),
    url:location.href,
    path:location.pathname,
    hash:location.hash,
    screen:screenLabel(el),
    selector:cssPath(el),
    label:elementLabel(el),
    tag:el.tagName.toLowerCase(),
    action:el.dataset ? el.dataset.act || "" : "",
    text:(el.innerText || el.textContent || "").replace(/\s+/g," ").trim().slice(0,300),
    rect:{
      x:Math.round(rect.x),
      y:Math.round(rect.y),
      width:Math.round(rect.width),
      height:Math.round(rect.height)
    },
    click:{
      x:Math.round(event.clientX),
      y:Math.round(event.clientY)
    },
    style:{
      color:styles.color,
      background:styles.backgroundColor,
      fontSize:styles.fontSize,
      fontWeight:styles.fontWeight,
      borderRadius:styles.borderRadius
    },
    priority:"medium",
    type:"design",
    status:"open",
    note:""
  };
}
function make(tag,attrs,children){
  var el = document.createElement(tag);
  Object.keys(attrs || {}).forEach(function(key){
    var value = attrs[key];
    if(key === "className") el.className = value;
    else if(key === "text") el.textContent = value;
    else if(key.indexOf("on") === 0) el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value);
  });
  (children || []).forEach(function(child){
    el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  });
  return el;
}
function installStyles(){
  var style = document.createElement("style");
  style.textContent = [
    "body.coach-ann-review-layout{--coach-ann-panel-open:min(40vw,520px);--coach-ann-panel-closed:168px;--coach-ann-phone-w:min(430px,calc((100dvh - 36px) * 0.4614),calc(100vw - var(--coach-ann-panel-open) - 44px));--coach-ann-phone-h:min(932px,calc(100dvh - 36px),calc((100vw - var(--coach-ann-panel-open) - 44px) * 2.1673));--coach-ann-phone-w-collapsed:min(430px,calc((100dvh - 36px) * 0.4614),calc(100vw - var(--coach-ann-panel-closed) - 44px));--coach-ann-phone-h-collapsed:min(932px,calc(100dvh - 36px),calc((100vw - var(--coach-ann-panel-closed) - 44px) * 2.1673))}",
    ".coach-ann-shell{position:fixed;inset:max(14px,env(safe-area-inset-top,0px)) 14px auto auto;z-index:2147483600;width:min(380px,calc(100vw - 28px));max-height:calc(100dvh - 28px - env(safe-area-inset-top,0px));display:flex;flex-direction:column;background:#fff;color:#241F33;border:1px solid #F0EDF6;border-radius:14px;box-shadow:0 18px 60px rgba(35,38,47,.24);font:13px/1.35 Inter,system-ui,sans-serif;overflow:hidden;touch-action:none}",
    ".coach-ann-shell.is-collapsed{width:auto;max-width:calc(100vw - 28px)}",
    ".coach-ann-shell.is-collapsed .coach-ann-body{display:none}",
    ".coach-ann-head{display:flex;align-items:center;gap:8px;padding:11px 12px;border-bottom:1px solid #F0EDF6;background:#FAF9FC;cursor:grab;user-select:none}",
    ".coach-ann-shell.is-dragging .coach-ann-head{cursor:grabbing}",
    ".coach-ann-shell.is-collapsed .coach-ann-head{border-bottom:0}",
    ".coach-ann-title{font-weight:850;flex:1}",
    ".coach-ann-btn{appearance:none;border:0;border-radius:999px;background:#F0EAFA;color:#5C3D8F;font-weight:800;font:inherit;padding:8px 11px;cursor:pointer}",
    ".coach-ann-btn.primary{background:#7B5EA7;color:#fff}",
    ".coach-ann-btn.danger{background:#FBEAEA;color:#D24B4B}",
    ".coach-ann-btn.is-off{background:#F4F1F9;color:#6E6781}",
    ".coach-ann-body{padding:12px;display:flex;flex-direction:column;gap:10px;overflow:auto;min-height:0}",
    ".coach-ann-muted{color:#6E6781;font-size:12px}",
    ".coach-ann-status{min-height:17px;color:#168F71;font-size:12px;font-weight:750}",
    ".coach-ann-field{display:flex;flex-direction:column;gap:5px}",
    ".coach-ann-field label{font-size:11px;font-weight:850;color:#6E6781;text-transform:uppercase;letter-spacing:.04em}",
    ".coach-ann-field textarea,.coach-ann-field select,.coach-ann-field input{width:100%;border:1px solid #D8CFF0;border-radius:10px;background:#fff;font:inherit;padding:9px;color:#241F33}",
    ".coach-ann-field textarea{min-height:84px;resize:vertical}",
    ".coach-ann-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".coach-ann-target{border:1px solid #F0EAFA;border-radius:10px;padding:9px;background:#FAF9FC}",
    ".coach-ann-list{display:flex;flex-direction:column;gap:8px;max-height:min(34dvh,260px);overflow:auto;padding-right:2px}",
    ".coach-ann-item{border:1px solid #F0EDF6;border-radius:10px;padding:9px;background:#fff}",
    ".coach-ann-item-title{font-weight:800;margin-bottom:3px}",
    ".coach-ann-actions{display:flex;gap:7px;flex-wrap:wrap}",
    ".coach-ann-highlight{position:fixed;z-index:2147483598;pointer-events:none;border:2px solid #7B5EA7;border-radius:10px;box-shadow:0 0 0 9999px rgba(35,38,47,.16);transition:all .08s ease}",
    ".coach-ann-pin{position:fixed;z-index:2147483599;width:24px;height:24px;border-radius:50%;background:#7B5EA7;color:#fff;display:flex;align-items:center;justify-content:center;font:800 12px/1 Inter,system-ui,sans-serif;box-shadow:0 6px 18px rgba(123,94,167,.35);pointer-events:none}",
    "body.coach-ann-armed *{cursor:crosshair !important}",
    "@media (min-width:760px){body.coach-ann-review-layout{overflow:hidden !important;background:#F5F3FB !important}body.coach-ann-review-layout #phone{position:fixed !important;left:calc((100vw - var(--coach-ann-panel-open) - var(--coach-ann-phone-w)) / 2) !important;top:calc((100dvh - var(--coach-ann-phone-h)) / 2) !important;width:var(--coach-ann-phone-w) !important;height:var(--coach-ann-phone-h) !important;max-width:none !important;border-radius:30px !important;overflow:hidden !important;box-shadow:0 24px 70px rgba(35,38,47,.18),0 0 0 1px rgba(255,255,255,.8) !important}body.coach-ann-review-layout.coach-ann-panel-collapsed #phone{left:calc((100vw - var(--coach-ann-panel-closed) - var(--coach-ann-phone-w-collapsed)) / 2) !important;top:calc((100dvh - var(--coach-ann-phone-h-collapsed)) / 2) !important;width:var(--coach-ann-phone-w-collapsed) !important;height:var(--coach-ann-phone-h-collapsed) !important}body.coach-ann-review-layout .coach-ann-shell{left:auto !important;right:0 !important;top:0 !important;bottom:0 !important;width:var(--coach-ann-panel-open) !important;max-width:40vw !important;height:100dvh !important;max-height:none !important;border-radius:0 !important;border-width:0 0 0 1px !important;box-shadow:-18px 0 50px rgba(35,38,47,.12) !important;touch-action:auto}body.coach-ann-review-layout .coach-ann-shell.is-collapsed{width:var(--coach-ann-panel-closed) !important;max-width:var(--coach-ann-panel-closed) !important}body.coach-ann-review-layout .coach-ann-head{cursor:default}body.coach-ann-review-layout .coach-ann-body{flex:1}body.coach-ann-review-layout .coach-ann-list{flex:1;max-height:none;min-height:120px}}",
    "@media (max-width:520px){.coach-ann-shell{left:10px;right:10px;width:auto}.coach-ann-head{gap:6px;padding:9px 10px}.coach-ann-title{font-size:12px}.coach-ann-btn{padding:7px 9px;font-size:12px}}"
  ].join("\n");
  document.head.appendChild(style);
}
function createPanel(){
  var panel = make("aside",{className:"coach-ann-shell "+SKIP});
  panel.innerHTML =
    '<div class="coach-ann-head">'+
      '<div class="coach-ann-title">Review notes</div>'+
      '<button class="coach-ann-btn" data-act="toggle">Annotate on</button>'+
      '<button class="coach-ann-btn" data-act="collapse">Collapse</button>'+
      '<button class="coach-ann-btn primary" data-act="export">Export</button>'+
    '</div>'+
    '<div class="coach-ann-body">'+
      '<div class="coach-ann-muted">Turn annotation on to select elements. Turn it off to click around the app normally.</div>'+
      '<div class="coach-ann-target" data-target>Click an element to select it.</div>'+
      '<div class="coach-ann-row">'+
        '<div class="coach-ann-field"><label>Type</label><select data-type><option>design</option><option>bug</option><option>copy</option><option>flow</option><option>question</option></select></div>'+
        '<div class="coach-ann-field"><label>Priority</label><select data-priority><option>medium</option><option>high</option><option>low</option></select></div>'+
      '</div>'+
      '<div class="coach-ann-field"><label>What should change?</label><textarea data-note placeholder="Example: make this button smaller and align it with the card edge."></textarea></div>'+
      '<div class="coach-ann-actions">'+
        '<button class="coach-ann-btn primary" data-act="save">Save note</button>'+
        '<button class="coach-ann-btn primary" data-act="issue">Submit issue</button>'+
        '<button class="coach-ann-btn" data-act="copy">Copy JSON</button>'+
        '<button class="coach-ann-btn" data-act="markdown">Download MD</button>'+
        '<button class="coach-ann-btn danger" data-act="clear">Clear all</button>'+
      '</div>'+
      '<div class="coach-ann-status" data-status></div>'+
      '<div class="coach-ann-list" data-list></div>'+
    '</div>';
  document.body.appendChild(panel);
  panel.addEventListener("click", onPanelClick);
  panel.querySelector(".coach-ann-head").addEventListener("pointerdown", onDragStart);
  panel.querySelector("[data-type]").addEventListener("change",function(e){ if(state.selected) state.selected.type = e.target.value; });
  panel.querySelector("[data-priority]").addEventListener("change",function(e){ if(state.selected) state.selected.priority = e.target.value; });
  panel.querySelector("[data-note]").addEventListener("input",function(e){ if(state.selected) state.selected.note = e.target.value; });
  renderMode();
  applySavedPosition();
  renderList();
  renderSelected();
}
function onPanelClick(event){
  var btn = event.target.closest("[data-act]");
  var act = btn && btn.getAttribute("data-act");
  if(!act) return;
  event.preventDefault();
  event.stopPropagation();
  if(act === "toggle"){
    setArmed(!state.armed);
    setStatus(state.armed ? "Annotation mode is on. Tap an app element." : "Annotation mode is off. The app is clickable.");
  }
  if(act === "collapse") setCollapsed(!state.collapsed);
  if(act === "save") saveSelected();
  if(act === "export") download("workout-app-annotations.json", JSON.stringify(state.notes,null,2), "Exported JSON.");
  if(act === "copy") copyText(JSON.stringify(state.notes,null,2));
  if(act === "markdown") download("workout-app-annotations.md", exportMarkdown(), "Downloaded markdown.");
  if(act === "issue") submitIssue();
  if(act === "clear" && confirm("Clear all saved review notes?")){
    state.notes = [];
    state.selected = null;
    saveNotes();
    renderSelected();
    clearHighlight();
    drawPins();
    setStatus("Cleared all notes.");
  }
}
function setArmed(value){
  state.armed = !!value;
  localStorage.setItem("coachAnnotatorArmed", state.armed ? "1" : "0");
  document.body.classList.toggle("coach-ann-armed", state.armed);
  if(!state.armed) clearHighlight();
  renderMode();
}
function setCollapsed(value){
  state.collapsed = !!value;
  localStorage.setItem("coachAnnotatorCollapsed", state.collapsed ? "1" : "0");
  renderMode();
}
function renderMode(){
  var panel = document.querySelector(".coach-ann-shell");
  if(!panel) return;
  panel.classList.toggle("is-collapsed", state.collapsed);
  document.body.classList.toggle("coach-ann-panel-collapsed", state.collapsed);
  var toggle = panel.querySelector("[data-act='toggle']");
  var collapse = panel.querySelector("[data-act='collapse']");
  if(toggle){
    toggle.textContent = state.armed ? "Annotate on" : "Annotate off";
    toggle.classList.toggle("is-off", !state.armed);
    toggle.setAttribute("aria-pressed", state.armed ? "true" : "false");
  }
  if(collapse) collapse.textContent = state.collapsed ? "Show panel" : "Collapse";
}
function clampPosition(x,y,panel){
  var pad = 10;
  var w = panel.offsetWidth || 320;
  var h = panel.offsetHeight || 80;
  return {
    x:Math.max(pad, Math.min(window.innerWidth - w - pad, x)),
    y:Math.max(pad, Math.min(window.innerHeight - h - pad, y))
  };
}
function applyPosition(x,y){
  var panel = document.querySelector(".coach-ann-shell");
  if(!panel) return;
  var p = clampPosition(x,y,panel);
  panel.style.left = p.x+"px";
  panel.style.top = p.y+"px";
  panel.style.right = "auto";
  panel.style.bottom = "auto";
  state.position = p;
}
function applySavedPosition(){
  var panel = document.querySelector(".coach-ann-shell");
  if(!panel || !state.position || isReviewLayout()) return;
  requestAnimationFrame(function(){ applyPosition(state.position.x, state.position.y); });
}
function onDragStart(event){
  if(isReviewLayout()) return;
  if(event.target.closest("button,select,input,textarea")) return;
  var panel = document.querySelector(".coach-ann-shell");
  if(!panel) return;
  var rect = panel.getBoundingClientRect();
  state.drag = { dx:event.clientX - rect.left, dy:event.clientY - rect.top, pointerId:event.pointerId };
  panel.classList.add("is-dragging");
  if(panel.setPointerCapture) panel.setPointerCapture(event.pointerId);
  event.preventDefault();
}
function onDragMove(event){
  if(isReviewLayout() || !state.drag) return;
  applyPosition(event.clientX - state.drag.dx, event.clientY - state.drag.dy);
}
function onDragEnd(){
  if(!state.drag) return;
  var panel = document.querySelector(".coach-ann-shell");
  if(panel){
    panel.classList.remove("is-dragging");
    if(panel.releasePointerCapture) panel.releasePointerCapture(state.drag.pointerId);
  }
  if(state.position) localStorage.setItem("coachAnnotatorPosition", JSON.stringify(state.position));
  state.drag = null;
}
function isReviewLayout(){
  return window.matchMedia && window.matchMedia("(min-width: 760px)").matches;
}
function setStatus(message){
  var el = document.querySelector("[data-status]");
  if(!el) return;
  el.textContent = message || "";
  clearTimeout(setStatus._timer);
  if(message) setStatus._timer = setTimeout(function(){ el.textContent = ""; },2600);
}
function renderSelected(){
  var panel = document.querySelector(".coach-ann-shell");
  if(!panel) return;
  var target = panel.querySelector("[data-target]");
  var type = panel.querySelector("[data-type]");
  var priority = panel.querySelector("[data-priority]");
  var note = panel.querySelector("[data-note]");
  if(!state.selected){
    target.textContent = "Click an element to select it.";
    note.value = "";
    return;
  }
  target.innerHTML = "<strong>"+escapeHtml(state.selected.label)+"</strong><br><span class=\"coach-ann-muted\">"+escapeHtml(state.selected.screen)+" · "+escapeHtml(state.selected.selector)+"</span>";
  type.value = state.selected.type;
  priority.value = state.selected.priority;
  note.value = state.selected.note;
}
function renderList(){
  var list = document.querySelector("[data-list]");
  if(!list) return;
  if(!state.notes.length){
    list.innerHTML = '<div class="coach-ann-muted">No saved notes yet.</div>';
    return;
  }
  list.innerHTML = state.notes.map(function(n,i){
    return '<div class="coach-ann-item">'+
      '<div class="coach-ann-item-title">'+(i+1)+'. '+escapeHtml(n.label)+'</div>'+
      '<div class="coach-ann-muted">'+escapeHtml(n.screen)+' · '+escapeHtml(n.type)+' · '+escapeHtml(n.priority)+'</div>'+
      '<div>'+escapeHtml(n.note || "(no note)")+'</div>'+
    '</div>';
  }).join("");
}
function saveSelected(){
  if(!state.selected){
    setStatus("Click an app element first.");
    alert("Click an app element first.");
    return;
  }
  if(!state.selected.note.trim()){
    setStatus("Add the requested change first.");
    alert("Add the requested change first.");
    return;
  }
  state.notes.push(Object.assign({}, state.selected));
  state.selected = null;
  saveNotes();
  renderSelected();
  drawPins();
  setStatus("Saved note.");
}
function updateHighlight(el){
  var box = document.querySelector(".coach-ann-highlight");
  if(!box){
    box = make("div",{className:"coach-ann-highlight "+SKIP});
    document.body.appendChild(box);
  }
  var r = el.getBoundingClientRect();
  box.style.left = r.left+"px";
  box.style.top = r.top+"px";
  box.style.width = r.width+"px";
  box.style.height = r.height+"px";
}
function clearHighlight(){
  var box = document.querySelector(".coach-ann-highlight");
  if(box) box.remove();
  state.hover = null;
}
function drawPins(){
  document.querySelectorAll(".coach-ann-pin").forEach(function(x){ x.remove(); });
  state.notes.forEach(function(note,i){
    var pin = make("div",{className:"coach-ann-pin "+SKIP,text:String(i+1)});
    pin.style.left = (note.click.x - 12)+"px";
    pin.style.top = (note.click.y - 12)+"px";
    document.body.appendChild(pin);
  });
}
function exportMarkdown(){
  return state.notes.map(function(n,i){
    return [
      "## "+(i+1)+". "+n.label,
      "- Screen: "+n.screen,
      "- Type: "+n.type,
      "- Priority: "+n.priority,
      "- Selector: `"+n.selector+"`",
      "- Rect: "+n.rect.x+", "+n.rect.y+", "+n.rect.width+"x"+n.rect.height,
      "",
      n.note,
      ""
    ].join("\n");
  }).join("\n");
}
function submitIssue(){
  if(!state.notes.length){
    setStatus("Save at least one note before submitting.");
    alert("Save at least one note before submitting.");
    return;
  }
  var body = [
    "Review notes exported from Workout App annotation mode.",
    "",
    exportMarkdown(),
    "",
    "<details><summary>Raw annotation JSON</summary>",
    "",
    "```json",
    JSON.stringify(state.notes,null,2),
    "```",
    "",
    "</details>"
  ].join("\n");
  var url = new URL(REPO_ISSUE_URL);
  url.searchParams.set("title", "UI review notes - "+new Date().toISOString().slice(0,10));
  url.searchParams.set("body", body);
  setStatus("Opening GitHub issue draft.");
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}
function copyText(text){
  try{
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(text).then(function(){ setStatus("Copied JSON."); },function(){ fallbackCopy(text); });
    }else{
      fallbackCopy(text);
    }
  }catch(e){
    setStatus("Copy failed. Use Export instead.");
  }
}
function fallbackCopy(text){
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly","");
  ta.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
  setStatus("Copied JSON.");
}
function download(name,content,statusMessage){
  var isJson = name.slice(-5) === ".json";
  var blob = new Blob([content],{type:isJson ? "application/json" : "text/markdown"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.className = SKIP;
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){
    URL.revokeObjectURL(a.href);
    a.remove();
  },500);
  setStatus(statusMessage || "Download started.");
}
function eventTarget(event){
  var path = event.composedPath ? event.composedPath() : [];
  var blocked = path.some(function(el){
    return el && el.nodeType === 1 && (el.classList && el.classList.contains(SKIP) || el.closest && el.closest("."+SKIP));
  });
  if(blocked) return null;
  return path.find(function(el){
    return el && el.nodeType === 1 && el !== document && el !== window && document.getElementById("phone").contains(el);
  });
}
function init(){
  state.armed = localStorage.getItem("coachAnnotatorArmed") !== "0";
  state.collapsed = localStorage.getItem("coachAnnotatorCollapsed") === "1";
  localStorage.setItem("coachAnnotatorEnabled","1");
  document.body.classList.add("coach-ann-review-layout");
  installStyles();
  createPanel();
  setArmed(state.armed);
  document.addEventListener("mousemove",function(event){
    if(!state.armed) return;
    var target = eventTarget(event);
    if(!target || target === state.hover) return;
    state.hover = target;
    updateHighlight(target);
  },true);
  document.addEventListener("click",function(event){
    if(!state.armed) return;
    var target = eventTarget(event);
    if(!target) return;
    event.preventDefault();
    event.stopPropagation();
    state.selected = snapshot(target,event);
    renderSelected();
    updateHighlight(target);
    setStatus("Element selected. Add a note, then save.");
  },true);
  document.addEventListener("keydown",function(event){
    if(event.key === "Escape" && state.armed){
      setArmed(false);
      setStatus("Annotation mode is off. The app is clickable.");
    }
  },true);
  window.addEventListener("scroll", drawPins, true);
  window.addEventListener("resize",function(){
    drawPins();
    if(state.position) applyPosition(state.position.x,state.position.y);
  });
  document.addEventListener("pointermove", onDragMove, true);
  document.addEventListener("pointerup", onDragEnd, true);
  document.addEventListener("pointercancel", onDragEnd, true);
  drawPins();
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
})();
