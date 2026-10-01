import { state as S } from '../core/state.js';
import { CUR, isAct } from '../core/analytics.js';
import { DAY, dS, fmtK } from '../core/formatting.js';
import { INC } from '../core/incidents.js';
import { chip } from './statusChip.js';

export const LOOP = ['Detect', 'Explain', 'Decide', 'Act', 'Verify'];

export const hasK = (o, t) => Object.keys(o).some((k) => k.startsWith(t + '|'));
export const verK = (t) => Object.entries(S.mv).some(([k, v]) => v === 3 && k.startsWith(t + '|'));

export function loopFunnel() {
  const A_ = CUR.filter((x) => isAct(x.s.s)).map((x) => x.a),
    n = [
      A_.length,
      A_.filter((a) => S.fb[a.tag]).length,
      A_.filter((a) => S.ack[a.tag]).length,
      A_.filter((a) => hasK(S.created, a.tag)).length,
      Object.values(S.mv).filter((v) => v === 3).length
    ],
    T = [
      'assets flagged',
      'causes reviewed by a person',
      'alerts acknowledged',
      'with an action created',
      'actions verified by KPI'
    ];
  return `<div class="loop" role="list">${LOOP.map((l, i) => `<span role="listitem" class="${i === 0 && n[0] ? 'dn' : ''}">${l}<b class="num">${n[i]}</b><small>${T[i]}</small></span>`).join('')}</div><p class="note">One closed loop on one governed source. Each confirmed or rejected cause is written back to the RCA knowledge base (${Object.keys(S.fb).length} so far), so the next similar alert starts smarter.</p>`;
}

export function loopBar(a, s) {
  const post = s.s === 'R' || S.ms > a.failMs,
    dn = [
      isAct(s.s) || post,
      post || !!S.fb[a.tag],
      post || !!S.ack[a.tag],
      post || hasK(S.created, a.tag),
      verK(a.tag)
    ],
    cu = dn.indexOf(false);
  return `<div class="loop" aria-label="Decision loop for ${a.tag}">${LOOP.map((l, i) => `<span class="${dn[i] ? 'dn' : i === cu && dn[0] ? 'cu' : ''}">${dn[i] ? '✓ ' : ''}${l}</span>`).join('')}</div>`;
}

export function sbar(a, s, sc, cs, sim) {
  const c = a.c,
    live = isAct(s.s),
    post = S.ms > a.failMs;
  if (!live && !post) return '';
  const top = cs[0],
    a0 = c.acts[0],
    key = a.tag + '|0',
    cr = S.created[key],
    s0 = sim[0],
    fb = S.fb[a.tag],
    ack = S.ack[a.tag];
  const tier = post ? 3 : sc && sc.total >= 60 ? 1 : sc && sc.total >= 40 ? 2 : 3,
    SLA = [0, 1, 3, 7][tier],
    who = ['', 'Plant manager and Reliability lead', 'Reliability lead and unit supervisor', 'Shift supervisor'][tier];
  const days = live && a.fl >= 0 ? Math.floor((S.ms - a.t[a.fl]) / DAY) : 0,
    late = live && !ack && days > SLA;
  return `<section class="pn hero"><div class="pn-h"><h2>Alert summary (SBAR)</h2><span class="sm mu">Same four questions for every function</span></div><div class="sb">
  <div><span class="lt">S</span><small class="k">Situation</small><p>${post ? `Failed on ${dS(a.failMs, true)}: ${a.r.dt} h down, ${fmtK(a.r.loss)} lost. Now recovering.` : a.c.name + ': ' + s.s}</p></div>
  <div><span class="lt">B</span><small class="k">Background</small><p>${s0 ? `Closest past case: <b>${s0.i.tag}</b>, ${s0.m}% match, ${s0.i.dt} h and ${fmtK(s0.i.loss)}. ` : ''}Record ${a.r.ar}, Incident DB #${INC.find((i) => i.tag === a.tag && i.n <= 5).n}.</p></div>
  <div><span class="lt">A</span><small class="k">Assessment</small><p><b>${top.p.t}</b> (${top.st}% evidence). ${post ? 'Confirmed in the RCA.' : 'A hypothesis, not a verdict.'}</p>${post ? '' : fb ? `<p class="sm mu">You ${fb === 'y' ? 'confirmed' : 'rejected'} this cause. Saved to the knowledge base.</p>` : `<div class="bx"><button class="btn" data-fb="${a.tag}|y">Confirm cause</button><button class="btn q" data-fb="${a.tag}|n">Reject</button></div>`}</div>
  <div><span class="lt">R</span><small class="k">Recommendation</small><p>${a0.t}. Owner <b>${a0.pic}</b>.</p><div class="bx"><button class="btn pr" data-mk="${key}" ${cr || post ? 'disabled' : ''}>${cr ? 'On the board' : post ? 'In the RCA record' : 'Create action'}</button></div></div></div>
  ${post ? '' : `<div class="tier ${late ? 'late' : ''}"><span><b>Tier ${tier}</b>: notify ${who}. Acknowledge within ${SLA === 1 ? '1 day' : SLA + ' days'}.</span>${ack ? `<span class="ch N"><i></i>Acknowledged ${dS(ack, true)}</span>` : `<button class="btn" data-ack="${a.tag}">Acknowledge alert</button>`}${late ? `<b style="color:var(--T)">Not acknowledged after ${days} days: escalated to the Reliability manager.</b>` : ''}</div>`}</section>`;
}
