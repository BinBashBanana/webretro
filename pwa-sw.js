var CACHE_PREX = 'webretro';
var CACHE_NAME = CACHE_PREX+'v1'; //if you have any version update change here
var CACHE_PATH = serviceWorker.scriptURL.split('/').slice(0,-1).join('/')+'/';
var urlsToCache = [ //set some cache path or file,but it not important you can not set it ,change "fetch(event)"
    //Specific url path
    'index.html',
    '',
];
Object.entries(
    {
        install(event){
            console.log('serviceWorker install');
            return self.skipWaiting();//跳过等待
        },
        activate(event){
            //delete Specific url: const cache = await caches.open(CACHE_NAME);cache.delete(url);
            console.log('serviceWorker activate');
            event.waitUntil(
                caches.keys().then(function (cacheNames) {
                    return Promise.all(
                        cacheNames.map(function (cacheName) {
                            if (CACHE_NAME != cacheName&&cacheName.includes(CACHE_PREX)) {
                                return caches.delete(cacheName);
                            }
                        })
                    );
                })
            );
        },
        fetch(event){
            return event.respondWith(new Promise(async resolve=>{
                var url = event.request.url.replace(CACHE_PATH,''),cacheTime;
                var response = await caches.match(event.request);
                if(navigator.onLine){
                    //online
                    if(response){
                        //Expired updates:new Date()  - Date.parse(response.headers.get('date'))>86400 
                        //update on background:fetch(event.request).then(async res=>await caches.open(CACHE_NAME).put(event.request, res.clone()))
                    }
                    if(!response){
                        //down file
                        response =  await fetch(event.request);
                        if(urlsToCache.includes(event.request.url.replace(CACHE_PATH,''))){
                            //if you not set Specific url
                            //you can if(/assets\//.test(url)) then all in the assets file will cache!
                            const cache = await caches.open(CACHE_NAME);
                            console.log('[Service Worker] Caching new resource: ' + url);
                            //save cache url
                            cache.put(event.request, response.clone());
                        }
                    }
                }
                resolve(response);

            }));
        },
        message(event){
            //set message or postMessage
            console.log(event.data);
        }
    }
).forEach(
    entry=>{
        self.addEventListener(entry[0],entry[1]);
    }
);
