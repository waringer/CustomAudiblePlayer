// ==UserScript==
// @name         Audible Custom WebPlayer
// @namespace    https://github.com/waringer/CustomAudiblePlayer/raw/main/CustomAudiblePlayer.user.js
// @version      2023.01.09.01
// @description  Audible Custom WebPlayer
// @author       waringer
// @license      BSD
// @run-at       document-end
// @match        https://www.audible.de/webplayer*
// @grant        GM_addStyle
// ==/UserScript==

const stylesheet = `
body, html {
    color: #888;
    background-color: #333;
}

.bc-color-background-base {
  background-color: #333;
}

.bc-color-secondary {
  color: rgba(136,136,136,.65);
}

.bc-color-base {
  color: #888;
}
`;

const injectStylesheet = () => {
    if (typeof GM_addStyle != "undefined") {
        GM_addStyle(stylesheet);
    } else if (typeof addStyle != "undefined") {
        addStyle(stylesheet);
    } else {
        const stylesheetEl = document.createElement("style");
        stylesheetEl.innerHTML = stylesheet;
        document.body.appendChild(stylesheetEl);
    }
}

const main = () => {
    injectStylesheet();
}

main();
