document.addEventListener('DOMContentLoaded', () => {

    // Image Upload Logic
    const coverUpload = document.getElementById('cover-upload');
    const coverDisplay = document.getElementById('cover-display');
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarImg = document.getElementById('avatar-img');
    const avatarPlaceholder = document.getElementById('avatar-display');

    coverUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            coverDisplay.style.backgroundImage = `url('${url}')`;
        }
    });

    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            avatarImg.src = url;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        }
    });

    // Tab Switching Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            tab.classList.add('active');

            // Show corresponding content
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Text Post Logic
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');
    const postsFeed = document.getElementById('posts-feed');

    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) {
            addPost(text);
            messageInput.value = '';
        }
    });

    function addPost(text) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';

        // Formatted timestamp
        const now = new Date();
        const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        postDiv.innerHTML = `
            <p class="post-text">${escapeHtml(text)}</p>
            <span class="post-date">${timeString}</span>
        `;

        // Add to top
        postsFeed.insertBefore(postDiv, postsFeed.firstChild);
    }

    // Audio Upload Logic
    const audioInput = document.getElementById('audio-input');
    const audioFeed = document.getElementById('audio-feed');

    audioInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            addAudioPost(file);
            // Reset input so same file can be selected again if needed
            audioInput.value = '';
        }
    });

    function addAudioPost(file) {
        const url = URL.createObjectURL(file);

        const audioDiv = document.createElement('div');
        audioDiv.className = 'audio-card';

        // Basic audio player custom markup could go here, for now using default
        const audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.src = url;

        const nameLabel = document.createElement('div');
        nameLabel.style.marginBottom = '8px';
        nameLabel.textContent = file.name;
        nameLabel.style.color = 'var(--text-secondary)';
        nameLabel.style.fontSize = '0.9rem';

        const container = document.createElement('div');
        container.style.width = '100%';
        container.appendChild(nameLabel);
        container.appendChild(audioEl);

        audioDiv.appendChild(container);

        audioFeed.insertBefore(audioDiv, audioFeed.firstChild);
    }

    // Utility to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
