document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body");
    const sidebar = document.querySelector("nav.sidebar");
    const toggle = document.getElementById("hamburger-toggle");
    const backdrop = document.querySelector(".sidebar-toggle-backdrop");
    const modeSwitch = document.querySelector(".toggle-switch");
    const modeText = document.querySelector(".mode-text");

    // Function to check user role and update sidebar visibility
    function updateSidebarForUserRole() {
        const role = localStorage.getItem('user_role');
        const adminLinks = document.getElementById('admin-links');
        const attendanceTab = document.getElementById('attendance-tab');

        if (adminLinks) {
            if (role === 'admin') {
                adminLinks.style.display = ''; // Show the admin links
            } else {
                adminLinks.style.display = 'none'; // Hide the admin links
            }
        }
        
        // This assumes the attendance tab is for all users.
        if (attendanceTab) { 
            if (role === 'admin' || role === 'user') { 
                attendanceTab.style.display = '';
            } else {
                attendanceTab.style.display = 'none';
            }
        }
    }

    // Initialize sidebar state based on screen size
    if (sidebar) {
        if (window.innerWidth > 768) {
            sidebar.classList.add("close");
            body.classList.add("sidebar-closed");
        }
    }

    // Hamburger toggle functionality
    if (toggle && sidebar) {
        toggle.addEventListener("click", () => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                sidebar.classList.toggle("open");
                if (backdrop) backdrop.style.display = sidebar.classList.contains("open") ? "block" : "none";
            } else {
                sidebar.classList.toggle("close");
                body.classList.toggle("sidebar-closed");
            }
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

    // Close sidebar on backdrop click (mobile only)
    if (backdrop) {
        backdrop.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("open");
                backdrop.style.display = "none";
            }
        });
    }

    // Handle window resize
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            sidebar.classList.add("close");
            sidebar.classList.remove("open");
            body.classList.add("sidebar-closed");
            if (backdrop) backdrop.style.display = "none";
        } else {
            sidebar.classList.remove("close");
            body.classList.remove("sidebar-closed");
        }
    });

    // Initialize logout functionality
    function initializeLogout() {
        const logoutLink = document.querySelector('.bottom-content a');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }
    }

    async function handleLogout() {
        if (!confirm('Are you sure you want to logout?')) return;

        showLogoutLoading();
        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
            } else {
                alert('Logout failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to log out. Please check your network connection.');
        } finally {
            hideLogoutLoading();
        }
    }

    function showLogoutLoading() {
        let loadingOverlay = document.getElementById('logout-loading');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'logout-loading';
            loadingOverlay.innerHTML = `<div style="border: 4px solid #333; border-top: 4px solid #fff; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div><div>Logging out...</div><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>`;
            document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    }

    function hideLogoutLoading() {
        const loadingOverlay = document.getElementById('logout-loading');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
    
    // Initial calls on page load
    initializeLogout();
    updateSidebarForUserRole();
});

// NEW: Add this function to handle submenu toggling
function toggleSubMenu(element) {
    const parentLi = element.closest('.has-submenu');
    if (parentLi) {
        parentLi.classList.toggle('active');
    }
}
