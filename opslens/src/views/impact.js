import { state as S } from '../core/state.js';
import { ASSETS, ADDR, SPAN, impRes, scorecard, HEALTHY, dq } from '../core/analytics.js';
import { INC, MFN, groupBy, OPEN } from '../core/incidents.js';
import { dS, fmtK, avg, sum } from '../core/formatting.js';

export function renderImpactView() {
  const pastInc = INC.filter((i) => i.ms <= S.ms);
  const curDateStr = dS(S.ms, true);
  const tl = sum(pastInc.map((i) => i.loss));
  const td = sum(pastInc.map((i) => i.dt));
  const pool = pastInc.filter((i) => ADDR.includes(i.mf));
  const pl = sum(pool.map((i) => i.loss));
  const g = groupBy(pastInc, (i) => i.mf);
  const mx = (g[0] && g[0].loss) || 1;

  const realizedAssets = ASSETS.map((a) => {
    const hasFailed = S.ms >= a.failMs;
    const hasAlarmed = a.al >= 0 && S.ms >= a.t[a.al];
    const hasFlagged = a.fl >= 0 && S.ms >= a.t[a.fl];
    return {
      tag: a.tag,
      flagDate: hasFlagged ? dS(a.t[a.fl], true) : '<span style="color:var(--mute);">Pending</span>',
      alarmDate: hasAlarmed ? dS(a.t[a.al], true) : '<span style="color:var(--mute);">Pending</span>',
      tripDate: hasFailed ? dS(a.failMs, true) : '<span style="color:var(--mute);font-style:italic;">Not occurred</span>',
      leadDcs: hasAlarmed ? (a.lead > 0 ? a.lead + ' wk' : a.lead < 0 ? 'DCS first by ' + -a.lead + ' wk' : 'same week') : '<span style="color:var(--mute);">Pending</span>',
      leadTrip: hasFailed ? a.leadFail + ' wk' : '<span style="color:var(--mute);">Pending</span>',
      dt: hasFailed ? a.r.dt : 0,
      loss: hasFailed ? a.r.loss : 0,
      hasFailed,
      hasAlarmed,
      leadVal: a.lead,
      leadFailVal: a.leadFail
    };
  });

  const failedAssets = realizedAssets.filter(x => x.hasFailed);
  const alarmedAssets = realizedAssets.filter(x => x.hasAlarmed);
  const totalDt = sum(failedAssets.map(x => x.dt));
  const totalLoss = sum(failedAssets.map(x => x.loss));
  const avgLeadDcs = alarmedAssets.length > 0 ? (avg(alarmedAssets.map(x => x.leadVal)).toFixed(1) + ' wk avg') : '0.0 wk avg';
  const avgLeadTrip = failedAssets.length > 0 ? (avg(failedAssets.map(x => x.leadFailVal)).toFixed(1) + ' wk avg') : '0.0 wk avg';

  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;letter-spacing:-0.02em;">Business Impact & Value Realization</h1>
        <p class="mu" style="margin-top:2px;">Measured ROI from early warning flags vs actual plant incidents as of <b class="mono" style="color:var(--brand);display:inline-block;min-width:95px;text-align:center;">${curDateStr}</b></p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="badge badge-green" style="min-width:180px;justify-content:center;">
          <span class="dot dot-green"></span> Evaluated Up to ${curDateStr}
        </span>
      </div>
    </div>

    <section class="pn hero" style="margin-top:0;">
      <div class="pn-h">
        <h2>Measured Realized Failures</h2>
        <span class="sm mu">Asset failures and early warning lead times up to ${curDateStr}</span>
      </div>
      <div class="tb" style="margin-top:10px;">
        <table style="table-layout:fixed;width:100%;">
          <colgroup>
            <col style="width:12%;">
            <col style="width:14%;">
            <col style="width:14%;">
            <col style="width:14%;">
            <col style="width:14%;">
            <col style="width:12%;">
            <col style="width:10%;">
            <col style="width:10%;">
          </colgroup>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Capsul Flag</th>
              <th>DCS Alarm</th>
              <th>Trip Date</th>
              <th class="r">Ahead of DCS</th>
              <th class="r">Ahead of Trip</th>
              <th class="r">Downtime</th>
              <th class="r">Realized Loss</th>
            </tr>
          </thead>
          <tbody>
            ${realizedAssets.map((a) => `
              <tr class="click" tabindex="0" data-open="${a.tag}">
                <td><b style="color:var(--brand);">${a.tag}</b></td>
                <td class="mono">${a.flagDate}</td>
                <td class="mono">${a.alarmDate}</td>
                <td class="mono">${a.tripDate}</td>
                <td class="r num">${a.leadDcs}</td>
                <td class="r num">${a.leadTrip}</td>
                <td class="r num">${a.dt} h</td>
                <td class="r num">${fmtK(a.loss)}</td>
              </tr>
            `).join('')}
            <tr>
              <td><b>Total Realized (as of ${curDateStr})</b></td>
              <td colspan="3"></td>
              <td class="r num"><b>${avgLeadDcs}</b></td>
              <td class="r num"><b>${avgLeadTrip}</b></td>
              <td class="r num"><b>${totalDt} h</b></td>
              <td class="r num"><b>${fmtK(totalLoss)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="note" style="margin-top:10px;">The flag rule raised no flag in ${HEALTHY.n} healthy weeks (${HEALTHY.fp} false flags). On BL-5702 the DCS alarmed first, so the value there is the named cause and the action, not lead time.</p>
    </section>

    ${scorecard(S.ms)}

    <section class="pn" style="margin-top:16px;">
      <div class="pn-h">
        <h3>Loss by Failure Mechanism</h3>
        <span class="sm mu">Incidents prior to ${curDateStr} (${pastInc.length} incident${pastInc.length === 1 ? '' : 's'})</span>
      </div>
      <div style="margin-top:10px;">
        ${g.length > 0 ? g.map((x) => `
          <div class="bl ${ADDR.includes(x.k) ? '' : 'dim'}" style="grid-template-columns:140px 1fr 100px;margin-top:4px;">
            <span class="n" style="font-weight:500">${MFN[x.k]}</span>
            <span class="b" style="width:${(x.loss / mx) * 100}%"></span>
            <span class="v num">${fmtK(x.loss)}</span>
          </div>
        `).join('') : '<div class="empty" style="font-size:12.5px;padding:12px;text-align:center;">No incidents recorded prior to this date.</div>'}
      </div>
      <p class="note" style="margin-top:10px;">Dark bars are addressable by early warning condition monitoring.</p>
    </section>
  `;
}
