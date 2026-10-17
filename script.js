const EMPTY_DATA = { socials: [], tracks: [], videos: [], gallery: [] };

async function loadData() {
  const status = document.getElementById('content-status');
  try {
    const response = await fetch('data/tracks.json', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Content data request failed (${response.status})`);
    const parsed = await response.json();
    const data = {
      socials: Array.isArray(parsed.socials) ? parsed.socials : EMPTY_DATA.socials,
      tracks: Array.isArray(parsed.tracks) ? parsed.tracks : EMPTY_DATA.tracks,
      videos: Array.isArray(parsed.videos) ? parsed.videos : EMPTY_DATA.videos,
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : EMPTY_DATA.gallery,
    };
    buildSocials(data.socials);
    buildMusic(data.tracks);
    buildVideos(data.videos);
    buildGallery(data.gallery);
    const total = data.socials.length + data.tracks.length + data.videos.length + data.gallery.length;
    status.textContent = total ? '' : 'Content is not configured yet. Add entries to data/tracks.json.';
  } catch (error) {
    console.error('Unable to load Smalls AI site content:', error);
    status.textContent = 'Music and gallery data could not be loaded. Check that data/tracks.json exists and is valid JSON.';
    showEmptyState();
  }
}

function showEmptyState() {
  ['player-list', 'video-list', 'gallery-grid', 'social-links'].forEach((id) => {
    const container = document.getElementById(id);
    if (container && !container.children.length) container.textContent = 'No content available.';
  });
}

function buildSocials(list) {
  const cont = document.getElementById('social-links');
  list.forEach((social) => {
    if (!social || typeof social.name !== 'string' || typeof social.url !== 'string') return;
    let url;
    try { url = new URL(social.url, window.location.href); } catch { return; }
    if (!['https:', 'http:'].includes(url.protocol)) return;
    const a = document.createElement('a');
    a.href = url.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = social.name;
    cont.appendChild(a);
  });
}

function buildMusic(tracks) {
  const list = document.getElementById('player-list');
  tracks.forEach((track) => {
    if (!track || typeof track.title !== 'string') return;
    const card = document.createElement('div');
    card.className = 'card';
    if (typeof track.cover === 'string') {
      const img = document.createElement('img');
      img.src = track.cover;
      img.alt = `${track.title} cover`;
      img.onerror = () => img.remove();
      card.appendChild(img);
    }
    const title = document.createElement('div');
    title.textContent = track.title;
    title.style.fontWeight = '600';
    card.appendChild(title);
    if (track.source === 'mp3' && typeof track.src === 'string') {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'none';
      audio.src = track.src;
      card.appendChild(audio);
    } else if (track.source === 'soundcloud' && typeof track.src === 'string') {
      const iframe = document.createElement('iframe');
      iframe.src = track.src;
      iframe.title = `SoundCloud player: ${track.title}`;
      iframe.width = '100%';
      iframe.height = '166';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'autoplay';
      iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';
      card.appendChild(iframe);
    }
    list.appendChild(card);
  });
}

function buildVideos(videos) {
  const list = document.getElementById('video-list');
  videos.forEach((video) => {
    if (!video || typeof video.title !== 'string' || typeof video.embed !== 'string') return;
    let url;
    try { url = new URL(video.embed, window.location.href); } catch { return; }
    if (!['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) return;
    const card = document.createElement('div');
    card.className = 'card';
    const iframe = document.createElement('iframe');
    iframe.width = '320';
    iframe.height = '180';
    iframe.src = url.href;
    iframe.title = video.title;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    card.appendChild(iframe);
    const title = document.createElement('div');
    title.textContent = video.title;
    title.style.marginTop = '6px';
    card.appendChild(title);
    list.appendChild(card);
  });
}

function buildGallery(images) {
  const grid = document.getElementById('gallery-grid');
  images.forEach((image) => {
    if (!image || typeof image.src !== 'string') return;
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = typeof image.alt === 'string' ? image.alt : 'Smalls AI gallery image';
    img.loading = 'lazy';
    img.onerror = () => card.remove();
    card.appendChild(img);
    grid.appendChild(card);
  });
}

loadData();
