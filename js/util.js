export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso ?? '');
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date);
}

export async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} 를 불러오지 못했습니다 (${res.status})`);
  return res.text();
}

export async function fetchJSON(url) {
  return JSON.parse(await fetchText(url));
}

export function showError(status, message) {
  status.hidden = false;
  status.dataset.state = 'error';
  status.textContent = message;
}
