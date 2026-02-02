// js/releases.js

// 🔧 CHANGE THESE to the repo that holds the releases you want to show:
const OWNER = "Chilaca-Rocoto";
const REPO  = "Chilaca-Rocoto/Capstone"; // <-- replace with the other repo name

// Optional: how many releases to show
const MAX_RELEASES = 1;

const el = document.getElementById("release-status");

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

async function loadReleases() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=${MAX_RELEASES}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const releases = await res.json();

    if (!Array.isArray(releases) || releases.length === 0) {
      el.innerHTML = `<p>No releases found yet.</p>`;
      return;
    }

    const items = releases.map(r => {
      const name = r.name || r.tag_name || "Release";
      const tag = r.tag_name ? `<code>${escapeHtml(r.tag_name)}</code>` : "";
      const date = r.published_at ? formatDate(r.published_at) : "Unpublished";
      const url = r.html_url;
      const body = (r.body || "").trim();

      // Keep it short on the homepage
      const snippet = body.length > 240 ? body.slice(0, 240) + "…" : body;

      return `
        <div class="release-card">
          <div class="release-title">
            <a href="${url}" target="_blank" rel="noreferrer">${escapeHtml(name)}</a>
            ${tag}
          </div>
          <div class="release-meta">Published: ${escapeHtml(date)}</div>
          ${snippet ? `<div class="release-body">${escapeHtml(snippet)}</div>` : ""}
        </div>
      `;
    }).join("");

    el.innerHTML = `
      <div class="release-list">
        ${items}
      </div>
      <p class="release-footer">
        Source: <a href="https://github.com/${OWNER}/${REPO}/releases" target="_blank" rel="noreferrer">
          ${OWNER}/${REPO} Releases
        </a>
      </p>
    `;
  } catch (err) {
    console.error(err);
    el.innerHTML = `
      <p>Could not load releases right now.</p>
      <p class="muted">(${escapeHtml(err.message || "unknown error")})</p>
    `;
  }
}

loadReleases();
