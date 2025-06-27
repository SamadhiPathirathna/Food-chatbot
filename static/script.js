const SPOONACULAR_API_KEY = ""; // 🔁 Replace with your actual key

// ====== Global State ======
let lastMealType = null;
let lastPreference = null;
let lastCategory = null;

// ====== Get Favorites from localStorage ======
function getFavorites() {
  const fav = localStorage.getItem("favorites");
  return fav ? JSON.parse(fav) : [];
}

// ====== Save Favorite ======
function saveFavorite(name, suggestion) {
  const favorites = getFavorites();
  if (!favorites.some(fav => fav.name === name && fav.suggestion === suggestion)) {
    favorites.push({ name, suggestion });
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
  renderFavorites();
}

// ====== Remove Favorite ======
function removeFavorite(index) {
  const favorites = getFavorites();
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

// ====== Clear Favorites ======
function clearFavorites() {
  localStorage.removeItem("favorites");
  renderFavorites();
}

// ====== Render Favorites UI ======
function renderFavorites() {
  const favorites = getFavorites();
  const favList = document.getElementById("favorites-list");
  const clearBtn = document.getElementById("clear-favorites-btn");

  if (favorites.length === 0) {
    favList.innerHTML = "No favorites saved.";
    clearBtn.style.display = "none";
    return;
  }

  clearBtn.style.display = "inline-block";
  favList.innerHTML = "";

  favorites.forEach((fav, index) => {
    const div = document.createElement("div");
    div.className = "fav-item";
    div.innerHTML = `
      <span><strong>${fav.name}:</strong> ${fav.suggestion}</span>
      <button title="Remove favorite" aria-label="Remove favorite">&times;</button>
    `;
    div.querySelector("button").addEventListener("click", () => removeFavorite(index));
    favList.appendChild(div);
  });
}

// ====== Typing Indicator ======
function addBotTypingIndicator() {
  const chatContainer = document.getElementById("chat-container");
  const typingBubble = document.createElement("div");
  typingBubble.classList.add("chat-bubble", "bot", "loading");
  typingBubble.id = "typing-indicator";
  typingBubble.textContent = "⏳ Thinking...";
  chatContainer.appendChild(typingBubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeBotTypingIndicator() {
  const typingBubble = document.getElementById("typing-indicator");
  if (typingBubble) typingBubble.remove();
}

// ====== Parse Meal Type from Text Input ======
function parseMealTypeFromText(text) {
  text = text.toLowerCase();
  if (text.includes('breakfast')) return 'breakfast';
  if (text.includes('lunch')) return 'lunch';
  if (text.includes('dinner')) return 'dinner';
  if (text.includes('snack')) return 'snack';
  if (text.includes('daily plan') || text.includes('meal plan') || text.includes('plan')) return 'daily_plan';
  return null;
}

// ====== MAIN: Ask Bot ======
async function askBot(mealType) {
  const preference = document.getElementById("preference").value;
  const category = document.getElementById("category").value;
  const chatContainer = document.getElementById("chat-container");

  // Save for reuse
  lastMealType = mealType;
  lastPreference = preference;
  lastCategory = category;

  const emojiMap = {
    breakfast: "🍳",
    lunch: "🍛",
    dinner: "🍽️",
    snack: "🍪",
    daily_plan: "🗓️"
  };

  const label = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const emoji = emojiMap[mealType] || "";

  // Show user message
  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user";
  userBubble.textContent = `🍽️ Show me ${label}`;
  chatContainer.appendChild(userBubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  addBotTypingIndicator();

  try {
    const res = await fetch(`/suggest?type=${mealType}&preference=${preference}&category=${category}`);
    const data = await res.json();
    removeBotTypingIndicator();

    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot";

    if (mealType === "daily_plan" && data.plan) {
      let html = `${emoji} <strong>${label}</strong><br/>`;
      for (const [key, value] of Object.entries(data.plan)) {
        const capitalKey = key.charAt(0).toUpperCase() + key.slice(1);
        const keyEmoji = emojiMap[key] || "🍴";
        html += `${keyEmoji} <strong>${capitalKey}:</strong> ${value}<br/>`;
      }
      botBubble.innerHTML = html;
    } else {
      const suggestion = data.suggestion || "No suggestion found.";
     // Set the main text once
botBubble.innerHTML = `<strong>${emoji} ${label}:</strong> ${suggestion}`;

// Fetch nutrition info and add info as DOM nodes (not innerHTML)
fetchNutritionInfo(suggestion).then((nutrition) => {
  const nutritionDiv = document.createElement("div");
  nutritionDiv.style.marginTop = "8px";
  nutritionDiv.style.fontSize = "14px";

  if (nutrition) {
    nutritionDiv.innerHTML = `
      <strong>Nutrition Info:</strong><br>
      🔥 Calories: ${nutrition.calories}<br>
      🥩 Protein: ${nutrition.protein}<br>
      🍞 Carbs: ${nutrition.carbs}<br>
      🧈 Fat: ${nutrition.fat}
    `;
  } else {
    nutritionDiv.textContent = "📉 Nutrition info not available.";
  }

  botBubble.appendChild(nutritionDiv);

  // Now append buttons **after** nutrition info is fully appended

  // ⭐ Save Button
  const saveBtn = document.createElement("button");
  const alreadySaved = getFavorites().some(fav => fav.name === label && fav.suggestion === suggestion);
  saveBtn.textContent = alreadySaved ? "Saved!" : "⭐ Save to Favorites";
  saveBtn.style.marginTop = "8px";
  saveBtn.style.padding = "6px 12px";
  saveBtn.style.borderRadius = "8px";
  saveBtn.style.border = "none";
  saveBtn.style.cursor = "pointer";
  saveBtn.style.backgroundColor = "var(--primary)";
  saveBtn.style.color = "#fff";
  saveBtn.style.fontSize = "14px";
  saveBtn.disabled = alreadySaved;

  saveBtn.addEventListener("click", () => {
    saveFavorite(label, suggestion);
    saveBtn.textContent = "Saved!";
    saveBtn.disabled = true;
  });
  botBubble.appendChild(saveBtn);

  // 🔁 Suggest Another Button
  const anotherBtn = document.createElement("button");
  anotherBtn.textContent = "🔁 Suggest Another";
  anotherBtn.className = "animated-button";
  anotherBtn.style.marginLeft = "10px";
  anotherBtn.style.padding = "6px 12px";
  anotherBtn.style.borderRadius = "8px";
  anotherBtn.style.border = "none";
  anotherBtn.style.cursor = "pointer";
  anotherBtn.style.backgroundColor = "var(--primary)";
  anotherBtn.style.color = "#fff";
  anotherBtn.style.fontSize = "14px";

  anotherBtn.addEventListener("click", () => {
    askBot(lastMealType);
  });
  botBubble.appendChild(anotherBtn);
});
    }

    chatContainer.appendChild(botBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    renderFavorites();
  } catch (error) {
    removeBotTypingIndicator();
    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot";
    botBubble.textContent = "⚠️ Oops! Something went wrong.";
    chatContainer.appendChild(botBubble);
  }
}

async function fetchNutritionInfo(mealName) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/guessNutrition?title=${encodeURIComponent(mealName)}&apiKey=${SPOONACULAR_API_KEY}`
    );
    const data = await response.json();

    if (!data || !data.calories) {
      return null;
    }

    return {
      calories: data.calories.value + " " + data.calories.unit,
      protein: data.protein.value + " " + data.protein.unit,
      carbs: data.carbs.value + " " + data.carbs.unit,
      fat: data.fat.value + " " + data.fat.unit,
    };
  } catch (error) {
    console.warn("Nutrition fetch failed:", error);
    return null;
  }
}


// ====== Handle User Input ======
function handleUserInput() {
  const inputField = document.getElementById("userInput");
  const input = inputField.value.trim();
  if (!input) return;

  inputField.value = "";

  const chatContainer = document.getElementById("chat-container");

  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user";
  userBubble.textContent = input;
  chatContainer.appendChild(userBubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const mealType = parseMealTypeFromText(input.toLowerCase());

  if (mealType) {
    askBot(mealType);
  } else {
    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot";
    botBubble.innerHTML = "❌ Sorry, I didn't understand that. Please ask about breakfast, lunch, dinner, snacks, or a daily plan.";
    chatContainer.appendChild(botBubble);
  }
}

// ====== 🎲 Surprise Me Button ======
function surpriseMe() {
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const preferences = ["vegetarian", "non_vegetarian"];
  const categories = ["healthy", "comfort"];

  const randomMeal = mealTypes[Math.floor(Math.random() * mealTypes.length)];
  const randomPref = preferences[Math.floor(Math.random() * preferences.length)];
  const randomCat = categories[Math.floor(Math.random() * categories.length)];

  // Set dropdowns
  document.getElementById("preference").value = randomPref;
  document.getElementById("category").value = randomCat;

  askBot(randomMeal);
}

// ====== Init on DOM Load ======
document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();

  document.getElementById("clear-favorites-btn").addEventListener("click", clearFavorites);

  const inputField = document.getElementById("userInput");
  inputField.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUserInput();
    }
  });

  // Theme toggle
  const switchInput = document.getElementById("themeSwitch");
  const themeLabel = document.querySelector(".theme-label");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    switchInput.checked = true;
    themeLabel.textContent = "🌙 Dark";
  } else {
    themeLabel.textContent = "🌞 Light";
  }

  switchInput.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeLabel.textContent = isDark ? "🌙 Dark" : "🌞 Light";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});

// ====== 🎙️ Voice Input Integration ======
let recognition;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const voiceBtn = document.getElementById("voiceBtn");
  const inputField = document.getElementById("userInput");

  voiceBtn.addEventListener("click", () => {
    recognition.start();
    voiceBtn.disabled = true;
    voiceBtn.textContent = "🎤 Listening...";
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    inputField.value = transcript;
    handleUserInput();  // Automatically trigger chatbot
  };

  recognition.onend = () => {
    voiceBtn.disabled = false;
    voiceBtn.textContent = "🎙️";
  };

  recognition.onerror = (event) => {
    console.error("Voice input error:", event.error);
    voiceBtn.disabled = false;
    voiceBtn.textContent = "🎙️";
  };
} else {
  console.warn("Speech Recognition not supported in this browser.");
  const voiceBtn = document.getElementById("voiceBtn");
  if (voiceBtn) voiceBtn.style.display = "none";
}
