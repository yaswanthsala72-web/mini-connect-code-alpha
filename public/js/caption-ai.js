document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('ai-caption-modal');
  const openBtns = document.querySelectorAll('.ai-caption-trigger');
  const closeBtn = document.getElementById('close-ai-modal');
  const generateBtn = document.getElementById('ai-generate-btn');
  const regenerateBtn = document.getElementById('ai-regenerate-btn');
  const results = document.getElementById('ai-results');
  const targetSelector = document.body.dataset.aiTarget || '#create-content, .composer-textarea';

  if (!modal) return;

  const getTargetTextarea = () => document.querySelector(targetSelector);

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
    });
  });

  closeBtn?.addEventListener('click', () => { modal.style.display = 'none'; });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

  async function generate() {
    const topic = document.getElementById('ai-topic')?.value.trim();
    if (!topic) { alert('Please enter a topic'); return; }

    const label = document.getElementById('ai-generate-label');
    if (label) label.textContent = 'Generating...';
    generateBtn.disabled = true;

    try {
      const res = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          keywords: document.getElementById('ai-keywords')?.value || '',
          mood: document.getElementById('ai-mood')?.value || 'creative',
          imageDescription: document.getElementById('ai-image-desc')?.value || ''
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      document.getElementById('ai-creative').textContent = data.creative;
      document.getElementById('ai-professional').textContent = data.professional;
      document.getElementById('ai-short').textContent = data.short;
      document.getElementById('ai-hashtags').textContent = (data.hashtags || []).join(' ');
      results.style.display = 'block';
    } catch (err) {
      alert(err.message);
    } finally {
      if (label) label.textContent = 'Generate Captions';
      generateBtn.disabled = false;
    }
  }

  generateBtn?.addEventListener('click', generate);
  regenerateBtn?.addEventListener('click', generate);

  document.querySelectorAll('.ai-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = document.getElementById(btn.dataset.target)?.textContent;
      if (text) navigator.clipboard.writeText(text);
    });
  });

  document.querySelectorAll('.ai-insert-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = document.getElementById(btn.dataset.target)?.textContent;
      const textarea = getTargetTextarea();
      if (textarea && text) {
        textarea.value = textarea.value ? `${textarea.value}\n\n${text}` : text;
        modal.style.display = 'none';
      }
    });
  });
});
