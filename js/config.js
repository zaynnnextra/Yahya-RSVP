// ─── Site configuration ───────────────────────────────────────────────
// RSVP_ENDPOINT: paste your Google Apps Script Web App URL between the
// quotes (see SETUP.md, Step 1). Until it's set, the RSVP form shows a
// "coming soon" note instead of submitting.
window.YAHYA_CONFIG = {
  RSVP_ENDPOINT: "https://script.google.com/macros/s/AKfycbyIi7YqeAuKYy0i5nAkUJYjlfm1GPPSPdmJDF5xupv0YERIDBD37IbWhcW6h6GROY9j6Q/exec",

  // Public site URL (used by the Share button).
  SITE_URL: "https://yahyasroyalbirthday.com/",

  // Event details used for the Add to Calendar button.
  EVENT: {
    title: "Yahya's 1st Birthday 👑 A Royal Celebration",
    // Floating local times (guests' calendars treat these as Houston time
    // when they're in Houston — which is where the party is).
    start: "20260829T190000",
    end: "20260829T220000",
    location: "Tempura Grill, 5901 Hillcroft St B6, Houston, TX",
    description: "The Royals are gathering to celebrate Yahya's 1st Birthday! Dress code: Royal Elegance (formal attire). RSVP: https://yahyasroyalbirthday.com/",
    // Party date used for the countdown.
    dateISO: "2026-08-29T19:00:00-05:00",
  },
};
