import { state as S, LENS } from '../core/state.js';
import { CUR, kpiData, score, stakeOf, isAct, HE, at, energyAt, FN, ASSETS } from '../core/analytics.js';
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
    L = LENS[S.lens] || LENS.Operations,
    act = CUR.filter((x) => isAct(x.s.s));
  const flagged = CUR.filter((x) => x.s.s === 'W').map((x) => x.a.tag);
  const sub = act.length
    ? `${act.length} of 5 monitored assets are drifting: ${act.map((x) => x.a.tag + ' (' + NM[x.s.s].toLowerCase() + ')').join(', ')}. ${flagged.length ? flagged.join(' and ') + ' ' + (flagged.length > 1 ? 'were' : 'was') + ' flagged by Capsul before the DCS alarmed. ' : ''}${fmtK(stakeOf())} of production is at stake.`
    : 'No monitored asset is drifting on this date. Drag the timeline or jump to a key moment.';
  const en = energyChart(),
    ex = K.ex;
  const bymode = (() => {
    let l = S.mode === 'asof' ? INC.filter((i) => i.ms <= S.ms) : INC;
    return l;
  })();
  const L2 = bymode.filter(
    (i) => (!S.f.plant || i.plant === S.f.plant) && (!S.f.disc || i.disc === S.f.disc)
  );
  const modes = groupBy(L2, (i) => i.cf + '|' + i.mf).slice(0, 6);
  const cnt = bymode.length,
    tl = sum(bymode.map((i) => i.loss)),
    td = sum(bymode.map((i) => i.dt));
  const availableLenses = getAvailableLenses();

  return `<h1>${L.q}</h1><p class="lead">${sub}</p>
<div class="lensrow" role="group" aria-label="Function lens">${availableLenses.map((l) => `<button class="seg" data-lens="${l}" aria-pressed="${l === S.lens}">${l}</button>`).join('')}</div>
<div class="kp">${L.k.map((k) => `<div><small>${K[k][0]}</small><b style="color:${K[k][3] || 'var(--ink)'}">${K[k][1]}</b><span class="s">${K[k][2]}</span><span class="tg"><span class="ch ${K.st[k]}"><i></i>${{ N: 'On target', W: 'Watch', A: 'Off target' }[K.st[k]]}</span> <span class="mu">Target: ${K.tg[k]}</span></span></div>`).join('')}</div>
<section class="pn"><div class="pn-h"><h2>Decision loop</h2><span class="sm mu">Detect, explain, decide, act, verify: where every alert stands</span></div>${loopFunnel()}</section>
<section class="pn hero"><div class="pn-h"><h2>Plant timeline</h2><span class="sm mu">Each lane is one asset. The striped band is the time Capsul knew before the DCS did.</span></div>${ribbon()}</section>
<section class="pn"><div class="pn-h"><h2>Problem tank</h2><span class="sm mu">One queue for every source, ranked by a score you can inspect</span></div>
<div id="tankrows">${tankRows()}</div>
<div class="legend" style="margin-top:8px">${FN.map((f, i) => `<span><i class="sw" style="background:var(--f${i + 1})"></i>${f}</span>`).join('')}</div>
<details ${S.wOpen ? 'open' : ''} id="wdet" style="margin-top:8px"><summary>Change the weights and watch the queue re-rank</summary><div class="wk">${wvHTML()}</div><p class="note">Signal agreement counts signals beyond 3σ from their own 5-week baseline. Cost if it fails is loss per hour times the average outage of similar failures in the Incident DB.${S.lens === 'HSE' ? ' HSE lens adds 8 points to Class A assets.' : ''}${S.lens === 'Energy' ? ' Energy lens adds 8 points to HE-3301, which drives the ZCU energy drift.' : ''}</p></details></section>
<div class="g2"><div><section class="pn"><div class="pn-h"><h2>Energy forecast</h2><span class="tag">simulated · not plant data</span></div>${en.svg}
<p class="sm" style="margin-top:6px">${ex >= 0.5 ? `ZCU specific energy is <b>+${ex.toFixed(1)}%</b> against forecast because HE-3301 has lost ${100 - at(HE, S.ms).i >= 0 ? (100 - HE.r.v[1][at(HE, S.ms).i]).toFixed(0) : 0}% of its preheat duty.${en.pj ? ` If nothing changes, <b>+${en.pj.toFixed(1)}%</b> in four weeks.` : ''}` : 'ZCU energy is on forecast on this date.'} <button class="btn q" data-open="HE-3301">Open HE-3301</button></p>
<p class="note">Model: 25% of lost preheat duty is replaced by fuel (assumption). Energy meters are the one source added to the baseline.</p></section>
<section class="pn"><div class="pn-h"><h2>Recurring failure modes</h2><span class="sm mu">${S.f.plant || S.f.disc ? [S.f.plant, S.f.disc].filter(Boolean).join(' and ') : 'All plants'}</span></div>
<div class="tb"><table><tr><th>Component and failure</th><th class="r">Incidents</th><th class="r">Downtime</th><th class="r">Loss</th></tr>${modes.map((m) => { const [c, f] = m.k.split('|'); return `<tr><td>${c.charAt(0).toUpperCase() + c.slice(1)}, ${MFN[f].toLowerCase()}</td><td class="r num">${m.n}</td><td class="r num">${Math.round(m.dt)} h</td><td class="r num">${fmtK(m.loss)}</td></tr>`; }).join('') || '<tr><td colspan="4">No incidents match. Clear the filter.</td></tr>'}</table></div></section></div>
<section class="pn"><div class="pn-h"><h2>Where losses concentrate</h2><span class="sm mu num">${cnt} incidents, ${Math.round(td).toLocaleString('en-US')} h, ${fmtK(tl)}</span></div>
<div class="lensrow" style="margin:0 0 8px" role="group" aria-label="Incident range"><button class="seg" data-mode="all" aria-pressed="${S.mode === 'all'}">Full history</button><button class="seg" data-mode="asof" aria-pressed="${S.mode === 'asof'}">Up to the replay date</button>${S.f.plant || S.f.disc ? '<button class="btn q" data-clr="1">Clear filter</button>' : ''}</div>
<div class="sm mu">By plant, loss and number of incidents. Click a bar to filter the failure modes.</div>${bars(groupBy(bymode, (i) => i.plant), 'plant')}<div class="sm mu" style="margin-top:10px">By discipline</div>${bars(groupBy(bymode, (i) => i.disc), 'disc')}</section></div>`;
}
