import { logout } from './auth.js';
import { drawXPLineChart, drawProjectPassFailChart } from './graphs.js';

function renderLoginForm(errorMessage = "") {
    console.log("renderLoginForm called");
    const app = document.getElementById("app");
    app.innerHTML = `
    <div class="login-overlay"></div>
    <div class="login-form-wrapper">
      <form id="login-form">
          <h2>Login</h2>
          <input type="text" id="login-username" placeholder="Username or Email" required>
          <input type="password" id="login-password" placeholder="Password" required>
          <button type="submit">Login</button>
          <div class="error">${errorMessage}</div>
      </form>
    </div>
    `;
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
                <h4>Projects Status: Passed, Failed & Ongoing</h4>
                <svg id="auditChart" width="260" height="260"></svg>
            </div>
        </div>
    `;
    document.getElementById('logout-button').addEventListener('click', () => {
        logout();
        window.location.reload();
    });

    drawXPLineChart(userData.xpTransactions);
    drawProjectPassFailChart(userData.projects);
}

export { renderLoginForm, renderProfile };
