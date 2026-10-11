export function escapeHtml(v) {
  const d = document.createElement('div');
  d.textContent = v ?? '';
  return d.innerHTML;
}

export function escapeAttr(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatDateFR(s) {
  if (!s) return '';
  const d = s?.toDate ? s.toDate() : new Date(s);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('fr-FR');
}

export function formatDateInput(s) {
  if (!s) return '';
  const d = s?.toDate ? s.toDate() : new Date(s);
  if (isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTimeInput(s) {
  if (!s) return '';
  const d = s?.toDate ? s.toDate() : new Date(s);
  if (isNaN(d)) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function calcAge(dateOfBirth) {
  if (!dateOfBirth) return '';
  const d = dateOfBirth?.toDate ? dateOfBirth.toDate() : new Date(dateOfBirth);
  if (isNaN(d)) return '';
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a;
}

export function showMessage(containerId, text, type = 'success') {
  const box = document.getElementById(containerId);
  if (!box) return;
  const cls = type === 'success'
    ? 'bg-green-50 border-green-500 text-green-700'
    : 'bg-red-50 border-red-500 text-red-700';
  const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
  box.innerHTML = `<div class="mb-6 p-4 ${cls} border-l-4 rounded-lg">
    <i class="fas fa-${icon} mr-2"></i>${escapeHtml(text)}</div>`;
  setTimeout(() => box.innerHTML = '', 5000);
}

export function fullName(p) {
  return `${p.first_name || ''} ${p.last_name || ''}`.trim();
}
