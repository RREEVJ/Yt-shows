const API_KEY = 'AIzaSyCxrDWczWivjYYMTMOfOi_ibuvPNRKTCv0';
const statusEl = document.getElementById('status');
const playlistEl = document.getElementById('playlist');

function getPlaylistIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const queryList = params.get('list');
    if (queryList) return queryList;

    const path = window.location.pathname;
    const match = path.match(/\/watch\.html\/(.+)$/);
    return match ? decodeURIComponent(match[1].split('/')[0]) : null;
}

async function fetchPlaylistPage(playlistId, pageToken = '') {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('key', API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Unable to load playlist');
    }

    return data;
}

async function loadPlaylist() {
    const playlistId = getPlaylistIdFromUrl();

    if (!playlistId) {
        statusEl.textContent = 'Add a playlist ID to the URL like /watch.html?list=PLAYLIST_ID or /watch.html/PLAYLIST_ID';
        return;
    }

    try {
        let allItems = [];
        let pageToken = '';

        do {
            const data = await fetchPlaylistPage(playlistId, pageToken);
            allItems = allItems.concat(data.items || []);
            pageToken = data.nextPageToken || '';
        } while (pageToken);

        if (!allItems.length) {
            statusEl.textContent = 'This playlist is empty.';
            return;
        }

        playlistEl.innerHTML = allItems.map((item) => {
            const snippet = item.snippet || {};
            const title = snippet.title || 'Untitled video';
            const videoId = snippet.resourceId?.videoId;
            const thumbnail = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '';
            const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}` : '#';
            const embedUrl = videoId ? `embed.html?v=${videoId}&list=${playlistId}` : '#';

            return `
                <li class="playlist-item">
                    <div class="playlist-thumb-link">
                        <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">
                            <img src="${thumbnail}" alt="${title}">
                        </a>
                    </div>

                    <div class="playlist-content">
                        <a class="playlist-title" href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">
                            ${title}
                        </a>

                        <div class="playlist-actions">
                            <a class="mini-btn youtube-btn" href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">
                                Watch on YouTube
                            </a>
                            <a class="mini-btn embed-btn" href="${embedUrl}">
                                Watch on Embed
                            </a>
                        </div>
                    </div>
                </li>
            `;
        }).join('');

        statusEl.textContent = `Showing ${allItems.length} videos from the playlist.`;
    } catch (error) {
        statusEl.textContent = 'Could not load playlist: ' + error.message;
    }
}

loadPlaylist();
