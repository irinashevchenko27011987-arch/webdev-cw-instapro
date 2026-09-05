import { getPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      const { userId } = data || {};
      if (!userId) {
        goToPage(POSTS_PAGE);
        return;
      }
    
      page = LOADING_PAGE;
      renderApp();
    
      const token = getToken();
      const baseHost = "https://webdev-hw-api.vercel.app";
      const personalKey = "prod";
      const userPostsHost = `${baseHost}/api/v1/${personalKey}/instapro/user-posts/${userId}`;
    
      return fetch(userPostsHost, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            throw new Error("Нет авторизации");
          }
          return response.json();
        })
        .then((data) => {
          page = USER_POSTS_PAGE;
          posts = data.posts || [];
          renderApp();
        })
       
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        if (!user) {
          goToPage(AUTH_PAGE);
          return;
        }
  
        const token = `Bearer ${user.token}`;
        const baseHost = "https://webdev-hw-api.vercel.app";
        const personalKey = "prod";
        const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;
  
        fetch(postsHost, {
          method: "POST",
          headers: {
             Authorization: token,
          },
          body: JSON.stringify({
            description,
            imageUrl,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Не удалось добавить пост ");
            }
            return response.json();
          })
          .then(() => {
             goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error(error);
            alert("Ошибка при добавлении поста");
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderPostsPageComponent({ appEl });
  }
};

goToPage(POSTS_PAGE);
