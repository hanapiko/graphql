import { renderLoginForm, renderProfile } from "./ui.js";
import { login, logout } from "./auth.js";
import {
  fetchUserInfo,
  fetchXPTransactions,
  fetchAuditTransactions,
  fetchUserGrades,
  fetchProjectProgress,
  fetchProjectResults,
  fetchUserSkills, // <-- add this
} from "./api.js";

function processXP(transactions) {
  const totalXP = transactions.reduce((sum, t) => sum + t.amount, 0);
  return (totalXP / 1000000).toFixed(2); // MB
}

function processAudit(audits) {
  const upAudits = audits
    .filter((a) => a.type === "up")
    .reduce((sum, a) => sum + a.amount, 0);
  const downAudits = audits
    .filter((a) => a.type === "down")
    .reduce((sum, a) => sum + Math.abs(a.amount), 0);
  return downAudits > 0
    ? (upAudits / downAudits).toFixed(1)
    : upAudits.toFixed(1);
}

function processGrades(grades) {
  if (!grades || grades.length === 0) return { total: 0, passed: 0, failed: 0, ratio: "0%" };
  
  const total = grades.length;
  const passed = grades.filter(g => g.grade !== null && g.grade > 0).length;
  const failed = grades.filter(g => g.grade === null || g.grade === 0).length;
  const ratio = total > 0 ? ((passed / total) * 100).toFixed(1) + "%" : "0%";
  
  return { total, passed, failed, ratio };
}

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
    // Fetch XP, audits, grades, projects, and skills in parallel
    const [xpResult, auditResult, gradesResult, projectProgressResult, projectResultsResult, skillsResult] = await Promise.all([
      fetchXPTransactions(token, user.id),
      fetchAuditTransactions(token, user.id),
      fetchUserGrades(token, user.id),
      fetchProjectProgress(token, user.id),
      fetchProjectResults(token, user.id),
      fetchUserSkills(token, user.id), // <-- fetch skills
    ]);
    // Process XP
    let xp = "--";
    let xpTransactions = [];
    if (xpResult.success) {
      xpTransactions = xpResult.transactions;
      xp = processXP(xpTransactions);
    }
    // Process audits
    let auditRatio = "--";
    let auditTransactions = [];
    let auditStats = { performed: 0, received: 0 };
    if (auditResult.success) {
      auditTransactions = auditResult.transactions;
      auditRatio = processAudit(auditTransactions);
      
      // Calculate audit statistics
      const upAudits = auditTransactions.filter(a => a.type === "up").length;
      const downAudits = auditTransactions.filter(a => a.type === "down").length;
      auditStats = { performed: upAudits, received: downAudits };
    }
    // Process grades
    let grades = { total: 0, passed: 0, failed: 0, ratio: "0%" };
    if (gradesResult.success) {
      grades = processGrades(gradesResult.grades);
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
    
    // Process skills
    let userSkills = [];
    if (skillsResult && skillsResult.success) {
      userSkills = skillsResult.skills;
    }
    
    // Render profile with user info, XP, audit ratio, audit stats, and projects for graphs
    renderProfile({
      ...user,
      xp,
      auditRatio,
      auditStats,
      xpTransactions,
      auditTransactions,
      projects,
      userSkills, // <-- pass to UI
    });
  } else {
    logout();
    renderLoginForm("Session expired. Please log in again.");
  }
}

checkAuthAndRender();
