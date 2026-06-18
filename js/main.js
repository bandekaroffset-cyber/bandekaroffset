document.addEventListener('DOMContentLoaded', function () {

    const body   = document.body;
    const onPage = id => !!document.getElementById(id);


    /* NAVBAR */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const markScrolled = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
        window.addEventListener('scroll', markScrolled, { passive: true });
        markScrolled(); // run once on load in case page is pre-scrolled

        // Mark the correct nav link as active based on current URL
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        navbar.querySelectorAll('.nav-links a').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }


    /* 2. HAMBURGER MENU (.mobile-menu, .mobile-menu.open)  */
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
            // Animate the three bars into an X
            const bars = hamburger.querySelectorAll('span');
            if (bars.length === 3) {
                bars[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)'  : '';
                bars[1].style.opacity   = isOpen ? '0' : '';
                bars[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
            }
        });

        // Close on link click or outside click
        mobileMenu.querySelectorAll('a').forEach(link =>
            link.addEventListener('click', closeMenu)
        );
        document.addEventListener('click', e => {
            if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
        });

        function closeMenu() {
            mobileMenu.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.querySelectorAll('span').forEach(s => {
                s.style.transform = '';
                s.style.opacity   = '';
            });
        }
    }


    /* 3. SCROLL REVEAL*/
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;

                // Stagger siblings inside a grid/list
                const siblings = Array.from(
                    el.parentElement.querySelectorAll('.reveal:not(.visible)')
                );
                const idx = siblings.indexOf(el);
                el.style.transitionDelay = idx > 0 ? `${idx * 80}ms` : '';

                el.classList.add('visible');
                revealObserver.unobserve(el);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    }


    /* 4. HERO SLIDER */
    const slides     = document.querySelectorAll('.slide');
    const dots       = document.querySelectorAll('.dot');
    const folioNum   = document.querySelector('.hero-folio strong');
    const folioTotal = document.querySelector('.hero-folio .total');

    if (slides.length && dots.length) {
        let current  = 0;
        let timer    = null;
        const DELAY  = 5000;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Populate folio total on first load
        if (folioTotal) folioTotal.textContent = String(slides.length).padStart(2, '0');

        function goTo(n) {
            slides[current].classList.remove('active');
            dots[current].classList.remove('active');
            current = (n + slides.length) % slides.length;
            slides[current].classList.add('active');
            dots[current].classList.add('active');

            // Update editorial folio counter
            if (folioNum) folioNum.textContent = String(current + 1).padStart(2, '0');
        }

        function startAuto() {
            if (reduceMotion) return;          // respect user preference
            clearInterval(timer);
            timer = setInterval(() => goTo(current + 1), DELAY);
        }

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goTo(parseInt(dot.dataset.slide, 10));
                startAuto();
            });
        });

        // Swipe support for touch devices
        let touchStartX = 0;
        const heroEl = document.querySelector('.hero');
        if (heroEl) {
            heroEl.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            heroEl.addEventListener('touchend', e => {
                const diff = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) {
                    goTo(diff > 0 ? current + 1 : current - 1);
                    startAuto();
                }
            }, { passive: true });
        }

        // Pause on hover (desktop)
        if (heroEl && !reduceMotion) {
            heroEl.addEventListener('mouseenter', () => clearInterval(timer));
            heroEl.addEventListener('mouseleave', startAuto);
        }

        startAuto();
    }


    /* 5. SERVICE IMAGE CAROUSELS */
const carousels = document.querySelectorAll('.service-carousel');

carousels.forEach((carousel, offset) => {
    const imgs = carousel.querySelectorAll('img');
    if (imgs.length < 2) return;

    let cur = 0, timer = null;
    let dragStartX = 0, dragging = false, moved = false;

    /* ── build dot strip ── */
    const dotWrap = document.createElement('div');
    dotWrap.className = 'carousel-dots';
    imgs.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.addEventListener('click', () => { goTo(i); resetTimer(); });
        dotWrap.appendChild(d);
    });
    carousel.after(dotWrap);

    function getDots() { return dotWrap.querySelectorAll('.dot'); }

    function goTo(n) {
        imgs[cur].classList.remove('active');
        getDots()[cur].classList.remove('active');
        cur = (n + imgs.length) % imgs.length;
        imgs[cur].classList.add('active');
        getDots()[cur].classList.add('active');
    }

    function nextImg() { goTo(cur + 1); }
    function prevImg() { goTo(cur - 1); }

    function startTimer() {
        if (timer) return;
        timer = setInterval(nextImg, 3200);
    }
    function stopTimer()  { clearInterval(timer); timer = null; }
    function resetTimer() { stopTimer(); startTimer(); }

    /* ── touch / mouse drag ── */
    function onDragStart(x) {
        dragStartX = x; dragging = true; moved = false;
        carousel.classList.add('dragging');
        stopTimer();
    }
    function onDragEnd(x) {
        if (!dragging) return;
        dragging = false;
        carousel.classList.remove('dragging');
        const diff = dragStartX - x;
        if (Math.abs(diff) > 40) {
            diff > 0 ? nextImg() : prevImg();
            moved = true;
        }
        startTimer();
    }

    carousel.addEventListener('touchstart', e => onDragStart(e.changedTouches[0].clientX),
        { passive: true });
    carousel.addEventListener('touchend',   e => onDragEnd(e.changedTouches[0].clientX),
        { passive: true });

    carousel.addEventListener('mousedown', e => onDragStart(e.clientX));
    carousel.addEventListener('mouseup',   e => onDragEnd(e.clientX));
    carousel.addEventListener('mouseleave', e => {
        if (dragging) onDragEnd(e.clientX);
        else startTimer();
    });
    carousel.addEventListener('mouseenter', stopTimer);

    /* ── auto-play with IntersectionObserver ── */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.isIntersecting
                ? setTimeout(startTimer, offset * 700)
                : stopTimer();
        });
    }, { threshold: 0.3 });
    observer.observe(carousel);
});

    /*  6. ABOUT — TIMELINE   */
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length) {
        // The last timeline item is always "current"
        timelineItems[timelineItems.length - 1].classList.add('current');
    }


    /* 7. ABOUT — DROP CAP  (aboutus.html)*/
    const introText = document.querySelector('.intro-text');
    if (introText) {
        const firstPara = introText.querySelector('p');
        if (firstPara) firstPara.classList.add('opening');
    }


    /* 8. SERVICES — PAGE HERO */
    const servicesHeroInner = document.querySelector('.page-hero .page-hero-inner');
    if (servicesHeroInner && !servicesHeroInner.querySelector('.page-hero-tag')) {
        // Only inject on services page (check for .service-block as sentinel)
        if (document.querySelector('.service-block')) {
            const tag = document.createElement('span');
            tag.className   = 'page-hero-tag';
            tag.textContent = 'Our Capabilities';
            servicesHeroInner.prepend(tag);
        }
    }


    /* 9. CONTACT FORM */
    const contactForm = document.getElementById('contactForm');
    const submitBtn   = document.getElementById('submitBtn');
    const toast       = document.getElementById('toast');

    if (contactForm && submitBtn && toast) {

        /* ── 9a. Character counter for message field ── */
        const messageField = document.getElementById('message');
        if (messageField) {
            const MAX_CHARS = 500;
            const counter   = document.createElement('span');
            counter.className = 'char-counter'; // style inline below
            counter.style.cssText = 'display:block;text-align:right;font-size:.72rem;color:var(--mid);margin-top:.25rem;font-family:"DM Sans",sans-serif;';
            counter.textContent = `0 / ${MAX_CHARS}`;
            messageField.parentElement.appendChild(counter);

            messageField.addEventListener('input', () => {
                const len = messageField.value.length;
                counter.textContent = `${len} / ${MAX_CHARS}`;
                counter.style.color = len > MAX_CHARS * 0.9 ? 'var(--gold)' : 'var(--mid)';
                if (len > MAX_CHARS) messageField.value = messageField.value.slice(0, MAX_CHARS);
            });
        }

        /* ── 9b. Inline field validation ── */
        function getError(field) {
            const val = field.value.trim();
            if (field.required && !val) return 'This field is required.';
            if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
                return 'Please enter a valid email address.';
            if (field.id === 'phone' && val && !/^[0-9+\-\s()]{7,15}$/.test(val))
                return 'Please enter a valid phone number.';
            return null;
        }

        function showFieldError(field, msg) {
            clearFieldError(field);
            field.style.borderColor = '#c0392b';
            const err = document.createElement('span');
            err.className = 'field-error';
            err.style.cssText = 'display:block;font-size:.72rem;color:#c0392b;margin-top:.25rem;font-family:"DM Sans",sans-serif;';
            err.textContent = msg;
            field.parentElement.appendChild(err);
        }

        function clearFieldError(field) {
            field.style.borderColor = '';
            const prev = field.parentElement.querySelector('.field-error');
            if (prev) prev.remove();
        }

        // Validate on blur for a smooth UX
        contactForm.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => {
                const err = getError(field);
                if (err) showFieldError(field, err); else clearFieldError(field);
            });
            field.addEventListener('input', () => clearFieldError(field));
        });

        /* ── 9c. Submit handler ── */
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Validate all fields before submitting
            let valid = true;
            contactForm.querySelectorAll('input[required], textarea[required], select[required]')
                .forEach(field => {
                    const err = getError(field);
                    if (err) { showFieldError(field, err); valid = false; }
                });
            if (!valid) return;

            // Loading state — CSS keeps the button styled, we just update text
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
            submitBtn.style.opacity = '.7';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    // Build WhatsApp message from form values
                    const get = id => (document.getElementById(id)?.value || '').trim();
                    const wa  = [
                        'Hello Bandekar Offset,',
                        '',
                        `Name: ${get('fname')} ${get('lname')}`,
                        `Phone: ${get('phone')}`,
                        `Service: ${get('service')}`,
                        '',
                        'Message:',
                        get('message')
                    ].join('\n');

                    // handles the animation
                    showToast('Message sent! Opening WhatsApp…', 'success');
                    submitBtn.textContent = 'Message Sent ✓';

                    // Open WhatsApp after a brief moment so the user sees the toast
                    setTimeout(() => {
                        window.open(`https://wa.me/919422437236?text=${encodeURIComponent(wa)}`, '_blank');
                    }, 600);

                    contactForm.reset();

                    setTimeout(() => {
                        submitBtn.textContent = 'Send Message →';
                        submitBtn.disabled    = false;
                        submitBtn.style.opacity = '';
                    }, 3500);

                } else {
                    showToast('Something went wrong. Please try again.', 'error');
                    resetSubmitBtn();
                }

            } catch {
                showToast('Network error — please check your connection.', 'error');
                resetSubmitBtn();
            }
        });

        function resetSubmitBtn() {
            submitBtn.textContent = 'Send Message →';
            submitBtn.disabled    = false;
            submitBtn.style.opacity = '';
        }

        /* ── 9d. Toast helper ── */
        let toastTimer;
        function showToast(message, type = 'success') {
            clearTimeout(toastTimer);
            toast.textContent  = message;
            toast.style.background = type === 'error' ? '#c0392b' : '#28a745';
            toast.classList.add('show');
            toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
        }
    }


    /* 10. SMOOTH ANCHOR SCROLL */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 70 + 16; // navbar height + breathing room
            const top    = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });


    /* 11. REDUCED MOTION — disable CSS transitions
       for users who've opted out of animation at OS level.
    ───────────────────────────────────────────── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-speed', '0ms');
        // Also kill the reveal stagger so content appears instantly
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }

});
