                    // ======================
                    // DASHBOARD
                    // ======================


function getHeroBanner() {
    const nickname = getSavedNickname();

    if (!nickname) {
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

        <!-- USER PROFILE BUTTON + DROPDOWN -->
        <div class="hero-user-wrapper">

            <div class="hero-user-btn" onclick="toggleUserDropdown(event)">
                <span class="hero-user-icon">👤</span>
                <span class="hero-user-name">${nickname}</span>
                <span class="hero-user-arrow" id="heroUserArrow">▼</span>
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

    </div>
    `;
}

function showLogin() {

  document.getElementById("content").innerHTML = `

${getHeroBanner()}

    <div class="dashboard-cards">

      <div class="module-card login-card login-card-gold">

        <div class="login-card-header">
          <div class="login-card-title">
            🔐 Platform Access
          </div>
        </div>

        <p class="login-label">
          Username
        </p>

<input
    id="Username"
    type="text"
    placeholder="Enter Username"
    class="login-input"
    value="${localStorage.getItem('lastUsername') || ''}"
    autocomplete="username"
>

        <p class="login-label">
          PIN
        </p>

<input
    id="pin"
    type="password"
    placeholder="6-digit PIN"
    class="login-input"
    autocomplete="current-password"
    minlength="6"
    maxlength="6"
    inputmode="numeric"
    pattern="[0-9]{6}"
>

        <button
          id="login-btn"
          class="login-button"
        >
          Enter Platform
        </button>
<div id="login-message" style="
display:none;
margin-top:12px;
padding:12px;
border-radius:12px;
background:rgba(239,68,68,0.12);
border:1px solid rgba(239,68,68,0.25);
color:#fca5a5;
font-size:14px;
font-weight:600;
text-align:center;
"></div>
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

document.getElementById("login-btn")
  .addEventListener("click", async () => {

      const nickname =
        document.getElementById("Username").value.trim();

      const pin =
        document.getElementById("pin").value.trim();

      console.log("Login Button Clicked");

      const profile =
        await registerOrLogin(nickname, pin);
localStorage.setItem("lastUsername", nickname);

      if (profile) {
          showHome();
      }

  });

document.getElementById("pin")
  .addEventListener("keydown", async (e) => {

      if (e.key === "Enter") {

          const nickname =
            document.getElementById("Username").value.trim();

          const pin =
            document.getElementById("pin").value.trim();

          const profile =
            await registerOrLogin(nickname, pin);
localStorage.setItem("lastUsername", nickname);
          if (profile) {
              showHome();
          } else {
              document.getElementById("login-message").style.display = "block";
              document.getElementById("login-message").innerHTML = "❌ Incorrect Username or PIN";
document.getElementById("login-message").style.opacity = "1";

              setTimeout(() => {
                  document.getElementById("login-message").style.display = "none";
              }, 3000);

          }

      }

  });

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
    if (isOpen) {
        dropdown.classList.remove('dropdown-open');
        if (arrow) arrow.classList.remove('arrow-rotated');
    } else {
        dropdown.classList.add('dropdown-open');
        if (arrow) arrow.classList.add('arrow-rotated');
    }
}

function closeUserDropdown() {
    const dropdown = document.getElementById('heroUserDropdown');
    const arrow = document.getElementById('heroUserArrow');
    if (dropdown) dropdown.classList.remove('dropdown-open');
    if (arrow) arrow.classList.remove('arrow-rotated');
}
document.addEventListener('click', function () {
    closeUserDropdown();
});

// ======================
// USER MENU PAGES
// ======================



// ======================
// ANALYTICS & PROGRESS
// ====================


// ======================
// MY PROGRESS
// ======================

async function showAnalytics() {
    closeUserDropdown();
const nickname = getSavedNickname();

const results = await getUserExamResults(nickname);

const totalExams = results.length;

const averageScore = totalExams
    ? Math.round(
        results.reduce((sum, exam) =>
            sum + exam.score_percentage, 0
        ) / totalExams
    )
    : 0;

const bestScore = totalExams
    ? Math.max(
        ...results.map(exam => exam.score_percentage)
    )
    : 0;

const passRate = totalExams
    ? Math.round(
        (results.filter(exam =>
            exam.score_percentage >= 80
        ).length / totalExams) * 100
    )
    : 0;

    document.getElementById("content").innerHTML = `
    ${getHeroBanner()}

    <div class="content-box">

<h2 class="progress-title">📊 Analytics Dashboard</h2>

        <div class="my-progress-grid">

            <div class="kpi-card kpi-card-blue">

                <div style="
                display:flex;
                align-items:center;
                gap:8px;
                font-weight:bold;
                margin-bottom:4px;
                ">

<span>📚 Total Exams</span>
<span>${totalExams}</span>
                </div>

                <div class="progress-bar">
<div class="progress-fill progress-fill-blue"
     style="width:${Math.min(totalExams * 10, 100)}%;">
                    </div>
                </div>

            </div>

            <div class="kpi-card kpi-card-green">

                <div style="
                display:flex;
                align-items:center;
                gap:8px;
                font-weight:bold;
                margin-bottom:4px;
                ">

<span>✅ Pass Rate</span>
<span>${passRate}%</span>


                </div>

                <div class="progress-bar">
<div class="progress-fill progress-fill-green"
     style="width:${passRate}%;">
                    </div>
                </div>

            </div>

<div class="kpi-card kpi-card-purple">

    <div style="
    display:flex;
    align-items:center;
    gap:8px;
    font-weight:bold;
    margin-bottom:4px;
    ">

        <span>🎯 Average Score</span>
        <span>${averageScore}%</span>

    </div>

    <div class="progress-bar">
        <div class="progress-fill progress-fill-purple"
             style="width:${averageScore}%;">
        </div>
    </div>

</div>

            <div class="kpi-card kpi-card-gold">

                <div style="
                display:flex;
                align-items:center;
                gap:8px;
                font-weight:bold;
                margin-bottom:4px;
                ">



<span>🏆 Best Score</span>
<span>${bestScore}%</span>

                </div>

                <div class="progress-bar">
                    <div class="progress-fill progress-fill-gold"
                         style="width:${bestScore}%;">
                    </div>
                </div>

            </div>

            <div class="kpi-card kpi-card-blue">

                <div style="
                display:flex;
                align-items:center;
                gap:8px;
                font-weight:bold;
                margin-bottom:4px;
                ">

                    <span>📈 Improvement</span>
                    <span>${bestScore - averageScore}%</span>

                </div>

                <div class="progress-bar">
                    <div class="progress-fill progress-fill-blue"
                         style="width:${Math.max(bestScore - averageScore, 0)}%;">
                    </div>
                </div>

            </div>

        </div>

    </div>
    `;
}


async function showMyProgress() {
    closeUserDropdown();

    const nickname = getSavedNickname();

    const results = await getUserExamResults(nickname);

    const totalExams = results.length;

    const averageScore = totalExams
    ? Math.round(
        results.reduce((sum, exam) =>
            sum + exam.score_percentage, 0
        ) / totalExams
    )
    : 0;

    const bestScore = totalExams
    ? Math.max(
        ...results.map(exam => exam.score_percentage)
    )
    : 0;

    const lastExam = totalExams
    ? results[0]
    : null;

    const passRate = totalExams
    ? Math.round(
        (results.filter(exam =>
            exam.score_percentage >= 80
        ).length / totalExams) * 100
    )
    : 0;

    const lastExamDate = lastExam
    ? new Date(lastExam.created_at).toLocaleDateString()
    : "No Exams";

const moduleStats = {};

results.forEach(exam => {
if (!exam.module || exam.module === "EMPTY") {
    return;
}

const moduleName = exam.module;
    if (!moduleStats[moduleName]) {
        moduleStats[moduleName] = 0;
    }

    moduleStats[moduleName]++;
});

const moduleStatsHtml = Object.entries(moduleStats)
    .map(([module, count]) =>
        `
<div class="module-card">

<div class="info-row">
    <span>📚 ${module}</span>
<strong>${count}</strong>
</div>

<div class="progress-bar">
    <div class="progress-fill progress-fill-blue"
         style="width:${Math.min(count * 25, 100)}%;">
    </div>
</div>

        `
    )
    .join('');


document.getElementById("content").innerHTML = `
${getHeroBanner()}

<div class="content-box">

<button onclick="showHome()" class="back-home-btn">
🏠 Main Dashboard
</button>


<h2 class="progress-title">
📈 My Progress
</h2>

<div class="progress-title-line"></div>

<div class="section-banner">
📊 Performance Summary
</div>

<div class="my-progress-grid">


<div class="kpi-card kpi-card-purple">

<div style="
display:flex;
align-items:center;
gap:8px;
font-weight:bold;
margin-bottom:2px;
">

<span>📚 Exams</span>

<span>${totalExams}</span>

</div>

<div class="progress-bar">
    <div class="progress-fill progress-fill-purple"
         style="width:${Math.min(totalExams * 10, 100)}%;">
    </div>
</div>

</div>




<div class="kpi-card kpi-card-blue">

<div style="
display:flex;
align-items:center;
gap:8px;
font-weight:bold;
margin-bottom:2px;
">

<span>🎯 Average</span>

<span>${averageScore}%</span>

</div>

<div class="progress-bar">
    <div class="progress-fill progress-fill-blue"
         style="width:${averageScore}%;">
    </div>
</div>

</div>



<div class="kpi-card kpi-card-gold">

<div style="
display:flex;
align-items:center;
gap:8px;
font-weight:bold;
margin-bottom:2px;
">

<span>🏆 Best</span>

<span>${bestScore}%</span>

</div>

<div class="progress-bar">
    <div class="progress-fill progress-fill-gold"
         style="width:${bestScore}%;">
    </div>
</div>

</div>



<div class="kpi-card kpi-card-green">

<div style="
display:flex;
align-items:center;
gap:8px;
font-weight:bold;
margin-bottom:2px;
">

<span>✅ Pass</span>

<span>${passRate}%</span>

</div>

<div class="progress-bar">
    <div class="progress-fill progress-fill-green"
         style="width:${passRate}%;">
    </div>
</div>

</div>


<div class="section-banner">
🕒 Last Exam
</div>

<div class="last-exam-card last-exam-module">

    <div class="info-row">
        <span>📚 Module</span>
        <strong>${lastExam?.module || '-'}</strong>
    </div>

</div>

<div class="last-exam-card last-exam-role">
    <div class="info-row">
        <span>👤 Role</span>
        <strong>${lastExam?.role || '-'}</strong>
    </div>

</div>

<div class="last-exam-card last-exam-type">
    <div class="info-row">
        <span>📝 Type</span>
        <strong>${lastExam?.exam_type || '-'}</strong>
    </div>

</div>



<div class="last-exam-card last-exam-score-card">
    <div class="info-row">
        <span>🎯 Score</span>
        <strong>${lastExam?.score_percentage || 0}%</strong>
    </div>

    <div class="progress-bar">
        <div class="progress-fill progress-fill-blue"
             style="width:${lastExam?.score_percentage || 0}%;">
        </div>
    </div>

</div>

<div class="module-stats-grid">
${moduleStatsHtml || '<p>No module data available</p>'}
</div>

        </div>
    </div>
    `;
}

function switchUser() {
    closeUserDropdown();
    logoutUser();
    showLogin();
}

function logout() {
    closeUserDropdown();
    logoutUser();
    showLogin();
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

            <button onclick="showHome()">
                🏠 Main Dashboard
            </button>

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

                <button onclick="showHome()">
                    🏠 Main Dashboard
                </button>

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

            <button onclick="showHome()">
                🏠 Main Dashboard
            </button>

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
                border-left:4px solid #3b82f6;
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

            <button onclick="showHome()">
                🏠 Main Dashboard
            </button>

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
                border-left:4px solid #3b82f6;
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
                border-left:4px solid #a855f7;
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

${getHeroBanner()}



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

<div id="welcome-banner" style="
display:none;
position:absolute;
top:440px;
left:50%;
transform:translateX(-50%);
width:320px;
max-width:320px;
text-align:center;
padding:8px 12px;
border-radius:12px;
background:rgba(74,222,128,0.12);
border:1px solid rgba(74,222,128,0.25);
color:#4ade80;
font-size:14px;
font-weight:600;
z-index:100;
"></div>

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

    welcomeBanner.innerHTML =
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

<button onclick="showHome()">
    🏠 Main Dashboard
</button>

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

        <button onclick="showHome()">
            🏠 Main Dashboard
        </button>

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

<button onclick="showHome()">
    🏠 Main Dashboard
</button>

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
let currentPage = "";
let currentRole = "";
let currentExamType = "";
let currentModule = "";

                              /* ================= QUESTION BANK SECTION TOGGLE ================= */

function toggleSection(sectionName) {

    collapsedSections[sectionName] =
        !collapsedSections[sectionName];

    if (currentPage === "mtbe") {
        showMTBE();
    }

    if (currentPage === "meta") {
        showMeta();
    }

if (currentPage === "safety") {
    showSafety();
}

}

                                               // ======================
                                              // MTBE QUESTION BANK PAGE
                                             // ======================



async function showMTBE() {

    currentPage = "mtbe";

    const mtbeQuestions = await getMTBEQuestions();

    let html = `

    <div class="content-box">

    <div class="mobile-nav-buttons">

    <button onclick="showHome()">
        🏠 Main Dashboard
    </button>

    <button onclick="showMTBEMenu()">
        ↩️ Back to Menu
    </button>

    </div>

    <br><br>

    <!-- MTBE QUESTION BANK PAGE HEADER -->


    <div style="
    background:#1e3a8a;
    padding:10px 20px;
    border-radius:12px;
    margin-top:8px;
    margin-bottom:10px;
    border-left:4px solid #93c5fd;
    box-shadow:0 0 12px rgba(59,130,246,0.15);
    ">

                              <!-- MTBE QUESTION BANK PAGE TITLE -->

<h2 style="margin-bottom:5px;">
📘 MTBE ${currentRole} Question Bank
</h2>

                              <!-- MTBE QUESTION BANK QUESTION COUNT -->

<p style="
margin:0;
padding-left:10px;
opacity:0.9;
">
    Total Questions: ${mtbeQuestions.length}
</p>

</div>

`;


                  /* ================= MTBE QUESTION BANK SECTION ORGANIZER ================= */

let currentSection = "";

const sections = {};



            /* ================= MTBE QUESTION BANK GROUP QUESTIONS BY SECTION ================= */


mtbeQuestions.forEach((q) => {

    if (q.section) {

        currentSection = q.section;

        if (!sections[currentSection]) {
            sections[currentSection] = [];
        }
    }

    sections[currentSection].push(q);

});


                  /* ================= MTBE QUESTION BANK RENDER SECTIONS ================= */

Object.keys(sections).forEach((sectionName) => {

    const isCollapsed =
        collapsedSections[sectionName] || false;

    html += `

                                    <!-- MTBE QUESTION BANK SECTION HADER -->

<div
onclick="toggleSection('${sectionName}')"
style="
background:#1e40af;
padding:12px 15px;
margin-top:25px;
border-radius:12px;
border-left:5px solid #93c5fd;
box-shadow:0 0 8px rgba(59,130,246,0.5);
cursor:pointer;
"
>

                                    <!-- MTBE QUESTION BANK SECTION TITLE -->

<h3 style="
margin:0;
color:white;
">
${isCollapsed ? '▶' : '▼'}
📂 ${sectionName}
</h3>

</div>

`;



if (isCollapsed) {
    return;
}

                  /* ================= MTBE QUESTION BANK RENDER QUESTION CARDS ================= */

sections[sectionName].forEach((q, index) => {

    html += `

                                    <!-- MTBE QUESTION CARD -->

<div style="
background:#0f172a;
padding:15px;
margin-top:12px;
border-radius:12px;
border:1px solid #334155;
box-shadow:0 0 8px rgba(59,130,246,0.08);
">

                                    <!-- MTBE QUESTION TITLE -->

<h3 style="
color:#93c5fd;
margin:0 0 3px 0;
">
Question ${index + 1}
</h3>

                                    <!-- MTBE QUESTION SECTION NAME -->

<p style="
font-size:11px;
letter-spacing:0.5px;
text-transform:uppercase;
color:#64748b;
margin:0 0 10px 0;
">
${sectionName}
</p>

                                    <!-- MTBE QUESTION TEXT -->

<p style="
font-size:18px;
margin-bottom:10px;
line-height:1.3;
background:rgba(255,255,255,0.03);
padding:8px 12px;
border-radius:8px;
border-left:3px solid #93c5fd;
">
${q.question}
</p>

`;


const correct =
q.correct !== undefined
? q.correct
: q.options.indexOf(q.answer);

                          /* ================= MTBE ANSWER OPTIONS ================= */

q.options.forEach((option, i) => {

    html += `

    <p style="margin:8px 0;">
        ${String.fromCharCode(65 + i)}.
        ${option}

                                    <!-- MTBE CORRECT ANSWER MARKER -->

        ${(
            (q.answer !== undefined && option === q.answer) ||
            (q.correct !== undefined && i === q.correct)
        ) ? ' ✅' : ''}

    </p>

    `;
});

html += `
</div>
`;

});

});

                         /* ================= MTBE QUESTION BANK END PAGE ================= */

html += `
</div>
`;

document.getElementById("content").innerHTML = html;

}


                                           // ======================
                                          // METATHESIS
                                         // ======================

async function showMeta() {

    currentPage = "meta";

    const metathesisQuestions = await getMetathesisQuestions();

    let html = `

<div class="content-box">

                                    <!-- METATHESIS QUESTION BANK NAVIGATION BUTTONS -->


<div class="mobile-nav-buttons">

<button onclick="showHome()">
    🏠 Main Dashboard
</button>

<button onclick="showMetathesisMenu()">
    ↩️ Back to Menu
</button>

</div>

<br><br>

                                    <!-- METATHESIS QUESTION BANK PAGE HEADER -->

<div style="
background:#166534;
padding:10px 20px;
border-radius:12px;
margin-top:8px;
margin-bottom:10px;
border-left:4px solid #86efac;
box-shadow:0 0 12px rgba(34,197,94,0.15);
">

                                    <!-- METATHESIS QUESTION BANK PAGE TITLE -->

<h2 style="
margin-bottom:5px;
">
📗 METATHESIS ${currentRole} Question Bank
</h2>

                                    <!-- METATHESIS QUESTION BANK QUESTION COUNT -->

<p style="
margin:0;
padding-left:12px;
opacity:0.9;
">
    Total Questions: ${metathesisQuestions.length}
</p>

</div>

`;



                                        // ======================
                                       // METATHESIS QUESTION BANK SECTION ORGANIZER
                                      // ======================

let currentSection = "";

const sections = {};



                                         // ======================
                                        // METATHESIS QUESTION BANK GROUP QUESTIONS BY SECTION
                                       // ======================

metathesisQuestions.forEach((q) => {

    if (q.section) {

        currentSection = q.section;

        if (!sections[currentSection]) {
            sections[currentSection] = [];
        }
    }

    sections[currentSection].push(q);

});



                                         // ======================
                                        // METATHESIS QUESTION BANK RENDER SECTIONS
                                       // ======================


Object.keys(sections).forEach((sectionName) => {

    const isCollapsed =
        collapsedSections[sectionName] || false;

    html += `


                          <!-- METATHESIS QUESTION BANK SECTION HADER -->








<div
onclick="toggleSection('${sectionName}')"
style="
background:#166534;
padding:12px 15px;
margin-top:25px;
border-radius:12px;
border-left:5px solid #86efac;
box-shadow:0 0 8px rgba(34,197,94,0.15);
cursor:pointer;
">







                                    <!-- METATHESIS QUESTION BANK SECTION TITLE -->


<h3 style="
margin:0;
color:white;
">
${isCollapsed ? '▶' : '▼'}
📂 ${sectionName}
</h3>

</div>

`;

if (isCollapsed) {
    return;
}

                                      // ======================
                                     // METATHESIS QUESTION BANK RENDER QUESTION CARDS
                                    // ======================

sections[sectionName].forEach((q, index) => {

    html += `

                                    <!-- METATHESIS QUESTION CARD -->

<div style="
background:#0f172a;
padding:15px;
margin-top:12px;
border-radius:12px;
border:1px solid #334155;
">

                                    <!-- METATHESIS QUESTION TITLE -->

<h3 style="
color:#86efac;
margin:0 0 5px 0;
">
Question ${index + 1}
</h3>

                                    <!-- METATHESIS QUESTION SECTION NAME -->

<p style="
font-size:11px;
letter-spacing:0.5px;
text-transform:uppercase;
color:#64748b;
margin:0 0 10px 0;
">
${sectionName}
</p>

                                    <!-- METATHESIS QUESTION TEXT -->

<p style="
font-size:18px;
margin-bottom:10px;
line-height:1.3;
background:rgba(255,255,255,0.03);
padding:8px 12px;
border-radius:8px;
border-left:3px solid #86efac;
">
${q.question}
</p>

`;

        q.options.forEach((option, i) => {

            html += `

<p style="
margin:8px 0;
">

${String.fromCharCode(65 + i)}.
${option}

${(
    (q.answer !== undefined && option === q.answer) ||
    (q.correct !== undefined && i === q.correct)
) ? ' ✅' : ''}
</p>

`;

        });

        html += `

</div>

`;

    });



    });



    html += `


    </div>


    `;



document.getElementById("content").innerHTML = html;
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
        <button onclick="showHome()">
            🏠 Main Dashboard
        </button>

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

    currentPage = "safety";

    const safetyQuestions = await getSafetyQuestions();

    let html = `

    <div class="content-box">

                                    <!-- SAFETY QUESTION BANK NAVIGATION BUTTONS -->


<div class="mobile-nav-buttons">

<button onclick="showHome()">
    🏠 Main Dashboard
</button>

<button onclick="showSafetyMenu()">
    ↩️ Back to Safety Menu
</button>

</div>

<br><br>

                                    <!-- SAFETY QUESTION BANK PAGE HEADER -->

        <div style="
        background:#dc2626;
        padding:10px 20px;
        border-radius:12px;
        margin-top:8px;
        margin-bottom:10px;
        border-left:4px solid #fecaca;
        box-shadow:0 0 12px rgba(239,68,68,0.15);
        ">

                                    <!-- SAFETY QUESTION BANK PAGE TITLE -->

            <h2 style="margin-bottom:5px;">
                🦺 Safety Question Bank
            </h2>

                                    <!-- SAFETY QUESTION BANK QUESTION COUNT -->

            <p style="
            margin:0;
            padding-left:12px;
            opacity:0.9;
            ">
                Total Questions: ${safetyQuestions.length}
            </p>

        </div>

    `;


                                      // ======================
                                     // SAFETY QUESTION BANK RENDER QUESTION CARDS
                                    // ======================

safetyQuestions.forEach((q, index) => {

    html += `

        <!-- SAFETY QUESTION CARD -->

        <div style="
        background:#0f172a;
        padding:15px;
        margin-top:12px;
        border-radius:12px;
        border:1px solid #334155;
        ">

                                    <!-- SAFETY QUESTION TITLE -->

        <h3 style="
        color:#fecaca;
        margin:0 0 5px 0;
        ">
        Question ${index + 1}
        </h3>

                                    <!-- SAFETY QUESTION TEXT -->

        <p style="
        font-size:18px;
        margin-bottom:10px;
        line-height:1.3;
        background:rgba(255,255,255,0.03);
        padding:8px 12px;
        border-radius:8px;
        border-left:3px solid #fecaca;
        ">
        ${q.question}
        </p>

    `;

    q.options.forEach((option, i) => {

        html += `

                                    <!-- SAFETY ANSWER OPTIONS -->

            <p style="margin:8px 0;">

            ${String.fromCharCode(65 + i)}.
            ${option}

                                    <!-- SAFETY CORRECT ANSWER MARKER -->



${(
    (q.answer !== undefined && option === q.answer) ||
    (q.correct !== undefined && i === q.correct)
) ? ' ✅' : ''}

</p>

`;
});

html += `
    </div>
`;

});

html += `
    </div>
`;

document.getElementById("content").innerHTML = html;
}




                                    // ======================
                                    // MERGE QUESTION BANK
                                    // ======================

async function showMergeQuestionBank() {

    currentPage = "Merge";

    const MergeQuestions = await getMergeQuestions();

    let html = `

    ${getHeroBanner()}

    <div class="content-box">

                                    <!-- MERGE QUESTION BANK NAVIGATION BUTTONS -->


<div class="mobile-nav-buttons">

<button onclick="showHome()">
    🏠 Main Dashboard
</button>

<button onclick="showMergeMenu()">
    ↩️ Back to Menu
</button>

</div>

<br><br>

                                    <!-- MERGE QUESTION BANK PAGE HEADER -->

        <div style="
        background:#1e293b;
        padding:15px 20px;
        border-radius:12px;
        margin-top:8px;
        margin-bottom:15px;
        border-left:4px solid #a855f7;
        max-width:760px;
        ">

                                    <!-- MERGE QUESTION BANK PAGE TITLE -->

            <h2 style="
            margin-bottom:5px;
            ">
            Merge ${currentRole} 📚
            </h2>

                                    <!-- MERGE QUESTION BANK DESCRIPTION -->

            <p style="
            margin:0;
            opacity:0.85;
            letter-spacing:0.5px;
            font-size:14px;
            color:#ddd6fe;
            ">
            MTBE + META + SAFETY
            </p>

                                    <!-- MERGE QUESTION BANK QUESTION COUNT -->

            <p style="
            margin:4px 0 0 0;
            font-size:15px;
            font-weight:bold;
            ">
            Question Bank • ${MergeQuestions.length} Questions
            </p>


        </div>

    `;



                                     // ======================
                                    // MERGE QUESTION BANK RENDER QUESTION CARDS
                                   // ======================

MergeQuestions.forEach((q, index) => {

    if (!q) return;

    html += `

                                    <!-- MERGE QUESTION CARD -->

        <div style="
        background:#0f172a;
        padding:15px;
        margin-top:12px;
        border-radius:12px;
        border:1px solid #334155;
        ">

                                    <!-- MERGE QUESTION TITLE -->

        <h3 style="
        color:#ddd6fe;
        margin:0 0 5px 0;
        ">
        Question ${index + 1}
        </h3>

                                    <!-- MERGE QUESTION TEXT -->

        <p style="
        font-size:18px;
        margin-bottom:10px;
        line-height:1.3;
        background:rgba(255,255,255,0.03);
        padding:8px 12px;
        border-radius:8px;
        border-left:3px solid #ddd6fe;
        ">
        ${q.question}
        </p>

    `;

    q.options.forEach((option, i) => {

        html += `

                                    <!-- MERGE ANSWER OPTIONS -->

            <p style="margin:8px 0;">

            ${String.fromCharCode(65 + i)}.
            ${option}

                                    <!-- MERGE CORRECT ANSWER MARKER -->

            ${(
                (q.answer !== undefined && option === q.answer) ||
                (q.correct !== undefined && i === q.correct)
            ) ? ' ✅' : ''}

            </p>

        `;

    });

    html += `

        </div>

    `;

});

html += `

    </div>

`;

document.getElementById("content").innerHTML = html;

}



                                             // ======================
                                            // EXAMS
                                           // ======================

                                    // EXAM STATE MANAGEMENT

let currentQuestions = [];
let currentQuestion = 0;
let score = 0;
let examTitle = "";
let answerSubmitted = false;

let currentExamSessionId = null;
let currentExamQuestion = null;
let currentExamTotalQuestions = 0;
let currentExamUsesBackend = false;


async function startBackendExam(
    moduleName,
    role,
    examType
) {
    const client =
        window.supabaseClient ||
        window.supabase;

    if (!client?.functions) {
        showWarning(
            "Unable to connect to Supabase ⚠️"
        );
        return;
    }

    const {
        data,
        error
    } = await client.functions.invoke(
        "start-exam",
        {
            body: {
                module: moduleName,
                role: role,
                exam_type: examType
            }
        }
    );

    if (error || !data?.question) {
        console.error(
            "Start exam error:",
            error
        );

        alert(
            "Unable to start the exam. Please try again."
        );

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

    currentExamUsesBackend = true;

    currentQuestions = [
        data.question
    ];

    currentQuestion = 0;
    score = 0;
    answerSubmitted = false;

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

    // CURRENT QUESTION DATA
    const q = currentExamUsesBackend
        ? currentExamQuestion
        : currentQuestions[currentQuestion];

    answerSubmitted = false;

    // EXAM COLOR THEME
    let examColor = "#f5a623";

    if (examTitle.includes("MTBE")) {
        examColor = "#3b82f6";
    }

    if (examTitle.includes("METATHESIS")) {
        examColor = "#22c55e";
    }

    if (examTitle.includes("Safety")) {
        examColor = "#ef4444";
    }

    if (examTitle.includes("Merge")) {
        examColor = "#a855f7";
    }

    let buttonColor = examColor;

    let html = `

    ${getHeroBanner()}

    <div class="content-box">

                                    <!-- QUESTION ENGINE NAVIGATION BUTTONS -->


<div class="mobile-nav-buttons">

    <button onclick="showHome()">
        🏠 Main Dashboard
    </button>

    <button onclick="
        if (currentModule === 'MTBE') {
            showMTBEMenu();
        }
        else if (currentModule === 'METATHESIS') {
            showMetathesisMenu();
        }
        else if (currentModule === 'MERGE') {
            showMergeMenu();
        }
        else if (currentModule === 'SAFETY') {
            showSafetyMenu();
        }
        else {
            showHome();
        }
    ">
        ↩️ Back to Menu
    </button>

</div>

<br><br>

                                    <!-- QUESTION ENGINE EXAM HEADER -->

<div style="
background:#1e293b;
padding:15px 20px;
border-radius:12px;
margin-top:8px;
margin-bottom:15px;
border-left:4px solid ${examColor};
max-width:760px;
">

                                    <!-- QUESTION ENGINE EXAM TITLE -->

    <h2 style="
    margin-bottom:5px;
    ">
    ${examTitle
        .replace(' Full Exam', '')
        .replace(' Random Exam', '')
    }
    </h2>

                                    <!-- MERGE EXAM DESCRIPTION -->

    ${examTitle.includes('Merge') ? `
    <p style="
    margin:0;
    opacity:0.85;
    letter-spacing:0.5px;
    font-size:14px;
    color:#ddd6fe;
    ">
    MTBE + META + SAFETY
    </p>
    ` : ''}

                                    <!-- QUESTION ENGINE EXAM TYPE AND QUESTION COUNT -->



<p style="
margin:4px 0 0 0;
font-size:15px;
font-weight:bold;
">
${currentExamType} • ${
    currentExamUsesBackend
        ? currentExamTotalQuestions
        : currentQuestions.length
} Questions
</p>


                                    <!-- QUESTION ENGINE PROGRESS INDICATOR -->


<p style="
margin:8px 0 0 0;
font-size:14px;
font-weight:bold;
color:#ffffff;
">
Question ${
    currentExamUsesBackend
        ? currentQuestion + 1
        : currentQuestion + 1
} of ${
    currentExamUsesBackend
        ? currentExamTotalQuestions
        : currentQuestions.length
}
</p>

                                    <!-- QUESTION ENGINE WARNING CONTAINER -->

    <div id="warningBox" style="
    display:flex;
    justify-content:flex-end;
    align-items:center;
    "></div>

</div>



                                    <!-- QUESTION ENGINE QUESTION CARD -->

<div style="
background:rgba(255,255,255,0.03);
padding:12px;
border-radius:10px;
border-left:3px solid ${examColor};
margin-bottom:15px;
">

                                    <!-- QUESTION ENGINE QUESTION TEXT -->

    <h3 style="
    margin:0;
    ">
        ${q.question}
    </h3>

</div>

`;

q.options.forEach((option, i) => {

    html += `

                                    <!-- QUESTION ENGINE ANSWER OPTION -->

<label style="
display:block;
margin:12px 0;
cursor:pointer;
">

    <input
    type="radio"
    name="answer"
    value="${i}">

    ${String.fromCharCode(65 + i)}. ${option}

</label>

    `;

});

html += `

                                    <!-- QUESTION ENGINE ACTION BUTTONS -->

    <button
    id="submitBtn"
    onclick="checkAnswer()"
    style="
    background:${buttonColor};
    min-width:140px;
    height:45px;
    font-weight:bold;
    ">
    ✅ Submit Answer
    </button>

    <button
    id="nextBtn"
    onclick="nextQuestion()"
    style="
    background:${buttonColor};
    min-width:140px;
    height:45px;
    font-weight:bold;
    ">
    ➡️ Next Question
    </button>

                                    <!-- QUESTION ENGINE RESULT CONTAINER -->

    <div id="result"></div>

</div>

`;

document.getElementById("content").innerHTML = html;

}


                                      // ======================
                                     // ANSWER PROCESSING
                                    // ======================

function showWarning(message) {

    const warningBox =
    document.getElementById("warningBox");

    if (!warningBox) return;

    warningBox.innerHTML = `

                                    <!-- ANSWER PROCESSING WARNING MESSAGE -->

        <div style="
        background:rgba(245,158,11,0.75);
        color:#ffffff;
        padding:8px 14px;
        border-radius:12px;
        font-weight:bold;
        font-size:15px;
        border:1px solid #fcd34d;
        text-align:center;
        display:inline-block;
        margin-left:auto;
        margin-right:40px;
        box-shadow:0 0 12px rgba(0,0,0,0.25);
        ">
            ${message}
        </div>

    `;

    setTimeout(() => {

        warningBox.innerHTML = "";

    }, 2500);

}


                                      // ======================
                                     // ANSWER VALIDATION
                                    // ======================

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

    const submitButton =
        document.getElementById("submitBtn");

    const nextButton =
        document.getElementById("nextBtn");

    const resultBox =
        document.getElementById("result");

    const selectedIndex =
        Number(selected.value);

    const question =
        currentExamUsesBackend
            ? currentExamQuestion
            : currentQuestions[currentQuestion];

    const selectedAnswer =
        question.options[selectedIndex];

    if (
        currentExamUsesBackend &&
        currentExamSessionId
    ) {
        submitButton.disabled = true;

        const originalButtonText =
            submitButton.innerHTML;

        submitButton.innerHTML =
            "⏳ Checking...";

        const client =
            window.supabaseClient ||
            window.supabase;

        if (!client?.functions) {
            submitButton.disabled = false;
            submitButton.innerHTML =
                originalButtonText;

            showWarning(
                "Unable to connect to Supabase ⚠️"
            );

            return;
        }

        const {
            data,
            error
        } = await client.functions.invoke(
            "exam-answer",
            {
                body: {
                    session_id:
                        currentExamSessionId,

                    selected_answer:
                        selectedAnswer
                }
            }
        );

        if (
            error ||
            typeof data?.correct !== "boolean"
        ) {
            console.error(
                "Answer submission error:",
                error
            );

            submitButton.disabled = false;
            submitButton.innerHTML =
                originalButtonText;

            showWarning(
                "Unable to submit the answer ⚠️"
            );

            return;
        }

        answerSubmitted = true;

        if (data.correct) {
            score++;

            resultBox.innerHTML = `
                <div style="
                    margin-top:15px;
                    padding:12px;
                    border-radius:10px;
                    background:rgba(34,197,94,0.15);
                    border-left:4px solid #22c55e;
                ">

                    <p style="
                        color:#22c55e;
                        font-weight:bold;
                        font-size:20px;
                        margin:0;
                    ">
                        ✅ Correct Answer
                    </p>

                </div>
            `;
        } else {
            resultBox.innerHTML = `
                <div style="
                    margin-top:15px;
                    padding:12px;
                    border-radius:10px;
                    background:rgba(239,68,68,0.15);
                    border-left:4px solid #ef4444;
                ">

                    <p style="
                        color:#ef4444;
                        font-weight:bold;
                        font-size:20px;
                        margin:0;
                    ">
                        ❌ Incorrect Answer
                    </p>

                </div>

                <div style="
                    margin-top:10px;
                    padding:12px;
                    border-radius:10px;
                    background:rgba(34,197,94,0.15);
                    border-left:4px solid #22c55e;
                ">

                    <p style="
                        color:#22c55e;
                        font-weight:bold;
                        font-size:18px;
                        margin:0;
                    ">
                        ✅ Correct Answer:
                        ${data.correct_answer}
                    </p>

                </div>
            `;
        }

        document
            .querySelectorAll(
                'input[name="answer"]'
            )
            .forEach(
                radio =>
                    radio.disabled = true
            );

        submitButton.innerHTML =
            "✅ Answer Submitted";

        nextButton.disabled = false;

        return;
    }

    const correctIndex =
        question.options.indexOf(
            question.answer
        );

    answerSubmitted = true;

    if (selectedIndex === correctIndex) {
        score++;

        resultBox.innerHTML = `
            <div style="
                margin-top:15px;
                padding:12px;
                border-radius:10px;
                background:rgba(34,197,94,0.15);
                border-left:4px solid #22c55e;
            ">

                <p style="
                    color:#22c55e;
                    font-weight:bold;
                    font-size:20px;
                    margin:0;
                ">
                    ✅ Correct Answer
                </p>

            </div>
        `;
    } else {
        resultBox.innerHTML = `
            <div style="
                margin-top:15px;
                padding:12px;
                border-radius:10px;
                background:rgba(239,68,68,0.15);
                border-left:4px solid #ef4444;
            ">

                <p style="
                    color:#ef4444;
                    font-weight:bold;
                    font-size:20px;
                    margin:0;
                ">
                    ❌ Incorrect Answer
                </p>

            </div>

            <div style="
                margin-top:10px;
                padding:12px;
                border-radius:10px;
                background:rgba(34,197,94,0.15);
                border-left:4px solid #22c55e;
            ">

                <p style="
                    color:#22c55e;
                    font-weight:bold;
                    font-size:18px;
                    margin:0;
                ">
                    ✅ Correct Answer:
                    ${question.answer}
                </p>

            </div>
        `;
    }

    document
        .querySelectorAll(
            'input[name="answer"]'
        )
        .forEach(
            radio =>
                radio.disabled = true
        );

    submitButton.disabled = true;
    nextButton.disabled = false;
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

    if (
        currentExamUsesBackend &&
        currentExamSessionId
    ) {
        const nextButton =
            document.getElementById("nextBtn");

        nextButton.disabled = true;

        const originalButtonText =
            nextButton.innerHTML;

        nextButton.innerHTML =
            "⏳ Loading...";

        const client =
            window.supabaseClient ||
            window.supabase;

        if (!client?.functions) {
            nextButton.disabled = false;
            nextButton.innerHTML =
                originalButtonText;

            showWarning(
                "Unable to connect to Supabase ⚠️"
            );

            return;
        }

        const {
            data,
            error
        } = await client.functions.invoke(
            "next-question",
            {
                body: {
                    session_id:
                        currentExamSessionId
                }
            }
        );

        if (error || !data) {
            console.error(
                "Next question error:",
                error
            );

            nextButton.disabled = false;
            nextButton.innerHTML =
                originalButtonText;

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
            nextButton.disabled = false;
            nextButton.innerHTML =
                originalButtonText;

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

        currentQuestions = [
            data.question
        ];

        answerSubmitted = false;

        showQuestion();

        return;
    }

    currentQuestion++;

    if (
        currentQuestion >=
        currentQuestions.length
    ) {
        finishExam();
        return;
    }

    showQuestion();
}

                                      // ======================
                                     // EXAM RESULTS
                                    // ======================





async function finishExam() {

    console.log("finishExam fired");

    const totalQuestions =
        currentExamUsesBackend
            ? currentExamTotalQuestions
            : currentQuestions.length;

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

    console.log(
        "SAVE TEST",
        localStorage.getItem("nickname"),
        currentModule,
        currentRole,
        currentExamType,
        score,
        totalQuestions,
        percent
    );

    console.log(
        "MODULE =",
        currentModule,
        "ROLE =",
        currentRole,
        "EXAM TYPE =",
        currentExamType
    );



    document.getElementById(
        "content"
    ).innerHTML = `

        ${getHeroBanner()}

        <div class="content-box">

            <!-- EXAM RESULTS HEADER -->

            <div style="
                background:${
                    passed
                        ? "#166534"
                        : "#991b1b"
                };
                padding:15px 20px;
                border-radius:12px;
                margin-bottom:20px;
                border-left:4px solid ${
                    passed
                        ? "#86efac"
                        : "#fca5a5"
                };
            ">

                <h2 style="
                    margin:0 0 8px 0;
                ">
                    🎉 Exam Completed
                </h2>

                <p style="
                    margin:0 0 10px 0;
                    font-size:18px;
                    font-weight:bold;
                ">
                    ${examTitle}
                </p>

                <p style="margin:0;">
                    ${
                        passed
                            ? "✅ PASS"
                            : "❌ FAIL"
                    }
                </p>

            </div>

            <!-- RESULTS SUMMARY CARD -->

            <div style="
                background:#0f172a;
                padding:20px;
                border-radius:12px;
                border:1px solid #334155;
            ">

                <h3>
                    📊 Results Summary
                </h3>

                <p>
                    <strong>Exam Type:</strong>
                    ${currentExamType}
                </p>

                <p>
                    <strong>Score:</strong>
                    ${score} / ${totalQuestions}
                </p>

                <p>
                    <strong>Percentage:</strong>
                    ${percent}%
                </p>

                <p style="
                    font-size:20px;
                    font-weight:bold;
                    color:${
                        passed
                            ? "#86efac"
                            : "#fca5a5"
                    };
                ">
                    ${
                        passed
                            ? "🌟 Excellent Work!"
                            : "💪 Keep Practicing and Try Again!"
                    }
                </p>

            </div>

            <br>

            <!-- RESULTS PAGE ACTION BUTTONS -->

            <button onclick="showHome()">
                🏠 Main Dashboard
            </button>

            <button onclick="retakeExam()">
                🔄 Retake Exam
            </button>

        </div>
    `;
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

${getHeroBanner()}

    <div class="content-box" style="text-align:center;">

        <h2>👋 Welcome Back, ${profile.nickname}</h2>

        <p>
            Continue your training progress or switch to another user.
        </p>

        <button onclick="showHome()">
            ✅ Continue
        </button>

        <button onclick="
            logoutUser();
            showLogin();
        ">
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
