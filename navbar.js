

// --- HELPER FUNCTIONS ---
function redirectToAuth(tab = 'register') {
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `auth.html?tab=${tab}&returnUrl=${returnUrl}`;
}

function getSessionData() {
  const session = localStorage.getItem('nexus_session') || sessionStorage.getItem('nexus_session');
  try {
    return session ? JSON.parse(session) : null;
  } catch (error) {
    return null;
  }
}

function logout() {
  localStorage.removeItem('nexus_session');
  sessionStorage.removeItem('nexus_session');
  window.location.reload(); // Reload the current page to update the nav
}

// --- NAVBAR LOGIC ---
function checkUserAuthentication() {
  const sessionData = getSessionData();
  const guestMenu = document.getElementById('guest-menu');
  const userMenu = document.getElementById('user-menu');
  const user = sessionData?.data?.user || sessionData?.user;

  if (user) {
    document.getElementById('modal-username').textContent = user.username || user.email.split('@')[0];
    if (guestMenu) guestMenu.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
  } else {
    if (guestMenu) guestMenu.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// in navbar.js

function setupMobileNav() {
  const sessionData = getSessionData();
  const mobileNavContainer = document.getElementById('mobile-nav');
  const user = sessionData?.data?.user || sessionData?.user;

  const closeButtonHTML = `<button class="mobile-nav-close" aria-label="Close menu"><i class="fas fa-times"></i></button>`;
  
  // These are the navigation links, pointing to the sections on the homepage
  const navLinksHTML = `
    <div class="mobile-nav-links">
      <a href="index.html#tournaments">Tournaments</a>
      <a href="index.html#why-us">Why Us</a>
      <a href="index.html#faq">FAQ</a>
    </div>
  `;
  
  let userSectionHTML = '';

  if (user) {
    // Logged-in user view
    const username = user.username || user.email.split('@')[0];
    userSectionHTML = `
      <div class="profile-header">
        <div class="profile-photo"><i class="fas fa-user"></i></div>
        <div class="profile-info">
          <div class="profile-username">${username}</div>
        </div>
      </div>
      <div class="profile-actions">
        <a href="user-dashboard.html" class="profile-action">
          <i class="fas fa-user-cog"></i> <span>My Account</span>
        </a>
        <button class="profile-action" onclick="logout()">
          <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
        </button>
      </div>
    `;
  } else {
    // Guest view
    userSectionHTML = `
      <div class="guest-view">
        <i class="fas fa-gamepad"></i>
        <p>Join the arena to compete, win prizes, and track your stats!</p>
        <button class="header-cta" style="width: 100%; margin-top: 1rem;" onclick="redirectToAuth()">Join Us Now</button>
      </div>
    `;
  }

  // Combine the parts into the final HTML for the panel
  mobileNavContainer.innerHTML = `
    ${closeButtonHTML}
    ${userSectionHTML}
    ${navLinksHTML}
  `;
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (!hamburger || !mobileNav) {
      console.error("Navbar elements not found. Make sure the HTML is included.");
      return;
  }
  
  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (event) => {
    if (!mobileNav.classList.contains('is-open')) return;
    const closeButton = event.target.closest('.mobile-nav-close');
    if (closeButton) {
      closeMobileNav();
      return;
    }
    const isClickInsideNav = event.target.closest('#mobile-nav');
    const isClickOnHamburger = event.target.closest('.hamburger');
    if (!isClickInsideNav && !isClickOnHamburger) {
      closeMobileNav();
    }
  });
  
  // Set up the content of the navbars
  checkUserAuthentication();
  setupMobileNav();
});