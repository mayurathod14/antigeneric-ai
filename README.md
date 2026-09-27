# AntiGeneric AI — Setup & Deployment Guide (Simple Steps)

Yeh guide tumhe A to Z le jayega — VS Code se lekar live deployed link tak.
Har step follow karo order mein, skip mat karna.

---

## PART 0: Cheezein jo tumhe chahiye (pehle bana lo)

1. **Anthropic API key** — https://console.anthropic.com par account banao, "API Keys" section se ek key generate karo. (Free credits milte hain naye account pe, warna thoda paisa dalna padega)
2. **GitHub account** — https://github.com (agar nahi hai to bana lo, free hai)
3. **Render account** — https://render.com (backend deploy karne ke liye, free hai) — GitHub se signup kar sakte ho
4. **Vercel account** — https://vercel.com (frontend deploy karne ke liye, free hai) — GitHub se signup kar sakte ho
5. **Node.js installed** on your laptop — https://nodejs.org (LTS version download karo agar pehle se nahi hai)

---

## PART 1: Local mein test karna (VS Code mein)

1. Yeh poora folder (`antigeneric`) VS Code mein open karo (File → Open Folder)

2. VS Code ka terminal kholo (Terminal → New Terminal) aur yeh chalao:
   ```
   cd server
   npm install
   ```
   Isse saare dependencies install ho jayenge.

3. `.env.example` file ka naam change karke `.env` kar do, aur usme apni real API key daalo:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   PORT=3000
   ```

4. Server chalao:
   ```
   node server.js
   ```
   Agar "Server running on port 3000" dikhe to sahi chal raha hai.

5. Ab `client/index.html` file ko browser mein directly open karo (right-click → Open with Browser, ya double-click).

6. Idea box mein kuch likho (jaise "an app for students to find project teammates") aur "Run" button dabao.

7. Agar sab kaam kare (thoda time lagega, ~15-30 sec) to matlab local pe sab sahi hai! Ab deploy karte hain.

**Agar error aaye:** Terminal mein jo error dikhe wo copy karke mujhe bhejo, main fix kar dunga.

---

## PART 2: GitHub par code daalna

1. GitHub par jaake ek naya repository banao (naam do jaise `antigeneric-ai`), **Public** rakhna (form mein public link maangi hai)

2. VS Code terminal mein (project ke root folder mein, `antigeneric` folder ke andar):
   ```
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/antigeneric-ai.git
   git push -u origin main
   ```
   (YOUR_USERNAME apna GitHub username daalna)

3. **IMPORTANT:** `.env` file kabhi bhi GitHub pe push mat karna (usme API key hai). Main niche ek `.gitignore` file bhi de raha hoon jo isse automatically skip kar degi.

---

## PART 3: Backend Deploy karna (Render par)

1. https://render.com par login karo, "New +" → "Web Service" click karo

2. Apna GitHub repo connect karo (antigeneric-ai)

3. Settings yeh set karo:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

4. "Environment Variables" section mein add karo:
   - Key: `ANTHROPIC_API_KEY`
   - Value: (apni real API key paste karo)

5. "Create Web Service" click karo. 2-5 minute lagega deploy hone mein.

6. Deploy hone ke baad, upar ek URL milega jaisa: `https://antigeneric-ai.onrender.com`
   **Yeh URL copy kar lo — isse tumhe frontend mein daalna hai.**

---

## PART 4: Frontend ko backend se connect karna

1. VS Code mein `client/index.html` file kholo

2. Yeh line dhundo:
   ```javascript
   const BACKEND_URL = "http://localhost:3000";
   ```

3. Isko apne Render URL se replace karo:
   ```javascript
   const BACKEND_URL = "https://antigeneric-ai.onrender.com";
   ```

4. Save karo, aur GitHub pe wapas push karo:
   ```
   git add .
   git commit -m "connect frontend to deployed backend"
   git push
   ```

---

## PART 5: Frontend Deploy karna (Vercel par)

1. https://vercel.com par login karo, "Add New" → "Project"

2. Apna GitHub repo import karo

3. Settings mein:
   - **Root Directory:** `client`
   - Baaki sab default rehne do (Framework: "Other")

4. "Deploy" click karo. 1-2 minute mein ho jayega.

5. Tumhe ek live URL milega jaisa: `https://antigeneric-ai.vercel.app`
   **Yeh hai tumhara "Live deployed product link" — form mein yeh daalna hai!**

---

## PART 6: Final Testing

1. Apna live Vercel link browser mein kholo
2. Ek idea daal ke test karo
3. Agar Render ka free plan hai to backend "sleep" ho jata hai kuch der na use hone par — pehli baar thoda slow (30-60 sec) lag sakta hai wake up hone mein. Yeh normal hai, judges ko bata dena demo video mein.

---

## Form mein kya daalna hai

- **Q16 GitHub link:** `https://github.com/YOUR_USERNAME/antigeneric-ai`
- **Q17 Live product link:** `https://antigeneric-ai.vercel.app` (apna Vercel URL)

---

## Agar kahin bhi atak jao

Jo bhi error message aaye, wo exact copy-paste karke mujhe bhej dena — main turant fix bata dunga. Pehli baar deploy karna thoda confusing lagta hai but ek baar ho jaye to easy hai.
