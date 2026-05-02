// js/pages/login.js
import { auth } from '../auth.js';
import { showToast } from '../app.js';

export function renderLogin() {
  const container = document.createElement('div');
  container.className = 'flex items-center justify-center';
  container.style.minHeight = '80vh';

  let isLoginMode = true;

  const renderForm = () => {
    container.innerHTML = `
      <div class="card" style="width: 100%; max-width: 400px; text-align: center;">
        <div style="margin-bottom: 2rem;">
          <i class="ph ph-buildings" style="font-size: 4rem; color: var(--primary-color);"></i>
          <h1 class="h2" style="margin-top: 1rem; margin-bottom: 0.5rem;">${isLoginMode ? 'Welcome Back' : 'Create an Account'}</h1>
          <p class="text-muted">${isLoginMode ? 'Sign in to Hometown Hub' : 'Join the Hometown Hub community'}</p>
        </div>

        <div id="error-message" class="text-danger mb-4" style="font-size: 0.875rem; display: none;"></div>

        <form id="auth-form" style="text-align: left;">
          ${!isLoginMode ? `
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" placeholder="e.g. John Doe" required>
            </div>
          ` : ''}
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" placeholder="e.g. name@example.com" required>
          </div>
          <div class="form-group mt-4">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          
          <div style="margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem;">
              ${isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div style="margin-top: 1.5rem; font-size: 0.875rem;">
          ${isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <button id="toggle-mode-btn" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">
            ${isLoginMode ? 'Create Account' : 'Login'}
          </button>
        </div>

        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-muted); text-align: left;">
          *Admin Demo:<br>
          Email: <strong>veerepallibalaramkrishna@gmail.com</strong><br>
          Password: <strong>Kyojurorengoku@456</strong>
        </div>
      </div>
    `;

    const form = container.querySelector('#auth-form');
    const toggleBtn = container.querySelector('#toggle-mode-btn');
    const errorDiv = container.querySelector('#error-message');

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isLoginMode = !isLoginMode;
      renderForm();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (isLoginMode) {
        const result = await auth.login(email, password);
        if (result.success) {
          showToast(`Welcome back, ${result.user.name}!`);
        } else {
          errorDiv.textContent = result.error;
          errorDiv.style.display = 'block';
        }
      } else {
        const name = document.getElementById('name').value.trim();
        const result = await auth.register(name, email, password);
        if (result.success) {
          showToast(`Account created successfully! Welcome, ${result.user.name}!`);
        } else {
          errorDiv.textContent = result.error;
          errorDiv.style.display = 'block';
        }
      }
    });
  };

  renderForm();
  return container;
}
