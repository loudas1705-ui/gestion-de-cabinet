import { doctor } from './doctor.js';
import { logout } from './auth.js';

const NAV = [
  { href: 'dashboard.html',              icon: 'chart-line',          label: 'Tableau de bord',  title: 'Tableau de bord' },
  { href: 'patients.html',           icon: 'users',               label: 'Patients',         title: 'Gestion des patients' },
  { href: 'appointments.html',       icon: 'calendar-alt',        label: 'Rendez-vous',      title: 'Gestion des rendez-vous' },
  { href: 'prescriptions.html',      icon: 'prescription-bottle', label: 'Prescriptions',    title: 'Gestion des prescriptions' },
  { href: 'arret-de-travail.html',   icon: 'file-medical-alt',    label: 'Arrêt de travail', title: 'Arrêt de travail' },
  { href: 'certificat-medical.html', icon: 'file-medical-alt',    label: 'Certificat Médical', title: 'Certificat Médical' },
  { href: 'diagnostics.html',        icon: 'stethoscope',         label: 'Diagnostics',      title: 'Diagnostics' }
];

export function renderLayout(currentPage) {
  const aside = document.getElementById('layout');
  if (!aside) return;

  aside.innerHTML = `
    <aside class="fixed left-0 top-0 h-full w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 shadow-2xl z-50">
      <div class="flex flex-col h-full">
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <i class="fas fa-brain text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">Cabinet Psy</h1>
              <p class="text-xs text-purple-300">Système de Gestion</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 p-4 space-y-2">
          ${NAV.map(n => `
            <a href="${n.href}" class="nav-item ${n.href === currentPage ? 'active' : ''}">
              <i class="fas fa-${n.icon} w-5"></i>
              <span>${n.label}</span>
            </a>`).join('')}
        </nav>
        <div class="p-4 border-t border-white/10">
          <button type="button" id="logoutBtn" class="w-full mb-3 text-left px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 text-sm font-medium transition">
            <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
          </button>
          <div class="text-center">
            <p class="text-xs text-purple-300">© 2026 Cabinet Psychiatrique</p>
            <p class="text-xs text-purple-400/50 mt-1">Version 2.0</p>
          </div>
        </div>
      </div>
    </aside>
  `;

  // Wire up the logout button (do NOT rely on inline onclick)
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', async () => {
      try {
        await logout();
      } catch (err) {
        console.error('Logout failed:', err);
        // Fallback: force redirect to login anyway
        location.href = 'index.html';
      }
    });
  }

  // Topbar
  const topbar = document.getElementById('topbar');
  if (topbar) {
    const page = NAV.find(n => n.href === currentPage);
    const title = page ? page.title : 'Cabinet Psychiatrique';
    topbar.innerHTML = `
      <div class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div class="px-8 py-4 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">${title}</h2>
            <p class="text-sm text-gray-500 mt-1">Bienvenue, docteur</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-700">${doctor.name_short}</p>
              <p class="text-xs text-gray-500">${doctor.title_short}</p>
            </div>
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <i class="fas fa-user-md text-white"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Keep a global fallback in case any page still uses onclick="logout()"
window.logout = logout;
