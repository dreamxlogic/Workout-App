/* ============================================================================
   muscleMap.js — Raster anatomy maps with live theme-colored muscle overlays
   ----------------------------------------------------------------------------
   The detailed body artwork is raster PNG, so the app no longer looks like a
   collection of vector body shapes. SVG is used only as a transparent color
   mask above the anatomy art, allowing Today / Last 7 Days and equipment
   targets to remain dynamic.
   ========================================================================== */
(function () {
  function alpha(level) {
    return level === 1 ? 0.38 : level === 2 ? 0.68 : level === 3 ? 0.94 : 0;
  }

  function color(level, rgb) {
    return "rgba(" + rgb + "," + alpha(level) + ")";
  }

  /*
    Masks use the same 1024 × 1536 coordinate system as the anatomy PNGs.
    They intentionally follow visible armor/muscle panels and use soft edges,
    so the raster anatomy remains the dominant visual.
  */
  var FRONT = {
    shoulders: [
      '<ellipse cx="349" cy="338" rx="66" ry="60"/>',
      '<ellipse cx="675" cy="338" rx="66" ry="60"/>'
    ],
    chest: [
      '<path d="M365 355 Q430 300 505 346 L500 445 Q425 454 355 405Z"/>',
      '<path d="M659 355 Q594 300 519 346 L524 445 Q599 454 669 405Z"/>'
    ],
    biceps: [
      '<ellipse cx="285" cy="503" rx="47" ry="105" transform="rotate(13 285 503)"/>',
      '<ellipse cx="739" cy="503" rx="47" ry="105" transform="rotate(-13 739 503)"/>'
    ],
    triceps: [
      '<ellipse cx="288" cy="492" rx="43" ry="92" transform="rotate(13 288 492)"/>',
      '<ellipse cx="736" cy="492" rx="43" ry="92" transform="rotate(-13 736 492)"/>'
    ],
    forearms: [
      '<ellipse cx="232" cy="679" rx="38" ry="108" transform="rotate(18 232 679)"/>',
      '<ellipse cx="792" cy="679" rx="38" ry="108" transform="rotate(-18 792 679)"/>'
    ],
    abs: [
      '<rect x="456" y="445" width="112" height="250" rx="45"/>'
    ],
    obliques: [
      '<path d="M390 465 Q438 485 447 675 L393 652 Q365 548 390 465Z"/>',
      '<path d="M634 465 Q586 485 577 675 L631 652 Q659 548 634 465Z"/>'
    ],
    quads: [
      '<path d="M360 729 Q430 710 490 754 L470 1035 Q405 1070 345 1012Z"/>',
      '<path d="M664 729 Q594 710 534 754 L554 1035 Q619 1070 679 1012Z"/>'
    ],
    hamstrings: [
      '<path d="M370 748 Q430 720 485 770 L465 1018 Q410 1045 355 1000Z"/>',
      '<path d="M654 748 Q594 720 539 770 L559 1018 Q614 1045 669 1000Z"/>'
    ],
    calves: [
      '<ellipse cx="414" cy="1169" rx="53" ry="132"/>',
      '<ellipse cx="610" cy="1169" rx="53" ry="132"/>'
    ]
  };

  var BACK = {
    shoulders: [
      '<ellipse cx="346" cy="342" rx="70" ry="62"/>',
      '<ellipse cx="678" cy="342" rx="70" ry="62"/>'
    ],
    "upper-back": [
      '<path d="M373 331 Q512 260 651 331 L621 518 Q512 573 403 518Z"/>'
    ],
    back: [
      '<path d="M373 331 Q512 260 651 331 L621 610 Q512 670 403 610Z"/>'
    ],
    triceps: [
      '<ellipse cx="280" cy="496" rx="47" ry="110" transform="rotate(10 280 496)"/>',
      '<ellipse cx="744" cy="496" rx="47" ry="110" transform="rotate(-10 744 496)"/>'
    ],
    forearms: [
      '<ellipse cx="235" cy="674" rx="39" ry="110" transform="rotate(14 235 674)"/>',
      '<ellipse cx="789" cy="674" rx="39" ry="110" transform="rotate(-14 789 674)"/>'
    ],
    lats: [
      '<path d="M365 420 Q425 398 493 495 L455 640 Q382 610 350 515Z"/>',
      '<path d="M659 420 Q599 398 531 495 L569 640 Q642 610 674 515Z"/>'
    ],
    "lower-back": [
      '<path d="M435 548 Q512 518 589 548 L575 710 Q512 745 449 710Z"/>'
    ],
    glutes: [
      '<ellipse cx="429" cy="738" rx="91" ry="101"/>',
      '<ellipse cx="595" cy="738" rx="91" ry="101"/>'
    ],
    hamstrings: [
      '<path d="M367 815 Q425 774 494 820 L473 1080 Q410 1110 354 1050Z"/>',
      '<path d="M657 815 Q599 774 530 820 L551 1080 Q614 1110 670 1050Z"/>'
    ],
    quads: [
      '<path d="M370 820 Q430 785 490 830 L470 1060 Q410 1095 355 1040Z"/>',
      '<path d="M654 820 Q594 785 534 830 L554 1060 Q614 1095 669 1040Z"/>'
    ],
    calves: [
      '<ellipse cx="415" cy="1191" rx="57" ry="137"/>',
      '<ellipse cx="609" cy="1191" rx="57" ry="137"/>'
    ]
  };

  var BACK_ONLY = {
    "upper-back": 1, back: 1, triceps: 1, lats: 1, "lower-back": 1,
    glutes: 1, hamstrings: 1
  };

  function overlay(view, levels, rgb) {
    var regions = view === "back" ? BACK : FRONT;
    var markup = "";
    Object.keys(regions).forEach(function (key) {
      var level = levels[key] || 0;
      if (!level) return;
      regions[key].forEach(function (shape) {
        markup += '<g fill="' + color(level, rgb) + '">' + shape + "</g>";
      });
    });
    return markup;
  }

  window.MUSCLE_MAP = function (view, levels, rgb) {
    levels = levels || {};
    rgb = rgb || "123,94,167";
    var src = view === "back"
      ? "images/body-map/anatomy-back.png"
      : "images/body-map/anatomy-front.png";
    return '<div class="anatomy-map anatomy-' + view + '" role="img" aria-label="' +
      (view === "back" ? "Back" : "Front") + ' muscle activity">' +
      '<img class="anatomy-base" src="' + src + '" alt="">' +
      '<svg class="anatomy-overlay" viewBox="0 0 1024 1536" aria-hidden="true">' +
        overlay(view, levels, rgb) +
      "</svg></div>";
  };

  window.MUSCLE_VIEW_FOR = function (muscle) {
    return BACK_ONLY[muscle] ? "back" : "front";
  };

  window.MUSCLE_NAMES = {
    chest: "Chest", "upper-back": "Upper back", lats: "Lats", shoulders: "Shoulders",
    biceps: "Biceps", triceps: "Triceps", forearms: "Forearms", abs: "Abs",
    obliques: "Obliques", "lower-back": "Lower back", quads: "Quads",
    hamstrings: "Hamstrings", glutes: "Glutes", calves: "Calves",
    back: "Back", cardio: "Cardio"
  };
})();
