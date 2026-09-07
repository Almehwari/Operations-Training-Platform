/* ======================
   PROFILE MANAGEMENT
====================== */

const db = window.supabaseClient;

async function createProfile(nickname, pin) {
  if (await profileExists(nickname)) {
    return { error: 'Nickname already exists' };
  }

  return await db
    .from('profiles')
    .insert([
      {
        nickname: nickname,
        pin_hash: pin
      }
    ]);
}

async function profileExists(nickname) {
  const { data, error } = await db
    .from('profiles')
    .select('id')
    .eq('nickname', nickname)
    .limit(1);

  return data.length > 0;
}

async function validateLogin(nickname, pin) {
  const { data } = await db
    .from('profiles')
    .select('id')
    .eq('nickname', nickname)
    .eq('pin_hash', pin)
    .limit(1);

  return data.length > 0;
}

async function getProfile(nickname) {
  const { data } = await db
    .from('profiles')
    .select('*')
    .eq('nickname', nickname)
    .single();

  return data;
}

async function updateLastLogin(profileId) {
  return await db
    .from('profiles')
    .update({
      last_login: new Date().toISOString()
    })
    .eq('id', profileId);
}

async function loginUser(nickname, pin) {
  const isValid = await validateLogin(nickname, pin);

  if (!isValid) {
    return false;
  }

  const profile = await getProfile(nickname);

  await updateLastLogin(profile.id);

  await rememberCurrentUser(profile);

  return profile;
}

async function registerOrLogin(nickname, pin) {
  if (await profileExists(nickname)) {
    return await loginUser(nickname, pin);
  }


await createProfile(nickname, pin);

await rememberUser(nickname);

const profile = await getProfile(nickname);

return profile;

}

async function getCurrentUser() {
  const nickname = localStorage.getItem('nickname');

  if (!nickname) {
    return null;
  }

  return await getProfile(nickname);
}

function saveCurrentUser(nickname) {
  localStorage.setItem('nickname', nickname);
}

function logoutUser() {
  localStorage.removeItem('nickname');
}


function isLoggedIn() {
  return !!localStorage.getItem('nickname');
}


function getSavedNickname() {
  return localStorage.getItem('nickname');
}


async function autoLogin() {
  const nickname = getSavedNickname();

  if (!nickname) {
    return null;
  }

  return await getProfile(nickname);
}

async function rememberUser(nickname) {
  saveCurrentUser(nickname);
}



async function rememberCurrentUser(profile) {
  await rememberUser(profile.nickname);
}

autoLogin();

autoLogin().then(profile => {

  if (!profile) return;

  if (typeof showHome === "function") {
      showHome();
  }

  const banner =
    document.getElementById("welcome-banner");

  if (banner) {
      banner.style.display = "block";
      banner.innerHTML =
      `👋 Welcome Back, ${profile.nickname}`;
  }

});

async function saveExamResult(
    nickname,
    module,
    role,
    examType,
    scoreValue,
    totalQuestions,
    percentage
) {

    await db
        .from("exam_results")
        .insert([
            {
                nickname: nickname,
                module: module,
                role: role,
                exam_type: examType,
                score: scoreValue,
                total_questions: totalQuestions,
                correct_answers: scoreValue,
                score_percentage: percentage
            }
        ]);

}

async function getUserExamResults(nickname) {
    const { data } = await db
        .from("exam_results")
        .select("*")
        .eq("nickname", nickname)
        .order("created_at", { ascending: false });
console.log("MY PROGRESS USER =", nickname);
console.log("MY PROGRESS RESULTS =", data);

    return data || [];
}
