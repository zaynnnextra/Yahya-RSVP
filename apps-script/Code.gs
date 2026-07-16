/**
 * Yahya's 1st Birthday — RSVP collector
 *
 * Receives RSVP form submissions from the invitation website, appends each
 * one to the "RSVPs" sheet of the spreadsheet this script is attached to,
 * and emails a notification for every response.
 *
 * Setup instructions: see SETUP.md in the website repository.
 */

var NOTIFY_EMAIL = "zaynnnextra@gmail.com";

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var name = String(p.name || "").slice(0, 200);
    var attending = String(p.attending || "").slice(0, 50);
    var adults = String(p.adults || "0").slice(0, 4);
    var kids = String(p.kids || "0").slice(0, 4);
    var message = String(p.message || "").slice(0, 1000);

    if (!name) throw new Error("Missing name");

    // 1) Save to the spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("RSVPs") || ss.insertSheet("RSVPs");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Attending", "Adults", "Kids", "Message"]);
      sheet.getRange("A1:F1").setFontWeight("bold");
    }
    sheet.appendRow([new Date(), name, attending, adults, kids, message]);

    // 2) Email notification
    var accepting = attending.indexOf("Accept") !== -1;
    var subject = (accepting ? "🎉 RSVP YES: " : "😔 RSVP No: ") + name +
      (accepting ? " (" + adults + " adults, " + kids + " kids)" : "");
    var body =
      "New RSVP for Yahya's 1st Birthday!\n\n" +
      "Name: " + name + "\n" +
      "Attending: " + attending + "\n" +
      "Adults: " + adults + "\n" +
      "Kids: " + kids + "\n" +
      (message ? "Message: " + message + "\n" : "") +
      "\nFull guest list: " + ss.getUrl();
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message || err) });
  }
}

// Handy for a browser sanity check: visiting the web app URL shows this.
function doGet() {
  return jsonResponse({ ok: true, service: "Yahya RSVP collector is running 👑" });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
