import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { formatDistanceToNow } from "https://esm.sh/date-fns@2.29.3";
import { ru } from "https://esm.sh/date-fns@2.29.3/locale";
export function renderPostsPageComponent({ appEl }) {
  function renderPost(post) {
    const postUser = post.user || {}; 
    const userId = postUser.id || "";
    const avatar = postUser.imageUrl || "";
    const name = postUser.name || "Анонимный пользователь";

    const createdAt = new Date(post.createdAt || Date.now());
    const timeAgo = formatDistanceToNow(createdAt, {
      addSuffix: true,
      locale: ru,
    });

    const isLiked = post.isLiked || false;
    const likesCount = (post.likes && post.likes.length) || 0;
    const likeImgSrc = isLiked
      ? "./assets/images/like-active.svg"
      : "./assets/images/like-not-active.svg";

    return `
    <li class="post">
     
    
      <div class="post-header" data-user-id="${userId}">
        <img src="${avatar}" class="post-header__user-image" alt="${name}">
        <p class="post-header__user-name">${name}</p>
      </div>

      <div class="post-image-container">
        <img src="${post.imageUrl}" class="post-image" alt="Фото поста">
      </div>
      <div class="post-actions">
      <button class="like-button" data-post-id="${post.id}" data-is-liked="${isLiked}">
        <img src="${likeImgSrc}" class="like-icon" alt="Лайк">
        <span class="like-text">Нравится:</span>
        <span class="like-count">${likesCount}</span>
      </button>
    </div>
      <p class="post-text">
        <span class="user-name">${name}</span>
      :"${post.description || ""}"
      </p>

      <div class="post-meta">
        <small class="post-date">${timeAgo}</small>
       
    </li>
    `;
  }

  console.log("Актуальный список постов:", posts);

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts"></ul>
          </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  if (posts.length > 0) {
    const postsHtml = posts.map(renderPost).join("");
    document.querySelector(".posts").innerHTML = postsHtml;
  } else {
    document.querySelector(".posts").innerHTML = "<p>Постов пока нет</p>";
  }

  document.querySelectorAll(".post-header").forEach((el) => {
    el.addEventListener("click", () => {
      const userId = el.dataset.userId;
      if (userId) {
        goToPage(USER_POSTS_PAGE, { userId });
      }
    });
  });

 
  document.querySelectorAll(".like-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); 

      const postId = btn.dataset.postId;
      const isLiked = btn.dataset.isLiked === "true";
      const token = user ? `Bearer ${user.token}` : "";

      if (!token) {
        alert("Авторизуйтесь, чтобы ставить лайки");
        return;
      }

      const baseHost = "https://webdev-hw-api.vercel.app";
      const personalKey = "prod";
      const url = isLiked
        ? `${baseHost}/api/v1/${personalKey}/instapro/${postId}/dislike`
        : `${baseHost}/api/v1/${personalKey}/instapro/${postId}/like`;

      fetch(url, {
        method: "POST",
        headers: {
          Authorization: token,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Ошибка API: статус ${response.status}`);
          }
          return response.json();
        })
        .then((result) => {
          const updatedPost = result.post;

          
          btn.dataset.isLiked = String(updatedPost.isLiked);
          const newLikesCount = (updatedPost.likes && updatedPost.likes.length) || 0;
          btn.querySelector(".like-count").textContent = newLikesCount;

          const img = btn.querySelector(".like-icon");
         img.src = updatedPost.isLiked
            ? "./assets/images/like-active.svg"
            : "./assets/images/like-not-active.svg";
        })
        .catch((err) => {
          console.error(err);
          alert("Ошибка при лайке. Проверьте консоль.");
        });
    });
  });
}
