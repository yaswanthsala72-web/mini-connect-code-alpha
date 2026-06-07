document.addEventListener('DOMContentLoaded', () => {
  if (!window.dashboardData || typeof Chart === 'undefined') return;
  const { likesGrowth, followersGrowth, engagementTrend, postPerformance } = window.dashboardData;
  const chartOpts = {
    responsive: true,
    plugins: { legend: { labels: { color: '#a0aec0' } } },
    scales: {
      x: { ticks: { color: '#a0aec0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#a0aec0' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  new Chart(document.getElementById('likesChart'), {
    type: 'line',
    data: {
      labels: likesGrowth.map(d => d.date),
      datasets: [{ label: 'Likes', data: likesGrowth.map(d => d.count), borderColor: '#00f0ff', backgroundColor: 'rgba(0,240,255,0.1)', fill: true, tension: 0.4 }]
    },
    options: chartOpts
  });

  new Chart(document.getElementById('followersChart'), {
    type: 'bar',
    data: {
      labels: followersGrowth.map(d => d.date),
      datasets: [{ label: 'Followers', data: followersGrowth.map(d => d.count), backgroundColor: 'rgba(189,0,255,0.6)' }]
    },
    options: chartOpts
  });

  new Chart(document.getElementById('engagementChart'), {
    type: 'line',
    data: {
      labels: engagementTrend.map(d => d.date),
      datasets: [{ label: 'Engagement %', data: engagementTrend.map(d => d.rate), borderColor: '#ff007f', tension: 0.4 }]
    },
    options: chartOpts
  });

  new Chart(document.getElementById('performanceChart'), {
    type: 'bar',
    data: {
      labels: postPerformance.map(p => p.label),
      datasets: [
        { label: 'Likes', data: postPerformance.map(p => p.likes), backgroundColor: '#bd00ff' },
        { label: 'Comments', data: postPerformance.map(p => p.comments), backgroundColor: '#00f0ff' },
        { label: 'Views', data: postPerformance.map(p => p.views), backgroundColor: '#ff007f' }
      ]
    },
    options: chartOpts
  });
});
