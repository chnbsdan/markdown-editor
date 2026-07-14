/**
 * 布局控制模块 - 管理分栏、折叠、全屏
 */
const Layout = {
  elements: {},
  editorCollapsed: false,
  previewCollapsed: false,
  editorRatio: 0.5,
  isResizing: false,
  resizeRect: null,

  /**
   * 初始化布局
   */
  init() {
    this.elements = {
      editorPane: document.querySelector('.editor-pane'),
      previewPane: document.querySelector('.preview-pane'),
      resizer: document.getElementById('resizer'),
      editorCollapseBtn: document.getElementById('editor-collapse-btn'),
      previewCollapseBtn: document.getElementById('preview-collapse-btn')
    };

    // 恢复保存的状态
    const collapsed = Storage.getCollapsed();
    this.editorCollapsed = collapsed.editor;
    this.previewCollapsed = collapsed.preview;
    this.editorRatio = Storage.getRatio();

    this.applyStates();
    this.initResizer();

    // 恢复布局模式
    const mode = Storage.getLayoutMode();
    this.setLayoutMode(mode);
  },

  /**
   * 应用面板状态
   */
  applyStates() {
    const { editorPane, previewPane, resizer } = this.elements;
    editorPane.classList.toggle('collapsed', this.editorCollapsed);
    previewPane.classList.toggle('collapsed', this.previewCollapsed);
    resizer.classList.toggle('hidden', this.editorCollapsed || this.previewCollapsed);

    // 更新折叠按钮图标
    const chevronLeft = '<svg class="icon icon-sm"><use href="#icon-chevron-left"></use></svg>';
    const chevronRight = '<svg class="icon icon-sm"><use href="#icon-chevron-right"></use></svg>';
    this.elements.editorCollapseBtn.innerHTML = this.editorCollapsed ? chevronRight : chevronLeft;
    this.elements.previewCollapseBtn.innerHTML = this.previewCollapsed ? chevronLeft : chevronRight;

    // 更新标题
    if (typeof t === 'function') {
      this.elements.editorCollapseBtn.title = this.editorCollapsed ? t('expandEditor') : t('collapseEditor');
      this.elements.previewCollapseBtn.title = this.previewCollapsed ? t('expandPreview') : t('collapsePreview');
    }

    this.applySplit();
  },

  /**
   * 应用分栏比例
   */
  applySplit() {
    const { editorPane, previewPane } = this.elements;
    if (this.editorCollapsed || this.previewCollapsed) {
      editorPane.style.flex = '';
      previewPane.style.flex = '';
    } else {
      editorPane.style.flex = `0 0 ${this.editorRatio * 100}%`;
      previewPane.style.flex = '1 1 0';
    }
  },

  /**
   * 切换面板折叠
   */
  togglePane(pane) {
    if (pane === 'editor') {
      if (!this.editorCollapsed && this.previewCollapsed) return;
      this.editorCollapsed = !this.editorCollapsed;
    } else {
      if (!this.previewCollapsed && this.editorCollapsed) return;
      this.previewCollapsed = !this.previewCollapsed;
    }
    this.applyStates();
    Storage.saveCollapsed(this.editorCollapsed, this.previewCollapsed);
  },

  /**
   * 初始化分隔条拖拽
   */
  initResizer() {
    const resizer = this.elements.resizer;
    const main = document.querySelector('.main');

    resizer.addEventListener('mousedown', (e) => this.startResize(e));
    resizer.addEventListener('touchstart', (e) => this.startResize(e), { passive: false });
    window.addEventListener('mousemove', (e) => this.onResizeMove(e));
    window.addEventListener('touchmove', (e) => this.onResizeMove(e), { passive: false });
    window.addEventListener('mouseup', () => this.stopResize());
    window.addEventListener('touchend', () => this.stopResize());
  },

  startResize(e) {
    this.isResizing = true;
    this.resizeRect = document.querySelector('.main').getBoundingClientRect();
    document.body.classList.add('resizing');
    this.elements.resizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  },

  stopResize() {
    if (!this.isResizing) return;
    this.isResizing = false;
    this.resizeRect = null;
    document.body.classList.remove('resizing');
    this.elements.resizer.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  },

  onResizeMove(e) {
    if (!this.isResizing || !this.resizeRect) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let ratio = (clientX - this.resizeRect.left) / this.resizeRect.width;
    ratio = Math.max(0.15, Math.min(0.85, ratio));
    this.editorRatio = ratio;
    Storage.saveRatio(ratio);
    this.applySplit();
  },

  /**
   * 设置布局模式
   */
  setLayoutMode(mode) {
    if (mode === 'edit') {
      this.editorCollapsed = false;
      this.previewCollapsed = true;
    } else if (mode === 'preview') {
      this.editorCollapsed = true;
      this.previewCollapsed = false;
      if (window.previewMode !== 'preview') {
        if (typeof setPreviewMode === 'function') {
          setPreviewMode('preview');
        }
      }
    } else {
      this.editorCollapsed = false;
      this.previewCollapsed = false;
    }
    this.applyStates();
    Storage.saveLayoutMode(mode);
    this.updateViewMenuLabel();
  },

  /**
   * 更新视图菜单标签
   */
  updateViewMenuLabel() {
    const mode = Storage.getLayoutMode() || 'both';
    const labels = { both: '视图', edit: '仅编辑', preview: '仅预览' };
    const btn = document.querySelector('#view-dropdown > button');
    if (btn) {
      btn.innerHTML = (labels[mode] || '视图') + ' ▾';
    }
  },

  /**
   * 切换页面全屏
   */
  togglePageFullscreen() {
    const app = document.querySelector('.app');
    app.classList.toggle('page-fullscreen');
    const isActive = app.classList.contains('page-fullscreen');
    document.body.classList.toggle('page-fullscreen-active', isActive);
    Storage.savePageFullscreen(isActive);
    if (typeof showToast === 'function') {
      showToast(isActive ? '已进入页面全屏' : '已退出页面全屏');
    }
  },

  /**
   * 切换系统全屏
   */
  toggleSystemFullscreen() {
    if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) {
      if (typeof showToast === 'function') {
        showToast('浏览器不支持全屏 API');
      }
      return;
    }
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  }
};

window.Layout = Layout;
