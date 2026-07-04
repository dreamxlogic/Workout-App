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
    mistakes: [
      "Knees caving inward (valgus) puts shearing stress on the joint — cue 'spread the floor' and track your knees over your second toe.",
      "Locking your knees out hard at the top shifts the load off your quads and onto the joint — stop just short of fully straight.",
      "Dropping the platform fast loses muscle tension and risks bottoming out — take 2-3 seconds on the way down.",
      "Letting your hips curl up off the seat rounds your lower back under load — reduce the weight until you can stay flat.",
      "Setting your feet too low on the platform overloads the knees — place them mid-platform, about shoulder-width."
    ],
    tip: "Think 'slow down, push through your heels.' Keep your whole back pinned to the pad, breathe out as you press, and never let your knees snap straight at the top.",
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
    mistakes: [
      "Shrugging your shoulders up toward your ears takes the chest out of it and strains your neck — pull your shoulders down and back into the pad.",
      "Bouncing or jerking the weight uses momentum instead of muscle — press and return at a steady, controlled pace.",
      "Arching your back off the pad to push heavier puts your lower back at risk — keep your spine and head against the pad.",
      "Flaring your elbows straight out to the sides stresses the shoulder joint — keep them at roughly a 45-degree angle to your body.",
      "Only doing half presses limits the work — extend until your arms are nearly straight, then return all the way."
    ],
    tip: "Set the seat so the handles line up with the middle of your chest. Breathe out as you press, in as you return, and keep your shoulder blades squeezed down the whole set.",
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
    mistakes: [
      "Leaning way back and using your bodyweight turns it into a swing — keep your torso nearly upright with only a slight lean.",
      "Pulling the bar behind your neck strains the shoulders and neck — always bring it down in front to your upper chest.",
      "Pulling with only your arms ignores the big back muscles — start each rep by driving your elbows down.",
      "Letting the bar rocket back up wastes the lowering phase — control it up over 2-3 seconds.",
      "Gripping too wide or too narrow reduces range — set your hands a bit wider than shoulder width."
    ],
    tip: "Think about pulling your elbows down toward your hips, not just moving the bar. Keep your chest tall and let your shoulder blades pull first so your back does the work, not your biceps.",
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
    mistakes: [
      "Rounding your back as you reach forward puts the load on your spine — keep your chest up and a flat back throughout.",
      "Yanking the handles with momentum and rocking your torso cheats the muscle — pull smoothly with your back, not a swing.",
      "Shrugging your shoulders up toward your ears adds neck strain — keep them down and pull your shoulder blades together.",
      "Letting the weight pull your arms forward fast skips the stretch — return slowly with control.",
      "Bending and straightening your knees to heave the weight takes the back out of it — keep your legs still."
    ],
    tip: "Squeeze your shoulder blades together at the end of each pull and hold for a beat. Sit tall, lead with your elbows, and let the weight stretch your back slowly on the way out.",
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
    mistakes: [
      "Arching your lower back to press heavier overloads the spine — brace your core and keep your back flat on the pad.",
      "Locking your elbows out hard at the top jars the joint — stop just short of fully straight.",
      "Pressing too fast and bouncing at the bottom uses momentum — move at a controlled tempo both ways.",
      "Letting the handles drift forward instead of straight up strains the shoulders — press in a straight vertical line.",
      "Starting too heavy fatigues the small shoulder muscles quickly — pick a weight you can control for all reps."
    ],
    tip: "Start lighter than you think — shoulders fatigue fast. Keep your core braced and your back against the pad, press straight up smoothly, and lower with control rather than dropping.",
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
    mistakes: [
      "Kicking up with momentum and swinging your lower legs robs the quads — straighten in a slow, controlled motion.",
      "Letting the weight drop fast and slam the stack skips the lowering phase — lower over 2-3 seconds.",
      "Setting the ankle pad too high or low changes the leverage and strains the knee — line it up just above your ankles.",
      "Gripping the seat and leaning back to heave more weight takes the focus off your legs — stay seated upright.",
      "Using a weight so heavy you can't pause at the top means you're swinging — drop it until you control the movement."
    ],
    tip: "Pause for a beat at the top and squeeze your thighs before lowering. Keep the motion smooth and slow — this exercise is about control and the squeeze, not how much you can fling up.",
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
    mistakes: [
      "Using momentum to fling your knees open wastes the work — push out slowly and steadily.",
      "Leaning your torso forward shifts the effort off the glutes — sit back against the pad.",
      "Going too heavy cuts your range short — use a weight that lets you open fully and control the return.",
      "Snapping your knees back in instead of resisting skips half the rep — bring them in slowly.",
      "Holding your breath and tensing up — exhale as you push out."
    ],
    tip: "Move slowly — the squeeze matters more than the weight. Sit tall against the pad, push your knees out under control, and resist on the way back in instead of letting them snap shut.",
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
    mistakes: [
      "Pulling with your arms or hands instead of your abs takes the work off your core — let your stomach drive the crunch.",
      "Using a jerky, bouncing motion swings the weight — curl down smoothly and rise with control.",
      "Holding your breath spikes pressure — breathe out as you crunch in.",
      "Only doing tiny half-reps limits the work — curl your ribs all the way toward your hips.",
      "Going so heavy your hips do the moving — lower the weight so your abs do the crunching."
    ],
    tip: "Lead the movement with your stomach, not your arms. Think about curling your ribs toward your hips, exhale as you crunch, and pause briefly at the bottom before slowly returning.",
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
    mistakes: [
      "Over-arching and bending backward at the top hyperextends the spine — stop when your body is in a straight line.",
      "Rounding your back on the way down rather than hinging at the hips stresses the spine — hinge from the hips with a flat back.",
      "Swinging up fast with momentum skips the muscle work — rise in a smooth, controlled motion.",
      "Setting the hip pad too high or low changes the hinge point — position it just below your hips.",
      "Adding weight before you've nailed the form — master bodyweight first, then hold a plate."
    ],
    tip: "Stop when your body is straight — don't bend backward at the top. Hinge slowly from your hips with a flat back, and squeeze your glutes to rise rather than yanking up with your lower back.",
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
    mistakes: [
      "Bouncing quickly off the bottom uses the tendon's spring instead of the muscle — pause and control each rep.",
      "Using only a half range of motion shortchanges the calves — rise as high as you can and lower to a full stretch.",
      "Leaning forward or rounding shifts your balance — stay upright and stacked.",
      "Bending your knees during the rep turns it into a different movement — keep your legs straight so the calves do the work.",
      "Going too heavy to get a full stretch — pick a weight that lets you reach a deep stretch and a tall squeeze."
    ],
    tip: "Get a full stretch at the bottom and a tall squeeze at the top, pausing briefly at each end. Slow the reps down — calves respond to full range and control far more than to bouncing.",
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
    mistakes: [
      "Arching your lower back to push the platform further turns it into a back exercise — keep your core braced and move only at the hip.",
      "Rushing the reps and using momentum skips the squeeze — push back slowly and return with control.",
      "Going too heavy makes you swing — use a weight you can move with your glute alone.",
      "Letting your working knee straighten fully changes the angle — keep a slight bend the whole time.",
      "Forgetting to work both sides evenly — match your reps on each leg."
    ],
    tip: "Squeeze your glute hard at the top of each rep and hold for a beat. Keep your back flat and core tight so the movement comes purely from your hip, not from arching your spine.",
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
    mistakes: [
      "Letting your knees cave inward stresses the joints — push them out in line with your toes.",
      "Heels lifting off the platform shifts load onto your knees and toes — keep your whole foot planted.",
      "Dropping too deep too soon before you have the mobility can strain the knees — lower to about 90 degrees and build from there.",
      "Bouncing out of the bottom uses momentum — pause briefly, then drive up.",
      "Rounding your back away from the pad under load is risky — keep your back and shoulders pressed flat against the rest."
    ],
    tip: "Push the floor away through your whole foot, driving through your heels. Keep your back flat against the pad, knees tracking over your toes, and control the descent rather than dropping into it.",
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
    mistakes: [
      "Dropping down fast skips the most valuable part of the rep — lower yourself slowly with control.",
      "Doing half reps without full extension shortchanges your back — start from straight arms and pull your chin over the bar.",
      "Swinging or kipping your body uses momentum — keep your core tight and your body still.",
      "Shrugging your shoulders up to your ears strains the neck — pull your shoulder blades down first.",
      "Setting too little assist and grinding ugly reps — add assist weight so you can move cleanly, then reduce it over time."
    ],
    tip: "Remember more assist weight makes it easier — lower it as you get stronger. Start from a full hang, drive your elbows down to pull your chin over the bar, and lower slowly every rep.",
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
    mistakes: [
      "Straightening your arms fully turns it into a press and stresses the elbows — keep a fixed slight bend throughout.",
      "Using momentum to slap the handles together skips the chest — bring them together smoothly and squeeze.",
      "Shrugging your shoulders up takes the chest out of it — keep them down and back against the pad.",
      "Opening too far back over-stretches the shoulder joint — stop at a gentle stretch, not a deep one.",
      "Going too heavy forces your arms to bend and cheat — pick a weight you can control in an arc."
    ],
    tip: "Imagine hugging a big tree — smooth and controlled. Keep a slight bend in your elbows the whole set, squeeze your chest as the handles meet, and open only until you feel a gentle stretch.",
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
    mistakes: [
      "Using body swing to move the weight cheats the target muscle — brace your core and keep your torso still.",
      "Letting the stack slam down between reps drops the tension — control the return so the plates never crash.",
      "Standing too close or too far changes the cable angle — position yourself so there's tension at the start of the rep.",
      "Gripping with your shoulders shrugged up — keep your shoulders down and relaxed.",
      "Picking a weight so heavy your form falls apart — drop it so you can move on a clean path."
    ],
    tip: "Keep slight tension on the cable the whole set — never let the stack rest at the top. Brace your core, move on a smooth controlled path, and resist the weight on the way back instead of letting it pull you.",
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
    mistakes: [
      "Leaning toward the machine to swing your leg higher cheats the glute — stand tall and stay upright.",
      "Swinging the leg with momentum skips the muscle — lift slowly, leading with your heel.",
      "Going too heavy shortens your range and pulls you off balance — use a light weight you control.",
      "Bending at the waist instead of moving at the hip — keep your torso still and hinge only at the hip joint.",
      "Forgetting to match reps on both legs — work each side evenly."
    ],
    tip: "Stand tall and move only at the hip — hold the frame just for balance, not to lean on. Lift your leg out slowly leading with your heel, and lower it under control rather than letting it drop.",
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
    mistakes: [
      "Swinging your elbows forward turns it into a partial press — keep your elbows pinned to your sides.",
      "Using your back and leaning to heave the bar up cheats the biceps — stand still and curl with your arms only.",
      "Rushing the lowering phase skips half the work — lower over 2-3 seconds to a full stretch.",
      "Only curling halfway shortchanges the muscle — bring the bar up toward your shoulders and down to straight arms.",
      "Gripping so heavy your wrists bend back — pick a weight that keeps your wrists straight and strong."
    ],
    tip: "Keep your elbows pinned to your sides like hinges — only your forearms move. Curl up with a squeeze, then lower slowly to a full stretch; the controlled lowering is where strength is built.",
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
    mistakes: [
      "Flaring your elbows out to the sides recruits the chest and shoulders — keep your elbows tucked against your body.",
      "Leaning over the bar and using bodyweight to push it down cheats the triceps — stay upright and press with your arms.",
      "Doing short reps without locking out skips the squeeze — push down until your arms are fully straight.",
      "Letting the bar fly back up loses tension — control it back to chest height.",
      "Going too heavy so your upper arms swing — lighten it so only your forearms move."
    ],
    tip: "Keep your upper arms still and pinned to your sides — only your forearms move. Tuck your elbows, push the bar all the way to straight arms, squeeze your triceps, then return slowly under control.",
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
    mistakes: [
      "Letting the rope snap back between reps drops the tension — return slowly and keep the rope tense.",
      "Using momentum and body swing moves the weight for you — brace your core and move with control.",
      "Gripping too tightly tires your forearms early — hold firmly but relaxed.",
      "Not spreading the rope ends at the end of the rep limits the squeeze — pull the ends apart at the finish.",
      "Choosing a weight that makes you lean and heave — drop it so you can stay upright and controlled."
    ],
    tip: "Spread the rope ends apart at the end of each rep to get a full squeeze. Keep your core braced and your torso still, and resist the rope on the way back rather than letting it snap you forward.",
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
    mistakes: [
      "Forgetting to set the safety stops leaves nothing to catch the bar if you fail — always set them at a sensible height first.",
      "Locking out hard at the top jars your joints — stop just short of fully straight.",
      "Placing your feet wrong for squats strains the knees or back — position them so your knees track safely on the fixed path.",
      "Forgetting to twist and re-rack the bar at the end can drop it — rack it deliberately before letting go.",
      "Loading too heavy because the bar feels stable — the fixed path doesn't replace good form, so build up gradually."
    ],
    tip: "The bar moves in a fixed line — let it guide you, but always set the safety stops first. Move slowly through your range, brace your core, and twist to re-rack deliberately at the end of your set.",
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
    mistakes: [
      "Going too heavy too soon breaks your form and risks injury — pick a pair you can control for every rep.",
      "Using momentum and swinging the weights up cheats the muscle — move smoothly and deliberately.",
      "Letting your wrists bend back under load strains the joint — keep your wrists straight and firm.",
      "Rushing the lowering phase skips half the benefit — control the weights down over 2-3 seconds.",
      "Dropping the dumbbells carelessly when you finish can hurt you or others — set them down with control."
    ],
    tip: "If your form breaks down, drop to a lighter pair — clean reps beat heavy sloppy ones. Keep your core braced and wrists straight, move through a full controlled range, and lower as deliberately as you lift.",
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
    mistakes: [
      "An uneven grip loads one side more and throws off the movement — set your hands evenly using the bar's markings.",
      "Skipping the clips lets plates slide off and tip the bar — always clip both sides.",
      "Rounding your back when lifting the bar from the floor or racking it risks injury — keep a flat, braced back.",
      "Loading uneven weight on each side makes the bar unstable — match the plates left and right.",
      "Bracing too late means your core isn't ready for the rep — take a breath and tighten before each lift."
    ],
    tip: "The empty bar is about 45 lb — start there to learn the movement before adding plates. Always clip both sides, set an even grip, and brace your core before every rep so your spine stays protected.",
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
    mistakes: [
      "Squatting down instead of hinging at the hips takes power away from swings — push your hips back, not down.",
      "Rounding your back during the hinge stresses the spine — keep a flat back and chest up.",
      "Over-gripping and muscling the bell with your arms tires you out — let your hips drive the movement.",
      "Yanking the bell with your arms on swings instead of letting hip drive float it up — your arms just guide it.",
      "Setting the bell down with a rounded back at the end is a common injury point — hinge with a flat back to put it down."
    ],
    tip: "Power comes from your hips, not your arms — hinge by pushing your hips back, then snap them forward. Keep a flat back and braced core the whole time, and let that hip drive do the work.",
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
    mistakes: [
      "Twisting from your lower back instead of your core strains the spine — rotate through your midsection with a braced core.",
      "Holding your breath spikes pressure and tires you — breathe out on the effort.",
      "Going too heavy slows you down and breaks form — start with a light ball.",
      "Letting the ball drift far from your body reduces control — hold it close.",
      "Rushing throws or slams with sloppy form — stay controlled and deliberate on every rep."
    ],
    tip: "Rotate from your core, not just your arms, and keep the ball close to your body. Start light, brace your stomach, and exhale on each twist, throw, or slam so the power comes from a stable trunk.",
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
    mistakes: [
      "Swinging the weights up with momentum cheats the shoulders — raise them in a controlled motion.",
      "Lifting above shoulder height shifts the work to your traps and can pinch the shoulder — stop at shoulder level.",
      "Shrugging your shoulders up toward your ears adds neck strain — keep them down and relaxed.",
      "Going too heavy forces you to swing — these need a surprisingly light weight to do right.",
      "Straightening your elbows fully puts strain on the joint — keep a soft, fixed bend throughout."
    ],
    tip: "Lead with your elbows, not your hands, and keep them slightly bent. Use a light weight, raise smoothly to shoulder height — no higher — and lower slowly; this is a control exercise, not a heavy one.",
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
    mistakes: [
      "Swinging the weight up with your body cheats the biceps — keep your torso still and curl with your arms.",
      "Doing half reps without a full stretch shortchanges the muscle — lower all the way down each time.",
      "Lifting your elbows forward turns it into a partial press — keep your elbows pinned at your sides.",
      "Rushing the lowering phase wastes the strongest part of the rep — lower over 2-3 seconds.",
      "Letting your wrists curl back under load strains them — keep your wrists straight and firm."
    ],
    tip: "Control the way down — that's where strength is built. Keep your elbows pinned at your sides, curl up with a squeeze, and lower slowly to a full stretch instead of dropping the weight.",
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
    mistakes: [
      "Setting the bar too high means you have to tip-toe to unrack it — set it around chest height so you can step under cleanly.",
      "Skipping the safety arms leaves nothing to catch the bar if you fail — always set them at the bottom of your range.",
      "Letting your knees cave inward stresses the joints — push them out in line with your toes.",
      "Rounding your back under the bar risks injury — keep your chest up and core braced.",
      "Lifting your heels or shifting onto your toes makes you unstable — keep your whole foot planted and drive through your heels."
    ],
    tip: "Always set the safety arms — they catch the bar if you miss a rep. Set the bar around chest height, brace your core before you unrack, squat with knees tracking over your toes, and drive up through your heels.",
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
    mistakes: [
      "Bouncing the bar off your chest uses momentum and can bruise your sternum — lower under control and pause lightly.",
      "Flaring your elbows straight out to the sides stresses the shoulders — keep them tucked to about 45 degrees.",
      "Lifting your hips off the bench to push more weight is unsafe and cheats the lift — keep your hips down and feet flat.",
      "Pressing without a spotter on heavy sets risks getting pinned — use a spotter or the safety arms when in doubt.",
      "An uneven or shifting grip sends the bar off-line — set your hands evenly and grip firmly."
    ],
    tip: "Keep your feet flat and use a spotter when in doubt. Set an even grip, lower the bar to mid-chest with control — no bouncing — keep your elbows tucked around 45 degrees, and press up smoothly without flaring.",
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
    mistakes: [
      "Setting the incline too steep turns it into a shoulder press and strains the joint — keep it low, around 30 degrees.",
      "Flaring your elbows wide stresses the shoulders — keep them tucked toward your body.",
      "Arching your back off the bench to push heavier risks your spine — keep your back and hips settled on the bench.",
      "Lowering the bar too high toward your neck is unsafe — bring it to your upper chest.",
      "Locking out hard and bouncing at the bottom uses momentum — control both directions."
    ],
    tip: "A lower incline (around 30 degrees) targets your upper chest without straining your shoulders. Keep your elbows tucked, lower to your upper chest under control, and press up smoothly without arching off the bench.",
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
    mistakes: [
      "Holding the rails the whole time takes the work off your legs and ruins your posture — let go and swing your arms naturally.",
      "Starting too fast without a warm-up risks strains — begin at a slow walk and build up.",
      "Skipping the cool-down can leave you light-headed — slow down gradually before stopping.",
      "Looking down at your feet or the screen rounds your posture — keep your gaze forward and stand tall.",
      "Cranking the incline and speed up at once is too much too soon — change one variable at a time."
    ],
    tip: "Walking at an incline is a great low-impact way to build fitness. Start slow to warm up, let go of the rails and swing your arms, keep your posture tall, and always cool down before you stop.",
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
    mistakes: [
      "Leaning your weight onto the handles takes the effort off your legs — hold them lightly and stand tall.",
      "Setting the resistance too high wrecks your form and rhythm — pick a level you can pedal smoothly.",
      "Hunching forward strains your back — keep an upright posture.",
      "Only using your legs and ignoring the handles wastes the upper-body work — push and pull the arms too.",
      "Choppy, short strides reduce the benefit — use a smooth, full stride."
    ],
    tip: "Push and pull the handles to work your arms too, but hold them lightly rather than leaning on them. Stand tall, keep a smooth full stride, and set the resistance to a level you can sustain with good form.",
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
    mistakes: [
      "Leaning heavily on the rails dramatically cuts the effort and hunches your back — hold them lightly and stand tall.",
      "Taking tiny quick steps reduces the work — take full, deliberate steps.",
      "Hunching over the console strains your back and neck — keep your chest up and gaze forward.",
      "Starting at a high pace before warming up gasses you out — begin slow and build.",
      "Stepping on just your toes instead of full feet tires your calves and skips the glutes — plant your whole foot."
    ],
    tip: "Stand upright and take full steps with your whole foot for the best results. Hold the rails only for light balance, keep your chest up, and start at a steady pace you can hold rather than sprinting early.",
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
    mistakes: [
      "Jumping too high wastes energy and jars your joints — make small, low hops.",
      "Swinging the rope from your shoulders tires your arms fast — turn it mostly from your wrists.",
      "Landing stiff-legged sends shock through your joints — land softly with a slight knee bend.",
      "Using a wrong-length rope makes timing hard — size it so the handles reach about your armpits.",
      "Trying to go too long unbroken leads to sloppy form — work in short rounds with rest."
    ],
    tip: "Small wrist circles keep the rope smooth and steady — let your wrists, not your shoulders, do the turning. Make low, light jumps off the balls of your feet and land softly with soft knees.",
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
    mistakes: [
      "Standing fully upright removes your power base — stay in a quarter squat with a braced core.",
      "Only moving your arms tires you out fast — drive the waves from your hips and legs too.",
      "Going too long without rest turns it slow and sloppy — work in short, hard bursts.",
      "Holding your breath spikes fatigue — breathe in a steady rhythm.",
      "Gripping the ropes in a death grip burns out your forearms — hold firm but relaxed."
    ],
    tip: "Short, hard bursts beat one long slow round. Drop into a quarter squat, brace your core, and drive the waves from your whole body — not just your arms — for 15 to 30 seconds, then rest and repeat.",
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
    mistakes: [
      "Picking a box that's too high risks a scary miss — start low and only raise it when you're confident.",
      "Landing with stiff, straight legs sends shock through your knees — land softly in a slight squat.",
      "Jumping back down off the box pounds your joints — always step down instead.",
      "Standing too far from the box makes you jump forward and lose balance — stand a short step away.",
      "Not using your arms wastes free momentum — swing them to help drive the jump."
    ],
    tip: "Start with a low box and always step back down. Stand a short step away, swing your arms to drive the jump, and land softly in a slight squat with your whole foot on the box — control beats height.",
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
    mistakes: [
      "Swinging your legs and kipping uses momentum instead of strength — keep your core tight and body still.",
      "Doing half reps without full extension shortchanges your back and arms — start from straight arms and pull your chin over the bar.",
      "Dropping down fast skips the most valuable part — lower yourself slowly with control.",
      "Shrugging your shoulders to your ears strains your neck — pull your shoulder blades down first.",
      "Straining for full reps before you're ready leads to bad form — use the assisted machine or bands to build up."
    ],
    tip: "Use the assisted machine if a full chin-up is too hard yet — there's no shame in building up to it. Start from a full hang, pull your chin over the bar by driving your elbows down, and lower slowly every rep.",
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
    mistakes: [
      "Rushing your movements makes balancing easier but skips the work — move slowly to challenge your core.",
      "Holding your breath tenses you up — breathe steadily throughout.",
      "Letting your back sag or round loses core engagement — keep a neutral, braced spine.",
      "Choosing the wrong ball size throws off your position — pick one that keeps your hips level with your knees.",
      "Looking down breaks your balance — fix your gaze on a steady point ahead."
    ],
    tip: "Small, slow movements challenge your balance the most. Pick a ball that keeps your hips level with your knees, brace your core, breathe steadily, and keep a neutral spine rather than letting your back sag.",
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
    mistakes: [
      "Bouncing into a stretch can pull the muscle — ease in slowly and hold steady.",
      "Holding your breath tightens the muscles you're trying to loosen — breathe slowly and deeply.",
      "Stretching cold muscles hard risks strains — warm up with a few minutes of light movement first.",
      "Forcing a stretch into pain causes injury — stretch only to a gentle tension, never pain.",
      "Rushing from one stretch to the next skips the benefit — hold each for 20 to 30 seconds."
    ],
    tip: "Ease into each stretch and breathe — never force it. Warm up your muscles with a little light movement first, hold each position for 20 to 30 seconds at a gentle tension, and never bounce or push into pain.",
    favorite: false, hidden: false
  }
];

/* Resolve image paths from id (keeps data clean + assets swappable). */
window.EQUIPMENT.forEach(function (e) {
  e.img = "images/machines/" + e.id + ".png";
  e.imgUse = "images/machines/" + e.id + "-inuse.png";
});
