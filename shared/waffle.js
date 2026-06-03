/* shared/waffle.js — Waffle menu toggle + auth guard */

function toggleWaffle() {
  const ov = document.getElementById('waffleOverlay');
  const btn = document.getElementById('waffleBtn');
  const isOpen = ov.classList.contains('open');
  if (isOpen) closeWaffle();
  else { ov.classList.add('open'); btn.classList.add('open'); }
}

function closeWaffle() {
  document.getElementById('waffleOverlay').classList.remove('open');
  const btn = document.getElementById('waffleBtn');
  if (btn) btn.classList.remove('open');
}

// Close when clicking outside the panel
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('waffleOverlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeWaffle();
    });
  }

  // Auth guard
  const u = JSON.parse(sessionStorage.getItem('erp_user') || '{}');
  if (!u.role) { location.href = '../login.html'; return; }
  const nameEl = document.getElementById('topbar-username');
  const roleEl = document.getElementById('topbar-role');
  if (nameEl) nameEl.textContent = u.name;
  if (roleEl) roleEl.textContent = u.title;
});

function logout() {
  sessionStorage.clear();
  location.href = '../login.html';
}

function showPage(pageId, label) {
  document.querySelectorAll('[id^="page-"]').forEach(el => el.style.display = 'none');
  const pg = document.getElementById('page-' + pageId);
  if (pg) pg.style.display = 'block';
  const titleEl = document.getElementById('pageTitle');
  if (titleEl && label) titleEl.textContent = label;
  // Mark active waffle item
  document.querySelectorAll('.waffle-item').forEach(el => el.classList.remove('active'));
  const active = document.querySelector(`.waffle-item[data-page="${pageId}"]`);
  if (active) active.classList.add('active');
  closeWaffle();
}
