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

    // Load messages on startup
    fetchMessages();

    async function fetchMessages() {
        try {
            const response = await fetch('/.netlify/functions/get-messages');
            const messages = await response.json();
            postsFeed.innerHTML = ''; // Clear feed
            if (messages.length === 0) {
                postsFeed.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No messages yet. Be the first!</p>';
            } else {
                messages.forEach(msg => {
                    displayPost(msg.content, msg.created_at);
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            postsFeed.innerHTML = '<p style="text-align: center; color: #ff4d4d;">Failed to load messages.</p>';
        }
    }

    sendBtn.addEventListener('click', async () => {
        const text = messageInput.value.trim();
        if (!text) return;

        // Optimistic UI update
        const tempId = Date.now();
        displayPost(text, new Date().toISOString(), true);
        messageInput.value = '';

        try {
            const response = await fetch('/.netlify/functions/create-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text, type: 'text' })
            });

            if (!response.ok) throw new Error('Failed to save message');

            // Refresh feed to get final data
            fetchMessages();
        } catch (error) {
            console.error('Error saving message:', error);
            alert('Was not able to save your message. Please check your connection.');
            fetchMessages(); // Revert UI
        }
    });

    function displayPost(text, timestamp, isOptimistic = false) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        if (isOptimistic) postDiv.style.opacity = '0.7';

        const date = new Date(timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        postDiv.innerHTML = `
            <p class="post-text">${escapeHtml(text)}</p>
            <span class="post-date">${timeString}</span>
        `;

        postsFeed.insertBefore(postDiv, postsFeed.firstChild);
    }

    // Audio Upload Logic (Simplified for now as backend storage for files is complex)
    const audioInput = document.getElementById('audio-input');
    const audioFeed = document.getElementById('audio-feed');

    audioInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            addAudioPost(file);
            audioInput.value = '';
        }
    });

    function addAudioPost(file) {
        const url = URL.createObjectURL(file);
        const audioDiv = document.createElement('div');
        audioDiv.className = 'audio-card';
        const audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.src = url;

        const nameLabel = document.createElement('div');
        nameLabel.style.marginBottom = '8px';
        nameLabel.textContent = file.name + " (Preview Only)";
        nameLabel.style.color = 'var(--text-secondary)';
        nameLabel.style.fontSize = '0.9rem';

        const container = document.createElement('div');
        container.style.width = '100%';
        container.appendChild(nameLabel);
        container.appendChild(audioEl);
        audioDiv.appendChild(container);
        audioFeed.insertBefore(audioDiv, audioFeed.firstChild);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
