// ==UserScript==
// @name         Audible Custom WebPlayer
// @namespace    https://github.com/waringer/CustomAudiblePlayer/raw/main/CustomAudiblePlayer.user.js
// @version      2023.01.09.03
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

const replaceButtons = () => {
    // buffering
    document.querySelector("#adbl-cp-buffering").children[0].src="data:image/svg+xml;base64,"+
        btoa('<svg width="800px" height="800px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
             '  <g id="Layer_2" data-name="Layer 2">' +
             '    <g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g>' +
             '    <g id="icons_Q2" data-name="icons Q2"><path fill="#888" d="M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2ZM21,31a2,2,0,0,1-4,0V17a2,2,0,0,1,2-2,2.1,2.1,0,0,1,2,2Zm10,0a2,2,0,0,1-4,0V17a2,2,0,0,1,2-2,2.1,2.1,0,0,1,2,2Z"/></g>' +
             '  </g>' +
             '</svg>');

    // prev chapter
    document.querySelector(".adblPreviousChapter").src="data:image/svg+xml;base64,"+
        btoa('<svg width="800px" height="800px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
             '  <g id="Layer_2" data-name="Layer 2">' +
             '    <g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g>' +
             '    <g id="Q3_icons" data-name="Q3 icons">' +
             '      <g><path fill="#888" d="M24.8,24,35.4,13.4a1.9,1.9,0,0,0-.2-3,2.1,2.1,0,0,0-2.7.2l-11.9,12a1.9,1.9,0,0,0,0,2.8l11.9,12a2.1,2.1,0,0,0,2.7.2,1.9,1.9,0,0,0,.2-3Z"/>' +
             '	       <path fill="#888" d="M14,10a2,2,0,0,0-2,2V36a2,2,0,0,0,4,0V12A2,2,0,0,0,14,10Z"/></g>' +
             '    </g>' +
             '  </g>' +
             '</svg>');

    // fast rewind
    document.querySelector(".adblFastRewind").src="data:image/svg+xml;base64,"+
        btoa('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="150px" height="138px" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" xmlns:xlink="http://www.w3.org/1999/xlink">' +
             // '<g><path style="opacity:1" fill="#fdfdfd" d="M -0.5,-0.5 C 49.5,-0.5 99.5,-0.5 149.5,-0.5C 149.5,45.5 149.5,91.5 149.5,137.5C 99.5,137.5 49.5,137.5 -0.5,137.5C -0.5,91.5 -0.5,45.5 -0.5,-0.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#888" d="M 24.5,76.5 C 24.5,75.5 24.5,74.5 24.5,73.5C 25.8333,73.5 27.1667,73.5 28.5,73.5C 32.8683,101.03 49.0349,116.03 77,118.5C 108.676,114.488 124.343,96.4875 124,64.5C 118.661,38.6619 102.827,24.6619 76.5,22.5C 76.8747,25.3965 76.3747,28.0632 75,30.5C 68.7536,27.2938 62.5869,23.9605 56.5,20.5C 62.6076,16.1128 69.2743,12.7795 76.5,10.5C 76.5,12.8333 76.5,15.1667 76.5,17.5C 111.011,21.5078 128.511,40.8411 129,75.5C 121.574,110.232 100.074,125.732 64.5,122C 41.3732,115.377 28.0399,100.21 24.5,76.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#888" d="M 60.5,53.5 C 72.6108,52.5856 75.6108,57.2523 69.5,67.5C 73.7119,71.1381 74.5453,75.4715 72,80.5C 65.6872,84.9792 60.1872,84.1458 55.5,78C 56.1079,77.1301 56.9412,76.6301 58,76.5C 59.8526,78.1872 62.0193,79.1872 64.5,79.5C 69.1513,78.8074 70.6513,76.1407 69,71.5C 67.2111,69.771 65.0444,69.1043 62.5,69.5C 62.5,68.5 62.5,67.5 62.5,66.5C 67.8631,66.3119 70.0297,63.6452 69,58.5C 68.044,57.1059 66.7106,56.4393 65,56.5C 62.1649,57.4326 59.6649,58.5993 57.5,60C 57.0426,59.586 56.7093,59.086 56.5,58.5C 57.8569,56.8144 59.1902,55.1477 60.5,53.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#888" d="M 83.5,53.5 C 89.9608,51.8181 94.1275,54.1514 96,60.5C 96.8608,66.5851 96.5275,72.5851 95,78.5C 87.9608,85.7599 82.2942,84.7599 78,75.5C 76.9193,68.9456 77.586,62.6123 80,56.5C 81.1451,55.3636 82.3117,54.3636 83.5,53.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#333" d="M 85.5,56.5 C 87.4835,56.3832 89.1502,57.0499 90.5,58.5C 92.9911,64.7379 93.1577,71.0712 91,77.5C 88.3333,80.1667 85.6667,80.1667 83,77.5C 81.5615,72.2375 81.2282,66.9042 82,61.5C 82.6972,59.4156 83.8639,57.7489 85.5,56.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#888" d="M 28.5,73.5 C 27.1667,73.5 25.8333,73.5 24.5,73.5C 24.5,74.5 24.5,75.5 24.5,76.5C 23.5655,75.4324 23.2322,74.099 23.5,72.5C 25.4147,72.2155 27.0813,72.5489 28.5,73.5 Z"/></g>' +
             '</svg>');

    // play
    document.querySelector(".adblPlayButton").src="data:image/svg+xml;base64,"+
        btoa('<svg width="800px" height="800px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
             '  <g id="Layer_2" data-name="Layer 2">' +
             '    <g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g>' +
             '    <g id="icons_Q2" data-name="icons Q2"><path fill="#888" d="M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2ZM34.6,24.7,18.1,34.8c-.6.4-1.1.1-1.1-.6V13.8c0-.7.5-1,1.1-.6L34.6,23.3A.8.8,0,0,1,34.6,24.7Z"/></g>' +
             '</g>' +
             '</svg>');

    // pause
    document.querySelector(".adblPauseButton").src="data:image/svg+xml;base64,"+
        btoa('<svg width="800px" height="800px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
             '  <g id="Layer_2" data-name="Layer 2">' +
             '    <g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g>' +
             '    <g id="icons_Q2" data-name="icons Q2"><path fill="#888" d="M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2ZM21,31a2,2,0,0,1-4,0V17a2,2,0,0,1,2-2,2.1,2.1,0,0,1,2,2Zm10,0a2,2,0,0,1-4,0V17a2,2,0,0,1,2-2,2.1,2.1,0,0,1,2,2Z"/></g>' +
             '  </g>' +
             '</svg>');

    // fast forward
    document.querySelector(".adblFastForward").src="data:image/svg+xml;base64,"+
        btoa('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="156px" height="150px" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" xmlns:xlink="http://www.w3.org/1999/xlink">' +
             // '<g><path style="opacity:1" fill="#fdfdfd" d="M -0.5,-0.5 C 51.5,-0.5 103.5,-0.5 155.5,-0.5C 155.5,49.5 155.5,99.5 155.5,149.5C 103.5,149.5 51.5,149.5 -0.5,149.5C -0.5,99.5 -0.5,49.5 -0.5,-0.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#888" d="M 129.5,77.5 C 130.833,77.5 132.167,77.5 133.5,77.5C 133.5,79.1667 133.5,80.8333 133.5,82.5C 127.281,110.546 109.781,125.546 81,127.5C 62.2911,126.149 47.6244,117.816 37,102.5C 22.7447,74.6508 27.578,50.8175 51.5,31C 60.5056,24.7476 70.5056,21.5809 81.5,21.5C 81.5,19.1667 81.5,16.8333 81.5,14.5C 88.7257,16.7795 95.3924,20.1128 101.5,24.5C 95.048,28.3927 88.3813,31.726 81.5,34.5C 81.5,31.8333 81.5,29.1667 81.5,26.5C 47.8552,30.6485 32.3552,49.6485 35,83.5C 41.2167,107.788 56.8834,120.788 82,122.5C 109.448,119.548 125.281,104.548 129.5,77.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#888" d="M 65.5,57.5 C 72.3887,55.9352 76.722,58.4352 78.5,65C 77.8218,67.5239 76.4885,69.6905 74.5,71.5C 79.3972,75.9654 79.7305,80.7987 75.5,86C 70.3221,88.5545 65.8221,87.7211 62,83.5C 61.6554,81.7991 62.3221,80.4658 64,79.5C 66.5488,83.9255 69.8821,84.5921 74,81.5C 75.6659,75.6687 73.4992,73.002 67.5,73.5C 67.5,72.1667 67.5,70.8333 67.5,69.5C 73.0001,70.1686 75.1667,67.8353 74,62.5C 73.044,61.1059 71.7106,60.4393 70,60.5C 67.4262,61.8001 64.9262,62.9668 62.5,64C 62.0426,63.586 61.7093,63.086 61.5,62.5C 62.8569,60.8144 64.1902,59.1477 65.5,57.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#888" d="M 88.5,57.5 C 95.413,55.9175 99.5797,58.5842 101,65.5C 101.851,71.2531 101.517,76.9198 100,82.5C 97.3372,86.7254 93.5039,88.2254 88.5,87C 85.2456,84.6581 83.4123,81.4915 83,77.5C 82.2489,72.4285 82.5822,67.4285 84,62.5C 85.025,60.313 86.525,58.6464 88.5,57.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#333" d="M 90.5,60.5 C 96.3614,61.7275 98.6947,65.3942 97.5,71.5C 97.5183,74.9238 97.0183,78.2572 96,81.5C 93.9251,83.6483 91.5918,83.9817 89,82.5C 85.3428,74.7678 85.8428,67.4345 90.5,60.5 Z"/></g>' +
             '<g><path style="opacity:1" fill="#888" d="M 129.5,77.5 C 130.919,76.5489 132.585,76.2155 134.5,76.5C 134.795,78.7354 134.461,80.7354 133.5,82.5C 133.5,80.8333 133.5,79.1667 133.5,77.5C 132.167,77.5 130.833,77.5 129.5,77.5 Z"/></g>' +
             '</svg>');

    // next chapter
    document.querySelector(".adblNextChapter").src="data:image/svg+xml;base64,"+
        btoa('<svg width="800px" height="800px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
             '  <g id="Layer_2" data-name="Layer 2">' +
             '    <g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g>' +
             '    <g id="Q3_icons" data-name="Q3 icons">' +
             '      <g><path fill="#888" d="M34,10a2,2,0,0,0-2,2V36a2,2,0,0,0,4,0V12A2,2,0,0,0,34,10Z"/>' +
             '         <path fill="#888" d="M15.5,10.6a2.1,2.1,0,0,0-2.7-.2,1.9,1.9,0,0,0-.2,3L23.2,24,12.6,34.6a1.9,1.9,0,0,0,.2,3,2.1,2.1,0,0,0,2.7-.2l11.9-12a1.9,1.9,0,0,0,0-2.8Z"/></g>' +
             '    </g>' +
             '  </g>' +
             '</svg>');
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
    replaceButtons();
    addVolumeControl();
}

main();
