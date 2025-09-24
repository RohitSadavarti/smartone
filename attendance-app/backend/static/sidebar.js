document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body");
    const sidebar = document.querySelector("nav.sidebar");
    const toggle = document.getElementById("hamburger-toggle");
    const backdrop = document.querySelector(".sidebar-toggle-backdrop");
    const modeSwitch = document.querySelector(".toggle-switch");
    const modeText = document.querySelector(".mode-text");

    // Initialize sidebar state
    if (sidebar) {
        // Desktop: Start with collapsed sidebar
        if (window.innerWidth > 768) {
            sidebar.classList.add("close");
            body.classList.add("sidebar-closed");
        } else {
            // Mobile: Start with hidden sidebar
            sidebar.classList.remove("open");
            body.classList.remove("sidebar-closed");
        }
    }

    // Initialize logout functionality
    initializeLogout();

    // Sidebar toggle functionality
    if (toggle && sidebar) {
        toggle.addEventListener("click", () => {
            const loader = document.getElementById("skeleton-overlay");
            if (loader) loader.style.display = "flex";

            setTimeout(() => {
                const isMobile = window.innerWidth <= 768;

                if (isMobile) {
                    // Mobile: Toggle open/close with backdrop
                    sidebar.classList.toggle("open");
                    if (backdrop) {
                        backdrop.classList.toggle("show");
                    }
                } else {
                    // Desktop: Toggle collapsed/expanded
                    sidebar.classList.toggle("close");
                    body.classList.toggle("sidebar-closed");
                }

                if (loader) loader.style.display = "none";
            }, 300);
        });
    }

    // Dark mode toggle
    if (modeSwitch) {
        modeSwitch.addEventListener("click", () => {
            body.classList.toggle("dark");
            if (modeText) {
                modeText.textContent = body.classList.contains("dark") ? "Light mode" : "Dark mode";
            }
        });
    }

    // Close sidebar when backdrop is clicked (mobile only)
    if (backdrop) {
        backdrop.addEventListener("click", () => {
            closeSidebar();
        });
    }

    // Handle window resize
    window.addEventListener("resize", () => {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile: Ensure sidebar is properly hidden
            sidebar.classList.remove("close");
            sidebar.classList.remove("open");
            body.classList.remove("sidebar-closed");
            if (backdrop) {
                backdrop.classList.remove("show");
            }
        } else {
            // Desktop: Ensure sidebar is in collapsed state
            sidebar.classList.remove("open");
            sidebar.classList.add("close");
            body.classList.add("sidebar-closed");
            if (backdrop) {
                backdrop.classList.remove("show");
            }
        }
    });

    // Initialize logout functionality
    function initializeLogout() {
        console.log('Initializing logout functionality...');
        
        // Find all possible logout elements
        const logoutSelectors = [
            'a[href="#"]:has(.bx-log-out)',  // The logout link with logout icon
            '.bx-log-out',                   // Direct logout icon
            'a:contains("Logout")',          // Any link containing "Logout"
            '.bottom-content li a',          // Links in bottom content section
        ];
        
        // More comprehensive approach - find by icon and text
        const logoutLinks = document.querySelectorAll('.bottom-content li a');
        logoutLinks.forEach(link => {
            const icon = link.querySelector('.bx-log-out, .fa-sign-out-alt, .fas.fa-sign-out-alt');
            const text = link.querySelector('.text');
            
            if (icon || (text && text.textContent.toLowerCase().includes('logout'))) {
                console.log('Found logout link:', link);
                
                // Remove existing href to prevent default navigation
                link.removeAttribute('href');
                link.href = 'javascript:void(0)';
                
                // Add click event listener
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Logout clicked');
                    handleLogout();
                });
                
                // Also add styles to make it look clickable
                link.style.cursor = 'pointer';
            }
        });

        // Backup: Also check for any element with logout icon
        const logoutIcons = document.querySelectorAll('.bx-log-out');
        logoutIcons.forEach(icon => {
            const parentLink = icon.closest('a');
            if (parentLink) {
                console.log('Found logout icon in link:', parentLink);
                parentLink.removeAttribute('href');
                parentLink.href = 'javascript:void(0)';
                parentLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Logout icon clicked');
                    handleLogout();
                });
            }
        });
    }

    // Logout handler function
    async function handleLogout() {
        console.log('Logout process started...');
        
        // Show confirmation dialog
        if (!confirm('Are you sure you want to logout?')) {
            console.log('Logout cancelled by user');
            return;
        }

        // Show loading state
        showLogoutLoading();

        try {
            console.log('Calling logout API...');
            
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Logout API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Logout response data:', data);

                if (data.success) {
                    // Clear any browser storage
                    try {
                        localStorage.clear();
                        sessionStorage.clear();
                        console.log('Browser storage cleared');
                    } catch (e) {
                        console.warn('Could not clear storage:', e);
                    }

                    // Show success message
                    showLogoutMessage('Logged out successfully! Redirecting...', 'success');

                    // Redirect after short delay
                    setTimeout(() => {
                        console.log('Redirecting to login page...');
                        window.location.href = '/login';
                    }, 1500);

                } else {
                    console.error('Logout failed:', data.message);
                    showLogoutMessage('Logout failed: ' + (data.message || 'Unknown error'), 'error');
                }
            } else {
                console.error('Logout API error:', response.status, response.statusText);
                showLogoutMessage('Logout failed. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Logout error:', error);
            showLogoutMessage('Network error. Please try again.', 'error');
        } finally {
            hideLogoutLoading();
        }
    }

    // Show loading state for logout
    function showLogoutLoading() {
        // Create or show loading overlay
        let loadingOverlay = document.getElementById('logout-loading');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'logout-loading';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                flex-direction: column;
                color: white;
                font-size: 18px;
            `;
            loadingOverlay.innerHTML = `
                <div style="border: 4px solid #333; border-top: 4px solid #fff; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <div>Logging out...</div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    }

    // Hide loading state
    function hideLogoutLoading() {
        const loadingOverlay = document.getElementById('logout-loading');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    // Show logout message
    function showLogoutMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.logout-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `logout-message ${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        // Set background color based on type
        switch(type) {
            case 'success':
                messageDiv.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                break;
            case 'error':
                messageDiv.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
                break;
            default:
                messageDiv.style.background = 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)';
        }

        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Animate in
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);

        // Auto remove after 4 seconds (unless it's a success message)
        if (type !== 'success') {
            setTimeout(() => {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }, 4000);
        }
    }

    // Global functions for external access
    window.closeSidebar = closeSidebar;
    window.toggleSidebar = toggleSidebar;
    window.toggleSubMenu = toggleSubMenu;
    window.handleLogout = handleLogout;

    // Close sidebar function
    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove("open");
        }
        if (backdrop) {
            backdrop.classList.remove("show");
        }
    }

    // Toggle sidebar function
    function toggleSidebar() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            sidebar.classList.toggle("open");
            if (backdrop) {
                backdrop.classList.toggle("show");
            }
        } else {
            sidebar.classList.toggle("close");
            body.classList.toggle("sidebar-closed");
        }
    }

    // Toggle submenu function
    function toggleSubMenu(element) {
        const parent = element.closest(".has-submenu");
        if (parent) {
            parent.classList.toggle("active");
            
            // Rotate arrow icon
            const arrow = element.querySelector(".submenu-arrow");
            if (arrow) {
                if (parent.classList.contains("active")) {
                    arrow.style.transform = "rotate(180deg)";
                } else {
                    arrow.style.transform = "rotate(0deg)";
                }
            }
        }
    }
});
