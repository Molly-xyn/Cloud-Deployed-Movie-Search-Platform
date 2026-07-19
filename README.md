# Cloud-Deployed-Movie-Search-Platform
A cloud-deployed movie search platform built with FastAPI and Google Cloud Run
---

## Tech Stack

*   **Backend:** Python, Flask/FastAPI
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS for dynamic UI rendering)
*   **DevOps & Deployment:** Docker, Containerization Architecture
*   **External Integrations:** TMDB (The Movie Database) API, YouTube API

---

## Key Features

*   **Full-Stack Architecture:** Built a decoupled backend service to process search logic and handle response transformation into clean, production-ready JSON data.
*   **Dynamic UI Rendering:** Implemented dynamic asynchronous data fetching via frontend JavaScript, delivering real-time search results with low-latency concurrent processing.
*   **External API Integration:** Seamlessly orchestrated multi-source API integration (TMDB & YouTube APIs) to aggregate detailed movie metadata, ratings, and video trailers.
*   **Resilient Error Handling:** Incorporated fallback logic and strict data validation to gracefully manage network latency, rate limits, and API failure scenarios.
*   **Cloud-Ready Containerization:** Standardized the entire runtime environment with a multi-stage `Dockerfile` to ensure high-performance execution upon cloud deployment.

---

## Project Structure

```text
├── static/
│   ├── css/
│   │   └── styles.css       # Custom responsive UI styling
│   └── js/
│       └── app.js           # Asynchronous frontend interaction & API fetching
├── templates/
│   └── index.html           # Main user interface template
├── app.py                   # Central Python server handling routing & API integration
├── Dockerfile               # Container configuration for production deployment
└── requirements.txt         # Server dependency specifications
