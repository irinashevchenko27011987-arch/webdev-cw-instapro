import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="title-form">Добавить пост</h3>
          <div class="form-inputs">
            <div id="upload-photo"></div>
            <label>
              Опишите фотографию:
              <textarea class="input textarea" rows="4"></textarea>
            </label>
            <button class="button" id="add-button">Добавить пост</button>
          </div>
        </div>
      </div>
    `;

    
    appEl.innerHTML = appHtml;

    const headerContainer = document.querySelector(".page-container .header-container");
    if (headerContainer) {
      renderHeaderComponent({ element: headerContainer });
    }

    const uploadPhoto = document.getElementById("upload-photo");
    let uploadedFileUrl = "";

    if (uploadPhoto) {
      renderUploadImageComponent({
        element: uploadPhoto,
        onImageUrlChange: (newUrl) => {
          uploadedFileUrl = newUrl;
          },
      });
    }

    const addButton = document.getElementById("add-button");
    const textarea = document.querySelector(".form-inputs .input.textarea");

    if (addButton && textarea) {
      addButton.addEventListener("click", () => {
        const description = textarea.value.trim();

        if (!description) {
          alert("Пожалуйста, добавьте описание к фото");
          return;
        }
      
        onAddPostClick({
          description: description,
          imageUrl: uploadedFileUrl,
        });
      });
    } 
  }
  render();
      }
