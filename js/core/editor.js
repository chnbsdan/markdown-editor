/**
 * 编辑器核心模块 - 管理编辑器的内容、历史、选区操作
 */
const Editor = {
  // DOM 元素引用
  elements: {},
  
  // 历史记录
  history: {
    stack: [],
    index: -1,
    lastText: null,
    timer: null,
    maxSize: 100
  },

  /**
   * 初始化编辑器
   */
  init() {
    this.elements = {
      editor: document.getElementById('editor'),
      previewSource: document.getElementById('preview-source'),
      filename: document.getElementById('filename'),
      wordCount: document.getElementById('word-count'),
      preview: document.getElementById('preview'),
      saveHint: document.getElementById('save-hint'),
      toast: document.getElementById('toast')
    };
  },

  /**
   * 获取当前活动的编辑器（主编辑器或源码模式下的预览区）
   */
  getActiveEditor() {
    if (window.previewMode === 'source' && document.activeElement === this.elements.previewSource) {
      return this.elements.previewSource;
    }
    return this.elements.editor;
  },

  /**
   * 同步编辑器内容（当在源码模式下编辑时，同步到主编辑器）
   */
  syncFromActive() {
    const el = this.getActiveEditor();
    if (el === this.elements.previewSource) {
      this.elements.editor.value = this.elements.previewSource.value;
    } else if (window.previewMode === 'source') {
      this.elements.previewSource.value = this.elements.editor.value;
    }
  },

  /**
   * 获取当前内容
   */
  getContent() {
    return this.elements.editor.value;
  },

  /**
   * 设置内容
   */
  setContent(text) {
    this.elements.editor.value = text;
    if (window.previewMode === 'source') {
      this.elements.previewSource.value = text;
    }
  },

  /**
   * 获取文件名
   */
  getFilename() {
    return this.elements.filename.value.trim() || '未命名文档.md';
  },

  /**
   * 设置文件名
   */
  setFilename(name) {
    this.elements.filename.value = name;
  },

  /**
   * 统计字数
   */
  countWords() {
    const text = this.elements.editor.value;
    const count = text.replace(/\s/g, '').length;
    return count;
  },

  /**
   * 更新字数显示
   */
  updateWordCount() {
    const count = this.countWords();
    if (typeof t === 'function') {
      this.elements.wordCount.textContent = t('wordCount', count);
    } else {
      this.elements.wordCount.textContent = count + ' 字';
    }
  },

  /**
   * 显示保存提示
   */
  showSaveHint() {
    const hint = this.elements.saveHint;
    if (typeof t === 'function') {
      hint.textContent = '✓ ' + t('saved');
    } else {
      hint.textContent = '✓ 已保存';
    }
    hint.classList.add('show');
    clearTimeout(this.saveHintTimer);
    this.saveHintTimer = setTimeout(() => hint.classList.remove('show'), 1500);
  },

  // ==================== 历史记录 ====================
  
  /**
   * 推送历史记录
   */
  pushHistory() {
    clearTimeout(this.history.timer);
    this.history.timer = setTimeout(() => this.recordHistory(), 400);
  },

  /**
   * 记录历史
   */
  recordHistory() {
    const text = this.elements.editor.value;
    if (text === this.history.lastText) return;
    this.history.stack = this.history.stack.slice(0, this.history.index + 1);
    this.history.stack.push(text);
    if (this.history.stack.length > this.history.maxSize) {
      this.history.stack.shift();
    }
    this.history.index = this.history.stack.length - 1;
    this.history.lastText = text;
  },

  /**
   * 撤销
   */
  undo() {
    if (this.history.index <= 0) return;
    this.history.index--;
    this.elements.editor.value = this.history.stack[this.history.index];
    this.history.lastText = this.elements.editor.value;
    if (window.previewMode === 'source') {
      this.elements.previewSource.value = this.elements.editor.value;
    }
    this.updatePreviewAndCount();
    this.getActiveEditor().focus();
    if (typeof showToast === 'function') {
      showToast(typeof t === 'function' ? t('toastUndone') : '已撤销');
    }
  },

  /**
   * 重做
   */
  redo() {
    if (this.history.index >= this.history.stack.length - 1) return;
    this.history.index++;
    this.elements.editor.value = this.history.stack[this.history.index];
    this.history.lastText = this.elements.editor.value;
    if (window.previewMode === 'source') {
      this.elements.previewSource.value = this.elements.editor.value;
    }
    this.updatePreviewAndCount();
    this.getActiveEditor().focus();
    if (typeof showToast === 'function') {
      showToast(typeof t === 'function' ? t('toastRedone') : '已重做');
    }
  },

  /**
   * 更新预览和字数
   */
  updatePreviewAndCount() {
    if (typeof updatePreview === 'function') {
      updatePreview();
    }
    this.updateWordCount();
    if (typeof autoSave === 'function') {
      autoSave();
    }
  },

  // ==================== 选区操作 ====================
  
  /**
   * 包裹选中文本
   */
  wrapSelection(before, after) {
    const el = this.getActiveEditor();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.slice(start, end);
    el.setRangeText(before + selected + after, start, end, 'select');
    this.syncFromActive();
    this.updatePreviewAndCount();
    el.focus();
  },

  /**
   * 为选中的行添加前缀
   */
  prefixLines(prefix) {
    const el = this.getActiveEditor();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = el.value.slice(0, start);
    const selected = el.value.slice(start, end) || '内容';
    const firstLineStart = before.lastIndexOf('\n') + 1;
    const lines = selected.split('\n');
    const prefixed = lines.map(line => (line ? prefix + line : line)).join('\n');
    el.setRangeText(prefixed, firstLineStart, end, 'end');
    this.syncFromActive();
    this.updatePreviewAndCount();
    el.focus();
  },

  /**
   * 插入内容到光标位置
   */
  insertAtCursor(text) {
    const el = this.getActiveEditor();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    el.setRangeText(text, start, end, 'end');
    this.syncFromActive();
    this.updatePreviewAndCount();
    el.focus();
  }
};

window.Editor = Editor;
