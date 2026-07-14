/**
 * 模态框模块 - 管理所有模态框
 */
const Modal = {
  fetchedHtml: '',
  pendingImageDataUrl: '',
  currentLang: 'zh-CN',

  // ==================== 帮助 ====================
  
  openHelp() {
    this.showModal('help-modal');
  },

  closeHelp() {
    this.hideModal('help-modal');
    Storage.saveHelpShown();
  },

  // ==================== 网页转 MD ====================
  
  openUrlModal() {
    this.showModal('url-modal');
    document.getElementById('url-input').value = '';
    document.getElementById('url-status').textContent = '';
    document.getElementById('manual-area').style.display = 'none';
    document.getElementById('manual-html').value = '';
    document.getElementById('use-local-proxy').checked = false;
    document.getElementById('proxy-url').style.display = 'none';
    this.fetchedHtml = '';
  },

  closeUrlModal() {
    this.hideModal('url-modal');
    this.fetchedHtml = '';
  },

  toggleProxyInput() {
    const checked = document.getElementById('use-local-proxy').checked;
    document.getElementById('proxy-url').style.display = checked ? 'block' : 'none';
  },

  async fetchUrl() {
    const urlInput = document.getElementById('url-input');
    const status = document.getElementById('url-status');
    const manualArea = document.getElementById('manual-area');
    const useLocalProxy = document.getElementById('use-local-proxy').checked;
    const proxyUrlInput = document.getElementById('proxy-url');
    const url = urlInput.value.trim();

    if (!url) {
      status.textContent = '请输入网页地址';
      status.style.color = 'var(--danger)';
      return;
    }

    status.textContent = '正在获取网页内容...';
    status.style.color = 'var(--text-muted)';
    this.fetchedHtml = '';

    if (useLocalProxy) {
      const proxyUrl = (proxyUrlInput.value.trim() || 'http://localhost:8765/fetch') + '?url=' + encodeURIComponent(url);
      let data = null;
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Local proxy response not ok');
        data = await response.json();
        if (data.success === false) {
          throw new Error(data.error || 'Unknown proxy error');
        }
        this.fetchedHtml = data.html || data.content || '';
        if (!this.fetchedHtml) throw new Error('Local proxy returned empty content');
        status.textContent = '✅ 获取成功（本地代理）';
        status.style.color = 'var(--accent)';
        manualArea.style.display = 'none';
        return;
      } catch (err) {
        const hint = data?.hint ? data.hint : '';
        status.innerHTML = '❌ 本地代理获取失败: ' + err.message + (hint ? '<br><small>' + hint + '</small>' : '');
        status.style.color = 'var(--danger)';
        manualArea.style.display = 'block';
        return;
      }
    }

    // 公共代理
    const proxies = [
      { url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url), type: 'text' },
      { url: 'https://api.allorigins.win/get?url=' + encodeURIComponent(url), type: 'json', field: 'contents' },
      { url: 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url), type: 'text' }
    ];

    let lastError = '';
    for (const proxy of proxies) {
      try {
        const response = await fetch(proxy.url);
        if (!response.ok) throw new Error('Proxy response not ok');
        let text;
        if (proxy.type === 'json') {
          const data = await response.json();
          text = data[proxy.field];
          if (typeof text === 'string' && /^[A-Za-z0-9+/=]+$/.test(text) && text.length % 4 === 0) {
            try { text = atob(text); } catch (e) {}
          }
        } else {
          text = await response.text();
        }
        if (!text || text.length < 100) throw new Error('Content too short');
        this.fetchedHtml = text;
        status.textContent = '✅ 获取成功（公共代理）';
        status.style.color = 'var(--accent)';
        manualArea.style.display = 'none';
        return;
      } catch (err) {
        lastError = err.message;
      }
    }

    status.textContent = '❌ 所有代理均失败: ' + lastError;
    status.style.color = 'var(--danger)';
    manualArea.style.display = 'block';
  },

  convertAndInsert() {
    const manualHtml = document.getElementById('manual-html').value.trim();
    const html = this.fetchedHtml || manualHtml;
    if (!html) {
      if (typeof showToast === 'function') showToast('没有可转换的内容');
      return;
    }
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const meta = this.extractMeta(doc);
      const main = this.extractMainContent(doc);
      const cleaned = this.stripUnwantedElements(main.cloneNode(true));
      let bodyMd = this.htmlToMarkdown(cleaned).replace(/\n{3,}/g, '\n\n').trim();

      if (meta.title && bodyMd.toLowerCase().startsWith('# ' + meta.title.toLowerCase())) {
        bodyMd = bodyMd.replace(/^#\s+.+\n+/, '');
      }

      let markdown = '';
      if (meta.title) markdown += '# ' + meta.title + '\n\n';
      const metaParts = [];
      if (meta.author) metaParts.push('作者：' + meta.author);
      if (meta.published) metaParts.push('发布时间：' + meta.published);
      if (metaParts.length) markdown += '> ' + metaParts.join(' | ') + '\n\n';
      markdown += bodyMd;
      markdown = markdown.trim();

      if (!markdown) {
        if (typeof showToast === 'function') showToast('提取网页内容失败');
        return;
      }

      if (!Editor.getContent().trim()) {
        Editor.setContent(markdown);
      } else {
        Editor.setContent(Editor.getContent() + '\n\n' + markdown);
      }

      if (window.previewMode === 'source') {
        document.getElementById('preview-source').value = Editor.getContent();
      }
      Preview.update();
      Editor.updateWordCount();
      if (typeof saveToLocal === 'function') saveToLocal();
      this.closeUrlModal();
      if (typeof showToast === 'function') showToast('已插入 Markdown');
    } catch (err) {
      if (typeof showToast === 'function') showToast('转换失败: ' + err.message);
    }
  },

  extractMeta(doc) {
    return {
      title: (doc.querySelector('title')?.textContent?.trim()) || (doc.querySelector('h1')?.textContent?.trim()) || '',
      author: (doc.querySelector('meta[name="author"]')?.content?.trim()) ||
              (doc.querySelector('meta[property="article:author"]')?.content?.trim()) ||
              (doc.querySelector('[rel="author"]')?.textContent?.trim()) || '',
      published: (doc.querySelector('meta[property="article:published_time"]')?.content?.trim()) ||
                 (doc.querySelector('meta[name="publishdate"]')?.content?.trim()) ||
                 (doc.querySelector('meta[name="date"]')?.content?.trim()) ||
                 (doc.querySelector('time')?.dateTime?.trim()) ||
                 (doc.querySelector('time')?.textContent?.trim()) || ''
    };
  },

  extractMainContent(doc) {
    const selectors = ['article', '[role="main"]', '.post-content', '.entry-content', '.article-content', '.content', '#content', 'main'];
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el) return el;
    }
    return doc.body;
  },

  stripUnwantedElements(root) {
    const selectors = 'script, style, nav, aside, header, footer, form, iframe, img, svg, video, audio, canvas, .ad, .ads, .advertisement, .sidebar, .comments, .comment, #comments, [class*="ad-"], [class*="ads-"], [id*="ad-"], [class*="comment"], [id*="comment"]';
    root.querySelectorAll(selectors).forEach(el => el.remove());
    return root;
  },

  htmlToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.replace(/\s+/g, ' ');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(n => this.htmlToMarkdown(n)).join('');
    switch (tag) {
      case 'h1': return '# ' + children.trim() + '\n\n';
      case 'h2': return '## ' + children.trim() + '\n\n';
      case 'h3': return '### ' + children.trim() + '\n\n';
      case 'h4': return '#### ' + children.trim() + '\n\n';
      case 'h5': return '##### ' + children.trim() + '\n\n';
      case 'h6': return '###### ' + children.trim() + '\n\n';
      case 'p': return children.trim() + '\n\n';
      case 'br': return '\n';
      case 'a': {
        const href = node.getAttribute('href') || '';
        return '[' + children + '](' + href + ')';
      }
      case 'strong':
      case 'b': return '**' + children + '**';
      case 'em':
      case 'i': return '*' + children + '*';
      case 'code': return '`' + children + '`';
      case 'pre': {
        const code = node.querySelector('code');
        if (code) {
          let lang = '';
          const cls = code.className || '';
          const m = cls.match(/language-(\w+)/);
          if (m) lang = m[1];
          return '\n```' + lang + '\n' + code.textContent.trim() + '\n```\n\n';
        }
        return '\n```\n' + children.trim() + '\n```\n\n';
      }
      case 'ul': return Array.from(node.children).map(li => '- ' + this.htmlToMarkdown(li).trim()).join('\n') + '\n\n';
      case 'ol': return Array.from(node.children).map((li, idx) => (idx + 1) + '. ' + this.htmlToMarkdown(li).trim()).join('\n') + '\n\n';
      case 'li': return children.trim();
      case 'blockquote': return '> ' + children.trim().replace(/\n/g, '\n> ') + '\n\n';
      case 'hr': return '---\n\n';
      case 'table': return this.convertTable(node);
      case 'div':
      case 'figure':
      case 'section': return children.trim() + '\n\n';
      default: return children;
    }
  },

  convertTable(table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (!rows.length) return '';
    let md = '\n';
    rows.forEach((tr, i) => {
      const cells = Array.from(tr.querySelectorAll('td, th')).map(td => {
        return this.htmlToMarkdown(td).trim().replace(/\|/g, '\\|');
      });
      if (cells.length) {
        md += '| ' + cells.join(' | ') + ' |\n';
        if (i === 0) {
          md += '|' + cells.map(() => '---').join('|') + '|\n';
        }
      }
    });
    return md + '\n';
  },

  // ==================== 查找与替换 ====================
  
  findIndex: 0,

  openFindModal() {
    this.showModal('find-modal');
    const findInput = document.getElementById('find-input');
    const el = Editor.getActiveEditor();
    if (el.selectionStart !== el.selectionEnd) {
      findInput.value = el.value.slice(el.selectionStart, el.selectionEnd);
    }
    document.getElementById('find-status').textContent = '';
    findInput.focus();
    findInput.select();
    this.findIndex = 0;
  },

  closeFindModal() {
    this.hideModal('find-modal');
    document.getElementById('find-status').textContent = '';
  },

  findNext() {
    const query = document.getElementById('find-input').value;
    const status = document.getElementById('find-status');
    const el = Editor.getActiveEditor();
    if (!query) {
      status.textContent = '';
      return;
    }
    const text = el.value;
    let pos = text.indexOf(query, this.findIndex);
    if (pos === -1) {
      pos = text.indexOf(query, 0);
    }
    if (pos === -1) {
      status.textContent = '未找到匹配项';
      return;
    }
    this.findIndex = pos + query.length;
    el.setSelectionRange(pos, this.findIndex);
    el.focus();
    status.textContent = '已找到匹配项';
  },

  replaceOne() {
    const query = document.getElementById('find-input').value;
    const replacement = document.getElementById('replace-input').value;
    const status = document.getElementById('find-status');
    const el = Editor.getActiveEditor();
    if (!query) {
      status.textContent = '';
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end);
    if (selected !== query) {
      this.findNext();
      return;
    }
    el.setRangeText(replacement, start, end, 'end');
    Editor.syncFromActive();
    this.findIndex = start + replacement.length;
    Preview.update();
    Editor.updateWordCount();
    if (typeof autoSave === 'function') autoSave();
    this.findNext();
  },

  replaceAll() {
    const query = document.getElementById('find-input').value;
    const replacement = document.getElementById('replace-input').value;
    const status = document.getElementById('find-status');
    const el = Editor.getActiveEditor();
    if (!query) {
      status.textContent = '';
      return;
    }
    let count = 0;
    let text = el.value;
    let pos = text.indexOf(query);
    while (pos !== -1) {
      count++;
      text = text.slice(0, pos) + replacement + text.slice(pos + query.length);
      pos = text.indexOf(query, pos + replacement.length);
    }
    if (count > 0) {
      el.value = text;
      Editor.syncFromActive();
      this.findIndex = 0;
      Preview.update();
      Editor.updateWordCount();
      if (typeof autoSave === 'function') autoSave();
    }
    status.textContent = count > 0 ? '已替换 ' + count + ' 处' : '未找到匹配项';
  },

  // ==================== 图片 ====================
  
  openImageModal() {
    this.pendingImageDataUrl = '';
    document.getElementById('image-url-input').value = '';
    document.getElementById('image-url-alt').value = '';
    document.getElementById('image-upload-alt').value = '';
    document.getElementById('image-upload-preview').innerHTML = '';
    document.getElementById('image-file-input').value = '';
    this.switchImageTab('url');
    this.showModal('image-modal');
  },

  closeImageModal() {
    this.hideModal('image-modal');
    this.pendingImageDataUrl = '';
  },

  switchImageTab(tab) {
    document.querySelectorAll('.image-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.image-tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === 'image-tab-' + tab);
    });
  },

  handleImageFileSelect(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (typeof showToast === 'function') showToast('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (typeof showToast === 'function') showToast('图片文件过大（超过5MB）');
      this.pendingImageDataUrl = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      if (!confirm('图片大小 ' + (file.size / 1024 / 1024).toFixed(1) + 'MB，较大可能影响性能，确定继续吗？')) {
        this.pendingImageDataUrl = '';
        return;
      }
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.pendingImageDataUrl = e.target.result;
      document.getElementById('image-upload-preview').innerHTML = '<img src="' + this.pendingImageDataUrl + '" alt="导出预览">';
      this.switchImageTab('upload');
    };
    reader.onerror = () => {
      if (typeof showToast === 'function') showToast('图片读取失败');
    };
    reader.readAsDataURL(file);
  },

  confirmImageInsert() {
    const activeTab = document.querySelector('.image-tab.active').dataset.tab;
    let url = '';
    let alt = '';
    if (activeTab === 'url') {
      url = document.getElementById('image-url-input').value.trim();
      alt = document.getElementById('image-url-alt').value.trim();
      if (!url) {
        if (typeof showToast === 'function') showToast('请输入图片链接');
        return;
      }
    } else {
      url = this.pendingImageDataUrl;
      alt = document.getElementById('image-upload-alt').value.trim();
      if (!url) {
        if (typeof showToast === 'function') showToast('请先选择一张图片');
        return;
      }
    }
    this.insertImageMarkdown(alt || '图片', url);
    this.closeImageModal();
  },

  insertImageMarkdown(alt, url) {
    Editor.pushHistory();
    const safeAlt = String(alt).replace(/\]/g, '\\]');
    const el = Editor.getActiveEditor();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    el.setRangeText('![' + (safeAlt || '图片') + '](' + url + ')', start, end, 'end');
    Editor.syncFromActive();
    Preview.update();
    Editor.updateWordCount();
    if (typeof autoSave === 'function') autoSave();
    el.focus();
  },

  // ==================== Mermaid ====================
  
  MERMAID_TEMPLATES: {
    mindmap: 'mindmap\n  root((主题))\n    子主题 A\n      子节点 A1\n      子节点 A2\n    子主题 B\n      子节点 B1',
    flowchart: 'flowchart TD\n    A[开始] --> B{判断}\n    B -->|是| C[执行]\n    B -->|否| D[结束]'
  },

  openMermaidModal() {
    document.getElementById('mermaid-type').value = 'mindmap';
    this.updateMermaidTemplate();
    this.showModal('mermaid-modal');
  },

  closeMermaidModal() {
    this.hideModal('mermaid-modal');
  },

  updateMermaidTemplate() {
    const type = document.getElementById('mermaid-type').value;
    document.getElementById('mermaid-code').value = this.MERMAID_TEMPLATES[type] || this.MERMAID_TEMPLATES.mindmap;
  },

  confirmMermaidInsert() {
    const code = document.getElementById('mermaid-code').value.trim();
    if (!code) {
      if (typeof showToast === 'function') showToast('请输入 Mermaid 图表代码');
      return;
    }
    Editor.pushHistory();
    const fenced = '\n```mermaid\n' + code + '\n```\n\n';
    Editor.insertAtCursor(fenced);
    this.closeMermaidModal();
    if (typeof showToast === 'function') showToast('Mermaid 图表已插入');
  },

  // ==================== 通用 ====================
  
  showModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'flex';
    void el.offsetWidth;
    el.classList.add('show');
  },

  hideModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    setTimeout(() => {
      if (!el.classList.contains('show')) el.style.display = 'none';
    }, 200);
  }
};

// ==================== 暴露到全局 ====================
// 帮助
window.openHelp = Modal.openHelp.bind(Modal);
window.closeHelp = Modal.closeHelp.bind(Modal);

// 网页转 MD
window.openUrlModal = Modal.openUrlModal.bind(Modal);
window.closeUrlModal = Modal.closeUrlModal.bind(Modal);
window.toggleProxyInput = Modal.toggleProxyInput.bind(Modal);
window.fetchUrl = Modal.fetchUrl.bind(Modal);
window.convertAndInsert = Modal.convertAndInsert.bind(Modal);

// 查找与替换
window.openFindModal = Modal.openFindModal.bind(Modal);
window.closeFindModal = Modal.closeFindModal.bind(Modal);
window.findNext = Modal.findNext.bind(Modal);
window.replaceOne = Modal.replaceOne.bind(Modal);
window.replaceAll = Modal.replaceAll.bind(Modal);

// 图片
window.openImageModal = Modal.openImageModal.bind(Modal);
window.closeImageModal = Modal.closeImageModal.bind(Modal);
window.switchImageTab = Modal.switchImageTab.bind(Modal);
window.handleImageFileSelect = Modal.handleImageFileSelect.bind(Modal);
window.confirmImageInsert = Modal.confirmImageInsert.bind(Modal);

// Mermaid
window.openMermaidModal = Modal.openMermaidModal.bind(Modal);
window.closeMermaidModal = Modal.closeMermaidModal.bind(Modal);
window.updateMermaidTemplate = Modal.updateMermaidTemplate.bind(Modal);
window.confirmMermaidInsert = Modal.confirmMermaidInsert.bind(Modal);
