import { renderLoginForm, renderProfile } from './ui.js';
import { login, logout } from './auth.js';
import { fetchUserInfo, fetchXPTransactions, fetchAuditTransactions } from './api.js';

function processXP(transactions) {
    const totalXP = transactions.reduce((sum, t) => sum + t.amount, 0);
    return (totalXP / 1000000).toFixed(2); // MB
}

function processAudit(audits) {
    const upAudits = audits.filter(a => a.type === 'up').reduce((sum, a) => sum + a.amount, 0);
    const downAudits = audits.filter(a => a.type === 'down').reduce((sum, a) => sum + Math.abs(a.amount), 0);
    return downAudits > 0 ? (upAudits / downAudits).toFixed(1) : upAudits.toFixed(1);
}

async function checkAuthAndRender() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        renderLoginForm();
        console.log("Checking for login form...");
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('login-username').value;
                const password = document.getElementById('login-password').value;
                console.log('About to call login with:', username, password);
                const result = await login(username, password);
                console.log('Login result:', result);
                if (result.success) {
                    const token = localStorage.getItem('jwt');
                    await renderUserProfile(token);
                    // const userResult = await fetchUserInfo(token);
                    // if (userResult.success) {
                    //     renderProfile(userResult.user);
                    // } else {
                    //     // logout();
                    //     renderLoginForm("Session expired. Please log in again.");
                    // }
                } else {
                    renderLoginForm(result.error);
                }
            });
        } else {
            console.log("Login form not found in DOM");
        }
    } else {
        // const result = await fetchUserInfo(token);
        // if (result.success) {
        //     renderProfile(result.user);
        // } else {
        //     // Token invalid or expired, log out and show login form
        //     logout();
        //     renderLoginForm("Session expired. Please log in again.");
        // }
        await renderUserProfile(token);
    }
}

async function renderUserProfile(token) {
    const userResult = await fetchUserInfo(token);
    if (userResult.success) {
        const user = userResult.user;
        // Fetch XP and audits in parallel
        const [xpResult, auditResult] = await Promise.all([
            fetchXPTransactions(token, user.id),
            fetchAuditTransactions(token, user.id)
        ]);
        // Process XP
        let xp = '--';
        let xpTransactions = [];
        if (xpResult.success) {
            xpTransactions = xpResult.transactions;
            xp = processXP(xpTransactions);
        }
        // Process audits
        let auditRatio = '--';
        let auditTransactions = [];
        if (auditResult.success) {
            auditTransactions = auditResult.transactions;
            auditRatio = processAudit(auditTransactions);
        }
        // Render profile with user info, XP, audit ratio, and raw transactions for graphs
        renderProfile({ ...user, xp, auditRatio, xpTransactions, auditTransactions });
    } else {
        logout();
        renderLoginForm("Session expired. Please log in again.");
    }
}

checkAuthAndRender();