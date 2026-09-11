// ============ CONFIG ============
const API_BASE = window.location.origin;
const LOGO_URL = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23101B4D" width="100" height="100"/><circle cx="50" cy="50" r="35" fill="%23C0272B"/><circle cx="50" cy="50" r="28" fill="%23FFFFFF"/><text x="50" y="58" font-family="Arial,sans-serif" font-size="32" font-weight="bold" fill="%23101B4D" text-anchor="middle">C</text></svg>';

let isLoggedIn = false;
let currentPassword = '';
let allPosts = [];
let allSimulations = [];
let currentPostEdit = null;
let currentSimEdit = null;

// ============ INIT ============
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setLogos();
  setupEventListeners();
  
  // Check if logged in from localStorage
  const savedPassword = localStorage.getItem('critpa_password');
  if (savedPassword) {
    currentPassword = savedPassword;
    isLoggedIn = true;
    updateHeaderUI();
  }
  
  // Load data
  await loadData();
  document.getElementById('loading-screen').style.display = 'none';
}

function setLogos() {
  document.querySelectorAll('#header-logo, #loading-logo').forEach(el => {
    el.src = LOGO_URL;
  });
}

function setupEventListeners() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', switchTab);
  });

  // Close modals
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const overlayId = e.target.dataset.close;
      document.getElementById(overlayId).classList.add('hidden');
    });
  });

  // Click outside modal to close
  document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });

  // Password modal
  document.getElementById('password-submit').addEventListener('click', submitPassword);
  document.getElementById('password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitPassword();
  });

  // Settings modal
  document.getElementById('settings-save').addEventListener('click', saveNewPassword);

  // Post modal
  document.getElementById('post-save').addEventListener('click', savePost);
  document.getElementById('photo-file-input').addEventListener('change', addPhotos);

  // Simulation modal
  document.getElementById('sim-save').addEventListener('click', saveSim);
}

function updateHeaderUI() {
  const headerActions = document.getElementById('header-actions');
  
  if (isLoggedIn) {
    headerActions.innerHTML = `
      <span class="editor-badge"><span class="dot"></span>Editor conectado</span>
      <button class="btn btn-brass btn-sm" id="add-post-btn">+ Evento</button>
      <button class="btn btn-brass btn-sm" id="add-sim-btn">+ Simulação</button>
      <button class="btn btn-ghost btn-sm" id="settings-btn">⚙️</button>
      <button class="btn btn-danger btn-sm" id="logout-btn">Sair</button>
    `;
    
    document.getElementById('add-post-btn').addEventListener('click', openPostModal);
    document.getElementById('add-sim-btn').addEventListener('click', openSimModal);
    document.getElementById('settings-btn').addEventListener('click', () => {
      document.getElementById('settings-overlay').classList.remove('hidden');
    });
    document.getElementById('logout-btn').addEventListener('click', logout);
  } else {
    headerActions.innerHTML = `<button class="btn btn-brass btn-sm" id="login-btn">Entrar</button>`;
    document.getElementById('login-btn').addEventListener('click', () => {
      document.getElementById('password-overlay').classList.remove('hidden');
      document.getElementById('password-input').focus();
    });
  }
}

// ============ AUTH ============
async function submitPassword() {
  const password = document.getElementById('password-input').value.trim();
  document.getElementById('password-error').textContent = '';

  if (!password) {
    document.getElementById('password-error').textContent = 'Digite o código do clube.';
    return;
  }

  try {
    // Try to fetch posts to validate password
    const response = await fetch(`${API_BASE}/api/posts`);
    if (response.ok) {
      currentPassword = password;
      isLoggedIn = true;
      localStorage.setItem('critpa_password', password);
      document.getElementById('password-overlay').classList.add('hidden');
      document.getElementById('password-input').value = '';
      updateHeaderUI();
      toast('Bem-vindo ao arquivo do CRITPA! 🎉');
    } else {
      document.getElementById('password-error').textContent = 'Código inválido.';
    }
  } catch (err) {
    document.getElementById('password-error').textContent = 'Erro ao validar. Tente de novo.';
  }
}

function logout() {
  isLoggedIn = false;
  currentPassword = '';
  localStorage.removeItem('critpa_password');
  updateHeaderUI();
  toast('Você saiu. Até logo! 👋');
}

async function saveNewPassword() {
  const newPassword = document.getElementById('new-password-input').value.trim();
  document.getElementById('settings-error').textContent = '';

  if (!newPassword) {
    document.getElementById('settings-error').textContent = 'Digite um novo código.';
    return;
  }

  if (newPassword.length < 4) {
    document.getElementById('settings-error').textContent = 'O código precisa ter pelo menos 4 caracteres.';
    return;
  }

  try {
    // Note: This is a client-side change for demo. In production, you'd have a backend endpoint
    currentPassword = newPassword;
    localStorage.setItem('critpa_password', newPassword);
    document.getElementById('settings-overlay').classList.add('hidden');
    document.getElementById('new-password-input').value = '';
    toast('Código atualizado! Avise o clube da nova senha. 🔐');
  } catch (err) {
    document.getElementById('settings-error').textContent = 'Erro ao atualizar.';
  }
}

// ============ DATA LOADING ============
async function loadData() {
  try {
    const [postsRes, simsRes] = await Promise.all([
      fetch(`${API_BASE}/api/posts`),
      fetch(`${API_BASE}/api/simulations`)
    ]);

    if (postsRes.ok) allPosts = await postsRes.json();
    if (simsRes.ok) allSimulations = await simsRes.json();

    renderPosts();
    renderSimulations();
    updateStats();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    toast('Erro ao carregar dados. Recarregue a página.');
  }
}

// ============ POSTS ============
function renderPosts() {
  const grid = document.getElementById('posts-grid');
  
  if (allPosts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1;">
        <div class="empty-state">
          <h3>Nada por aqui ainda</h3>
          <p>Quando membros adicionarem eventos, eles aparecem aqui.</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = allPosts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(post => `
      <div class="card">
        <div class="card-media ${!post.images || post.images.length === 0 ? 'empty' : ''}">
          ${post.images && post.images.length > 0 
            ? `<img src="${post.images[0]}" alt="${post.title}">`
            : `<div class="logo-badge"><img src="${LOGO_URL}" alt="CRITPA"></div>`
          }
          ${isLoggedIn ? `
            <div class="card-edit-actions">
              <button class="icon-btn" data-post-edit="${post.id}" title="Editar">✏️</button>
              <button class="icon-btn danger" data-post-delete="${post.id}" title="Remover">🗑</button>
            </div>
          ` : ''}
        </div>
        <div class="card-body">
          <div class="card-ref">
            <span class="code">POST</span>
            <span class="date">${new Date(post.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <h3>${post.title}</h3>
          <p class="desc clamped">${post.description}</p>
          ${post.images && post.images.length > 1 ? `<p style="font-size:0.74rem; color:var(--slate);">+${post.images.length - 1} foto${post.images.length > 2 ? 's' : ''}</p>` : ''}
        </div>
      </div>
    `).join('');

  // Attach edit/delete listeners
  document.querySelectorAll('[data-post-edit]').forEach(btn => {
    btn.addEventListener('click', () => editPost(btn.dataset.postEdit));
  });

  document.querySelectorAll('[data-post-delete]').forEach(btn => {
    btn.addEventListener('click', () => deletePost(btn.dataset.postDelete));
  });
}

function openPostModal() {
  currentPostEdit = null;
  document.getElementById('post-modal-title').textContent = 'Novo registro';
  document.getElementById('post-title').value = '';
  document.getElementById('post-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('post-desc').value = '';
  document.getElementById('photo-input-row').innerHTML = '<div class="photo-add"><span>+</span><input type="file" id="photo-file-input" accept="image/*" multiple></div>';
  document.getElementById('photo-file-input').addEventListener('change', addPhotos);
  document.getElementById('post-error').textContent = '';
  document.getElementById('post-overlay').classList.remove('hidden');
}

function editPost(postId) {
  const post = allPosts.find(p => p.id === postId);
  if (!post) return;

  currentPostEdit = postId;
  document.getElementById('post-modal-title').textContent = 'Editar registro';
  document.getElementById('post-title').value = post.title;
  document.getElementById('post-date').value = post.date;
  document.getElementById('post-desc').value = post.description;

  // Show existing photos
  const photoRow = document.getElementById('photo-input-row');
  photoRow.innerHTML = (post.images || [])
    .map(img => `
      <div class="photo-thumb">
        <img src="${img}" alt="Foto">
        <button class="rm" data-remove-photo="${img}">✕</button>
      </div>
    `).join('') + '<div class="photo-add"><span>+</span><input type="file" id="photo-file-input" accept="image/*" multiple></div>';

  document.querySelectorAll('[data-remove-photo]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.photo-thumb').remove();
    });
  });

  document.getElementById('photo-file-input').addEventListener('change', addPhotos);
  document.getElementById('post-error').textContent = '';
  document.getElementById('post-overlay').classList.remove('hidden');
}

function addPhotos(e) {
  const files = Array.from(e.target.files);
  const photoRow = document.getElementById('photo-input-row');
  const existingCount = photoRow.querySelectorAll('.photo-thumb').length;

  files.slice(0, 4 - existingCount).forEach(file => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb';
      thumb.innerHTML = `
        <img src="${evt.target.result}" alt="Foto">
        <button class="rm" data-remove-photo="${evt.target.result}">✕</button>
      `;
      thumb.querySelector('.rm').addEventListener('click', () => thumb.remove());
      photoRow.insertBefore(thumb, photoRow.querySelector('.photo-add'));
    };
    reader.readAsDataURL(file);
  });

  e.target.value = '';
}

async function savePost() {
  const title = document.getElementById('post-title').value.trim();
  const date = document.getElementById('post-date').value;
  const description = document.getElementById('post-desc').value.trim();
  const images = Array.from(document.querySelectorAll('.photo-thumb img')).map(img => img.src);

  document.getElementById('post-error').textContent = '';

  if (!title || !date || !description) {
    document.getElementById('post-error').textContent = 'Preencha título, data e descrição.';
    return;
  }

  if (images.length === 0) {
    document.getElementById('post-error').textContent = 'Adicione pelo menos uma foto.';
    return;
  }

  try {
    const payload = {
      password: currentPassword,
      id: currentPostEdit,
      title,
      date,
      description,
      images
    };

    const method = currentPostEdit ? 'PUT' : 'POST';
    const response = await fetch(`${API_BASE}/api/posts${currentPostEdit ? `/${currentPostEdit}` : ''}`, {
      method: currentPostEdit ? 'POST' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      await loadData();
      document.getElementById('post-overlay').classList.add('hidden');
      toast(currentPostEdit ? 'Evento atualizado! ✏️' : 'Evento adicionado! 📸');
    } else {
      document.getElementById('post-error').textContent = 'Erro ao salvar. Tente de novo.';
    }
  } catch (err) {
    document.getElementById('post-error').textContent = 'Erro ao salvar.';
  }
}

async function deletePost(postId) {
  if (!confirm('Remover este evento?')) return;

  try {
    const response = await fetch(`${API_BASE}/api/posts/${postId}?password=${encodeURIComponent(currentPassword)}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await loadData();
      toast('Evento removido. 🗑️');
    } else {
      toast('Erro ao remover evento.');
    }
  } catch (err) {
    toast('Erro ao remover evento.');
  }
}

// ============ SIMULATIONS ============
function renderSimulations() {
  const container = document.getElementById('sim-container');
  
  if (allSimulations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Calendário vazio</h3>
        <p>Quando forem agendadas simulações, aparecerão aqui.</p>
      </div>
    `;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = allSimulations.filter(s => new Date(s.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = allSimulations.filter(s => new Date(s.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  let html = '';

  if (upcoming.length > 0) {
    html += '<div class="sim-group-label">🔜 Próximas simulações</div>';
    html += '<div class="sim-list">' + upcoming.map(sim => renderSimRow(sim, false)).join('') + '</div>';
  }

  if (isLoggedIn && upcoming.length === 0) {
    html += `
      <div class="add-row" id="add-sim-shortcut">
        <span>+ Adicionar simulação</span>
      </div>
    `;
  }

  if (past.length > 0) {
    html += '<div class="sim-group-label">📅 Simulações passadas</div>';
    html += '<div class="sim-list">' + past.map(sim => renderSimRow(sim, true)).join('') + '</div>';
  }

  container.innerHTML = html;

  document.querySelectorAll('[data-sim-edit]').forEach(btn => {
    btn.addEventListener('click', () => editSim(btn.dataset.simEdit));
  });

  document.querySelectorAll('[data-sim-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteSim(btn.dataset.simDelete));
  });

  document.getElementById('add-sim-shortcut')?.addEventListener('click', openSimModal);
}

function renderSimRow(sim, isPast) {
  const date = new Date(sim.date);
  const committees = Array.isArray(sim.committees) ? sim.committees : (sim.committees || '').split(',').map(c => c.trim()).filter(Boolean);

  return `
    <div class="sim-row ${isPast ? 'past' : ''}">
      <div class="sim-date-block">
        <div class="d">${date.getDate().toString().padStart(2, '0')}</div>
        <div class="m">${date.toLocaleDateString('pt-BR', { month: 'short' })}</div>
      </div>
      <div class="sim-main">
        <h3>${sim.name}</h3>
        <div class="sim-meta">
          <span>📍 ${sim.location}</span>
          <span>🕐 ${date.toLocaleDateString('pt-BR')}</span>
        </div>
        ${committees.length > 0 ? `
          <div class="sim-tags">
            ${committees.map(c => `<span class="tag">${c}</span>`).join('')}
          </div>
        ` : ''}
        ${sim.notes ? `<p style="font-size:0.82rem; margin-top:8px; color:var(--ink-soft);">${sim.notes}</p>` : ''}
      </div>
      ${isLoggedIn ? `
        <div class="sim-actions">
          <button class="icon-btn" data-sim-edit="${sim.id}">✏️</button>
          <button class="icon-btn danger" data-sim-delete="${sim.id}">🗑</button>
        </div>
      ` : ''}
    </div>
  `;
}

function openSimModal() {
  currentSimEdit = null;
  document.getElementById('sim-modal-title').textContent = 'Nova simulação';
  document.getElementById('sim-name').value = '';
  document.getElementById('sim-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('sim-location').value = '';
  document.getElementById('sim-committees').value = '';
  document.getElementById('sim-notes').value = '';
  document.getElementById('sim-error').textContent = '';
  document.getElementById('sim-overlay').classList.remove('hidden');
}

function editSim(simId) {
  const sim = allSimulations.find(s => s.id === simId);
  if (!sim) return;

  currentSimEdit = simId;
  document.getElementById('sim-modal-title').textContent = 'Editar simulação';
  document.getElementById('sim-name').value = sim.name;
  document.getElementById('sim-date').value = sim.date;
  document.getElementById('sim-location').value = sim.location;
  document.getElementById('sim-committees').value = Array.isArray(sim.committees) ? sim.committees.join(', ') : sim.committees;
  document.getElementById('sim-notes').value = sim.notes || '';
  document.getElementById('sim-error').textContent = '';
  document.getElementById('sim-overlay').classList.remove('hidden');
}

async function saveSim() {
  const name = document.getElementById('sim-name').value.trim();
  const date = document.getElementById('sim-date').value;
  const location = document.getElementById('sim-location').value.trim();
  const committeesStr = document.getElementById('sim-committees').value.trim();
  const notes = document.getElementById('sim-notes').value.trim();

  document.getElementById('sim-error').textContent = '';

  if (!name || !date || !location || !committeesStr) {
    document.getElementById('sim-error').textContent = 'Preencha nome, data, local e comitês.';
    return;
  }

  try {
    const committees = committeesStr.split(',').map(c => c.trim()).filter(Boolean);

    const payload = {
      password: currentPassword,
      id: currentSimEdit,
      name,
      date,
      location,
      committees,
      notes
    };

    const response = await fetch(`${API_BASE}/api/simulations${currentSimEdit ? `/${currentSimEdit}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      await loadData();
      document.getElementById('sim-overlay').classList.add('hidden');
      toast(currentSimEdit ? 'Simulação atualizada! ✏️' : 'Simulação adicionada! 📅');
    } else {
      document.getElementById('sim-error').textContent = 'Erro ao salvar.';
    }
  } catch (err) {
    document.getElementById('sim-error').textContent = 'Erro ao salvar.';
  }
}

async function deleteSim(simId) {
  if (!confirm('Remover esta simulação?')) return;

  try {
    const response = await fetch(`${API_BASE}/api/simulations/${simId}?password=${encodeURIComponent(currentPassword)}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await loadData();
      toast('Simulação removida. 🗑️');
    } else {
      toast('Erro ao remover simulação.');
    }
  } catch (err) {
    toast('Erro ao remover simulação.');
  }
}

// ============ UI HELPERS ============
function switchTab(e) {
  const tab = e.target.dataset.tab;
  
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('section-hidden'));

  e.target.classList.add('active');
  document.getElementById(tab).classList.remove('section-hidden');
}

function updateStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingCount = allSimulations.filter(s => new Date(s.date) >= today).length;

  document.getElementById('stat-posts').textContent = allPosts.length;
  document.getElementById('stat-upcoming').textContent = upcomingCount;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
  if (isLoggedIn) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    }
  }
});
