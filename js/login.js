// Login form functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const loginButton = document.getElementById('loginButton');
    const guestAccessButton = document.getElementById('guestAccess');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Password visibility toggle
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = passwordToggle.querySelector('.material-icons-outlined');
        icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Form validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function showError(inputId, message) {
        const formGroup = document.getElementById(inputId).closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        errorElement.textContent = message;
    }

    function showSuccess(inputId) {
        const formGroup = document.getElementById(inputId).closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        formGroup.classList.add('success');
        formGroup.classList.remove('error');
        errorElement.textContent = '';
    }

    function clearValidation(inputId) {
        const formGroup = document.getElementById(inputId).closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        formGroup.classList.remove('error', 'success');
        errorElement.textContent = '';
    }

    // Real-time validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email === '') {
            clearValidation('email');
        } else if (!validateEmail(email)) {
            showError('email', 'Por favor, insira um email válido');
        } else {
            showSuccess('email');
        }
    });

    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (password === '') {
            clearValidation('password');
        } else if (!validatePassword(password)) {
            showError('password', 'A senha deve ter pelo menos 6 caracteres');
        } else {
            showSuccess('password');
        }
    });

    // Clear validation on input
    emailInput.addEventListener('input', function() {
        if (this.closest('.form-group').classList.contains('error')) {
            clearValidation('email');
        }
    });

    passwordInput.addEventListener('input', function() {
        if (this.closest('.form-group').classList.contains('error')) {
            clearValidation('password');
        }
    });

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        let isValid = true;

        // Validate email
        if (email === '') {
            showError('email', 'Email é obrigatório');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('email', 'Por favor, insira um email válido');
            isValid = false;
        } else {
            showSuccess('email');
        }

        // Validate password
        if (password === '') {
            showError('password', 'Senha é obrigatória');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError('password', 'A senha deve ter pelo menos 6 caracteres');
            isValid = false;
        } else {
            showSuccess('password');
        }

        if (isValid) {
            performLogin(email, password);
        }
    });

    // Login simulation
    function performLogin(email, password) {
        // Show loading state
        loginButton.disabled = true;
        loginButton.querySelector('.button-text').style.display = 'none';
        loginButton.querySelector('.button-loading').style.display = 'flex';

        // Simulate API call
        setTimeout(() => {
            // Demo credentials
            if (email === 'admin@email.com' && password === '123456') {
                // Success
                showLoginSuccess();
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                // Error
                showLoginError('Email ou senha incorretos');
                resetLoginButton();
            }
        }, 2000);
    }

    function showLoginSuccess() {
        loginButton.style.background = 'linear-gradient(135deg, #27AE60 0%, #219A52 100%)';
        loginButton.querySelector('.button-loading').innerHTML = `
            <span class="material-icons-outlined" style="margin-right: 8px;">check_circle</span>
            Login realizado com sucesso!
        `;
    }

    function showLoginError(message) {
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.style.cssText = `
            background-color: rgba(231, 76, 60, 0.1);
            color: #E74C3C;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            text-align: center;
            border: 1px solid rgba(231, 76, 60, 0.2);
        `;
        errorDiv.textContent = message;

        // Remove existing error if any
        const existingError = loginForm.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }

        // Insert error before form
        loginForm.insertBefore(errorDiv, loginForm.firstChild);

        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    function resetLoginButton() {
        loginButton.disabled = false;
        loginButton.style.background = 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)';
        loginButton.querySelector('.button-text').style.display = 'inline';
        loginButton.querySelector('.button-loading').style.display = 'none';
    }

    // Guest access
    guestAccessButton.addEventListener('click', function() {
        this.disabled = true;
        this.innerHTML = `
            <span class="loading-spinner"></span>
            Acessando como visitante...
        `;
        
        setTimeout(() => {
            window.location.href = '../dashboard.html';
        }, 1500);
    });

    // Remember me functionality
    function loadRememberedCredentials() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    function saveCredentials(email) {
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
    }

    // Load remembered credentials on page load
    loadRememberedCredentials();

    // Save credentials on successful login
    loginForm.addEventListener('submit', function() {
        if (emailInput.value.trim()) {
            saveCredentials(emailInput.value.trim());
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key to submit form
        if (e.key === 'Enter' && (emailInput === document.activeElement || passwordInput === document.activeElement)) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // Auto-focus email input
    emailInput.focus();

    // Add demo credentials hint
    const demoHint = document.createElement('div');
    demoHint.style.cssText = `
        background-color: rgba(74, 144, 226, 0.1);
        color: #4A90E2;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 16px;
        font-size: 13px;
        text-align: center;
        border: 1px solid rgba(74, 144, 226, 0.2);
    `;
    demoHint.innerHTML = `
        <strong>Demo:</strong> admin@casaguido.com / 123456
    `;
    
    loginForm.appendChild(demoHint);
});