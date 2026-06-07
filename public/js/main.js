document.addEventListener('DOMContentLoaded', () => {
  // --- 1. THEME TOGGLE ROUTINE ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // Set default theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', initialTheme);
  updateThemeButtonIcon(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeButtonIcon(newTheme);
      
      // Spawn toast notification for visual feedback
      spawnToast('Theme Changed', `Switched to ${newTheme} mode!`, 'cyan');
    });
  }

  function updateThemeButtonIcon(theme) {
    if (!themeToggleBtn) return;
    if (theme === 'dark') {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      `;
    } else {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      `;
    }
  }

  // --- 2. AJAX POST LIKES WITH PARTICLE BURST ---
  const likeButtons = document.querySelectorAll('.like-btn');
  likeButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const postId = btn.getAttribute('data-post-id');
      
      try {
        const response = await fetch(`/posts/${postId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          const card = btn.closest('.post-card');
          const countNum = card?.querySelector('.likes-count-num');
          if (countNum) countNum.textContent = data.likesCount;
          const svg = btn.querySelector('svg');
          if (svg) svg.setAttribute('fill', data.liked ? 'currentColor' : 'none');

          if (data.liked) {
            btn.classList.add('liked');
            triggerLikeExplosion(e.clientX, e.clientY);
            spawnToast('Post Liked', 'You liked a post! 💖', 'pink');
          } else {
            btn.classList.remove('liked');
            spawnToast('Post Unliked', 'You removed your like.', 'cyan');
          }
        }
      } catch (err) {
        console.error('AJAX Like Error:', err);
      }
    });
  });

  function triggerLikeExplosion(x, y) {
    const particleCount = 12;
    const colors = ['#ff007f', '#bd00ff', '#00f0ff', '#ff375f'];
    
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'like-particle';
      
      // Styled as SVG tiny heart
      p.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="${colors[Math.floor(Math.random() * colors.length)]}">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
      
      // Calculate random trajectories
      const angle = Math.random() * Math.PI * 2;
      const velocity = 30 + Math.random() * 80;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 40; // upward bias
      
      p.style.left = `${x - 8}px`;
      p.style.top = `${y - 8}px`;
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      p.style.setProperty('--angle', `${Math.random() * 360}deg`);
      
      document.body.appendChild(p);
      
      // Clean up DOM
      setTimeout(() => p.remove(), 800);
    }
  }

  // --- 3. AJAX COMMENT SUBMISSION ---
  const commentForms = document.querySelectorAll('.comment-form');
  commentForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const postId = form.getAttribute('data-post-id');
      const input = form.querySelector('.comment-composer-input');
      const content = input.value.trim();
      
      if (!content) return;
      
      try {
        const response = await fetch(`/posts/${postId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        
        if (response.ok) {
          const comment = await response.json();
          
          // Clear input
          input.value = '';
          
          // Append comment to list
          const commentsList = form.closest('.comments-section').querySelector('.comments-list');
          const noCommentsMsg = commentsList.querySelector('.no-comments-msg');
          if (noCommentsMsg) noCommentsMsg.remove();
          
          const commentItem = document.createElement('div');
          commentItem.className = 'comment-item';
          commentItem.innerHTML = `
            <img class="comment-avatar" src="${comment.author.profilePicture}" alt="${comment.author.username}">
            <div class="comment-body">
              <a href="/users/${comment.author.username}" class="comment-user">${comment.author.username}</a>
              <span class="comment-text">${escapeHtml(comment.content)}</span>
            </div>
          `;
          
          commentsList.appendChild(commentItem);
          commentsList.scrollTop = commentsList.scrollHeight; // Auto-scroll to bottom
          
          // Update comment count label dynamically
          const countNum = form.closest('.post-card').querySelector('.comments-count-num');
          if (countNum) countNum.textContent = parseInt(countNum.textContent || 0) + 1;
          spawnToast('Comment Added', 'Your comment was shared instantly! 💬', 'cyan');
        }
      } catch (err) {
        console.error('AJAX Comment Error:', err);
      }
    });
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- 4. FLOATING DYNAMIC TOAST ALERTS ---
  function spawnToast(title, subtitle, type = 'cyan') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-card glass-panel toast-glow-${type}`;
    toast.innerHTML = `
      <div class="toast-content-wrapper">
        <div class="toast-title">${title}</div>
        <div class="toast-subtitle">${subtitle}</div>
      </div>
    `;
    
    container.appendChild(toast);
    
    // Enable dragging for toast too
    makeElementDraggable(toast);
    
    // Fade out and remove
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // --- 5. DRAGGABLE NOTIFICATIONS DRAWER MODULE ---
  const dragPanel = document.getElementById('draggable-panel');
  if (dragPanel) {
    const dragHeader = dragPanel.querySelector('.draggable-header');
    const closeBtn = dragPanel.querySelector('.draggable-close-btn');
    
    // Initialize default position
    dragPanel.style.left = '';
    dragPanel.style.top = '';
    
    makeElementDraggable(dragPanel, dragHeader);
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dragPanel.style.display = 'none';
      });
    }
  }

  // Generic Drag-and-Drop Handler (Touch & Mouse compatible with Physics Bounds)
  function makeElementDraggable(elm, trigger = null) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragTrigger = trigger || elm;
    
    dragTrigger.addEventListener('mousedown', dragMouseDown);
    dragTrigger.addEventListener('touchstart', dragTouchStart, { passive: false });

    function dragMouseDown(e) {
      if (e.target.closest('button') || e.target.closest('a')) return;
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
      elm.style.cursor = 'grabbing';
    }

    function dragTouchStart(e) {
      if (e.target.closest('button') || e.target.closest('a')) return;
      // Get the touch coordinate position
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      document.addEventListener('touchend', closeDragElement);
      document.addEventListener('touchmove', elementTouchDrag, { passive: false });
    }

    function elementDrag(e) {
      e.preventDefault();
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      applyNewPosition();
    }

    function elementTouchDrag(e) {
      // Calculate the new touch position
      pos1 = pos3 - e.touches[0].clientX;
      pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      
      applyNewPosition();
    }

    function applyNewPosition() {
      // Compute boundary physics (keep inside viewport)
      let newTop = elm.offsetTop - pos2;
      let newLeft = elm.offsetLeft - pos1;
      
      const maxLeft = window.innerWidth - elm.offsetWidth;
      const maxTop = window.innerHeight - elm.offsetHeight;
      
      if (newLeft < 0) newLeft = 0;
      if (newLeft > maxLeft) newLeft = maxLeft;
      if (newTop < 0) newTop = 0;
      if (newTop > maxTop) newTop = maxTop;
      
      elm.style.top = `${newTop}px`;
      elm.style.left = `${newLeft}px`;
      elm.style.right = 'auto'; // Clear right margin alignments
      elm.style.bottom = 'auto';
    }

    function closeDragElement() {
      // Stop moving when mouse/touch is released
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('touchend', closeDragElement);
      document.removeEventListener('touchmove', elementTouchDrag);
      elm.style.cursor = '';
    }
  }

  // Add Dynamic Mock notification cards to panel
  function addMockNotification(type, message) {
    const contentBox = document.querySelector('.draggable-content');
    const badge = document.querySelector('.draggable-badge');
    if (!contentBox) return;

    // Remove "No notification" text if present
    const emptyMsg = contentBox.querySelector('.no-notif-msg');
    if (emptyMsg) emptyMsg.remove();

    const notif = document.createElement('div');
    notif.className = `notification-card ${type}`;
    
    let svgIcon = '';
    if (type === 'like') {
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
    } else {
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      `;
    }

    notif.innerHTML = `
      <div class="notification-icon-wrapper">
        ${svgIcon}
      </div>
      <div class="notification-text-meta">
        <h6>${message}</h6>
        <p>Just now</p>
      </div>
    `;

    contentBox.prepend(notif);

    // Update badge count
    if (badge) {
      const currentVal = parseInt(badge.textContent) || 0;
      badge.textContent = `${currentVal + 1}`;
    }
  }

  // --- 6. AJAX USER SEARCH FILTER ENGINE ---
  const searchInput = document.getElementById('user-search-field');
  const searchPanel = document.getElementById('search-dropdown-results');
  const searchWidget = searchInput ? searchInput.closest('.search-widget') : null;

  const setSearchPanelOpen = (isOpen) => {
    if (searchPanel) searchPanel.style.display = isOpen ? 'flex' : 'none';
    if (searchWidget) searchWidget.classList.toggle('is-search-active', isOpen);
  };
  
  if (searchInput && searchPanel) {
    let debounceTimer;
    
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const query = searchInput.value.trim();
      
      if (query.length === 0) {
        setSearchPanelOpen(false);
        return;
      }
      
      debounceTimer = setTimeout(async () => {
        try {
          const response = await fetch(`/users/search?query=${encodeURIComponent(query)}`);
          if (response.ok) {
            const users = await response.json();
            renderSearchResults(users);
          }
        } catch (err) {
          console.error('AJAX Search Query Error:', err);
        }
      }, 300); // 300ms debounce
    });

    // Close search panel on clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchPanel.contains(e.target)) {
        setSearchPanelOpen(false);
      }
    });
  }

  function renderSearchResults(users) {
    if (!searchPanel) return;
    searchPanel.innerHTML = '';
    
    if (users.length === 0) {
      searchPanel.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No creators found...</div>';
      setSearchPanelOpen(true);
      return;
    }
    
    users.forEach(u => {
      const userItem = document.createElement('a');
      userItem.className = 'search-user-item';
      userItem.href = `/users/${u.username}`;
      userItem.innerHTML = `
        <img class="search-user-avatar" src="${u.profilePicture}" alt="${u.username}">
        <div class="search-user-meta">
          <h5>${u.username}</h5>
          <p>${escapeHtml(u.bio)}</p>
        </div>
      `;
      searchPanel.appendChild(userItem);
    });
    
    setSearchPanelOpen(true);
  }

  // --- 7. HIGH FIDELITY INSTAGRAM STORIES VIEWER TIMELINE PLAYER ---
  const storyCircles = document.querySelectorAll('.story-circle');
  const storyViewer = document.getElementById('story-viewer-modal');
  
  if (storyViewer && storyCircles.length > 0) {
    const viewerAvatar = storyViewer.querySelector('.story-viewer-avatar');
    const viewerUsername = storyViewer.querySelector('.story-viewer-username');
    const viewerUserLink = storyViewer.querySelector('.story-viewer-user');
    const viewerImage = storyViewer.querySelector('.story-viewer-image');
    const viewerCaption = storyViewer.querySelector('.story-viewer-caption');
    const progressBarFill = storyViewer.querySelector('.story-progress-bar-fill');
    
    let activeStoryTimer;
    let storyDuration = 4000; // 4 seconds duration
    let startTime;
    let elapsed = 0;
    let isPaused = false;
    let animationFrameId;

    storyCircles.forEach(circle => {
      circle.addEventListener('click', () => {
        const username = circle.getAttribute('data-username');
        const avatar = circle.getAttribute('data-avatar');
        const storyImg = circle.getAttribute('data-story-image');
        const caption = circle.getAttribute('data-story-caption');
        
        // Setup details
        viewerAvatar.src = avatar;
        viewerUsername.textContent = username;
        viewerUserLink.href = `/users/${username}`;
        viewerImage.src = storyImg;
        viewerCaption.textContent = caption || '';
        
        // Open Modal
        storyViewer.style.display = 'flex';
        
        // Launch timeline physics
        startStoryTimeline();
      });
    });

    // Close button modal controls
    const closeStoryBtn = storyViewer.querySelector('.draggable-close-btn');
    if (closeStoryBtn) {
      closeStoryBtn.addEventListener('click', closeStoryPlayer);
    }

    function startStoryTimeline() {
      elapsed = 0;
      isPaused = false;
      startTime = Date.now();
      progressBarFill.style.width = '0%';
      
      animateStory();
    }

    function animateStory() {
      if (isPaused) {
        startTime = Date.now() - elapsed; // adjust start time while paused
      } else {
        elapsed = Date.now() - startTime;
      }
      
      const pct = Math.min((elapsed / storyDuration) * 100, 100);
      progressBarFill.style.width = `${pct}%`;
      
      if (elapsed >= storyDuration) {
        closeStoryPlayer();
      } else {
        animationFrameId = requestAnimationFrame(animateStory);
      }
    }

    function closeStoryPlayer() {
      cancelAnimationFrame(animationFrameId);
      storyViewer.style.display = 'none';
      progressBarFill.style.width = '0%';
    }

    // Touch/Press Hold to Pause functionality
    const mediaContainer = storyViewer.querySelector('.story-viewer-media');
    
    if (mediaContainer) {
      const handlePressStart = () => {
        isPaused = true;
      };
      
      const handlePressEnd = () => {
        isPaused = false;
        startTime = Date.now() - elapsed; // sync clock
      };
      
      mediaContainer.addEventListener('mousedown', handlePressStart);
      mediaContainer.addEventListener('mouseup', handlePressEnd);
      mediaContainer.addEventListener('touchstart', handlePressStart);
      mediaContainer.addEventListener('touchend', handlePressEnd);
    }
  }

  function setNotificationBadge(count) {
    [document.getElementById('header-notif-badge'), document.getElementById('dropdown-notif-badge')].forEach(el => {
      if (!el) return;
      el.textContent = count > 9 ? '9+' : count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  window.loadNotificationDropdown = async function() {
    const box = document.getElementById('notification-dropdown-content');
    if (!box) return;
    try {
      const res = await fetch('/notifications/api');
      if (!res.ok) return;
      const data = await res.json();
      box.innerHTML = '';
      if (!data.notifications.length) {
        box.innerHTML = '<p style="padding:20px;text-align:center;color:var(--text-muted)">No notifications yet.</p>';
      } else {
        data.notifications.forEach(n => {
          const card = document.createElement('div');
          card.className = `notification-card ${n.type}`;
          card.innerHTML = `<img class="notification-avatar" src="${n.sender.profilePicture}"><div class="notification-text-meta"><h6>${escapeHtml(n.message)}</h6><p>${new Date(n.createdAt).toLocaleString()}</p></div>`;
          box.appendChild(card);
        });
      }
      setNotificationBadge(data.unreadCount);
    } catch (err) { console.error(err); }
  };

  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.postId;
      const saved = btn.classList.contains('saved');
      const res = await fetch(saved ? `/unbookmark/${postId}` : `/bookmark/${postId}`, { method: 'POST' });
      if (res.ok) {
        btn.classList.toggle('saved');
        const nowSaved = !saved;
        btn.querySelector('svg')?.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
        const label = btn.querySelector('span');
        if (label) label.textContent = nowSaved ? 'Saved' : 'Save';
        spawnToast(nowSaved ? 'Saved' : 'Removed', nowSaved ? 'Post bookmarked' : 'Bookmark removed', 'cyan');
      }
    });
  });

  document.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this post permanently?')) return;
      const res = await fetch(`/post/${btn.dataset.postId}`, { method: 'DELETE' });
      if (res.ok) { btn.closest('.post-card')?.remove(); spawnToast('Deleted', 'Post removed', 'pink'); }
    });
  });

  const viewedPosts = new Set();
  document.querySelectorAll('.post-card[data-post-id]').forEach(card => {
    const postId = card.dataset.postId;
    new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !viewedPosts.has(postId)) {
        viewedPosts.add(postId);
        const res = await fetch(`/posts/${postId}/view`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          const el = card.querySelector('.views-count-num');
          if (el) el.textContent = data.views;
        }
      }
    }, { threshold: 0.5 }).observe(card);
  });

  async function toggleFollow(btn) {
    const userId = btn.dataset.userId;
    const following = btn.dataset.following === 'true';
    const res = await fetch(following ? `/unfollow/${userId}` : `/follow/${userId}`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      btn.dataset.following = data.following ? 'true' : 'false';
      btn.textContent = data.following ? 'Following' : 'Follow';
      btn.classList.toggle('following-btn', data.following);
      const fc = document.getElementById('followers-count');
      if (fc) fc.textContent = data.followersCount;
      spawnToast(data.following ? 'Following' : 'Unfollowed', '', 'cyan');
      if (data.following && btn.classList.contains('sidebar-follow-btn')) {
        btn.closest('.follow-item')?.remove();
      }
    }
  }

  const followBtn = document.getElementById('follow-btn');
  if (followBtn) followBtn.addEventListener('click', () => toggleFollow(followBtn));

  document.querySelectorAll('.sidebar-follow-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleFollow(btn);
    });
  });

  document.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const res = await fetch(`/notifications/read/${btn.dataset.id}`, { method: 'POST' });
      if (res.ok) { btn.closest('.notification-card')?.classList.remove('unread'); btn.remove(); }
    });
  });
  document.getElementById('mark-all-read-btn')?.addEventListener('click', async () => {
    await fetch('/notifications/read-all', { method: 'POST' });
    document.querySelectorAll('.notification-card.unread').forEach(c => c.classList.remove('unread'));
    document.querySelectorAll('.mark-read-btn').forEach(b => b.remove());
    setNotificationBadge(0);
  });

  const globalInput = document.querySelector('.global-search-input');
  const globalSuggest = document.getElementById('global-search-suggestions');
  if (globalInput && globalSuggest) {
    let t;
    globalInput.addEventListener('input', () => {
      clearTimeout(t);
      const q = globalInput.value.trim();
      if (!q) { globalSuggest.style.display = 'none'; return; }
      t = setTimeout(async () => {
        const res = await fetch(`/search/suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        globalSuggest.innerHTML = '';
        data.users.forEach(u => {
          const a = document.createElement('a');
          a.href = `/users/${u.username}`;
          a.className = 'search-user-item';
          a.innerHTML = `<div class="search-user-meta"><h5>@${u.username}</h5></div>`;
          globalSuggest.appendChild(a);
        });
        globalSuggest.style.display = globalSuggest.children.length ? 'flex' : 'none';
      }, 300);
    });
  }

  loadNotificationDropdown();

  // --- 8. PROFILE EDIT DRAWER MODAL CONFIGS ---
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const editModal = document.getElementById('edit-profile-modal');
  const closeEditModalBtn = document.getElementById('close-edit-modal');
  
  if (editProfileBtn && editModal) {
    editProfileBtn.addEventListener('click', () => {
      editModal.style.display = 'flex';
    });
  }
  
  if (closeEditModalBtn && editModal) {
    closeEditModalBtn.addEventListener('click', () => {
      editModal.style.display = 'none';
    });
    
    // Close on overlay click
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        editModal.style.display = 'none';
      }
    });
  }

  // --- 9. 3D INTERACTIVE CARD TILT PHYSICS ENGINE ---
  const glassCards = document.querySelectorAll('.glass-panel');
  
  if (window.matchMedia('(pointer: fine)').matches) { // Only run 3D tilts on devices with pointer/mouse
    glassCards.forEach(card => {
      // Skip modals and full story viewer to prevent visual clipping
      if (card.id === 'edit-profile-modal' || card.id === 'story-viewer-modal' || card.classList.contains('ai-caption-card')) {
        return;
      }
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Calculate relative position from card center (-1 to 1)
        const relX = ((e.clientX - rect.left) / width - 0.5) * 2;
        const relY = ((e.clientY - rect.top) / height - 0.5) * 2;
        
        // Apply 3D rotation (max 10 degrees)
        const tiltX = -relY * 10;
        const tiltY = relX * 10;
        
        // Smooth responsive transform update (no translateZ on the card itself to prevent click hitbox displacement)
        card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.01)`;
      });
      
      card.addEventListener('mouseleave', () => {
        // Smoothly transition card back to flat alignment
        card.style.transition = 'transform 0.4s ease-out, box-shadow 0.3s ease';
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      });
    });
  }
});

