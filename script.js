/**
 * 1337Ops - Business Website
 * Interactions: Scroll Reveal, Mobile Menu, Contact Form, Smooth Scroll
 */
(() => {
    'use strict';

    // =========================================================
    // DOM Ready
    // =========================================================
    const ready = (fn) => {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    };

    ready(init);

    function init() {
        initMobileMenu();
        initScrollReveal();
        initContactForm();
        initSmoothScroll();
        initHeaderScroll();
    }

    // =========================================================
    // Mobile Menu Toggle (Accessible Dialog Pattern)
    // =========================================================
    function initMobileMenu() {
        const btn = document.querySelector('[data-menu-toggle]');
        const menu = document.getElementById('mobile-menu');
        const closeBtn = document.querySelector('[data-menu-close]');
        const links = menu?.querySelectorAll('a');
        let lastFocusedElement = null;

        if (!btn || !menu) return;

        // Focus trap elements
        const focusableElementsSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
        let focusableElements = [];

        const updateFocusableElements = () => {
            focusableElements = Array.from(menu.querySelectorAll(focusableElementsSelector));
        };

        const trapFocus = (e) => {
            if (!menu.hidden && e.key === 'Tab') {
                updateFocusableElements();
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        const openMenu = () => {
            lastFocusedElement = document.activeElement;
            menu.hidden = false;
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Close menu');
            document.body.style.overflow = 'hidden';
            updateFocusableElements();
            // Focus the close button when menu opens
            setTimeout(() => closeBtn?.focus(), 0);
            document.addEventListener('keydown', trapFocus);
        };

        const closeMenu = () => {
            menu.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', trapFocus);
            // Return focus to trigger button
            lastFocusedElement?.focus();
        };

        const toggle = () => {
            const isOpen = menu.hidden === false;
            if (isOpen) closeMenu();
            else openMenu();
        };

        btn.addEventListener('click', toggle);
        closeBtn?.addEventListener('click', closeMenu);

        links?.forEach(link => {
            link.addEventListener('click', () => {
                if (!menu.hidden) closeMenu();
            });
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.hidden) closeMenu();
        });

        // Close on outside click (on backdrop)
        menu.addEventListener('click', (e) => {
            if (e.target === menu) closeMenu();
        });
    }

    // =========================================================
    // Scroll Reveal (IntersectionObserver)
    // =========================================================
    function initScrollReveal() {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.add('is-visible');
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // =========================================================
    // Contact Form (mailto fallback with accessibility)
    // =========================================================
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn?.querySelector('.btn-text');
            const statusEl = document.getElementById('form-status');

            if (!validateForm(form)) {
                // Focus first invalid field
                const firstInvalid = form.querySelector('[aria-invalid="true"]');
                firstInvalid?.focus();
                return;
            }

            // Collect data
            const formData = new FormData(form);
            const name = formData.get('name');
            const email = formData.get('email');
            const company = formData.get('company');
            const service = formData.get('service');
            const message = formData.get('message');

            // Build mailto
            const subject = encodeURIComponent(`New 1337Ops Inquiry: ${name} - ${service || 'General'}`);
            const body = encodeURIComponent(
                `--- 1337Ops Consultation Request ---\n\n` +
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Company: ${company || 'Not provided'}\n` +
                `Service Interest: ${service || 'Not specified'}\n` +
                `Message:\n${message}\n\n` +
                `-----------------------\n` +
                `Sent from 1337Ops.com`
            );

            const mailtoLink = `mailto:1337ops.biz@gmail.com?subject=${subject}&body=${body}`;

            // UI feedback
            if (submitBtn) {
                submitBtn.disabled = true;
                if (btnText) btnText.textContent = 'Opening email client...';
            }

            // Trigger mailto
            window.location.href = mailtoLink;

            // Show success status
            if (statusEl) {
                statusEl.textContent = 'Opening your email client...';
                statusEl.className = 'form-group success';
            }

            // Restore after delay
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    if (btnText) btnText.textContent = 'Get in Touch';
                }
                if (statusEl) {
                    statusEl.textContent = '✅ Email client opened. Please send the message to complete your inquiry.';
                    statusEl.className = 'form-group success';
                }
                form.reset();
            }, 500);
        });

        // Real-time validation
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.hasAttribute('aria-invalid')) validateField(input);
            });
            input.addEventListener('change', () => {
                if (input.hasAttribute('aria-invalid')) validateField(input);
            });
        });
    }

    function validateForm(form) {
        const inputs = form.querySelectorAll('[required]');
        let valid = true;

        inputs.forEach(input => {
            if (!validateField(input)) valid = false;
        });

        return valid;
    }

    function validateField(input) {
        const value = input.value.trim();
        const parent = input.closest('.form-group');
        const errorId = input.getAttribute('aria-describedby');
        const errorEl = errorId ? document.getElementById(errorId) : null;
        let isValid = true;
        let message = '';

        // Clear existing error
        input.removeAttribute('aria-invalid');
        if (errorEl) {
            errorEl.textContent = '';
        }

        if (input.required && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (input.type === 'email' && value && !isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        } else if (input.tagName === 'SELECT' && input.required && !value) {
            isValid = false;
            message = 'Please select an option';
        }

        if (!isValid) {
            input.setAttribute('aria-invalid', 'true');
            if (errorEl) {
                errorEl.textContent = message;
            }
        }

        return isValid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // =========================================================
    // Smooth Scroll for Anchor Links
    // =========================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jump
                    history.pushState(null, '', targetId);
                }
            });
        });
    }

    // =========================================================
    // Header Scroll Effect
    // =========================================================
    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    if (currentScrollY > 100) {
                        header.style.boxShadow = 'var(--shadow-md)';
                        header.style.borderBottomColor = 'var(--border)';
                    } else {
                        header.style.boxShadow = 'none';
                        header.style.borderBottomColor = 'var(--border)';
                    }

                    lastScrollY = currentScrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

})();