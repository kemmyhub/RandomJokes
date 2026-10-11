// ==========================================================================
// RandomJokes • Modern Frontend Client Engine
// ==========================================================================

// DOM Elements
const jokeCard = document.getElementById('joke-card');
const jokeSetup = document.getElementById('joke-setup');
const punchlineWrapper = document.getElementById('punchline-wrapper');
const jokeDelivery = document.getElementById('joke-delivery');
const loader = document.getElementById('loader');
const jokeCategoryTag = document.getElementById('joke-category-tag');
const jokeCategoryText = document.getElementById('joke-category-text');
const jokeSourceTag = document.getElementById('joke-source-tag');

// Buttons
const newJokeBtn = document.getElementById('new-joke-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const favoriteBtnText = document.getElementById('favorite-btn-text');
const aiJokeBtn = document.getElementById('ai-joke-btn');
const ttsBtn = document.getElementById('tts-btn');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');

// Favorites Drawer Elements
const toggleFavoritesBtn = document.getElementById('toggle-favorites-btn');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const drawerOverlay = document.getElementById('drawer-overlay');
const favoritesDrawer = document.getElementById('favorites-drawer');
const favoritesList = document.getElementById('favorites-list');
const favoritesCountBadge = document.getElementById('favorites-count-badge');
const drawerCountBadge = document.getElementById('drawer-count-badge');
const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
const favoritesSearch = document.getElementById('favorites-search');

// Toast Container
const toastContainer = document.getElementById('toast-container');

// State
let currentJoke = null;
let currentCategory = 'all';
let favorites = JSON.parse(localStorage.getItem('randomjokes_favs')) || [];
let isLoading = false;
let isSpeaking = false;
let soundEnabled = JSON.parse(localStorage.getItem('randomjokes_sound') ?? 'true');

// ==========================================================================
// Audio Synthesis (Web Audio API - Zero External Asset Dependency)
// ==========================================================================
let audioCtx = null;

function playPopSound() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {
    // Ignore audio context errors on muted browsers
  }
}

// ==========================================================================
// Initialization & Event Binding
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  updateFavoritesUI();
  updateSoundUI();
  setupCategoryPills();
  setupEventListeners();
  fetchJoke(); // Load initial joke
});

function setupEventListeners() {
  newJokeBtn.addEventListener('click', () => fetchJoke());
  aiJokeBtn.addEventListener('click', () => fetchAIJoke());
  favoriteBtn.addEventListener('click', toggleFavorite);
  copyBtn.addEventListener('click', copyCurrentJoke);
  shareBtn.addEventListener('click', shareCurrentJoke);
  ttsBtn.addEventListener('click', toggleSpeech);
  soundToggleBtn.addEventListener('click', toggleSoundSetting);

  // Drawer
  toggleFavoritesBtn.addEventListener('click', openDrawer);
  closeDrawerBtn.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);
  clearFavoritesBtn.addEventListener('click', clearAllFavorites);
  favoritesSearch.addEventListener('input', (e) => renderFavorites(e.target.value));

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Avoid triggering when user types in search input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      fetchJoke();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFavorite();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      copyCurrentJoke();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      toggleSpeech();
    } else if (e.key === 'Escape') {
      closeDrawer();
    }
  });
}

function setupCategoryPills() {
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category;
      fetchJoke();
    });
  });
}

// ==========================================================================
// API Interaction
// ==========================================================================
async function fetchJoke() {
  if (isLoading) return;
  stopSpeech();
  setLoading(true);

  try {
    const categoryQuery = currentCategory !== 'all' ? `?category=${currentCategory}` : '';
    const res = await fetch(`/api/jokes/random${categoryQuery}`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();

    if (result.success && result.data) {
      currentJoke = result.data;
      currentJoke.source = result.source || 'edge';
      displayJoke(currentJoke);
      playPopSound();
    } else {
      throw new Error(result.error || 'Failed to load joke');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    displayError('Could not load joke from the edge. Press Space to retry.');
  } finally {
    setLoading(false);
  }
}

async function fetchAIJoke() {
  if (isLoading) return;
  stopSpeech();
  setLoading(true);
  aiJokeBtn.disabled = true;

  try {
    const res = await fetch('/api/jokes/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();

    if (result.success && result.data) {
      currentJoke = result.data;
      currentJoke.source = 'ai';
      displayJoke(currentJoke);
      showToast('✨ Fresh joke sparked by AI!', 'success');
      playPopSound();
    } else {
      if (res.status === 503) {
        showToast('AI requires OPENAI_API_KEY in Cloudflare settings.', 'info');
      } else {
        throw new Error(result.error || 'AI generation failed');
      }
    }
  } catch (err) {
    console.error('AI Joke Error:', err);
    showToast('AI generation unavailable right now.', 'error');
  } finally {
    setLoading(false);
    aiJokeBtn.disabled = false;
  }
}

// ==========================================================================
// Display & Rendering
// ==========================================================================
function displayJoke(joke) {
  // Update Meta Tags
  jokeCategoryText.textContent = joke.category || 'general';
  jokeSourceTag.textContent = (joke.source || 'edge').toUpperCase();

  // Reset animations
  jokeSetup.classList.add('fade-out');
  punchlineWrapper.classList.add('hidden');

  setTimeout(() => {
    if (joke.type === 'twopart') {
      jokeSetup.textContent = joke.setup;
      jokeDelivery.textContent = joke.delivery;
      punchlineWrapper.classList.remove('hidden');
    } else {
      jokeSetup.textContent = joke.joke;
      punchlineWrapper.classList.add('hidden');
    }

    jokeSetup.classList.remove('fade-out');
    jokeSetup.classList.add('fade-in');
  }, 150);

  updateFavoriteButtonState();
}

function displayError(message) {
  jokeSetup.textContent = message;
  punchlineWrapper.classList.add('hidden');
  jokeCategoryText.textContent = 'error';
  jokeSourceTag.textContent = 'OFFLINE';
}

function setLoading(loading) {
  isLoading = loading;
  if (loading) {
    loader.classList.remove('hidden');
    jokeSetup.classList.add('hidden');
    punchlineWrapper.classList.add('hidden');
    newJokeBtn.disabled = true;
  } else {
    loader.classList.add('hidden');
    jokeSetup.classList.remove('hidden');
    newJokeBtn.disabled = false;
  }
}

// ==========================================================================
// Speech Synthesis (Read Aloud)
// ==========================================================================
function toggleSpeech() {
  if (!('speechSynthesis' in window)) {
    showToast('Text-to-speech not supported on this browser.', 'info');
    return;
  }

  if (isSpeaking) {
    stopSpeech();
    return;
  }

  if (!currentJoke) return;

  const textToRead = currentJoke.type === 'twopart'
    ? `${currentJoke.setup} ... ${currentJoke.delivery}`
    : currentJoke.joke;

  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  utterance.onstart = () => {
    isSpeaking = true;
    ttsBtn.classList.add('text-indigo-400');
    ttsBtn.style.color = '#818cf8';
  };

  utterance.onend = () => {
    stopSpeech();
  };

  utterance.onerror = () => {
    stopSpeech();
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  ttsBtn.style.color = '';
}

// ==========================================================================
// Copy & Share
// ==========================================================================
function getFormattedJokeText() {
  if (!currentJoke) return '';
  return currentJoke.type === 'twopart'
    ? `${currentJoke.setup}\n\n${currentJoke.delivery}`
    : currentJoke.joke;
}

async function copyCurrentJoke() {
  const text = getFormattedJokeText();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    const copyIcon = document.getElementById('copy-icon');
    const copyCheckIcon = document.getElementById('copy-check-icon');

    copyIcon.classList.add('hidden');
    copyCheckIcon.classList.remove('hidden');

    showToast('Copied joke to clipboard!', 'success');

    setTimeout(() => {
      copyIcon.classList.remove('hidden');
      copyCheckIcon.classList.add('hidden');
    }, 1800);
  } catch (err) {
    showToast('Failed to copy text.', 'error');
  }
}

async function shareCurrentJoke() {
  const text = getFormattedJokeText();
  if (!text) return;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Random Joke',
        text: `${text}\n\nVia jokes.kemmyhub.com`,
        url: window.location.href
      });
    } catch (e) {
      // User cancelled share
    }
  } else {
    // Fallback: copy link and notify
    copyCurrentJoke();
  }
}

// ==========================================================================
// Favorites Management
// ==========================================================================
function isCurrentJokeFavorited() {
  if (!currentJoke) return false;
  const id = currentJoke.id || currentJoke.joke || currentJoke.setup;
  return favorites.some(f => (f.id || f.joke || f.setup) === id);
}

function toggleFavorite() {
  if (!currentJoke) return;

  const jokeId = currentJoke.id || currentJoke.joke || currentJoke.setup;
  const existingIdx = favorites.findIndex(f => (f.id || f.joke || f.setup) === jokeId);

  if (existingIdx >= 0) {
    favorites.splice(existingIdx, 1);
    showToast('Removed from favorites', 'info');
  } else {
    favorites.unshift({ ...currentJoke, savedAt: new Date().toISOString() });
    showToast('Added to favorites!', 'success');
  }

  saveFavorites();
  updateFavoritesUI();
  updateFavoriteButtonState();
}

function updateFavoriteButtonState() {
  if (isCurrentJokeFavorited()) {
    favoriteBtn.classList.add('active');
    favoriteBtnText.textContent = 'Saved';
  } else {
    favoriteBtn.classList.remove('active');
    favoriteBtnText.textContent = 'Save';
  }
}

function saveFavorites() {
  localStorage.setItem('randomjokes_favs', JSON.stringify(favorites));
}

function updateFavoritesUI() {
  const count = favorites.length;
  favoritesCountBadge.textContent = count;
  drawerCountBadge.textContent = count;
  renderFavorites(favoritesSearch.value);
}

function renderFavorites(filterText = '') {
  const query = filterText.toLowerCase().trim();
  const list = favorites.filter(f => {
    const text = f.type === 'twopart' ? `${f.setup} ${f.delivery}` : f.joke;
    return text.toLowerCase().includes(query);
  });

  if (list.length === 0) {
    favoritesList.innerHTML = `
      <div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>${query ? 'No jokes match your search.' : 'No saved jokes yet. Hit [F] or Save on jokes you love!'}</p>
      </div>
    `;
    return;
  }

  favoritesList.innerHTML = list.map((f, idx) => {
    const text = f.type === 'twopart' ? `<strong>${f.setup}</strong><br>${f.delivery}` : f.joke;
    return `
      <div class="fav-card">
        <div class="fav-text">${text}</div>
        <div class="fav-footer">
          <span class="fav-meta">${f.category || 'general'}</span>
          <div class="fav-actions">
            <button class="fav-btn" title="Copy" onclick="copyFavoriteText(${idx})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="fav-btn delete" title="Remove" onclick="removeFavoriteByIndex(${idx})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.copyFavoriteText = (idx) => {
  const f = favorites[idx];
  if (!f) return;
  const text = f.type === 'twopart' ? `${f.setup}\n\n${f.delivery}` : f.joke;
  navigator.clipboard.writeText(text);
  showToast('Joke copied!', 'success');
};

window.removeFavoriteByIndex = (idx) => {
  favorites.splice(idx, 1);
  saveFavorites();
  updateFavoritesUI();
  updateFavoriteButtonState();
  showToast('Removed from saved collection', 'info');
};

function clearAllFavorites() {
  if (favorites.length === 0) return;
  if (confirm('Clear all saved jokes? This cannot be undone.')) {
    favorites = [];
    saveFavorites();
    updateFavoritesUI();
    updateFavoriteButtonState();
    showToast('All saved jokes cleared', 'info');
  }
}

// ==========================================================================
// Drawer Control
// ==========================================================================
function openDrawer() {
  favoritesDrawer.classList.remove('hidden');
  renderFavorites(favoritesSearch.value);
}

function closeDrawer() {
  favoritesDrawer.classList.add('hidden');
}

// ==========================================================================
// Sound Setting
// ==========================================================================
function toggleSoundSetting() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('randomjokes_sound', JSON.stringify(soundEnabled));
  updateSoundUI();
  if (soundEnabled) {
    playPopSound();
    showToast('Audio effects enabled', 'info');
  } else {
    showToast('Audio effects muted', 'info');
  }
}

function updateSoundUI() {
  if (soundEnabled) {
    soundIconOn.classList.remove('hidden');
    soundIconOff.classList.add('hidden');
  } else {
    soundIconOn.classList.add('hidden');
    soundIconOff.classList.remove('hidden');
  }
}

// ==========================================================================
// Toast Notification Engine
// ==========================================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }, 2600);
}
