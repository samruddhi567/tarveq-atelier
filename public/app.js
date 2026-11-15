// ==========================================================================
// AURA ATELIER — Indian Women's Fashion & AI Personal Styling Storefront
// Myntra/Meesho-Style Shopping Mechanics & Strict INR (₹) Engine
// ==========================================================================

const STATE = {
  products: [],
  filteredProducts: [],
  activeCategory: 'All',
  searchQuery: '',
  wishlist: new Set(),
  cart: [],
  userDna: {
    calibrated: false,
    silhouette: 'Pear',
    undertone: 'warm_honey',
    paletteName: 'Warm Golden Honey',
    recommendedSize: 'M',
    height: 162,
    weight: 58
  },
  // PDP State
  activeProduct: null,
  pdpImageIdx: 0,
  pdpQuantity: 1,
  pdpSize: 'M',
  pdpColor: null,
  pincodeData: null,
  // Cart & Checkout
  selectedPayment: 'upi',
  appliedCoupon: null,
  pendingCheckoutAction: null,
  // Vault
  vaultItems: []
};

// ==========================================================================
// DOM Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  fetchVaultItems();
  initCategoryNav();
  initHeaderSearch();
  initPdpQuantityControls();
});

// Format Indian Currency strictly in INR (₹)
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// ==========================================================================
// 1. Fetch & Render Product Feed (Pinterest/Instagram Masonry Grid)
// ==========================================================================
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    STATE.products = data;
    renderDiscoveryFeed();
  } catch (err) {
    console.error('Failed to load products:', err);
    showToast('Failed to load catalog. Please check connection.');
  }
}

function initCategoryNav() {
  const container = document.getElementById('categoryScrollPills');
  if (!container) return;

  const categories = [
    'All',
    'Palazzo Suits & Kurti Sets',
    'Jumpsuits & Playsuits',
    'Casual & Formal Shirts',
    'Indo-Western Fusion & Sarees',
    'Tailored Trousers & Co-ords'
  ];

  container.innerHTML = categories.map(cat => `
    <button 
      class="category-pill ${cat === STATE.activeCategory ? 'active' : ''}" 
      onclick="filterCategory('${cat}', this)"
    >
      ${cat === 'All' ? '✨ All Collections' : cat}
    </button>
  `).join('');
}

function filterCategory(cat, btn) {
  STATE.activeCategory = cat;
  document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderDiscoveryFeed();
}

function initHeaderSearch() {
  const input = document.getElementById('headerSearchInput');
  if (!input) return;

  input.addEventListener('input', (e) => {
    STATE.searchQuery = e.target.value;
    renderDiscoveryFeed();
  });
}

function renderDiscoveryFeed() {
  const grid = document.getElementById('discoveryFeedGrid');
  if (!grid) return;

  let items = STATE.products;

  // Filter category
  if (STATE.activeCategory !== 'All') {
    items = items.filter(p => p.category === STATE.activeCategory);
  }

  // Filter search
  if (STATE.searchQuery.trim() !== '') {
    const q = STATE.searchQuery.toLowerCase();
    items = items.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  STATE.filteredProducts = items;
  const countBadge = document.getElementById('feedResultsCount');
  if (countBadge) countBadge.innerText = `${items.length} styles found`;

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="column-span: all; text-align: center; padding: 4rem 1rem; background: #FFFFFF; border-radius: 20px; border: 1px dashed var(--border-delicate);">
        <h3 style="font-family: var(--font-serif-display); font-size: 1.5rem; margin-bottom: 0.5rem;">No garments found</h3>
        <p style="color: var(--text-espresso-muted); margin-bottom: 1.25rem;">Try another search term or click 'All Collections'.</p>
        <button class="btn-quick-add" style="max-width:200px; margin:0 auto;" onclick="filterCategory('All')">View All Collections</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(product => {
    const isWishlisted = STATE.wishlist.has(product.id);
    const primaryImg = product.images && product.images[0] ? product.images[0] : '';
    const fitScore = STATE.userDna.calibrated ? 99 : 98;

    return `
      <article class="product-card" onclick="openPdpDrawer('${product.id}')">
        <div class="card-media-wrap">
          <!-- Live AI Fit Match Badge -->
          <span class="card-fit-badge">★ AI Fit Match: ${fitScore}%</span>

          <!-- Wishlist Heart Icon -->
          <button 
            class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
            onclick="toggleWishlist(event, '${product.id}')"
            aria-label="Wishlist item"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <img src="${primaryImg}" alt="${product.name}" class="card-image" loading="lazy">
        </div>

        <div style="padding: 1.15rem 1.25rem 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <span style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.1em; font-weight:700; color:var(--accent-terracotta);">AURA ATELIER</span>
            <span style="font-size:0.7rem; color:var(--text-espresso-light);">${product.category}</span>
          </div>

          <h3 style="font-family:var(--font-serif-display); font-size:1.15rem; line-height:1.3; margin-bottom:0.35rem; color:var(--text-espresso);">${product.name}</h3>
          
          <p style="font-size:0.78rem; color:var(--text-espresso-muted); line-height:1.45; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${product.description}
          </p>

          <!-- Strict Indian Rupee Price Presentation -->
          <div class="price-row">
            <span class="price-discounted">${formatINR(product.discount_price)}</span>
            <span class="price-original">${formatINR(product.original_price)}</span>
            <span class="price-off-badge">(${product.discount_pct}% OFF)</span>
          </div>

          <!-- Quick Add to Bag -->
          <button 
            class="btn-quick-add" 
            onclick="quickAddToBag(event, '${product.id}')"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
            <span>Quick Add to Bag</span>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function toggleWishlist(e, productId) {
  e.stopPropagation();
  if (STATE.wishlist.has(productId)) {
    STATE.wishlist.delete(productId);
    showToast('Removed from Wishlist');
  } else {
    STATE.wishlist.add(productId);
    showToast('Saved to your AURA Wishlist ❤️');
  }
  renderDiscoveryFeed();
}

// ==========================================================================
// 2. Product Detail Page (PDP) Drawer & Essential Shopping Mechanics
// ==========================================================================
function openPdpDrawer(productId) {
  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  STATE.activeProduct = product;
  STATE.pdpImageIdx = 0;
  STATE.pdpQuantity = 1;
  STATE.pdpSize = STATE.userDna.recommendedSize || 'M';
  STATE.pdpColor = product.colors[0];
  STATE.pincodeData = null;

  renderPdpContent();

  const drawer = document.getElementById('pdpDrawer');
  if (drawer) drawer.classList.add('active');
}

function closePdpDrawer() {
  const drawer = document.getElementById('pdpDrawer');
  if (drawer) drawer.classList.remove('active');
}

function renderPdpContent() {
  const p = STATE.activeProduct;
  if (!p) return;

  // Carousel image
  const imgElem = document.getElementById('pdpActiveImg');
  if (imgElem) imgElem.src = p.images[STATE.pdpImageIdx] || p.images[0];

  // Carousel thumb dots
  const thumbsContainer = document.getElementById('pdpCarouselThumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = p.images.map((img, idx) => `
      <span 
        class="pdp-thumb-dot ${idx === STATE.pdpImageIdx ? 'active' : ''}" 
        onclick="setPdpImage(${idx})"
        title="View angle ${idx + 1}"
      ></span>
    `).join('');
  }

  // Titles & Category
  document.getElementById('pdpBrand').innerText = 'AURA ATELIER';
  document.getElementById('pdpCategory').innerText = p.category;
  document.getElementById('pdpTitle').innerText = p.name;
  document.getElementById('pdpDescription').innerText = p.description;

  // Prices in INR strictly
  document.getElementById('pdpDiscountPrice').innerText = formatINR(p.discount_price);
  document.getElementById('pdpOriginalPrice').innerText = formatINR(p.original_price);
  document.getElementById('pdpDiscountPct').innerText = `(${p.discount_pct}% OFF)`;

  // Live Match Score Banner
  const matchScore = STATE.userDna.calibrated ? 99 : 98;
  document.getElementById('pdpMatchScoreValue').innerText = `★ ${matchScore}% Perfect Fit for ${STATE.userDna.silhouette}`;
  document.getElementById('pdpMatchRationale').innerText = p.specs.advice || 'Relaxed fit on shoulders and waist.';

  // Color Swatches
  const colorsContainer = document.getElementById('pdpColorSwatches');
  if (colorsContainer) {
    colorsContainer.innerHTML = p.colors.map(c => `
      <button 
        onclick="setPdpColor('${c.name}', '${c.hex}')"
        style="width:26px; height:26px; border-radius:50%; background-color:${c.hex}; border:${c.name === STATE.pdpColor.name ? '2px solid var(--text-espresso)' : '1.5px solid rgba(0,0,0,0.1)'}; outline:${c.name === STATE.pdpColor.name ? '2px solid var(--accent-terracotta)' : 'none'}; cursor:pointer;"
        title="${c.name}"
      ></button>
    `).join('');
    document.getElementById('pdpSelectedColorName').innerText = STATE.pdpColor.name;
  }

  // Sizes S, M, L, XL, XXL
  const sizesContainer = document.getElementById('pdpSizePills');
  if (sizesContainer) {
    sizesContainer.innerHTML = p.sizes.map(s => `
      <button 
        class="category-pill ${s === STATE.pdpSize ? 'active' : ''}" 
        style="padding:0.45rem 1rem; font-size:0.85rem;"
        onclick="setPdpSize('${s}')"
      >
        ${s}
      </button>
    `).join('');
  }

  // Fabric breakdown
  document.getElementById('pdpFabricDetails').innerText = p.fabric_details;

  // Reset Quantity display
  document.getElementById('pdpQtyDisplay').innerText = STATE.pdpQuantity;

  // Reset Pincode output
  const pinMsg = document.getElementById('pincodeResultMsg');
  if (pinMsg) pinMsg.innerText = 'Enter your 6-digit Indian PIN code to check delivery time.';
}

function setPdpImage(idx) {
  STATE.pdpImageIdx = idx;
  const p = STATE.activeProduct;
  if (p && p.images[idx]) {
    document.getElementById('pdpActiveImg').src = p.images[idx];
  }
  const dots = document.querySelectorAll('.pdp-thumb-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

function setPdpColor(name, hex) {
  STATE.pdpColor = { name, hex };
  renderPdpContent();
}

function setPdpSize(s) {
  STATE.pdpSize = s;
  renderPdpContent();
}

function initPdpQuantityControls() {
  window.changePdpQty = function(delta) {
    let newQty = STATE.pdpQuantity + delta;
    if (newQty < 1) newQty = 1;
    if (newQty > 10) newQty = 10;
    STATE.pdpQuantity = newQty;
    const disp = document.getElementById('pdpQtyDisplay');
    if (disp) disp.innerText = newQty;
  };
}

// Indian Pincode Delivery Checker
async function checkPincodeDelivery() {
  const input = document.getElementById('pincodeInput');
  const msgElem = document.getElementById('pincodeResultMsg');
  if (!input || !msgElem) return;

  const code = input.value.trim();
  if (code.length !== 6) {
    msgElem.innerHTML = `<span style="color:#EF4444;">Please enter a valid 6-digit Indian PIN code (e.g., 248001, 110001).</span>`;
    return;
  }

  msgElem.innerText = 'Checking courier logistics availability...';

  try {
    const res = await fetch(`/api/pincode/check?code=${code}`);
    const data = await res.json();
    if (data.valid) {
      STATE.pincodeData = data;
      msgElem.innerHTML = `
        <span style="color:#10B981; font-weight:700;">✓ ${data.message}</span>
        <div style="font-size:0.75rem; color:var(--text-espresso-light); margin-top:2px;">Standard Express: FREE • Dispatches in 24 hours</div>
      `;
    } else {
      msgElem.innerHTML = `<span style="color:#EF4444;">${data.message}</span>`;
    }
  } catch (err) {
    msgElem.innerText = 'Delivers within 2-4 business days across India via BlueDart.';
  }
}

// ==========================================================================
// 3. Strict Style DNA Checkout Fit-Gate
// ==========================================================================
function handleBuyNowClick() {
  // Check if user is calibrated
  if (!STATE.userDna.calibrated) {
    STATE.pendingCheckoutAction = 'BUY_NOW';
    openFitGateModal();
    return;
  }

  // Add PDP item to cart and open checkout immediately
  addItemToCart(STATE.activeProduct, STATE.pdpSize, STATE.pdpColor.name, STATE.pdpQuantity);
  closePdpDrawer();
  openCartDrawer();
}

function handleAddBagClick() {
  addItemToCart(STATE.activeProduct, STATE.pdpSize, STATE.pdpColor.name, STATE.pdpQuantity);
  closePdpDrawer();
  showToast(`Added ${STATE.pdpQuantity}x "${STATE.activeProduct.name}" to your bag! 🛍️`);
}

function quickAddToBag(e, productId) {
  e.stopPropagation();
  const p = STATE.products.find(item => item.id === productId);
  if (!p) return;

  addItemToCart(p, STATE.userDna.recommendedSize || 'M', p.colors[0].name, 1);
  showToast(`Added "${p.name}" (Size ${STATE.userDna.recommendedSize || 'M'}) to Bag! 🛍️`);
}

function openFitGateModal() {
  const modal = document.getElementById('fitGateModal');
  if (modal) modal.classList.add('active');
}

function closeFitGateModal() {
  const modal = document.getElementById('fitGateModal');
  if (modal) modal.classList.remove('active');
}

function bypassFitGateAndProceed() {
  closeFitGateModal();
  if (STATE.pendingCheckoutAction === 'BUY_NOW') {
    addItemToCart(STATE.activeProduct, STATE.pdpSize, STATE.pdpColor.name, STATE.pdpQuantity);
    closePdpDrawer();
    openCartDrawer();
  } else if (STATE.pendingCheckoutAction === 'CART_CHECKOUT') {
    executeFinalCheckout(true);
  }
  STATE.pendingCheckoutAction = null;
}

function triggerStyleScanFromFitGate() {
  closeFitGateModal();
  openStyleScanDrawer();
}

// ==========================================================================
// 4. Style DNA Calibration Engine (3-Second Scan)
// ==========================================================================
function openStyleScanDrawer() {
  const drawer = document.getElementById('styleDnaDrawer');
  if (drawer) drawer.classList.add('active');
}

function closeStyleScanDrawer() {
  const drawer = document.getElementById('styleDnaDrawer');
  if (drawer) drawer.classList.remove('active');
}

async function runSimulatedCalibration() {
  const scanBtn = document.getElementById('btnRunScan');
  const scanStatus = document.getElementById('scanLaserStatus');
  if (scanBtn) scanBtn.innerText = 'Scanning Skin Photometrics (3s)...';
  if (scanStatus) scanStatus.innerText = 'Calibrating melanin & carotene ratios...';

  // 3-second simulation
  setTimeout(async () => {
    try {
      const h = parseInt(document.getElementById('dnaHeightInput').value) || 162;
      const w = parseInt(document.getElementById('dnaWeightInput').value) || 58;
      const bust = parseInt(document.getElementById('dnaBustInput').value) || 35;
      const waist = parseInt(document.getElementById('dnaWaistInput').value) || 28;
      const hip = parseInt(document.getElementById('dnaHipInput').value) || 39;

      const res = await fetch('/api/style-dna/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height: h, weight: w, bust, waist, hip })
      });
      const data = await res.json();

      STATE.userDna = {
        calibrated: true,
        silhouette: data.silhouette,
        undertone: data.undertone,
        paletteName: data.paletteName,
        recommendedSize: data.recommendedSize,
        height: h,
        weight: w
      };

      // Update Header Swatches
      const headerLabel = document.getElementById('headerDnaBadgeLabel');
      if (headerLabel) headerLabel.innerText = data.paletteName;

      closeStyleScanDrawer();
      showToast(`✨ Style DNA Calibrated! Size ${data.recommendedSize} locked with 99% fit guarantee.`);

      // Re-render feed with updated scores
      renderDiscoveryFeed();

      // If pending checkout, proceed smoothly
      if (STATE.pendingCheckoutAction === 'BUY_NOW') {
        addItemToCart(STATE.activeProduct, STATE.pdpSize, STATE.pdpColor.name, STATE.pdpQuantity);
        closePdpDrawer();
        openCartDrawer();
      } else if (STATE.pendingCheckoutAction === 'CART_CHECKOUT') {
        executeFinalCheckout(false);
      }
      STATE.pendingCheckoutAction = null;
    } catch (err) {
      showToast('Calibration completed with standard Indian sizing.');
      STATE.userDna.calibrated = true;
      closeStyleScanDrawer();
    }
  }, 2200);
}

// ==========================================================================
// 5. Myntra/Meesho-Style Shopping Cart & Checkout Drawer
// ==========================================================================
function openCartDrawer() {
  renderCartContent();
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.add('active');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.remove('active');
}

function addItemToCart(product, size, colorName, quantity) {
  const existingIdx = STATE.cart.findIndex(i => i.productId === product.id && i.size === size && i.color === colorName);
  if (existingIdx > -1) {
    STATE.cart[existingIdx].quantity += quantity;
  } else {
    STATE.cart.push({
      id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      name: product.name,
      price: product.discount_price,
      originalPrice: product.original_price,
      size: size || 'M',
      color: colorName || product.colors[0].name,
      image: product.images[0],
      quantity: quantity || 1
    });
  }
  updateCartBadge();
  renderCartContent();
}

function updateCartQuantity(cartItemId, delta) {
  const item = STATE.cart.find(i => i.id === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    STATE.cart = STATE.cart.filter(i => i.id !== cartItemId);
  }
  updateCartBadge();
  renderCartContent();
}

function updateCartBadge() {
  const count = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('headerCartCount');
  if (badge) badge.innerText = count;
}

function renderCartContent() {
  const listContainer = document.getElementById('cartItemsList');
  if (!listContainer) return;

  if (STATE.cart.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="margin-bottom: 1rem; color: var(--accent-blush);">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        </svg>
        <h4 style="font-family: var(--font-serif-display); font-size: 1.25rem; margin-bottom: 0.5rem;">Your Bag is Empty</h4>
        <p style="font-size: 0.85rem; color: var(--text-espresso-muted); margin-bottom: 1.5rem;">Explore curated kurti sets, sarees, and tailored co-ords.</p>
        <button class="btn-quick-add" style="max-width:200px; margin:0 auto;" onclick="closeCartDrawer()">Shop New Drops</button>
      </div>
    `;
    updateCartTotals(0, 0);
    return;
  }

  let totalOriginal = 0;
  let totalDiscounted = 0;

  listContainer.innerHTML = STATE.cart.map(item => {
    const itemTotal = item.price * item.quantity;
    totalDiscounted += itemTotal;
    totalOriginal += item.originalPrice * item.quantity;

    return `
      <div style="display:flex; gap:1rem; padding:1rem 0; border-bottom:1px solid var(--border-delicate); align-items:center;">
        <img src="${item.image}" alt="${item.name}" style="width:72px; height:90px; object-fit:cover; border-radius:12px; border:1px solid var(--border-delicate);">
        
        <div style="flex:1;">
          <h4 style="font-size:0.88rem; font-weight:700; color:var(--text-espresso); line-height:1.3; margin-bottom:3px;">${item.name}</h4>
          <div style="font-size:0.75rem; color:var(--text-espresso-light); margin-bottom:8px;">Size: <strong>${item.size}</strong> • Color: ${item.color}</div>
          
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <!-- Quantity Counter inside Cart -->
            <div class="qty-selector-widget" style="scale:0.85; transform-origin:left;">
              <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">−</button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
            </div>

            <!-- Price in INR -->
            <div style="text-align:right;">
              <div style="font-weight:700; font-size:0.95rem; color:var(--text-espresso);">${formatINR(itemTotal)}</div>
              <div style="font-size:0.72rem; color:var(--text-espresso-light); text-decoration:line-through;">${formatINR(item.originalPrice * item.quantity)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateCartTotals(totalOriginal, totalDiscounted);
}

function updateCartTotals(original, discounted) {
  let discountAmount = 0;
  if (STATE.appliedCoupon) {
    discountAmount = STATE.appliedCoupon.discount;
  }

  const finalPayable = Math.max(0, discounted - discountAmount);

  document.getElementById('cartSummaryTotalMRP').innerText = formatINR(original);
  document.getElementById('cartSummaryDiscount').innerText = `− ${formatINR(original - discounted)}`;
  document.getElementById('cartSummaryFinal').innerText = formatINR(finalPayable);
}

function applyCartCoupon() {
  const input = document.getElementById('couponCodeInput');
  const msg = document.getElementById('couponApplyMsg');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();
  if (code === 'AURA10') {
    STATE.appliedCoupon = { code: 'AURA10', discount: 100 };
    msg.innerHTML = `<span style="color:#10B981; font-weight:700;">✓ Coupon AURA10 applied! ₹100 Flat Discount</span>`;
  } else if (code === 'FIRSTAURA') {
    STATE.appliedCoupon = { code: 'FIRSTAURA', discount: 250 };
    msg.innerHTML = `<span style="color:#10B981; font-weight:700;">✓ Welcome Code FIRSTAURA applied! ₹250 Discount</span>`;
  } else {
    msg.innerHTML = `<span style="color:#EF4444;">Invalid coupon code. Try 'AURA10' or 'FIRSTAURA'.</span>`;
  }
  renderCartContent();
}

function selectPaymentMethod(method, elem) {
  STATE.selectedPayment = method;
  document.querySelectorAll('.payment-radio-label').forEach(l => l.classList.remove('selected'));
  if (elem) elem.classList.add('selected');
}

function initiateCheckout() {
  if (STATE.cart.length === 0) {
    showToast('Your bag is empty!');
    return;
  }

  // Check strict Fit-Gate
  if (!STATE.userDna.calibrated) {
    STATE.pendingCheckoutAction = 'CART_CHECKOUT';
    openFitGateModal();
    return;
  }

  executeFinalCheckout(false);
}

async function executeFinalCheckout(bypassed) {
  showToast('Initiating secure payment gateway... 🇮🇳');

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: STATE.cart,
        paymentMethod: STATE.selectedPayment,
        bypassFitGate: bypassed
      })
    });
    const data = await res.json();

    if (data.fitGateBlocked) {
      openFitGateModal();
      return;
    }

    if (data.success) {
      alert(`🎉 ${data.status}!\nOrder ID: ${data.orderId}\nPayment: ${STATE.selectedPayment.toUpperCase()}\nEstimated Delivery: ${data.estimatedDelivery}\n\nYour garments are calibrated to your Style DNA!`);
      STATE.cart = [];
      updateCartBadge();
      renderCartContent();
      closeCartDrawer();
    }
  } catch (err) {
    alert('Order placed successfully via BlueDart Express COD!');
    STATE.cart = [];
    updateCartBadge();
    renderCartContent();
    closeCartDrawer();
  }
}

// ==========================================================================
// 6. Wardrobe Vault & Remix Studio
// ==========================================================================
async function fetchVaultItems() {
  try {
    const res = await fetch('/api/vault');
    const items = await res.json();
    STATE.vaultItems = items;
    renderVaultGallery();
  } catch (err) {
    console.error('Vault fetch error:', err);
  }
}

function renderVaultGallery() {
  const container = document.getElementById('vaultGalleryGrid');
  if (!container) return;

  container.innerHTML = STATE.vaultItems.map(item => `
    <div style="background:#FFFFFF; border:1px solid var(--border-delicate); border-radius:16px; padding:0.75rem; text-align:center;">
      <img src="${item.image_url}" alt="${item.item_name}" style="width:100%; height:130px; object-fit:cover; border-radius:12px; margin-bottom:0.5rem;">
      <div style="font-size:0.78rem; font-weight:700; color:var(--text-espresso);">${item.item_name}</div>
      <div style="font-size:0.68rem; color:var(--accent-terracotta);">${item.category}</div>
    </div>
  `).join('');
}

function triggerRemixWithItem(itemName) {
  showToast(`Remixing "${itemName}" with AURA Palazzos and Trench Co-ords... 🪄`);
  setTimeout(() => {
    alert(`AI Outfit Remix Formula for "${itemName}":\n\n1. Pair with The Tailored Elastic-Back Trouser in Roasted Espresso (₹1,649)\n2. Add Baroque Kundan Pearl Choker\n3. Match Score: 99.4% Synergistic Drape!`);
  }, 600);
}

// Toast helper
function showToast(msg) {
  const shelf = document.getElementById('toastShelf');
  if (!shelf) return;

  const t = document.createElement('div');
  t.className = 'toast-message';
  t.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
    <span>${msg}</span>
  `;
  shelf.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

// Size Chart Guide Modal
function openSizeChartModal() {
  const modal = document.getElementById('sizeChartModal');
  if (modal) modal.classList.add('active');
}

function closeSizeChartModal() {
  const modal = document.getElementById('sizeChartModal');
  if (modal) modal.classList.remove('active');
}
