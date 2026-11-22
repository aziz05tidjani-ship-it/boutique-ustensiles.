// ===================================================
// DASHBOARD - GESTION DES COMMANDES EN TEMPS RÉEL
// ===================================================

const STORAGE_KEY = 'boutique_ustensile_orders';
let soundEnabled = true;

// Initial Seed Data (si aucune commande n'existe encore)
const initialOrders = [
    {
        id: 'CMD-1042',
        date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        name: 'Khadija Amrani',
        phone: '0661458923',
        city: 'Casablanca',
        pack: 'Pack Duo (349 DH)',
        price: 349,
        status: 'En attente'
    },
    {
        id: 'CMD-1041',
        date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        name: 'Othmane Berrada',
        phone: '0672109845',
        city: 'Rabat',
        pack: 'Pack Solo (199 DH)',
        price: 199,
        status: 'Confirmée'
    },
    {
        id: 'CMD-1040',
        date: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        name: 'Nadia Mansouri',
        phone: '0663781290',
        city: 'Marrakech',
        pack: 'Pack Famille (480 DH)',
        price: 480,
        status: 'Livrée'
    }
];

// Helper: Get orders
function getOrders() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOrders));
        return initialOrders;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return initialOrders;
    }
}

// Helper: Save orders
function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Synthesize pleasant chime sound with Web Audio API
function playAlertSound() {
    if (!soundEnabled) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.15);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.6);
    } catch (e) {
        console.warn('Audio non supporté :', e);
    }
}

// Show Toast
function showToast(title, message) {
    const toast = document.getElementById('toast-notif');
    const toastTitle = document.getElementById('toast-title');
    const toastMsg = document.getElementById('toast-message');

    if (toast && toastTitle && toastMsg) {
        toastTitle.textContent = title;
        toastMsg.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4500);
    }
}

// Format relative/clean date
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');

    if (isToday) {
        return `Aujourd'hui à ${hours}:${mins}`;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month} à ${hours}:${mins}`;
}

// Render Table & Metrics
function renderDashboard() {
    const orders = getOrders();
    const searchVal = document.getElementById('order-search').value.toLowerCase().trim();
    const statusVal = document.getElementById('status-filter').value;
    const tbody = document.getElementById('orders-tbody');
    const emptyState = document.getElementById('empty-state');

    // 1. Calculate Metrics
    let revenue = 0;
    let pendingCount = 0;
    let deliveredCount = 0;

    orders.forEach(o => {
        if (o.status !== 'Annulée') {
            revenue += Number(o.price) || 0;
        }
        if (o.status === 'En attente') {
            pendingCount++;
        }
        if (o.status === 'Livrée') {
            deliveredCount++;
        }
    });

    document.getElementById('kpi-revenue').textContent = `${revenue.toLocaleString()} DH`;
    document.getElementById('kpi-total-orders').textContent = orders.length;
    document.getElementById('kpi-pending-orders').textContent = pendingCount;
    document.getElementById('kpi-delivered-orders').textContent = deliveredCount;

    // 2. Filter Table
    const filteredOrders = orders.filter(o => {
        const matchesSearch = 
            o.name.toLowerCase().includes(searchVal) ||
            o.phone.toLowerCase().includes(searchVal) ||
            o.city.toLowerCase().includes(searchVal) ||
            o.id.toLowerCase().includes(searchVal) ||
            o.pack.toLowerCase().includes(searchVal);

        const matchesStatus = (statusVal === 'ALL') || (o.status === statusVal);

        return matchesSearch && matchesStatus;
    });

    tbody.innerHTML = '';

    if (filteredOrders.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';

        filteredOrders.forEach((order, index) => {
            const tr = document.createElement('tr');
            if (order.isNew) {
                tr.classList.add('new-order-flash');
                delete order.isNew;
            }

            const cleanPhone = order.phone.replace(/[^0-9+]/g, '');
            const waNumber = cleanPhone.startsWith('0') ? '212' + cleanPhone.substring(1) : cleanPhone;
            const waMessage = `Bonjour ${order.name}, c'est Boutique Ustensile au sujet de votre commande ${order.id} (${order.pack}). Pouvez-vous nous confirmer votre adresse ?`;

            const statusClass = 'status-' + order.status.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            tr.innerHTML = `
                <td>
                    <span class="order-ref">${order.id}</span>
                    <span class="order-date">${formatDate(order.date)}</span>
                </td>
                <td>
                    <div class="client-name">${escapeHtml(order.name)}</div>
                </td>
                <td>
                    <div class="contact-cell">
                        <span>${escapeHtml(order.phone)}</span>
                        <a href="https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}" target="_blank" class="btn-whatsapp-dial" title="Contacter sur WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>
                        <a href="tel:${cleanPhone}" class="action-btn" title="Appeler directement">
                            <i class="fa-solid fa-phone"></i>
                        </a>
                    </div>
                </td>
                <td>
                    <span class="city-pill"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(order.city)}</span>
                </td>
                <td>
                    <span class="pack-pill">${escapeHtml(order.pack)}</span>
                </td>
                <td>
                    <span class="price-text">${order.price} DH</span>
                </td>
                <td>
                    <select class="status-dropdown ${statusClass}" onchange="changeOrderStatus('${order.id}', this.value)">
                        <option value="En attente" ${order.status === 'En attente' ? 'selected' : ''}>🟡 En attente</option>
                        <option value="Confirmée" ${order.status === 'Confirmée' ? 'selected' : ''}>🔵 Confirmée</option>
                        <option value="Expédiée" ${order.status === 'Expédiée' ? 'selected' : ''}>🟣 Expédiée</option>
                        <option value="Livrée" ${order.status === 'Livrée' ? 'selected' : ''}>🟢 Livrée</option>
                        <option value="Annulée" ${order.status === 'Annulée' ? 'selected' : ''}>🔴 Annulée</option>
                    </select>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="deleteOrder('${order.id}')" title="Supprimer">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// XSS Sanitizer
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

// Update Order Status
window.changeOrderStatus = function(orderId, newStatus) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].status = newStatus;
        saveOrders(orders);
        renderDashboard();
        showToast('Statut mis à jour', `La commande ${orderId} est désormais : ${newStatus}`);
    }
};

// Delete Order
window.deleteOrder = function(orderId) {
    if (confirm(`Confirmez-vous la suppression de la commande ${orderId} ?`)) {
        let orders = getOrders();
        orders = orders.filter(o => o.id !== orderId);
        saveOrders(orders);
        renderDashboard();
        showToast('Supprimée', `Commande ${orderId} retirée.`);
    }
};

// Add Order in Real Time
function addNewOrder(orderData, triggerEffects = true) {
    const orders = getOrders();
    orderData.isNew = true;
    orders.unshift(orderData); // Add to top
    saveOrders(orders);

    renderDashboard();

    if (triggerEffects) {
        playAlertSound();
        showToast('🎉 Nouvelle Commande reçue !', `${orderData.name} (${orderData.city}) - ${orderData.price} DH`);
    }
}

// Export to CSV
function exportToCSV() {
    const orders = getOrders();
    if (orders.length === 0) {
        alert('Aucune commande à exporter.');
        return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    csvContent += 'Réf;Date;Client;Téléphone;Ville;Pack;Montant (DH);Statut\n';

    orders.forEach(o => {
        csvContent += `"${o.id}";"${formatDate(o.date)}";"${o.name}";"${o.phone}";"${o.city}";"${o.pack}";"${o.price}";"${o.status}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes_boutique_ustensile_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {

    // 1. Initial Render
    renderDashboard();

    // 2. Real-time Live Clock
    const liveClock = document.getElementById('live-clock');
    const updateClock = () => {
        const now = new Date();
        liveClock.textContent = now.toLocaleTimeString('fr-FR');
    };
    setInterval(updateClock, 1000);
    updateClock();

    // 3. Search and Filter Event Listeners
    document.getElementById('order-search').addEventListener('input', renderDashboard);
    document.getElementById('status-filter').addEventListener('change', renderDashboard);

    // 4. Sound Toggle
    const soundBtn = document.getElementById('toggle-sound-btn');
    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundBtn.classList.add('active');
            soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Activé';
        } else {
            soundBtn.classList.remove('active');
            soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Coupé';
        }
    });

    // 5. Clear all orders button
    document.getElementById('btn-clear-orders').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment effacer toutes les commandes ? Cette action est irréversible.')) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            renderDashboard();
            showToast('Tableau vidé', 'Toutes les commandes ont été effacées.');
        }
    });

    // 6. CSV Export Button
    document.getElementById('btn-export-csv').addEventListener('click', exportToCSV);

    // 7. Manual Order Modal
    const modal = document.getElementById('order-modal');
    const openModalBtn = document.getElementById('btn-add-manual-order');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const cancelModalBtn = document.getElementById('modal-cancel-btn');
    const manualForm = document.getElementById('manual-order-form');

    openModalBtn.addEventListener('click', () => modal.classList.add('open'));
    closeModalBtn.addEventListener('click', () => modal.classList.remove('open'));
    cancelModalBtn.addEventListener('click', () => modal.classList.remove('open'));

    manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const packVal = document.getElementById('m-pack').value;
        let price = 349;
        if (packVal.includes('199')) price = 199;
        if (packVal.includes('480')) price = 480;

        const newOrder = {
            id: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
            date: new Date().toISOString(),
            name: document.getElementById('m-name').value.trim(),
            phone: document.getElementById('m-phone').value.trim(),
            city: document.getElementById('m-city').value.trim(),
            pack: packVal,
            price: price,
            status: 'En attente'
        };

        addNewOrder(newOrder, true);
        manualForm.reset();
        modal.classList.remove('open');
    });

    // 8. Simulator Button (Simule l'arrivée en direct d'un client)
    const simulateBtn = document.getElementById('btn-simulate-order');
    const mockNames = ['Yassine Benali', 'Amina Tazi', 'Hamza Daoudi', 'Zineb Alaoui', 'Mehdi Chraibi', 'Kenza Lahlou'];
    const mockCities = ['Casablanca', 'Rabat', 'Fès', 'Tanger', 'Agadir', 'Oujda', 'Marrakech'];
    const mockPacks = [
        { pack: 'Pack Duo (349 DH)', price: 349 },
        { pack: 'Pack Solo (199 DH)', price: 199 },
        { pack: 'Pack Famille (480 DH)', price: 480 }
    ];

    simulateBtn.addEventListener('click', () => {
        const randName = mockNames[Math.floor(Math.random() * mockNames.length)];
        const randCity = mockCities[Math.floor(Math.random() * mockCities.length)];
        const randPack = mockPacks[Math.floor(Math.random() * mockPacks.length)];
        const randPhone = '06' + Math.floor(10000000 + Math.random() * 90000000);

        const simulatedOrder = {
            id: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
            date: new Date().toISOString(),
            name: randName,
            phone: randPhone,
            city: randCity,
            pack: randPack.pack,
            price: randPack.price,
            status: 'En attente'
        };

        addNewOrder(simulatedOrder, true);
    });

    // 9. Real-Time Listener across Browser Tabs (Local)
    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('boutique_orders_channel');
        channel.onmessage = (event) => {
            if (event.data && event.data.type === 'NEW_ORDER') {
                const orderData = event.data.order;
                const orders = getOrders();
                if (!orders.some(o => o.id === orderData.id)) {
                    addNewOrder(orderData, true);
                }
            }
        };
    }

    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            renderDashboard();
        }
    });

    // 10. REAL-TIME CLOUD SYNCHRONIZATION (CROSS-DEVICE: MOBILES & PC)
    const CLOUD_TOPIC = 'boutique_ustensile_orders_212629792377';
    const CLOUD_URL = `https://ntfy.sh/${CLOUD_TOPIC}`;

    function handleIncomingCloudOrder(orderData) {
        if (!orderData || !orderData.id) return;
        const orders = getOrders();
        // Check if already in list to avoid duplicates
        const exists = orders.some(o => o.id === orderData.id);
        if (!exists) {
            addNewOrder(orderData, true);

            // Native Browser Push Notification
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification('🎉 Nouvelle Commande (Mobile) !', {
                        body: `${orderData.name} (${orderData.city}) - ${orderData.pack} (${orderData.price} DH)`,
                        icon: 'images/product.jpg'
                    });
                } catch (e) {}
            }
        }
    }

    // A. SSE Live Stream (Instant < 200ms)
    function startCloudSSE() {
        try {
            const eventSource = new EventSource(`${CLOUD_URL}/sse`);
            
            eventSource.onopen = () => {
                const statusTitle = document.getElementById('cloud-status-title');
                const statusSub = document.getElementById('cloud-status-sub');
                if (statusTitle) statusTitle.textContent = 'Cloud Connecté 🟢';
                if (statusSub) statusSub.textContent = 'Mobile & PC synchronisés';
            };

            eventSource.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (payload.event === 'message' && payload.message) {
                        const orderData = JSON.parse(payload.message);
                        handleIncomingCloudOrder(orderData);
                    }
                } catch (err) {
                    console.warn('Erreur lecture commande cloud :', err);
                }
            };

            eventSource.onerror = () => {
                const statusTitle = document.getElementById('cloud-status-title');
                if (statusTitle) statusTitle.textContent = 'Reconnexion Cloud...';
            };
        } catch (e) {
            console.warn('SSE non supporté :', e);
        }
    }

    // B. Initial Cloud Poll (Récupère les commandes passées depuis mobile pendant que le dashboard était fermé)
    function fetchRecentCloudOrders() {
        fetch(`${CLOUD_URL}/json?poll=1&since=48h`)
            .then(res => res.text())
            .then(text => {
                if (!text) return;
                const lines = text.trim().split('\n');
                lines.forEach(line => {
                    if (!line) return;
                    try {
                        const payload = JSON.parse(line);
                        if (payload.event === 'message' && payload.message) {
                            const orderData = JSON.parse(payload.message);
                            handleIncomingCloudOrder(orderData);
                        }
                    } catch (e) {}
                });
            })
            .catch(err => console.warn('Erreur polling initial cloud :', err));
    }

    startCloudSSE();
    fetchRecentCloudOrders();

    // 11. Audio Context Unlock on User Interaction (Requis sur navigateurs mobiles & récents)
    const unlockAudio = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            ctx.resume();
        } catch (e) {}
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // 12. Push Notification Permission Request
    const btnRequestNotif = document.getElementById('btn-request-notif');
    if (btnRequestNotif) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                btnRequestNotif.innerHTML = '<i class="fa-solid fa-check"></i> Notifications Actives';
                btnRequestNotif.style.opacity = '0.7';
            } else {
                btnRequestNotif.addEventListener('click', () => {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            btnRequestNotif.innerHTML = '<i class="fa-solid fa-check"></i> Notifications Actives';
                            showToast('Notifications activées', 'Vous recevrez des alertes bureau lors des commandes.');
                        }
                    });
                });
            }
        } else {
            btnRequestNotif.style.display = 'none';
        }
    }

    // 13. Mobile Alerts Modal Handlers
    const btnMobileAlerts = document.getElementById('btn-mobile-alerts');
    const mobileAlertsModal = document.getElementById('mobile-alerts-modal');
    const mobileAlertsCloseBtn = document.getElementById('mobile-alerts-close-btn');

    if (btnMobileAlerts && mobileAlertsModal) {
        btnMobileAlerts.addEventListener('click', () => {
            mobileAlertsModal.classList.add('open');
        });
    }

    if (mobileAlertsCloseBtn && mobileAlertsModal) {
        mobileAlertsCloseBtn.addEventListener('click', () => {
            mobileAlertsModal.classList.remove('open');
        });
    }
});
