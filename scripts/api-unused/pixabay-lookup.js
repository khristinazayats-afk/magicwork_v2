// api/pixabay-lookup.js
// Safe Pixabay lookup for magiwork: never crash, best-effort author/title.

export const config = { runtime: "nodejs" };

function isMp3Url(url) {
  return /\.mp3(\?|$)/i.test(url || "");
}

function inferIdFromUrl(url) {
  if (!url) return null;
  const m = /-([0-9]+)\.mp3/i.exec(url);
  return m ? m[1] : null;
}

function inferPageFromMp3(mp3Url) {
  const id = inferIdFromUrl(mp3Url);
  if (!id) return null;
  return `https://pixabay.com/music/-${id}/`;
}

async function tryFetchHtml(url) {
  if (!url) return { html: null, status: null };
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (magiwork)",
        "Accept": "text/html,application/xhtml+xml",
        "Referer": "https://pixabay.com/"
      }
    });
    const status = res.status;
    if (!res.ok) {
      // 403/404/etc – just report status, don't throw
      return { html: null, status };
    }
    const text = await res.text();
    return { html: text, status };
  } catch (_e) {
    return { html: null, status: null };
  }
}

function extract(str, pattern) {
  const m = str && str.match(pattern);
  return m && m[1] ? m[1].trim() : "";
}

function extractAuthor(html) {
  if (!html) return "";
  return (
    extract(html, /"user"\s*:\s*"([^"]+)"/) ||
    extract(html, /"byArtist"\s*:\s*{[^}]*"name"\s*:\s*"([^"]+)"/) ||
    extract(html, /"author"\s*:\s*{[^}]*"name"\s*:\s*"([^"]+)"/) ||
    extract(html, /rel=["']author["'][^>]*>([^<]+)</i) ||
    extract(html, /\/users\/[^"']+["'][^>]*>([^<]+)</i) ||
    ""
  );
}

function extractTitle(html) {
  if (!html) return "";
  return (
    extract(html, /"@type"\s*:\s*"MusicRecording"[^}]*"name"\s*:\s*"([^"]+)"/) ||
    extract(html, /"title"\s*:\s*"([^"]+)"/) ||
    extract(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    ""
  );
}

export default async function handler(req, res) {
  let { mp3, pixabay_page } = req.query;
  const originalInput = { mp3, pixabay_page };

  // If pixabay_page is actually an mp3 URL, treat as mp3
  if (!mp3 && pixabay_page && isMp3Url(pixabay_page)) {
    mp3 = pixabay_page;
    pixabay_page = undefined;
  }

  // Infer page from mp3
  if (!pixabay_page && mp3 && isMp3Url(mp3)) {
    pixabay_page = inferPageFromMp3(mp3);
  }

  // If we still don't have a page, just return Unknown Artist
  if (!pixabay_page) {
    return res.status(200).json({
      author: "Unknown Artist",
      title: "",
      pixabay_page: null,
      note: "no_page_inferred",
      input: originalInput
    });
  }

  const { html, status } = await tryFetchHtml(pixabay_page);

  if (!html) {
    // Could be 403, 404, network, whatever – don’t surface as error
    return res.status(200).json({
      author: "Unknown Artist",
      title: "",
      pixabay_page,
      note: status ? `html_fetch_failed_status_${status}` : "html_fetch_failed",
      input: originalInput
    });
  }

  const author = extractAuthor(html) || "Unknown Artist";
  const title = extractTitle(html) || "";

  return res.status(200).json({
    author,
    title,
    pixabay_page,
    note: author === "Unknown Artist" ? "author_not_found" : "ok",
    input: originalInput
  });
}
