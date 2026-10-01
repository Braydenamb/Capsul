import { RAW } from '../data/raw.js';
import { RCA_CONFIG } from '../data/rcaConfig.js';
import { D0, DAY, avg, sum, clamp, fmtK, nf, dS, NM, remTxt } from './formatting.js';
import { INC, OPEN, meanDT } from './incidents.js';
import { state as S } from './state.js';

export const ASSETS = Object.keys(RCA_CONFIG).map((tag) => {
  const r = RAW.A[tag],
    c = RCA_CONFIG[tag],
    a = { tag, r, c, sig: c.sig };
  a.t = r.dates.map(D0);
  a.base = a.sig.map((s, j) => {
    const b = r.v[j].slice(0, 5),
      m = avg(b),
      sd = Math.sqrt(b.reduce((x, y) => x + (y - m) ** 2, 0) / 4);
    return { m, sd: Math.max(sd, Math.abs(m) * 0.005) };
  });
  a.z = r.v[0].map((_, i) => a.sig.map((s, j) => (s.d * (r.v[j][i] - a.base[j].m)) / a.base[j].sd));
  a.ns = a.z.map((z) => z.filter((x) => x > 3).length);
  a.fl = -1;
  for (let i = 5; i < 21; i++)
    if (a.ns[i] >= 3) {
      a.fl = i;
      break;
    }
  a.al = r.st.indexOf('ALARM');
  a.wst = r.v[0].map((_, i) =>
    i > 20 ? 'R' : i === 20 ? 'T' : r.st[i] === 'ALARM' ? 'A' : a.fl >= 0 && i >= a.fl ? 'W' : 'N'
  );
  a.prog = r.v[0].map((_, i) =>
    a.sig.map((s, j) => clamp((r.v[j][i] - a.base[j].m) / (s.tr - a.base[j].m), 0, 1.5))
  );
  a.lph = r.loss / r.dt;
  a.mdt = meanDT[c.prof.type];
  a.stake = a.lph * a.mdt;
  a.lead = a.fl >= 0 ? a.al - a.fl : null;
  a.leadFail = 20 - a.fl;
  a.cls = r.cls;
  a.failMs = a.t[20];
  return a;
});

export const maxStake = Math.max(...ASSETS.map((a) => a.stake));
export const T0 = Math.min(...ASSETS.map((a) => a.t[0]));
export const T1 = Math.max(...ASSETS.map((a) => a.t[25])) + 6 * DAY;
export const NDAYS = Math.round((T1 - T0) / DAY);

export const byTag = (t) => ASSETS.find((a) => a.tag === t);

export const HEALTHY = { n: 0, fp: 0 };
ASSETS.forEach((a) => {
  [0, 1, 2, 3, 4, 21, 22, 23, 24, 25].forEach((i) => {
    HEALTHY.n++;
    if (a.ns[i] >= 3) HEALTHY.fp++;
  });
});

export function at(a, ms) {
  let i = -1;
  for (let k = 0; k < 26; k++) {
    if (a.t[k] <= ms) i = k;
    else break;
  }
  const out = ms > a.t[25] + 6 * DAY;
  let s = i < 0 || out ? 'N' : a.wst[i];
  const o = { i, s, out, ns: 0, z: [0, 0, 0, 0], rem: Infinity, zmax: 0 };
  if (i >= 0 && i <= 20 && !out) {
    o.z = a.z[i];
    o.ns = a.ns[i];
    o.zmax = Math.max(...o.z);
    if (i >= 3)
      for (let j = 0; j < 4; j++) {
        const p = a.prog[i][j],
          sl = (p - a.prog[i - 3][j]) / 3;
        if (p >= 1) o.rem = 0;
        else if (sl > 0.003) o.rem = Math.min(o.rem, (1 - p) / sl);
      }
  }
  return o;
}

export const FN = ['Criticality class', 'Signal agreement', 'Time to trip', 'Cost if it fails'];

export function score(a, st) {
  const W = S.W,
    f = [
      a.cls === 'A' ? 1 : 0.6,
      st.ns / 4,
      st.rem === Infinity ? 0 : 1 - Math.min(st.rem, 12) / 12,
      a.stake / maxStake
    ],
    w = [W.cr, W.ag, W.tt, W.cs],
    T = sum(w) || 1;
  const p = f.map((x, n) => (100 * x * w[n]) / T);
  let bonus = 0;
  if (S.lens === 'HSE' && a.cls === 'A') bonus = 8;
  if (S.lens === 'Energy' && a.tag === 'HE-3301') bonus = 8;
  return { total: Math.min(100, sum(p) + bonus), p, f, bonus };
}

export const HE = byTag('HE-3301');
export const EK = 0.25;
export const energyAt = (i) => (i < 0 || i > 25 ? 0 : EK * Math.max(0, 100 - HE.r.v[1][i]));

export let CUR = [];
export const calc = () => {
  CUR = ASSETS.map((a) => ({ a, s: at(a, S.ms) }));
};

export const isAct = (s) => 'WAT'.includes(s);

export const stakeOf = () => sum(CUR.filter((x) => isAct(x.s.s)).map((x) => x.a.stake));

export const pct = (ms) => ((ms - T0) / (T1 - T0)) * 100;

export function kpiData() {
  const act = CUR.filter((x) => isAct(x.s.s)),
    w = S.ms;
  const w90 = INC.filter((i) => i.ms <= w && i.ms > w - 90 * DAY),
    p90 = INC.filter((i) => i.ms <= w - 90 * DAY && i.ms > w - 180 * DAY);
  const open = INC.filter((i) => i.ms <= w && OPEN.includes(i.status)),
    late = open.filter((i) => i.dueMs && i.dueMs < w).length;
  const he = at(HE, w),
    ex = he.out ? 0 : energyAt(he.i);
  const worst = act.some((x) => x.s.s === 'A' || x.s.s === 'T')
    ? 'var(--A)'
    : act.length
      ? 'var(--W)'
      : 'var(--N)';
  return {
    drift: [
      'Assets drifting',
      act.length + ' of 5',
      act.map((x) => x.a.tag).join(', ') || 'None on this date',
      worst
    ],
    stake: [
      'Loss at stake',
      fmtK(stakeOf()),
      'Loss per hour times the average outage of similar failures'
    ],
    down: [
      'Downtime, last 90 days',
      Math.round(sum(w90.map((i) => i.dt))) + ' h',
      Math.round(sum(p90.map((i) => i.dt))) + ' h in the 90 days before (Incident DB)'
    ],
    energy: [
      'ZCU energy vs forecast',
      (ex >= 0.05 ? '+' : '') + ex.toFixed(1) + '%',
      'Modelled from HE-3301 heat duty (simulated)',
      ex >= 2 ? 'var(--A)' : 'var(--ink)'
    ],
    capa: [
      'Open RCA and CAPA',
      open.length,
      late + ' past RCA due date, still open in the Incident DB',
      'var(--ink)'
    ],
    ex,
    open,
    late,
    tg: {
      drift: '0 assets drifting',
      stake: 'US$0 at stake',
      down: '60 h or less per 90 days',
      energy: 'within ±1% of forecast',
      capa: '0 past RCA due date'
    },
    st: {
      drift: act.length === 0 ? 'N' : act.some((x) => x.s.s === 'A' || x.s.s === 'T') ? 'A' : 'W',
      stake: stakeOf() === 0 ? 'N' : stakeOf() > 1000 ? 'A' : 'W',
      down: ((h) => (h <= 60 ? 'N' : h <= 120 ? 'W' : 'A'))(sum(w90.map((i) => i.dt))),
      energy: ex < 1 ? 'N' : ex < 3 ? 'W' : 'A',
      capa: late === 0 ? 'N' : late <= 20 ? 'W' : 'A'
    }
  };
}

export function dq() {
  const dd = ASSETS.filter((a) => Math.abs(a.r.piOff - a.r.dt) > 0.01),
    open = INC.filter((i) => OPEN.includes(i.status)),
    noAR = open.filter((i) => !i.ar),
    odd = INC.filter((i) => ['High', 'Mechanical', 'Motor'].includes(i.mech));
  return [
    {
      id: 'dt',
      sev: 'High',
      t: 'Downtime hours differ between PI and the RCA report',
      a: ['PI run status', dd.map((a) => a.tag + ' ' + a.r.piOff + ' h').join(', ')],
      b: ['RCA report', dd.map((a) => a.tag + ' ' + a.r.dt + ' h').join(', ')],
      why: 'Availability, MTTR and loss all depend on downtime. Pick one clock.'
    },
    {
      id: 'un',
      sev: 'High',
      t: 'KO-3201 vibration unit disagrees',
      a: ['PI tag metadata', 'KO3201_VIB unit MM/S'],
      b: ['Equipment record', 'DE radial vibration in µm, alarm 45, trip 75'],
      why: 'Readings of 27 to 77 only make sense in µm. A dashboard that trusts the PI unit would show a false alarm of about 10 times the limit.'
    },
    {
      id: 'lp',
      sev: 'High',
      t: 'KO-3201 lube-oil pressure: cause ruled out on a different number',
      a: ['RCA report', '1.8 barg, normal band'],
      b: ['Equipment record', '1.08 barg by trip week, trip limit 1.1'],
      why: 'The RCA ruled out low oil pressure. If the record is right, that cause was never really tested.'
    },
    {
      id: 'cu',
      sev: 'High',
      t: 'PM-4405B motor current: overload ruled out on a different number',
      a: ['RCA report', '132 A, within limit'],
      b: ['Equipment record', '168.3 A at trip, alarm 150'],
      why: 'Motor overload was excluded on the RCA figure.'
    },
    {
      id: 'ar',
      sev: 'High',
      t: 'Open incidents without an AR number',
      a: ['Incident DB', noAR.length + ' of ' + open.length + ' open incidents have no AR number'],
      b: ['Needed', 'Every open incident traceable to an AR'],
      opts: ['Flag to Reliability', 'Accept the gap'],
      why: 'Without an AR number the RCA and CAPA cannot be tracked to closure.'
    },
    {
      id: 'wa',
      sev: 'Medium',
      t: 'KO-3201 lube-oil water at trip',
      a: ['RCA report', '1,800 ppm, sample taken after the trip'],
      b: ['Equipment record', '1,530 ppm, trip-week reading'],
      why: 'Both can be true at different times. The dashboard needs one rule for which reading counts.'
    },
    {
      id: 'al',
      sev: 'Medium',
      t: 'KO-3201 vibration alert level',
      a: ['RCA report', 'Alert at 60 µm'],
      b: ['Equipment record', 'Alarm at 45 µm'],
      why: 'Two limits for the same signal give two answers to “is it in alarm?”.'
    },
    {
      id: 'of',
      sev: 'Medium',
      t: 'BL-5702 coupling offset at trip',
      a: ['RCA report', '0.35 mm'],
      b: ['Equipment record', '0.306 mm, trip limit 0.3'],
      why: 'Small gap, but the value defines when the alignment KPI turns red.'
    },
    {
      id: 'pm',
      sev: 'Medium',
      t: 'PM compliance is 92% on all five assets',
      a: ['Equipment record', '92% for every asset'],
      b: ['Expected', 'A different value per asset'],
      opts: ['Treat it as a plant-level KPI', 'Ask Maintenance for asset values'],
      why: 'Identical values suggest a plant figure copied onto each record.'
    },
    {
      id: 'mc',
      sev: 'Medium',
      t: 'Incomplete failure-mechanism codes in the Incident DB',
      a: [
        'Incident DB',
        odd.length + ' records (the RCA cases) use “High”, “Mechanical” or “Motor”'
      ],
      b: ['Needed', 'A standard failure-mechanism list'],
      opts: ['Normalize with a mapping', 'Leave as recorded'],
      why: 'Similar-incident search needs comparable codes. OpsLens derives them from the title as a stop-gap.'
    },
    {
      id: 'pl',
      sev: 'Low',
      t: 'Plant names differ between sources',
      a: ['Equipment record', 'Resin Plant (ARP), Utility Plant (NUP)'],
      b: ['RCA report', 'Aurora Resin Plant, Nova Utility Plant'],
      opts: ['Use the plant code as the key', 'Use the RCA names'],
      why: 'The four-letter plant code is the only value that matches everywhere.'
    }
  ];
}

export const ADDR = ['leak', 'vib', 'heat', 'foul', 'worn', 'loose', 'crack'];
export const SPAN = (D0('2026-07-25') - D0('2024-01-04')) / DAY / 365.25;

export function impRes() {
  const pool = INC.filter((i) => ADDR.includes(i.mf)),
    pl = sum(pool.map((i) => i.loss)),
    pd = sum(pool.map((i) => i.dt)),
    c = S.I.cap / 100,
    r = S.I.red / 100;
  return `<div class="im"><div><div class="big">${fmtK(((pl / SPAN) * c * r))}</div><div class="sm">Illustrative annual loss avoidance</div><p class="note">${fmtK(pl / SPAN)} addressable per year × ${S.I.cap}% caught early × ${S.I.red}% of loss avoided</p></div>
<div><div class="big">${Math.round(((pd / SPAN) * c * r))} h</div><div class="sm">Unplanned downtime avoided per year</div><p class="note">${Math.round(pd / SPAN)} h addressable per year, same two shares</p></div>
<div><div class="big">${Math.round((INC.length / SPAN) * S.I.hrs).toLocaleString('en-US')} h</div><div class="sm">Data-validation time saved per year</div><p class="note">${Math.round(INC.length / SPAN)} incidents per year × ${S.I.hrs} h across functions</p></div></div>`;
}

export function scorecard() {
  const cut = D0('2026-07-25'),
    all = ASSETS.flatMap((a) => a.c.acts),
    cl = all.filter((x) => x.stt === 'Closed').length,
    od = all.filter((x) => x.stt !== 'Closed' && D0(x.due) < cut).length,
    noAR = INC.filter((i) => OPEN.includes(i.status) && !i.ar).length;
  const R = [
    [
      'Actions recorded as closed (not verified by KPI)',
      cl + ' of ' + all.length + ' in the register',
      '80% or more, on time'
    ],
    ['Open and past due at the data cut-off (25 Jul 2026)', od + ' actions', '0'],
    ['Open incidents with no AR number', noAR + ' incidents', '0'],
    [
      'Lead time ahead of the DCS alarm',
      avg(ASSETS.map((a) => a.lead)).toFixed(1) + ' wk average across 5 cases',
      '2 wk or more'
    ],
    [
      'Time from first flag to a named decision',
      'Not measurable: no timestamped acknowledgement exists today',
      '1 day or less for Tier 1'
    ]
  ];
  return `<section class="pn"><div class="pn-h"><h2>Closed-loop scorecard</h2><span class="sm mu">Does the loop actually close? Baseline is measured, targets are proposed</span></div><div class="tb"><table><tr><th>Loop KPI</th><th>Baseline from the data</th><th>Target with OpsLens</th></tr>${R.map((r) => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td></tr>`).join('')}</table></div></section>`;
}
