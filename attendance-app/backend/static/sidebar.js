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

    // Global functions for external access
    window.closeSidebar = closeSidebar;
    window.toggleSidebar = toggleSidebar;
    window.toggleSubMenu = toggleSubMenu;

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
