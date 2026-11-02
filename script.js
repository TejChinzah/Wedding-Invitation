/* ===== CONFIGURE YOUR WEDDING HERE ===== */
const CONFIG = {
  bride: "Apuii", groom: "Stephen",
  date: "2026-12-25T16:00:00",              // countdown target (local time) — matches dateText
  dateShort: "25.12.2026", dateText: "Friday, 25 December 2026",
  time: "4:00 in the afternoon",
  city: "Aizawl, Mizoram",
  venue: "Mizoram University", venueAddress: "SF/D30, Hmuifang Hostel",
  reception: "Dinner and dancing at The Dining Hall, 7:00 PM",
  email: "puipuiachinzah1999@gmail.com",
  mapUrl: "https://www.google.com/maps/place/Hmuifang+Hall+of+Residence,+MZU/@23.7406866,92.6499824,365m/data=!3m1!1e3!4m14!1m7!3m6!1s0x374d932e6aa49045:0xd107cfbea6e4cdbc!2sMizoram+University!8m2!3d23.7337677!4d92.6682138!16s%2Fm%2F025vsyn!3m5!1s0x374ded000eb163fb:0x764034f76fcb9c3a!8m2!3d23.7406866!4d92.650849!16s%2Fg%2F11zddyzwv8?entry=ttu&g_ep=EgoyMDI2MTAyOC4wIKXMDSoASAFQAw%3D%3D",
  rsvpUrl: "mailto:tejchinzah1999@gmail.com?subject=My%20address",
  music: "assets/music.mp3"                 // optional; a soft built-in melody plays if missing
};

const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const D = new Date(CONFIG.date), fd = o => D.toLocaleDateString("en-GB", o);
Object.assign(CONFIG, { weekday: fd({ weekday: "long" }), day: D.getDate(), month: fd({ month: "long" }), year: D.getFullYear(),
  timeShort: D.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) });
document.querySelectorAll("[data-bind]").forEach(el => {
  const v = String(CONFIG[el.dataset.bind]);
  el.textContent = el.hasAttribute("data-lines") ? v.split(/,\s*/).join("\n") : v;
});
/* missing photo → placeholder, so the layout never breaks (case-insensitive, any extension) */
document.querySelectorAll('img[src*="hoto-"]').forEach(img => img.addEventListener("error", () => {
  img.src = img.getAttribute("src").replace(/[Pp]hoto-(\d)\.\w+$/, "photo-$1.svg");
}, { once: true }));
$("rsvp").href = CONFIG.rsvpUrl; $("map").href = CONFIG.mapUrl; $("mail").href = "mailto:" + CONFIG.email;

/* ----- cover names: letter-by-letter reveal ----- */
let n = 0;
document.querySelectorAll(".names [data-bind]").forEach(el => {
  const t = el.textContent; el.setAttribute("aria-label", t); el.textContent = "";
  [...t].forEach(c => { const s = document.createElement("span"); s.className = "ch"; s.setAttribute("aria-hidden", "true");
    s.style.setProperty("--i", n++); s.textContent = c; el.appendChild(s); });
  n += 1;
});
document.querySelector(".names i").style.setProperty("--i", CONFIG.bride.length);

/* ----- countdown (digits glide in only when they change) ----- */
const target = D.getTime(), last = {};
const p = (v, l = 2) => String(v).padStart(l, "0");
function tick() {
  const t = Math.max(0, target - Date.now()) / 1000;
  const v = { d: p(Math.floor(t / 86400), 3), h: p(Math.floor(t % 86400 / 3600)), m: p(Math.floor(t % 3600 / 60)), s: p(Math.floor(t % 60)) };
  for (const k in v) if (last[k] !== v[k]) {
    const el = $(k); el.textContent = v[k];
    if (last[k] !== undefined && !reduce) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    last[k] = v[k];
  }
}
tick(); setInterval(tick, 1000);

/* ----- scroll reveal + progress hairline ----- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
let raf = 0;
addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => {
  raf = 0; const h = document.documentElement.scrollHeight - innerHeight;
  $("progress").style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")";
}); }, { passive: true });

/* ----- falling petals (starts after the invitation opens) ----- */
function petals() {
  if (reduce) return;
  const box = $("petals"), count = innerWidth < 600 ? 12 : 22;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("i"), s = 8 + Math.random() * 12;
    el.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s * 1.25}px;--dx:${(Math.random() - .5) * 220}px;--rot:${(Math.random() < .5 ? -1 : 1) * (180 + Math.random() * 360)}deg;animation-duration:${14 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s;opacity:0`;
    box.appendChild(el);
  }
}

/* ----- music: file is pre-buffered so it starts instantly on open ----- */
let mode = null, ctx, master, started = false, audioFail = false;
const audio = new Audio(); audio.preload = "auto"; audio.loop = true; audio.volume = 0;
audio.addEventListener("error", () => audioFail = true); audio.src = CONFIG.music;
function fadeIn() { let v = audio.volume; (function f() { v = Math.min(.6, v + .02); audio.volume = v; if (v < .6) requestAnimationFrame(f); })(); }
function synth() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0;
  const dly = ctx.createDelay(); dly.delayTime.value = .38;
  const fb = ctx.createGain(); fb.gain.value = .38;
  dly.connect(fb); fb.connect(dly); master.connect(ctx.destination); master.connect(dly); dly.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(.22, ctx.currentTime + 4);
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const note = (m, t, d, type, v) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = hz(m);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .03); g.gain.exponentialRampToValueAtTime(.0005, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
  };
  const bars = [[48, [60, 64, 67]], [45, [57, 60, 64]], [41, [57, 60, 65]], [43, [59, 62, 67]]];
  const mel = [[76, 72, 74], [72, 69, 76], [77, 72, 69], [74, 71, 79]];
  const beat = .62; let t0 = ctx.currentTime + .2, bar = 0;
  const sched = () => {
    while (t0 < ctx.currentTime + 2.5) {
      const [b, ch] = bars[bar % 4], me = mel[bar % 4];
      note(b, t0, 1.6, "triangle", .35);
      ch.forEach((x, i) => note(x, t0 + beat * i, 1.2, "sine", .13));
      me.forEach((x, i) => note(x, t0 + beat * i, 1.4, "sine", .2));
      t0 += beat * 3; bar++;
    }
  };
  sched(); setInterval(sched, 700);
}
const useSynth = () => { try { synth(); mode = "synth"; } catch (e) {} };
function startMusic() {
  if (started) return; started = true;
  $("sound").hidden = false; document.body.classList.add("playing");
  if (audioFail) return useSynth();
  audio.play().then(() => { mode = "file"; fadeIn(); }).catch(useSynth);
}
function toggleMusic() {
  if (!started) return startMusic();
  const on = document.body.classList.toggle("playing");
  if (mode === "file") { if (on) { audio.play(); fadeIn(); } else audio.pause(); }
  else if (mode === "synth") on ? ctx.resume() : ctx.suspend();
}
$("sound").addEventListener("click", toggleMusic);
$("vinyl").addEventListener("click", toggleMusic);

/* ----- cover flow: press → flash → photo rolls out → "Open Invitation" glows → tap to open ----- */
const cover = $("cover"), booth = $("booth");
let pressed = false;
function press() {
  if (pressed) return; pressed = true;
  navigator.vibrate && navigator.vibrate(18);
  booth.classList.add("printed", "full"); cover.classList.add("printed", "flash");
  setTimeout(() => cover.classList.add("ready"), reduce ? 300 : 2250);   // as the roll-out settles
}
document.querySelectorAll(".bell").forEach(b => b.addEventListener("click", press));

$("openBtn").addEventListener("click", () => {
  startMusic();
  cover.classList.remove("ready"); cover.classList.add("opening"); booth.classList.add("drop");
  $("main").setAttribute("aria-hidden", "false");
  setTimeout(() => { cover.classList.add("gone"); $("ghost").classList.add("show"); }, 450);
  setTimeout(() => { $("ghost").classList.remove("show"); document.body.classList.add("opened"); window.scrollTo(0, 0); petals(); }, 1150);
  setTimeout(() => cover.style.display = "none", 1500);
}, { once: true });
