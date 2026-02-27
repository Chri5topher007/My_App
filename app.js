// ==========================================
// 1. FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyB_Fv9HLMOy9cCHT2cZLLwRQOGGBHA_8N0",
    authDomain: "myapp-94cf9.firebaseapp.com",
    projectId: "myapp-94cf9",
    storageBucket: "myapp-94cf9.firebasestorage.app",
    messagingSenderId: "542065139667",
    appId: "1:542065139667:web:76ed67d78188ff3e6dd926"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ==========================================
// 2. GLOBAL VARIABLES
// ==========================================
let allEvents = [];
let currentCategory = "All";
let currentFilter = "All";
let searchQuery = "";

// ==========================================
// 3. AUTH GUARD & INITIALIZATION
// ==========================================
auth.onAuthStateChanged(user => {
    // This code runs on every page load
    
    // 1. GUARD: If NOT on login page and NO user, redirect to login
    if (!window.location.pathname.includes('index.html') && !window.location.pathname.includes('login')) {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
    }

    // 2. If user is logged in (or guest)
    if (user) {
        console.log("Logged in as:", user.email || "Guest");

        // HANDLE UI ELEMENTS
        const userPhoto = document.getElementById('userPhoto');
        const createBtn = document.querySelector('a[href="create.html"]');
        const logoutBtn = document.getElementById('logoutBtn');

        // Check if User is Guest (Anonymous)
        if (user.isAnonymous) {
            // Change Photo to Guest Icon
            if(userPhoto) userPhoto.src = "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"; 
            
            // Hide Create Button (Guests cannot create)
            if(createBtn) createBtn.style.display = 'none';
        } else {
            // Real User
            if(userPhoto && user.photoURL) userPhoto.src = user.photoURL;
            
            // Show Create Button
            if(createBtn) createBtn.style.display = 'inline-flex';
        }

        // Logout Button Logic
        if(logoutBtn) {
            logoutBtn.addEventListener('click', () => auth.signOut());
        }

        // Load data if on home page
        if (document.getElementById('eventsGrid')) {
            loadEvents();
            setupListeners();
        }
    }
});

// ==========================================
// 4. LOAD EVENTS FROM FIREBASE
// ==========================================
async function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if(!eventsGrid) return;

    db.collection('events').orderBy('date', 'asc').onSnapshot(snapshot => {
        allEvents = [];
        snapshot.forEach(doc => {
            allEvents.push({ id: doc.id, ...doc.data() });
        });
        renderEvents();
    });
}

// ==========================================
// 5. RENDER & FILTER EVENTS
// ==========================================
function renderEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    let filtered = allEvents;

    // Filter by Category
    if (currentCategory !== "All") {
        filtered = filtered.filter(e => e.category === currentCategory);
    }

    // Filter by Search
    if (searchQuery) {
        filtered = filtered.filter(e => 
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Date Filters
    const today = new Date();
    today.setHours(0,0,0,0);

    if (currentFilter === "Today") {
        filtered = filtered.filter(e => {
            const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
            return d.toDateString() === today.toDateString();
        });
    } else if (currentFilter === "Tomorrow") {
        const tom = new Date(today);
        tom.setDate(tom.getDate() + 1);
        filtered = filtered.filter(e => {
            const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
            return d.toDateString() === tom.toDateString();
        });
    }

    // Generate HTML
    eventsGrid.innerHTML = filtered.map(event => {
        const d = event.date.toDate ? event.date.toDate() : new Date(event.date);
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        
        return `
            <div class="event-card">
                <div class="card-image">
                    <img src="${event.image}" alt="${event.title}">
                </div>
                <div class="card-content">
                    <div class="event-date-box">
                        <span class="month">${months[d.getMonth()]}</span>
                        <span class="day">${d.getDate()}</span>
                    </div>
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <div class="event-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                        </div>
                        <div class="event-meta" style="margin-top:5px; font-weight:600; color:var(--primary);">
                            ${event.isFree ? 'Free' : '$' + event.price}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// 6. EVENT LISTENERS (Tabs & Buttons)
// ==========================================
function setupListeners() {
    // Category Tabs
    document.querySelectorAll('.cat-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelector('.cat-item.active').classList.remove('active');
            item.classList.add('active');
            currentCategory = item.getAttribute('data-cat');
            renderEvents();
        });
    });

    // Date Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderEvents();
        });
    });

    // Search
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    if(heroSearchBtn) {
        heroSearchBtn.addEventListener('click', () => {
            searchQuery = document.getElementById('heroSearch').value;
            renderEvents();
        });
    }
}