// js/pages/shops.js
import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast } from '../app.js';

export async function renderShops() {
  const container = document.createElement('div');
  const canManage = auth.hasRole('admin') || auth.hasRole('shop_manager');

  container.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="h1">Local Shops</h2>
        <p class="text-muted">Support local businesses in our hometown.</p>
      </div>
      ${canManage ? `<button id="new-shop-btn" class="btn btn-primary"><i class="ph ph-plus"></i> Add Shop</button>` : ''}
    </div>

    ${canManage ? `
      <div id="shop-form-container" class="card mb-4" style="display: none;">
        <h3 class="h3 mb-4">Register New Shop</h3>
        <form id="shop-form">
          <div class="grid md:grid-cols-2 gap-4">
            <div class="form-group">
              <label>Shop Name</label>
              <input type="text" id="sh-name" required>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select id="sh-cat">
                <option>Retail</option>
                <option>Food & Dining</option>
                <option>Services</option>
                <option>Healthcare</option>
              </select>
            </div>
          </div>
          <div class="form-group mt-4">
            <label>Address (Mocked with description)</label>
            <input type="text" id="sh-address" required>
          </div>
          <div class="form-group mt-4">
            <label>Description / Offers</label>
            <textarea id="sh-desc" rows="2" required></textarea>
          </div>
          <div class="mt-4 flex gap-2">
            <button type="submit" class="btn btn-primary">Save Shop</button>
            <button type="button" id="cancel-shop-btn" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    ` : ''}

    <div id="shops-grid" class="grid md:grid-cols-2 gap-6"></div>
  `;

  if (canManage) {
    const newBtn = container.querySelector('#new-shop-btn');
    const cancelBtn = container.querySelector('#cancel-shop-btn');
    const formContainer = container.querySelector('#shop-form-container');
    const form = container.querySelector('#shop-form');

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
      await store.addShop({
        name: document.getElementById('sh-name').value,
        category: document.getElementById('sh-cat').value,
        description: document.getElementById('sh-address').value + " - " + document.getElementById('sh-desc').value, // Merging since schema lacks address
        createdBy: auth.getCurrentUser().name
      });
      form.reset();
      formContainer.style.display = 'none';
      newBtn.style.display = 'inline-flex';
      await renderGrid();
      showToast('Shop added successfully!');
    });
  }

  const renderGrid = async () => {
    const grid = container.querySelector('#shops-grid');
    const shops = await store.getShops();
    
    if (shops.length === 0) {
      grid.innerHTML = `<div class="text-muted" style="grid-column: 1 / -1;">No shops listed yet.</div>`;
      return;
    }

    grid.innerHTML = shops.map(sh => `
      <div class="card flex gap-4 items-center">
        <div style="width: 80px; height: 80px; background: #e0e7ff; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <i class="ph ph-storefront" style="font-size: 2.5rem; color: #4338ca;"></i>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h3 class="h3" style="margin: 0;">${sh.name}</h3>
            <span class="badge" style="background: #f1f5f9; color: #475569;">${sh.category}</span>
          </div>
          <p style="font-size: 0.875rem;">${sh.description}</p>
        </div>
      </div>
    `).join('');
  };

  await renderGrid();
  return container;
}
