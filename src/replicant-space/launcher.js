// Replicant Space wallpaper for Octos.
// The maps themselves come from your Replicant Space web client (its /wallpaper/ pages); this page only reads the
// wallpaper's settings and shows the right view full-screen. Settings changed in the Octos app apply straight away.
(function () {
  "use strict";

  var VERSION = "1.5.0";   // keep in step with octos.json
  var VIEWS = { "Galaxy": "galaxy", "One system": "system", "Cycle my systems": "cycle" };
  // the galaxy's layers, grouped as on the web client's Galaxy page (setting id → the page's layer id, and its default)
  var LAYERS = {
    labels: ["labels", true], mine: ["mine", false],                                                   // View
    regions: ["regions", true], mark_hazard: ["mark-hazard", true], production: ["production", true],  // Clouds & glows
    cover: ["cover", true], mark_scanned: ["mark-scanned", true], mark_survey: ["mark-survey", true],  // Rings & waves
    prospect: ["prospect", true], others: ["others", true],
    relaynet: ["relaynet", false], moving: ["moving", true], fleets: ["fleets", true],                 // Lines
    supply: ["supply", true], trail: ["trail", true],
    mark_devices: ["mark-devices", true], mark_replicant: ["mark-replicant", true],                    // Icons
    mark_hub: ["mark-hub", true], mark_ward: ["mark-ward", true], mark_found: ["mark-found", true],
    mark_prospected: ["mark-prospected", true], mark_mega: ["mark-mega", true], mark_rich: ["mark-rich", true],
    mark_anomaly: ["mark-anomaly", true]
  };
  var opts = { link: "", view: "Galaxy", system: "", follow: "", hud: "Right", rotate: 4, refresh: 5, cycle: 60 };
  Object.keys(LAYERS).forEach(function (id) { opts[id] = LAYERS[id][1]; });
  var wall = document.getElementById("wall");
  var setup = document.getElementById("setup");
  var why = document.getElementById("why");
  var current = null;

  function off(v) { return v === false || v === "false" || v === "0"; }

  function num(v, d, lo, hi) {
    var n = parseFloat(v);
    if (!isFinite(n)) n = d;
    return Math.min(hi, Math.max(lo, n));
  }

  // The wallpaper link, checked: https://host/wallpaper/<slug>/#key=rsw_… → {base, key}, or an error message.
  function parseLink(text) {
    text = String(text || "").trim();
    if (!text) return { error: "" };
    var u;
    try { u = new URL(text); } catch (e) { return { error: "That wallpaper link isn't a web address." }; }
    if (!/^https?:$/.test(u.protocol)) return { error: "The wallpaper link must start with https://" };
    var m = u.pathname.match(/^(.*\/wallpaper\/[a-z0-9-]+)\/?$/);
    if (!m) return { error: "That doesn't look like a wallpaper link (it should contain /wallpaper/…/)." };
    var key = new URLSearchParams(u.hash.slice(1)).get("key") || "";
    if (key.indexOf("rsw_") !== 0) return { error: "The wallpaper link is missing its key (the #key=rsw_… part). Copy the whole link." };
    return { base: u.origin + m[1] + "/", key: key };
  }

  function show(src) {
    setup.hidden = true;
    wall.hidden = false;
    if (src !== current) { current = src; wall.src = src; }
  }

  function apply() {
    var link = parseLink(opts.link);
    if (link.error !== undefined) {
      current = null;
      wall.hidden = true;
      wall.removeAttribute("src");
      why.textContent = link.error;
      setup.hidden = false;
      return;
    }
    var q = new URLSearchParams();
    q.set("view", VIEWS[opts.view] || "galaxy");
    var star = String(opts.system || "").trim().toUpperCase();
    if (star) q.set("star", star);
    var follow = String(opts.follow || "").trim();
    if (follow) q.set("follow", follow);
    // the older switches, for clients before 1.216.0; newer ones read the layer list
    ["labels", "cover", "fleets", "supply", "production"].forEach(function (id) { q.set(id, off(opts[id]) ? "0" : "1"); });
    q.set("layers", Object.keys(LAYERS).filter(function (id) { return !off(opts[id]); })
                                     .map(function (id) { return LAYERS[id][0]; }).join(","));
    var hud = String(opts.hud || "Right").toLowerCase();
    q.set("hud", hud === "left" || hud === "off" ? hud : "right");
    q.set("rotate", String(num(opts.rotate, 4, 0, 20) / 10));
    q.set("refresh", String(Math.round(num(opts.refresh, 5, 1, 120))));
    q.set("cycle", String(Math.round(num(opts.cycle, 60, 10, 3600))));
    q.set("addon", VERSION);
    show(link.base + "?" + q.toString() + "#key=" + encodeURIComponent(link.key));
  }

  var inOctos = !!(window.chrome && window.chrome.webview && window.octos && window.octos.UserOptions);
  if (inOctos) {
    var uo = new window.octos.UserOptions();
    uo.on("change", function (e) { opts[e.id] = e.value; apply(); });
    uo.requestOptions().then(function (o) {
      Object.keys(o || {}).forEach(function (id) { if (o[id] && "value" in o[id]) opts[id] = o[id].value; });
      apply();
    });
    setTimeout(function () { if (current === null && setup.hidden) apply(); }, 3000);   // no answer: show setup
  } else {
    // In a browser (testing): settings come from the address, e.g. index.html?link=…&view=One%20system&system=SOL
    var p = new URLSearchParams(location.search);
    Object.keys(opts).forEach(function (id) { if (p.has(id)) opts[id] = p.get(id); });
    apply();
  }
})();
