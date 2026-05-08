const VALID_HASH = "6e17f7196e0c75a2c25d475dd9239dc4f3f6a5047a18e1a71c1472b665c75b3c";

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function createLockScreen() {
    const lockScreen = document.createElement('div');
    lockScreen.className = 'lock-screen fade-in';
    lockScreen.innerHTML = `
        <div class="lock-card">
            <img src="./sources/avatar.jpeg" alt="Artem Kotovich" class="lock-avatar">
            <h2>Artem Kotovich</h2>
            <h3>Senior Designer</h3>
            
            <div class="lock-meta">
                <span>🇱🇹 Vilnius, Lithuania</span>
                <a href="mailto:art.a.kotovich@gmail.com">art.a.kotovich@gmail.com</a>
            </div>
            
            <hr class="lock-divider">
            
            <p class="lock-instruction">Please enter the password to view the portfolio.</p>
            <input type="password" class="password-input" id="pwdInput" placeholder="••••" autocomplete="new-password">
            <button class="unlock-btn" id="unlockBtn">Unlock</button>
            <div class="error-msg" id="errorMsg">Incorrect password</div>
        </div>
    `;
    document.body.appendChild(lockScreen);

    const unlockBtn = document.getElementById('unlockBtn');
    const pwdInput = document.getElementById('pwdInput');
    const errorMsg = document.getElementById('errorMsg');

    const checkPassword = async () => {
        const hash = await sha256(pwdInput.value);
        if (hash === VALID_HASH) {
            sessionStorage.setItem('portfolio_auth', hash);
            unlockPortfolio();
        } else {
            errorMsg.classList.add('show');
            setTimeout(() => errorMsg.classList.remove('show'), 2000);
            pwdInput.value = '';
            pwdInput.focus();
        }
    };

    unlockBtn.addEventListener('click', checkPassword);
    pwdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
    
    // Focus after next paint
    setTimeout(() => pwdInput.focus(), 100);
}

function unlockPortfolio() {
    const lockScreen = document.querySelector('.lock-screen');
    if (lockScreen) {
        lockScreen.remove();
    }
    const main = document.querySelector('main');
    if (main) {
        main.classList.add('unlocked');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication (using sessionStorage so it resets after closing tab, or change to localStorage if preferred)
    const auth = sessionStorage.getItem('portfolio_auth');
    if (auth === VALID_HASH) {
        unlockPortfolio();
    } else {
        createLockScreen();
    }

    // Add cool hover tracking for the case cards
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        let rect;
        let ticking = false;

        const updateRect = () => {
            rect = card.getBoundingClientRect();
        };

        card.addEventListener('mouseenter', updateRect);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);

        card.addEventListener('mousemove', (e) => {
            if (!rect) updateRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (!ticking) {
                requestAnimationFrame(() => {
                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);
                    ticking = false;
                });
                ticking = true;
            }
        });
    });

    // Contact Modal Logic
    const contactBtns = document.querySelectorAll('.contact-btn');
    const contactModal = document.getElementById('contactModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (contactModal && closeModalBtn) {
        contactBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                contactModal.classList.add('show');
            });
        });

        closeModalBtn.addEventListener('click', () => {
            contactModal.classList.remove('show');
        });

        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('show');
            }
        });
    }
});
