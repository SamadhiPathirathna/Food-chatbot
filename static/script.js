let conversationHistory = [];
let selectedPreference = 'vegetarian';
let selectedMood = 'healthy';
let totalCaloriesToday = 0;
const CALORIE_GOAL = 2000;

// INIT
document.addEventListener('DOMContentLoaded', () => {
  loadCaloriesFromStorage();
  renderFavorites();
  setupPillGroups();
  setupTheme();
  setupVoiceInput();
  document.getElementById('userInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleUserInput(); }
  });
  document.getElementById('clear-favorites-btn').addEventListener('click', clearAllFavorites);
});

// PILL SELECTION
function setupPillGroups() {
  document.querySelectorAll('#pref-group .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pref-group .pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPreference = btn.dataset.value;
    });
  });
  document.querySelectorAll('#mood-group .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#mood-group .pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMood = btn.dataset.value;
    });
  });
}

// QUICK BUTTONS
function quickAsk(mealType) {
  const prefLabel = selectedPreference.replace('_', '-');
  const message = mealType === 'daily_plan'
    ? `Give me a full daily meal plan for a ${prefLabel} ${selectedMood} diet.`
    : `Suggest a ${prefLabel} ${selectedMood} ${mealType} for me.`;
  sendMessage(message);
}

function surpriseMe() {
  const prefs = ['vegetarian', 'non_vegetarian', 'vegan'];
  const moods = ['healthy', 'comfort', 'quick'];
  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  const rPref = prefs[Math.floor(Math.random() * prefs.length)];
  const rMood = moods[Math.floor(Math.random() * moods.length)];
  const rMeal = meals[Math.floor(Math.random() * meals.length)];
  document.querySelectorAll('#pref-group .pill').forEach(b => b.classList.toggle('active', b.dataset.value === rPref));
  document.querySelectorAll('#mood-group .pill').forEach(b => b.classList.toggle('active', b.dataset.value === rMood));
  selectedPreference = rPref;
  selectedMood = rMood;
  sendMessage(`Surprise me! Give me a ${rPref.replace('_','-')} ${rMood} ${rMeal}.`);
}

function handleUserInput() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  sendMessage(text);
}

// CORE SEND
async function sendMessage(userText) {
  const welcome = document.querySelector('.welcome-message');
  if (welcome) welcome.remove();

  appendUserBubble(userText);
  conversationHistory.push({ role: 'user', content: userText });
  const typingEl = appendTypingIndicator();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });
    const data = await response.json();
    typingEl.remove();

    if (data.error) {
      appendBotBubble(`⚠️ ${data.error}`, null, false);
      conversationHistory.pop();
      return;
    }

    const replyText = data.reply;
    conversationHistory.push({ role: 'assistant', content: replyText });

    const nutrition = parseNutrition(replyText);
    const cleanText = replyText.replace(/\[NUTRITION:[^\]]+\]/g, '').trim();
    appendBotBubble(cleanText, nutrition, true);

  } catch (err) {
    typingEl.remove();
    appendBotBubble('⚠️ Could not reach the server. Is Flask running?', null, false);
    conversationHistory.pop();
  }
}

// NUTRITION PARSER
function parseNutrition(text) {
  const match = text.match(/\[NUTRITION:\s*calories=(\d+),\s*protein=([\d.]+)g,\s*carbs=([\d.]+)g,\s*fat=([\d.]+)g\]/i);
  if (!match) return null;
  return { calories: parseFloat(match[1]), protein: parseFloat(match[2]), carbs: parseFloat(match[3]), fat: parseFloat(match[4]) };
}

// MARKDOWN RENDERER
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>').replace(/$/, '</p>');
}

// DOM: USER BUBBLE
function appendUserBubble(text) {
  const c = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = 'message user';
  msg.innerHTML = `<div class="bubble-avatar">🙂</div><div class="bubble-content"><div class="bubble">${escapeHtml(text)}</div></div>`;
  c.appendChild(msg);
  scrollToBottom();
}

// DOM: BOT BUBBLE
function appendBotBubble(text, nutrition, showActions) {
  const c = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = 'message bot';

  const mealMatch = text.match(/\*\*([^*]+)\*\*/);
  const mealName = mealMatch ? mealMatch[1] : null;

  let nutritionHTML = '';
  if (nutrition) {
    nutritionHTML = `<div class="nutrition-card">
      <div class="nutr-item"><span class="nutr-value">${nutrition.calories}</span><span class="nutr-label">Calories</span></div>
      <div class="nutr-item"><span class="nutr-value">${nutrition.protein}g</span><span class="nutr-label">Protein</span></div>
      <div class="nutr-item"><span class="nutr-value">${nutrition.carbs}g</span><span class="nutr-label">Carbs</span></div>
      <div class="nutr-item"><span class="nutr-value">${nutrition.fat}g</span><span class="nutr-label">Fat</span></div>
    </div>`;
  }

  let actionsHTML = '';
  if (showActions && mealName) {
    actionsHTML = `<div class="bubble-actions" data-meal="${escapeHtml(mealName)}" data-calories="${nutrition ? nutrition.calories : 0}">
      <button class="action-btn fav-btn" onclick="saveFavoriteFromBtn(this)">⭐ Save</button>
      ${nutrition ? `<button class="action-btn log-btn" onclick="logCaloriesFromBtn(this)">🍴 I Ate This</button>` : ''}
      <button class="action-btn" onclick="askForRecipe('${escapeHtml(mealName)}')">📖 Recipe</button>
    </div>`;
  }

  msg.innerHTML = `<div class="bubble-avatar">🍽️</div><div class="bubble-content"><div class="bubble">${renderMarkdown(text)}</div>${nutritionHTML}${actionsHTML}</div>`;
  c.appendChild(msg);
  scrollToBottom();
}

// TYPING INDICATOR
function appendTypingIndicator() {
  const c = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.innerHTML = `<div class="bubble-avatar">🍽️</div><div class="bubble-content"><div class="bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;
  c.appendChild(msg);
  scrollToBottom();
  return msg;
}

// FAVORITES
function saveFavoriteFromBtn(btn) {
  const a = btn.closest('.bubble-actions');
  saveFavorite(a.dataset.meal);
  btn.textContent = '✅ Saved!';
  btn.disabled = true;
}

function saveFavorite(name) {
  const favs = getFavorites();
  if (!favs.some(f => f.name === name)) {
    favs.push({ name });
    localStorage.setItem('chef_favorites', JSON.stringify(favs));
  }
  renderFavorites();
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem('chef_favorites') || '[]'); } catch { return []; }
}

function removeFavorite(index) {
  const favs = getFavorites();
  favs.splice(index, 1);
  localStorage.setItem('chef_favorites', JSON.stringify(favs));
  renderFavorites();
}

function clearAllFavorites() {
  localStorage.removeItem('chef_favorites');
  renderFavorites();
}

function renderFavorites() {
  const favs = getFavorites();
  const list = document.getElementById('favorites-list');
  const clearBtn = document.getElementById('clear-favorites-btn');
  if (favs.length === 0) {
    list.innerHTML = '<p class="empty-state">No favorites yet</p>';
    clearBtn.style.display = 'none';
    return;
  }
  clearBtn.style.display = 'inline-block';
  list.innerHTML = favs.map((f, i) => `<div class="fav-item"><span>${f.name}</span><button class="fav-remove" onclick="removeFavorite(${i})">×</button></div>`).join('');
}

// CALORIES
function logCaloriesFromBtn(btn) {
  const a = btn.closest('.bubble-actions');
  const cal = parseFloat(a.dataset.calories) || 0;
  if (cal > 0) {
    totalCaloriesToday += cal;
    saveCaloriesToStorage();
    updateCalorieDisplay();
    btn.textContent = '✅ Logged!';
    btn.classList.add('logged');
    btn.disabled = true;
  }
}

function loadCaloriesFromStorage() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const data = JSON.parse(localStorage.getItem('chef_calories') || '{}');
    totalCaloriesToday = data[today] || 0;
  } catch { totalCaloriesToday = 0; }
  updateCalorieDisplay();
}

function saveCaloriesToStorage() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const data = JSON.parse(localStorage.getItem('chef_calories') || '{}');
    data[today] = totalCaloriesToday;
    localStorage.setItem('chef_calories', JSON.stringify(data));
  } catch {}
}

function updateCalorieDisplay() {
  document.getElementById('calorie-count').textContent = Math.round(totalCaloriesToday);
  const pct = Math.min((totalCaloriesToday / CALORIE_GOAL) * 100, 100);
  document.getElementById('calorie-bar').style.width = pct + '%';
}

function askForRecipe(mealName) {
  sendMessage(`How do I make ${mealName}? Give me a quick recipe.`);
}

// THEME
function setupTheme() {
  const btn = document.getElementById('themeBtn');
  if (localStorage.getItem('chef_theme') === 'dark') {
    document.body.classList.add('dark');
    btn.textContent = '☀️ Light Mode';
  }
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('chef_theme', isDark ? 'dark' : 'light');
  });
}

// VOICE
function setupVoiceInput() {
  const voiceBtn = document.getElementById('voiceBtn');
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    voiceBtn.style.display = 'none';
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  voiceBtn.addEventListener('click', () => {
    recognition.start();
    voiceBtn.textContent = '🔴';
  });
  recognition.onresult = e => {
    document.getElementById('userInput').value = e.results[0][0].transcript;
    handleUserInput();
  };
  recognition.onend = () => { voiceBtn.textContent = '🎙️'; };
  recognition.onerror = () => { voiceBtn.textContent = '🎙️'; };
}

// HELPERS
function scrollToBottom() {
  const c = document.getElementById('chat-messages');
  c.scrollTop = c.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}