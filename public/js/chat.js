document.addEventListener('DOMContentLoaded', () => {
  const chatMain = document.getElementById('chat-main');
  if (!chatMain || typeof io === 'undefined') return;

  const socket = io();
  const currentUserId = chatMain.dataset.currentUserId;
  const activeUserId = chatMain.dataset.userId;
  let conversationId = chatMain.dataset.conversationId;
  const messagesEl = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const typingIndicator = document.getElementById('typing-indicator');
  const statusEl = document.getElementById('chat-user-status');
  let typingTimer;

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const appendMessage = (msg, isSent) => {
    if (!messagesEl) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isSent ? 'sent' : 'received'}`;
    bubble.dataset.id = msg._id;
    let content = '';
    if (msg.image) content += `<img src="${msg.image}" class="chat-image" alt="shared">`;
    if (msg.text) content += `<p>${escapeHtml(msg.text)}</p>`;
    const status = isSent ? (msg.seen ? '✓✓ Seen' : msg.delivered ? '✓✓ Delivered' : '✓ Sent') : '';
    bubble.innerHTML = `${content}<span class="chat-time">${formatTime(msg.createdAt || Date.now())}${isSent ? ' · ' + status : ''}</span>`;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  socket.on('users:online', (users) => {
    const el = document.getElementById('online-count');
    if (el) el.textContent = `${users.length} online`;
    if (statusEl && activeUserId) {
      statusEl.textContent = users.includes(activeUserId) ? 'Online' : 'Offline';
      statusEl.className = `chat-status ${users.includes(activeUserId) ? 'online' : 'offline'}`;
    }
  });

  const joinConv = (id) => {
    if (!id) return;
    conversationId = id;
    socket.emit('join_room', id);
    socket.emit('conversation:join', id);
    socket.emit('message:seen', { conversationId: id });
  };

  if (conversationId) joinConv(conversationId);
  else if (activeUserId) {
    fetch(`/chat/conversation/${activeUserId}`).then(r => r.json()).then(d => joinConv(d.conversationId));
  }

  const handleReceive = (msg) => {
    const isSent = (msg.sender?._id || msg.sender) === currentUserId;
    appendMessage(msg, isSent);
    if (!isSent && conversationId) socket.emit('message:seen', { conversationId });
  };

  socket.on('message:receive', handleReceive);
  socket.on('receive_message', handleReceive);

  socket.on('message_seen', () => {
    messagesEl?.querySelectorAll('.chat-bubble.sent .chat-time').forEach(el => {
      if (!el.textContent.includes('Seen')) el.textContent = el.textContent.replace('Delivered', 'Seen').replace('Sent', 'Seen');
    });
  });

  socket.on('typing', (data) => {
    if (data.userId !== currentUserId && typingIndicator) {
      typingIndicator.textContent = `${data.username || 'User'} is typing...`;
      typingIndicator.style.display = 'block';
    }
  });

  socket.on('typing:start', (data) => {
    if (data.userId !== currentUserId && typingIndicator) {
      typingIndicator.textContent = `${data.username} is typing...`;
      typingIndicator.style.display = 'block';
    }
  });

  socket.on('stop_typing', () => { if (typingIndicator) typingIndicator.style.display = 'none'; });
  socket.on('typing:stop', () => { if (typingIndicator) typingIndicator.style.display = 'none'; });

  if (chatInput) {
    chatInput.addEventListener('input', () => {
      if (!conversationId) return;
      socket.emit('typing', { conversationId });
      socket.emit('typing:start', { conversationId });
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        socket.emit('stop_typing', { conversationId });
        socket.emit('typing:stop', { conversationId });
      }, 1500);
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text || !activeUserId) return;
      if (!conversationId) {
        const res = await fetch(`/chat/conversation/${activeUserId}`);
        const data = await res.json();
        joinConv(data.conversationId);
      }
      socket.emit('send_message', { conversationId, receiverId: activeUserId, text });
      chatInput.value = '';
      socket.emit('stop_typing', { conversationId });
    });
  }

  const imageBtn = document.getElementById('chat-image-btn');
  const imageInput = document.getElementById('chat-image-input');
  if (imageBtn && imageInput) {
    imageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', async () => {
      const file = imageInput.files[0];
      if (!file || !activeUserId) return;
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/chat/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        if (!conversationId) {
          const cRes = await fetch(`/chat/conversation/${activeUserId}`);
          const cData = await cRes.json();
          joinConv(cData.conversationId);
        }
        socket.emit('send_message', { conversationId, receiverId: activeUserId, text: '', image: data.imageUrl });
      }
      imageInput.value = '';
    });
  }

  if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;

  function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});
