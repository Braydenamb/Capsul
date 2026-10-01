import { DEMO_USERS } from './authConfig.js';
import { state as S } from '../core/state.js';

const STORAGE_KEY = 'capsul_auth_session';

let currentUser = null;

// Initialize session from sessionStorage if available
export function initAuth() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const matched = DEMO_USERS.find((u) => u.username === parsed.username);
      if (matched) {
        currentUser = matched;
        applyUserContext(currentUser);
        return currentUser;
      }
    }
  } catch (e) {
    console.warn('Failed to load session:', e);
  }
  return null;
}

export function getCurrentUser() {
  return currentUser;
}

export function isAuthenticated() {
  return currentUser !== null;
}

export function login(username, password) {
  const user = DEMO_USERS.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );
  if (!user) {
    return { success: false, error: 'Invalid username or password.' };
  }
  currentUser = user;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username: user.username }));
  } catch (e) {
    console.warn('Session storage error:', e);
  }
  applyUserContext(user);
  return { success: true, user };
}

export function logout() {
  currentUser = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Session storage error:', e);
  }
}

export function canAccessView(tabKey) {
  if (!currentUser) return false;
  if (currentUser.permissions.includes('*')) return true;
  return currentUser.allowedViews.includes(tabKey);
}

export function canPerform(actionKey) {
  if (!currentUser) return false;
  if (currentUser.permissions.includes('*')) return true;
  return currentUser.permissions.includes(actionKey);
}

export function getAvailableLenses() {
  if (!currentUser) return ['Operations'];
  return currentUser.allowedLenses;
}

function applyUserContext(user) {
  if (user.defaultLens && user.allowedLenses.includes(user.defaultLens)) {
    S.lens = user.defaultLens;
  }
  if (!canAccessView(S.tab)) {
    S.tab = user.defaultView || user.allowedViews[0] || 'cmd';
  }
}
