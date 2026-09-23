                    // ======================
                    // DASHBOARD
                    // ======================


function getHeroBanner(variant) {
    const nickname = getSavedNickname();

    // Inner screens get a one-row header so the task starts above the fold;
    // login, dashboard and welcome keep the full banner.
    if (variant !== "full" && variant !== "login") {
        return `
        <header class="app-header">

            <div class="app-header-brand" onclick="goHome()" aria-label="Go to Main Dashboard">
                <div class="app-header-title">MTBE / METATHESIS TRAINING</div>
                <p class="app-header-subtitle">Operations Training &amp; Assessment Platform</p>
            </div>

            ${nickname ? getUserMenu(nickname) : ""}

        </header>
        `;
    }

    if (!nickname || variant === "login") {
        return `
        <div class="hero-banner">

            <h1>MTBE / METATHESIS TRAINING</h1>

            <p class="subtitle">
                Operations Training & Assessment Platform
            </p>

            <p class="version">
                Version 5.0
            </p>

            <p class="developer">
                Developed by FO.Abdullah Al-Mehwari
            </p>

        </div>
        `;
    }

    return `
    <div class="hero-banner">

        ${getUserMenu(nickname)}

        <h1>MTBE / METATHESIS TRAINING</h1>

        <p class="subtitle">
            Operations Training & Assessment Platform
        </p>

        <p class="version">
            Version 5.0
        </p>

        <p class="developer">
            Developed by FO.Abdullah Al-Mehwari
        </p>

    </div>
    `;
}

                    // ======================
                    // USER PROFILE BUTTON + DROPDOWN
                    // ======================

function getUserMenu(nickname) {
    return `
        <div class="hero-user-wrapper">

            <div
                class="hero-user-btn"
                onclick="toggleUserDropdown(event)"
                aria-haspopup="true"
                aria-expanded="false"
                aria-controls="heroUserDropdown"
            >
                <span class="hero-user-icon" aria-hidden="true">👤</span>
                <span class="hero-user-name">${nickname}</span>
                <span class="hero-user-arrow" id="heroUserArrow" aria-hidden="true">▼</span>
            </div>

            <div class="hero-user-dropdown" id="heroUserDropdown">

                <div class="dropdown-item" onclick="showAnalytics()">
                    📊 Analytics
                </div>

                <div class="dropdown-item" onclick="showMyProgress()">
                    📈 My Progress
                </div>

                <div class="dropdown-item" onclick="switchUser()">
                    🔄 Switch User
                </div>

${
    window.currentUserIsAdmin === true
        ? `
            <div class="dropdown-divider"></div>

            <div class="dropdown-admin-label">
                Admin
            </div>

            <div class="dropdown-item" onclick="showUsersAnalytics()">
                👥 Users Analytics
            </div>

            <div class="dropdown-item" onclick="showAdminDashboard()">
                🛠️ Admin Dashboard
            </div>

            <div class="dropdown-divider"></div>
        `
        : ''
}

                <div class="dropdown-item dropdown-item-danger" onclick="logout()">
                    🚪 Logout
                </div>

            </div>

        </div>
    `;
}

function showLogin() {

  document.getElementById("content").innerHTML = `

${getHeroBanner("login")}

    <div class="dashboard-cards">

      <div class="module-card login-card login-card-gold">

        <div class="login-card-header">
          <div class="login-card-title">
            🔐 Platform Access
          </div>
        </div>

        <form id="login-form" class="login-form" novalidate>

            <label class="login-label" for="Username">
              Username
            </label>

            <input
                id="Username"
                type="text"
                placeholder="Enter Username"
                class="login-input"
                autocomplete="username"
                autocapitalize="none"
                spellcheck="false"
                aria-describedby="login-message"
            >

            <label class="login-label" for="pin">
              PIN
            </label>

            <input
                id="pin"
                type="password"
                placeholder="6-digit PIN"
                class="login-input"
                autocomplete="current-password"
                maxlength="6"
                inputmode="numeric"
                pattern="[0-9]{6}"
                aria-describedby="login-message"
            >

            <button
              id="login-btn"
              class="login-button"
              type="submit"
            >
              Enter Platform
            </button>

            <div id="login-message" class="login-message" role="alert"></div>

        </form>

      </div>

    </div>



<div class="content-box new-user">
<h3>🆕 For New User:</h3>
    Choose a Special Username,
    <strong>Example:</strong> Mehwari32 & Create a 6-digit PIN
</div>


<div class="content-box returning-user">
 <h3>👤 For Returning User:</h3>
    Enter your previous Username & PIN to Access your Training Progress.
</div>


<div class="content-box important-card">
    <h3>⚠️ Important</h3>
    <p>
        Forgotten PINs cannot be recovered. They are required to access your Training Progress!
    </p>

  </div>

  `;

    // Set through the DOM, not the template, so a stored value is never parsed as HTML.
    document.getElementById("Username").value =
        localStorage.getItem("lastUsername") || "";

    document.getElementById("login-form")
        .addEventListener("submit", submitLogin);
}

function showLoginMessage(message) {
    document.getElementById("login-message").textContent = message;
}

// One path for the button and the Enter key, with validation that names the problem.
async function submitLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("Username");
    const pinInput = document.getElementById("pin");
    const button = document.getElementById("login-btn");

    const nickname = usernameInput.value.trim();
    const pin = pinInput.value.trim();

    usernameInput.removeAttribute("aria-invalid");
    pinInput.removeAttribute("aria-invalid");

    let invalidInput = null;

    if (!nickname) {
        invalidInput = usernameInput;
        showLoginMessage("Enter your username.");
    } else if (!/^[a-z0-9_]+$/i.test(nickname)) {
        invalidInput = usernameInput;
        showLoginMessage("Usernames can only use letters, numbers and underscores.");
    } else if (!/^\d{6}$/.test(pin)) {
        invalidInput = pinInput;
        showLoginMessage("Your PIN must be exactly 6 digits.");
    }

    if (invalidInput) {
        invalidInput.setAttribute("aria-invalid", "true");
        invalidInput.focus();
        return;
    }

    showLoginMessage("");
    button.disabled = true;
    button.textContent = "Signing in…";

    let profile = null;

    try {
        profile = await registerOrLogin(nickname, pin);
    } catch (error) {
        console.error("Login error:", error);
        button.disabled = false;
        button.textContent = "Enter Platform";
        showLoginMessage("Can't reach the server. Check your connection and try again.");
        return;
    }

    if (profile) {
        localStorage.setItem("lastUsername", nickname);
        showHome();
        return;
    }

    button.disabled = false;
    button.textContent = "Enter Platform";
    showLoginMessage("❌ Incorrect Username or PIN");
    pinInput.value = "";
    pinInput.setAttribute("aria-invalid", "true");
    pinInput.focus();
}



                    // ======================
                    // USER DROPDOWN CONTROLS
                    // ======================

function toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('heroUserDropdown');
    const arrow = document.getElementById('heroUserArrow');
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('dropdown-open');
    const button = document.querySelector('.hero-user-btn');
    if (isOpen) {
        dropdown.classList.remove('dropdown-open');
        if (arrow) arrow.classList.remove('arrow-rotated');
        if (button) button.setAttribute('aria-expanded', 'false');
    } else {
        dropdown.classList.add('dropdown-open');
        if (arrow) arrow.classList.add('arrow-rotated');
        if (button) button.setAttribute('aria-expanded', 'true');
    }
}

function closeUserDropdown() {
    const dropdown = document.getElementById('heroUserDropdown');
    const arrow = document.getElementById('heroUserArrow');
    const button = document.querySelector('.hero-user-btn');
    if (dropdown) dropdown.classList.remove('dropdown-open');
    if (arrow) arrow.classList.remove('arrow-rotated');
    if (button) button.setAttribute('aria-expanded', 'false');
}
document.addEventListener('click', function () {
    closeUserDropdown();
});
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeUserDropdown();
});

                    // ======================
                    // KEYBOARD ACCESS FOR CLICKABLE CARDS
                    // ======================

// Screens render clickable <div onclick> cards; give each one button
// semantics so Tab reaches it and Enter / Space activate it.
(function makeClickableCardsKeyboardReachable() {
    const content = document.getElementById("content");
    if (!content) return;

    const upgrade = () => {
        content
            .querySelectorAll("div[onclick]:not([tabindex])")
            .forEach(element => {
                element.tabIndex = 0;
                element.setAttribute("role", "button");
            });
    };

    new MutationObserver(upgrade)
        .observe(content, { childList: true, subtree: true });

    content.addEventListener("keydown", event => {
        const element = event.target;
        if (!element.matches || !element.matches('div[role="button"][onclick]')) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            element.click();
        }
    });
})();

                    // ======================
                    // SHARED SCREEN HELPERS
                    // ======================

// Question text, options and section names come from the database;
// escape them before they go into a template.
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Skeleton placeholder while a screen waits for Supabase.
function showLoading(label) {
    document.getElementById("content").innerHTML = `
        ${getHeroBanner()}
        <div class="content-box">
            <div class="loading-state" role="status" aria-live="polite">
                <span class="visually-hidden">${escapeHtml(label)}</span>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton"></div>
                <div class="skeleton skeleton-block"></div>
                <div class="skeleton skeleton-block"></div>
            </div>
        </div>
    `;
}

function getPlantClass(plant) {
    return "plant-" + String(plant || "mtbe").toLowerCase();
}

// ======================
// USER MENU PAGES
// ======================



// ======================
// ANALYTICS & PROGRESS
// ====================


// ======================
// MY PROGRESS
// ======================

// Pass mark and formulas are the ones the screens used before; now computed once.
function summarizeResults(results) {
    const totalExams = results.length;
    const scores = results.map(exam => Number(exam.score_percentage) || 0);

    const averageScore = totalExams
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / totalExams)
        : 0;

    const bestScore = totalExams
        ? Math.max(...scores)
        : 0;

    const passRate = totalExams
        ? Math.round((scores.filter(score => score >= 80).length / totalExams) * 100)
        : 0;

    return { totalExams, averageScore, bestScore, passRate };
}

function statCard(label, value, barPercent, tone) {
    const width = Math.max(0, Math.min(barPercent, 100));

    return `
        <div class="stat-card stat-${tone}">
            <span class="stat-label">${label}</span>
            <span class="stat-value">${value}</span>
            <div class="stat-bar" aria-hidden="true">
                <span style="width:${width}%;"></span>
            </div>
        </div>
    `;
}

function progressEmptyState() {
    return `
        <div class="empty-state">
            <h3>No exams yet</h3>
            <p>
                Take a Full or Random exam from any training module.
                Your scores and pass rate will show up here.
            </p>
            <button class="btn-primary" onclick="showHome()">
                Go to Main Dashboard
            </button>
        </div>
    `;
}

async function showAnalytics() {
    closeUserDropdown();

    showLoading("Loading analytics…");

    const results = await getUserExamResults();
    const stats = summarizeResults(results);

    document.getElementById("content").innerHTML = `
    ${getHeroBanner()}

    <div class="content-box">

        <div class="mobile-nav-buttons">
            <button onclick="showHome()">🏠 Main Dashboard</button>
            <button onclick="showMyProgress()">📈 My Progress</button>
        </div>

        <h2 class="page-title">📊 Analytics Dashboard</h2>
        <p class="page-subtitle">Across all of your exams</p>

        ${
            stats.totalExams
                ? `
        <div class="stat-grid">
            ${statCard("📚 Total Exams", stats.totalExams, Math.min(stats.totalExams * 10, 100), "blue")}
            ${statCard("✅ Pass Rate", stats.passRate + "%", stats.passRate, "green")}
            ${statCard("🎯 Average Score", stats.averageScore + "%", stats.averageScore, "purple")}
            ${statCard("🏆 Best Score", stats.bestScore + "%", stats.bestScore, "gold")}
            ${statCard("📈 Improvement", (stats.bestScore - stats.averageScore) + "%", stats.bestScore - stats.averageScore, "blue")}
        </div>
                `
                : progressEmptyState()
        }

    </div>
    `;
}


async function showMyProgress() {
    closeUserDropdown();

    showLoading("Loading your progress…");

    const results = await getUserExamResults();
    const stats = summarizeResults(results);

    const lastExam = results[0] || null;

    const lastExamDate = lastExam
        ? new Date(lastExam.created_at).toLocaleDateString()
        : "-";

    const moduleStats = {};

    results.forEach(exam => {
        if (!exam.module || exam.module === "EMPTY") {
            return;
        }

        moduleStats[exam.module] = (moduleStats[exam.module] || 0) + 1;
    });

    const moduleRows = Object.entries(moduleStats)
        .map(([module, count]) => `
            <li class="${getPlantClass(module)}">
                <span>📚 ${escapeHtml(module)}</span>
                <div class="stat-bar" aria-hidden="true">
                    <span style="width:${Math.min(count * 25, 100)}%; background:var(--plant);"></span>
                </div>
                <strong>${count}</strong>
            </li>
        `)
        .join("");

    document.getElementById("content").innerHTML = `
    ${getHeroBanner()}

    <div class="content-box">

        <div class="mobile-nav-buttons">
            <button onclick="showHome()">🏠 Main Dashboard</button>
            <button onclick="showAnalytics()">📊 Analytics</button>
        </div>

        <h2 class="page-title">📈 My Progress</h2>
        <p class="page-subtitle">Your exam history at a glance</p>

        ${
            stats.totalExams
                ? `
        <h3 class="section-heading">📊 Performance Summary</h3>

        <div class="stat-grid">
            ${statCard("📚 Exams", stats.totalExams, Math.min(stats.totalExams * 10, 100), "purple")}
            ${statCard("🎯 Average", stats.averageScore + "%", stats.averageScore, "blue")}
            ${statCard("🏆 Best", stats.bestScore + "%", stats.bestScore, "gold")}
            ${statCard("✅ Pass", stats.passRate + "%", stats.passRate, "green")}
        </div>

        <h3 class="section-heading">🕒 Last Exam</h3>

        <dl class="detail-list">
            <div><dt>📚 Module</dt><dd>${escapeHtml(lastExam.module || "-")}</dd></div>
            <div><dt>👤 Role</dt><dd>${escapeHtml(lastExam.role || "-")}</dd></div>
            <div><dt>📝 Type</dt><dd>${escapeHtml(lastExam.exam_type || "-")}</dd></div>
            <div><dt>🎯 Score</dt><dd>${Number(lastExam.score_percentage) || 0}%</dd></div>
            <div><dt>📅 Date</dt><dd>${lastExamDate}</dd></div>
        </dl>

        <h3 class="section-heading">📚 Exams per Module</h3>

        ${
            moduleRows
                ? `<ul class="plant-counts">${moduleRows}</ul>`
                : `<p class="page-subtitle">No module data available</p>`
        }
                `
                : progressEmptyState()
        }

    </div>
    `;
}

// Finish signing out before rendering, so the login screen never shows the previous user.
async function signOutAndShowLogin() {
    closeUserDropdown();
    document.body.classList.add("is-busy");

    try {
        await logoutUser();
    } finally {
        document.body.classList.remove("is-busy");
        showLogin();
    }
}

function switchUser() {
    return signOutAndShowLogin();
}

function logout() {
    return signOutAndShowLogin();
}

                    // ======================
                    // ADMIN PLACEHOLDERS
                    // ======================

async function showUsersAnalytics() {

    closeUserDropdown();

    const content =
        document.getElementById("content");

    content.innerHTML = `
        ${getHeroBanner()}

        <div class="content-box">

            <div class="mobile-nav-buttons">
            <button onclick="showHome()">
                🏠 Main Dashboard
            </button>
            </div>

            <h2 style="
                text-align:center;
                margin-top:25px;
                margin-bottom:10px;
            ">
                👥 Users Analytics
            </h2>

            <p style="
                text-align:center;
                color:#94a3b8;
                margin-bottom:25px;
            ">
                Loading Users Data...
            </p>

        </div>
    `;

    const { data, error } =
        await window.supabaseClient
            .functions
            .invoke(
                "admin-users-analytics",
                {
                    body: {}
                }
            );

    if (error || !data) {

        console.error(
            "Admin Analytics Error:",
            error
        );

        content.innerHTML = `
            ${getHeroBanner()}

            <div class="content-box">

                <div class="mobile-nav-buttons">
                <button onclick="showHome()">
                    🏠 Main Dashboard
                </button>
                </div>

                <h2 style="text-align:center;">
                    👥 Users Analytics
                </h2>

                <p style="
                    text-align:center;
                    color:#fca5a5;
                    margin-top:30px;
                    font-weight:bold;
                ">
                    ⛔ Admin Access Required
                </p>

            </div>
        `;

        return;
    }

    const users =
        data.users || [];

    let usersHtml = "";

    users.forEach(user => {

        const lastLogin =
            user.last_login
                ? new Date(
                    user.last_login
                ).toLocaleString()
                : "No Login Data";

        usersHtml += `

            <div style="
                background:#0f172a;
                padding:18px;
                margin-top:15px;
                border-radius:12px;
                border:1px solid #334155;
            ">

                <h3 style="
                    margin:0 0 15px 0;
                    color:#93c5fd;
                ">
                    👤 ${user.nickname}
                </h3>

                <p>
                    <strong>
                        📚 Total Exams:
                    </strong>
                    ${user.total_exams}
                </p>

                <p>
                    <strong>
                        🎯 Average Score:
                    </strong>
                    ${user.average_score}%
                </p>

                <p>
                    <strong>
                        🏆 Best Score:
                    </strong>
                    ${user.best_score}%
                </p>

                <p>
                    <strong>
                        ✅ Pass Rate:
                    </strong>
                    ${user.pass_rate}%
                </p>

                <p>
                    <strong>
                        🕒 Last Login:
                    </strong>
                    ${lastLogin}
                </p>

            </div>
        `;
    });

    content.innerHTML = `
        ${getHeroBanner()}

        <div class="content-box">

            <div class="mobile-nav-buttons">
            <button onclick="showHome()">
                🏠 Main Dashboard
            </button>
            </div>

            <h2 style="
                text-align:center;
                margin-top:25px;
                margin-bottom:8px;
            ">
                👥 Users Analytics
            </h2>

            <p style="
                text-align:center;
                color:#94a3b8;
                margin-bottom:25px;
            ">
                Admin Dashboard
            </p>

            <div style="
                background:#1e293b;
                padding:15px;
                border-radius:12px;
                margin-bottom:20px;
                border:1px solid rgba(255,255,255,0.08);
            ">

                <strong>
                    👥 Total Users:
                </strong>

                ${data.total_users}

            </div>

            ${
                usersHtml ||
                `
                <p style="
                    text-align:center;
                    color:#94a3b8;
                ">
                    No users found.
                </p>
                `
            }

        </div>
    `;
}


function showAdminDashboard() {
    closeUserDropdown();

    document.getElementById("content").innerHTML = `
        ${getHeroBanner()}

        <div class="content-box">

            <div class="mobile-nav-buttons">
            <button onclick="showHome()">
                🏠 Main Dashboard
            </button>
            </div>

            <h2 style="
                text-align:center;
                margin-top:25px;
                margin-bottom:10px;
            ">
                🛠️ Admin Dashboard
            </h2>

            <p style="
                text-align:center;
                color:#94a3b8;
                margin-bottom:25px;
            ">
                Platform Administration
            </p>

            <div class="training-menu">

                <!-- USERS ANALYTICS CARD -->

                <div
                    class="training-card"
                    onclick="showUsersAnalytics()"
                >
                    <div class="training-icon">
                        👥
                    </div>

                    <div class="training-title">
                        Users Analytics
                    </div>

                    <div class="training-description">
                        Users, Exams & Performance
                    </div>
                </div>

                <!-- USER ROLES & PERMISSIONS CARD -->

                <div
                    class="training-card"
                    onclick="showUserRolesPermissions()"
                >
                    <div class="training-icon">
                        🔐
                    </div>

                    <div class="training-title">
                        User Roles & Permissions
                    </div>

                    <div class="training-description">
                        Manage Platform Access
                    </div>
                </div>

            </div>

        </div>
    `;
}


function showUserRolesPermissions() {
    closeUserDropdown();

    document.getElementById("content").innerHTML = `
        ${getHeroBanner()}

        <div class="content-box">

            <div class="mobile-nav-buttons">

                <button onclick="showHome()">
                    🏠 Main Dashboard
                </button>

                <button onclick="showAdminDashboard()">
                    ↩️ Admin Dashboard
                </button>

            </div>

            <h2 style="
                text-align:center;
                margin-top:25px;
                margin-bottom:10px;
            ">
                🔐 User Roles & Permissions
            </h2>

            <p style="
                text-align:center;
                color:#94a3b8;
                margin-bottom:25px;
            ">
                Manage Platform Access
            </p>

            <div class="training-menu">

<div
    class="training-card"
    onclick="showAdminUsers()"
>
                    <div class="training-icon">
                        👤
                    </div>

                    <div class="training-title">
                        Users
                    </div>

                    <div class="training-description">
                        View Registered Users
                    </div>
                </div>

                <div
    class="training-card"
    onclick="showAdminPermissions()"
>

                    <div class="training-icon">
                        🛡️
                    </div>

                    <div class="training-title">
                        Permissions
                    </div>

                    <div class="training-description">
                        Manage User Access
                    </div>
                </div>

            </div>

        </div>
    `;
}


async function showAdminUsers() {
    closeUserDropdown();

    const content =
        document.getElementById("content");

    content.innerHTML = `
        ${getHeroBanner()}

        <div class="content-box">

            <div class="mobile-nav-buttons">

                <button onclick="showHome()">
                    🏠 Main Dashboard
                </button>

                <button onclick="showUserRolesPermissions()">
                    ↩️ Roles & Permissions
                </button>

            </div>

            <h2 style="
                text-align:center;
                margin-top:25px;
                margin-bottom:10px;
            ">
                👤 Registered Users
            </h2>

            <p style="
                text-align:center;
                color:#94a3b8;
                margin-bottom:25px;
            ">
                Loading Users...
            </p>

        </div>
    `;

    const { data, error } =
        await window.supabaseClient
            .functions
            .invoke(
                "admin-users-analytics",
                {
                    body: {}
                }
            );

    if (error || !data) {
        console.error(
            "Admin Users Error:",
            error
        );

        content.innerHTML = `
            ${getHeroBanner()}

            <div class="content-box">

                <button onclick="showUserRolesPermissions()">
                    ↩️ Roles & Permissions
                </button>

                <h2 style="text-align:center;">
                    👤 Registered Users
                </h2>

                <p style="
                    text-align:center;
                    color:#fca5a5;
                    margin-top:30px;
                    font-weight:bold;
                ">
                    ⛔ Admin Access Required
                </p>

            </div>
        `;

        return;
    }

    const users =
        data.users || [];

    let usersHtml = "";

    users.forEach(user => {

        const lastLogin =
            user.last_login
                ? new Date(
                    user.last_login
                ).toLocaleString()
                : "No Login Data";

        usersHtml += `
            <div style="
                background:#0f172a;
                padding:18px;
                margin-top:15px;
                border-radius:12px;
                border:1px solid #334155;
            ">

                <h3 style="
                    margin:0 0 15px 0;
                    color:#93c5fd;
                ">
                    👤 ${user.nickname}
                </h3>

                <p>
                    <strong>📚 Total Exams:</strong>
                    ${user.total_exams}
                </p>

                <p>
                    <strong>🎯 Average Score:</strong>
                    ${user.average_score}%
                </p>

                <p>
                    <strong>🏆 Best Score:</strong>
                    ${user.best_score}%
                </p>

                <p>
                    <strong>✅ Pass Rate:</strong>
                    ${user.pass_rate}%
                </p>

                <p>
                    <strong>🕒 Last Login:</strong>
                    ${lastLogin}
                </p>

            </div>
        `;
    });

    content.innerHTML = `
        ${getHeroBanner()}

        <div class="content-box">

            <div class="mobile-nav-buttons">

                <button onclick="showHome()">
                    🏠 Main Dashboard
                </button>

                <button onclick="showUserRolesPermissions()">
                    ↩️ Roles & Permissions
                </button>

            </div>

            <h2 style="
                text-align:center;
                margin-top:25px;
                margin-bottom:10px;
            ">
                👤 Registered Users
            </h2>

            <p style="
                text-align:center;
                color:#94a3b8;
                margin-bottom:20px;
            ">
                Platform User Management
            </p>

            <div style="
                background:#1e293b;
                padding:15px;
                border-radius:12px;
                border:1px solid rgba(255,255,255,0.08);
                margin-bottom:20px;
            ">
                <strong>
                    👥 Total Registered Users:
                </strong>

                ${data.total_users}
            </div>

            ${
                usersHtml ||
                `
                <p style="
                    text-align:center;
                    color:#94a3b8;
                ">
                    No registered users found.
                </p>
                `
            }

        </div>
    `;
}

async function showAdminPermissions() {
    closeUserDropdown();

    const content =
        document.getElementById("content");

    content.innerHTML = `
        ${getHeroBanner()}

        <div class="content-box">

            <div class="mobile-nav-buttons">

                <button onclick="showHome()">
                    🏠 Main Dashboard
                </button>

                <button onclick="showUserRolesPermissions()">
                    ↩️ Roles & Permissions
                </button>

            </div>

            <h2 style="
                text-align:center;
                margin-top:25px;
                margin-bottom:10px;
            ">
                🛡️ Permissions
            </h2>

            <p style="
                text-align:center;
                color:#94a3b8;
                margin-bottom:25px;
            ">
                Loading User Permissions...
            </p>

        </div>
    `;

    const { data, error } =
        await window.supabaseClient
            .functions
            .invoke(
                "admin-users-analytics",
                {
                    body: {}
                }
            );

    if (error || !data) {

        console.error(
            "Admin Permissions Error:",
            error
        );

        content.innerHTML = `
            ${getHeroBanner()}

            <div class="content-box">

                <button onclick="showUserRolesPermissions()">
                    ↩️ Roles & Permissions
                </button>

                <h2 style="
                    text-align:center;
                    margin-top:25px;
                ">
                    🛡️ Permissions
                </h2>

                <p style="
                    text-align:center;
                    color:#fca5a5;
                    margin-top:30px;
                    font-weight:bold;
                ">
                    ⛔ Admin Access Required
                </p>

            </div>
        `;

        return;
    }

    const users =
        data.users || [];

    let usersHtml = "";

    users.forEach(user => {

        usersHtml += `
            <div style="
                background:#0f172a;
                padding:18px;
                margin-top:15px;
                border-radius:12px;
                border:1px solid #334155;
            ">

                <div style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:15px;
                    flex-wrap:wrap;
                ">

                    <div>

                        <h3 style="
                            margin:0 0 6px 0;
                            color:#93c5fd;
                        ">
                            👤 ${user.nickname}
                        </h3>

                        <p style="
                            margin:0;
                            color:#94a3b8;
                            font-size:13px;
                        ">
                            Platform User
                        </p>

                    </div>

<div style="
    padding:8px 14px;
    border-radius:999px;
    background:${
        user.is_admin
            ? 'rgba(168,85,247,0.15)'
            : 'rgba(59,130,246,0.15)'
    };
    border:1px solid ${
        user.is_admin
            ? 'rgba(168,85,247,0.35)'
            : 'rgba(59,130,246,0.35)'
    };
    color:${
        user.is_admin
            ? '#c4b5fd'
            : '#93c5fd'
    };
    font-weight:bold;
">
    ${
        user.is_admin
            ? '🛡️ Administrator'
            : '👤 Standard User'
    }
</div>

</div>

</div>
`;
});

    content.innerHTML = `
        ${getHeroBanner()}

        <div class="content-box">

            <div class="mobile-nav-buttons">

                <button onclick="showHome()">
                    🏠 Main Dashboard
                </button>

                <button onclick="showUserRolesPermissions()">
                    ↩️ Roles & Permissions
                </button>

            </div>

            <h2 style="
                text-align:center;
                margin-top:25px;
                margin-bottom:10px;
            ">
                🛡️ Permissions
            </h2>

            <p style="
                text-align:center;
                color:#94a3b8;
                margin-bottom:20px;
            ">
                Platform Access Management
            </p>

            <div style="
                background:#1e293b;
                padding:15px;
                border-radius:12px;
                border:1px solid rgba(255,255,255,0.08);
                margin-bottom:20px;
            ">
                <strong>
                    👥 Users:
                </strong>

                ${data.total_users}
            </div>

            ${
                usersHtml ||
                `
                <p style="
                    text-align:center;
                    color:#94a3b8;
                ">
                    No registered users found.
                </p>
                `
            }

        </div>
    `;
}

function showHome() {


      document.getElementById("content").innerHTML = `

${getHeroBanner("full")}



<div class="content-box">

<!-- DASHBOARD HEADER -->

<div class="dashboard-header" style="
text-align:center;
margin-bottom:10px;
">


                              <!-- DASHBOARD TITLE BADGE -->

    <div class="dashboard-title-badge" style="
    display:inline-block;
    padding:12px 28px;
    border-radius:999px;
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(255,255,255,0.08);    
    font-size:20px;
    font-weight:700;
    ">
    🏠 Operations Dashboard
    </div>

</div>

                              <!-- DASHBOARD DESCRIPTION -->

<p class="dashboard-description"
style="
text-align:center;
color:#94a3b8;
font-size:14px;
letter-spacing:1px;
margin-top:0;
margin-bottom:20px;
">
Train • Practice • Assess
</p>

                              <!-- DASHBOARD PAGE TITLE -->

<h2 class="dashboard-page-title" style="
margin-bottom:4px;
">
Training Modules
</h2>





                              <!-- DASHBOARD Sing in PAGE -->

<div id="welcome-banner" class="toast" role="status" style="display:none;"></div>

                              <!-- DASHBOARD PAGE SUBTITLE -->

<p class="dashboard-page-subtitle"
style="
color:#94a3b8;
font-size:14px;
opacity:0.75;
margin-top:4px;
margin-bottom:25px;
font-size:14px;
margin-left:20px;
letter-spacing:4px;
opacity:0.75;
letter-spacing:4px;
">
FO • CO • SSV
</p>



                                    <!-- DASHBOARD MODULE CARDS CONTAINER -->

<div class="dashboard-cards">


                                    <!-- ================= MTBE CARD ================= -->

<div
class="module-card"
style="
background:#0d47a1;
padding:20px;
border-radius:12px;
min-width:190px;
max-width:190px;
min-height:260px;
flex:none;
box-shadow:0 4px 12px rgba(0,0,0,0.25);
transition:0.3s;
">

                                    <!-- MTBE MODULE HEADER -->

    <div style="
    padding-bottom:10px;
    margin-bottom:15px;
    border-bottom:1px solid rgba(255,255,255,0.15);
    text-align:center;
    ">


                                    <!-- MTBE MODULE TITLE -->

        <div
style="
font-size:24px;
font-weight:bold;
letter-spacing:1px;
">
📘 MTBE
</div>

</div>

                                    <!-- MTBE MODULE INFORMATION -->

<p
style="
text-align:center;
color:#dbeafe;
font-size:14px;
margin-top:45px;
margin-bottom:30px;
line-height:1.8;
">
FO • CO • SSV
</p>

<button
onclick="showMTBERoles()"
style="
width:80%;
padding:14px;
display:block;
margin:0 auto;
background:#0b3d91;
border:none;
border-radius:10px;
font-weight:bold;
color:white;
cursor:pointer;
box-shadow:0 0 10px rgba(255,255,255,0.05);
">
Enter Module
</button>


</div>

                          <!-- ================= METATHESIS CARD ================= -->

<div
class="module-card"
style="
background:#2e7d32;
padding:20px;
border-radius:12px;
min-width:190px;
max-width:190px;
min-height:260px;
flex:none;
box-shadow:0 4px 12px rgba(0,0,0,0.25);
transition:0.3s;
">

                                    <!-- METATHESIS MODULE HEADER -->

<div
style="
padding-bottom:10px;
margin-bottom:15px;
border-bottom:1px solid rgba(255,255,255,0.15);
text-align:center;
">


                                    <!-- METATHESIS MODULE TITLE -->

<div
style="
font-size:22px;
font-weight:bold;
letter-spacing:1px;
">
📗 METATHESIS
</div>

</div>

<p 
style="
text-align:center;
color:#dbeafe;
font-size:14px;
margin-top:45px;
margin-bottom:30px;
line-height:1.8;
">
FO • CO • SSV
</p>

<button
onclick="showMetathesisRoles()"
style="
width:80%;
padding:14px;
display:block;
margin:0 auto;
background:#1e6b29;
border:none;
border-radius:10px;
font-weight:bold;
color:white;
cursor:pointer;
box-shadow:0 0 10px rgba(255,255,255,0.05);
">
Enter Module
</button>



</div>                              



                                    <!-- ============= SAFETY CARD ============== -->


                                        <!-- SAFETY MODULE CARD -->

<div class="module-card"
style="
background:#be2d1f;
padding:20px;
border-radius:12px;
min-width:190px;
max-width:190px;
min-height:260px;
flex:none;
box-shadow:0 4px 12px rgba(0,0,0,0.25);
transition:0.3s;
">

                                    <!-- SAFETY MODULE HEADER -->

<div
style="
padding-bottom:10px;
margin-bottom:15px;
border-bottom:1px solid rgba(255,255,255,0.15);
text-align:center;
">

                                    <!-- SAFETY MODULE TITLE -->

<div
style="
font-size:24px;
font-weight:bold;
letter-spacing:1px;
">
🦺 SAFETY
</div>

</div>

                                    <!-- SAFETY MODULE INFORMATION -->

<p
style="
text-align:center;
color:#fecaca;
font-size:14px;
margin-top:45px;
margin-bottom:30px;
line-height:1.8;
">
Question Bank • Exams
</p>

<button
onclick="showSafetyMenu()"
style="
width:80%;
padding:14px;
display:block;
margin:0 auto;
background:#b91c1c;
border:none;
border-radius:10px;
font-weight:bold;
color:white;
cursor:pointer;
box-shadow:0 0 10px rgba(255,255,255,0.05);
">
Enter Module
</button>


</div>
                                    <!-- ======= Merge CARD ========== -->


<div class="module-card"
style="
background:#7c3aed;
padding:20px;
border-radius:12px;
min-width:190px;
max-width:190px;
min-height:260px;
flex:none;
box-shadow:0 4px 12px rgba(0,0,0,0.25);
transition:0.3s;
">

        <!-- MERGE MODULE HEADER -->

<div
style="
padding-bottom:10px;
margin-bottom:15px;
border-bottom:1px solid rgba(255,255,255,0.15);
text-align:center;
">



        <!-- MERGE MODULE TITLE -->

<div
style="
font-size:24px;
font-weight:bold;
letter-spacing:1px;
">
🎯 MERGE
</div>

</div>

<p
style="
text-align:center;
color:#dbeafe;
font-size:14px;
margin-top:45px;
margin-bottom:30px;
line-height:1.8;
">
FO • CO • SSV
</p>

<button
onclick="showMergeRoles()"
style="
width:75%;
padding:14px;
display:block;
margin:0 auto;
background:#5b21b6;
border:none;
border-radius:10px;
font-weight:bold;
color:white;
cursor:pointer;
box-shadow:0 0 10px rgba(255,255,255,0.05);
">
Enter Module
</button>


</div>

</div>

<p class="dashboard-footer" style="
font-size:14px;
letter-spacing:3px;
opacity:0.45;
text-align:center;
color:#94a3b8;
">
Knowledge • Safety • Performance
</p>

`;


const welcomeBanner =
document.getElementById("welcome-banner");

if (welcomeBanner) {

    welcomeBanner.textContent =
    `Welcome Back, ${localStorage.getItem("nickname") || ""}`;

    welcomeBanner.style.display = "block";

    setTimeout(() => {

        welcomeBanner.style.display = "none";

    }, 3000);

}

}

                    /* ================= MTBE ROLES PAGE ================= */


function showMTBERoles() {

    document.getElementById("content").innerHTML = `
${getHeroBanner()}

<div class="content-box">

                                  <!-- NAVIGATION BUTTONS -->

<div class="mobile-nav-buttons">
<button onclick="showHome()">
    🏠 Main Dashboard
</button>
</div>

                                     <!-- MTBE ROLES PAGE TITLE -->

<h2 style="
text-align:center;
margin-top:25px;
margin-bottom:10px;
font-size:32px;
font-weight:700;
letter-spacing:1px;
">
    📘 MTBE
</h2>

                                 <!-- MTBE ROLES PAGE DESCRIPTION -->

<p style="
text-align:center;
color:#94a3b8;
margin-bottom:30px;
">
    Select Your Position
</p>

                             <!-- MTBE ROLES POSITION CARDS CONTAINER -->

<div class="training-menu">

                              <!-- MTBE ROLES POSITION CARD : FO -->

    <div
        class="training-card"
        onclick="setMTBERole('FO')"
        style="background:#0d47a1;"
    >
        <div class="training-icon">👷</div>

        <div class="training-title">
            FO
        </div>

        <div class="training-description">
            Field Operator
        </div>

                                 <!-- MTBE ROLES POSITION QUESTION COUNT -->

        <div class="training-description" style="
        margin-top:8px;
        font-weight:bold;
        color:#dbeafe;
        font-size:13px;
        ">
            Question Bank Available
        </div>

            </div>

                               <!-- MTBE ROLES POSITION CARD : CO -->

<div
    class="training-card"
    onclick="setMTBERole('CO')"
    style="background:#0d47a1;"
>

    <div class="training-icon">👨‍💻</div>

    <div class="training-title">
        CO
    </div>

    <div class="training-description">
        Console Operator
    </div>

                                   <!-- MTBE ROLES POSITION QUESTION COUNT -->

    <div class="training-description" style="
    margin-top:6px;
    font-weight:bold;
    color:#bfdbfe;
    ">
        Question Bank Available
    </div>

</div>

                                     <!-- MTBE ROLES POSITION CARD : SSV -->

<div
    class="training-card"
    onclick="setMTBERole('SSV')"
    style="background:#0d47a1;"
>

    <div class="training-icon">🧑‍💼</div>

    <div class="training-title">
        SSV
    </div>

    <div class="training-description">
        Shift Supervisor
    </div>

                                    <!-- MTBE ROLES POSITION QUESTION COUNT -->

    <div class="training-description" style="
    margin-top:6px;
    font-weight:bold;
    color:#bfdbfe;
    ">
        Question Bank Available
    </div>

</div>

                                  <!-- MTBE ROLES END POSITION CARDS CONTAINER -->

</div>

</div>

`;
}


function showMetathesisRoles() {

    document.getElementById("content").innerHTML = `

${getHeroBanner()}

    <div class="content-box">

                                     <!-- METATHESIS ROLES NAVIGATION BUTTONS -->

        <div class="mobile-nav-buttons">
        <button onclick="showHome()">
            🏠 Main Dashboard
        </button>
        </div>

                                    <!-- METATHESIS ROLES PAGE TITLE -->

<h2 style="
text-align:center;
margin-top:25px;
margin-bottom:10px;
font-size:32px;
font-weight:700;
letter-spacing:1px;
">
    📗 METATHESIS
</h2>

                                  <!-- METATHESIS ROLES PAGE DESCRIPTION -->

<p style="
text-align:center;
color:#94a3b8;
margin-bottom:30px;
">
    Select Your Position
</p>

                              <!-- METATHESIS ROLES POSITION CARDS CONTAINER -->

<div class="training-menu">

                                  <!-- METATHESIS ROLES POSITION CARD : FO -->


    <div
        class="training-card"
        onclick="setMetathesisRole('FO')"
        style="background:#2e7d32;"
    >

        <div class="training-icon">👷</div>

        <div class="training-title">
            FO
        </div>

        <div class="training-description">
            Field Operator
        </div>

                              <!-- METATHESIS ROLES POSITION QUESTION COUNT -->


<div class="training-description" style="
margin-top:8px;
font-weight:bold;
color:#dcfce7;
font-size:13px;
">
    Question Bank Available
</div>

</div>

<!-- METATHESIS ROLES POSITION CARD : CO -->

<div
    class="training-card"
    onclick="setMetathesisRole('CO')"
    style="background:#2e7d32;"
>

    <div class="training-icon">👨‍💻</div>

    <div class="training-title">
        CO
    </div>

    <div class="training-description">
        Console Operator
    </div>

                              <!-- METATHESIS ROLES POSITION QUESTION COUNT -->


    <div class="training-description" style="
    margin-top:8px;
    font-weight:bold;
    color:#dcfce7;
    font-size:13px;
    ">
        Question Bank Available
    </div>

</div>

                              <!-- METATHESIS ROLES POSITION CARD : SSV -->

<div
    class="training-card"
    onclick="setMetathesisRole('SSV')"
    style="background:#2e7d32;"
>

    <div class="training-icon">🧑‍💼</div>

    <div class="training-title">
        SSV
    </div>

    <div class="training-description">
        Shift Supervisor
    </div>

                              <!-- METATHESIS ROLES POSITION QUESTION COUNT -->


    <div class="training-description" style="
    margin-top:8px;
    font-weight:bold;
    color:#dcfce7;
    font-size:13px;
    ">
        Question Bank Available
    </div>

</div>

                              <!-- METATHESIS ROLES END POSITION CARDS CONTAINER -->

</div>

</div>

`;

}



function setMTBERole(role) {
    currentRole = role;
    showMTBEMenu();
}


/* =========================================
   LEGACY QUESTION COUNT DISPLAY

   Current question counts are calculated
   from local backup question files.

   Counts must be migrated to Supabase
   before removing local question banks.
========================================= */


function showMTBEMenu() {

    document.getElementById("content").innerHTML = `

${getHeroBanner()}

<div class="content-box">

                              <!-- MTBE MENU NAVIGATION BUTTONS -->

<div class="mobile-nav-buttons">

<button onclick="showHome()">
🏠 Main Dashboard
</button>

<button onclick="showMTBERoles()">
↩️ MTBE Dashboard
</button>

</div>


                              <!-- MTBE MENU PAGE TITLE -->

<h2 style="
text-align:center;
margin-top:25px;
margin-bottom:30px;
font-size:32px;
font-weight:700;
letter-spacing:1px;
">
📘 MTBE ${currentRole}
</h2>

                              <!-- MTBE MENU TRAINING CARDS CONTAINER -->


<div class="training-menu">

                              <!-- MTBE MENU QUESTION BANK CARD -->

    <div
        class="training-card"
        onclick="showMTBE()"
    >
        <div class="training-icon">📚</div>

        <div class="training-title">
            Question Bank
        </div>

        <div class="training-description">
            Study & Review Questions
        </div>

    </div>

                              <!-- MTBE MENU FULL EXAM CARD -->


<div
    class="training-card"
    onclick="startMTBE()"
>
    <div class="training-icon">📝</div>

    <div class="training-title">
        ${currentRole} Full Exam
    </div>

    <div class="training-description">
        Complete Assessment
    </div>

</div>

                              <!-- MTBE MENU RANDOM EXAM CARD -->

<div
    class="training-card"
    onclick="startRandomMTBEExam()"
>
    <div class="training-icon">🎲</div>

    <div class="training-title">
        ${currentRole} Random Exam
    </div>

    <div class="training-description">
        Quick Practice
    </div>

</div>

                              <!-- MTBE MENU END TRAINING CARDS CONTAINER -->

</div>

</div>

`;
}


function setMetathesisRole(role) {
    currentRole = role;
    showMetathesisMenu();
}


function showMetathesisMenu() {

    document.getElementById("content").innerHTML = `

${getHeroBanner()}

<div class="content-box">

                              <!-- METATHESIS MENU NAVIGATION BUTTONS -->

<div class="mobile-nav-buttons">

<button onclick="showHome()">
🏠 Main Dashboard
</button>

<button onclick="showMetathesisRoles()">
↩️ METATHESIS Dashboard
</button>


</div>
                              <!-- METATHESIS MENU PAGE TITLE -->

<h2 style="
text-align:center;
margin-top:25px;
margin-bottom:30px;
font-size:32px;
font-weight:700;
letter-spacing:1px;
">
📗 METATHESIS ${currentRole}
</h2>

                              <!-- METATHESIS MENU TRAINING CARDS CONTAINER -->

<div class="training-menu">

                              <!-- METATHESIS MENU QUESTION BANK CARD -->

    <div
        class="training-card"
        onclick="showMeta()"
        style="background:#2e7d32;"
    >
        <div class="training-icon">📚</div>

        <div class="training-title">
            Question Bank
        </div>

        <div class="training-description">
            Study & Review Questions
        </div>

    </div>

                              <!-- METATHESIS MENU FULL EXAM CARD -->

    <div
        class="training-card"
        onclick="startMetathesis()"
        style="background:#2e7d32;"
    >
        <div class="training-icon">📝</div>

        <div class="training-title">
            ${currentRole} Full Exam
        </div>

<div class="training-description">
    Complete Assessment
</div>

</div>

                              <!-- METATHESIS MENU RANDOM EXAM CARD -->

<div
    class="training-card"
    onclick="startRandomMETATHESISExam()"
    style="background:#2e7d32;"
>
    <div class="training-icon">🎲</div>

    <div class="training-title">
        ${currentRole} Random Exam
    </div>

    <div class="training-description">
        Quick Practice
    </div>

</div>

                              <!-- METATHESIS MENU END TRAINING CARDS CONTAINER -->

</div>

</div>

`;
}


function showMergeRoles() {

    document.getElementById("content").innerHTML = `

${getHeroBanner()}

<div class="content-box">

                              <!-- MERGE ROLES NAVIGATION BUTTONS -->

<div class="mobile-nav-buttons">
<button onclick="showHome()">
    🏠 Main Dashboard
</button>
</div>

                              <!-- MERGE ROLES PAGE TITLE -->

<h2 style="
text-align:center;
margin-top:25px;
margin-bottom:10px;
font-size:32px;
font-weight:700;
letter-spacing:1px;
">
    🎯 MERGE
</h2>

                              <!-- MERGE ROLES PAGE DESCRIPTION -->

<p style="
text-align:center;
color:#94a3b8;
margin-bottom:30px;
">
    MTBE + METATHESIS + SAFETY
</p>

                              <!-- MERGE ROLES POSITION CARDS CONTAINER -->

<div class="training-menu">

                              <!-- MERGE ROLES POSITION CARD : FO -->

    <div
        class="training-card"
        onclick="setMergeRole('FO')"
        style="background:#5b21b6;"
    >
        <div class="training-icon">👷</div>

        <div class="training-title">
            FO
        </div>

        <div class="training-description">
            Field Operator
        </div>

                              <!-- MERGE ROLES POSITION QUESTION COUNT -->

        <div class="training-description" style="
        margin-top:8px;
        font-weight:bold;
        color:#ddd6fe;
        font-size:13px;
        ">
            Question Bank Available
        </div>

    </div>



                              <!-- MERGE ROLES POSITION CARD : CO -->

<div
    class="training-card"
    onclick="setMergeRole('CO')"
    style="background:#5b21b6;"
>

    <div class="training-icon">👨‍💻</div>

    <div class="training-title">
        CO
    </div>

    <div class="training-description">
        Console Operator
    </div>

                              <!-- MERGE ROLES POSITION QUESTION COUNT -->

    <div class="training-description" style="
    margin-top:8px;
    font-weight:bold;
    color:#ddd6fe;
    font-size:13px;
    ">
        Question Bank Available
    </div>

</div>

                              <!-- MERGE ROLES POSITION CARD : SSV -->

<div
    class="training-card"
    onclick="setMergeRole('SSV')"
    style="background:#5b21b6;"
>

    <div class="training-icon">🧑‍💼</div>

    <div class="training-title">
        SSV
    </div>

    <div class="training-description">
        Shift Supervisor
    </div>

                              <!-- MERGE ROLES POSITION QUESTION COUNT -->

    <div class="training-description" style="
    margin-top:8px;
    font-weight:bold;
    color:#ddd6fe;
    font-size:13px;
    ">
        Question Bank Available
    </div>

</div>

                              <!-- MERGE ROLES END POSITION CARDS CONTAINER -->

</div>

</div>

`;
}


function setMergeRole(role) {
    currentRole = role;
    showMergeMenu();
}

function showMergeMenu() {

    document.getElementById("content").innerHTML = `

${getHeroBanner()}

<div class="content-box">

                              <!-- MERGE MENU NAVIGATION BUTTONS -->

<div class="mobile-nav-buttons">

<button onclick="showHome()">
🏠 Main Dashboard
</button>

<button onclick="showMergeRoles()">
↩️ MERGE Dashboard
</button>

</div>

                              <!-- MERGE MENU PAGE TITLE -->

<h2 style="
text-align:center;
margin-top:25px;
margin-bottom:10px;
font-size:32px;
font-weight:700;
letter-spacing:1px;
">
    🎯 MERGE ${currentRole}
</h2>


                              <!-- MERGE MENU PAGE DESCRIPTION -->

<p style="
text-align:center;
color:#ddd6fe;
margin-bottom:5px;
font-size:14px;
letter-spacing:0.5px;
">
    MTBE + METATHESIS + SAFETY
</p>



                              <!-- MERGE MENU TRAINING CARDS CONTAINER -->

<div class="training-menu">

                              <!-- MERGE MENU QUESTION BANK CARD -->

    <div
        class="training-card"
        onclick="showMergeQuestionBank()"
        style="background:#5b21b6;"
    >
        <div class="training-icon">📚</div>

        <div class="training-title">
            Question Bank
        </div>

        <div class="training-description">
            Study & Review Questions
        </div>

    </div>


                              <!-- MERGE MENU FULL EXAM CARD -->

<div
    class="training-card"
    onclick="startMergeExam()"
    style="background:#5b21b6;"
>
    <div class="training-icon">📝</div>

    <div class="training-title">
        ${currentRole} Full Exam
    </div>

    <div class="training-description">
        Complete Assessment
    </div>

</div>

                              <!-- MERGE MENU RANDOM EXAM CARD -->

<div
    class="training-card"
    onclick="startRandomMergeExam()"
    style="background:#5b21b6;"
>
    <div class="training-icon">🎲</div>

    <div class="training-title">
        ${currentRole} Random Exam
    </div>

    <div class="training-description">
        Quick Practice
    </div>

</div>

                              <!-- MERGE MENU END TRAINING CARDS CONTAINER -->

</div>

</div>

`;
}

/* =========================================
   LEGACY QUESTION BANK SOURCE
   Temporary local question arrays.
   Must remain until Supabase Question Bank
   migration is completed and validated.
========================================= */

                              /* ================QUESTION DATA SOURCES======= */



                              /* ========= MTBE QUESTION SOURCE ======== */


async function getMTBEQuestions() {

    const { data, error } =
        await window.supabaseClient
            .functions
            .invoke(
                "question-bank",
                {
                    body: {
                        plant: "MTBE",
                        role: currentRole
                    }
                }
            );

    if (error) {
        console.error(error);
        return [];
    }

    return data?.questions || [];
}

                              /* ================= METATHESIS QUESTION SOURCE ================= */

async function getMetathesisQuestions() {

    const { data, error } =
        await window.supabaseClient
            .functions
            .invoke(
                "question-bank",
                {
                    body: {
                        plant: "METATHESIS",
                        role: currentRole
                    }
                }
            );

    if (error) {
        console.error(error);
        return [];
    }

    return data?.questions || [];
}

                              /* ================= MERGE QUESTION SOURCE ================= */

async function getMergeQuestions() {

    const { data: mtbeResult } =
        await window.supabaseClient
            .functions
            .invoke(
                "question-bank",
                {
                    body: {
                        plant: "MTBE",
                        role: currentRole
                    }
                }
            );

    const { data: metaResult } =
        await window.supabaseClient
            .functions
            .invoke(
                "question-bank",
                {
                    body: {
                        plant: "METATHESIS",
                        role: currentRole
                    }
                }
            );

    const { data: safetyResult } =
        await window.supabaseClient
            .functions
            .invoke(
                "question-bank",
                {
                    body: {
                        plant: "SAFETY"
                    }
                }
            );

    return [
        ...(mtbeResult?.questions || []),
        ...(metaResult?.questions || []),
        ...(safetyResult?.questions || [])
    ];
}

                              /* ============================QUESTION BANK STATE MANAGEMENT==================== */



                              /* ================= QUESTION BANK VARIABLES ================= */

let collapsedSections = {};
let currentRole = "";
let currentExamType = "";
let currentModule = "";

                              /* ================= QUESTION BANK RENDERING ================= */

// Questions without a section belong to the section above them;
// any before the first section header go under "General".
function groupBySection(questions) {
    const sections = [];
    let current = null;

    questions.forEach(q => {
        if (q.section || !current) {
            const name = q.section || "General";

            current = sections.find(section => section.name === name);

            if (!current) {
                current = { name, questions: [] };
                sections.push(current);
            }
        }

        current.questions.push(q);
    });

    return sections;
}

function renderBankQuestion(q, number, sectionName) {
    const options = (q.options || [])
        .map((option, i) => {
            const isCorrect =
                (q.answer !== undefined && option === q.answer) ||
                (q.correct !== undefined && i === q.correct);

            return `
                <li class="qb-option${isCorrect ? " is-correct" : ""}">
                    <span class="answer-key" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
                    <span class="answer-text">${escapeHtml(option)}</span>
                    ${isCorrect ? `<span class="answer-tag">✅ Correct</span>` : ""}
                </li>
            `;
        })
        .join("");

    return `
        <article class="qb-card">
            <p class="qb-number">Question ${number}</p>
            ${sectionName ? `<p class="qb-section-name">${escapeHtml(sectionName)}</p>` : ""}
            <p class="qb-question">${escapeHtml(q.question)}</p>
            <ol class="qb-options">${options}</ol>
        </article>
    `;
}

function renderBankSections(questions, pageKey) {
    return groupBySection(questions)
        .map((section, index) => {
            const key = pageKey + ":" + section.name;
            const collapsed = collapsedSections[key] === true;
            const bodyId = `qb-${pageKey}-section-${index}`;

            return `
                <section>
                    <button
                        class="qb-section-toggle"
                        aria-expanded="${!collapsed}"
                        aria-controls="${bodyId}"
                        data-section="${escapeHtml(key)}"
                        onclick="toggleSection(this)"
                    >
                        <span class="qb-chevron" aria-hidden="true">▼</span>
                        📂 ${escapeHtml(section.name)}
                        <span class="qb-section-count">${section.questions.length} questions</span>
                    </button>

                    <div id="${bodyId}" ${collapsed ? "hidden" : ""}>
                        ${section.questions.map((q, i) => renderBankQuestion(q, i + 1, section.name)).join("")}
                    </div>
                </section>
            `;
        })
        .join("");
}

                              /* ================= QUESTION BANK SECTION TOGGLE ================= */

// Collapsing only hides the section; the bank is not fetched again.
function toggleSection(button) {
    const key = button.dataset.section;
    const expanded = button.getAttribute("aria-expanded") === "true";

    collapsedSections[key] = expanded;
    button.setAttribute("aria-expanded", String(!expanded));

    const body = document.getElementById(button.getAttribute("aria-controls"));
    if (body) body.hidden = expanded;
}

async function renderQuestionBank(page) {
    showLoading("Loading question bank…");

    const questions = await page.load();

    const body = !questions.length
        ? `
            <div class="empty-state">
                <h3>No questions to show</h3>
                <p>This question bank is empty or couldn't be loaded. Try again in a moment.</p>
                <button class="btn-primary" onclick="${page.reload}()">Try Again</button>
            </div>
        `
        : page.grouped
            ? renderBankSections(questions, page.key)
            : questions.map((q, i) => renderBankQuestion(q, i + 1)).join("");

    document.getElementById("content").innerHTML = `
    ${getHeroBanner()}

    <div class="content-box ${getPlantClass(page.plant)}">

        <div class="mobile-nav-buttons">
            <button onclick="showHome()">🏠 Main Dashboard</button>
            <button onclick="${page.back}()">↩️ ${page.backLabel}</button>
        </div>

        <div class="qb-header">
            <h2>${page.title}</h2>
            ${page.subtitle ? `<p>${page.subtitle}</p>` : ""}
            <p>Total Questions: ${questions.length}</p>
        </div>

        ${body}

    </div>
    `;
}

                                               // ======================
                                              // MTBE QUESTION BANK PAGE
                                             // ======================

async function showMTBE() {
    await renderQuestionBank({
        key: "mtbe",
        plant: "MTBE",
        title: `📘 MTBE ${escapeHtml(currentRole)} Question Bank`,
        back: "showMTBEMenu",
        backLabel: "Back to Menu",
        reload: "showMTBE",
        grouped: true,
        load: getMTBEQuestions
    });
}

                                           // ======================
                                          // METATHESIS
                                         // ======================

async function showMeta() {
    await renderQuestionBank({
        key: "meta",
        plant: "METATHESIS",
        title: `📗 METATHESIS ${escapeHtml(currentRole)} Question Bank`,
        back: "showMetathesisMenu",
        backLabel: "Back to Menu",
        reload: "showMeta",
        grouped: true,
        load: getMetathesisQuestions
    });
}


/* ================= SAFETY QUESTION SOURCE ================= */

async function getSafetyQuestions() {

    const { data, error } =
        await window.supabaseClient
            .functions
            .invoke(
                "question-bank",
                {
                    body: {
                        plant: "SAFETY"
                    }
                }
            );

    if (error) {
        console.error(error);
        return [];
    }

    return data?.questions || [];
}

                                      // ======================
                                     // SAFETY MENU
                                    // ======================

function showSafetyMenu() {


    document.getElementById("content").innerHTML = `

${getHeroBanner()}

    <div class="content-box">

        <!-- BACK TO MAIN DASHBOARD BUTTON -->
        <div class="mobile-nav-buttons">
        <button onclick="showHome()">
            🏠 Main Dashboard
        </button>
        </div>

                                    <!-- SAFETY PAGE TITLE -->
        <h2 style="
        text-align:center;
        margin-top:25px;
        margin-bottom:5px;
        font-size:32px;
        font-weight:700;
        letter-spacing:1px;
        ">
        🦺 SAFETY
        </h2>

                                    <!-- SAFETY QUESTIONS COUNT -->
        <p style="
        text-align:center;
        color:#fecaca;
        margin-bottom:30px;
        font-size:14px;
        letter-spacing:0.5px;
        ">
        Question Bank Available
        </p>


        <div class="training-menu">

                                    <!-- SAFETY QUESTION BANK CARD -->
<div
    class="training-card"
    onclick="showSafety()"
    style="background:#dc2626;"
>

                <div class="training-icon">📚</div>

                <div class="training-title">
                    Question Bank
                </div>

                <div class="training-description">
                    Study & Review Questions
                </div>
            </div>


                                    
                                    <!-- SAFETY FULL EXAM CARD -->

<div
    class="training-card"
    onclick="startSafety()"
    style="background:#dc2626;"
>
                <div class="training-icon">📝</div>

                <div class="training-title">
                    Full Exam
                </div>

                <div class="training-description">
                    Complete Assessment
                </div>
            </div>



<!-- SAFETY RANDOM EXAM CARD -->



<div
    class="training-card"
    onclick="startRandomSAFETYExam()"
    style="background:#dc2626;"
>
    <div class="training-icon">🎲</div>

    <div class="training-title">
        Random Exam
    </div>

    <div class="training-description">
        Quick Practice
    </div>
</div>


<!-- SAFETY TEST EXAM CARD -->

<div
    class="training-card"
    onclick="startSafetyTestExam()"
    style="background:#dc2626;"
>
    <div class="training-icon">🧪</div>

    <div class="training-title">
        Test Exam
    </div>

    <div class="training-description">
        2 Questions • System Test
    </div>
</div>

        </div>
    </div>
    `;
}


                                      // ======================
                                     // SAFETY
                                    // ======================



async function showSafety() {
    await renderQuestionBank({
        key: "safety",
        plant: "SAFETY",
        title: "🦺 Safety Question Bank",
        back: "showSafetyMenu",
        backLabel: "Back to Safety Menu",
        reload: "showSafety",
        grouped: false,
        load: getSafetyQuestions
    });
}




                                    // ======================
                                    // MERGE QUESTION BANK
                                    // ======================

async function showMergeQuestionBank() {
    await renderQuestionBank({
        key: "merge",
        plant: "MERGE",
        title: `🎯 Merge ${escapeHtml(currentRole)} Question Bank`,
        subtitle: "MTBE + META + SAFETY",
        back: "showMergeMenu",
        backLabel: "Back to Menu",
        reload: "showMergeQuestionBank",
        grouped: false,
        load: getMergeQuestions
    });
}



                                             // ======================
                                            // EXAMS
                                           // ======================

                                    // EXAM STATE MANAGEMENT

let currentQuestion = 0;
let score = 0;
let examTitle = "";
let answerSubmitted = false;

let currentExamSessionId = null;
let currentExamQuestion = null;
let currentExamTotalQuestions = 0;

let examStarting = false;
let examInProgress = false;


function showPlantMenu(plant) {
    const menus = {
        MTBE: showMTBEMenu,
        METATHESIS: showMetathesisMenu,
        MERGE: showMergeMenu,
        SAFETY: showSafetyMenu
    };

    (menus[plant] || showHome)();
}

// Leaving mid-exam abandons the attempt, so ask first.
function confirmLeaveExam() {
    if (!examInProgress) return true;

    const leave = confirm(
        "Leave this exam? You won't be able to continue this attempt."
    );

    if (leave) examInProgress = false;

    return leave;
}

function goHome() {
    if (confirmLeaveExam()) showHome();
}

function leaveExamToMenu() {
    if (confirmLeaveExam()) showPlantMenu(currentModule);
}


async function startBackendExam(
    moduleName,
    role,
    examType
) {
    // A double click must not open a second exam session.
    if (examStarting) return;

    const client = window.supabaseClient;

    if (!client?.functions) {
        alert(
            "Unable to connect to Supabase. Check your connection and try again."
        );
        return;
    }

    examStarting = true;

    showLoading("Starting exam…");

    let data = null;
    let error = null;

    try {
        ({ data, error } = await client.functions.invoke(
            "start-exam",
            {
                body: {
                    module: moduleName,
                    role: role,
                    exam_type: examType
                }
            }
        ));
    } catch (invokeError) {
        error = invokeError;
    } finally {
        examStarting = false;
    }

    if (error || !data?.question) {
        console.error(
            "Start exam error:",
            error
        );

        alert(
            "Unable to start the exam. Please try again."
        );

        showPlantMenu(moduleName);

        return;
    }

    currentModule = data.module;
    currentRole = data.role;
    currentExamType = data.exam_type;

    currentExamSessionId =
        data.session_id;

    currentExamQuestion =
        data.question;

    currentExamTotalQuestions =
        data.total_questions;

    currentQuestion = 0;
    score = 0;
    answerSubmitted = false;
    examInProgress = true;

    examTitle =
        data.module === "SAFETY"
            ? "Safety"
            : data.module === "MERGE"
            ? `Merge ${data.role}`
            : `${data.module} ${data.role}`;

    showQuestion();
}
                                            // ======================
                                           // MTBE FULL EXAM INITIALIZER
                                          // ======================



async function startMTBE() {
    await startBackendExam(
        "MTBE",
        currentRole,
        "Full Exam"
    );
}

                                         // ======================
                                        // METATHESIS FULL EXAM INITIALIZER
                                       // ======================

async function startMetathesis() {
    await startBackendExam(
        "METATHESIS",
        currentRole,
        "Full Exam"
    );
}


                                      // ======================
                                     // SAFETY FULL EXAM INITIALIZER
                                    // ======================

async function startSafety() {
    await startBackendExam(
        "SAFETY",
        "ALL",
        "Full Exam"
    );
}


                                      // ======================
                                     // MERGE FULL EXAM INITIALIZER
                                    // ======================


async function startMergeExam() {
    await startBackendExam(
        "MERGE",
        currentRole,
        "Full Exam"
    );
}


                                      // ======================
                                     // MERGE RANDOM EXAM INITIALIZER
                                    // ======================

async function startRandomMergeExam() {
    await startBackendExam(
        "MERGE",
        currentRole,
        "Random Exam"
    );
}
                                      // ======================
                                     // MTBE RANDOM EXAM INITIALIZER
                                    // ======================

async function startRandomMTBEExam() {
    await startBackendExam(
        "MTBE",
        currentRole,
        "Random Exam"
    );
}

                                      // ======================
                                     // METATHESIS RANDOM EXAM INITIALIZER
                                    // ======================



async function startRandomMETATHESISExam() {
await startBackendExam(
"METATHESIS",
currentRole,
"Random Exam"
);
}
                                      // ======================
                                     // SAFETY RANDOM EXAM INITIALIZER
                                    // ======================



async function startRandomSAFETYExam() {
    await startBackendExam(
        "SAFETY",
        "ALL",
        "Random Exam"
    );
}


async function startSafetyTestExam() {
    await startBackendExam(
        "SAFETY",
        "ALL",
        "Test Exam"
    );
}
                                      // ======================
                                     // QUESTION ENGINE
                                    // ======================


function showQuestion() {

    const q = currentExamQuestion;

    answerSubmitted = false;

    const questionNumber = currentQuestion + 1;
    const total = currentExamTotalQuestions;
    const progressPercent = total
        ? Math.round((questionNumber / total) * 100)
        : 0;
    const isLastQuestion = total && questionNumber >= total;

    const options = q.options
        .map((option, i) => `
            <label class="answer-option">
                <input
                    type="radio"
                    name="answer"
                    value="${i}"
                    onchange="onAnswerSelected()"
                >
                <span class="answer-key" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
                <span class="answer-text">${escapeHtml(option)}</span>
            </label>
        `)
        .join("");

    document.getElementById("content").innerHTML = `

    ${getHeroBanner()}

    <div class="content-box ${getPlantClass(currentModule)}">

        <div class="mobile-nav-buttons">
            <button onclick="goHome()">🏠 Main Dashboard</button>
            <button onclick="leaveExamToMenu()">↩️ Back to Menu</button>
        </div>

        <div class="exam">

            <div class="exam-head">

                <div class="exam-head-row">
                    <div>
                        <h2 class="exam-title">${escapeHtml(examTitle)}</h2>
                        ${currentModule === "MERGE" ? `<p class="exam-subtitle">MTBE + META + SAFETY</p>` : ""}
                    </div>

                    <span class="exam-count">
                        ${escapeHtml(currentExamType)} · Question <strong>${questionNumber}</strong> of ${total}
                    </span>
                </div>

                <div
                    class="exam-progress"
                    role="progressbar"
                    aria-label="Exam progress"
                    aria-valuemin="1"
                    aria-valuemax="${total}"
                    aria-valuenow="${questionNumber}"
                >
                    <span style="width:${progressPercent}%;"></span>
                </div>

                <div id="warningBox" class="exam-warning" role="alert"></div>

            </div>

            <h3 class="exam-question" id="exam-question" tabindex="-1">
                ${escapeHtml(q.question)}
            </h3>

            <fieldset class="answer-list" id="answer-list" aria-labelledby="exam-question">
                ${options}
            </fieldset>

            <div class="exam-actions">
                <button id="submitBtn" class="btn-primary" onclick="checkAnswer()" disabled>
                    ✅ Submit Answer
                </button>

                <button id="nextBtn" class="btn-primary" onclick="nextQuestion()" hidden>
                    ${isLastQuestion ? "🏁 Finish Exam" : "➡️ Next Question"}
                </button>
            </div>

            <div id="result" class="exam-feedback" role="status" aria-live="polite"></div>

        </div>

    </div>

    `;

    window.scrollTo(0, 0);
    document.getElementById("exam-question").focus({ preventScroll: true });
}

function onAnswerSelected() {
    if (answerSubmitted) return;

    const submitButton = document.getElementById("submitBtn");
    if (submitButton) submitButton.disabled = false;
}


                                      // ======================
                                     // ANSWER PROCESSING
                                    // ======================

function showWarning(message) {

    const warningBox =
    document.getElementById("warningBox");

    if (!warningBox) return;

    warningBox.textContent = message;

    clearTimeout(showWarning.timer);

    showWarning.timer = setTimeout(() => {

        warningBox.textContent = "";

    }, 2500);

}


                                      // ======================
                                     // ANSWER VALIDATION
                                    // ======================

// The server grades each answer; the screen marks the options it reports.
function markAnswers(selectedIndex, correctAnswer, isCorrect) {
    const list = document.getElementById("answer-list");
    const correctIndex = currentExamQuestion.options.indexOf(correctAnswer);

    list.classList.add("is-locked");

    list.querySelectorAll(".answer-option").forEach((option, i) => {
        option.querySelector("input").disabled = true;

        let tag = "";

        if (i === correctIndex) {
            option.classList.add("is-correct");
            tag = isCorrect ? "Your answer ✓" : "Correct answer";
        } else if (i === selectedIndex && !isCorrect) {
            option.classList.add("is-wrong");
            tag = "Your answer";
        }

        if (tag) {
            const label = document.createElement("span");
            label.className = "answer-tag";
            label.textContent = tag;
            option.appendChild(label);
        }
    });
}

async function checkAnswer() {

    const selected =
        document.querySelector(
            'input[name="answer"]:checked'
        );

    if (!selected) {
        showWarning(
            "Please select an answer first ⚠️"
        );

        return;
    }

    if (answerSubmitted || !currentExamSessionId) return;

    const submitButton =
        document.getElementById("submitBtn");

    const nextButton =
        document.getElementById("nextBtn");

    const resultBox =
        document.getElementById("result");

    const selectedIndex =
        Number(selected.value);

    const selectedAnswer =
        currentExamQuestion.options[selectedIndex];

    const originalButtonText =
        submitButton.textContent;

    const restoreSubmit = () => {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    };

    submitButton.disabled = true;
    submitButton.textContent = "⏳ Checking...";

    const client = window.supabaseClient;

    if (!client?.functions) {
        restoreSubmit();

        showWarning(
            "Unable to connect to Supabase ⚠️"
        );

        return;
    }

    let data = null;
    let error = null;

    try {
        ({ data, error } = await client.functions.invoke(
            "exam-answer",
            {
                body: {
                    session_id:
                        currentExamSessionId,

                    selected_answer:
                        selectedAnswer
                }
            }
        ));
    } catch (invokeError) {
        error = invokeError;
    }

    if (
        error ||
        typeof data?.correct !== "boolean"
    ) {
        console.error(
            "Answer submission error:",
            error
        );

        restoreSubmit();

        showWarning(
            "Unable to submit the answer ⚠️"
        );

        return;
    }

    answerSubmitted = true;

    if (data.correct) {
        score++;
    }

    markAnswers(selectedIndex, data.correct_answer, data.correct);

    resultBox.className =
        "exam-feedback " + (data.correct ? "is-correct" : "is-wrong");

    resultBox.innerHTML = data.correct
        ? `<p class="feedback-title">✅ Correct Answer</p>`
        : `
            <p class="feedback-title">❌ Incorrect Answer</p>
            <p class="feedback-detail">Correct answer: <strong>${escapeHtml(data.correct_answer)}</strong></p>
        `;

    submitButton.hidden = true;

    nextButton.hidden = false;
    nextButton.focus();
}


                                      // ======================
                                     // NAVIGATION
                                    // ======================

async function nextQuestion() {

    if (!answerSubmitted) {
        showWarning(
            "Please submit your answer first ⚠️"
        );

        return;
    }

    if (!currentExamSessionId) return;

    const nextButton =
        document.getElementById("nextBtn");

    const originalButtonText =
        nextButton.textContent;

    const restoreNext = () => {
        nextButton.disabled = false;
        nextButton.textContent = originalButtonText;
    };

    nextButton.disabled = true;
    nextButton.textContent = "⏳ Loading...";

    const client = window.supabaseClient;

    if (!client?.functions) {
        restoreNext();

        showWarning(
            "Unable to connect to Supabase ⚠️"
        );

        return;
    }

    let data = null;
    let error = null;

    try {
        ({ data, error } = await client.functions.invoke(
            "next-question",
            {
                body: {
                    session_id:
                        currentExamSessionId
                }
            }
        ));
    } catch (invokeError) {
        error = invokeError;
    }

    if (error || !data) {
        console.error(
            "Next question error:",
            error
        );

        restoreNext();

        showWarning(
            "Unable to load the next question ⚠️"
        );

        return;
    }

    if (data.completed === true) {
        score =
            Number(data.score) || 0;

        currentExamTotalQuestions =
            Number(
                data.total_questions
            ) || currentExamTotalQuestions;

        currentQuestion =
            currentExamTotalQuestions;

        answerSubmitted = false;

        finishExam();

        return;
    }

    if (!data.question) {
        restoreNext();

        showWarning(
            "Question data is unavailable ⚠️"
        );

        return;
    }

    currentExamQuestion =
        data.question;

    currentQuestion =
        Number(data.current_question) - 1;

    currentExamTotalQuestions =
        Number(data.total_questions);

    answerSubmitted = false;

    showQuestion();
}

                                      // ======================
                                     // EXAM RESULTS
                                    // ======================

async function finishExam() {

    examInProgress = false;

    const totalQuestions =
        currentExamTotalQuestions;

    if (
        !Number.isInteger(totalQuestions) ||
        totalQuestions <= 0
    ) {
        console.error(
            "Invalid total questions:",
            totalQuestions
        );

        alert(
            "Unable to calculate the exam result."
        );

        return;
    }

    const percent =
        Math.round(
            (score / totalQuestions) * 100
        );

    const passed =
        percent >= 80;

    document.getElementById(
        "content"
    ).innerHTML = `

        ${getHeroBanner()}

        <div class="content-box ${getPlantClass(currentModule)}">

            <section class="result-card ${passed ? "is-pass" : "is-fail"}" aria-labelledby="result-title">

                <p class="result-status ${passed ? "is-pass" : "is-fail"}">
                    ${passed ? "✅ PASS" : "❌ FAIL"}
                </p>

                <h2 class="result-title" id="result-title">
                    🎉 Exam Completed
                </h2>

                <p class="result-type">
                    ${escapeHtml(examTitle)} · ${escapeHtml(currentExamType)}
                </p>

                <p class="result-percent">${percent}%</p>

                <p class="result-fraction">
                    Score: ${score} / ${totalQuestions}
                </p>

                <div
                    class="result-bar"
                    role="img"
                    aria-label="Score ${percent}%. Pass mark 80%."
                >
                    <span style="width:${Math.min(percent, 100)}%;"></span>
                    <i class="result-mark" style="left:80%;"></i>
                </div>

                <div class="result-scale" aria-hidden="true">
                    <span style="left:80%;">Pass mark 80%</span>
                </div>

                <p class="result-message">
                    ${passed ? "🌟 Excellent Work!" : "💪 Keep Practicing and Try Again!"}
                </p>

                <div class="result-actions">
                    <button class="btn-primary" onclick="retakeExam()">
                        🔄 Retake Exam
                    </button>

                    <button class="btn-ghost" onclick="showPlantMenu(currentModule)">
                        ↩️ Back to Menu
                    </button>

                    <button class="btn-ghost" onclick="showHome()">
                        🏠 Main Dashboard
                    </button>
                </div>

            </section>

        </div>
    `;

    window.scrollTo(0, 0);
}


async function retakeExam() {
    await startBackendExam(
        currentModule,
        currentRole,
        currentExamType
    );
}

console.log("SCRIPT LOADED");


function showWelcomeBack(profile) {

    document.getElementById("content").innerHTML = `

${getHeroBanner("full")}

    <div class="content-box" style="text-align:center;">

        <h2>👋 Welcome Back, ${escapeHtml(profile.nickname)}</h2>

        <p>
            Continue your training progress or switch to another user.
        </p>

        <button onclick="showHome()">
            ✅ Continue
        </button>

        <button class="btn-ghost" onclick="switchUser()">
            🔄 Switch User
        </button>

    </div>

    `;
}

autoLogin().then(profile => {

    if (profile) {
        showWelcomeBack(profile);
    } else {
        showLogin();
    }

});
