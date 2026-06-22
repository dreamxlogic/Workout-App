/* ============================================================================
   muscleMap.js  —  Friendly front/back body maps with theme-tinted muscles
   ----------------------------------------------------------------------------
   MUSCLE_MAP(view, levels, rgb)
     view   "front" | "back"
     levels { muscleKey: 0|1|2|3 }   0 none, 1 light, 2 medium, 3 strong
     rgb    "r,g,b" theme accent (muscle overlays only; body stays neutral)
   Returns an <svg> string. Body outline is neutral; worked muscles glow in
   the theme color at increasing strength. No medical styling.
   ========================================================================== */
(function () {
  var BODY = "#E9E6F2", LINE = "#D3CDE6";

  function fill(level, rgb) {
    if (!level) return "#DEDAEC";
    var a = level === 1 ? 0.30 : level === 2 ? 0.58 : 0.92;
    return "rgba(" + rgb + "," + a + ")";
  }

  /* region: key -> array of svg shape templates (use %F% for fill) */
  var FRONT = {
    shoulders: ['<ellipse cx="40" cy="78" rx="11" ry="9" fill="%F%"/>', '<ellipse cx="100" cy="78" rx="11" ry="9" fill="%F%"/>'],
    chest:     ['<path d="M50 80 q12 8 0 22 q-12 -2 -12 -14 q0 -6 12 -8Z" fill="%F%"/>', '<path d="M90 80 q-12 8 0 22 q12 -2 12 -14 q0 -6 -12 -8Z" fill="%F%"/>'],
    biceps:    ['<ellipse cx="32" cy="100" rx="7" ry="13" fill="%F%"/>', '<ellipse cx="108" cy="100" rx="7" ry="13" fill="%F%"/>'],
    forearms:  ['<ellipse cx="27" cy="128" rx="6" ry="13" fill="%F%"/>', '<ellipse cx="113" cy="128" rx="6" ry="13" fill="%F%"/>'],
    abs:       ['<rect x="61" y="104" width="18" height="34" rx="7" fill="%F%"/>'],
    obliques:  ['<path d="M58 108 q-7 4 -6 18 q4 4 6 -2Z" fill="%F%"/>', '<path d="M82 108 q7 4 6 18 q-4 4 -6 -2Z" fill="%F%"/>'],
    quads:     ['<path d="M56 150 q-3 26 2 46 q9 3 11 -4 q2 -22 -1 -42Z" fill="%F%"/>', '<path d="M84 150 q3 26 -2 46 q-9 3 -11 -4 q-2 -22 1 -42Z" fill="%F%"/>'],
    calves:    ['<ellipse cx="60" cy="224" rx="8" ry="16" fill="%F%"/>', '<ellipse cx="80" cy="224" rx="8" ry="16" fill="%F%"/>']
  };
  var BACK = {
    shoulders: ['<ellipse cx="40" cy="78" rx="11" ry="9" fill="%F%"/>', '<ellipse cx="100" cy="78" rx="11" ry="9" fill="%F%"/>'],
    "upper-back": ['<path d="M52 80 h36 q4 14 -2 24 h-32 q-6 -10 -2 -24Z" fill="%F%"/>'],
    triceps:   ['<ellipse cx="32" cy="100" rx="7" ry="13" fill="%F%"/>', '<ellipse cx="108" cy="100" rx="7" ry="13" fill="%F%"/>'],
    forearms:  ['<ellipse cx="27" cy="128" rx="6" ry="13" fill="%F%"/>', '<ellipse cx="113" cy="128" rx="6" ry="13" fill="%F%"/>'],
    lats:      ['<path d="M52 106 q-6 14 2 24 q6 -2 8 -10 l-2 -16Z" fill="%F%"/>', '<path d="M88 106 q6 14 -2 24 q-6 -2 -8 -10 l2 -16Z" fill="%F%"/>'],
    "lower-back": ['<rect x="62" y="120" width="16" height="20" rx="6" fill="%F%"/>'],
    glutes:    ['<path d="M59 142 q-9 4 -8 18 q3 9 12 7 q4 -12 0 -25Z" fill="%F%"/>', '<path d="M81 142 q9 4 8 18 q-3 9 -12 7 q-4 -12 0 -25Z" fill="%F%"/>'],
    hamstrings:['<path d="M56 168 q-3 22 2 38 q9 3 11 -4 q2 -18 -1 -34Z" fill="%F%"/>', '<path d="M84 168 q3 22 -2 38 q-9 3 -11 -4 q-2 -18 1 -34Z" fill="%F%"/>'],
    calves:    ['<ellipse cx="60" cy="224" rx="8" ry="16" fill="%F%"/>', '<ellipse cx="80" cy="224" rx="8" ry="16" fill="%F%"/>']
  };

  /* gender-neutral silhouette shared by both views */
  function silhouette() {
    return (
      '<circle cx="70" cy="34" r="16" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      '<rect x="63" y="48" width="14" height="12" rx="5" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      '<path d="M44 64 Q70 56 96 64 L104 92 Q100 112 96 122 L84 150 H56 L44 122 Q40 112 36 92 Z" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      /* arms */
      '<path d="M44 66 Q30 70 26 92 L22 138 Q22 146 28 146 Q34 146 34 138 L38 96 Q40 84 48 78 Z" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      '<path d="M96 66 Q110 70 114 92 L118 138 Q118 146 112 146 Q106 146 106 138 L102 96 Q100 84 92 78 Z" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      /* legs */
      '<path d="M56 150 H68 L70 196 L66 250 Q60 254 56 250 L52 196 Z" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      '<path d="M72 150 H84 L88 196 L84 250 Q80 254 74 250 L70 196 Z" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="1.5"/>'
    );
  }

  window.MUSCLE_MAP = function (view, levels, rgb) {
    levels = levels || {}; rgb = rgb || "123,94,167";
    var regions = view === "back" ? BACK : FRONT;
    var overlay = "";
    Object.keys(regions).forEach(function (key) {
      var lvl = levels[key] || 0;
      var f = fill(lvl, rgb);
      regions[key].forEach(function (tpl) { overlay += tpl.replace("%F%", f); });
    });
    return '<svg viewBox="0 0 140 268" xmlns="http://www.w3.org/2000/svg" class="muscle-svg" aria-hidden="true">' +
      silhouette() + '<g class="muscle-overlay">' + overlay + '</g></svg>';
  };

  /* display names for legends / lists */
  window.MUSCLE_NAMES = {
    chest: "Chest", "upper-back": "Upper back", lats: "Lats", shoulders: "Shoulders",
    biceps: "Biceps", triceps: "Triceps", forearms: "Forearms", abs: "Abs",
    obliques: "Obliques", "lower-back": "Lower back", quads: "Quads",
    hamstrings: "Hamstrings", glutes: "Glutes", calves: "Calves",
    back: "Back", cardio: "Cardio"
  };
})();
