// Service worker: офлайн-кэш оболочки приложения.
//
// ⚠️ Оболочка (app.js, data.js, plans.js, index.html) отдаётся ПО СЕТИ, а кэш —
// только запасной аэродром на случай офлайна. Раньше было наоборот, и если при
// обновлении один файл не докачался (data.js весит под мегабайт — на мобильной
// сети это обычное дело), приложение оставалось с разъехавшимися версиями и
// не рисовало ни фильтров, ни карточек.
const CACHE = "ss-hub-v135";
const ASSETS = ["./", "./index.html", "./app.js", "./data.js", "./plans.js",
                "./journal.html", "./journal-data.js", "./access.html",
                "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", e => {
  // по одному и без падения всей установки, если что-то не доехало
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function networkFirst(req) {
  return fetch(req).then(resp => {
    if (resp && resp.ok) {
      const cp = resp.clone();
      caches.open(CACHE).then(c => c.put(req, cp));
    }
    return resp;
  }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")));
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;   // чужие домены не трогаем
  e.respondWith(networkFirst(e.request));            // и планы, и оболочка — сеть вперёд
});
