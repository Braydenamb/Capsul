import { login } from '../auth/auth.js';
import { DEMO_USERS } from '../auth/authConfig.js';

export function renderLoginView(onSuccess) {
  const app = document.querySelector('#app');
  if (!app) return;

  app.innerHTML = `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="login-brand">Cap<i>sul</i></div>
          <p class="login-subtitle">Manufacturing Intelligence</p>
        </div>

        <form id="login-form" class="login-form" novalidate>
          <div id="login-error" class="login-error" role="alert" aria-live="assertive" style="display:none;"></div>
          
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              class="login-input" 
              placeholder="e.g. ops" 
              autocomplete="username" 
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="login-input" 
              placeholder="••••••••" 
              autocomplete="current-password" 
              required
            />
          </div>

          <button type="submit" class="btn pr login-btn">Sign in</button>
        </form>

        <div class="login-divider">
          <span>Demo Accounts</span>
        </div>

        <div class="demo-pills-grid" aria-label="Quick sign-in demo accounts">
          ${DEMO_USERS.map(
            (u) => `
            <button class="demo-pill" data-user="${u.username}" data-pass="${u.password}" type="button">
              <span class="demo-pill-title">${u.title}</span>
              <span class="demo-pill-sub">${u.username}</span>
            </button>
          `
          ).join('')}
        </div>

        <div class="login-footer">
          <small class="mu">Authorized manufacturing personnel only · Capsul v1.0</small>
        </div>
      </div>
    </div>
  `;

  // Attach login event handlers
  const form = document.querySelector('#login-form');
  const errorEl = document.querySelector('#login-error');

  const showError = (msg) => {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  };

  const clearError = () => {
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearError();

    const uVal = document.querySelector('#username').value;
    const pVal = document.querySelector('#password').value;

    if (!uVal || !pVal) {
      showError('Please enter both username and password.');
      return;
    }

    const res = login(uVal, pVal);
    if (!res.success) {
      showError(res.error || 'Authentication failed.');
    } else {
      if (onSuccess) onSuccess();
    }
  });

  // Attach quick demo pill clicks
  document.querySelectorAll('.demo-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const u = btn.dataset.user;
      const p = btn.dataset.pass;
      document.querySelector('#username').value = u;
      document.querySelector('#password').value = p;
      clearError();
      const res = login(u, p);
      if (res.success && onSuccess) {
        onSuccess();
      } else if (!res.success) {
        showError(res.error);
      }
    });
  });
}
