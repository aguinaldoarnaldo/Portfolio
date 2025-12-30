// ==================== MENU HAMBURGUER ====================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ==================== SCROLL SUAVE ====================
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

// ==================== HEADER FIXO COM SCROLL ====================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Adicionar sombra ao header
    if (currentScroll > 50) {
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// ==================== ANIMAÇÃO FADE-IN AO ROLAR ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animar barras de progresso
            if (entry.target.classList.contains('skill-card')) {
                const progressBar = entry.target.querySelector('.skill-progress');
                const progress = progressBar.getAttribute('data-progress');
                setTimeout(() => {
                    progressBar.style.width = progress + '%';
                }, 200);
            }
        }
    });
}, observerOptions);

// Observar todos os elementos com a classe fade-element
document.querySelectorAll('.fade-element').forEach(element => {
    observer.observe(element);
});
// Também observar botões e cards para reveal animado
document.querySelectorAll('.btn, .skill-card, .projeto-card, .service-card, .tool-item, .stat-item').forEach(el => {
    observer.observe(el);
});

// ==================== ANIMAÇÃO DE DIGITAÇÃO NO HERO ====================
const typingText = document.querySelector('.hero-text h1');
if (typingText) {
    const text = typingText.textContent;
    typingText.textContent = '';
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            typingText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }

    // Iniciar animação após um pequeno delay
    setTimeout(typeWriter, 500);
}

// ==================== CONTADOR ANIMADO ====================
const counters = document.querySelectorAll('.stat-item h4');
const speed = 200; // Quanto menor, mais rápido

const animateCounters = () => {
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / speed;
        let count = 0;

        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.textContent = Math.ceil(count) + '+';
                setTimeout(updateCount, 1);
            } else {
                counter.textContent = target + '+';
            }
        };

        updateCount();
    });
};

// Observar seção sobre para iniciar contadores
const aboutSection = document.querySelector('.sobre');
if (aboutSection) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counterObserver.observe(aboutSection);
}

// ==================== BOTÃO VOLTAR AO TOPO ====================
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==================== FORMULÁRIO DE CONTATO ====================
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Desabilitar botão durante envio
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Enviando...</span><i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        // Coletar dados do formulário
        const formData = new FormData(contactForm);

        try {
            const response = await fetch('process_contact.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                formMessage.textContent = result.message;
                formMessage.className = 'form-message success';
                contactForm.reset();
            } else {
                formMessage.textContent = result.message;
                formMessage.className = 'form-message error';
            }
        } catch (error) {
            formMessage.textContent = 'Erro ao enviar mensagem. Tente novamente.';
            formMessage.className = 'form-message error';
        }

        // Reabilitar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Remover mensagem após 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
}

// ==================== PARTÍCULAS NO BACKGROUND (OPCIONAL) ====================
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 5 + 2}px;
            height: ${Math.random() * 5 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s infinite;
            pointer-events: none;
        `;
        hero.appendChild(particle);
    }
}

// Descomentar para ativar partículas
// createParticles();

// ==================== SMOOTH REVEAL AO CARREGAR ====================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Custom cursor removed for better native performance and compatibility.

// ==================== PREVENÇÃO DE CLIQUE DIREITO (OPCIONAL) ====================
// Descomente se quiser proteger as imagens
/*
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
*/

// ==================== LAZY LOADING DE IMAGENS ====================
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// ==================== 3D TILT NOS CARDS (JS) ====================
function enable3DTilt(selector, options = {}) {
    // Não ativar em dispositivos touch ou sem hover
    if (('ontouchstart' in window) || window.matchMedia('(hover: none)').matches) return;

    const max = options.max || 12; // máximo de rotação em graus
    const scale = options.scale || 1.03;

    document.querySelectorAll(selector).forEach(el => {
        let rafId = null;
        el.style.transformStyle = 'preserve-3d';
        el.style.willChange = 'transform';

        function onMove(e) {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const px = (x / rect.width - 0.5) * 2; // -1 .. 1
            const py = (y / rect.height - 0.5) * 2;
            const rotateY = px * max;
            const rotateX = -py * max;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
            });
        }

        function onLeave() {
            if (rafId) cancelAnimationFrame(rafId);
            el.style.transition = 'transform 0.6s cubic-bezier(.2,.9,.3,1)';
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            setTimeout(() => {
                el.style.transition = '';
            }, 600);
        }

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseenter', () => { el.style.transition = 'transform 0.15s ease'; });
        el.addEventListener('mouseleave', onLeave);

    });
}

// Ativar 3D tilt para cards principais
enable3DTilt('.skill-card, .projeto-card, .service-card, .tool-item', { max: 12, scale: 1.03 });


// ==================== LOG DE CONSOLE ESTILIZADO ====================
console.log(
    '%c🚀 Portfólio Desenvolvido por João Silva',
    'color: #00c853; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);'
);

console.log(
    '%cInteressado em trabalhar juntos? Entre em contato!',
    'color: #66e19b; font-size: 14px;'
);