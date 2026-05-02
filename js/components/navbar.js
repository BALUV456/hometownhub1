// js/components/navbar.js
export function renderNavbar(user) {
  const isAdmin = user.role === 'admin';
  
  return `
    <nav class="navbar">
      <div class="navbar-content">
        <a href="#/" class="brand">
          <i class="ph ph-buildings" style="font-size: 2rem;"></i>
          Hometown Hub
        </a>
        
        <div class="nav-links">
          <a href="#/" class="nav-link" id="nav-feed">
            <i class="ph ph-house"></i> Home
          </a>
          <a href="#/events" class="nav-link" id="nav-events">
            <i class="ph ph-calendar-star"></i> Events
          </a>
          <a href="#/shops" class="nav-link" id="nav-shops">
            <i class="ph ph-storefront"></i> Shops
          </a>
          <a href="#/clubs" class="nav-link" id="nav-clubs">
            <i class="ph ph-users-three"></i> Clubs
          </a>
          ${isAdmin ? `
            <a href="#/admin" class="nav-link" id="nav-admin">
              <i class="ph ph-shield-check"></i> Admin
            </a>
          ` : ''}
          
          <div class="flex items-center gap-4" style="margin-left: 1rem; padding-left: 1rem; border-left: 1px solid var(--border-color);">
            <div class="flex items-center gap-2">
              <div class="avatar">${user.name.charAt(0)}</div>
              <div style="line-height: 1.2;">
                <div style="font-weight: 500; font-size: 0.875rem;">${user.name}</div>
                <div class="text-muted" style="font-size: 0.75rem;">${user.role}</div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="logout-btn">
              <i class="ph ph-sign-out"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;
}
