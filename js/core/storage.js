/**
 * 存储管理模块 - 处理本地存储
 */
const Storage = {
  // 存储键名
  KEYS: {
    CONTENT: 'md_editor_content',
    FILENAME: 'md_editor_filename',
    THEME: 'md_editor_theme',
    HELP_SHOWN: 'md_editor_help_shown',
    RATIO: 'md_editor_ratio',
    EDITOR_COLLAPSED: 'md_editor_editor_collapsed',
    PREVIEW_COLLAPSED: 'md_editor_preview_collapsed',
    PREVIEW_MODE: 'md_editor_preview_mode',
    LANG: 'md_editor_language',
    LAYOUT_MODE: 'md_editor_layout_mode',
    PAGE_FULLSCREEN: 'md_editor_page_fullscreen'
  },

  /**
   * 保存内容
   */
  saveContent(content) {
    localStorage.setItem(this.KEYS.CONTENT, content);
  },

  /**
   * 获取内容
   */
  getContent() {
    return localStorage.getItem(this.KEYS.CONTENT);
  },

  /**
   * 保存文件名
   */
  saveFilename(filename) {
    localStorage.setItem(this.KEYS.FILENAME, filename);
  },

  /**
   * 获取文件名
   */
  getFilename() {
    return localStorage.getItem(this.KEYS.FILENAME);
  },

  /**
   * 保存主题
   */
  saveTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
  },

  /**
   * 获取主题
   */
  getTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'light';
  },

  /**
   * 保存帮助是否已显示
   */
  saveHelpShown() {
    localStorage.setItem(this.KEYS.HELP_SHOWN, 'true');
  },

  /**
   * 获取帮助是否已显示
   */
  getHelpShown() {
    return localStorage.getItem(this.KEYS.HELP_SHOWN);
  },

  /**
   * 保存编辑器比例
   */
  saveRatio(ratio) {
    localStorage.setItem(this.KEYS.RATIO, String(ratio));
  },

  /**
   * 获取编辑器比例
   */
  getRatio() {
    const val = localStorage.getItem(this.KEYS.RATIO);
    if (val !== null) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed;
    }
    return 0.5;
  },

  /**
   * 保存折叠状态
   */
  saveCollapsed(editor, preview) {
    localStorage.setItem(this.KEYS.EDITOR_COLLAPSED, String(editor));
    localStorage.setItem(this.KEYS.PREVIEW_COLLAPSED, String(preview));
  },

  /**
   * 获取折叠状态
   */
  getCollapsed() {
    return {
      editor: localStorage.getItem(this.KEYS.EDITOR_COLLAPSED) === 'true',
      preview: localStorage.getItem(this.KEYS.PREVIEW_COLLAPSED) === 'true'
    };
  },

  /**
   * 保存预览模式
   */
  savePreviewMode(mode) {
    localStorage.setItem(this.KEYS.PREVIEW_MODE, mode);
  },

  /**
   * 获取预览模式
   */
  getPreviewMode() {
    return localStorage.getItem(this.KEYS.PREVIEW_MODE) || 'preview';
  },

  /**
   * 保存语言
   */
  saveLanguage(lang) {
    localStorage.setItem(this.KEYS.LANG, lang);
  },

  /**
   * 获取语言
   */
  getLanguage() {
    return localStorage.getItem(this.KEYS.LANG) || 'zh-CN';
  },

  /**
   * 保存布局模式
   */
  saveLayoutMode(mode) {
    localStorage.setItem(this.KEYS.LAYOUT_MODE, mode);
  },

  /**
   * 获取布局模式
   */
  getLayoutMode() {
    return localStorage.getItem(this.KEYS.LAYOUT_MODE) || 'both';
  },

  /**
   * 保存页面全屏状态
   */
  savePageFullscreen(isFullscreen) {
    localStorage.setItem(this.KEYS.PAGE_FULLSCREEN, String(isFullscreen));
  },

  /**
   * 获取页面全屏状态
   */
  getPageFullscreen() {
    return localStorage.getItem(this.KEYS.PAGE_FULLSCREEN) === 'true';
  }
};

window.Storage = Storage;
