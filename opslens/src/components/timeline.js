import { ASSETS, T0, T1, pct } from '../core/analytics.js';
import { DAY, MON } from '../core/formatting.js';
import { state as S } from '../core/state.js';

export function ribbon() {
  const lanes = ASSETS.map((a) => {
    const g = [];
    for (let i = 0; i < 26; i++) {
      const s = a.wst[i],
        st = a.t[i],
        en = i < 25 ? a.t[i + 1] : a.t[i] + 7 * DAY;
      if (g.length && g[g.length - 1].s === s) g[g.length - 1].en = en;
      else g.push({ s, st, en });
    }
    return `<div class="lane">${g.map((x) => `<i class="${x.s}" style="left:${pct(x.st)}%;width:${pct(x.en) - pct(x.st)}%"></i>`).join('')}</div>`;
  }).join('');
  let ax = '',
    first = true;
  for (let y = 2025, m = 9; ; ) {
    const ms = Date.UTC(y, m, 1);
    if (ms > T1) break;
    if (ms >= T0) {
      ax += `<span style="left:${pct(ms)}%">${MON[m]}${first || m === 0 ? ' ' + String(y).slice(2) : ''}</span>`;
      first = false;
    }
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  const lab = ASSETS.map(
    (a) =>
      `<button data-open="${a.tag}" aria-label="Open ${a.tag}"><b>${a.tag}</b><small>${a.lead > 0 ? 'Capsul ' + a.lead + ' wk ahead' : a.lead < 0 ? 'DCS ' + -a.lead + ' wk first' : 'same week'}</small></button>`
  ).join('');
  return `<div class="rib"><div class="rib-l"><div class="ax"></div>${lab}</div><div class="rib-t" id="ribt" title="Drag to move through time"><div class="axis">${ax}</div>${lanes}<div class="mask" style="left:${pct(S.ms)}%"></div><div class="ph" style="left:${pct(S.ms)}%"></div></div></div>
  <div class="legend"><span><i class="sw N"></i>Normal</span><span><i class="sw W" style="background:repeating-linear-gradient(135deg,var(--W) 0 4px,color-mix(in srgb,var(--W) 45%,var(--panel)) 4px 7px)"></i>Watch: Capsul flag, DCS silent</span><span><i class="sw A"></i>Alarm: DCS</span><span><i class="sw T"></i>Trip</span><span><i class="sw R"></i>Recovery after repair</span></div>`;
}
