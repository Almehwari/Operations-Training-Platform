# Architecture review: Operations Training Platform (2026-09-23)

Report: [2026-09-23-architecture-review.html](2026-09-23-architecture-review.html)

**Provenance.** Line numbers are true of `Almehwari/Operations-Training-Platform@8a40d39` (main, committed 2026-09-17). The reviewed download, `Operations-Training-Platform-main/`, is byte-identical to that commit. It has no `.git`, so history came from a fresh clone of the upstream repo.

**Scope.** The whole app: `index.html`, `supabase.js`, `profile.js` (172 lines), and `script.js` (5,025 lines, 82 inline `onclick` strings, 47 `innerHTML` writes). Weighting followed the history, 69 commits from 2026-07-03 to 2026-09-17:

- `script.js` changed in 14 commits.
- The exam engine is the hot spot. `f4a9fa4` (2026-09-17, +1,815/−664) centred on `checkAnswer`, `nextQuestion`, `showQuestion` and `finishExam`. `012eb45` (2026-09-07, +1,001/−58) added the `start*` functions.
- On 2026-09-17, `219ddb7` and `8a40d39` removed client-side `saveExamResult`, and the local question files were deleted.

The repo has no tests, no `CONTEXT.md` and no ADRs.

**Vocabulary.** *Plant* means the code's `plant`/`module`: MTBE, METATHESIS, SAFETY, MERGE. MERGE is MTBE + METATHESIS + SAFETY. The word "module" is kept for its architectural sense. *Role* means FO, CO or SSV; SAFETY sends `"ALL"`. *Exam type* means Full Exam, Random Exam or Test Exam. The *Exam session* is the server-side attempt identified by `session_id`. An *exam result* is a row in `exam_results`, and a *profile* is a row in `profiles`. The architecture terms (module, interface, depth, seam, adapter, leverage, locality) follow `/codebase-design`.

## Candidates

### C1. Deepen the Exam session: Strong (ports & adapters)

**Files.**
- `script.js:3894–3980`: exam globals and `startBackendExam`
- `script.js:3987–4092`: nine pass-through `start*` functions
- `script.js:4098–4338`: `showQuestion`
- `script.js:4388–4656`: `checkAnswer`
- `script.js:4665–4798`: `nextQuestion`
- `script.js:4808–4982`: `finishExam` and `retakeExam`

**Problem.** One exam attempt is spread over nine mutable globals (`script.js:3894–3903`), which five functions share. Each of those functions also builds HTML or reads the DOM:

- Three of them each own one leg of the Edge Function protocol: `start-exam` (3925), `exam-answer` (4454) and `next-question` (4709).
- Four of them read `currentExamUsesBackend`, nine times in total. The flag is set to `true` at 3962 and never back to `false`, so about 100 lines of the local path can't be reached (F11).
- `currentQuestion` means different things on the two paths.
- The 1-based/0-based conversion (4770) and the button re-entrancy handling (4427–4440, 4682–4695) are written separately in each function.
- The pass/fail call (`percent >= 80`, 4839) is made on the client, from a score the server supplies.

None of this can be tested without a browser and a live Supabase project.

**Solution.** Make the Exam session one module that owns the attempt and the whole protocol behind a small interface: start an attempt, answer, advance. It returns the next state (question, verdict, or result) for a thin view to render, and reaches the three Edge Functions through a port. Delete the local path.

**Benefits.**
- Locality: the protocol, the progress numbering, the in-flight guard and the error modes live in one module.
- Leverage: ten entry points (nine `start*` functions plus `retakeExam`) share one interface.
- Tests: in `node:test`, script an in-memory exam server as the second adapter and assert on the states returned. No DOM is needed.
- The seam is real, not hypothetical: it has two adapters, Supabase Edge Functions in production and the in-memory server in tests.
- This is the first ES module in the repo. Until the views move off inline `onclick` strings, it has to be bound to `window`.

**Deletion test.** Deleting `startBackendExam` today would push the start protocol out into ten callers, so it earns its keep. Deleting the `currentExamUsesBackend` branches concentrates nothing, because they are dead.

**Resolves.** F11, F12, F13, F14, F15.

### C2. Turn the per-Plant copies into one Plant catalog: Strong (in-process)

**Files.**
- `script.js:1535–1974`: `showHome`, with four hand-written Plant cards
- `script.js:1979–2771`: `showMTBERoles`, `showMetathesisRoles`, `showMergeRoles`; `setMTBERole`, `setMetathesisRole`, `setMergeRole`; `showMTBEMenu`, `showMetathesisMenu`, `showMergeMenu`
- `script.js:3442–3564`: `showSafetyMenu`
- `script.js:3987–4092`: nine `start*` functions
- Three dispatch ladders:
  - `script.js:4108–4124`: colour from `examTitle.includes(…)`
  - `script.js:4143–4158`: back-to-menu from `currentModule === …`
  - `script.js:2898–2915`: re-render from `currentPage === …`

**Problem.** The facts about each Plant exist only as code: its roles, its exam types, its colours, and the fact that MERGE is MTBE + METATHESIS + SAFETY. That code is 27 per-Plant functions, four home cards and three string-matching ladders.

- The copies differ only in literals (diffed: titles, hex colours, setter names).
- The copies have already drifted:
  - The Metathesis role picker opens 17 `<div>`s and closes 16 (F20).
  - Margins are 6px in one copy and 8px in another.
  - Function names follow no pattern: `showMeta`, `showMetathesisMenu`, `startMetathesis`, `startRandomMETATHESISExam`.
- Adding a fifth Plant takes about a dozen edits.
- An agent asked to change "the Metathesis menu" has to find the right copy, and the change won't reach the others.

**Solution.** Put every fact about a Plant in one Plant catalog: key, label, roles, exam types, palette, and composition. Render the home card, role picker, Plant menu and exam colours from the catalog, with one view each, parametrised by Plant. Starting an exam hands the Plant, Role and exam type to the Exam session (C1).

**Benefits.**
- Locality: a Plant is one row, and adding a Plant is adding a row.
- About 900 lines of copies go.
- Function names follow from the Plant key.
- Tests assert catalog invariants: every Plant with roles offers FO, CO and SSV, SAFETY skips the role step, and MERGE's parts are all Plants. They don't need screenshots.

**Deletion test.** Deleting `showMetathesisRoles`, `showMergeRoles` and the two extra menus loses nothing that a catalog row can't hold. They are pass-through copies.

**Resolves.** F16, F20, and part of F19.

### C3. One Identity module owns who is signed in: Strong (mock; Supabase Auth is external)

**Files.**
- `profile.js:1–172`
- `supabase.js:1–14`
- `script.js:6–106`: `getHeroBanner`
- `script.js:108–252`: `showLogin`
- `script.js:719–729`: `switchUser`, `logout`
- `script.js:1956–1972`: the welcome banner
- `script.js:4987–5025`: `showWelcomeBack` and the second bootstrap

**Problem.** "Who is signed in" lives in four places:

- the Supabase session
- the `profiles` row
- localStorage `nickname` (`profile.js:101–119`)
- `window.currentUserIsAdmin` (`profile.js:17–18, 82–83, 108`)

These are written at different times:

- Two `autoLogin()` bootstraps run on load, at `profile.js:141–154` and `script.js:5017–5025`. They race to render different screens (F7).
- `logout()` and `switchUser()` don't await `logoutUser()`, so the login screen renders the previous user's header (F6).
- The header trusts localStorage while data calls trust the session, so an expired session leaves a signed-in header over empty analytics (F8).

`profile.js` has twelve functions, and five of them have no callers (F10). Login is handled twice, and only the Enter-key version reports failure (F9).

**Solution.** Make one Identity module the only reader and writer of sign-in state:

- It bootstraps once.
- It finishes sign-out before anything re-renders.
- It applies the nickname and PIN rules.
- It hands views one identity value (nickname, admin or not) derived from the session and the profile.

localStorage becomes a cache the module owns, not a source of truth.

**Benefits.**
- One bootstrap and one landing screen.
- Sign-out ordering is fixed in one place.
- Tests use a fake auth adapter to drive sign-in, sign-out and expiry, with no DOM.
- Five dead functions go.

**Resolves.** F6, F7, F8, F9, F10.

### C4. Deepen the Question bank (load once, normalise, group): Strong (ports & adapters)

**Files.**
- `script.js:2787–2882` and `3416–3436`: `getMTBEQuestions`, `getMetathesisQuestions`, `getMergeQuestions`, `getSafetyQuestions`
- `script.js:2890–2915`: `collapsedSections`, `currentPage`, `toggleSection`
- `script.js:2923–3150`: `showMTBE`
- `script.js:3157–3411`: `showMeta`
- `script.js:3573–3712`: `showSafety`
- `script.js:3721–3884`: `showMergeQuestionBank`

**Problem.** Four shallow fetchers wrap one `question-bank` Edge Function call. Each fetcher's interface is barely smaller than its one-call implementation.

Each bank view works out the correct option from two answer formats, `answer` text or a `correct` index. That logic appears at 3124–3127, 3376–3379, 3691–3694 and 3857–3860. There is also a dead copy at 3107–3110, and another in the exam's unreachable path at 4572–4575 that only knows `answer`.

Section grouping is copied at 2992–3005 and 3234–3247:

- It throws when the first question has no section (F17).
- SAFETY and MERGE don't have it at all.
- `toggleSection` re-renders by re-running the page function, which calls the Edge Function again (F18).
- `collapsedSections` is keyed by section name only, so it is shared across Plants.

MERGE's bank fetches its three parts one after another, never reads `error`, and defines its composition a second time next to `start-exam` (F19).

**Solution.** Make the Question bank one module:

- It loads a Plant's questions once per Plant and Role. For MERGE, it takes the parts from the Plant catalog and loads them in parallel.
- It normalises every question to one shape, with the correct option already resolved.
- It groups questions into sections, including any before the first section header.
- It reports failure as a value instead of returning `[]`.
- It serves re-renders from memory.

One bank view, parametrised by Plant, replaces the four.

**Benefits.**
- The two answer formats become one at the seam.
- Toggling re-renders without a network call.
- Every Plant gets sections.
- Tests run a fixture adapter over the edge cases: a question with no section before the first header, MERGE composition, and a failing part.
- Four bank views become one.

**Resolves.** F17, F18, F19, and part of F4.

### C5. One Progress summary, with the pass mark owned by the server: Worth exploring (in-process)

**Files.**
- `script.js:300–460`: `showAnalytics`
- `script.js:463–717`: `showMyProgress`
- `script.js:4833–4839`: `finishExam` pass/fail
- `script.js:871` and `1231`: `pass_rate` computed on the server
- `profile.js:158–172`: `getUserExamResults`

**Problem.** The same numbers are computed in several places, and some of them disagree:

- Average, best and pass rate are computed twice, inside two render functions: `showAnalytics` at 308–328 and `showMyProgress` at 472–496.
- The 80% pass mark appears three times on the client (325, 493, 4839).
- admin-users-analytics computes its own `pass_rate` on the server, where the rule can't be seen.

To test the stats, you have to go through each view's whole interface: the DOM, the auth session and a network query. "Improvement" is computed as best minus average (443–450). A `"EMPTY"` module placeholder is filtered in only one of the views (505).

**Solution.** Summarise a trainee's results in one pure Progress summary (results in, summary out). Have the server record `passed` on each exam result, so the pass mark lives in one place and both the trainee's and the admin's numbers derive from it.

**Benefits.**
- One pass mark, owned by the server.
- The summary is a pure function, tested with plain arrays.
- The views shrink to layout.
- "Improvement" gets a real definition.

The client-side part is cheap. The pass mark only gets a single owner once the server change lands.

**Resolves.** F14, F21.

### C6. Collapse three admin screens onto one Admin roster: Worth exploring (ports & adapters)

**Files.**
- `script.js:735–940`: `showUsersAnalytics`
- `script.js:1098–1304`: `showAdminUsers`
- `script.js:1306–1533`: `showAdminPermissions`
- `script.js:943–1095`: `showAdminDashboard`, `showUserRolesPermissions`

**Problem.** Three screens each do the same work:

- call `admin-users-analytics` (773, 1143, 1351)
- hand-roll a loading state
- show "⛔ Admin Access Required" for any failure, so a denied request, an expired session and an outage look the same

`showAdminUsers` differs from `showUsersAnalytics` only in titles and the back button (diffed). The admin screens are gated only by whether `getHeroBanner` shows the menu items (72–92).

**Solution.** Load the roster through one Admin roster module that tells denied, expired and failed apart. Render it with one roster view that has three column presets.

**Benefits.**
- By the deletion test, `showAdminUsers` goes.
- There is one fetch path to secure and verify.
- Tests use a fake roster adapter.

**Resolves.** F5 on the client. Admin access is enforced inside the Edge Function, which isn't in the repo (F22).

### C7. Escape by default at one Render module: Worth exploring (in-process)

**Files.** 16 interpolation sites in `script.js`:
- 3020 and 3274: section name inside an `onclick` string
- 3101, 3120, 3360, 3374, 3671, 3685, 3839, 3853: question text and options in the bank views
- 4268, 4292, 4548: question, options and `correct_answer` in the exam
- 843, 1211, 1426: nicknames on the admin screens

**Problem.** Every view concatenates HTML and assigns it to `innerHTML`, so escaping is left to each site, and no site does it. The repo has no escaping helper at all. In practice this means:

- Stored questions, section names and nicknames reach the DOM raw (F4).
- A section name with an apostrophe breaks its toggle.

**Solution.** Route views through one small Render module whose templates escape interpolated values by default, handle attribute contexts safely, and require trusted fragments to be marked explicitly. Adopt it view by view as C1, C2 and C4 rewrite those views.

**Benefits.**
- Locality: escaping has one owner.
- Section names with apostrophes toggle correctly.
- New views are safe by default.
- One table-driven test covers escaping.

**Resolves.** F4.

## Findings

Severity: high, medium or low. Status: *confirmed* means verified by reading the code at `8a40d39`. *Verify* means the evidence points at the database or at Edge Functions that aren't in the repo.

### F1–F3. Reported privately to the maintainer. Security.
Three security findings from this review went to the maintainer privately instead of being published here. They aren't filed as public issues.

### F4. Stored strings reach `innerHTML` unescaped, and a section name is placed inside an `onclick` string. Medium, security and correctness, confirmed.
**Where.**
- `script.js:3020, 3274`: attribute and JavaScript context.
- `script.js:3101, 3120, 3360, 3374, 3671, 3685, 3839, 3853, 4268, 4292, 4548`: question text, options and `correct_answer`.
- `script.js:843, 1211, 1426`: nicknames.

**Failure scenario.**
- A section named "Operator's Duties" produces `toggleSection('Operator's Duties')`, a syntax error, so that section can never be collapsed.
- Question content containing markup is executed in every trainee's session.
- Exploitability depends on who can write questions and nicknames. Nicknames are regex-checked only on the client (`profile.js:36`).

**Resolved by.** C7, with C4 for the section toggle.

### F5. Admin screens are gated only by menu visibility, and every failure reads "Admin Access Required". Medium, security, verify.
**Where.** `script.js:72–92`, `780–813`, `1150–1182`, `1358–1394`.

**Failure scenario.** Any signed-in user can call `showUsersAnalytics()` from devtools. Whether data comes back depends entirely on the unseen Edge Function checking admin status against the database. Meanwhile, real admins with an expired session, or during an outage, are told they lack access.

**Resolved by.** C6. Verifying the Edge Function is part of F22.

### F6. Logout and Switch User render the previous user's header. Medium, identity, confirmed.
**Where.** `script.js:719–729` and `5005–5008` call `logoutUser()` without awaiting it, then call `showLogin()`. `profile.js:105–111` clears `nickname` and the admin flag only after `signOut()` resolves.

**Failure scenario.** An admin clicks Logout. The login screen renders their nickname and dropdown, including the Admin entries, because `getHeroBanner` (6–106) reads the state before it is cleared. On a shared terminal, the next operator sees them. `switchUser` and `logout` are identical.

**Resolved by.** C3. Direct fix: await, then render.

### F7. Two `autoLogin()` bootstraps race to render different screens. Medium, identity, confirmed.
**Where.** `profile.js:141–154` calls `showHome()` and writes the banner. `script.js:5017–5025` calls `showWelcomeBack()`.

**Failure scenario.** Every load with a live session makes the session, user and profile round-trips twice. The Home screen flashes, then Welcome Back replaces it, or the other way round, depending on network timing.

**Resolved by.** C3.

### F8. Header trusts localStorage `nickname`, while data trusts the Supabase session. Medium, identity, confirmed.
**Where.** `script.js:6–9`, `1962`; `profile.js:117–119`, `158–172`.

**Failure scenario.** After the session expires, the bootstrap shows the login screen, but its header still shows the old nickname and dropdown. Analytics opened from that dropdown shows zeros, because `getUserExamResults` finds no user.

**Resolved by.** C3.

### F9. Clicking "Enter Platform" with a wrong PIN shows no error. Low, identity, confirmed.
**Where.** `script.js:200–219` (click) versus `221–250` (Enter key). Only the Enter-key handler fills `#login-message`.

**Failure scenario.** An operator clicks the button with a typo and nothing happens.

**Resolved by.** C3.

### F10. Five `profile.js` functions have no callers. Low, identity, confirmed.
**Where.**
- `updateLastLogin` (`profile.js:24–31`), whose logic is re-inlined at 86–91
- `getCurrentUser` (97–99)
- `isLoggedIn` (113–115)
- `rememberUser` (133–135)
- `rememberCurrentUser` (137–139)

**Resolved by.** C3.

### F11. The local exam path can't be reached. Medium, exam, confirmed.
**Where.**
- `currentExamUsesBackend` is initialised `false` at `script.js:3903` and set `true` at 3962; nothing sets it back to `false`.
- Dead branches: 4101–4103, 4213–4238, 4415–4418, 4572–4655, 4787–4797, 4812–4815.
- 4230–4234 is a ternary with identical arms.
- The `window.supabase` fallback (3911–3913, 4435–4437, 4690–4692) can never work, because `window.supabase` is the library namespace, not a client.

**Failure scenario.** About 100 dead lines mislead readers. The dead grader (4572–4575) only understands `answer`, not `correct`, so reviving it would mis-grade.

**Resolved by.** C1.

### F12. Starting an exam has no in-flight guard. Low, exam, confirmed (the server-side consequence is plausible).
**Where.** `script.js:3906–3980`.

**Failure scenario.** A double-click on an exam card sends `start-exam` twice. The server opens two sessions, and whichever response arrives last overwrites the globals. The other session is orphaned.

**Resolved by.** C1.

### F13. "Unable to connect" before an exam starts is never shown. Low, exam, confirmed.
**Where.** `script.js:3915–3919` calls `showWarning`, which returns early at 4350 when `#warningBox` is missing. The box only exists on the question screen.

**Failure scenario.** With the client unavailable, clicking Full Exam or Retake does nothing visible.

**Resolved by.** C1.

### F14. The 80% pass mark is hard-coded three times on the client, and the server computes its own pass rate. Medium, exam and analytics, confirmed.
**Where.** `script.js:325`, `493`, `4839`, with the server's `pass_rate` rendered at 871 and 1231.

**Failure scenario.** Changing the pass mark on the server leaves the trainee's PASS/FAIL banner and My Progress on 80%. The trainee and the admin then see different pass rates.

**Resolved by.** C5 and C1.

### F15. Stale migration comments and debug logs suggest the client still saves results. Low, exam, confirmed.
**Where.**
- `script.js:2273–2281` and `2773–2778`: the "LEGACY … must remain until … migration" comments.
- `script.js:4810` and `4841–4859`: "finishExam fired" and "SAVE TEST".
- `script.js:4984`.
- `supabase.js:10–12`: logs the client object.

**Failure scenario.** A maintainer, or an agent, goes looking for a client-side save that `219ddb7` removed.

**Resolved by.** C1.

### F16. "Test Exam: 2 Questions · System Test" is offered to every trainee. Low, exam, verify intent.
**Where.** `script.js:3543–3559`, `4086–4092`.

**Failure scenario.** Trainees take the two-question system test. If the server records it like any other exam type, the results feed their analytics.

**Resolved by.** C2: the catalog decides which exam types each Plant offers, and to whom.

### F17. Section grouping throws when the first question has no section. Medium, question bank, confirmed.
**Where.** `script.js:2992–3005` and `3234–3247`. `sections[currentSection].push(q)` runs unconditionally, but `sections[""]` is never created.

**Failure scenario.** If the question-bank function returns a question with an empty `section` before any sectioned one, a `TypeError` is thrown. The MTBE or Metathesis bank page never renders.

**Resolved by.** C4.

### F18. Every section toggle refetches the whole bank. Medium, question bank, confirmed.
**Where.** `script.js:2898–2915` re-runs `showMTBE`, `showMeta` or `showSafety`, which await the fetch again at 2927, 3161 and 3577.

**Failure scenario.** Each collapse or expand is a round-trip to the Edge Function. On a slow plant network, the page stalls on every click.

**Resolved by.** C4.

### F19. Merge bank makes serial fetches, swallows errors, and duplicates its composition. Low, question bank, confirmed.
**Where.** `script.js:2837–2882`.

**Failure scenario.**
- If the METATHESIS leg fails, the bank silently shows fewer questions and logs nothing.
- Latency is the sum of three calls.
- If `start-exam` changes what MERGE contains, the bank and the exam disagree.

**Resolved by.** C4 and C2.

### F20. The Metathesis role picker leaves a `<div>` unclosed. Low, Plant views, confirmed.
**Where.** `script.js:2119–2263` opens 17 and closes 16, while the MTBE and Merge copies are balanced.

**Failure scenario.** Browsers auto-close it, but this is drift between copies that should be identical.

**Resolved by.** C2.

### F21. The "Improvement" KPI is best minus average, and the `"EMPTY"` placeholder is filtered in one place only. Low, analytics, confirmed.
**Where.** `script.js:443–450`, `505`.

**Failure scenario.** A trainee who improves steadily sees an "Improvement" figure that measures spread, not change over time. `"EMPTY"` rows are excluded from the per-Plant counts but still counted in totals and averages.

**Resolved by.** C5.

### F22. The server side of every seam is unversioned. Medium, infrastructure, confirmed.
**Where.** Five Edge Functions are called from the client but aren't in the repo: `question-bank`, `start-exam`, `exam-answer`, `next-question` and `admin-users-analytics`. Neither are the RLS policies.

**Failure scenario.** None of the protocols can be read, diffed, reviewed or tested next to the client. F5 can't be settled from the repo.

**Resolved by.** Versioning `supabase/functions` and `supabase/migrations` alongside the client. This underpins C1, C3, C4 and C6.

## Top recommendation

**C1: Deepen the Exam session.** It is the hottest code: `checkAnswer`, `nextQuestion`, `showQuestion` and `finishExam` changed by +1,815/−664 on 2026-09-17, the same day result saving moved to the server. Its Edge Function protocol is already a clean seam that justifies two adapters. The ES module and `node:test` setup it introduces is the pattern C3 and C4 will reuse.

Independently of any refactor: act on the privately reported F1–F3.

## Issues

Filed 2026-09-23 on `Almehwari/Operations-Training-Platform`. The whole batch is #5–#30.

- Candidates: C1 #5, C2 #6, C3 #7, C4 #8, C5 #9, C6 #10, C7 #11.
- Findings: F4 #12, F5 #13, F6 #14, F7 #15, F8 #16, F9 #17, F10 #18, F11 #19, F12 #20, F13 #21, F14 #22, F15 #23, F16 #24, F17 #25, F18 #26, F19 #27, F20 #28, F21 #29, F22 #30.
- F1–F3: reported to the maintainer privately, not filed.
