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
    // Use the new handlePhaseToggle function instead of direct toggle
    handlePhaseToggle(p);
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

document.querySelectorAll(".round-btn").forEach((btn) => {
btn.addEventListener("click", (e) => {
  try {
    e.stopPropagation();
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

document.querySelectorAll(".round-checkbox").forEach((checkbox) => {
checkbox.addEventListener("change", (e) => {
  try {
    e.stopPropagation();
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

document.addEventListener("DOMContentLoaded", function () {
document.getElementById("weekSelect").addEventListener("change", (e) => {
selectedWeek = parseInt(e.target.value);
clearCelebrationFlags();
updateApp();
});
document.getElementById('trainingWeekSelect').addEventListener('change', e => { 
trainingWeek = parseInt(e.target.value); 
updateApp();
});
document.getElementById("daySelect").addEventListener("change", (e) => {
selectedDay = e.target.value;
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

updateApp();
});

function clearCelebrationFlags() {
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

window.resetCelebrations = function () {
sessionStorage.clear();
console.log("All celebration flags cleared");
};

function removeExerciseAndContinue(phase, exerciseToRemove) {
const key = `${selectedWeek}-${selectedDay}-${phase}-${exerciseToRemove}`;
delete workoutSelections[key];

const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseToRemove}`;
delete customRounds[customKey];

closeRemovalPrompt();
updateApp();
}

function cancelRoundIncrease(phase, exerciseName) {
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

setTimeout(() => {
checkForPhaseCompletion(phase);
checkWorkoutCompletion();
}, 100);
}

function getRoundCompletionKey(phase, exerciseName, roundIndex) {
return `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}-${roundIndex}`;
}

function isRoundCompleted(phase, exerciseName, roundIndex) {
const key = getRoundCompletionKey(phase, exerciseName, roundIndex);
return completedRounds[key] || false;
}

function checkForPhaseCompletion(phase) {
if (phase === "cooldown") {
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
  showMotivationalMoment(phase);
  sessionStorage.setItem(celebrationKey, "true");
}
}
}

function checkWorkoutCompletion() {
const w = getCurrentWorkout();

if (window.showingMotivationalMoment) {
return;
}

let totalRounds = 0;
let completedCount = 0;
let workoutComplete = true;

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

if (totalRounds > 0 && workoutComplete && w.phases.includes("cooldown")) {
const cooldownComplete = checkPhaseComplete("cooldown");
if (cooldownComplete) {
  const finalCelebrationKey = `${selectedWeek}-${selectedDay}-final-celebration`;
  const alreadyShowedFinal = sessionStorage.getItem(finalCelebrationKey);

  if (!alreadyShowedFinal) {
    setTimeout(() => {
      const existingModal = document.querySelector(".celebration-modal");
      if (!existingModal) {
        showCelebration();
        sessionStorage.setItem(finalCelebrationKey, "true");
      } else {
        setTimeout(() => {
          if (!document.querySelector(".celebration-modal")) {
            showCelebration();
            sessionStorage.setItem(finalCelebrationKey, "true");
          }
        }, 1000);
      }
    }, 500);
  }
}
}
}

function checkPhaseComplete(phase) {
const selectedExercises = getSelectedExercises(phase);
const rounds = calculateRounds(phase, selectedExercises);

if (selectedExercises.length === 0) return true;

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
const activationJumpQuotes = [
"Way to go!",
"Keep going!",
"You got this!",
"Nice work!",
"Crushing it!",
"Looking strong!",
"Keep it up!",
"You're doing great!",
"Fantastic start!",
"On fire!",
"Momentum building!",
"Perfect form!",
];

const strengthSITQuotes = [
"Don't you feel less like tearing someone's head off, now?",
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
"You're not just lifting weights, you're lifting standards.",
"Every rep is a high-five to your future self.",
"If you can survive hot flashes, you can survive anything.",
"This is your 'I don't need a man, I need a spotter' era.",
"You're not 'tired,' you're marinating in endorphins.",
"Think of this as training for the 'Grandma Olympics'—gold medal in spoiling kids and lifting heavy things.",
"You're not 'aging,' you're upgrading.",
"This workout is your 'I don't have time for nonsense' cardio.",
"Sweat is just your fat cells crying.",
"Your vintage behind just kicked that phase's behind!",
"Every lunge is a step away from 'I can't' and toward 'Watch me.'",
"You're not just working out, you're practicing for your 'I told you so' moment.",
"This is your 'I can still touch my toes and my patience is almost restored' time.",
"You're beauty is a result of your age not diminished bu it!",
"You're 1 workout closer to opening your own damn jars!",
"Remember: You're not just lifting weights, you're lifting your own damn spirits.",
];

const cooldownQuotes = [
"Now go and tackle your day!",
"You're a queen!",
"You came, you saw, you conquered this workout!",
"Cross one more thing off your list!",
"Workout: DONE. What's next?",
"You showed up and crushed it!",
"Time to seize the day!",
"Mission accomplished!",
"Today's workout: Complete. Today's attitude: Unstoppable.",
"You did the work—now enjoy the results!",
"Another workout in the books!",
"Feeling strong and ready for anything!",
"You earned this post-workout glow!",
];

const phaseNames = {
activation: "Activation Phase",
jump: "Jump Phase",
strength: "Strength Phase",
power: "Power Phase",
sit: "SIT Phase",
integration: "Integration Phase",
mobility: "Mobility Phase",
cooldown: "Cool Down Phase",
};

const phaseName = phaseNames[phase] || "Phase";

let randomComment;
if (phase === "activation" || phase === "jump") {
randomComment =
  activationJumpQuotes[
    Math.floor(Math.random() * activationJumpQuotes.length)
  ];
} else if (
phase === "strength" ||
phase === "sit" ||
phase === "power" ||
phase === "integration"
) {
randomComment =
  strengthSITQuotes[Math.floor(Math.random() * strengthSITQuotes.length)];
} else if (phase === "cooldown") {
randomComment =
  cooldownQuotes[Math.floor(Math.random() * cooldownQuotes.length)];
} else {
randomComment =
  activationJumpQuotes[
    Math.floor(Math.random() * activationJumpQuotes.length)
  ];
}

const existingModals = document.querySelectorAll(".celebration-modal");
existingModals.forEach((modal) => modal.remove());

const modal = document.createElement("div");
modal.className = "celebration-modal motivational-modal";
modal.style.background = "rgba(0,0,0,0.6)";
modal.style.zIndex = "10001";
modal.innerHTML = `
  <div class="celebration-content" style="background: #10b981; max-width: 450px;">
      <h2 style="font-size: 24px; margin-bottom: 16px; color: white;">Way to go! You've completed the ${phaseName}!</h2>
      <p style="font-size: 16px; margin-bottom: 24px; color: white; font-style: italic;">${randomComment}</p>
      <button onclick="closeMotivationalMoment()" style="background: white; color: #10b981; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
          Continue Workout
      </button>
  </div>
`;

document.body.appendChild(modal);
}

function closeMotivationalMoment() {
const modals = document.querySelectorAll(".motivational-modal");
modals.forEach((modal) => modal.remove());
}

window.closeMotivationalMoment = closeMotivationalMoment;

function showCelebration() {
const confettiContainer = document.createElement("div");
confettiContainer.className = "confetti";
document.body.appendChild(confettiContainer);

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

setTimeout(() => {
if (confettiContainer.parentNode) {
  confettiContainer.parentNode.removeChild(confettiContainer);
}
}, 5000);

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

window.closeCelebration = closeCelebration;

function getPhaseTargetTime(phase) {
const baseTimes = {
jump: 10,
strength: 25,
sit: 18,
activation: 5,
power: 18,
mobility: 15,
integration: 20,
cooldown: 8,
};

const baseTime = baseTimes[phase] || 10;

const durationMultipliers = {
quick: 0.7,
standard: 1.0,
extended: 1.3,
};

const multiplier = durationMultipliers[selectedDuration] || 1.0;
return Math.round(baseTime * multiplier);
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
  const timeStatus = calculatedTime <= targetTime + 2 ? "good" : "over";
  const isPhaseOpen = openPhases.has(phase);

  const exercises = (exerciseOptions[phase] || []).map((ex) => {
    const key = `${selectedWeek}-${selectedDay}-${phase}-${ex.name}`;
    const isSelected = workoutSelections[key];
    const exerciseRounds = rounds[ex.name] || 0;
    return { ex, key, isSelected, exerciseRounds };
  });

  let hrCalculatorHTML = "";
  if (phase === "sit") {
    const hr80 = maxHR ? Math.round(maxHR * 0.8) : null;
    const hr90 = maxHR ? Math.round(maxHR * 0.9) : null;
    const hr100 = maxHR ? Math.round(maxHR * 1.0) : null;

    hrCalculatorHTML = `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 8px; display: block;">
                        Calculate Your Target Heart Rate
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="number" id="ageInput" placeholder="Enter your age" 
                               style="padding: 8px; border: 1px solid #d97706; border-radius: 4px; width: 150px; font-size: 14px;"
                               value="${userAge || ""}"
                               min="18" max="100">
                        <button onclick="calculateMaxHR()" 
                                style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer;">
                            Calculate
                        </button>
                    </div>
                </div>
                ${
                  maxHR
                    ? `
                    <div style="background: white; padding: 12px; border-radius: 4px; margin-top: 8px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400e; font-weight: 600;">
                            Your Target Heart Rate Zones for SIT:
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #fef3c7; border-radius: 4px;">
                                <span style="font-size: 13px; color: #92400e;">80% Max HR (Moderate):</span>
                                <span style="font-weight: 600; font-size: 14px; color: #92400e;">${hr80} bpm</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #fed7aa; border-radius: 4px;">
                                <span style="font-size: 13px; color: #92400e;">90% Max HR (Hard):</span>
                                <span style="font-weight: 600; font-size: 14px; color: #92400e;">${hr90} bpm</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #fb923c; border-radius: 4px;">
                                <span style="font-size: 13px; color: white;">100% Max HR (Maximum):</span>
                                <span style="font-weight: 600; font-size: 14px; color: white;">${hr100} bpm</span>
                            </div>
                        </div>
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #92400e; font-style: italic;">
                            💡 Target 80-100% during work intervals. Use a heart rate monitor or fitness tracker for best results.
                        </p>
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }

  // NEW: When phase is closed and has selections, show only selected exercises
  const shouldShowCompactView = !isPhaseOpen && selected > 0;

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
                    <span class="toggle-arrow">${
                      isPhaseOpen ? "▲" : "▼"
                    }</span>
                </div>
            </div>
            <div class="phase-content ${isPhaseOpen ? "show" : ""}" data-content="${phase}">
                ${isPhaseOpen ? hrCalculatorHTML : ""}
                ${
                  isPhaseOpen && phaseExplanations[phase]
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
                  isPhaseOpen && phaseInstructions[phase]
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
                        <h4>${isPhaseOpen ? "Your Workout Plan" : ""}</h4>
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
                                        ${
                                          isPhaseOpen
                                            ? `
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <button class="round-btn" data-action="decrease" data-exercise="${
                                              ex.name
                                            }" data-phase="${phase}">-</button>
                                            <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; min-width: 60px; text-align: center;">
                                                ${exerciseRounds} ${
                                                exerciseRounds === 1
                                                  ? "round"
                                                  : "rounds"
                                              }
                                            </span>
                                            <button class="round-btn" data-action="increase" data-exercise="${
                                              ex.name
                                            }" data-phase="${phase}">+</button>
                                        </div>
                                        `
                                            : `
                                        <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                                            ${exerciseRounds} ${
                                                exerciseRounds === 1
                                                  ? "round"
                                                  : "rounds"
                                              }
                                        </span>
                                        `
                                        }
                                    </div>
                                    ${
                                      isPhaseOpen
                                        ? `
                                    <div class="exercise-details">
                                        <span>${ex.reps}</span>
                                        <span>${ex.weight}</span>
                                        <span>Rest: ${ex.rest}</span>
                                    </div>
                                    <p style="margin-top: 8px; font-size: 13px; color: #6b7280; line-height: 1.3;">${ex.description}</p>
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
                                    `
                                        : ""
                                    }
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
                  isPhaseOpen && exercises.filter((e) => !e.isSelected).length
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
})// Strong Women Workout Builder JavaScript
let selectedWeek = 1, 
  selectedDay = 'monday', 
  selectedDuration = 'standard', 
  selectedLocation = 'home', 
  trainingWeek = 1;
let userEquipment = { home: {}, gym: {} };
let workoutSelections = {},
completedExercises = {},
openPhases = new Set();
let customRounds = {};
let completedRounds = {};
let userAge = null;
let maxHR = null;

// Load saved age and maxHR on page load
if (sessionStorage.getItem("userAge")) {
userAge = parseInt(sessionStorage.getItem("userAge"));
maxHR = parseInt(sessionStorage.getItem("maxHR"));
}

// Calculate Max Heart Rate - MUST be at top level and global
window.calculateMaxHR = function () {
const ageInput = document.getElementById("ageInput");
if (!ageInput) {
console.error("Age input not found");
return;
}

const age = parseInt(ageInput.value);

if (!age || age < 18 || age > 100) {
alert("Please enter a valid age between 18 and 100");
return;
}

userAge = age;
maxHR = 220 - age;

sessionStorage.setItem("userAge", userAge);
sessionStorage.setItem("maxHR", maxHR);

updateApp();
};

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
  type: "Rest or Mobility",
  duration: { standard: 20, quick: 10, extended: 30 },
  phases: ["mobility", "cooldown"],
},
saturday: {
  type: "Resistance Training",
  duration: { standard: 35, quick: 25, extended: 45 },
  phases: ["activation", "strength", "cooldown"],
},
sunday: {
  type: "SIT Session",
  duration: { standard: 25, quick: 15, extended: 35 },
  phases: ["activation", "sit", "cooldown"],
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
  type: "Rest or Mobility/Core",
  duration: { standard: 25, quick: 15, extended: 35 },
  phases: ["mobility", "cooldown"],
},
saturday: {
  type: "Resistance Training",
  duration: { standard: 40, quick: 30, extended: 50 },
  phases: ["activation", "strength", "cooldown"],
},
sunday: {
  type: "SIT Session",
  duration: { standard: 25, quick: 18, extended: 30 },
  phases: ["activation", "sit", "cooldown"],
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
  type: "Rest or Mobility/Core",
  duration: { standard: 30, quick: 20, extended: 40 },
  phases: ["mobility", "cooldown"],
},
saturday: {
  type: "Power + Integration",
  duration: { standard: 45, quick: 35, extended: 55 },
  phases: ["activation", "power", "integration", "cooldown"],
},
sunday: {
  type: "SIT Session",
  duration: { standard: 30, quick: 20, extended: 35 },
  phases: ["activation", "sit", "cooldown"],
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
activation:
"Activation prepares your nervous system, increases blood flow to muscles, lubricates joints, and raises core temperature. This 'wake-up' process reduces injury risk and improves performance - especially critical for peri/postmenopausal women with reduced joint lubrication and slower neuromuscular response.",
jump: "Jump training provides the high-impact bone loading stimulus necessary to maintain and build bone density - your body needs impact forces 4-5x bodyweight to trigger bone formation. Plyometrics also preserve power, improve balance, and reduce fall risk by training rapid force production and reactive strength.",
power:
"Power training preserves fast-twitch muscle fibers that decline rapidly during menopause. These explosive movements improve your ability to react quickly (fall prevention), maintain bone density, and perform daily activities with confidence and strength.",
sit: "SIT (Sprint Interval Training) sessions should be SHORT and INTENSE. Mix different exercises to keep it interesting while maintaining maximum effort. Target 80-100% of your maximum heart rate during work intervals!",
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
  reps: "5 reps = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "60-90s",
  description:
    "Stand with feet shoulder-width apart. Lower into squat, explode upward jumping as high as possible. Land softly and hold landing position for 2 seconds.",
},
{
  name: "Step-Up with Knee Drive",
  reps: "4/leg = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "45-60s",
  description:
    "Step up onto chair with right foot, drive left knee up toward chest while balancing. Step down with control.",
},
{
  name: "Box Step Downs",
  reps: "6/leg = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "45-60s",
  description:
    "Stand on chair, slowly lower one foot toward ground controlling descent with standing leg. Tap toe lightly and return.",
},
{
  name: "Broad Jump",
  reps: "3 reps = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "90s",
  description:
    "Jump forward as far as possible, swing arms for momentum. Land on both feet simultaneously, bend knees to absorb impact.",
},
{
  name: "Lateral Bounds",
  reps: "4/side = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "60s",
  description:
    "Jump sideways from left leg to right foot only. Stick landing for 2 seconds maintaining balance.",
},
{
  name: "Tuck Jumps",
  reps: "4 reps = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "90s",
  description:
    "Jump straight up bringing knees toward chest as high as possible. Land softly and prepare for next jump.",
},
{
  name: "Depth Jumps",
  reps: "4 reps = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "90s",
  description:
    "Step off chair and land on both feet. Immediately jump vertically as high as possible upon landing.",
},
{
  name: "Single Leg Hops",
  reps: "6/leg = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "60s",
  description:
    "Balance on one leg, hop forward landing and immediately hopping again. Focus on soft landings and balance.",
},
{
  name: "Split Jump Lunges",
  reps: "6/leg = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "60s",
  description:
    "Start in lunge, jump up switching leg positions mid-air. Land with opposite foot forward and immediately jump again.",
},
],
strength: [
{
  name: "Goblet Squat",
  reps: "8-10 reps = 1 round",
  weight: "15-25 lbs",
  time: "4 rounds",
  rest: "90-120s",
  description:
    "Hold dumbbell vertically at chest. Squat down keeping chest up and elbows inside knees. Full body engagement - legs, core, shoulders.",
},
{
  name: "DB Deadlift",
  reps: "8-10 reps = 1 round",
  weight: "15-25 lbs",
  time: "4 rounds",
  rest: "90-120s",
  description:
    "Hold dumbbells at sides. Hinge at hips, lower weights toward floor keeping back flat. Drive through heels to stand. Engages posterior chain, core, grip.",
},
{
  name: "Renegade Rows",
  reps: "6/arm = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Plank position on dumbbells. Row one weight to ribcage while stabilizing with other arm. Alternate. Full body anti-rotation strength.",
},
{
  name: "Thruster Complex",
  reps: "8 reps = 1 round",
  weight: "10-15 lbs",
  time: "4 rounds",
  rest: "2min",
  description:
    "Squat with weights at shoulders, drive up and press overhead in one fluid motion. Total body power - legs, core, shoulders, arms.",
},
{
  name: "Single-Leg RDL",
  reps: "6/leg = 1 round",
  weight: "10-15 lbs",
  time: "4 rounds",
  rest: "60-90s",
  description:
    "Balance on left leg, hinge at hip lowering dumbbell while extending right leg behind. Keep back straight. Challenges balance, posterior chain, core stability.",
},
{
  name: "Step-Up with Bicep Curl",
  reps: "8-10/leg = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "60-90s",
  description:
    "Hold dumbbells at sides. Step up onto chair with right foot while simultaneously curling both weights to shoulders. Step down with control. Complete 8-10 reps on right leg, then switch to left leg. One round = both legs completed.",
},
{
  name: "Reverse Lunge with Hammer Curl to Press",
  reps: "8/leg = 1 round",
  weight: "8-12 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold dumbbells at sides. Step back into reverse lunge with right leg, at bottom of lunge curl weights to shoulders (hammer grip). As you step forward and stand, press weights overhead. Complete 8 reps on right leg, then 8 on left leg. One round = both legs completed.",
},
{
  name: "Deadlift to Upright Row to Curl",
  reps: "8 sequences = 1 round",
  weight: "12-15 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Start with dumbbells at mid-shin. Perform Romanian deadlift to standing, immediately pull weights up to chest (upright row), then curl to shoulders, lower back to start. That is 1 rep. Complete 8 full sequences per round.",
},
{
  name: "Side Lunge with Overhead Press",
  reps: "8/side = 1 round",
  weight: "8-12 lbs",
  time: "3 rounds",
  rest: "60s",
  description:
    "Hold dumbbells at shoulders. Lunge laterally to the right while simultaneously pressing weights overhead. Return to center lowering weights to shoulders. Complete 8 reps to right side, then 8 to left side. One round = both sides completed.",
},
{
  name: "Single-Leg Deadlift with Lateral Raise",
  reps: "6-8/leg = 1 round",
  weight: "5-8 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Balance on left leg holding dumbbells at sides. Hinge forward into single-leg deadlift while simultaneously raising arms laterally to shoulder height. Return to standing while lowering arms. Complete 6-8 reps on left leg, then switch to right. One round = both legs completed.",
},
{
  name: "Squat Hold with Alternating Shoulder Press",
  reps: "10 presses = 1 round",
  weight: "8-12 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold dumbbells at shoulders. Squat down to bottom position and HOLD. While holding the squat, press right arm overhead, lower, then press left arm overhead, lower. That is 2 reps. Continue alternating until you complete 10 total presses, then stand. Rest and repeat.",
},
{
  name: "Curtsy Lunge with Lateral Raise",
  reps: "8-10/leg = 1 round",
  weight: "5-8 lbs",
  time: "3 rounds",
  rest: "60s",
  description:
    "Hold dumbbells at sides. Cross right leg behind and to the left into curtsy position while simultaneously raising arms laterally to shoulder height. Return to standing while lowering arms. Complete 8-10 reps with right leg crossing, then 8-10 with left leg crossing. One round = both sides completed.",
},
{
  name: "Sumo Squat with Bicep Curl Hold",
  reps: "8-10 curls = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold dumbbells at sides in wide sumo stance. Squat down and HOLD bottom position. While holding the squat, perform 8-10 complete bicep curls, then stand up. That is 1 round. Rest and repeat for 3 total rounds.",
},
{
  name: "Walking Lunge with Bicep Curl to Press",
  reps: "10 lunges = 1 round",
  weight: "8-12 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold dumbbells at sides. Lunge forward with right leg, at the bottom curl weights to shoulders, then press overhead as you step the left foot forward into the next lunge. Continue alternating legs for 10 total lunges (5 per leg). One round = 10 total lunges completed.",
},
{
  name: "Bulgarian Split Squat with Tricep Extension",
  reps: "8/leg = 1 round",
  weight: "8-10 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold one dumbbell overhead with both hands, rear foot elevated on chair. Lower into split squat position and HOLD. While holding the lunge, perform 8 overhead tricep extensions (bending elbows behind head), then stand. Complete all 8 reps on right leg forward, then switch to left leg forward. One round = both legs completed.",
},
{
  name: "Goblet Squat with Arnold Press",
  reps: "8 sequences = 1 round",
  weight: "12-18 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold dumbbell vertically at chest (goblet position). Squat down, then as you stand rotate dumbbell and press overhead (palms facing forward at top). Lower weight back to goblet position with rotation. That is 1 rep. Complete 8 full squat-to-press sequences per round.",
},
{
  name: "Squat to Calf Raise with Overhead Press",
  reps: "8-10 sequences = 1 round",
  weight: "8-12 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold dumbbells at shoulders. Squat down, drive up to standing, immediately rise onto toes (calf raise) while pressing weights overhead. Lower from toes and bring weights back to shoulders. That is 1 rep. Complete 8-10 full sequences per round.",
},
{
  name: "Turkish Get-Up",
  reps: "3/side = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "90-120s",
  description:
    "Complex movement from lying to standing while keeping dumbbell overhead. Ultimate full-body stability, coordination, and strength builder.",
},
{
  name: "Push-Up to T-Rotation",
  reps: "6/side = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "90s",
  description:
    "Perform push-up, rotate to side plank raising arm to ceiling. Return and repeat other side. Chest, core, shoulders, rotation.",
},
{
  name: "DB Clean and Press",
  reps: "6 reps = 1 round",
  weight: "12-20 lbs",
  time: "4 rounds",
  rest: "2min",
  description:
    "Explosively pull dumbbells from floor to shoulders, then press overhead. Full body power movement engaging legs, back, shoulders, core.",
},
{
  name: "Sumo Squat to High Pull",
  reps: "10 reps = 1 round",
  weight: "15-20 lbs",
  time: "4 rounds",
  rest: "90s",
  description:
    "Wide stance squat holding weight between legs. Drive up and pull weight to chin. Targets legs, posterior chain, upper back, shoulders.",
},
{
  name: "Bear Complex",
  reps: "5 reps = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "2min",
  description:
    "Clean to front squat, press overhead, lower to back, back squat, press overhead, lower. Ultimate compound movement - every muscle group.",
},
],
power: [
{
  name: "Light DB Swings",
  reps: "15 reps = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "60-90s",
  description:
    "Hold dumbbell with both hands. Stand with feet wider than shoulders. Push hips back and swing weight between legs, then explosively drive hips forward to swing weight to chest height. Like a pendulum powered by your hips.",
},
{
  name: "Modified Thrusters",
  reps: "6 reps = 1 round",
  weight: "5-10 lbs",
  time: "3 rounds",
  rest: "60s",
  description:
    "Hold light dumbbells at shoulder level. Perform a squat, then as you stand up, press the weights overhead in one fluid motion. Lower weights back to shoulders and repeat.",
},
{
  name: "DB Snatch",
  reps: "5/arm = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Start in squat holding dumbbell between legs with one hand. Explosively stand while pulling weight from floor to overhead in one powerful motion. Like starting a lawnmower but finishing with weight overhead.",
},
{
  name: "DB Thruster",
  reps: "8 reps = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold dumbbells at shoulders. Squat down, then explosively drive up while pressing both weights overhead simultaneously. This combines a squat with an overhead press in one explosive movement.",
},
{
  name: "Heavy DB Swings",
  reps: "20 reps = 1 round",
  weight: "20-25 lbs",
  time: "3 rounds",
  rest: "2min",
  description:
    "Same technique as light swings but with heavier weight. Focus on explosive hip snap to drive weight to chest height. Keep core tight and drive power from hips, not arms.",
},
{
  name: "Medicine Ball Slams",
  reps: "10 reps = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "60-90s",
  description:
    "Hold medicine ball (or heavy dumbbell) overhead. Explosively slam it down toward the ground while engaging your core. Pick it up and repeat. Imagine throwing it through the floor.",
},
{
  name: "Power Cleans",
  reps: "6 reps = 1 round",
  weight: "15-25 lbs",
  time: "4 rounds",
  rest: "2min",
  description:
    "Start with dumbbells at mid-shin. Explosively extend hips and knees while pulling weights up. Catch weights at shoulder level with elbows pointing forward. Lower and repeat.",
},
{
  name: "Heavy Snatches",
  reps: "6/arm = 1 round",
  weight: "15-25 lbs",
  time: "4 rounds",
  rest: "2min",
  description:
    "Single-arm version of snatch with heavier weight. Explosively pull dumbbell from squat position to overhead in one motion. Requires maximum power and coordination.",
},
{
  name: "Explosive Push-Ups",
  reps: "5 reps = 1 round",
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
  reps: "20s work = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "100s (HR<120)",
  description:
    "Stand with feet shoulder-width apart. Squat down then jump up 6-12 inches (lower than max jump). Land softly and immediately squat again. Continuous jumping for 20 seconds at moderate intensity.",
},
{
  name: "Light Thrusters",
  reps: "20s work = 1 round",
  weight: "5-8 lbs",
  time: "3 rounds",
  rest: "100s (HR<120)",
  description:
    "Hold light dumbbells at shoulders. Squat down, then explosively stand while pressing weights overhead. Lower weights back to shoulders and immediately squat again. Continuous for 20 seconds.",
},
{
  name: "Fast Squats",
  reps: "30s work = 1 round",
  weight: "bodyweight",
  time: "4 rounds",
  rest: "90s (HR<125)",
  description:
    "Bodyweight squats performed as fast as possible while maintaining proper form. Count how many you can do in 30 seconds - aim for maximum reps.",
},
{
  name: "Burpee Intervals",
  reps: "20s work = 1 round",
  weight: "bodyweight",
  time: "4 rounds",
  rest: "70s (HR<120)",
  description:
    "Squat down, place hands on floor, jump feet back to plank, do a push-up, jump feet back to squat, then jump up with arms overhead. Repeat as fast as possible for 20 seconds.",
},
{
  name: "Mountain Climbers",
  reps: "30s work = 1 round",
  weight: "bodyweight",
  time: "4 rounds",
  rest: "90s (HR<125)",
  description:
    "Start in plank position. Rapidly alternate bringing knees toward chest as if running in place horizontally. Keep hands planted, core tight. Move as fast as possible for 30 seconds.",
},
{
  name: "High Knees",
  reps: "20s work = 1 round",
  weight: "bodyweight",
  time: "5 rounds",
  rest: "70s (HR<120)",
  description:
    "Run in place bringing knees up to waist height or higher. Pump arms rapidly. This should feel like sprinting in place - maximum effort for 20 seconds.",
},
{
  name: "Sprint Intervals",
  reps: "30s work = 1 round",
  weight: "bodyweight",
  time: "6 rounds",
  rest: "2min (HR<110)",
  description:
    "If outdoors: sprint at maximum speed. If indoors: high knees, butt kicks, or fast feet in place. Give 100% effort as if running from danger. 30 seconds all-out effort.",
},
{
  name: "Complex Circuit",
  reps: "45s work = 1 round",
  weight: "various",
  time: "4 rounds",
  rest: "2min (HR<115)",
  description:
    "Perform continuously without rest: 5 burpees, immediately into 10 jump squats, immediately into 15 light thrusters (5-8 lbs). Complete entire sequence as many times as possible in 45 seconds.",
},
{
  name: "Tabata Squats",
  reps: "20s work = 1 round",
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
  reps: "8/dir = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Large arm circles forward then backward. Gradually increase circle size to warm shoulders.",
},
{
  name: "Light Squat Jumps",
  reps: "4 reps = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Small squat jumps focusing on soft landings. Jump only 6-12 inches high for activation.",
},
{
  name: "Shoulder Squeezes",
  reps: "8 reps = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Squeeze shoulder blades together, hold 2 seconds. Activates postural muscles.",
},
{
  name: "Leg Swings",
  reps: "8/leg = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Hold wall for balance, swing leg forward/back then side to side. Mobilizes hip joints.",
},
{
  name: "Torso Twists",
  reps: "8 each = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Rotate torso left and right keeping hips forward. Warms spine and core.",
},
{
  name: "Marching",
  reps: "20 steps = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "March bringing knees to waist height. Gradually increase pace, activates core.",
},
{
  name: "Sun Salutation Flow",
  reps: "3 flows = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Mountain pose → forward fold → half lift → low lunge → downward dog → cobra → back to mountain. Warms entire body with flowing movement.",
},
{
  name: "Cat-Cow Warm-Up",
  reps: "8 reps = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "On hands and knees, arch back (cow) then round spine (cat). Mobilizes spine and activates core for movement.",
},
{
  name: "Hip Circles",
  reps: "8/dir = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Hands on hips, make large circles. Keep feet planted, mobilizes hip joints.",
},
{
  name: "Dynamic Warrior Flow",
  reps: "5/side = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Step back to warrior I, flow to warrior III (standing balance), return to warrior I. Activates legs, core, and balance systems.",
},
{
  name: "Ankle Pumps",
  reps: "15/foot = 1 round",
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
  reps: "8 reps = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "20s",
  description:
    "Arch back (cow) then round spine (cat). Mobilizes entire spine and relieves tension.",
},
{
  name: "Hip Flexor Stretch",
  reps: "30s/leg = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "20s",
  description:
    "Lunge position, sink hips forward. Stretches front of rear hip and thigh.",
},
{
  name: "Glute Bridge Hold",
  reps: "30s = 1 round",
  weight: "bodyweight",
  time: "3 rounds",
  rest: "30s",
  description:
    "Lift hips squeezing glutes. Creates straight line from knees to shoulders.",
},
{
  name: "Thoracic Rotation",
  reps: "6/side = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "20s",
  description:
    "On hands and knees, rotate elbow down then up toward ceiling. Improves mid-back mobility.",
},
{
  name: "Hamstring Stretch",
  reps: "30s/leg = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "20s",
  description:
    "Sit with one leg extended, lean forward from hips. Keep back straight, hinge from hips.",
},
{
  name: "Chest Stretch",
  reps: "30s = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "20s",
  description:
    "Forearms against doorframe at shoulder height. Step forward to stretch chest and shoulders.",
},
{
  name: "Spinal Waves",
  reps: "6 reps = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "20s",
  description:
    "Wave motion through spine from head to tailbone. Move slowly focusing on each vertebra.",
},
{
  name: "Child Pose",
  reps: "45s = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "20s",
  description:
    "Kneel and fold forward extending arms. Decompresses spine and promotes relaxation.",
},
{
  name: "Seated Spinal Twist",
  reps: "30s/side = 1 round",
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
  reps: "6+6 = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Hold dumbbells at sides. Do 6 goblet squats (holding weight at chest), then immediately do 6 calf raises (rise up on toes) with same weight. No rest between exercises.",
},
{
  name: "Row to Overhead",
  reps: "8+8 = 1 round",
  weight: "8-12 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Support one hand on chair, row dumbbell to ribcage 8 times. Immediately stand and press same weight overhead 8 times. Combines pulling and pushing movements.",
},
{
  name: "Squat to Jump Complex",
  reps: "6+3 = 1 round",
  weight: "20-25 lbs",
  time: "4 rounds",
  rest: "2min",
  description:
    'Do 6 heavy goblet squats with control, then immediately drop weight and do 3 explosive jump squats. This "contrast training" primes muscles for power.',
},
{
  name: "Row to Thrusters",
  reps: "8+8 = 1 round",
  weight: "12-15 lbs",
  time: "3 rounds",
  rest: "2min",
  description:
    "Bent-over row for 8 reps, then immediately perform 8 thrusters (squat to overhead press). Integrates pulling, squatting, and pressing in sequence.",
},
{
  name: "Lunge to Curl",
  reps: "6+6/leg = 1 round",
  weight: "8-12 lbs",
  time: "3 rounds",
  rest: "60s",
  description:
    "Step back into reverse lunge while simultaneously curling dumbbells to shoulders. Step together and repeat. Challenges balance while building strength.",
},
{
  name: "Deadlift to Upright Row",
  reps: "8+8 = 1 round",
  weight: "10-15 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Romanian deadlift for 8 reps (hinge at hips, lower weights toward floor), then immediately do 8 upright rows (pull weights up to chest level).",
},
{
  name: "Step-Up to Press",
  reps: "6/leg = 1 round",
  weight: "8-12 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    "Step up onto chair while simultaneously pressing dumbbells overhead. Step down with control. Combines lower body and upper body in multiple planes of movement.",
},
{
  name: "Squat to Rotation",
  reps: "8/side = 1 round",
  weight: "8-15 lbs",
  time: "3 rounds",
  rest: "60s",
  description:
    "Hold weight at chest, squat down, then as you stand rotate torso fully to the right, then left. Adds rotational movement to traditional squat pattern.",
},
{
  name: "Plank to T-Rotation",
  reps: "6/side = 1 round",
  weight: "5-10 lbs",
  time: "3 rounds",
  rest: "90s",
  description:
    'Start in plank holding light weight in one hand. Rotate to side plank while lifting weight toward ceiling, forming a "T" shape. Return to plank and repeat.',
},
],
cooldown: [
{
  name: "Walking in Place",
  reps: "2min = 1 round",
  weight: "bodyweight",
  time: "1 round",
  rest: "flow",
  description:
    "Gradually decrease pace over 2 minutes. Brings heart rate down gently.",
},
{
  name: "Deep Breathing",
  reps: "5 breaths = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Inhale 4 counts, hold 2, exhale 6. Activates parasympathetic nervous system.",
},
{
  name: "Seated Forward Fold",
  reps: "45s = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Fold forward from hips letting arms hang. Decompresses spine after exercise.",
},
{
  name: "Neck Rolls",
  reps: "5/dir = 1 round",
  weight: "bodyweight",
  time: "1 round",
  rest: "flow",
  description:
    "Slowly roll head in complete circles. Releases neck and shoulder tension.",
},
{
  name: "Gentle Spinal Twist",
  reps: "30s/side = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Gentle rotation looking over shoulder. Helps decompress spine.",
},
{
  name: "Ankle Circles",
  reps: "8/dir = 1 round",
  weight: "bodyweight",
  time: "1 round",
  rest: "flow",
  description:
    "Slow circles with ankles. Promotes circulation and prevents stiffness.",
},
{
  name: "Child Pose to Cobra Flow",
  reps: "5 flows = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Start in child pose, flow forward to cobra pose, return to child pose. Gentle spinal movement and deep relaxation.",
},
{
  name: "Legs Up the Wall",
  reps: "2min = 1 round",
  weight: "bodyweight",
  time: "1 round",
  rest: "flow",
  description:
    "Lie on back with legs up against wall or chair. Promotes circulation and activates rest response.",
},
{
  name: "Restorative Twist",
  reps: "1min/side = 1 round",
  weight: "bodyweight",
  time: "1 round",
  rest: "flow",
  description:
    "Lie on back, drop both knees to one side, arms in T-shape. Hold and breathe deeply. Releases tension and promotes relaxation.",
},
{
  name: "Progressive Relaxation",
  reps: "3min = 1 round",
  weight: "bodyweight",
  time: "1 round",
  rest: "flow",
  description:
    "Tense then relax each muscle group from toes up. Promotes deep relaxation.",
},
{
  name: "Gentle Side Bend",
  reps: "30s/side = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Reach one arm overhead, lean to opposite side. Stretches lateral muscles.",
},
{
  name: "Shoulder Blade Squeezes",
  reps: "10 slow = 1 round",
  weight: "bodyweight",
  time: "2 rounds",
  rest: "flow",
  description:
    "Squeeze shoulder blades together, hold 3 seconds. Resets posture after exercise.",
},
{
  name: "Savasana (Final Relaxation)",
  reps: "3-5min = 1 round",
  weight: "bodyweight",
  time: "1 round",
  rest: "flow",
  description:
    "Lie flat on back, arms at sides, palms up. Close eyes and focus on breath. Complete mental and physical relaxation.",
},
],
};

// Continue with rest of the code...
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
const targetTime = getPhaseTargetTime(phase);

const titles = {
jump: "Jump Training",
strength: "Strength Training",
sit: "Sprint Interval Training",
activation: "Activation",
power: "Power Training",
mobility: "Mobility Work",
integration: "Integration",
cooldown: "Cool Down",
};

return `${titles[phase] || phase} (${targetTime}min)`;
}

// NEW FUNCTION: Auto-collapse previous phase when opening new phase
function handlePhaseToggle(clickedPhase) {
const w = getCurrentWorkout();
const phases = w.phases;
const clickedIndex = phases.indexOf(clickedPhase);

// Check if the clicked phase is being opened (not currently open)
const isOpening = !openPhases.has(clickedPhase);

if (isOpening && clickedIndex > 0) {
// Get the previous phase
const previousPhase = phases[clickedIndex - 1];

// Check if previous phase has selected exercises
const previousHasSelections = getSelectedCount(previousPhase) > 0;

// If previous phase has selections, close it
if (previousHasSelections && openPhases.has(previousPhase)) {
  openPhases.delete(previousPhase);
}
}

// Toggle the clicked phase
if (openPhases.has(clickedPhase)) {
openPhases.delete(clickedPhase);
} else {
openPhases.add(clickedPhase);
}

updateApp();
}

// Rest of your existing functions remain the same...
const exerciseBaseTimes = {
jump: {
"Squat Jump with Landing": 3,
"Step-Up with Knee Drive": 2.5,
"Box Step Downs": 2.5,
"Broad Jump": 3.5,
"Lateral Bounds": 3,
"Tuck Jumps": 3.5,
"Depth Jumps": 3.5,
"Single Leg Hops": 3,
"Split Jump Lunges": 3,
"Jump Rope": 1.5,
"Calf Hops": 2,
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
"Modified Jump Squats": 2.5,
"Light Thrusters": 2.5,
"Fast Squats": 2,
"Burpee Intervals": 1.5,
"Mountain Climbers": 2,
"High Knees": 1.5,
"Sprint Intervals": 3,
"Complex Circuit": 3.5,
"Tabata Squats": 0.5,
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

const exerciseMaxRounds = {
jump: {
"Squat Jump with Landing": 4,
"Step-Up with Knee Drive": 4,
"Box Step Downs": 4,
"Broad Jump": 3,
"Lateral Bounds": 4,
"Tuck Jumps": 3,
"Depth Jumps": 3,
"Single Leg Hops": 4,
"Split Jump Lunges": 4,
"Jump Rope": 6,
"Calf Hops": 5,
},
strength: {
"Bodyweight Squat": 6,
"Wall Push-Ups": 5,
"Goblet Squat": 5,
"Single-Leg RDL": 4,
"Bulgarian Split Squats": 4,
"Dumbbell Row": 5,
"Heavy Goblet Squats": 4,
"Turkish Get-Up": 3,
"Overhead Press": 5,
},
power: {
"Light DB Swings": 5,
"Modified Thrusters": 6,
"DB Snatch": 4,
"DB Thruster": 5,
"Heavy DB Swings": 4,
"Medicine Ball Slams": 5,
"Power Cleans": 4,
"Heavy Snatches": 3,
"Explosive Push-Ups": 4,
},
sit: {
"Modified Jump Squats": 5,
"Light Thrusters": 5,
"Fast Squats": 6,
"Burpee Intervals": 4,
"Mountain Climbers": 5,
"High Knees": 5,
"Sprint Intervals": 4,
"Complex Circuit": 3,
"Tabata Squats": 8,
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
"Squat to Jump Complex": 3,
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
    if (exerciseCount === 1 && selectedExercises[0] === 'Tabata Squats') {
        const customKey = `${selectedWeek}-${selectedDay}-${phase}-Tabata Squats`;
        const baseRounds = customRounds[customKey] || 8;
        // Apply deload reduction if Week 4
        return { 'Tabata Squats': trainingWeek === 4 ? Math.ceil(baseRounds * 0.6) : baseRounds };
    }
    
    const timePerExercise = targetTime / exerciseCount;
    const rounds = {};
    
    selectedExercises.forEach(exerciseName => {
        const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
        
        if (customRounds[customKey] !== undefined) {
            // Use custom rounds if set, but still respect safety limits and apply deload
            const maxRounds = exerciseMaxRounds[phase]?.[exerciseName] || 6;
            const baseRounds = Math.min(customRounds[customKey], maxRounds);
            // Apply deload: reduce by 40% for Week 4
            rounds[exerciseName] = trainingWeek === 4 ? Math.ceil(baseRounds * 0.6) : baseRounds;
        } else {
            // Calculate default rounds with safety limits
            const baseTime = exerciseBaseTimes[phase]?.[exerciseName] || 2;
            const calculatedRounds = Math.max(1, Math.round(timePerExercise / baseTime));
            const maxRounds = exerciseMaxRounds[phase]?.[exerciseName] || 6;
            const baseRounds = Math.min(calculatedRounds, maxRounds);
            // Apply deload: reduce by 40% for Week 4
            rounds[exerciseName] = trainingWeek === 4 ? Math.ceil(baseRounds * 0.6) : baseRounds;
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
balanceRounds(phase, exerciseName);
} else if (action === "decrease" && current > 1) {
customRounds[customKey] = current - 1;
balanceRounds(phase, exerciseName);
}

updateApp();
}

function balanceRounds(phase, changedExercise) {
const targetTime = getPhaseTargetTime(phase);
const selectedExercises = getSelectedExercises(phase);

if (selectedExercises.length <= 1) return;

let totalTime = 0;
const rounds = {};

selectedExercises.forEach((exerciseName) => {
const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
const baseTime = exerciseBaseTimes[phase]?.[exerciseName] || 2;

if (customRounds[customKey] !== undefined) {
  rounds[exerciseName] = customRounds[customKey];
} else {
  const timePerExercise = targetTime / selectedExercises.length;
  rounds[exerciseName] = Math.max(
    1,
    Math.round(timePerExercise / baseTime)
  );
}

totalTime += baseTime * rounds[exerciseName];
});

if (totalTime > targetTime + 2) {
const otherExercises = selectedExercises.filter(
  (ex) => ex !== changedExercise
);
const excessTime = totalTime - targetTime;

let timeReduced = 0;
let exercisesToRemove = [];

for (const exerciseName of otherExercises) {
  const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
  const baseTime = exerciseBaseTimes[phase]?.[exerciseName] || 2;
  const currentRounds = rounds[exerciseName];

  if (currentRounds > 1) {
    customRounds[customKey] = currentRounds - 1;
    timeReduced += baseTime;
    totalTime -= baseTime;

    if (timeReduced >= excessTime) break;
  } else {
    exercisesToRemove.push(exerciseName);
  }
}

if (totalTime > targetTime + 2 && exercisesToRemove.length > 0) {
  showRemovalPrompt(phase, changedExercise, exercisesToRemove);
}
} else if (totalTime < targetTime - 2) {
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
                style="background: rgba(255,255,255,0.2); color: white;
