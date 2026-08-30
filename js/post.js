import { el, formatDate, fetchText, showError } from './util.js';
import { parseFrontMatter, renderMarkdown, wrapTables, readingMinutes } from './markdown.js';

/* posts/ 밖의 파일을 읽지 못하도록 slug 형태를 제한한다. */
const SLUG = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const status = document.getElementById('status');
const article = document.getElementById('post');

main();

async function main() {
  const slug = new URLSearchParams(location.search).get('slug') ?? '';

  if (!SLUG.test(slug) || slug.includes('..')) {
    showError(status, '잘못된 주소입니다. 목록에서 글을 다시 선택해 주세요.');
    return;
  }

  try {
    const raw = await fetchText(`posts/${slug}.md`);
    const { meta, body } = parseFrontMatter(raw);

    render(meta, body);
    status.remove();
    article.hidden = false;
  } catch (error) {
    showError(status, `글을 불러오지 못했습니다. ${error.message}`);
  }
}

function render(meta, body) {
  const title = meta.title || '제목 없음';
  document.title = `${title} — my-blog`;

  const header = el('header', 'post-header');
  header.appendChild(el('h1', 'post-title', title));

  const metaLine = el('p', 'post-meta');
  if (meta.date) {
    const time = el('time', null, formatDate(meta.date));
    time.dateTime = meta.date;
    metaLine.appendChild(time);
    metaLine.appendChild(el('span', 'dot', '·'));
  }
  metaLine.appendChild(el('span', null, `${readingMinutes(body)}분 읽기`));
  header.appendChild(metaLine);

  if (Array.isArray(meta.tags) && meta.tags.length > 0) {
    const tags = el('ul', 'tag-list');
    for (const tag of meta.tags) tags.appendChild(el('li', 'tag', tag));
    header.appendChild(tags);
  }

  const content = el('div', 'prose');
  content.innerHTML = renderMarkdown(body); // renderMarkdown 이 정화한 HTML 만 들어온다.
  wrapTables(content);

  article.append(header, content);
}
