import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'
import { SHARED_DATA_ENDPOINT } from './api/patreon/types'
import { BroadCastMessage, SW_BroadcastChannel } from './types'

// // This declares the value of `injectionPoint` to TypeScript.
// // `injectionPoint` is the string that will be replaced by the
// // actual precache manifest. By default, this string is set to
// // `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

// see: https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
self.addEventListener('activate', event => {
  console.log('--------Service Worker activated--------')
  event.waitUntil(self.clients.claim())
  caches.open(SHARED_DATA_ENDPOINT).then(function (cache) {
    console.log('Cache opened:', cache)
    cache.match(SHARED_DATA_ENDPOINT).then(function (response) {
      console.log('Cache match response:', response)
      channel.postMessage({
        type: 'return-patreon-data',
        data: response ? response.json() : {},
      })
    })
  })
})

self.addEventListener('install', function (event) {
  self.skipWaiting()
})

const channel = new BroadcastChannel(SW_BroadcastChannel)

channel.onmessage = (event: MessageEvent<BroadCastMessage>) => {
  console.log('Message from service worker:', event.data)
  channel.postMessage('received')
  switch (event.data.type) {
    case 'update-patreon-data':
      {
        const data = event.data.data
        caches.open(SHARED_DATA_ENDPOINT).then(function (cache) {
          cache.put(SHARED_DATA_ENDPOINT, new Response(JSON.stringify(data)))
        })
      }
      break
    case 'get-patreon-data':
      {
        caches.open(SHARED_DATA_ENDPOINT).then(function (cache) {
          cache.match(SHARED_DATA_ENDPOINT).then(function (response) {
            channel.postMessage({
              type: 'return-patreon-data',
              data: response ? response.json() : {},
            })
          })
        })
      }
      break

    case 'return-patreon-data':
      break
  }
}

self.addEventListener('fetch', function (event) {
  const {
    request,
    request: { url, method },
  } = event
  console.log('fetch', url, method)
  if (url.endsWith(SHARED_DATA_ENDPOINT)) {
    if (method === 'POST') {
      request.json().then(body => {
        caches.open(SHARED_DATA_ENDPOINT).then(function (cache) {
          cache.put(SHARED_DATA_ENDPOINT, new Response(JSON.stringify(body)))
        })
      })
      return new Response('{}')
    } else {
      event.respondWith(
        caches.open(SHARED_DATA_ENDPOINT).then(function (cache) {
          return (
            cache.match(SHARED_DATA_ENDPOINT).then(function (response) {
              return response || new Response('{}')
            }) || new Response('{}')
          )
        }),
      )
    }
  } else {
    return event
  }
})
