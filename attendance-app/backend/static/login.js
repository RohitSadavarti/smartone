// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const loginBtn = document.getElementById('loginBtn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const popup = document.getElementById('popup-box');
    const popupMessage = document.getElementById('popupMessage');
    const closePopup = document.getElementById('close-popup');
    
    // Initialize form validation
    initFormValidation();
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Close popup handler
    if (closePopup) {
        closePopup.addEventListener('click', hidePopup);
    }
    
    // Auto-focus on email field
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.focus();
    }
    
    // Load remembered email if exists
    loadRememberedUser();
    
    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validate form
        if (!validateLoginForm(email, password)) {
            return;
        }
        
        // Show loading state
        showLoadingState();
        
        try {
            // Simulate API call (replace with actual login logic)
            const response = await loginUser(email, password, remember);
            
            if (response.success) {
                showPopup('Login successful! Redirecting...', 'success');
                
                // Store user session if remember me is checked
                if (remember) {
                    try {
                        localStorage.setItem('remember_user', email);
                    } catch (e) {
                        console.warn('LocalStorage not available');
                    }
                }
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = response.redirect || '/dashboard';
                }, 1500);
                
            } else {
                showPopup(response.message || 'Login failed. Please check your credentials.', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showPopup('Login failed. Please try again later.', 'error');
        } finally {
            hideLoadingState();
        }
    }
    
    // Handle forgot password form submission
    async function handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('reset-email').value.trim();
        
        if (!validateEmail(email)) {
            showPopup('Please enter a valid email address.', 'error');
            return;
        }
        
        try {
            // Simulate password reset API call
            const response = await resetPassword(email);
            
            if (response.success) {
                showPopup('Password reset link sent to your email!', 'success');
                closeForgotPassword();
            } else {
                showPopup(response.message || 'Failed to send reset link.', 'error');
            }
            
        } catch (error) {
            console.error('Password reset error:', error);
            showPopup('Failed to send reset link. Please try again.', 'error');
        }
    }
    
    // Initialize form validation
    function initFormValidation() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Remove error styling on input
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    // Validate individual field
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        if (field.type === 'email') {
            if (!value) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!validateEmail(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
        } else if (field.type === 'password') {
            if (!value) {
                errorMessage = 'Password is required';
                isValid = false;
            } else if (value.length < 6) {
                errorMessage = 'Password must be at least 6 characters';
                isValid = false;
            }
        }
        
        if (!isValid) {
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }
        
        return isValid;
    }
    
    // Show field error
    function showFieldError(field, message) {
        field.style.borderColor = '#e53e3e';
        field.style.background = 'rgba(229, 62, 62, 0.1)';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #e53e3e;
            font-size: 0.8rem;
            margin-top: 5px;
            display: block;
        `;
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    // Clear field error
    function clearFieldError(field) {
        field.style.borderColor = '';
        field.style.background = '';
        
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    // Validate login form
    function validateLoginForm(email, password) {
        let isValid = true;
        
        // Validate email
        const emailField = document.getElementById('email');
        if (!validateField(emailField)) {
            isValid = false;
        }
        
        // Validate password
        const passwordField = document.getElementById('password');
        if (!validateField(passwordField)) {
            isValid = false;
        }
        
        return isValid;
    }
    
    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Show loading state
    function showLoadingState() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.classList.add('loading');
            const btnText = loginBtn.querySelector('.btn-text');
            const btnIcon = loginBtn.querySelector('.btn-icon');
            if (btnText) btnText.style.opacity = '0';
            if (btnIcon) btnIcon.className = 'fas fa-spinner btn-icon';
        }
    }
    
    // Hide loading state
    function hideLoadingState() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            const btnText = loginBtn.querySelector('.btn-text');
            const btnIcon = loginBtn.querySelector('.btn-icon');
            if (btnText) btnText.style.opacity = '1';
            if (btnIcon) btnIcon.className = 'fas fa-arrow-right btn-icon';
        }
    }
    
    // Show popup message
    function showPopup(message, type = 'info') {
        if (popup && popupMessage) {
            popupMessage.textContent = message;
            popup.className = `popup ${type}`;
            popup.style.display = 'block';
            
            // Auto-hide success messages after 3 seconds
            if (type === 'success') {
                setTimeout(hidePopup, 3000);
            }
        }
    }
    
    // Hide popup
    function hidePopup() {
        if (popup) {
            popup.style.display = 'none';
            popup.className = 'popup hidden';
        }
    }
    
    // Load remembered user
    function loadRememberedUser() {
        try {
            const rememberedEmail = localStorage.getItem('remember_user');
            if (rememberedEmail) {
                const emailField = document.getElementById('email');
                const rememberCheckbox = document.getElementById('remember');
                
                if (emailField) {
                    emailField.value = rememberedEmail;
                }
                if (rememberCheckbox) {
                    rememberCheckbox.checked = true;
                }
            }
        } catch (e) {
            console.warn('LocalStorage not available');
        }
    }
    
    // Simulate login API call
    async function loginUser(email, password, remember) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Demo credentials for testing
                if (email === 'admin@example.com' && password === 'password123') {
                    resolve({
                        success: true,
                        message: 'Login successful',
                        redirect: '/dashboard',
                        user: { email, name: 'Admin User' }
                    });
                } else if (email === 'user@example.com' && password === 'user123') {
                    resolve({
                        success: true,
                        message: 'Login successful',
                        redirect: '/dashboard',
                        user: { email, name: 'Regular User' }
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid email or password'
                    });
                }
            }, 1500); // Simulate network delay
        });
    }
    
    // Simulate password reset API call
    async function resetPassword(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Always return success for demo
                resolve({
                    success: true,
                    message: 'Password reset link sent successfully'
                });
            }, 1000);
        });
    }
});

// Password toggle functionality
function togglePassword() {
    const passwordField = document.getElementById('password');
    const passwordEye = document.getElementById('password-eye');
    
    if (passwordField && passwordEye) {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            passwordEye.className = 'fas fa-eye-slash';
        } else {
            passwordField.type = 'password';
            passwordEye.className = 'fas fa-eye';
        }
    }
}

// Show forgot password modal
function showForgotPassword() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Focus on email field
        const resetEmailField = document.getElementById('reset-email');
        if (resetEmailField) {
            setTimeout(() => resetEmailField.focus(), 100);
        }
    }
}

// Close forgot password modal
function closeForgotPassword() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        modal.classList.add('hidden');
        
        // Clear the form
        const form = document.getElementById('forgotPasswordForm');
        if (form) {
            form.reset();
        }
    }
}

// Show register modal (placeholder function)
function showRegister() {
    alert('Registration functionality would be implemented here. For demo, use:\n\nAdmin: admin@example.com / password123\nUser: user@example.com / user123');
}

// Social login functions (placeholder)
function loginWithGoogle() {
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        showPopup('Google login would be implemented here', 'info');
    }, 1000);
}

function loginWithMicrosoft() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.querySelector('.loading-text').textContent = 'Connecting to Microsoft...';
    }
    
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            loadingOverlay.querySelector('.loading-text').textContent = 'Logging you in...';
        }
        showPopup('Microsoft login would be implemented here', 'info');
    }, 1000);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('forgot-password-modal');
    if (modal && e.target === modal) {
        closeForgotPassword();
    }
});

// Handle escape key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeForgotPassword();
        hidePopup();
    }
});

// Add CSS for popup styling (if not already in CSS)
const popupStyles = `
    .popup {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10001;
        display: none;
        max-width: 300px;
    }
    
    .popup.success {
        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    }
    
    .popup.error {
        background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    }
    
    .popup.info {
        background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
    }
    
    .popup button {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        float: right;
    }
    
    .popup button:hover {
        background: rgba(255,255,255,0.3);
    }
    
    .error-message {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

// Inject styles if they don't exist
if (!document.querySelector('#popup-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'popup-styles';
    styleSheet.textContent = popupStyles;
    document.head.appendChild(styleSheet);
}
