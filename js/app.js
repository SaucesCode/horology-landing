// State Management
let cart = JSON.parse(localStorage.getItem('luxury_watch_cart')) || [];
const products = window.productData || [];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggleBtn = document.getElementById('cart-toggle');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// --- 1. RENDER PRODUCTS ---
function renderProducts() {
    productGrid.innerHTML = products.map((product, index) => `
        <div class="card reveal" style="transition-delay: ${index * 80}ms">
            <div class="card-img-wrapper">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toLocaleString()}</p>
            <p class="description">${product.description}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

// --- 2. CART LOGIC ---
function saveCart() {
    localStorage.setItem('luxury_watch_cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartState();
    openCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartState();
}

function updateQuantity(productId, newQty) {
    if (newQty <= 0) {
        removeFromCart(productId);
        return;
    }
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = newQty;
        updateCartState();
    }
}

// --- 3. UI STATE UPDATES ---
function updateCartState() {
    saveCart();
    renderCart();
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCountEl.textContent = totalItems;
    cartTotalEl.textContent = totalPrice.toLocaleString();
    checkoutBtn.disabled = cart.length === 0;
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align:center; padding: 3rem 0; color: var(--clr-text-secondary);">
                <p style="font-size: 2rem; margin-bottom: 0.5rem;">🛒</p>
                <p>Your cart is empty.</p>
            </div>`;
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${item.price.toLocaleString()}</p>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');
}

// --- 4. EVENT LISTENERS ---
function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
}

cartToggleBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// --- 5. SCROLL ANIMATIONS ---
function initScrollAnimations() {
    const header = document.getElementById('main-header');
    
    // Sticky Header - stays visible, just changes background
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // IntersectionObserver - Scroll Reveals
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Animated Counter for Stats
    animateCounters();
}

// --- 6. ANIMATED COUNTERS ---
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);
                    
                    el.textContent = current.toLocaleString();

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        el.textContent = target.toLocaleString() + '+';
                    }
                }

                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
}

// --- INITIALIZE ---
function init() {
    renderProducts();
    updateCartState();
    setTimeout(initScrollAnimations, 100);
}

document.addEventListener('DOMContentLoaded', init);
