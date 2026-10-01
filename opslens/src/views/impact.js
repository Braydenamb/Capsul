import { state as S } from '../core/state.js';
import { ASSETS, ADDR, SPAN, impRes, scorecard, HEALTHY, dq } from '../core/analytics.js';
import { INC, MFN, groupBy, OPEN } from '../core/incidents.js';
import { dS, fmtK, avg, sum } from '../core/formatting.js';

export function renderImpactView() {
  const tl = sum(INC.map((i) => i.loss)),
    td = sum(INC.map((i) => i.dt)),
    pool = INC.filter((i) => ADDR.includes(i.mf)),
    pl = sum(pool.map((i) => i.loss)),
    g = groupBy(INC, (i) => i.mf),
    mx = g[0].loss;

  return `<h1>Business impact</h1><p class="lead">What the early warning was worth in the five RCA cases, and what it could be worth across the whole Incident DB. Assumptions are adjustable.</p>
<section class="pn hero"><div class="pn-h"><h2>Measured in this replay</h2><span class="sm mu">Five failures, real dates and losses</span></div>
<div class="tb"><table><tr><th>Asset</th><th>OpsLens flag</th><th>DCS alarm</th><th>Trip</th><th class="r">Ahead of DCS</th><th class="r">Ahead of trip</th><th class="r">Downtime</th><th class="r">Loss</th></tr>${ASSETS.map((a) => `<tr class="click" tabindex="0" data-open="${a.tag}"><td><b>${a.tag}</b></td><td>${dS(a.t[a.fl], true)}</td><td>${dS(a.t[a.al], true)}</td><td>${dS(a.failMs, true)}</td><td class="r num">${a.lead > 0 ? a.lead + ' wk' : a.lead < 0 ? 'DCS first by ' + -a.lead + ' wk' : 'same week'}</td><td class="r num">${a.leadFail} wk</td><td class="r num">${a.r.dt} h</td><td class="r num">${fmtK(a.r.loss)}</td></tr>`).join('')}
<tr><td><b>Total</b></td><td colspan="3"></td><td class="r num"><b>${avg(ASSETS.map((a) => a.lead)).toFixed(1)} wk avg</b></td><td class="r num"><b>${avg(ASSETS.map((a) => a.leadFail)).toFixed(1)} wk avg</b></td><td class="r num"><b>${sum(ASSETS.map((a) => a.r.dt))} h</b></td><td class="r num"><b>${fmtK(sum(ASSETS.map((a) => a.r.loss)))}</b></td></tr></table></div>
<p class="note">The flag rule raised no flag in ${HEALTHY.n} healthy weeks (${HEALTHY.fp} false flags). On BL-5702 the DCS alarmed first, so the value there is the named cause and the action, not lead time. Lead time only pays off if someone acts on it, which is why the tracker matters.</p></section>
${scorecard()}
 <section class="pn"><div class="pn-h"><h2>Scenario for the whole plant estate</h2><span class="tag">scenario · not realized savings</span></div>
<div class="wk"><label>Share of addressable failures caught early: <b class="num" id="v-cap">${S.I.cap}%</b><input type="range" min="0" max="100" value="${S.I.cap}" data-im="cap" aria-label="Share caught early"></label><label>Share of loss avoided when caught early: <b class="num" id="v-red">${S.I.red}%</b><input type="range" min="0" max="100" value="${S.I.red}" data-im="red" aria-label="Share of loss avoided"></label><label>Validation hours saved per incident: <b class="num" id="v-hrs">${S.I.hrs} h</b><input type="range" min="0" max="20" value="${S.I.hrs}" data-im="hrs" aria-label="Hours saved per incident"></label></div>
<div id="imres">${impRes()}</div>
<p class="note">Base numbers are real: ${INC.length} incidents, ${Math.round(td).toLocaleString('en-US')} h and ${fmtK(tl)} from Jan 2024 to Jul 2026 (${SPAN.toFixed(1)} years). Addressable means failure modes that show up in condition data first: leakage, vibration, overheating, fouling, wear, loosening and cracking. That is ${Math.round((pl / tl) * 100)}% of the loss.</p></section>
<div class="g2"><section class="pn"><div class="pn-h"><h3>Loss by failure mechanism</h3></div>${g.map((x) => `<div class="bl ${ADDR.includes(x.k) ? '' : 'dim'}" style="grid-template-columns:120px 1fr 100px"><span class="n" style="font-weight:500">${MFN[x.k]}</span><span class="b" style="width:${(x.loss / mx) * 100}%"></span><span class="v num">${fmtK(x.loss)}</span></div>`).join('')}<p class="note">Dark bars are addressable by early warning.</p></section>
<section class="pn"><div class="pn-h"><h3>Beyond loss</h3></div><p class="sm"><b>Faster decisions.</b> Teams stop reconciling reports first. The data-quality panel already surfaces ${dq().length} conflicts a team would otherwise find in a meeting.</p><p class="sm" style="margin-top:8px"><b>Safer follow-through.</b> ${INC.filter((i) => OPEN.includes(i.status)).length} incidents are open, ${INC.filter((i) => OPEN.includes(i.status) && !i.ar).length} of them without an AR number. One board with owners and verified closure removes that blind spot.</p><p class="sm" style="margin-top:8px"><b>Knowledge kept.</b> Every RCA becomes searchable, so a new engineer sees what the last one learned.</p></section></div>`;
}
