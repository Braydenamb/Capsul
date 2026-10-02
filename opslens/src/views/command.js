import { state as S, LENS } from '../core/state.js';
import { CUR, kpiData, score, stakeOf, isAct, HE, at, energyAt, FN, ASSETS, byTag, getRcaLifecycle } from '../core/analytics.js';
import { dS, fmtK, NM, MON, DAY, sum } from '../core/formatting.js';
import { INC, MFN, groupBy } from '../core/incidents.js';
import { chip } from '../components/statusChip.js';
import { loopFunnel } from '../components/decisionLoop.js';
import { ribbon } from '../components/timeline.js';
import { getAvailableLenses } from '../auth/auth.js';

export function tankRows() {
  const rows = CUR.filter((x) => isAct(x.s.s))
    .map((x) => ({ ...x, sc: score(x.a, x.s) }))
    .sort((p, q) => q.sc.total - p.sc.total);
  const rec = CUR.filter((x) => x.s.s === 'R'),
    nor = CUR.filter((x) => x.s.s === 'N');

  let h = rows
    .map(
      (x, n) => `<div class="tk ${x.s.s}" role="button" tabindex="0" data-open="${x.a.tag}" aria-label="${x.a.tag}, ${NM[x.s.s]}, score ${Math.round(x.sc.total)}"><span class="rk">${n + 1}</span>
  <div><b>${x.a.tag}</b> ${x.a.c.name} <small class="mu">${x.a.c.plant}, ${x.a.r.disc}, class ${x.a.cls}</small> ${chip(x.s.s)}<div class="is">${issueTextLocal(x.a, x.s)}</div></div>
  <div class="why" title="${FN.map((f, i) => f + ' ' + x.sc.p[i].toFixed(0)).join(', ')}"><div class="sbar">${x.sc.p.map((p, i) => `<i class="f${i + 1}" style="width:${p}%"></i>`).join('')}</div><small>${x.sc.bonus ? 'Lens adds ' + x.sc.bonus + ' points' : 'What drives the score'}</small></div>
  <div class="sc">${Math.round(x.sc.total)}<small>of 100</small></div></div>`
    )
    .join('');

  if (!rows.length)
    h = `<div class="empty">No asset is drifting on this date. Use “Jump to a key moment” in the header to see the first flag.</div>`;
  if (rec.length)
    h += `<div class="note">Recovering after repair, verify the actions: ${rec.map((x) => `<button class="btn q" data-open="${x.a.tag}">${x.a.tag}</button>`).join(' ')}</div>`;
  if (nor.length) h += `<div class="note">Normal: ${nor.map((x) => x.a.tag).join(', ')}. No action needed.</div>`;
  return h;
}

function issueTextLocal(a, s) {
  const top = s.z.map((z, j) => [z, j]).sort((p, q) => q[0] - p[0])[0];
  const sg = a.sig[top[1]];
  if (s.s === 'T') return `Tripped. ${a.r.dt} h of unplanned downtime.`;
  const sigs = `${s.ns} of 4 signals beyond 3σ`;
  const sgm = (z) => (z > 10 ? 'over 10σ' : z.toFixed(1) + 'σ');
  const remTxt = (r) =>
    r === Infinity
      ? 'no upward trend'
      : r > 12
        ? 'more than 12 wk to trip at the current rate'
        : r <= 0
          ? 'at the trip limit'
          : 'about ' + r.toFixed(1) + ' wk to trip at the current rate';

  return (
    (s.s === 'W'
      ? `Capsul flag: ${sigs}. The DCS has not alarmed. `
      : `DCS alarm since ${dS(a.t[a.al])}. ${sigs}. `) +
    `Strongest: ${sg.n} at ${sgm(top[0])}. ${remTxt(s.rem).replace(/^./, (c) => c.toUpperCase())}.`
  );
}

export const WL = [
  ['cr', 'Criticality class'],
  ['ag', 'Signal agreement'],
  ['tt', 'Time to trip'],
  ['cs', 'Cost if it fails']
];

export function wvHTML() {
  return WL.map(
    ([k, n], i) =>
      `<label><i class="sw f${i + 1}" style="display:inline-block;width:11px;height:11px;border-radius:2px;background:var(--f${i + 1});margin-right:5px"></i>${n}: <b class="num wv" data-k="${k}">${S.W[k]}</b><input type="range" min="0" max="60" value="${S.W[k]}" data-w="${k}" aria-label="${n} weight"></label>`
  ).join('');
}

export function bars(L, key) {
  const mx = Math.max(...L.map((x) => x.loss));
  return L.map(
    (x) =>
      `<button class="bl" data-filt="${key}" data-v="${x.k}" aria-pressed="${S.f[key] === x.k}"><span class="n">${x.k}</span><span class="b" style="width:${(x.loss / mx) * 100}%"></span><span class="v num">${fmtK(x.loss)} (${x.n})</span></button>`
  ).join('');
}

export function energyChart() {
  const W = 460,
    H = 190,
    pl = 40,
    pr = 10,
    pt = 18,
    pb = 22,
    he = at(HE, S.ms);
  const ev = HE.r.v[0].map((_, i) => energyAt(i));
  const known = ev.filter((_, i) => HE.t[i] <= S.ms);
  let sl = 0,
    pj = null;
  const live = !he.out && he.i >= 3 && he.i <= 19 && isAct(he.s);
  if (live) {
    sl = (ev[he.i] - ev[he.i - 3]) / 3;
    if (sl > 0) pj = ev[he.i] + sl * 4;
  }
  const mx = Math.max(3, Math.max(...known, pj || 0) + 1),
    mn = -1.5;
  const X = (t) => pl + ((t - HE.t[0]) / (HE.t[25] - HE.t[0])) * (W - pl - pr),
    Y = (v) => pt + ((mx - v) / (mx - mn)) * (H - pt - pb),
    P = (a) => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const past = ev.map((v, i) => [X(HE.t[i]), Y(v)]).filter((_, i) => HE.t[i] <= S.ms);

  let o = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="ZCU specific energy against forecast"><rect x="${pl}" y="${Y(1)}" width="${W - pl - pr}" height="${Y(-1) - Y(1)}" fill="var(--N)" opacity=".14"/><line x1="${pl}" x2="${W - pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--mute)" stroke-dasharray="5 3"/><text x="${W - pr}" y="${Y(0) + 13}" text-anchor="end">Forecast (0%), band ±1%</text>`;
  [
    [HE.fl, 'AI', '--W'],
    [HE.al, 'DCS', '--A'],
    [20, 'Trip', '--T']
  ].forEach(([i, l, c]) => {
    if (i >= 0 && HE.t[i] <= S.ms)
      o += `<line x1="${X(HE.t[i])}" x2="${X(HE.t[i])}" y1="${pt}" y2="${H - pb}" stroke="var(${c})"/><text x="${X(HE.t[i]) + 2}" y="${pt - 4}" style="fill:var(${c});font-weight:600">${l}</text>`;
  });
  if (past.length > 1) o += `<polyline points="${P(past)}" fill="none" stroke="var(--A)" stroke-width="2.4"/>`;
  if (pj !== null) {
    const p = [[X(HE.t[he.i]), Y(ev[he.i])]];
    for (let k = 1; k <= 4; k++) p.push([X(HE.t[he.i] + 7 * k * DAY), Y(ev[he.i] + sl * k)]);
    o += `<polyline points="${P(p)}" fill="none" stroke="var(--A)" stroke-width="2" stroke-dasharray="6 4"/><text x="${p[4][0]}" y="${p[4][1] - 6}" text-anchor="end">forecast if unchanged</text>`;
  }
  if (he.i >= 0 && !he.out) {
    const c = [X(HE.t[he.i]), Y(ev[he.i])];
    o += `<circle cx="${c[0]}" cy="${c[1]}" r="4.5" fill="var(--A)"/><text class="sv" x="${c[0] - 7}" y="${c[1] - 8}" text-anchor="end" style="font-weight:600">+${ev[he.i].toFixed(1)}%</text>`;
  }
  o += `<text x="${pl - 4}" y="${pt + 4}" text-anchor="end">+${mx.toFixed(0)}%</text><text x="${pl - 4}" y="${H - pb}" text-anchor="end">−1%</text><text x="${pl}" y="${H - 5}">${dS(HE.t[0])}</text><text x="${W - pr}" y="${H - 5}" text-anchor="end">${dS(HE.t[25])}</text></svg>`;
  return { svg: o, pj };
}

export function renderCommandView() {
  const K = kpiData(),
    act = CUR.filter((x) => isAct(x.s.s)),
    topAsset = CUR.map((x) => ({ ...x, sc: score(x.a, x.s) })).sort((p, q) => q.sc.total - p.sc.total)[0];

  const degradedTag = topAsset && isAct(topAsset.s.s) ? topAsset.a.tag : 'KO-3201';
  const aTop = byTag(degradedTag) || ASSETS[0];
  const stTop = at(aTop, S.ms);
  const rcaTop = getRcaLifecycle(aTop.tag, S.ms);

  // Time-aware recent events (up to S.ms)
  const recentEvts = INC.filter(i => i.ms <= S.ms).sort((a,b) => b.ms - a.ms).slice(0, 5);
  
  // Plant Unit Overview Matrix data
  const units = [
    { code: 'ARP', name: 'Aurora Resin Plant', tag: 'PU-2101B' },
    { code: 'ZCU', name: 'Zebu Chemical Unit', tag: 'KO-3201' },
    { code: 'NUP', name: 'Nova Utility Plant', tag: 'HE-3301' },
    { code: 'OPP', name: 'Oleo Polymer Plant', tag: 'PM-4405B' }
  ].map(u => {
    const asset = byTag(u.tag);
    const st = asset ? at(asset, S.ms) : { s: 'N', ns: 0 };
    return {
      ...u,
      st: st.s,
      abnormalities: st.ns
    };
  });

  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;letter-spacing:-0.02em;">Manufacturing Command Center</h1>
        <p class="mu" style="margin-top:2px;">One governed view of manufacturing performance and active operational risks</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="badge badge-blue" style="font-size:12.5px;padding:4px 10px;">
          <span class="dot dot-blue"></span> Historical View: ${dS(S.ms, true)} · 08:00
        </span>
      </div>
    </div>

    <!-- SECTION 1: PLANT HEALTH KPIs -->
    <section class="pn" style="margin-top:0;padding:16px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
        <div style="border-right:1px solid var(--line);padding-right:12px;">
          <small class="mu" style="font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Production Performance</small>
          <div style="display:flex;align-items:baseline;gap:8px;margin-top:4px;">
            <b style="font-size:26px;font-family:var(--fm);color:var(--ink);">92.4%</b>
            <small class="mu">of target rate</small>
          </div>
          <div style="font-size:12px;color:var(--N);margin-top:4px;display:flex;align-items:center;gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            +1.2% vs previous shift
          </div>
        </div>

        <div style="border-right:1px solid var(--line);padding-right:12px;">
          <small class="mu" style="font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Plant Reliability</small>
          <div style="display:flex;align-items:baseline;gap:8px;margin-top:4px;">
            <b style="font-size:26px;font-family:var(--fm);color:var(--ink);">97.8%</b>
            <small class="mu">availability</small>
          </div>
          <div style="font-size:12px;color:var(--N);margin-top:4px;display:flex;align-items:center;gap:4px;">
            <span class="dot dot-green"></span> 5 of 5 critical assets online
          </div>
        </div>

        <div style="border-right:1px solid var(--line);padding-right:12px;">
          <small class="mu" style="font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Specific Energy</small>
          <div style="display:flex;align-items:baseline;gap:8px;margin-top:4px;">
            <b style="font-size:26px;font-family:var(--fm);color:var(--ink);">4.18</b>
            <small class="mu">GJ / ton</small>
          </div>
          <div style="font-size:12px;color:${K.ex >= 2 ? 'var(--T)' : 'var(--N)'};margin-top:4px;">
            ${(K.ex >= 0 ? '+' : '') + K.ex.toFixed(1)}% vs forecast
          </div>
        </div>

        <div>
          <small class="mu" style="font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Active Operational Risk</small>
          <div style="display:flex;align-items:baseline;gap:8px;margin-top:4px;">
            <b style="font-size:26px;font-family:var(--fm);color:${act.length > 0 ? 'var(--T)' : 'var(--N)'};">${act.length}</b>
            <small class="mu">abnormalities flagged</small>
          </div>
          <div style="font-size:12px;color:var(--mute);margin-top:4px;">
            <span class="dot ${act.some(x=>x.s.s==='A'||x.s.s==='T') ? 'dot-red' : act.length ? 'dot-amber' : 'dot-green'}"></span>
            ${CUR.filter(x=>x.s.s==='A'||x.s.s==='T').length} critical risk priority
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: ATTENTION REQUIRED (PRIMARY VISUAL FOCUS CARD) -->
    <section class="pn hero" style="background:#FFFFFF;border:1px solid var(--line);border-left:6px solid ${stTop.s === 'T' || stTop.s === 'A' ? 'var(--T)' : stTop.s === 'W' ? 'var(--W)' : 'var(--brand)'};border-radius:8px;padding:18px;margin-top:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="badge ${stTop.s === 'T' || stTop.s === 'A' ? 'badge-red' : stTop.s === 'W' ? 'badge-amber' : 'badge-green'}">
              <span class="dot ${stTop.s === 'T' || stTop.s === 'A' ? 'dot-red' : stTop.s === 'W' ? 'dot-amber' : 'dot-green'}"></span>
              ${stTop.s === 'T' ? 'TRIPPED' : stTop.s === 'A' ? 'HIGH RISK' : stTop.s === 'W' ? 'WARNING - DEGRADATION' : 'NORMAL'}
            </span>
            <h2 style="font-size:20px;font-weight:700;"><span class="mono">${aTop.tag}</span> — ${aTop.c.name}</h2>
          </div>
          <p class="mu" style="margin-top:4px;font-size:13.5px;">${aTop.c.plant} · Class ${aTop.cls} Critical Asset · ${aTop.r.disc} Discipline</p>
        </div>
        <button class="btn pr" data-open="${aTop.tag}" style="padding:7px 14px;font-size:14px;font-weight:600;">
          Investigate ${aTop.tag} ►
        </button>
      </div>

      <!-- Telemetry Breakdown -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;margin-top:16px;background:var(--page);padding:14px;border-radius:6px;border:1px solid var(--line-subtle);">
        <div>
          <small class="mu" style="font-size:11.5px;font-weight:600;">PRIMARY SIGNAL (VIBRATION)</small>
          <div style="font-size:18px;font-weight:700;font-family:var(--fm);color:var(--ink);margin-top:2px;">
            ${aTop.sig[0].n}: <span style="color:${stTop.s==='T'||stTop.s==='A'?'var(--T)':stTop.s==='W'?'var(--W)':'var(--ink)'}">${stTop.i>=0 ? aTop.r.v[0][stTop.i] : 'Baseline'} ${aTop.sig[0].u}</span>
          </div>
          <small class="mu">Trip Limit: 75 µm | Alarm: 45 µm</small>
        </div>

        <div>
          <small class="mu" style="font-size:11.5px;font-weight:600;">SECONDARY SIGNAL (WATER IN OIL)</small>
          <div style="font-size:18px;font-weight:700;font-family:var(--fm);color:var(--ink);margin-top:2px;">
            ${aTop.sig[1].n}: <span style="color:${stTop.s==='T'||stTop.s==='A'?'var(--T)':stTop.s==='W'?'var(--W)':'var(--ink)'}">${stTop.i>=0 ? aTop.r.v[1][stTop.i] : 'Baseline'} ${aTop.sig[1].u}</span>
          </div>
          <small class="mu">Operating Limit: 500 ppm</small>
        </div>

        <div>
          <small class="mu" style="font-size:11.5px;font-weight:600;">RCA STATE (TIME-AWARED)</small>
          <div style="font-size:14px;font-weight:600;color:var(--ink);margin-top:4px;">
            <span class="badge ${rcaTop.state==='Verified'?'badge-green':rcaTop.state==='Under investigation'?'badge-amber':'badge-gray'}">${rcaTop.state}</span>
          </div>
          <small class="mu">${rcaTop.confidence}% confidence score</small>
        </div>
      </div>

      <!-- Likely Relationship Cause Chain -->
      <div style="margin-top:14px;padding:12px;background:rgba(0,82,204,0.04);border-left:3px solid var(--brand);border-radius:4px;">
        <small style="font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.04em;">System Interpretation / Cause Chain</small>
        <p style="font-size:13.5px;margin-top:4px;color:var(--ink);">
          <b>Likely relationship:</b> ${rcaTop.causeText}
        </p>
      </div>
    </section>

    <!-- SECTION 3: PLANT / UNIT OVERVIEW MATRIX -->
    <section class="pn" style="margin-top:16px;">
      <div class="pn-h">
        <h2>Plant & Unit Overview</h2>
        <span class="sm mu">Operational status across major processing units as of ${dS(S.ms, true)}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;margin-top:10px;">
        ${units.map(u => `
          <div style="background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <b style="font-size:15px;font-family:var(--fm);">${u.code}</b>
              <small class="mu" style="display:block;">${u.name}</small>
            </div>
            <div style="text-align:right;">
              <span class="badge ${u.st === 'T' || u.st === 'A' ? 'badge-red' : u.st === 'W' ? 'badge-amber' : 'badge-green'}">
                <span class="dot ${u.st === 'T' || u.st === 'A' ? 'dot-red' : u.st === 'W' ? 'dot-amber' : 'dot-green'}"></span>
                ${u.st === 'T' ? 'TRIP' : u.st === 'A' ? 'ALERT' : u.st === 'W' ? 'WARNING' : 'NORMAL'}
              </span>
              ${u.abnormalities > 0 ? `<small class="mu" style="display:block;margin-top:2px;">${u.abnormalities} abnormal signals</small>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SECTION 4 & 5: RECENT EVENTS & ACTION STATUS (SIDE BY SIDE) -->
    <div class="g2" style="margin-top:16px;">
      <!-- SECTION 4: RECENT EVENTS -->
      <section class="pn" style="margin-top:0;">
        <div class="pn-h">
          <h2>Recent Operational Events</h2>
          <span class="sm mu">Chronological log up to ${dS(S.ms, true)}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
          ${recentEvts.length > 0 ? recentEvts.map(evt => `
            <div style="padding:8px 10px;border-bottom:1px solid var(--line-subtle);display:flex;justify-content:space-between;align-items:center;font-size:13px;">
              <div>
                <span class="mono" style="font-weight:600;color:var(--brand);">${evt.mto || 'AR-2026'}</span>
                <span class="mu" style="margin-left:6px;">${evt.plant} · ${evt.cf || 'Equipment Failure'}</span>
              </div>
              <div class="mono mu" style="font-size:12px;">${dS(evt.ms, true)}</div>
            </div>
          `).join('') : '<div class="empty">No recent operational events prior to this date.</div>'}
        </div>
      </section>

      <!-- SECTION 5: ACTION STATUS SUMMARY -->
      <section class="pn" style="margin-top:0;">
        <div class="pn-h">
          <h2>CAPA Action Status Summary</h2>
          <span class="sm mu">Active corrective and preventive assignments</span>
        </div>
        <div id="tankrows">${tankRows()}</div>
        <div class="legend" style="margin-top:8px">${FN.map((f, i) => `<span><i class="sw" style="background:var(--f${i + 1})"></i>${f}</span>`).join('')}</div>
      </section>
    </div>
  `;
}
