/* ============================================================================
   equipment.js  —  Starter equipment dataset
   ----------------------------------------------------------------------------
   Each item:
     id          unique kebab-case id (also the image filename stem)
     name        display name
     category    one of CATEGORIES below
     type        "strength" (sets/reps/weight) | "cardio" (minutes/distance/intensity)
     muscles     array of muscle keys (see js/muscleMap.js MUSCLE_KEYS)
     defaults    first-time logging values
     instructions[]  "How to use" steps (beginner friendly)
     mistakes[]      common mistakes
     tip             one short beginner tip
     favorite, hidden  user flags (mutated + persisted at runtime)
   Images are resolved automatically:
     thumbnail -> images/machines/{id}.jpg
     in-use    -> images/machines/{id}-inuse.jpg
   Replace those files to swap art later — no code changes needed.
   ========================================================================== */

window.EQUIPMENT_CATEGORIES = [
  "Strength Machines",
  "Cable Machines",
  "Smith Machine",
  "Free Weights",
  "Benches",
  "Cardio",
  "Bodyweight / No Machine"
];

window.EQUIPMENT = [
  /* ---------------- Strength Machines ---------------- */
  {
    id: "leg-press", name: "Leg Press", category: "Strength Machines", type: "strength",
    muscles: ["quads", "glutes", "hamstrings"],
    defaults: { weight: 40, reps: 10, sets: 3 },
    instructions: [
      "Sit back with your whole back against the pad.",
      "Place feet flat on the platform, about shoulder-width apart.",
      "Release the safety handles and lower slowly until knees reach about 90°.",
      "Push through your heels back to the start without locking your knees."
    ],
    mistakes: ["Letting knees cave inward", "Locking knees at the top", "Lowering too fast"],
    tip: "Keep your lower back glued to the seat the whole time.",
    favorite: true, hidden: false
  },
  {
    id: "chest-press", name: "Chest Press", category: "Strength Machines", type: "strength",
    muscles: ["chest", "shoulders", "triceps"],
    defaults: { weight: 30, reps: 10, sets: 3 },
    instructions: [
      "Set the seat so the handles line up with the middle of your chest.",
      "Grip the handles and keep your back against the pad.",
      "Press forward smoothly until arms are nearly straight.",
      "Return slowly with control."
    ],
    mistakes: ["Shrugging shoulders up", "Bouncing the weight", "Arching your back off the pad"],
    tip: "Breathe out as you press, in as you return.",
    favorite: true, hidden: false
  },
  {
    id: "lat-pulldown", name: "Lat Pulldown", category: "Strength Machines", type: "strength",
    muscles: ["lats", "upper-back", "biceps"],
    defaults: { weight: 40, reps: 10, sets: 3 },
    instructions: [
      "Adjust the thigh pad so your legs sit snug underneath.",
      "Grab the bar slightly wider than shoulder width.",
      "Pull the bar down to your upper chest, leading with your elbows.",
      "Let the bar rise slowly back up."
    ],
    mistakes: ["Leaning way back", "Pulling behind the neck", "Using only your arms"],
    tip: "Think about pulling your elbows down toward your hips.",
    favorite: false, hidden: false
  },
  {
    id: "row-machine", name: "Seated Row", category: "Strength Machines", type: "strength",
    muscles: ["upper-back", "lats", "biceps"],
    defaults: { weight: 40, reps: 10, sets: 3 },
    instructions: [
      "Sit tall with a slight bend in your knees.",
      "Grab the handles and keep your chest up.",
      "Pull the handles toward your stomach, squeezing your shoulder blades.",
      "Extend your arms slowly back to the start."
    ],
    mistakes: ["Rounding your back", "Yanking with momentum", "Shrugging shoulders"],
    tip: "Squeeze your shoulder blades together at the end of each pull.",
    favorite: false, hidden: false
  },
  {
    id: "shoulder-press", name: "Shoulder Press", category: "Strength Machines", type: "strength",
    muscles: ["shoulders", "triceps"],
    defaults: { weight: 20, reps: 10, sets: 3 },
    instructions: [
      "Set the seat so handles are around shoulder height.",
      "Keep your back against the pad and core braced.",
      "Press up smoothly until arms are nearly straight.",
      "Lower with control to the start."
    ],
    mistakes: ["Arching the lower back", "Locking elbows hard", "Pressing too fast"],
    tip: "Start light here — shoulders fatigue quickly.",
    favorite: false, hidden: false
  },
  {
    id: "leg-extension", name: "Leg Extension", category: "Strength Machines", type: "strength",
    muscles: ["quads"],
    defaults: { weight: 30, reps: 10, sets: 3 },
    instructions: [
      "Sit back and place your shins behind the lower pad.",
      "Line the pad up just above your ankles.",
      "Straighten your legs in a controlled motion.",
      "Lower slowly without letting the weight slam."
    ],
    mistakes: ["Kicking up with momentum", "Letting weight drop fast", "Gripping the seat too hard"],
    tip: "Pause for a moment at the top to feel your thighs work.",
    favorite: false, hidden: false
  },
  {
    id: "hip-abductor", name: "Hip Abductor", category: "Strength Machines", type: "strength",
    muscles: ["glutes"],
    defaults: { weight: 40, reps: 12, sets: 3 },
    instructions: [
      "Sit with the pads against the outside of your knees.",
      "Keep your back against the seat.",
      "Push your knees outward in a slow, steady motion.",
      "Bring them back in with control."
    ],
    mistakes: ["Using momentum to fling open", "Leaning forward", "Going too heavy"],
    tip: "Move slowly — the squeeze matters more than the weight.",
    favorite: false, hidden: false
  },
  {
    id: "ab-crunch", name: "Ab Crunch Machine", category: "Strength Machines", type: "strength",
    muscles: ["abs"],
    defaults: { weight: 20, reps: 12, sets: 3 },
    instructions: [
      "Sit and hold the handles or place arms on the pads.",
      "Crunch forward by curling your ribs toward your hips.",
      "Pause briefly when fully contracted.",
      "Return slowly to the start."
    ],
    mistakes: ["Pulling with your arms", "Using a jerky motion", "Holding your breath"],
    tip: "Lead the movement with your stomach, not your arms.",
    favorite: false, hidden: false
  },
  {
    id: "back-extension", name: "Back Extension", category: "Strength Machines", type: "strength",
    muscles: ["lower-back", "glutes", "hamstrings"],
    defaults: { weight: 0, reps: 12, sets: 3 },
    instructions: [
      "Set the pad just below your hips.",
      "Cross your arms or hold the handles.",
      "Lower your upper body, hinging at the hips.",
      "Rise back up until your body is in a straight line."
    ],
    mistakes: ["Over-arching at the top", "Rounding the back", "Swinging up too fast"],
    tip: "Stop when your body is straight — don't bend backward.",
    favorite: false, hidden: false
  },
  {
    id: "calf-raise", name: "Calf Raise", category: "Strength Machines", type: "strength",
    muscles: ["calves"],
    defaults: { weight: 40, reps: 15, sets: 3 },
    instructions: [
      "Place the balls of your feet on the platform.",
      "Rest the pads on your shoulders or knees depending on the machine.",
      "Rise up onto your toes as high as you can.",
      "Lower slowly until you feel a stretch."
    ],
    mistakes: ["Bouncing quickly", "Half range of motion", "Leaning forward"],
    tip: "Get a full stretch at the bottom and a tall squeeze at the top.",
    favorite: false, hidden: false
  },
  {
    id: "glute-kickback", name: "Glute Kickback", category: "Strength Machines", type: "strength",
    muscles: ["glutes", "hamstrings"],
    defaults: { weight: 20, reps: 12, sets: 3 },
    instructions: [
      "Place one foot on the platform and hold the supports.",
      "Keep a slight bend in the working leg.",
      "Push the platform back by squeezing your glute.",
      "Return slowly and repeat, then switch legs."
    ],
    mistakes: ["Arching your back to push further", "Rushing reps", "Going too heavy"],
    tip: "Squeeze your glute at the top of each rep.",
    favorite: false, hidden: false
  },
  {
    id: "hack-squat", name: "Hack Squat", category: "Strength Machines", type: "strength",
    muscles: ["quads", "glutes"],
    defaults: { weight: 40, reps: 10, sets: 3 },
    instructions: [
      "Set your shoulders under the pads and back flat against the rest.",
      "Place feet shoulder-width on the platform.",
      "Release the safeties and lower until knees reach about 90°.",
      "Drive back up through your heels."
    ],
    mistakes: ["Knees caving in", "Heels lifting", "Going too deep too soon"],
    tip: "Push the floor away through your whole foot.",
    favorite: false, hidden: false
  },
  {
    id: "assisted-pull-up", name: "Assisted Pull-Up", category: "Strength Machines", type: "strength",
    muscles: ["lats", "upper-back", "biceps"],
    defaults: { weight: 50, reps: 8, sets: 3 },
    instructions: [
      "Set the assist weight (more weight = more help).",
      "Kneel or stand on the pad and grab the handles.",
      "Pull yourself up until your chin clears the bar.",
      "Lower slowly with control."
    ],
    mistakes: ["Dropping down fast", "Half reps", "Swinging your body"],
    tip: "More assist weight makes it easier — lower it as you get stronger.",
    favorite: false, hidden: false
  },

  {
    id: "chest-fly", name: "Chest Fly", category: "Strength Machines", type: "strength",
    muscles: ["chest", "shoulders"],
    defaults: { weight: 25, reps: 12, sets: 3 },
    instructions: [
      "Set the seat so the handles are at chest height.",
      "Sit back with a slight bend in your elbows.",
      "Bring the handles together in front of your chest.",
      "Open slowly until you feel a gentle stretch."
    ],
    mistakes: ["Straightening the arms fully", "Using momentum", "Shrugging the shoulders"],
    tip: "Imagine hugging a big tree — smooth and controlled.",
    favorite: false, hidden: false
  },

  /* ---------------- Cable Machines ---------------- */
  {
    id: "cable-tower", name: "Cable Tower Machine", category: "Cable Machines", type: "strength",
    muscles: ["upper-back", "shoulders", "triceps", "biceps"],
    defaults: { weight: 20, reps: 12, sets: 3 },
    instructions: [
      "Set the pulley height for your exercise.",
      "Select your weight on the stack.",
      "Keep your core braced and move in a controlled path.",
      "Return slowly, keeping tension on the cable."
    ],
    mistakes: ["Using body swing", "Letting the stack slam", "Standing too close"],
    tip: "Keep slight tension on the cable the whole set.",
    favorite: false, hidden: false
  },
  {
    id: "cable-hip-abduction", name: "Cable Hip Abduction", category: "Cable Machines", type: "strength",
    muscles: ["glutes"],
    defaults: { weight: 10, reps: 12, sets: 3 },
    instructions: [
      "Attach the ankle strap to the low pulley and your outer ankle.",
      "Hold the frame for balance.",
      "Lift your leg out to the side, leading with your heel.",
      "Lower slowly, then switch legs."
    ],
    mistakes: ["Leaning toward the machine", "Swinging the leg", "Going too heavy"],
    tip: "Stand tall and move only at the hip.",
    favorite: false, hidden: false
  },
  {
    id: "cable-biceps-bar", name: "Cable Biceps Bar", category: "Cable Machines", type: "strength",
    muscles: ["biceps", "forearms"],
    defaults: { weight: 20, reps: 12, sets: 3 },
    instructions: [
      "Attach a bar to the low pulley.",
      "Grab the bar with palms up, elbows by your sides.",
      "Curl the bar up toward your shoulders.",
      "Lower slowly to a full stretch."
    ],
    mistakes: ["Swinging your elbows forward", "Using your back", "Rushing the lower"],
    tip: "Keep your elbows pinned to your sides.",
    favorite: false, hidden: false
  },
  {
    id: "cable-triceps-bar", name: "Cable Triceps Bar", category: "Cable Machines", type: "strength",
    muscles: ["triceps"],
    defaults: { weight: 20, reps: 12, sets: 3 },
    instructions: [
      "Attach a bar to the high pulley.",
      "Grab with palms down, elbows tucked.",
      "Push the bar down until arms are straight.",
      "Let it rise slowly to chest height."
    ],
    mistakes: ["Flaring elbows out", "Leaning over the bar", "Short reps"],
    tip: "Keep your upper arms still — only the forearms move.",
    favorite: false, hidden: false
  },
  {
    id: "cable-rope", name: "Cable Rope", category: "Cable Machines", type: "strength",
    muscles: ["triceps", "shoulders", "abs"],
    defaults: { weight: 15, reps: 12, sets: 3 },
    instructions: [
      "Attach the rope to the pulley at the right height.",
      "Hold an end in each hand with a neutral grip.",
      "Move through your exercise with control.",
      "Return slowly, keeping the rope tense."
    ],
    mistakes: ["Letting the rope snap back", "Using momentum", "Gripping too tightly"],
    tip: "Spread the rope ends apart at the end of each rep.",
    favorite: false, hidden: false
  },

  /* ---------------- Smith Machine ---------------- */
  {
    id: "smith-machine", name: "Smith Machine", category: "Smith Machine", type: "strength",
    muscles: ["quads", "glutes", "chest", "shoulders"],
    defaults: { weight: 30, reps: 10, sets: 3 },
    instructions: [
      "Set the safety stops at a sensible height.",
      "Position the bar for your exercise (squat, press, etc.).",
      "Twist the bar to unrack it.",
      "Move slowly and re-rack by twisting at the end."
    ],
    mistakes: ["Forgetting to set safeties", "Locking out hard", "Feet placed wrong for squats"],
    tip: "The bar moves in a fixed line — let it guide you.",
    favorite: false, hidden: false
  },

  /* ---------------- Free Weights ---------------- */
  {
    id: "dumbbells", name: "Dumbbells", category: "Free Weights", type: "strength",
    muscles: ["chest", "shoulders", "biceps", "triceps"],
    defaults: { weight: 15, reps: 10, sets: 3 },
    instructions: [
      "Pick a pair you can control for all your reps.",
      "Keep your core braced and wrists straight.",
      "Move through a full, controlled range.",
      "Set them down safely when you finish."
    ],
    mistakes: ["Going too heavy too soon", "Using momentum", "Letting wrists bend back"],
    tip: "If your form breaks down, drop to a lighter pair.",
    favorite: true, hidden: false
  },
  {
    id: "barbell", name: "Barbell", category: "Free Weights", type: "strength",
    muscles: ["chest", "back", "quads", "glutes"],
    defaults: { weight: 45, reps: 8, sets: 3 },
    instructions: [
      "Load even weight on both sides and use clips.",
      "Set your grip evenly on the bar.",
      "Brace your core before each rep.",
      "Move with control and re-rack safely."
    ],
    mistakes: ["Uneven grip", "No clips on plates", "Rounding the back"],
    tip: "The empty bar is about 45 lb — start there to learn the movement.",
    favorite: false, hidden: false
  },
  {
    id: "kettlebell", name: "Kettlebell", category: "Free Weights", type: "strength",
    muscles: ["glutes", "hamstrings", "shoulders", "abs"],
    defaults: { weight: 20, reps: 12, sets: 3 },
    instructions: [
      "Choose a bell you can control.",
      "Hinge at the hips, keeping a flat back.",
      "Drive with your hips for swings or press for overhead work.",
      "Set the bell down with a flat back."
    ],
    mistakes: ["Squatting instead of hinging", "Rounding the back", "Over-gripping"],
    tip: "Power comes from your hips, not your arms.",
    favorite: false, hidden: false
  },
  {
    id: "medicine-ball", name: "Medicine Ball", category: "Free Weights", type: "strength",
    muscles: ["abs", "obliques", "shoulders"],
    defaults: { weight: 8, reps: 12, sets: 3 },
    instructions: [
      "Pick a light ball to start.",
      "Hold it close to your body.",
      "Move through twists, throws, or slams with control.",
      "Keep your core tight throughout."
    ],
    mistakes: ["Using your back to twist", "Holding your breath", "Going too heavy"],
    tip: "Rotate from your core, not just your arms.",
    favorite: false, hidden: false
  },
  {
    id: "lateral-raise", name: "Lateral Raise", category: "Free Weights", type: "strength",
    muscles: ["shoulders"],
    defaults: { weight: 8, reps: 12, sets: 3 },
    instructions: [
      "Hold a light dumbbell in each hand by your sides.",
      "Keep a slight bend in your elbows.",
      "Raise your arms out to the sides to shoulder height.",
      "Lower slowly with control."
    ],
    mistakes: ["Swinging the weights up", "Raising above shoulder height", "Shrugging"],
    tip: "Lead with your elbows, not your hands.",
    favorite: false, hidden: false
  },
  {
    id: "bicep-curl", name: "Bicep Curl Station", category: "Free Weights", type: "strength",
    muscles: ["biceps", "forearms"],
    defaults: { weight: 15, reps: 12, sets: 3 },
    instructions: [
      "Sit or stand with arms resting on the pad if available.",
      "Hold the weight with palms up.",
      "Curl up toward your shoulders.",
      "Lower slowly to a full stretch."
    ],
    mistakes: ["Swinging the weight", "Half reps", "Lifting your elbows"],
    tip: "Control the way down — that's where strength is built.",
    favorite: false, hidden: false
  },
  {
    id: "squat-rack", name: "Squat Rack", category: "Free Weights", type: "strength",
    muscles: ["quads", "glutes", "hamstrings", "lower-back"],
    defaults: { weight: 45, reps: 8, sets: 3 },
    instructions: [
      "Set the bar and safety arms to the right height.",
      "Step under the bar onto your upper back and unrack.",
      "Squat down with control until thighs are about parallel.",
      "Drive up through your heels and re-rack carefully."
    ],
    mistakes: ["Bar set too high", "No safety arms", "Knees caving in"],
    tip: "Always set the safety arms — they catch the bar if you miss.",
    favorite: false, hidden: false
  },

  /* ---------------- Benches ---------------- */
  {
    id: "bench-press", name: "Bench Press", category: "Benches", type: "strength",
    muscles: ["chest", "shoulders", "triceps"],
    defaults: { weight: 45, reps: 8, sets: 3 },
    instructions: [
      "Lie back with eyes under the bar.",
      "Grip slightly wider than shoulder width.",
      "Lower the bar to mid-chest with control.",
      "Press back up; use a spotter when going heavier."
    ],
    mistakes: ["Bouncing off the chest", "Flaring elbows wide", "Lifting hips off the bench"],
    tip: "Keep your feet flat and use a spotter when in doubt.",
    favorite: false, hidden: false
  },
  {
    id: "incline-press", name: "Incline Press", category: "Benches", type: "strength",
    muscles: ["chest", "shoulders", "triceps"],
    defaults: { weight: 30, reps: 8, sets: 3 },
    instructions: [
      "Set the bench to a low incline (around 30°).",
      "Grip the bar or dumbbells evenly.",
      "Lower to your upper chest with control.",
      "Press up smoothly without locking hard."
    ],
    mistakes: ["Incline set too steep", "Flaring elbows", "Arching the back"],
    tip: "A lower incline targets the upper chest without straining shoulders.",
    favorite: false, hidden: false
  },

  /* ---------------- Cardio ---------------- */
  {
    id: "treadmill", name: "Treadmill", category: "Cardio", type: "cardio",
    muscles: ["cardio", "quads", "calves"],
    defaults: { minutes: 30, distance: 1.5, intensity: "Moderate" },
    instructions: [
      "Clip the safety key to your clothing.",
      "Start at a slow walk to warm up.",
      "Gradually raise speed or incline to your level.",
      "Cool down at a slow pace before stopping."
    ],
    mistakes: ["Holding the rails the whole time", "Starting too fast", "Skipping the cool-down"],
    tip: "Walking at an incline is a great low-impact start.",
    favorite: true, hidden: false
  },
  {
    id: "elliptical", name: "Elliptical", category: "Cardio", type: "cardio",
    muscles: ["cardio", "quads", "glutes"],
    defaults: { minutes: 30, distance: 2.0, intensity: "Moderate" },
    instructions: [
      "Step on and hold the handles lightly.",
      "Begin pedaling in a smooth motion.",
      "Adjust resistance to a comfortable challenge.",
      "Keep an upright posture throughout."
    ],
    mistakes: ["Leaning on the handles", "Resistance too high", "Hunching forward"],
    tip: "Push and pull the handles to work your arms too.",
    favorite: false, hidden: false
  },
  {
    id: "stair-climber", name: "Stair Climber", category: "Cardio", type: "cardio",
    muscles: ["cardio", "glutes", "quads", "calves"],
    defaults: { minutes: 20, distance: 0, intensity: "Moderate" },
    instructions: [
      "Step on carefully and hold the rails to start.",
      "Begin at a slow, steady pace.",
      "Stand tall and step with full feet.",
      "Slow down gradually to finish."
    ],
    mistakes: ["Leaning heavily on the rails", "Tiny quick steps", "Hunching over"],
    tip: "Stand upright and take full steps for the best results.",
    favorite: false, hidden: false
  },
  {
    id: "jump-rope", name: "Jump Rope", category: "Cardio", type: "cardio",
    muscles: ["cardio", "calves", "shoulders"],
    defaults: { minutes: 10, distance: 0, intensity: "Moderate" },
    instructions: [
      "Size the rope so the handles reach your armpits.",
      "Turn the rope mostly from your wrists.",
      "Make small, light jumps off the balls of your feet.",
      "Rest as needed between rounds."
    ],
    mistakes: ["Jumping too high", "Swinging from the shoulders", "Stiff landings"],
    tip: "Small wrist circles keep the rope smooth and steady.",
    favorite: false, hidden: false
  },
  {
    id: "battle-ropes", name: "Battle Ropes", category: "Cardio", type: "cardio",
    muscles: ["cardio", "shoulders", "abs"],
    defaults: { minutes: 10, distance: 0, intensity: "Hard" },
    instructions: [
      "Grab one end of the rope in each hand.",
      "Stand in a quarter squat with a braced core.",
      "Make alternating waves with your arms.",
      "Work in short bursts with rest between."
    ],
    mistakes: ["Standing fully upright", "Only moving the arms", "Going too long without rest"],
    tip: "Short, hard bursts beat one long slow round.",
    favorite: false, hidden: false
  },
  {
    id: "box-jump", name: "Box Jump", category: "Cardio", type: "cardio",
    muscles: ["cardio", "quads", "glutes", "calves"],
    defaults: { minutes: 10, distance: 0, intensity: "Hard" },
    instructions: [
      "Pick a box height you're confident with.",
      "Stand a short step away with feet hip-width.",
      "Swing your arms and jump onto the box, landing softly.",
      "Step down (don't jump down) and reset."
    ],
    mistakes: ["Box too high", "Landing with stiff legs", "Jumping back down"],
    tip: "Start with a low box and always step back down.",
    favorite: false, hidden: false
  },

  /* ---------------- Bodyweight / No Machine ---------------- */
  {
    id: "chin-up", name: "Chin-Up", category: "Bodyweight / No Machine", type: "strength",
    muscles: ["lats", "biceps", "upper-back"],
    defaults: { weight: 0, reps: 5, sets: 3 },
    instructions: [
      "Grab the bar with palms facing you.",
      "Hang with arms straight and core tight.",
      "Pull up until your chin clears the bar.",
      "Lower slowly with control."
    ],
    mistakes: ["Swinging your legs", "Half reps", "Dropping down fast"],
    tip: "Use the assisted machine if a full chin-up is too hard yet.",
    favorite: false, hidden: false
  },
  {
    id: "balance-ball", name: "Balance Ball", category: "Bodyweight / No Machine", type: "cardio",
    muscles: ["abs", "obliques", "lower-back"],
    defaults: { minutes: 10, distance: 0, intensity: "Easy" },
    instructions: [
      "Choose a ball that lets your hips sit level with your knees.",
      "Engage your core to stay balanced.",
      "Hold positions or do gentle movements.",
      "Move slowly and keep control."
    ],
    mistakes: ["Rushing movements", "Holding your breath", "Letting the back sag"],
    tip: "Small, slow movements challenge your balance the most.",
    favorite: false, hidden: false
  },
  {
    id: "full-body-stretch", name: "Full Body Stretch", category: "Bodyweight / No Machine", type: "cardio",
    muscles: ["cardio", "lower-back", "hamstrings", "shoulders"],
    defaults: { minutes: 10, distance: 0, intensity: "Easy" },
    instructions: [
      "Find an open space on a mat.",
      "Move gently into each stretch.",
      "Hold each position and breathe slowly.",
      "Never bounce or force a stretch."
    ],
    mistakes: ["Bouncing into stretches", "Holding your breath", "Stretching cold muscles too hard"],
    tip: "Ease into each stretch and breathe — never force it.",
    favorite: false, hidden: false
  }
];

/* Resolve image paths from id (keeps data clean + assets swappable). */
window.EQUIPMENT.forEach(function (e) {
  e.img = "images/machines/" + e.id + ".png";
  e.imgUse = "images/machines/" + e.id + "-inuse.png";
});
