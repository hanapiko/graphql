import { logout } from "./auth.js";
import { drawXPLineChart, drawAuditPieChart } from "./graphs.js";

function renderLoginForm(errorMessage = "") {
  console.log("renderLoginForm called");
  const app = document.getElementById("app");
  app.innerHTML = `
    <form id="login-form">
        <h2>Login</h2>
        <input type="text" id="login-username" placeholder="Username or Email" required>
        <input type="password" id="login-password" placeholder="Password" required>
        <button type="submit">Login</button>
        <div class="error">${errorMessage}</div>
    </form>`;
}

function renderProfile(userData) {
  const app = document.getElementById("app");
  app.innerHTML = `
        <h2>Welcome, ${userData.login}!</h2>
        <ul>
            <li><strong>First Name:</strong> ${userData.firstName}</li>
            <li><strong>Last Name:</strong> ${userData.lastName}</li>
            <li><strong>Email:</strong> ${userData.email}</li>
            <li><strong>XP Amount:</strong> ${userData.xp}</li>
            <li><strong>Audit Ratio:</strong> ${userData.auditRatio}</li>
        </ul>
         <h3>Statistics</h3>
        <div>
            <h4>XP Progress Over Time</h4>
            <svg id="xpChart" width="500" height="300"></svg>
        </div>
        <div>
            <h4>Audit Ratio</h4>
            <svg id="auditChart" width="300" height="300"></svg>
        </div>
        <button id="logout-button">Logout</button>
    `;
  document.getElementById("logout-button").addEventListener("click", () => {
    logout();
    window.location.reload();
  });

  drawXPLineChart(userData.xpTransactions);
  drawAuditPieChart(userData.auditTransactions);
}

export { renderLoginForm, renderProfile };
