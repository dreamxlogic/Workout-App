/* ============================================================================
   badges.js  —  Badge definitions + earn rules
   ----------------------------------------------------------------------------
   Each badge:
     id, name, medal ("gold"|"silver"|"bronze"), blurb, why, how
     goal      number used for the progress bar
     progress  function(stats) -> current value (0..goal)
   `stats` is built in app.js from saved workouts/plans (see computeBadgeStats).
   Medal colors are fixed (gold/silver/bronze) and never themed.
   ========================================================================== */

window.BADGES = [
  {
    id: "first-workout", name: "First Workout", medal: "gold", goal: 1,
    blurb: "You logged and saved your very first workout.",
    why: "Starting is the hardest part — and you did it.",
    how: "Save one completed workout.",
    progress: function (s) { return Math.min(s.workoutCount, 1); }
  },
  {
    id: "first-plan", name: "First Saved Plan", medal: "silver", goal: 1,
    blurb: "You built and saved your first workout plan.",
    why: "A plan takes the guesswork out of gym day.",
    how: "Create and save one plan.",
    progress: function (s) { return Math.min(s.planCount, 1); }
  },
  {
    id: "cardio-starter", name: "Cardio Starter", medal: "bronze", goal: 1,
    blurb: "You completed your first cardio exercise.",
    why: "Cardio builds the engine that powers everything else.",
    how: "Log any cardio exercise in a saved workout.",
    progress: function (s) { return Math.min(s.cardioDone, 1); }
  },
  {
    id: "leg-day", name: "Leg Day Logged", medal: "silver", goal: 1,
    blurb: "You finished a workout with leg-focused machines.",
    why: "Strong legs are the foundation of full-body strength.",
    how: "Save a workout that includes a leg exercise.",
    progress: function (s) { return Math.min(s.legDay, 1); }
  },
  {
    id: "machine-explorer", name: "Machine Explorer", medal: "gold", goal: 5,
    blurb: "You've tried five different machines.",
    why: "Variety keeps workouts balanced and interesting.",
    how: "Use 5 different machines across your workouts.",
    progress: function (s) { return Math.min(s.uniqueMachines, 5); }
  },
  {
    id: "three-this-month", name: "3 Workouts This Month", medal: "silver", goal: 3,
    blurb: "Three saved workouts in the same month.",
    why: "Showing up regularly is where results come from.",
    how: "Save 3 workouts within one calendar month.",
    progress: function (s) { return Math.min(s.workoutsThisMonth, 3); }
  },
  {
    id: "new-machine", name: "Tried a New Machine", medal: "bronze", goal: 1,
    blurb: "You used a machine you'd never logged before.",
    why: "Trying something new is how you grow.",
    how: "Use any machine for the first time.",
    progress: function (s) { return Math.min(s.uniqueMachines >= 1 ? 1 : 0, 1); }
  },
  {
    id: "consistency-starter", name: "Consistency Starter", medal: "gold", goal: 2,
    blurb: "You worked out on multiple days in a short window.",
    why: "A rhythm beats a single big effort every time.",
    how: "Work out on 2 different days within a week.",
    progress: function (s) { return Math.min(s.distinctDaysThisWeek, 2); }
  }
];
