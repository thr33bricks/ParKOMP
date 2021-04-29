//check for cookies consent
function load() {
    if (localStorage.getItem("cookieConsent") != "consent") {
      document.getElementById("cookie-banner").style.display = "block";
    }
}

//close button click event
function close_click() {
    document.getElementById("cookie-banner").style.display = "none";
    localStorage.setItem("cookieConsent", "consent");
}