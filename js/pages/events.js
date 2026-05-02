// js/pages/events.js
import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast } from '../app.js';

export async function renderEvents() {
  const container = document.createElement('div');
  const canManage = auth.hasRole('admin') || auth.hasRole('event_manager');

  container.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="h1">Local Events</h2>
        <p class="text-muted">Discover what's happening around town.</p>
      </div>
      ${canManage ? `<button id="new-event-btn" class="btn btn-primary"><i class="ph ph-plus"></i> Add Event</button>` : ''}
    </div>

    ${canManage ? `
      <div id="event-form-container" class="card mb-4" style="display: none;">
        <h3 class="h3 mb-4">Create New Event</h3>
        <form id="event-form">
          <div class="grid md:grid-cols-2 gap-4">
            <div class="form-group">
              <label>Event Name</label>
              <input type="text" id="ev-name" required>
            </div>
            <div class="form-group">
              <label>Event Date & Time</label>
              <input type="datetime-local" id="ev-date" required>
            </div>
            <div class="form-group">
              <label>Location</label>
              <input type="text" id="ev-location" required>
            </div>
          </div>
          <div class="form-group mt-4">
            <label>Description</label>
            <textarea id="ev-desc" rows="3" required></textarea>
          </div>
          <div class="mt-4 flex gap-2">
            <button type="submit" class="btn btn-primary">Save Event</button>
            <button type="button" id="cancel-event-btn" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    ` : ''}

    <div id="events-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
  `;

  if (canManage) {
    const newBtn = container.querySelector('#new-event-btn');
    const cancelBtn = container.querySelector('#cancel-event-btn');
    const formContainer = container.querySelector('#event-form-container');
    const form = container.querySelector('#event-form');

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
      await store.addEvent({
        title: document.getElementById('ev-name').value,
        date: document.getElementById('ev-date').value.split('T')[0],
        time: document.getElementById('ev-date').value.split('T')[1] || '',
        location: document.getElementById('ev-location').value,
        description: document.getElementById('ev-desc').value,
        createdBy: auth.getCurrentUser().name
      });
      form.reset();
      formContainer.style.display = 'none';
      newBtn.style.display = 'inline-flex';
      await renderGrid();
      showToast('Event created successfully!');
    });
  }

  const renderGrid = async () => {
    const grid = container.querySelector('#events-grid');
    const validEvents = await store.getEvents();
    
    if (validEvents.length === 0) {
      grid.innerHTML = `<div class="text-muted" style="grid-column: 1 / -1;">No upcoming events.</div>`;
      return;
    }

    grid.innerHTML = validEvents.map(ev => `
      <div class="card" style="display: flex; flex-direction: column;">
        <div style="height: 120px; background: var(--primary-light); border-radius: var(--radius-md) var(--radius-md) 0 0; margin: -1.5rem -1.5rem 1rem -1.5rem; display: flex; align-items: center; justify-content: center;">
          <i class="ph ph-calendar-blank" style="font-size: 3rem; color: var(--primary-color);"></i>
        </div>
        <h3 class="h3" style="margin-bottom: 0.25rem;">${ev.title}</h3>
        <div class="flex items-center gap-2 text-muted mb-2" style="font-size: 0.875rem;">
          <i class="ph ph-calendar"></i> Event: ${ev.date} ${ev.time}
        </div>
        <div class="flex items-center gap-2 text-muted mb-4" style="font-size: 0.875rem;">
          <i class="ph ph-map-pin"></i> ${ev.location}
        </div>
        <p style="font-size: 0.875rem; flex: 1;">${ev.description}</p>
      </div>
    `).join('');
  };

  await renderGrid();
  return container;
}
