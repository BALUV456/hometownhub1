// js/pages/admin.js
import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast } from '../app.js';

export async function renderAdmin() {
  const container = document.createElement('div');
  
  if (!auth.hasRole('admin')) {
    container.innerHTML = `<div class="card text-center text-danger">Access Denied</div>`;
    return container;
  }

  container.innerHTML = `
    <div class="mb-4">
      <h2 class="h1">Admin Dashboard</h2>
      <p class="text-muted">Manage users and assign roles (postings) to community members.</p>
    </div>

    <div class="card">
      <h3 class="h3 mb-4">User Management</h3>
      <div class="overflow-x-auto">
        <table style="width: 100%; text-align: left; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color);">
              <th style="padding: 0.75rem;">User</th>
              <th style="padding: 0.75rem;">Email</th>
              <th style="padding: 0.75rem;">Current Role</th>
              <th style="padding: 0.75rem;">Assign Posting (Role)</th>
            </tr>
          </thead>
          <tbody id="users-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#users-tbody');

  const renderTable = async () => {
    const users = await store.getAllUsers();
    
    tbody.innerHTML = users.map(u => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem;">
          <div class="flex items-center gap-2">
            <div class="avatar" style="width: 2rem; height: 2rem; font-size: 0.875rem;">${u.name.charAt(0)}</div>
            ${u.name}
          </div>
        </td>
        <td style="padding: 0.75rem; color: var(--text-muted);">${u.email}</td>
        <td style="padding: 0.75rem;">
          <span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">${u.role}</span>
        </td>
        <td style="padding: 0.75rem;">
          ${u.email === 'veerepallibalaramkrishna@gmail.com' ? 
            '<span class="text-muted" style="font-size: 0.875rem;">Cannot change Super Admin</span>' 
            : `
            <div class="flex gap-2">
              <select class="role-select" data-userid="${u.id}" style="padding: 0.25rem; font-size: 0.875rem;">
                <option value="user" ${u.role === 'user' ? 'selected' : ''}>Standard User</option>
                <option value="event_manager" ${u.role === 'event_manager' ? 'selected' : ''}>Event Manager</option>
                <option value="shop_manager" ${u.role === 'shop_manager' ? 'selected' : ''}>Shop Manager</option>
                <option value="club_leader" ${u.role === 'club_leader' ? 'selected' : ''}>Club Leader</option>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
              <button class="btn btn-primary btn-sm update-role-btn" data-userid="${u.id}">Update</button>
            </div>
          `}
        </td>
      </tr>
    `).join('');

    // Attach event listeners for update buttons
    tbody.querySelectorAll('.update-role-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.dataset.userid;
        const select = tbody.querySelector(`.role-select[data-userid="${userId}"]`);
        const newRole = select.value;
        
        await store.updateUserRole(userId, newRole);
        showToast('User role updated successfully!');
        await renderTable();
      });
    });
  };

  await renderTable();

  return container;
}
