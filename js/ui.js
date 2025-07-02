function renderLoginForm(errorMessage = "") {
    const app = document.getElementById("app");
    app.innerHTML = `
    <form>
        <h2>Login</h2>
        <input type="text" id="login-username" placeholder="Username or Email" required>
        <input type="password" id="login-password" placeholder="Password" required>
        <button type="submit">Login</button>
        <div class="error">${errorMessage}</div>
    </form>`
}

function renderProfile(userData) {
    const app = document.getElementById("app");
    app.innerHTML = `
    <button id="logout-button">Logout</button>
    `;
    document.getElementById('logout-button').addEventListener('click', () => {
        logout();
        window.location.reload();
    });
}