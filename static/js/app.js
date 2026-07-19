(function () {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchError = document.getElementById("search-error");
  const loading = document.getElementById("loading");
  const emptyState = document.getElementById("empty-state");
  const resultsGrid = document.getElementById("results-grid");
  const resultsView = document.getElementById("results-view");
  const detailView = document.getElementById("detail-view");
  const backBtn = document.getElementById("back-btn");
  const resultsHeading = document.getElementById("results-heading");

  let lastResults = [];

  function showSearchError(msg) {
    searchError.textContent = msg;
    searchError.hidden = false;
  }

  function clearSearchError() {
    searchError.textContent = "";
    searchError.hidden = true;
  }

  function yearFromDate(dateStr) {
    if (!dateStr || dateStr.length < 4) return "";
    return dateStr.slice(0, 4);
  }

  function formatRatingShort(vote) {
    if (vote == null || Number.isNaN(Number(vote)) || Number(vote) === 0) return "N/A";
    return Number(vote).toFixed(1);
  }

  function formatRatingDetail(vote) {
    if (vote == null || Number.isNaN(Number(vote)) || Number(vote) === 0) return "N/A";
    return Number(vote).toFixed(1) + "/10";
  }

  function renderCards(movies) {
    resultsGrid.innerHTML = "";
    movies.forEach(function (m) {
      const card = document.createElement("article");
      card.className = "card";
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.dataset.movieId = String(m.id);

      const posterWrap = document.createElement("div");
      posterWrap.className = "card-poster-wrap";

      if (m.poster_url) {
        const img = document.createElement("img");
        img.className = "card-poster";
        img.src = m.poster_url;
        img.alt = "";
        posterWrap.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "card-poster-placeholder";
        ph.textContent = "No Poster Available";
        posterWrap.appendChild(ph);
      }

      const body = document.createElement("div");
      body.className = "card-body";

      const title = document.createElement("h3");
      title.className = "card-title";
      title.textContent = m.title || "Untitled";

      const footer = document.createElement("div");
      footer.className = "card-footer";

      const year = document.createElement("span");
      year.className = "card-year";
      year.textContent = yearFromDate(m.release_date) || "—";

      const rating = document.createElement("span");
      rating.className = "card-rating";
      rating.innerHTML =
        '<span class="star" aria-hidden="true">&#9733;</span> ' +
        formatRatingShort(m.vote_average);

      footer.appendChild(year);
      footer.appendChild(rating);

      body.appendChild(title);
      body.appendChild(footer);

      card.appendChild(posterWrap);
      card.appendChild(body);

      function openDetail() {
        openMovieDetail(m.id);
      }
      card.addEventListener("click", openDetail);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      });

      resultsGrid.appendChild(card);
    });
  }

  async function openMovieDetail(movieId) {
    loading.hidden = false;
    resultsView.hidden = true;
    detailView.hidden = true;
    clearSearchError();

    try {
      const res = await fetch("/api/movie/" + encodeURIComponent(movieId));
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load movie");
      }
      showDetail(data);
    } catch (err) {
      showSearchError(err.message || "Something went wrong.");
      resultsView.hidden = false;
      resultsHeading.hidden = false;
    } finally {
      loading.hidden = true;
    }
  }

  function showDetail(data) {
    const backdrop = document.getElementById("detail-backdrop");
    const posterImg = document.getElementById("detail-poster");
    const posterPh = document.getElementById("detail-poster-ph");
    const titleEl = document.getElementById("detail-title");
    const taglineEl = document.getElementById("detail-tagline");
    const pillsEl = document.getElementById("detail-pills");
    const overviewEl = document.getElementById("detail-overview");
    const castEl = document.getElementById("detail-cast");
    const trailerWrap = document.getElementById("trailer-wrap");

    if (data.backdrop_url) {
      backdrop.style.backgroundImage = "url(" + JSON.stringify(data.backdrop_url) + ")";
      backdrop.setAttribute("aria-label", "Backdrop for " + (data.title || "movie"));
    } else {
      backdrop.style.backgroundImage = "none";
      backdrop.setAttribute("aria-label", "");
    }

    if (data.poster_url) {
      posterImg.src = data.poster_url;
      posterImg.alt = data.title ? "Poster for " + data.title : "";
      posterImg.hidden = false;
      posterPh.hidden = true;
    } else {
      posterImg.removeAttribute("src");
      posterImg.hidden = true;
      posterPh.hidden = false;
    }

    titleEl.textContent = data.title || "";
    if (data.tagline) {
      taglineEl.textContent = '"' + data.tagline + '"';
      taglineEl.hidden = false;
    } else {
      taglineEl.textContent = "";
      taglineEl.hidden = true;
    }

    pillsEl.innerHTML = "";
    const ratingPill = document.createElement("span");
    const detailRating = formatRatingDetail(data.vote_average);
    ratingPill.className =
      "pill pill-rating" + (detailRating === "N/A" ? " pill-rating--na" : "");
    ratingPill.innerHTML =
      '<span class="star" aria-hidden="true">&#9733;</span> ' + detailRating;
    pillsEl.appendChild(ratingPill);

    if (data.runtime) {
      const runPill = document.createElement("span");
      runPill.className = "pill pill-runtime";
      runPill.textContent = data.runtime;
      pillsEl.appendChild(runPill);
    }

    const genres = data.genres || [];
    genres.forEach(function (g) {
      const genPill = document.createElement("span");
      genPill.className = "pill pill-genre";
      genPill.textContent = g;
      pillsEl.appendChild(genPill);
    });

    overviewEl.textContent = data.overview || "No overview available.";

    castEl.innerHTML = "";
    const castList = data.cast || [];
    if (castList.length === 0) {
      const empty = document.createElement("span");
      empty.className = "detail-body-text";
      empty.textContent = "—";
      castEl.appendChild(empty);
    } else {
      castList.forEach(function (name) {
        const pill = document.createElement("span");
        pill.className = "pill-cast";
        pill.textContent = name;
        castEl.appendChild(pill);
      });
    }

    trailerWrap.innerHTML = "";
    if (data.trailer_video_id) {
      const iframe = document.createElement("iframe");
      iframe.src =
        "https://www.youtube.com/embed/" +
        encodeURIComponent(data.trailer_video_id) +
        "?rel=0";
      iframe.title = "Movie trailer";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      trailerWrap.appendChild(iframe);
    } else {
      const p = document.createElement("p");
      p.className = "trailer-unavailable";
      p.textContent = "No trailer found.";
      trailerWrap.appendChild(p);
    }

    resultsView.hidden = true;
    detailView.hidden = false;
    window.scrollTo(0, 0);
  }

  function backToResults() {
    detailView.hidden = true;
    resultsView.hidden = false;
    resultsHeading.hidden = false;
  }

  searchForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const q = searchInput.value.trim();
    clearSearchError();

    if (!q) {
      showSearchError("Please enter a search term");
      return;
    }

    loading.hidden = false;
    emptyState.hidden = true;
    resultsGrid.innerHTML = "";
    resultsHeading.hidden = false;
    detailView.hidden = true;
    resultsView.hidden = false;

    try {
      const res = await fetch("/api/search?" + new URLSearchParams({ q: q }));
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }
      lastResults = data.results || [];
      if (lastResults.length === 0) {
        emptyState.hidden = false;
      } else {
        renderCards(lastResults);
      }
    } catch (err) {
      showSearchError(err.message || "Search failed.");
    } finally {
      loading.hidden = true;
    }
  });

  backBtn.addEventListener("click", backToResults);
})();
