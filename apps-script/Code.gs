/**
 * Yahya's 1st Birthday — RSVP collector (v2)
 *
 * - Saves each RSVP to a formatted "RSVPs" dashboard sheet
 * - Emails you (the host) a notification for every response
 * - Emails the GUEST a royal-themed confirmation (if they gave an email)
 * - Keeps a live "Summary" tab with head-counts
 * - Serves approved guest wishes to the website's Wishes wall (doGet)
 *
 * Setup / re-deploy instructions: see SETUP.md in the website repo.
 * IMPORTANT: after pasting this, Deploy → Manage deployments → edit (pencil)
 *            → Version: New version → Deploy, so the new code goes live.
 */

var NOTIFY_EMAIL = "zaynnnextra@gmail.com";
var SITE_URL     = "https://yahyasbirthday.online/";
var SHEET_NAME   = "RSVPs";
var HEADERS      = ["Timestamp", "Name", "Email", "Attending", "Adults", "Kids", "Message", "Approved"];

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var name = clean(p.name, 200);
    if (!name) throw new Error("Missing name");
    var email     = clean(p.email, 120);
    var attending = clean(p.attending, 50);
    var adults    = clean(p.adults, 4);
    var kids      = clean(p.kids, 4);
    var message   = clean(p.message, 1000);

    var sheet = getSheet();
    sheet.appendRow([new Date(), name, email, attending, adults, kids, message, false]);
    formatSheet(sheet);
    updateSummary();

    var accepting = attending.indexOf("Accept") !== -1;

    // 1) Notify the host
    var subject = (accepting ? "🎉 RSVP YES: " : "😔 RSVP No: ") + name +
      (accepting ? " (" + adults + " adults, " + kids + " kids)" : "");
    MailApp.sendEmail(NOTIFY_EMAIL, subject, hostBody(name, email, attending, adults, kids, message));

    // 2) Themed confirmation to the guest
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      MailApp.sendEmail({
        to: email,
        subject: "👑 Your Royal RSVP is confirmed — Yahya's 1st Birthday",
        htmlBody: guestHtml(name, accepting),
        name: "Yahya's Royal Celebration"
      });
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.wishes) return json({ ok: true, wishes: getApprovedWishes() });
  return json({ ok: true, service: "Yahya RSVP collector is running 👑" });
}

/* ─────────── Sheet helpers ─────────── */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function formatSheet(sheet) {
  // Header styling
  var head = sheet.getRange(1, 1, 1, HEADERS.length);
  head.setValues([HEADERS])
      .setBackground("#1e3a8a").setFontColor("#f3e3b3")
      .setFontWeight("bold").setFontFamily("Georgia")
      .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 150); sheet.setColumnWidth(2, 190); sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 160); sheet.setColumnWidth(5, 70);  sheet.setColumnWidth(6, 70);
  sheet.setColumnWidth(7, 320); sheet.setColumnWidth(8, 90);

  var lastRow = Math.max(sheet.getLastRow(), 2);

  // Checkboxes on Approved column
  sheet.getRange(2, 8, lastRow - 1, 1).insertCheckboxes();

  // Conditional formatting: green for accepts, red for declines (whole row A:H)
  var range = sheet.getRange(2, 1, lastRow - 1, HEADERS.length);
  var accept = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D2="Joyfully Accepts"').setBackground("#e6f4ea").setRanges([range]).build();
  var decline = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D2="Regretfully Declines"').setBackground("#fbe9e7").setRanges([range]).build();
  sheet.setConditionalFormatRules([accept, decline]);
}

function updateSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName("Summary") || ss.insertSheet("Summary", 0);
  s.clear();
  s.getRange("A1").setValue("👑 Yahya's 1st Birthday — RSVP Summary")
    .setFontSize(16).setFontWeight("bold").setFontColor("#1e3a8a").setFontFamily("Georgia");
  var rows = [
    ["Parties responded", '=MAX(0,COUNTA(RSVPs!B2:B))'],
    ["Joyfully accepting", '=COUNTIF(RSVPs!D2:D,"Joyfully Accepts")'],
    ["Regretfully declining", '=COUNTIF(RSVPs!D2:D,"Regretfully Declines")'],
    ["Adults coming", '=SUMIF(RSVPs!D2:D,"Joyfully Accepts",RSVPs!E2:E)'],
    ["Kids coming", '=SUMIF(RSVPs!D2:D,"Joyfully Accepts",RSVPs!F2:F)'],
    ["Total guests coming", '=SUMIF(RSVPs!D2:D,"Joyfully Accepts",RSVPs!E2:E)+SUMIF(RSVPs!D2:D,"Joyfully Accepts",RSVPs!F2:F)'],
  ];
  s.getRange(3, 1, rows.length, 2).setValues(rows);
  s.getRange(3, 1, rows.length, 1).setFontWeight("bold").setFontColor("#34342f");
  s.getRange(3, 2, rows.length, 1).setFontColor("#a07f1f").setFontWeight("bold").setHorizontalAlignment("center");
  s.setColumnWidth(1, 220); s.setColumnWidth(2, 120);
}

function getApprovedWishes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
  var out = [];
  for (var i = data.length - 1; i >= 0; i--) {   // newest first
    var r = data[i];
    var name = String(r[1] || ""), message = String(r[6] || ""), approved = r[7];
    if (message && (approved === true || approved === "TRUE")) out.push({ name: name, message: message });
    if (out.length >= 60) break;
  }
  return out;
}

/* ─────────── Email bodies ─────────── */
function hostBody(name, email, attending, adults, kids, message) {
  return "New RSVP for Yahya's 1st Birthday!\n\n" +
    "Name: " + name + "\n" +
    (email ? "Email: " + email + "\n" : "") +
    "Attending: " + attending + "\n" +
    "Adults: " + adults + "\n" +
    "Kids: " + kids + "\n" +
    (message ? "Wish: " + message + "\n" : "") +
    "\nGuest list: " + SpreadsheetApp.getActiveSpreadsheet().getUrl();
}

function guestHtml(name, accepting) {
  var gcal = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent("Yahya's 1st Birthday 👑") +
    "&dates=20260829T190000/20260829T220000" +
    "&location=" + encodeURIComponent("Tempura Grill, 5901 Hillcroft St B6, Houston, TX") +
    "&details=" + encodeURIComponent("A Royal Celebration. Dress code: Royal Elegance. " + SITE_URL);
  var lead = accepting
    ? "By royal decree, your presence is joyfully confirmed. We can't wait to celebrate with you!"
    : "Thank you for letting us know. You'll be dearly missed at the celebration.";
  // Table-based + explicit bgcolor + color-scheme meta so email dark modes
  // don't invert the navy/cream palette into murky purple/brown.
  return '' +
  '<!DOCTYPE html><html><head><meta charset="utf-8">' +
  '<meta name="color-scheme" content="light">' +
  '<meta name="supported-color-schemes" content="light">' +
  '<style>:root{color-scheme:light only;supported-color-schemes:light only;}</style></head>' +
  '<body style="margin:0;padding:0;background-color:#ece7db;">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ece7db" style="background-color:#ece7db;">' +
    '<tr><td align="center" style="padding:24px 12px;">' +
      '<table role="presentation" width="520" cellpadding="0" cellspacing="0" bgcolor="#fffdf8" style="width:100%;max-width:520px;background-color:#fffdf8;border:2px solid #e8c96a;border-radius:16px;overflow:hidden;font-family:Georgia,\'Times New Roman\',serif;">' +
        '<tr><td align="center" bgcolor="#1e3a8a" style="background-color:#1e3a8a;padding:26px 20px;">' +
          '<div style="font-size:40px;line-height:1;">&#128081;</div>' +
          '<div style="color:#f3e3b3;font-size:22px;letter-spacing:3px;text-transform:uppercase;margin-top:8px;">Royal Decree</div>' +
        '</td></tr>' +
        '<tr><td align="center" bgcolor="#fffdf8" style="background-color:#fffdf8;padding:28px 26px;color:#34342f;">' +
          '<p style="font-size:20px;margin:0 0 6px;color:#34342f;">Dear <strong>' + escapeHtml(name) + '</strong>,</p>' +
          '<p style="font-size:17px;line-height:1.6;margin:0;color:#454540;">' + lead + '</p>' +
          '<div style="height:1px;line-height:1px;font-size:0;background-color:#e8c96a;margin:22px auto;width:78%;">&nbsp;</div>' +
          '<p style="font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#a07f1f;margin:0;">Yahya\'s 1st Birthday</p>' +
          '<p style="font-size:18px;margin:8px 0 2px;color:#34342f;"><strong>Saturday, August 29 &middot; 7&ndash;10 PM</strong></p>' +
          '<p style="font-size:16px;margin:0;color:#454540;">Tempura Grill &middot; 5901 Hillcroft St B6 &middot; Houston</p>' +
          '<p style="font-size:14px;margin:10px 0 0;color:#6b6a63;">Dress code: Royal Elegance (formal attire)</p>' +
          '<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:22px auto 0;">' +
            '<tr><td align="center" bgcolor="#1e3a8a" style="background-color:#1e3a8a;border-radius:999px;">' +
              '<a href="' + gcal + '" style="display:inline-block;color:#fffdf6;text-decoration:none;padding:12px 24px;font-size:15px;border:1px solid #e8c96a;border-radius:999px;">&#128197; Add to Calendar</a>' +
            '</td></tr><tr><td height="10" style="line-height:10px;font-size:0;">&nbsp;</td></tr>' +
            '<tr><td align="center" bgcolor="#fffdf8" style="background-color:#fffdf8;border-radius:999px;">' +
              '<a href="' + SITE_URL + '" style="display:inline-block;color:#1e3a8a;text-decoration:none;padding:12px 24px;font-size:15px;border:1px solid #1e3a8a;border-radius:999px;">View Invitation</a>' +
            '</td></tr>' +
          '</table>' +
          '<p style="margin-top:26px;font-size:15px;color:#6b6a63;">With love,<br>The Royal Family &#9825;</p>' +
        '</td></tr></table>' +
        '<p style="margin:14px 0 0;font-size:11px;letter-spacing:1px;color:#9a988f;">Invitation designed by Zain Ali &middot; <a href="https://instagram.com/zaynnnali" style="color:#9a988f;text-decoration:underline;">@zaynnnali</a></p>' +
    '</td></tr>' +
  '</table></body></html>';
}

/* ─────────── utils ─────────── */
function clean(v, n) { return String(v == null ? "" : v).slice(0, n).trim(); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) {
  return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
}); }
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
