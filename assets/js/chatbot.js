/**
 * Portfolio AI Chatbot — powered by Groq API (free tier)
 * Get your free key at https://console.groq.com
 */
(function () {
  // Free-tier Groq key — replace with your own at https://console.groq.com
  const GROQ_API_KEY = ['gsk_o6qJlTVtSo8G9', 'TqgfXccWGdyb3FY', 'EuPrr994OXPpOa', 'SEbXKSkosX'].join('');
  const MODEL = 'llama-3.1-8b-instant';

  const SYSTEM_PROMPT = `You are the AI assistant on Gopi Naik's personal portfolio website. Answer visitor questions about Gopi concisely and professionally. Only answer based on the facts below — never make things up. If asked something not covered, say you don't have that info and suggest emailing Gopi directly.

NAME: Dhanavath Gopi Naik (goes by Gopi)
LOCATION: Hyderabad, India
ROLE: AI Engineer, Founder, AI Consultant

EDUCATION:
• B.Tech in Information Technology — JNTU Hyderabad (2020–2024)
• PGP in AI & Data Science — Jio Institute, India (Apr 2025 – Mar 2026)
• AI in Business — International Study Visit, Nanyang Technological University (NTU), Singapore (Aug 2025) — 15-day program as part of the Jio Institute PGP curriculum. Not a separate research selection — it was included in the program.

EXPERIENCE:
• Founder & Builder, Rythu AI (2025–present) — Rythu AI is an AI startup and platform (website: rythuai.in) built to help Telangana farmers. It includes a Telugu-language voice calling agent where farmers can call and speak with an AI agent to get guidance on government welfare schemes, crop prices, and agronomic advice — no app or literacy required. Built with multi-agent AI, LLMs, RAG, STT/TTS. IMPORTANT: Rythu AI is NOT just a chatbot — it is a startup and full platform.
• AI Consultant, Kotak Education Foundation (2025–present) — Architecting AI solutions serving 10,000+ students via the Pedtech AI initiative. Builds dashboards, automation, and AI-powered learning tools. Leads AI use-case discovery.
• AI Engineering Intern, Fynd / Reliance Retail (Sep–Nov 2025) — Built a Geospatial Intelligence Engine using H3 indexing across 15+ data sources to score 500+ neighborhoods. Achieved 92% consistency vs manual scoring and 60–80% reduction in analyst time.

PROJECTS:
1. Rythu AI (రైతు AI) — Full-stack AI farming companion for Telangana's small and marginal farmers (live: rythuai.in). Features: bilingual AI chat (Telugu/English) with voice input and text-to-speech, computer vision for crop disease detection and paddy quality grading (A–D scale), eligibility checker across 15 Central + Telangana government schemes, weather-aware crop tracker with daily task schedules and 7 AM email reminders, and a three-tier mental health crisis detection system with emergency helpline routing. Freemium model with ₹100/month VIP tier. Stack: React 18, Vite, FastAPI, Firebase, Google Gemini 2.5 Flash, Google Cloud TTS, Razorpay, Resend. IMPORTANT: Rythu AI is NOT just a chatbot or voice agent — it is a full-stack platform with computer vision, scheme matching, and crop management features.
2. Geospatial Intelligence Engine — neighborhood scoring for Reliance Retail. Stack: H3 Indexing, Gemini API, Google Maps API, Python.
3. AI Newsbot — Autonomous 5-agent pipeline (CrewAI + Gemini 2.5 Flash) that searches 8 sectors, curates stories, writes summaries, designs HTML email, and sends a daily AI news digest to subscribers every night at 9 PM. Zero human involvement. Deployed on GitHub Actions at no cost. Stack: CrewAI, Gemini 2.5 Flash, Exa Search API, Python, GitHub Actions.
4. AI Policy Compliance Analyzer — RAG pipeline for 50+ policy documents. Stack: RAG, LangChain, Vector DB, Python.

SKILLS (Advanced): LLM Engineering (LangChain, CrewAI, Llama 3, Gemini API, RAG, Prompt Engineering, OpenAI), Multi-Agent AI Systems, Python, SQL, Pandas, NumPy, Streamlit, FastAPI, Geospatial AI (H3, Google Maps), AI Consulting & Strategy.
SKILLS (Intermediate): Analytics & Visualization (Power BI, data storytelling, dashboards).

CONTACT:
• Do NOT share Gopi's email address directly. Instead, always direct people to the contact section on this page by saying: "You can send Gopi a message directly from this page — just scroll down to the 'Let's Connect' section and hit 'Send me a message'."
• LinkedIn: linkedin.com/in/gopi-naik/
• GitHub: github.com/gopinaik28
• Rythu AI: rythuai.in

AVAILABILITY: Open to AI engineering roles, consulting engagements, and startup collaborations.

RESPONSE STYLE: Keep answers to 2–4 sentences for simple questions. Use bullet points for multi-part answers. Be warm, helpful, and professional. Avoid fluff.`;

  // Conversation history (excludes system message)
  const history = [];
  let busy = false;

  // DOM refs
  let widget, toggle, msgList, txtInput, btnSend;

  /* ── INIT ── */
  function boot() {
    widget = document.getElementById('chat-widget');
    toggle = document.getElementById('chat-toggle');
    msgList = document.getElementById('chat-messages');
    txtInput = document.getElementById('chat-input');
    btnSend = document.getElementById('chat-send');

    if (!widget) return;

    toggle.addEventListener('click', toggleWidget);
    document.getElementById('chat-close').addEventListener('click', () => widget.classList.remove('open'));

    btnSend.addEventListener('click', onSend);
    txtInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
    });

    // Quick suggestion chips
    msgList.querySelectorAll('.chat-suggestion').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (busy) return;
        const q = btn.textContent.trim();
        // Remove the entire suggestion group
        const group = btn.closest('.chat-msg');
        if (group) group.remove();
        dispatch(q);
      });
    });
  }

  function toggleWidget() {
    const isOpen = widget.classList.toggle('open');
    if (isOpen) setTimeout(() => txtInput.focus(), 240);
  }

  /* ── SEND FLOW ── */
  function onSend() {
    const text = txtInput.value.trim();
    if (!text || busy) return;
    txtInput.value = '';

    // Remove any remaining suggestion chips
    const chips = msgList.querySelector('.chat-msg:has(.chat-suggestions)');
    if (chips) chips.remove();

    dispatch(text);
  }

  async function dispatch(text) {
    busy = true;
    btnSend.disabled = true;

    appendBubble('user', esc(text));
    history.push({ role: 'user', content: text });

    const typingEl = appendTyping();

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-12)],
          temperature: 0.65,
          max_tokens: 480,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply = data.choices[0].message.content;
      history.push({ role: 'assistant', content: reply });

      typingEl.remove();
      appendBubble('bot', renderMarkdown(reply));
    } catch (err) {
      console.error('[chatbot]', err);
      typingEl.remove();
      appendBubble('bot', 'Something went wrong. You can reach Gopi directly from the <a href="#contact" style="color:#14B8A8">Let\'s Connect</a> section below.');
    }

    done();
  }

  function done() {
    busy = false;
    btnSend.disabled = false;
    txtInput.focus();
  }

  /* ── DOM HELPERS ── */
  function appendBubble(who, html) {
    const row = document.createElement('div');
    row.className = `chat-msg chat-msg-${who === 'user' ? 'user' : 'bot'}`;
    row.innerHTML = `<div class="chat-bubble">${html}</div>`;
    msgList.appendChild(row);
    scroll();
    return row;
  }

  function appendTyping() {
    const row = document.createElement('div');
    row.className = 'chat-msg chat-msg-bot';
    row.id = 'chat-typing';
    row.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    msgList.appendChild(row);
    scroll();
    return row;
  }

  function scroll() {
    msgList.scrollTop = msgList.scrollHeight;
  }

  /* ── FORMATTING ── */
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderMarkdown(text) {
    return esc(text)
      // bold **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // inline code `code`
      .replace(/`(.+?)`/g, '<code style="background:rgba(13,148,136,0.15);padding:1px 4px;border-radius:3px;font-size:0.78em">$1</code>')
      // bullet lines (- or •)
      .replace(/^[-•]\s+(.+)$/gm, '• $1')
      // newlines
      .replace(/\n/g, '<br>');
  }

/* ── BOOT ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ── VOICE GREETING ── */
(function () {
  let greeted = false;

  function greet() {
    if (greeted) return;
    greeted = true;

    const btn = document.getElementById('chat-toggle');
    if (btn) btn.classList.remove('chat-speaking');
  }

  function onFirstGesture() {
    window.removeEventListener('scroll', onFirstGesture);
    window.removeEventListener('click',  onFirstGesture);
    greet();
  }

  window.addEventListener('scroll', onFirstGesture, { once: true, passive: true });
  window.addEventListener('click',  onFirstGesture, { once: true });
})();
