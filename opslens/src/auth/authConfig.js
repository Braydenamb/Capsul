/**
 * Capsul Demo Authentication & RBAC Configuration
 * Maps demo credentials to user roles, permissions, and available lenses.
 */

export const DEMO_USERS = [
  {
    username: 'ops',
    password: 'ops',
    name: 'Sarah Chen',
    title: 'Operations Lead',
    role: 'Operations',
    defaultLens: 'Operations',
    allowedLenses: ['Operations', 'Maintenance'],
    defaultView: 'cmd',
    allowedViews: ['cmd', 'inv', 'act', 'fnd'],
    permissions: ['ack', 'createAction']
  },
  {
    username: 'maint',
    password: 'maint',
    name: 'Marcus Vance',
    title: 'Reliability Engineer',
    role: 'Reliability',
    defaultLens: 'Maintenance',
    allowedLenses: ['Maintenance', 'Operations', 'HSE'],
    defaultView: 'cmd',
    allowedViews: ['cmd', 'inv', 'act', 'fnd'],
    permissions: ['ack', 'createAction', 'verifyAction']
  },
  {
    username: 'hse',
    password: 'hse',
    name: 'Elena Rostova',
    title: 'HSE Coordinator',
    role: 'HSE',
    defaultLens: 'HSE',
    allowedLenses: ['HSE', 'Operations'],
    defaultView: 'cmd',
    allowedViews: ['cmd', 'inv', 'act', 'fnd'],
    permissions: ['ack', 'createAction']
  },
  {
    username: 'exec',
    password: 'exec',
    name: 'David Sterling',
    title: 'Plant VP / Executive',
    role: 'Executive',
    defaultLens: 'Management',
    allowedLenses: ['Management', 'Operations', 'Maintenance', 'Energy', 'HSE'],
    defaultView: 'cmd',
    allowedViews: ['cmd', 'inv', 'act', 'fnd', 'imp'],
    permissions: ['ack', 'createAction', 'verifyAction']
  },
  {
    username: 'admin',
    password: 'admin',
    name: 'System Admin',
    title: 'Capsul Administrator',
    role: 'Admin',
    defaultLens: 'Operations',
    allowedLenses: ['Operations', 'Maintenance', 'Energy', 'HSE', 'Management'],
    defaultView: 'cmd',
    allowedViews: ['cmd', 'inv', 'act', 'fnd', 'imp'],
    permissions: ['*']
  }
];
