export function cap(h, ms) {
  const c = document.querySelector('#cap');
  if (!c) return;
  c.innerHTML = h;
  c.style.display = 'block';
  clearTimeout(c.t);
  if (ms) c.t = setTimeout(() => (c.style.display = 'none'), ms);
}

export function capOff() {
  const c = document.querySelector('#cap');
  if (c) c.style.display = 'none';
}

export function openModal(html) {
  const dlg = document.querySelector('#dlg');
  if (!dlg) return;
  dlg.innerHTML = html;
  dlg.showModal();
}
