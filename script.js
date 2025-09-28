// Workout Builder - Research Backed Method JavaScript
let selectedWeek = 1,
  selectedDay = "monday",
  selectedDuration = "standard",
  selectedLocation = "home";
let userEquipment = { home: {}, gym: {} };
let workoutSelections = {},
  completedExercises = {},
  openPhases = new Set();
let customRounds = {}; // Store custom round adjustments
let completedRounds = {}; // Track completed rounds per exercise

const weeklyFrameworks = {
  1: {
    monday: {
      type: "Jump + Resistance",
      duration: { standard: 40, quick: 30, extended: 50 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    tuesday: {
      type: "SIT Session",
      duration: { standard: 20, quick: 15, extended: 25 },
      phases: ["activation", "sit", "cooldown"],
    },
    wednesday: {
      type: "Rest or Mobility",
      duration: { standard: 20, quick: 10, extended: 30 },
      phases: ["mobility", "cooldown"],
    },
    thursday: {
      type: "Jump + Resistance",
      duration: { standard: 40, quick: 30, extended: 50 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    friday: {
      type: "Resistance Training",
      duration: { standard: 35, quick: 25, extended: 45 },
      phases: ["activation", "strength", "cooldown"],
    },
    saturday: {
      type: "SIT Session",
      duration: { standard: 25, quick: 15, extended: 35 },
      phases: ["activation", "sit", "cooldown"],
    },
    sunday: {
      type: "Rest or Mobility",
      duration: { standard: 20, quick: 10, extended: 30 },
      phases: ["mobility", "cooldown"],
    },
  },
  2: {
    monday: {
      type: "Resistance Training",
      duration: { standard: 40, quick: 30, extended: 50 },
      phases: ["activation", "strength", "cooldown"],
    },
    tuesday: {
      type: "SIT Session",
      duration: { standard: 30, quick: 20, extended: 40 },
      phases: ["activation", "sit", "cooldown"],
    },
    wednesday: {
      type: "Rest or Mobility/Core",
      duration: { standard: 25, quick: 15, extended: 35 },
      phases: ["mobility", "cooldown"],
    },
    thursday: {
      type: "Jump + Resistance",
      duration: { standard: 45, quick: 35, extended: 55 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    friday: {
      type: "Resistance Training",
      duration: { standard: 40, quick: 30, extended: 50 },
      phases: ["activation", "strength", "cooldown"],
    },
    saturday: {
      type: "SIT Session",
      duration: { standard: 25, quick: 18, extended: 30 },
      phases: ["activation", "sit", "cooldown"],
    },
    sunday: {
      type: "Rest or Mobility/Core",
      duration: { standard: 25, quick: 15, extended: 35 },
      phases: ["mobility", "cooldown"],
    },
  },
  3: {
    monday: {
      type: "Jump + Heavy Resistance",
      duration: { standard: 50, quick: 40, extended: 60 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    tuesday: {
      type: "SIT Session",
      duration: { standard: 30, quick: 20, extended: 35 },
      phases: ["activation", "sit", "cooldown"],
    },
    wednesday: {
      type: "Rest or Mobility/Core",
      duration: { standard: 30, quick: 20, extended: 40 },
      phases: ["mobility", "cooldown"],
    },
    thursday: {
      type: "Jump + Heavy Resistance",
      duration: { standard: 50, quick: 40, extended: 60 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    friday: {
      type: "Power + Integration",
      duration: { standard: 45, quick: 35, extended: 55 },
      phases: ["activation", "power", "integration", "cooldown"],
    },
    saturday: {
      type: "SIT Session",
      duration: { standard: 30, quick: 20, extended: 35 },
      phases: ["activation", "sit", "cooldown"],
    },
    sunday: {
      type: "Rest or Mobility/Core",
      duration: { standard: 30, quick: 20, extended: 40 },
      phases: ["mobility", "cooldown"],
    },
  },
};

const equipmentDatabase = {
  home: [
    { id: "dumbbells-5", name: "Dumbbells (5 lbs)", essential: true },
    { id: "dumbbells-10", name: "Dumbbells (10 lbs)", essential: true },
    { id: "dumbbells-15", name: "Dumbbells (15 lbs)", essential: true },
    { id: "dumbbells-25", name: "Dumbbells (25+ lbs)", essential: true },
    { id: "chair", name: "Sturdy Chair", essential: true },
    { id: "resistance-bands", name: "Resistance Bands", essential: false },
    { id: "yoga-mat", name: "Yoga Mat", essential: false },
  ],
  gym: [
    { id: "gym-dumbbells", name: "Full Dumbbell Range", essential: true },
    { id: "gym-barbell", name: "Barbell", essential: true },
    { id: "gym-bench", name: "Bench", essential: true },
    { id: "gym-cable", name: "Cable Machine", essential: true },
  ],
};

const phaseExplanations = {
  power:
    "Power training preserves fast-twitch muscle fibers that decline rapidly during menopause. These explosive movements improve your ability to react quickly (fall prevention), maintain bone density, and perform daily activities with confidence and strength.",
  sit: "SIT (Sprint Interval Training) sessions should be SHORT and INTENSE. Mix different exercises to keep it interesting while maintaining maximum effort. The app will calculate rounds to fill your target time - focus on quality over quantity!",
};

const phaseInstructions = {
  activation:
    "Select exercises below to fill your 5-minute activation time. The app will calculate rounds to reach your target duration.",
  jump: "Choose explosive exercises to fill your 10-minute jump training time. Focus on power and soft landings.",
  strength:
    "Pick strength exercises to fill your 25-minute strength training time. Build muscle, bone density, and functional power.",
  power:
    "Select explosive movements to fill your 18-minute power training time. Preserve fast-twitch muscle fibers and build confidence.",
  sit: "Choose high-intensity exercises to fill your 18-minute SIT time. Focus on maximum effort during work intervals.",
  integration:
    "Pick combination movements to fill your 20-minute integration time. Challenge multiple muscle groups and movement patterns.",
  mobility:
    "Select stretches and flows to fill your 15-minute mobility time. Maintain flexibility and promote recovery.",
  cooldown:
    "Choose restorative movements to fill your 8-minute cooldown time. Help your body return to rest and promote recovery.",
};

const exerciseOptions = {
  jump: [
    {
      name: "Squat Jump with Landing",
      reps: "5 reps",
      weight: "bodyweight",
      time: "2 sets",
      rest: "60-90s",
      description:
        "Stand with feet shoulder-width apart. Lower into squat, explode upward jumping as high as possible. Land softly and hold landing position for 2 seconds.",
    },
    {
      name: "Step-Up with Knee Drive",
      reps: "4/leg",
      weight: "bodyweight",
      time: "2 sets",
      rest: "45-60s",
      description:
        "Step up onto chair with right foot, drive left knee up toward chest while balancing. Step down with control.",
    },
    {
      name: "Box Step Downs",
      reps: "6/leg",
      weight: "bodyweight",
      time: "2 sets",
      rest: "45-60s",
      description:
        "Stand on chair, slowly lower one foot toward ground controlling descent with standing leg. Tap toe lightly and return.",
    },
    {
      name: "Broad Jump",
      reps: "3 reps",
      weight: "bodyweight",
      time: "2 sets",
      rest: "90s",
      description:
        "Jump forward as far as possible, swing arms for momentum. Land on both feet simultaneously, bend knees to absorb impact.",
    },
    {
      name: "Lateral Bounds",
      reps: "4/side",
      weight: "bodyweight",
      time: "3 sets",
      rest: "60s",
      description:
        "Jump sideways from left leg to right foot only. Stick landing for 2 seconds maintaining balance.",
    },
    {
      name: "Tuck Jumps",
      reps: "4 reps",
      weight: "bodyweight",
      time: "3 sets",
      rest: "90s",
      description:
        "Jump straight up bringing knees toward chest as high as possible. Land softly and prepare for next jump.",
    },
    {
      name: "Depth Jumps",
      reps: "4 reps",
      weight: "bodyweight",
      time: "3 sets",
      rest: "90s",
      description:
        "Step off chair and land on both feet. Immediately jump vertically as high as possible upon landing.",
    },
    {
      name: "Single Leg Hops",
      reps: "6/leg",
      weight: "bodyweight",
      time: "3 sets",
      rest: "60s",
      description:
        "Balance on one leg, hop forward landing and immediately hopping again. Focus on soft landings and balance.",
    },
    {
      name: "Split Jump Lunges",
      reps: "6/leg",
      weight: "bodyweight",
      time: "3 sets",
      rest: "60s",
      description:
        "Start in lunge, jump up switching leg positions mid-air. Land with opposite foot forward and immediately jump again.",
    },
  ],
  strength: [
    {
      name: "Bodyweight Squat",
      reps: "8-10",
      weight: "bodyweight",
      time: "3 sets",
      rest: "60-90s",
      description:
        "Stand with feet shoulder-width apart. Lower by pushing hips back and bending knees, keeping chest up.",
    },
    {
      name: "Wall Push-Ups",
      reps: "8-12",
      weight: "bodyweight",
      time: "3 sets",
      rest: "45-60s",
      description:
        "Stand arms length from wall. Push away from wall by extending arms, maintain straight body position.",
    },
    {
      name: "Goblet Squat",
      reps: "6-8",
      weight: "15-25 lbs",
      time: "4 sets",
      rest: "90-120s",
      description:
        "Hold dumbbell vertically at chest. Squat down keeping chest up and elbows inside knees.",
    },
    {
      name: "Single-Leg RDL",
      reps: "6/leg",
      weight: "10-15 lbs",
      time: "4 sets",
      rest: "60-90s",
      description:
        "Balance on left leg, hinge at hip lowering dumbbell while extending right leg behind. Keep back straight.",
    },
    {
      name: "Bulgarian Split Squats",
      reps: "8/leg",
      weight: "10-15 lbs",
      time: "3 sets",
      rest: "90s",
      description:
        "Rear foot elevated on chair, lower front knee until thigh parallel to floor. Most weight on front leg.",
    },
    {
      name: "Dumbbell Row",
      reps: "8/arm",
      weight: "15-20 lbs",
      time: "4 sets",
      rest: "60-90s",
      description:
        "Support with left hand on chair, pull dumbbell to ribcage squeezing shoulder blade toward spine.",
    },
    {
      name: "Heavy Goblet Squats",
      reps: "6 reps",
      weight: "25-35 lbs",
      time: "4 sets",
      rest: "2-3min",
      description:
        "Heavier goblet squat focusing on perfect form. Move with control and drive explosively upward.",
    },
    {
      name: "Turkish Get-Up",
      reps: "3/side",
      weight: "10-15 lbs",
      time: "3 sets",
      rest: "90-120s",
      description:
        "Complex movement from lying to standing while keeping dumbbell overhead. Builds total-body stability.",
    },
    {
      name: "Overhead Press",
      reps: "6-8",
      weight: "8-15 lbs",
      time: "4 sets",
      rest: "90s",
      description:
        "Press dumbbells straight overhead until arms fully extended. Keep core tight, avoid arching back.",
    },
  ],
  power: [
    {
      name: "Light DB Swings",
      reps: "15 reps",
      weight: "10-15 lbs",
      time: "3 rounds",
      rest: "60-90s",
      description:
        "Hold dumbbell with both hands. Stand with feet wider than shoulders. Push hips back and swing weight between legs, then explosively drive hips forward to swing weight to chest height. Like a pendulum powered by your hips.",
    },
    {
      name: "Modified Thrusters",
      reps: "6 reps",
      weight: "5-10 lbs",
      time: "3 rounds",
      rest: "60s",
      description:
        "Hold light dumbbells at shoulder level. Perform a squat, then as you stand up, press the weights overhead in one fluid motion. Lower weights back to shoulders and repeat.",
    },
    {
      name: "DB Snatch",
      reps: "5/arm",
      weight: "10-15 lbs",
      time: "3 rounds",
      rest: "90s",
      description:
        "Start in squat holding dumbbell between legs with one hand. Explosively stand while pulling weight from floor to overhead in one powerful motion. Like starting a lawnmower but finishing with weight overhead.",
    },
    {
      name: "DB Thruster",
      reps: "8 reps",
      weight: "10-15 lbs",
      time: "3 rounds",
      rest: "90s",
      description:
        "Hold dumbbells at shoulders. Squat down, then explosively drive up while pressing both weights overhead simultaneously. This combines a squat with an overhead press in one explosive movement.",
    },
    {
      name: "Heavy DB Swings",
      reps: "20 reps",
      weight: "20-25 lbs",
      time: "3 rounds",
      rest: "2min",
      description:
        "Same technique as light swings but with heavier weight. Focus on explosive hip snap to drive weight to chest height. Keep core tight and drive power from hips, not arms.",
    },
    {
      name: "Medicine Ball Slams",
      reps: "10 reps",
      weight: "10-15 lbs",
      time: "3 rounds",
      rest: "60-90s",
      description:
        "Hold medicine ball (or heavy dumbbell) overhead. Explosively slam it down toward the ground while engaging your core. Pick it up and repeat. Imagine throwing it through the floor.",
    },
    {
      name: "Power Cleans",
      reps: "6 reps",
      weight: "15-25 lbs",
      time: "4 rounds",
      rest: "2min",
      description:
        "Start with dumbbells at mid-shin. Explosively extend hips and knees while pulling weights up. Catch weights at shoulder level with elbows pointing forward. Lower and repeat.",
    },
    {
      name: "Heavy Snatches",
      reps: "6/arm",
      weight: "15-25 lbs",
      time: "4 rounds",
      rest: "2min",
      description:
        "Single-arm version of snatch with heavier weight. Explosively pull dumbbell from squat position to overhead in one motion. Requires maximum power and coordination.",
    },
    {
      name: "Explosive Push-Ups",
      reps: "5 reps",
      weight: "bodyweight",
      time: "3 rounds",
      rest: "90s",
      description:
        "Start in push-up position. Push up so explosively that your hands leave the ground. Land softly with control and immediately lower for next rep. Modify on knees if needed.",
    },
  ],
  sit: [
    {
      name: "Modified Jump Squats",
      reps: "20s work",
      weight: "bodyweight",
      time: "3 rounds",
      rest: "100s (HR<120)",
      description:
        "Stand with feet shoulder-width apart. Squat down then jump up 6-12 inches (lower than max jump). Land softly and immediately squat again. Continuous jumping for 20 seconds at moderate intensity.",
    },
    {
      name: "Light Thrusters",
      reps: "20s work",
      weight: "5-8 lbs",
      time: "3 rounds",
      rest: "100s (HR<120)",
      description:
        "Hold light dumbbells at shoulders. Squat down, then explosively stand while pressing weights overhead. Lower weights back to shoulders and immediately squat again. Continuous for 20 seconds.",
    },
    {
      name: "Fast Squats",
      reps: "30s work",
      weight: "bodyweight",
      time: "4 rounds",
      rest: "90s (HR<125)",
      description:
        "Bodyweight squats performed as fast as possible while maintaining proper form. Count how many you can do in 30 seconds - aim for maximum reps.",
    },
    {
      name: "Burpee Intervals",
      reps: "20s work",
      weight: "bodyweight",
      time: "4 rounds",
      rest: "70s (HR<120)",
      description:
        "Squat down, place hands on floor, jump feet back to plank, do a push-up, jump feet back to squat, then jump up with arms overhead. Repeat as fast as possible for 20 seconds.",
    },
    {
      name: "Mountain Climbers",
      reps: "30s work",
      weight: "bodyweight",
      time: "4 rounds",
      rest: "90s (HR<125)",
      description:
        "Start in plank position. Rapidly alternate bringing knees toward chest as if running in place horizontally. Keep hands planted, core tight. Move as fast as possible for 30 seconds.",
    },
    {
      name: "High Knees",
      reps: "20s work",
      weight: "bodyweight",
      time: "5 rounds",
      rest: "70s (HR<120)",
      description:
        "Run in place bringing knees up to waist height or higher. Pump arms rapidly. This should feel like sprinting in place - maximum effort for 20 seconds.",
    },
    {
      name: "Sprint Intervals",
      reps: "30s work",
      weight: "bodyweight",
      time: "6 rounds",
      rest: "2min (HR<110)",
      description:
        "If outdoors: sprint at maximum speed. If indoors: high knees, butt kicks, or fast feet in place. Give 100% effort as if running from danger. 30 seconds all-out effort.",
    },
    {
      name: "Complex Circuit",
      reps: "45s work",
      weight: "various",
      time: "4 rounds",
      rest: "2min (HR<115)",
      description:
        "Perform continuously without rest: 5 burpees, immediately into 10 jump squats, immediately into 15 light thrusters (5-8 lbs). Complete entire sequence as many times as possible in 45 seconds.",
    },
    {
      name: "Tabata Squats",
      reps: "20s work",
      weight: "bodyweight",
      time: "8 rounds",
      rest: "10s only",
      description:
        "Classic Tabata protocol: 20 seconds maximum effort squats, 10 seconds complete rest. Repeat 8 times (4 minutes total). Count reps - try to maintain pace across all 8 rounds.",
    },
  ],
  activation: [
    {
      name: "Arm Swings",
      reps: "8/dir",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Large arm circles forward then backward. Gradually increase circle size to warm shoulders.",
    },
    {
      name: "Light Squat Jumps",
      reps: "4 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Small squat jumps focusing on soft landings. Jump only 6-12 inches high for activation.",
    },
    {
      name: "Shoulder Squeezes",
      reps: "8 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Squeeze shoulder blades together, hold 2 seconds. Activates postural muscles.",
    },
    {
      name: "Leg Swings",
      reps: "8/leg",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Hold wall for balance, swing leg forward/back then side to side. Mobilizes hip joints.",
    },
    {
      name: "Torso Twists",
      reps: "8 each",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Rotate torso left and right keeping hips forward. Warms spine and core.",
    },
    {
      name: "Marching",
      reps: "20 steps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "March bringing knees to waist height. Gradually increase pace, activates core.",
    },
    {
      name: "Sun Salutation Flow",
      reps: "3 flows",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Mountain pose → forward fold → half lift → low lunge → downward dog → cobra → back to mountain. Warms entire body with flowing movement.",
    },
    {
      name: "Cat-Cow Warm-Up",
      reps: "8 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "On hands and knees, arch back (cow) then round spine (cat). Mobilizes spine and activates core for movement.",
    },
    {
      name: "Hip Circles",
      reps: "8/dir",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Hands on hips, make large circles. Keep feet planted, mobilizes hip joints.",
    },
    {
      name: "Dynamic Warrior Flow",
      reps: "5/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Step back to warrior I, flow to warrior III (standing balance), return to warrior I. Activates legs, core, and balance systems.",
    },
    {
      name: "Ankle Pumps",
      reps: "15/foot",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Point toes down then flex up. Activates calves and improves circulation.",
    },
  ],
  mobility: [
    {
      name: "Cat-Cow Stretches",
      reps: "8 reps",
      weight: "bodyweight",
      time: "3 rounds",
      rest: "20s",
      description:
        "Arch back (cow) then round spine (cat). Mobilizes entire spine and relieves tension.",
    },
    {
      name: "Hip Flexor Stretch",
      reps: "30s/leg",
      weight: "bodyweight",
      time: "3 rounds",
      rest: "20s",
      description:
        "Lunge position, sink hips forward. Stretches front of rear hip and thigh.",
    },
    {
      name: "Glute Bridge Hold",
      reps: "30s",
      weight: "bodyweight",
      time: "3 rounds",
      rest: "30s",
      description:
        "Lift hips squeezing glutes. Creates straight line from knees to shoulders.",
    },
    {
      name: "Thoracic Rotation",
      reps: "6/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "On hands and knees, rotate elbow down then up toward ceiling. Improves mid-back mobility.",
    },
    {
      name: "Hamstring Stretch",
      reps: "30s/leg",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Sit with one leg extended, lean forward from hips. Keep back straight, hinge from hips.",
    },
    {
      name: "Chest Stretch",
      reps: "30s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Forearms against doorframe at shoulder height. Step forward to stretch chest and shoulders.",
    },
    {
      name: "Spinal Waves",
      reps: "6 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Wave motion through spine from head to tailbone. Move slowly focusing on each vertebra.",
    },
    {
      name: "Child Pose",
      reps: "45s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Kneel and fold forward extending arms. Decompresses spine and promotes relaxation.",
    },
    {
      name: "Seated Spinal Twist",
      reps: "30s/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Sit tall, rotate torso looking over shoulder. Improves spinal rotation.",
    },
  ],
  integration: [
    {
      name: "Squat to Calf Raise",
      reps: "6+6",
      weight: "10-15 lbs",
      time: "3 sets",
      rest: "90s",
      description:
        "Hold dumbbells at sides. Do 6 goblet squats (holding weight at chest), then immediately do 6 calf raises (rise up on toes) with same weight. No rest between exercises.",
    },
    {
      name: "Row to Overhead",
      reps: "8+8",
      weight: "8-12 lbs",
      time: "3 sets",
      rest: "90s",
      description:
        "Support one hand on chair, row dumbbell to ribcage 8 times. Immediately stand and press same weight overhead 8 times. Combines pulling and pushing movements.",
    },
    {
      name: "Squat to Jump Complex",
      reps: "6+3",
      weight: "20-25 lbs",
      time: "4 sets",
      rest: "2min",
      description:
        'Do 6 heavy goblet squats with control, then immediately drop weight and do 3 explosive jump squats. This "contrast training" primes muscles for power.',
    },
    {
      name: "Row to Thrusters",
      reps: "8+8",
      weight: "12-15 lbs",
      time: "3 sets",
      rest: "2min",
      description:
        "Bent-over row for 8 reps, then immediately perform 8 thrusters (squat to overhead press). Integrates pulling, squatting, and pressing in sequence.",
    },
    {
      name: "Lunge to Curl",
      reps: "6+6/leg",
      weight: "8-12 lbs",
      time: "3 sets",
      rest: "60s",
      description:
        "Step back into reverse lunge while simultaneously curling dumbbells to shoulders. Step together and repeat. Challenges balance while building strength.",
    },
    {
      name: "Deadlift to Upright Row",
      reps: "8+8",
      weight: "10-15 lbs",
      time: "3 sets",
      rest: "90s",
      description:
        "Romanian deadlift for 8 reps (hinge at hips, lower weights toward floor), then immediately do 8 upright rows (pull weights up to chest level).",
    },
    {
      name: "Step-Up to Press",
      reps: "6/leg",
      weight: "8-12 lbs",
      time: "3 sets",
      rest: "90s",
      description:
        "Step up onto chair while simultaneously pressing dumbbells overhead. Step down with control. Combines lower body and upper body in multiple planes of movement.",
    },
    {
      name: "Squat to Rotation",
      reps: "8/side",
      weight: "8-15 lbs",
      time: "3 sets",
      rest: "60s",
      description:
        "Hold weight at chest, squat down, then as you stand rotate torso fully to the right, then left. Adds rotational movement to traditional squat pattern.",
    },
    {
      name: "Plank to T-Rotation",
      reps: "6/side",
      weight: "5-10 lbs",
      time: "3 sets",
      rest: "90s",
      description:
        'Start in plank holding light weight in one hand. Rotate to side plank while lifting weight toward ceiling, forming a "T" shape. Return to plank and repeat.',
    },
  ],
  cooldown: [
    {
      name: "Walking in Place",
      reps: "2min",
      weight: "bodyweight",
      time: "1 set",
      rest: "flow",
      description:
        "Gradually decrease pace over 2 minutes. Brings heart rate down gently.",
    },
    {
      name: "Deep Breathing",
      reps: "5 breaths",
      weight: "bodyweight",
      time: "2 sets",
      rest: "flow",
      description:
        "Inhale 4 counts, hold 2, exhale 6. Activates parasympathetic nervous system.",
    },
    {
      name: "Seated Forward Fold",
      reps: "45s",
      weight: "bodyweight",
      time: "2 sets",
      rest: "flow",
      description:
        "Fold forward from hips letting arms hang. Decompresses spine after exercise.",
    },
    {
      name: "Neck Rolls",
      reps: "5/dir",
      weight: "bodyweight",
      time: "1 set",
      rest: "flow",
      description:
        "Slowly roll head in complete circles. Releases neck and shoulder tension.",
    },
    {
      name: "Gentle Spinal Twist",
      reps: "30s/side",
      weight: "bodyweight",
      time: "2 sets",
      rest: "flow",
      description:
        "Gentle rotation looking over shoulder. Helps decompress spine.",
    },
    {
      name: "Ankle Circles",
      reps: "8/dir",
      weight: "bodyweight",
      time: "1 set",
      rest: "flow",
      description:
        "Slow circles with ankles. Promotes circulation and prevents stiffness.",
    },
    {
      name: "Child Pose to Cobra Flow",
      reps: "5 flows",
      weight: "bodyweight",
      time: "2 sets",
      rest: "flow",
      description:
        "Start in child pose, flow forward to cobra pose, return to child pose. Gentle spinal movement and deep relaxation.",
    },
    {
      name: "Legs Up the Wall",
      reps: "2min",
      weight: "bodyweight",
      time: "1 set",
      rest: "flow",
      description:
        "Lie on back with legs up against wall or chair. Promotes circulation and activates rest response.",
    },
    {
      name: "Restorative Twist",
      reps: "1min/side",
      weight: "bodyweight",
      time: "1 set",
      rest: "flow",
      description:
        "Lie on back, drop both knees to one side, arms in T-shape. Hold and breathe deeply. Releases tension and promotes relaxation.",
    },
    {
      name: "Progressive Relaxation",
      reps: "3min",
      weight: "bodyweight",
      time: "1 set",
      rest: "flow",
      description:
        "Tense then relax each muscle group from toes up. Promotes deep relaxation.",
    },
    {
      name: "Gentle Side Bend",
      reps: "30s/side",
      weight: "bodyweight",
      time: "2 sets",
      rest: "flow",
      description:
        "Reach one arm overhead, lean to opposite side. Stretches lateral muscles.",
    },
    {
      name: "Shoulder Blade Squeezes",
      reps: "10 slow",
      weight: "bodyweight",
      time: "2 sets",
      rest: "flow",
      description:
        "Squeeze shoulder blades together, hold 3 seconds. Resets posture after exercise.",
    },
    {
      name: "Savasana (Final Relaxation)",
      reps: "3-5min",
      weight: "bodyweight",
      time: "1 set",
      rest: "flow",
      description:
        "Lie flat on back, arms at sides, palms up. Close eyes and focus on breath. Complete mental and physical relaxation.",
    },
  ],
};

function getCurrentWorkout() {
  return (
    weeklyFrameworks[selectedWeek]?.[selectedDay] || {
      type: "",
      duration: { standard: 0 },
      phases: [],
    }
  );
}

function getPhaseTitle(phase) {
  const titles = {
    jump: "Jump (10min)",
    strength: "Strength (25-30min)",
    sit: "SIT (15-20min)",
    activation: "Activation (5min)",
    power: "Power (15-20min)",
    mobility: "Mobility (15-20min)",
    integration: "Integration (20min)",
    cooldown: "Cool Down (5-10min)",
  };
  return titles[phase] || phase;
}

const exerciseBaseTimes = {
  jump: {
    "Squat Jump with Landing": 3, // per round
    "Step-Up with Knee Drive": 2.5,
    "Box Step Downs": 2.5,
    "Broad Jump": 3.5,
    "Lateral Bounds": 3,
    "Tuck Jumps": 3.5,
    "Depth Jumps": 3.5,
    "Single Leg Hops": 3,
    "Split Jump Lunges": 3,
  },
  strength: {
    "Bodyweight Squat": 2,
    "Wall Push-Ups": 1.5,
    "Goblet Squat": 2.5,
    "Single-Leg RDL": 2.5,
    "Bulgarian Split Squats": 3,
    "Dumbbell Row": 2.5,
    "Heavy Goblet Squats": 3.5,
    "Turkish Get-Up": 4,
    "Overhead Press": 2.5,
  },
  power: {
    "Light DB Swings": 2,
    "Modified Thrusters": 1.5,
    "DB Snatch": 2.5,
    "DB Thruster": 2.5,
    "Heavy DB Swings": 3,
    "Medicine Ball Slams": 2,
    "Power Cleans": 3,
    "Heavy Snatches": 3,
    "Explosive Push-Ups": 2.5,
  },
  sit: {
    "Modified Jump Squats": 2.5, // per round
    "Light Thrusters": 2.5,
    "Fast Squats": 2,
    "Burpee Intervals": 1.5,
    "Mountain Climbers": 2,
    "High Knees": 1.5,
    "Sprint Intervals": 3,
    "Complex Circuit": 3.5,
    "Tabata Squats": 0.5, // special case - 8 rounds = 4 min
  },
  activation: {
    "Arm Swings": 0.5,
    "Light Squat Jumps": 0.5,
    "Shoulder Squeezes": 0.5,
    "Leg Swings": 0.5,
    "Torso Twists": 0.5,
    Marching: 0.5,
    "Sun Salutation Flow": 1.5,
    "Cat-Cow Warm-Up": 1,
    "Hip Circles": 0.5,
    "Dynamic Warrior Flow": 1.5,
    "Ankle Pumps": 0.5,
  },
  mobility: {
    "Cat-Cow Stretches": 1.5,
    "Hip Flexor Stretch": 2,
    "Glute Bridge Hold": 1.5,
    "Thoracic Rotation": 1.5,
    "Hamstring Stretch": 1.5,
    "Chest Stretch": 1.5,
    "Spinal Waves": 1.5,
    "Child Pose": 2,
    "Seated Spinal Twist": 1.5,
  },
  integration: {
    "Squat to Calf Raise": 2,
    "Row to Overhead": 2,
    "Squat to Jump Complex": 3,
    "Row to Thrusters": 3,
    "Lunge to Curl": 1.5,
    "Deadlift to Upright Row": 2,
    "Step-Up to Press": 2,
    "Squat to Rotation": 1.5,
    "Plank to T-Rotation": 2,
  },
  cooldown: {
    "Walking in Place": 2,
    "Deep Breathing": 0.5,
    "Seated Forward Fold": 1,
    "Neck Rolls": 0.25,
    "Gentle Spinal Twist": 1,
    "Ankle Circles": 0.25,
    "Child Pose to Cobra Flow": 1.5,
    "Legs Up the Wall": 2,
    "Restorative Twist": 2,
    "Progressive Relaxation": 3,
    "Gentle Side Bend": 1,
    "Shoulder Blade Squeezes": 0.5,
    "Savasana (Final Relaxation)": 4,
  },
};

// Safety limits for maximum rounds per exercise
const exerciseMaxRounds = {
  jump: {
    "Squat Jump with Landing": 4,
    "Step-Up with Knee Drive": 4,
    "Box Step Downs": 4,
    "Broad Jump": 3, // High impact, limit rounds
    "Lateral Bounds": 4,
    "Tuck Jumps": 3, // High impact, limit rounds
    "Depth Jumps": 3, // High impact, limit rounds
    "Single Leg Hops": 4,
    "Split Jump Lunges": 4,
  },
  strength: {
    "Bodyweight Squat": 6,
    "Wall Push-Ups": 5,
    "Goblet Squat": 5,
    "Single-Leg RDL": 4,
    "Bulgarian Split Squats": 4, // Unilateral, more fatiguing
    "Dumbbell Row": 5,
    "Heavy Goblet Squats": 4, // Heavy weight, limit volume
    "Turkish Get-Up": 3, // Complex movement, limit rounds
    "Overhead Press": 5,
  },
  power: {
    "Light DB Swings": 5,
    "Modified Thrusters": 6,
    "DB Snatch": 4, // Complex movement
    "DB Thruster": 5,
    "Heavy DB Swings": 4, // Heavy weight
    "Medicine Ball Slams": 5,
    "Power Cleans": 4, // Complex movement
    "Heavy Snatches": 3, // Heavy, complex movement
    "Explosive Push-Ups": 4,
  },
  sit: {
    "Modified Jump Squats": 5,
    "Light Thrusters": 5,
    "Fast Squats": 6,
    "Burpee Intervals": 4, // High intensity, limit rounds
    "Mountain Climbers": 5,
    "High Knees": 5,
    "Sprint Intervals": 4, // Maximum intensity, limit rounds
    "Complex Circuit": 3, // Very high intensity
    "Tabata Squats": 8, // Fixed protocol
  },
  activation: {
    "Arm Swings": 8,
    "Light Squat Jumps": 8,
    "Shoulder Squeezes": 8,
    "Leg Swings": 8,
    "Torso Twists": 8,
    Marching: 6,
    "Sun Salutation Flow": 4,
    "Cat-Cow Warm-Up": 6,
    "Hip Circles": 8,
    "Dynamic Warrior Flow": 4,
    "Ankle Pumps": 8,
  },
  mobility: {
    "Cat-Cow Stretches": 6,
    "Hip Flexor Stretch": 4,
    "Glute Bridge Hold": 5,
    "Thoracic Rotation": 6,
    "Hamstring Stretch": 5,
    "Chest Stretch": 5,
    "Spinal Waves": 6,
    "Child Pose": 4,
    "Seated Spinal Twist": 5,
  },
  integration: {
    "Squat to Calf Raise": 5,
    "Row to Overhead": 5,
    "Squat to Jump Complex": 3, // High intensity contrast
    "Row to Thrusters": 4,
    "Lunge to Curl": 6,
    "Deadlift to Upright Row": 5,
    "Step-Up to Press": 5,
    "Squat to Rotation": 6,
    "Plank to T-Rotation": 4,
  },
  cooldown: {
    "Walking in Place": 3,
    "Deep Breathing": 8,
    "Seated Forward Fold": 4,
    "Neck Rolls": 10,
    "Gentle Spinal Twist": 4,
    "Ankle Circles": 10,
    "Child Pose to Cobra Flow": 4,
    "Legs Up the Wall": 2,
    "Restorative Twist": 2,
    "Progressive Relaxation": 2,
    "Gentle Side Bend": 5,
    "Shoulder Blade Squeezes": 6,
    "Savasana (Final Relaxation)": 1,
  },
};

function calculateRounds(phase, selectedExercises) {
  const targetTime = getPhaseTargetTime(phase);
  const exerciseCount = selectedExercises.length;

  if (exerciseCount === 0) return {};

  // Special case for Tabata Squats - always 8 rounds unless custom override
  if (exerciseCount === 1 && selectedExercises[0] === "Tabata Squats") {
    const customKey = `${selectedWeek}-${selectedDay}-${phase}-Tabata Squats`;
    return { "Tabata Squats": customRounds[customKey] || 8 };
  }

  const timePerExercise = targetTime / exerciseCount;
  const rounds = {};

  selectedExercises.forEach((exerciseName) => {
    const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;

    if (customRounds[customKey] !== undefined) {
      // Use custom rounds if set, but still respect safety limits
      const maxRounds = exerciseMaxRounds[phase]?.[exerciseName] || 6;
      rounds[exerciseName] = Math.min(customRounds[customKey], maxRounds);
    } else {
      // Calculate default rounds with safety limits
      const baseTime = exerciseBaseTimes[phase]?.[exerciseName] || 2;
      const calculatedRounds = Math.max(
        1,
        Math.round(timePerExercise / baseTime)
      );
      const maxRounds = exerciseMaxRounds[phase]?.[exerciseName] || 6;
      rounds[exerciseName] = Math.min(calculatedRounds, maxRounds);
    }
  });

  return rounds;
}

function adjustRounds(phase, exerciseName, action) {
  const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
  const selectedExercises = getSelectedExercises(phase);
  const currentRounds = calculateRounds(phase, selectedExercises);
  const current = currentRounds[exerciseName] || 1;

  if (action === "increase") {
    const newRounds = current + 1;
    customRounds[customKey] = newRounds;

    // Auto-balance other exercises to stay within target time
    balanceRounds(phase, exerciseName);
  } else if (action === "decrease" && current > 1) {
    customRounds[customKey] = current - 1;

    // Auto-balance other exercises to utilize available time
    balanceRounds(phase, exerciseName);
  }

  updateApp();
}

function balanceRounds(phase, changedExercise) {
  const targetTime = getPhaseTargetTime(phase);
  const selectedExercises = getSelectedExercises(phase);

  if (selectedExercises.length <= 1) return; // Nothing to balance

  // Calculate current time with all custom rounds
  let totalTime = 0;
  const rounds = {};

  selectedExercises.forEach((exerciseName) => {
    const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
    const baseTime = exerciseBaseTimes[phase]?.[exerciseName] || 2;

    if (customRounds[customKey] !== undefined) {
      rounds[exerciseName] = customRounds[customKey];
    } else {
      // Calculate default rounds
      const timePerExercise = targetTime / selectedExercises.length;
      rounds[exerciseName] = Math.max(
        1,
        Math.round(timePerExercise / baseTime)
      );
    }

    totalTime += baseTime * rounds[exerciseName];
  });

  // If we're significantly over target time, try to reduce other exercises
  if (totalTime > targetTime + 2) {
    const otherExercises = selectedExercises.filter(
      (ex) => ex !== changedExercise
    );
    const excessTime = totalTime - targetTime;

    // Try to reduce rounds from other exercises
    let timeReduced = 0;
    let exercisesToRemove = [];

    for (const exerciseName of otherExercises) {
      const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
      const baseTime = exerciseBaseTimes[phase]?.[exerciseName] || 2;
      const currentRounds = rounds[exerciseName];

      if (currentRounds > 1) {
        // Reduce by 1 round
        customRounds[customKey] = currentRounds - 1;
        timeReduced += baseTime;
        totalTime -= baseTime;

        if (timeReduced >= excessTime) break;
      } else {
        // Mark for potential removal
        exercisesToRemove.push(exerciseName);
      }
    }

    // If still over time and we have exercises to potentially remove
    if (totalTime > targetTime + 2 && exercisesToRemove.length > 0) {
      showRemovalPrompt(phase, changedExercise, exercisesToRemove);
    }
  }

  // If we're under target time, try to add rounds to other exercises
  else if (totalTime < targetTime - 2) {
    const otherExercises = selectedExercises.filter(
      (ex) => ex !== changedExercise
    );
    const availableTime = targetTime - totalTime;

    for (const exerciseName of otherExercises) {
      const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
      const baseTime = exerciseBaseTimes[phase]?.[exerciseName] || 2;

      if (availableTime >= baseTime) {
        const currentRounds = rounds[exerciseName];
        customRounds[customKey] = currentRounds + 1;
        totalTime += baseTime;

        if (totalTime >= targetTime - 2) break;
      }
    }
  }
}

function showRemovalPrompt(phase, increasedExercise, exercisesToRemove) {
  const modal = document.createElement("div");
  modal.className = "celebration-modal";
  modal.innerHTML = `
        <div class="celebration-content" style="background: #f59e0b; max-width: 500px;">
            <h2 style="font-size: 24px; margin-bottom: 16px; color: white;">⚠️ Time Limit Reached</h2>
            <p style="font-size: 16px; margin-bottom: 20px; color: white;">
                Adding more rounds to <strong>${increasedExercise}</strong> puts you over your target time.
                <br><br>
                Would you like to remove an exercise to make room?
            </p>
            <div style="margin-bottom: 20px;">
                ${exercisesToRemove
                  .map(
                    (ex) => `
                    <button onclick="removeExerciseAndContinue('${phase}', '${ex}')" 
                            style="background: white; color: #f59e0b; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; margin: 4px; cursor: pointer;">
                        Remove "${ex}"
                    </button>
                `
                  )
                  .join("")}
            </div>
            <button onclick="cancelRoundIncrease('${phase}', '${increasedExercise}')" 
                    style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 10px 20px; border-radius: 6px; font-size: 14px; cursor: pointer;">
                Cancel (Keep Current Rounds)
            </button>
        </div>
    `;
  document.body.appendChild(modal);
}

function removeExerciseAndContinue(phase, exerciseToRemove) {
  const key = `${selectedWeek}-${selectedDay}-${phase}-${exerciseToRemove}`;
  delete workoutSelections[key];

  // Clear any custom rounds for the removed exercise
  const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseToRemove}`;
  delete customRounds[customKey];

  closeRemovalPrompt();
  updateApp();
}

function cancelRoundIncrease(phase, exerciseName) {
  // Revert the round increase
  const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
  if (customRounds[customKey] > 1) {
    customRounds[customKey] = customRounds[customKey] - 1;
  } else {
    delete customRounds[customKey];
  }

  closeRemovalPrompt();
  updateApp();
}

function closeRemovalPrompt() {
  const modal = document.querySelector(".celebration-modal");
  if (modal) {
    modal.parentNode.removeChild(modal);
  }
}

// Make functions available globally
window.removeExerciseAndContinue = removeExerciseAndContinue;
window.cancelRoundIncrease = cancelRoundIncrease;

function getSelectedExercises(phase) {
  const exercises = [];
  Object.keys(workoutSelections).forEach((key) => {
    if (
      key.startsWith(`${selectedWeek}-${selectedDay}-${phase}`) &&
      workoutSelections[key]
    ) {
      const exerciseName = key.split("-").slice(3).join("-");
      exercises.push(exerciseName);
    }
  });
  return exercises;
}

function toggleRoundCompletion(phase, exerciseName, roundIndex) {
  const key = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}-${roundIndex}`;
  completedRounds[key] = !completedRounds[key];
  updateApp();

  // Check if this phase is now complete and show motivational moment
  setTimeout(() => {
    checkForPhaseCompletion(phase);
    checkWorkoutCompletion();
  }, 100); // Small delay to ensure UI updates first
}

function getRoundCompletionKey(phase, exerciseName, roundIndex) {
  return `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}-${roundIndex}`;
}

function isRoundCompleted(phase, exerciseName, roundIndex) {
  const key = getRoundCompletionKey(phase, exerciseName, roundIndex);
  return completedRounds[key] || false;
}

function checkForPhaseCompletion(phase) {
  // Skip cooldown phase for motivational moments
  if (phase === "cooldown") {
    console.log(`Skipping motivational moment for cooldown phase`);
    return;
  }

  const selectedExercises = getSelectedExercises(phase);
  const rounds = calculateRounds(phase, selectedExercises);

  if (selectedExercises.length === 0) {
    return;
  }

  let phaseRounds = 0;
  let phaseCompleted = 0;

  selectedExercises.forEach((exerciseName) => {
    const exerciseRounds = rounds[exerciseName] || 1;
    phaseRounds += exerciseRounds;

    for (let i = 1; i <= exerciseRounds; i++) {
      if (isRoundCompleted(phase, exerciseName, i)) {
        phaseCompleted++;
      }
    }
  });

  const isPhaseComplete = phaseRounds > 0 && phaseCompleted === phaseRounds;

  if (isPhaseComplete) {
    const celebrationKey = `${selectedWeek}-${selectedDay}-${phase}-celebrated`;
    const alreadyCelebrated = sessionStorage.getItem(celebrationKey);

    if (!alreadyCelebrated) {
      console.log(`Showing motivational moment for ${phase}`);
      showMotivationalMoment(phase);
      sessionStorage.setItem(celebrationKey, "true");
    } else {
      console.log(`Already showed motivational moment for ${phase}`);
    }
  }
}

function checkWorkoutCompletion() {
  const w = getCurrentWorkout();

  // Only check workout completion if we're not currently showing a motivational moment
  if (window.showingMotivationalMoment) {
    console.log(
      "Skipping workout completion check - motivational moment in progress"
    );
    return;
  }

  // Check if entire workout is complete (including cooldown)
  let totalRounds = 0;
  let completedCount = 0;
  let workoutComplete = true;

  console.log("Checking workout completion for phases:", w.phases);

  w.phases.forEach((phase) => {
    const selectedExercises = getSelectedExercises(phase);
    const rounds = calculateRounds(phase, selectedExercises);

    selectedExercises.forEach((exerciseName) => {
      const exerciseRounds = rounds[exerciseName] || 1;
      totalRounds += exerciseRounds;

      for (let i = 1; i <= exerciseRounds; i++) {
        if (isRoundCompleted(phase, exerciseName, i)) {
          completedCount++;
        } else {
          workoutComplete = false;
        }
      }
    });
  });

  console.log(
    `Workout progress: ${completedCount}/${totalRounds} rounds completed`
  );
  console.log(`Workout complete: ${workoutComplete}`);

  // Only show confetti celebration if entire workout including cooldown is complete
  if (totalRounds > 0 && workoutComplete && w.phases.includes("cooldown")) {
    const cooldownComplete = checkPhaseComplete("cooldown");
    console.log(`Cooldown complete: ${cooldownComplete}`);
    if (cooldownComplete) {
      // Check if we've already shown the final celebration
      const finalCelebrationKey = `${selectedWeek}-${selectedDay}-final-celebration`;
      const alreadyShowedFinal = sessionStorage.getItem(finalCelebrationKey);
      console.log(`Final celebration already shown: ${alreadyShowedFinal}`);

      if (!alreadyShowedFinal) {
        // Add delay to ensure no conflict with phase completion modals
        setTimeout(() => {
          const existingModal = document.querySelector(".celebration-modal");
          if (!existingModal) {
            console.log("Showing final workout celebration!");
            showCelebration();
            sessionStorage.setItem(finalCelebrationKey, "true");
          } else {
            console.log("Delaying final celebration - other modal present");
            // Try again after a longer delay
            setTimeout(() => {
              if (!document.querySelector(".celebration-modal")) {
                showCelebration();
                sessionStorage.setItem(finalCelebrationKey, "true");
              }
            }, 1000);
          }
        }, 500);
      } else {
        console.log("Final celebration already shown for this workout");
      }
    }
  } else {
    console.log("Workout not yet complete or missing cooldown phase");
  }
}

function checkPhaseComplete(phase) {
  const selectedExercises = getSelectedExercises(phase);
  const rounds = calculateRounds(phase, selectedExercises);

  if (selectedExercises.length === 0) return true; // No exercises selected means "complete"

  let phaseRounds = 0;
  let phaseCompleted = 0;

  selectedExercises.forEach((exerciseName) => {
    const exerciseRounds = rounds[exerciseName] || 1;
    phaseRounds += exerciseRounds;

    for (let i = 1; i <= exerciseRounds; i++) {
      if (isRoundCompleted(phase, exerciseName, i)) {
        phaseCompleted++;
      }
    }
  });

  return phaseRounds > 0 && phaseCompleted === phaseRounds;
}

function showMotivationalMoment(phase) {
  const funnyComments = [
    "Don't you feel less like tearing someone's head off?",
    "Hopefully, for at least 5 minutes, no one has 'Mom, Mom, MOM'ed you!",
    "While you're feeling this good, imagine yourself on a beach with a delicious frozen drink.",
    "Can you tolerate your MIL a little while longer now?",
    "I'm doing this for me… but I'm also doing it for ice cream!",
    "One rep closer to outlasting your grandkids' energy!",
    "This is your 'I survived menopause and all I got was this killer arm day' moment.",
    "Sweat now, shine later (and by 'shine,' I mean glow like a woman who just said 'no' to folding laundry).",
    "You're not getting older, you're getting more interesting and way stronger.",
    "Remember: Every squat is a 'take that' to gravity.",
    "If you can lift this, you can lift your own groceries without judging the bagger.",
    "This workout is cheaper than therapy and way more effective.",
    "You're not just burning calories—you're burning patriarchy.",
    "Strong is the new 'I'll show you who's too old for this.'",
    "Channel your inner 'I woke up like this'—except 'this' is sore and fabulous.",
    "You're not just lifting weights, you're lifting standards.",
    "Every rep is a high-five to your future self.",
    "If you can survive hot flashes, you can survive anything.",
    "This is your 'I don't need a man, I need a spotter' era.",
    "You're not 'tired,' you're marinating in endorphins.",
    "Think of this as training for the 'Grandma Olympics'—gold medal in spoiling kids and lifting heavy things.",
    "You're not 'aging,' you're upgrading.",
    "This workout is your 'I don't have time for nonsense' cardio.",
    "Sweat is just your body crying tears of joy for not being on the couch.",
    "Your vintage behind just kicked that phase's behind!",
    "Every lunge is a step away from 'I can't' and toward 'Watch me.'",
    "You're not just working out, you're practicing for your 'I told you so' moment.",
    "This is your 'I can still touch my toes and my patience is almost restored' time.",
    "You're not out of shape, you're in training!",
    "Remember: You're not just lifting weights, you're lifting your own damn spirits.",
  ];

  const phaseNames = {
    activation: "Activation Phase",
    jump: "Jump Phase",
    strength: "Strength Phase",
    power: "Power Phase",
    sit: "SIT Phase",
    integration: "Integration Phase",
    mobility: "Mobility Phase",
  };

  const phaseName = phaseNames[phase] || "Phase";
  const randomComment =
    funnyComments[Math.floor(Math.random() * funnyComments.length)];

  console.log(`Creating motivational modal for ${phaseName}`);

  // Remove any existing celebration modals to prevent conflicts
  const existingModals = document.querySelectorAll(".celebration-modal");
  existingModals.forEach((modal) => modal.remove());

  const modal = document.createElement("div");
  modal.className = "celebration-modal motivational-modal"; // Added extra class for identification
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.zIndex = "10001"; // Higher than other modals
  modal.innerHTML = `
        <div class="celebration-content" style="background: #10b981; max-width: 450px;">
            <h2 style="font-size: 24px; margin-bottom: 16px; color: white;">Way to go girl! You've completed the ${phaseName}!</h2>
            <p style="font-size: 16px; margin-bottom: 24px; color: white; font-style: italic;">${randomComment}</p>
            <button onclick="closeMotivationalMoment()" style="background: white; color: #10b981; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
                Continue Workout
            </button>
        </div>
    `;

  document.body.appendChild(modal);
  console.log(
    `Motivational modal added to DOM - will persist until user clicks Continue`
  );
}

function closeMotivationalMoment() {
  console.log("Manually closing motivational moment");
  const modals = document.querySelectorAll(".motivational-modal");
  modals.forEach((modal) => modal.remove());
}

// Make closeMotivationalMoment available globally
window.closeMotivationalMoment = closeMotivationalMoment;

function showCelebration() {
  // Create confetti
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti";
  document.body.appendChild(confettiContainer);

  // Generate confetti pieces
  const colors = [
    "#f39c12",
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#9b59b6",
    "#f1c40f",
  ];
  for (let i = 0; i < 150; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 2 + "s";
    piece.style.animationDuration = Math.random() * 2 + 2 + "s";
    confettiContainer.appendChild(piece);
  }

  // Motivational quotes for final workout completion
  const motivationalQuotes = [
    "Every step forward is a victory worth celebrating!",
    "You're not just building strength, you're building your future!",
    "Progress isn't just physical - it's mental, emotional, and spiritual!",
    "You're writing a story of resilience with every workout!",
    "Strong women lift each other up - including their future selves!",
    "Your commitment today creates the confident woman of tomorrow!",
    "You're not just exercising, you're practicing self-love!",
    "Every workout is an investment in the amazing woman you're becoming!",
    "You're proof that dedication and determination create magic!",
    "Your strength journey inspires everyone around you!",
    "Today's effort becomes tomorrow's strength and confidence!",
    "You're building more than muscle - you're building character!",
  ];

  const randomQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // Show celebration modal
  const modal = document.createElement("div");
  modal.className = "celebration-modal";
  modal.innerHTML = `
        <div class="celebration-content">
            <h1 style="font-size: 48px; margin-bottom: 20px; color: white;">🎉 Amazing!</h1>
            <h2 style="font-size: 32px; margin-bottom: 16px; color: white;">Workout Complete!</h2>
            <p style="font-size: 18px; margin-bottom: 30px; color: white; font-style: italic;">${randomQuote}</p>
        </div>
    `;
  document.body.appendChild(modal);

  // Auto-remove confetti after animation
  setTimeout(() => {
    if (confettiContainer.parentNode) {
      confettiContainer.parentNode.removeChild(confettiContainer);
    }
  }, 5000);

  // Auto-remove modal after longer time since no button
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }, 6000);
}

function closeCelebration() {
  const modal = document.querySelector(".celebration-modal");
  if (modal) {
    modal.parentNode.removeChild(modal);
  }
}

// Make closeCelebration available globally
window.closeCelebration = closeCelebration;

function getPhaseTargetTime(phase) {
  const targets = {
    jump: 10,
    strength: 25,
    sit: 18,
    activation: 5,
    power: 18,
    mobility: 15,
    integration: 20,
    cooldown: 8,
  };
  return targets[phase] || 10;
}

function getMaxSelections(phase) {
  return (
    {
      jump: 4,
      sit: 4,
      activation: 3,
      mobility: 5,
      cooldown: 4,
      strength: 4,
      power: 4,
      integration: 4,
    }[phase] || 4
  );
}

function getSelectedCount(phase) {
  return Object.keys(workoutSelections).filter(
    (k) =>
      k.startsWith(`${selectedWeek}-${selectedDay}-${phase}`) &&
      workoutSelections[k]
  ).length;
}

function getCalculatedTime(phase) {
  const selectedExercises = getSelectedExercises(phase);
  const rounds = calculateRounds(phase, selectedExercises);

  let totalTime = 0;
  selectedExercises.forEach((exerciseName) => {
    const baseTime = exerciseBaseTimes[phase]?.[exerciseName] || 2;
    const exerciseRounds = rounds[exerciseName] || 1;
    totalTime += baseTime * exerciseRounds;
  });

  return Math.round(totalTime);
}

function updateApp() {
  const w = getCurrentWorkout();
  document.getElementById("workoutTitle").textContent = `${
    selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)
  }: ${w.type}`;
  document.getElementById(
    "workoutDuration"
  ).textContent = `${w.duration[selectedDuration]} minutes`;
  document.getElementById("phasesList").innerHTML = w.phases
    .map((p) => `<span class="phase-badge">${getPhaseTitle(p)}</span>`)
    .join("");

  document.getElementById("exerciseSelection").innerHTML = w.phases
    .map((phase) => {
      const selected = getSelectedCount(phase);
      const max = getMaxSelections(phase);
      const selectedExercises = getSelectedExercises(phase);
      const rounds = calculateRounds(phase, selectedExercises);
      const calculatedTime = getCalculatedTime(phase);
      const targetTime = getPhaseTargetTime(phase);
      const timeStatus = calculatedTime <= targetTime + 2 ? "good" : "over"; // 2min buffer

      const exercises = (exerciseOptions[phase] || []).map((ex) => {
        const key = `${selectedWeek}-${selectedDay}-${phase}-${ex.name}`;
        const isSelected = workoutSelections[key];
        const exerciseRounds = rounds[ex.name] || 0;
        return { ex, key, isSelected, exerciseRounds };
      });

      return `
            <div class="phase-section" data-phase="${phase}">
                <div class="phase-header" data-toggle="${phase}">
                    <h3 style="margin:0">${getPhaseTitle(phase)}</h3>
                    <div style="display:flex;gap:12px;align-items:center">
                        <span class="badge" style="background: ${
                          timeStatus === "over" ? "#fef2f2" : "#dbeafe"
                        }; color: ${
        timeStatus === "over" ? "#dc2626" : "#1e40af"
      }">
                            ${calculatedTime}/${targetTime} min
                        </span>
                        <span class="toggle-arrow">▼</span>
                    </div>
                </div>
                <div class="phase-content" data-content="${phase}">
                    ${
                      phaseExplanations[phase]
                        ? `
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
                            <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.4;">
                                <strong>Why This Matters:</strong> ${phaseExplanations[phase]}
                            </p>
                        </div>
                    `
                        : ""
                    }
                    ${
                      phaseInstructions[phase]
                        ? `
                        <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
                            <p style="margin: 0; font-size: 14px; color: #0c4a6e; line-height: 1.4;">
                                <strong>Instructions:</strong> ${phaseInstructions[phase]}
                            </p>
                        </div>
                    `
                        : ""
                    }
                    ${
                      exercises.filter((e) => e.isSelected).length
                        ? `
                        <div style="margin-bottom:16px">
                            <h4>Your Workout Plan</h4>
                            <div class="exercise-grid">
                                ${exercises
                                  .filter((e) => e.isSelected)
                                  .map(
                                    ({ ex, key, exerciseRounds }) => `
                                    <div class="exercise-card selected" data-key="${key}" data-phase="${phase}">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                                            <h4 style="margin: 0;">${
                                              ex.name
                                            }</h4>
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <button class="round-btn" data-action="decrease" data-exercise="${
                                                  ex.name
                                                }" data-phase="${phase}" style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; width: 24px; height: 24px; font-size: 14px; cursor: pointer;">-</button>
                                                <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; min-width: 60px; text-align: center;">
                                                    ${exerciseRounds} ${
                                      exerciseRounds === 1 ? "round" : "rounds"
                                    }
                                                </span>
                                                <button class="round-btn" data-action="increase" data-exercise="${
                                                  ex.name
                                                }" data-phase="${phase}" style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; width: 24px; height: 24px; font-size: 14px; cursor: pointer;">+</button>
                                            </div>
                                        </div>
                                        <div class="exercise-details">
                                            <span>${ex.reps}</span>
                                            <span>${ex.weight}</span>
                                            <span>Rest: ${ex.rest}</span>
                                        </div>
                                        <p style="margin-top: 8px; font-size: 13px; color: #6b7280; line-height: 1.3;">${
                                          ex.description
                                        }</p>
                                        <div class="rounds-container">
                                            <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">Track Your Progress:</div>
                                            ${Array.from(
                                              { length: exerciseRounds },
                                              (_, i) => {
                                                const roundIndex = i + 1;
                                                const isCompleted =
                                                  isRoundCompleted(
                                                    phase,
                                                    ex.name,
                                                    roundIndex
                                                  );
                                                return `
                                                    <div class="round-item ${
                                                      isCompleted
                                                        ? "completed"
                                                        : ""
                                                    }" onclick="event.stopPropagation()">
                                                        <input type="checkbox" class="round-checkbox" 
                                                               ${
                                                                 isCompleted
                                                                   ? "checked"
                                                                   : ""
                                                               } 
                                                               data-phase="${phase}" 
                                                               data-exercise="${
                                                                 ex.name
                                                               }" 
                                                               data-round="${roundIndex}"
                                                               onclick="event.stopPropagation()">
                                                        Round ${roundIndex}
                                                    </div>
                                                `;
                                              }
                                            ).join("")}
                                        </div>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }
                    ${
                      exercises.filter((e) => !e.isSelected).length
                        ? `
                        <div>
                            <h4>Available Exercises</h4>
                            <div class="exercise-grid">
                                ${exercises
                                  .filter((e) => !e.isSelected)
                                  .map(
                                    ({ ex, key }) => `
                                    <div class="exercise-card" data-key="${key}" data-phase="${phase}">
                                        <h4>${ex.name}</h4>
                                        <div class="exercise-details">
                                            <span>${ex.reps}</span>
                                            <span>${ex.weight}</span>
                                            <span>Rest: ${ex.rest}</span>
                                        </div>
                                        <p style="margin-top: 8px; font-size: 13px; color: #6b7280; line-height: 1.3;">${ex.description}</p>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
    })
    .join("");

  addEventListeners();
  restoreOpenPhases();
}

function addEventListeners() {
  document.querySelectorAll("[data-toggle]").forEach((h) => {
    h.addEventListener("click", () => {
      try {
        const p = h.dataset.toggle;
        const content = document.querySelector(`[data-content="${p}"]`);
        const arrow = h.querySelector(".toggle-arrow");
        const expanded = content.classList.contains("show");
        content.classList.toggle("show");
        arrow.textContent = expanded ? "▼" : "▲";
        expanded ? openPhases.delete(p) : openPhases.add(p);
      } catch (error) {
        console.error("Error toggling phase:", error);
      }
    });
  });

  document.querySelectorAll(".exercise-card").forEach((card) => {
    card.addEventListener("click", () => {
      try {
        const key = card.dataset.key;
        const phase = card.dataset.phase;

        if (!key || !phase) {
          console.error("Missing key or phase data on exercise card");
          return;
        }

        const isSelected = workoutSelections[key];
        const selected = getSelectedCount(phase);

        if (isSelected) {
          delete workoutSelections[key];
        } else {
          workoutSelections[key] = true;
        }

        openPhases.add(phase);
        updateApp();
      } catch (error) {
        console.error("Error selecting exercise:", error);
      }
    });
  });

  // Add round adjustment button listeners
  document.querySelectorAll(".round-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      try {
        e.stopPropagation(); // Prevent card selection
        const action = btn.dataset.action;
        const exerciseName = btn.dataset.exercise;
        const phase = btn.dataset.phase;

        if (!action || !exerciseName || !phase) {
          console.error("Missing data attributes on round button");
          return;
        }

        adjustRounds(phase, exerciseName, action);
      } catch (error) {
        console.error("Error adjusting rounds:", error);
      }
    });
  });

  // Add round completion checkbox listeners
  document.querySelectorAll(".round-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      try {
        e.stopPropagation(); // Prevent card selection
        const phase = checkbox.dataset.phase;
        const exerciseName = checkbox.dataset.exercise;
        const roundIndex = parseInt(checkbox.dataset.round);

        if (!phase || !exerciseName || isNaN(roundIndex)) {
          console.error("Missing or invalid data attributes on checkbox");
          return;
        }

        toggleRoundCompletion(phase, exerciseName, roundIndex);
      } catch (error) {
        console.error("Error toggling round completion:", error);
      }
    });

    // Also prevent click event from bubbling
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
}

function restoreOpenPhases() {
  openPhases.forEach((p) => {
    const content = document.querySelector(`[data-content="${p}"]`);
    const arrow = document.querySelector(`[data-toggle="${p}"] .toggle-arrow`);
    if (content && arrow) {
      content.classList.add("show");
      arrow.textContent = "▲";
    }
  });
}

function showEquipmentModal() {
  document.getElementById("equipmentModal").classList.remove("hidden");
  document.getElementById("equipmentContent").innerHTML = `
        <h4>${selectedLocation === "home" ? "Home" : "Gym"} Equipment</h4>
        ${equipmentDatabase[selectedLocation]
          .map(
            (item) => `
            <div style="margin:8px 0">
                <input type="checkbox" id="${item.id}" ${
              userEquipment[selectedLocation][item.id] ? "checked" : ""
            }>
                <label for="${item.id}">${item.name}</label>
            </div>
        `
          )
          .join("")}
    `;

  equipmentDatabase[selectedLocation].forEach((item) => {
    document.getElementById(item.id)?.addEventListener("change", (e) => {
      userEquipment[selectedLocation][item.id] = e.target.checked;
    });
  });
}

// Event listeners for main controls
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("weekSelect").addEventListener("change", (e) => {
    selectedWeek = parseInt(e.target.value);
    // Clear celebration flags when workout changes
    clearCelebrationFlags();
    updateApp();
  });
  document.getElementById("daySelect").addEventListener("change", (e) => {
    selectedDay = e.target.value;
    // Clear celebration flags when workout changes
    clearCelebrationFlags();
    updateApp();
  });
  document.getElementById("durationSelect").addEventListener("change", (e) => {
    selectedDuration = e.target.value;
    updateApp();
  });
  document.getElementById("locationSelect").addEventListener("change", (e) => {
    selectedLocation = e.target.value;
  });
  document
    .getElementById("equipmentButton")
    .addEventListener("click", showEquipmentModal);
  document
    .getElementById("closeModal")
    .addEventListener("click", () =>
      document.getElementById("equipmentModal").classList.add("hidden")
    );

  // Initialize the app
  updateApp();
});

function clearCelebrationFlags() {
  // Clear all celebration flags for the current workout
  const keys = Object.keys(sessionStorage);
  keys.forEach((key) => {
    if (
      key.includes(`${selectedWeek}-${selectedDay}`) &&
      key.includes("celebrated")
    ) {
      sessionStorage.removeItem(key);
    }
  });
}

// Also add a manual way to reset celebrations for testing
window.resetCelebrations = function () {
  sessionStorage.clear();
  console.log("All celebration flags cleared");
};
