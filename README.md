# Lumi

A learning app for a TK (transitional kindergarten) kid — short words, patterns, counting and letter writing, wrapped in a reward loop that actually motivates a 4–5 year old.

Everything lives in **`index.html`**. No build step, no framework. Open the file and it runs.

---

## The six games

Each game is 6 rounds. Difficulty ramps inside the run (easier rounds first).

| Game | What it teaches |
|---|---|
| **Word Builder** | Hear a word, see a picture, tap letter tiles in order to spell it. Rounds 1–3 are 3-letter words, 4–6 are 4-letter words. Wrong tile = gentle shake, and it reads the sound he needs next. |
| **First Sound** | "Which one starts with **Bb**?" — three pictures, pick the one with that beginning letter. |
| **Read & Find** | Shows a written word, he picks the matching picture. A "sound it out" button spells it aloud letter by letter. |
| **Pattern Play** | What comes next? Starts with simple AB patterns and works up to AAB, ABB, ABC and AABB. |
| **Count It** | Mixes three skills: counting objects (laid out in rows of five), comparing *more / fewer*, and finding the missing number in a sequence. Covers 1–20. |
| **Letter Tracing** | Trace a big dotted letter with a finger. Scores by how much of the real letter shape he covered, so it accepts a wobbly 4-year-old line but rejects scribbling. Three uppercase and three lowercase per run. |

Every screen has a 🔊 button that re-reads the question aloud (Web Speech API, no network needed).

## The reward system

- **1 star** for every correct answer, **+2 bonus stars** for finishing a game.
- Stars drop into the **Star Jar** on the home screen. 10 stars fills it.
- A full jar **hatches a new Buddy** — an egg wiggles, cracks, and a named animal pops out with confetti. There are **16 buddies** to collect, in the **Buddy Club** tab.
- Each game also keeps a **best score of 1–3 stars** (3 stars = at most one mistake), shown on its card.

Nothing is ever locked or taken away — he can play any game in any order, and a wrong answer just costs a retry.

---

## Setting it up

### 1. Put his name in it
Open `index.html`, find this line near the top of the `<script>` (line 535):

```js
const KID_NAME = 'friend';      // shown on the home screen
```

Change `'friend'` to his name. That's the only thing you *need* to edit.

### 2. Try it locally
Just double-click `index.html`. Everything works except "Add to Home Screen" and offline mode, which need a real web address — that's step 3.

### 3. Put it on his tablet/phone (same way as Learning Quest)

1. Create a new GitHub repository and upload every file in this folder (drag and drop works — you don't need the `gh` CLI).
2. Go to [vercel.com](https://vercel.com), **Add New → Project**, import that repo.
3. Framework preset: **Other**. No build command, no output directory. Click **Deploy**.
4. Open the Vercel URL on his device in Safari/Chrome → **Share → Add to Home Screen**.

It now behaves like a real app: full screen, its own icon, and it works with no internet.

> **When you change the app later:** bump `CACHE = 'lumi-v1'` to `'lumi-v2'` (etc.) in `sw.js`, or devices will keep showing the old cached version.

### 4. (Optional) Cross-device sync — the "Family Code"

Skip this if he only uses one device. Progress always saves on the device itself.

If you want his stars and buddies shared between, say, an iPad and a phone:

1. Create a new project at [supabase.com](https://supabase.com) (free tier is fine). This should be its **own** project, separate from Learning Quest's.
2. In the Supabase dashboard open **SQL Editor**, paste the whole contents of `supabase.sql`, click **Run**.
3. Go to **Project Settings → API** and copy the **Project URL** and the **anon/publishable key**.
4. Paste them into the `CLOUD CONFIG` block near the top of the `<script>` in `index.html`:

   ```js
   const SUPABASE_URL      = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'sb_publishable_xxxxx';
   ```

5. Re-deploy. In the app, tap **☁️ → Create my Family Code**, then type that same code on the other device.

The anon key is designed to be public, so it's safe in the file. The `saves` table has row-level security on with no policies, so the key can't read anything directly — it can only call the two functions, and each one works on a single code at a time.

---

## Files

| File | |
|---|---|
| `index.html` | The entire app — markup, styles, all six games, sync. |
| `manifest.webmanifest` | Makes it installable as an app. |
| `sw.js` | Service worker, for offline use. Bump `CACHE` when you change things. |
| `supabase.sql` | Database setup, only for the optional Family Code sync. |
| `make-icons.js` | Regenerates the app icons (`node make-icons.js`). You won't normally need this. |
| `icon-*.png`, `apple-touch-icon.png` | The app icons. |

## Changing the content

All the content sits in plain lists near the top of the `<script>`, easy to edit:

- `WORDS` — the word/picture pairs. Add `{w:'duck', e:'🦆'}` style entries; 3- and 4-letter words are sorted automatically.
- `BUDDIES` — the 16 collectible characters and their names.
- `PAT_SETS` — the emoji sets used to build patterns.
- `COUNT_ICONS` — the objects he counts.
- `JAR_SIZE` — stars needed per buddy (10).
- `ROUNDS` — rounds per game (6).
