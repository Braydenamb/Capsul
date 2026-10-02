import { D0 } from './formatting.js';

export const state = {
  tab: 'cmd',
  ms: D0('2026-02-25'),
  lens: 'Operations',
  sel: 'KO-3201',
  ev: null,
  evI: null,
  W: { cr: 20, ag: 30, tt: 30, cs: 20 },
  wOpen: false,
  f: {},
  mode: 'all',
  created: {},
  ack: {},
  fb: {},
  mv: {},
  dis: {},
  res: {},
  inc: null,
  af: 'All',
  I: { cap: 40, red: 60, hrs: 6 },
  demo: null,
  play: null,
  drag: false,
  actionHistory: [],
  dqFilter: { sev: 'All', status: 'All', sort: 'priority' },
  pinnedTelemetry: null,
  actType: 'All',
  actOwner: 'All',
  actSort: 'priority'
};

// Aliased as S for internal parity if needed
export const S = state;

export const LENS = {
  Operations: {
    q: 'Which units need action on this shift?',
    k: ['drift', 'stake', 'down', 'energy', 'capa']
  },
  Maintenance: {
    q: 'Which failures are building, and which follow-ups are slipping?',
    k: ['capa', 'drift', 'down', 'stake', 'energy']
  },
  Energy: {
    q: 'Where is energy drifting from forecast, and why?',
    k: ['energy', 'drift', 'stake', 'down', 'capa']
  },
  HSE: {
    q: 'Which Class A assets and overdue actions raise risk?',
    k: ['drift', 'capa', 'stake', 'down', 'energy']
  },
  Management: {
    q: 'How much is at stake, and are we closing it?',
    k: ['stake', 'down', 'capa', 'drift', 'energy']
  }
};
