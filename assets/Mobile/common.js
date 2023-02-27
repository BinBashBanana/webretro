const Nenge = new class NengeCores {
    version = 1;
    DB_NAME = 'XBBS';
    DB_STORE_MAP = {
        libjs: {},
        myfile: {timestamp: false}
    };
    constructor() {
        const T = this,
            I = T.I;
        self.Nenge = T;
        T.language = I.language;
        T.i18nName = I.i18n;
        T.on(window, 'error', e => {
            //debug
            if (I.mobile) alert(e.message);
            else console.log(e);
        });
        T.triger(document, 'NengeStart', {detail:T});
        T.docload(e => T.triger(document, 'NengeReady', {detail:T}));

    }
    LibStore = 'libjs';
    maxsize = 0x6400000;
    part = '-part-';
    lang = {};
    action = {};
    StoreTable = {};
    JSpath = document.currentScript && document.currentScript.src.split('/').slice(0, -1).join('/') + '/';
    get date() {
        return new Date();
    }
    get time() {
        return this.date.getTime();
    }
    get rand() {
        return Math.random()
    }
    get randNum() {
        return this.I.Int(this.rand.toString().slice(2))
    }
    async getItem(store, name, version, ARG = {}) {
        if (!name) return await this.getAllData(store, 1, ARG);
        let T = this,
            F = T.F,
            I = T.I,
            result = await F.dbGetItem(I.assign({store,name}, ARG));
        if (I.obj(result)) {
            let maxsize = T.maxsize,
                part = T.part,
                keyName = name.split(part)[0],
                ver = result.version,
                num = result.filesize/maxsize,
                type = result.type;
            if (version && ver && ver != version) {
                result = undefined;
            } else if (num>1) {
                result.contents = I.R(14,(await I.Async(I.toArr(num).map(async k=> {
                    let newkey = keyName;
                    if (k > 0) newkey += part + k;
                    if (newkey == name) {
                        return result.contents;
                    }else {
                        let r = await F.dbGetItem(I.assign(ARG, {store,name: newkey}));
                        return r&&r.contents||I.U8(0);
                    }
                }))),result.filename || keyName, {
                    type: result.filetype || F.getMime(result.filename || keyName)
                });
            }
            let contents = result.contents;
            if (contents&&!I.str(contents)&&!I.obj(contents)) {
                if (type == 'unpack') {
                    contents = await F.unFile(contents, {password:ARG.password||result.password,process:ARG.process});
                }else if(['String','Json'].includes(type)) {
                    contents = I.blob(contents)?await contents.text():I.decode(contents);
                    if(type=='Json'||/json/.test(result.filetype))contents = I.Json(contents);
                }else if(type != 'File'&&I.blob(contents)){
                    contents = I.U8(await contents.arrayBuffer());
                }
                result.contents = contents;
            }
        }
        return result;
    }
    async setItem(store, name, data, dbName) {
        let T = this,
            F = T.F,
            I = T.I,
            maxsize = T.maxsize,
            part = T.part;
        if(I.obj(data)&&data.contents){
            let contents = data.contents;
            contents = await F.dbU8(contents,maxsize);
            if(I.u8buf(contents)&&contents.byteLength > maxsize){
                let filesize = contents.byteLength;
                data.filesize = filesize;
                data.contents = null;
                delete data.contents;
                data = I.toObj(I.toArr(data).filter(e=>!I.none(e[1])));
                return await I.Async(
                    I.toArr(filesize / maxsize).map(
                        k=>(k *=maxsize,I.U8(contents.subarray(k, filesize - k >= maxsize ? k + maxsize : filesize)))
                    ).map(
                        async (v,k)=>F.dbPutItem({
                            store,
                            data: I.assign({contents:v}, data),
                            name: k>0?name + part + k:name,
                            dbName
                        })
                    )
                )&&(name=null,filesize=null,maxsize=null,contents = null,T.null(data));
            }else{
                data.contents = contents;
            }
        }else if(data){
            data = await F.dbU8(data,maxsize);
            if(I.u8buf(data)&&data.byteLength > maxsize){
                return T.setItem(store, name, {contents:data,timestamp:T.date}, dbName);
            }
        }
        return await F.dbPutItem({
            store,
            data,
            name,
            dbName
        });
    }
    async removeItem(store, name, ARG) {
        let {
            clear,
            dbName,size
        } = ARG || {}, T = this, I = T.I, F = T.F;
        if (clear) {
            if(!size){
                let contents = await F.dbGetItem(I.assign({store,name}, ARG));
                size = contents&&contents.filesize;
                T.null(contents);
            }
            if (size) {
                let keyName = name.split(T.part)[0];
                return await I.Async(I.toArr(size / T.maxsize).map(async k => {
                    let key = keyName;
                    if (k > 0) key += T.part + k;
                    return await F.dbRemoveItem({
                        store,
                        name: key
                    }) + '\n';
                }));

            }
        }
        return await F.dbRemoveItem({
            store,
            name,
            dbName
        });
    }
    async getAllData(store, only, ARG) {
        if (!store) return {};
        let T = this;
        return await T.F.dbGetAll(T.I.assign({
            store,
            only
        }, ARG));
    }
    async getContent(store, name, version, ARG) {
        let result = await this.getItem(store, name, version, ARG);
        return result && result.contents || result;
    }
    async setContent(store, name, contents, opt, dbName) {
        let T = this;
        return await T.setItem(store, name,T.I.assign({contents,timestamp: T.date},opt), dbName);
    }
    async getAllKeys(store, dbName, ARG) {
        let T = this;
        return await T.F.dbGetKeys(T.I.assign({
            store,
            dbName
        }, ARG || {}));
    }
    async getAllCursor(store, index, only, ARG) {
        let T = this;
        return await T.F.dbGetCursor(T.I.assign({
            store,
            index,
            only
        }, ARG));
    }
    async clearDB(tables, dbName) {
        let F = this.F;
        if (!tables) return;
        if (F.I.str(tables)) tables = [tables];
        return await F.dbRemoveTable(tables, dbName);
    }
    async deleteDB(tables, dbName) {
        let F = this.F;
        if (F.I.str(tables)) tables = [tables];
        return await F.deleteDatabase(tables, dbName);
    }
    getStore(table, dbName) {
        if (!table) return undefined;
        let T = this;
        if (table instanceof T.StoreBase) return table;
        dbName = dbName || T.DB_NAME;
        if(!T.StoreTable[dbName])T.StoreTable[dbName] = {};
        if(!T.StoreTable[dbName][table]) T.StoreTable[dbName][table] = new T.StoreBase(table, dbName);
        return T.StoreTable[dbName][table];
    }
    async FetchItem(ARG) {
        let T = this,
            F = T.F,
            I = T.I;
        if (!ARG || I.str(ARG)) ARG = {
            url: ARG || '/'
        };
        let arrbuff = 'arrayBuffer',
            urlname = F.getname(ARG.url),
            key = ARG.key || urlname || 'index.php',
            keyname = key == F.LibKey ? key + urlname : key,
            result, version = ARG.version,
            headers = {},
            decode = ARG.decode,
            u8decode = decode&&(I.str(decode)?s=>I.decode(s,decode):decode===true?I.decode:decode),
            Store = ARG.store && T.getStore(ARG.store),
            response,
            contents,
            unFile = (buf, password) => F.unFile(buf, I.assign(ARG, {
                password
            })),
            callback = async result => {
                if (result && result.contents) {
                    if (result.type == 'unpack') {
                        result = await unFile(result.contents, result.password);
                        if (result.password) delete result.password;
                    } else result = result.contents;
                }
                success(result);
                T.null(ARG);
                ARG = null;
                return result;
            },
            success = (result) => result && ARG.success && ARG.success(result, headers);
        delete ARG.store;
        if (!ARG.filename) ARG.filename = urlname;
        if (ARG.onLine) {
            ARG.unset = navigator.onLine;
        }
        if (Store) {
            result = await Store.get(keyname, version, ARG);
            if (result && !ARG.unset) {
                if (!ARG.checksize) {
                    return callback(result);
                }
            }
        }
        response = await F.FetchStart(ARG).catch(e => ARG.error && ARG.error(e.message));
        if (!response) return callback(result);
        headers = F.FetchHeader(response, ARG);
        I.exends(headers, response, ['url', 'status', 'statusText']);
        if (ARG.filename) headers.filename = ARG.filename;
        let password = headers['password'] || ARG.password || undefined;
        if (response.status != 200) {
            //404 500
            if (response.body) {
                response.body.cancel();
                ARG.error && ARG.error(response.statusText, headers);
            }
            if (ARG.type == 'head') success(headers);
            return callback(result);
        } else if (result && result.filesize && headers["byteLength"] > 0) {
            if (result.filesize == headers["byteLength"]) {
                response.body.cancel();
                return callback(result);
            }
            T.null(result);
            result = null;
        } else if (ARG.type == 'head') {
            response.body.cancel();
            return callback(headers);
        }
        let responseQuest = I.func(ARG.process) ? await F.StreamResponse(response, ARG.process, headers) : response;
        if (ARG.unpack) ARG.type = arrbuff;
        ARG.type = ARG.type || arrbuff;
        contents = await responseQuest[ARG.type]();
        let type = headers.type,
            filesize = headers["byteLength"] || 0,
            filetype = headers['content-type'];
        if (ARG.type == arrbuff && I.buf(contents)) {
            contents = I.U8(contents);
            if (ARG.Filter) contents = await ARG.Filter(contents);
            type = I.N(11);
            filesize = contents.byteLength;
            if (ARG.autounpack && filesize < T.maxsize * .3) {
                ARG.unpack = true;
            }
        }
        ARG.dataOption = ARG.dataOption || {};
        if (Store && ARG.unpack && key === keyname && filesize > T.maxsize) {
            type = 'unpack';
            await Store.put(keyname, I.assign({
                contents:contents,
                timestamp: new Date,
                filesize,
                filetype,
                version,
                type,
                password
            }, ARG.dataOption));
            Store = null;
        }
        if (ARG.unpack && I.u8buf(contents)) {
            contents = await unFile(contents, password);
            if (!contents.byteLength) {
                if (contents.password) {
                    password = contents.password;
                    delete contents.password;
                }
                type = 'datalist';
            }
        }
        if (Store && key !== keyname) {
            if (I.u8buf(contents)) {
                contents = F.getFileText(contents, u8decode, ARG.mime || headers['content-type'] || F.getMime(''), urlname);
                type = I.blob(contents) ? 'File' : 'String'
            } else if (I.str(contents)) {
                type = headers['content-type'] || 'String';
            } else if (type == 'datalist') {
                let contents2;
                await I.Async(I.toArr(contents).map(async entry => {
                    let [name, data] = entry,
                        filename = F.getname(name),
                        filetype = F.getMime(filename),
                        filedata = F.getFileText(data, u8decode, filetype, filename);
                    //F.Libjs[filename] = filedata;
                    await Store.put(key + filename, I.assign({
                        contents: filedata,
                        timestamp: T.date,
                        filesize: data.byteLength,
                        filetype,
                        version: T.version,
                        type: I.blob(filedata) ? 'File' : 'String'
                    }, ARG.dataOption));
                    if (ARG.filename == filename) {
                        contents2 = filedata;
                    }
                    return true;
                }));
                if (contents2) contents = contents2;
                contents2 = null;
                Store = null;
            }
        } else if (u8decode) {
            contents = F.getFileText(contents, u8decode, type);
            if (I.str(contents)) {
                type = 'String';
            }
        }
        if (Store) {
            await Store.put(keyname, I.assign({
                contents:contents,
                timestamp: T.date,
                filesize,
                filetype,
                version,
                type,
                password
            }, ARG.dataOption));
        }
        return callback(contents);
    }
    ajax(ARG) {
        let T = this,
            I = T.I;
        if (I.str(ARG)) ARG = {
            url: ARG
        };
        return I.Async((resolve) => {
            const request = new XMLHttpRequest(ARG.paramsDictionary);
            let evt = [
                'progress', 'readystatechange','error','abort', 'load', 'loadend', 'loadstart', 'timeout'
            ],
            {DONE,HEADERS_RECEIVED,LOADING,OPENED,UNSENT} = request;
            T.on(request, evt[2], e => {
                ARG.error && ARG.error('net::ERR_FAILED');
                resolve(null);
            });
            T.on(request, evt[1], event => {
                let headers;
                switch (request.readyState) {
                    case LOADING:
                    case OPENED:
                    case UNSENT:
                    break;
                    case HEADERS_RECEIVED:
                        headers = I.toObj((request.getAllResponseHeaders() || '').trim().split(/[\r\n]+/).map(line => {
                                let parts = line.split(': ');
                                return [parts.shift(), parts.join(': ')];
                            }).concat([
                                ['status', request.status],
                                ['statusText', request.statusText],
                                ['url', ARG.url]
                        ]));
                        if (ARG.type == 'head') {
                            request.abort();
                            ARG.success && ARG.success(headers,request);
                            resolve(headers);
                            return
                        }
                        break;
                    case DONE:
                        if (request.status == 200) {
                            ARG.success && ARG.success(request.response,headers, request);
                            resolve(request.response);
                        }else{
                            ARG.error && ARG.error(request.statusText,headers, request);
                            resolve(null);
                        }
                        break;
                }
            });
            ARG.process&&T.on(request,evt[0], e => ARG.process(I.PER(e.loaded, e.total), e.total, e.loaded, 0, request));
            ARG.postProcess&&T.on(request.upload,evt[0], e => ARG.postProcess(I.PER(e.loaded, e.total), e.total, e.loaded, e));
            I.toArr(evt,v=>I.none(ARG[v])||(T.on(request, val,ARG[v]),I.DP(ARG,v)));
            ARG.upload&&I.toArr(evt,v=>I.none(ARG.upload[v])||(T.on(request, val,ARG.upload[v]),I.DP(ARG.upload,v)));
            let formData,type = ARG.type || "",headers = ARG.headers||{};
            if (ARG.overType) request.overrideMimeType(ARG.overType);
            if (ARG.json) {
                formData = I.toJson(ARG.json);if(!type)type='json';
                I.assign(headers,{Accept: 'application/json, text/plain, */*'});
            } else if (ARG.post) {
                formData = I.post(ARG.post);
            }
            if (type != 'head') request.responseType = type;
            request.open(!formData ? "GET" : "POST", I.get(ARG.url,{inajax:T.time},ARG.get));
            I.toArr(headers, entry => request.setRequestHeader(entry[0], entry[1]));
            request.send(formData);
        });
    }
    Set(o,b){
        let T=this,I=T.I,{RF,CF,BF}=T;
        if(!o.action)o.action={};
        I.defines(o,{T,I},1,b);
        I.defines(o,{RF,CF,BF},1);
        //I.toArr(['RF','CF','BF'],v=>o[v]=T[v]);
        return I;
    }
    RF(action, data) {
        const R = this, A = R.action,I = R.I;
        if (A[action]) return I.func(A[action]) ? I.Apply(A[action], R, data||[]):A[action];
        console.log('lost action:' + action, data);
    }
    CF(action, ...args) {
        return this.RF(action,args);
    }
    BF(action) {
        const R = this, A = R.action,I = R.I;
        if (A[action])return I.func(A[action]) ? A[action].bind(R):A[action];
        console.log('lost action:' + action);
    }
    addJS(buf, cb, iscss, id) {
        let T = this,
            F = T.F,
            I = T.I;
        if (I.blob(buf)) {
            id = F.getKeyName(buf.name);
            if (buf.type == 'text/css') iscss = true;
        }
        if (id && T.$('#link_' + id)) return;
        let re = false,
            script = T.$ce(!iscss ? 'script' : 'link'),
            func = callback => {
                if (!/^(blob:)?https?:\/\//.test(buf) && !/(\.js$|\.css$)/.test(buf)) {
                    re = true;
                    buf = F.URL(buf, F.getMime(!iscss ? 'js' : 'css'));
                }

                if (iscss) {
                    script.type = F.getMime('css');
                    script.href = buf;
                    script.rel = "stylesheet";
                } else {
                    script.type = F.getMime('js');
                    script.src = buf;
                }
                if (id) I.Attr(script,{id:'link_' + id});
                script.onload = e => {
                    callback && callback(e);
                    if (re) F.removeURL(buf);
                    buf = null;
                    if (!iscss) script.remove();
                };
                document[!iscss ? 'body' : 'head'].appendChild(script);
            };
        if (!cb) return I.Async(func);
        else return func(cb), script;

    };
    async loadScript(js, ARG, bool) {
        ARG = ARG || {};
        let T = this,
            F = T.F;
        ARG.url = F.getpath(js);
        if (bool) {
            ARG.type = 'text';
        } else {
            if (!ARG.store) ARG.store = T.LibStore;
            if (!ARG.key) ARG.key = F.LibKey;
        }
        ARG.version = ARG.version || T.version;
        let data = await T.FetchItem(ARG);
        if (!bool) {
            return await T.addJS(data);
        }
        return data;
    }
    async getScript(js, ARG) {
        return this.loadScript(js, ARG, !0);
    }
    async addScript(js, ARG) {
        return await T.addJS(await T.getScript(js, ARG),null,F.getExt(js) == 'css');
    }
    async loadLibjs(name, process,version,decode) {
        let T = this,
            F = T.F;
        return await T.addJS(await F.getLibjs(name, process,version,decode), null, F.getExt(name) == 'css');
    }
    unFile(u8, process, ARG) {
        return this.F.unFile(u8, this.I.assign({
            process
        }, ARG || {}));
    }
    async toZip(contents, process, options) {
        let T = this,
            I = T.I;
        return I.Async(async complete => {
            let worker = new Worker(T.JSpath + 'zip.js?' + T.time);
            T.on(worker, 'message', e => {
                let data = e.data;
                if (data.t == 1) {
                    complete(data.contents);
                    e.target['terminate']();
                } else if (data.t == 2) {
                    process && process(I.PER(data.current, data.total));
                }
            });
            T.on(worker, 'error', e => {
                console.log(e);
                complete(null);
                worker['terminate']();
            });
            worker.postMessage(I.assign({
                contents
            }, options || {}));
            contents = null;
        });
    }
    on(elm, evt, fun, opt, cap) {
        let T = this,I=T.I;
        elm = T.$(elm)
        return T.spilt(evt,v =>I.on(elm,v, fun, opt === false ? { passive: false } : opt, cap)),elm;
    }
    un(elm, evt, fun, opt, cap) {
        let T = this,I=T.I;
        elm = T.$(elm)
        return T.spilt(evt,v =>I.un(elm,v, fun, opt === false ? { passive: false } : opt, cap)),elm;
    }
    spilt(evt,func,type){
        let I = this.I,t= type||',';
        return I.toArr(I.str(evt)?evt.replace(/[\s\|,]+/g,t).split(t).filter(v=>!I.empty(v)):evt,func);
    }
    once(elm, evt, fun, cap) {
        return this.on(elm, evt, fun, { passive: false, once: true }, cap);
    }
    docload(f) {
        let T = this, d = document;
        if (d.readyState == 'complete') return f && f.call(T);
        return T.I.Async(complete => {
            let func = () => { f && f.call(T), complete(T) };
            if (d.readyState == 'loading') T.once(d, 'DOMContentLoaded', func);
            else func();
        });
    }
    $(e, f) {
        let T = this, I = T.I;
        return e ? I.str(e) ? I.$(e, f) : I.func(e) ? T.docload(e) : e : undefined;
    }
    $$(e, f) {
        return this.I.$$(e, f);
    }
    $ce(e) {
        return this.I.$c(e);
    }
    $ct(e, txt,c,a) {
        let T=this,I=T.I,elm = T.$ce(e);
        if(txt)elm.innerHTML = I.str(txt)?txt:txt();
        !a||I.Attr(elm,a);
        !c||I.Attr(elm,'class',c);
        return elm;
    }
    $append(a, b) {
        if (this.I.str(b)) b = this.$ce(b);
        return a.appendChild(b), b;
    }
    $add(e, c) {
        return e.classList.add(c), e;
    }
    customElement(myelement) {
        let T = this;
        window.customElements.define(myelement, class extends HTMLElement {
            /* 警告 如果文档处于加载中,自定义元素实际上并不能读取子元素(innerHTML等) */
            /*因此 如果仅仅操作属性(Attribute),可以比元素出现前提前定义.否则最好文档加载完毕再定义,并不会影响事件触发 */
            constructor() {
                super();
                T.CF('TAG-' + this.tagName, this, 'init');
            }
            connectedCallback() {
                /*文档document中出现时触发*/
                T.CF('TAG-' + this.tagName, this, 'connect');

            }
            attributeChangedCallback(name, oldValue, newValue) {
                /*attribute增加、删除或者修改某个属性时被调用。*/
                T.CF('TAG-' + this.tagName, this, 'attribute', {
                    name,
                    oldValue,
                    newValue
                });
            }
            disconnectedCallback() {
                /*custom element 文档 DOM 节点上移除时被调用*/
                T.CF('TAG-' + this.tagName, this, 'disconnect');
            }
        });
    }
    docElm(str, mime) {
        return new DOMParser().parseFromString(str, mime || 'text/html');
    }
    HTMLToTxt(str, bool) {
        let T = this, I = T.I;
        if (I.str(str)) str = T.docElm(str);
        if (I.doc(str)) {
            return str.body[bool ? 'innerHTML' : 'textContent'];
        }
        return "";
    }
    fragment() {
        return new DocumentFragment();
    }
    Err(msg) {
        return new Error(msg);
    }
    down(name, buf, type) {
        return this.F.download(name, buf, type);
    }
    getLang(name, arg) {
        let T = this,I =T.I;
        if (I.none(T.lang[name])) console.log(name);
        else name = T.lang[name];
        return I.obj(arg)?I.RegRe(name, arg):name;
    }
    triger(target, type,data) {
        let T = this, I = T.I;
        target = T.$(target);
        return I.evt(type)?T.dispatch(target,type):T.dispatch(target, new I.O[22](type,data)),target;
    }
    dispatch(obj, evt) {
        return  obj.dispatchEvent(evt),obj;
    }
    stopGesture(elm) {
        //禁止手势放大
        this.on(elm,'gesturestart,gesturechange,gestureend',this.stopEvent);
    }
    stopEvent(e) {
        e.preventDefault();
    }
    stopProp(e,b) {
        b||e.preventDefault();
        e.stopPropagation();
    }
    null(obj) {
        for (var i in obj) {
            obj[i] = null;
            delete obj[i];
        }
    }
    I = new class NengeType {
        O = [
            Array, //0
            Object, //1
            Element, //2
            HTMLFormElement, //3
            FormData, //4
            URLSearchParams, //5
            NamedNodeMap, //6,
            DOMStringMap, //7
            CSSStyleDeclaration, //8
            Document,//9
            ArrayBuffer, //10
            Uint8Array, //11,
            Promise, //12
            Blob, //13
            File, //14
            String, //15
            DOMRect, //16
            Event, //17
            KeyboardEvent, //18
            Function, //19
            Boolean, //20
            Headers, //21
            CustomEvent,//22,
            HTMLCollection,//23
            FileList,//24
            TextDecoder,//25,
            TextEncoder,//26
            NodeList,//27
            Number,//28
            RegExp,//29
        ];
        constructor(T) {
            let I = this,
                O = I.O,
                func = "",
                R = 'return ',
                Ro = R + 'o',
                H = 'this.',
                RT = R +H ,
                RTo = RT + 'toArr(',
                RN = n => R + I.N(n) + '.',
                REVT = n=>RT+'Apply('+(n?'add':'remove')+'EventListener,o,a)',
                NO = n => 'new ' + I.N(n),
                RnObj = n => R + NO(n) + '(o)',
                SetKey = (key, value) => SetValue(key, R + 'o instanceof ' + I.N(value)),
                SetIof = (key, value) => SetValue(key, RT + 'C(o) === ' + I.N(value)),
                SetValue = (key, str) => str ? `'${key}':{value(o,...a){${str}}},` : '',
                SetFunc = (key, str) => str ? `${key}(...a){${str}}` : '',
                SetObjArr = (num, str, bool) => str ? SetValue(I.N(num) + (bool ? '2obj' : '2arr'), str) : '',
                SetOBJ = num => RT + I.N(num) + '2obj(o)',
                SetArr = num => RT + I.N(num) + '2arr(o)',
                SetEntries = (num) => RT + 'Entries('+H + I.N(num) + '2obj(o))',
                getEntries = (num) => RT + 'FromEntries('+H+ I.N(num) + '2arr(o))',
                arr = (x) => RT + `ArrFrom(${x})`,
                d = 'document',
                ds = R + '(a[0]||' + d + ').querySelector',
                arro = arr('o');
            O[1].entries({
                2: 'elm',//2
                3: 'elmform',//3
                4: 'urlpost',//4,
                5: 'urlget',//5,
                6: 'nodemap',//6
                7: 'DOMmap',//7
                8: 'elmCss',//8
                12: 'await',//12
                13: 'blob',//13
                14: 'file',//14,
                17: 'evt',//14,
                18: 'keyevt',//14,
                19: 'func',//19
                21: 'header',//21,
                27: 'nodelist',//27,

            }).forEach(entry => func += SetKey(entry[1], entry[0]));
            O[1].entries({
                0: 'array',//0
                1: 'obj',//1
                9: 'doc',//9
                10: 'buf',//10,
                11: ['u8obj', 'u8buf'],//11,
                15: 'str',//15,
                20: 'bool',//20,
                28: 'num',
            }).forEach(entry => func += entry[1] instanceof O[0] ? entry[1].map(v => SetIof(v, entry[0])).join("") : SetIof(entry[1], entry[0]));
            O[1].entries({
                null: Ro + '===null',
                none: R+'typeof o == "undefined"',
                R: R + 'Reflect.construct(this.O[o],a)',
                H: R + 'a[0]&&o.hasOwnProperty(a[0])||false',
                DP: R + 'Reflect.deleteProperty(o,a[0])',
                Arr: RnObj(0),
                ArrFrom: RN(0) + 'from(o)',
                FromEntries: RN(1) + 'fromEntries(o)',
                Keys: RN(1) + 'keys(o);',
                FromObj: RN(1) + 'fromEntries(o);',
                U8: RT + 'u8buf(o)?o:' + NO(11) + '(o.buffer||o)',
                buf16str: RTo + 'o).map(v => v.toString(16).padStart(2,0).toLocaleUpperCase()).join("")',
                ArrTest: RTo + 'o).filter(entry => entry[1].test(a[0]))[0]',
                decode: R + NO(25) + '(a[0]).decode(o)',
                encode: R + NO(26) + '().encode(o)',
                FormPost: RnObj(4),
                FormGet: RnObj(5),
                Int: RnObj(28),
                IntVal: R + 'parseInt(o,a[0])',
                IntSize: 'o=this.Int(o);',
                PER: RT + 'Int(100*o/a[0]).toFixed(0)+"%"',
                Async: Ro + '?(this.array(o) ? ' + I.N(12) + '.all(o):new ' + I.N(12) + '(o,a[0])):null;',
                $: ds + '(o)',
                $$: ds + 'All(o)',
                $c: R + d + '.createElement(o)',
                RegRe: RTo + 'a[0],e=>o=o.replace(' + NO(29) + '("\\{"+e[0]+"\\}","g"),e[1])),o',
                elmdata: RT + 'toObj(o&&o.dataset||{})||{}',
                setStyle: RT + 'toArr(a[0],x=>(o.style||o).setProperty(x[0],x[1])),o',
                Attr: RT + 'obj(a[0])?this.toArr(a[0],v=>this.Attr(o,v[0],v[1])):o[(a[1]?"set":"get")+"Attribute"](a[0],a[1])',
                Call:R+'Reflect.apply(o,a.shift(),a)',
                Apply:RT+'str(o)&&(o=a[0][o]),Reflect.apply(o,a[0],a[1])',
                on:REVT(1),
                un:REVT(0),
            }).forEach(entry => func += SetValue(entry[0], entry[1]));
            O[1].entries({
                4: ['var s = {};o.forEach((t, e) => {s[e] ? (this.array(s[e]) || (s[e] = [s[e]]), s[e].push(t)) : s[e] = t});return s', SetEntries(4)],
                5: [SetOBJ(4), SetArr(4)],
                6: [getEntries(6), arro + '.map(v=>[v.name,v.value])'],
                7: [RN(1) + 'assign({}, o)', SetEntries(7)],
                8: [getEntries(8), arro + '.map(v=>[v,o.getPropertyValue(v)])'],
                10: [Ro, arr(H+'U8(o)')],
                11: [Ro, arro],
                16:[R+'o.toJSON()',SetEntries(16)],
                21: [SetOBJ(4), SetArr(4)],
                23: [Ro, arro],
                24: [Ro, arro],
                27: [Ro, arro],
                28: [Ro,RT+'Arr(Math.ceil(o)).fill().map((...x)=>x[1])'],
            }).forEach(entry => func += SetObjArr(entry[0], entry[1][0], 1) + SetObjArr(entry[0], entry[1][1]));
            var newfunc = new O[19]('I','T', I.N(1) + `.defineProperties(I,{${func}});T.StoreBase=class Store{constructor(table,name){const S=this;Nenge.Set(S);S.I.defines(S,{table,name},1,1);S.getdata=S.getData;S.setdata=S.setData;}setName(t){let e=${H}I;${R}t&&"boolean"!=typeof t?e.str(t)&&(t={dbName:t}):t={dbName:e.name},t}get(t,e,a){${RT}getItem(t,e,${H}setName(a))}put(t,e){${RT}setItem(t,e,${H}name)}remove(t,e){${RT}removeItem(t,${H}setName(e))}data(t,e,a){${RT}getData(t,e,a)}getData(t,e,a){${RT}getContent(t,e,${H}setName(a))}setData(t,e,a){${RT}setContent(t,e,a,${H}name)}keys(t){${RT}getAllKeys(${H}name,t||{})}cursor(t,e,a){${RT}getAllCursor(t,e,${H}setName(a))}all(t,e){${RT}getAllData(t,${H}setName(e))}clear(){${RT}clearDB(${H}name)}delete(){${RT}deleteDB(${H}name)}async getBatch(t,e){let a=await ${H}I.Async(t.map((async t=>await ${H}get(t))));${R}e?e(a):a}${'getItem,setItem,removeItem,getAllData,getContent,setContent,getAllKeys,getAllCursor,clearDB,deleteDB'.split(',').map(t=>SetFunc(t,`const S=this;${R}S.I.Apply('${t}',S.T,[S.table].concat(a))`)).join('')}}`);
            newfunc(I,T);func=null;newfunc=null;
        }
        N(num) {
            return !isNaN(num) ? this.O[num].name : this.X(num);
        }
        C(obj) {
            return obj != null && obj != undefined && obj.constructor;
        }
        X(obj) {
            return this.C(obj) && this.C(obj).name || ''
        }
        assign(...arg) {
            let I=this;
            return I.Apply(I.O[1].assign,{},arg)
        }
        exends(a, b, c) {
            if (c) this.toArr(c, v => a[v] = b[v]);
            else a = this.assign(a, b);
            return a;
        }
        get mobile() {
            return 'ontouchend' in document
        }
        get language() {
            return navigator.language;
        }
        get i18n() {
            let lang = this.language.split('-');
            if (lang[0] == 'zh') {
                if (lang[1] == 'CN') {
                    lang = 'zh-hans';
                } else {
                    lang = 'zh-hant';
                }
            } else {
                lang = lang[0];
            }
            return lang;

        }
        post(obj) {
            let I = this;
            let post = I.urlpost(obj) ? obj : I.FormPost(I.elmform(obj) ? obj : I.str(obj) ? I.$(obj) : undefined);
            if (I.obj(obj)) I.toArr(obj, v => post.append(v[0], v[1]));
            return post;
        }
        get(url, ...arg) {
            let I = this,
                urlsearch = url.split('?'),
                urls = urlsearch[1] && urlsearch[1].split('#')[0] || '',
                more = I.toArr(arg).map(e=>e?I.FormGet(e):'').join('&'),
                data = I.FormGet(urls+'&'+more).toString().replace(/=&/g,'&');
            return urlsearch[0] + (data ? '?' + data:'');
        }
        toObj(obj) {
            if (!obj) return {};
            let I = this, name = I.X(obj);
            if (I[name + '2obj']) return I[name + '2obj'](obj);
            else if (I.obj(obj)) return obj;
            else if (I.array(obj)) return I.FromObj(obj);
            return obj;
        }       
        Entries(o){
            return this.O[1].entries(o)
        }
        toArr(obj, func) {
            if (!obj) return [];
            let arr = [], I = this, name = I.X(obj);
            if (I[name + '2arr']) arr = I[name + '2arr'](obj);
            else if (I.array(obj)) arr = obj;
            else if (obj.byteLength || obj.length) arr = I.ArrFrom(obj);
            else if (I.obj(obj)) arr = I.Entries(obj);
            if (I.func(func)) return arr.forEach(func);
            return arr;
        }
        define(o, p, attr, bool, rw) {
            this.O[1].defineProperty(o, p, !bool ? attr : {
                get() {
                    return attr
                },
                configurable:rw ? true : false
            });
            return o;
        }
        defines(o, attr, bool, rw) {
            if (bool) this.toArr(attr, entry => this.define(o, entry[0], entry[1], 1, rw));
            else this.O[1].defineProperties(o, attr);
            return o;
        }
        Json(post) {
            let I = this,
                O = I.O;
            if (I.u8buf(post)) post = I.decode(post);
            return typeof post == 'string' ? (new O[19]('return ' + post))() : post;
        }
        toJson(post) {
            return JSON.stringify(this.Json(post));
        }
        empty(data) {
            if (!data) return true;
            if (this.str(data)) return data.trim().length == 0;
            if (this.array(data)) return data.length == 0;
            if (this.obj(data)) return this.toArr(data).length == 0;
            return false;
        }
    }(this);
    F = new class NengeUtil {
        Libjs = {};
        LibKey = 'script-';
        zipsrc = 'zip.min.js';
        extpreg = {
            "7z": /^377ABCAF271C/,
            rar: /^52617221/,
            zip: /^504B0304/,
            png: /^89504E470D0A1A0A/,
            gif: /^47494638/,
            jpg: /^FFD8FF/,
            webp: /^52494646/,
            pdf: /^255044462D312E/,
        };
        exttype = {
            'text/javascript': ['js'],
            'text/css': ['css', 'style'],
            'text/html': ['html', 'htm', 'php'],
            'text/plain': ['txt'],
            'text/xml': ['xml', 'vml'],
            'image': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'image/svg+xml': ['svg'],
            'application': ['pdf'],
            'application/json': ['json'],
            'application/x-zip-compressed': ['zip'],
            'application/x-rar-compressed': ['rar'],
            'application/x-7z-compressed': ['7z']
        };
        action = {
            textext(s) {
                let F = this,
                    I = F.I,
                    text = I.buf16str(s),
                    result = I.ArrTest(F.extpreg, text);
                if (result && result[0]) return result[0];
                return '';
            },
            async rar(u8, ARG, src) {
                let F = this,
                    I = F.I,
                    process;
                if (I.blob(u8)) {
                    if (!ARG.filename && u8.name) ARG.filename = u8.name;
                    u8 = I.U8(await u8.arrayBuffer());
                }
                src = src || 'libunrar.min.zip';
                //F.Libjs[src] = F.T.JSpath+'libunrar.js';
                if (!F.Libjs[src]) await F.getLibjs(src, process);
                let url = F.Libjs[src],
                    packtext;
                if (ARG.process) {
                    if (ARG.filename) packtext = F.T.getLang('Decompress:') + ARG.filename + ' --';
                    else packtext = F.T.getLang('Decompress:');
                    process = data => ARG.process(packtext + (data.file ? F.getname(data.file) : '') + ' ' + I.PER(data.current, data.total), data.total, data.current);
                }
                return I.Async(complete => {
                    let contents, worker = new Worker(url);
                    worker.onmessage = result => {
                        let data = result.data,
                            t = data.t;
                        if (1 === t) {
                            if (contents) complete(contents);
                            else complete(u8);
                            result.target['terminate']();
                        } else if (2 === t) {
                            if (!contents) contents = {};
                            contents[data.file] = data.data;
                        } else if (4 === t && data.total > 0 && data.total >= data.current) {
                            process && process(data);
                        } else if (-1 == t) {
                            let password = prompt(F.T.getLang(data.message), ARG.password || '');
                            if (!password) {
                                complete(u8);
                                return result.target['terminate']();
                            }
                            if (ARG.unpack) contents.password = password;
                            ARG.password = password;
                            worker.postMessage({
                                password
                            });
                        }
                    },
                        worker.onerror = async error => {
                            complete(u8);
                            worker.terminate();
                        };
                    worker.postMessage({
                        contents: u8,
                        password: ARG.password
                    });
                });

            },
            '7z': function (u8, ARG) {
                return this.CF('rar', u8, ARG, 'extract7z.zip');
            },
            async zip(u8, ARG = {}) {
                if (this.T.Libzip == this.zipsrc) return this.CF('zipjs', u8, ARG);
                return this.CF('rar', u8, ARG, this.T.Libzip);
            },
            async zipjs(u8, ARG) {
                ARG = ARG || {};
                let F = this,
                    T = F.T;
                if (!window.zip) await T.loadLibjs(T.JSpath + F.zipsrc);
                var ZipFile = new zip.ZipReader(new zip[T.I.u8buf(u8) ? 'Uint8ArrayReader' : 'BlobReader'](u8)),
                    contents = {},
                    password = undefined,
                    getData = async entry => {
                        contents[entry.filename] = await entry.getData(new zip.Uint8ArrayWriter(), {
                            onprogress: (current, total) => ARG.process && ARG.process(entry.filename + ' ' + T.I.PER(current, total)),
                            password
                        });
                    },
                    checkPassword = async entry => {
                        try {
                            if (password == undefined) password = ARG.password;
                            await getData(entry);
                        } catch (e) {
                            password = window.prompt(T.getLang('Invalid password'), password);
                            await checkPassword(entry);
                        }
                    },
                    entrylist = await ZipFile.getEntries(),
                    i = 0;
                if (entrylist) {
                    while (entrylist[i]) {
                        let entry = entrylist[i];
                        i++;
                        if (entry.directory) continue;
                        if (entry.encrypted && !password) {
                            await checkPassword(entry)
                        } else {
                            await getData(entry);
                        }
                    }
                }
                return contents;
            }

        };
        async StreamResponse(response, process, headers) {
            let I = this.I,
                maxLength = headers['content-length'] || 0,
                downtext = this.T.getLang('process:'),
                havesize = 0,
                status = {
                    done: !1,
                    value: !1
                },
                reader = await response.body.getReader();
            return new Response(new ReadableStream({
                async start(ctrler) {
                    while (!status.done) {
                        let speedsize = 0,
                            statustext = '';
                        if (status.value) {
                            speedsize = status.value.length;
                            havesize += speedsize;
                            ctrler.enqueue(status.value);
                        }
                        if (maxLength && havesize < maxLength) statustext = downtext + I.PER(havesize, maxLength);
                        else statustext = downtext + (havesize / 1024).toFixed(1) + 'KB';
                        //下载进度
                        process((headers.filename ? headers.filename + ' ' : '') + statustext, maxLength, havesize, speedsize);
                        status = await reader.read();
                    }
                    ctrler.close();
                }
            }));
        }
        FetchHeader(response, ARG) {
            let I = this.I;
            let headers = I.toObj(response.headers) || {};
            (headers['content-type'] || this.getMime(ARG.url.split('/').pop() || 'html')).split(';').forEach((value, index) => {
                value = value.trim().toLowerCase();
                if (index == 0) headers['content-type'] = value;
                else if (value.search(/=/) != -1) {
                    let data = value.split('=');
                    headers[data[0].trim()] = data[1].trim();
                }
            });
            return I.assign(headers, {
                byteLength: I.Int(headers['content-length']) || 0,
                password: headers['password'] || headers['content-password'],
                type: headers['type'] || headers['content-type'].split('/')[1].split('+')[0],
            });
        }
        async FetchStart(ARG) {
            let F = this,
                I = F.I,
                {
                    url,
                    get,
                    post,
                    json
                } = ARG || {},
                data = {};
            data.headers = {method:'GET'};
            I.toArr(['headers', 'context', 'referrer', 'referrerPolicy', 'mode', 'credentials', 'redirect', 'integrity', 'cache'],v=>I.none(ARG[v])||(data[v]=ARG[v],I.DP(ARG,v)));
            if (json) {
                post = I.toJson(json);
                data.headers = I.assign({Accept:'application/json'},data.headers);
            } else if(post){
                post = I.post(post);
            }
            if (post) {
                data.method = 'POST';
                data.body = post;
            }
            I.toArr(['get','post','json'],v=>I.DP(ARG,v));
            return fetch(I.get(url, get), data);
        }
        CheckExt(u8) {
            let F = this,
                I = F.I,
                buf = u8.slice(0, 16),
                textext = F.BF('textext');
            let text = I.blob(buf) ? buf.arrayBuffer() : I.str(buf) ? I.encode(buf) : buf;
            return I.await(text) ? I.Async(async e => e(textext(await text))) : textext(text);
        }
        async unFile(u8, ARG = {}) {
            let F = this,
                I = F.I;
            if (I.await(u8)) u8 = await u8;
            if (I.array(u8)) u8 = I.U8(u8);
            let ext = await F.CheckExt(u8);
            if (F.action[ext]) {
                if (!ARG.PassExt || !ARG.PassExt.includes(zip)) return await F.CF(ext, u8, ARG);
            }
            if (I.blob(u8)) u8 = I.U8(await u8.arrayBuffer());
            return u8;
        }
        async getLibjs(jsfile, process,version,decode) {
            let F = this,
                T = F.T,
                I = F.I,
                jsname = F.getname(jsfile),
                file = jsname.replace(/\.zip$/, '.js');
            if (F.Libjs[jsname]) return F.Libjs[jsname];
            if (F.Libjs[file]) return F.Libjs[file];
            version = version||T.version;
            let contents = await T.getStore(T.LibStore).data(F.LibKey + file,version);
            if (!contents) {
                if (/\.zip$/.test(jsname)) await F.getLibjs(T.Libzip, process);
                contents = await T.FetchItem({
                    url: F.getpath(jsfile) + '?' + T.time,
                    store: T.LibStore,
                    key: F.LibKey,
                    unpack: true,
                    filename: file,
                    version:version,
                    process,
                    decode
                });
            }
            if(/json$/.test(file)){
                F.Libjs[file] = contents;
            }else if (contents) {
                if (I.obj(contents)) {
                    F.I.toArr(contents, entry => F.Libjs[entry[0]] = entry[1] && F.URL(entry[1], F.getMime(entry[0])));
                } else {
                    F.Libjs[file] = F.URL(contents, F.getMime(file));
                }
            }
            contents = null;
            return F.Libjs[file]
        }
        getname(str) {
            return (str || '').split('/').pop().split('?')[0].split('#')[0];
        }
        getpath(js) {
            let F = this,
                T = F.T,
                I = T.I;
            return /^(\/|https?:\/\/|static\/js\/|data\/|assets|blob\:)/.test(js) ? js : T.JSpath + js;
        }
        getFileText(contents, decode, filetype, filename) {
            let F = this,
                T = F.T,
                I = T.I;
            if(/json$/.test(filetype)&&I.u8buf(contents)) return I.Json(contents);
            if (filename && filetype && !decode) return I.R(14,[contents], filename, { type: filetype });
            if (!decode) return contents;
            if (I.u8buf(contents)) {
                return decode(contents);
            } else {
                I.toArr(contents, entry => {
                    if (/(text|javascript|xml)/.test(F.getMime(entry[0]))) {
                        contents[entry[0]] = decode(entry[1]);
                    }
                });
            }
            return contents;

        }
        getExt(name) {
            return this.getname(name).split('.').pop().toLowerCase();
        }
        getKeyName(name) {
            let s = this.getname(name).split('.');
            return s.pop(), s.join('.');
        }
        getMime(type) {
            let F = this, mime;
            type = F.getExt(type);
            if (type) F.I.toArr(F.exttype, entry => entry[1].includes(type) && (mime = entry[0]));
            if (mime == 'image') mime += '/' + type;
            return mime || 'application/octet-stream';
        }
        URL(u8, type) {
            let F = this,
                I = F.I;
            if (I.str(u8) && (/^(blob|http)/.test(u8) || /^\/?[\w\-_\u4e00-\u9FA5:\/\.\?\^\+ =%&@#~]+$/.test(u8))) return u8;
            if (!type) type = F.getMime('js');
            return window.URL.createObjectURL(I.blob(u8) ? u8 : new Blob([u8], {
                type: type
            }));
        }
        removeURL(url) {
            return window.URL.revokeObjectURL(url);
        }
        download(name, buf, type) {
            let F = this, I = F.I, href;
            type = type || F.getMime(name);
            if (I.str(name)) {
                if (/^(http|blob:)/.test(name)) {
                    href = name; name = 'n.js';
                } else if (buf) {
                    href = F.URL(buf, type);
                }
            } else {
                href = F.URL(name, type);
                name = name.name || 'n.js';
            }
            let a = document.createElement("a");
            a.href = href;
            a.download = name;
            a.click();
            a.remove();
        }
        DataBase = {};
        get idb() {
            return window.indexedDB || window.webkitindexedDB;
        }
        dbSetMap(ARG) {
            let F = this,
                I = F.I,
                T = F.T,
                info = F.dbMap || {};
            if (info && !info[F.dbname]) {
                info[F.dbname] = T.DB_STORE_MAP;
            }
            let store = ARG.store;
            if (store) {
                let dbName = ARG.dbName || F.dbname;
                if (dbName && !info[dbName]) info[dbName] = {};
                if (store && !info[dbName][store]) {
                    info[dbName][store] = {};
                    let dbIndex = ARG.dbIndex;
                    if (dbIndex) {
                        if (I.str(dbIndex)) info[dbName][store][dbIndex] = false;
                        else I.assign(info[dbName][store], dbIndex);
                    }
                }
            }
            if (!F.dbMap) F.dbMap = info;
            return info;

        }
        async dbLoad(ARG) {
            ARG = ARG || {};
            let F = this,
                dbName = ARG.dbName || F.dbname,
                store = ARG.store,
                db = F.DataBase[dbName];
            if (store && F.dbCheckTable(store, db)) {
                return db;
            } else if (!store && db) return db;
            ARG.dbName = dbName;
            await F.dbInstall(F.dbSetMap(ARG));
            return F.DataBase[dbName];
        }
        async dbInstall(info) {
            let F = this,
                I = F.I;
            console.log('install indexDB', info);
            return await I.Async(I.toArr(info).map(async infoItem => {
                let [dbName, dbStore] = infoItem, db = F.DataBase[dbName], version;
                if (db) {
                    let notTable = I.toArr(dbStore).filter(v => !F.dbCheckTable(v[0], db));
                    if (!notTable.length) return 'ok';
                    version = db.version + 1;
                    db.close();
                    delete F.DataBase[dbName];
                }
                let dblist = I.Keys(dbStore);
                F.DataBase[dbName] = await F.dbOpen(
                    dbName, dbStore, version, {
                    async success(db, resolve) {
                        if (F.dbCheckTable(dblist, db) != dblist.length) {
                            version = F.dbClose(db);
                            return resolve(await F.dbOpen(dbName, dbStore, version));
                        }
                        return resolve(db);
                    }
                }
                );
                return dbName;
            }));
        }
        async dbOpen(dbName, dbStore, version, opt) {
            let F = this, T = F.T,I=T.I;
            return F.I.Async((resolve, reject) => {
                let req = F.idb.open(dbName, version);
                T.on(req, 'error', async err => {
                    console.log(err, req.error);
                    reject(err);
                });
                T.on(req, 'upgradeneeded', async e => {
                    let db = req.result;
                    if (opt && opt.upgradeneeded) {
                        await I.Call(opt.upgradeneeded,req,db);
                    } else if (dbStore) {
                        await F.dbCreateObject(dbStore, db);
                    }
                });
                T.on(req, 'success', async e => {
                    let db = req.result;
                    if (opt && opt.success) {
                        return await opt.success(db, resolve)
                    }
                    resolve(db);
                });
            });
        }
        async dbCreateObject(dbStore, db) {
            if (!dbStore || !db) return;
            let F = this,
                I = F.I;
            await I.Async(
                I.toArr(dbStore).map(
                    async tableStore => {
                        let [storeName, storeData] = tableStore;
                        if (!F.dbCheckTable(storeName, db)) {
                            let storeObj = await db.createObjectStore(storeName);
                            if (storeData) {
                                I.toArr(storeData, entry => storeObj.createIndex(
                                    entry[0], entry[1] && entry[1].key || entry[0], entry[1] && entry[1].options || entry[1] || {
                                        unique: false
                                    }
                                ))
                            }
                        }
                    }
                )
            );
        }
        dbCheckTable(list, db, len) {
            if (!db) return 0;
            if (this.I.str(list)) list = [list];
            list = list ? list.filter(v => db.objectStoreNames.contains(v)) : [];
            if (len) return list;
            return list.length;
        }
        async dbU8(contents,maxsize){
            let I = this.I;
            if(I.await(contents)){
                contents = await contents;
            }
            if(I.str(contents)&&contents.lenth*4>maxsize){
                contents = I.encode(contents);
            }else if(I.blob(contents)&&contents.size>maxsize){
                contents = I.U8(await contents.arrayBuffer());
            }else if(contents.buffer){
                contents = I.U8(contents);
            }
            return contents;

        }
        async dbSelect(ARG, ReadMode) {
            let F = this,
                T = F.T;
            if (F.I.str(ARG)) ARG = {
                store: ARG
            };
            if (ARG.store instanceof T.StoreBase) {
                ARG.store = ARG.store.table;
            }
            let store = ARG.store,
                db = await F.dbLoad(ARG);
            ReadMode = ReadMode ? "readonly" : "readwrite";
            if (!store) store = db.objectStoreNames[0];
            let tdb = db.transaction([store], ReadMode);
            tdb.onerror = e => {
                e.preventDefault();
                throw tdb.error;
            };
            return tdb.objectStore(store);
        }
        async dbGetItem(ARG) {
            let F = this,
                I = F.I;
            if (I.str(ARG)) ARG = {
                name: ARG
            };
            let name = ARG.name,
                DB = await F.dbSelect(ARG, !0);
            if (name) return I.Async(resolve => {
                DB.get(name).onsuccess = e => resolve(e.target.result);
            });
        }
        async dbPutItem(ARG) {
            let F = this,
                I = F.I,
                DB = await F.dbSelect(ARG);
            return I.Async(resolve =>DB.put(ARG.data, ARG.name).onsuccess = e => resolve(e.target.result));
        }
        async dbRemoveItem(ARG) {
            let F = this,
                I = F.I;
            let name = ARG.name,
                DB = await this.dbSelect(ARG);
                return I.Async(resolve=>DB.delete(name).onsuccess = e => resolve(`delete:${name}`)
            );
        }
        async dbGetAll(ARG) {
            let F = this,
                I = F.I,
                T = F.T,
                DB = await F.dbSelect(ARG, !0);
            return I.Async(callback => {
                let entries = {};
                if (ARG.index) DB = DB.index(ARG.index);
                DB.openCursor(ARG.Range).onsuccess = evt => {
                    let cursor = evt.target.result;
                    if (cursor) {
                        if (ARG.only && T.part && T.maxsize && I.u8buf(cursor.value.contents) && cursor.value.filesize > T.maxsize) {
                            let skey = cursor.primaryKey.split(T.part),
                                newkey = skey[0],
                                index = skey[1] || 0;
                            if (!entries[newkey]) {
                                let contents = I.U8(cursor.value.filesize);
                                contents.set(cursor.value.contents, index * T.maxsize);
                                delete cursor.value.contents;
                                entries[newkey] = F.assign(cursor.value, {
                                    contents
                                })
                            } else {
                                entries[newkey].contents.set(cursor.value.contents, index * T.maxsize);
                            }
                        } else {
                            entries[cursor.primaryKey] = cursor.value;
                        }
                        cursor.continue();
                    } else {
                        callback(entries);
                    }
                }
            });
        }
        async dbGetKeys(ARG) {
            let F = this,
                I = F.I;
            if (I.str(ARG)) ARG = {
                dbName: ARG
            };
            let DB = await F.dbSelect(ARG, !0);
            return I.Async(resolve => {
                if (ARG.index && DB.indexNames.contains(ARG.index)) {
                    return DB.index(ARG.index).getAllKeys(ARG.Range).onsuccess = e => {
                        resolve(ARG.only ? I.toArr(e.target.result).filter(v => !v.includes(F.T.part)) : e.target.result)
                    };
                }
                return DB.getAllKeys().onsuccess = e => {
                    resolve(ARG.only ? I.toArr(e.target.result).filter(v => !v.includes(F.T.part)) : e.target.result)
                };
            });

        }
        async dbGetCursor(ARG) {
            let F = this,
                I = F.I;
            if (I.str(ARG)) ARG = {
                index: ARG
            };
            let index = ARG.index,
                T = F.T,
                DB = await F.dbSelect(ARG, !0),
                len = DB.indexNames.length;
            if (len && !index) {
                index = DB.indexNames[0];
            } else if (!len) {
                return F.dbGetKeys(ARG);
            }
            return I.Async(resolve => {
                let entries = {};
                DB.index(index).openKeyCursor(ARG.Range).onsuccess = evt => {
                    let cursor = evt.target.result;
                    if (cursor) {
                        if (!ARG.only || T.part && !cursor.primaryKey.includes(T.part)) {
                            entries[cursor.primaryKey] = I.FromObj([
                                [index, cursor.key]
                            ]);
                        }
                        cursor.continue()
                    } else {
                        resolve(entries)
                    }
                }
            })

        }
        async dbRemoveTable(tables, dbName) {
            let F = this,
                I = F.I;
            if (I.str(tables)) tables = [tables];
            return await I.Async(tables.map(async store => {
                let DB = await F.dbSelect({
                    store,
                    dbName
                });
                DB.clear();
            }));
        }
        dbClose(dbName) {
            let F = this,
                I = F.I,
                isStr = I.str(dbName),
                db = isStr ? F.DataBase[dbName] : dbName;
            if (db) {
                let version = db.version + 1;
                db.close();
                if (isStr) delete F.DataBase[dbName]
                return version;
            }
            return undefined;
        }
        async deleteDatabase(tables, dbName) {
            let F = this;
            dbName = dbName || F.dbname;
            if (!tables) return F.idb.deleteDatabase(dbName || F.dbname);
            let db = F.DataBase[dbName] || await F.dbOpen(dbName);
            if (db && !F.dbCheckTable(tables, db)) return 'ok';
            let version = F.dbClose(db);
            delete F.DataBase[dbName];
            return await F.dbOpen(dbName, null, version, {
                upgradeneeded(db) {
                    db.deleteObjectStore(tables);
                },
                success(db, resolve) {
                    F.close(db);
                    resolve('ok');
                }
            });
        }
        get dbname() {
            return this.T.DB_NAME;
        }
        constructor(T) {
            let F = this;
            T.Set(F);
            T.Set(F.Nttr.prototype);
            if (!T.Libzip) T.Libzip = F.zipsrc;
        }
        Nttr = class Nttr {
            constructor(obj) {
                let N = this,
                    T = N.T,
                    I = T.I;
                if (I.str(obj)) obj = T.$(obj);
                N.obj = obj;
                I.defines(N.obj, {Nttr:N}, 1,1);
            }
            eventList = {};
            get cList() {
                return this.obj.classList;
            }
            get active() {
                return this.contains('active')
            }
            set active(bool) {
                this.cList[bool ? 'add' : 'remove']('active')
            }
            get show() {
                return this.contains('show')
            }
            set show(bool) {
                this.cList[bool ? 'add' : 'remove']('show')
            }
            get hidden() {
                return this.obj.hidden;
            }
            set hidden(bool) {
                this.obj.hidden = bool;
                return this;
            }
            get css() {
                return this.obj.style.cssText;
            }
            set css(text) {
                this.obj.style.cssText = text;
            }
            get style() {
                return this.I.toObj(this.obj.style);
            }
            set style(data) {
                if (this.I.str(data)) return this.css = data;
                this.I.assign(this.obj.style, data);
            }
            html(str) {
                if (str != undefined) {
                    this.obj.innerHTML = str;
                    return this;
                }
                return this.obj.innerHTML;
            }
            $(str) {
                return this.obj.querySelector(str);
            }
            $$(str) {
                return this.obj.querySelectorAll(str);
            }
            contains(name) {
                return this.cList.contains(name);
            }
            get attrs() {
                return this.T.I.toObj(this.obj.attributes);
            }
            set attrs(obj) {
                this.T.I.toArr(obj, entry => this.setAttr(entry[0], entry[1]));
            }
            attr(k, v) {
                let value = this.I.Attr(this.obj,k,v);
                return v&&this||value;
            }
            getAttrs(name) {
                if (name) return this.attr(name);
                return this.attrs;
            }
            setAttrs(attr, value) {
                if (!value && typeof attr != 'string') return this.attrs = attr;
                this.attr(attr, value);
                return this;
            }
            addClass(str) {
                this.cList.add(str);
                return this;
            }
            removeClass(str) {
                this.cList.remove(str);
                return this;
            }
            addChild(obj) {
                this.obj.appendChild(obj);
                return this;
            }
            appendTo(obj) {
                obj = obj || document.body;
                obj.appendChild(this.obj);
                return this;
            }
            on(evt, func, opt) {
                let N = this;
                if (!N.eventList[evt]) N.eventList[evt] = [];
                N.eventList[evt].push({
                    func,
                    opt
                });
                return N.T.on(N.obj, evt, func, opt), N;
            }
            un(evtname, evtfunc) {
                let N = this;
                if (N.eventList[evtname]) {
                    let newlist = [];
                    N.eventList[evtname].forEach(val => {
                        let {
                            func,
                            opt
                        } = val;
                        if (evtfunc && evtfunc != func) {
                            newlist.push(val);
                            return
                        }
                        N.removeEvent(evtname, func, opt);
                    });
                    N.eventList[evtname] = [];
                    if (newlist.length > 0) N.eventList[evtname] = newlist;
                } else if (!evtname) {
                    N.I.toArr(N.eventList, entry => {
                        entry[1].forEach(val => {
                            let {
                                func,
                                opt
                            } = val;
                            N.removeEvent(entry[0], func, opt);
                        });
                        delete N.eventList[entry[0]];
                    });
                }
                return N;
            }
            once(evt, func, cap) {
                return this.T.once(this.obj, evt, func, cap), N;
            }
            removeEvent(evt, func, opt) {
                return this.T.un(this.obj, evt, func, opt);
            }
            triger(type, data) {
                let N = this, T = N.T, I = T.I;
                if (N.eventList[type]) N.eventList[type].forEach(val => val.func.call(N.obj, data));
                else T.triger(N.obj, type, data);
            }
            bind(opt, type) {
                let N = this,
                    T = N.T,
                    I = N.I;
                if (!type) {
                    type = N.I.mobile ? 'touchend' : 'click';
                }
                I.toArr(opt, entry => T.on(N.$(entry[0], this.obj), type, entry[1]));
            }
            click(func, type, opt) {
                let N = this, I = N.I;
                if (!type) {
                    type = I.mobile ? 'touchend' : 'click';
                }
                if (I.func(func)) N.un(type), N.on(type, func, opt || false);
                else N.triger(type, func);
                return N;
            }
            getBoundingClientRect() {
                return this.obj.getBoundingClientRect();
            }
            remove() {
                this.un();
                this.obj.remove();
            }
            get children() {
                return this.I.toArr(this.obj.children);
            }
            get parentNode() {
                return this.obj.parentNode;
            }
            get rect() {
                return this.getBoundingClientRect();
            }
        };
        nWindow = class nWindow extends this.Nttr {
            action = {
                close() {
                    this.hidden = true;
                },
                show() {
                    this.hidden = false;
                },
                installWindow() {
                    this.addClass('ajaxWindow');
                    this.html(`<div class="container">
                    <div class="a-header">
                        <div class="title"><span class="loading">&#61712;</span></div>
                        <div class="menu">
                            <button type="button" class="close" data-naction="close">&#61453;</button>
                        </div>
                    </div>
                    <div class="a-body">
                        <p class="loading">&#61473;</p>
                    </div>
                    <div class="a-footer" hidden></div>
                </div>`);
                },
                installHeaderEvent() {
                    let W = this,
                        T = W.T,
                        drag;
                    if (T.I.mobile) {
                        drag = ['touchstart', 'touchmove', 'touchend'];
                    } else {
                        drag = ['mousedown', 'mousemove', 'mouseup', 'mouseout'];
                    }
                    drag.forEach(v => T.on(W.$('.a-header'), v, e => {
                        if (e.type == 'mousedown' || e.type == 'touchstart') {
                            if (e) {
                                let {
                                    clientX,
                                    clientY
                                } = e.type == 'mousedown' ? e : e.touches[0];
                                W.HeaderPointPos = {
                                    clientX,
                                    clientY
                                };
                            }
                        }
                        if (e.type == 'mouseup' || e.type == 'mouseout' || e.type == 'touchend') {
                            W.HeaderPointPos = false;
                        }
                        if ((e.type == 'mousemove' || e.type == 'touchmove') && W.HeaderPointPos) {
                            let {
                                clientX,
                                clientY
                            } = e.type == 'mousemove' ? e : e.touches[0], celm = W.$('.container'), rect = celm.getBoundingClientRect(), x = "", y = "";
                            let newclientX = W.HeaderPointPos.clientX - clientX;
                            let newclientY = W.HeaderPointPos.clientY - clientY;
                            y = rect.top - newclientY;
                            y = 'top:' + y + 'px;bottom:unset;';
                            newclientX = newclientX || 0;
                            x = rect.left - newclientX;
                            if (x < 10 || (x && rect.width + x + 15 > window.innerWidth)) {
                                //clientX = parseFloat(celm.style.left);
                                x = parseFloat(celm.style.left);
                                if (x <= 10) {
                                    x = 10;
                                } else if (x + 10 > window.innerWidth) {
                                    x -= 10;
                                }
                            } else { }
                            x = 'left:' + x + 'px;right:unset;width:' + rect.width + 'px;';
                            W.$('.container').style.cssText = x + y;
                            W.HeaderPointPos = {
                                clientX,
                                clientY
                            };
                        }
                    }), {
                        passive: false
                    });
                },
                installEvent() {
                    let W = this,
                        T = W.T,
                        obj = W.obj;
                    T.on(obj, 'pointerup', e => {
                        let elm = e.target;
                        if (elm == obj) {
                            return W.CF('close', elm, e);
                        }
                        let nAction = elm && T.attr(elm, 'data-naction');
                        if (nAction) {
                            T.stopEvent(e);
                            return W.CF(nAction, elm, e);
                        }
                    });
                },
                initConfig(config) {
                    let W = this,
                        T = W.T;
                    if (config) T.I.toArr(config, entry => {
                        if (typeof W[entry[0]] == 'function') {
                            W[entry[0]](entry[1]);
                        }
                    })
                }
            };
            constructor(obj,config) {
                super(obj);
                const W = this;
                if (!W.$('.container')) W.CF('installWindow');
                W.CF('installEvent');
                W.CF('installHeaderEvent');
                W.CF('initConfig', config);
            }
            title(str) {
                this.$('.a-header .title').innerHTML = str;
            }
            body(str) {
                this.$('.a-body').innerHTML = str;
            }
            footer(str) {
                this.$('.a-footer').innerHTML = str;
            }
            hiddenFooter() {
                this.$('.a-footer').hidden = true;
            }
            hiddenPath(path, bool) {
                this.$('.a-' + path).hidden = bool || false;
            }
        };
    }(this);
};
const {Nttr,nWindow} = (function(){
    let T = this,F=T.F;
    return {
        Nttr(obj){
            if (obj instanceof F.Nttr) return obj;
            let elm = T.$(obj);
            return elm ? !elm.Nttr ? new F.Nttr(elm) : elm.Nttr : undefined;
        },
        nWindow(obj, config){
            let elm = T.$(obj);
            if (!elm) return new F.nWindow(T.$ce('div'), config).appendTo();
            if(obj instanceof F.nWindow) return obj;
            if(obj instanceof F.Nttr)elm = elm.obj;
            return new F.nWindow(elm, config);
        }
    }
}).call(Nenge);