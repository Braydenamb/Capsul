import { ASSETS, T0, NDAYS } from '../core/analytics.js';
import { DAY, DOW, dS } from '../core/formatting.js';
import { state as S } from '../core/state.js';

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

export function initHeader() {
  const headerEl = document.querySelector('#header');
  if (!headerEl) return;

  headerEl.className = 'bar';
  headerEl.innerHTML = `
    <div class="bar1">
      <div class="brand">Cap<i>sul</i></div>
      <nav id="tabs" aria-label="Views"></nav>
      <span class="sp"></span>
      <button class="bt pr" id="demo">Guided demo</button>
      <button class="bt hd-o" id="how">How it works</button>
      <button class="bt hd-o" id="theme" aria-label="Switch light or dark theme">Theme</button>
    </div>
    <div class="bar2">
      <div class="clock" aria-live="polite">
        <b id="dBig"></b>
        <small id="dSub"></small>
      </div>
      <input id="day" type="range" min="0" max="100" value="0" aria-label="Replay date">
      <button class="bt" id="play" aria-label="Play or pause the replay">Play</button>
      <select id="jump" aria-label="Jump to a key moment">
        <option value="">Jump to a key moment</option>
        ${EVENTS.map((e) => `<option value="${e[0]}">${dS(e[0], true)} – ${e[1]}</option>`).join('')}
      </select>
    </div>
  `;
}

export function head() {
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
      .map((k) => `<button data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${TABS[k]}</button>`)
      .join('');
  }
}
