import { RAW } from '../data/raw.js';
import { D0, avg } from './formatting.js';

export const mfOf = (m, t) => {
  const s = (m + ' ' + t).toLowerCase();
  return /vibrat/.test(s)
    ? 'vib'
    : /leak/.test(s)
      ? 'leak'
      : /overheat|over-heat/.test(s)
        ? 'heat'
        : /foul/.test(s)
          ? 'foul'
          : /worn/.test(s)
            ? 'worn'
            : /crack/.test(s)
              ? 'crack'
              : /loose/.test(s)
                ? 'loose'
                : /stuck/.test(s)
                  ? 'stuck'
                  : /malfunction/.test(s)
                    ? 'malf'
                    : /low performance/.test(s)
                      ? 'low'
                      : /error/.test(s)
                        ? 'err'
                        : /breakage|broken/.test(s)
                          ? 'break'
                          : 'other';
};

export const MFN = {
  vib: 'High vibration',
  leak: 'Leakage',
  heat: 'Overheating',
  foul: 'Fouling',
  worn: 'Worn out',
  crack: 'Cracking',
  loose: 'Loosening',
  stuck: 'Stuck',
  malf: 'Malfunction',
  low: 'Low performance',
  err: 'Error',
  break: 'Breakage',
  other: 'Other'
};

export const cfOf = (c) => (/bearing/i.test(c) ? 'bearing' : /seal/i.test(c) ? 'seal' : c.toLowerCase());

export const INC = RAW.INC.map((x) => ({
  n: x[0],
  tag: x[1],
  plant: x[2],
  cls: x[3],
  date: x[4],
  ms: D0(x[4]),
  title: x[5],
  impact: x[6],
  pre: x[7],
  score: x[8],
  pic: x[9],
  status: x[10],
  disc: x[11],
  type: x[12],
  comp: x[13],
  mech: x[14],
  dt: x[15],
  loss: x[16],
  due: x[17],
  dueMs: x[17] ? D0(x[17]) : null,
  ar: x[18],
  mto: x[19],
  cf: cfOf(x[13]),
  mf: mfOf(x[14], x[5])
}));

export const OPEN = ['NEW REGISTERED', 'RCA PROCESS', 'CA/PA EXECUTION'];

export const meanDT = {};
{
  const g = {};
  INC.filter((i) => ['Uptime Loss', 'Class A Eq. Breakdown'].includes(i.impact) && i.dt > 0).forEach(
    (i) => (g[i.type] = g[i.type] || []).push(i.dt)
  );
  for (const k in g) meanDT[k] = avg(g[k]);
}

export function similar(a, ms) {
  const pr = a.c.prof;
  return INC.filter((i) => i.ms < ms && i.tag !== a.tag)
    .map((i) => ({
      i,
      m: (i.type === pr.type ? 40 : 0) + (i.cf === pr.cf ? 35 : 0) + (i.mf === pr.mf ? 25 : 0)
    }))
    .filter((x) => x.m >= 60)
    .sort((p, q) => q.m - p.m || q.i.loss - p.i.loss)
    .slice(0, 5);
}

export function groupBy(L, f) {
  const m = {};
  L.forEach((i) => {
    const k = f(i),
      g = (m[k] = m[k] || { k, loss: 0, n: 0, dt: 0 });
    g.loss += i.loss;
    g.n++;
    g.dt += i.dt;
  });
  return Object.values(m).sort((a, b) => b.loss - a.loss);
}
