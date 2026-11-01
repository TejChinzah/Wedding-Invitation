/* ===== CONFIGURE YOUR WEDDING HERE ===== */
const CONFIG = {
  bride: "Mawli", groom: "Puipuia",
  date: "2027-02-14T16:00:00",              // countdown target (local time)
  dateShort: "14.02.2027", dateText: "Sunday, 14 February 2027",
  time: "4:00 in the afternoon",
  city: "Aizawl, Mizoram",
  venue: "St. Mary's Church", venueAddress: "SF/D30, MZU",
  reception: "Dinner and dancing at The Dining Hall, 7:00 PM",
  email: "puipuiachinzah1999@gmail.com",
  mapUrl: "https://maps.google.com/?q=St.+Mary%27s+Church",
  rsvpUrl: "mailto:tejchinnzah1999@gmail.com?subject=My%20address",
  music: "assets/music.mp3"                 // optional; a soft built-in melody plays if missing
};

const $ = id => document.getElementById(id);
const D = new Date(CONFIG.date), fd = o => D.toLocaleDateString("en-GB", o);
Object.assign(CONFIG, { weekday: fd({ weekday: "long" }), day: D.getDate(), month: fd({ month: "long" }), year: D.getFullYear(),
  timeShort: D.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) });
document.querySelectorAll("[data-bind]").forEach(el => {
  const v = String(CONFIG[el.dataset.bind]);
  el.textContent = el.hasAttribute("data-lines") ? v.split(/,\s*/).join("\n") : v;
});
/* if a photo file is missing, fall back to the placeholder so the layout never breaks */
document.querySelectorAll('img[src*="Photo-"]').forEach(img => img.addEventListener("error", () => {
  img.src = img.getAttribute("src").replace(/Photo-(\d)\.\w+$/, "photo-$1.svg");
}, { once: true }));
$("rsvp").href = CONFIG.rsvpUrl; $("map").href = CONFIG.mapUrl; $("mail").href = "mailto:" + CONFIG.email;

/* ----- countdown ----- */
const target = new Date(CONFIG.date).getTime();
function tick() {
  const t = Math.max(0, target - Date.now()) / 1000, p = (n, l = 2) => String(n).padStart(l, "0");
  $("d").textContent = p(Math.floor(t / 86400), 3); $("h").textContent = p(Math.floor(t % 86400 / 3600));
  $("m").textContent = p(Math.floor(t % 3600 / 60)); $("s").textContent = p(Math.floor(t % 60));
}
tick(); setInterval(tick, 1000);

/* ----- scroll reveal ----- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ----- music ----- */
let mode = null, audio, ctx, master, started = false;
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
      ch.forEach((n, i) => note(n, t0 + beat * i, 1.2, "sine", .13));
      me.forEach((n, i) => note(n, t0 + beat * i, 1.4, "sine", .2));
      t0 += beat * 3; bar++;
    }
  };
  sched(); setInterval(sched, 700);
}
function startMusic() {
  if (started) return; started = true;
  $("sound").hidden = false; document.body.classList.add("playing");
  audio = new Audio(CONFIG.music); audio.loop = true; audio.volume = .6;
  audio.play().then(() => mode = "file").catch(() => { try { synth(); mode = "synth"; } catch (e) {} });
}
function toggleMusic() {
  if (!started) return startMusic();
  const on = document.body.classList.toggle("playing");
  if (mode === "file") on ? audio.play() : audio.pause();
  else if (mode === "synth") on ? ctx.resume() : ctx.suspend();
}
$("sound").addEventListener("click", toggleMusic);
$("vinyl").addEventListener("click", toggleMusic);

/* ----- cover flow: press button → flash → photo rolls out → "Open Invitation" glows → tap to open ----- */
const cover = $("cover"), booth = $("booth");
let pressed = false;
function press() {
  if (pressed) return; pressed = true;
  booth.classList.add("printed", "full"); cover.classList.add("printed", "flash");
  setTimeout(() => cover.classList.add("ready"), 3700);   // right after the roll-out finishes
}
document.querySelectorAll(".bell").forEach(b => b.addEventListener("click", press));

$("openBtn").addEventListener("click", () => {
  startMusic();
  cover.classList.remove("ready"); cover.classList.add("opening"); booth.classList.add("drop");
  $("main").setAttribute("aria-hidden", "false");
  setTimeout(() => { cover.classList.add("gone"); $("ghost").classList.add("show"); }, 700);
  setTimeout(() => { $("ghost").classList.remove("show"); document.body.classList.add("opened"); window.scrollTo(0, 0); }, 1700);
  setTimeout(() => cover.style.display = "none", 2300);
}, { once: true });
