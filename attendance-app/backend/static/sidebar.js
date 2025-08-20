const body = document.querySelector("body");
const sidebar = body.querySelector("nav.sidebar");
const toggle = document.getElementById("hamburger-toggle");
const backdrop = document.querySelector(".sidebar-toggle-backdrop");
const modeSwitch = body.querySelector(".toggle-switch");
const modeText = body.querySelector(".mode-text");

// Sidebar toggle (only hamburger icon for mobile and desktop)
toggle.addEventListener("click", () => {
  const loader = document.getElementById("skeleton-overlay");
  if (loader) loader.style.display = "flex"; // Show loader

  setTimeout(() => {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      sidebar.classList.toggle("open");
      backdrop?.classList.toggle("show");
    } else {
      sidebar.classList.toggle("close");
    }

    // Keep hamburger icon always (remove the icon toggle logic)
    // No more bx-menu to bx-x switching

    if (loader) loader.style.display = "none"; // Hide loader
  }, 300);
});

// Dark mode toggle
modeSwitch?.addEventListener("click", () => {
  body.classList.toggle("dark");
  modeText.textContent = body.classList.contains("dark") ? "Light mode" : "Dark mode";
});

// Close sidebar when backdrop is clicked (mobile)
function closeSidebar() {
  sidebar.classList.remove("open");
  backdrop?.classList.remove("show");
  // Keep hamburger icon (no icon change)
}
window.closeSidebar = closeSidebar;

// Optional: Programmatic toggle
function toggleSidebar() {
  sidebar.classList.toggle("open");
  backdrop?.classList.toggle("show");
}
window.toggleSidebar = toggleSidebar;

// Toggle submenu visibility
function toggleSubMenu(el) {
  const parent = el.closest(".has-submenu");
  parent?.classList.toggle("active");
}
window.toggleSubMenu = toggleSubMenu;
