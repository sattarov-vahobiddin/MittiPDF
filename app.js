// ===== STATE =====
let images = []; // { id, name, src, rotation }

// ===== DOM REFS =====
const dropZone      = document.getElementById('dropZone');
const fileInput     = document.getElementById('fileInput');
const previewGrid   = document.getElementById('previewGrid');
const previewSection= document.getElementById('previewSection');
const statsBar      = document.getElementById('statsBar');
const settingsPanel = document.getElementById('settingsPanel');
const actionArea    = document.getElementById('actionArea');
const convertBtn    = document.getElementById('convertBtn');
const statusMsg     = document.getElementById('statusMsg');
const statCount     = document.getElementById('statCount');
const statSize      = document.getElementById('statSize');
const statPages     = document.getElementById('statPages');
const imgCountPill  = document.getElementById('imgCountPill');

// ===== DRAG & DROP =====
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});
dropZone.addEventListener('click', e => {
  if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') {
    fileInput.click();
  }
});
fileInput.addEventListener('change', e => handleFiles(e.target.files));

// ===== FILE HANDLING =====
function handleFiles(files) {
  const accepted = ['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/bmp'];
  const arr = Array.from(files).filter(f => accepted.includes(f.type));
  if (!arr.length) return showStatus('Ruxsat etilgan format: JPG, PNG, WEBP, GIF, BMP', 'error');

  arr.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      images.push({
        id: Date.now() + Math.random(),
        name: file.name,
        src: e.target.result,
        rotation: 0,
        originalFile: file
      });
      renderAll();
    };
    reader.readAsDataURL(file);
  });
  fileInput.value = '';
}

// ===== RENDER ALL =====
function renderAll() {
  renderPreviews();
  updateStats();
  updateVisibility();
}

function updateVisibility() {
  const has = images.length > 0;
  statsBar.style.display      = has ? 'flex' : 'none';
  previewSection.style.display= has ? 'block' : 'none';
  settingsPanel.style.display = has ? 'block' : 'none';
  actionArea.style.display    = has ? 'block' : 'none';
}

// ===== RENDER PREVIEWS =====
function renderPreviews() {
  previewGrid.innerHTML = '';
  imgCountPill.textContent = images.length;

  images.forEach((img, i) => {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.dataset.id = img.id;

    const imgEl = document.createElement('img');
    imgEl.src = img.src;
    imgEl.alt = img.name;
    imgEl.style.transform = `rotate(${img.rotation}deg)`;
    // If rotated 90/270, scale to fill the square
    if (img.rotation % 180 !== 0) {
      imgEl.style.transform = `rotate(${img.rotation}deg) scale(1.0)`;
    }

    const overlay = document.createElement('div');
    overlay.className = 'item-overlay';

    // Rotate Left
    const rotLeft = document.createElement('button');
    rotLeft.className = 'overlay-btn rotate-left';
    rotLeft.title = 'Chapga aylantirish';
    rotLeft.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8a5 5 0 105 -5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M3 4v4h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    rotLeft.onclick = e => { e.stopPropagation(); rotateImage(i, -90); };

    // Rotate Right
    const rotRight = document.createElement('button');
    rotRight.className = 'overlay-btn rotate-right';
    rotRight.title = 'O\'ngga aylantirish';
    rotRight.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13 8a5 5 0 10-5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M13 4v4H9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    rotRight.onclick = e => { e.stopPropagation(); rotateImage(i, 90); };

    // Remove
    const removeBt = document.createElement('button');
    removeBt.className = 'overlay-btn remove-btn remove';
    removeBt.title = 'O\'chirish';
    removeBt.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
    removeBt.onclick = e => { e.stopPropagation(); removeImage(i); };

    overlay.appendChild(rotLeft);
    overlay.appendChild(rotRight);
    overlay.appendChild(removeBt);

    const label = document.createElement('div');
    label.className = 'img-name';
    label.textContent = img.name;

    div.appendChild(imgEl);
    div.appendChild(overlay);
    div.appendChild(label);
    previewGrid.appendChild(div);
  });
}

// ===== ROTATE =====
function rotateImage(index, deg) {
  images[index].rotation = ((images[index].rotation + deg) % 360 + 360) % 360;
  renderPreviews();
}

// ===== REMOVE =====
function removeImage(index) {
  images.splice(index, 1);
  renderAll();
  if (!images.length) showStatus('', '');
}

// ===== CLEAR ALL =====
function clearAll() {
  images = [];
  fileInput.value = '';
  renderAll();
  showStatus('', '');
}

// ===== UPDATE STATS =====
function updateStats() {
  statCount.textContent = images.length;
  statPages.textContent = images.length;

  // Estimate total size (base64 -> approximate bytes)
  let totalBytes = images.reduce((sum, img) => {
    const base64 = img.src.split(',')[1] || '';
    return sum + Math.round(base64.length * 0.75);
  }, 0);

  statSize.textContent = formatBytes(totalBytes);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== SEGMENTED CONTROL =====
function setSeg(btn, groupId) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function getSegVal(groupId) {
  const active = document.querySelector(`#${groupId} .seg-btn.active`);
  return active ? active.dataset.val : null;
}

// ===== IMAGE COMPRESSION =====
async function compressImage(src, rotation, quality, maxW, maxH) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let w = img.naturalWidth;
      let h = img.naturalHeight;

      // Apply rotation dimensions swap
      const isRotated = rotation % 180 !== 0;
      const finalW = isRotated ? h : w;
      const finalH = isRotated ? w : h;

      // Scale down to fit within max dimensions
      const scale = Math.min(1, maxW / finalW, maxH / finalH);
      const cw = Math.round(finalW * scale);
      const ch = Math.round(finalH * scale);

      canvas.width  = cw;
      canvas.height = ch;

      ctx.translate(cw / 2, ch / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -w * scale / 2, -h * scale / 2, w * scale, h * scale);

      // Try to stay under quality ceiling
      const compressed = canvas.toDataURL('image/jpeg', parseFloat(quality));
      resolve({ dataUrl: compressed, width: cw, height: ch });
    };
    img.src = src;
  });
}

// ===== CONVERT TO PDF =====
async function convertToPDF() {
  if (!images.length) return;

  const { jsPDF } = window.jspdf;

  const pageSize   = getSegVal('pageSizeCtrl')  || 'a4';
  const orientation= getSegVal('orientCtrl')    || 'portrait';
  const quality    = getSegVal('qualityCtrl')    || '0.72';
  const rawName    = document.getElementById('filename').value.trim() || 'rasmlarim';
  const filename   = rawName.replace(/\.pdf$/i, '') + '.pdf';

  convertBtn.disabled = true;
  document.getElementById('btnContent').innerHTML = `
    <div class="spinner"></div> Tayyorlanmoqda...
  `;

  showStatus(`<div>
    Rasmlar qayta ishlanmoqda...
    <div class="progress-bar-wrap"><div class="progress-bar-fill" id="progressFill"></div></div>
  </div>`, 'loading', true);

  // Determine max pixel dimensions for compression
  // Target: ~3MB PDF. We'll limit each image to 1800px and adjust quality.
  const maxPx = 1800;

  try {
    const doc = new jsPDF({ orientation, unit: 'mm', format: pageSize });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 8;
    const mw = pw - margin * 2;
    const mh = ph - margin * 2;

    for (let i = 0; i < images.length; i++) {
      // Update progress
      const pct = Math.round(((i) / images.length) * 100);
      const fill = document.getElementById('progressFill');
      if (fill) fill.style.width = pct + '%';

      if (i > 0) doc.addPage(pageSize, orientation);

      const { dataUrl, width: cw, height: ch } = await compressImage(
        images[i].src,
        images[i].rotation,
        quality,
        maxPx,
        maxPx
      );

      // Fit image into page keeping aspect ratio
      const imgAspect = cw / ch;
      const pageAspect = mw / mh;
      let drawW, drawH;
      if (imgAspect > pageAspect) {
        drawW = mw;
        drawH = mw / imgAspect;
      } else {
        drawH = mh;
        drawW = mh * imgAspect;
      }
      const x = margin + (mw - drawW) / 2;
      const y = margin + (mh - drawH) / 2;

      doc.addImage(dataUrl, 'JPEG', x, y, drawW, drawH, undefined, 'FAST');
    }

    // Finalize progress
    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = '100%';

    await new Promise(r => setTimeout(r, 300));

    doc.save(filename);

    showStatus(`✓ "${filename}" muvaffaqiyatli yaratildi — ${images.length} ta sahifa`, 'success');
  } catch (err) {
    console.error(err);
    showStatus('Xatolik yuz berdi: ' + err.message, 'error');
  }

  convertBtn.disabled = false;
  document.getElementById('btnContent').innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 14v2a1 1 0 001 1h10a1 1 0 001-1v-2M10 3v10M6 9l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    PDF yaratish va saqlash
  `;
}

// ===== STATUS HELPER =====
function showStatus(msg, type, isHtml) {
  statusMsg.className = 'status-msg' + (type ? ' ' + type : '');
  if (isHtml) {
    statusMsg.innerHTML = msg;
  } else {
    statusMsg.textContent = msg;
  }
}
