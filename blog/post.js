(function () {
  'use strict';

  function formatDate(str) {
    if (!str) return '';
    const [year, month] = str.split('-');
    return new Date(year, parseInt(month) - 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  // ── Minimal Markdown → HTML ───────────────────────────────────────────────
  // Handles: headings, bold, italic, inline code, code blocks, lists, blockquotes, paragraphs

  function mdToHtml(md) {
    const lines = md.split('\n');
    const out = [];
    let inCode = false, codeLang = '', codeLines = [];
    let listLines = [];

    function flushList() {
      if (!listLines.length) return;
      out.push('<ul>' + listLines.map(l => `<li>${inline(l.replace(/^[-*+]\s+/, ''))}</li>`).join('') + '</ul>');
      listLines = [];
    }

    function inline(s) {
      return s
        .replace(/`([^`]+)`/g, (_, c) => `<code>${esc(c)}</code>`)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,     '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // fenced code blocks
      if (line.startsWith('```')) {
        if (!inCode) {
          flushList();
          inCode = true;
          codeLang = line.slice(3).trim();
          codeLines = [];
        } else {
          out.push(`<pre><code${codeLang ? ` class="language-${esc(codeLang)}"` : ''}>${esc(codeLines.join('\n'))}</code></pre>`);
          inCode = false; codeLang = ''; codeLines = [];
        }
        continue;
      }
      if (inCode) { codeLines.push(line); continue; }

      // headings
      const hMatch = line.match(/^(#{1,3})\s+(.+)/);
      if (hMatch) {
        flushList();
        const level = hMatch[1].length;
        out.push(`<h${level}>${inline(hMatch[2])}</h${level}>`);
        continue;
      }

      // blockquote
      if (line.startsWith('> ')) {
        flushList();
        out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
        continue;
      }

      // unordered list
      if (/^[-*+]\s+/.test(line)) {
        listLines.push(line);
        continue;
      }

      // blank line
      if (line.trim() === '') {
        flushList();
        continue;
      }

      // paragraph
      flushList();
      out.push(`<p>${inline(line)}</p>`);
    }

    flushList();
    return out.join('\n');
  }

  // ── Theme ────────────────────────────────────────────────────────────────

  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
      btn.textContent = '☾';
    }
    btn.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark');
      btn.textContent = dark ? '☾' : '☀';
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  function render(meta, rawMd) {
    document.title = meta.title + ' — Blog';
    // strip the h1 from the md since we render it as page title
    const body = rawMd.replace(/^#\s+.+\n?/, '').trim();
    document.getElementById('post-main').innerHTML = `
      <h1 class="post-title">${esc(meta.title)}</h1>
      <div class="post-meta">
        <span>${formatDate(meta.date)}</span>
      </div>
      ${meta.tags && meta.tags.length
        ? `<div class="post-tags">${meta.tags.map(t => `<span class="post-tag">${esc(t)}</span>`).join('')}</div>`
        : ''}
      <div class="post-content">${mdToHtml(body)}</div>
    `;
  }

  function renderNotFound(slug) {
    document.getElementById('post-main').innerHTML =
      `<div class="not-found"><p>Post not found${slug ? ': ' + esc(slug) : ''}.</p><p><a href="../index.html">← Back to portfolio</a></p></div>`;
  }

  // ── Boot ─────────────────────────────────────────────────────────────────

  async function init() {
    initTheme();

    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug) { renderNotFound(''); return; }

    try {
      const indexRes = await fetch('posts.json');
      if (!indexRes.ok) throw new Error(`posts.json: HTTP ${indexRes.status}`);
      const posts = await indexRes.json();

      const meta = posts.find(p => p.slug === slug);
      if (!meta) { renderNotFound(slug); return; }

      const mdRes = await fetch(`posts/${slug}.md`);
      if (!mdRes.ok) throw new Error(`posts/${slug}.md: HTTP ${mdRes.status}`);
      const rawMd = await mdRes.text();

      render(meta, rawMd);
    } catch (err) {
      console.error(err);
      document.getElementById('post-main').innerHTML =
        `<div class="not-found"><p>Failed to load post: ${esc(err.message)}</p></div>`;
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
