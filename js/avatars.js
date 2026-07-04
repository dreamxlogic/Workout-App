/* ============================================================================
   avatars.js  —  6 illustrated avatars (SVG, theme-aware tops, swappable)
   ----------------------------------------------------------------------------
   Built to spec:
     - all 6 share one style + proportions, each has a distinct face + hair
     - skin tone is user-selectable (3 tones) and stays fixed
     - hair is fixed dark; the TOP/shirt color follows the theme accent
     - no logos, no wristbands, solid-color tops, soft shading for depth
   Swap for final art later by changing AVATAR_SVG to return an <img>.
   AVATAR_SVG(id, skinHex, shirtHex) -> svg string.
   ========================================================================== */
(function () {

  window.SKIN_TONES = [
    { id: "light",  hex: "rgb(158,111,92)",  shadow: "rgb(132,92,75)"  },
    { id: "medium", hex: "rgb(128,87,64)",   shadow: "rgb(104,69,50)"  },
    { id: "deep",   hex: "rgb(85,55,42)",    shadow: "rgb(66,42,31)"   }
  ];

  window.AVATARS = [
    { id: "woman-ponytail", name: "Maya",   gender: "woman", trait: "Energetic & Focused" },
    { id: "woman-bob",      name: "Imani",  gender: "woman", trait: "Calm & Steady" },
    { id: "woman-braids",   name: "Zola",   gender: "woman", trait: "Bold & Determined" },
    { id: "man-fro",        name: "Andre",  gender: "man",   trait: "Upbeat & Driven" },
    { id: "man-braids",     name: "Malik",  gender: "man",   trait: "Cool & Consistent" },
    { id: "man-fade",       name: "Jordan", gender: "man",   trait: "Sharp & Reliable" }
  ];

  var HAIR = "#241712", HAIR_HI = "#3a261b", BROW = "#1c110c";

  /* shared base: soft backdrop, shoulders(top color), neck, ears, head, shading */
  function base(skin, shadow, shirt, hairBack, hairFront, face, lid) {
    return (
      '<defs>' +
        '<radialGradient id="bg'+lid+'" cx="50%" cy="38%" r="75%">' +
          '<stop offset="0%" stop-color="#FFFFFF" stop-opacity=".9"/>' +
          '<stop offset="100%" stop-color="'+shirt+'" stop-opacity=".16"/></radialGradient>' +
        '<clipPath id="cf'+lid+'"><circle cx="60" cy="60" r="60"/></clipPath>' +
      '</defs>' +
      '<g clip-path="url(#cf'+lid+')">' +
        '<rect width="120" height="120" fill="url(#bg'+lid+')"/>' +
        hairBack +
        /* shoulders / top */
        '<path d="M20 122 C22 99 39 90 60 90 C81 90 98 99 100 122 Z" fill="'+shirt+'"/>' +
        '<path d="M20 122 C24 104 40 96 60 96 C80 96 96 104 100 122 Z" fill="#000" opacity=".05"/>' +
        '<path d="M48 92 C52 101 68 101 72 92 L72 86 H48 Z" fill="'+skin+'"/>' +
        /* neck */
        '<rect x="52" y="74" width="16" height="18" rx="7" fill="'+skin+'"/>' +
        '<path d="M52 80 q8 6 16 0 v-6 h-16 Z" fill="'+shadow+'" opacity=".45"/>' +
        /* ears + tiny studs */
        '<circle cx="34" cy="55" r="5.5" fill="'+skin+'"/><circle cx="86" cy="55" r="5.5" fill="'+skin+'"/>' +
        /* head */
        '<path d="M36 50 C36 31 47 23 60 23 C73 23 84 31 84 50 C84 67 73 78 60 78 C47 78 36 67 36 50 Z" fill="'+skin+'"/>' +
        /* soft cheek/side shading for depth */
        '<path d="M60 23 C73 23 84 31 84 50 C84 61 79 69 71 74 C78 65 80 57 80 49 C80 34 72 26 61 25 Z" fill="'+shadow+'" opacity=".22"/>' +
        '<ellipse cx="49" cy="57" rx="4" ry="2.6" fill="#fff" opacity=".10"/>' +
        face +
        hairFront +
      '</g>'
    );
  }

  function face(opts) {
    opts = opts || {};
    var eyeY = opts.eyeY || 51;
    var lips = opts.lips || "#7a4434";
    var brow = opts.brow ||
      ('<path d="M43 44 q5.5 -3 11 -.6" stroke="'+BROW+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
       '<path d="M66 43.4 q5.5 -2.4 11 .6" stroke="'+BROW+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>');
    var lashes = opts.lashes
      ? '<path d="M43.6 49 q4.9 -3.4 9.8 0" stroke="'+HAIR+'" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M66.6 49 q4.9 -3.4 9.8 0" stroke="'+HAIR+'" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
      : "";
    return (
      brow +
      '<ellipse cx="48.5" cy="'+eyeY+'" rx="3.1" ry="3.6" fill="#fff"/><circle cx="49" cy="'+(eyeY+0.4)+'" r="2.1" fill="#2a1a12"/><circle cx="49.7" cy="'+(eyeY-0.4)+'" r="0.6" fill="#fff"/>' +
      '<ellipse cx="71.5" cy="'+eyeY+'" rx="3.1" ry="3.6" fill="#fff"/><circle cx="71" cy="'+(eyeY+0.4)+'" r="2.1" fill="#2a1a12"/><circle cx="71.7" cy="'+(eyeY-0.4)+'" r="0.6" fill="#fff"/>' +
      lashes +
      '<path d="M57.5 54 q2.5 4.5 5 0" stroke="'+opts.nose+'" stroke-width="1.7" fill="none" stroke-linecap="round" opacity=".65"/>' +
      '<path d="M52 63 q8 6 16 0" stroke="'+lips+'" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M52 63 q8 2.5 16 0" stroke="'+lips+'" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".5"/>'
    );
  }

  function womanBrowLash(skin, shadow){ return face({ lashes:true, nose:shadow, lips:"#8a4a3a" }); }
  function manBrow(){ return '<path d="M43 45 q5.5 -2.6 11 0" stroke="'+BROW+'" stroke-width="2.9" fill="none" stroke-linecap="round"/>' +
                             '<path d="M66 45 q5.5 -2.6 11 0" stroke="'+BROW+'" stroke-width="2.9" fill="none" stroke-linecap="round"/>'; }

  function avatarBody(id, skin, shadow, shirt, lid) {
    var f, hb = "", hf = "";
    switch (id) {
      case "woman-ponytail":
        hb = '<path d="M83 40 c16 4 16 26 9 40 c-4 8 -11 11 -16 10 c10 -10 11 -26 6 -38 c-2 -6 -6 -10 -11 -12 Z" fill="'+HAIR+'"/>' +
             '<ellipse cx="60" cy="30" rx="28" ry="20" fill="'+HAIR+'"/>';
        hf = '<path d="M35 52 C34 30 47 20 60 20 C73 20 86 30 85 52 C85 45 82 39 76 37 C72 30 48 30 44 37 C38 39 35 45 35 52 Z" fill="'+HAIR+'"/>' +
             '<path d="M44 33 q16 -8 32 0" stroke="'+HAIR_HI+'" stroke-width="1.4" fill="none" opacity=".6"/>' +
             '<circle cx="34" cy="62" r="2.4" fill="#e7c14a"/><circle cx="86" cy="62" r="2.4" fill="#e7c14a"/>';
        f = womanBrowLash(skin, shadow);
        break;
      case "woman-bob":
        hb = '<path d="M28 46 C28 25 43 18 60 18 C77 18 92 25 92 48 C92 68 88 80 86 86 L80 86 C85 70 83 54 80 47 C73 33 47 33 40 47 C37 54 35 70 40 86 L34 86 C32 80 28 66 28 46 Z" fill="'+HAIR+'"/>';
        hf = '<path d="M36 52 C35 28 50 19 60 19 C70 19 85 28 84 52 C84 44 81 39 75 37 C71 31 49 31 45 37 C39 39 36 44 36 52 Z" fill="'+HAIR+'"/>' +
             '<path d="M44 31 q16 -7 32 0" stroke="'+HAIR_HI+'" stroke-width="1.3" fill="none" opacity=".55"/>';
        f = face({ lashes:true, nose:shadow, lips:"#8e4c3c" });
        break;
      case "woman-braids":
        hb = '<g fill="'+HAIR+'">' +
             '<rect x="24" y="40" width="5.5" height="62" rx="2.7"/><rect x="31" y="46" width="5.5" height="60" rx="2.7"/>' +
             '<rect x="84" y="46" width="5.5" height="60" rx="2.7"/><rect x="91" y="40" width="5.5" height="62" rx="2.7"/>' +
             '<circle cx="26.7" cy="102" r="3.1"/><circle cx="33.7" cy="106" r="3.1"/><circle cx="86.7" cy="106" r="3.1"/><circle cx="93.7" cy="102" r="3.1"/>' +
             '<ellipse cx="60" cy="29" rx="27" ry="17"/></g>';
        hf = '<path d="M35 52 C34 29 48 19 60 19 C72 19 86 29 85 52 C85 44 82 38 76 36 C72 30 48 30 44 36 C38 38 35 44 35 52 Z" fill="'+HAIR+'"/>' +
             '<path d="M45 23 q15 -6 30 0 M45 28 q15 -5 30 0 M45 33 q15 -5 30 0" stroke="'+HAIR_HI+'" stroke-width="1.3" fill="none" opacity=".55"/>' +
             '<circle cx="34" cy="62" r="2.3" fill="#e7c14a"/><circle cx="86" cy="62" r="2.3" fill="#e7c14a"/>';
        f = womanBrowLash(skin, shadow);
        break;
      case "man-fro":
        hb = '<g fill="'+HAIR+'"><circle cx="60" cy="33" r="29"/>' +
             '<circle cx="37" cy="32" r="12"/><circle cx="83" cy="32" r="12"/>' +
             '<circle cx="46" cy="19" r="12"/><circle cx="60" cy="15" r="12"/><circle cx="74" cy="19" r="12"/>' +
             '<circle cx="33" cy="46" r="9"/><circle cx="87" cy="46" r="9"/></g>';
        hf = '<path d="M36 49 C35 33 47 28 60 28 C73 28 85 33 84 49 C84 41 80 37 75 36 C70 31 50 31 45 36 C40 37 36 41 36 49 Z" fill="'+HAIR+'"/>';
        f = face({ nose:shadow, lips:"#6f3c2e", brow:manBrow() });
        break;
      case "man-braids":
        hb = '<g fill="'+HAIR+'"><rect x="40" y="18" width="6.5" height="50" rx="3.2"/><rect x="50" y="16" width="6.5" height="48" rx="3.2"/>' +
             '<rect x="63.5" y="16" width="6.5" height="48" rx="3.2"/><rect x="73.5" y="18" width="6.5" height="50" rx="3.2"/>' +
             '<ellipse cx="60" cy="29" rx="25" ry="15"/></g>';
        hf = '<path d="M36 49 C35 31 47 24 60 24 C73 24 85 31 84 49 C84 41 80 37 75 36 C70 31 50 31 45 36 C40 37 36 41 36 49 Z" fill="'+HAIR+'"/>' +
             '<path d="M44 27 v18 M52 26 v17 M60 25 v18 M68 26 v17 M76 27 v18" stroke="'+HAIR_HI+'" stroke-width="1.7" opacity=".5" fill="none"/>';
        f = face({ nose:shadow, lips:"#6f3c2e", brow:manBrow() });
        break;
      case "man-fade":
      default:
        hb = '';
        hf = '<path d="M38 48 C37 34 47 29 60 29 C73 29 83 34 82 48 C82 42 78 37 73 36 C67 32 53 32 47 36 C42 37 38 42 38 48 Z" fill="'+HAIR+'"/>' +
             '<path d="M38 48 q22 -17 44 0 q-4 -5 -9 -6 q-13 -6 -26 0 q-5 1 -9 6 Z" fill="'+HAIR_HI+'" opacity=".45"/>' +
             '<path d="M40 50 q20 -6 40 0" stroke="'+HAIR+'" stroke-width="1" opacity=".4" fill="none"/>';
        f = face({ nose:shadow, lips:"#6f3c2e", brow:manBrow() });
        break;
    }
    return base(skin, shadow, shirt, hb, hf, f, lid);
  }

  var _uid = 0;
  window.AVATAR_SVG = function (id, skinHex, shirtHex) {
    var tone = SKIN_TONES.find(function (t) { return t.hex === skinHex; }) || SKIN_TONES[1];
    var lid = (_uid++);
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="avatar-svg" aria-hidden="true">' +
      avatarBody(id, tone.hex, tone.shadow, shirtHex || "#7B5EA7", lid) + '</svg>';
  };

  window.AVATAR_META = function (id) {
    return AVATARS.find(function (a) { return a.id === id; }) || AVATARS[0];
  };
})();
