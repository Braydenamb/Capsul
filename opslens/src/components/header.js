import { ASSETS, T0, NDAYS } from '../core/analytics.js';
import { DAY, DOW, dS, fmtK } from '../core/formatting.js';
import { INC } from '../core/incidents.js';
import { state as S } from '../core/state.js';
import { getCurrentUser, logout, canAccessView } from '../auth/auth.js';

export const EVENTS = [];
ASSETS.forEach((a) => {
  if (a.fl >= 0) EVENTS.push([a.t[a.fl], a.tag + ': Capsul flags ' + a.ns[a.fl] + ' signals']);
  EVENTS.push([a.t[a.al], a.tag + ': DCS alarm']);
  EVENTS.push([a.failMs, a.tag + ': trip and outage']);
});
EVENTS.sort((p, q) => p[0] - q[0]);

export function getEventMap() {
  const map = {};
  ASSETS.forEach((a) => {
    if (a.fl >= 0) {
      const d = dS(a.t[a.fl], true);
      (map[d] = map[d] || []).push({ type: 'warning', asset: a.tag, text: `${a.tag}: Capsul flag (${a.ns[a.fl]} signals >3σ)` });
    }
    if (a.al >= 0) {
      const d = dS(a.t[a.al], true);
      (map[d] = map[d] || []).push({ type: 'alarm', asset: a.tag, text: `${a.tag}: DCS alarm fired` });
    }
    if (a.failMs) {
      const d = dS(a.failMs, true);
      (map[d] = map[d] || []).push({ type: 'trip', asset: a.tag, text: `${a.tag}: Trip & outage (${a.r.dt} h, ${fmtK(a.r.loss)})` });
    }
  });

  INC.forEach((i) => {
    const d = dS(i.ms, true);
    (map[d] = map[d] || []).push({ type: 'incident', asset: i.tag, text: `${i.tag}: ${i.title.replace(/^.*?— /, '')}` });
  });

  return map;
}

export const TABS = {
  cmd: 'Command',
  inv: 'Investigate',
  act: 'Actions',
  fnd: 'Foundation',
  imp: 'Impact'
};

let calOpen = false;
let userMenuOpen = false;
let calYear = new Date(S.ms).getUTCFullYear();
let calMonth = new Date(S.ms).getUTCMonth();

export function toggleCalendarPopover(force) {
  calOpen = typeof force === 'boolean' ? force : !calOpen;
  const popover = document.querySelector('#calendar-popover');
  const btn = document.querySelector('#date-picker-toggle');
  if (popover) {
    popover.classList.toggle('open', calOpen);
    if (calOpen) {
      calYear = new Date(S.ms).getUTCFullYear();
      calMonth = new Date(S.ms).getUTCMonth();
      renderCalendarGrid();
    }
  }
  if (btn) {
    btn.setAttribute('aria-expanded', String(calOpen));
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

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function renderCalendarGrid() {
  const gridEl = document.querySelector('#cal-days-grid');
  const titleEl = document.querySelector('#cal-month-year');
  if (!gridEl || !titleEl) return;

  titleEl.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

  const eventMap = getEventMap();
  const firstDay = new Date(Date.UTC(calYear, calMonth, 1));
  const startingDayOfWeek = (firstDay.getUTCDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(Date.UTC(calYear, calMonth + 1, 0)).getUTCDate();
  const activeDateStr = dS(S.ms, true);

  let html = '';

  // Padding days from previous month
  const prevMonthDays = new Date(Date.UTC(calYear, calMonth, 0)).getUTCDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    html += `<div class="cal-day-cell other-month"><span>${dayNum}</span></div>`;
  }

  // Days of active month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayMs = Date.UTC(calYear, calMonth, day);
    const dayStr = dS(dayMs, true);
    const isSelected = dayStr === activeDateStr;
    const events = eventMap[dayStr] || [];

    let dotsHtml = '';
    if (events.length > 0) {
      const types = [...new Set(events.map((e) => e.type))];
      dotsHtml = `<div class="cal-dots-row">${types
        .map((t) => `<i class="cal-dot ${t === 'trip' ? 'dot-red' : t === 'warning' ? 'dot-amber' : 'dot-blue'}"></i>`)
        .join('')}</div>`;
    }

    html += `
      <button class="cal-day-cell" data-dms="${dayMs}" data-daystr="${dayStr}" aria-selected="${isSelected}" title="${events.length ? events.map(e => e.text).join(' | ') : dayStr}">
        <span>${day}</span>
        ${dotsHtml}
      </button>
    `;
  }

  gridEl.innerHTML = html;

  // Attach cell click and hover listeners
  gridEl.querySelectorAll('.cal-day-cell[data-dms]').forEach((cell) => {
    cell.onclick = (e) => {
      e.stopPropagation();
      const ms = +cell.dataset.dms;
      if (!isNaN(ms)) {
        S.ms = ms;
        window.dispatchEvent(new CustomEvent('replay-change'));
        toggleCalendarPopover(false);
      }
    };

    cell.onmouseenter = () => {
      const dayStr = cell.dataset.daystr;
      const events = eventMap[dayStr] || [];
      const previewEl = document.querySelector('#cal-preview-box');
      if (previewEl) {
        if (events.length > 0) {
          previewEl.innerHTML = `<b>${dayStr}</b> · ${events[0].text}`;
        } else {
          previewEl.innerHTML = `<span class="cal-preview-placeholder">${dayStr} · No historical events</span>`;
        }
      }
    };
  });
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
        <!-- Stockbit-Style Compact Event-Aware Historical Control -->
        <div class="stockbit-date-control" aria-label="Historical Date Navigation">
          <button id="prev-event" class="date-step-btn" title="Previous event date">‹</button>
          
          <div class="cal-picker-wrapper">
            <button id="date-picker-toggle" class="date-picker-pill" aria-haspopup="dialog" aria-expanded="false" title="Click to open calendar">
              <span class="cal-pill-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <span id="dBig" class="cal-pill-date">${dS(S.ms, true)}</span>
              <span class="cal-pill-chevron">▾</span>
            </button>

            <!-- Data-Aware Calendar Popover -->
            <div id="calendar-popover" class="calendar-popover-panel" role="dialog" aria-label="Historical Event Calendar">
              <div class="cal-popover-hdr">
                <button id="cal-prev-month" class="cal-nav-btn" aria-label="Previous month">‹</button>
                <span id="cal-month-year" class="cal-title-txt"></span>
                <button id="cal-next-month" class="cal-nav-btn" aria-label="Next month">›</button>
              </div>

              <div class="cal-weekdays-row">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>

              <div id="cal-days-grid" class="cal-days-grid"></div>

              <div class="cal-legend-bar">
                <span><i class="dot dot-red"></i>Trip</span>
                <span><i class="dot dot-amber"></i>Warning</span>
                <span><i class="dot dot-blue"></i>Alarm/RCA</span>
              </div>

              <div id="cal-preview-box" class="cal-preview-box">
                <span class="cal-preview-placeholder">Hover or tap a date for event details</span>
              </div>
            </div>
          </div>

          <button id="next-event" class="date-step-btn" title="Next event date">›</button>
        </div>

        <!-- User / Utilities Dropdown Trigger -->
        <div class="user-menu-wrapper">
          <button id="user-menu-toggle" class="header-pill user-btn" aria-haspopup="true" aria-expanded="false" aria-label="User account menu">
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
  `;

  // Attach event stepper listeners
  const prevBtn = document.querySelector('#prev-event');
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      const past = EVENTS.filter((evt) => evt[0] < S.ms);
      if (past.length > 0) {
        S.ms = past[past.length - 1][0];
        window.dispatchEvent(new CustomEvent('replay-change'));
      }
    };
  }

  const nextBtn = document.querySelector('#next-event');
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      const upcoming = EVENTS.filter((evt) => evt[0] > S.ms);
      if (upcoming.length > 0) {
        S.ms = upcoming[0][0];
        window.dispatchEvent(new CustomEvent('replay-change'));
      }
    };
  }

  // Attach calendar toggle listener
  const dateToggleBtn = document.querySelector('#date-picker-toggle');
  if (dateToggleBtn) {
    dateToggleBtn.onclick = (e) => {
      e.stopPropagation();
      toggleUserMenu(false);
      toggleCalendarPopover();
    };
  }

  // Calendar month navigation
  const prevMonthBtn = document.querySelector('#cal-prev-month');
  if (prevMonthBtn) {
    prevMonthBtn.onclick = (e) => {
      e.stopPropagation();
      calMonth--;
      if (calMonth < 0) {
        calMonth = 11;
        calYear--;
      }
      renderCalendarGrid();
    };
  }

  const nextMonthBtn = document.querySelector('#cal-next-month');
  if (nextMonthBtn) {
    nextMonthBtn.onclick = (e) => {
      e.stopPropagation();
      calMonth++;
      if (calMonth > 11) {
        calMonth = 0;
        calYear++;
      }
      renderCalendarGrid();
    };
  }

  const userBtn = document.querySelector('#user-menu-toggle');
  if (userBtn) {
    userBtn.onclick = (e) => {
      e.stopPropagation();
      toggleCalendarPopover(false);
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
      toggleCalendarPopover(false);
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
  const tabs = document.querySelector('#tabs');

  if (dBig) dBig.textContent = dS(S.ms, true);

  if (tabs) {
    tabs.innerHTML = Object.keys(TABS)
      .filter((k) => canAccessView(k))
      .map((k) => `<button data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${TABS[k]}</button>`)
      .join('');
  }
}
