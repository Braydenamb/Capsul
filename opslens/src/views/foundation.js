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
  const D_all = dq();
  const pastInc = INC.filter((i) => i.ms <= S.ms);
  const pastRca = ASSETS.filter((a) => a.failMs <= S.ms);
  const curDateStr = dS(S.ms, true);

  // Filter Data Quality checks based on state
  const dqFilter = S.dqFilter || { sev: 'All', status: 'All', sort: 'priority' };
  let D = D_all.filter((d) => {
    const isRes = !!S.res[d.id];
    if (dqFilter.status === 'Resolved' && !isRes) return false;
    if (dqFilter.status === 'Unresolved' && isRes) return false;
    if (dqFilter.sev !== 'All' && d.sev !== dqFilter.sev) return false;
    return true;
  });

  if (dqFilter.sort === 'priority') {
    const sevOrder = { High: 1, Medium: 2, Low: 3 };
    D.sort((p, q) => sevOrder[p.sev] - sevOrder[q.sev]);
  } else if (dqFilter.sort === 'title') {
    D.sort((p, q) => p.t.localeCompare(q.t));
  }

  const rs = D_all.filter((d) => S.res[d.id]).length;
  const pv = (a) => a.r.piMeta.find((x) => x[0].endsWith('_VIB'));
  const mto = (t) => INC.find((i) => i.tag === t && i.n <= 5);

  const sources = [
    { domain: 'Production Data (DCS/PI)', status: 'Active', freshness: `Hourly (As of: ${curDateStr})`, records: '105,554 points', quality: '99.2%', used: 'Plant Rate KPI, Anomaly Engine' },
    { domain: 'Equipment Performance', status: 'Active', freshness: `Weekly (As of: ${curDateStr})`, records: '130 records', quality: '97.5%', used: '3σ Deviation, Asset Availability' },
    { domain: 'Incident Database', status: 'Active', freshness: `Per Incident`, records: `${pastInc.length} of ${INC.length} incidents logged`, quality: '96.0%', used: 'Similar Incident Search, Loss Stake' },
    { domain: 'Downtime & RCA Data', status: 'Active', freshness: `Post Event`, records: `${pastRca.length} of ${ASSETS.length} detailed RCAs`, quality: '100.0%', used: 'AI Root Cause, CAPA Actions' }
  ];

  const KP = [
    ['Availability', '(Period h − downtime h) ÷ period h', 'Reliability', 'Equipment record', 'Weekly'],
    ['MTBF', 'Period h ÷ failures', 'Reliability', 'Equipment record', 'Weekly'],
    ['MTTR', 'Downtime h ÷ failures', 'Maintenance', 'Equipment record and RCA', 'Per event'],
    [
      'Downtime (h)',
      'Hours with run status OFF',
      'Operations',
      S.res.dt ? 'Golden record: ' + S.res.dt : 'PI run status or RCA report',
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
      '(Reading − baseline mean) ÷ baseline standard deviation',
      'Reliability',
      'Equipment record',
      'Weekly'
    ]
  ];

  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;letter-spacing:-0.02em;">Data Foundation & Trust</h1>
        <p class="mu" style="margin-top:2px;">Governed data architecture: source provenance, lineage, KPI definitions, and audit rules as of <b class="mono" style="color:var(--brand);">${curDateStr}</b></p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="badge badge-blue">
          <span class="dot dot-blue"></span> Governed View Context
        </span>
      </div>
    </div>

    <!-- Data Source Trust Domain Panel -->
    <section class="pn" style="margin-top:0;">
      <div class="pn-h">
        <h2>Data Source Domains & Trust Status</h2>
        <span class="sm mu">Source freshness, coverage, and quality validation as of ${curDateStr}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px;margin-top:10px;">
        ${sources.map(s => `
          <div style="background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <b style="font-size:14px;color:var(--ink);">${s.domain}</b>
              <span class="badge badge-green"><span class="dot dot-green"></span> ${s.status}</span>
            </div>
            <div style="margin-top:8px;font-size:12.5px;color:var(--mute);line-height:1.4;">
              Freshness: <span class="mono" style="color:var(--ink);">${s.freshness}</span><br>
              Volume: <span class="mono" style="color:var(--ink);">${s.records}</span><br>
              Data Quality: <b style="color:var(--N);">${s.quality}</b><br>
              Used By: <span style="color:var(--ink);">${s.used}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Visual Data Lineage Diagram -->
    <section class="pn" style="margin-top:16px;">
      <div class="pn-h">
        <h2>Data Lineage Pipeline</h2>
        <span class="sm mu">End-to-end evidence pipeline from DCS telemetry to operational recommendation</span>
      </div>
      
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;overflow-x:auto;padding:14px 6px;margin-top:10px;">
        <div style="background:var(--page);border:1px solid var(--line);border-radius:6px;padding:10px 14px;min-width:140px;text-align:center;">
          <small class="mu" style="font-weight:700;">RAW DATA</small>
          <div style="font-weight:600;font-size:13.5px;margin-top:4px;">PI Historian</div>
          <small class="mono mu">Hourly Telemetry</small>
        </div>

        <div style="font-size:18px;color:var(--brand);font-weight:700;">→</div>

        <div style="background:var(--page);border:1px solid var(--line);border-radius:6px;padding:10px 14px;min-width:140px;text-align:center;">
          <small class="mu" style="font-weight:700;">MODEL</small>
          <div style="font-weight:600;font-size:13.5px;margin-top:4px;">Production Model</div>
          <small class="mono mu">Baseline Mean & 3σ</small>
        </div>

        <div style="font-size:18px;color:var(--brand);font-weight:700;">→</div>

        <div style="background:var(--page);border:1px solid var(--line);border-radius:6px;padding:10px 14px;min-width:140px;text-align:center;">
          <small class="mu" style="font-weight:700;">GOVERNED KPI</small>
          <div style="font-weight:600;font-size:13.5px;margin-top:4px;">Plant Rate KPI</div>
          <small class="mono mu">92.4% Target Rate</small>
        </div>

        <div style="font-size:18px;color:var(--brand);font-weight:700;">→</div>

        <div style="background:var(--page);border:1px solid var(--line);border-radius:6px;padding:10px 14px;min-width:140px;text-align:center;">
          <small class="mu" style="font-weight:700;">ANALYTICS</small>
          <div style="font-weight:600;font-size:13.5px;margin-top:4px;">Anomaly Engine</div>
          <small class="mono mu">Multi-Signal Flag</small>
        </div>

        <div style="font-size:18px;color:var(--brand);font-weight:700;">→</div>

        <div style="background:var(--brand-dim);border:1px solid var(--brand);border-radius:6px;padding:10px 14px;min-width:160px;text-align:center;">
          <small style="font-weight:700;color:var(--brand);">WORKFLOW</small>
          <div style="font-weight:700;font-size:13.5px;margin-top:4px;color:var(--brand);"><span class="mono">KO-3201</span> Investigation</div>
          <small class="mono" style="color:var(--brand);">Evidence Verified</small>
        </div>
      </div>
    </section>

    <!-- Asset Key Map Table -->
    <section class="pn" style="margin-top:16px;">
      <div class="pn-h">
        <h2>Governed Asset Key Map</h2>
        <span class="sm mu">Unified technical keys linking equipment, DCS tags, incident logs & plant codes</span>
      </div>
      <div class="tb" style="margin-top:10px;">
        <table>
          <thead>
            <tr>
              <th>Equipment Tag</th>
              <th>PI Sensor Tag</th>
              <th>PI Instrument Tag</th>
              <th>MTO No.</th>
              <th>AR No.</th>
              <th>Plant Code</th>
            </tr>
          </thead>
          <tbody>
            ${ASSETS.map((a) => {
              const m = pv(a), i = mto(a.tag);
              return `
                <tr>
                  <td><b class="mono" style="color:var(--brand);">${a.tag}</b></td>
                  <td class="mono">${m[0]}</td>
                  <td class="mono">${m[3]}</td>
                  <td class="mono">${i.mto}</td>
                  <td class="mono">${i.ar}</td>
                  <td>${a.c.plant}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- KPI Dictionary -->
    <section class="pn" style="margin-top:16px;">
      <div class="pn-h">
        <h2>Standardized KPI Dictionary</h2>
        <span class="sm mu">Governed definitions, formulas, owners, and refresh cycles</span>
      </div>
      <div class="tb" style="margin-top:10px;">
        <table>
          <thead>
            <tr>
              <th>KPI Name</th>
              <th>Governed Formula</th>
              <th>Owner</th>
              <th>Primary Source</th>
              <th>Refresh</th>
            </tr>
          </thead>
          <tbody>
            ${KP.map((r) => `
              <tr>
                <td><b>${r[0]}</b></td>
                <td style="font-size:13px;">${r[1]}</td>
                <td>${r[2]}</td>
                <td class="mono" style="font-size:12.5px;">${r[3]}</td>
                <td><span class="badge badge-gray">${r[4]}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Bounded & Filterable Data Quality Checks -->
    <section class="pn" style="margin-top:16px;">
      <div class="pn-h" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div>
          <h2>Data Quality Rules & Resolution</h2>
          <span class="sm mu">${rs} of ${D_all.length} checks resolved</span>
        </div>
        
        <!-- Filter/Sort Controls Toolbar -->
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:6px;">
            <small class="mu" style="font-weight:600;">PRIORITY:</small>
            <select data-dqsev="1" style="background:var(--page);border:1px solid var(--line);border-radius:6px;padding:3px 6px;font-size:12px;">
              <option value="All" ${dqFilter.sev === 'All' ? 'selected' : ''}>All Priorities</option>
              <option value="High" ${dqFilter.sev === 'High' ? 'selected' : ''}>High</option>
              <option value="Medium" ${dqFilter.sev === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Low" ${dqFilter.sev === 'Low' ? 'selected' : ''}>Low</option>
            </select>
          </div>

          <div style="display:flex;align-items:center;gap:6px;">
            <small class="mu" style="font-weight:600;">STATUS:</small>
            <select data-dqstatus="1" style="background:var(--page);border:1px solid var(--line);border-radius:6px;padding:3px 6px;font-size:12px;">
              <option value="All" ${dqFilter.status === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="Unresolved" ${dqFilter.status === 'Unresolved' ? 'selected' : ''}>Unresolved</option>
              <option value="Resolved" ${dqFilter.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </div>

          <div style="display:flex;align-items:center;gap:6px;">
            <small class="mu" style="font-weight:600;">SORT:</small>
            <select data-dqsort="1" style="background:var(--page);border:1px solid var(--line);border-radius:6px;padding:3px 6px;font-size:12px;">
              <option value="priority" ${dqFilter.sort === 'priority' ? 'selected' : ''}>Priority</option>
              <option value="title" ${dqFilter.sort === 'title' ? 'selected' : ''}>Rule Title</option>
            </select>
          </div>
        </div>
      </div>

      <div class="dq-scroll-container" style="max-height:520px;overflow-y:auto;padding-right:4px;margin-top:10px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:12px;">
          ${D.map((d) => {
            const lc = (s) => (/^[A-Z]{2,}/.test(s) ? s : s.toLowerCase()),
              o = d.opts || ['Use ' + lc(d.a[0]), 'Use ' + lc(d.b[0])],
              r = S.res[d.id];
            return `
              <div class="dq ${r ? 'ok' : d.sev === 'Low' ? 'lo' : ''}" style="background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <b>${d.t}</b>
                  <span class="badge ${d.sev === 'High' ? 'badge-red' : d.sev === 'Medium' ? 'badge-amber' : 'badge-gray'}">${d.sev} Priority</span>
                </div>
                
                <div class="ab" style="margin-top:8px;">
                  <div><small class="mu">${d.a[0]}</small><br><span style="font-size:13px;">${d.a[1]}</span></div>
                  <div><small class="mu">${d.b[0]}</small><br><span style="font-size:13px;">${d.b[1]}</span></div>
                </div>

                <!-- Notion-Style Collapsible Progressive Disclosure -->
                <details class="notion-toggle" style="margin-top:8px;border-top:1px dashed var(--line-subtle);padding-top:6px;">
                  <summary style="cursor:pointer;color:var(--brand);font-weight:500;font-size:12.5px;">Details & Resolution Context</summary>
                  <p class="sm mu" style="margin-top:4px;line-height:1.4;">${d.why}</p>
                </details>

                <div class="bx" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                  ${r ? `
                    <span class="badge badge-green"><span class="dot dot-green"></span> Golden record: ${r}</span>
                    <button class="btn q sm" data-res="${d.id}|" style="padding:2px 8px;">Undo</button>
                  ` : `
                    <button class="btn" data-res="${d.id}|${o[0]}">${o[0].replace(/^./, (c) => c.toUpperCase())}</button>
                    <button class="btn" data-res="${d.id}|${o[1]}">${o[1].replace(/^./, (c) => c.toUpperCase())}</button>
                  `}
                </div>
              </div>
            `;
          }).join('') || `<div class="empty" style="font-size:12.5px;padding:12px;text-align:center;">No data quality checks match the selected filter.</div>`}
        </div>
      </div>
    </section>
  `;
}
