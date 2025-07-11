import { renderLoginForm, renderProfile } from "./ui.js";
import { login, logout } from "./auth.js";
import {
  fetchUserInfo,
  fetchXPTransactions,
  fetchAuditTransactions,
  fetchUserGrades,
  fetchProjectProgress,
  fetchProjectResults
} from "./api.js";

async function checkAuthAndRender() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    renderLoginForm();
    console.log("Checking for login form...");
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        console.log("About to call login with:", username, password);
        const result = await login(username, password);
        console.log("Login result:", result);
        if (result.success) {
          const token = localStorage.getItem("jwt");
          await renderUserProfile(token);
        } else {
          renderLoginForm(result.error);
        }
      });
    } else {
      console.log("Login form not found in DOM");
    }
  } else {
    await renderUserProfile(token);
  }
}

async function renderUserProfile(token) {
  const userResult = await fetchUserInfo(token);
  if (userResult.success) {
    const user = userResult.user;
    // Fetch XP, audits, grades, projects, and skills in parallel
    const [xpResult, auditResult, gradesResult, projectProgressResult, projectResultsResult] = await Promise.all([
      fetchXPTransactions(token, user.id),
      fetchAuditTransactions(token, user.id),
      fetchUserGrades(token, user.id),
      fetchProjectProgress(token, user.id),
      fetchProjectResults(token, user.id),
    ]);
    // Process XP
    let xp = "--";
    let xpTransactions = [];
    if (xpResult.success) {
      xpTransactions = xpResult.transactions;
      xp = (xpTransactions.reduce((sum, t) => sum + t.amount, 0) / 1000000).toFixed(2); // MB, 2 decimal places
    }
    // Process audits
    let auditRatio = "--";
    let auditTransactions = [];
    let auditStats = { performed: 0, received: 0 };
    if (auditResult.success) {
      auditTransactions = auditResult.transactions;
      // Restore previous audit ratio logic: sum of up amounts / sum of down amounts
      const upAudits = auditTransactions
        .filter((a) => a.type === "up")
        .reduce((sum, a) => sum + a.amount, 0);
      const downAudits = auditTransactions
        .filter((a) => a.type === "down")
        .reduce((sum, a) => sum + Math.abs(a.amount), 0);
      auditRatio = downAudits > 0
        ? (upAudits / downAudits).toFixed(1)
        : "--";
      auditStats = {
        performed: auditTransactions.filter(a => a.type === "up").length,
        received: auditTransactions.filter(a => a.type === "down").length
      };
    }
    // Process grades
    let grades = { total: 0, passed: 0, failed: 0, ratio: "0%" };
    if (gradesResult.success) {
      grades = {
        total: gradesResult.grades.length,
        passed: gradesResult.grades.filter(g => g.grade !== null && g.grade > 0).length,
        failed: gradesResult.grades.filter(g => g.grade === null || g.grade === 0).length,
        ratio: gradesResult.grades.length > 0 ? ((gradesResult.grades.filter(g => g.grade !== null && g.grade > 0).length / gradesResult.grades.length) * 100).toFixed(1) + "%" : "0%"
      };
    }
    // Process projects - try both sources
    let projects = [];
    if (projectProgressResult.success && projectProgressResult.projects.length > 0) {
      projects = projectProgressResult.projects;
      console.log("Using project progress data");
    } else if (projectResultsResult.success && projectResultsResult.projects.length > 0) {
      projects = projectResultsResult.projects;
      console.log("Using project results data");
    } else {
      console.log("No project data found from either source");
    }
    
    // Debug: Show all projects with their grades
    console.log("=== ALL MODULE PROJECTS WITH GRADES ===");
    projects.forEach((project, index) => {
      const projectName = project.path.split('/').pop();
      const status = project.grade === null ? "NULL (In Progress)" : 
                    project.grade === 0 ? "FAILED" : 
                    project.grade > 0 ? "PASSED" : "UNKNOWN";
      console.log(`${index + 1}. ${projectName}: Grade ${project.grade} (${status})`);
    });
    
    // Render profile with user info, XP, audit ratio, audit stats, and projects for graphs
    renderProfile({
      ...user,
      xp,
      auditRatio,
      auditStats,
      xpTransactions,
      auditTransactions,
      projects,
    });
  } else {
    logout();
    renderLoginForm("Session expired. Please log in again.");
  }
}

checkAuthAndRender();
