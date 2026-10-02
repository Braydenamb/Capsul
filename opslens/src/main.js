import './styles/main.css';

import { state as S } from './core/state.js';
import { D0, DAY, dS, nf, clamp, MON, NM } from './core/formatting.js';
import { calc, T0, T1, NDAYS, byTag, at, HEALTHY, impRes } from './core/analytics.js';
import { initHeader, head } from './components/header.js';
import { cap, capOff, openModal } from './components/modal.js';
import { tankRows, wvHTML } from './views/command.js';
import { OFF, fmtSig } from './views/investigate.js';
import { items } from './views/actions.js';
import { initAuth, isAuthenticated, canAccessView, getCurrentUser, canPerform } from './auth/auth.js';
import { renderLoginView } from './components/login.js';

import { renderCommandView } from './views/command.js';
import { renderInvestigateView } from './views/investigate.js';
import { renderActionsView } from './views/actions.js';
import { renderFoundationView } from './views/foundation.js';
import { renderImpactView } from './views/impact.js';

const VIEW = {
  cmd: renderCommandView,
  inv: renderInvestigateView,
  act: renderActionsView,
  fnd: renderFoundationView,
  imp: renderImpactView
};

export function getTabFromHash() {
  const hash = window.location.hash.replace('#', '').trim();
  const validTabs = ['cmd', 'inv', 'act', 'fnd', 'imp'];
  return validTabs.includes(hash) ? hash : null;
}

export function syncRoute() {
  const hashTab = getTabFromHash();
  const user = getCurrentUser();
  if (hashTab && canAccessView(hashTab)) {
    S.tab = hashTab;
  } else if (!canAccessView(S.tab)) {
    S.tab = (user && (user.defaultView || user.allowedViews[0])) || 'cmd';
    try { history.replaceState(null, '', '#' + S.tab); } catch(e) { window.location.hash = S.tab; }
  } else if (!hashTab) {
    try { history.replaceState(null, '', '#' + S.tab); } catch(e) { window.location.hash = S.tab; }
  }
}

export function render() {
  if (!isAuthenticated()) {
    initHeader();
    renderLoginView(() => {
      initHeader();
      syncRoute();
      render();
    });
    return;
  }

  syncRoute();
  calc();
  initHeader();
  head();

  const app = document.querySelector('#app');
  if (app) {
    app.innerHTML = VIEW[S.tab]();
  }
}

export function go(t, scroll = true) {
  if (!canAccessView(t)) {
    cap('Access restricted to your current role profile.', 2500);
    return;
  }
  S.tab = t;
  if (window.location.hash !== '#' + t) {
    window.location.hash = t;
  }
  render();
  if (scroll) window.scrollTo(0, 0);
}

window.addEventListener('hashchange', () => {
  const tab = getTabFromHash();
  if (tab && tab !== S.tab && canAccessView(tab)) {
    S.tab = tab;
    render();
  }
});
window.addEventListener('popstate', () => {
  const tab = getTabFromHash();
  if (tab && tab !== S.tab && canAccessView(tab)) {
    S.tab = tab;
    render();
  }
});
window.addEventListener('replay-change', () => {
  render();
});

let pend = false;
export const sched = () => {
  if (pend) return;
  pend = true;
  requestAnimationFrame(() => {
    pend = false;
    render();
  });
};

export const setDate = (ms, soft) => {
  S.ms = clamp(ms, T0, T1);
  soft ? sched() : render();
};

export function verifyMsg(a) {
  const s = at(a, S.ms);
  return `Not yet. ${a.sig[0].n} is ${s.i >= 0 ? fmtSig(a, 0, Math.min(s.i, 25)) : 'not monitored'}, still off its baseline of ${nf(a.base[0].m)} ${a.sig[0].u}. Move the timeline to ${dS(a.t[21], true)} or later to verify.`;
}

export function pushActionState(desc) {
  if (!S.actionHistory) S.actionHistory = [];
  S.actionHistory.push({
    desc,
    created: JSON.stringify(S.created),
    ack: JSON.stringify(S.ack),
    fb: JSON.stringify(S.fb),
    mv: JSON.stringify(S.mv),
    dis: JSON.stringify(S.dis),
    res: JSON.stringify(S.res)
  });
}

export function undoLastAction() {
  if (!S.actionHistory || S.actionHistory.length === 0) {
    cap('No action to undo.', 2000);
    return;
  }
  const snap = S.actionHistory.pop();
  S.created = JSON.parse(snap.created);
  S.ack = JSON.parse(snap.ack);
  S.fb = JSON.parse(snap.fb);
  S.mv = JSON.parse(snap.mv);
  S.dis = JSON.parse(snap.dis);
  S.res = JSON.parse(snap.res);
  render();
  cap(`<b>Action undone:</b> ${snap.desc}`, 3500);
}
window.undoLastAction = undoLastAction;

// Global click event delegation
document.addEventListener('click', (e) => {
  const t = e.target;

  // Header specific actions via delegation
  if (t.closest('#theme')) {
    const r = document.documentElement;
    const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    r.dataset.theme = dark ? 'light' : 'dark';
    return;
  }

  if (t.closest('#how')) {
    openModal(`<h2>How Capsul works</h2>
<p><b>Early warning.</b> For each signal we take the mean and spread of its first 5 weeks. A signal counts when it is more than 3σ from that baseline in the harmful direction. An asset is flagged when 3 of its 4 signals count in the same week. In ${HEALTHY.n} healthy weeks the rule raised ${HEALTHY.fp} flags.</p>
<p><b>Priority index, 0 to 100.</b> A configurable heuristic, not a calibrated probability. A weighted mix of four things: criticality class, how many signals agree, time to trip (straight-line trend of each signal to its trip limit) and cost if it fails. Change the weights in the Problem tank and the queue re-ranks.</p>
<p><b>Cause and evidence.</b> Cause hypotheses and ruled-out checks come from the 4P and 4M+1E tables in the RCA reports. Evidence strength is how far the linked signals sit beyond baseline. In this replay the RCA written after each failure is the knowledge base. In live use it would be earlier, similar RCAs.</p>
<p><b>Similar incidents.</b> All 380 incidents are scored on equipment type (40), component (35) and failure mechanism (25), using only incidents before the replay date.</p>
<p><b>Loss at stake.</b> Loss per hour from the RCA times the average outage of similar failures in the Incident DB.</p>
<p><b>Closing an action.</b> It closes only after the main signal is back at baseline, so move the timeline past the repair date.</p>
<p><b>Decision loop.</b> Every alert moves through Detect, Explain, Decide, Act and Verify. A person confirms or rejects the cause, acknowledges the alert within a severity-based time (Tier 1 to 3, otherwise it escalates), accepts the action, and the loop only closes when the signal recovers. Feedback is written back to the knowledge base.</p>
<p><b>Simulated.</b> Energy (modelled from HE-3301 heat duty), the count of seven legacy reports, and the scenario assumptions on the Impact page. Everything else comes from the four datasets.</p><button class="btn pr" onclick="this.closest('dialog').close()" style="margin-top:12px">Close</button>`);
    return;
  }

  if (t.closest('#play')) {
    const playBtn = document.querySelector('#play');
    if (S.play) {
      clearInterval(S.play);
      S.play = null;
      if (playBtn) playBtn.textContent = 'Play';
      return;
    }
    if (S.ms >= T1 - DAY) S.ms = T0;
    if (playBtn) playBtn.textContent = 'Pause';
    S.play = setInterval(() => {
      S.ms += DAY;
      if (S.ms >= T1) {
        S.ms = T1;
        clearInterval(S.play);
        S.play = null;
        const pb = document.querySelector('#play');
        if (pb) pb.textContent = 'Play';
      }
      render();
    }, 110);
    return;
  }

  if (t.closest('#demo')) {
    if (S.demo) {
      stopDemo(true);
      return;
    }
    startDemo();
    return;
  }

  const d = t.closest(
    '[data-tab],[data-open],[data-lens],[data-filt],[data-clr],[data-mode],[data-ev],[data-inc],[data-mk],[data-mv],[data-dis],[data-res],[data-af],[data-reset],[data-ack],[data-fb],[data-stage]'
  );
  if (!d) return;
  const q = d.dataset;

  if (q.stage !== undefined) {
    S.actionStage = +q.stage;
    render();
  } else if (q.tab) go(q.tab);
  else if (q.open) {
    S.sel = q.open;
    S.ev = null;
    S.evI = null;
    S.inc = null;
    go('inv');
  } else if (q.lens) {
    S.lens = q.lens;
    render();
  } else if (q.filt) {
    S.f[q.filt] = S.f[q.filt] === q.v ? null : q.v;
    render();
  } else if (q.clr) {
    S.f = {};
    render();
  } else if (q.mode) {
    S.mode = q.mode;
    render();
  } else if (q.ev !== undefined) {
    if (q.ev === 'x' || S.evI === +q.ev) {
      S.ev = null;
      S.evI = null;
    } else {
      const a = byTag(S.sel),
        arr = a.c.phys[+q.ev].sig;
      S.ev = arr;
      S.evI = +q.ev;
    }
    render();
  } else if (q.inc) {
    S.inc = S.inc === +q.inc ? null : +q.inc;
    render();
  } else if (q.mk) {
    if (!canPerform('action:create') && !canPerform('createAction')) {
      cap('<b>Unauthorized:</b> Your role cannot create actions.', 3500);
      return;
    }
    pushActionState('Create Action Assignment');
    S.created[q.mk] = {
      ms: S.ms,
      due: S.ms + OFF[byTag(q.mk.split('|')[0]).c.acts[+q.mk.split('|')[1]].ty] * DAY
    };
    delete S.dis[q.mk];
    render();
    cap('<b>Action created.</b> It is on the Actions board. <button class="btn q sm" onclick="window.undoLastAction()" style="margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;color:var(--brand);">Undo</button>', 5000);
  } else if (q.ack) {
    pushActionState('Acknowledge Alert');
    S.ack[q.ack] = S.ms;
    render();
    cap('<b>Alert acknowledged.</b> Escalation clock stopped. <button class="btn q sm" onclick="window.undoLastAction()" style="margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;color:var(--brand);">Undo</button>', 4500);
  } else if (q.fb) {
    pushActionState('Cause Verification Feedback');
    const [tag, v] = q.fb.split('|');
    S.fb[tag] = v;
    render();
    cap(
      '<b>Saved to knowledge base.</b> <button class="btn q sm" onclick="window.undoLastAction()" style="margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;color:var(--brand);">Undo</button>',
      4500
    );
  } else if (q.dis) {
    if (!canPerform('action:dismiss')) {
      cap('<b>Unauthorized:</b> Dismissing recommendations requires Reliability or Executive role.', 3500);
      return;
    }
    pushActionState('Dismiss Recommendation');
    S.dis[q.dis] = 1;
    render();
    cap('<b>Recommendation dismissed.</b> <button class="btn q sm" onclick="window.undoLastAction()" style="margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;color:var(--brand);">Undo</button>', 4500);
  } else if (q.mv) {
    const [tag, n] = q.mv.split('|'),
      a = byTag(tag),
      it = items().find((i) => i.key === q.mv);
    if (!it) return;

    if (it.col === 0) {
      if (!canPerform('action:start')) {
        cap('<b>Unauthorized:</b> Starting work requires Operations, Maintenance, or Admin role.', 3500);
        return;
      }
    } else if (it.col === 1) {
      if (!canPerform('action:submit')) {
        cap('<b>Unauthorized:</b> Submitting for verification requires Operations, Maintenance, or Admin role.', 3500);
        return;
      }
    } else if (it.col === 2) {
      if (!canPerform('action:verify') && !canPerform('verifyAction')) {
        cap('<b>Unauthorized:</b> Verification and closure requires Reliability, Executive, or Admin role.', 3500);
        return;
      }
      if (at(a, S.ms).i < 21) {
        cap(verifyMsg(a), 6000);
        return;
      }
      pushActionState('Verify & Close Action');
      S.mv[q.mv] = 3;
      cap(
        `<b>Verified.</b> ${a.sig[0].n} is back at baseline. Action closed. <button class="btn q sm" onclick="window.undoLastAction()" style="margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;color:var(--brand);">Undo</button>`,
        5000
      );
      render();
      return;
    }

    pushActionState('Transition Action Stage');
    S.mv[q.mv] = it.col + 1;
    cap('<b>Action stage updated.</b> <button class="btn q sm" onclick="window.undoLastAction()" style="margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;color:var(--brand);">Undo</button>', 4500);
    render();
  } else if (q.res) {
    pushActionState('Data Quality Resolution');
    const [id, v] = q.res.split('|');
    if (v) S.res[id] = { val: v, ms: S.ms };
    else delete S.res[id];
    render();
    cap('<b>Golden record decision saved.</b> <button class="btn q sm" onclick="window.undoLastAction()" style="margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;color:var(--brand);">Undo</button>', 4500);
  } else if (q.af) {
    S.af = q.af;
    render();
  } else if (q.reset) {
    pushActionState('Reset Board State');
    S.created = {};
    S.ack = {};
    S.fb = {};
    S.mv = {};
    S.dis = {};
    S.res = {};
    render();
    cap('<b>Board state reset.</b> <button class="btn q sm" onclick="window.undoLastAction()" style="margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;color:var(--brand);">Undo</button>', 4500);
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('[role=button][tabindex],tr[tabindex]'))
    e.target.click();
});

// Input controls (sliders & selectors)
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'day') {
    S.ms = T0 + +t.value * DAY;
    sched();
  } else if (t.dataset.w) {
    S.W[t.dataset.w] = +t.value;
    const tr = document.querySelector('#tankrows');
    if (tr) tr.innerHTML = tankRows();
    document.querySelectorAll('.wv').forEach((x) => (x.textContent = S.W[x.dataset.k]));
  } else if (t.dataset.im) {
    S.I[t.dataset.im] = +t.value;
    const vEl = document.querySelector('#v-' + t.dataset.im);
    if (vEl) vEl.textContent = t.value + (t.dataset.im === 'cap' || t.dataset.im === 'red' ? '%' : ' h');
    const imr = document.querySelector('#imres');
    if (imr) imr.innerHTML = impRes();
  }
});

document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'jump' && t.value) {
    setDate(+t.value);
    t.value = '';
  } else if (t.dataset.acttype) {
    S.actType = t.value;
    render();
  } else if (t.dataset.actowner) {
    S.actOwner = t.value;
    render();
  } else if (t.dataset.actsort) {
    S.actSort = t.value;
    render();
  } else if (t.dataset.dqsev) {
    S.dqFilter.sev = t.value;
    render();
  } else if (t.dataset.dqstatus) {
    S.dqFilter.status = t.value;
    render();
  } else if (t.dataset.dqsort) {
    S.dqFilter.sort = t.value;
    render();
  }
});

// Synchronized Telemetry Charts Crosshair & Tooltip inspection
// pinned state: stores {frac} when user clicks to freeze the crosshair
let chPinned = null;

function updateCrosshair(mg, frac) {
  const pl = 40, pr = 10, W = 330, H = 148, pt = 14, pb = 34;
  const xDot = W - pr;
  const panels = mg.querySelectorAll('.mc');
  const STATE_LABELS = { N: 'Normal', W: 'Watch', A: 'Alarm', T: 'Trip', R: 'Recovery' };
  const STATE_COLORS = { N: 'var(--N)', W: 'var(--W)', A: 'var(--A)', T: 'var(--T)', R: 'var(--brand)' };

  panels.forEach((panel) => {
    const pSvg = panel.querySelector('svg.telemetry-svg');
    const overlay = panel.querySelector('.ch-overlay');
    if (!pSvg || !overlay) return;

    try {
      const vData = JSON.parse(pSvg.dataset.v || '[]');
      const tData = JSON.parse(pSvg.dataset.t || '[]');
      const lo = +pSvg.dataset.lo;
      const hi = +pSvg.dataset.hi;
      const unit = pSvg.dataset.u || '';
      const alarmLim = +pSvg.dataset.al;
      const tripLim = +pSvg.dataset.tr;
      let states = [];
      try { states = JSON.parse(pSvg.dataset.states || '[]'); } catch(e) {}

      const tStart = +pSvg.dataset.tstart;
      const tEnd = +pSvg.dataset.tend;
      const tHover = tStart + frac * (tEnd - tStart);

      // Find nearest reading index and interpolate value
      // Don't interpolate across the trip→recovery gap (index 20→21)
      let val = null;
      let nearIdx = -1;
      let inOutage = false;
      if (tData.length > 0) {
        let k = 0;
        while (k < tData.length - 1 && tData[k + 1] <= tHover) k++;
        nearIdx = k;
        // Check if hovering inside the outage gap (between index 20 and 21)
        if (k === 20 && tData.length > 21 && tHover > tData[20] && tHover < tData[21]) {
          inOutage = true;
          val = null;
        } else if (k < tData.length - 1) {
          const t0 = tData[k], t1 = tData[k + 1];
          const f = t1 > t0 ? (tHover - t0) / (t1 - t0) : 0;
          val = vData[k] + f * (vData[k + 1] - vData[k]);
        } else {
          val = vData[k] ?? null;
        }
      }

      const xPos = pl + frac * (xDot - pl);

      // Determine state at this point
      const stateKey = nearIdx >= 0 && nearIdx < states.length ? states[nearIdx] : 'N';
      const stateLabel = STATE_LABELS[stateKey] || 'Normal';
      const dotColor = STATE_COLORS[stateKey] || 'var(--brand)';

      const line = overlay.querySelector('.ch-v');
      const circle = overlay.querySelector('.ch-c');
      const tipG = overlay.querySelector('.ch-tip');
      const tipL1 = overlay.querySelector('.ch-tip-l1');
      const tipL2 = overlay.querySelector('.ch-tip-l2');

      if (line) {
        line.setAttribute('x1', xPos.toFixed(1));
        line.setAttribute('x2', xPos.toFixed(1));
      }

      if (inOutage || val === null) {
        // Hide circle inside outage, show outage label
        if (circle) { circle.setAttribute('cx', '-10'); circle.setAttribute('cy', '-10'); }
        if (tipG) {
          const tipX = Math.max(pl + 58, Math.min(xDot - 58, xPos));
          tipG.setAttribute('transform', `translate(${tipX.toFixed(1)}, 30)`);
        }
        if (tipL1) {
          const d = new Date(tHover);
          tipL1.textContent = `${d.getUTCDate()} ${MON[d.getUTCMonth()]}: OUTAGE`;
          tipL1.style.fill = 'var(--T)';
        }
        if (tipL2) tipL2.textContent = 'Equipment offline';
      } else {
        const yPos = pt + ((hi - val) / (hi - lo || 1)) * (H - pt - pb);
        if (circle) {
          circle.setAttribute('cx', xPos.toFixed(1));
          circle.setAttribute('cy', yPos.toFixed(1));
          circle.setAttribute('fill', dotColor);
        }
        if (tipG) {
          const tipX = Math.max(pl + 58, Math.min(xDot - 58, xPos));
          tipG.setAttribute('transform', `translate(${tipX.toFixed(1)}, 30)`);
        }
        if (tipL1) {
          const d = new Date(tHover);
          const dStr = `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
          tipL1.textContent = `${dStr}: ${nf(val)} ${unit}`;
          tipL1.style.fill = '#ffffff';
        }
        if (tipL2) {
          tipL2.textContent = `${stateLabel} · al ${nf(alarmLim)} · tr ${nf(tripLim)}`;
        }
      }

      overlay.style.display = 'block';
    } catch(err) {}
  });
}

document.addEventListener('pointermove', (e) => {
  if (chPinned) return; // Don't update if pinned
  const mg = e.target.closest('.mg');
  if (!mg) {
    document.querySelectorAll('.ch-overlay').forEach(el => el.style.display = 'none');
    return;
  }
  const svg = e.target.closest('svg.telemetry-svg');
  if (!svg) {
    document.querySelectorAll('.ch-overlay').forEach(el => el.style.display = 'none');
    return;
  }
  const rect = svg.getBoundingClientRect();
  const pl = 40, pr = 10, W = 330;
  const xMouse = e.clientX - rect.left;
  const scaleX = W / rect.width;
  const xSvg = xMouse * scaleX;
  const xDot = W - pr;

  if (xSvg < pl || xSvg > xDot) {
    document.querySelectorAll('.ch-overlay').forEach(el => el.style.display = 'none');
    return;
  }

  const frac = (xSvg - pl) / (xDot - pl);
  updateCrosshair(mg, frac);
});

// Click to pin/unpin crosshair
document.addEventListener('click', (e) => {
  const mg = e.target.closest('.mg');
  const svg = e.target.closest('svg.telemetry-svg');
  if (!mg || !svg) {
    if (chPinned) {
      chPinned = null;
      document.querySelectorAll('.ch-overlay').forEach(el => el.style.display = 'none');
    }
    return;
  }
  // Don't interfere with other click handlers
  if (e.target.closest('button, [data-tab], [data-open], [data-ev]')) return;

  const rect = svg.getBoundingClientRect();
  const pl = 40, pr = 10, W = 330;
  const xMouse = e.clientX - rect.left;
  const scaleX = W / rect.width;
  const xSvg = xMouse * scaleX;
  const xDot = W - pr;

  if (xSvg < pl || xSvg > xDot) return;
  const frac = (xSvg - pl) / (xDot - pl);

  if (chPinned && Math.abs(chPinned.frac - frac) < 0.02) {
    // Clicking near the pinned location unpins
    chPinned = null;
    document.querySelectorAll('.ch-overlay').forEach(el => el.style.display = 'none');
  } else {
    chPinned = { mg, frac };
    updateCrosshair(mg, frac);
  }
});

document.addEventListener('pointerleave', (e) => {
  if (chPinned) return;
  if (e.target && e.target.closest && e.target.closest('.mg')) {
    document.querySelectorAll('.ch-overlay').forEach(el => el.style.display = 'none');
  }
}, true);

// Timeline dragging listeners
const ribSet = (e) => {
  const t = document.querySelector('#ribt');
  if (!t) return;
  const r = t.getBoundingClientRect();
  setDate(T0 + Math.round(clamp((e.clientX - r.left) / r.width, 0, 1) * NDAYS) * DAY, true);
};

document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('#ribt')) {
    S.drag = true;
    ribSet(e);
  }
});
window.addEventListener('pointermove', (e) => {
  if (S.drag) ribSet(e);
});
window.addEventListener('pointerup', () => (S.drag = false));
window.addEventListener('pointercancel', () => (S.drag = false));

// Weight accordion toggle
document.addEventListener(
  'toggle',
  (e) => {
    if (e.target.id === 'wdet') S.wOpen = e.target.open;
  },
  true
);

// Guided demo controller
export function stopDemo(msg) {
  (S.demo || []).forEach(clearTimeout);
  clearInterval(S.demoI);
  S.demo = null;
  const demoBtn = document.querySelector('#demo');
  if (demoBtn) demoBtn.textContent = 'Guided demo';
  if (msg) cap('Demo stopped.', 1500);
  else capOff();
}

function startDemo() {
  if (S.play) {
    clearInterval(S.play);
    S.play = null;
    const playBtn = document.querySelector('#play');
    if (playBtn) playBtn.textContent = 'Play';
  }
  const T = [],
    at_ = (ms, f) => T.push(setTimeout(f, ms));
  S.demo = T;
  const demoBtn = document.querySelector('#demo');
  if (demoBtn) demoBtn.textContent = 'Stop demo';

  S.created = {};
  S.ack = {};
  S.fb = {};
  S.mv = {};
  S.dis = {};
  S.sel = 'KO-3201';
  S.lens = 'Operations';
  S.f = {};
  const KO = byTag('KO-3201');

  S.tab = 'cmd';
  S.ms = D0('2026-01-07');
  S.ev = null;
  S.evI = null;
  render();
  window.scrollTo(0, 0);
  cap(
    '<b>7 Jan 2026.</b> Five critical assets, four data sources, one timeline. Every DCS reading is still normal.'
  );

  at_(6000, () => {
    cap('Now watch KO-3201, the cracked gas compressor.');
    S.demoI = setInterval(() => {
      S.ms += DAY;
      render();
      if (S.ms >= KO.t[KO.fl]) {
        clearInterval(S.demoI);
      }
    }, 240);
  });

  at_(10800, () => {
    cap(
      '<b>21 Jan.</b> Capsul flags KO-3201: ' +
        (KO.ns[KO.fl] === 4 ? 'all four' : KO.ns[KO.fl] + ' of its four') +
        ' signals are beyond 3σ together. The DCS has not alarmed.'
    );
  });

  at_(16500, () => {
    S.tab = 'inv';
    render();
    window.scrollTo(0, 0);
    cap('Why? Lube-oil water and vibration are rising together. That points to water getting into the lube oil.');
  });

  at_(21500, () => {
    S.ev = KO.c.phys[0].sig;
    S.evI = 0;
    render();
    cap('The evidence is highlighted on the trends. Every number comes from the source files.');
  });

  at_(27500, () => {
    const actSec = document.querySelector('#p-act');
    if (actSec) actSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    cap('The fix arrives with an owner, guidance and its own risk, taken from past RCAs. A person decides.');
  });

  at_(32500, () => {
    S.fb['KO-3201'] = 'y';
    S.ack['KO-3201'] = S.ms;
    S.created['KO-3201|0'] = { ms: S.ms, due: S.ms + 7 * DAY };
    render();
    const actSec = document.querySelector('#p-act');
    if (actSec) actSec.scrollIntoView({ block: 'center' });
    cap(
      '<b>Cause confirmed, alert acknowledged, action created</b> for STA-02. The loop moves from Detect to Act.'
    );
  });

  at_(38000, () => {
    S.ms = D0('2026-02-11');
    render();
    window.scrollTo(0, 0);
    cap('<b>11 Feb.</b> The DCS finally alarms. That is 3 weeks after Capsul flagged it.');
  });

  at_(43500, () => {
    S.ms = D0('2026-04-29');
    render();
    window.scrollTo(0, 0);
    cap(
      '<b>29 Apr.</b> KO-3201 trips: 32 h down and US$1.58M lost. The RCA written after this failure confirms the cause Capsul hypothesised on 21 Jan. In this replay that RCA is the knowledge base.'
    );
  });

  at_(50000, () => {
    S.tab = 'act';
    render();
    window.scrollTo(0, 0);
    cap('The action stays on the board until the signal is verified back at baseline.');
  });

  at_(56000, () => {
    cap('Now try it: drag the timeline, open an asset, create an action.', 5000);
    stopDemo();
    const c = document.querySelector('#cap');
    if (c) c.style.display = 'block';
    setTimeout(capOff, 5000);
  });
}

// Minimum accessibility font-size observer fix
(() => {
  let t;
  const fix = () => {
    document.querySelectorAll('main *,header *').forEach((e) => {
      if (e.closest('svg') || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
        return;
      if (parseFloat(getComputedStyle(e).fontSize) < 12) e.style.fontSize = '12px';
    });
  };
  new MutationObserver(() => {
    clearTimeout(t);
    t = setTimeout(fix, 60);
  }).observe(document.body, { childList: true, subtree: true });
  fix();
})();

// Bootstrap Auth and Application
initAuth();
render();
