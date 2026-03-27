// ==UserScript==
// @name         Audible Custom WebPlayer
// @namespace    https://github.com/waringer/CustomAudiblePlayer/raw/main/CustomAudiblePlayer.user.js
// @version      2026.03.27.01
// @description  Dark Skin and Volume Slider Audible Custom WebPlayer
// @author       waringer
// @license      BSD
// @run-at       document-start
// @match        https://www.audible.de/webplayer*
// @grant        GM_addStyle
// ==/UserScript==

// ---------------------------------------------------------------------------
// PHASE 1 — document-start: intercept attachShadow() before the design system
// loads so all shadow roots are created with mode:'open' instead of 'closed'
// ---------------------------------------------------------------------------
(function() {
    const orig = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(init) {
        return orig.call(this, { ...init, mode: "open" });
    };
})();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const WAIT_TIMEOUT_MS = 30000;

const TARGET_TESTIDS = [
    "previous-section",
    "skip-back",
    "play",
    "skip-forward",
    "next-section",
];

// CSS injected into each adbl-icon shadow root as a fallback
const ICON_STYLE = `
svg rect { fill: transparent !important; }
svg path { fill: #888 !important; }
`;

// Mapping: adbl-icon name attribute → custom SVG definition
// play-fill and pause-fill toggle on play/pause
const NS = "http://www.w3.org/2000/svg";

const ICON_SVGS = {
    "play-previous": {
        w:"48", h:"48", vb:"0 0 48 48",
        els: [
            {tag:"rect", a:{width:"48",height:"48",fill:"none"}},
            {tag:"path", a:{fill:"#888",d:"M24.8,24,35.4,13.4a1.9,1.9,0,0,0-.2-3,2.1,2.1,0,0,0-2.7.2l-11.9,12a1.9,1.9,0,0,0,0,2.8l11.9,12a2.1,2.1,0,0,0,2.7.2,1.9,1.9,0,0,0,.2-3Z"}},
            {tag:"path", a:{fill:"#888",d:"M14,10a2,2,0,0,0-2,2V36a2,2,0,0,0,4,0V12A2,2,0,0,0,14,10Z"}},
        ],
    },
    "back-30": {
        w:"50", h:"50", vb:"0 0 150 138",
        svgStyle:"shape-rendering:geometricPrecision;fill-rule:evenodd;clip-rule:evenodd",
        els: [
            {tag:"path", a:{fill:"#888",d:"M 24.5,76.5 C 24.5,75.5 24.5,74.5 24.5,73.5C 25.8333,73.5 27.1667,73.5 28.5,73.5C 32.8683,101.03 49.0349,116.03 77,118.5C 108.676,114.488 124.343,96.4875 124,64.5C 118.661,38.6619 102.827,24.6619 76.5,22.5C 76.8747,25.3965 76.3747,28.0632 75,30.5C 68.7536,27.2938 62.5869,23.9605 56.5,20.5C 62.6076,16.1128 69.2743,12.7795 76.5,10.5C 76.5,12.8333 76.5,15.1667 76.5,17.5C 111.011,21.5078 128.511,40.8411 129,75.5C 121.574,110.232 100.074,125.732 64.5,122C 41.3732,115.377 28.0399,100.21 24.5,76.5 Z"}},
            {tag:"text", a:{fill:"#888","font-family":"Helvetica","font-size":"24","text-anchor":"middle",transform:"matrix(1.66863,0,0,1.60969,-38.6568,-30.6274)",x:"68.66",y:"69.75"}, text:"30"},
        ],
    },
    "play-fill": {
        w:"50", h:"50", vb:"0 0 48 48",
        els: [
            {tag:"rect", a:{width:"48",height:"48",fill:"none"}},
            {tag:"path", a:{fill:"#888",d:"M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2ZM34.6,24.7,18.1,34.8c-.6.4-1.1.1-1.1-.6V13.8c0-.7.5-1,1.1-.6L34.6,23.3A.8.8,0,0,1,34.6,24.7Z"}},
        ],
    },
    "pause-fill": {
        w:"50", h:"50", vb:"0 0 48 48",
        els: [
            {tag:"rect", a:{width:"48",height:"48",fill:"none"}},
            {tag:"path", a:{fill:"#888",d:"M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2ZM21,31a2,2,0,0,1-4,0V17a2,2,0,0,1,2-2,2.1,2.1,0,0,1,2,2Zm10,0a2,2,0,0,1-4,0V17a2,2,0,0,1,2-2,2.1,2.1,0,0,1,2,2Z"}},
        ],
    },
    "forward-30": {
        w:"50", h:"50", vb:"0 0 156 150",
        svgStyle:"shape-rendering:geometricPrecision;fill-rule:evenodd;clip-rule:evenodd",
        els: [
            {tag:"path", a:{fill:"#888",d:"M 129.5,77.5 C 130.833,77.5 132.167,77.5 133.5,77.5C 133.5,79.1667 133.5,80.8333 133.5,82.5C 127.281,110.546 109.781,125.546 81,127.5C 62.2911,126.149 47.6244,117.816 37,102.5C 22.7447,74.6508 27.578,50.8175 51.5,31C 60.5056,24.7476 70.5056,21.5809 81.5,21.5C 81.5,19.1667 81.5,16.8333 81.5,14.5C 88.7257,16.7795 95.3924,20.1128 101.5,24.5C 95.048,28.3927 88.3813,31.726 81.5,34.5C 81.5,31.8333 81.5,29.1667 81.5,26.5C 47.8552,30.6485 32.3552,49.6485 35,83.5C 41.2167,107.788 56.8834,120.788 82,122.5C 109.448,119.548 125.281,104.548 129.5,77.5 Z"}},
            {tag:"text", a:{fill:"#888","font-family":"Helvetica","font-size":"24","text-anchor":"middle",transform:"matrix(1.66863,0,0,1.60969,-38.6568,-30.6274)",x:"72.02",y:"72.42"}, text:"30"},
        ],
    },
    "play-next": {
        w:"50", h:"50", vb:"0 0 48 48",
        els: [
            {tag:"rect", a:{width:"48",height:"48",fill:"none"}},
            {tag:"path", a:{fill:"#888",d:"M34,10a2,2,0,0,0-2,2V36a2,2,0,0,0,4,0V12A2,2,0,0,0,34,10Z"}},
            {tag:"path", a:{fill:"#888",d:"M15.5,10.6a2.1,2.1,0,0,0-2.7-.2,1.9,1.9,0,0,0-.2,3L23.2,24,12.6,34.6a1.9,1.9,0,0,0,.2,3,2.1,2.1,0,0,0,2.7-.2l11.9-12a1.9,1.9,0,0,0,0-2.8Z"}},
        ],
    },
};

function buildSVG(def) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttributeNS(null, "width", def.w + "px");
    svg.setAttributeNS(null, "height", def.h + "px");
    svg.setAttributeNS(null, "viewBox", def.vb);

    if (def.svgStyle) svg.setAttributeNS(null, "style", def.svgStyle);
    for (const el of def.els) {
        const node = document.createElementNS(NS, el.tag);
        for (const [k, v] of Object.entries(el.a || {})) node.setAttributeNS(null, k, v);
        if (el.text) node.appendChild(document.createTextNode(el.text));
        svg.appendChild(node);
    }
    return svg;
}

// ---------------------------------------------------------------------------
// Global dark theme stylesheet
// ---------------------------------------------------------------------------

const GLOBAL_STYLE = `
body, html {
    color: #888;
    background-color: #333;
}
div {
    color: #888;
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

/* Seek bar progress track */
.ui-video-seek-slider .track .connect {
    background: #f7991c !important;
}
.ui-video-seek-slider .thumb {
    background: #f7991c !important;
}

/* Volume control — div-based, no input[type=range] to avoid Audible resetting it */
#acwp-volume-wrap {
    display: flex;
    align-items: center;
    margin: 0.5rem 40px 0 40px;
    box-sizing: border-box;
    user-select: none;
}
#acwp-volume-icon {
    flex-shrink: 0;
    padding-right: 1rem;
    line-height: 0;
}
#acwp-track {
    position: relative;
    flex: 1;
    /* Tall invisible hit area for easier interaction */
    height: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
}
#acwp-track-inner {
    position: relative;
    width: 100%;
    height: 4px;
    background: #555;
    border-radius: 2px;
    pointer-events: none;
}
#acwp-fill {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: #f7991c;
    border-radius: 2px;
}
#acwp-thumb {
    position: absolute;
    top: 50%;
    width: 14px;
    height: 14px;
    background: #f7991c;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
#adbl-cloud-player-bottom-menu-area {
    height: auto !important;
}
`;

// ---------------------------------------------------------------------------
// Button icons — interval-based polling
// The web component re-renders its shadow DOM after our changes, so a single
// observer chain is not reliable. setInterval checks every 800ms and
// re-injects whenever the component has reset itself.
// ---------------------------------------------------------------------------

// Traverses both shadow root levels and returns the adbl-icon element:
// adbl-icon-button.shadowRoot → adbl-icon
function getAdblIcon(testId) {
    const btn = document.querySelector(`adbl-icon-button[data-testid="${testId}"]`);
    if (!btn?.shadowRoot) return null;
    return btn.shadowRoot.querySelector("adbl-icon");
}

// Injects the style tag and replaces the SVG inside adbl-icon.shadowRoot.
// Returns true when both steps succeeded.
function applyIconStyle(testId) {
    const icon = getAdblIcon(testId);
    if (!icon?.shadowRoot) return false;

    const shadow = icon.shadowRoot;
    const svg    = shadow.querySelector("svg");
    if (!svg) return false;

    // Ensure style tag is present (survives re-renders as long as the shadow root lives)
    if (!shadow.querySelector("style[data-acwp]")) {
        const style = document.createElement("style");
        style.setAttribute("data-acwp", "1");
        style.textContent = ICON_STYLE;
        shadow.appendChild(style);
    }

    // Replace SVG if a custom definition exists and hasn't been applied yet
    const name = icon.getAttribute("name");
    const def  = ICON_SVGS[name];
    if (def && !svg.hasAttribute("data-acwp")) {
        svg.replaceWith(buildSVG(def));
        // Mark the new SVG so we don't replace it on the next tick
        shadow.querySelector("svg")?.setAttribute("data-acwp", "1");
    }

    return true;
}

function styleAllButtons() {
    let allDone = true;
    for (const testId of TARGET_TESTIDS) {
        if (!applyIconStyle(testId)) allDone = false;
    }

    if (!allDone) {
        // Not all buttons ready yet — retry shortly
        setTimeout(styleAllButtons, 200);
        return;
    }

    // All styled — keep polling in case a component re-renders
    setInterval(() => {
        for (const testId of TARGET_TESTIDS) {
            applyIconStyle(testId);
        }
    }, 800);
}

// ---------------------------------------------------------------------------
// Volume control — div-based slider (no input[type=range])
// Audible polls all input[type=range] elements and resets their value to its
// internal state. A plain div slider is invisible to querySelectorAll('input').
// ---------------------------------------------------------------------------

function addVolumeControl() {
    if (document.getElementById("acwp-volume-wrap")) return;

    const audio = document.getElementById("audible-player") || document.querySelector("audio");
    if (!audio) { console.warn("[ACWP] audio element not found"); return; }

    const wrap = document.createElement("div");
    wrap.id = "acwp-volume-wrap";
    wrap.innerHTML = `
        <div id="acwp-volume-icon">
            <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path fill="#888" d="m4 6v8l5.2 3.9c.3.3.8 0 .8-.5v-14.8c0-.5-.5-.8-.8-.5zm0 8h-3a1 1 0 0 1 -1-1v-6a1 1 0 0 1 1-1h3m0 0"/>
                <path fill="#888" d="m16.4 17.4a1 1 0 0 1 -.7-1.7 8 8 0 0 0 0-11.4 1 1 0 0 1 1.3-1.3 10 10 0 0 1 0 14.2 1 1 0 0 1 -.7.3z"/>
                <path fill="#888" d="m13.5 14.5a1 1 0 0 1 -.7-.3 1 1 0 0 1 0-1.4 4 4 0 0 0 0-5.6 1 1 0 0 1 1.4-1.4 6 6 0 0 1 0 8.4 1 1 0 0 1 -.7.3z"/>
            </svg>
        </div>
        <div id="acwp-track">
            <div id="acwp-track-inner">
                <div id="acwp-fill"></div>
                <div id="acwp-thumb"></div>
            </div>
        </div>`;

    // Insert after the player content area, using the seek bar as an anchor
    const seekTrack  = document.querySelector('[data-testid="main-track"]');
    const playerArea = seekTrack?.parentElement?.parentElement?.parentElement?.parentElement;
    if (playerArea?.parentElement) {
        playerArea.parentElement.insertBefore(wrap, playerArea.nextSibling);
    } else {
        document.getElementById("adbl-cloud-player-container")?.appendChild(wrap);
    }

    const track = document.getElementById("acwp-track");
    const fill  = document.getElementById("acwp-fill");
    const thumb = document.getElementById("acwp-thumb");
    let vol = parseFloat(localStorage.getItem("ACWP-Volume") ?? "100") / 100;

    const setVolume = (v) => {
        v = Math.max(0, Math.min(1, v));
        vol = v;
        const pct = `${v * 100}%`;
        fill.style.width = pct;
        thumb.style.left = pct;
        audio.volume     = v;
        localStorage.setItem("ACWP-Volume", Math.round(v * 100));
    };

    setVolume(vol);

    const posFromEvent = (e) => {
        const rect = track.getBoundingClientRect();
        return (e.clientX - rect.left) / rect.width;
    };

    let dragging = false;
    track.addEventListener("mousedown", (e) => { dragging = true; setVolume(posFromEvent(e)); e.preventDefault(); });
    document.addEventListener("mousemove", (e) => { if (dragging) setVolume(posFromEvent(e)); });
    document.addEventListener("mouseup",   () => { dragging = false; });
    track.addEventListener("wheel", (e) => { setVolume(vol - e.deltaY * 0.001); e.preventDefault(); }, { passive: false });
}

// ---------------------------------------------------------------------------
// Wait for the player to be ready (adbl-icon-button[data-testid="play"])
// ---------------------------------------------------------------------------

function waitForPlayer(callback) {
    const isReady = () =>
        !!document.querySelector('adbl-icon-button[data-testid="play"]');

    if (isReady()) { callback(); return; }

    const deadline = Date.now() + WAIT_TIMEOUT_MS;
    const obs = new MutationObserver(() => {
        if (isReady()) {
            obs.disconnect();
            callback();
        } else if (Date.now() > deadline) {
            obs.disconnect();
            console.warn("[ACWP] Timeout waiting for player");
            callback();
        }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
}

// ---------------------------------------------------------------------------
// Inject global stylesheet into the main document
// ---------------------------------------------------------------------------

function injectStylesheet() {
    if (typeof GM_addStyle !== "undefined") {
        GM_addStyle(GLOBAL_STYLE);
    } else {
        const el = document.createElement("style");
        el.textContent = GLOBAL_STYLE;
        (document.head || document.body).appendChild(el);
    }
}

// ---------------------------------------------------------------------------
// Inject global stylesheet into all shadow roots so the dark theme
// also applies to web component internals
// ---------------------------------------------------------------------------

function injectShadowStylesheets() {
    getAllShadowRoots().forEach(root => {
        const el = document.createElement("style");
        el.textContent = GLOBAL_STYLE;
        root.prepend(el);
    });
}

function getAllShadowRoots(root = document) {
    let roots = [];
    root.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) {
            roots.push(el.shadowRoot);
            roots = roots.concat(getAllShadowRoots(el.shadowRoot));
        }
    });
    return roots;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function init() {
    if (!localStorage.getItem("ACWP-Volume")) localStorage.setItem("ACWP-Volume", "100");
    injectStylesheet();
    waitForPlayer(() => {
        console.log("[ACWP] Player ready");
        injectShadowStylesheets();
        styleAllButtons();
        addVolumeControl();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
