//(function (){
    const M = Module,T = M.T,I=T.I,F=T.F,W=window,ROOT = M.URL_PATH,DISK = new class NengeDisk {
        constructor(T) {
            let D = this,
                I = T.I;
            I.defines(this, {
                T,
                I
            }, 1);
            D.callaction = T.callaction;
        }
        speed = 1000 / 60;
        action = {};
        DB = {};
        SetModule(Module) {
            let D = this;
            if (Module) D.I.defines(D, {Module}, 1);
            if (!D.Module) return;
            D.MEMFS.stream_ops.write = function (stream, buffer, offset, length, position, canOwn) {
                if (D.HEAP8 && buffer.buffer === D.HEAP8.buffer) {
                    canOwn = false
                }
                if (!length) return 0;
                var node = stream.node;
                node.timestamp = Date.now();
                if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                    if (canOwn) {
                        node.contents = buffer.subarray(offset, offset + length);
                        node.usedBytes = length;
                        return length
                    } else if (node.usedBytes === 0 && position === 0) {
                        D.update(stream);
                        node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
                        node.usedBytes = length;
                        return length
                    } else if (position + length <= node.usedBytes) {
                        node.contents.set(buffer.subarray(offset, offset + length), position);
                        return length
                    }
                }
                D.MEMFS.expandFileStorage(node, position + length);
                if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position);
                else {
                    for (var i = 0; i < length; i++) {
                        node.contents[position + i] = buffer[offset + i]
                    }
                }
                node.usedBytes = Math.max(node.usedBytes, position + length);
                return length
            };
            if (D.MEMFS.ops_table) D.MEMFS.ops_table.file.stream.write = D.MEMFS.stream_ops.write;
        }
        SetDB(DB) {
            this.I.assign(this.DB, DB);
        }
        get FS() {
            return this.Module.FS;
        }
        get MEMFS() {
            return this.Module.MEMFS || this.FS.filesystems.MEMFS;
        }
        get HEAP8() {
            return this.Module.HEAP8;
        }
        getStore(mount) {
            let D = this,
                DB = D.DB,
                path = mount.mountpoint || mount;
            if (!DB[path]) {
                return false;
            }
            return DB[path];
        }
        mount(mount) {
            let D = this;
            if (!D.FS.analyzePath(mount.mountpoint).exists) {
                D.FS.createPath('/', mount.mountpoint, !0, !0);
            }
            let len = mount.mountpoint.split('/').length;
            let node = D.MEMFS.createNode(len < 3 ? D.FS.root : null, len < 3 ? mount.mountpoint.split('/').pop() : mount.mountpoint.replace(/^\//, ''), 16384 | 511, 0);
            if (D.getStore(mount)) {
                if (!D.__mount) D.__mount = [];
                D.__mount.push(D.syncfs(mount, txt => D.callaction('DiskReadyOut', txt)));
            }
            return node;
        }
        mountReady() {
            return Promise.all(this.__mount || []);
        }
        async syncfs(mount, callback, error) {
            let D = this;
            callback = error instanceof Function ? error : callback;
            let store = D.getStore(mount);
            let result;
            if (!mount.isReady) {
                result = await D.writeToFS(store);
            } else {
                result = await D.syncWrite(store, mount);
            }
            mount.isReady = true;
            (callback instanceof Function) && callback(result);
            return result;
        }
        async writeToFS(store) {
            let D = this,
                I = D.I;
            return I.toArr(await store.all(true)).map(entry => D.storeLocalEntry(entry[0], entry[1])).join("\n");
        }
        async syncWrite(store, mount) {
            let D = this,
                I = D.I,
                IsReady = mount.isReady,
                local = D.getLocalSet(mount),
                remote = await D.getRemoteSet(store),
                src = (IsReady ? local : remote).entries || {},
                dst = (!IsReady ? local : remote).entries || {};
            let result = await Promise.all(I.toArr(src).filter(entry => {
                if (!entry[1]) return '';
                let path = entry[0],
                    e2 = dst[path];
                if (!e2 || entry[1].timestamp > e2.timestamp) {
                    return true;
                }
                return false;

            }).map(entry => entry[0]).sort().map(async path => {
                if (!IsReady) {
                    let contents = await store.get(path);
                    if (contents) {
                        return D.storeLocalEntry(path, contents);
                    }
                } else {
                    let contents = D.loadLocalEntry(path);
                    if (contents) {
                        await store.put(path, contents);
                        return 'DB saved:' + path;
                    }
                }
            }));
            result.concat(await Promise.all(I.toArr(dst).filter(entry => {
                if (!entry[1]) return '';
                let e2 = src[entry[0]],
                    path = entry[0];
                if (!e2 || entry[1].timestamp > e2.timestamp) {
                    return true;
                }
                return false;

            }).map(entry => entry[0]).sort().map(async path => {
                let msg = '';
                if (!IsReady) {
                    D.removeLocalEntry(path);
                    msg = 'FS remove:';
                } else {
                    await store.remove(path, true);
                    msg = 'DB remove:';
                }
                return msg + path;
            })));
            D.callaction('indexdb-sync', IsReady, result);
            return result.join("\n");
        }
        loadLocalEntry(path) {
            let D = this,
                FS = D.FS,
                stat, node;
            if (FS.analyzePath(path).exists) {
                var lookup = FS.lookupPath(path);
                node = lookup.node;
                stat = FS.stat(path)
            } else {
                return path + ' is exists'
            }
            if (FS.isDir(stat.mode)) {
                return {
                    timestamp: stat.mtime,
                    mode: stat.mode
                };
            } else if (FS.isFile(stat.mode)) {
                node.contents = D.getFileDataAsTypedArray(node);
                return {
                    timestamp: stat.mtime,
                    mode: stat.mode,
                    contents: node.contents
                };
            } else {
                return "node type not supported";
            }
        }
        storeLocalEntry(path, entry) {
            let D = this,
                FS = D.FS
            if (FS.isDir(entry.mode)) {
                !FS.analyzePath(path).exists && FS.createPath('/', path, !0, !0)
            } else if (FS.isFile(entry.mode)) {
                let p = path && path.split('/').slice(0, -1).join('/');
                if (p && !FS.analyzePath(p).exists) FS.createPath('/', p, !0, !0);
                FS.writeFile(path, entry.contents, {
                    canOwn: true,
                    encoding: "binary"
                });
            } else {
                throw "node type not supported";
            }
            FS.chmod(path, entry.mode);
            FS.utime(path, entry.timestamp, entry.timestamp);
            return 'FS write:' + path;
        }
        removeLocalEntry(path) {
            let FS = this.FS;
            if (FS.analyzePath(path).exists) {
                var stat = FS.stat(path);
                if (FS.isDir(stat.mode)) {
                    FS.rmdir(path)
                } else if (FS.isFile(stat.mode)) {
                    FS.unlink(path)
                }
                return 'FS unlink:' + path;
            } else {
                return path + 'is not exists';
            }
        }
        async getRemoteSet(store, callback) {
            let remote = {
                'type': "remote",
                store,
                entries: await store.cursor('timestamp', true)
            };
            callback && callback(remote);
            return remote;
        }
        getLocalSet(mount, callback) {
            let D = this;
            if (!mount) return console.log('mount:PATH ERROR');
            let result = {
                "type": "local",
                entries: D.getLocalList(mount.mountpoint)
            };
            callback && callback(result);
            return result
        }
        getLocalList(mountpoint) {
            return this.getPathList(mountpoint, !0);
        }
        getPathList(mountpoint, bool) {
            if (!this.Module) return {};
            mountpoint = mountpoint || '/';
            let D = this,
                FS = D.FS,
                entries = {},
                filterRoot = [".", ".."].concat(mountpoint == '/' ? ["dev", "tmp", "proc"] : []),
                isRealDir = p => !bool || !filterRoot.includes(p),
                toAbsolute = root => p => D.join2(root, p),
                check = D.stat(mountpoint) && FS.readdir(mountpoint).filter(isRealDir).map(toAbsolute(mountpoint));
            if (!check) return console.log('mount:PATH ERROR');
            while (check.length) {
                let path = check.shift();
                if (!bool && path == mountpoint) continue;
                let stat = D.stat(path);
                if (stat) {
                    entries[path] = {
                        timestamp: stat.mtime
                    }
                    if (FS.isDir(stat.mode) && bool) {
                        check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)))
                    }

                }
            }
            return entries;
        }
        stat(path) {
            let D = this,
                FS = D.FS,
                pathinfo = FS.analyzePath(path);
            if (pathinfo.exists && pathinfo.object.node_ops && pathinfo.object.node_ops.getattr) {
                return FS.stat(path);
            }
        }
        getFileDataAsTypedArray(node) {
            if (!node.contents) return new Uint8Array;
            if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
            return new Uint8Array(node.contents)
        }
        join() {
            var paths = Array.prototype.slice.call(arguments, 0);
            return this.normalize(paths.join("/"))
        }

        join2(l, r) {
            return this.normalize(l + "/" + r)
        }
        normalize(path) {
            var isAbsolute = path.charAt(0) === "/",
                trailingSlash = path.substring(-1) === "/";
            path = this.normalizeArray(path.split("/").filter(p => {
                return !!p
            }), !isAbsolute).join("/");
            if (!path && !isAbsolute) {
                path = "."
            }
            if (path && trailingSlash) {
                path += "/"
            }
            return (isAbsolute ? "/" : "") + path
        }

        normalizeArray(parts, allowAboveRoot) {
            var up = 0;
            for (var i = parts.length - 1; i >= 0; i--) {
                var last = parts[i];
                if (last === ".") {
                    parts.splice(i, 1)
                } else if (last === "..") {
                    parts.splice(i, 1);
                    up++
                } else if (up) {
                    parts.splice(i, 1);
                    up--
                }
            }
            if (allowAboveRoot) {
                for (; up; up--) {
                    parts.unshift("..")
                }
            }
            return parts
        };
        updatePromise(stream) {
            let D = this;
            return new Promise((resolve, reject) => {
                if (!D.updateList.includes(stream.node.mount)) D.updateList.push(stream.node.mount);
                let Timer = setInterval(() => {
                    if (D.updateTime && Timer != D.updateTime) {
                        clearInterval(Timer);
                        reject('other update');
                    }
                    if (stream.fd == null || D.FS.streams[stream.fd] == null) {
                        clearInterval(Timer);
                        resolve('ok');
                    }
                }, D.speed);
                D.updateTime = Timer;
            });
        }
        updatePath = [];
        updateList = [];
        async updateMount() {
            let D = this;
            if (D.updateList.length) {
                let list = D.updateList.map(async mount => D.syncfs(mount, e => console.log(e)));
                D.updateList = [];
                D.updatePath = [];
                await Promise.all(list);
            }
        }
        update(stream) {
            let D = this;
            if (!D.getStore(stream.node.mount)) return;
            if (stream.path && stream.fd != null && !D.updatePath.includes(stream.path)) {
                D.updatePath.push(stream.path)
                D.updatePromise(stream).then(result => D.updateMount());
            }
        }
        ReadFile(file) {
            if (this.FS.analyzePath(file).exists) return this.FS.readFile(file);
        }
        MKFILE(path, data, bool) {
            if (!this.Module) return;
            let FS = this.FS,
                dir = path.split('/');
            if (dir.length) dir = dir.slice(0, -1).join('/');
            else dir = '/';
            if (!FS.analyzePath(dir).exists) {
                let pdir = dir.split('/').slice(0, -1).join('/');
                if (!FS.analyzePath(pdir).exists) FS.createPath('/', pdir, !0, !0);
                FS.createPath('/', dir, !0, !0);
            }
            if (typeof data == 'string') data = new TextEncoder().encode(data);
            if (bool) {
                if (FS.analyzePath(path).exists) FS.unlink(path);
                FS.writeFile(path, data, {
                    //canOwn: true,
                    encoding: "binary"
                });
            } else if (!FS.analyzePath(path).exists) {
                FS.writeFile(path, data, {
                    //canOwn: true,
                    encoding: "binary"
                });
            }
        }
    }(T),ElmBody = T.$(M.elmid),USERPATH = '/home/web_user/retroarch/userdata';
    I.defines(M,{DISK},1);
    DISK.SetDB({
        libjs: T.getStore('data-libjs'),
        roms: T.getStore('data-roms'),
        system: T.getStore('data-system'),
        bios: T.getStore('data-bios'),
        config: T.getStore('data-config'),
        userdata: T.getStore('data-userdata'),
    });
    DISK.DB[USERPATH] = DISK.DB.userdata;
    var coreJson,ELMENTS = {},resultID = '#emu-welcome-result';
    M.aspect = 1.5;
    M.shaderList = [];
    M.print = (text)=>M.CF('print',text);
    M.printErr = (text)=>M.CF('printErr',text);
    M.onRuntimeInitialized = ()=>M.CF('RuntimeInitialized');
    var getText = (name,version,type)=>T.FetchItem({
        url:ROOT['root']+name+'?'+T.time,
        key:F.LibKey+F.getname(name),
        store:M.isLocal?undefined:T.LibStore,
        process:e=>T.$('#emu-status').innerHTML = e,
        decode:true,
        version,type
    }),
    getCores = (name,type)=>T.FetchItem({
        url:ROOT['cores']+name,
        store:DISK.DB.system,
        process:e=>T.$('#emu-status').innerHTML = e,
        type
    }),
    getFShtml = str => I.toArr(DISK.getPathList(str)).map(entry => `<li data-root="${entry[0]}"><p data-root="${entry[0]}">${entry[0]}</p><p data-root="${entry[0]}">${entry[1].timestamp.toLocaleString()}</p></li>`).join("");
    
    var cfgpath = "/home/web_user/retroarch/userdata/retroarch.cfg";
    I.assign(M.action,{
        async PlayNow(){
            /*
            get json form base.js F12;
        var X= {
            "PlayStation":"psx",
            "Virtual Boy":"vb",
            "Nintendo DS":"nds",
            "Nintendo 64":"n64",
            "NES":"nes",
            "Neo-Geo Pocket":"ngp",
            "Neo-Geo CD":"ngc",
            "Sega Saturn":"segasaturn",
            "Sega Systems":"segamd",
            "SNES":"snes",
            "WonderSwan":"wanderswan",
            "Atari 2600":"a2600",
            "Atari 5200":"a5200",
            "Atari 7800":"a7800",
            "Atari 5200":"a5200",
            'Atari Jaguar':'jaguar',
            "Atari Lynx":"lynx",
            "3DO":"3do",
            "GB/GBC/GBA":"gba",
        };
            var K={};
            I.toArr(coreNames,entry=>{
                let core = entry[0];
                if(!installedCores.includes(core)) return;
                K[core] = {core:entry[1]};
                if(systems[core])K[core]['name'] = systems[core];
                K[core]['extensions'] = "";
                if(systems[core]&&fileExts[systems[core]])K[core]['extensions'] += fileExts[systems[core]]+",";
                K[core]['extensions'] += cdromCores.includes(core) ? cdromExts+"," : "";
                K[core]['extensions'] += playlistCores.includes(core) ? playlistExts : "";
                K[core]['extensions'] = K[core]['extensions'].split(',').map(v=>v.trim().replace(/^\./,'')).filter(v=>v!='');
                K[core]['saves'] = !noSaveCores.includes(core);
                K[core]['multisaves'] = multiSaveCores.includes(core);
                K[core]['state'] = !noStateCores.includes(core);
                if(coreOptions[core])K[core]['options'] = coreOptions[core];
                //if(coreGithubLinks[core])K[core]['github'] = coreGithubLinks[core];
                if(bioses[core])K[core]['bios'] = bioses[core];
                if(X[systems[core]])K[core]['sys'] = X[systems[core]];
                });
            console.log(JSON.stringify(K));
            */
           var func = async ()=>{
                coreJson = await getText('cores.json',T.version,'json');
                let urlinfo = I.FormGet(M.JSURLINFO[1]||location.search),coreName = urlinfo.get('core')||urlinfo.get('system');
                if(!I.none(W.emu_system)) coreName = W.emu_system;
                if(coreName&&coreJson[coreName]){
                        M.romName = urlinfo.get('game')||urlinfo.get('rom');
                        if(!I.none(W.emu_rom)) M.romName = W.emu_rom;
                        M.coreName =  coreName;
                        M.coreInfo =  coreJson[coreName];
                        M.CF('HtmlInstall');
                }else{
                        M.CF('SelectCores');
                }
                func = null;
           };
            if(!M.JSpath.includes(location.host)){
                T.$(resultID).innerHTML =`<div><button class="emu-game-start">${T.getLang('Play Now!')}</button></div>`;
                T.once('.emu-game-start','click',func);
            }else{
                func();
            }
        },
        async SelectCores(){
            let html = '<ul class="emu-core-ul">',icons={};
            var iconsu8 = await  T.FetchItem({
                url:ROOT['root']+'zip/system-icons.zip',
                store:DISK.DB.libjs,
                process:e=>T.$('#emu-status').innerHTML = e,
                version:T.version,
                unpack:true,
            });
            I.toArr(iconsu8,entry=>icons[entry[0]] = F.URL(entry[1],F.getMime('png')));
            T.null(iconsu8);
            iconsu8 = null;
            I.toArr(coreJson,entry=>{
                let [coreName,coreInfo] = entry;
                html+=`<li class="emu-core-item" data-core="${coreName}">${(coreInfo.sys&&icons[coreInfo.sys+'.png']?`<img class="emu-core-img" src="${icons[coreInfo.sys+'.png']}">`:`<p class="emu-core-sys">${coreInfo.name}</p>`)}<p class="emu-core-name">${coreInfo.core}</p></li>`;

            });
            var func = e=>{
                var core = null,elm = e.target;
                if(I.elm(elm)&&elm != result){
                    core = elm.getAttribute('data-core');
                    if(!core)return;
                     T.un(result,'click',func);
                     func=null;
                     M.coreName =  core;
                     M.coreInfo =  coreJson[core];
                     M.CF('HtmlInstall');
                }
            },result = T.$(resultID);
            result.innerHTML = html+'</ul>';
            T.on(result,'click',func);
        },
        HtmlInstall(){
            I.toArr(ElmBody.children,elm=>{
                ELMENTS[T.attr(elm,'class').replace('emu-','')] = elm;
            });
            if(I.mobile){
                M.CF('HtmlMobile');
            }
            T.$append(ELMENTS['resume'],T.$ct('div',T.getLang('Click to work'),'emu-resume-txt'));
            M.CF('HtmlSetting');
            I.toArr(
                {
                    cache(ElmCache){
                        ElmCache.hidden = true;
                        ElmCache.innerHTML = `<div class="emu-dialog-container"></div><div class="emu-dialog-footer"><button class="emu-dialog-close">${T.getLang('close')}</button></div>`;
                        var ElmContainer = T.$('.emu-dialog-container',ElmCache);
                        T.on(ElmCache,'opendialog',async e=>{
                            ElmCache.hidden = false;
                            let html = `<h3>${T.getLang('Local Virtual File System')}</h3><ul class="fspath">${getFShtml('/home/web_user/retroarch/userdata/')}</ul>`;
                            I.toArr(T.F.DataBase, entry => {
                                html += `<h3>${T.getLang('Database Name:')}${entry[0]}</h3><ul>`;
                                I.toArr(entry[1].objectStoreNames, table => html += `<li><h6 data-name="${entry[0]}" data-table="${table}">${T.getLang('Database Table:')}${table}</h6><ul></ul></li>`);
                                html += '</ul>';
                            });
                            ElmContainer.innerHTML = html;
                        });
                        T.on(T.$('.emu-dialog-close',ElmCache),'click',e=>{
                            M.CF('CloseDialog','cache')
                        });
                        Nttr(ElmContainer).click(async e => {
                            let elm = e.target,
                                data = I.elmdata(elm);
                            if (data.name && data.table) {
                                let store = T.getStore(data.table, data.name);
                                if (data.downpath) {
                                    let contents = await store.data(data.downpath);
                                    if (I.obj(contents)) {
                                        I.toArr(contents, entry => T.down(entry[0], entry[1]));
                                        T.null(contents);
                                    } else {
                                        T.down(T.F.getname(data.downpath), contents);
                                    }
                                    contents = null;
                                } else if (data.removepath) {
                                    elm.parentNode.parentNode.remove();
                                    await store.remove(data.removepath);
                                } else if (data.replacepath) {
                                    I.toArr(data, e => elm.removeAttribute(e[0]));
                                    M.CF('upload', async file => {
                                        if (store == DISK.DB.system) {
                                            let sysdata = await store.get(data.replacepath);
                                            sysdata.contents = await T.unFile(file, e => elm.innerHTML = e);
                                            await store.put(data.replacepath, sysdata);
                                            elm.innerHTML = T.getLang('OK!');
                                            T.null(sysdata);
                                            sysdata = null;
                                        }
                                    }, {
                                        accept: data.accept || ''
                                    });
                                } else {
                                    let keys = await store.keys(),
                                        html = '';
                                    if (!keys || !keys.length) return elm.nextElementSibling.innerHTML = `<p>${T.getLang('Empty')}</p>`;
                                    I.toArr(keys, key => {
                                        let other = '';
                                        if (store == DISK.DB.system) {
                                            other = `<button data-replacepath="${key}" data-name="${data.name}" data-table="${data.table}" data-accept=".zip,.data,.7z">${T.getLang('Replace Core')}</button>`;
                                        }
                                        html += `<li><p>${T.F.getname(key)}<p><button data-removepath="${key}" data-name="${data.name}" data-table="${data.table}">${T.getLang('Delete data')}</button><button data-downpath="${key}" data-name="${data.name}" data-table="${data.table}">${T.getLang('Download data')}</button>${other}</li>`
                                    });
                                    elm.nextElementSibling.innerHTML = html;
                                }
                            } else if (data.root) {
                                let FS = DISK.FS,
                                    status = FS.analyzePath(data.root),
                                    mode = status.object.mode;
                                if (FS.isDir(mode)) T.$('.fspath',ElmCache).innerHTML = getFShtml(data.root);
                                else if (FS.isFile(mode)) T.down(T.F.getname(data.root), FS.readFile(data.root))
                            }
                        });
                    }
                },
                entry=>{
                    entry[1](T.$append(ELMENTS['dialog'],T.$ct('div','','emu-dialog-item emu-dialog-'+entry[0])));
                }
            )
            M.canvas = T.$('canvas',ElmBody);
            M.coreInfo = coreJson[M.coreName];
            M.CF('loadCores');
        },
        HtmlSetting(){
            var menubtn = T.$append(ELMENTS['settings'],T.$ct('button',`<span class="emu-settings-icon"></span>`,'emu-settings-btn')),
                menudiv = T.$append(ELMENTS['settings'],T.$ct('div','','emu-settings-ctrls')),
                closeMenu = ()=>ELMENTS['settings'].classList.remove('active'),html="";
            I.toArr({
                restart(e){
                    M._cmd_reset();
                    closeMenu();
                },
                loadState(){
                    M._cmd_load_state();
                    closeMenu();
                },
                saveState(){
                    M._cmd_save_state();
                    closeMenu();
                },
                importState(){
                    M.CF('upload',async file=>{
                        let u8 = await T.unFile(file),ext='.state';
                        if(!I.u8buf(u8)){
                            u8 = I.toArr(u8).map(v=>(new RegExp('\\'+ext+'$')).test(v[0]))[0];
                        }
                        if(!u8) return;
                        DISK.MKFILE(USERPATH+'/'+F.getKeyName(M.gameName)+ext,u8,1);
                        M._cmd_load_state();
                    })
                    closeMenu();
                },
                importSaves(){
                        M.CF('upload',async file=>{
                    if(W.confirm(T.getLang('unsupport load srm,it will write saves to reload page. are you sure?'))){
                            let u8 = await T.unFile(file),ext='.srm';
                            if(M.sysName=='nds')ext = '.dsv';
                            if(!I.u8buf(u8)){
                                u8 = I.toArr(u8).map(v=>(new RegExp('\\'+ext+'$')).test(v[0]))[0];
                            }
                            if(!u8) return;
                            DISK.MKFILE(USERPATH+'/'+F.getKeyName(M.gameName)+ext,u8,1);
                            location.reload();

                    }

                        })
                    closeMenu();
                },
                autoSaves(){
                    if(!I.none(M.autoSavesTime))clearInterval(M.autoSavesTime);
                    let open = T.$('.emu-settings-menu-autoSaves').classList.toggle('active');
                    if(open){
                        M.autoSavesTime = setInterval(()=>{
                            M._cmd_savefiles&&M._cmd_savefiles();
                        },10000);
                    }
                },
                showCache(){
                    closeMenu();
                    M.CF('ShowDialog','cache');
                }
            },
            entry=>{
                let name = entry[0].replace(/([A-Z]+?)/g,(a,b)=>b&&` ${b.toLowerCase()}`||'');
                T.on(
                    T.$append(menudiv,T.$ct('button',`<span>${T.getLang(name)}</span>`,'emu-settings-menu-item emu-settings-menu-'+entry[0])),
                    'pointerup',
                    e=>entry[1](e)
                );
            });
            //M.cwrap('cmd_set_shader','null',['string'])('crt-easymode.glslp')
        },
        HtmlMobile(){
            let btn = (k,s,t)=>`<button class="emu-${t||'dp'}-btn" ${(k?`data-key="${k}"`:'')}>${(s?(I.str(s)?s:s()):'')}</button>`;
            T.$append(ELMENTS['controls'],T.$ct('div',()=>{
                let html = '',t=['up','down'],m;
                I.toArr(['left','right'],v=>{
                    I.toArr(t,x=>{
                        html+=btn(v+','+x);
                        if(!m)html+=btn(x);
                    });
                    html+=btn(v);
                    if(!m)html+=btn();
                    m=!0;

                });
                return html;
            },'emu-dpad'))
            T.$append(ELMENTS['controls'],T.$ct('div',()=>{
                let html = '';
                I.toArr(['x','y','a','b'],v=>{
                    html+=btn(v,v.toUpperCase(),'ab');
                });
                return html;
            },'emu-xyab'))
            T.$append(ELMENTS['controls'],T.$ct('div',()=>{
                let html = '';
                I.toArr(['l','r'],v=>{
                    html+=btn(v,v.toUpperCase(),'lr');
                });
                return html;
            },'emu-lbrt'));
            T.$append(ELMENTS['controls'],T.$ct('div',()=>{
                let html = '';
                I.toArr(['select','start'],v=>{
                    html+=btn(v,v.toUpperCase(),'ss');
                });
                return html;
            },'emu-bottom'))

        },
        async HtmlWelcome(){
            var system = M.sysName,
                sysExt = system+'-',
                ElmResult = T.$(resultID),
                WelResult = T.$('.emu-wel-result',ElmResult),
                WelMenu = T.$('.emu-wel-menu',ElmResult),
                Welroms = T.$('.emu-wel-roms',ElmResult),
                Welbios = T.$('.emu-wel-bios',ElmResult),
                Welgame = T.$('.emu-wel-game',ElmResult),
                creatBtn = (gamename,text)=>`<p class="emu-wel-p">${gamename}</p><button class="emu-wel-btn" data-path="${gamename}">${T.getLang(text)}</button>`,
                writefile = async (name,u8,index)=>{
                    var store =  DISK.DB[index>1?'bios':'roms'],
                        gamename = name.replace(sysExt,'');
                    T.$append(WelResult,T.$ct('div',gamename+'  '+T.getLang('is write')));
                    if(u8){
                        if(u8.length <=T.maxsize){
                            await store.setData(sysExt+gamename,u8,{
                                system:system
                            });
                        }
                    }else{
                        u8 = await store.data(sysExt+gamename);
                    }
                    DISK.MKFILE((index>1?'/system/':'')+gamename,u8);
                    if(index<2){
                        T.$append(Welgame,T.$ct('li',creatBtn(gamename,'play this'),'emu-wel-li'));
                    }
                    u8=null;

                },
                upload = index=>{
                    M.CF('upload',async file=>{
                        let elm = T.$append(WelResult,T.$ct('div',file.name)),u8;
                        if(index==1||index==3)u8 = await T.unFile(file,e=>elm.innerHTML = file.name+':'+e);
                        else u8 = I.U8(await file.arrayBuffer());
                        if(I.u8buf(u8)){
                            await writefile(file.name,u8,index);
                        }else{
                            await I.Async(I.toArr(u8).map(async entry=>writefile(entry[0],entry[1],index)));
                            T.null(u8);
                        }
                        file = null;
                        u8=null;
                    });
                },
                resultfunc = async (e,index)=>{
                    let elm = e.target,data = I.elmdata(elm);
                    if(data.path){
                        writefile(data.path,null,index?2:1);
                        elm.parentNode.remove();
                    }else if(data.down){
                        let name = F.getname(data.down);
                        await T.FetchItem({
                            url:data.down,
                            key:sysExt+name,
                            store:DISK.DB[index?'bios':'roms'],
                            dataOption:{
                                system:system
                            },
                            success(u8){
                                DISK.MKFILE((index?'/system/':'')+name,u8);
                                T.$append(WelResult,T.$ct('div',data.down+'  '+T.getLang('is write')));
                                if(!index){
                                    T.$append(Welgame,T.$ct('li',creatBtn(name,'play this')));
                                }
                            }
                        });
                    }
                };
            I.toArr(
                {
                    'importRoms':'import roms',
                    'importDeRoms':'decompressed roms',
                    'importBios':'import bios',
                    'importDeBios':'decompressed bios',
                },
                (entry,index)=>{
                    let elm = T.$append(WelMenu,T.$ct('button',T.getLang(entry[1]),'emu-wel-menu-btn emu-wel-btn'));
                    T.on(elm,'pointerdown',e=>upload(index));
                }
            );
            I.toArr({
                roms:await DISK.DB.roms.keys({
                    index: 'system',
                    Range: IDBKeyRange.only(system)
                }),
                bios:await DISK.DB.bios.keys({
                    index: 'system',
                    Range: IDBKeyRange.only(system)
                }),
            },(entry,index)=>{
                let html = "",elm = T.$('.emu-wel-'+entry[0],ElmResult);
                I.toArr(entry[1],v=>{
                    v = v.replace(sysExt,'');
                    html += `<li class="emu-wel-li">${creatBtn(v,'Write')}</li>`
                });
                if(html){
                    elm.innerHTML = html;
                    T.on(elm,'pointerup',e=>resultfunc(e,index));
                }else{
                    elm.remove();
                }
            });
            T.on(Welgame,'pointerup',e=>{
                let elm = e.target,data = I.elmdata(elm);
                if(data.path){
                    M.romName = data.path;
                    M.gameName = F.getname(M.romName);
                    M.arguments[1] = M.gameName;
                    return M.CF('callMain');;
                }
            });
        },
        ShowDialog(name){
            ELMENTS['dialog'].classList.add('active');
            T.triger(T.$('.emu-dialog-'+name,ELMENTS['dialog']),'opendialog');
        },
        CloseDialog(name){
            ELMENTS['dialog'].classList.remove('active');
            if(name)T.$('.emu-dialog-'+name,ELMENTS['dialog']).hidden = true;
            else I.toArr(ELMENTS['dialog'].children,elm=>elm.hidden=!0);
        },
        async loadCores(){
            M.wasmBinary = await getCores(M.coreName+'_libretro.wasm');
            let wasmjs = await getCores(M.coreName+'_libretro.js','text'),
                Fixjs = await getText('Fix.js',M.version);
                if(I.u8buf(Fixjs))Fixjs = I.decode(Fixjs);
                wasmjs+=Fixjs;
            (new Function('Module',wasmjs))(M);
            console.log(M.arguments);
        },
        print(text){
            console.log(text);

        },
        printErr(text){
            var matchdata;
            if(matchdata = text.match(/Video\s*@\s*(\d+)x(\d+)/)){
                M.videoWidth = matchdata[1];
                M.videoHeight = matchdata[2];
                T.triger(window,'resize');
            }
            console.log(text);
        },
        async RuntimeInitialized(){
            var text = '',path = '/home/web_user/retroarch/bundle/assets/glui/';
            DISK.SetModule(M);
            
            DISK.FS['createPath']('/', USERPATH, !0, !0);
            DISK.FS.mount(DISK,{},USERPATH);
            DISK['action']['indexdb-sync'] = (a, b) => {
                text = b.join('<br>')+'<br>';
            }
            await DISK.mountReady();
            if(!M.FS.analyzePath(cfgpath).exists){
                let cfgtext = await getText('retroarch.cfg',M.version);
                text += T.getLang('RetroArch Config Write:')+F.getname(cfgpath)+'<br>';
                DISK.MKFILE(cfgpath,cfgtext,1);
            };
            await T.FetchItem({
                url:ROOT['root']+'zip/shader.zip',
                store:T.LibStore,
                unpack:true,
                success(data){
                    I.toArr(data,entry=>{
                        if(/\.glslp$/.test(entry[0]))M.shaderList.push(entry[0]);
                        text += T.getLang('FS Shader Write:')+entry[0]+'<br>';
                        DISK.MKFILE('/shader/'+entry[0],entry[1],1);
                    });
                    T.null(data);
                    data = null;
                }
            });
            await T.FetchItem({
                url:ROOT['root']+'zip/glui.zip',
                store:T.LibStore,
                unpack:true,
                success(data){
                    I.toArr(data,entry=>{
                        text += T.getLang('FS UI Write:')+entry[0]+'<br>';
                        DISK.MKFILE(path+entry[0],entry[1],1);
                    });
                    T.null(data);
                    data = null;
                }
            });
            M.RA.context = new window["AudioContext"] || window["webkitAudioContext"];
            M.wasmBinary = null;
            delete M.wasmBinary;
            M.sysName = M.coreInfo['sys']||M.coreName;
            M.CF('Button_'+M.sysName);
            ELMENTS['controls'].classList.add('emu-sys-'+M.sysName);
            M.FS.createPath('/',"system",!0,!0);
            if(M.romName){
                M.gameName = F.getname(M.romName);
                M.arguments[1] = M.gameName;
                return M.CF('callMain');;
            }else{
                text = 
`<div class="emu-wel-menu"></div>
<ul class="emu-wel-game"></ul>
<ul class="emu-wel-bios"></ul>
<ul class="emu-wel-roms"></ul>
<ul class="emu-wel-result"></ul>`+text;
            }
            T.$(resultID).innerHTML = text;
            ELMENTS['welcome'].scroll(0,0);
            if(T.$('.emu-wel-menu')){
                M.CF('HtmlWelcome');
            }
            return ;
            DISK.MKFILE(game,await T.FetchItem({
                url:'./game/'+game,
            }),1);
            M.arguments[1] = game;
        },
        async callMain(){
            if(!M.FS.analyzePath(M.gameName).exists){
                if(!M.romName) return ;
                DISK.MKFILE(M.gameName,await T.FetchItem({
                    url:M.romName,
                }),1);
            }
            await M.RA.context.resume();
            if(M.RA.context.state!="running"){
                ELMENTS['resume'].hidden = false;
                T.once(ELMENTS['resume'],'click',e=>{
                    //M.RA.context = new window["AudioContext"] || window["webkitAudioContext"];
                    M.RA.context.resume().then(e=>{
                        if(!ELMENTS['resume'].hidden){
                            M.callMain(M.arguments);
                            M.CF('BindEvent');
                        }
                        ELMENTS['resume'].hidden = true;

                    });
                })
                
            }else{
                M.callMain(M.arguments);
                M.CF('BindEvent');
            }
            T.on(document,'visibilitychange',e=>{
                console.log(document.visibilityState);
                if(document.visibilityState=='visible'){
                    M.resumeMainLoop();
                }else{
                    M.pauseMainLoop();
                }
            });
        },
        BindEvent(){
            ELMENTS['welcome'].remove();
            T.on(window,'resize',e=>{
                if(!M.videoWidth) return;
                clearTimeout(M.resizeTimer);
                M.resizeTimer = setTimeout(()=>{
                    let {width,height} = ElmBody.getBoundingClientRect();
                    M.aspect = M.videoWidth/M.videoHeight;
                    I.setStyle(
                        ElmBody,
                        {
                            '--width':width+'px',
                            '--height':height+'px',
                            '--aspect-hw':1/M.aspect,
                            '--aspect-wh':M.aspect
                        }
                    );
                    if(M.setCanvasSize){
                        let {width,height} = M.canvas.getBoundingClientRect();
                        let swidth = width>720?width:720;
                        M.setCanvasSize(swidth,swidth*height/width);
                        if(M.keyMap){
                            M.CF('keyClick',M.keyMap['menu_toggle']);
                            setTimeout(()=>M.CF('keyClick',M.keyMap['menu_toggle']),500);
                        }
                    }
                },300);
            });
            let sbtn = T.$('.emu-settings-btn',ELMENTS['settings']);
            T.on(sbtn,'pointerdown',e=>{
                ELMENTS['settings'].classList.toggle('active');
            })
            T.on(document.body,'contextMenu',T.stopEvent);
            T.on(document.body,'keydown',T.stopEvent);
            T.on(document.body,'keyup',T.stopEvent);
            T.on(M.canvas,'contextMenu',T.stopEvent);
            if(M.shaderList.length){
                let  menudiv = T.$('.emu-settings-ctrls',ELMENTS['settings']);
                I.toArr(M.shaderList,v=>{
                    
                T.on(
                    T.$append(menudiv,T.$ct('button',`<span>${v}</span>`,'emu-settings-menu-item')),
                    'pointerup',
                    e=>{ELMENTS['settings'].classList.remove('active');M.cwrap('cmd_set_shader','null',['string'])(v)}
                );
                })
            }
            M.CF('BindButton');
        },
        async BindButton(){
            await M.CF('keyInit');
            ELMENTS['welcome'].remove();
            ELMENTS['screen'].hidden = false;
            ELMENTS['settings'].hidden = false;
            ELMENTS['dialog'].hidden = false;
            T.triger(window,'resize');
            if(!I.mobile) return;
            console.log(1);
            ELMENTS['controls'].hidden = false;
            T.stopGesture(ELMENTS['controls']);
            let btns = T.$$('button',ELMENTS['controls']);
            M.touchlist = [];
            I.toArr(['touchstart', 'touchmove', 'touchend', 'touchcancel'],evt=>{
                if(btns)I.toArr(btns,elm=>T.on(elm,evt,T.stopEvent));
                console.log(evt);
                T.on(ELMENTS['controls'],evt, e => {
                    let newlist = [];
                    if (e.type == 'touchstart') {
                        newlist = M.touchlist.concat(M.CF('dataKey',e.target));
                    }else if (e.touches&&e.touches.length) {
                        newlist = I.toArr(e.touches).map(entry =>M.CF('dataKey',document.elementFromPoint(entry.pageX, entry.pageY)));
                    } 
                    if (newlist.length > 0) {
                        newlist = newlist.join(',').split(',').filter(v=>v&&v.trim()!='');
                    }else{
                        newlist = [];
                    }
                    if (newlist.join(',') != M.touchlist) {
                        M.CF('keyChange',M.touchlist,newlist);
                        M.touchlist = newlist;
                    }
                    T.stopEvent(e);
                }, {
                    passive: false
                });
            });
        },
        async keyInit(){
            if(typeof codeToConfigIDMap == 'undefined')await T.loadLibjs(ROOT['assets']+'charToCodeMap.js')
            if(!M.keyMap){
                let retroarchcfg = I.decode(DISK.FS.readFile(cfgpath));
                var keyMap = {};M.configData = {};
                if(!M.keyToCode){
                    M.keyToCode={};
                    I.toArr(codeToConfigIDMap,entry=>{
                        M.keyToCode[entry[1]] = entry[0];
                    });
                }
                retroarchcfg.split('\n').forEach(v=>{
                    let arr = v.match(/^(\w+)\s=\s("|')?(.+?)("|')?$/);
                    if(arr&&arr[1]&&arr[3]){
                        M.configData[arr[1]] = arr[3]=="false"?false:arr[3]=='true'?true:isNaN(arr[3])?arr[3]:parseInt(arr[3]);
                        if(/^input_player1_[a-z0-9]+?(.+?\_(minus|plus))?$/.test(arr[1])){
                            let key = arr[1].replace('input_player1_','');
                            keyMap[key] = M.configData[arr[1]];
                        }else if(['input_load_state','input_save_state','input_menu_toggle'].includes(arr[1])){
                            keyMap[arr[1].replace('input_','')] = M.configData[arr[1]];
                        }
                    }
                });
                M.keyMap = {};
                I.toArr(keyMap,entry=>{
                    M.keyMap[entry[0]] = charToCodeMap[entry[1]]||M.keyToCode[entry[1]]&&{code:M.keyToCode[entry[1]],key:entry[1]}||entry[1];
                });
            }
        },
        keyChange(touchlist,newlist){
            I.toArr([touchlist,newlist],(v,index)=>I.array(v)&&I.toArr(v,k=>{
                let elm = T.$('[data-key="'+k+'"]',ELMENTS['controls']);
                if(elm)elm.classList[index!=1?'remove':'add']('active');
                M.CF('keyEvent',k,index!==0);
            }));
        },
        keyEvent(key,type){
            if(!M.keyMap)M.CF('keyInit');
            T.triger(document,I.R(18,type ? 'keydown' : 'keyup', I.str(key)?M.keyMap[key]:key));
        },
        keyClick(key){
            M.CF('keyEvent',key,!0);
            setTimeout(()=>M.CF('keyEvent',key,!1),300);
        },
        dataKey(elm){
            if(I.elm(elm)) return I.elmdata(elm)['key'];
        },
        Button_gba(){
            if(!I.mobile) return ;
            I.toArr(['x','y'],v=>T.$('[data-key="'+v+'"]',ELMENTS['controls']).remove());
        },
        Button_n64(){
            //Module['TOTAL_MEMORY'] = 0x12c00000;
            if(!I.mobile) return ;
            T.$('[data-key="a"]',ELMENTS['controls']).innerHTML = '↓';
            T.$('[data-key="b"]',ELMENTS['controls']).innerHTML = 'A';
            T.$('[data-key="x"]',ELMENTS['controls']).innerHTML = '↑';
            T.$('[data-key="y"]',ELMENTS['controls']).innerHTML = 'B';
            T.$('[data-key="l"]',ELMENTS['controls']).innerHTML = '←';
            T.$('[data-key="r"]',ELMENTS['controls']).innerHTML = '→';
            T.$('[data-key="select"]',ELMENTS['controls']).innerHTML = 'Z';
            T.$('[data-key="select"]',ELMENTS['controls']).setAttribute('data-key','l2');
            M.CF('Build_joystick',[
                'l_x_minus',
                'l_x_plus',
                'l_y_minus',
                'l_y_plus'
            ],'joystick');


        },
        async Build_joystick(keyvalue,name){
            if(!T.nipplejs)await T.loadLibjs(ROOT.root+'nipplejs.js');
            var joystick = T.$append(ELMENTS['controls'],T.$ce('div')),
            nipplejsGamepad = T.nipplejs.create({
                'zone': joystick,
                'mode': 'static',
                'position': {
                    'left': '50%',
                    'top': '50%'
                },
                'color': 'red'
            });
            W.kk = nipplejsGamepad;
            nipplejsGamepad['on']('end', function (event, detail) {
                M['CF']('keyEvent',keyvalue[0],!1);
                M['CF']('keyEvent', keyvalue[1],!1);
                M['CF']('keyEvent',keyvalue[2],!1);
                M['CF']('keyEvent', keyvalue[3],!1);
                
            });
            nipplejsGamepad['on']('move', function (event, detail) {
                let {x,y} = detail.vector;
                //console.log(x, y);
                console.log(x,y);
                if (x > 0.4) {
                    M['CF']('keyEvent',keyvalue[0],!1);
                    M['CF']('keyEvent', keyvalue[1],!0);
                } else if(Math.abs(x)>0.4){
                    M['CF']('keyEvent',keyvalue[0],!0);
                    M['CF']('keyEvent', keyvalue[1],!1);
                }else{
                    M['CF']('keyEvent',keyvalue[0],!1);
                    M['CF']('keyEvent', keyvalue[1],!1);
                }
                if (y > 0.4) {
                    M['CF']('keyEvent',keyvalue[2],!0);
                    M['CF']('keyEvent', keyvalue[3],!1);
                } else if(Math.abs(y)>0.4){
                    M['CF']('keyEvent',keyvalue[2],!1);
                    M['CF']('keyEvent', keyvalue[3],!0);
                }else{
                    M['CF']('keyEvent',keyvalue[2],!1);
                    M['CF']('keyEvent', keyvalue[3],!1);
                }
            });
            joystick.classList.add('emu-'+name);

        },
        upload(func,ARG) {
            let input = T.$ce('input');
            input.type = 'file';
            //if (bool) input.multiple = true;
            //accept
            if (ARG) I.toArr(ARG, entry => input.setAttribute(entry[0], entry[1]));
            input.onchange = e => {
                let files = e.target.files;
                if (files && files.length > 0) {
                    I.toArr(files, file => func(file));
                }
                input.remove();
            };
            input.click();
        },

    });
    M.CF('PlayNow');


//}).call(Module)