import { state as S } from '../core/state.js';
import { ASSETS, at, isAct, score, kpiData } from '../core/analytics.js';
import { D0, DAY, dS, nf } from '../core/formatting.js';
import { OFF, fmtSig } from './investigate.js';

export const recCol = (s) => (s === 'Closed' ? 3 : s === 'In progress' ? 1 : 0);

export function items() {
  const out = [];
  ASSETS.forEach((a) =>
    a.c.acts.forEach((x, n) => {
      const key = a.tag + '|' + n,
        cr = S.created[key],
        st = at(a, S.ms);
      if (cr) out.push({ key, a, x, src: 'Capsul', col: S.mv[key] ?? 0, due: cr.due });
      else if (S.ms >= a.failMs + DAY)
        out.push({
          key,
          a,
          x,
          src: 'RCA record',
          col: S.mv[key] ?? recCol(x.stt),
          due: D0(x.due)
        });
      else if (!S.dis[key] && isAct(st.s) && x.ty === 'Corrective')
        out.push({
          key,
          a,
          x,
          src: 'Capsul',
          col: -1,
          due: S.ms + OFF[x.ty] * DAY,
          score: score(a, st).total
        });
    })
  );
  return out;
}

export const COLS = ['Recommended', 'Open', 'In progress', 'Verification', 'Closed'];

export function verifyMsg(a) {
  const s = at(a, S.ms);
  return `Not yet. ${a.sig[0].n} is ${s.i >= 0 ? fmtSig(a, 0, Math.min(s.i, 25)) : 'not monitored'}, still off its baseline of ${nf(a.base[0].m)} ${a.sig[0].u}. Move the timeline to ${dS(a.t[21], true)} or later to verify.`;
}

export function renderActionsView() {
  const all = items(),
    L = S.af === 'All' ? all : all.filter((i) => i.a.tag === S.af);
  const od = (i) => i.col >= 0 && i.col < 3 && i.due < S.ms;
  const kp = [
    ['Recommended', all.filter((i) => i.col === -1).length],
    ['Open or in progress', all.filter((i) => i.col === 0 || i.col === 1).length],
    ['Past due date', all.filter(od).length],
    ['Awaiting verification', all.filter((i) => i.col === 2).length]
  ];
  const K = kpiData();

  return `<h1>Follow-up actions</h1><p class="lead">Capsul recommends the corrective action first, with an owner and guidance. A person accepts it, and it closes only when the signal is back at baseline. Preventive and roll-out actions are on each asset page.</p>
<div class="kp" style="grid-template-columns:repeat(4,1fr)">${kp.map((k) => `<div><small>${k[0]}</small><b>${k[1]}</b></div>`).join('')}</div>
<div class="chips" style="margin-top:12px" role="group" aria-label="Filter by asset">${['All', ...ASSETS.map((a) => a.tag)].map((t) => `<button class="seg" data-af="${t}" aria-pressed="${S.af === t}">${t}</button>`).join('')}${Object.keys(S.created).length ? '<button class="btn q" data-reset="1">Reset board</button>' : ''}</div>
<div class="bd">${COLS.map((c, ci) => {
    const col = ci - 1,
      cards = L.filter((i) => i.col === col).sort(
        (p, q) => (q.score || 0) - (p.score || 0) || p.due - q.due
      );
    return `<div class="col ${col === -1 ? 'rc' : ''}"><h3>${c}<span class="mu num">${cards.length}</span></h3>${cards.map((i) => `<div class="cd ${od(i) ? 'od' : ''}"><b>${i.a.tag}</b> <span class="ty ${i.x.ty}">${i.x.ty}</span><div style="margin-top:4px">${i.x.t}</div>
  <div class="m">Owner ${i.x.pic}. ${col === -1 ? 'Proposed due ' : 'Due '}${dS(i.due, true)}. Source: ${i.src}.${od(i) ? ' <b style="color:var(--T)">Past due' + (i.src === 'RCA record' ? ', no completion recorded' : '') + '</b>' : ''}</div>
  <div class="bx">${col === -1 ? `<button class="btn pr" data-mk="${i.key}">Create action</button><button class="btn q" data-dis="${i.key}">Dismiss</button>` : col === 0 ? `<button class="btn" data-mv="${i.key}">Start work</button>` : col === 1 ? `<button class="btn" data-mv="${i.key}">Send for verification</button>` : col === 2 ? `<button class="btn pr" data-mv="${i.key}">Verify and close</button>` : ''}</div></div>`).join('') || `<div class="empty">${col === -1 ? 'Nothing recommended. No asset is drifting on this date.' : 'Nothing here.'}</div>`}</div>`;
  }).join('')}</div>
<p class="note">Incident DB: ${K.open.length} RCA and CAPA items are open on this date and ${K.late} are past their RCA due date. Actions from the five RCA reports appear on the day after each trip, with the status recorded in the report. Nothing in the data records their completion, which is the tracking gap this board closes.</p>`;
}
