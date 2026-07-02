// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const mobileNav = document.getElementById('mobileNav');
const blurOverlay = document.getElementById('blurOverlay');
const mainHeader = document.getElementById('mainHeader');

// Open mobile menu
mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.add('active');
    blurOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close mobile menu with close button
closeMenuBtn.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    blurOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close mobile menu when clicking on overlay
blurOverlay.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    blurOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close mobile menu when clicking on a link
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Update active state
        mobileNavLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Close menu
        mobileNav.classList.remove('active');
        blurOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        mobileNav.classList.remove('active');
        blurOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        mainHeader.classList.add('scrolled');
    } else {
        mainHeader.classList.remove('scrolled');
    }
});

// Form submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

// ✅ Smooth scrolling for anchor links (تم التعديل هنا فقط)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

// Add active class to nav links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Parallax effect for background circles
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const circles = document.querySelectorAll('.circle');

    circles.forEach((circle, index) => {
        const speed = 0.2 + (index * 0.05);
        const yPos = -(scrolled * speed);
        circle.style.transform = 'translate(-50%, calc(-50% + ' + yPos + 'px))';
    });
});

// Initialize with a slight animation on load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 50);
});