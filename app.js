const form = document.querySelector("#adventureForm");
const boroughSelect = document.querySelector("#borough");
const kingdomSelect = document.querySelector("#kingdom");
const weatherModeSelect = document.querySelector("#weatherMode");
const formPanel = document.querySelector("#formPanel");
const loadingPanel = document.querySelector("#loadingPanel");
const resultsPanel = document.querySelector("#resultsPanel");
const regenerateButton = document.querySelector("#regenerateButton");
const editButton = document.querySelector("#editButton");
const copyButton = document.querySelector("#copyButton");
const routeButton = document.querySelector("#routeButton");
const refreshMetaButton = document.querySelector("#refreshMetaButton");
const metaQuestList = document.querySelector("#metaQuestList");
const metaQuestTemplate = document.querySelector("#metaQuestTemplate");
const statusMessage = document.querySelector("#statusMessage");
const weatherNote = document.querySelector("#weatherNote");
const questSummary = document.querySelector("#questSummary");
const questTitle = document.querySelector("#questTitle");
const questDescription = document.querySelector("#questDescription");
const questClassification = document.querySelector("#questClassification");
const summaryTime = document.querySelector("#summaryTime");
const summaryBudget = document.querySelector("#summaryBudget");
const summaryRealm = document.querySelector("#summaryRealm");
const summaryKingdom = document.querySelector("#summaryKingdom");
const summaryStamina = document.querySelector("#summaryStamina");
const summaryDistance = document.querySelector("#summaryDistance");
const summaryRouteStyle = document.querySelector("#summaryRouteStyle");
const loadingPhrase = document.querySelector("#loadingPhrase");
const progressBar = document.querySelector("#progressBar");
const stopsList = document.querySelector("#itineraryStops");
const stopTemplate = document.querySelector("#stopTemplate");
const wizardQuestion = document.querySelector("#wizard-question");
const wizardStepLabel = document.querySelector("#wizardStepLabel");
const wizardProgressBar = document.querySelector("#wizardProgressBar");
const wizardFlavorText = document.querySelector("#wizardFlavorText");
const wizardCard = document.querySelector("#wizardCard");
const wizardOptions = document.querySelector("#wizardOptions");
const wizardBackButton = document.querySelector("#wizardBackButton");

let allPlaces = [];
let allMetaQuests = [];
let currentPreferences = null;
let currentItinerary = [];
let lastRelaxedReason = "";
let loadingTimer = null;
let phraseTimer = null;
let currentWizardStep = 0;
let wizardIsAnimating = false;
let pendingSwappedIndex = null;

const wizardFlavorMessages = [
  "Consulting local adventurers...",
  "Reviewing kingdom maps...",
  "Checking tavern rumors...",
  "Gathering quest supplies...",
  "Speaking with local guides..."
];

const wizardAnswers = {
  questKind: null,
  realm: null,
  kingdom: null,
  budget: null,
  timeLength: null,
  energy: null
};

const questKindConfig = {
  Romantic: {
    adventureType: "Date",
    vibes: ["romantic", "scenic"]
  },
  Adventure: {
    adventureType: "Friends",
    vibes: ["adventurous", "scenic"]
  },
  Foodie: {
    adventureType: "Friends",
    vibes: ["food-focused", "budget-friendly"]
  },
  Artsy: {
    adventureType: "Solo",
    vibes: ["artsy", "weird/quirky"]
  },
  Relaxed: {
    adventureType: "Solo",
    vibes: ["relaxed", "scenic"]
  },
  "Surprise Me": {
    adventureType: "Tourist",
    vibes: []
  }
};

const wizardSteps = [
  {
    id: "questKind",
    question: "What kind of quest are you seeking?",
    options: [
      { label: "❤️ Romantic", value: "Romantic" },
      { label: "⚔️ Adventure", value: "Adventure" },
      { label: "🍜 Foodie", value: "Foodie" },
      { label: "🎨 Artsy", value: "Artsy" },
      { label: "😌 Relaxed", value: "Relaxed" },
      { label: "🎲 Surprise Me", value: "Surprise Me" }
    ]
  },
  {
    id: "realm",
    question: "Which realm calls to you?",
    options: [
      { label: "🗽 Manhattan", value: "Manhattan" },
      { label: "🌉 Brooklyn", value: "Brooklyn" },
      { label: "🌳 Queens", value: "Queens" },
      { label: "🏟 Bronx", value: "Bronx" },
      { label: "⚓ Staten Island", value: "Staten Island" },
      { label: "🎲 Surprise Me", value: "Surprise me" }
    ]
  },
  {
    id: "kingdom",
    question: "Choose your kingdom",
    getOptions: () => [
      { label: "🗺 Any Kingdom In This Realm", value: "Any Kingdom In This Realm" },
      ...(kingdomsByRealm[wizardAnswers.realm] || []).map((kingdom) => ({
        label: kingdom,
        value: kingdom
      }))
    ]
  },
  {
    id: "budget",
    question: "How much gold can you spend?",
    options: [
      { label: "🪙 Free", value: "Free" },
      { label: "🪙🪙 Under $25", value: "Under $25" },
      { label: "🪙🪙🪙 Under $50", value: "Under $50" },
      { label: "🪙🪙🪙🪙 Under $100", value: "Under $100" },
      { label: "💰 No Limit", value: "Under $100" }
    ]
  },
  {
    id: "timeLength",
    question: "How much time do you have for this quest?",
    options: [
      { label: "⏳ 1-2 Hours", value: "1-2 hours" },
      { label: "⏳⏳ 3-4 Hours", value: "3-4 hours" },
      { label: "🕰 Half Day", value: "Half-day" },
      { label: "🌅 Full Day", value: "Full-day" }
    ]
  },
  {
    id: "energy",
    question: "What is your stamina level today?",
    options: [
      { label: "❤️ Very Chill", value: "Very chill" },
      { label: "❤️❤️ Moderate", value: "Moderate walking" },
      { label: "❤️❤️❤️ Active", value: "Lots of walking" },
      { label: "🔥 Adventure Mode", value: "Adventure mode" }
    ]
  }
];

const loadingPhrases = [
  "Polling NPCs...",
  "Mapping your route...",
  "Checking subway omens...",
  "Consulting the quest board...",
  "Gathering local rumors...",
  "Marking hidden gems...",
  "Sealing the scroll...",
  "Summoning your itinerary...",
  "Plotting snack checkpoints...",
  "Preparing your adventure..."
];

const kingdomsByRealm = {
  Queens: ["LIC", "Astoria", "Forest Hills", "Kew Gardens", "Flushing", "Jackson Heights", "Sunnyside", "Ridgewood", "Jamaica", "Rockaway"],
  Brooklyn: ["Williamsburg", "DUMBO", "Park Slope", "Brooklyn Heights", "Bushwick", "Greenpoint", "Fort Greene"],
  Manhattan: ["Lower East Side", "East Village", "West Village", "Chelsea", "Midtown", "Harlem", "SoHo", "Financial District"],
  Bronx: ["Fordham", "Belmont", "Riverdale", "Kingsbridge", "City Island"],
  "Staten Island": ["St George", "Stapleton", "Snug Harbor"]
};

// Cost levels are ranked so the generator can compare a place's cost
// against the user's selected gold limit.
const budgetOrder = {
  free: 0,
  "$": 1,
  "$$": 2,
  "$$$": 3
};

const budgetLimits = {
  "Free": 0,
  "Under $25": 1,
  "Under $50": 2,
  "Under $100": 3
};

// Each quest length maps to a loose itinerary "recipe."
// The recipe keeps the output balanced instead of picking random stops only.
const stopPlans = {
  "1-2 hours": ["foodOrCoffee", "activityOrScenic"],
  "3-4 hours": ["foodOrCoffee", "mainActivity", "scenicOrFiller"],
  "Half-day": ["foodOrCoffee", "mainActivity", "scenicOrFiller", "dessertOrMarket"],
  "Full-day": ["foodOrCoffee", "mainActivity", "scenicOrFiller", "dessertOrMarket", "bonusStop", "optionalFinale"]
};

const typeGroups = {
  foodOrCoffee: ["coffee", "food"],
  activityOrScenic: ["activity", "museum", "park", "scenic", "bookstore", "ferry"],
  mainActivity: ["activity", "museum", "show", "market", "bookstore"],
  scenicOrFiller: ["scenic", "park", "ferry", "bookstore"],
  dessertOrMarket: ["dessert", "market", "food", "coffee"],
  bonusStop: ["activity", "museum", "park", "market", "show", "ferry"],
  optionalFinale: ["scenic", "dessert", "show", "park", "food"]
};

const swapTypeGroups = {
  coffee: ["coffee", "food"],
  food: ["food", "coffee", "market"],
  scenic: ["scenic", "park", "ferry"],
  park: ["park", "scenic", "ferry"],
  ferry: ["ferry", "scenic", "park"],
  dessert: ["dessert", "food", "coffee"],
  market: ["market", "food", "coffee"],
  museum: ["museum", "activity", "bookstore"],
  activity: ["activity", "museum", "show", "bookstore"],
  bookstore: ["bookstore", "museum", "activity"],
  show: ["show", "activity", "museum"]
};

const flavorLabels = [
  "Main Quest",
  "Side Stop",
  "Snack Checkpoint",
  "Scenic Encounter",
  "Bonus Objective",
  "Final Stop"
];

const routeEndTypes = ["scenic", "dessert", "park", "ferry", "show"];
const routeStartTypes = ["coffee", "food", "market"];

const weatherRules = {
  Clear: {
    placeBoostTypes: ["park", "scenic", "ferry"],
    metaTags: ["clear-weather", "waterfront", "scenic"]
  },
  Rainy: {
    indoor: true,
    placeBoostTypes: ["museum", "bookstore", "coffee", "market", "show"],
    metaTags: ["rainy", "indoor", "museum", "cozy"]
  },
  Cold: {
    indoor: true,
    placeBoostTypes: ["coffee", "museum", "market", "food", "bookstore"],
    metaTags: ["cold", "cold-weather", "indoor", "cozy"]
  },
  Hot: {
    indoor: true,
    placeBoostTypes: ["ferry", "scenic", "park", "museum", "market"],
    metaTags: ["hot-weather", "summer", "waterfront", "indoor"]
  },
  Windy: {
    indoor: true,
    placeBoostTypes: ["museum", "coffee", "bookstore", "market", "show"],
    metaTags: ["indoor", "cozy", "museum"]
  }
};

// Load the local JSON file. This works when the app is served by a small
// local web server, which is the recommended way to run the prototype.
async function loadPlaces() {
  try {
    const response = await fetch("places.json");
    allPlaces = await response.json();
  } catch (error) {
    statusMessage.textContent = "Could not load places.json. Run the app with a small local server, then refresh.";
    console.error(error);
  }
}

async function loadMetaQuests() {
  try {
    const response = await fetch("metaQuests.json");
    allMetaQuests = await response.json();
    renderMetaQuests(getPreferences());
  } catch (error) {
    metaQuestList.innerHTML = `<p class="helper-text">Could not load metaQuests.json.</p>`;
    console.error(error);
  }
}

function getSelectedVibes() {
  return Array.from(document.querySelectorAll("#vibeChoices input:checked"))
    .map((input) => input.value);
}

function getPreferences() {
  return {
    adventureType: form.adventureType.value,
    borough: form.borough.value,
    kingdom: form.kingdom.value,
    budget: form.budget.value,
    timeLength: form.timeLength.value,
    energy: form.energy.value,
    weatherMode: form.weatherMode.value,
    vibes: getSelectedVibes(),
    noAlcohol: document.querySelector("#noAlcohol").checked,
    indoorFriendly: document.querySelector("#indoorFriendly").checked,
    lowWalking: document.querySelector("#lowWalking").checked
  };
}

// Kingdom options update when the user changes Realm.
// Matching uses Kingdom later in the recommendation score and fallback ladder.
function updateKingdomOptions() {
  const selectedRealm = boroughSelect.value;
  const kingdoms = kingdomsByRealm[selectedRealm] || [];

  kingdomSelect.innerHTML = "";
  kingdomSelect.appendChild(new Option("Any Kingdom In This Realm", "Any Kingdom In This Realm"));

  kingdoms.forEach((kingdom) => {
    kingdomSelect.appendChild(new Option(kingdom, kingdom));
  });

  kingdomSelect.disabled = selectedRealm === "Surprise me";
}

function getVisibleWizardStepIndexes() {
  return wizardSteps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step.id !== "kingdom" || wizardAnswers.realm !== "Surprise me")
    .map(({ index }) => index);
}

function getWizardStageNumber() {
  return getVisibleWizardStepIndexes().indexOf(currentWizardStep) + 1;
}

function getWizardOptions(step) {
  return step.getOptions ? step.getOptions() : step.options;
}

function getRandomWizardFlavor() {
  return wizardFlavorMessages[Math.floor(Math.random() * wizardFlavorMessages.length)];
}

function updateVibeControls(vibes) {
  document.querySelectorAll("#vibeChoices input").forEach((input) => {
    input.checked = vibes.includes(input.value);
  });
}

function syncWizardAnswerToControls(stepId, value) {
  wizardAnswers[stepId] = value;

  if (stepId === "questKind") {
    const config = questKindConfig[value];
    form.adventureType.value = config.adventureType;
    updateVibeControls(config.vibes);
  }

  if (stepId === "realm") {
    form.borough.value = value;
    updateKingdomOptions();
    if (value === "Surprise me") {
      wizardAnswers.kingdom = "Any Kingdom In This Realm";
    }
  }

  if (stepId === "kingdom") {
    form.kingdom.value = value;
  }

  if (stepId === "budget") {
    form.budget.value = value;
  }

  if (stepId === "timeLength") {
    form.timeLength.value = value;
  }

  if (stepId === "energy") {
    form.energy.value = value;
  }

  renderMetaQuests(getPreferences());
}

function getNextWizardStepIndex() {
  const visibleSteps = getVisibleWizardStepIndexes();
  const stageIndex = visibleSteps.indexOf(currentWizardStep);
  return visibleSteps[stageIndex + 1];
}

function getPreviousWizardStepIndex() {
  const visibleSteps = getVisibleWizardStepIndexes();
  const stageIndex = visibleSteps.indexOf(currentWizardStep);
  return visibleSteps[stageIndex - 1];
}

function renderWizardStep() {
  if (!wizardQuestion || !wizardOptions) return;

  const step = wizardSteps[currentWizardStep];
  const visibleSteps = getVisibleWizardStepIndexes();
  const stageNumber = getWizardStageNumber();
  const progress = (stageNumber / visibleSteps.length) * 100;

  wizardQuestion.textContent = step.question;
  wizardStepLabel.textContent = `Stage ${stageNumber} of ${visibleSteps.length}`;
  wizardProgressBar.style.width = `${progress}%`;
  wizardFlavorText.textContent = getRandomWizardFlavor();
  wizardBackButton.disabled = getPreviousWizardStepIndex() === undefined;
  wizardOptions.innerHTML = "";

  getWizardOptions(step).forEach((option) => {
    const button = document.createElement("button");
    const isSelected = wizardAnswers[step.id] === option.value;
    button.type = "button";
    button.className = isSelected ? "wizard-option is-selected" : "wizard-option";
    button.textContent = option.label;
    button.addEventListener("click", () => handleWizardAnswer(step, option.value));
    wizardOptions.appendChild(button);
  });
}

function animateWizardTransition(callback) {
  wizardIsAnimating = true;
  wizardCard.classList.add("is-exiting");

  setTimeout(() => {
    callback();
    wizardCard.classList.remove("is-exiting");
    wizardCard.classList.add("is-entering");

    setTimeout(() => {
      wizardCard.classList.remove("is-entering");
      wizardIsAnimating = false;
    }, 260);
  }, 180);
}

function handleWizardAnswer(step, value) {
  if (wizardIsAnimating) return;

  syncWizardAnswerToControls(step.id, value);
  const nextStepIndex = getNextWizardStepIndex();

  if (nextStepIndex === undefined) {
    startQuestGeneration(getPreferences());
    return;
  }

  animateWizardTransition(() => {
    currentWizardStep = nextStepIndex;
    renderWizardStep();
  });
}

function goBackWizardStep() {
  if (wizardIsAnimating) return;

  const previousStepIndex = getPreviousWizardStepIndex();
  if (previousStepIndex === undefined) return;

  animateWizardTransition(() => {
    currentWizardStep = previousStepIndex;
    renderWizardStep();
  });
}

function getMatchingMetaQuests(preferences) {
  return allMetaQuests
    .filter((metaQuest) => !isExpiredMetaQuest(metaQuest))
    .filter((metaQuest) => preferences.borough === "Surprise me" || metaQuest.realm === preferences.borough)
    .filter((metaQuest) => !hasSpecificKingdom(preferences) || metaQuest.kingdom === preferences.kingdom)
    .filter((metaQuest) => preferences.vibes.length === 0 || metaQuest.vibes.some((vibe) => preferences.vibes.includes(vibe)))
    .sort((a, b) => getMetaQuestScore(b, preferences) - getMetaQuestScore(a, preferences))
    .slice(0, 4);
}

function renderMetaQuests(preferences) {
  if (!metaQuestList) return;

  const matchingMetaQuests = getMatchingMetaQuests(preferences);
  metaQuestList.innerHTML = "";

  if (matchingMetaQuests.length === 0) {
    metaQuestList.innerHTML = `<p class="helper-text">No legendary quests match yet. Try Surprise me, Any Kingdom, or broader vibes.</p>`;
    return;
  }

  matchingMetaQuests.forEach((metaQuest) => {
    const card = metaQuestTemplate.content.cloneNode(true);
    const status = metaQuest.limitedTime && isDateInWindow(metaQuest)
      ? "Timed Encounter"
      : metaQuest.eventFocus ? "Event Focus" : "Curated";

    card.querySelector(".meta-status").textContent = status;
    card.querySelector("h3").textContent = metaQuest.title;
    card.querySelector(".meta-location").textContent = `${metaQuest.kingdom}, ${metaQuest.realm} | ${metaQuest.estimatedDuration} | ${metaQuest.estimatedBudget}`;
    card.querySelector(".meta-description").textContent = metaQuest.description;
    card.querySelector(".meta-review").textContent = `${metaQuest.rating.toFixed(1)} ★ · ${metaQuest.reviewCount} traveler reports · "${metaQuest.reviewHighlight}"`;

    const tagWrap = card.querySelector(".meta-tags");
    metaQuest.tags.slice(0, 5).forEach((tag) => {
      const tagEl = document.createElement("span");
      tagEl.textContent = tag;
      tagWrap.appendChild(tagEl);
    });

    card.querySelector(".use-meta-button").addEventListener("click", () => useMetaQuest(metaQuest));
    metaQuestList.appendChild(card);
  });
}

// Hard filters are things the user explicitly asked for, so they stay strict
// even when the generator loosens vibe or budget matching later.
function placeMatchesHardFilters(place, preferences) {
  const noAlcoholMatches = !preferences.noAlcohol || place.alcoholFree;
  const indoorMatches = !preferences.indoorFriendly || place.indoorOutdoor === "indoor" || place.indoorOutdoor === "both";
  const lowWalkingMatches = !preferences.lowWalking || place.lowWalking;

  return noAlcoholMatches && indoorMatches && lowWalkingMatches;
}

function placeMatchesBudget(place, preferences) {
  return budgetOrder[place.costLevel] <= budgetLimits[preferences.budget];
}

function placeMatchesVibes(place, preferences) {
  return preferences.vibes.length === 0 || preferences.vibes.some((vibe) => place.vibes.includes(vibe));
}

function getVibeMatchCount(place, preferences) {
  return place.vibes.filter((vibe) => preferences.vibes.includes(vibe)).length;
}

function getWeatherScore(place, preferences) {
  const rules = weatherRules[preferences.weatherMode] || weatherRules.Clear;
  let score = 0;

  if (rules.indoor && (place.indoorOutdoor === "indoor" || place.indoorOutdoor === "both")) score += 2.5;
  if (rules.placeBoostTypes.includes(place.type)) score += 2;
  if (preferences.weatherMode === "Clear" && (place.indoorOutdoor === "outdoor" || place.indoorOutdoor === "both")) score += 1.5;
  if (preferences.weatherMode === "Hot" && place.vibes.includes("scenic")) score += 0.8;
  if (preferences.weatherMode === "Rainy" && place.indoorOutdoor === "outdoor") score -= 2.5;
  if (preferences.weatherMode === "Cold" && place.indoorOutdoor === "outdoor") score -= 1.7;
  if (preferences.weatherMode === "Windy" && place.type === "ferry") score -= 1.5;

  return score;
}

function isDateInWindow(metaQuest) {
  if (!metaQuest.limitedTime || !metaQuest.startDate || !metaQuest.endDate) return true;

  const today = new Date();
  const start = new Date(`${metaQuest.startDate}T00:00:00`);
  const end = new Date(`${metaQuest.endDate}T23:59:59`);
  return today >= start && today <= end;
}

function isExpiredMetaQuest(metaQuest) {
  if (!metaQuest.limitedTime || !metaQuest.endDate) return false;
  return new Date() > new Date(`${metaQuest.endDate}T23:59:59`);
}

function getMetaQuestWeatherScore(metaQuest, preferences) {
  const rules = weatherRules[preferences.weatherMode] || weatherRules.Clear;
  return metaQuest.tags.filter((tag) => rules.metaTags.includes(tag)).length * 2;
}

function getMetaQuestScore(metaQuest, preferences) {
  let score = metaQuest.rating * 10 + Math.min(metaQuest.reviewCount, 50) * 0.25;
  if (preferences.borough === "Surprise me" || metaQuest.realm === preferences.borough) score += 10;
  if (hasSpecificKingdom(preferences) && metaQuest.kingdom === preferences.kingdom) score += 12;
  if (!hasSpecificKingdom(preferences) && preferences.borough !== "Surprise me" && metaQuest.realm === preferences.borough) score += 4;
  score += metaQuest.vibes.filter((vibe) => preferences.vibes.includes(vibe)).length * 3;
  score += getMetaQuestWeatherScore(metaQuest, preferences);
  if (metaQuest.eventFocus) score += 2;
  if (metaQuest.limitedTime && isDateInWindow(metaQuest)) score += 7;
  if (metaQuest.staminaLevel === preferences.energy) score += 1.5;
  if (metaQuest.estimatedBudget === preferences.budget) score += 1.5;
  return score;
}

function hasSpecificKingdom(preferences) {
  return preferences.borough !== "Surprise me" && preferences.kingdom !== "Any Kingdom In This Realm";
}

function getMatchRank(place, preferences) {
  if (hasSpecificKingdom(preferences)) {
    if (place.kingdom === preferences.kingdom) return "local";
    if ((place.nearbyKingdoms || []).includes(preferences.kingdom)) return "nearby";
    if (place.borough === preferences.borough) return "realm";
    return "cross";
  }

  if (preferences.borough !== "Surprise me" && place.borough === preferences.borough) return "realm";
  return "cross";
}

function placeMatchesLocationScope(place, preferences, scope) {
  const rank = getMatchRank(place, preferences);
  if (scope === "local") return rank === "local";
  if (scope === "nearby") return rank === "nearby";
  if (scope === "realm") return rank === "realm";
  return true;
}

function getLocationScopes(preferences) {
  if (hasSpecificKingdom(preferences)) {
    return ["local", "nearby", "realm", "cross"];
  }

  if (preferences.borough !== "Surprise me") {
    return ["realm", "cross"];
  }

  return ["cross"];
}

function getMatchQualityLabel(place, preferences) {
  const labels = {
    local: "Local Match",
    nearby: "Nearby Match",
    realm: "Realm Match",
    cross: "Cross-Realm Match"
  };

  return labels[getMatchRank(place, preferences)];
}

// Component-based scoring keeps recommendation quality easier to understand.
function scorePlace(place, preferences, targetTypes, usedTypes, usedIds, selectedStops = []) {
  let score = Math.random() * 0.2;
  const matchRank = getMatchRank(place, preferences);
  const locationScores = {
    local: 12,
    nearby: 8,
    realm: 5,
    cross: 1
  };

  score += locationScores[matchRank];
  score += targetTypes.includes(place.type) ? 7 : -4;
  score += getVibeMatchCount(place, preferences) * 2.2;
  score += placeMatchesBudget(place, preferences) ? 3 : -2;
  score += getWeatherScore(place, preferences);
  score += !usedTypes.has(place.type) ? 1.1 : 0;
  score += preferences.indoorFriendly && (place.indoorOutdoor === "indoor" || place.indoorOutdoor === "both") ? 2 : 0;
  score += preferences.lowWalking && place.lowWalking ? 3 : 0;
  if (place.vibes.includes("budget-friendly") && preferences.budget !== "Under $100") score += 0.8;
  if (place.vibes.includes("relaxed") && preferences.energy === "Very chill") score += 0.8;
  if (place.vibes.includes("adventurous") && preferences.energy === "Adventure mode") score += 0.8;
  if (selectedStops.length > 0) {
    const nearestDistance = Math.min(...selectedStops.map((selectedStop) => getDistanceMiles(place, selectedStop)));
    const distanceWeight = preferences.lowWalking || preferences.energy === "Very chill" ? 3.2 : preferences.energy === "Adventure mode" ? 0.9 : 1.7;
    score -= nearestDistance * distanceWeight;
  }
  if (usedIds.has(place.id)) score -= 100;

  return score;
}

function getCandidatePool(preferences, options = {}) {
  const { relaxVibes = false, relaxBudget = false, locationScope = "cross" } = options;

  return allPlaces.filter((place) => {
    const hardFiltersMatch = placeMatchesHardFilters(place, preferences);
    const locationMatches = placeMatchesLocationScope(place, preferences, locationScope);
    const budgetMatches = relaxBudget || placeMatchesBudget(place, preferences);
    const vibeMatches = relaxVibes || placeMatchesVibes(place, preferences);

    return hardFiltersMatch && locationMatches && budgetMatches && vibeMatches;
  });
}

// Try exact matches first. If there are not enough, loosen the vibe filter,
// then the budget filter, and remember that so the UI can explain it.
function pickStop(targetTypes, preferences, usedIds, usedTypes, selectedStops = []) {
  const locationScopes = getLocationScopes(preferences);
  const searchPasses = [
    { relaxVibes: false, relaxBudget: false, reason: "" },
    { relaxVibes: true, relaxBudget: false, reason: "best available match: loosened quest vibe matching" },
    { relaxVibes: true, relaxBudget: true, reason: "best available match: loosened quest vibe and gold limit matching" }
  ];

  for (const scope of locationScopes) {
    for (const pass of searchPasses) {
      const candidates = getCandidatePool(preferences, { ...pass, locationScope: scope })
        .filter((place) => targetTypes.includes(place.type) && !usedIds.has(place.id))
        .sort((a, b) => scorePlace(b, preferences, targetTypes, usedTypes, usedIds, selectedStops) - scorePlace(a, preferences, targetTypes, usedTypes, usedIds, selectedStops));

      if (candidates.length > 0) {
        if (scope !== locationScopes[0] || pass.reason) {
          lastRelaxedReason = describeFallback(scope, pass.reason, preferences);
        }
        return candidates[0];
      }
    }
  }

  const fallbackCandidates = getCandidatePool(preferences, { relaxVibes: true, relaxBudget: true, locationScope: "cross" })
    .filter((place) => !usedIds.has(place.id))
    .sort((a, b) => scorePlace(b, preferences, targetTypes, usedTypes, usedIds, selectedStops) - scorePlace(a, preferences, targetTypes, usedTypes, usedIds, selectedStops));

  if (fallbackCandidates.length > 0) {
    lastRelaxedReason = "best available match: used a nearby encounter type because exact quest slots were limited";
    return fallbackCandidates[0];
  }

  return null;
}

function describeFallback(scope, passReason, preferences) {
  const scopeNotes = {
    local: "used exact kingdom matches",
    nearby: "expanded to a nearby kingdom",
    realm: "expanded to the same realm",
    cross: "expanded NYC-wide"
  };

  const scopeNote = hasSpecificKingdom(preferences) || preferences.borough !== "Surprise me" ? scopeNotes[scope] : "";
  return ["best available match", scopeNote, passReason.replace("best available match: ", "")]
    .filter(Boolean)
    .join(": ");
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Haversine distance in miles between two latitude/longitude points.
function getDistanceMiles(firstPlace, secondPlace) {
  const earthRadiusMiles = 3958.8;
  const latDifference = toRadians(secondPlace.latitude - firstPlace.latitude);
  const lngDifference = toRadians(secondPlace.longitude - firstPlace.longitude);
  const firstLat = toRadians(firstPlace.latitude);
  const secondLat = toRadians(secondPlace.latitude);
  const a = Math.sin(latDifference / 2) ** 2
    + Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(lngDifference / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

function routeDistanceMiles(stops) {
  return stops.reduce((total, stop, index) => {
    if (index === 0) return 0;
    return total + getDistanceMiles(stops[index - 1], stop);
  }, 0);
}

function routeQualityLabel(distanceMiles) {
  if (distanceMiles < 1.5) return "Compact Quest";
  if (distanceMiles <= 3.5) return "Moderate Trek";
  return "Sprawling Adventure";
}

function distanceText(distanceMiles) {
  return `~${distanceMiles.toFixed(1)} miles`;
}

function getRouteDistanceWeight(preferences) {
  if (preferences.lowWalking || preferences.energy === "Very chill") return 5;
  if (preferences.energy === "Adventure mode") return 1.8;
  return 3;
}

function chooseRouteStart(stops) {
  return [...stops].sort((a, b) => {
    const aStart = routeStartTypes.includes(a.type) ? 0 : 1;
    const bStart = routeStartTypes.includes(b.type) ? 0 : 1;
    return aStart - bStart;
  })[0];
}

function routeOrderScore(currentStop, candidate, remainingCount, preferences) {
  const distancePenalty = getDistanceMiles(currentStop, candidate) * getRouteDistanceWeight(preferences);
  const endPenalty = routeEndTypes.includes(candidate.type) && remainingCount > 1 ? 1.8 : 0;
  const startPenalty = routeStartTypes.includes(candidate.type) && remainingCount <= 1 ? 1.2 : 0;
  const localBonus = getMatchRank(candidate, preferences) === "local" && (preferences.lowWalking || preferences.energy === "Very chill") ? -1.4 : 0;

  return distancePenalty + endPenalty + startPenalty + localBonus;
}

function orderStopsForRoute(stops, preferences) {
  if (stops.length <= 2) return [...stops];

  const remaining = [...stops];
  const ordered = [];
  const start = chooseRouteStart(remaining);
  ordered.push(start);
  remaining.splice(remaining.findIndex((stop) => stop.id === start.id), 1);

  while (remaining.length > 0) {
    const currentStop = ordered[ordered.length - 1];
    const nextStop = [...remaining].sort((a, b) => {
      return routeOrderScore(currentStop, a, remaining.length, preferences)
        - routeOrderScore(currentStop, b, remaining.length, preferences);
    })[0];

    ordered.push(nextStop);
    remaining.splice(remaining.findIndex((stop) => stop.id === nextStop.id), 1);
  }

  const lastIndex = ordered.length - 1;
  const scenicEndIndex = ordered.findIndex((stop, index) => index > 0 && routeEndTypes.includes(stop.type));
  if (scenicEndIndex > -1 && scenicEndIndex !== lastIndex) {
    const [endStop] = ordered.splice(scenicEndIndex, 1);
    ordered.push(endStop);
  }

  return ordered;
}

function getStopsForMetaQuest(metaQuest) {
  return metaQuest.stops
    .map((stopName) => allPlaces.find((place) => place.name === stopName))
    .filter(Boolean);
}

function useMetaQuest(metaQuest) {
  const metaStops = getStopsForMetaQuest(metaQuest);
  if (metaStops.length === 0) {
    statusMessage.textContent = "This Meta Quest could not find its local stop data.";
    return;
  }

  currentPreferences = {
    ...getPreferences(),
    adventureType: "Meta Quest",
    borough: metaQuest.realm,
    kingdom: metaQuest.kingdom,
    budget: metaQuest.estimatedBudget,
    timeLength: metaQuest.estimatedDuration,
    energy: metaQuest.staminaLevel,
    vibes: metaQuest.vibes
  };
  currentItinerary = orderStopsForRoute(metaStops, currentPreferences);
  lastRelaxedReason = "";
  formPanel.hidden = true;
  loadingPanel.hidden = true;
  loadingPanel.classList.remove("is-active");
  resultsPanel.hidden = false;
  resultsPanel.classList.add("is-revealed");
  renderItinerary(currentItinerary, currentPreferences, metaQuest);
  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildGoogleMapsRouteUrl(stops) {
  if (stops.length === 0) return "https://www.google.com/maps";

  const origin = `${stops[0].latitude},${stops[0].longitude}`;
  const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
  const middleStops = stops.slice(1, -1).map((stop) => `${stop.latitude},${stop.longitude}`);
  const waypointText = middleStops.length ? `&waypoints=${encodeURIComponent(middleStops.join("|"))}` : "";

  return `https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypointText}`;
}

// Build the final quest by walking through the recipe for the chosen length.
function buildItinerary(preferences) {
  const plan = stopPlans[preferences.timeLength];
  const usedIds = new Set();
  const usedTypes = new Set();
  const selectedStops = [];
  lastRelaxedReason = "";

  plan.forEach((planPart) => {
    const stop = pickStop(typeGroups[planPart], preferences, usedIds, usedTypes, selectedStops);
    if (stop) {
      selectedStops.push(stop);
      usedIds.add(stop.id);
      usedTypes.add(stop.type);
    }
  });

  currentItinerary = orderStopsForRoute(selectedStops, preferences);
  renderItinerary(currentItinerary, preferences);
}

// The loading panel gives the app a curated, RPG-style step between setup and results.
function startQuestGeneration(preferences) {
  clearLoadingTimers();
  currentPreferences = preferences;
  formPanel.hidden = true;
  resultsPanel.hidden = true;
  loadingPanel.hidden = false;
  loadingPanel.classList.add("is-active");
  loadingPhrase.textContent = loadingPhrases[0];
  progressBar.style.width = "0%";

  let phraseIndex = 0;
  let progress = 0;
  phraseTimer = setInterval(() => {
    phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
    progress = Math.min(progress + 14, 92);
    loadingPhrase.textContent = loadingPhrases[phraseIndex];
    progressBar.style.width = `${progress}%`;
  }, 360);

  loadingTimer = setTimeout(() => {
    clearLoadingTimers();
    progressBar.style.width = "100%";
    buildItinerary(preferences);
    loadingPanel.hidden = true;
    loadingPanel.classList.remove("is-active");
    resultsPanel.hidden = false;
    resultsPanel.classList.add("is-revealed");
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 3100);
}

function clearLoadingTimers() {
  clearTimeout(loadingTimer);
  clearInterval(phraseTimer);
}

function makeQuestTitle(preferences) {
  const vibe = preferences.vibes[0] ? titleCase(preferences.vibes[0].replace("/", " / ")) : "Wildcard";
  const realm = hasSpecificKingdom(preferences)
    ? preferences.kingdom
    : preferences.borough === "Surprise me" ? "Five Borough" : preferences.borough;
  return `${realm} ${vibe} SideQuest`;
}

function makeQuestDescription(stops, preferences) {
  const typeSet = new Set(stops.map((stop) => stop.type));
  const mood = preferences.energy === "Very chill" ? "relaxed" : preferences.energy === "Adventure mode" ? "high-energy" : "easygoing";
  const placeText = hasSpecificKingdom(preferences)
    ? preferences.kingdom
    : preferences.borough === "Surprise me" ? "NYC" : preferences.borough;
  const routePieces = [];

  if (typeSet.has("coffee")) routePieces.push("coffee");
  if (typeSet.has("food") || typeSet.has("market")) routePieces.push("good bites");
  if (typeSet.has("museum") || typeSet.has("bookstore") || typeSet.has("show")) routePieces.push("culture");
  if (typeSet.has("park") || typeSet.has("scenic") || typeSet.has("ferry")) routePieces.push("scenic moments");
  if (typeSet.has("dessert")) routePieces.push("a sweet finish");

  const detailText = routePieces.length
    ? routePieces.slice(0, 3).join(", ")
    : "local stops";

  return `A ${mood} ${placeText} quest with ${detailText}.`;
}

function getQuestClassification(stops, preferences) {
  if (stops.length === 0) return "";

  const ranks = stops.map((stop) => getMatchRank(stop, preferences));
  if (hasSpecificKingdom(preferences) && ranks.every((rank) => rank === "local")) {
    return "Local Kingdom Quest";
  }
  if (hasSpecificKingdom(preferences) && ranks.every((rank) => rank === "local" || rank === "nearby")) {
    return "Nearby Kingdom Quest";
  }
  if (preferences.borough !== "Surprise me" && ranks.every((rank) => rank !== "cross")) {
    return "Realm-Wide Quest";
  }
  return "Cross-Realm Quest";
}

function estimateBudget(stops) {
  const highestCost = stops.reduce((highest, stop) => Math.max(highest, budgetOrder[stop.costLevel]), 0);
  const labels = ["Free", "Low", "Moderate", "Splurge"];
  return labels[highestCost] || "Varies";
}

function formatTags(tags) {
  return tags
    .slice(0, 4)
    .map((tag) => tag.replace("/", " / "))
    .join(" | ");
}

function formatReviewCount(count) {
  if (!count && count !== 0) return "";
  return Number(count).toLocaleString();
}

// Rarity is presentation-only: it gives each stop a game-like encounter frame
// without changing how locations are scored or selected.
function getEncounterRarity(stop, preferences) {
  const matchRank = getMatchRank(stop, preferences);
  const rating = stop.googleRating || 0;

  if (rating >= 4.8 && matchRank === "local") return "Legendary";
  if (rating >= 4.6 || matchRank === "local") return "Rare";
  if (rating >= 4.3 || matchRank === "nearby") return "Uncommon";
  return "Common";
}

function formatTodaysHours(hoursNote) {
  if (!hoursNote) return "Today: Check current hours before going";

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = dayNames[new Date().getDay()];
  const segments = hoursNote
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const todaySegment = segments.find((segment) => segment.toLowerCase().startsWith(`${today.toLowerCase()}:`));

  if (todaySegment) {
    const todayHours = todaySegment.replace(/^[^:]+:\s*/, "").trim();
    if (!todayHours) return "Today: Check current hours before going";
    if (/closed/i.test(todayHours)) return "Closed Today";
    return `Open Today: ${todayHours}`;
  }

  if (/closed/i.test(hoursNote) && !/open/i.test(hoursNote)) return "Closed Today";
  return "Today: Check current hours before going";
}

function renderStopPhoto(photoElement, stop) {
  if (stop.photoUrl) {
    photoElement.classList.remove("placeholder");
    photoElement.style.backgroundImage = `linear-gradient(180deg, transparent, rgba(7, 11, 22, 0.34)), url("${stop.photoUrl}")`;
    return;
  }

  photoElement.classList.add("placeholder");
  photoElement.style.backgroundImage = "";
}

function renderLocalTips(listElement, tips = []) {
  listElement.innerHTML = "";
  tips.slice(0, 3).forEach((tip) => {
    const item = document.createElement("li");
    item.textContent = tip;
    listElement.appendChild(item);
  });
}

// Render quest cards from the HTML template in index.html.
function renderItinerary(stops, preferences, metaQuest = null) {
  stopsList.innerHTML = "";
  questSummary.hidden = stops.length === 0;
  copyButton.disabled = stops.length === 0;
  routeButton.hidden = stops.length < 2;
  weatherNote.hidden = preferences.weatherMode === "Clear";

  if (stops.length === 0) {
    statusMessage.textContent = "No matching encounters found. Try Surprise me, a larger gold limit, or fewer optional charms.";
    questSummary.hidden = true;
    return;
  }

  const totalMinutes = stops.reduce((sum, stop) => sum + stop.durationMinutes, 0);
  const totalRouteDistance = routeDistanceMiles(stops);
  statusMessage.textContent = metaQuest
    ? `Legendary Meta Quest selected: ${metaQuest.title}.`
    : lastRelaxedReason
      ? `Quest generated. Note: ${lastRelaxedReason}.`
      : "Quest generated with your selected filters.";

  questTitle.textContent = metaQuest ? metaQuest.title : makeQuestTitle(preferences);
  questClassification.textContent = getQuestClassification(stops, preferences);
  questDescription.textContent = metaQuest ? metaQuest.description : makeQuestDescription(stops, preferences);
  summaryTime.textContent = formatDuration(totalMinutes);
  summaryBudget.textContent = estimateBudget(stops);
  summaryRealm.textContent = preferences.borough;
  summaryKingdom.textContent = hasSpecificKingdom(preferences) ? preferences.kingdom : "Any Kingdom";
  summaryStamina.textContent = preferences.energy;
  summaryDistance.textContent = distanceText(totalRouteDistance);
  summaryRouteStyle.textContent = routeQualityLabel(totalRouteDistance);
  routeButton.href = buildGoogleMapsRouteUrl(stops);

  stops.forEach((stop, index) => {
    const card = stopTemplate.content.cloneNode(true);
    const cardElement = card.querySelector(".stop-card");
    cardElement.style.setProperty("--reveal-delay", `${index * 90}ms`);
    if (pendingSwappedIndex === index) cardElement.classList.add("is-swapped");
    const rarity = getEncounterRarity(stop, preferences);
    cardElement.dataset.rarity = rarity.toLowerCase();
    renderStopPhoto(card.querySelector(".stop-photo"), stop);
    card.querySelector(".stop-number").textContent = `Stop ${index + 1}`;
    card.querySelector(".flavor-label").textContent = getFlavorLabel(stop, index, stops.length);
    card.querySelector(".rarity-label").textContent = rarity;
    card.querySelector(".stop-type").textContent = stop.type;
    card.querySelector(".match-quality").textContent = getMatchQualityLabel(stop, preferences);
    card.querySelector("h3").textContent = stop.name;
    card.querySelector(".stop-location").textContent = `Kingdom: ${stop.kingdom} | Realm: ${stop.borough}`;
    card.querySelector(".place-rating").textContent = stop.googleRating
      ? `${stop.googleRating.toFixed(1)} ★ · ${formatReviewCount(stop.googleReviewCount)} reviews`
      : "";
    card.querySelector(".stop-description").textContent = formatTags(stop.vibes);
    card.querySelector(".place-address").textContent = stop.address || "";
    card.querySelector(".place-hours").textContent = formatTodaysHours(stop.hoursNote);
    renderLocalTips(card.querySelector(".local-tips"), stop.localTips);
    card.querySelector(".stop-duration").textContent = formatDuration(stop.durationMinutes);
    card.querySelector(".stop-cost").textContent = costLabel(stop.costLevel);
    card.querySelector(".stop-leg").textContent = index === 0
      ? "Start"
      : distanceText(getDistanceMiles(stops[index - 1], stop));
    const mapsLink = card.querySelector(".maps-link");
    mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.mapsQuery)}`;

    const swapButton = card.querySelector(".swap-button");
    swapButton.addEventListener("click", () => swapStop(index));

    stopsList.appendChild(card);
  });

  pendingSwappedIndex = null;
}

function getFlavorLabel(stop, index, totalStops) {
  if (index === 0) return "Main Quest";
  if (index === totalStops - 1) return "Final Stop";
  if (["coffee", "food", "dessert", "market"].includes(stop.type)) return "Snack Checkpoint";
  if (["park", "scenic", "ferry"].includes(stop.type)) return "Scenic Encounter";
  return flavorLabels[index] || "Side Stop";
}

function getSwapTargetTypes(oldStop) {
  return swapTypeGroups[oldStop.type] || [oldStop.type];
}

function scoreSwapCandidate(candidate, oldStop, preferences, targetTypes, usedIds, otherStops) {
  let score = scorePlace(candidate, preferences, targetTypes, new Set(), usedIds, otherStops);
  if (candidate.type === oldStop.type) score += 4;
  if (candidate.kingdom === oldStop.kingdom) score += 3;
  if ((candidate.nearbyKingdoms || []).includes(oldStop.kingdom)) score += 1.5;

  return score;
}

function findSwapReplacement(oldStop, index) {
  const targetTypes = getSwapTargetTypes(oldStop);
  const usedIds = new Set(currentItinerary.map((stop, stopIndex) => stopIndex === index ? null : stop.id));
  usedIds.delete(null);
  const otherStops = currentItinerary.filter((stop, stopIndex) => stopIndex !== index);
  const searchPasses = [
    { relaxVibes: false, relaxBudget: false },
    { relaxVibes: true, relaxBudget: false },
    { relaxVibes: true, relaxBudget: true }
  ];

  for (const scope of getLocationScopes(currentPreferences)) {
    for (const pass of searchPasses) {
      const candidates = getCandidatePool(currentPreferences, { ...pass, locationScope: scope })
        .filter((place) => targetTypes.includes(place.type))
        .filter((place) => place.id !== oldStop.id && !usedIds.has(place.id))
        .sort((a, b) => scoreSwapCandidate(b, oldStop, currentPreferences, targetTypes, usedIds, otherStops)
          - scoreSwapCandidate(a, oldStop, currentPreferences, targetTypes, usedIds, otherStops));

      if (candidates.length > 0) return candidates[0];
    }
  }

  return null;
}

// Swap replaces only the clicked stop. It preserves the stop role when possible
// and uses the same local-to-citywide location priority as generation.
function swapStop(index) {
  if (!currentPreferences || currentItinerary.length === 0) return;

  const oldStop = currentItinerary[index];
  const replacement = findSwapReplacement(oldStop, index);

  if (!replacement) {
    statusMessage.textContent = "No alternate encounter found with the current filters. Try rerolling with broader preferences.";
    return;
  }

  currentItinerary[index] = replacement;
  pendingSwappedIndex = index;
  renderItinerary(currentItinerary, currentPreferences);
}

function showForm() {
  clearLoadingTimers();
  loadingPanel.hidden = true;
  loadingPanel.classList.remove("is-active");
  resultsPanel.hidden = true;
  resultsPanel.classList.remove("is-revealed");
  formPanel.hidden = false;
  currentWizardStep = 0;
  renderWizardStep();
  formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setupPressFeedback() {
  const pressableSelector = "button, .maps-link";
  document.addEventListener("pointerdown", (event) => {
    const pressable = event.target.closest(pressableSelector);
    if (!pressable || pressable.disabled) return;
    pressable.classList.add("is-pressed");
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      const pressable = event.target.closest(pressableSelector);
      if (!pressable) return;
      pressable.classList.remove("is-pressed");
    });
  });
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const leftoverMinutes = minutes % 60;
  return leftoverMinutes ? `${hours} hr ${leftoverMinutes} min` : `${hours} hr`;
}

function costLabel(costLevel) {
  const labels = {
    free: "Free",
    "$": "$",
    "$$": "$$",
    "$$$": "$$$"
  };

  return labels[costLevel] || costLevel;
}

function titleCase(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Copy a plain-text quest scroll that is easy to paste into notes or messages.
function copyItineraryText() {
  if (!currentItinerary.length || !currentPreferences) return;

  const lines = [
    `SideQuest NYC: ${makeQuestTitle(currentPreferences)}`,
    `${getQuestClassification(currentItinerary, currentPreferences)} | ${currentPreferences.adventureType} | ${currentPreferences.borough} | ${currentPreferences.kingdom} | ${currentPreferences.timeLength} | ${currentPreferences.budget}`,
    `Weather Mode: ${currentPreferences.weatherMode}`,
    `Route: ${distanceText(routeDistanceMiles(currentItinerary))} | ${routeQualityLabel(routeDistanceMiles(currentItinerary))}`,
    `Open Quest Route: ${buildGoogleMapsRouteUrl(currentItinerary)}`,
    "",
    ...currentItinerary.map((stop, index) => {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.mapsQuery)}`;
      return `${index + 1}. ${stop.name} (${stop.neighborhood}, ${stop.borough})
Type: ${stop.type}
Match: ${getMatchQualityLabel(stop, currentPreferences)}
Tags: ${formatTags(stop.vibes)}
Rating: ${stop.googleRating ? `${stop.googleRating.toFixed(1)} stars (${formatReviewCount(stop.googleReviewCount)} reviews)` : "Not available"}
Address: ${stop.address || "Not available"}
Hours: ${formatTodaysHours(stop.hoursNote)}
Local tips: ${(stop.localTips || []).join("; ") || "None listed"}
Google Place ID: ${stop.googlePlaceId || "Not enriched yet"}
Next Leg: ${index === 0 ? "Start" : distanceText(getDistanceMiles(currentItinerary[index - 1], stop))}
Duration: ${formatDuration(stop.durationMinutes)}
Cost: ${costLabel(stop.costLevel)}
Maps: ${mapsUrl}`;
    })
  ];

  navigator.clipboard.writeText(lines.join("\n\n")).then(() => {
    copyButton.textContent = "Copied!";
    setTimeout(() => {
      copyButton.textContent = "Copy Quest Scroll";
    }, 1400);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  startQuestGeneration(getPreferences());
});

form.addEventListener("change", () => {
  renderMetaQuests(getPreferences());
});

regenerateButton.addEventListener("click", () => {
  startQuestGeneration(getPreferences());
});

editButton.addEventListener("click", showForm);
copyButton.addEventListener("click", copyItineraryText);
refreshMetaButton.addEventListener("click", () => renderMetaQuests(getPreferences()));
boroughSelect.addEventListener("change", () => {
  updateKingdomOptions();
  renderMetaQuests(getPreferences());
});
wizardBackButton.addEventListener("click", goBackWizardStep);
copyButton.disabled = true;

updateKingdomOptions();
renderWizardStep();
setupPressFeedback();
loadPlaces();
loadMetaQuests();

