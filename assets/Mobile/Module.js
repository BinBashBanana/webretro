const Module = new class{
    noInitialRun = true;
    arguments = ["-v", "--menu"];
    preRun = [];
    postRun = [];
    totalDependencies = 0;
    serviceVersion = 'cache_v1';
    version = 'v6.5';
    elmid = '#emu-webretro';
    bundleCdn = "https://cdn.jsdelivr.net/gh/BinBashBanana/webretro@master/";
    bundleCdnLatest = "https://cdn.jsdelivr.net/gh/BinBashBanana/webretro/";
    biosCdn = "https://cdn.jsdelivr.net/gh/archtaurus/RetroPieBIOS@master/BIOS/";
    action={};
    isLocal = /^(127|localhost|172)/.test(location.host)
    constructor(T){
        const M=this, I = T.I,ElmBody = T.$(M.elmid);
        I.defines(M,{T,I},1);
        T.DB_NAME = 'webretro_mobile'; //定义 indexdb name
        T.LibStore = 'data-libjs'; //定义 储存js文件表
        T.version = 1;
        T.DB_STORE_MAP = { //所有表
            'data-roms': {system: false},
            'data-system': {version:false},
            'data-bios': {system: false},
            'data-config': {timestamp: false},
            'data-userdata': {timestamp: false},
            'data-libjs': {},
        }
        M.JSURLINFO = document.currentScript && document.currentScript.src.split('?');
        M.JSpath = (M.JSURLINFO||[''])[0].split('/').slice(0, -1).join('/') + '/';
        M.CF = T.callaction;
        M.BF = T.bindaction;
        ElmBody.classList.add('emu-container');
        ElmBody.classList.add('emu-'+T.i18nName);
        ElmBody.innerHTML = 
`<div class="emu-welcome"><h3 id="emu-status"></h3><img id="emu-logo" src="${(M.JSpath+'zan.jpg')}"><div id="emu-welcome-result"></div></div>
<div class="emu-screen" hidden><canvas id="canvas" class="texturePixelated"></canvas></div>
<div class="emu-resume" hidden></div>
<div class="emu-settings" hidden></div>
<div class="emu-controls" hidden> </div>
<div class="emu-dialog" hidden></div>`;
        T.docload(e=>M.installStart());
    }
    async installStart(){
        let M = this,T=M.T,I=T.I,isInit=!0,status = '#emu-status';
        Nenge.I.toArr(await indexedDB.databases(),entry=>{
            if(entry['name']==T.DB_NAME)isInit = !1;
        });
        var assets = (M.JSpath).split('/').slice(0, -2).join('/') + '/';
        M.URL_PATH = {
            root:M.isLocal?M.JSpath:M.bundleCdnLatest+'Mobile/',
            assets:M.isLocal?assets:M.bundleCdnLatest+'assets/',
            cores:M.isLocal?assets+'cores/':M.bundleCdnLatest+'cores/',
            bios:M.isLocal?assets+'bios/':M.biosCdn
        };
        var ROOT = M.URL_PATH;
        T.lang = await T.FetchItem({
            url:ROOT['root']+'i18n/'+T.i18nName+'.json?'+T.time,
            process:e=>T.$(status).innerHTML = e,
            type:'json'
        });
        if(isInit){
            await T.FetchItem({
                url:ROOT['root']+'zip/base.zip',
                key:T.F.LibKey,
                store:T.LibStore,
                unpack:true,
                process:e=>T.$(status).innerHTML = e
            });
        }
        if(M.isLocal){
            await T.addJS(ROOT['root']+'Module_Start.js?'+T.time);
        }else{
            await T.loadLibjs(ROOT['root']+'zip/Module_Start.min.zip',e=>T.$(status).innerHTML = e);
            await T.loadLibjs('webretro.css')
        }
        return;
        if(location.protocol=='http:') return;
        //var mobile_sw_version = localStorage.getItem('mobile_sw_version');
        //if(!mobile_sw_version)localStorage.setItem('mobile_sw_version',M.version);
        if('serviceWorker' in navigator){
            navigator.serviceWorker.register('./xiunoii/assets/webretro/Mobile_sw.js').then(worker=>{
                /*
                if(mobile_sw_version != M.version){
                    worker.update(()=>{
                        localStorage.setItem('mobile_sw_version',M.version);
                    })
                }
                */
            }).catch(e=>console.log('reg errot',e));
            navigator.serviceWorker.addEventListener('message', event => {
                console.log('sw msg', event);
                if(!M.serviceWorker)M.serviceWorker = event.source;
                M.CF('server_'+event.data.type,event.data);
            });
        }
    }
    setMEMFS(MEMFS, FS, RA, GLOBAL_BASE) {
        if (!this.MEMFS && MEMFS) I.defines(this, {
            MEMFS
        }, 1);
        if (!this.FS && FS) I.defines(this, {
            FS
        }, 1);
        if (!this.RA && RA) I.defines(this, {
            RA
        }, 1);
        if (!this.GLOBAL_BASE && GLOBAL_BASE) I.defines(this, {
            GLOBAL_BASE
        }, 1);
    }
}(Nenge);