import { renderLoginForm } from './ui.js';
import { login } from './auth.js';

function checkAuthAndRender() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        renderLoginForm();
        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const result = await login(username, password);
            if (result.success) {

            } else {
                renderLoginForm(result.error)
            }
        })
    } else {

    }
    }
    window.onload = checkAuthAndRender;