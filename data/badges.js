/* ============================================================================
   badges.js ,  Badge definitions + earn rules  (V4, tiered)
   ----------------------------------------------------------------------------
   Each badge:
     id, name, emblem (vector center icon), blurb, why, how
     progress(stats) -> current numeric value, where `stats` is built in
                        app.js badgeStats() from saved workouts + plans.
     tiers[] -> one entry for single badges, three for tiered badges:
                { medal:"bronze"|"silver"|"gold", goal:Number, label:String }
   Earn rule: a tier is earned when progress(stats) >= tier.goal.
   The highest met tier is the badge's current level (see app.js badgeLevel()).
   Medal colors are fixed (gold/silver/bronze) and never themed.

   IMAGES (optional, vector medal art is the fallback):
     single badge  -> images/badges/{id}.png
     tiered badge  -> images/badges/{id}-bronze.png / -silver.png / -gold.png
   ========================================================================== */

function T(medal, goal, label){ return { medal: medal, goal: goal, label: label }; }

window.BADGES = [
  /* ---------------- Core: single ---------------- */
  {
    id: "first-workout", name: "First Workout", emblem: "star",
    blurb: "You logged and saved your very first workout.",
    why: "Starting is the hardest part, and you did it.",
    how: "Save one completed workout.",
    progress: function (s) { return s.workoutCount; },
    tiers: [ T("gold", 1, "Earned") ]
  },
  {
    id: "first-plan", name: "First Saved Plan", emblem: "calendar",
    blurb: "You built and saved your first workout plan.",
    why: "A plan takes the guesswork out of gym day.",
    how: "Create and save one plan.",
    progress: function (s) { return s.planCount; },
    tiers: [ T("silver", 1, "Earned") ]
  },
  {
    id: "leg-day", name: "Leg Day Logged", emblem: "dumbbell",
    blurb: "You finished a workout with a leg exercise.",
    why: "Strong legs are the foundation of full-body strength.",
    how: "Save a workout that includes a leg exercise.",
    progress: function (s) { return s.legDay; },
    tiers: [ T("silver", 1, "Earned") ]
  },
  {
    id: "full-body", name: "Full Body", emblem: "star",
    blurb: "You've trained every major muscle group.",
    why: "Balanced training keeps you strong and injury-resistant.",
    how: "Work all 6 muscle groups across your history: chest, back, legs, shoulders, arms, core.",
    progress: function (s) { return s.fullBodyGroups; },
    tiers: [ T("gold", 6, "Earned") ]
  },
  {
    id: "hybrid-session", name: "Hybrid Session", emblem: "bolt",
    blurb: "Cardio and strength in a single workout.",
    why: "Mixing both builds your engine and your muscle at once.",
    how: "Complete one workout that includes both a cardio and a strength exercise.",
    progress: function (s) { return s.hybrid; },
    tiers: [ T("silver", 1, "Earned") ]
  },
  {
    id: "comeback-kid", name: "Comeback Kid", emblem: "flame",
    blurb: "You came back after time away.",
    why: "Restarting after a break is a real win, most people don't.",
    how: "Log a workout after 14 or more days away.",
    progress: function (s) { return s.comeback; },
    tiers: [ T("bronze", 1, "Earned") ]
  },
  {
    id: "strong-start", name: "Strong Start", emblem: "dumbbell",
    blurb: "Your first weighted set is in the books.",
    why: "Logging weight and reps is how progress gets measured.",
    how: "Log your first set with both a weight and reps.",
    progress: function (s) { return s.strongStart; },
    tiers: [ T("bronze", 1, "Earned") ]
  },
  {
    id: "personal-best", name: "Personal Best", emblem: "star",
    blurb: "You beat your old top weight on a machine.",
    why: "Progressive overload, lifting more over time, is how you grow.",
    how: "Beat your previous best weight on any machine.",
    progress: function (s) { return s.personalBest; },
    tiers: [ T("gold", 1, "Earned") ]
  },
  {
    id: "monthly-regular", name: "Monthly Regular", emblem: "calendar",
    blurb: "Three workouts inside one calendar month.",
    why: "Showing up regularly is where results come from.",
    how: "Save 3 workouts within one calendar month.",
    progress: function (s) { return s.monthMax; },
    tiers: [ T("silver", 3, "Earned") ]
  },

  /* ---------------- Core: tiered ---------------- */
  {
    id: "workout-warrior", name: "Workout Warrior", emblem: "dumbbell",
    blurb: "Saved workouts are stacking up.",
    why: "Volume of sessions over time is the clearest sign of a habit.",
    how: "Save 10, 25, then 50 total workouts.",
    progress: function (s) { return s.workoutCount; },
    tiers: [ T("bronze", 10, "Regular"), T("silver", 25, "Committed"), T("gold", 50, "Centurion") ]
  },
  {
    id: "machine-explorer", name: "Machine Explorer", emblem: "compass",
    blurb: "You're trying machines all over the gym.",
    why: "Variety keeps workouts balanced and interesting.",
    how: "Use 5, 15, then 30 different machines.",
    progress: function (s) { return s.uniqueMachines; },
    tiers: [ T("bronze", 5, "Curious"), T("silver", 15, "Adventurer"), T("gold", 30, "Cartographer") ]
  },
  {
    id: "weekly-streak", name: "Weekly Streak", emblem: "bolt",
    blurb: "Week after week, you keep showing up.",
    why: "A steady rhythm beats occasional big efforts every time.",
    how: "Work out in 2, 4, then 8 consecutive weeks.",
    progress: function (s) { return s.weeklyStreak; },
    tiers: [ T("bronze", 2, "Rolling"), T("silver", 4, "On Fire"), T("gold", 8, "Unstoppable") ]
  },
  {
    id: "cardio-crew", name: "Cardio Crew", emblem: "heart",
    blurb: "You keep coming back to cardio.",
    why: "Cardio builds the engine that powers everything else.",
    how: "Finish 1, 10, then 25 workouts that include cardio.",
    progress: function (s) { return s.cardioSessions; },
    tiers: [ T("bronze", 1, "Starter"), T("silver", 10, "Runner"), T("gold", 25, "Engine") ]
  },
  {
    id: "heavy-lifter", name: "Heavy Lifter", emblem: "dumbbell",
    blurb: "Serious total weight moved.",
    why: "Total volume, weight times reps, is a big-picture strength measure.",
    how: "Lift 10,000, 50,000, then 150,000 lb in total.",
    progress: function (s) { return s.volumeTotal; },
    tiers: [ T("bronze", 10000, "Strong"), T("silver", 50000, "Powerful"), T("gold", 150000, "Titan") ]
  },
  {
    id: "set-stacker", name: "Set Stacker", emblem: "spark",
    blurb: "The sets keep adding up.",
    why: "Consistent training volume is what drives steady progress.",
    how: "Log 50, 200, then 500 total sets.",
    progress: function (s) { return s.setsTotal; },
    tiers: [ T("bronze", 50, "Builder"), T("silver", 200, "Grinder"), T("gold", 500, "Machine") ]
  },

  /* ---------------- Alternates: single ---------------- */
  {
    id: "perfect-week", name: "Perfect Week", emblem: "calendar",
    blurb: "Four training days in a single week.",
    why: "A packed week shows real commitment to the habit.",
    how: "Work out on 4 different days within one week.",
    progress: function (s) { return s.weekDayMax; },
    tiers: [ T("silver", 4, "Earned") ]
  },
  {
    id: "powerlifter", name: "Powerlifter", emblem: "dumbbell",
    blurb: "You've hit the big three stations.",
    why: "Bench, squat and barbell work cover the core compound lifts.",
    how: "Log the Bench Press, Squat Rack, and Barbell.",
    progress: function (s) { return s.powerlifter; },
    tiers: [ T("gold", 1, "Earned") ]
  },
  {
    id: "variety-day", name: "Variety Day", emblem: "compass",
    blurb: "A single workout covering four muscle groups.",
    why: "Full-body days are efficient and great for beginners.",
    how: "Hit 4 or more muscle groups in one workout.",
    progress: function (s) { return s.varietyDayMax; },
    tiers: [ T("silver", 4, "Earned") ]
  },
  {
    id: "plan-master", name: "Plan Master", emblem: "calendar",
    blurb: "Five saved plans and counting.",
    why: "A library of plans keeps every gym day organized.",
    how: "Create and save 5 plans.",
    progress: function (s) { return s.planCount; },
    tiers: [ T("silver", 5, "Earned") ]
  },
  {
    id: "big-day", name: "Big Day", emblem: "bolt",
    blurb: "A huge single-session volume.",
    why: "A big day now and then pushes your work capacity up.",
    how: "Lift 5,000 lb of total volume in one workout.",
    progress: function (s) { return s.bestWorkoutVolume; },
    tiers: [ T("gold", 5000, "Earned") ]
  },
  {
    id: "stretch-habit", name: "Stretch Habit", emblem: "heart",
    blurb: "You make time to stretch.",
    why: "Mobility work protects your joints and improves your lifts.",
    how: "Include the Full Body Stretch in 5 workouts.",
    progress: function (s) { return s.stretchCount; },
    tiers: [ T("bronze", 5, "Earned") ]
  },
  {
    id: "feedback-loop", name: "Feedback Loop", emblem: "spark",
    blurb: "You rate how your training feels.",
    why: "Rating effort helps the coach tailor future suggestions.",
    how: "Rate difficulty on 15 exercises.",
    progress: function (s) { return s.feedbackCount; },
    tiers: [ T("bronze", 15, "Earned") ]
  },

  /* ---------------- Alternate: tiered ---------------- */
  {
    id: "cardio-clock", name: "Cardio Clock", emblem: "flame",
    blurb: "The cardio minutes keep climbing.",
    why: "Time spent on cardio is the simplest measure of your endurance work.",
    how: "Log 60, 300, then 1,000 total cardio minutes.",
    progress: function (s) { return s.cardioMinutes; },
    tiers: [ T("bronze", 60, "Warmed Up"), T("silver", 300, "Conditioned"), T("gold", 1000, "Marathoner") ]
  }
];
