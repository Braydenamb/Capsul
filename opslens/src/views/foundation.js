import { state as S } from '../core/state.js';
import { ASSETS, dq } from '../core/analytics.js';
import { INC } from '../core/incidents.js';

export const KP_DICT = [
  ['Availability', '(Period h − downtime h) ÷ period h', 'Reliability', 'Equipment record', 'Weekly'],
  ['MTBF', 'Period h ÷ failures', 'Reliability', 'Equipment record', 'Weekly'],
  ['MTTR', 'Downtime h ÷ failures', 'Maintenance', 'Equipment record and RCA', 'Per event'],
  [
    'Downtime (h)',
    'Hours with run status OFF',
    'Operations',
    S.res.dt ? 'Golden record: ' + S.res.dt : 'PI run status or RCA report, to be decided',
    'Hourly'
  ],
  ['Production loss (t)', 'Downtime h × rate loss per hour', 'Production', 'RCA report', 'Per event'],
  [
    'Loss (US$k)',
    'Production loss × product price. Incident DB: actual + potential',
    'Finance',
    'RCA report, Incident DB',
    'Per event'
  ],
  ['PM compliance', 'PM completed ÷ PM scheduled', 'Maintenance', 'Equipment record', 'Weekly'],
  [
    'Signal deviation (σ)',
    '(Reading − baseline mean) ÷ baseline standard deviation, first 5 weeks',
    'Reliability',
    'Equipment record',
    'Weekly'
  ],
  [
    'Loss at stake',
    'Loss per hour × average outage of similar failures',
    'Reliability with Finance',
    'RCA report, Incident DB',
    'On demand'
  ],
  [
    'Overdue RCA',
    'RCA due date before the replay date and status still open',
    'HSE with Reliability',
    'Incident DB',
    'Daily'
  ]
];

export function renderFoundationView() {
  const D = dq(),
    rs = D.filter((d) => S.res[d.id]).length,
    pv = (a) => a.r.piMeta.find((x) => x[0].endsWith('_VIB'));
  const mto = (t) => INC.find((i) => i.tag === t && i.n <= 5);

  const KP = [
    ['Availability', '(Period h − downtime h) ÷ period h', 'Reliability', 'Equipment record', 'Weekly'],
    ['MTBF', 'Period h ÷ failures', 'Reliability', 'Equipment record', 'Weekly'],
    ['MTTR', 'Downtime h ÷ failures', 'Maintenance', 'Equipment record and RCA', 'Per event'],
    [
      'Downtime (h)',
      'Hours with run status OFF',
      'Operations',
      S.res.dt ? 'Golden record: ' + S.res.dt : 'PI run status or RCA report, to be decided',
      'Hourly'
    ],
    ['Production loss (t)', 'Downtime h × rate loss per hour', 'Production', 'RCA report', 'Per event'],
    [
      'Loss (US$k)',
      'Production loss × product price. Incident DB: actual + potential',
      'Finance',
      'RCA report, Incident DB',
      'Per event'
    ],
    ['PM compliance', 'PM completed ÷ PM scheduled', 'Maintenance', 'Equipment record', 'Weekly'],
    [
      'Signal deviation (σ)',
      '(Reading − baseline mean) ÷ baseline standard deviation, first 5 weeks',
      'Reliability',
      'Equipment record',
      'Weekly'
    ],
    [
      'Loss at stake',
      'Loss per hour × average outage of similar failures',
      'Reliability with Finance',
      'RCA report, Incident DB',
      'On demand'
    ],
    [
      'Overdue RCA',
      'RCA due date before the replay date and status still open',
      'HSE with Reliability',
      'Incident DB',
      'Daily'
    ]
  ];

  return `<h1>Data foundation</h1><p class="lead">One governed layer behind every view: shared keys, one definition per KPI, and visible data-quality rules.</p>
<section class="pn hero"><div class="pn-h"><h2>Seven reports become one view</h2><span class="tag">baseline counts assumed</span></div><div class="ba"><div><b>Today: one report per function</b><ul><li>Operations shift trend board (PI)</li><li>Weekly condition-monitoring report</li><li>CMMS and PM report</li><li>RCA and CAPA tracker (spreadsheet)</li><li>Incident log</li><li>Energy dashboard</li><li>Monthly management pack</li></ul></div><div class="arr" aria-hidden="true">→</div><div><b>With Capsul: one governed view, five lenses</b><ul><li>Command: timeline, problem tank, KPIs, energy, losses</li><li>Investigate: trends, cause, similar incidents, actions</li><li>Actions: one board with owners and verified closure</li><li>One KPI dictionary and one asset key map</li><li>Lenses for Operations, Maintenance, Energy, HSE, Management</li></ul></div></div></section>
<section class="pn"><div class="pn-h"><h2>Source map</h2></div><div class="flow"><div class="col2"><div class="nd"><b>Production (PI tags)</b><small>Hourly rate, pressure, vibration, temperature, run status. Feeds the outage view.</small></div><div class="nd"><b>Equipment condition</b><small>Weekly health, availability, MTBF, MTTR, PM. Feeds early warning.</small></div><div class="nd"><b>Incident database</b><small>380 incidents with loss and RCA status. Feeds similar incidents and loss concentration.</small></div><div class="nd"><b>Downtime and RCA</b><small>4P and 4M+1E causes, CAPA, owners. Feeds causes and actions.</small></div><div class="nd add"><b>Energy meters (added, simulated)</b><small>Case names energy but the baseline has none. Modelled here from HE-3301 duty.</small></div></div>
<div class="arr" aria-hidden="true">→</div><div class="col2"><div class="nd gv"><b>Asset key map</b><small>One key links equipment tag, PI tag, incident tag, MTO and AR numbers, plant code.</small></div><div class="nd gv"><b>KPI dictionary</b><small>One formula, owner, source and refresh per KPI.</small></div><div class="nd gv"><b>Data-quality rules</b><small>${D.length} checks. ${rs} resolved. Conflicts need a named golden record.</small></div><div class="nd gv"><b>Access and audit</b><small>Prototype: role lenses work now. Accounts, saved audit trail and CMMS write-back are implementation targets.</small></div></div>
<div class="arr" aria-hidden="true">→</div><div class="col2"><div class="nd"><b>Command</b><small>Executive view for five function lenses</small></div><div class="nd"><b>Investigate</b><small>Cause, evidence, similar incidents</small></div><div class="nd"><b>Actions</b><small>Owners, guidance, verified closure</small></div></div></div>
<div class="tb" style="margin-top:12px"><table><tr><th>Proposed source</th><th>Why it earns its place</th><th>Phase</th></tr><tr><td>Energy meters</td><td>Case background names abnormal energy use. Turns energy drift into an alert linked to its cause.</td><td>Prototype (simulated)</td></tr><tr><td>CMMS work orders</td><td>Confirms that an action was actually done, so closure is verified rather than self-reported.</td><td>Phase 2</td></tr><tr><td>Emission analyzers (CEMS)</td><td>Case names emission deviation. Gives HSE a real signal. Not in the baseline, so no emission KPI is shown here.</td><td>Phase 2</td></tr></table></div></section>
<section class="pn"><div class="pn-h"><h2>Asset key map</h2><span class="sm mu">The same asset under each source’s key</span></div><div class="tb"><table><tr><th>Equipment tag</th><th>PI tag (vibration)</th><th>PI instrument tag</th><th>MTO no.</th><th>AR no.</th><th>Plant code</th></tr>${ASSETS.map((a) => { const m = pv(a), i = mto(a.tag); return `<tr><td><b>${a.tag}</b></td><td class="num">${m[0]}</td><td class="num">${m[3]}</td><td class="num">${i.mto}</td><td class="num">${i.ar}</td><td>${a.c.plant}</td></tr>`; }).join('')}</table></div></section>
<section class="pn"><div class="pn-h"><h2>KPI dictionary</h2></div><div class="tb"><table><tr><th>KPI</th><th>Formula</th><th>Owner</th><th>Source</th><th>Refresh</th><th>Target · warn · critical (proposed)</th></tr>${KP.map((r, n) => `<tr>${r.map((c, i) => `<td>${i === 0 ? '<b>' + c + '</b>' : c}</td>`).join('')}<td class="num">${['99.5 · 99.0 · 98.0 %', '4,000 · 3,000 · 2,000 h', '8 · 16 · 24 h', '2 · 8 · 16 h', 'per event, no target', 'per event, no target', '95 · 90 · 85 %', '3σ flag · alarm · trip', '0 · 500 · 1,000 US$k', '0 · 10 · 20 open'][n]}</td></tr>`).join('')}</table></div></section>
<section class="pn"><div class="pn-h"><h2>Data-quality checks</h2><span class="sm mu num">${rs} of ${D.length} resolved</span></div><p class="sm mu">Found by comparing the four baseline files. Pick the golden record for each conflict.</p>
${D.map((d) => {
    const lc = (s) => (/^[A-Z]{2,}/.test(s) ? s : s.toLowerCase()),
      o = d.opts || ['Use ' + lc(d.a[0]), 'Use ' + lc(d.b[0])],
      r = S.res[d.id];
    return `<div class="dq ${r ? 'ok' : d.sev === 'Low' ? 'lo' : ''}"><b>${d.t}</b> <span class="tag">${d.sev}</span><div class="ab"><div><small class="mu">${d.a[0]}</small><br>${d.a[1]}</div><div><small class="mu">${d.b[0]}</small><br>${d.b[1]}</div></div><p class="sm mu">${d.why}</p><div style="margin-top:6px">${r ? `<span class="ch N"><i></i>Golden record: ${r}</span> <button class="btn q" data-res="${d.id}|">Undo</button>` : `<button class="btn" data-res="${d.id}|${o[0]}">${o[0].replace(/^./, (c) => c.toUpperCase())}</button> <button class="btn" data-res="${d.id}|${o[1]}">${o[1].replace(/^./, (c) => c.toUpperCase())}</button>`}</div></div>`;
  }).join('')}</section>`;
}
