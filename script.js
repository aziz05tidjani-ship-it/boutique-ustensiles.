// ===================================================
// BOUTIQUE USTENSILE - LOGIQUE INTERACTIVE JAVASCRIPT
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('open')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking on any link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // 2. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                // Close all others
                faqItems.forEach(otherItem => otherItem.classList.remove('active'));
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        }
    });

    // 3. Countdown Timer (Offre Spéciale)
    let totalSeconds = (7 * 3600) + (45 * 60) + 30; // 7h 45m 30s
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (hoursEl && minutesEl && secondsEl) {
        const updateTimer = () => {
            if (totalSeconds <= 0) {
                totalSeconds = 24 * 3600; // Reset after countdown
            }
            totalSeconds--;

            const hrs = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;

            hoursEl.textContent = String(hrs).padStart(2, '0');
            minutesEl.textContent = String(mins).padStart(2, '0');
            secondsEl.textContent = String(secs).padStart(2, '0');
        };

        setInterval(updateTimer, 1000);
        updateTimer();
    }

    // 4. Helper: Smooth Scroll to Order Form & Highlight
    const orderFormBox = document.querySelector('.quick-order-card');
    const packSelect = document.getElementById('client-pack');
    const nameInput = document.getElementById('client-name');

    const scrollToOrderForm = (packToSelect = null) => {
        const orderSection = document.getElementById('commande-rapide');
        if (orderSection) {
            orderSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

            if (packToSelect && packSelect) {
                // Find matching option
                for (let i = 0; i < packSelect.options.length; i++) {
                    if (packSelect.options[i].value.includes(packToSelect) || packToSelect.includes(packSelect.options[i].text.split('-')[0].trim())) {
                        packSelect.selectedIndex = i;
                        break;
                    }
                }
            }

            // Highlight animation on the form
            if (orderFormBox) {
                orderFormBox.classList.remove('form-highlight-pulse');
                void orderFormBox.offsetWidth; // Trigger reflow
                orderFormBox.classList.add('form-highlight-pulse');
            }

            // Focus on input
            setTimeout(() => {
                if (nameInput) nameInput.focus();
            }, 500);
        }
    };

    // Attach to "Commander Maintenant" and similar scroll CTA buttons
    const scrollOrderBtns = document.querySelectorAll('.btn-scroll-order');
    scrollOrderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToOrderForm();
        });
    });

    // Attach to pricing cards "Commander le Pack ..." buttons
    const choosePackBtns = document.querySelectorAll('.btn-choose-pack');
    choosePackBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const packName = btn.getAttribute('data-pack');
            scrollToOrderForm(packName);
        });
    });

    // 5. Quick Order Form -> Save in real-time & Show confirmation modal
    const orderForm = document.getElementById('order-form');
    const successModal = document.getElementById('order-success-modal');
    const confCloseBtn = document.getElementById('conf-close-btn');

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('client-name').value.trim();
            const phone = document.getElementById('client-phone').value.trim();
            const city = document.getElementById('client-city').value.trim();
            const pack = document.getElementById('client-pack').value;

            let price = 349;
            if (pack.includes('199')) price = 199;
            if (pack.includes('480')) price = 480;

            // Generate unique Order ID
            const newOrder = {
                id: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
                date: new Date().toISOString(),
                name: name,
                phone: phone,
                city: city,
                pack: pack,
                price: price,
                status: 'En attente'
            };

            // 1. Save to LocalStorage for Real-Time Dashboard
            try {
                const STORAGE_KEY = 'boutique_ustensile_orders';
                const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                existing.unshift(newOrder);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

                // 2. Broadcast in Real-Time to any open Dashboard tab
                if ('BroadcastChannel' in window) {
                    const channel = new BroadcastChannel('boutique_orders_channel');
                    channel.postMessage({ type: 'NEW_ORDER', order: newOrder });
                }
            } catch (err) {
                console.error('Erreur enregistrement commande :', err);
            }

            const whatsappNumber = '212629792377';
            
            // 3. Format WhatsApp Message
            const message = `Bonjour Boutique Ustensile,%0A%0AJe viens de valider ma commande sur le site :%0A- *Réf Commande :* ${newOrder.id}%0A- *Pack :* ${encodeURIComponent(pack)}%0A- *Nom complet :* ${encodeURIComponent(name)}%0A- *Téléphone :* ${encodeURIComponent(phone)}%0A- *Ville :* ${encodeURIComponent(city)}%0A%0AMerci de me confirmer la livraison !`;

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

            // 4. Update and display Success Modal on page
            if (successModal) {
                document.getElementById('conf-order-id').textContent = newOrder.id;
                document.getElementById('conf-client-name').textContent = name;
                document.getElementById('conf-client-pack').textContent = pack;
                document.getElementById('conf-client-city').textContent = city;
                document.getElementById('conf-client-price').textContent = price + ' DH';

                const waBtn = document.getElementById('conf-whatsapp-btn');
                if (waBtn) {
                    waBtn.href = whatsappUrl;
                }

                successModal.classList.add('open');
            } else {
                // Fallback to direct WhatsApp
                window.open(whatsappUrl, '_blank');
            }

            // Reset form
            orderForm.reset();
        });
    }

    if (confCloseBtn && successModal) {
        confCloseBtn.addEventListener('click', () => {
            successModal.classList.remove('open');
        });
    }

    // 5. Active Navbar Link on Scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    });

});
