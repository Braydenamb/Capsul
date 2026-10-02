import { ASSETS, T0, NDAYS } from '../core/analytics.js';
import { DAY, DOW, dS } from '../core/formatting.js';
import { state as S } from '../core/state.js';
import { getCurrentUser, logout, canAccessView } from '../auth/auth.js';

export const EVENTS = [];
ASSETS.forEach((a) => {
  if (a.fl >= 0) EVENTS.push([a.t[a.fl], a.tag + ': Capsul flags ' + a.ns[a.fl] + ' signals']);
  EVENTS.push([a.t[a.al], a.tag + ': DCS alarm']);
  EVENTS.push([a.failMs, a.tag + ': trip and outage']);
});
EVENTS.sort((p, q) => p[0] - q[0]);

export const TABS = {
  cmd: 'Command',
  inv: 'Investigate',
  act: 'Actions',
  fnd: 'Foundation',
  imp: 'Impact'
};

let replayOpen = false;
let userMenuOpen = false;

export function toggleReplayPopover(force) {
  replayOpen = typeof force === 'boolean' ? force : !replayOpen;
  const popover = document.querySelector('#replay-popover');
  const btn = document.querySelector('#replay-toggle');
  if (popover) {
    popover.classList.toggle('open', replayOpen);
  }
  if (btn) {
    btn.setAttribute('aria-expanded', String(replayOpen));
  }
}

export function toggleUserMenu(force) {
  userMenuOpen = typeof force === 'boolean' ? force : !userMenuOpen;
  const menu = document.querySelector('#user-menu');
  const btn = document.querySelector('#user-menu-toggle');
  if (menu) {
    menu.classList.toggle('open', userMenuOpen);
  }
  if (btn) {
    btn.setAttribute('aria-expanded', String(userMenuOpen));
  }
}

export function initHeader() {
  const headerEl = document.querySelector('#header');
  if (!headerEl) return;

  const user = getCurrentUser();
  if (!user) {
    headerEl.style.display = 'none';
    return;
  }
  headerEl.style.display = '';
  headerEl.className = 'single-header';

  headerEl.innerHTML = `
    <div class="header-inner">
      <div class="header-brand">Cap<i>sul</i></div>
      
      <nav id="tabs" class="header-nav" aria-label="Views"></nav>
      
      <div class="header-controls">
        <!-- Historical Replay Popover Trigger -->
        <button id="replay-toggle" class="header-pill replay-btn" aria-haspopup="true" aria-expanded="false" aria-label="Toggle historical replay controls">
          <span class="replay-icon" style="display:inline-flex;align-items:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </span>
          <span class="replay-date" id="dBig" style="font-family:var(--fm);font-weight:600;">${dS(S.ms, true)}</span>
          <span class="replay-badge">Replay ▾</span>
        </button>

        <!-- User / Utilities Dropdown Trigger -->
        <div class="user-menu-wrapper">
          <button id="user-menu-toggle" class="header-pill user-btn" aria-haspopup="true" aria-expanded="false" aria-label="User account and options menu">
            <span class="user-avatar">${user.name.charAt(0)}</span>
            <span class="user-name">${user.name}</span>
            <span class="user-role-tag">${user.role}</span>
          </button>
          
          <div id="user-menu" class="user-dropdown-menu" role="menu">
            <div class="user-dropdown-header">
              <b>${user.name}</b>
              <small>${user.title}</small>
            </div>
            <div class="user-dropdown-divider"></div>
            <button id="demo" class="menu-item" role="menuitem">
              <span class="icon" style="display:inline-flex;align-items:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span> Guided demo
            </button>
            <button id="how" class="menu-item" role="menuitem">
              <span class="icon" style="display:inline-flex;align-items:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span> How it works
            </button>
            <button id="theme" class="menu-item" role="menuitem">
              <span class="icon" style="display:inline-flex;align-items:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </span> Switch theme
            </button>
            <div class="user-dropdown-divider"></div>
            <button id="logout-btn" class="menu-item danger" role="menuitem">
              <span class="icon" style="display:inline-flex;align-items:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </span> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Collapsible Contextual Replay Control Bar -->
    <div id="replay-popover" class="replay-popover-panel" aria-label="Historical replay controls">
      <div class="replay-panel-inner">
        <div class="replay-info">
          <span class="clock-label">HISTORICAL VIEW</span>
          <small id="dSub" style="font-family:var(--fm);">${DOW[new Date(S.ms).getUTCDay()]} · simulated replay date</small>
        </div>
        <div class="replay-slider-wrapper">
          <input id="day" type="range" min="0" max="${NDAYS}" value="${Math.round((S.ms - T0) / DAY)}" aria-label="Replay date slider">
        </div>
        <div class="replay-actions">
          <button class="bt" id="prev-event" aria-label="Previous key event" title="Previous event">◄ Prev</button>
          <button class="bt pr" id="play" aria-label="Play or pause historical replay">${S.play ? 'Pause' : 'Play'}</button>
          <button class="bt" id="next-event" aria-label="Next key event" title="Next event">Next ►</button>
          <select id="jump" aria-label="Jump to a key moment">
            <option value="">Jump to key moment...</option>
            ${EVENTS.map((e) => `<option value="${e[0]}">${dS(e[0], true)} – ${e[1]}</option>`).join('')}
          </select>
          <button id="replay-close" class="bt q" aria-label="Close replay controls">✕</button>
        </div>
      </div>
    </div>
  `;

  // Attach event stepper listeners
  const prevBtn = document.querySelector('#prev-event');
  if (prevBtn) {
    prevBtn.onclick = () => {
      const past = EVENTS.filter(e => e[0] < S.ms);
      if (past.length > 0) {
        S.ms = past[past.length - 1][0];
        window.dispatchEvent(new CustomEvent('replay-change'));
      }
    };
  }

  const nextBtn = document.querySelector('#next-event');
  if (nextBtn) {
    nextBtn.onclick = () => {
      const upcoming = EVENTS.filter(e => e[0] > S.ms);
      if (upcoming.length > 0) {
        S.ms = upcoming[0][0];
        window.dispatchEvent(new CustomEvent('replay-change'));
      }
    };
  }

  // Attach toggle listeners
  const replayBtn = document.querySelector('#replay-toggle');
  if (replayBtn) {
    replayBtn.onclick = (e) => {
      e.stopPropagation();
      toggleUserMenu(false);
      toggleReplayPopover();
    };
  }

  const replayCloseBtn = document.querySelector('#replay-close');
  if (replayCloseBtn) {
    replayCloseBtn.onclick = () => toggleReplayPopover(false);
  }

  const userBtn = document.querySelector('#user-menu-toggle');
  if (userBtn) {
    userBtn.onclick = (e) => {
      e.stopPropagation();
      toggleReplayPopover(false);
      toggleUserMenu();
    };
  }

  const logoutBtn = document.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      logout();
      window.location.reload();
    };
  }

  // Close menus on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#header')) {
      toggleReplayPopover(false);
      toggleUserMenu(false);
    }
  });
}

export function head() {
  const user = getCurrentUser();
  const headerEl = document.querySelector('#header');
  if (!user) {
    if (headerEl) headerEl.style.display = 'none';
    return;
  }
  if (headerEl) headerEl.style.display = '';

  const dBig = document.querySelector('#dBig');
  const dSub = document.querySelector('#dSub');
  const day = document.querySelector('#day');
  const tabs = document.querySelector('#tabs');

  if (dBig) dBig.textContent = dS(S.ms, true);
  if (dSub) dSub.textContent = DOW[new Date(S.ms).getUTCDay()] + ' · historical replay, not live data';

  if (day) {
    day.max = NDAYS;
    day.value = Math.round((S.ms - T0) / DAY);
    day.setAttribute('aria-valuetext', dS(S.ms, true));
  }

  if (tabs) {
    tabs.innerHTML = Object.keys(TABS)
      .filter((k) => canAccessView(k))
      .map((k) => `<button data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${TABS[k]}</button>`)
      .join('');
  }
}
