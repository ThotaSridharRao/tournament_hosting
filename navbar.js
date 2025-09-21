

// --- HELPER FUNCTIONS ---
function redirectToAuth(tab = 'register') {
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `auth.html?tab=${tab}&returnUrl=${returnUrl}`;
}

function getSessionData() {
  const session = localStorage.getItem('earena_session') || sessionStorage.getItem('earena_session');
  try {
    return session ? JSON.parse(session) : null;
  } catch (error) {
    return null;
  }
}

function logout() {
  localStorage.removeItem('earena_session');
  sessionStorage.removeItem('earena_session');
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

function setupMobileNav() {
  const sessionData = getSessionData();
  const mobileNavContainer = document.getElementById('mobile-nav');
  const user = sessionData?.data?.user || sessionData?.user;
  const closeButtonHTML = `<button class="mobile-nav-close" aria-label="Close menu"><i class="fas fa-times"></i></button>`;

  if (user) {
    const username = user.username || user.email.split('@')[0];
    mobileNavContainer.innerHTML = `
      ${closeButtonHTML}
      <div class="profile-header">
        <div class="profile-photo"><i class="fas fa-user"></i></div>
        <div class="profile-info">
          <div class="profile-username">${username}</div>
        </div>
      </div>
      <div class="profile-actions">
        <a href="user-dashboard.html" class="profile-action">
          <i class="fas fa-user-cog"></i>
          <span>My Account</span>
        </a>
        <button class="profile-action" onclick="logout()">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    `;
  } else {
    mobileNavContainer.innerHTML = `
      ${closeButtonHTML}
      <div class="guest-view">
        <i class="fas fa-gamepad"></i>
        <p>Join the arena to register for tournaments, track your stats, and win prizes!</p>
        <button class="btn-primary" style="width: 100%; margin-top: 1rem;" onclick="redirectToAuth()">Join Us Now</button>
      </div>
    `;
  }
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