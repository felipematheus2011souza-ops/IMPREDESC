// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
});

// Contact form submission
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const message = this.querySelector('textarea').value;
    
    // Validate
    if (!name || !email || !message) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', { name, email, message });
    
    // Show success message
    alert('Obrigado! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve!');
    
    // Reset form
    this.reset();
});

// Button click handlers
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const buttonText = this.textContent.toLowerCase();
        
        if (buttonText.includes('começar') || buttonText.includes('grátis')) {
            // Redirect to signup
            window.location.href = '#signup';
            console.log('Redirecting to signup...');
        } else if (buttonText.includes('demonstração') || buttonText.includes('demo')) {
            // Show demo
            alert('Demonstração em breve! Fique atento ao nosso site.');
        } else if (buttonText.includes('assinar')) {
            // Redirect to payment
            alert('Redirecionando para checkout...');
            console.log('Redirecting to checkout...');
        } else if (buttonText.includes('contactar') || buttonText.includes('vendas')) {
            // Contact sales
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to cards
document.querySelectorAll('.feature-card, .pricing-card, .benefit-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Counter animation for benefit items
function animateCounter(element, target, duration = 1000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
}

// Mobile menu toggle (if you add a mobile menu)
const createMobileMenu = () => {
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    const container = navbar.querySelector('.container');
    
    if (window.innerWidth <= 768) {
        // Create mobile menu button if it doesn't exist
        if (!document.querySelector('.mobile-menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            
            // Add styles
            menuBtn.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--primary-color);
                padding: 10px;
            `;
            
            container.appendChild(menuBtn);
            
            menuBtn.addEventListener('click', function() {
                const navLinks = document.querySelector('.nav-links');
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            });
        }
    }
};

// Call on load and resize
window.addEventListener('load', createMobileMenu);
window.addEventListener('resize', createMobileMenu);

// Log page view
console.log('IMPREDESC Landing Page Loaded');
console.log('Version: 1.0.0');