document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const coverUpload = document.getElementById('cover-upload');
    const coverDisplay = document.getElementById('cover-display');
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarImg = document.getElementById('avatar-img');
    const avatarPlaceholder = document.getElementById('avatar-display');
    const nameEl = document.querySelector('.name');
    const bioEl = document.querySelector('.bio');
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');
    const postsFeed = document.getElementById('posts-feed');
    const audioInput = document.getElementById('audio-input');
    const audioFeed = document.getElementById('audio-feed');

    // --- Persistence Logic ---

    // Load profile and messages on startup
    fetchProfile();
    fetchMessages();

    async function fetchProfile() {
        try {
            const response = await fetch('/.netlify/functions/get-profile');
            const data = await response.json();
            if (data.name) nameEl.textContent = data.name;
            if (data.bio) bioEl.textContent = data.bio;
            if (data.cover) coverDisplay.style.backgroundImage = `url('${data.cover}')`;
            if (data.avatar) {
                avatarImg.src = data.avatar;
                avatarImg.style.display = 'block';
                avatarPlaceholder.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    async function updateProfile(fields) {
        try {
            await fetch('/.netlify/functions/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fields)
            });
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    }

    // Editable Name & Bio
    nameEl.setAttribute('contenteditable', 'true');
    bioEl.setAttribute('contenteditable', 'true');

    [nameEl, bioEl].forEach(el => {
        el.addEventListener('blur', () => {
            updateProfile({
                name: nameEl.textContent.trim(),
                bio: bioEl.textContent.trim()
            });
        });
    });

    // Image Upload with Persistence
    coverUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await toBase64(file);
            coverDisplay.style.backgroundImage = `url('${base64}')`;
            updateProfile({ cover: base64 });
        }
    });

    avatarUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await toBase64(file);
            avatarImg.src = base64;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
            updateProfile({ avatar: base64 });
        }
    });

    // Tab Switching Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Text & Audio Feed Logic
    async function fetchMessages() {
        try {
            const response = await fetch('/.netlify/functions/get-messages');
            const messages = await response.json();
            postsFeed.innerHTML = '';
            audioFeed.innerHTML = '';

            if (messages.length === 0) {
                postsFeed.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No messages yet.</p>';
                audioFeed.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No audio yet.</p>';
            } else {
                messages.forEach(msg => {
                    if (msg.type === 'audio') {
                        displayAudio(msg.content, msg.created_at);
                    } else {
                        displayPost(msg.content, msg.created_at);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    sendBtn.addEventListener('click', async () => {
        const text = messageInput.value.trim();
        if (!text) return;
        displayPost(text, new Date().toISOString(), true);
        messageInput.value = '';
        saveMessage(text, 'text');
    });

    async function saveMessage(content, type) {
        try {
            const response = await fetch('/.netlify/functions/create-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type })
            });
            if (response.ok) fetchMessages();
        } catch (error) {
            console.error('Error saving message:', error);
        }
    }

    function displayPost(text, timestamp, isOptimistic = false) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        if (isOptimistic) postDiv.style.opacity = '0.7';
        const date = new Date(timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        postDiv.innerHTML = `<p class="post-text">${escapeHtml(text)}</p><span class="post-date">${timeString}</span>`;
        postsFeed.insertBefore(postDiv, postsFeed.firstChild);
    }

    // Audio Persistence
    audioInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Please keep it under 5MB.');
                return;
            }
            const base64 = await toBase64(file);
            displayAudio(base64, new Date().toISOString(), true);
            saveMessage(base64, 'audio');
            audioInput.value = '';
        }
    });

    function displayAudio(base64, timestamp, isOptimistic = false) {
        const audioDiv = document.createElement('div');
        audioDiv.className = 'audio-card';
        if (isOptimistic) audioDiv.style.opacity = '0.7';

        const date = new Date(timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        audioDiv.innerHTML = `
            <div style="width: 100%;">
                <audio controls src="${base64}" style="width: 100%;"></audio>
                <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-secondary); text-align: right;">${timeString}</div>
            </div>
        `;
        audioFeed.insertBefore(audioDiv, audioFeed.firstChild);
    }

    // Helpers
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
