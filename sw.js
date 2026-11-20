/* Escapada a Europa: guarda la app en el móvil para usarla sin internet */
const V = "tp-escapada-v7", T = "tp-escapada-mapa"; /* solo borra sus propias copias: en github.io todas las apps comparten el mismo sitio */
const FILES = ["./", "index.html", "manifest.json", "icono.png", "icono-192.png", "favicon-32.png", "apple-touch-icon.png",
  "fotos/cordoba.jpg", "fotos/sevilla.jpg", "fotos/granada.jpg", "fotos/barcelona.jpg", "fotos/paris.jpg", "fotos/lyon.jpg", "fotos/venecia.jpg", "fotos/florencia.jpg", "fotos/roma.jpg", "fotos/madrid.jpg",
  "fotos/paises/es.png", "fotos/paises/fr.png", "fotos/paises/it.png", "fonts/marcellus.woff2", "fonts/anton.woff2",
  "fotos/tiempo/sol.png", "fotos/tiempo/solnube.png", "fotos/tiempo/nubes.png", "fotos/tiempo/lluvia.png", "fotos/tiempo/tormenta.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => Promise.allSettled(FILES.map(f => fetch(new Request(f, { cache: "reload" })).then(r => { if (r.ok) return c.put(f, r); })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("tp-") && k !== V && k !== T).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  /* calles del mapa: se guardan al verlas (y con la precarga), para que sirvan después sin señal */
  if (/tile\.openstreetmap\.org/.test(r.url)) { e.respondWith(caches.open(T).then(c => c.match(r.url).then(m => m || fetch(r).then(res => { if (res.ok) c.put(r.url, res.clone()); return res; }).catch(() => new Response("", { status: 504 }))))); return; }
  const font = /fonts\.(googleapis|gstatic)\.com/.test(r.url);
  if (new URL(r.url).origin !== location.origin && !font) return;
  /* página: primero la red (para recibir cambios), si no hay conexión, la copia guardada */
  if (r.mode === "navigate") { e.respondWith(fetch(r.url, { cache: "no-cache" }).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))); return; }
  /* fotos, iconos y letras: primero la copia guardada */
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
});
