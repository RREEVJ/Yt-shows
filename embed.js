 const params = new URLSearchParams(window.location.search);
        const videoId = params.get('v');
        const listId = params.get('list');
        const videoFrame = document.getElementById('videoFrame');
        const backButton = document.getElementById('backButton');

        if (videoId) {
            const embedUrl = new URL('https://www.youtube.com/embed/' + videoId);
            if (listId) embedUrl.searchParams.set('list', listId);
            embedUrl.searchParams.set('rel', '0');
            videoFrame.src = embedUrl.toString();
        }

        backButton.addEventListener('click', () => {
            if (listId) {
                window.location.href = 'watch.html?list=' + encodeURIComponent(listId);
            } else {
                window.location.href = 'index.html';
            }
        });