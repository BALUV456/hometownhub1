// js/pages/clubs.js
import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast } from '../app.js';

export async function renderClubs() {
  const container = document.createElement('div');
  const canManage = auth.hasRole('admin') || auth.hasRole('club_leader');

  container.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="h1">Club Activities</h2>
        <p class="text-muted">Updates from local organizations and clubs.</p>
      </div>
      ${canManage ? `<button id="new-club-btn" class="btn btn-primary"><i class="ph ph-plus"></i> Post Update</button>` : ''}
    </div>

    ${canManage ? `
      <div id="club-form-container" class="card mb-4" style="display: none; border-left: 4px solid var(--secondary-color);">
        <h3 class="h3 mb-4">Post Club Update</h3>
        <form id="club-form">
          <div class="form-group">
            <label>Club Name</label>
            <input type="text" id="cl-name" placeholder="e.g. Rotary Club, Book Club" required>
          </div>
          <div class="form-group mt-4">
            <label>Update Detail</label>
            <textarea id="cl-desc" rows="3" required></textarea>
          </div>
          <div class="mt-4 flex gap-2">
            <button type="submit" class="btn btn-primary" style="background-color: var(--secondary-color);">Post</button>
            <button type="button" id="cancel-club-btn" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    ` : ''}

    <div id="clubs-feed" style="max-width: 800px;"></div>
  `;

  if (canManage) {
    const newBtn = container.querySelector('#new-club-btn');
    const cancelBtn = container.querySelector('#cancel-club-btn');
    const formContainer = container.querySelector('#club-form-container');
    const form = container.querySelector('#club-form');

    newBtn.addEventListener('click', () => {
      formContainer.style.display = 'block';
      newBtn.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
      formContainer.style.display = 'none';
      newBtn.style.display = 'inline-flex';
      form.reset();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await store.addClubUpdate({
        title: document.getElementById('cl-name').value, // Mapping clubName to title based on schema
        content: document.getElementById('cl-desc').value,
        authorName: auth.getCurrentUser().name
      });
      form.reset();
      formContainer.style.display = 'none';
      newBtn.style.display = 'inline-flex';
      await renderFeed();
      showToast('Club update posted!');
    });
  }

  const renderFeed = async () => {
    const feed = container.querySelector('#clubs-feed');
    const updates = await store.getClubUpdates();
    
    if (updates.length === 0) {
      feed.innerHTML = `<div class="text-muted">No club updates currently.</div>`;
      return;
    }

    feed.innerHTML = updates.map(up => `
      <div class="card mb-4" style="border-left: 4px solid var(--secondary-color);">
        <div class="flex items-center gap-2 mb-2">
          <i class="ph ph-users-three" style="font-size: 1.5rem; color: var(--secondary-color);"></i>
          <h3 class="h3" style="margin: 0;">${up.title || up.clubName}</h3>
          <span class="text-muted" style="margin-left: auto; font-size: 0.875rem;">${new Date(up.timestamp).toLocaleDateString()}</span>
        </div>
        <p>${(up.content || '').replace(/\\n/g, '<br>')}</p>
        <div class="text-muted mt-2" style="font-size: 0.75rem;">Posted by ${up.authorName}</div>
      </div>
    `).join('');
  };

  await renderFeed();
  return container;
}
