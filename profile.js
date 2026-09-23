/* ======================
   PROFILE MANAGEMENT
====================== */

const db = window.supabaseClient;

async function getProfile() {
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const { data } = await db
    .from("profiles")
    .select("id, user_id, nickname, created_at, last_login, is_admin")
    .eq("user_id", user.id)
    .single();

  window.currentUserIsAdmin =
    data?.is_admin === true;

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

async function registerOrLogin(nickname, pin) {
  const username = nickname.trim().toLowerCase();

  if (!/^[a-z0-9_]+$/.test(username) || !/^\d{6}$/.test(pin)) {
    return false;
  }

  const email = `${username}@operations-training.example`;

  let { data, error } = await db.auth.signInWithPassword({
    email: email,
    password: pin
  });

  if (error) {
    const signup = await db.auth.signUp({
      email: email,
      password: pin
    });

    if (signup.error || !signup.data.user) {
      return false;
    }

    data = signup.data;

    const { error: profileError } = await db
      .from("profiles")
      .insert({
        user_id: data.user.id,
        nickname: username
      });

    if (profileError) {
      await db.auth.signOut();
      return false;
    }
  }

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("id, user_id, nickname, created_at, last_login, is_admin")
    .eq("user_id", data.user.id)
    .single();

  if (profileError || !profile) {
    return false;
  }

window.currentUserIsAdmin =
    profile.is_admin === true;


  await db
    .from("profiles")
    .update({
      last_login: new Date().toISOString()
    })
    .eq("user_id", data.user.id);

  saveCurrentUser(profile.nickname);
  return profile;
}

async function getCurrentUser() {
  return await getProfile();
}

function saveCurrentUser(nickname) {
  localStorage.setItem("nickname", nickname);
}

async function logoutUser() {
    await db.auth.signOut();

    window.currentUserIsAdmin = false;

    localStorage.removeItem("nickname");
}

function isLoggedIn() {
  return !!localStorage.getItem("nickname");
}

function getSavedNickname() {
  return localStorage.getItem("nickname");
}

async function autoLogin() {
  const {
    data: { session }
  } = await db.auth.getSession();

  if (!session) {
    return null;
  }

  return await getProfile();
}

async function rememberUser(nickname) {
  saveCurrentUser(nickname);
}

async function rememberCurrentUser(profile) {
  saveCurrentUser(profile.nickname);
}

// The start-up screen (Welcome Back or Login) is chosen once, at the end of script.js.



async function getUserExamResults() {
  const { data: { user } } = await db.auth.getUser();

  if (!user) return [];

  const { data, error } = await db
    .from("exam_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];

  return data || [];
}
