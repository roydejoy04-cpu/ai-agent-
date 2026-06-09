// Initialize Lucide Icons
lucide.createIcons();

// Configure Marked.js options
marked.setOptions({
    breaks: true,
    gfm: true
});

/* ==========================================================================
   STATE MANAGEMENT & DOM ELEMENTS
   ========================================================================== */
const state = {
    activeView: 'landing', // 'landing' or 'playground'
    currentChatId: 'chat-1',
    isWebSearchActive: false,
    chats: {
        'chat-1': {
            title: 'Market Research: AI Agents',
            messages: [
                {
                    sender: 'user',
                    text: 'Perform market research on AI agents and give me key insights for 2025.'
                },
                {
                    sender: 'agent',
                    text: 'Here is the market research summary on **Autonomous AI Agents**.\n\n2024-2025 is emerging as the era of **Autonomous Agents** (Goal-oriented task execution) shifting from the "Copilot" era (human-in-the-loop assistance).\n\n### Market Dynamics\n\n<div class="report-card-grid">\n  <div class="report-card">\n    <div class="report-card-title"><i data-lucide="trending-up" class="meta-icon"></i>Growth Forecast</div>\n    <div class="report-card-text">Enterprise agent adoption is projected to grow by 140% CAGR through 2027.</div>\n  </div>\n  <div class="report-card">\n    <div class="report-card-title"><i data-lucide="layers" class="meta-icon"></i>Tech Stack Shift</div>\n    <div class="report-card-text">Moving from simple RAG to multi-agent orchestration frameworks (AutoGPT, LangGraph).</div>\n  </div>\n</div>\n\n### FIG 1.1: Market Penetration Comparison\n\n<div class="chart-container" style="height: 120px; margin-top: 15px;">\n  <div class="chart-bars" style="width: 100%;">\n    <div class="bar-col"><div class="bar" style="height: 30%"></div><span style="font-size:0.75rem;">2022</span></div>\n    <div class="bar-col"><div class="bar" style="height: 45%"></div><span style="font-size:0.75rem;">2023</span></div>\n    <div class="bar-col"><div class="bar active" style="height: 70%"></div><span style="font-size:0.75rem;">2024 (E)</span></div>\n    <div class="bar-col"><div class="bar active" style="height: 95%"></div><span style="font-size:0.75rem;">2025 (P)</span></div>\n  </div>\n</div>\n<div style="display:flex; justify-content:center; gap:20px; font-size:0.75rem; color:#9494a3; margin-top:8px;">\n  <span>● Autonomous</span>\n  <span style="color:#5e5e70;">● Copilot</span>\n</div>\n\n### Key Citations\n\n<div class="citations-block">\n  <div class="citation-list">\n    <a href="#" class="citation-item"><i data-lucide="link"></i> Gartner: The Future of Autonomous Enterprise Agents (2024)</a>\n    <a href="#" class="citation-item"><i data-lucide="link"></i> McKinsey Digital: Generative AI\'s Second Act</a>\n  </div>\n</div>'
                }
            ]
        },
        'chat-2': {
            title: 'Neural Network Architecture',
            messages: [
                {
                    sender: 'user',
                    text: 'Explain neural networks.'
                },
                {
                    sender: 'agent',
                    text: 'Neural networks are computational models inspired by the human brain. They consist of layers of interconnected nodes (neurons) that process inputs to make predictions.\n\nHere is a simple python snippet representation of a forward pass:\n\n```python\nimport numpy as np\n\ndef sigmoid(x):\n    return 1 / (1 + np.exp(-x))\n\n# Input layer\nx = np.array([0.5, 0.3])\n# Weights\nw = np.array([[0.2, 0.8], [0.5, 0.1]])\n\n# Forward pass\nhidden = sigmoid(np.dot(x, w))\nprint("Hidden Layer activations:", hidden)\n```'
                }
            ]
        },
        'chat-3': {
            title: 'Python Scripting for Automat...',
            messages: [
                {
                    sender: 'user',
                    text: 'Help me write an automated file sorting script.'
                },
                {
                    sender: 'agent',
                    text: 'Here is a script that organizes files in a directory based on their extension:\n\n```python\nimport os\nimport shutil\n\ndef organize_directory(path):\n    for filename in os.listdir(path):\n        if os.path.isfile(os.path.join(path, filename)):\n            ext = filename.split(\'.\')[-1]\n            dest_dir = os.path.join(path, ext)\n            os.makedirs(dest_dir, exist_ok=True)\n            shutil.move(os.path.join(path, filename), os.path.join(dest_dir, filename))\n```'
                }
            ]
        }
    }
};

const dom = {
    landingView: document.getElementById('landing-view'),
    playgroundView: document.getElementById('playground-view'),
    btnLaunchPlayground: document.getElementById('btn-launch-playground'),
    btnBackToLanding: document.getElementById('btn-back-to-landing'),
    btnNewChat: document.getElementById('btn-new-chat'),
    recentChatsList: document.getElementById('recent-chats-list'),
    chatTitle: document.getElementById('chat-title'),
    messagesContainer: document.getElementById('messages-container'),
    chatInput: document.getElementById('chat-input'),
    btnSend: document.getElementById('btn-send'),
    btnToggleWeb: document.getElementById('btn-toggle-web'),
    dynamicRole: document.getElementById('dynamic-role'),
    actionCards: document.querySelectorAll('.action-card'),
    quickPills: document.querySelectorAll('.pill-btn')
};

/* ==========================================================================
   VIEW NAVIGATION & SWITCHING
   ========================================================================== */
function switchView(viewName) {
    state.activeView = viewName;
    if (viewName === 'playground') {
        dom.landingView.classList.remove('active');
        dom.landingView.classList.add('hidden');
        dom.playgroundView.classList.remove('hidden');
        dom.playgroundView.classList.add('active');
        loadChat(state.currentChatId);
    } else {
        dom.playgroundView.classList.remove('active');
        dom.playgroundView.classList.add('hidden');
        dom.landingView.classList.remove('hidden');
        dom.landingView.classList.add('active');
    }
    window.scrollTo(0, 0);
}

dom.btnLaunchPlayground.addEventListener('click', () => switchView('playground'));
dom.btnBackToLanding.addEventListener('click', () => switchView('landing'));

// Feature Cards on Landing Page click should launch playground and set prompt
dom.actionCards.forEach(card => {
    card.addEventListener('click', () => {
        const text = card.querySelector('span').innerText;
        switchView('playground');
        
        // Setup new empty chat
        createNewChat();
        dom.chatInput.value = `${text} `;
        dom.chatInput.focus();
        updateSendButtonState();
    });
});

/* ==========================================================================
   TYPING ANIMAION FOR LANDING PAGE
   ========================================================================== */
const roles = ['designers|', 'developers|', 'marketers|', 'researchers|'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 150;

function typeEffect() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        dom.dynamicRole.innerText = currentRole.substring(0, charIndex - 1) + '|';
        charIndex--;
        typeSpeed = 75;
    } else {
        dom.dynamicRole.innerText = currentRole.substring(0, charIndex + 1) + '|';
        charIndex++;
        typeSpeed = 150;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typeSpeed = 1500; // Pause at full word
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500; // Pause before typing next word
    }

    setTimeout(typeEffect, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeEffect, 1000);
});

/* ==========================================================================
   CHAT INTERACTIONS
   ========================================================================== */
function loadChat(chatId) {
    state.currentChatId = chatId;
    
    // Update active list state
    document.querySelectorAll('.recent-item').forEach(item => {
        if (item.getAttribute('data-chat-id') === chatId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const chat = state.chats[chatId];
    if (!chat) return;

    dom.chatTitle.innerText = chat.title;
    
    // Clear and render messages
    dom.messagesContainer.innerHTML = '';
    chat.messages.forEach(msg => {
        appendMessageBubble(msg.sender, msg.text);
    });
    
    scrollToBottom();
}

function appendMessageBubble(sender, markdownText) {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerText = sender === 'user' ? 'U' : 'M';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = marked.parse(markdownText);
    
    bubble.appendChild(avatar);
    bubble.appendChild(content);
    
    dom.messagesContainer.appendChild(bubble);
    
    // Highlight any code blocks in the newly appended message
    content.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    
    // Re-initialize any newly generated lucide icons inside html
    lucide.createIcons();
    
    return content;
}

function scrollToBottom() {
    dom.messagesContainer.scrollTop = dom.messagesContainer.scrollHeight;
}

// Sidebar Chat Clicks
dom.recentChatsList.addEventListener('click', (e) => {
    const recentItem = e.target.closest('.recent-item');
    if (recentItem) {
        const chatId = recentItem.getAttribute('data-chat-id');
        loadChat(chatId);
    }
});

// Auto-grow textarea
dom.chatInput.addEventListener('input', () => {
    dom.chatInput.style.height = 'auto';
    dom.chatInput.style.height = (dom.chatInput.scrollHeight - 12) + 'px';
    updateSendButtonState();
});

function updateSendButtonState() {
    dom.btnSend.disabled = dom.chatInput.value.trim() === '';
}

// Quick Prompt Pills
dom.quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
        const text = pill.getAttribute('data-prompt');
        dom.chatInput.value = text;
        dom.chatInput.focus();
        updateSendButtonState();
    });
});

// Web search toggle
dom.btnToggleWeb.addEventListener('click', () => {
    state.isWebSearchActive = !state.isWebSearchActive;
    dom.btnToggleWeb.classList.toggle('active', state.isWebSearchActive);
});

// Create New Chat
function createNewChat() {
    const newId = `chat-${Date.now()}`;
    state.chats[newId] = {
        title: 'New Chat Session',
        messages: []
    };
    state.currentChatId = newId;

    // Prepend to sidebar recent list
    const item = document.createElement('div');
    item.className = 'recent-item active';
    item.setAttribute('data-chat-id', newId);
    item.innerHTML = `
        <i data-lucide="message-square-more"></i>
        <span class="recent-text">New Chat Session</span>
    `;
    
    // Insert after "RECENT" title
    dom.recentChatsList.prepend(item);
    lucide.createIcons();
    
    loadChat(newId);
}

dom.btnNewChat.addEventListener('click', createNewChat);

/* ==========================================================================
   STREAMING API COMMUNICATION
   ========================================================================== */
async function sendMessage() {
    const text = dom.chatInput.value.trim();
    if (!text) return;
    
    // Clear input
    dom.chatInput.value = '';
    dom.chatInput.style.height = 'auto';
    updateSendButtonState();
    
    // Update active chat title if it is a new session
    const currentChat = state.chats[state.currentChatId];
    if (currentChat.messages.length === 0) {
        currentChat.title = text.length > 25 ? text.substring(0, 25) + '...' : text;
        dom.chatTitle.innerText = currentChat.title;
        
        // Update sidebar element text
        const sidebarItem = document.querySelector(`.recent-item[data-chat-id="${state.currentChatId}"] .recent-text`);
        if (sidebarItem) {
            sidebarItem.innerText = currentChat.title;
        }
    }
    
    // Add user message
    currentChat.messages.push({ sender: 'user', text: text });
    appendMessageBubble('user', text);
    scrollToBottom();
    
    // Add temporary agent bubble for streaming
    const agentBubble = document.createElement('div');
    agentBubble.className = 'message-bubble agent';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerText = 'M';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Typing indicator
    content.innerHTML = `
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    
    agentBubble.appendChild(avatar);
    agentBubble.appendChild(content);
    dom.messagesContainer.appendChild(agentBubble);
    scrollToBottom();
    
    // Call server API streaming
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        // Prepare to read stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let agentText = '';
        
        // Remove typing indicator, add streaming caret
        content.innerHTML = '<span class="streaming-caret"></span>';
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            // Decode Server-Sent Events syntax: data: <token>\n\n
            const lines = chunk.split('\n\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const token = line.substring(6);
                    if (token) {
                        agentText += token;
                        // Render partially typed markdown + streaming caret
                        content.innerHTML = marked.parse(agentText) + '<span class="streaming-caret"></span>';
                        scrollToBottom();
                    }
                }
            }
        }
        
        // Streaming finished, remove caret and finalize
        content.innerHTML = marked.parse(agentText);
        currentChat.messages.push({ sender: 'agent', text: agentText });
        
        // Highlight code blocks
        content.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        lucide.createIcons();
        scrollToBottom();
        
    } catch (error) {
        console.error(error);
        content.innerHTML = `<span style="color: #ff4a4a;">Failed to get response from Antigravity Agent. Error: ${error.message}</span>`;
    }
}

// Send bindings
dom.btnSend.addEventListener('click', sendMessage);
dom.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
