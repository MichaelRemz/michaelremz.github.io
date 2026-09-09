(() => {
    'use strict';

    const root = document.documentElement;
    root.classList.remove('no-js');
    root.classList.add('js');

    const menuButton = document.querySelector('[data-menu-toggle]');
    const navigation = document.querySelector('[data-navigation]');
    const themeButton = document.querySelector('[data-theme-toggle]');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const navLinks = navigation ? [...navigation.querySelectorAll('a[href^="#"]')] : [];

    const closeMenu = ({ restoreFocus = false } = {}) => {
        if (!menuButton || !navigation) return;
        navigation.dataset.open = 'false';
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        document.body.classList.remove('nav-open');
        if (restoreFocus) menuButton.focus();
    };

    const openMenu = () => {
        if (!menuButton || !navigation) return;
        navigation.dataset.open = 'true';
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Close navigation');
        document.body.classList.add('nav-open');
        navLinks[0]?.focus();
    };

    menuButton?.addEventListener('click', () => {
        const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMenu() : openMenu();
    });

    navLinks.forEach((link) => link.addEventListener('click', () => closeMenu()));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navigation?.dataset.open === 'true') {
            closeMenu({ restoreFocus: true });
        }
    });

    document.addEventListener('click', (event) => {
        if (navigation?.dataset.open !== 'true') return;
        if (navigation.contains(event.target) || menuButton?.contains(event.target)) return;
        closeMenu();
    });

    const updateThemeControl = () => {
        if (!themeButton) return;
        const isDark = root.dataset.theme === 'dark';
        themeButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        themeButton.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        if (themeMeta) themeMeta.content = isDark ? '#101815' : '#f5f7f4';
    };

    themeButton?.addEventListener('click', () => {
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        if (nextTheme === 'dark') root.dataset.theme = 'dark';
        else delete root.dataset.theme;
        try { localStorage.setItem('portfolio-theme', nextTheme); } catch (error) { }
        updateThemeControl();
    });
    updateThemeControl();

    const caseStudies = [...document.querySelectorAll('.project-case')];
    const updateCaseLabel = (details) => {
        const label = details.querySelector('[data-case-label]');
        if (label) label.textContent = details.open ? 'Close case study' : 'Explore case study';
    };

    caseStudies.forEach((details) => {
        updateCaseLabel(details);
        details.addEventListener('toggle', () => updateCaseLabel(details));
    });

    const deepLinkedCase = window.location.hash ? document.querySelector(window.location.hash) : null;
    if (deepLinkedCase?.matches('.project-case')) deepLinkedCase.open = true;

    const observedSections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!visible) return;
            navLinks.forEach((link) => {
                const active = link.getAttribute('href') === `#${visible.target.id}`;
                if (active) link.setAttribute('aria-current', 'page');
                else link.removeAttribute('aria-current');
            });
        }, { rootMargin: '-25% 0px -62%', threshold: [0, 0.1, 0.25] });
        observedSections.forEach((section) => navObserver.observe(section));
    }

    const year = document.querySelector('[data-current-year]');
    if (year) year.textContent = new Date().getFullYear();

    window.addEventListener('resize', () => {
        if (window.innerWidth > 920 && navigation?.dataset.open === 'true') closeMenu();
    });
})();
