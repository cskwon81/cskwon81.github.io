import { el, formatDate, fetchJSON, showError } from './util.js';

const status = document.getElementById('status');
const list = document.getElementById('post-list');

main();

async function main() {
  try {
    const posts = await fetchJSON('posts/posts.json');
    posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

    if (posts.length === 0) {
      status.textContent = '아직 글이 없습니다.';
      return;
    }

    for (const post of posts) list.appendChild(card(post));
    status.remove();
  } catch (error) {
    showError(status, `글 목록을 불러오지 못했습니다. ${error.message}`);
  }
}

function card(post) {
  const item = el('li');
  const article = el('article', 'post-card');

  const title = el('h2', 'post-card-title');
  const link = el('a', null, post.title ?? post.slug);
  link.href = `post.html?slug=${encodeURIComponent(post.slug)}`;
  title.appendChild(link);
  article.appendChild(title);

  const meta = el('p', 'post-meta');
  const time = el('time', null, formatDate(post.date));
  time.dateTime = post.date ?? '';
  meta.appendChild(time);
  article.appendChild(meta);

  if (post.summary) article.appendChild(el('p', 'post-summary', post.summary));
  if (post.tags?.length) article.appendChild(tagList(post.tags));

  item.appendChild(article);
  return item;
}

function tagList(tags) {
  const wrapper = el('ul', 'tag-list');
  for (const tag of tags) wrapper.appendChild(el('li', 'tag', tag));
  return wrapper;
}
