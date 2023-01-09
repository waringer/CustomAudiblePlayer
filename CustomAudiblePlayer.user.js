// ==UserScript==
// @name         Audible Custom WebPlayer
// @namespace    https://github.com/waringer/CustomAudiblePlayer/raw/main/CustomAudiblePlayer.user.js
// @version      2023.01.09.02
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

#audio-control-outer-div {
  width: 100%;
  padding: 0.5rem 1.5rem 0 1.5rem;
}

#audio-progress {
  background-color: #f7991c;
  width: 100%;
  height: 2px;
  position: absolute;
  pointer-events: none;
}

#audio-slider {
  width: 100%;
}

#volume-icon {
  float: left;
  padding-right: 1rem;
  padding-top: 0.5rem;
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

const addVolumeControl = () => {
    var audioContainer = document.getElementById("adbl-cloud-player-container");

    audioContainer.innerHTML += '<div id="audio-control-outer-div"><div id="volume-icon"><svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path fill="#888" d="m4 6v8l5.2 3.9c.3.3.8 0 .8-.5v-14.8c0-.5-.5-.8-.8-.5zm0 8h-3a1 1 0 0 1 -1-1v-6a1 1 0 0 1 1-1h3m0 0"/><path fill="#888" d="m16.4 17.4a1 1 0 0 1 -.7-1.7 8 8 0 0 0 0-11.4 1 1 0 0 1 1.3-1.3 10 10 0 0 1 0 14.2 1 1 0 0 1 -.7.3z"/><path fill="#888" d="m13.5 14.5a1 1 0 0 1 -.7-.3 1 1 0 0 1 0-1.4 4 4 0 0 0 0-5.6 1 1 0 0 1 1.4-1.4 6 6 0 0 1 0 8.4 1 1 0 0 1 -.7.3z"/></svg></div><div id="slider-and-progress" class="bc-range"><div id="audio-progress"></div><input id="audio-slider" type="range" min="0" max="100" value="100"></div></div>';

    var audioSlider = document.getElementById("audio-slider");
    var audioProgress = document.getElementById("audio-progress");

    // Weird hack for Chromium based browsers - the alignment is not the same
    if (!!window.chrome) {
        document.getElementById("slider-and-progress").style.paddingTop = "0.55rem"
    }

    audioSlider.value = localStorage.getItem("ACWP-Volume");
    audioProgress.style.width = `${audioSlider.value}%`;
    document.getElementsByTagName("audio")[0].volume = audioSlider.value / 100;

    audioSlider.oninput = (event) => {
        audioProgress.style.width = `${event.target.value}%`;
        document.getElementsByTagName("audio")[0].volume = event.target.value / 100;
        localStorage.setItem("ACWP-Volume", event.target.value);
    }

}

const main = () => {
    if (localStorage.getItem("ACWP-Volume") === null) localStorage.setItem("ACWP-Volume", 100);
    injectStylesheet();
    addVolumeControl();
}

main();
