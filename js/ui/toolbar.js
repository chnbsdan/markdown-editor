/**
 * 工具栏模块 - 处理所有工具栏按钮事件
 */
const Toolbar = {
  /**
   * 初始化工具栏
   */
  init() {
    this.initTableGrid();
  },

  // ==================== 格式化操作 ====================
  
  formatBold() {
    Editor.pushHistory();
    Editor.wrapSelection('**', '**');
  },

  formatItalic() {
    Editor.pushHistory();
    Editor.wrapSelection('*', '*');
  },

  formatUnderline() {
    Editor.pushHistory();
    Editor.wrapSelection('<u>', '</u>');
  },

  formatStrikethrough() {
    Editor.pushHistory();
    Editor.wrapSelection('~~', '~~');
  },

  formatSubscript() {
    Editor.pushHistory();
    Editor.wrapSelection('<sub>', '</sub>');
  },

  formatSuperscript() {
    Editor.pushHistory();
    Editor.wrapSelection('<sup>', '</sup>');
  },

  insertCodeRow() {
    Editor.pushHistory();
    Editor.wrapSelection('`', '`');
  },

  insertCode() {
    Editor.pushHistory();
    const el = Editor.getActiveEditor();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.slice(start, end);
    const insert = selected.includes('\n') ? '```\n' + selected + '\n```' : '`' + selected + '`';
    el.setRangeText(insert, start, end, 'select');
    Editor.syncFromActive();
    Editor.updatePreviewAndCount();
    el.focus();
  },

  formatQuote() {
    Editor.pushHistory();
    const el = Editor.getActiveEditor();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || '引用';
    const quoted = '> ' + selected.replace(/\n/g, '\n> ');
    el.setRangeText(quoted, start, end, 'select');
    Editor.syncFromActive();
    Editor.updatePreviewAndCount();
    el.focus();
  },

  formatUnorderedList() {
    Editor.pushHistory();
    Editor.prefixLines('- ');
  },

  formatOrderedList() {
    Editor.pushHistory();
    Editor.prefixLines('1. ');
  },

  formatTaskList() {
    Editor.pushHistory();
    Editor.prefixLines('- [ ] ');
  },

  insertHeading(level) {
    Editor.pushHistory();
    const el = Editor.getActiveEditor();
    const start = el.selectionStart;
    const before = el.value.slice(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const lineEnd = el.value.indexOf('\n', lineStart);
    const end = lineEnd === -1 ? el.value.length : lineEnd;
    const currentLine = el.value.slice(lineStart, end);
    const newLine = '#'.repeat(level) + ' ' + currentLine.replace(/^#{0,6}\s*/, '');
    el.setRangeText(newLine, lineStart, end, 'end');
    Editor.syncFromActive();
    Editor.updatePreviewAndCount();
    el.focus();
  },

  insertLink() {
    Editor.pushHistory();
    const el = Editor.getActiveEditor();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || '链接文本';
    const url = prompt('请输入链接地址:', 'https://');
    if (!url) return;
    el.setRangeText('[' + selected + '](' + url + ')', start, end, 'end');
    Editor.syncFromActive();
    Editor.updatePreviewAndCount();
    el.focus();
  },

  // ==================== 表格 ====================
  
  initTableGrid() {
    const grid = document.getElementById('table-grid');
    if (!grid || grid.children.length) return;
    grid.innerHTML = '';
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'table-grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        grid.appendChild(cell);
      }
    }
    grid.addEventListener('mouseover', (e) => {
      if (!e.target.classList.contains('table-grid-cell')) return;
      this.highlightTableCells(parseInt(e.target.dataset.row), parseInt(e.target.dataset.col));
    });
    grid.addEventListener('click', (e) => {
      if (!e.target.classList.contains('table-grid-cell')) return;
      const rows = parseInt(e.target.dataset.row);
      const cols = parseInt(e.target.dataset.col);
      this.insertTable(rows, cols);
      this.closeTableMenu();
    });
    grid.addEventListener('mouseleave', () => {
      this.highlightTableCells(0, 0);
    });
  },

  highlightTableCells(rows, cols) {
    document.querySelectorAll('.table-grid-cell').forEach(cell => {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      cell.classList.toggle('active', r <= rows && c <= cols);
    });
    const label = document.getElementById('table-size-label');
    if (label) {
      if (typeof t === 'function') {
        label.textContent = t('tableSizeLabel', rows, cols);
      } else {
        label.textContent = rows + ' 行 × ' + cols + ' 列';
      }
    }
  },

  insertTable(rows, cols) {
    if (!rows || !cols) return;
    Editor.pushHistory();
    const headerCols = Array.from({ length: cols }, (_, i) => ' 列' + (i + 1) + ' ').join('|');
    const separator = '|' + Array.from({ length: cols }, () => ' --- ').join('|') + '|';
    const dataCols = '|' + Array.from({ length: cols }, () => ' 内容 ').join('|') + '|';
    let table = '\n|' + headerCols + '|\n' + separator;
    for (let r = 2; r <= rows; r++) {
      table += '\n' + dataCols;
    }
    table += '\n';
    Editor.insertAtCursor(table);
  },

  // ==================== 下拉菜单 ====================
  
  toggleHeadingMenu() {
    document.getElementById('heading-menu').classList.toggle('show');
  },

  closeHeadingMenu() {
    document.getElementById('heading-menu').classList.remove('show');
  },

  toggleTableMenu() {
    this.initTableGrid();
    this.highlightTableCells(0, 0);
    document.getElementById('table-menu').classList.toggle('show');
  },

  closeTableMenu() {
    document.getElementById('table-menu').classList.remove('show');
  },

  toggleExportMenu() {
    document.getElementById('export-menu').classList.toggle('show');
  },

  closeExportMenu() {
    document.getElementById('export-menu').classList.remove('show');
  },

  toggleViewMenu() {
    document.getElementById('view-menu').classList.toggle('show');
  },

  closeViewMenu() {
    document.getElementById('view-menu').classList.remove('show');
  },

  toggleLangMenu() {
    document.getElementById('lang-menu').classList.toggle('show');
  },

  closeLangMenu() {
    document.getElementById('lang-menu').classList.remove('show');
  },

  // ==================== 其他 ====================
  
  /**
   * 切换主题
   */
  toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    Storage.saveTheme(next);
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: next === 'dark' ? 'dark' : 'default'
      });
    }
    Preview.update();
  },

  /**
   * 清空文档
   */
  clearDoc() {
    if (confirm('确定要清空所有内容吗？')) {
      Editor.setContent('');
      Preview.update();
      Editor.updateWordCount();
      if (typeof saveToLocal === 'function') {
        saveToLocal();
      }
    }
  },

  /**
   * 导入文件
   */
  importFile(input) {
    const file = input.files[0];
    if (file) {
      this.loadFile(file);
    }
    input.value = '';
  },

  loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      Editor.setContent(e.target.result);
      let name = file.name;
      if (!name.toLowerCase().endsWith('.md') && !name.toLowerCase().endsWith('.markdown')) {
        name += '.md';
      }
      Editor.setFilename(name);
      Preview.update();
      Editor.updateWordCount();
      if (typeof saveToLocal === 'function') {
        saveToLocal();
      }
      if (typeof showToast === 'function') {
        showToast('文件导入成功');
      }
    };
    reader.readAsText(file);
  }
};

window.Toolbar = Toolbar;
// ==================== 暴露到全局 ====================
// 格式化
window.formatBold = Toolbar.formatBold.bind(Toolbar);
window.formatItalic = Toolbar.formatItalic.bind(Toolbar);
window.formatUnderline = Toolbar.formatUnderline.bind(Toolbar);
window.formatStrikethrough = Toolbar.formatStrikethrough.bind(Toolbar);
window.formatSubscript = Toolbar.formatSubscript.bind(Toolbar);
window.formatSuperscript = Toolbar.formatSuperscript.bind(Toolbar);
window.formatQuote = Toolbar.formatQuote.bind(Toolbar);
window.formatUnorderedList = Toolbar.formatUnorderedList.bind(Toolbar);
window.formatOrderedList = Toolbar.formatOrderedList.bind(Toolbar);
window.formatTaskList = Toolbar.formatTaskList.bind(Toolbar);

// 插入
window.insertCodeRow = Toolbar.insertCodeRow.bind(Toolbar);
window.insertCode = Toolbar.insertCode.bind(Toolbar);
window.insertLink = Toolbar.insertLink.bind(Toolbar);
window.insertHeading = Toolbar.insertHeading.bind(Toolbar);
window.insertTable = Toolbar.insertTable.bind(Toolbar);

// 下拉菜单
window.toggleHeadingMenu = Toolbar.toggleHeadingMenu.bind(Toolbar);
window.closeHeadingMenu = Toolbar.closeHeadingMenu.bind(Toolbar);
window.toggleTableMenu = Toolbar.toggleTableMenu.bind(Toolbar);
window.closeTableMenu = Toolbar.closeTableMenu.bind(Toolbar);
window.toggleExportMenu = Toolbar.toggleExportMenu.bind(Toolbar);
window.closeExportMenu = Toolbar.closeExportMenu.bind(Toolbar);
window.toggleViewMenu = Toolbar.toggleViewMenu.bind(Toolbar);
window.closeViewMenu = Toolbar.closeViewMenu.bind(Toolbar);
window.toggleLangMenu = Toolbar.toggleLangMenu.bind(Toolbar);
window.closeLangMenu = Toolbar.closeLangMenu.bind(Toolbar);

// 其他
window.toggleTheme = Toolbar.toggleTheme.bind(Toolbar);
window.clearDoc = Toolbar.clearDoc.bind(Toolbar);
window.importFile = Toolbar.importFile.bind(Toolbar);
