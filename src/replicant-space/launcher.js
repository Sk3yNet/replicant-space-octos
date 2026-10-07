// Replicant Space wallpaper for Octos.
// The maps themselves come from your Replicant Space web client (its /wallpaper/ pages); this page only reads the
// wallpaper's settings and shows the right view full-screen. Settings changed in the Octos app apply straight away.
(function () {
  "use strict";

  var VERSION = "1.3.1";   // keep in step with octos.json
  var VIEWS = { "Galaxy": "galaxy", "One system": "system", "Cycle my systems": "cycle" };
  var opts = { link: "", view: "Galaxy", system: "", labels: true, cover: true, fleets: true, supply: true, hud: "Right", rotate: 4, refresh: 5,
              cycle: 60 };
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
    q.set("labels", off(opts.labels) ? "0" : "1");
    q.set("cover", off(opts.cover) ? "0" : "1");
    q.set("fleets", off(opts.fleets) ? "0" : "1");
    q.set("supply", off(opts.supply) ? "0" : "1");
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
