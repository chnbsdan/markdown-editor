/**
 * 导出模块 - 处理所有导出功能
 */
const Exporter = {
  currentImageRatio: '9:16',
  currentImageDataUrl: '',
  IMAGE_PLACEHOLDER: 'data:image/svg+xml;base64,' + btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">' +
    '<rect width="120" height="80" fill="#e9ecef"/>' +
    '<text x="60" y="44" text-anchor="middle" font-size="12" fill="#6c757d">Image unavailable</text>' +
    '</svg>'
  ),
  RATIO_PRESETS: {
    '9:16':  { width: 1080, height: 1920 },
    '4:5':   { width: 1080, height: 1350 },
    '3:4':   { width: 1080, height: 1440 },
    '1:1':   { width: 1080, height: 1080 },
    '16:9':  { width: 1920, height: 1080 }
  },

  /**
   * 保存文档
   */
  saveToLocal() {
    const content = Editor.getContent();
    const filename = Editor.getFilename();
    Storage.saveContent(content);
    Storage.saveFilename(filename);
    Editor.showSaveHint();
    if (typeof showToast === 'function') showToast('已保存');
  },

  /**
   * 导出 Markdown
   */
  exportFile() {
    const content = Editor.getContent();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    let name = Editor.getFilename();
    if (!name.toLowerCase().endsWith('.md') && !name.toLowerCase().endsWith('.markdown')) {
      name += '.md';
    }
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('导出成功');
  },

  /**
   * 导出 Word
   */
  exportWord() {
    let name = Editor.getFilename();
    name = name.replace(/\.md$/i, '').replace(/\.markdown$/i, '') + '.doc';

    const md = Editor.getContent();
    let bodyHtml;
    if (typeof marked !== 'undefined') {
      bodyHtml = marked.parse(md);
    } else {
      bodyHtml = '<pre style="white-space:pre-wrap">' + Preview.escapeHtml(md) + '</pre>';
    }

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${Preview.escapeHtml(name.replace(/\.doc$/i, ''))}</title>
  <style>
    body { font-family: "Microsoft YaHei", "SimSun", "PingFang SC", sans-serif; font-size: 12pt; line-height: 1.6; color: #000; }
    h1 { font-size: 20pt; font-weight: bold; margin: 18pt 0 10pt; }
    h2 { font-size: 16pt; font-weight: bold; margin: 14pt 0 8pt; }
    h3 { font-size: 14pt; font-weight: bold; margin: 12pt 0 6pt; }
    h4, h5, h6 { font-size: 12pt; font-weight: bold; margin: 10pt 0 6pt; }
    p { margin: 6pt 0; }
    pre, code { font-family: Consolas, "Courier New", monospace; }
    pre { background: #f5f5f5; padding: 8pt; border-radius: 4px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 1pt 3pt; border-radius: 2px; }
    blockquote { border-left: 3px solid #ccc; margin: 6pt 0; padding: 4pt 10pt; color: #555; }
    table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
    th, td { border: 1px solid #ccc; padding: 5pt 8pt; }
    th { background: #f5f5f5; font-weight: bold; }
    ul, ol { margin: 6pt 0; padding-left: 24pt; }
    li { margin: 3pt 0; }
    img { max-width: 100%; height: auto; }
    hr { border: none; border-top: 1px solid #ccc; margin: 12pt 0; }
    a { color: #0563c1; text-decoration: underline; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Word 导出成功');
  },

  /**
   * 导出 HTML
   */
  exportHTML() {
    let name = Editor.getFilename();
    name = name.replace(/\.md$/i, '').replace(/\.markdown$/i, '') + '.html';

    const md = Editor.getContent();
    let bodyHtml;
    if (typeof marked !== 'undefined') {
      bodyHtml = marked.parse(md);
    } else {
      bodyHtml = '<pre style="white-space:pre-wrap">' + Preview.escapeHtml(md) + '</pre>';
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${Preview.escapeHtml(name.replace(/\.html$/i, ''))}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif; font-size: 16px; line-height: 1.7; max-width: 820px; margin: 40px auto; padding: 0 20px; color: #212529; background: #fff; }
    h1, h2, h3, h4, h5, h6 { margin: 24px 0 12px; font-weight: 600; line-height: 1.25; color: #212529; }
    h1 { font-size: 2em; border-bottom: 1px solid #dee2e6; padding-bottom: 8px; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #dee2e6; padding-bottom: 6px; }
    h3 { font-size: 1.25em; }
    p { margin: 0 0 14px; }
    a { color: #0d6efd; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul, ol { margin: 0 0 14px; padding-left: 2em; }
    li { margin: 4px 0; }
    li.task-item { list-style: none; margin-left: -1.4em; }
    ul.task-list { padding-left: 1.8em; }
    code { background: #f1f3f5; padding: 2px 6px; border-radius: 4px; font-family: "SFMono-Regular", Consolas, monospace; font-size: 0.9em; }
    pre { background: #f1f3f5; padding: 14px; border-radius: 8px; overflow-x: auto; margin: 0 0 14px; }
    pre code { background: transparent; padding: 0; font-size: 0.9em; }
    blockquote { margin: 0 0 14px; padding: 8px 16px; border-left: 4px solid #8a93a1; background: #f1f3f5; color: #6c757d; font-size: 0.95em; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 14px; }
    th, td { border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; }
    th { background: #f1f3f5; font-weight: 600; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    hr { border: none; border-top: 1px solid #dee2e6; margin: 20px 0; }
    .katex { font-size: 1.1em; }
    .katex-display { margin: 16px 0; overflow-x: auto; }
  </style>
</head>
<body>
${bodyHtml}
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js">${'</scr' + 'ipt>'}
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js">${'</scr' + 'ipt>'}
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof renderMathInElement !== 'undefined') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  });
${'</scr' + 'ipt>'}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('HTML 导出成功');
  },

  /**
   * 导出 PDF（通过打印）
   */
  exportPDF() {
    const wasSource = window.previewMode === 'source';
    if (wasSource) {
      if (typeof setPreviewMode === 'function') {
        setPreviewMode('preview');
      }
    }
    if (typeof showToast === 'function') {
      showToast('请在打印对话框选择「另存为 PDF」');
    }
    setTimeout(() => {
      window.print();
      if (wasSource && typeof setPreviewMode === 'function') {
        setPreviewMode('source');
      }
    }, 500);
  },

  // ==================== 导出图片 ====================
  
  openExportImageModal() {
    if (window.previewMode !== 'preview') {
      if (typeof setPreviewMode === 'function') {
        setPreviewMode('preview');
      }
    }
    document.getElementById('image-crop-fit').checked = false;
    this.selectImageRatio('9:16');
    Modal.showModal('export-image-modal');
  },

  closeExportImageModal() {
    Modal.hideModal('export-image-modal');
  },

  selectImageRatio(ratio) {
    this.currentImageRatio = ratio;
    document.querySelectorAll('.ratio-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.ratio === ratio);
    });
    this.renderExportImagePreview();
  },

  prepareExportImages(root) {
    const imgs = root.querySelectorAll('img');
    return Promise.all(Array.from(imgs).map(img => new Promise(resolve => {
      if (!img.src || img.src.startsWith('data:')) {
        resolve();
        return;
      }
      const test = new Image();
      test.crossOrigin = 'anonymous';
      test.onload = () => {
        img.crossOrigin = 'anonymous';
        img.src = test.src;
        resolve();
      };
      test.onerror = () => {
        img.src = this.IMAGE_PLACEHOLDER;
        resolve();
      };
      const sep = img.src.includes('?') ? '&' : '?';
      test.src = img.src + sep + '_cors=' + Date.now();
    })));
  },

  async renderExportImagePreview() {
    if (typeof domtoimage === 'undefined') {
      if (typeof showToast === 'function') showToast('图片导出库未加载，请检查网络');
      return;
    }

    const preset = this.RATIO_PRESETS[this.currentImageRatio];
    const stage = document.getElementById('export-image-stage');
    const container = document.getElementById('export-image-content');

    container.innerHTML = '';
    const clone = document.createElement('div');
    clone.className = 'preview-content';
    clone.innerHTML = document.getElementById('preview').innerHTML;
    clone.style.width = preset.width + 'px';
    clone.style.padding = Math.round(preset.width * 0.04) + 'px ' + Math.round(preset.width * 0.045) + 'px';
    clone.style.fontSize = Math.round(preset.width / 36) + 'px';
    clone.style.lineHeight = '1.7';
    clone.style.boxSizing = 'border-box';
    clone.style.background = 'var(--panel-bg)';
    clone.style.color = 'var(--text)';
    clone.style.overflow = 'visible';
    clone.style.maxWidth = 'none';
    clone.style.margin = '0';
    container.appendChild(clone);

    const markdownBody = clone.querySelector('.markdown-body');
    if (markdownBody) {
      markdownBody.style.maxWidth = 'none';
      markdownBody.style.width = '100%';
      markdownBody.style.margin = '0';
    }

    stage.style.width = preset.width + 'px';
    stage.style.height = 'auto';

    await this.prepareExportImages(clone);

    const cropFit = document.getElementById('image-crop-fit').checked;
    const targetHeight = preset.height;
    const naturalHeight = clone.scrollHeight;

    let captureHeight;
    if (naturalHeight < targetHeight) {
      clone.style.minHeight = targetHeight + 'px';
      clone.style.height = targetHeight + 'px';
      captureHeight = targetHeight;
    } else if (cropFit) {
      clone.style.height = targetHeight + 'px';
      clone.style.overflow = 'hidden';
      captureHeight = targetHeight;
    } else {
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      captureHeight = naturalHeight;
    }

    stage.style.height = captureHeight + 'px';

    try {
      const dataUrl = await domtoimage.toPng(clone, {
        width: preset.width,
        height: captureHeight,
        bgcolor: getComputedStyle(clone).backgroundColor || '#ffffff',
        cacheBust: true,
        imagePlaceholder: this.IMAGE_PLACEHOLDER
      });
      this.currentImageDataUrl = dataUrl;
      const previewImg = document.getElementById('export-image-preview');
      previewImg.src = dataUrl;
      previewImg.style.display = 'block';
      if (typeof showToast === 'function') showToast('预览已生成');
    } catch (err) {
      console.error(err);
      if (typeof showToast === 'function') showToast('图片生成失败: ' + err.message);
    } finally {
      clone.style.height = '';
      clone.style.minHeight = '';
      clone.style.overflow = '';
    }
  },

  downloadExportImage() {
    if (!this.currentImageDataUrl) {
      if (typeof showToast === 'function') showToast('请先生成预览');
      return;
    }
    let name = Editor.getFilename();
    name = name.replace(/\.(md|markdown|txt|html|doc)$/i, '') + '.png';

    const a = document.createElement('a');
    a.href = this.currentImageDataUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof showToast === 'function') showToast('图片下载成功');
  }
};

window.Exporter = Exporter;
// 为了兼容原有函数名
window.saveToLocal = Exporter.saveToLocal.bind(Exporter);
window.exportFile = Exporter.exportFile.bind(Exporter);
window.exportWord = Exporter.exportWord.bind(Exporter);
window.exportHTML = Exporter.exportHTML.bind(Exporter);
window.exportPDF = Exporter.exportPDF.bind(Exporter);
window.exportImage = Exporter.openExportImageModal.bind(Exporter);
window.openExportImageModal = Exporter.openExportImageModal.bind(Exporter);
window.closeExportImageModal = Exporter.closeExportImageModal.bind(Exporter);
window.selectImageRatio = Exporter.selectImageRatio.bind(Exporter);
window.renderExportImagePreview = Exporter.renderExportImagePreview.bind(Exporter);
window.downloadExportImage = Exporter.downloadExportImage.bind(Exporter);
