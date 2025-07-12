import { logout } from './auth.js';
import { drawXPLineChart, drawAuditRatioChart } from './graphs.js';

function renderLoginForm(errorMessage = "") {
    console.log("renderLoginForm called");
    const app = document.getElementById("app");
    app.innerHTML = `
    <div class="login-overlay"></div>
    <div class="login-form-wrapper">
      <form id="login-form">
          <h2>Login</h2>
          <input type="text" id="login-username" placeholder="Username or Email" required>
          <div class="password-field-wrapper">
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="button" class="password-toggle" id="password-toggle">
              <svg class="eye-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <button type="submit">Login</button>
          <div class="error">${errorMessage}</div>
      </form>
    </div>
    `;
    
    // Add password toggle functionality
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('login-password');
    
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Update the eye icon
        const eyeIcon = this.querySelector('.eye-icon');
        if (type === 'text') {
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            `;
        }
    });
}

function renderProfile(userData) {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="navbar">
            <div class="navbar-info">
                <span class="navbar-username">${userData.login}</span>
                <span class="navbar-email">${userData.email}</span>
            </div>
            <button id="logout-button">Logout</button>
        </div>
        <div class="info-section">
            <div class="info-card">
                <h4>XP Amount</h4>
                <div class="info-value">${userData.xp} MB</div>
            </div>
            <div class="info-card">
                <h4>Audit Ratio</h4>
                <div class="info-value">${userData.auditRatio}</div>
            </div>
            <div class="info-card">
                <h4>Audits Performed</h4>
                <div class="info-value">${userData.auditStats ? userData.auditStats.performed : '--'}</div>
                <div class="info-subtitle">vs ${userData.auditStats ? userData.auditStats.received : '--'} received</div>
            </div>
        </div>
        <div class="statistics-section">
            <div class="statistics-graph">
                <h4>XP Progress Over Time</h4>
                <svg id="xpChart" width="400" height="260"></svg>
            </div>
            <div class="statistics-graph">
                <h4>Audit Ratio (Performed vs Received)</h4>
                <svg id="auditChart" width="320" height="260"></svg>
            </div>
        </div>
    `;
    document.getElementById('logout-button').addEventListener('click', () => {
        logout();
        window.location.reload();
    });

    drawXPLineChart(userData.xpTransactions);
    drawAuditRatioChart(userData.auditTransactions);
}

export { renderLoginForm, renderProfile };
