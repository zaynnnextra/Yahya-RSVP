# 👑 Yahya's 1st Birthday — Setup Guide

Your animated invitation website is ready. Three short setup steps make it fully live:

1. [Turn on RSVP collection](#step-1--turn-on-rsvp-collection-5-minutes) (~5 min, one time)
2. [Publish the website](#step-2--publish-the-website-github-pages) (~2 min)
3. [Add your Canva video](#step-3--add-your-canva-video) (optional but recommended)

---

## Step 1 — Turn on RSVP collection (~5 minutes)

Every RSVP will be saved to a private Google Sheet **and** emailed to you at
**zaynnnextra@gmail.com**.

1. Go to [sheets.new](https://sheets.new) (signed in as zaynnnextra@gmail.com) and
   name the spreadsheet something like **"Yahya RSVP List"**.
2. In the menu, click **Extensions → Apps Script**.
3. Delete the sample code in the editor, then copy **all** of
   [`apps-script/Code.gs`](apps-script/Code.gs) from this repo and paste it in.
4. Click **Deploy → New deployment**.
5. Click the ⚙️ gear next to "Select type" and choose **Web app**.
6. Set:
   - **Description:** `Yahya RSVP`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`  ← important, this is what lets guests submit
7. Click **Deploy**, approve the permissions prompt
   (Advanced → Go to project → Allow — it's your own script, this is normal),
   and **copy the Web app URL** (it ends in `/exec`).
8. Open [`js/config.js`](js/config.js) in this repo and paste the URL:

   ```js
   RSVP_ENDPOINT: "https://script.google.com/macros/s/XXXXX/exec",
   ```

   (You can edit the file directly on GitHub: open it, click the ✏️ pencil, paste, commit.)

**Test it:** open the Web app URL in your browser — you should see
`{"ok":true,"service":"Yahya RSVP collector is running 👑"}`. Then submit a test
RSVP on the website; it should appear in the sheet and in your inbox within seconds.

> Guests never see the spreadsheet — it stays private to your Google account.

---

## Step 2 — Publish the website (GitHub Pages)

Everything is already on `main` with a deploy workflow — only one switch needs
flipping (GitHub requires the repo owner to do this, it can't be automated):

1. On GitHub, open the repo → **Settings → Pages**.
2. Under **Build and deployment / Source**, choose **GitHub Actions**.
3. That's it — the "Deploy invitation site to GitHub Pages" workflow publishes
   the site (re-run it from the Actions tab if it doesn't start on its own).
   After a minute the site is live at:

   **https://zaynnnextra.github.io/Yahya-RSVP/**

That's the link you send to everyone. 🎉

---

## Step 3 — Add your Canva video

1. In Canva: **Share → Download → MP4 Video** (720p or 1080p is plenty —
   the file must stay **under 100 MB** for GitHub).
2. Rename the file to exactly: `yahya-invite.mp4`
3. Upload it to the `assets/` folder of this repo
   (on GitHub: open `assets/` → **Add file → Upload files**).

The "The Royal Invitation" video section appears automatically once the file
exists — until then the section hides itself.

> **If the file is over 100 MB:** re-export at 720p, or upload the video to
> YouTube as *Unlisted* and ask Claude to swap the video section to a YouTube
> embed.

### Bonus: use your Canva artwork on the site

The site currently uses hand-coded royal artwork (crown, balloons, castle).
Once the MP4 is in the repo, Claude can extract still frames from it and swap
in your actual Canva artwork (prince, lion, dragon, castle scene) — just ask.

---

## Sharing tips

- Send the link by WhatsApp / iMessage / text — the preview shows a royal
  card automatically (after `assets/og-preview.png` exists at the live URL).
- You can also attach the Canva MP4 alongside the link in the same message —
  video for the wow, link for the RSVP.
- Track responses anytime in your **Yahya RSVP List** Google Sheet; every
  response also lands in your email.

## Changing party details

All text lives in [`index.html`](index.html) (date, time, venue, wording), and
the calendar/countdown data lives in [`js/config.js`](js/config.js).
