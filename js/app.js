// js/app.js
import { auth } from './auth.js';

// Components
import { renderNavbar } from './components/navbar.js';

// Pages
import { renderLogin } from './pages/login.js';
import { renderFeed } from './pages/feed.js';
import { renderEvents } from './pages/events.js';
import { renderShops } from './pages/shops.js';
import { renderClubs } from './pages/clubs.js';
import { renderAdmin } from './pages/admin.js';

const ROUTES = {
  '/': renderFeed,
  '/events': renderEvents,
  '/shops': renderShops,
  '/clubs': renderClubs,
  '/admin': renderAdmin,
};

class App {
  constructor() {
    this.appContainer = document.getElementById('main-content');
    this.navbarContainer = document.getElementById('navbar');
    
    // Listen to hash changes for routing
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Listen to auth changes
    auth.subscribe(() => {
      this.renderNav();
      this.handleRoute();
    });

    this.init();
  }

  init() {
    this.renderNav();
    if (!window.location.hash) {
      window.location.hash = '#/';
    } else {
      this.handleRoute();
    }
  }

  renderNav() {
    const user = auth.getCurrentUser();
    if (!user) {
      this.navbarContainer.innerHTML = ''; // Hide nav when not logged in
      return;
    }
    this.navbarContainer.innerHTML = renderNavbar(user);
    
    // Attach logout event
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
      });
    }
  }

  async handleRoute() {
    const user = auth.getCurrentUser();
    const hash = window.location.hash || '#/';
    const path = hash.slice(1);

    if (!user) {
      // Not logged in, force login page
      this.appContainer.innerHTML = '';
      this.appContainer.appendChild(await renderLogin());
      return;
    }

    // RBAC Route protection
    if (path === '/admin' && !auth.hasRole('admin')) {
      this.showToast('Access denied. Admins only.', 'error');
      window.location.hash = '#/';
      return;
    }

    const renderFunc = ROUTES[path] || ROUTES['/'];
    
    // Clear and fade in
    this.appContainer.innerHTML = '';
    this.appContainer.className = ''; 
    // Trigger reflow
    void this.appContainer.offsetWidth; 
    this.appContainer.className = 'fade-in';
    
    const pageElement = await renderFunc();
    if (pageElement) {
        this.appContainer.appendChild(pageElement);
    }
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '<i class="ph ph-check-circle" style="color: var(--secondary-color); font-size: 1.5rem;"></i>' 
                                    : '<i class="ph ph-warning-circle" style="color: var(--danger); font-size: 1.5rem;"></i>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Global App instance
window.app = new App();
export const showToast = (msg, type) => window.app.showToast(msg, type);
