import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { formatDistanceToNow } from "https://esm.sh/date-fns@2.29.3";
import { ru } from "https://esm.sh/date-fns@2.29.3/locale";
export function renderPostsPageComponent({ appEl }) {
 
  function renderPost(post) {
  const user = post.user || {}; 
const userId = user.id || '';
const avatar = user.imageUrl || '';
const name = user.name || 'Анонимный пользователь';
  
const createdAt = new Date(post.createdAt || Date.now());

const timeAgo = formatDistanceToNow(createdAt, {
  addSuffix: true,
  locale: ru,
});
  return `
  <li class="post">
        <div class="post-header" data-user-id="${userId}">
      <img src="${avatar}" class="post-header__user-image" alt="${name}">
      <p class="post-header__user-name">${name}</p>
    </div>
    
    <div class="post-image-container">
           <img src="${post.imageUrl}" class="post-image" alt="Фото поста">
    </div>
    
    <p class="post-text">
      <span class="user-name">${name}</span>
      ${post.description || ''}
    </p>

    <div class="post-meta">
      <small class="post-date">${timeAgo}</small>
    </div>
  </li>
`;
}
  console.log("Актуальный список постов:", posts);

  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                 
                </ul>
              </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });
  if (posts.length > 0) {
    const postsHtml = posts.map(renderPost).join('');
    document.querySelector('.posts').innerHTML = postsHtml;
  } else {
    document.querySelector('.posts').innerHTML = '<p>Постов пока нет</p>';
  }

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}
