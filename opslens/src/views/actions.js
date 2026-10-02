import { state as S } from '../core/state.js';
import { ASSETS, at, isAct, score, kpiData } from '../core/analytics.js';
import { D0, DAY, dS, nf } from '../core/formatting.js';
import { OFF, fmtSig } from './investigate.js';
import { canPerform } from '../auth/auth.js';

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
    ['Recommended Actions', all.filter((i) => i.col === -1).length],
    ['Open / In Progress', all.filter((i) => i.col === 0 || i.col === 1).length],
    ['Overdue Assignments', all.filter(od).length],
    ['Awaiting Verification', all.filter((i) => i.col === 2).length]
  ];
  const K = kpiData();
  const canCreate = canPerform('createAction');
  const canVerify = canPerform('verifyAction');
  const activeStage = S.actionStage ?? -1;

  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
      <div>
        <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;">Action Governance & Tracking</h1>
        <p class="mu" style="margin-top:2px;">Accountable assignment board: Corrective, Preventive & Pro-active operational actions</p>
      </div>
    </div>

    <!-- Visually Quieter Summary KPI Cards -->
    <div class="kp" style="grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));margin-top:0;border:1px solid var(--line);border-radius:8px;background:var(--panel);">
      ${kp.map((k, idx) => `
        <div style="padding:12px 14px;${idx < kp.length - 1 ? 'border-right:1px solid var(--line);' : ''}">
          <small class="mu" style="font-weight:600;text-transform:uppercase;letter-spacing:0.04em;font-size:11px;">${k[0]}</small>
          <b style="font-size:24px;font-family:var(--fm);color:${idx===2 && k[1]>0 ? 'var(--T)' : 'var(--ink)'};margin-top:2px;">${k[1]}</b>
        </div>
      `).join('')}
    </div>

    <!-- Asset Filter Chips -->
    <div class="chips" style="margin-top:16px;" role="group" aria-label="Filter by asset">
      ${['All', ...ASSETS.map((a) => a.tag)].map((t) => `<button class="seg" data-af="${t}" aria-pressed="${S.af === t}" style="font-family:var(--fm);">${t}</button>`).join('')}
      ${Object.keys(S.created).length ? '<button class="btn q" data-reset="1" style="margin-left:auto;">Reset Board State</button>' : ''}
    </div>

    <!-- Mobile Stage Selector Tabs (<768px) -->
    <div class="action-stage-tabs" role="tablist" aria-label="Kanban Stage Selector">
      ${COLS.map((c, ci) => `
        <button class="stage-tab ${activeStage === ci - 1 ? 'active' : ''}" data-stage="${ci - 1}">
          ${c}
        </button>
      `).join('')}
    </div>

    <!-- Kanban Governance Board -->
    <div class="bd" style="margin-top:16px;">
      ${COLS.map((c, ci) => {
        const col = ci - 1,
          cards = L.filter((i) => i.col === col).sort(
            (p, q) => (q.score || 0) - (p.score || 0) || p.due - q.due
          );
        const isActive = activeStage === col;
        return `
          <div class="col ${col === -1 ? 'rc' : ''} ${isActive ? 'active-stage' : ''}" style="min-height:${col === -1 ? '140px' : '80px'};">
            <h3 style="font-size:13.5px;font-weight:700;border-bottom:2px solid var(--line);padding-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
              <span>${c}</span>
              <span class="badge badge-gray mono">${cards.length}</span>
            </h3>
            
            ${cards.map((i) => `
              <div class="cd ${od(i) ? 'od' : ''}" style="background:var(--panel);border:1px solid ${od(i)?'var(--T)':'var(--line)'};border-radius:6px;padding:12px;margin-top:8px;">
                <div class="card-header">
                  <div class="card-title">
                    <b class="mono" style="font-size:13.5px;color:var(--brand);">${i.a.tag}</b>
                    <div style="margin-top:3px;font-weight:600;font-size:13.5px;color:var(--ink);">${i.x.t}</div>
                  </div>
                  <span class="ty ${i.x.ty}">${i.x.ty}</span>
                </div>
                
                <div class="m" style="margin-top:6px;font-size:12px;color:var(--mute);line-height:1.4;">
                  Owner: <b>${i.x.pic}</b><br>
                  ${col === -1 ? 'Proposed Due:' : 'Due:'} <span class="mono">${dS(i.due, true)}</span> · Source: ${i.src}
                  ${od(i) ? '<br><span class="badge badge-red" style="margin-top:4px;"><span class="dot dot-red"></span> OVERDUE</span>' : ''}
                </div>

                <details style="margin-top:8px;font-size:12px;color:var(--mute);border-top:1px dashed var(--line-subtle);padding-top:6px;">
                  <summary style="cursor:pointer;color:var(--brand);font-weight:500;">Action Details & Risk</summary>
                  <div style="margin-top:4px;line-height:1.4;">
                    <b>Risk:</b> ${i.x.risk}<br>
                    <b>Countermeasure:</b> ${i.x.ctr}
                  </div>
                </details>

                <div class="bx" style="margin-top:10px;">
                  ${col === -1 ? `
                    <button class="btn pr" data-mk="${i.key}" ${canCreate ? '' : 'disabled title="Role cannot create actions"'}>Create Action</button>
                    <button class="btn q" data-dis="${i.key}">Dismiss</button>
                  ` : col === 0 ? `
                    <button class="btn" data-mv="${i.key}">Start Work</button>
                  ` : col === 1 ? `
                    <button class="btn" data-mv="${i.key}">Send to Verification</button>
                  ` : col === 2 ? `
                    <button class="btn pr" data-mv="${i.key}" ${canVerify ? '' : 'disabled title="Verification requires Reliability or Admin role"'}>Verify & Close</button>
                  ` : `
                    <span class="badge badge-green"><span class="dot dot-green"></span> Completed</span>
                  `}
                </div>
              </div>
            `).join('') || `<div class="empty" style="font-size:12.5px;padding:10px;text-align:center;">${col === -1 ? 'No recommendations' : 'Empty stage'}</div>`}
          </div>
        `;
      }).join('')}
    </div>
  `;
}
