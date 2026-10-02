# Full Codebase Reference — Capsul (OpsLens)

This document provides a single-file consolidated source code listing of the entire **Capsul (OpsLens)** web application to assist AI coding agents in reading and analyzing the codebase without needing multi-file view tools.

---

## Table of Contents

1. [index.html](#1-indexhtml)
2. [src/main.js](#2-srcmainjs)
3. [src/core/state.js](#3-srccorestatejs)
4. [src/core/formatting.js](#4-srccoreformattingjs)
5. [src/core/analytics.js](#5-srccoreanalyticsjs)
6. [src/core/incidents.js](#6-srccoreincidentsjs)
7. [src/auth/authConfig.js](#7-srcauthauthconfigjs)
8. [src/auth/auth.js](#8-srcauthauthjs)
9. [src/data/rcaConfig.js](#9-srcdatarcaconfigjs)
10. [src/components/header.js](#10-srccomponentsheaderjs)
11. [src/components/login.js](#11-srccomponentsloginjs)
12. [src/components/modal.js](#12-srccomponentsmodaljs)
13. [src/components/statusChip.js](#13-srccomponentsstatuschipjs)
14. [src/views/command.js](#14-srcviewscommandjs)
15. [src/views/investigate.js](#15-srcviewsinvestigatejs)
16. [src/views/actions.js](#16-srcviewsactionsjs)
17. [src/views/foundation.js](#17-srcviewsfoundationjs)
18. [src/views/impact.js](#18-srcviewsimpactjs)
19. [src/styles/main.css](#19-srcstylesmaincss)

---

## 1. index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Capsul — Intelligent Manufacturing Command Center</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <header id="header"></header>
    <main id="app"></main>
    <dialog id="modal"></dialog>
    <div id="toast"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

---

## 14. src/views/command.js (Redesigned Compact Terminal UI)

```js
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

export function renderCommandView() {
  const K = kpiData(),
    act = CUR.filter((x) => isAct(x.s.s)),
    topAsset = CUR.map((x) => ({ ...x, sc: score(x.a, x.s) })).sort((p, q) => q.sc.total - p.sc.total)[0];

  const degradedTag = topAsset && isAct(topAsset.s.s) ? topAsset.a.tag : 'KO-3201';
  const aTop = byTag(degradedTag) || ASSETS[0];
  const stTop = at(aTop, S.ms);
  const rcaTop = getRcaLifecycle(aTop.tag, S.ms);

  const recentEvts = INC.filter(i => i.ms <= S.ms).sort((a,b) => b.ms - a.ms).slice(0, 5);
  
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
      asset,
      st: st.s,
      abnormalities: st.ns
    };
  });

  return `
    <div class="terminal-hdr">
      <div class="terminal-title">
        <h1>Command Center</h1>
        <span class="mu">Operational Status & Risk Monitoring</span>
      </div>
      <div class="terminal-meta">
        <span class="badge badge-blue">
          <span class="dot dot-blue"></span> Historical View: ${dS(S.ms, true)} · 08:00
        </span>
      </div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-cell">
        <small class="kpi-lbl">Production</small>
        <div class="kpi-val-row">
          <b class="kpi-val">92.4%</b>
          <span class="kpi-delta positive">▲ 1.2%</span>
          <small class="mu">target rate</small>
        </div>
      </div>

      <div class="kpi-cell">
        <small class="kpi-lbl">Reliability</small>
        <div class="kpi-val-row">
          <b class="kpi-val">97.8%</b>
          <span class="kpi-delta positive">5/5 online</span>
          <small class="mu">availability</small>
        </div>
      </div>

      <div class="kpi-cell">
        <small class="kpi-lbl">Specific Energy</small>
        <div class="kpi-val-row">
          <b class="kpi-val">4.18 <small style="font-size:11px;font-weight:400">GJ/t</small></b>
          <span class="kpi-delta ${K.ex >= 2 ? 'negative' : 'neutral'}">${(K.ex >= 0 ? '+' : '') + K.ex.toFixed(1)}%</span>
          <small class="mu">vs fcst</small>
        </div>
      </div>

      <div class="kpi-cell">
        <small class="kpi-lbl">Active Risk</small>
        <div class="kpi-val-row">
          <b class="kpi-val" style="color:${act.length > 0 ? 'var(--T)' : 'var(--N)'}">${act.length}</b>
          <span class="badge ${stTop.s === 'T' || stTop.s === 'A' ? 'badge-red' : stTop.s === 'W' ? 'badge-amber' : 'badge-green'}">
            ${stTop.s === 'T' ? '1 Critical' : stTop.s === 'A' ? '1 Critical' : stTop.s === 'W' ? '1 Warning' : 'Normal'} · ${degradedTag}
          </span>
        </div>
      </div>
    </div>

    <div class="attention-row ${stTop.s === 'T' || stTop.s === 'A' ? 'crit' : stTop.s === 'W' ? 'warn' : ''}">
      <div class="att-lhs">
        <span class="mono att-time">08:00</span>
        <b class="mono att-tag">${aTop.tag}</b>
        <span class="att-name">${aTop.c.name}</span>
        <span class="badge ${stTop.s === 'T' || stTop.s === 'A' ? 'badge-red' : stTop.s === 'W' ? 'badge-amber' : 'badge-green'}">
          ${stTop.s === 'T' ? 'TRIPPED' : stTop.s === 'A' ? 'HIGH RISK' : stTop.s === 'W' ? 'WARNING' : 'NORMAL'}
        </span>
      </div>
      <div class="att-mid">
        <span class="att-sig">${aTop.sig[0].n}: <b>${stTop.i >= 0 ? aTop.r.v[0][stTop.i] : 'Baseline'} ${aTop.sig[0].u}</b> <small class="negative">(↑42%)</small></span>
        <span class="att-sig">${aTop.sig[1].n}: <b>${stTop.i >= 0 ? aTop.r.v[1][stTop.i] : 'Baseline'} ${aTop.sig[1].u}</b></span>
        <span class="att-rca">RCA: <b>${rcaTop.state}</b> (${rcaTop.confidence}%)</span>
      </div>
      <div class="att-rhs">
        <button class="btn pr" data-open="${aTop.tag}" style="padding:3px 10px;font-size:12px;">Investigate ${aTop.tag} →</button>
      </div>
    </div>
    <div class="att-subnote">
      <span class="mono" style="font-weight:700;color:var(--brand)">CAUSE HYPOTHESIS:</span> ${rcaTop.causeText}
    </div>

    <section class="terminal-sec">
      <div class="terminal-sec-hdr">
        <h2>Plant & Unit Operational Status</h2>
        <span class="sm mu">Real-time status across processing units as of ${dS(S.ms, true)}</span>
      </div>
      <div class="tb">
        <table class="terminal-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Plant Name</th>
              <th>Critical Asset</th>
              <th>Status</th>
              <th class="r">Abnormalities</th>
              <th>Primary Telemetry Signal</th>
              <th class="r">Action</th>
            </tr>
          </thead>
          <tbody>
            ${units.map(u => {
              const a = u.asset;
              const st = a ? at(a, S.ms) : { s: 'N', ns: 0, i: -1 };
              const mainSig = a ? a.sig[0] : null;
              const val = a && st.i >= 0 ? a.r.v[0][st.i] : 'Baseline';
              return `
                <tr>
                  <td><b class="mono" style="color:var(--brand)">${u.code}</b></td>
                  <td>${u.name}</td>
                  <td><b class="mono">${u.tag}</b></td>
                  <td>
                    <span class="badge ${u.st === 'T' || u.st === 'A' ? 'badge-red' : u.st === 'W' ? 'badge-amber' : 'badge-green'}">
                      <span class="dot ${u.st === 'T' || u.st === 'A' ? 'dot-red' : u.st === 'W' ? 'dot-amber' : 'dot-green'}"></span>
                      ${u.st === 'T' ? 'TRIP' : u.st === 'A' ? 'ALERT' : u.st === 'W' ? 'WARNING' : 'NORMAL'}
                    </span>
                  </td>
                  <td class="r mono">${u.abnormalities > 0 ? `<b style="color:var(--T)">${u.abnormalities} / 4</b>` : '0 / 4'}</td>
                  <td class="mono" style="font-size:12.5px;">
                    ${mainSig ? `${mainSig.n}: <b>${val} ${mainSig.u}</b>` : 'Normal'}
                  </td>
                  <td class="r">
                    <button class="btn q" data-open="${u.tag}" style="padding:2px 8px;font-size:12px;">View →</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <div class="terminal-g2">
      <section class="terminal-sec" style="margin-top:0;">
        <div class="terminal-sec-hdr">
          <h2>Recent Operational Events</h2>
          <span class="sm mu">Chronological log prior to ${dS(S.ms, true)}</span>
        </div>
        <div class="tb">
          <table class="terminal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ref / AR</th>
                <th>Plant Unit</th>
                <th>Event Details</th>
              </tr>
            </thead>
            <tbody>
              ${recentEvts.length > 0 ? recentEvts.map(evt => `
                <tr>
                  <td class="mono mu" style="font-size:12px;">${dS(evt.ms, true)}</td>
                  <td><b class="mono" style="color:var(--brand)">${evt.mto || 'AR-2026'}</b></td>
                  <td class="mono">${evt.plant}</td>
                  <td style="font-size:12.5px;">${evt.cf || 'Equipment Failure'}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" class="empty">No recent operational events prior to date.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>

      <section class="terminal-sec" style="margin-top:0;">
        <div class="terminal-sec-hdr">
          <h2>CAPA Action & Problem Queue</h2>
          <span class="sm mu">Ranked by risk priority index (0–100)</span>
        </div>
        <div id="tankrows">${tankRows()}</div>
        <div class="legend" style="margin-top:6px;font-size:11.5px;">${FN.map((f, i) => `<span><i class="sw" style="background:var(--f${i + 1})"></i>${f}</span>`).join('')}</div>
      </section>
    </div>
  `;
}
```
