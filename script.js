(function () {
  'use strict';

  function formatDate(str) {
    if (!str) return '';
    const [year, month] = str.split('-');
    return new Date(year, parseInt(month) - 1)
      .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function empty(msg) {
    return `<p class="empty-state">${msg}</p>`;
  }

  // ── Theme toggle ─────────────────────────────────────────────────────────

  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.body.classList.add('dark');
      btn.textContent = '☾';
    }
    btn.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark');
      btn.textContent = dark ? '☾' : '☀';
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  // ── Tab navigation ────────────────────────────────────────────────────────

  function initNav() {
    const links  = document.querySelectorAll('.nav-link');
    const tabs   = document.querySelectorAll('.tab');
    const toggle = document.getElementById('nav-toggle');
    const menu   = document.getElementById('nav-links');

    function switchTab(id) {
      tabs.forEach(t  => t.classList.toggle('active', t.id === 'tab-' + id));
      links.forEach(l => l.classList.toggle('active', l.dataset.tab === id));
      menu.classList.remove('open');
      window.scrollTo(0, 0);
    }

    links.forEach(l => l.addEventListener('click', e => { e.preventDefault(); switchTab(l.dataset.tab); }));

    document.addEventListener('click', e => {
      const el = e.target.closest('a[data-tab]');
      if (el) { e.preventDefault(); switchTab(el.dataset.tab); }
    });

    toggle.addEventListener('click', () => menu.classList.toggle('open'));
  }

  // ── Home ──────────────────────────────────────────────────────────────────

  function renderHome(data) {
    const { meta, about, skills, education } = data;

    document.getElementById('nav-brand').textContent = meta.name || 'Portfolio';
    document.title = (meta.name || 'Portfolio') + ' — Portfolio';

    // hero
    document.getElementById('hero-name').textContent  = meta.name  || '';
    document.getElementById('hero-role').textContent  = meta.title || '';
    document.getElementById('hero-summary').textContent = about && about.summary ? about.summary : '';

    const linksEl = document.getElementById('hero-links');
    const parts = [];
    if (meta.email)    parts.push(`<a href="mailto:${esc(meta.email)}">${esc(meta.email)}</a>`);
    if (meta.linkedin) parts.push(`<a href="${esc(meta.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`);
    if (meta.github)   parts.push(`<a href="${esc(meta.github)}"   target="_blank" rel="noopener">GitHub</a>`);
    linksEl.innerHTML = parts.join('');

    // skills
    const skillsEl = document.getElementById('home-skills');
    if (skills && skills.length) {
      skillsEl.innerHTML = skills.map(cat => `
        <div class="skills-group">
          <div class="skills-label">${esc(cat.category)}</div>
          <div class="pills">${cat.items.map(i => `<span class="pill">${esc(i)}</span>`).join('')}</div>
        </div>
      `).join('');
    }

    // education
    const eduEl = document.getElementById('home-education');
    if (education && education.length) {
      eduEl.innerHTML = education.map(e => `
        <div class="edu-entry">
          <div class="edu-degree">${esc(e.degree)}${e.field ? ' in ' + esc(e.field) : ''}</div>
          <div class="edu-meta">${esc(e.institution)}${e.location ? ', ' + esc(e.location) : ''}</div>
          <div class="edu-meta">${formatDate(e.startDate)} – ${e.endDate ? formatDate(e.endDate) : 'Present'}</div>
        </div>
      `).join('');
    }
  }

  // ── Experience ────────────────────────────────────────────────────────────

  function renderExperience(experience) {
    const el = document.getElementById('experience-list');
    if (!experience || !experience.length) { el.innerHTML = empty('No experience listed.'); return; }
    el.innerHTML = experience.map(job => `
      <div class="exp-entry">
        <div class="exp-header">
          <span class="exp-position">${esc(job.position)}</span>
          <span class="exp-dates">${formatDate(job.startDate)} – ${job.current ? 'Present' : formatDate(job.endDate)}</span>
        </div>
        <div class="exp-company">${esc(job.company)}${job.location ? ', ' + esc(job.location) : ''}</div>
        ${job.description ? `<p class="exp-description">${esc(job.description)}</p>` : ''}
        ${job.highlights && job.highlights.length ? `<ul class="exp-highlights">${job.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('');
  }

  // ── Projects ──────────────────────────────────────────────────────────────

  function renderProjects(projects) {
    const el = document.getElementById('projects-list');
    if (!projects || !projects.length) { el.innerHTML = empty('No projects listed.'); return; }
    el.innerHTML = projects.map(p => `
      <div class="project-entry">
        <div class="project-header">
          <span class="project-name">${esc(p.name)}</span>
          <span class="project-links">
            ${p.url  ? `<a href="${esc(p.url)}"  target="_blank" rel="noopener">GitHub</a>` : ''}
            ${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">Live</a>`   : ''}
          </span>
        </div>
        <p class="project-desc">${esc(p.description)}</p>
        <div class="project-techs">${(p.technologies||[]).map(t => `<span class="project-tech">${esc(t)}</span>`).join('')}</div>
      </div>
    `).join('');
  }

// ── Blogs ─────────────────────────────────────────────────────────────────

  function renderBlogs(blogs) {
    const el = document.getElementById('blogs-list');
    if (!blogs || !blogs.length) {
      el.innerHTML = empty('No blog posts yet. Add them in data.json under "blogs".');
      return;
    }
    el.innerHTML = blogs.map(b => `
      <div class="blog-entry">
        <div class="blog-header">
          <span class="blog-title"><a href="blog/post.html?slug=${esc(b.slug)}">${esc(b.title)}</a></span>
          <span class="blog-date">${formatDate(b.date) || esc(b.date)}</span>
        </div>
        <p class="blog-summary">${esc(b.summary)}</p>
        <div class="blog-tags">${(b.tags||[]).map(t => `<span class="blog-tag">${esc(t)}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  // ── Contact ───────────────────────────────────────────────────────────────

  function renderContact(meta) {
    const el = document.getElementById('contact-content');
    const rows = [];
    if (meta.email)    rows.push(`<li><span class="contact-label">Email</span><a href="mailto:${esc(meta.email)}">${esc(meta.email)}</a></li>`);
    if (meta.phone)    rows.push(`<li><span class="contact-label">Phone</span><span>${esc(meta.phone)}</span></li>`);
    if (meta.location) rows.push(`<li><span class="contact-label">Location</span><span>${esc(meta.location)}</span></li>`);
    if (meta.linkedin) rows.push(`<li><span class="contact-label">LinkedIn</span><a href="${esc(meta.linkedin)}" target="_blank" rel="noopener">${esc(meta.linkedin)}</a></li>`);
    if (meta.github)   rows.push(`<li><span class="contact-label">GitHub</span><a href="${esc(meta.github)}" target="_blank" rel="noopener">${esc(meta.github)}</a></li>`);
    el.innerHTML = `<ul class="contact-list">${rows.join('')}</ul>`;
  }

  // ── Boot ──────────────────────────────────────────────────────────────────

  async function init() {
    try {
      const [dataRes, blogsRes] = await Promise.all([
        fetch('data.json'),
        fetch('blog/posts.json')
      ]);
      if (!dataRes.ok)  throw new Error(`data.json: HTTP ${dataRes.status}`);
      if (!blogsRes.ok) throw new Error(`blog/posts.json: HTTP ${blogsRes.status}`);

      const data  = await dataRes.json();
      const blogs = await blogsRes.json();

      initTheme();
      initNav();
      renderHome(data);
      renderExperience(data.experience);
      renderProjects(data.projects);
      renderBlogs(blogs);
      renderContact(data.meta);
    } catch (err) {
      console.error(err);
      document.getElementById('main').innerHTML =
        `<div class="container"><p style="color:#c00">Failed to load: ${err.message}.<br>Run a local server: <code>python3 -m http.server 8080</code></p></div>`;
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
