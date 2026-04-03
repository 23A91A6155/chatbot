/* ============================================================
   Chatbot UI — Application Logic
   Connects to the local Ollama instance (llama3.2:3b)
   ============================================================ */

// ---------- Config ----------
const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'llama3.2:3b';

// Prompt templates (mirrors prompts/ folder)
const ZERO_SHOT_TEMPLATE = `You are a helpful and professional e-commerce customer support agent. Your role is to assist customers with their questions and concerns regarding orders, payments, shipping, returns, refunds, product information, and account issues. Provide clear, accurate, and polite responses.

Customer Query: {query}

Agent Response:`;

const ONE_SHOT_TEMPLATE = `You are a helpful and professional e-commerce customer support agent. Your role is to assist customers with their questions and concerns regarding orders, payments, shipping, returns, refunds, product information, and account issues. Provide clear, accurate, and polite responses.

Here is an example of how you should respond:

Customer Query: I placed an order three days ago, but I still haven't received a shipping confirmation email. Can you help me check the status?
Agent Response: Thank you for reaching out! I understand how important it is to stay updated on your order. Let me look into this for you. Could you please provide me with your order number or the email address associated with your account? Once I have that information, I'll be able to check the current status of your order and provide you with a detailed update on the shipping timeline.

Now, please respond to the following query in a similar professional and helpful manner:

Customer Query: {query}

Agent Response:`;

// Sample queries for quick use
const SAMPLE_QUERIES = [
  "My order status hasn't updated after the payment was confirmed two days ago",
  "I keep getting an error message when trying to apply a discount code at checkout",
  "The app crashes every time I try to view my order history",
  "How do I recover a cancelled order and place it again?",
  "My refund hasn't shown up in my bank account after 10 business days",
  "I forgot my account password and the reset email never arrives",
  "How do I set up automatic monthly reorders for my regular purchases?",
  "My loyalty points balance dropped unexpectedly without any redemption",
];

// ---------- State ----------
let currentMode = 'one-shot'; // 'zero-shot' | 'one-shot'
let isGenerating = false;
let conversationHistory = [];

// ---------- DOM Elements ----------
const messagesContainer = document.getElementById('messagesContainer');
const welcomeState = document.getElementById('welcomeState');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const modeButtons = document.querySelectorAll('.mode-btn');
const sampleQueriesContainer = document.getElementById('sampleQueries');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const toast = document.getElementById('toast');
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
  renderSampleQueries();
  checkOllamaStatus();
  setupEventListeners();

  // Periodically check Ollama status
  setInterval(checkOllamaStatus, 15000);
});

function setupEventListeners() {
  // Send message
  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });

  // Mode switching
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      setMode(mode);
    });
  });

  // Clear chat
  clearBtn.addEventListener('click', clearChat);

  // Sidebar toggle (mobile)
  hamburger.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Welcome chips
  document.querySelectorAll('.welcome-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.textContent;
      handleSend();
    });
  });
}

// ---------- Mode ----------
function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  const hint = document.getElementById('currentModeHint');
  if (hint) {
    hint.textContent = `Mode: ${mode === 'zero-shot' ? 'Zero-Shot' : 'One-Shot'}`;
  }
}

// ---------- Ollama Status ----------
async function checkOllamaStatus() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
    if (res.ok) {
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Connected';
    } else {
      throw new Error();
    }
  } catch {
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Offline';
  }
}

// ---------- Sample Queries ----------
function renderSampleQueries() {
  SAMPLE_QUERIES.forEach((q) => {
    const btn = document.createElement('button');
    btn.className = 'sample-query-btn';
    btn.textContent = q;
    btn.addEventListener('click', () => {
      chatInput.value = q;
      handleSend();
      closeSidebar();
    });
    sampleQueriesContainer.appendChild(btn);
  });
}

// ---------- Send Message ----------
async function handleSend() {
  const text = chatInput.value.trim();
  if (!text || isGenerating) return;

  // Hide welcome
  welcomeState.classList.add('hidden');

  // Add user message
  addMessage('user', text);
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // Generate response
  isGenerating = true;
  sendBtn.disabled = true;

  const typingEl = addTypingIndicator();

  try {
    const prompt =
      currentMode === 'zero-shot'
        ? ZERO_SHOT_TEMPLATE.replace('{query}', text)
        : ONE_SHOT_TEMPLATE.replace('{query}', text);

    const response = await queryOllama(prompt);
    typingEl.remove();
    addMessage('bot', response, currentMode);
  } catch (err) {
    typingEl.remove();
    addMessage('bot', `⚠️ ${err.message}`, currentMode);
    showToast(err.message);
  } finally {
    isGenerating = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// ---------- Ollama API ----------
async function queryOllama(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  try {
    const res = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data = await res.json();
    return data.response || '[No response generated]';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Cannot connect to Ollama. Make sure it is running on localhost:11434.');
    }
    throw err;
  }
}

// ---------- Message Rendering ----------
function addMessage(role, content, method) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;

  const avatarEmoji = role === 'bot' ? '🤖' : '👤';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let metaHTML = `<span>${time}</span>`;
  if (role === 'bot' && method) {
    const badgeClass = method === 'zero-shot' ? 'badge-zero-shot' : 'badge-one-shot';
    const label = method === 'zero-shot' ? 'Zero-Shot' : 'One-Shot';
    metaHTML += `<span class="message-method-badge ${badgeClass}">${label}</span>`;
  }

  msg.innerHTML = `
    <div class="message-avatar">${avatarEmoji}</div>
    <div>
      <div class="message-content">${escapeHTML(content)}</div>
      <div class="message-meta">${metaHTML}</div>
    </div>
  `;

  messagesContainer.appendChild(msg);
  scrollToBottom();

  conversationHistory.push({ role, content, method, time });
}

function addTypingIndicator() {
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div>
      <div class="message-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  messagesContainer.appendChild(msg);
  scrollToBottom();
  return msg;
}

// ---------- Utilities ----------
function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function clearChat() {
  messagesContainer.innerHTML = '';
  conversationHistory = [];
  welcomeState.classList.remove('hidden');
  messagesContainer.appendChild(welcomeState);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 4000);
}

// ---------- Sidebar (Mobile) ----------
function toggleSidebar() {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('visible');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
}
