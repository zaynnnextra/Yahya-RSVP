# 👑 Yahya's Royal Invitation — Setup Guide

Your animated invitation is live at **https://zaynnnextra.github.io/Yahya-RSVP/**.
This guide covers the remaining pieces:

1. [Update the RSVP backend](#step-1--update-the-rsvp-backend) — enables guest confirmation emails, the formatted dashboard, and the wishes wall (**~3 min, required after this update**)
2. [The guest wishes wall](#step-2--the-guest-wishes-wall) — how to approve messages
3. [Connect your custom domain](#step-3--connect-yahyasbirthdayonline) — yahyasbirthday.online
4. [Sharing tips](#sharing-tips)

---

## Step 1 — Update the RSVP backend

The website now collects an **email** (for confirmations) and shows a **wishes wall**,
so the Apps Script needs the new code. This re-uses your existing deployment — the
RSVP link in `js/config.js` stays the same.

1. Open your **Yahya RSVP List** Google Sheet → **Extensions → Apps Script**.
2. Select all the old code, delete it, and paste in the full contents of
   [`apps-script/Code.gs`](apps-script/Code.gs) from this repo. Save (💾).
3. **Deploy → Manage deployments** → click the ✏️ pencil on your existing deployment →
   **Version: New version** → **Deploy**. (This is the important part — it pushes the new
   code live without changing your URL.)

That's it. From now on every RSVP will:
- **Save to a formatted dashboard** — gold header, green rows for "Joyfully Accepts,"
  red for "Regretfully Declines," plus a **Summary tab** with live head-counts (adults,
  kids, totals).
- **Email you** a notification (as before).
- **Email the guest** a royal-themed "Royal Decree" confirmation with the event details
  and an Add-to-Calendar button — *if they entered their email* (the field is optional).

> Test it: submit a test RSVP with your own email → you should get the themed
> confirmation, and the row should appear formatted in the sheet. Delete the test row after.

---

## Step 2 — The guest wishes wall

When guests RSVP they can leave a **wish** for Yahya. To keep things safe, **nothing
appears on the website until you approve it.**

- Open the **RSVPs** sheet. There's an **Approved** column (checkboxes) at the end.
- Tick the box for any wish you want shown publicly on the site's "Royal Wishes" section.
- Untick to hide it again. Changes appear on the site within a minute (guests may need to refresh).

If no wishes are approved, the Wishes section simply stays hidden.

---

## Step 3 — Connect yahyasbirthday.online

This makes your link **https://yahyasbirthday.online** instead of the github.io address.

**A. Buy the domain (~$10/yr)**
- Go to [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) or
  [Namecheap](https://www.namecheap.com/) and buy **yahyasbirthday.online**
  (I checked the name for you; confirm it's available at checkout).

**B. Point DNS at GitHub Pages** — in your domain's DNS settings, add:
- Four `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- One `CNAME` record for `www` → `zaynnnextra.github.io`

**C. Tell GitHub about the domain**
- Repo → **Settings → Pages → Custom domain** → enter `yahyasbirthday.online` → **Save**.
- GitHub adds a `CNAME` file automatically and, once DNS propagates (minutes to a few
  hours), tick **Enforce HTTPS**.

**D. Update the site's URLs to the domain** (so share buttons, previews & the confirmation
email use the pretty link). Change these to `https://yahyasbirthday.online/`:
- `index.html` — the 3 URLs marked with the comment near the top (`og:url`, `og:image`, canonical)
- `js/config.js` — `SITE_URL` and the `description`
- `apps-script/Code.gs` — `SITE_URL` (then re-deploy a new version as in Step 1)

> Just tell me when the domain is bought and I'll make edits D for you and walk you
> through B and C live.

---

## Sharing tips

- The **Share** button (top nav, closing section, and after RSVP) opens the phone's share
  sheet or copies the link + a WhatsApp message.
- Sharing the link shows a royal preview card automatically (WhatsApp/iMessage).
- For the biggest "wow," also attach the Canva **MP4** in your first message alongside the
  link — video for the wow, link for the RSVP.

## Changing details
- Wording, date, venue: [`index.html`](index.html).
- Calendar/countdown/share data: [`js/config.js`](js/config.js).
- Everything auto-redeploys when changes land on the site.
