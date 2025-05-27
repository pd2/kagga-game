const staticDev = "kagga_game"
const service_worker_version = "v1.025782"
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/DVG_kaggas.txt",
  "/script.js"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDev).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})