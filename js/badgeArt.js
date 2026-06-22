/* ============================================================================
   badgeArt.js  —  Illustrated medal artwork (vector, illustration-style)
   ----------------------------------------------------------------------------
   BADGE_ART(medal, opts) -> svg string of a glossy medal with laurel leaves,
   star/emblem, ribbon tails and a shine highlight — styled to look illustrated
   (gradients + depth), not flat geometry.
     medal   "gold" | "silver" | "bronze"
     opts.center   icon key for the emblem in the middle (default "star")
     opts.confetti true to add festive confetti (earned pop-up)
     opts.ribbon   ribbon colour (default theme accent via CSS var)
   SWAP-IN: if you later drop a painted PNG at images/badges/{id}.png, call
   BADGE_IMG(id) instead — see app.js badge rendering.
   ========================================================================== */
(function () {
  var METALS = {
    gold:   { hi:"#FCE08A", mid:"#F4C23E", low:"#D9981F", rim:"#B97B12", star:"#E8912A", starHi:"#FFD66B" },
    silver: { hi:"#F3F6FA", mid:"#D2D8E0", low:"#AAB2BD", rim:"#8A929D", star:"#9AA3AE", starHi:"#FFFFFF" },
    bronze: { hi:"#EFC79C", mid:"#D89A63", low:"#B6743C", rim:"#8E5A2B", star:"#A9692F", starHi:"#F1C79A" }
  };

  var EMBLEMS = {
    star: function(c){ return '<path d="M40 26 l4.3 8.7 9.6 1.4 -6.95 6.8 1.64 9.55 L40 47.9 l-8.59 4.55 1.64 -9.55 -6.95 -6.8 9.6 -1.4 Z" fill="'+c.star+'"/>'+
      '<path d="M40 26 l4.3 8.7 9.6 1.4 -6.95 6.8 1.64 9.55 L40 47.9 Z" fill="'+c.starHi+'" opacity=".45"/>'; },
    dumbbell: function(c){ return '<g stroke="'+c.star+'" stroke-width="4.2" stroke-linecap="round" fill="none"><path d="M30 40h20"/><path d="M27 33v14M53 33v14M23 36v8M57 36v8"/></g>'; },
    flame: function(c){ return '<path d="M40 26c3 6-3 8-3 13a3 3 0 0 0 6 0c0-2-1-3-1-3 4 3 6 6 6 10a8 8 0 0 1-16 .5c0-3 1.4-5 2.4-6.6-2.7.4-4 1.8-5 3.6C28 40 34 31 40 26Z" fill="'+c.star+'"/>'; },
    heart: function(c){ return '<path d="M40 52s-12-7.4-12-15.6A6.4 6.4 0 0 1 40 33a6.4 6.4 0 0 1 12 3.4C52 44.6 40 52 40 52Z" fill="'+c.star+'"/>'; },
    bolt: function(c){ return '<path d="M44 25 30 44h8l-3 12 14-20h-8l3-11Z" fill="'+c.star+'"/>'; },
    compass: function(c){ return '<circle cx="40" cy="40" r="13" fill="none" stroke="'+c.star+'" stroke-width="3.6"/><path d="M40 31l3 9 6 3-9-3-3-9 -3 9-6 3 6-3z" fill="'+c.star+'"/>'; },
    calendar: function(c){ return '<rect x="29" y="30" width="22" height="20" rx="3.5" fill="none" stroke="'+c.star+'" stroke-width="3.6"/><path d="M29 37h22M35 27v6M45 27v6" stroke="'+c.star+'" stroke-width="3.6" stroke-linecap="round"/>'; },
    spark: function(c){ return '<path d="M40 27l2.6 7.2L50 37l-7.4 2.8L40 47l-2.6-7.2L30 37l7.4-2.8z" fill="'+c.star+'"/>'; }
  };

  window.BADGE_ART = function (medal, opts) {
    opts = opts || {};
    var c = METALS[medal] || METALS.gold;
    var ribbon = opts.ribbon || "var(--accent)";
    var ribbonDark = opts.ribbonDark || "var(--accent-strong)";
    var emblem = (EMBLEMS[opts.center] || EMBLEMS.star)(c);
    var conf = "";
    if (opts.confetti) {
      var cols = ["var(--accent)", c.mid, "#F08A5D", "#45B26B"];
      for (var i = 0; i < 10; i++) {
        var x = 6 + Math.random()*68, y = 6 + Math.random()*64, r = -40 + Math.random()*80;
        conf += '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="3.4" height="6" rx="1.4" transform="rotate('+r.toFixed(0)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="'+cols[i%cols.length]+'" opacity=".85"/>';
      }
    }
    return '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" class="badge-art" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="mg-'+medal+'" cx="38%" cy="32%" r="72%">' +
          '<stop offset="0%" stop-color="'+c.hi+'"/><stop offset="55%" stop-color="'+c.mid+'"/><stop offset="100%" stop-color="'+c.low+'"/>' +
        '</radialGradient>' +
      '</defs>' +
      conf +
      /* ribbon tails */
      '<path d="M30 52 L22 74 L31 69 L34 78 L41 56 Z" fill="'+ribbonDark+'"/>' +
      '<path d="M50 52 L58 74 L49 69 L46 78 L39 56 Z" fill="'+ribbon+'"/>' +
      /* laurel leaves */
      '<g fill="'+c.low+'" opacity=".9">' +
        leaves(true) + leaves(false) +
      '</g>' +
      /* medal body */
      '<circle cx="40" cy="40" r="24" fill="'+c.rim+'"/>' +
      '<circle cx="40" cy="40" r="21" fill="url(#mg-'+medal+')"/>' +
      '<circle cx="40" cy="40" r="21" fill="none" stroke="'+c.hi+'" stroke-width="1.4" opacity=".5"/>' +
      /* inner notch ring */
      '<circle cx="40" cy="40" r="16.5" fill="none" stroke="'+c.rim+'" stroke-width="1.2" opacity=".45"/>' +
      emblem +
      /* gloss highlight */
      '<path d="M27 30 a17 17 0 0 1 16 -8 a20 20 0 0 0 -18 14 Z" fill="#fff" opacity=".30"/>' +
      '</svg>';
  };

  function leaves(left) {
    /* wrap leaves down the left/right sides of the medal (152deg..212deg left) */
    var s = "", n = 5;
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      var ang = left ? (150 + t * 62) : (30 - t * 62);   /* upper -> lower */
      var rad = ang * Math.PI / 180;
      var cx = 40 + Math.cos(rad) * 26.5, cy = 41 + Math.sin(rad) * 26.5;
      var rot = ang + (left ? -90 : 90);                  /* leaf points outward */
      s += '<ellipse cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" rx="3" ry="5.8" transform="rotate('+rot.toFixed(0)+' '+cx.toFixed(1)+' '+cy.toFixed(1)+')"/>';
    }
    return s;
  }

  /* center emblem assigned per badge id */
  window.BADGE_CENTER = {
    "first-workout": "star",
    "first-plan": "calendar",
    "cardio-starter": "flame",
    "leg-day": "dumbbell",
    "machine-explorer": "compass",
    "three-this-month": "calendar",
    "new-machine": "spark",
    "consistency-starter": "bolt"
  };

  /* If a painted PNG is provided later, this returns an <img> instead. */
  window.BADGE_IMG = function (id) {
    return '<img src="images/badges/' + id + '.png" alt="" class="badge-art" onerror="this.style.display=\'none\'">';
  };
})();
