/**
 * 预览渲染模块 - 处理 Markdown 渲染、数学公式和图表
 */
const Preview = {
  elements: {},

  /**
   * 初始化
   */
  init() {
    this.elements = {
      preview: document.getElementById('preview'),
      previewSource: document.getElementById('preview-source'),
      editor: document.getElementById('editor')
    };
  },

  /**
   * 更新预览
   */
  update() {
    let text = this.elements.editor.value;
    let placeholders = [];

    // 保护数学公式不被 marked 处理
    if (typeof renderMathInElement !== 'undefined') {
      const protected = this.protectMath(text);
      text = protected.text;
      placeholders = protected.placeholders;
    }

    let html = '';
    if (typeof marked !== 'undefined') {
      html = marked.parse(text);
    } else {
      html = '<pre style="white-space:pre-wrap">' + this.escapeHtml(text) + '</pre>';
    }

    // 恢复数学公式
    if (placeholders.length) {
      html = this.restoreMath(html, placeholders);
    }

    this.elements.preview.innerHTML = '<div class="markdown-body">' + html + '</div>';
    this.styleTaskLists();

    // 渲染 KaTeX
    if (typeof renderMathInElement !== 'undefined') {
      renderMathInElement(this.elements.preview, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }

    this.renderMermaidBlocks();
  },

  /**
   * 保护数学公式（避免被 marked 处理）
   */
  protectMath(text) {
    const placeholders = [];
    let counter = 0;

    const parts = text.split(/(```[\s\S]*?```|`[^`\n]*`)/g);
    const out = parts.map(part => {
      if (part.startsWith('```') || part.startsWith('`')) return part;

      part = part.replace(/\$\$[\s\S]*?\$\$/g, m => this.store(m, placeholders, counter++));
      part = part.replace(/(^|[^\\])\$([^$\n]+?)\$/g, (m, p1) => p1 + this.store(m.slice(p1.length), placeholders, counter++));

      return part;
    }).join('');

    return { text: out, placeholders };
  },

  store(match, placeholders, counter) {
    const key = '<!--MATH' + counter + '-->';
    placeholders.push({ key, value: match });
    return key;
  },

  restoreMath(html, placeholders) {
    placeholders.forEach(({ key, value }) => {
      html = html.split(key).join(value);
    });
    return html;
  },

  /**
   * 转义 HTML 特殊字符
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 样式化任务列表
   */
  styleTaskLists() {
    this.elements.preview.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const li = cb.closest('li');
      if (!li) return;
      li.classList.add('task-item');
      const ul = li.closest('ul, ol');
      if (ul && ul.tagName === 'UL') ul.classList.add('task-list');
    });
  },

  /**
   * 渲染 Mermaid 图表
   */
  renderMermaidBlocks() {
    if (typeof mermaid === 'undefined') return;
    const blocks = this.elements.preview.querySelectorAll('.markdown-body pre code.language-mermaid');
    if (!blocks.length) return;
    
    blocks.forEach(code => {
      const pre = code.parentElement;
      const source = code.textContent.trim();
      if (!source) return;
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = source;
      pre.replaceWith(container);
    });
    
    try {
      mermaid.run({ querySelector: '.markdown-body .mermaid' });
    } catch (err) {
      console.error('Mermaid render error:', err);
    }
  },

  /**
   * 设置预览模式
   */
  setMode(mode) {
    if (mode === 'preview') {
      this.elements.preview.style.display = '';
      this.elements.previewSource.style.display = 'none';
      this.update();
    } else {
      this.elements.previewSource.value = this.elements.editor.value;
      this.elements.preview.style.display = 'none';
      this.elements.previewSource.style.display = 'block';
      this.elements.previewSource.focus();
    }
  }
};

window.Preview = Preview;
