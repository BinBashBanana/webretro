var CACHE_NAME = localStorage.getItem('mobile_sw_version');
var path = '/xiunoii/assets/webretro/';
var urlsToCache = [
    '/xiunobbs4/assets/js/common.js',
    path+'Module.js',
    path+'webretro.css',
    '/xiunoii/manifest.json',
    '/xiunoii/favicon.ico',
    '/xiunoii/',
];

let lang = navigator.language.split('-');
if (lang[0] == 'zh') {
    if (lang[1] == 'CN') {
        lang = 'zh-hans';
    } else {
        lang = 'zh-hant';
    }
} else {
    lang = lang[0];
}
urlsToCache.push(path+'i18n/'+lang+'.json');

const eventFunc = {
    install(event){
        postMsg('Updated...','status');
        console.log('install',event);
        //self.skipWaiting();//跳过等待
        event.waitUntil(
            caches.open(CACHE_NAME).then(
                cache=>cache.addAll(urlsToCache)
            ).then(() => {
                console.log('Cache downloaded',caches)
                self.skipWaiting()
            })
        );
    },
    activate(event){
        console.log('activate');
        self.clients.claim();
        event.waitUntil(
            caches.keys().then(
                cacheNames=>{
                    return Promise.all(
                        cacheNames.map(cacheName=>{
                            console.log(cacheName);
                            if(CACHE_NAME != cacheName){
                                return caches.delete(cacheName);
                            }
                        })
                    )
                }
            )
        );
        postMsg('Updated!','status');
    },
    fetch(event){
        console.log('fetch',event);
        event.respondWith(
            caches.match(event.request, {
                ignoreSearch: true
            }).then(function (response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                console.log('cache miss', event.request.url)
                return fetch(event.request);
            })
        );
    },
    message(event){
        console.log(event.data);
    }
};
function postMsg(msg,type,data) {
    var obj = Object.assign({
        type:type||'load',
        id:'webretro',
        msg:msg||'serviceWorker load',
        data
    });
    clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((arr) => {
        for (client of arr) {
            client.postMessage(obj);
        }
    })
}
self.addEventListener('fetch',e=>console.log(e));
Object.entries(eventFunc).forEach(
    entry=>{
        self.addEventListener(entry[0],event=>entry[1](event));
    }
);
postMsg('serviceWorker load','load');