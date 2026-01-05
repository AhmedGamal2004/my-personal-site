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

    coverUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image is too large. Please keep it under 2MB.');
                return;
            }
            const base64 = await toBase64(file);
            coverDisplay.style.backgroundImage = `url('${base64}')`;
            updateProfile({ cover: base64 });
        }
    });

    avatarUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image is too large. Please keep it under 2MB.');
                return;
            }
            const base64 = await toBase64(file);
            avatarImg.src = base64;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
            updateProfile({ avatar: base64 });
        }
    });

    // Navigation
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

    // Messaging & Audio
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
                        displayAudio(msg.id, msg.content, msg.created_at);
                    } else {
                        displayPost(msg.id, msg.content, msg.created_at);
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
        messageInput.value = '';
        await saveMessage(text, 'text');
        fetchMessages();
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });

    async function saveMessage(content, type) {
        try {
            const response = await fetch('/.netlify/functions/create-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type })
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    }

    async function deleteMessage(id) {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            const response = await fetch('/.netlify/functions/delete-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (response.ok) fetchMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }

    function createDeleteBtn(id) {
        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.innerHTML = '🗑️';
        btn.onclick = () => deleteMessage(id);
        return btn;
    }

    function displayPost(id, text, timestamp) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        const date = new Date(timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        postDiv.innerHTML = `
            <p class="post-text">${escapeHtml(text)}</p>
            <span class="post-date">${timeString}</span>
        `;
        postDiv.appendChild(createDeleteBtn(id));
        postsFeed.appendChild(postDiv);
    }

    audioInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Please keep it under 5MB.');
                return;
            }
            const base64 = await toBase64(file);
            audioInput.value = '';
            await saveMessage(base64, 'audio');
            fetchMessages();
        }
    });

    function displayAudio(id, base64, timestamp) {
        const audioDiv = document.createElement('div');
        audioDiv.className = 'audio-card';
        const date = new Date(timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        audioDiv.innerHTML = `
            <div style="width: 100%;">
                <audio controls src="${base64}" style="width: 100%;"></audio>
                <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-secondary); text-align: right;">${timeString}</div>
            </div>
        `;
        audioDiv.appendChild(createDeleteBtn(id));
        audioFeed.appendChild(audioDiv);
    }

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
