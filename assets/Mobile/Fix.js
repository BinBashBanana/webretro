;
function _RWebAudioStart() {
    Module.CF('resume');
    return true
}
function _RWebAudioInit(latency) {
    RA.numBuffers = latency * RA.context.sampleRate / (1e3 * RA.BUFFER_SIZE) | 0;
    if (RA.numBuffers < 2) RA.numBuffers = 2;
    for (var i = 0; i < RA.numBuffers; i++) {
        RA.buffers[i] = RA.context.createBuffer(2, RA.BUFFER_SIZE, RA.context.sampleRate);
        RA.buffers[i].endTime = 0
    }
    RA.nonblock = false;
    RA.startTime = 0;
    RA.context.createGain();
    window["setTimeout"](RA.setStartTime, 0);
    Module["pauseMainLoop"]();
    return 1
}
function findEventTarget(target) {
    target = maybeCStringToJsString(target);
    if(target=="#canvas") return Module.canvas;
    var domElement = specialHTMLTargets[target] || (typeof document !== "undefined" ? document.querySelector(target) : undefined);
    return domElement
}

if (!Module.cwrap) {
    let ccall = function ccall(ident, returnType, argTypes, args, opts) {
        var toC = {
            string: (str) => {
                var ret = 0;
                if (str !== null && str !== undefined && str !== 0) {
                    var len = (str.length << 2) + 1;
                    ret = stackAlloc(len);
                    stringToUTF8(str, ret, len);
                }
                return ret;
            },
            array: (arr) => {
                var ret = stackAlloc(arr.length);
                writeArrayToMemory(arr, ret);
                return ret;
            },
        };

        function convertReturnValue(ret) {
            if (returnType === "string") {
                return UTF8ToString(ret);
            }
            if (returnType === "boolean") return Boolean(ret);
            return ret;
        }
        var func = Module['_'+ident];
        var cArgs = [];
        var stack = 0;
        if (args) {
            for (var i = 0; i < args.length; i++) {
                var converter = toC[argTypes[i]];
                if (converter) {
                    if (stack === 0) stack = stackSave();
                    cArgs[i] = converter(args[i]);
                } else {
                    cArgs[i] = args[i];
                }
            }
        }
        var ret = func.apply(null, cArgs);

        function onDone(ret) {
            if (stack !== 0) stackRestore(stack);
            return convertReturnValue(ret);
        }
        ret = onDone(ret);
        return ret;
    };
    Module.cwrap = function cwrap(ident, returnType, argTypes, opts) {
        argTypes = argTypes || [];
        var numericArgs = argTypes.every(function (type) {
            return type === "number"
        });
        var numericRet = returnType !== "string";
        if (numericRet && numericArgs && !opts) {
            return Module['_' + ident];
        }
        return function () {
            return ccall(ident, returnType, argTypes, arguments, opts)
        }
    };
}
var GLOBAL_BASE, RI, RA, MEMFS, FS;
Module.setMEMFS(MEMFS, FS, RA, GLOBAL_BASE);