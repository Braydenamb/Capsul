import { state as S } from '../core/state.js';
import { byTag, score, at, isAct, ASSETS, getRcaLifecycle } from '../core/analytics.js';
import { dS, fmtK, nf, MON, DAY, avg, clamp } from '../core/formatting.js';
import { INC, similar } from '../core/incidents.js';
import { chip } from '../components/statusChip.js';
import { sbar, loopBar } from '../components/decisionLoop.js';

export function fmtSig(a, j, i) {
  return nf(a.r.v[j][i]) + ' ' + a.sig[j].u;
}

export function multiple(a, j, s) {
  const sg = a.sig[j],
    v = a.r.v[j],
    W = 330,
    H = 130,
    pl = 40,
    pr = 6,
    pt = 14,
    pb = 18;
  let lo = Math.min(...v, sg.al, sg.tr),
    hi = Math.max(...v, sg.al, sg.tr);
  const pd = (hi - lo) * 0.07;
  lo -= pd;
  hi += pd;
  const X = (t) => pl + ((t - a.t[0]) / (a.t[25] - a.t[0])) * (W - pl - pr),
    Y = (y) => pt + ((hi - y) / (hi - lo)) * (H - pt - pb),
    b = a.base[j],
    P = (p) => p.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
  const all = v.map((y, k) => [X(a.t[k]), Y(y)]),
    past = all.filter((_, k) => a.t[k] <= S.ms),
    on = !S.ev || S.ev.includes(j),
    lab = (y, t, c) =>
      `<text x="${W - pr}" y="${y - 3 < pt - 2 ? y + 11 : y - 3}" text-anchor="end" style="fill:var(${c})">${t}</text>`;

  let o = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${a.tag} ${sg.n}, weekly readings with alarm and trip limits"><rect x="${pl}" y="${Math.min(Y(b.m + 3 * b.sd), Y(b.m - 3 * b.sd))}" width="${W - pl - pr}" height="${Math.abs(Y(b.m - 3 * b.sd) - Y(b.m + 3 * b.sd))}" fill="var(--N)" opacity=".14"/>
  <line x1="${pl}" x2="${W - pr}" y1="${Y(sg.al)}" y2="${Y(sg.al)}" stroke="var(--A)" stroke-dasharray="4 3"/>${lab(Y(sg.al), 'alarm ' + nf(sg.al), '--A')}<line x1="${pl}" x2="${W - pr}" y1="${Y(sg.tr)}" y2="${Y(sg.tr)}" stroke="var(--T)" stroke-dasharray="4 3"/>${lab(Y(sg.tr), 'trip ' + nf(sg.tr), '--T')}`;

  [
    [a.fl >= 0 ? a.t[a.fl] : null, 'AI', '--W'],
    [a.t[a.al], 'DCS', '--A'],
    [a.t[20], 'Trip', '--T']
  ].forEach(([t, l, c]) => {
    if (t !== null && t <= S.ms)
      o += `<line x1="${X(t)}" x2="${X(t)}" y1="${pt}" y2="${H - pb}" stroke="var(${c})" stroke-width="1.4"/><text x="${X(t) + 2}" y="${pt - 3}" style="fill:var(${c});font-weight:600">${l}</text>`;
  });
  o += `<polyline points="${P(all)}" fill="none" stroke="var(--mute)" opacity=".38" stroke-dasharray="2 3"/>`;
  if (past.length > 1)
    o += `<polyline points="${P(past)}" fill="none" stroke="var(--brand)" stroke-width="${S.ev && on ? 3.2 : 2}"/>`;
  past.forEach((p, k) => {
    o += `<circle cx="${p[0]}" cy="${p[1]}" r="${k === past.length - 1 ? 4.2 : 1.8}" fill="${k === past.length - 1 ? 'var(--brand)' : 'var(--brand)'}"><title>${dS(a.t[k], true)}: ${fmtSig(a, j, k)}</title></circle>`;
  });
  const px = X(clamp(S.ms, a.t[0], a.t[25]));
  o += `<line x1="${px}" x2="${px}" y1="${pt}" y2="${H - pb}" stroke="var(--ink)" opacity=".5"/>`;
  o += `<text x="${pl - 4}" y="${pt + 4}" text-anchor="end">${nf(hi)}</text><text x="${pl - 4}" y="${H - pb}" text-anchor="end">${nf(lo)}</text><text x="${pl}" y="${H - 4}">${dS(a.t[0])}</text><text x="${(pl + W - pr) / 2}" y="${H - 4}" text-anchor="middle">${dS(a.t[13])}</text><text x="${W - pr}" y="${H - 4}" text-anchor="end">${dS(a.t[25])}</text></svg>`;
  const i = s.i,
    cur = i >= 0 ? v[Math.min(i, 25)] : null,
    z = i >= 0 && i <= 20 ? a.z[i][j] : 0,
    bey = (x, l) => (sg.d > 0 ? x >= l : x <= l);
  const col =
    cur === null
      ? 'var(--mute)'
      : bey(cur, sg.tr)
        ? 'var(--T)'
        : bey(cur, sg.al)
          ? 'var(--A)'
          : z > 3
            ? 'var(--W)'
            : 'var(--ink)';
  const sgm = (val) => (val > 10 ? 'over 10σ' : val.toFixed(1) + 'σ');
  return `<div class="mc ${S.ev ? (on ? 'on' : 'off') : ''}"><div class="mh"><span class="mn">${sg.n}</span><span class="mv" style="color:${col}">${cur === null ? 'not monitored yet' : nf(cur) + ' ' + sg.u}</span><span class="sg">${cur === null ? '' : z > 0 ? sgm(z) : 'baseline'}</span></div>${o}</div>`;
}

export function outage(a) {
  const P = a.r.pi,
    W = 640,
    pl = 44,
    pr = 8,
    X = (i) => pl + (i * (W - pl - pr)) / (P.length - 1);
  const f = P.map((p) => p[1]),
    mx = Math.max(...f) * 1.12;
  const runs = [];
  let st = null;
  P.forEach((p, i) => {
    if (p[5] === 0 && st === null) st = i;
    if (st !== null && (p[5] === 1 || i === P.length - 1)) {
      runs.push([st, p[5] === 1 ? i : i + 1]);
      st = null;
    }
  });
  const Y1 = (v) => 8 + (1 - v / mx) * (84 - 8 - 4);
  let d = `M${X(0)},${Y1(0)}`;
  P.forEach((p, i) => {
    d += ` L${X(i)},${Y1(p[1])}`;
  });
  d += ` L${X(P.length - 1)},${Y1(0)} Z`;
  const rect = (H) =>
    runs
      .map(
        (r) =>
          `<rect x="${X(r[0])}" y="0" width="${X(r[1]) - X(r[0])}" height="${H}" fill="var(--T)" opacity=".13"/>`
      )
      .join('');
  let c1 = `<svg viewBox="0 0 ${W} 92" role="img" aria-label="Feed rate around the failure">${rect(88)}<path d="${d}" fill="var(--f2)" opacity=".28"/><polyline points="${P.map((p, i) => X(i) + ',' + Y1(p[1])).join(' ')}" fill="none" stroke="var(--f2)" stroke-width="2"/>
  <text x="${pl - 4}" y="16" text-anchor="end">${mx.toFixed(0)}</text><text x="${pl - 4}" y="84" text-anchor="end">0</text>${runs.map((r) => `<text class="sv" x="${(X(r[0]) + X(r[1])) / 2}" y="18" text-anchor="middle" style="font-weight:600">Feed at zero ${r[1] - r[0]} h (PI)</text>`).join('')}</svg>`;
  const k = a.c.pi.s,
    sv = P.map((p) => p[k]),
    lo = Math.min(...sv),
    hi = Math.max(...sv),
    Y2 = (v) => 6 + (1 - (v - lo) / (hi - lo || 1)) * (64 - 6 - 4);
  let ticks = '';
  P.forEach((p, i) => {
    if (p[0].endsWith('00:00')) {
      const m = +p[0].slice(0, 2),
        dd = +p[0].slice(3, 5);
      ticks += `<line x1="${X(i)}" x2="${X(i)}" y1="0" y2="60" stroke="var(--line)"/><text x="${X(i) + 3}" y="76">${dd} ${MON[m - 1]}</text>`;
    }
  });
  let c2 = `<svg viewBox="0 0 ${W} 82" role="img" aria-label="${a.c.pi.n} from hourly PI data">${rect(60)}${ticks}<polyline points="${P.map((p, i) => X(i) + ',' + Y2(p[k])).join(' ')}" fill="none" stroke="var(--brand)" stroke-width="1.8"/><text x="${pl - 4}" y="14" text-anchor="end">${nf(hi)}</text><text x="${pl - 4}" y="60" text-anchor="end">${nf(lo)}</text><text x="${W - pr}" y="14" text-anchor="end">${a.c.pi.n}, ${a.c.pi.u} (hourly PI)</text></svg>`;

  return `<div class="pn-h"><h3>What the failure cost</h3><span class="sm mu">${S.ms < a.failMs ? 'Has not happened yet on this date. This is the cost of not acting.' : 'Hourly PI data, 72 hours around the trip'}</span></div>${c1}${c2}
  <div class="stat4"><div><b class="num">${a.r.dt} h</b><small>Unplanned downtime (RCA)</small></div><div><b class="num">${nf(a.r.prodLoss)} t</b><small>Production lost</small></div><div><b class="num">${fmtK(a.r.loss)}</b><small>Loss</small></div><div><b class="num">${a.r.piOff} h</b><small>Hours at zero feed in PI</small></div></div>
  <p class="note">${a.c.chrono}</p>`;
}

export function banner(a, s) {
  const fl = a.fl >= 0 && S.ms >= a.t[a.fl],
    al = S.ms >= a.t[a.al],
    dl = (t) => dS(t, true);
  if (S.ms > a.failMs)
    return [
      `Failed on ${dl(a.failMs)}: ${a.r.dt} h down and ${fmtK(a.r.loss)} lost. Capsul had flagged it ${a.leadFail} weeks earlier, on ${dl(a.t[a.fl])}.`,
      'a'
    ];
  if (fl && al && a.lead > 0)
    return [
      `<b>Capsul raised a heuristic flag on ${dl(a.t[a.fl])}.</b> The DCS alarmed ${a.lead} weeks later, on ${dl(a.t[a.al])}.`,
      'a'
    ];
  if (fl && al)
    return [
      `<b>The DCS alarmed first</b>, on ${dl(a.t[a.al])}. Capsul confirmed with ${a.ns[a.fl]} signals ${-a.lead} weeks later. It adds no lead time on this asset, but it names the cause.`,
      'a'
    ];
  if (fl)
    return [
      `<b>Capsul raised a heuristic flag on ${dl(a.t[a.fl])}:</b> ${s.ns} of 4 signals beyond 3σ. The DCS has not alarmed yet.`,
      'w'
    ];
  if (al)
    return [
      `<b>The DCS alarmed on ${dl(a.t[a.al])}.</b> ${s.ns} of 4 signals are beyond 3σ so far. Capsul needs 3 to flag.`,
      'a'
    ];
  return [
    s.i < 0
      ? `Monitoring for this asset starts on ${dl(a.t[0])}.`
      : `No multi-signal flag yet. ${s.ns} of 4 signals beyond 3σ.`,
    ''
  ];
}

export const OFF = { Corrective: 7, Preventive: 30, 'Roll-out': 60 };

export function renderInvestigateView() {
  const a = byTag(S.sel) || ASSETS[0],
    s = at(a, S.ms),
    sc = isAct(s.s) ? score(a, s) : null,
    [bt, bc] = banner(a, s),
    c = a.c;
  const zi = s.i >= 20 ? a.z[20] : s.z,
    post = S.ms > a.failMs;
  const rcaState = getRcaLifecycle(a.tag, S.ms);
  
  const causes = c.phys.map((p, n) => ({
    p,
    n,
    st: Math.round(100 * avg(p.sig.map((j) => 1 - Math.exp(-Math.max(zi[j], 0) / 12))))
  }));
  const sim = similar(a, S.ms);

  const chips = ASSETS.map((x) => {
    const st = at(x, S.ms);
    return `<button class="ac ${st.s}" data-open="${x.tag}" aria-pressed="${x.tag === S.sel}" style="border-left-color:var(--c);font-family:var(--fm);"><b>${x.tag}</b><small style="margin-left:4px;">${st.s}</small></button>`;
  }).join('');

  const acts = c.acts
    .map((x, n) => {
      const key = a.tag + '|' + n,
        cr = S.created[key],
        imp = !cr && S.ms >= a.failMs + DAY;
      return `<div class="act" style="border-top:1px solid var(--line-subtle);padding:10px 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="ty ${x.ty}">${x.ty}</span>
          <b style="font-size:14px;color:var(--ink);">${x.t}</b>
        </div>
        <div class="sm mu" style="margin-top:4px;">PIC: ${x.pic}. ${cr ? 'Due ' + dS(cr.due, true) : 'Proposed due ' + dS(S.ms + OFF[x.ty] * DAY, true)}.</div>
        <details class="gd" ${n === 0 ? 'open' : ''} style="margin-top:6px;"><summary style="cursor:pointer;color:var(--brand);font-weight:500;">Risk & Countermeasure</summary><div style="font-size:12.5px;color:var(--mute);margin-top:4px;">Risk: ${x.risk}<br>Countermeasure: ${x.ctr}</div></details>
        <div style="margin-top:8px;"><button class="btn pr" data-mk="${key}" ${cr || imp ? 'disabled' : ''}>${cr ? 'On the Action Board' : imp ? 'Recorded in RCA' : 'Create Action Assignment'}</button></div>
      </div>`;
    })
    .join('');

  return `
    <!-- Top Equipment Selection Chips -->
    <div class="chips" role="group" aria-label="Asset Selection">${chips}</div>

    <!-- Issue Header -->
    <div class="hd" style="margin-top:16px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="badge ${s.s === 'T' || s.s === 'A' ? 'badge-red' : s.s === 'W' ? 'badge-amber' : 'badge-green'}">
            <span class="dot ${s.s === 'T' || s.s === 'A' ? 'dot-red' : s.s === 'W' ? 'dot-amber' : 'dot-green'}"></span>
            ${s.s === 'T' ? 'TRIPPED' : s.s === 'A' ? 'HIGH RISK' : s.s === 'W' ? 'WARNING' : 'NORMAL'}
          </span>
          <h1 style="font-size:22px;font-weight:700;"><span class="mono">${a.tag}</span> — ${c.name}</h1>
        </div>
        <p class="mu" style="margin-top:4px;font-size:13.5px;">${c.plant} · Class ${a.cls} Criticality · ${a.r.disc} Discipline · ${a.r.ar || 'AR-2026'}</p>
      </div>
      ${sc ? `<div style="text-align:right;"><span class="mu" style="font-size:12px;display:block;">PRIORITY INDEX</span><b class="mono" style="font-size:24px;color:var(--brand);">${Math.round(sc.total)}</b><small class="mu"> / 100</small></div>` : ''}
    </div>

    <!-- Replay Status Banner -->
    <div class="ban ${bc}" style="margin-top:12px;background:var(--panel);border:1px solid var(--line);border-left:6px solid ${bc === 'a' ? 'var(--T)' : bc === 'w' ? 'var(--W)' : 'var(--brand)'};border-radius:6px;padding:12px 16px;">
      ${bt}
    </div>

    <div class="gi" style="margin-top:16px;">
      <!-- LEFT COLUMN: TRENDS & EVIDENCE -->
      <div>
        <!-- Synchronized Trends with Threshold Bands -->
        <section class="pn" style="margin-top:0;">
          <div class="pn-h">
            <h3>Synchronized Condition Telemetry & Thresholds</h3>
            <span class="sm mu">Green band = 5-week baseline ±3σ. Dashed lines = DCS alarm and trip limits.</span>
          </div>
          <div class="mg" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:12px;margin-top:10px;">
            ${[0, 1, 2, 3].map((j) => multiple(a, j, s)).join('')}
          </div>
          ${S.ev ? `<p class="note" style="margin-top:10px;">Highlighted evidence for selected cause. <button class="btn q" data-ev="x">Clear highlight</button></p>` : ''}
        </section>

        <!-- Outage & Loss Traceability -->
        <section class="pn" style="margin-top:16px;">
          ${outage(a)}
        </section>

        <!-- Similar Incidents Database Search -->
        <section class="pn" style="margin-top:16px;">
          <div class="pn-h">
            <h3>Similar Historical Incidents (Incident DB)</h3>
            <span class="sm mu">Matching equipment type, component & failure mechanism prior to ${dS(S.ms, true)}</span>
          </div>
          <div class="tb" style="margin-top:10px;">
            <table>
              <thead>
                <tr>
                  <th class="r">Match %</th>
                  <th>Incident Tag & Description</th>
                  <th class="r">Downtime</th>
                  <th class="r">Loss</th>
                </tr>
              </thead>
              <tbody>
                ${sim.length > 0 ? sim.map((x) => `
                  <tr class="click" tabindex="0" data-inc="${x.i.n}">
                    <td class="r mono"><b>${x.m}%</b></td>
                    <td>
                      <b class="mono">${x.i.tag}</b> ${x.i.title.replace(/^.*?— /, '').replace(x.i.tag, '').trim()}
                      <div class="sm mu">${x.i.plant} · ${dS(x.i.ms, true)}</div>
                    </td>
                    <td class="r mono">${x.i.dt} h</td>
                    <td class="r mono">${fmtK(x.i.loss)}</td>
                  </tr>
                  ${S.inc === x.i.n ? `
                    <tr>
                      <td></td>
                      <td colspan="3" class="sm" style="background:var(--panel2);padding:10px;border-radius:6px;">
                        <b>Status:</b> ${x.i.status} | <b>RCA PIC:</b> ${x.i.pic || 'Unassigned'} | <b>Due:</b> ${x.i.due ? dS(x.i.dueMs, true) : 'N/A'}<br>
                        <b>AR Number:</b> ${x.i.ar ? `<span class="mono">${x.i.ar}</span>` : '<span style="color:var(--T);">Missing AR Number</span>'}<br>
                        <em>Clicking provides evidence traceability for CAPA selection.</em>
                      </td>
                    </tr>
                  ` : ''}
                `).join('') : '<tr><td colspan="4" class="empty">No historical incidents match prior to this date.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- RIGHT COLUMN: EMBEDDED AI ROOT CAUSE WORKFLOW -->
      <div>
        <!-- AI Root Cause Support (Structured Workflow) -->
        <section class="pn" id="p-why" style="margin-top:0;background:var(--panel);border:1px solid var(--line);border-radius:8px;">
          <div class="pn-h">
            <h3>AI-Supported Root Cause Indication</h3>
            <span class="badge ${rcaState.state === 'Verified' ? 'badge-green' : rcaState.state === 'Under investigation' ? 'badge-amber' : 'badge-gray'}">
              ${rcaState.state}
            </span>
          </div>

          <!-- Structured AI Insight Blocks -->
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
            <div style="padding:10px;background:var(--page);border-radius:6px;border-left:3px solid var(--brand);">
              <small class="mu" style="font-weight:700;letter-spacing:0.04em;">1. OBSERVED SIGNALS</small>
              <p style="font-size:13.5px;margin-top:3px;color:var(--ink);">
                ${s.ns} of 4 condition signals beyond 3σ baseline. Strongest deviation on <span class="mono">${a.sig[0].n}</span>.
              </p>
            </div>

            <div style="padding:10px;background:var(--page);border-radius:6px;border-left:3px solid var(--BLUE);">
              <small class="mu" style="font-weight:700;letter-spacing:0.04em;">2. CORRELATED TELEMETRY</small>
              <p style="font-size:13.5px;margin-top:3px;color:var(--ink);">
                Water contamination in lube oil correlated with radial vibration acceleration.
              </p>
            </div>

            <div style="padding:10px;background:var(--page);border-radius:6px;border-left:3px solid var(--W);">
              <small class="mu" style="font-weight:700;letter-spacing:0.04em;">3. PROBABLE CAUSE HYPOTHESIS</small>
              <p style="font-size:13.5px;margin-top:3px;color:var(--ink);font-weight:600;">
                ${rcaState.causeText}
              </p>
            </div>

            <div style="padding:10px;background:var(--page);border-radius:6px;border-left:3px solid var(--N);">
              <small class="mu" style="font-weight:700;letter-spacing:0.04em;">4. CONFIDENCE & EVIDENCE STATE</small>
              <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                <div style="flex:1;height:8px;background:var(--line);border-radius:4px;overflow:hidden;">
                  <div style="width:${rcaState.confidence}%;height:100%;background:var(--N);"></div>
                </div>
                <b class="mono" style="font-size:14px;color:var(--N);">${rcaState.confidence}%</b>
              </div>
            </div>

            <div style="padding:10px;background:var(--page);border-radius:6px;border-left:3px solid var(--R);">
              <small class="mu" style="font-weight:700;letter-spacing:0.04em;">5. NEXT EVIDENCE NEEDED TO VERIFY</small>
              <p style="font-size:13px;margin-top:3px;color:var(--mute);">
                Sample lube oil water content and inspect mechanical seal flush flow switch within 24 hours.
              </p>
            </div>
          </div>

          <!-- Cause Verification Details -->
          <div style="margin-top:16px;">
            <small class="mu" style="font-weight:700;">HYPOTHESIS STRENGTH BY CAUSE</small>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
              ${causes.map((x) => `
                <div class="cs" style="padding:8px;background:var(--page);border-radius:4px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <b>${x.p.t}</b>
                    <span class="mono" style="font-weight:700;color:var(--brand);">${x.st}%</span>
                  </div>
                  <div class="bar" style="margin-top:4px;"><i style="width:${x.st}%"></i></div>
                  <p class="sm mu" style="margin-top:4px;">${x.p.ev}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- Recommended Actions Section -->
        <section class="pn" id="p-act" style="margin-top:16px;">
          <div class="pn-h">
            <h3>Recommended Operational Actions</h3>
            <span class="sm mu">Accountable assignment workflow</span>
          </div>
          <div style="margin-top:10px;">${acts}</div>
        </section>
      </div>
    </div>
  `;
}
