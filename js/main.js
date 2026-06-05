// Firebase auth and firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Product catalog
const products = [
    { id: 1, name: 'Laptop', price: 1000, image: 'https://via.placeholder.com/250x200?text=Laptop', category: 'Electronics' },
    { id: 2, name: 'Phone', price: 500, image: 'https://via.placeholder.com/250x200?text=Phone', category: 'Electronics' },
    { id: 3, name: 'Smartwatch', price: 180, image: 'https://via.placeholder.com/250x200?text=Smartwatch', category: 'Electronics' },
    { id: 4, name: 'Gaming Chair', price: 220, image: 'https://via.placeholder.com/250x200?text=Gaming+Chair', category: 'Electronics' },
    { id: 5, name: 'Shoes', price: 100, image: 'https://via.placeholder.com/250x200?text=Shoes', category: 'Fashion' },
    { id: 6, name: 'Jacket', price: 120, image: 'https://via.placeholder.com/250x200?text=Jacket', category: 'Fashion' },
    { id: 7, name: 'Watch', price: 150, image: 'https://via.placeholder.com/250x200?text=Watch', category: 'Fashion' },
    { id: 8, name: 'Backpack', price: 75, image: 'https://via.placeholder.com/250x200?text=Backpack', category: 'Fashion' },
    { id: 9, name: 'Book', price: 20, image: 'https://via.placeholder.com/250x200?text=Book', category: 'Books' },
    { id: 10, name: 'Notebook', price: 15, image: 'https://via.placeholder.com/250x200?text=Notebook', category: 'Books' },
    { id: 11, name: 'Headphones', price: 130, image: 'https://via.placeholder.com/250x200?text=Headphones', category: 'Electronics' },
    { id: 12, name: 'Sunglasses', price: 90, image: 'https://via.placeholder.com/250x200?text=Sunglasses', category: 'Fashion' }
];

let currentCategory = 'all';
let searchTerm = '';
const visitNotifyUrl = window.visitNotifyUrl || '';

function sendVisitNotification() {
    if (!visitNotifyUrl) return;

    const payload = {
        path: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        email: auth.currentUser ? auth.currentUser.email : null
    };

    fetch(visitNotifyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).catch(error => {
        console.warn('Visit notification failed:', error);
    });
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert('Login successful!');
            document.getElementById('message').innerText = 'Login successful!';
            setTimeout(() => window.location.href = 'shop.html', 1000);
        })
        .catch(error => {
            alert('Access denied: ' + error.message);
            document.getElementById('message').innerText = error.message;
        });
}

function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            alert('Registration successful!');
            document.getElementById('message').innerText = 'Registration successful!';
            const user = userCredential.user;
            if (user) {
                db.collection('portfolios').doc(user.uid).set({
                    cash: 10000,
                    holdings: {}
                });
            }
            setTimeout(() => window.location.href = 'shop.html', 1000);
        })
        .catch(error => {
            alert('Access denied: ' + error.message);
            document.getElementById('message').innerText = error.message;
        });
}

function logout() {
    auth.signOut().then(() => {
        alert('Logged out successfully.');
        window.location.href = 'index.html';
    });
}

function checkAuth() {
    auth.onAuthStateChanged(user => {
        const authSection = document.getElementById('authSection');
        const appSection = document.getElementById('appSection');
        const productsSection = document.getElementById('products');
        const loginPrompt = document.getElementById('loginPrompt');

        if (user) {
            if (authSection && appSection) {
                authSection.classList.add('hidden');
                appSection.classList.remove('hidden');
            }
            if (productsSection && loginPrompt) {
                productsSection.classList.remove('hidden');
                loginPrompt.classList.add('hidden');
                displayProducts();
                loadCart();
            }
            loadPortfolio();
            if (window.location.pathname.includes('dashboard.html')) {
                loadOrders();
            }
        } else {
            if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('shop.html')) {
                window.location.href = 'login.html';
                return;
            }
            if (productsSection && loginPrompt) {
                productsSection.classList.add('hidden');
                loginPrompt.classList.remove('hidden');
            }
        }
    });
}

function loadPortfolio() {
    const portfolioEl = document.getElementById('portfolio');
    if (!portfolioEl) return;

    const user = auth.currentUser;
    if (!user) {
        portfolioEl.innerHTML = '<p>Please sign in to see portfolio details.</p>';
        return;
    }

    db.collection('portfolios').doc(user.uid).get().then(doc => {
        if (!doc.exists) {
            portfolioEl.innerHTML = '<p>No portfolio data available.</p>';
            return;
        }

        const data = doc.data();
        let html = `<p>Cash: $${(data.cash || 0).toFixed(2)}</p>`;
        const holdings = data.holdings || {};
        if (Object.keys(holdings).length === 0) {
            html += '<p>No holdings.</p>';
        } else {
            html += '<ul>';
            for (const [symbol, quantity] of Object.entries(holdings)) {
                html += `<li>${symbol}: ${quantity}</li>`;
            }
            html += '</ul>';
        }
        portfolioEl.innerHTML = html;
    });
}

function loadOrders() {
    const user = auth.currentUser;
    if (!user) return;
    db.collection('orders').doc(user.uid).collection('userOrders').get().then(snapshot => {
        const ordersDiv = document.getElementById('orders');
        if (!ordersDiv) return;

        ordersDiv.innerHTML = '';
        if (snapshot.empty) {
            ordersDiv.innerHTML = '<p>No orders yet.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const order = doc.data();
            const orderDiv = document.createElement('div');
            orderDiv.className = 'order-card';
            orderDiv.innerHTML = `
                <h3>Order on ${new Date(order.date.seconds * 1000).toLocaleDateString()}</h3>
                <p>Total: $${order.total}</p>
                <ul>${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}</ul>
            `;
            ordersDiv.appendChild(orderDiv);
        });
    });
}

function displayProducts(filteredProducts = products) {
    const productList = document.getElementById('products');
    if (!productList) return;

    productList.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
            <button onclick="addProductToCart(${product.id})">Add to Cart</button>
        `;
        productList.appendChild(card);
    });
}

function filterProducts(category) {
    currentCategory = category;
    document.querySelectorAll('.categories button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === (category === 'all' ? 'All' : category));
    });
    applyFilters();
}

function searchProducts() {
    searchTerm = document.getElementById('search').value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    let filtered = products;
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    displayProducts(filtered);
}

function getCart() {
    return JSON.parse(localStorage.getItem('tradeCart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('tradeCart', JSON.stringify(cart));
}

function addProductToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    saveCart(cart);
    updateCartCount();
    alert(`${product.name} added to cart.`);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = count;
}

function viewCart() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    let message = 'Cart:\n';
    cart.forEach(item => {
        message += `${item.name} x${item.quantity} - $${item.price * item.quantity}\n`;
    });
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message += `Total: $${total}\n\nProceed to checkout?`;
    if (confirm(message)) {
        checkout();
    }
}

function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        alert('Please login to checkout');
        window.location.href = 'login.html';
        return;
    }

    const order = {
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date()
    };

    db.collection('orders').doc(user.uid).collection('userOrders').add(order).then(() => {
        alert('Order placed successfully!');
        saveCart([]);
        updateCartCount();
        if (window.location.pathname.includes('dashboard.html')) {
            loadOrders();
        }
    });
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
}

function loadCart() {
    updateCartCount();
}

window.onload = function() {
    checkAuth();
    updateCartCount();
    sendVisitNotification();
};
