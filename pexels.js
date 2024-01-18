document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "GfWCpXBTpkwkY4qY7Px1393iTlomh1gdPmlzc2YFVhQzAnY94NhL76UI";
  const apiUrl = "https://api.pexels.com/v1/search";
  const searchForm = document.getElementById("searchForm");
  const imageGallery = document.getElementById("imageGallery");
  const imageDetail = document.getElementById("imageDetail");

  const loadImagesButton = document.getElementById("loadImages");
  const loadSecondaryImagesButton = document.getElementById(
    "loadSecondaryImages"
  );
  const goBackButton = document.getElementById("goBack");
  const viewModalButton = document.getElementById("viewModal");

  loadImagesButton.addEventListener("click", () => searchImages("nature"));
  loadSecondaryImagesButton.addEventListener("click", () =>
    searchImages("something_else")
  );
  goBackButton.addEventListener("click", () => toggleGalleryAndDetail(true));
  viewModalButton.addEventListener("click", openImageModal);

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchInput = document.getElementById("searchInput");
    const query = searchInput.value.trim();
    searchImages(query);
  });

  imageGallery.addEventListener("click", handleImageGalleryClick);

  function handleImageGalleryClick(event) {
    const target = event.target;
    const card = target.closest(".card");

    if (!card) return;

    const imageId = card.getAttribute("data-image-id");

    if (target.classList.contains("btn-outline-secondary")) {
      hideCard(imageId);
    } else if (target.tagName === "IMG" || target.tagName === "H5") {
      showImageDetails(imageId);
    }
  }

  function toggleGalleryAndDetail(showGallery) {
    imageGallery.style.display = showGallery ? "block" : "none";
    imageDetail.style.display = showGallery ? "none" : "block";
  }

  function hideCard(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
      card.style.display = "none"; // Imposta la visibilità della card a "none"
    }
  }

  function searchImages(query) {
    const url = `${apiUrl}?query=${query}`;
    fetch(url, {
      headers: {
        Authorization: apiKey,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        displayImages(data.photos);
        assignEventsToButtons();
      })
      .catch((error) => console.error("Error fetching images:", error));
  }

  function displayImages(photos) {
    imageGallery.innerHTML = "";
    let row;
    photos.forEach((photo, index) => {
      if (index % 4 === 0) {
        // Inizia una nuova riga ogni 4 cards
        row = document.createElement("div");
        row.classList.add(
          "row",
          "row-cols-1",
          "row-cols-md-2",
          "row-cols-lg-4",
          "g-4"
        );
        imageGallery.appendChild(row);
      }

      const card = createCard(photo);
      row.appendChild(card);
    });
  }

  function createCard(photo) {
    const card = document.createElement("div");
    card.classList.add("col-md-4", "card", "mb-4", "shadow-sm");
    card.setAttribute("data-image-id", photo.id);
    card.innerHTML = `
        <img src="${photo.src.medium}" class="bd-placeholder-img card-img-top" style="height: 200px;" />
        <div class="card-body">
          <h5 class="card-title">${photo.photographer}</h5>
          <p class="card-text">
            <a href="${photo.photographer_url}" target="_blank">${photo.photographer_url}</a>
          </p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-secondary" data-action="view" data-image-id="${photo.id}">View</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" data-action="hide" data-image-id="${photo.id}">Hide</button>
            </div>
            <small class="text-muted">${photo.id}</small>
          </div>
        </div>
      `;

    return card;
  }

  function showImageDetails(imageId) {
    const image = imageGallery.querySelector(`[data-image-id="${imageId}"]`);
    if (!image) {
      console.error(`Image with ID ${imageId} not found.`);
      return;
    }

    const title = image.querySelector(".card-title").textContent;
    const artistName = image.querySelector(".card-text").textContent;
    const artistLink = image.querySelector(".card-text a").href;

    document.getElementById("imageTitle").textContent = title;
    document.getElementById("artistName").textContent = artistName;
    document.getElementById("artistLink").href = artistLink;

    getAverageColor(image.querySelector(".card-img-top").src, (avgColor) => {
      imageDetail.style.backgroundColor = avgColor;
    });

    imageDetail.setAttribute("data-image-id", imageId);
    toggleGalleryAndDetail(false);
  }

  function openImageModal() {
    const imageId = imageDetail.getAttribute("data-image-id");
    const imageUrl = imageGallery.querySelector(
      `[data-image-id="${imageId}"] img`
    ).src;

    const modal = new bootstrap.Modal(document.getElementById("imageModal"));
    const modalImage = document.getElementById("modalImage");
    modalImage.src = imageUrl;

    modal.show();
  }

  function getAverageColor(imageSrc, callback) {
    // Utilizza una richiesta al server per ottenere il colore medio
    fetch(
      `https://your-server.com/get-average-color?imageSrc=${encodeURIComponent(
        imageSrc
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        const avgColor = data.averageColor || "#FFFFFF";
        callback(avgColor);
      })
      .catch((error) => {
        console.error("Error fetching average color:", error);
        callback("#FFFFFF");
      });
  }

  function assignEventsToButtons() {
    document
      .querySelectorAll(".btn-outline-secondary[data-action='hide']")
      .forEach((hideButton) => {
        hideButton.addEventListener("click", () =>
          hideCard(hideButton.getAttribute("data-image-id"))
        );
      });

    document
      .querySelectorAll(".btn-outline-secondary[data-action='view']")
      .forEach((viewButton) => {
        viewButton.addEventListener("click", () =>
          showImageDetails(viewButton.getAttribute("data-image-id"))
        );
      });
  }
});
