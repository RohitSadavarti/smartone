const body = document.querySelector("body");
const sidebar = body.querySelector("nav.sidebar");
const toggle = body.querySelector(".toggle");
const searchBtn = body.querySelector(".search-box");
const modeSwitch = body.querySelector(".toggle-switch");
const modeText = body.querySelector(".mode-text");
const backdrop = document.querySelector(".sidebar-toggle-backdrop");

// For desktop: toggle 'close' class on click
toggle.addEventListener("click", () => {
  // For mobile view, use overlay
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("open");
    backdrop.classList.toggle("show");
  } else {
    // For desktop view
    sidebar.classList.toggle("close");
  }
});

// Optional: clicking search opens sidebar (desktop)
searchBtn?.addEventListener("click", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("close");
  }
});

// Dark mode toggle
modeSwitch.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    modeText.innerText = "Light mode";
  } else {
    modeText.innerText = "Dark mode";
  }
});

// Used by backdrop click
function closeSidebar() {
  sidebar.classList.remove("open");
  backdrop.classList.remove("show");
}

// Optional if you want to control programmatically
function toggleSidebar() {
  sidebar.classList.toggle("open");
  backdrop.classList.toggle("show");
}
