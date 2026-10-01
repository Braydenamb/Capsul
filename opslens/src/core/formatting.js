export const DAY = 864e5;

export const D0 = (s) => Date.parse(s.slice(0, 10) + 'T00:00:00Z');

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const NM = {
  N: 'Normal',
  W: 'Watch',
  A: 'Alarm',
  T: 'Trip',
  R: 'Recovery'
};

export const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;

export const sum = (a) => a.reduce((s, v) => s + v, 0);

export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export const dS = (ms, y) => {
  const d = new Date(ms);
  return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + (y ? ' ' + d.getUTCFullYear() : '');
};

export const fmtK = (k) =>
  k >= 1000
    ? 'US$' + (k / 1000).toFixed(k >= 10000 ? 1 : 2).replace(/\.?0+$/, '') + 'M'
    : 'US$' + Math.round(k) + 'k';

export const nf = (v) => {
  const a = Math.abs(v);
  return a >= 1000
    ? Math.round(v).toLocaleString('en-US')
    : a >= 100
      ? v.toFixed(0)
      : a >= 10
        ? v.toFixed(1)
        : v.toFixed(2);
};

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const sgm = (z) => (z > 10 ? 'over 10σ' : z.toFixed(1) + 'σ');

export const remTxt = (r) =>
  r === Infinity
    ? 'no upward trend'
    : r > 12
      ? 'more than 12 wk to trip at the current rate'
      : r <= 0
        ? 'at the trip limit'
        : 'about ' + r.toFixed(1) + ' wk to trip at the current rate';

export function issueText(a, s) {
  const top = s.z.map((z, j) => [z, j]).sort((p, q) => q[0] - p[0])[0];
  const sg = a.sig[top[1]];
  if (s.s === 'T') return `Tripped. ${a.r.dt} h of unplanned downtime.`;
  const sigs = `${s.ns} of 4 signals beyond 3σ`;
  return (
    (s.s === 'W'
      ? `Capsul flag: ${sigs}. The DCS has not alarmed. `
      : `DCS alarm since ${dS(a.t[a.al])}. ${sigs}. `) +
    `Strongest: ${sg.n} at ${sgm(top[0])}. ${remTxt(s.rem).replace(/^./, (c) => c.toUpperCase())}.`
  );
}
