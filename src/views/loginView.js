export function renderLoginView(container, onSuccess) {
    // We replace the entire app container so there's no header/tabs
    container.innerHTML = `
        <div class="login-container">
            <div class="login-left-pane"></div>
            <div class="login-right-pane">
                <div class="login-form-wrapper">
                    
                    <div class="login-logos">
                        <img src="/logos.png" alt="IIT Gandhinagar and Futurense Logos" class="login-logos-img">
                    </div>

                    <h1 class="login-heading">Welcome Back.</h1>
                    <p class="login-subheading">Glad to see you here again! Login to your account with your credentials.</p>

                    <form id="login-form" class="login-form">
                        <div id="login-error" class="login-error">Invalid email or password. Try again.</div>
                        
                        <div class="login-field">
                            <label class="login-label">Enter E.mail</label>
                            <input type="email" id="login-email" class="login-input" placeholder="ex. knockturnals@gmail.com" required>
                        </div>

                        <div class="login-field">
                            <label class="login-label">Enter Password</label>
                            <input type="password" id="login-password" class="login-input" placeholder="Your password" required>
                            <span class="login-eye-icon" id="toggle-password">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </span>
                        </div>

                        <button type="button" class="login-forgot-link">Forgot Password ?</button>

                        <button type="submit" class="login-button">Continue</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorMsg = document.getElementById('login-error');
    const togglePassword = document.getElementById('toggle-password');

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        if (type === 'text') {
            togglePassword.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        } else {
            togglePassword.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const pwd = passwordInput.value.trim();

        // Simple dynamic validation: accept any filled pair, but specifically demo it fails if empty 
        // (which native required mostly handles, but we'll show an error if they somehow bypass)
        if (email.length > 0 && pwd.length > 0) {
            errorMsg.style.display = 'none';
            // Simulate API delay
            const btn = form.querySelector('.login-button');
            const originalText = btn.textContent;
            btn.textContent = 'Authenticating...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            setTimeout(() => {
                onSuccess();
            }, 800);
        } else {
            errorMsg.style.display = 'block';
        }
    });
}
