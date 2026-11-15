// ==========================================================================
// AURA ATELIER — Application Logic & Neural Experience Engine
// ==========================================================================

// Global Application State
const STATE = {
  activePage: 'viewStyleDna', // 'viewStyleDna' | 'viewFeed' | 'viewVault' | 'viewStore' | 'viewModelAdmin'
  userDna: {
    heightCm: 162, // 5'4"
    weightKg: 58,
    bustInches: 35,
    waistInches: 27,
    hipInches: 39,
    silhouette: 'Pear & Hourglass', // 'Pear & Hourglass' | 'Hourglass' | 'Athletic Rectangle' | 'Petite Cut'
    undertone: 'warm-autumn', // 'warm-autumn' | 'soft-summer' | 'deep-winter'
    undertoneRgb: { r: 217, g: 119, b: 87 },
    paletteName: 'Warm Autumn Glow',
    confidenceScore: 98.4,
    recommendedSizes: {
      dress: 'S (Bust 34-36)',
      shirt: 'S - Standard',
      trouser: '27-29 Petite (28" Inseam)'
    }
  },
  savedPins: new Set(['look-01', 'look-05', 'capsule-01']),
  cart: [
    {
      id: "capsule-01",
      name: "The Bias-Cut Mulberry Silk Wrap Dress",
      price: 240,
      size: "S (Bust 34-36)",
      color: "Spiced Terracotta",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
      quantity: 1
    }
  ],
  promoDiscount: 0,
  activeFeedFilter: 'all',
  searchQuery: '',
  activeAdminModel: 'v2', // 'v1' | 'v2'
  userCloset: [...CLOSET_ITEMS],
  selectedClosetId: 'closet-1',
  cameraStream: null
};

// ==========================================================================
// Initialization on DOM Load
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDnaScanner();
  initFeed();
  initWardrobeVault();
  initAdminDashboard();
  initCapsuleStore();
  updateCartBadge();
  updateHeaderPaletteBadge();
  updateVaultBadge();

  // Listen to hash changes for deep linking
  window.addEventListener('hashchange', handleHashRouting);
  handleHashRouting();
});

// ==========================================================================
// 1. Dynamic Top Navigation & Page Switcher
// ==========================================================================
function initNavigation() {
  const header = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Global search input
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      STATE.searchQuery = e.target.value;
      if (STATE.activePage !== 'viewFeed') {
        navigateTo('viewFeed');
      }
      initFeed();
    });
  }
}

function navigateTo(pageId) {
  STATE.activePage = pageId;

  // Toggle page visibility
  document.querySelectorAll('.app-page-view').forEach(view => {
    if (view.id === pageId) {
      view.classList.add('active-view');
    } else {
      view.classList.remove('active-view');
    }
  });

  // Toggle navigation pills
  document.querySelectorAll('.nav-pill-btn').forEach(btn => {
    if (btn.getAttribute('data-target') === pageId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleHashRouting() {
  const hash = window.location.hash.replace('#', '');
  const hashMap = {
    'dna': 'viewStyleDna',
    'feed': 'viewFeed',
    'vault': 'viewVault',
    'store': 'viewStore',
    'admin': 'viewModelAdmin'
  };

  if (hash && hashMap[hash]) {
    navigateTo(hashMap[hash]);
  }
}

// ==========================================================================
// 2. PAGE 1: Style DNA Onboarding & Camera Scan Widget
// ==========================================================================
function initDnaScanner() {
  // Sync slider inputs
  const heightSlider = document.getElementById('sliderHeight');
  const weightSlider = document.getElementById('sliderWeight');

  if (heightSlider) {
    heightSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      STATE.userDna.heightCm = val;
      const ft = Math.floor(val / 30.48);
      const inches = Math.round((val % 30.48) / 2.54);
      document.getElementById('displayHeight').innerText = `${val} cm (${ft}'${inches}")`;
      recalculateDnaFromMetrics();
    });
  }

  if (weightSlider) {
    weightSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      STATE.userDna.weightKg = val;
      const lbs = Math.round(val * 2.20462);
      document.getElementById('displayWeight').innerText = `${val} kg (${lbs} lbs)`;
      recalculateDnaFromMetrics();
    });
  }

  renderStyleDnaPassport();
}

function recalculateDnaFromMetrics() {
  const h = STATE.userDna.heightCm;
  const w = STATE.userDna.weightKg;

  // Compute silhouette heuristically
  if (h < 160) {
    STATE.userDna.silhouette = 'Petite Cut';
    STATE.userDna.recommendedSizes.trouser = '24-26 Petite (28" Inseam)';
  } else if (w > 65) {
    STATE.userDna.silhouette = 'Pear & Hourglass';
    STATE.userDna.recommendedSizes.trouser = '27-29 Regular (31" Inseam)';
  } else {
    STATE.userDna.silhouette = 'Hourglass';
    STATE.userDna.recommendedSizes.trouser = '27-29 Regular (31" Inseam)';
  }

  renderStyleDnaPassport();
}

async function startCameraScan() {
  const videoElem = document.getElementById('scannerVideo');
  const btn = document.getElementById('btnStartCamera');
  const statusElem = document.getElementById('scannerStatusText');

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      if (statusElem) statusElem.innerText = "Requesting secure lens permission...";
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      STATE.cameraStream = stream;
      if (videoElem) {
        videoElem.srcObject = stream;
        videoElem.play();
      }
      if (statusElem) statusElem.innerText = "Live Photometric Feed Active • Point at wrist/cheek";
      if (btn) btn.innerHTML = `<span>Lens Active</span>`;
      return;
    } catch (err) {
      console.warn("Camera hardware access denied or unavailable; switching to simulation.", err);
    }
  }

  // Graceful simulation mode with live high-res loop
  if (statusElem) statusElem.innerText = "Smart Photometric Neural Simulator Running...";
  if (videoElem) {
    videoElem.src = "https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-an-indian-sari-walking-in-slow-motion-41235-large.mp4";
    videoElem.loop = true;
    videoElem.muted = true;
    videoElem.play().catch(() => {});
  }
}

function sampleSkinUndertone() {
  showToast("Scanning spectrophotometric pixels from target reticle... 🔬");

  // Sample RGB/HSV
  const samples = [
    { r: 217, g: 119, b: 87, profile: 'warm-autumn', name: 'Warm Golden / Terracotta' },
    { r: 222, g: 179, b: 173, profile: 'soft-summer', name: 'Cool Rose / Alabaster' },
    { r: 197, g: 160, b: 89, profile: 'warm-autumn', name: 'Warm Honey Olive' }
  ];

  const picked = samples[Math.floor(Math.random() * samples.length)];
  STATE.userDna.undertoneRgb = { r: picked.r, g: picked.g, b: picked.b };
  STATE.userDna.undertone = picked.profile;
  STATE.userDna.confidenceScore = 98.7;

  // Update sample swatch box
  const previewBox = document.getElementById('sampleColorBox');
  const rgbText = document.getElementById('sampleRgbText');
  if (previewBox) previewBox.style.backgroundColor = `rgb(${picked.r}, ${picked.g}, ${picked.b})`;
  if (rgbText) rgbText.innerText = `RGB(${picked.r}, ${picked.g}, ${picked.b}) • ${picked.name}`;

  renderStyleDnaPassport();
  updateHeaderPaletteBadge();
  showToast(`✨ Undertone classified: ${picked.name} with 98.7% accuracy!`);
}

function renderStyleDnaPassport() {
  const profile = COLOR_PROFILES[STATE.userDna.undertone] || COLOR_PROFILES['warm-autumn'];
  const passportTitle = document.getElementById('passportPaletteTitle');
  const passportTagline = document.getElementById('passportTagline');
  const passportSilhouette = document.getElementById('passportSilhouette');
  const passportSwatches = document.getElementById('passportSwatchesRow');
  const passportAdvice = document.getElementById('passportAdviceText');

  if (passportTitle) passportTitle.innerText = profile.name;
  if (passportTagline) passportTagline.innerText = `"${profile.tagline}"`;
  if (passportSilhouette) passportSilhouette.innerText = STATE.userDna.silhouette;
  if (passportAdvice) passportAdvice.innerText = profile.description;

  if (passportSwatches) {
    passportSwatches.innerHTML = profile.colors.map(c => `
      <div style="text-align: center;">
        <span style="display:inline-block; width:34px; height:34px; border-radius:50%; background-color:${c.hex}; border:1.5px solid rgba(0,0,0,0.1);"></span>
        <div style="font-size:0.68rem; font-weight:600; margin-top:3px; color:var(--text-espresso);">${c.name.split(' ')[0]}</div>
        <div style="font-size:0.6rem; color:var(--text-espresso-light);">${c.hex}</div>
      </div>
    `).join('');
  }
}

function applyStyleDnaToFeed() {
  updateHeaderPaletteBadge();
  initFeed();
  initCapsuleStore();
  navigateTo('viewFeed');
  showToast("Your Style DNA has personalized the recommendation feed & sizing! 🌟");
}

function updateHeaderPaletteBadge() {
  const profile = COLOR_PROFILES[STATE.userDna.undertone] || COLOR_PROFILES['warm-autumn'];
  const label = document.getElementById('headerPaletteLabel');
  const stack = document.getElementById('headerSwatchStack');

  if (label) label.innerText = profile.name.split(' ')[0] + " " + (profile.name.split(' ')[1] || '');
  if (stack) {
    stack.innerHTML = profile.colors.slice(0, 4).map(c => `
      <span class="swatch-dot" style="background-color: ${c.hex};"></span>
    `).join('');
  }
}

// ==========================================================================
// 3. PAGE 2: Algorithmic Recommendation Feed ("For You" Page)
// ==========================================================================
function initFeed() {
  const grid = document.getElementById('pinterestFeedGrid');
  if (!grid) return;

  const filteredLooks = getFilteredLooks();
  const counter = document.getElementById('feedItemCount');
  if (counter) counter.innerText = `Showing ${filteredLooks.length} tailored looks`;

  if (filteredLooks.length === 0) {
    grid.innerHTML = `
      <div style="column-span: all; text-align: center; padding: 4rem 1rem; background: #FFFFFF; border-radius: 20px; border: 1px dashed var(--border-delicate);">
        <h3 style="font-family: var(--font-serif-display); font-size: 1.5rem; margin-bottom: 0.5rem;">No exact aesthetic matches found</h3>
        <p style="color: var(--text-espresso-muted); margin-bottom: 1.25rem;">Try resetting your search or filter pill to 'All Looks'.</p>
        <button class="btn-secondary-pill" onclick="resetFeedFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredLooks.map(look => {
    const isPinned = STATE.savedPins.has(look.id);
    const dotsHtml = look.colorPalette.map(hex => `
      <span class="swatch-dot" style="background-color:${hex}; width:10px; height:10px;"></span>
    `).join('');

    const mediaHtml = look.hasVideo && look.videoUrl ? `
      <div class="pin-media-wrap" onmouseenter="playCardVideo('${look.id}')" onmouseleave="pauseCardVideo('${look.id}')">
        <span class="reel-indicator-tag">▶ Fabric Motion</span>
        <video id="video-${look.id}" class="pin-video" src="${look.videoUrl}" poster="${look.imageUrl}" loop muted playsinline></video>
      </div>
    ` : `
      <div class="pin-media-wrap">
        <img src="${look.imageUrl}" alt="${look.title}" class="pin-image" loading="lazy">
      </div>
    `;

    return `
      <article class="pin-card" onclick="openShopLookDrawer('${look.id}')">
        <div style="position: relative;">
          <!-- Save Pin Button -->
          <button 
            class="btn-save-pin ${isPinned ? 'pinned' : ''}" 
            onclick="togglePinLook(event, '${look.id}')"
            title="${isPinned ? 'Saved in Vault' : 'Save Pin'}"
            aria-label="Bookmark Pin"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>${isPinned ? 'Saved' : 'Pin'}</span>
          </button>

          ${mediaHtml}

          <!-- Hover Overlay -->
          <div class="pin-hover-overlay">
            <div class="overlay-match-glass">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:0.75rem; font-weight:700; color:#FEE2E2;">★ ${look.aiMatchScore}% FIT SYNERGY</span>
                <span style="font-size:0.68rem; color:rgba(255,255,255,0.7);">${STATE.userDna.silhouette}</span>
              </div>
              <p style="font-size:0.78rem; line-height:1.4; color:#FFFFFF;">${look.matchRationale}</p>
            </div>

            <!-- Slide-out Shop Look with Size Prefilled -->
            <button class="btn-shop-look-pill" onclick="event.stopPropagation(); openShopLookDrawer('${look.id}')">
              <span>Shop Look • Size ${STATE.userDna.recommendedSizes.shirt}</span>
              <span>$${look.priceTotal}</span>
            </button>
          </div>
        </div>

        <div style="padding: 1.15rem 1.25rem;">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            ${dotsHtml}
            <span style="font-size:0.7rem; color:var(--text-espresso-light);">${look.paletteName}</span>
          </div>
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--accent-terracotta); font-weight:700;">${look.category}</div>
          <h3 style="font-family:var(--font-serif-display); font-size:1.1rem; line-height:1.35; margin:3px 0 6px;">${look.title}</h3>
          
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
            ${look.tags.map(t => `<span style="font-size:0.68rem; padding:0.2rem 0.55rem; border-radius:999px; background:var(--bg-cream-soft); color:var(--text-espresso-muted);">${t}</span>`).join('')}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function getFilteredLooks() {
  return FASHION_DATA.filter(look => {
    let matchCat = true;
    if (STATE.activeFeedFilter !== 'all') {
      matchCat = look.tags.includes(STATE.activeFeedFilter) || look.category === STATE.activeFeedFilter;
    }

    let matchSearch = true;
    if (STATE.searchQuery.trim() !== '') {
      const q = STATE.searchQuery.toLowerCase();
      matchSearch = look.title.toLowerCase().includes(q) || 
                    look.category.toLowerCase().includes(q) ||
                    look.vibe.toLowerCase().includes(q) ||
                    look.tags.some(t => t.toLowerCase().includes(q));
    }

    return matchCat && matchSearch;
  });
}

function handleFeedFilter(filterVal, btnElem) {
  STATE.activeFeedFilter = filterVal;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  initFeed();
}

function resetFeedFilters() {
  STATE.searchQuery = '';
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) searchInput.value = '';
  handleFeedFilter('all', document.querySelector('.filter-pill[data-filter="all"]'));
}

function playCardVideo(lookId) {
  const vid = document.getElementById(`video-${lookId}`);
  if (vid) vid.play().catch(() => {});
}

function pauseCardVideo(lookId) {
  const vid = document.getElementById(`video-${lookId}`);
  if (vid) {
    vid.pause();
    vid.currentTime = 0;
  }
}

// Pinning Functionality
function togglePinLook(event, lookId) {
  if (event) event.stopPropagation();
  const look = FASHION_DATA.find(l => l.id === lookId) || CAPSULE_PRODUCTS.find(p => p.id === lookId);
  const title = look ? (look.title || look.name) : "Look";

  if (STATE.savedPins.has(lookId)) {
    STATE.savedPins.delete(lookId);
    showToast(`Removed "${title}" from your Wardrobe Vault`);
  } else {
    STATE.savedPins.add(lookId);
    showToast(`Pinned "${title}" to your Wardrobe Vault! ✨`);
  }

  updateVaultBadge();
  initFeed();
  renderWardrobeVaultList();
}

function updateVaultBadge() {
  const count = STATE.savedPins.size;
  const badge = document.getElementById('navVaultCount');
  if (badge) badge.innerText = `${count} Pins`;
}

// ==========================================================================
// 4. PAGE 3: Smart Wardrobe Vault & Remix Studio
// ==========================================================================
function initWardrobeVault() {
  renderWardrobeVaultList();
  renderClosetRemixCarousel();
  updateRemixSynergy();

  // Setup drag-and-drop
  const dropZone = document.getElementById('vaultDropZone');
  const fileInput = document.getElementById('vaultFileInput');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processUploadedGarment(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processUploadedGarment(e.target.files[0]);
      }
    });
  }
}

function processUploadedGarment(file) {
  showToast("Digitizing garment silhouette, fabric grain, and colorimetry... 📸");

  const reader = new FileReader();
  reader.onload = (e) => {
    const newId = `closet-${Date.now()}`;
    const newItem = {
      id: newId,
      name: file.name.replace(/\.[^/.]+$/, "").substring(0, 24) || "Uploaded Staple",
      category: "Tops",
      color: "#D97757",
      image: e.target.result,
      pairsWith: ["capsule-03", "capsule-01"],
      suggestionText: "Pair with The Tailored Elastic-Back Drape Trouser for an architectural silhouette with 99.4% synergy."
    };

    STATE.userCloset.unshift(newItem);
    STATE.selectedClosetId = newId;

    renderClosetRemixCarousel();
    updateRemixSynergy();
    showToast("✨ Garment digitized & added to your closet vault!");
  };
  reader.readAsDataURL(file);
}

function renderClosetRemixCarousel() {
  const container = document.getElementById('closetItemsGrid');
  if (!container) return;

  container.innerHTML = STATE.userCloset.map(item => `
    <div class="closet-item-card ${item.id === STATE.selectedClosetId ? 'selected' : ''}" onclick="selectClosetItem('${item.id}')">
      <img src="${item.image}" alt="${item.name}" class="closet-item-img">
      <div style="font-size:0.78rem; font-weight:700; color:var(--text-espresso);">${item.name}</div>
      <div style="font-size:0.68rem; color:var(--accent-terracotta); font-weight:600;">${item.category}</div>
    </div>
  `).join('');
}

function selectClosetItem(id) {
  STATE.selectedClosetId = id;
  renderClosetRemixCarousel();
  updateRemixSynergy();
}

function updateRemixSynergy() {
  const item = STATE.userCloset.find(c => c.id === STATE.selectedClosetId) || STATE.userCloset[0];
  if (!item) return;

  const pairedLookId = item.pairsWith ? item.pairsWith[0] : 'capsule-03';
  const pairedProduct = CAPSULE_PRODUCTS.find(p => p.id === pairedLookId) || FASHION_DATA.find(f => f.id === pairedLookId) || CAPSULE_PRODUCTS[2];

  const userImg = document.getElementById('remixUserImg');
  const userTitle = document.getElementById('remixUserTitle');
  const catalogImg = document.getElementById('remixCatalogImg');
  const catalogTitle = document.getElementById('remixCatalogTitle');
  const synergyScore = document.getElementById('remixSynergyScore');
  const formulaText = document.getElementById('remixFormulaText');

  if (userImg) userImg.src = item.image;
  if (userTitle) userTitle.innerText = item.name;
  if (catalogImg) catalogImg.src = pairedProduct.imageUrl || (pairedProduct.colors ? pairedProduct.colors[0].img : '');
  if (catalogTitle) catalogTitle.innerText = pairedProduct.title || pairedProduct.name;
  if (synergyScore) synergyScore.innerText = "99.4% Match";
  if (formulaText) formulaText.innerText = item.suggestionText;
}

function renderWardrobeVaultList() {
  const container = document.getElementById('vaultPinnedGrid');
  if (!container) return;

  const savedIds = Array.from(STATE.savedPins);
  const allItems = [...FASHION_DATA, ...CAPSULE_PRODUCTS];
  const pinnedItems = allItems.filter(item => savedIds.includes(item.id));

  if (pinnedItems.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
        <p style="color:var(--text-espresso-muted);">You have not pinned any looks yet. Tap the bookmark pin on any item in the Feed to save it here.</p>
        <button class="btn-secondary-pill" onclick="navigateTo('viewFeed')">Browse Feed Inspiration</button>
      </div>
    `;
    return;
  }

  container.innerHTML = pinnedItems.map(item => `
    <div style="background:#FFFFFF; border:1px solid var(--border-delicate); border-radius:16px; overflow:hidden; position:relative;">
      <img src="${item.imageUrl || item.colors[0].img}" alt="${item.title || item.name}" style="width:100%; height:180px; object-fit:cover;">
      <button onclick="togglePinLook(event, '${item.id}')" style="position:absolute; top:8px; right:8px; width:26px; height:26px; border-radius:50%; background:rgba(0,0,0,0.6); color:#FFFFFF; font-size:0.8rem; display:flex; align-items:center; justify-content:center;">&times;</button>
      <div style="padding:0.85rem;">
        <div style="font-family:var(--font-serif-display); font-size:0.95rem; font-weight:600; line-height:1.25;">${item.title || item.name}</div>
        <div style="font-size:0.75rem; color:var(--accent-terracotta); font-weight:700; margin-top:3px;">$${item.priceTotal || item.price}</div>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// 5. PAGE 4: Real-Time Model Performance & Evaluation Dashboard (Admin)
// ==========================================================================
function initAdminDashboard() {
  renderAdminModelMetrics();
  renderDatasetManagement();
}

function toggleAdminModel(modelKey) {
  STATE.activeAdminModel = modelKey;

  document.querySelectorAll('.ab-toggle-btn').forEach(b => {
    if (b.getAttribute('data-model') === modelKey) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  renderAdminModelMetrics();
  showToast(`Switched telemetry to ${modelKey.toUpperCase()}! Metrics recalculated.`);
}

function renderAdminModelMetrics() {
  const data = MODEL_EVALUATION_DATA[STATE.activeAdminModel];
  if (!data) return;

  const modelTitle = document.getElementById('adminModelTitle');
  const modelArch = document.getElementById('adminModelArch');
  const metricAcc = document.getElementById('metricAccuracy');
  const metricPrec = document.getElementById('metricPrecision');
  const metricRec = document.getElementById('metricRecall');
  const metricF1 = document.getElementById('metricF1');
  const metricReturn = document.getElementById('metricReturnRate');

  if (modelTitle) modelTitle.innerText = data.modelName;
  if (modelArch) modelArch.innerText = `${data.architecture} • Latency: ${data.latencyMs}ms (${data.inferenceEngine})`;

  if (metricAcc) metricAcc.innerText = `${data.accuracy}%`;
  if (metricPrec) metricPrec.innerText = `${data.precision}%`;
  if (metricRec) metricRec.innerText = `${data.recall}%`;
  if (metricF1) metricF1.innerText = `${data.f1Score}%`;
  if (metricReturn) metricReturn.innerText = `${data.returnRate}%`;

  // Render Confusion Matrix Cells
  const cm = data.confusionMatrix;
  const cellTp = document.getElementById('cmCellTp');
  const cellFp = document.getElementById('cmCellFp');
  const cellFn = document.getElementById('cmCellFn');
  const cellTn = document.getElementById('cmCellTn');

  if (cellTp) cellTp.innerText = cm.tp.toLocaleString();
  if (cellFp) cellFp.innerText = cm.fp.toLocaleString();
  if (cellFn) cellFn.innerText = cm.fn.toLocaleString();
  if (cellTn) cellTn.innerText = cm.tn.toLocaleString();
}

function inspectConfusionCell(cellType) {
  const data = MODEL_EVALUATION_DATA[STATE.activeAdminModel];
  const testCase = data.sampleTestCases.find(c => c.type === cellType) || data.sampleTestCases[0];

  const drawer = document.getElementById('inspectTestDrawer');
  const body = document.getElementById('inspectTestDrawerBody');
  if (!drawer || !body) return;

  body.innerHTML = `
    <div style="background:var(--bg-cream-soft); border:1px solid var(--border-delicate); border-radius:18px; padding:1.5rem; margin-bottom:1.5rem;">
      <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; font-weight:700; color:var(--accent-terracotta);">Test Case Telemetry ID: ${testCase.id}</div>
      <h3 style="font-family:var(--font-serif-display); font-size:1.35rem; margin:0.4rem 0 0.85rem;">Classification: ${cellType === 'TP' ? 'True Positive (Correct Fit Kept)' : cellType === 'FP' ? 'False Positive (Garment Returned)' : cellType === 'FN' ? 'False Negative (Under-Recommended)' : 'True Negative (Accurate Rejection)'}</h3>
      <div style="font-size:0.85rem; line-height:1.5; color:var(--text-espresso);"><strong>User Anthropometrics:</strong> ${testCase.userMetrics}</div>
      <div style="font-size:0.85rem; line-height:1.5; color:var(--text-espresso); margin-top:4px;"><strong>Target Garment:</strong> ${testCase.garment}</div>
    </div>

    <div style="background:#FFFFFF; border:1px solid var(--border-delicate); border-radius:18px; padding:1.5rem; margin-bottom:1.5rem;">
      <h4 style="font-size:0.85rem; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.4rem; color:var(--text-espresso);">Neural Engine Diagnosis</h4>
      <p style="font-size:0.88rem; line-height:1.55; color:var(--text-espresso-muted);">${testCase.verdict}</p>
    </div>

    <div style="background:rgba(217,119,87,0.1); border:1px solid rgba(217,119,87,0.25); border-radius:18px; padding:1.25rem;">
      <h4 style="font-size:0.82rem; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.35rem; color:var(--accent-terracotta);">Architecture Mitigation Note</h4>
      <p style="font-size:0.85rem; line-height:1.5; color:var(--text-espresso);">${testCase.improvementNote}</p>
    </div>
  `;

  drawer.classList.add('active');
}

function closeInspectDrawer() {
  const drawer = document.getElementById('inspectTestDrawer');
  if (drawer) drawer.classList.remove('active');
}

function renderDatasetManagement() {
  const ds = MODEL_EVALUATION_DATA.datasetManagement;
  const countElem = document.getElementById('dsTotalCount');
  const splitElem = document.getElementById('dsTrainSplit');
  const undertoneBars = document.getElementById('dsUndertoneBars');
  const silhouetteBars = document.getElementById('dsSilhouetteBars');

  if (countElem) countElem.innerText = `${ds.totalSamples.toLocaleString()} labeled 3D scans`;
  if (splitElem) splitElem.innerText = ds.trainTestSplit;

  if (undertoneBars) {
    undertoneBars.innerHTML = ds.undertoneDistribution.map(u => `
      <div style="margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; margin-bottom:3px;">
          <span>${u.label}</span>
          <span>${u.pct}%</span>
        </div>
        <div style="height:6px; background:rgba(0,0,0,0.06); border-radius:999px; overflow:hidden;">
          <div style="width:${u.pct}%; height:100%; background:${u.hex};"></div>
        </div>
      </div>
    `).join('');
  }

  if (silhouetteBars) {
    silhouetteBars.innerHTML = ds.silhouetteDistribution.map(s => `
      <div style="margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; margin-bottom:3px;">
          <span>${s.label}</span>
          <span>${s.pct}%</span>
        </div>
        <div style="height:6px; background:rgba(0,0,0,0.06); border-radius:999px; overflow:hidden;">
          <div style="width:${s.pct}%; height:100%; background:var(--accent-terracotta);"></div>
        </div>
      </div>
    `).join('');
  }
}

// ==========================================================================
// 6. PAGE 5: Product Catalog & Storefront (3 Capsule Items)
// ==========================================================================
function initCapsuleStore() {
  const container = document.getElementById('capsuleStoreGrid');
  if (!container) return;

  container.innerHTML = CAPSULE_PRODUCTS.map(product => {
    const isPinned = STATE.savedPins.has(product.id);
    const primaryImg = product.colors[0].img;

    return `
      <div class="capsule-product-card">
        <div>
          <div class="capsule-card-img-wrap">
            <span class="capsule-fit-score-badge">★ ${product.fitConfidenceScore}% Match for ${STATE.userDna.silhouette}</span>
            <img id="store-img-${product.id}" src="${primaryImg}" alt="${product.name}" class="capsule-card-img">
          </div>

          <div style="padding: 1.75rem 1.75rem 0.5rem;">
            <!-- Color Selector Chips -->
            <div style="display:flex; gap:0.4rem; align-items:center; margin-bottom:0.75rem;">
              ${product.colors.map((c, idx) => `
                <button 
                  onclick="changeProductColor('${product.id}', '${c.img}', '${c.name}', this)"
                  style="width:20px; height:20px; border-radius:50%; background-color:${c.hex}; border:${idx === 0 ? '2px solid var(--text-espresso)' : '1px solid rgba(0,0,0,0.1)'};"
                  title="${c.name}"
                ></button>
              `).join('')}
              <span id="store-color-name-${product.id}" style="font-size:0.75rem; color:var(--text-espresso-muted); margin-left:4px;">${product.colors[0].name}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.35rem;">
              <h3 style="font-family:var(--font-serif-display); font-size:1.35rem; line-height:1.25;">${product.name}</h3>
              <span style="font-family:var(--font-serif-display); font-size:1.4rem; font-weight:700; color:var(--accent-terracotta);">$${product.price}</span>
            </div>

            <p style="font-size:0.82rem; color:var(--text-espresso-muted); margin-bottom:1rem; line-height:1.45;">${product.tagline}</p>

            <!-- Fabric origin card -->
            <div style="background:var(--bg-cream-soft); border:1px solid var(--border-delicate); border-radius:14px; padding:0.85rem 1rem; margin-bottom:1.1rem;">
              <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent-terracotta);">Artisan Fabric Origin:</div>
              <div style="font-size:0.8rem; font-weight:600; color:var(--text-espresso);">${product.fabricSource.material}</div>
              <div style="font-size:0.72rem; color:var(--text-espresso-light);">${product.fabricSource.origin} • ${product.fabricSource.certification}</div>
            </div>

            <!-- Size Selector Pre-filled by Style DNA -->
            <div style="margin-bottom:1.25rem;">
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; margin-bottom:0.4rem;">
                <span style="text-transform:uppercase; color:var(--text-espresso);">Select Size:</span>
                <span style="color:var(--accent-terracotta);">AI Suggested: ${product.sizes[1]}</span>
              </div>
              <div style="display:flex; gap:0.4rem; flex-wrap:wrap;" id="sizes-row-${product.id}">
                ${product.sizes.map((s, idx) => `
                  <button 
                    class="select-chip ${idx === 1 ? 'selected' : ''}" 
                    style="font-size:0.72rem; padding:0.3rem 0.65rem;"
                    onclick="selectSize('${product.id}', this)"
                  >${s}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <div style="padding: 0 1.75rem 1.75rem;">
          <button 
            class="btn-style-scan" 
            style="width:100%; justify-content:center;"
            onclick="addStoreItemToCart('${product.id}')"
          >
            <span>Add to Bag • $${product.price}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function changeProductColor(productId, imgUrl, colorName, btn) {
  const img = document.getElementById(`store-img-${productId}`);
  const nameLabel = document.getElementById(`store-color-name-${productId}`);
  if (img) img.src = imgUrl;
  if (nameLabel) nameLabel.innerText = colorName;

  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('button').forEach(b => b.style.border = '1px solid rgba(0,0,0,0.1)');
    btn.style.border = '2px solid var(--text-espresso)';
  }
}

function selectSize(productId, btn) {
  const row = document.getElementById(`sizes-row-${productId}`);
  if (row) {
    row.querySelectorAll('.select-chip').forEach(c => c.classList.remove('selected'));
  }
  btn.classList.add('selected');
}

function addStoreItemToCart(productId) {
  const product = CAPSULE_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = STATE.cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    STATE.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: product.sizes[1],
      color: product.colors[0].name,
      image: product.colors[0].img,
      quantity: 1
    });
  }

  updateCartBadge();
  openCartDrawer();
  showToast(`Added "${product.name}" to your bag! 🛍️`);
}

// ==========================================================================
// 7. Shopping Bag Flyout Drawer
// ==========================================================================
function openCartDrawer() {
  renderCartDrawer();
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.add('active');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.remove('active');
}

function updateCartBadge() {
  const count = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartBadgeCount');
  if (badge) badge.innerText = count;
}

function renderCartDrawer() {
  const container = document.getElementById('cartItemsList');
  const subtotalElem = document.getElementById('cartSubtotal');
  if (!container) return;

  if (STATE.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="margin-bottom: 1rem; color: var(--accent-blush);">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        </svg>
        <h4 style="font-family: var(--font-serif-display); font-size: 1.25rem; margin-bottom: 0.5rem;">Your bag is currently empty</h4>
        <p style="font-size: 0.85rem; color: var(--text-espresso-muted); margin-bottom: 1.5rem;">Discover our 3 launch capsule items or save pins from the Feed.</p>
        <button class="btn-secondary-pill" onclick="closeCartDrawer(); navigateTo('viewStore');">Explore Capsule Items</button>
      </div>
    `;
    if (subtotalElem) subtotalElem.innerText = "$0.00";
    return;
  }

  let subtotal = 0;
  container.innerHTML = STATE.cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border-subtle); align-items: center;">
        <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 90px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border-delicate);">
        <div style="flex: 1;">
          <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-espresso); line-height: 1.3;">${item.name}</h4>
          <div style="font-size: 0.75rem; color: var(--text-espresso-light); margin: 2px 0 6px;">${item.color} • ${item.size}</div>
          
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; border: 1px solid var(--border-delicate); border-radius: 99px; background: #FFFFFF;">
              <button onclick="updateCartQuantity('${item.id}', -1)" style="padding: 0.2rem 0.55rem; font-size: 0.9rem; color: var(--text-espresso);">-</button>
              <span style="font-size: 0.8rem; font-weight: 600; padding: 0 0.35rem;">${item.quantity}</span>
              <button onclick="updateCartQuantity('${item.id}', 1)" style="padding: 0.2rem 0.55rem; font-size: 0.9rem; color: var(--text-espresso);">+</button>
            </div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-espresso);">$${itemTotal}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (STATE.promoDiscount > 0) {
    const discount = subtotal * STATE.promoDiscount;
    const finalTotal = subtotal - discount;
    if (subtotalElem) subtotalElem.innerHTML = `<span style="text-decoration:line-through; opacity:0.5; margin-right:6px;">$${subtotal.toFixed(2)}</span>$${finalTotal.toFixed(2)} (-15%)`;
  } else {
    if (subtotalElem) subtotalElem.innerText = `$${subtotal.toFixed(2)}`;
  }
}

function updateCartQuantity(itemId, delta) {
  const item = STATE.cart.find(i => i.id === itemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    STATE.cart = STATE.cart.filter(i => i.id !== itemId);
  }
  updateCartBadge();
  renderCartDrawer();
}

function applyPromoCode() {
  const input = document.getElementById('promoInput');
  if (!input) return;

  if (input.value.trim().toUpperCase() === 'AURA15') {
    STATE.promoDiscount = 0.15;
    showToast("Promo code AURA15 applied! 15% discount granted ✨");
    renderCartDrawer();
  } else {
    showToast("Invalid code. Use 'AURA15' for 15% off.");
  }
}

function simulateCheckout() {
  if (STATE.cart.length === 0) {
    showToast("Your bag is empty! Add items first.");
    return;
  }
  showToast("Connecting to Atelier High-Speed Sizing Checkout... 💳");
  setTimeout(() => {
    alert("Order Confirmed! Your items are calibrated to your 10-Second Style DNA scan. A tracking dossier and zero-waste tailoring certificate have been sent to your email.");
    STATE.cart = [];
    updateCartBadge();
    renderCartDrawer();
    closeCartDrawer();
  }, 800);
}

// ==========================================================================
// 8. Modals (Shop Look, Manifesto, Sizing Science, Privacy Policy)
// ==========================================================================
function openShopLookDrawer(lookId) {
  const look = FASHION_DATA.find(l => l.id === lookId);
  if (!look) return;

  const modal = document.getElementById('shopLookModal');
  const container = document.getElementById('shopLookContent');
  if (!modal || !container) return;

  const isPinned = STATE.savedPins.has(look.id);

  container.innerHTML = `
    <div style="position: relative;">
      <img src="${look.imageUrl}" alt="${look.title}" style="width: 100%; border-radius: 18px; object-fit: cover; max-height: 520px; box-shadow: var(--shadow-soft);">
      
      <div style="margin-top: 1rem; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          ${look.colorPalette.map(hex => `<span class="swatch-dot" style="background-color:${hex}; width:16px; height:16px;"></span>`).join('')}
          <span style="font-size: 0.78rem; font-weight: 600; margin-left: 4px;">${look.paletteName}</span>
        </div>
        <button class="btn-save-pin ${isPinned ? 'pinned' : ''}" onclick="togglePinLook(event, '${look.id}'); openShopLookDrawer('${look.id}');">
          <span>${isPinned ? 'Saved in Vault' : 'Save Pin'}</span>
        </button>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-terracotta); font-weight: 700;">${look.category}</span>
          <span style="font-size: 0.8rem; background: rgba(217,119,87,0.12); color: var(--accent-terracotta); padding: 0.2rem 0.6rem; border-radius: 99px; font-weight: 700;">★ ${look.aiMatchScore}% Fit Score</span>
        </div>

        <h2 style="font-family: var(--font-serif-display); font-size: 1.8rem; line-height: 1.25; margin-bottom: 0.75rem;">${look.title}</h2>
        <p style="font-size: 0.85rem; color: var(--text-espresso-muted); line-height: 1.5; margin-bottom: 1.25rem;">${look.matchRationale}</p>

        <!-- Garments in Look -->
        <div style="border-top: 1px solid var(--border-delicate); border-bottom: 1px solid var(--border-delicate); padding: 1rem 0; margin-bottom: 1.25rem;">
          <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">Garments in this Look (${look.items.length}):</div>
          
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${look.items.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border-subtle);">
                <div>
                  <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-espresso);">${item.name}</div>
                  <div style="font-size: 0.75rem; color: var(--text-espresso-light);">Color: ${item.color} • Pre-filled Size: ${STATE.userDna.recommendedSizes.shirt}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-espresso);">$${item.price}</div>
                  <button 
                    onclick="addCustomItemToCart('${item.id}', '${item.name}', ${item.price}, '${item.color}', '${look.imageUrl}')"
                    style="font-size: 0.75rem; color: var(--accent-terracotta); font-weight: 700; text-decoration: underline; margin-top: 2px;"
                  >+ Add Item</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="background: var(--bg-cream-soft); padding: 1.2rem; border-radius: 16px; border: 1px solid var(--border-delicate);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="font-size: 0.9rem; font-weight: 600;">Complete Look Package:</span>
          <span style="font-family: var(--font-serif-display); font-size: 1.4rem; font-weight: 700; color: var(--accent-terracotta);">$${look.priceTotal}</span>
        </div>
        <button class="btn-style-scan" style="width: 100%; justify-content: center;" onclick="addAllLookItemsToCart('${look.id}')">
          <span>Add Complete Look to Bag</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeShopLookModal() {
  const modal = document.getElementById('shopLookModal');
  if (modal) modal.classList.remove('active');
}

function addCustomItemToCart(id, name, price, color, img) {
  STATE.cart.push({
    id,
    name,
    price,
    color,
    image: img,
    size: STATE.userDna.recommendedSizes.shirt,
    quantity: 1
  });
  updateCartBadge();
  showToast(`Added "${name}" to your bag!`);
}

function addAllLookItemsToCart(lookId) {
  const look = FASHION_DATA.find(l => l.id === lookId);
  if (!look) return;

  look.items.forEach(item => {
    STATE.cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      color: item.color,
      image: look.imageUrl,
      size: STATE.userDna.recommendedSizes.shirt,
      quantity: 1
    });
  });

  updateCartBadge();
  closeShopLookModal();
  openCartDrawer();
  showToast(`All pieces for "${look.title}" added to your bag!`);
}

function openManifestoModal() {
  openGenericModal(
    "The Anti-Fast-Fashion Manifesto",
    "Why Sizing Precision is an Act of Environmental Justice",
    `
      <p style="margin-bottom:1rem; line-height:1.6;">Every year, over <strong>$218 Billion</strong> in women's apparel is returned globally. An astounding 70% of those returned garments end up incinerated or rotting in Atacama desert landfills because reverse logistics is costlier than discarding inventory.</p>
      <p style="margin-bottom:1rem; line-height:1.6;">The root cause is not indecisive consumers. It is the archaic, monolithic S/M/L sizing paradigm that treats women's diverse bodies as flat rectangular cookie cutters while ignoring undertone reflectance.</p>
      <p style="line-height:1.6;">At <strong>AURA ATELIER</strong>, we design ethical, capsule garments tailored to biometric drape physics. By uniting 10-second neural colorimetry with flexible internal waist architecture, we slash returns from the 38% industry average to <strong>4.8%</strong>. Buy less, wear more, love forever.</p>
    `
  );
}

function openSizingScienceModal() {
  openGenericModal(
    "The Sizing Science & Photometric Mesh",
    "Finite Element Garment Modeling Meets Photometric AI",
    `
      <p style="margin-bottom:1rem; line-height:1.6;">Standard sizing tables rely on only 2 measurements: bust and hip circumference. They fail to calculate:</p>
      <ul style="margin-left:1.5rem; margin-bottom:1.25rem; line-height:1.6;">
        <li><strong>Torso-to-Femur Angle:</strong> Dictates whether high-rise trousers bunch or hang flat.</li>
        <li><strong>Bust Apex to Ribcage Drop:</strong> Governs wrap dress closure without gaping.</li>
        <li><strong>Colorimetric Spectrophotometry:</strong> Measures melanin and carotene ratios to prevent washed-out sallow skin tones.</li>
      </ul>
      <p style="line-height:1.6;">Our Model V2 combines DensePose pose-estimation with finite-element cloth drape simulation, calculating stress tension across 1,400 polygon mesh points in 38 milliseconds.</p>
    `
  );
}

function openPrivacyPolicyModal() {
  openGenericModal(
    "Biometric Privacy Guarantee",
    "Zero-Incentive, On-Device Neural Processing",
    `
      <p style="margin-bottom:1rem; line-height:1.6;">Your body geometry, skin reflectance, and wardrobe photos are intimate personal data. We hold a strict <strong>Zero-Incentive Biometric Privacy Architecture</strong>:</p>
      <ul style="margin-left:1.5rem; margin-bottom:1.25rem; line-height:1.6;">
        <li>Camera scan frames are processed <strong>entirely locally in WebAssembly and WebGL</strong> on your device.</li>
        <li>Raw photos are never saved to our cloud servers; only anonymized coordinate tokens are retained in your encrypted session.</li>
        <li>We will never sell, license, or monetize customer biometric profiles to third-party ad brokers.</li>
      </ul>
    `
  );
}

function openGenericModal(title, subtitle, contentHtml) {
  const modal = document.getElementById('genericModal');
  const titleElem = document.getElementById('genericModalTitle');
  const subElem = document.getElementById('genericModalSubtitle');
  const bodyElem = document.getElementById('genericModalBody');

  if (titleElem) titleElem.innerText = title;
  if (subElem) subElem.innerText = subtitle;
  if (bodyElem) bodyElem.innerHTML = contentHtml;
  if (modal) modal.classList.add('active');
}

function closeGenericModal() {
  const modal = document.getElementById('genericModal');
  if (modal) modal.classList.remove('active');
}

function handleWaitlistSignup(e) {
  e.preventDefault();
  const input = document.getElementById('waitlistInput');
  if (!input) return;

  const email = input.value;
  showToast(`Welcome to the Atelier Circle, ${email}! 15% discount code AURA15 activated.`);
  input.value = '';
}

function handleBackdropClick(e, id) {
  if (e.target.id === id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }
}

// Toast notification helper
function showToast(msg) {
  const shelf = document.getElementById('toastShelf');
  if (!shelf) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
    <span>${msg}</span>
  `;

  shelf.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
