// Complete Login Page JavaScript with Authentication Utilities
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const loginBtn = document.getElementById('loginBtn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const popup = document.getElementById('popup-box');
    const popupMessage = document.getElementById('popupMessage');
    const closePopup = document.getElementById('close-popup');
    
    // Check if we're on the login page or other pages
    const isLoginPage = window.location.pathname === '/login';
    
    if (isLoginPage) {
        // Login page specific initialization
        initializeLoginPage();
    } else {
        // Other pages - check auth and add logout functionality
        checkAuthStatus();
        initializeAuthUtilities();
    }
    
    // Initialize login page functionality
    function initializeLoginPage() {
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
    }
    
    // Initialize authentication utilities for other pages
    function initializeAuthUtilities() {
        // Add logout functionality to any logout buttons
        const logoutButtons = document.querySelectorAll('.logout-btn, [data-action="logout"]');
        logoutButtons.forEach(button => {
            button.addEventListener('click', handleLogout);
        });
    }
    
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
            // Real API call to Flask backend
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
                
                // Store user role in local storage
                if (response.user && response.user.role) {
                    localStorage.setItem('user_role', response.user.role);
                }
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = response.redirect || '/';
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
            // Real API call to Flask backend
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
        if (emailField && !validateField(emailField)) {
            isValid = false;
        }
        
        // Validate password
        const passwordField = document.getElementById('password');
        if (passwordField && !validateField(passwordField)) {
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
            if (btnText) btnIcon.className = 'fas fa-arrow-right btn-icon';
        }
    }
    
    // Show popup message (for login page)
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
    
    // Real login API call to Flask backend
    async function loginUser(email, password, remember) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    remember: remember
                })
            });
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Login API error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }
    
    // Real password reset API call to Flask backend
    async function resetPassword(email) {
        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email
                })
            });
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Password reset API error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }
    
    // Check authentication status (for non-login pages)
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/user-info');
            if (response.status === 401) {
                // User not authenticated, redirect to login
                window.location.href = '/login';
                return;
            }
            
            if (response.ok) {
                const userData = await response.json();
                updateUserInfo(userData);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // On error, assume user needs to login
            window.location.href = '/login';
        }
    }
    
    // Update user info in the UI
    function updateUserInfo(userData) {
        // Update user name displays
        const userNameElements = document.querySelectorAll('.user-name, [data-user="name"]');
        userNameElements.forEach(element => {
            element.textContent = userData.user_name || 'User';
        });
        
        // Update user email displays
        const userEmailElements = document.querySelectorAll('.user-email, [data-user="email"]');
        userEmailElements.forEach(element => {
            element.textContent = userData.user_id || '';
        });
        
        // Update user role displays
        const userRoleElements = document.querySelectorAll('.user-role, [data-user="role"]');
        userRoleElements.forEach(element => {
            element.textContent = userData.user_role || '';
        });
        
        // Show/hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            if (userData.user_role === 'admin') {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });
    }
    
    // Handle logout (for non-login pages)
    async function handleLogout(e) {
        e.preventDefault();
        
        // Show confirmation dialog
        const confirmLogout = confirm('Are you sure you want to logout?');
        if (!confirmLogout) {
            return;
        }
        
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Clear any client-side storage
                try {
                    localStorage.removeItem('remember_user');
                    sessionStorage.clear();
                } catch (e) {
                    console.warn('Could not clear storage');
                }
                
                // Show success message briefly then redirect
                showNotification('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            } else {
                showNotification('Logout failed. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Logout failed. Please try again.', 'error');
        }
    }
    
    // Simple notification function (for non-login pages)
    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
});

// Global utility functions for other scripts to use
// Handle API errors globally
window.handleApiError = function(response) {
    if (response.status === 401) {
        // Create and show notification
        const notification = document.createElement('div');
        notification.textContent = 'Session expired. Please login again.';
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
            color: white; border-radius: 8px; z-index: 10000;
            font-weight: 500; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return true; // Handled
    }
    return false; // Not handled
};

// Utility function to make authenticated API calls
window.authenticatedFetch = async function(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        // Check for authentication errors
        if (window.handleApiError(response)) {
            return null;
        }
        
        return response;
        
    } catch (error) {
        console.error('API call error:', error);
        // Show error notification
        const notification = document.createElement('div');
        notification.textContent = 'Network error. Please check your connection.';
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
            color: white; border-radius: 8px; z-index: 10000;
            font-weight: 500; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
        throw error;
    }
};

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
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        alert('Google login would be implemented here');
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
        alert('Microsoft login would be implemented here');
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
        const popup = document.getElementById('popup-box');
        if (popup && popup.style.display !== 'none') {
            popup.style.display = 'none';
        }
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
