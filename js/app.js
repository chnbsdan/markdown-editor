/**
 * 应用入口 - 初始化所有模块
 */
(function() {
  'use strict';

  // 全局变量声明（供其他模块使用）
  let previewMode = 'preview';
  let currentLang = 'zh-CN';
  let saveTimer = null;

  // 暴露给全局
  window.previewMode = previewMode;
  window.currentLang = currentLang;

  /**
   * Toast 提示
   */
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
  }
  window.showToast = showToast;

  /**
   * 翻译函数
   */
  function t(key, ...args) {
    const dict = i18n[currentLang] || i18n['zh-CN'];
    let str = dict[key];
    if (str === undefined) str = i18n['zh-CN'][key] || key;
    return args.reduce((s, arg, i) => s.replace(new RegExp('\\{' + i + '\\}', 'g'), String(arg)), str);
  }
  window.t = t;

  /**
   * 设置语言
   */
  function setLanguage(lang) {
    if (!i18n[lang]) lang = 'zh-CN';
    currentLang = lang;
    window.currentLang = lang;
    Storage.saveLanguage(lang);
    applyLanguage();
    if (typeof showToast === 'function') showToast(t('toastSaved'));
  }
  window.setLanguage = setLanguage;

  /**
   * 应用语言
   */
  function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      el.title = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      el.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.dataset.i18nAlt;
      el.alt = t(key);
    });

    const helpBody = document.getElementById('help-body');
    if (helpBody && i18n[currentLang] && i18n[currentLang].helpHtml) {
      helpBody.innerHTML = i18n[currentLang].helpHtml;
    }

    Layout.updateViewMenuLabel();
    updateStatusBar();
    Editor.updateWordCount();
  }

  function updateStatusBar() {
    const statusLeft = document.getElementById('status-left');
    const statusRight = document.getElementById('status-right');
    const saveHint = document.getElementById('save-hint');
    if (statusLeft) statusLeft.textContent = t('autosaveEnabled');
    if (statusRight) statusRight.textContent = t('statusShortcuts');
    if (saveHint) saveHint.textContent = '✓ ' + t('saved');
  }

  /**
   * 自动保存
   */
  function autoSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const content = Editor.getContent();
      const filename = Editor.getFilename();
      Storage.saveContent(content);
      Storage.saveFilename(filename);
      Editor.showSaveHint();
    }, 500);
  }
  window.autoSave = autoSave;

  /**
   * 设置预览模式
   */
  function setPreviewMode(mode) {
    previewMode = mode;
    window.previewMode = mode;
    Storage.savePreviewMode(mode);
    document.querySelectorAll('.preview-toggle .toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    if (mode === 'preview') {
      Editor.elements.editor.value = Editor.elements.previewSource.value;
      Preview.setMode('preview');
      Editor.updateWordCount();
      autoSave();
    } else {
      Editor.elements.previewSource.value = Editor.getContent();
      Preview.setMode('source');
    }
  }
  window.setPreviewMode = setPreviewMode;

  /**
   * 同步滚动
   */
  function syncScroll(source, target) {
    if (window._isSyncingScroll) return;
    const sourceHeight = source.scrollHeight - source.clientHeight;
    const targetHeight = target.scrollHeight - target.clientHeight;
    if (sourceHeight <= 0 || targetHeight <= 0) return;
    window._isSyncingScroll = true;
    const ratio = source.scrollTop / sourceHeight;
    target.scrollTop = ratio * targetHeight;
    window._isSyncingScroll = false;
  }

  /**
   * 处理键盘快捷键
   */
  function handleEditorKeydown(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        Exporter.saveToLocal();
      } else if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        Editor.undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        Editor.redo();
      } else if (e.key === 'b') {
        e.preventDefault();
        Toolbar.formatBold();
      } else if (e.key === 'u') {
        e.preventDefault();
        Toolbar.formatUnderline();
      } else if (e.key === 'i' && !e.shiftKey) {
        e.preventDefault();
        Toolbar.formatItalic();
      } else if (e.key === 'k') {
        e.preventDefault();
        Toolbar.insertLink();
      } else if (e.shiftKey && (e.key === 'K')) {
        e.preventDefault();
        Modal.openImageModal();
      } else if (e.key === 'f') {
        e.preventDefault();
        Modal.openFindModal();
      }
    }
    // Tab 缩进
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = Editor.getActiveEditor();
      const start = el.selectionStart;
      const end = el.selectionEnd;
      el.setRangeText('    ', start, end, 'end');
      Editor.syncFromActive();
      Preview.update();
      Editor.updateWordCount();
    }
  }

  /**
   * 处理拖放
   */
  function initDragDrop() {
    const dropOverlay = document.getElementById('drop-overlay');
    let dragCounter = 0;

    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      if (dropOverlay) dropOverlay.classList.add('show');
    });

    document.addEventListener('dragleave', (e) => {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        if (dropOverlay) dropOverlay.classList.remove('show');
      }
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      if (dropOverlay) dropOverlay.classList.remove('show');
      const files = e.dataTransfer.files;
      if (!files.length) return;
      const file = files[0];
      const ext = file.name.split('.').pop().toLowerCase();

      const allowedText = ['md', 'markdown', 'txt'];
      if (allowedText.includes(ext)) {
        Toolbar.loadFile(file);
        return;
      }

      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          showToast(t('toastImageTooLarge'));
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          Modal.insertImageMarkdown(file.name, ev.target.result);
          showToast(t('toastImageInserted'));
        };
        reader.readAsDataURL(file);
        return;
      }

      showToast(t('toastDropUnsupported'));
    });
  }

  /**
   * 点击外部关闭下拉菜单
   */
  function initDropdownClose() {
    document.addEventListener('click', (e) => {
      const ids = ['export-dropdown', 'heading-dropdown', 'view-dropdown', 'table-dropdown', 'lang-dropdown'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.contains(e.target)) {
          el.querySelector('.dropdown-menu')?.classList.remove('show');
        }
      });
    });
  }

  /**
   * 初始化应用
   */
  function init() {
    // 1. 初始化各模块
    Editor.init();
    Preview.init();
    Layout.init();
    Toolbar.init();

    // 2. 恢复保存的状态
    const savedLang = Storage.getLanguage();
    if (savedLang && i18n[savedLang]) currentLang = savedLang;
    window.currentLang = currentLang;

    const savedContent = Storage.getContent();
    if (savedContent !== null) {
      Editor.setContent(savedContent);
    } else {
      Editor.setContent(i18n[currentLang].welcomeDoc || '# 欢迎使用 Markdown 编辑器');
    }

    const savedFilename = Storage.getFilename();
    if (savedFilename) Editor.setFilename(savedFilename);

    const theme = Storage.getTheme();
    document.body.setAttribute('data-theme', theme);

    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default'
      });
    }

    // 3. 恢复预览模式
    const savedPreviewMode = Storage.getPreviewMode();
    if (savedPreviewMode === 'preview' || savedPreviewMode === 'source') {
      previewMode = savedPreviewMode;
      window.previewMode = previewMode;
    }
    setPreviewMode(previewMode);

    // 4. 恢复页面全屏
    if (Storage.getPageFullscreen()) {
      document.querySelector('.app').classList.add('page-fullscreen');
      document.body.classList.add('page-fullscreen-active');
    }

    // 5. 初始化历史记录
    Editor.history.stack = [Editor.getContent()];
    Editor.history.index = 0;
    Editor.history.lastText = Editor.getContent();

    // 6. 应用语言
    applyLanguage();

    // 7. 更新预览和字数
    Preview.update();
    Editor.updateWordCount();

    // 8. 显示帮助（首次使用）
    if (!Storage.getHelpShown()) {
      setTimeout(() => Modal.openHelp(), 500);
    }

    // 9. 初始化事件监听
    const editorEl = document.getElementById('editor');
    const previewSourceEl = document.getElementById('preview-source');
    const previewEl = document.getElementById('preview');

    editorEl.addEventListener('input', () => {
      Editor.pushHistory();
      Preview.update();
      Editor.updateWordCount();
      autoSave();
    });

    previewSourceEl.addEventListener('input', () => {
      Editor.elements.editor.value = previewSourceEl.value;
      Editor.pushHistory();
      Editor.updateWordCount();
      autoSave();
    });

    document.getElementById('filename').addEventListener('input', autoSave);

    // 同步滚动
    editorEl.addEventListener('scroll', () => syncScroll(editorEl, previewEl));
    previewEl.addEventListener('scroll', () => syncScroll(previewEl, editorEl));

    // 键盘快捷键
    editorEl.addEventListener('keydown', handleEditorKeydown);
    previewSourceEl.addEventListener('keydown', handleEditorKeydown);

    // 全屏状态监听
    document.addEventListener('fullscreenchange', () => {});
    document.addEventListener('webkitfullscreenchange', () => {});

    // 拖放
    initDragDrop();

    // 下拉菜单关闭
    initDropdownClose();

    console.log('✨ Markdown Editor 初始化完成');
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
