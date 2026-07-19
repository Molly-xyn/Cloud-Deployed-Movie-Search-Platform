import os

import requests
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

TMDB_API_KEY = os.environ.get("TMDB_API_KEY")
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")

TMDB_BASE = "https://api.themoviedb.org/3"
POSTER_BASE = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/search")
def search_movies():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "Keyword required"}), 400
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB API key not configured"}), 500

    r = requests.get(
        f"{TMDB_BASE}/search/movie",
        params={"query": q, "api_key": TMDB_API_KEY},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json()

    results = []
    for m in data.get("results", []):
        poster_path = m.get("poster_path")
        results.append(
            {
                "id": m.get("id"),
                "title": m.get("title") or "",
                "release_date": m.get("release_date") or "",
                "vote_average": m.get("vote_average"),
                "poster_path": poster_path,
                "poster_url": f"{POSTER_BASE}{poster_path}" if poster_path else None,
            }
        )

    return jsonify({"results": results})


@app.route("/api/movie/<int:movie_id>")
def movie_detail(movie_id):
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB API key not configured"}), 500
    if not YOUTUBE_API_KEY:
        return jsonify({"error": "YouTube API key not configured"}), 500

    r = requests.get(
        f"{TMDB_BASE}/movie/{movie_id}",
        params={"append_to_response": "credits", "api_key": TMDB_API_KEY},
        timeout=30,
    )
    r.raise_for_status()
    m = r.json()

    backdrop_path = m.get("backdrop_path")
    genres = [g.get("name") for g in m.get("genres", []) if g.get("name")]
    credits = m.get("credits") or {}
    cast_list = credits.get("cast") or []
    cast_names = [c.get("name") for c in cast_list[:5] if c.get("name")]

    runtime_min = m.get("runtime")
    runtime_display = None
    if runtime_min is not None:
        h = runtime_min // 60
        min_part = runtime_min % 60
        if h > 0:
            runtime_display = f"{h}h {min_part}m" if min_part else f"{h}h"
        else:
            runtime_display = f"{min_part}m"

    title = m.get("title") or ""
    trailer_id = None
    try:
        yt = requests.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={
                "part": "snippet",
                "q": f"{title} official trailer",
                "type": "video",
                "maxResults": 1,
                "key": YOUTUBE_API_KEY,
            },
            timeout=30,
        )
        yt.raise_for_status()
        yt_data = yt.json()
        items = yt_data.get("items") or []
        if items:
            vid = items[0].get("id") or {}
            trailer_id = vid.get("videoId")
    except (requests.RequestException, ValueError, KeyError):
        trailer_id = None

    poster_path = m.get("poster_path")

    return jsonify(
        {
            "id": m.get("id"),
            "title": title,
            "tagline": m.get("tagline") or "",
            "overview": m.get("overview") or "",
            "genres": genres,
            "runtime": runtime_display,
            "vote_average": m.get("vote_average"),
            "backdrop_path": backdrop_path,
            "backdrop_url": f"{BACKDROP_BASE}{backdrop_path}" if backdrop_path else None,
            "poster_path": poster_path,
            "poster_url": f"{POSTER_BASE}{poster_path}" if poster_path else None,
            "cast": cast_names,
            "trailer_video_id": trailer_id,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
