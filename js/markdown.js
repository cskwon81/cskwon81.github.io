import { el } from './util.js';

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** `---` 로 감싼 머리말과 본문을 분리한다. */
export function parseFrontMatter(raw) {
  const match = raw.match(FRONT_MATTER);
  if (!match) return { meta: {}, body: raw };
  return { meta: parseMetaBlock(match[1]), body: raw.slice(match[0].length) };
}

/* 전체 YAML 이 아니라 머리말에 쓰는 `key: value` 와 `key: [a, b]` 만 다룬다. */
function parseMetaBlock(text) {
  const meta = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!match) continue;
    meta[match[1]] = parseValue(match[2].trim());
  }
  return meta;
}

function parseValue(value) {
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((item) => unquote(item.trim())).filter(Boolean);
  }
  return unquote(value);
}

function unquote(value) {
  const match = value.match(/^(["'])(.*)\1$/);
  return match ? match[2] : value;
}

/** 마크다운을 HTML 로 바꾸고, 삽입 전에 정화한다. */
export function renderMarkdown(body) {
  const html = window.marked.parse(body, { gfm: true, breaks: false });
  return window.DOMPurify.sanitize(html);
}

/** 표는 본문 대신 자기 자신이 가로 스크롤하도록 감싼다. */
export function wrapTables(root) {
  for (const table of root.querySelectorAll('table')) {
    const wrapper = el('div', 'table-scroll');
    table.replaceWith(wrapper);
    wrapper.appendChild(table);
  }
}

/** 한국어 기준 분당 500자로 어림한 읽는 시간. */
export function readingMinutes(body) {
  return Math.max(1, Math.round(body.replace(/\s+/g, '').length / 500));
}
