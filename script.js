// =====================================================
// Nexus Horizon — Interactive Dashboard Script
// =====================================================

(function () {
  'use strict';

  // ---------------------------------------------------
  // Theme Toggle
  // ---------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  // Persist theme across reloads
  const savedTheme = localStorage.getItem('nexus-theme') || 'adaptive';
  root.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' || current === 'adaptive' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('nexus-theme', next);
    });
  }

  // Keyboard shortcut: Ctrl+T to toggle theme
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 't') {
      e.preventDefault();
      if (themeToggle) themeToggle.click();
    }
  });

  // ---------------------------------------------------
  // Dynamic Greeting Based on Time of Day
  // ---------------------------------------------------
  const greetingEl = document.querySelector('.greeting h1');
  if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    greetingEl.textContent = greeting + ', Alex';
  }

  // ---------------------------------------------------
  // Mobile Sidebar Toggle
  // ---------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // ---------------------------------------------------
  // Sidebar Navigation — Active State
  // ---------------------------------------------------
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');
      // Close sidebar on mobile after selecting
      closeSidebar();
    });
  });

  // ---------------------------------------------------
  // Notification Dropdown
  // ---------------------------------------------------
  const notifBell = document.getElementById('notifBell');
  const notifDropdown = document.getElementById('notifDropdown');

  if (notifBell && notifDropdown) {
    notifBell.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('active');
      // Hide badge when opened
      const badge = notifBell.querySelector('.notification-badge');
      if (badge) badge.style.display = 'none';
    });

    // Mark individual notifications as read on click
    notifDropdown.querySelectorAll('.notif-item').forEach((item) => {
      item.addEventListener('click', () => {
        item.classList.remove('unread');
      });
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBell) {
      notifDropdown.classList.remove('active');
    }
  });

  // ---------------------------------------------------
  // Quick Actions — Click Feedback
  // ---------------------------------------------------
  const actionCards = document.querySelectorAll('.action-card');
  actionCards.forEach((card) => {
    card.addEventListener('click', () => {
      const label = card.querySelector('.action-label');
      const name = label ? label.textContent : 'Action';
      showToast(name + ' — Coming soon!');
    });
  });

  // Action buttons (Send Money, Request)
  document.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      showToast(text + ' — Coming soon!');
    });
  });

  // View All link
  const viewAll = document.querySelector('.view-all');
  if (viewAll) {
    viewAll.addEventListener('click', () => {
      showToast('Full transaction history — Coming soon!');
    });
  }

  // Insight actions
  document.querySelectorAll('.insight-action').forEach((action) => {
    action.addEventListener('click', () => {
      showToast(action.textContent.trim() + ' — Coming soon!');
    });
  });

  // ---------------------------------------------------
  // Toast Notification System
  // ---------------------------------------------------
  function showToast(message) {
    // Remove any existing toast
    const existing = document.querySelector('.nexus-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'nexus-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'var(--primary)',
      color: 'white',
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: '0.9rem',
      fontWeight: '500',
      boxShadow: '0 8px 32px rgba(0, 102, 255, 0.3)',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    });
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ---------------------------------------------------
  // Chart Tooltip (Hover on Dots)
  // ---------------------------------------------------
  const chartTooltip = document.getElementById('chartTooltip');
  const chartDots = document.querySelectorAll('.chart-dot');
  const chartWrapper = document.querySelector('.chart-svg-wrapper');

  chartDots.forEach((dot) => {
    dot.addEventListener('mouseenter', (e) => {
      if (!chartTooltip || !chartWrapper) return;
      const label = dot.getAttribute('data-label');
      const value = dot.getAttribute('data-value');
      const type = dot.getAttribute('fill').includes('primary') ? 'Income' : 'Spending';
      chartTooltip.innerHTML = '<strong>' + label + '</strong> ' + type + ': ' + value;
      chartTooltip.style.display = 'block';

      const rect = chartWrapper.getBoundingClientRect();
      const dotRect = dot.getBoundingClientRect();
      chartTooltip.style.left = (dotRect.left - rect.left + dotRect.width / 2) + 'px';
      chartTooltip.style.top = (dotRect.top - rect.top - 40) + 'px';
    });

    dot.addEventListener('mouseleave', () => {
      if (chartTooltip) chartTooltip.style.display = 'none';
    });
  });

  // ---------------------------------------------------
  // AI Chat Panel
  // ---------------------------------------------------
  const aiBtn = document.getElementById('aiAssistantBtn');
  const aiPanel = document.getElementById('aiChatPanel');
  const aiClose = document.getElementById('aiChatClose');
  const aiInput = document.getElementById('aiChatInput');
  const aiSend = document.getElementById('aiChatSend');
  const aiMessages = document.getElementById('aiChatMessages');

  if (aiBtn && aiPanel) {
    aiBtn.addEventListener('click', () => {
      aiPanel.classList.toggle('active');
      if (aiPanel.classList.contains('active') && aiInput) {
        setTimeout(() => aiInput.focus(), 100);
      }
    });
  }

  if (aiClose && aiPanel) {
    aiClose.addEventListener('click', () => {
      aiPanel.classList.remove('active');
    });
  }

  // Predefined AI responses based on keywords
  const aiResponses = {
    balance: "Your current balance is $42,689.42 across all accounts. Your primary checking account holds the majority, with $8,240 in savings.",
    spend: "This month you've spent $2,750 so far. Dining is your top category at $420 (15% above last month). Subscriptions total $89.97.",
    save: "Based on your income pattern, I recommend setting aside $600/month. You could reach a $10,000 emergency fund in about 8 months!",
    invest: "Your portfolio is up 4.2% this quarter. I noticed you have $5,000 in low-yield savings — moving it to a high-yield account could earn an extra $1,200 annually.",
    budget: "Your monthly budget breakdown: Housing 35%, Food 18%, Transport 12%, Entertainment 8%, Savings 15%, Other 12%. Dining is trending above budget.",
    transfer: "You can transfer between your accounts instantly, or to external accounts within 1-2 business days. Would you like me to set up a transfer?",
    bill: "You have 3 upcoming bills: Internet ($79.99 due Mar 5), Insurance ($245 due Mar 10), and Gym ($29.99 due Mar 15). All are set to auto-pay.",
    loan: "Your outstanding student loan balance is $12,400 at 4.5% APR. At your current payment rate, you'll be debt-free in 2.5 years.",
    help: "I can help you with: checking your balance, tracking spending, setting budgets, finding savings opportunities, reviewing investments, managing bills, and more. Just ask!",
  };

  function getAIResponse(input) {
    const lower = input.toLowerCase();
    for (const [key, response] of Object.entries(aiResponses)) {
      if (lower.includes(key)) return response;
    }
    return "I'd be happy to help with that! For detailed analysis, try asking about your balance, spending, savings, investments, budget, bills, or loans.";
  }

  function addMessage(text, type) {
    if (!aiMessages) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    msg.textContent = text;
    aiMessages.appendChild(msg);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function handleSend() {
    if (!aiInput) return;
    const text = aiInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    aiInput.value = '';

    // Simulated typing delay
    setTimeout(() => {
      addMessage(getAIResponse(text), 'bot');
    }, 600);
  }

  if (aiSend) aiSend.addEventListener('click', handleSend);
  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // ---------------------------------------------------
  // Transaction Item Hover — Expand Details
  // ---------------------------------------------------
  document.querySelectorAll('.transaction-item').forEach((item) => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const name = item.querySelector('.transaction-name');
      const amount = item.querySelector('.transaction-amount');
      if (name && amount) {
        showToast(name.textContent + ': ' + amount.textContent);
      }
    });
  });

  // ---------------------------------------------------
  // Animate Balance on Load
  // ---------------------------------------------------
  const balanceEl = document.querySelector('.account-balance');
  if (balanceEl) {
    const targetBalance = 42689.42;
    const duration = 1200;
    const start = performance.now();

    function animateBalance(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = targetBalance * ease;
      balanceEl.textContent = '$' + current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      if (progress < 1) requestAnimationFrame(animateBalance);
    }

    balanceEl.textContent = '$0.00';
    requestAnimationFrame(animateBalance);
  }

  // ---------------------------------------------------
  // Stagger-In Animation for Dashboard Cards
  // ---------------------------------------------------
  const cards = document.querySelectorAll('.holographic-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + i * 120);
  });
})();
