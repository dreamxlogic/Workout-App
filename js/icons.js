/* ============================================================================
   icons.js  —  Inline SVG icon set (no emoji, no icon fonts)
   ----------------------------------------------------------------------------
   Usage:  ICON("home")  ->  returns an <svg> string that inherits currentColor.
   Stroke icons are 24x24, 1.9 stroke, rounded. Size them with CSS (width/height
   on the .icon wrapper or font-size won't apply — set width/height).
   ========================================================================== */
(function () {
  var S = function (body, opts) {
    opts = opts || {};
    var fill = opts.fill ? 'fill="currentColor"' : 'fill="none"';
    var stroke = opts.fill ? '' : 'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
    return '<svg viewBox="0 0 24 24" ' + fill + ' ' + stroke + ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + body + '</svg>';
  };

  var ICONS = {
    home: S('<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10.5V20h12v-9.5"/><path d="M10 20v-5h4v5"/>'),
    homeFilled: S('<path d="M3.8 10.8 12 3.7l8.2 7.1v9.1a1.7 1.7 0 0 1-1.7 1.7h-4.2v-6.3H9.7v6.3H5.5a1.7 1.7 0 0 1-1.7-1.7Z"/>', { fill:true }),
    workout: S('<path d="M7 8v8M17 8v8M4.5 9.5v5M19.5 9.5v5M7 12h10"/>'),
    workoutFilled: S('<rect x="2.5" y="9" width="3" height="6" rx="1.2"/><rect x="6" y="7.5" width="2.5" height="9" rx="1.2"/><rect x="15.5" y="7.5" width="2.5" height="9" rx="1.2"/><rect x="18.5" y="9" width="3" height="6" rx="1.2"/><rect x="8" y="10.7" width="8" height="2.6" rx="1.3"/>', { fill:true }),
    plans: S('<path d="M8 4.5V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v.5h1.5a2.5 2.5 0 0 1 2.5 2.5v12.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5V7a2.5 2.5 0 0 1 2.5-2.5Z"/><rect x="8.5" y="4" width="7" height="3" rx="1.5"/><circle cx="8" cy="11.5" r="1"/><path d="M11.5 11.5H17"/><circle cx="8" cy="16.5" r="1"/><path d="M11.5 16.5H17"/>'),
    plansFilled: S('<path fill-rule="evenodd" d="M10 1.5h4A2.5 2.5 0 0 1 16.5 4H18a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1.5A2.5 2.5 0 0 1 10 1.5ZM9 5.2c0-.7.6-1.2 1.2-1.2h3.6c.6 0 1.2.5 1.2 1.2s-.6 1.3-1.2 1.3h-3.6C9.6 6.5 9 5.9 9 5.2Zm-1 5.1a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm3.5.3h5.8v2h-5.8v-2ZM8 15.3a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm3.5.3h5.8v2h-5.8v-2Z"/>', { fill:true }),
    history: S('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v3h3"/><path d="M12 8v4l2.5 2"/>'),
    historyFilled: S('<path d="M12 3a9 9 0 1 1-7.1 3.5L3 8.4V3h5.4L6.6 4.8A7 7 0 1 0 12 5Zm-1 3.5h2v5l3.2 2-1.1 1.7-4.1-2.6Z"/>', { fill:true }),
    profile: S('<circle cx="12" cy="8.5" r="3.5"/><path d="M5.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/>'),
    profileFilled: S('<circle cx="12" cy="8" r="4.2"/><path d="M4.5 21c.5-4.5 3.5-7 7.5-7s7 2.5 7.5 7Z"/>', { fill:true }),
    settings: S('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3"/>'),
    play: S('<path d="M8 5.5v13l11-6.5z"/>', { fill: true }),
    plus: S('<path d="M12 5v14M5 12h14"/>'),
    minus: S('<path d="M5 12h14"/>'),
    search: S('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/>'),
    star: S('<path d="m12 4 2.4 5 5.4.7-4 3.7 1 5.4L12 16l-4.8 2.8 1-5.4-4-3.7 5.4-.7z"/>'),
    starFilled: S('<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.8l1-5.9-4.3-4.1 5.9-.8z"/>', { fill: true }),
    close: S('<path d="M6 6l12 12M18 6 6 18"/>'),
    check: S('<path d="M5 12.5 10 17 19 7"/>'),
    chevronRight: S('<path d="m9 6 6 6-6 6"/>'),
    chevronLeft: S('<path d="m15 6-6 6 6 6"/>'),
    chevronDown: S('<path d="m6 9 6 6 6-6"/>'),
    more: S('<circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none"/>'),
    help: S('<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.4 2.4 0 1 1 3.3 2.2c-.7.3-1 .8-1 1.6v.4"/><circle cx="12" cy="16.6" r="0.6" fill="currentColor" stroke="none"/>'),
    info: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r="0.7" fill="currentColor" stroke="none"/>'),
    bulb: S('<path d="M9 17h6"/><path d="M9.5 20h5"/><path d="M8 13.5a5 5 0 1 1 8 0c-.7.9-1.3 1.6-1.3 2.5H9.3c0-.9-.6-1.6-1.3-2.5z"/>'),
    trash: S('<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/>'),
    edit: S('<path d="M5 19l1-4 9-9 3 3-9 9z"/><path d="M14 7l3 3"/>'),
    download: S('<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 20h14"/>'),
    upload: S('<path d="M12 20V9M8 13l4-4 4 4"/><path d="M5 5h14"/>'),
    dumbbell: S('<path d="M5 9v6M8 7.5v9M16 7.5v9M19 9v6M8 12h8"/>'),
    heart: S('<path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20z"/>'),
    flame: S('<path d="M12 3c1 3-1.5 4-1.5 6.5A1.6 1.6 0 0 0 12 11c1-1.5.5-2.8.5-2.8 2 1.4 3 3.3 3 5.3a3.5 3.5 0 0 1-7 .2c0-1.4.6-2.3 1-3-1.3.2-2 .9-2.5 1.8C6 11 8.5 6 12 3z"/>'),
    trophy: S('<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3"/><path d="M12 12v4M9 20h6M10 20v-2h4v2"/>'),
    calendar: S('<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 9.5h16M8 3.5v3M16 3.5v3"/>'),
    calendarFilled: S('<path d="M6 4h1V2.8h2V4h6V2.8h2V4h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm-1 6v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9Z"/>', { fill:true }),
    grip: S('<circle cx="9" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="1.3" fill="currentColor" stroke="none"/>'),
    arrowRight: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    arrowLeft: S('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    eye: S('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.7"/>'),
    eyeOff: S('<path d="M4 4l16 16"/><path d="M9.5 9.6A2.7 2.7 0 0 0 12 14.7c.7 0 1.4-.3 1.9-.8"/><path d="M6.3 6.6C3.9 8.1 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.5 0 2.8-.4 3.9-1M10 5.7c.6-.1 1.3-.2 2-.2 6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2 2.6"/>'),
    lock: S('<rect x="5.5" y="10.5" width="13" height="9" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
    undo: S('<path d="M9 7 5 11l4 4"/><path d="M5 11h9a5 5 0 0 1 0 10h-3"/>'),
    copy: S('<rect x="8" y="8" width="11" height="11" rx="2.5"/><path d="M5 16V6a2 2 0 0 1 2-2h9"/>'),
    target: S('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/>'),
    sparkle: S('<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/>'),
    palette: S('<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 2-1 2-2 0-1.4 1-2 2.2-2H18a3 3 0 0 0 3-3c0-4.7-4-7-9-7z"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8.5" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"/>'),
    refresh: S('<path d="M5 12a7 7 0 0 1 12-5l2 2M19 12a7 7 0 0 1-12 5l-2-2"/><path d="M19 4v5h-5M5 20v-5h5"/>'),
    clock: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    ruler: S('<rect x="3.5" y="8" width="17" height="8" rx="1.5" transform="rotate(0 12 12)"/><path d="M7 8v3M11 8v4M15 8v3"/>'),
    fire: S('<path d="M12 3c1 3-1.5 4-1.5 6.5A1.6 1.6 0 0 0 12 11c1-1.5.5-2.8.5-2.8 2 1.4 3 3.3 3 5.3a3.5 3.5 0 0 1-7 .2c0-1.4.6-2.3 1-3-1.3.2-2 .9-2.5 1.8C6 11 8.5 6 12 3z"/>'),
    chart: S('<path d="M5 4v15h15"/><path d="M8 15l3-4 3 2 4-6"/>'),
    medal: S('<circle cx="12" cy="14" r="5"/><path d="M9 9 7 3h4l1.5 4M15 9l2-6h-4l-1.5 4"/><path d="M12 12.5 12.9 14H14l-1 1 .4 1.5L12 15.7 10.6 16.5 11 15l-1-1h1.1z" fill="currentColor" stroke="none"/>'),
    user: S('<circle cx="12" cy="8.5" r="3.5"/><path d="M5.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/>'),
    shield: S('<path d="M12 3.5 19 6v5c0 5-3.2 7.8-7 9.5C8.2 18.8 5 16 5 11V6z"/>'),
    skip: S('<path d="M7 6v12M17 6 9 12l8 6z" fill="currentColor" stroke="none"/>'),
    cardio: S('<path d="M4 12h3l2-4 3 8 2-5 1.5 1H20"/>'),
    weight: S('<rect x="5" y="9" width="14" height="6" rx="2"/><path d="M9 7v10M15 7v10"/>'),
    flag: S('<path d="M6 21V4M6 4h11l-2 3 2 3H6"/>')
  };

  window.ICON = function (name, fallback) {
    return ICONS[name] || ICONS[fallback || "info"];
  };
  window.ICONS = ICONS;
})();
