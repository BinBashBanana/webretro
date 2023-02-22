var Module;
Module || (Module = (void 0 !== Module ? Module : null) || {});
var ENVIRONMENT_IS_WEB = "object" == typeof window,
    ENVIRONMENT_IS_WORKER = "function" == typeof importScripts;

function globalEval(e) {
    eval.call(null, e)
}!Module.load && Module.read && (Module.load = function (e) {
    globalEval(Module.read(e))
}), Module.print || (Module.print = function () {}), Module.printErr || (Module.printErr = Module.print), Module.arguments || (Module.arguments = []), Module.thisProgram || (Module.thisProgram = "./this.program"), Module.quit || (Module.quit = function (e, r) {
    throw r
}), Module.preRun = [], Module.postRun = [], moduleOverrides = void 0;
var Runtime = {
    setTempRet0: function (e) {
        return tempRet0 = e, e
    },
    getTempRet0: function () {
        return tempRet0
    },
    stackSave: function () {
        return STACKTOP
    },
    stackRestore: function (e) {
        STACKTOP = e
    },
    getNativeTypeSize: function (e) {
        switch (e) {
            case "i1":
            case "i8":
                return 1;
            case "i16":
                return 2;
            case "i32":
                return 4;
            case "i64":
                return 8;
            case "float":
                return 4;
            case "double":
                return 8;
            default:
                if ("*" === e[e.length - 1]) return Runtime.QUANTUM_SIZE;
                if ("i" === e[0]) {
                    var r = parseInt(e.substr(1));
                    return assert(r % 8 == 0), r / 8
                }
                return 0
        }
    },
    getNativeFieldSize: function (e) {
        return Math.max(Runtime.getNativeTypeSize(e), Runtime.QUANTUM_SIZE)
    },
    STACK_ALIGN: 16,
    prepVararg: function (e, r) {
        return "double" === r || "i64" === r ? 7 & e && (assert(4 == (7 & e)), e += 4) : assert(0 == (3 & e)), e
    },
    getAlignSize: function (e, r, t) {
        return t || "i64" != e && "double" != e ? e ? Math.min(r || (e ? Runtime.getNativeFieldSize(e) : 0), Runtime.QUANTUM_SIZE) : Math.min(r, 8) : 8
    },
    dynCall: function (e, r, t) {
        return t && t.length ? (assert(t.length == e.length - 1), assert("dynCall_" + e in Module, "bad function pointer type - no table for sig '" + e + "'"), Module["dynCall_" + e].apply(null, [r].concat(t))) : (assert(1 == e.length), assert("dynCall_" + e in Module, "bad function pointer type - no table for sig '" + e + "'"), Module["dynCall_" + e].call(null, r))
    },
    functionPointers: [],
    addFunction: function (e) {
        for (var r = 0; r < Runtime.functionPointers.length; r++)
            if (!Runtime.functionPointers[r]) return Runtime.functionPointers[r] = e, 2 * (1 + r);
        throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."
    },
    removeFunction: function (e) {
        Runtime.functionPointers[(e - 2) / 2] = null
    },
    warnOnce: function (e) {
        Runtime.warnOnce.shown || (Runtime.warnOnce.shown = {}), Runtime.warnOnce.shown[e] || (Runtime.warnOnce.shown[e] = 1, Module.printErr(e))
    },
    funcWrappers: {},
    getFuncWrapper: function (e, r) {
        if (e) {
            assert(r), Runtime.funcWrappers[r] || (Runtime.funcWrappers[r] = {});
            var t = Runtime.funcWrappers[r];
            return t[e] || (1 === r.length ? t[e] = function () {
                return Runtime.dynCall(r, e)
            } : 2 === r.length ? t[e] = function (t) {
                return Runtime.dynCall(r, e, [t])
            } : t[e] = function () {
                return Runtime.dynCall(r, e, Array.prototype.slice.call(arguments))
            }), t[e]
        }
    },
    getCompilerSetting: function (e) {
        throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"
    },
    stackAlloc: function (e) {
        var r = STACKTOP;
        return assert((0 | (STACKTOP = (STACKTOP = STACKTOP + e | 0) + 15 & -16)) < (0 | STACK_MAX) | 0), r
    },
    staticAlloc: function (e) {
        var r = STATICTOP;
        return STATICTOP = (STATICTOP = STATICTOP + (assert(!staticSealed), e) | 0) + 15 & -16, r
    },
    dynamicAlloc: function (e) {
        assert(DYNAMICTOP_PTR);
        var r = HEAP32[DYNAMICTOP_PTR >> 2],
            t = -16 & (r + e + 15 | 0);
        if ((HEAP32[DYNAMICTOP_PTR >> 2] = t, t >= TOTAL_MEMORY) && !enlargeMemory()) return HEAP32[DYNAMICTOP_PTR >> 2] = r, 0;
        return r
    },
    alignMemory: function (e, r) {
        return e = Math.ceil(e / (r || 16)) * (r || 16)
    },
    makeBigInt: function (e, r, t) {
        return t ? +(e >>> 0) + 4294967296 * +(r >>> 0) : +(e >>> 0) + 4294967296 * +(0 | r)
    },
    GLOBAL_BASE: 8,
    QUANTUM_SIZE: 4,
    __dummy__: 0
};
Module.Runtime = Runtime;
var ABORT = 0,
    EXITSTATUS = 0,
    cwrap, ccall;

function assert(e, r) {
    e || abort("Assertion failed: " + r)
}

function getCFunc(_0x5d9040) {
    var _0x23b817 = Module["_" + _0x5d9040];
    if (!_0x23b817) try {
        _0x23b817 = eval("_" + _0x5d9040)
    } catch (e) {}
    return assert(_0x23b817, "Cannot call unknown function " + _0x5d9040 + " (perhaps LLVM optimizations or closure removed it?)"), _0x23b817
}

function setValue(e, r, t, n) {
    switch ("*" === (t = t || "i8").charAt(t.length - 1) && (t = "i32"), t) {
        case "i1":
            HEAP8[e >> 0] = r;
            break;
        case "i8":
            HEAP8[e >> 0] = r;
            break;
        case "i16":
            HEAP16[e >> 1] = r;
            break;
        case "i32":
            HEAP32[e >> 2] = r;
            break;
        case "i64":
            tempI64 = [r >>> 0, (tempDouble = r, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (0 | Math_min(+Math_floor(tempDouble / 4294967296), 4294967295)) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[e >> 2] = tempI64[0], HEAP32[e + 4 >> 2] = tempI64[1];
            break;
        case "float":
            HEAPF32[e >> 2] = r;
            break;
        case "double":
            HEAPF64[e >> 3] = r;
            break;
        default:
            abort("invalid type for setValue: " + t)
    }
}

function getValue(e, r, t) {
    switch ("*" === (r = r || "i8").charAt(r.length - 1) && (r = "i32"), r) {
        case "i1":
            return HEAP8[e >> 0];
        case "i8":
            return HEAP8[e >> 0];
        case "i16":
            return HEAP16[e >> 1];
        case "i32":
            return HEAP32[e >> 2];
        case "i64":
            return HEAP32[e >> 2];
        case "float":
            return HEAPF32[e >> 2];
        case "double":
            return HEAPF64[e >> 3];
        default:
            abort("invalid type for setValue: " + r)
    }
    return null
}(function () {
    var _0x2ad24a = {
            stackSave: function () {
                Runtime.stackSave()
            },
            stackRestore: function () {
                Runtime.stackRestore()
            },
            arrayToC: function (e) {
                var r = Runtime.stackAlloc(e.length);
                return writeArrayToMemory(e, r), r
            },
            stringToC: function (e) {
                var r = 0;
                if (null != e && 0 !== e) {
                    var t = 1 + (e.length << 2);
                    stringToUTF8(e, r = Runtime.stackAlloc(t), t)
                }
                return r
            }
        },
        _0x3c7171 = {
            string: _0x2ad24a.stringToC,
            array: _0x2ad24a.arrayToC
        };
    ccall = function (e, r, t, n, o) {
        var i = getCFunc(e),
            a = [],
            s = 0;
        if (assert("array" !== r, 'Return type should not be "array".'), n)
            for (var u = 0; u < n.length; u++) {
                var c = _0x3c7171[t[u]];
                c ? (0 === s && (s = Runtime.stackSave()), a[u] = c(n[u])) : a[u] = n[u]
            }
        var l = i.apply(null, a);
        if (o && o.async || "object" != typeof EmterpreterAsync || assert(!EmterpreterAsync.state, "cannot start async op with normal JS calling ccall"), o && o.async && assert(!r, "async ccalls cannot return values"), "string" === r && (l = Pointer_stringify(l)), 0 !== s) {
            if (o && o.async) return void EmterpreterAsync.asyncFinalizers.push((function () {
                Runtime.stackRestore(s)
            }));
            Runtime.stackRestore(s)
        }
        return l
    };
    var _0x4e9080 = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;

    function _0x525a72(e) {
        var r = e.toString().match(_0x4e9080).slice(1);
        return {
            arguments: r[0],
            body: r[1],
            returnValue: r[2]
        }
    }
    var _0x5507b1 = null;

    function _0x576877() {
        if (!_0x5507b1)
            for (var e in _0x5507b1 = {}, _0x2ad24a) _0x2ad24a.hasOwnProperty(e) && (_0x5507b1[e] = _0x525a72(_0x2ad24a[e]))
    }
    cwrap = function cwrap(_0x557d23, _0x36bd20, _0x501373) {
        _0x501373 = _0x501373 || [];
        var _0xc18cca = getCFunc(_0x557d23),
            _0x10a9e9 = _0x501373.every((function (e) {
                return "number" === e
            })),
            _0xda1dce = "string" !== _0x36bd20;
        if (_0xda1dce && _0x10a9e9) return _0xc18cca;
        var _0x3c93ad = _0x501373.map((function (e, r) {
                return "$" + r
            })),
            _0x6f14b3 = "(function(" + _0x3c93ad.join(",") + ") {",
            _0x2c5f4f = _0x501373.length;
        if (!_0x10a9e9) {
            _0x576877(), _0x6f14b3 += "var stack = " + _0x5507b1.stackSave.body + ";";
            for (var _0x32e944 = 0; _0x32e944 < _0x2c5f4f; _0x32e944++) {
                var _0x596eed = _0x3c93ad[_0x32e944],
                    _0x31887c = _0x501373[_0x32e944];
                if ("number" !== _0x31887c) {
                    var _0x2abb1c = _0x5507b1[_0x31887c + "ToC"];
                    _0x6f14b3 += "var " + _0x2abb1c.arguments + " = " + _0x596eed + ";", _0x6f14b3 += _0x2abb1c.body + ";", _0x6f14b3 += _0x596eed + "=(" + _0x2abb1c.returnValue + ");"
                }
            }
        }
        var _0x7f6ef = _0x525a72((function () {
            return _0xc18cca
        })).returnValue;
        if (_0x6f14b3 += "var ret = " + _0x7f6ef + "(" + _0x3c93ad.join(",") + ");", !_0xda1dce) {
            var _0x296ada = _0x525a72((function () {
                return Pointer_stringify
            })).returnValue;
            _0x6f14b3 += "ret = " + _0x296ada + "(ret);"
        }
        return _0x6f14b3 += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }", _0x10a9e9 || (_0x576877(), _0x6f14b3 += _0x5507b1.stackRestore.body.replace("()", "(stack)") + ";"), _0x6f14b3 += "return ret})", eval(_0x6f14b3)
    }
})(), Module.ccall = ccall, Module.cwrap = cwrap, Module.setValue = setValue, Module.getValue = getValue;
var ALLOC_NORMAL = 0,
    ALLOC_STACK = 1,
    ALLOC_STATIC = 2,
    ALLOC_DYNAMIC = 3,
    ALLOC_NONE = 4;

function allocate(e, r, t, n) {
    var o, i;
    "number" == typeof e ? (o = !0, i = e) : (o = !1, i = e.length);
    var a, s = "string" == typeof r ? r : null;
    if (a = t == ALLOC_NONE ? n : ["function" == typeof _malloc ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][void 0 === t ? ALLOC_STATIC : t](Math.max(i, s ? 1 : r.length)), o) {
        var u;
        n = a;
        for (assert(0 == (3 & a)), u = a + (-4 & i); n < u; n += 4) HEAP32[n >> 2] = 0;
        for (u = a + i; n < u;) HEAP8[n++ >> 0] = 0;
        return a
    }
    if ("i8" === s) return e.subarray || e.slice ? HEAPU8.set(e, a) : HEAPU8.set(new Uint8Array(e), a), a;
    for (var c, l, f, d = 0; d < i;) {
        var S = e[d];
        "function" == typeof S && (S = Runtime.getFunctionIndex(S)), 0 !== (c = s || r[d]) ? (assert(c, "Must know what type to store in allocate!"), "i64" == c && (c = "i32"), setValue(a + d, S, c), f !== c && (l = Runtime.getNativeTypeSize(c), f = c), d += l) : d++
    }
    return a
}

function getMemory(e) {
    return staticSealed ? runtimeInitialized ? _malloc(e) : Runtime.dynamicAlloc(e) : Runtime.staticAlloc(e)
}

function Pointer_stringify(e, r) {
    if (0 === r || !e) return "";
    for (var t, n = 0, o = 0; assert(e + o < TOTAL_MEMORY), n |= t = HEAPU8[e + o >> 0], (0 != t || r) && (o++, !r || o != r););
    r || (r = o);
    var i = "";
    if (n < 128) {
        for (var a, s = 1024; r > 0;) a = String.fromCharCode.apply(String, HEAPU8.subarray(e, e + Math.min(r, s))), i = i ? i + a : a, e += s, r -= s;
        return i
    }
    return Module.UTF8ToString(e)
}

function AsciiToString(e) {
    for (var r = "";;) {
        var t = HEAP8[e++ >> 0];
        if (!t) return r;
        r += String.fromCharCode(t)
    }
}

function stringToAscii(e, r) {
    return writeAsciiToMemory(e, r, !1)
}
Module.ALLOC_NORMAL = ALLOC_NORMAL, Module.ALLOC_STACK = ALLOC_STACK, Module.ALLOC_STATIC = ALLOC_STATIC, Module.ALLOC_DYNAMIC = ALLOC_DYNAMIC, Module.ALLOC_NONE = ALLOC_NONE, Module.allocate = allocate, Module.getMemory = getMemory, Module.Pointer_stringify = Pointer_stringify, Module.AsciiToString = AsciiToString, Module.stringToAscii = stringToAscii;
var UTF8Decoder = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;

function UTF8ArrayToString(e, r, t) {
    var n = r + t,
        o = r;
    if (n) o = n;
    else
        for (; e[o] && !(o >= n);) ++o;
    var i = e.subarray(r, o);
    if ("undefined" != typeof TextDecoder) {
        var a = new TextDecoder("utf8").decode(i),
            s = (new TextEncoder).encode(a);
        return Array.from(i).join(",") != Array.from(s).join(",") && (a = new TextDecoder("gbk").decode(i)), a
    }
}

function UTF8ToString(e) {
    return UTF8ArrayToString(HEAPU8, e)
}

function stringToUTF8Array(e, r, t, n) {
    if (!(n > 0)) return 0;
    for (var o = t, i = t + n - 1, a = 0; a < e.length; ++a) {
        var s = e.charCodeAt(a);
        if (s >= 55296 && s <= 57343 && (s = 65536 + ((1023 & s) << 10) | 1023 & e.charCodeAt(++a)), s <= 127) {
            if (t >= i) break;
            r[t++] = s
        } else if (s <= 2047) {
            if (t + 1 >= i) break;
            r[t++] = 192 | s >> 6, r[t++] = 128 | 63 & s
        } else if (s <= 65535) {
            if (t + 2 >= i) break;
            r[t++] = 224 | s >> 12, r[t++] = 128 | s >> 6 & 63, r[t++] = 128 | 63 & s
        } else if (s <= 2097151) {
            if (t + 3 >= i) break;
            r[t++] = 240 | s >> 18, r[t++] = 128 | s >> 12 & 63, r[t++] = 128 | s >> 6 & 63, r[t++] = 128 | 63 & s
        } else if (s <= 67108863) {
            if (t + 4 >= i) break;
            r[t++] = 248 | s >> 24, r[t++] = 128 | s >> 18 & 63, r[t++] = 128 | s >> 12 & 63, r[t++] = 128 | s >> 6 & 63, r[t++] = 128 | 63 & s
        } else {
            if (t + 5 >= i) break;
            r[t++] = 252 | s >> 30, r[t++] = 128 | s >> 24 & 63, r[t++] = 128 | s >> 18 & 63, r[t++] = 128 | s >> 12 & 63, r[t++] = 128 | s >> 6 & 63, r[t++] = 128 | 63 & s
        }
    }
    return r[t] = 0, t - o
}

function stringToUTF8(e, r, t) {
    return assert("number" == typeof t, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), stringToUTF8Array(e, HEAPU8, r, t)
}

function lengthBytesUTF8(e) {
    for (var r = 0, t = 0; t < e.length; ++t) {
        var n = e.charCodeAt(t);
        n >= 55296 && n <= 57343 && (n = 65536 + ((1023 & n) << 10) | 1023 & e.charCodeAt(++t)), n <= 127 ? ++r : r += n <= 2047 ? 2 : n <= 65535 ? 3 : n <= 2097151 ? 4 : n <= 67108863 ? 5 : 6
    }
    return r
}
Module.UTF8ArrayToString = UTF8ArrayToString, Module.UTF8ToString = UTF8ToString, Module.stringToUTF8Array = stringToUTF8Array, Module.stringToUTF8 = stringToUTF8, Module.lengthBytesUTF8 = lengthBytesUTF8;
var UTF16Decoder = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0;

function demangle(e) {
    var r = Module.___cxa_demangle || Module.__cxa_demangle;
    if (r) {
        try {
            var t = e.substr(1),
                n = lengthBytesUTF8(t) + 1,
                o = _malloc(n);
            stringToUTF8(t, o, n);
            var i = _malloc(4),
                a = r(o, 0, 0, i);
            if (0 === getValue(i, "i32") && a) return Pointer_stringify(a)
        } catch (e) {} finally {
            o && _free(o), i && _free(i), a && _free(a)
        }
        return e
    }
    return Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling"), e
}

function demangleAll(e) {
    return e.replace(/__Z[\w\d_]+/g, (function (e) {
        var r = demangle(e);
        return e === r ? e : e + " [" + r + "]"
    }))
}

function jsStackTrace() {
    var e = new Error;
    if (!e.stack) {
        try {
            throw new Error(0)
        } catch (r) {
            e = r
        }
        if (!e.stack) return "(no stack trace available)"
    }
    return e.stack.toString()
}

function stackTrace() {
    var e = jsStackTrace();
    return Module.extraStackTrace && (e += "\n" + Module.extraStackTrace()), demangleAll(e)
}
Module.stackTrace = stackTrace;
var WASM_PAGE_SIZE = 65536,
    ASMJS_PAGE_SIZE = 16777216,
    MIN_TOTAL_MEMORY = 16777216,
    HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64, STATIC_BASE, STATICTOP, staticSealed, STACK_BASE, STACKTOP, STACK_MAX, DYNAMIC_BASE, DYNAMICTOP_PTR, byteLength;

function alignUp(e, r) {
    return e % r > 0 && (e += r - e % r), e
}

function updateGlobalBuffer(e) {
    Module.buffer = buffer = e
}

function updateGlobalBufferViews() {
    Module.HEAP8 = HEAP8 = new Int8Array(buffer), Module.HEAP16 = HEAP16 = new Int16Array(buffer), Module.HEAP32 = HEAP32 = new Int32Array(buffer), Module.HEAPU8 = HEAPU8 = new Uint8Array(buffer), Module.HEAPU16 = HEAPU16 = new Uint16Array(buffer), Module.HEAPU32 = HEAPU32 = new Uint32Array(buffer), Module.HEAPF32 = HEAPF32 = new Float32Array(buffer), Module.HEAPF64 = HEAPF64 = new Float64Array(buffer)
}

function writeStackCookie() {
    assert(0 == (3 & STACK_MAX)), HEAPU32[(STACK_MAX >> 2) - 1] = 34821223, HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022
}

function checkStackCookie() {
    if (34821223 == HEAPU32[(STACK_MAX >> 2) - 1] && 2310721022 == HEAPU32[(STACK_MAX >> 2) - 2] || abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" + HEAPU32[(STACK_MAX >> 2) - 2].toString(16) + " " + HEAPU32[(STACK_MAX >> 2) - 1].toString(16)), 1668509029 !== HEAP32[0]) throw "Runtime error: The application has corrupted its heap memory area (address zero)!"
}

function abortStackOverflow(e) {
    abort("Stack overflow! Attempted to allocate " + e + " bytes on the stack, but stack has only " + (STACK_MAX - Module.asm.stackSave() + e) + " bytes available!")
}

function abortOnCannotGrowMemory() {
    abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")
}

function enlargeMemory() {
    assert(HEAP32[DYNAMICTOP_PTR >> 2] > TOTAL_MEMORY);
    var e = Module.usingWasm ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE,
        r = 2147483648 - e;
    if (HEAP32[DYNAMICTOP_PTR >> 2] > r) return Module.printErr("Cannot enlarge memory, asked to go up to " + HEAP32[DYNAMICTOP_PTR >> 2] + " bytes, but the limit is " + r + " bytes!"), !1;
    var t = TOTAL_MEMORY;
    for (TOTAL_MEMORY = Math.max(TOTAL_MEMORY, MIN_TOTAL_MEMORY); TOTAL_MEMORY < HEAP32[DYNAMICTOP_PTR >> 2];) TOTAL_MEMORY = TOTAL_MEMORY <= 536870912 ? alignUp(2 * TOTAL_MEMORY, e) : Math.min(alignUp((3 * TOTAL_MEMORY + 2147483648) / 4, e), r);
    var n = Date.now(),
        o = Module.reallocBuffer(TOTAL_MEMORY);
    return o && o.byteLength == TOTAL_MEMORY ? (updateGlobalBuffer(o), updateGlobalBufferViews(), Module.printErr("enlarged memory arrays from " + t + " to " + TOTAL_MEMORY + ", took " + (Date.now() - n) + " ms (has ArrayBuffer.transfer? " + !!ArrayBuffer.transfer + ")"), Module.usingWasm || Module.printErr("Warning: Enlarging memory arrays, this is not fast! " + [t, TOTAL_MEMORY]), !0) : (Module.printErr("Failed to grow the heap from " + t + " bytes to " + TOTAL_MEMORY + " bytes, not enough memory!"), o && Module.printErr("Expected to get back a buffer of size " + TOTAL_MEMORY + " bytes, but instead got back a buffer of size " + o.byteLength), TOTAL_MEMORY = t, !1)
}
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0, staticSealed = !1, Module.reallocBuffer || (Module.reallocBuffer = function (e) {
    var r;
    try {
        if (ArrayBuffer.transfer) r = ArrayBuffer.transfer(buffer, e);
        else {
            var t = HEAP8;
            r = new ArrayBuffer(e), new Int8Array(r).set(t)
        }
    } catch (e) {
        return !1
    }
    return !!_emscripten_replace_memory(r) && r
});
try {
    byteLength = Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get), byteLength(new ArrayBuffer(4))
} catch (e) {
    byteLength = function (e) {
        return e.byteLength
    }
}
var TOTAL_STACK = Module.TOTAL_STACK || 5242880,
    TOTAL_MEMORY = Module.TOTAL_MEMORY || 16777216;

function getTotalMemory() {
    return TOTAL_MEMORY
}
if (TOTAL_MEMORY < TOTAL_STACK && Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")"), assert("undefined" != typeof Int32Array && "undefined" != typeof Float64Array && void 0 !== Int32Array.prototype.subarray && void 0 !== Int32Array.prototype.set, "JS engine does not provide full typed array support"), Module.buffer ? (buffer = Module.buffer, assert(buffer.byteLength === TOTAL_MEMORY, "provided buffer should be " + TOTAL_MEMORY + " bytes, but it is " + buffer.byteLength)) : (buffer = new ArrayBuffer(TOTAL_MEMORY), assert(buffer.byteLength === TOTAL_MEMORY)), updateGlobalBufferViews(), HEAP32[0] = 1668509029, HEAP16[1] = 25459, 115 !== HEAPU8[2] || 99 !== HEAPU8[3]) throw "Runtime error: expected the system to be little-endian!";

function callRuntimeCallbacks(e) {
    for (; e.length > 0;) {
        var r = e.shift();
        if ("function" != typeof r) {
            var t = r.func;
            "number" == typeof t ? void 0 === r.arg ? Module.dynCall_v(t) : Module.dynCall_vi(t, r.arg) : t(void 0 === r.arg ? null : r.arg)
        } else r()
    }
}
Module.HEAP = HEAP, Module.buffer = buffer, Module.HEAP8 = HEAP8, Module.HEAP16 = HEAP16, Module.HEAP32 = HEAP32, Module.HEAPU8 = HEAPU8, Module.HEAPU16 = HEAPU16, Module.HEAPU32 = HEAPU32, Module.HEAPF32 = HEAPF32, Module.HEAPF64 = HEAPF64;
var __ATPRERUN__ = [],
    __ATINIT__ = [],
    __ATMAIN__ = [],
    __ATEXIT__ = [],
    __ATPOSTRUN__ = [],
    runtimeInitialized = !1,
    runtimeExited = !1;

function preRun() {
    if (Module.preRun)
        for ("function" == typeof Module.preRun && (Module.preRun = [Module.preRun]); Module.preRun.length;) addOnPreRun(Module.preRun.shift());
    callRuntimeCallbacks(__ATPRERUN__)
}

function ensureInitRuntime() {
    checkStackCookie(), runtimeInitialized || (runtimeInitialized = !0, callRuntimeCallbacks(__ATINIT__))
}

function preMain() {
    checkStackCookie(), callRuntimeCallbacks(__ATMAIN__)
}

function exitRuntime() {
    checkStackCookie(), callRuntimeCallbacks(__ATEXIT__), runtimeExited = !0
}

function postRun() {
    if (checkStackCookie(), Module.postRun)
        for ("function" == typeof Module.postRun && (Module.postRun = [Module.postRun]); Module.postRun.length;) addOnPostRun(Module.postRun.shift());
    callRuntimeCallbacks(__ATPOSTRUN__)
}

function addOnPreRun(e) {
    __ATPRERUN__.unshift(e)
}

function addOnInit(e) {
    __ATINIT__.unshift(e)
}

function addOnPreMain(e) {
    __ATMAIN__.unshift(e)
}

function addOnExit(e) {
    __ATEXIT__.unshift(e)
}

function addOnPostRun(e) {
    __ATPOSTRUN__.unshift(e)
}

function intArrayFromString(e, r, t) {
    var n = t > 0 ? t : lengthBytesUTF8(e) + 1,
        o = new Array(n),
        i = stringToUTF8Array(e, o, 0, o.length);
    return r && (o.length = i), o
}

function intArrayToString(e) {
    for (var r = [], t = 0; t < e.length; t++) {
        var n = e[t];
        n > 255 && (assert(!1, "Character code " + n + " (" + String.fromCharCode(n) + ")  at offset " + t + " not in 0x00-0xFF."), n &= 255), r.push(String.fromCharCode(n))
    }
    return r.join("")
}

function writeStringToMemory(e, r, t) {
    var n, o;
    Runtime.warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!"), t && (o = r + lengthBytesUTF8(e), n = HEAP8[o]), stringToUTF8(e, r, 1 / 0), t && (HEAP8[o] = n)
}

function writeArrayToMemory(e, r) {
    assert(e.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)"), HEAP8.set(e, r)
}

function writeAsciiToMemory(e, r, t) {
    for (var n = 0; n < e.length; ++n) assert(e.charCodeAt(n) == e.charCodeAt(n) & 255), HEAP8[r++ >> 0] = e.charCodeAt(n);
    t || (HEAP8[r >> 0] = 0)
}
Module.addOnPreRun = addOnPreRun, Module.addOnInit = addOnInit, Module.addOnPreMain = addOnPreMain, Module.addOnExit = addOnExit, Module.addOnPostRun = addOnPostRun, Module.intArrayFromString = intArrayFromString, Module.intArrayToString = intArrayToString, Module.writeStringToMemory = writeStringToMemory, Module.writeArrayToMemory = writeArrayToMemory, Module.writeAsciiToMemory = writeAsciiToMemory, Math.imul && -5 === Math.imul(4294967295, 5) || (Math.imul = function (e, r) {
    var t = 65535 & e,
        n = 65535 & r;
    return t * n + ((e >>> 16) * n + t * (r >>> 16) << 16) | 0
}), Math.imul = Math.imul, Math.clz32 || (Math.clz32 = function (e) {
    e >>>= 0;
    for (var r = 0; r < 32; r++)
        if (e & 1 << 31 - r) return r;
    return 32
}), Math.clz32 = Math.clz32, Math.trunc || (Math.trunc = function (e) {
    return e < 0 ? Math.ceil(e) : Math.floor(e)
}), Math.trunc = Math.trunc;
var Math_abs = Math.abs,
    Math_cos = Math.cos,
    Math_sin = Math.sin,
    Math_tan = Math.tan,
    Math_acos = Math.acos,
    Math_asin = Math.asin,
    Math_atan = Math.atan,
    Math_atan2 = Math.atan2,
    Math_exp = Math.exp,
    Math_log = Math.log,
    Math_sqrt = Math.sqrt,
    Math_ceil = Math.ceil,
    Math_floor = Math.floor,
    Math_pow = Math.pow,
    Math_imul = Math.imul,
    Math_fround = Math.fround,
    Math_round = Math.round,
    Math_min = Math.min,
    Math_clz32 = Math.clz32,
    Math_trunc = Math.trunc,
    runDependencies = 0,
    runDependencyWatcher = null,
    dependenciesFulfilled = null,
    runDependencyTracking = {};

function getUniqueRunDependency(e) {
    for (var r = e;;) {
        if (!runDependencyTracking[e]) return e;
        e = r + Math.random()
    }
    return e
}

function addRunDependency(e) {
    runDependencies++, Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies), e ? (assert(!runDependencyTracking[e]), runDependencyTracking[e] = 1, null === runDependencyWatcher && "undefined" != typeof setInterval && (runDependencyWatcher = setInterval((function () {
        if (ABORT) return clearInterval(runDependencyWatcher), void(runDependencyWatcher = null);
        var e = !1;
        for (var r in runDependencyTracking) e || (e = !0, Module.printErr("still waiting on run dependencies:")), Module.printErr("dependency: " + r);
        e && Module.printErr("(end of list)")
    }), 1e4))) : Module.printErr("warning: run dependency added without ID")
}

function removeRunDependency(e) {
    if (runDependencies--, Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies), e ? (assert(runDependencyTracking[e]), delete runDependencyTracking[e]) : Module.printErr("warning: run dependency removed without ID"), 0 == runDependencies && (null !== runDependencyWatcher && (clearInterval(runDependencyWatcher), runDependencyWatcher = null), dependenciesFulfilled)) {
        var r = dependenciesFulfilled;
        dependenciesFulfilled = null, r()
    }
}
Module.addRunDependency = addRunDependency, Module.removeRunDependency = removeRunDependency, Module.preloadedImages = {}, Module.preloadedAudios = {};
var getTimes = () => (new Date).getTime(),
    nowTime = getTimes(),
    costTime = () => getTimes() - nowTime,
    ASM_CONSTS = [function (e, r, t) {
        for (var n = new Uint8Array(r), o = 0; o < r; o++) n[o] = getValue(t + o);
        postMessage({
            t: 2,
            file: Pointer_stringify(e),
            size: r,
            data: n,
            time: costTime()
        }), n = null
    }, function () {
        postMessage({
            t: 1,
            time: costTime()
        })
    }, function (e, r) {
        e > r || postMessage({
            t: 4,
            current: e,
            total: r,
            time: costTime()
        })
    }];

function _emscripten_asm_const_i(e) {
    return ASM_CONSTS[e]()
}

function _emscripten_asm_const_iiii(e, r, t, n) {
    return ASM_CONSTS[e](r, t, n)
}

function _emscripten_asm_const_iii(e, r, t) {
    return ASM_CONSTS[e](r, t)
}

function getAllocte() {
    var e, r = '[--4]d·È n;¬0Ù&AÜvôQkkXa²M<qP ¸íDðè£ÖÖ³aË°ÂdÔÒÓxâ\n ò½½[--2][--3][--35][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--15][--3][--3][--3][--3][--3]\b[--3]\t[--3]\n[--3]\v[--3]\r[--3][--3][--3][--3][--3][--3][--3]#[--3]+[--3]3[--3];[--3]C[--3]S[--3]c[--3]s[--3][--3]£[--3]Ã[--3]ã[--3][--26][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3][--3]\b[--3]\b[--3]\t[--3]\t[--3]\n[--3]\n[--3]\v[--3]\v[--3]\f[--3]\f[--3]\r[--3]\r[--11][--3][--3][--3][--3][--3][--3]\t[--3]\r[--3][--3][--3]![--3]1[--3]A[--3]a[--3][--3]Á[--3][--2][--2][--2][--2][--2][--2]\b[--2]\f[--2][--2][--2] [--2]0[--2]@[--2]`[--198]è[--54]D[--2][--11][--23][--3][--3][--3][--10][--14]\nÿÿÿÿ[--44]D[--2]rb\0 %d.\n\0{ var data = new Uint8Array($1); for(var i=0;i<$1;i++) { data[i] = getValue($2+i); } postMessage({"t":2, "file":Pointer_stringify($0), "size":$1, "data":data}); data = null; }\0{ postMessage({"t":1}); }\0File CRC differs from ZIP CRC. File: 0x%x, ZIP: 0x%x.\n\0Couldn\'t allocate memory.\0Didn\'t read whole file.\0{ postMessage({"t":4, "current":$0, "total":$1}) }\0\0\0\b\t\n\v\f\r\0\v\0\0\n\0[--4][--6]\t[--4]\v[--8]\0\n\n\0\t\v\v[--2]\t\v[--2]\v\0[--3][--16]\v[--8]\0\n\n\0\n[--2]\0\t\v[--3]\t\0\v[--2]\v[--25]\f[--11]\f[--4]\f[--4]\t\f[--5]\f[--2]\f[--25][--11]\r[--3]\r[--4]\t[--5][--2][--25][--11][--4][--4]\t[--5][--2][--2][--3][--25][--3][--6]\t[--35]\v[--11]\n[--4]\n[--4]\t\v[--5]\v[--2]\v[--25]\f[--11]\f[--4]\f[--4]\t\f[--5]\f[--2]\f[--2]-+   0X0x\0(null)\0-0X+0X 0X-0x+0x 0x\0inf\0INF\0nan\0NAN\x000123456789ABCDEF.\0T!"\rK\f\v\'hnopqb \b($\t\n%#}&*+<=>?CGJMXYZ[\\]^_`acdefgijklrstyz{|\0Illegal byte sequence\0Domain error\0Result not representable\0Not a tty\0Permission denied\0Operation not permitted\0No such file or directory\0No such process\0File exists\0Value too large for data type\0No space left on device\0Out of memory\0Resource busy\0Interrupted system call\0Resource temporarily unavailable\0Invalid seek\0Cross-device link\0Read-only file system\0Directory not empty\0Connection reset by peer\0Operation timed out\0Connection refused\0Host is down\0Host is unreachable\0Address in use\0Broken pipe\0I/O error\0No such device or address\0Block device required\0No such device\0Not a directory\0Is a directory\0Text file busy\0Exec format error\0Invalid argument\0Argument list too long\0Symbolic link loop\0Filename too long\0Too many open files in system\0No file descriptors available\0Bad file descriptor\0No child process\0Bad address\0File too large\0Too many links\0No locks available\0Resource deadlock would occur\0State not recoverable\0Previous owner died\0Operation canceled\0Function not implemented\0No message of desired type\0Identifier removed\0Device not a stream\0No data available\0Device timeout\0Out of streams resources\0Link has been severed\0Protocol error\0Bad message\0File descriptor in bad state\0Not a socket\0Destination address required\0Message too large\0Protocol wrong type for socket\0Protocol not available\0Protocol not supported\0Socket type not supported\0Not supported\0Protocol family not supported\0Address family not supported by protocol\0Address not available\0Network is down\0Network unreachable\0Connection reset by network\0Connection aborted\0No buffer space available\0Socket is connected\0Socket not connected\0Cannot send after socket shutdown\0Operation already in progress\0Operation in progress\0Stale file handle\0Remote I/O error\0Quota exceeded\0No medium found\0Wrong medium type\0No error information[--2]rwa\0',
        t = [];
    return r.match(/\[--\d+?\]/g).forEach((t => {
        e = parseInt(t.match(/\d+/g)[0]), r = r.replace(t, Array(e).fill("\0").join(""))
    })), Array.from(r).forEach((e => t.push(e.charCodeAt(0)))), t
}
STATIC_BASE = Runtime.GLOBAL_BASE, STATICTOP = STATIC_BASE + 5408, __ATINIT__.push(), allocate(getAllocte(), "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = STATICTOP;
STATICTOP += 16, assert(tempDoublePtr % 8 == 0);
var ERRNO_CODES = {
        EPERM: 1,
        ENOENT: 2,
        ESRCH: 3,
        EINTR: 4,
        EIO: 5,
        ENXIO: 6,
        E2BIG: 7,
        ENOEXEC: 8,
        EBADF: 9,
        ECHILD: 10,
        EAGAIN: 11,
        EWOULDBLOCK: 11,
        ENOMEM: 12,
        EACCES: 13,
        EFAULT: 14,
        ENOTBLK: 15,
        EBUSY: 16,
        EEXIST: 17,
        EXDEV: 18,
        ENODEV: 19,
        ENOTDIR: 20,
        EISDIR: 21,
        EINVAL: 22,
        ENFILE: 23,
        EMFILE: 24,
        ENOTTY: 25,
        ETXTBSY: 26,
        EFBIG: 27,
        ENOSPC: 28,
        ESPIPE: 29,
        EROFS: 30,
        EMLINK: 31,
        EPIPE: 32,
        EDOM: 33,
        ERANGE: 34,
        ENOMSG: 42,
        EIDRM: 43,
        ECHRNG: 44,
        EL2NSYNC: 45,
        EL3HLT: 46,
        EL3RST: 47,
        ELNRNG: 48,
        EUNATCH: 49,
        ENOCSI: 50,
        EL2HLT: 51,
        EDEADLK: 35,
        ENOLCK: 37,
        EBADE: 52,
        EBADR: 53,
        EXFULL: 54,
        ENOANO: 55,
        EBADRQC: 56,
        EBADSLT: 57,
        EDEADLOCK: 35,
        EBFONT: 59,
        ENOSTR: 60,
        ENODATA: 61,
        ETIME: 62,
        ENOSR: 63,
        ENONET: 64,
        ENOPKG: 65,
        EREMOTE: 66,
        ENOLINK: 67,
        EADV: 68,
        ESRMNT: 69,
        ECOMM: 70,
        EPROTO: 71,
        EMULTIHOP: 72,
        EDOTDOT: 73,
        EBADMSG: 74,
        ENOTUNIQ: 76,
        EBADFD: 77,
        EREMCHG: 78,
        ELIBACC: 79,
        ELIBBAD: 80,
        ELIBSCN: 81,
        ELIBMAX: 82,
        ELIBEXEC: 83,
        ENOSYS: 38,
        ENOTEMPTY: 39,
        ENAMETOOLONG: 36,
        ELOOP: 40,
        EOPNOTSUPP: 95,
        EPFNOSUPPORT: 96,
        ECONNRESET: 104,
        ENOBUFS: 105,
        EAFNOSUPPORT: 97,
        EPROTOTYPE: 91,
        ENOTSOCK: 88,
        ENOPROTOOPT: 92,
        ESHUTDOWN: 108,
        ECONNREFUSED: 111,
        EADDRINUSE: 98,
        ECONNABORTED: 103,
        ENETUNREACH: 101,
        ENETDOWN: 100,
        ETIMEDOUT: 110,
        EHOSTDOWN: 112,
        EHOSTUNREACH: 113,
        EINPROGRESS: 115,
        EALREADY: 114,
        EDESTADDRREQ: 89,
        EMSGSIZE: 90,
        EPROTONOSUPPORT: 93,
        ESOCKTNOSUPPORT: 94,
        EADDRNOTAVAIL: 99,
        ENETRESET: 102,
        EISCONN: 106,
        ENOTCONN: 107,
        ETOOMANYREFS: 109,
        EUSERS: 87,
        EDQUOT: 122,
        ESTALE: 116,
        ENOTSUP: 95,
        ENOMEDIUM: 123,
        EILSEQ: 84,
        EOVERFLOW: 75,
        ECANCELED: 125,
        ENOTRECOVERABLE: 131,
        EOWNERDEAD: 130,
        ESTRPIPE: 86
    },
    ERRNO_MESSAGES = {
        0: "Success",
        1: "Not super-user",
        2: "No such file or directory",
        3: "No such process",
        4: "Interrupted system call",
        5: "I/O error",
        6: "No such device or address",
        7: "Arg list too long",
        8: "Exec format error",
        9: "Bad file number",
        10: "No children",
        11: "No more processes",
        12: "Not enough core",
        13: "Permission denied",
        14: "Bad address",
        15: "Block device required",
        16: "Mount device busy",
        17: "File exists",
        18: "Cross-device link",
        19: "No such device",
        20: "Not a directory",
        21: "Is a directory",
        22: "Invalid argument",
        23: "Too many open files in system",
        24: "Too many open files",
        25: "Not a typewriter",
        26: "Text file busy",
        27: "File too large",
        28: "No space left on device",
        29: "Illegal seek",
        30: "Read only file system",
        31: "Too many links",
        32: "Broken pipe",
        33: "Math arg out of domain of func",
        34: "Math result not representable",
        35: "File locking deadlock error",
        36: "File or path name too long",
        37: "No record locks available",
        38: "Function not implemented",
        39: "Directory not empty",
        40: "Too many symbolic links",
        42: "No message of desired type",
        43: "Identifier removed",
        44: "Channel number out of range",
        45: "Level 2 not synchronized",
        46: "Level 3 halted",
        47: "Level 3 reset",
        48: "Link number out of range",
        49: "Protocol driver not attached",
        50: "No CSI structure available",
        51: "Level 2 halted",
        52: "Invalid exchange",
        53: "Invalid request descriptor",
        54: "Exchange full",
        55: "No anode",
        56: "Invalid request code",
        57: "Invalid slot",
        59: "Bad font file fmt",
        60: "Device not a stream",
        61: "No data (for no delay io)",
        62: "Timer expired",
        63: "Out of streams resources",
        64: "Machine is not on the network",
        65: "Package not installed",
        66: "The object is remote",
        67: "The link has been severed",
        68: "Advertise error",
        69: "Srmount error",
        70: "Communication error on send",
        71: "Protocol error",
        72: "Multihop attempted",
        73: "Cross mount point (not really error)",
        74: "Trying to read unreadable message",
        75: "Value too large for defined data type",
        76: "Given log. name not unique",
        77: "f.d. invalid for this operation",
        78: "Remote address changed",
        79: "Can   access a needed shared lib",
        80: "Accessing a corrupted shared lib",
        81: ".lib section in a.out corrupted",
        82: "Attempting to link in too many libs",
        83: "Attempting to exec a shared library",
        84: "Illegal byte sequence",
        86: "Streams pipe error",
        87: "Too many users",
        88: "Socket operation on non-socket",
        89: "Destination address required",
        90: "Message too long",
        91: "Protocol wrong type for socket",
        92: "Protocol not available",
        93: "Unknown protocol",
        94: "Socket type not supported",
        95: "Not supported",
        96: "Protocol family not supported",
        97: "Address family not supported by protocol family",
        98: "Address already in use",
        99: "Address not available",
        100: "Network interface is not configured",
        101: "Network is unreachable",
        102: "Connection reset by network",
        103: "Connection aborted",
        104: "Connection reset by peer",
        105: "No buffer space available",
        106: "Socket is already connected",
        107: "Socket is not connected",
        108: "Can't send after socket shutdown",
        109: "Too many references",
        110: "Connection timed out",
        111: "Connection refused",
        112: "Host is down",
        113: "Host is unreachable",
        114: "Socket already connected",
        115: "Connection already in progress",
        116: "Stale file handle",
        122: "Quota exceeded",
        123: "No medium (in tape drive)",
        125: "Operation canceled",
        130: "Previous owner died",
        131: "State not recoverable"
    };

function ___setErrNo(e) {
    return Module.___errno_location ? HEAP32[Module.___errno_location() >> 2] = e : Module.printErr("failed to set errno from JS"), e
}
var PATH = {
        splitPath: function (e) {
            return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(e).slice(1)
        },
        normalizeArray: function (e, r) {
            for (var t = 0, n = e.length - 1; n >= 0; n--) {
                var o = e[n];
                "." === o ? e.splice(n, 1) : ".." === o ? (e.splice(n, 1), t++) : t && (e.splice(n, 1), t--)
            }
            if (r)
                for (; t; t--) e.unshift("..");
            return e
        },
        normalize: function (e) {
            var r = "/" === e.charAt(0),
                t = "/" === e.substr(-1);
            return (e = PATH.normalizeArray(e.split("/").filter((function (e) {
                return !!e
            })), !r).join("/")) || r || (e = "."), e && t && (e += "/"), (r ? "/" : "") + e
        },
        dirname: function (e) {
            var r = PATH.splitPath(e),
                t = r[0],
                n = r[1];
            return t || n ? (n && (n = n.substr(0, n.length - 1)), t + n) : "."
        },
        basename: function (e) {
            if ("/" === e) return "/";
            var r = e.lastIndexOf("/");
            return -1 === r ? e : e.substr(r + 1)
        },
        extname: function (e) {
            return PATH.splitPath(e)[3]
        },
        join: function () {
            var e = Array.prototype.slice.call(arguments, 0);
            return PATH.normalize(e.join("/"))
        },
        join2: function (e, r) {
            return PATH.normalize(e + "/" + r)
        },
        resolve: function () {
            for (var e = "", r = !1, t = arguments.length - 1; t >= -1 && !r; t--) {
                var n = t >= 0 ? arguments[t] : FS.cwd();
                if ("string" != typeof n) throw new TypeError("Arguments to path.resolve must be strings");
                if (!n) return "";
                e = n + "/" + e, r = "/" === n.charAt(0)
            }
            return (r ? "/" : "") + (e = PATH.normalizeArray(e.split("/").filter((function (e) {
                return !!e
            })), !r).join("/")) || "."
        },
        relative: function (e, r) {
            function t(e) {
                for (var r = 0; r < e.length && "" === e[r]; r++);
                for (var t = e.length - 1; t >= 0 && "" === e[t]; t--);
                return r > t ? [] : e.slice(r, t - r + 1)
            }
            e = PATH.resolve(e).substr(1), r = PATH.resolve(r).substr(1);
            for (var n = t(e.split("/")), o = t(r.split("/")), i = Math.min(n.length, o.length), a = i, s = 0; s < i; s++)
                if (n[s] !== o[s]) {
                    a = s;
                    break
                } var u = [];
            for (s = a; s < n.length; s++) u.push("..");
            return (u = u.concat(o.slice(a))).join("/")
        }
    },
    MEMFS = {
        ops_table: null,
        mount: function (e) {
            return MEMFS.createNode(null, "/", 16895, 0)
        },
        createNode: function (e, r, t, n) {
            if (FS.isBlkdev(t) || FS.isFIFO(t)) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            MEMFS.ops_table || (MEMFS.ops_table = {
                dir: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        lookup: MEMFS.node_ops.lookup,
                        mknod: MEMFS.node_ops.mknod,
                        rename: MEMFS.node_ops.rename,
                        unlink: MEMFS.node_ops.unlink,
                        rmdir: MEMFS.node_ops.rmdir,
                        readdir: MEMFS.node_ops.readdir,
                        symlink: MEMFS.node_ops.symlink
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek
                    }
                },
                file: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek,
                        read: MEMFS.stream_ops.read,
                        write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate,
                        mmap: MEMFS.stream_ops.mmap,
                        msync: MEMFS.stream_ops.msync
                    }
                },
                link: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        readlink: MEMFS.node_ops.readlink
                    },
                    stream: {}
                },
                chrdev: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr
                    },
                    stream: FS.chrdev_stream_ops
                }
            });
            var o = FS.createNode(e, r, t, n);
            return FS.isDir(o.mode) ? (o.node_ops = MEMFS.ops_table.dir.node, o.stream_ops = MEMFS.ops_table.dir.stream, o.contents = {}) : FS.isFile(o.mode) ? (o.node_ops = MEMFS.ops_table.file.node, o.stream_ops = MEMFS.ops_table.file.stream, o.usedBytes = 0, o.contents = null) : FS.isLink(o.mode) ? (o.node_ops = MEMFS.ops_table.link.node, o.stream_ops = MEMFS.ops_table.link.stream) : FS.isChrdev(o.mode) && (o.node_ops = MEMFS.ops_table.chrdev.node, o.stream_ops = MEMFS.ops_table.chrdev.stream), o.timestamp = Date.now(), e && (e.contents[r] = o), o
        },
        getFileDataAsRegularArray: function (e) {
            if (e.contents && e.contents.subarray) {
                for (var r = [], t = 0; t < e.usedBytes; ++t) r.push(e.contents[t]);
                return r
            }
            return e.contents
        },
        getFileDataAsTypedArray: function (e) {
            return e.contents ? e.contents.subarray ? e.contents.subarray(0, e.usedBytes) : new Uint8Array(e.contents) : new Uint8Array
        },
        expandFileStorage: function (e, r) {
            if (e.contents && e.contents.subarray && r > e.contents.length && (e.contents = MEMFS.getFileDataAsRegularArray(e), e.usedBytes = e.contents.length), !e.contents || e.contents.subarray) {
                var t = e.contents ? e.contents.length : 0;
                if (t >= r) return;
                r = Math.max(r, t * (t < 1048576 ? 2 : 1.125) | 0), 0 != t && (r = Math.max(r, 256));
                var n = e.contents;
                return e.contents = new Uint8Array(r), void(e.usedBytes > 0 && e.contents.set(n.subarray(0, e.usedBytes), 0))
            }
            for (!e.contents && r > 0 && (e.contents = []); e.contents.length < r;) e.contents.push(0)
        },
        resizeFileStorage: function (e, r) {
            if (e.usedBytes != r) {
                if (0 == r) return e.contents = null, void(e.usedBytes = 0);
                if (!e.contents || e.contents.subarray) {
                    var t = e.contents;
                    return e.contents = new Uint8Array(new ArrayBuffer(r)), t && e.contents.set(t.subarray(0, Math.min(r, e.usedBytes))), void(e.usedBytes = r)
                }
                if (e.contents || (e.contents = []), e.contents.length > r) e.contents.length = r;
                else
                    for (; e.contents.length < r;) e.contents.push(0);
                e.usedBytes = r
            }
        },
        node_ops: {
            getattr: function (e) {
                var r = {};
                return r.dev = FS.isChrdev(e.mode) ? e.id : 1, r.ino = e.id, r.mode = e.mode, r.nlink = 1, r.uid = 0, r.gid = 0, r.rdev = e.rdev, FS.isDir(e.mode) ? r.size = 4096 : FS.isFile(e.mode) ? r.size = e.usedBytes : FS.isLink(e.mode) ? r.size = e.link.length : r.size = 0, r.atime = new Date(e.timestamp), r.mtime = new Date(e.timestamp), r.ctime = new Date(e.timestamp), r.blksize = 4096, r.blocks = Math.ceil(r.size / r.blksize), r
            },
            setattr: function (e, r) {
                void 0 !== r.mode && (e.mode = r.mode), void 0 !== r.timestamp && (e.timestamp = r.timestamp), void 0 !== r.size && MEMFS.resizeFileStorage(e, r.size)
            },
            lookup: function (e, r) {
                throw FS.genericErrors[ERRNO_CODES.ENOENT]
            },
            mknod: function (e, r, t, n) {
                return MEMFS.createNode(e, r, t, n)
            },
            rename: function (e, r, t) {
                if (FS.isDir(e.mode)) {
                    var n;
                    try {
                        n = FS.lookupNode(r, t)
                    } catch (e) {}
                    if (n)
                        for (var o in n.contents) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
                }
                delete e.parent.contents[e.name], e.name = t, r.contents[t] = e, e.parent = r
            },
            unlink: function (e, r) {
                delete e.contents[r]
            },
            rmdir: function (e, r) {
                var t = FS.lookupNode(e, r);
                for (var n in t.contents) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
                delete e.contents[r]
            },
            readdir: function (e) {
                var r = [".", ".."];
                for (var t in e.contents) e.contents.hasOwnProperty(t) && r.push(t);
                return r
            },
            symlink: function (e, r, t) {
                var n = MEMFS.createNode(e, r, 41471, 0);
                return n.link = t, n
            },
            readlink: function (e) {
                if (!FS.isLink(e.mode)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
                return e.link
            }
        },
        stream_ops: {
            read: function (e, r, t, n, o) {
                var i = e.node.contents;
                if (o >= e.node.usedBytes) return 0;
                var a = Math.min(e.node.usedBytes - o, n);
                if (assert(a >= 0), a > 8 && i.subarray) r.set(i.subarray(o, o + a), t);
                else
                    for (var s = 0; s < a; s++) r[t + s] = i[o + s];
                return a
            },
            write: function (e, r, t, n, o, i) {
                if (!n) return 0;
                var a = e.node;
                if (a.timestamp = Date.now(), r.subarray && (!a.contents || a.contents.subarray)) {
                    if (i) return assert(0 === o, "canOwn must imply no weird position inside the file"), a.contents = r.subarray(t, t + n), a.usedBytes = n, n;
                    if (0 === a.usedBytes && 0 === o) return a.contents = new Uint8Array(r.subarray(t, t + n)), a.usedBytes = n, n;
                    if (o + n <= a.usedBytes) return a.contents.set(r.subarray(t, t + n), o), n
                }
                if (MEMFS.expandFileStorage(a, o + n), a.contents.subarray && r.subarray) a.contents.set(r.subarray(t, t + n), o);
                else
                    for (var s = 0; s < n; s++) a.contents[o + s] = r[t + s];
                return a.usedBytes = Math.max(a.usedBytes, o + n), n
            },
            llseek: function (e, r, t) {
                var n = r;
                if (1 === t ? n += e.position : 2 === t && FS.isFile(e.node.mode) && (n += e.node.usedBytes), n < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
                return n
            },
            allocate: function (e, r, t) {
                MEMFS.expandFileStorage(e.node, r + t), e.node.usedBytes = Math.max(e.node.usedBytes, r + t)
            },
            mmap: function (e, r, t, n, o, i, a) {
                if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
                var s, u, c = e.node.contents;
                if (2 & a || c.buffer !== r && c.buffer !== r.buffer) {
                    if ((o > 0 || o + n < e.node.usedBytes) && (c = c.subarray ? c.subarray(o, o + n) : Array.prototype.slice.call(c, o, o + n)), u = !0, !(s = _malloc(n))) throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
                    r.set(c, s)
                } else u = !1, s = c.byteOffset;
                return {
                    ptr: s,
                    allocated: u
                }
            },
            msync: function (e, r, t, n, o) {
                if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
                if (2 & o) return 0;
                MEMFS.stream_ops.write(e, r, 0, n, t, !1);
                return 0
            }
        }
    };
STATICTOP += 16, STATICTOP += 16, STATICTOP += 16;
var FS = {
        root: null,
        mounts: [],
        devices: [null],
        streams: [],
        nextInode: 1,
        nameTable: null,
        currentPath: "/",
        initialized: !1,
        ignorePermissions: !0,
        trackingDelegate: {},
        tracking: {
            openFlags: {
                READ: 1,
                WRITE: 2
            }
        },
        ErrnoError: null,
        genericErrors: {},
        filesystems: null,
        syncFSRequests: 0,
        handleFSError: function (e) {
            if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
            return ___setErrNo(e.errno)
        },
        lookupPath: function (e, r) {
            if (r = r || {}, !(e = PATH.resolve(FS.cwd(), e))) return {
                path: "",
                node: null
            };
            var t = {
                follow_mount: !0,
                recurse_count: 0
            };
            for (var n in t) void 0 === r[n] && (r[n] = t[n]);
            if (r.recurse_count > 8) throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
            for (var o = PATH.normalizeArray(e.split("/").filter((function (e) {
                    return !!e
                })), !1), i = FS.root, a = "/", s = 0; s < o.length; s++) {
                var u = s === o.length - 1;
                if (u && r.parent) break;
                if (i = FS.lookupNode(i, o[s]), a = PATH.join2(a, o[s]), FS.isMountpoint(i) && (!u || u && r.follow_mount) && (i = i.mounted.root), !u || r.follow)
                    for (var c = 0; FS.isLink(i.mode);) {
                        var l = FS.readlink(a);
                        if (a = PATH.resolve(PATH.dirname(a), l), i = FS.lookupPath(a, {
                                recurse_count: r.recurse_count
                            }).node, c++ > 40) throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
                    }
            }
            return {
                path: a,
                node: i
            }
        },
        getPath: function (e) {
            for (var r;;) {
                if (FS.isRoot(e)) {
                    var t = e.mount.mountpoint;
                    return r ? "/" !== t[t.length - 1] ? t + "/" + r : t + r : t
                }
                r = r ? e.name + "/" + r : e.name, e = e.parent
            }
        },
        hashName: function (e, r) {
            for (var t = 0, n = 0; n < r.length; n++) t = (t << 5) - t + r.charCodeAt(n) | 0;
            return (e + t >>> 0) % FS.nameTable.length
        },
        hashAddNode: function (e) {
            var r = FS.hashName(e.parent.id, e.name);
            e.name_next = FS.nameTable[r], FS.nameTable[r] = e
        },
        hashRemoveNode: function (e) {
            var r = FS.hashName(e.parent.id, e.name);
            if (FS.nameTable[r] === e) FS.nameTable[r] = e.name_next;
            else
                for (var t = FS.nameTable[r]; t;) {
                    if (t.name_next === e) {
                        t.name_next = e.name_next;
                        break
                    }
                    t = t.name_next
                }
        },
        lookupNode: function (e, r) {
            var t = FS.mayLookup(e);
            if (t) throw new FS.ErrnoError(t, e);
            for (var n = FS.hashName(e.id, r), o = FS.nameTable[n]; o; o = o.name_next) {
                var i = o.name;
                if (o.parent.id === e.id && i === r) return o
            }
            return FS.lookup(e, r)
        },
        createNode: function (e, r, t, n) {
            if (!FS.FSNode) {
                FS.FSNode = function (e, r, t, n) {
                    e || (e = this), this.parent = e, this.mount = e.mount, this.mounted = null, this.id = FS.nextInode++, this.name = r, this.mode = t, this.node_ops = {}, this.stream_ops = {}, this.rdev = n
                }, FS.FSNode.prototype = {};
                var o = 365,
                    i = 146;
                Object.defineProperties(FS.FSNode.prototype, {
                    read: {
                        get: function () {
                            return (this.mode & o) === o
                        },
                        set: function (e) {
                            e ? this.mode |= o : this.mode &= -366
                        }
                    },
                    write: {
                        get: function () {
                            return (this.mode & i) === i
                        },
                        set: function (e) {
                            e ? this.mode |= i : this.mode &= -147
                        }
                    },
                    isFolder: {
                        get: function () {
                            return FS.isDir(this.mode)
                        }
                    },
                    isDevice: {
                        get: function () {
                            return FS.isChrdev(this.mode)
                        }
                    }
                })
            }
            var a = new FS.FSNode(e, r, t, n);
            return FS.hashAddNode(a), a
        },
        destroyNode: function (e) {
            FS.hashRemoveNode(e)
        },
        isRoot: function (e) {
            return e === e.parent
        },
        isMountpoint: function (e) {
            return !!e.mounted
        },
        isFile: function (e) {
            return 32768 == (61440 & e)
        },
        isDir: function (e) {
            return 16384 == (61440 & e)
        },
        isLink: function (e) {
            return 40960 == (61440 & e)
        },
        isChrdev: function (e) {
            return 8192 == (61440 & e)
        },
        isBlkdev: function (e) {
            return 24576 == (61440 & e)
        },
        isFIFO: function (e) {
            return 4096 == (61440 & e)
        },
        isSocket: function (e) {
            return 49152 == (49152 & e)
        },
        flagModes: {
            r: 0,
            rs: 1052672,
            "r+": 2,
            w: 577,
            wx: 705,
            xw: 705,
            "w+": 578,
            "wx+": 706,
            "xw+": 706,
            a: 1089,
            ax: 1217,
            xa: 1217,
            "a+": 1090,
            "ax+": 1218,
            "xa+": 1218
        },
        modeStringToFlags: function (e) {
            var r = FS.flagModes[e];
            if (void 0 === r) throw new Error("Unknown file open mode: " + e);
            return r
        },
        flagsToPermissionString: function (e) {
            var r = ["r", "w", "rw"][3 & e];
            return 512 & e && (r += "w"), r
        },
        nodePermissions: function (e, r) {
            return FS.ignorePermissions || (-1 === r.indexOf("r") || 292 & e.mode) && (-1 === r.indexOf("w") || 146 & e.mode) && (-1 === r.indexOf("x") || 73 & e.mode) ? 0 : ERRNO_CODES.EACCES
        },
        mayLookup: function (e) {
            var r = FS.nodePermissions(e, "x");
            return r || (e.node_ops.lookup ? 0 : ERRNO_CODES.EACCES)
        },
        mayCreate: function (e, r) {
            try {
                FS.lookupNode(e, r);
                return ERRNO_CODES.EEXIST
            } catch (e) {}
            return FS.nodePermissions(e, "wx")
        },
        mayDelete: function (e, r, t) {
            var n;
            try {
                n = FS.lookupNode(e, r)
            } catch (e) {
                return e.errno
            }
            var o = FS.nodePermissions(e, "wx");
            if (o) return o;
            if (t) {
                if (!FS.isDir(n.mode)) return ERRNO_CODES.ENOTDIR;
                if (FS.isRoot(n) || FS.getPath(n) === FS.cwd()) return ERRNO_CODES.EBUSY
            } else if (FS.isDir(n.mode)) return ERRNO_CODES.EISDIR;
            return 0
        },
        mayOpen: function (e, r) {
            return e ? FS.isLink(e.mode) ? ERRNO_CODES.ELOOP : FS.isDir(e.mode) && ("r" !== FS.flagsToPermissionString(r) || 512 & r) ? ERRNO_CODES.EISDIR : FS.nodePermissions(e, FS.flagsToPermissionString(r)) : ERRNO_CODES.ENOENT
        },
        MAX_OPEN_FDS: 4096,
        nextfd: function (e, r) {
            e = e || 0, r = r || FS.MAX_OPEN_FDS;
            for (var t = e; t <= r; t++)
                if (!FS.streams[t]) return t;
            throw new FS.ErrnoError(ERRNO_CODES.EMFILE)
        },
        getStream: function (e) {
            return FS.streams[e]
        },
        createStream: function (e, r, t) {
            FS.FSStream || (FS.FSStream = function () {}, FS.FSStream.prototype = {}, Object.defineProperties(FS.FSStream.prototype, {
                object: {
                    get: function () {
                        return this.node
                    },
                    set: function (e) {
                        this.node = e
                    }
                },
                isRead: {
                    get: function () {
                        return 1 != (2097155 & this.flags)
                    }
                },
                isWrite: {
                    get: function () {
                        return 0 != (2097155 & this.flags)
                    }
                },
                isAppend: {
                    get: function () {
                        return 1024 & this.flags
                    }
                }
            }));
            var n = new FS.FSStream;
            for (var o in e) n[o] = e[o];
            e = n;
            var i = FS.nextfd(r, t);
            return e.fd = i, FS.streams[i] = e, e
        },
        closeStream: function (e) {
            FS.streams[e] = null
        },
        chrdev_stream_ops: {
            open: function (e) {},
            llseek: function () {
                throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
            }
        },
        major: function (e) {
            return e >> 8
        },
        minor: function (e) {
            return 255 & e
        },
        makedev: function (e, r) {
            return e << 8 | r
        },
        registerDevice: function (e, r) {
            FS.devices[e] = {
                stream_ops: r
            }
        },
        getDevice: function (e) {
            return FS.devices[e]
        },
        getMounts: function (e) {
            for (var r = [], t = [e]; t.length;) {
                var n = t.pop();
                r.push(n), t.push.apply(t, n.mounts)
            }
            return r
        },
        syncfs: function (e, r) {
            "function" == typeof e && (r = e, e = !1), FS.syncFSRequests++, FS.syncFSRequests;
            var t = FS.getMounts(FS.root.mount),
                n = 0;

            function o(e) {
                return assert(FS.syncFSRequests > 0), FS.syncFSRequests--, r(e)
            }

            function i(e) {
                if (e) return i.errored ? void 0 : (i.errored = !0, o(e));
                ++n >= t.length && o(null)
            }
            t.forEach((function (r) {
                if (!r.type.syncfs) return i(null);
                r.type.syncfs(r, e, i)
            }))
        },
        mount: function (e, r, t) {
            var n, o = "/" === t,
                i = !t;
            if (o && FS.root) throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            if (!o && !i) {
                var a = FS.lookupPath(t, {
                    follow_mount: !1
                });
                if (t = a.path, n = a.node, FS.isMountpoint(n)) throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
                if (!FS.isDir(n.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
            }
            var s = {
                    type: e,
                    opts: r,
                    mountpoint: t,
                    mounts: []
                },
                u = e.mount(s);
            return u.mount = s, s.root = u, o ? FS.root = u : n && (n.mounted = s, n.mount && n.mount.mounts.push(s)), u
        },
        unmount: function (e) {
            var r = FS.lookupPath(e, {
                follow_mount: !1
            });
            if (!FS.isMountpoint(r.node)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            var t = r.node,
                n = t.mounted,
                o = FS.getMounts(n);
            Object.keys(FS.nameTable).forEach((function (e) {
                for (var r = FS.nameTable[e]; r;) {
                    var t = r.name_next; - 1 !== o.indexOf(r.mount) && FS.destroyNode(r), r = t
                }
            })), t.mounted = null;
            var i = t.mount.mounts.indexOf(n);
            assert(-1 !== i), t.mount.mounts.splice(i, 1)
        },
        lookup: function (e, r) {
            return e.node_ops.lookup(e, r)
        },
        mknod: function (e, r, t) {
            var n = FS.lookupPath(e, {
                    parent: !0
                }).node,
                o = PATH.basename(e);
            if (!o || "." === o || ".." === o) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            var i = FS.mayCreate(n, o);
            if (i) throw new FS.ErrnoError(i);
            if (!n.node_ops.mknod) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            return n.node_ops.mknod(n, o, r, t)
        },
        create: function (e, r) {
            return r = void 0 !== r ? r : 438, r &= 4095, r |= 32768, FS.mknod(e, r, 0)
        },
        mkdir: function (e, r) {
            return r = void 0 !== r ? r : 511, r &= 1023, r |= 16384, FS.mknod(e, r, 0)
        },
        mkdirTree: function (e, r) {
            for (var t = e.split("/"), n = "", o = 0; o < t.length; ++o)
                if (t[o]) {
                    n += "/" + t[o];
                    try {
                        FS.mkdir(n, r)
                    } catch (e) {
                        if (e.errno != ERRNO_CODES.EEXIST) throw e
                    }
                }
        },
        mkdev: function (e, r, t) {
            return void 0 === t && (t = r, r = 438), r |= 8192, FS.mknod(e, r, t)
        },
        symlink: function (e, r) {
            if (!PATH.resolve(e)) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            var t = FS.lookupPath(r, {
                parent: !0
            }).node;
            if (!t) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            var n = PATH.basename(r),
                o = FS.mayCreate(t, n);
            if (o) throw new FS.ErrnoError(o);
            if (!t.node_ops.symlink) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            return t.node_ops.symlink(t, n, e)
        },
        rename: function (e, r) {
            var t, n, o = PATH.dirname(e),
                i = PATH.dirname(r),
                a = PATH.basename(e),
                s = PATH.basename(r);
            try {
                t = FS.lookupPath(e, {
                    parent: !0
                }).node, n = FS.lookupPath(r, {
                    parent: !0
                }).node
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
            }
            if (!t || !n) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            if (t.mount !== n.mount) throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
            var u, c = FS.lookupNode(t, a),
                l = PATH.relative(e, i);
            if ("." !== l.charAt(0)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            if ("." !== (l = PATH.relative(r, o)).charAt(0)) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
            try {
                u = FS.lookupNode(n, s)
            } catch (e) {}
            if (c !== u) {
                var f = FS.isDir(c.mode),
                    d = FS.mayDelete(t, a, f);
                if (d) throw new FS.ErrnoError(d);
                if (d = u ? FS.mayDelete(n, s, f) : FS.mayCreate(n, s)) throw new FS.ErrnoError(d);
                if (!t.node_ops.rename) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
                if (FS.isMountpoint(c) || u && FS.isMountpoint(u)) throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
                if (n !== t && (d = FS.nodePermissions(t, "w"))) throw new FS.ErrnoError(d);
                try {
                    FS.trackingDelegate.willMovePath && FS.trackingDelegate.willMovePath(e, r)
                } catch (e) {}
                FS.hashRemoveNode(c);
                try {
                    t.node_ops.rename(c, n, s)
                } catch (e) {
                    throw e
                } finally {
                    FS.hashAddNode(c)
                }
                try {
                    FS.trackingDelegate.onMovePath && FS.trackingDelegate.onMovePath(e, r)
                } catch (e) {}
            }
        },
        rmdir: function (e) {
            var r = FS.lookupPath(e, {
                    parent: !0
                }).node,
                t = PATH.basename(e),
                n = FS.lookupNode(r, t),
                o = FS.mayDelete(r, t, !0);
            if (o) throw new FS.ErrnoError(o);
            if (!r.node_ops.rmdir) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            if (FS.isMountpoint(n)) throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            try {
                FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(e)
            } catch (e) {}
            r.node_ops.rmdir(r, t), FS.destroyNode(n);
            try {
                FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(e)
            } catch (e) {}
        },
        readdir: function (e) {
            var r = FS.lookupPath(e, {
                follow: !0
            }).node;
            if (!r.node_ops.readdir) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
            return r.node_ops.readdir(r)
        },
        unlink: function (e) {
            var r = FS.lookupPath(e, {
                    parent: !0
                }).node,
                t = PATH.basename(e),
                n = FS.lookupNode(r, t),
                o = FS.mayDelete(r, t, !1);
            if (o) throw new FS.ErrnoError(o);
            if (!r.node_ops.unlink) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            if (FS.isMountpoint(n)) throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            try {
                FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(e)
            } catch (e) {}
            r.node_ops.unlink(r, t), FS.destroyNode(n);
            try {
                FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(e)
            } catch (e) {}
        },
        readlink: function (e) {
            var r = FS.lookupPath(e).node;
            if (!r) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            if (!r.node_ops.readlink) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return PATH.resolve(FS.getPath(r.parent), r.node_ops.readlink(r))
        },
        stat: function (e, r) {
            var t = FS.lookupPath(e, {
                follow: !r
            }).node;
            if (!t) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            if (!t.node_ops.getattr) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            return t.node_ops.getattr(t)
        },
        lstat: function (e) {
            return FS.stat(e, !0)
        },
        chmod: function (e, r, t) {
            var n;
            "string" == typeof e ? n = FS.lookupPath(e, {
                follow: !t
            }).node : n = e;
            if (!n.node_ops.setattr) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            n.node_ops.setattr(n, {
                mode: 4095 & r | -4096 & n.mode,
                timestamp: Date.now()
            })
        },
        lchmod: function (e, r) {
            FS.chmod(e, r, !0)
        },
        fchmod: function (e, r) {
            var t = FS.getStream(e);
            if (!t) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            FS.chmod(t.node, r)
        },
        chown: function (e, r, t, n) {
            var o;
            "string" == typeof e ? o = FS.lookupPath(e, {
                follow: !n
            }).node : o = e;
            if (!o.node_ops.setattr) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            o.node_ops.setattr(o, {
                timestamp: Date.now()
            })
        },
        lchown: function (e, r, t) {
            FS.chown(e, r, t, !0)
        },
        fchown: function (e, r, t) {
            var n = FS.getStream(e);
            if (!n) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            FS.chown(n.node, r, t)
        },
        truncate: function (e, r) {
            if (r < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            var t;
            "string" == typeof e ? t = FS.lookupPath(e, {
                follow: !0
            }).node : t = e;
            if (!t.node_ops.setattr) throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            if (FS.isDir(t.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
            if (!FS.isFile(t.mode)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            var n = FS.nodePermissions(t, "w");
            if (n) throw new FS.ErrnoError(n);
            t.node_ops.setattr(t, {
                size: r,
                timestamp: Date.now()
            })
        },
        ftruncate: function (e, r) {
            var t = FS.getStream(e);
            if (!t) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            if (0 == (2097155 & t.flags)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            FS.truncate(t.node, r)
        },
        utime: function (e, r, t) {
            var n = FS.lookupPath(e, {
                follow: !0
            }).node;
            n.node_ops.setattr(n, {
                timestamp: Math.max(r, t)
            })
        },
        open: function (e, r, t, n, o) {
            if ("" === e) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            var i;
            if (t = void 0 === t ? 438 : t, t = 64 & (r = "string" == typeof r ? FS.modeStringToFlags(r) : r) ? 4095 & t | 32768 : 0, "object" == typeof e) i = e;
            else {
                e = PATH.normalize(e);
                try {
                    i = FS.lookupPath(e, {
                        follow: !(131072 & r)
                    }).node
                } catch (e) {}
            }
            var a = !1;
            if (64 & r)
                if (i) {
                    if (128 & r) throw new FS.ErrnoError(ERRNO_CODES.EEXIST)
                } else i = FS.mknod(e, t, 0), a = !0;
            if (!i) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            if (FS.isChrdev(i.mode) && (r &= -513), 65536 & r && !FS.isDir(i.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
            if (!a) {
                var s = FS.mayOpen(i, r);
                if (s) throw new FS.ErrnoError(s)
            }
            512 & r && FS.truncate(i, 0), r &= -641;
            var u = FS.createStream({
                node: i,
                path: FS.getPath(i),
                flags: r,
                seekable: !0,
                position: 0,
                stream_ops: i.stream_ops,
                ungotten: [],
                error: !1
            }, n, o);
            u.stream_ops.open && u.stream_ops.open(u), !Module.logReadFiles || 1 & r || (FS.readFiles || (FS.readFiles = {}), e in FS.readFiles || (FS.readFiles[e] = 1, Module.printErr("read file: " + e)));
            try {
                if (FS.trackingDelegate.onOpenFile) {
                    var c = 0;
                    1 != (2097155 & r) && (c |= FS.tracking.openFlags.READ), 0 != (2097155 & r) && (c |= FS.tracking.openFlags.WRITE), FS.trackingDelegate.onOpenFile(e, c)
                }
            } catch (e) {}
            return u
        },
        close: function (e) {
            e.getdents && (e.getdents = null);
            try {
                e.stream_ops.close && e.stream_ops.close(e)
            } catch (e) {
                throw e
            } finally {
                FS.closeStream(e.fd)
            }
        },
        llseek: function (e, r, t) {
            if (!e.seekable || !e.stream_ops.llseek) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
            return e.position = e.stream_ops.llseek(e, r, t), e.ungotten = [], e.position
        },
        read: function (e, r, t, n, o) {
            if (n < 0 || o < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
            if (!e.stream_ops.read) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            var i = !0;
            if (void 0 === o) o = e.position, i = !1;
            else if (!e.seekable) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
            var a = e.stream_ops.read(e, r, t, n, o);
            return i || (e.position += a), a
        },
        write: function (e, r, t, n, o, i) {
            if (n < 0 || o < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
            if (!e.stream_ops.write) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            1024 & e.flags && FS.llseek(e, 0, 2);
            var a = !0;
            if (void 0 === o) o = e.position, a = !1;
            else if (!e.seekable) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
            var s = e.stream_ops.write(e, r, t, n, o, i);
            a || (e.position += s);
            try {
                e.path && FS.trackingDelegate.onWriteToFile && FS.trackingDelegate.onWriteToFile(e.path)
            } catch (e) {}
            return s
        },
        allocate: function (e, r, t) {
            if (r < 0 || t <= 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            if (!FS.isFile(e.node.mode) && !FS.isDir(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            if (!e.stream_ops.allocate) throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
            e.stream_ops.allocate(e, r, t)
        },
        mmap: function (e, r, t, n, o, i, a) {
            if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EACCES);
            if (!e.stream_ops.mmap) throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            return e.stream_ops.mmap(e, r, t, n, o, i, a)
        },
        msync: function (e, r, t, n, o) {
            return e && e.stream_ops.msync ? e.stream_ops.msync(e, r, t, n, o) : 0
        },
        munmap: function (e) {
            return 0
        },
        ioctl: function (e, r, t) {
            if (!e.stream_ops.ioctl) throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
            return e.stream_ops.ioctl(e, r, t)
        },
        readFile: function (e, r) {
            if ((r = r || {}).flags = r.flags || "r", r.encoding = r.encoding || "binary", "utf8" !== r.encoding && "binary" !== r.encoding) throw new Error('Invalid encoding type "' + r.encoding + '"');
            var t, n = FS.open(e, r.flags),
                o = FS.stat(e).size,
                i = new Uint8Array(o);
            return FS.read(n, i, 0, o, 0), "utf8" === r.encoding ? t = UTF8ArrayToString(i, 0) : "binary" === r.encoding && (t = i), FS.close(n), t
        },
        writeFile: function (e, r, t) {
            if ((t = t || {}).flags = t.flags || "w", t.encoding = t.encoding || "utf8", "utf8" !== t.encoding && "binary" !== t.encoding) throw new Error('Invalid encoding type "' + t.encoding + '"');
            var n = FS.open(e, t.flags, t.mode);
            if ("utf8" === t.encoding) {
                var o = new Uint8Array(lengthBytesUTF8(r) + 1),
                    i = stringToUTF8Array(r, o, 0, o.length);
                FS.write(n, o, 0, i, 0, t.canOwn)
            } else "binary" === t.encoding && FS.write(n, r, 0, r.length, 0, t.canOwn);
            FS.close(n)
        },
        cwd: function () {
            return FS.currentPath
        },
        chdir: function (e) {
            var r = FS.lookupPath(e, {
                follow: !0
            });
            if (null === r.node) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            if (!FS.isDir(r.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
            var t = FS.nodePermissions(r.node, "x");
            if (t) throw new FS.ErrnoError(t);
            FS.currentPath = r.path
        },
        createDefaultDirectories: function () {
            FS.mkdir("/tmp"), FS.mkdir("/home"), FS.mkdir("/home/web_user")
        },
        createDefaultDevices: function () {
            var e;
            if (FS.mkdir("/dev"), FS.registerDevice(FS.makedev(1, 3), {
                    read: function () {
                        return 0
                    },
                    write: function (e, r, t, n, o) {
                        return n
                    }
                }), FS.mkdev("/dev/null", FS.makedev(1, 3)), FS.mkdev("/dev/tty", FS.makedev(5, 0)), FS.mkdev("/dev/tty1", FS.makedev(6, 0)), "undefined" != typeof crypto) {
                var r = new Uint8Array(1);
                e = function () {
                    return crypto.getRandomValues(r), r[0]
                }
            } else e = function () {
                return 256 * Math.random() | 0
            };
            FS.createDevice("/dev", "random", e), FS.createDevice("/dev", "urandom", e), FS.mkdir("/dev/shm"), FS.mkdir("/dev/shm/tmp")
        },
        createSpecialDirectories: function () {
            FS.mkdir("/proc"), FS.mkdir("/proc/self"), FS.mkdir("/proc/self/fd"), FS.mount({
                mount: function () {
                    var e = FS.createNode("/proc/self", "fd", 16895, 73);
                    return e.node_ops = {
                        lookup: function (e, r) {
                            var t = +r,
                                n = FS.getStream(t);
                            if (!n) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                            var o = {
                                parent: null,
                                mount: {
                                    mountpoint: "fake"
                                },
                                node_ops: {
                                    readlink: function () {
                                        return n.path
                                    }
                                }
                            };
                            return o.parent = o, o
                        }
                    }, e
                }
            }, {}, "/proc/self/fd")
        },
        createStandardStreams: function () {
            Module.stdin ? FS.createDevice("/dev", "stdin", Module.stdin) : FS.symlink("/dev/tty", "/dev/stdin"), Module.stdout ? FS.createDevice("/dev", "stdout", null, Module.stdout) : FS.symlink("/dev/tty", "/dev/stdout"), Module.stderr ? FS.createDevice("/dev", "stderr", null, Module.stderr) : FS.symlink("/dev/tty1", "/dev/stderr");
            var e = FS.open("/dev/stdin", "r");
            assert(0 === e.fd, "invalid handle for stdin (" + e.fd + ")");
            var r = FS.open("/dev/stdout", "w");
            assert(1 === r.fd, "invalid handle for stdout (" + r.fd + ")");
            var t = FS.open("/dev/stderr", "w");
            assert(2 === t.fd, "invalid handle for stderr (" + t.fd + ")")
        },
        ensureErrnoError: function () {
            FS.ErrnoError || (FS.ErrnoError = function (e, r) {
                this.node = r, this.setErrno = function (e) {
                    for (var r in this.errno = e, ERRNO_CODES)
                        if (ERRNO_CODES[r] === e) {
                            this.code = r;
                            break
                        }
                }, this.setErrno(e), this.message = ERRNO_MESSAGES[e], this.stack && (this.stack = demangleAll(this.stack))
            }, FS.ErrnoError.prototype = new Error, FS.ErrnoError.prototype.constructor = FS.ErrnoError, [ERRNO_CODES.ENOENT].forEach((function (e) {
                FS.genericErrors[e] = new FS.ErrnoError(e), FS.genericErrors[e].stack = "<generic error, no stack>"
            })))
        },
        staticInit: function () {
            FS.ensureErrnoError(), FS.nameTable = new Array(4096), FS.mount(MEMFS, {}, "/"), FS.createDefaultDirectories(), FS.createDefaultDevices(), FS.createSpecialDirectories(), FS.filesystems = {
                MEMFS: MEMFS
            }
        },
        init: function (e, r, t) {
            assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"), FS.init.initialized = !0, FS.ensureErrnoError(), Module.stdin = e || Module.stdin, Module.stdout = r || Module.stdout, Module.stderr = t || Module.stderr, FS.createStandardStreams()
        },
        quit: function () {
            FS.init.initialized = !1;
            var e = Module._fflush;
            e && e(0);
            for (var r = 0; r < FS.streams.length; r++) {
                var t = FS.streams[r];
                t && FS.close(t)
            }
        },
        getMode: function (e, r) {
            var t = 0;
            return e && (t |= 365), r && (t |= 146), t
        },
        joinPath: function (e, r) {
            var t = PATH.join.apply(null, e);
            return r && "/" == t[0] && (t = t.substr(1)), t
        },
        absolutePath: function (e, r) {
            return PATH.resolve(r, e)
        },
        standardizePath: function (e) {
            return PATH.normalize(e)
        },
        findObject: function (e, r) {
            var t = FS.analyzePath(e, r);
            return t.exists ? t.object : (___setErrNo(t.error), null)
        },
        analyzePath: function (e, r) {
            try {
                e = (n = FS.lookupPath(e, {
                    follow: !r
                })).path
            } catch (e) {}
            var t = {
                isRoot: !1,
                exists: !1,
                error: 0,
                name: null,
                path: null,
                object: null,
                parentExists: !1,
                parentPath: null,
                parentObject: null
            };
            try {
                var n = FS.lookupPath(e, {
                    parent: !0
                });
                t.parentExists = !0, t.parentPath = n.path, t.parentObject = n.node, t.name = PATH.basename(e), n = FS.lookupPath(e, {
                    follow: !r
                }), t.exists = !0, t.path = n.path, t.object = n.node, t.name = n.node.name, t.isRoot = "/" === n.path
            } catch (e) {
                t.error = e.errno
            }
            return t
        },
        createFolder: function (e, r, t, n) {
            var o = PATH.join2("string" == typeof e ? e : FS.getPath(e), r),
                i = FS.getMode(t, n);
            return FS.mkdir(o, i)
        },
        createPath: function (e, r, t, n) {
            e = "string" == typeof e ? e : FS.getPath(e);
            for (var o = r.split("/").reverse(); o.length;) {
                var i = o.pop();
                if (i) {
                    var a = PATH.join2(e, i);
                    try {
                        FS.mkdir(a)
                    } catch (e) {}
                    e = a
                }
            }
            return a
        },
        createFile: function (e, r, t, n, o) {
            var i = PATH.join2("string" == typeof e ? e : FS.getPath(e), r),
                a = FS.getMode(n, o);
            return FS.create(i, a)
        },
        createDataFile: function (e, r, t, n, o, i) {
            var a = r ? PATH.join2("string" == typeof e ? e : FS.getPath(e), r) : e,
                s = FS.getMode(n, o),
                u = FS.create(a, s);
            if (t) {
                if ("string" == typeof t) {
                    for (var c = new Array(t.length), l = 0, f = t.length; l < f; ++l) c[l] = t.charCodeAt(l);
                    t = c
                }
                FS.chmod(u, 146 | s);
                var d = FS.open(u, "w");
                FS.write(d, t, 0, t.length, 0, i), FS.close(d), FS.chmod(u, s)
            }
            return u
        },
        createDevice: function (e, r, t, n) {
            var o = PATH.join2("string" == typeof e ? e : FS.getPath(e), r),
                i = FS.getMode(!!t, !!n);
            FS.createDevice.major || (FS.createDevice.major = 64);
            var a = FS.makedev(FS.createDevice.major++, 0);
            return FS.registerDevice(a, {
                open: function (e) {
                    e.seekable = !1
                },
                close: function (e) {
                    n && n.buffer && n.buffer.length && n(10)
                },
                read: function (e, r, n, o, i) {
                    for (var a = 0, s = 0; s < o; s++) {
                        var u;
                        try {
                            u = t()
                        } catch (e) {
                            throw new FS.ErrnoError(ERRNO_CODES.EIO)
                        }
                        if (void 0 === u && 0 === a) throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                        if (null == u) break;
                        a++, r[n + s] = u
                    }
                    return a && (e.node.timestamp = Date.now()), a
                },
                write: function (e, r, t, o, i) {
                    for (var a = 0; a < o; a++) try {
                        n(r[t + a])
                    } catch (e) {
                        throw new FS.ErrnoError(ERRNO_CODES.EIO)
                    }
                    return o && (e.node.timestamp = Date.now()), a
                }
            }), FS.mkdev(o, i, a)
        },
        createLink: function (e, r, t, n, o) {
            var i = PATH.join2("string" == typeof e ? e : FS.getPath(e), r);
            return FS.symlink(t, i)
        },
        forceLoadFile: function (e) {
            if (e.isDevice || e.isFolder || e.link || e.contents) return !0;
            var r = !0;
            if ("undefined" != typeof XMLHttpRequest) throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
            if (!Module.read) throw new Error("Cannot load without read() or XMLHttpRequest.");
            try {
                e.contents = intArrayFromString(Module.read(e.url), !0), e.usedBytes = e.contents.length
            } catch (e) {
                r = !1
            }
            return r || ___setErrNo(ERRNO_CODES.EIO), r
        },
        createLazyFile: function (e, r, t, n, o) {
            function i() {
                this.lengthKnown = !1, this.chunks = []
            }
            if (i.prototype.get = function (e) {
                    if (!(e > this.length - 1 || e < 0)) {
                        var r = e % this.chunkSize,
                            t = e / this.chunkSize | 0;
                        return this.getter(t)[r]
                    }
                }, i.prototype.setDataGetter = function (e) {
                    this.getter = e
                }, i.prototype.cacheLength = function () {
                    var e = new XMLHttpRequest;
                    if (e.open("HEAD", t, !1), e.send(null), !(e.status >= 200 && e.status < 300 || 304 === e.status)) throw new Error("Couldn't load " + t + ". Status: " + e.status);
                    var r, n = Number(e.getResponseHeader("Content-length")),
                        o = (r = e.getResponseHeader("Accept-Ranges")) && "bytes" === r,
                        i = (r = e.getResponseHeader("Content-Encoding")) && "gzip" === r,
                        a = 1048576;
                    o || (a = n);
                    var s = this;
                    s.setDataGetter((function (e) {
                        var r = e * a,
                            o = (e + 1) * a - 1;
                        if (o = Math.min(o, n - 1), void 0 === s.chunks[e] && (s.chunks[e] = function (e, r) {
                                if (e > r) throw new Error("invalid range (" + e + ", " + r + ") or no bytes requested!");
                                if (r > n - 1) throw new Error("only " + n + " bytes available! programmer error!");
                                var o = new XMLHttpRequest;
                                if (o.open("GET", t, !1), n !== a && o.setRequestHeader("Range", "bytes=" + e + "-" + r), "undefined" != typeof Uint8Array && (o.responseType = "arraybuffer"), o.overrideMimeType && o.overrideMimeType("text/plain; charset=x-user-defined"), o.send(null), !(o.status >= 200 && o.status < 300 || 304 === o.status)) throw new Error("Couldn't load " + t + ". Status: " + o.status);
                                return void 0 !== o.response ? new Uint8Array(o.response || []) : intArrayFromString(o.responseText || "", !0)
                            }(r, o)), void 0 === s.chunks[e]) throw new Error("doXHR failed!");
                        return s.chunks[e]
                    })), !i && n || (a = n = 1, n = this.getter(0).length, a = n), this._length = n, this._chunkSize = a, this.lengthKnown = !0
                }, "undefined" != typeof XMLHttpRequest) {
                if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                var a = new i;
                Object.defineProperties(a, {
                    length: {
                        get: function () {
                            return this.lengthKnown || this.cacheLength(), this._length
                        }
                    },
                    chunkSize: {
                        get: function () {
                            return this.lengthKnown || this.cacheLength(), this._chunkSize
                        }
                    }
                });
                var s = {
                    isDevice: !1,
                    contents: a
                }
            } else s = {
                isDevice: !1,
                url: t
            };
            var u = FS.createFile(e, r, s, n, o);
            s.contents ? u.contents = s.contents : s.url && (u.contents = null, u.url = s.url), Object.defineProperties(u, {
                usedBytes: {
                    get: function () {
                        return this.contents.length
                    }
                }
            });
            var c = {};
            return Object.keys(u.stream_ops).forEach((function (e) {
                var r = u.stream_ops[e];
                c[e] = function () {
                    if (!FS.forceLoadFile(u)) throw new FS.ErrnoError(ERRNO_CODES.EIO);
                    return r.apply(null, arguments)
                }
            })), c.read = function (e, r, t, n, o) {
                if (!FS.forceLoadFile(u)) throw new FS.ErrnoError(ERRNO_CODES.EIO);
                var i = e.node.contents;
                if (o >= i.length) return 0;
                var a = Math.min(i.length - o, n);
                if (assert(a >= 0), i.slice)
                    for (var s = 0; s < a; s++) r[t + s] = i[o + s];
                else
                    for (s = 0; s < a; s++) r[t + s] = i.get(o + s);
                return a
            }, u.stream_ops = c, u
        },
        createPreloadedFile: function (e, r, t, n, o, i, a, s, u, c) {
            Browser.init();
            var l = r ? PATH.resolve(PATH.join2(e, r)) : e,
                f = getUniqueRunDependency("cp " + l);

            function d(t) {
                function d(t) {
                    c && c(), s || FS.createDataFile(e, r, t, n, o, u), i && i(), removeRunDependency(f)
                }
                var S = !1;
                Module.preloadPlugins.forEach((function (e) {
                    S || e.canHandle(l) && (e.handle(t, l, d, (function () {
                        a && a(), removeRunDependency(f)
                    })), S = !0)
                })), S || d(t)
            }
            addRunDependency(f), "string" == typeof t ? Browser.asyncLoad(t, (function (e) {
                d(e)
            }), a) : d(t)
        },
        indexedDB: function () {
            return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
        },
        DB_NAME: function () {
            return "EM_FS_" + window.location.pathname
        },
        DB_VERSION: 20,
        DB_STORE_NAME: "FILE_DATA",
        saveFilesToDB: function (e, r, t) {
            r = r || function () {}, t = t || function () {};
            var n = FS.indexedDB();
            try {
                var o = n.open(FS.DB_NAME(), FS.DB_VERSION)
            } catch (e) {
                return t(e)
            }
            o.onupgradeneeded = function () {
                o.result.createObjectStore(FS.DB_STORE_NAME)
            }, o.onsuccess = function () {
                var n = o.result.transaction([FS.DB_STORE_NAME], "readwrite"),
                    i = n.objectStore(FS.DB_STORE_NAME),
                    a = 0,
                    s = 0,
                    u = e.length;

                function c() {
                    0 == s ? r() : t()
                }
                e.forEach((function (e) {
                    var r = i.put(FS.analyzePath(e).object.contents, e);
                    r.onsuccess = function () {
                        ++a + s == u && c()
                    }, r.onerror = function () {
                        s++, a + s == u && c()
                    }
                })), n.onerror = t
            }, o.onerror = t
        },
        loadFilesFromDB: function (e, r, t) {
            r = r || function () {}, t = t || function () {};
            var n = FS.indexedDB();
            try {
                var o = n.open(FS.DB_NAME(), FS.DB_VERSION)
            } catch (e) {
                return t(e)
            }
            o.onupgradeneeded = t, o.onsuccess = function () {
                var n = o.result;
                try {
                    var i = n.transaction([FS.DB_STORE_NAME], "readonly")
                } catch (e) {
                    return void t(e)
                }
                var a = i.objectStore(FS.DB_STORE_NAME),
                    s = 0,
                    u = 0,
                    c = e.length;

                function l() {
                    0 == u ? r() : t()
                }
                e.forEach((function (e) {
                    var r = a.get(e);
                    r.onsuccess = function () {
                        FS.analyzePath(e).exists && FS.unlink(e), FS.createDataFile(PATH.dirname(e), PATH.basename(e), r.result, !0, !0, !0), ++s + u == c && l()
                    }, r.onerror = function () {
                        u++, s + u == c && l()
                    }
                })), i.onerror = t
            }, o.onerror = t
        }
    },
    SYSCALLS = {
        DEFAULT_POLLMASK: 5,
        mappings: {},
        umask: 511,
        calculateAt: function (e, r) {
            if ("/" !== r[0]) {
                var t;
                if (-100 === e) t = FS.cwd();
                else {
                    var n = FS.getStream(e);
                    if (!n) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                    t = n.path
                }
                r = PATH.join2(t, r)
            }
            return r
        },
        doStat: function (e, r, t) {
            try {
                var n = e(r)
            } catch (e) {
                if (e && e.node && PATH.normalize(r) !== PATH.normalize(FS.getPath(e.node))) return -ERRNO_CODES.ENOTDIR;
                throw e
            }
            return HEAP32[t >> 2] = n.dev, HEAP32[t + 4 >> 2] = 0, HEAP32[t + 8 >> 2] = n.ino, HEAP32[t + 12 >> 2] = n.mode, HEAP32[t + 16 >> 2] = n.nlink, HEAP32[t + 20 >> 2] = n.uid, HEAP32[t + 24 >> 2] = n.gid, HEAP32[t + 28 >> 2] = n.rdev, HEAP32[t + 32 >> 2] = 0, HEAP32[t + 36 >> 2] = n.size, HEAP32[t + 40 >> 2] = 4096, HEAP32[t + 44 >> 2] = n.blocks, HEAP32[t + 48 >> 2] = n.atime.getTime() / 1e3 | 0, HEAP32[t + 52 >> 2] = 0, HEAP32[t + 56 >> 2] = n.mtime.getTime() / 1e3 | 0, HEAP32[t + 60 >> 2] = 0, HEAP32[t + 64 >> 2] = n.ctime.getTime() / 1e3 | 0, HEAP32[t + 68 >> 2] = 0, HEAP32[t + 72 >> 2] = n.ino, 0
        },
        doMsync: function (e, r, t, n) {
            var o = new Uint8Array(HEAPU8.subarray(e, e + t));
            FS.msync(r, o, 0, t, n)
        },
        doMkdir: function (e, r) {
            return "/" === (e = PATH.normalize(e))[e.length - 1] && (e = e.substr(0, e.length - 1)), FS.mkdir(e, r, 0), 0
        },
        doMknod: function (e, r, t) {
            switch (61440 & r) {
                case 32768:
                case 8192:
                case 24576:
                case 4096:
                case 49152:
                    break;
                default:
                    return -ERRNO_CODES.EINVAL
            }
            return FS.mknod(e, r, t), 0
        },
        doReadlink: function (e, r, t) {
            if (t <= 0) return -ERRNO_CODES.EINVAL;
            var n = FS.readlink(e),
                o = Math.min(t, lengthBytesUTF8(n)),
                i = HEAP8[r + o];
            return stringToUTF8(n, r, t + 1), HEAP8[r + o] = i, o
        },
        doAccess: function (e, r) {
            if (-8 & r) return -ERRNO_CODES.EINVAL;
            var t;
            t = FS.lookupPath(e, {
                follow: !0
            }).node;
            var n = "";
            return 4 & r && (n += "r"), 2 & r && (n += "w"), 1 & r && (n += "x"), n && FS.nodePermissions(t, n) ? -ERRNO_CODES.EACCES : 0
        },
        doDup: function (e, r, t) {
            var n = FS.getStream(t);
            return n && FS.close(n), FS.open(e, r, 0, t, t).fd
        },
        doReadv: function (e, r, t, n) {
            for (var o = 0, i = 0; i < t; i++) {
                var a = HEAP32[r + 8 * i >> 2],
                    s = HEAP32[r + (8 * i + 4) >> 2],
                    u = FS.read(e, HEAP8, a, s, n);
                if (u < 0) return -1;
                if (o += u, u < s) break
            }
            return o
        },
        doWritev: function (e, r, t, n) {
            for (var o = 0, i = 0; i < t; i++) {
                var a = HEAP32[r + 8 * i >> 2],
                    s = HEAP32[r + (8 * i + 4) >> 2],
                    u = FS.write(e, HEAP8, a, s, n);
                if (u < 0) return -1;
                o += u
            }
            return o
        },
        varargs: 0,
        get: function (e) {
            return SYSCALLS.varargs += 4, HEAP32[SYSCALLS.varargs - 4 >> 2]
        },
        getStr: function () {
            return Pointer_stringify(SYSCALLS.get())
        },
        getStreamFromFD: function () {
            var e = FS.getStream(SYSCALLS.get());
            if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            return e
        },
        getSocketFromFD: function () {
            var e = SOCKFS.getSocket(SYSCALLS.get());
            if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            return e
        },
        getSocketAddress: function (e) {
            var r = SYSCALLS.get(),
                t = SYSCALLS.get();
            if (e && 0 === r) return null;
            var n = __read_sockaddr(r, t);
            if (n.errno) throw new FS.ErrnoError(n.errno);
            return n.addr = DNS.lookup_addr(n.addr) || n.addr, n
        },
        get64: function () {
            var e = SYSCALLS.get(),
                r = SYSCALLS.get();
            return assert(e >= 0 ? 0 === r : -1 === r), e
        },
        getZero: function () {
            assert(0 === SYSCALLS.get())
        }
    };

function ___syscall5(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStr(),
            n = SYSCALLS.get(),
            o = SYSCALLS.get();
        return FS.open(t, n, o).fd
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e), -e.errno
    }
}

function ___lock() {}

function ___unlock() {}

function ___syscall6(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD();
        return FS.close(t), 0
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e), -e.errno
    }
}
var cttz_i8 = allocate([8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0], "i8", ALLOC_STATIC);

function _emscripten_memcpy_big(e, r, t) {
    return HEAPU8.set(HEAPU8.subarray(r, r + t), e), e
}

function ___syscall140(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD(),
            n = (SYSCALLS.get(), SYSCALLS.get()),
            o = SYSCALLS.get(),
            i = SYSCALLS.get(),
            a = n;
        return FS.llseek(t, a, i), HEAP32[o >> 2] = t.position, t.getdents && 0 === a && 0 === i && (t.getdents = null), 0
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e), -e.errno
    }
}

function ___syscall146(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD(),
            n = SYSCALLS.get(),
            o = SYSCALLS.get();
        return SYSCALLS.doWritev(t, n, o)
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e), -e.errno
    }
}

function ___syscall54(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD(),
            n = SYSCALLS.get();
        switch (n) {
            case 21505:
                return t.tty ? 0 : -ERRNO_CODES.ENOTTY;
            case 21506:
                return t.tty ? 0 : -ERRNO_CODES.ENOTTY;
            case 21519:
                if (!t.tty) return -ERRNO_CODES.ENOTTY;
                var o = SYSCALLS.get();
                return HEAP32[o >> 2] = 0, 0;
            case 21520:
                return t.tty ? -ERRNO_CODES.EINVAL : -ERRNO_CODES.ENOTTY;
            case 21531:
                o = SYSCALLS.get();
                return FS.ioctl(t, n, o);
            case 21523:
                return t.tty ? 0 : -ERRNO_CODES.ENOTTY;
            default:
                abort("bad ioctl syscall " + n)
        }
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e), -e.errno
    }
}

function ___syscall221(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD();
        switch (SYSCALLS.get()) {
            case 0:
                return (n = SYSCALLS.get()) < 0 ? -ERRNO_CODES.EINVAL : FS.open(t.path, t.flags, 0, n).fd;
            case 1:
            case 2:
                return 0;
            case 3:
                return t.flags;
            case 4:
                var n = SYSCALLS.get();
                return t.flags |= n, 0;
            case 12:
            case 12:
                n = SYSCALLS.get();
                return HEAP16[n + 0 >> 1] = 2, 0;
            case 13:
            case 14:
            case 13:
            case 14:
                return 0;
            case 16:
            case 8:
                return -ERRNO_CODES.EINVAL;
            case 9:
                return ___setErrNo(ERRNO_CODES.EINVAL), -1;
            default:
                return -ERRNO_CODES.EINVAL
        }
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e), -e.errno
    }
}

function ___syscall145(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD(),
            n = SYSCALLS.get(),
            o = SYSCALLS.get();
        return SYSCALLS.doReadv(t, n, o)
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e), -e.errno
    }
}

function nullFunc_ii(e) {
    Module.printErr("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"), Module.printErr("Build with ASSERTIONS=2 for more info."), abort(e)
}

function nullFunc_iiii(e) {
    Module.printErr("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"), Module.printErr("Build with ASSERTIONS=2 for more info."), abort(e)
}

function invoke_ii(e, r) {
    try {
        return Module.dynCall_ii(e, r)
    } catch (e) {
        if ("number" != typeof e && "longjmp" !== e) throw e;
        Module.setThrew(1, 0)
    }
}

function invoke_iiii(e, r, t, n) {
    try {
        return Module.dynCall_iiii(e, r, t, n)
    } catch (e) {
        if ("number" != typeof e && "longjmp" !== e) throw e;
        Module.setThrew(1, 0)
    }
}
FS.staticInit(), __ATINIT__.unshift((function () {
    Module.noFSInit || FS.init.initialized || FS.init()
})), __ATMAIN__.push((function () {
    FS.ignorePermissions = !1
})), __ATEXIT__.push((function () {
    FS.quit()
})), Module.FS_createFolder = FS.createFolder, Module.FS_createPath = FS.createPath, Module.FS_createDataFile = FS.createDataFile, Module.FS_createPreloadedFile = FS.createPreloadedFile, Module.FS_createLazyFile = FS.createLazyFile, Module.FS_createLink = FS.createLink, Module.FS_createDevice = FS.createDevice, Module.FS_unlink = FS.unlink, DYNAMICTOP_PTR = allocate(1, "i32", ALLOC_STATIC), STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP), STACK_MAX = STACK_BASE + TOTAL_STACK, DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX), HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE, staticSealed = !0, assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack"), Module.asmLibraryArg = {
    abort: abort,
    assert: assert,
    enlargeMemory: enlargeMemory,
    getTotalMemory: getTotalMemory,
    abortOnCannotGrowMemory: abortOnCannotGrowMemory,
    abortStackOverflow: abortStackOverflow,
    nullFunc_ii: nullFunc_ii,
    nullFunc_iiii: nullFunc_iiii,
    invoke_ii: invoke_ii,
    invoke_iiii: invoke_iiii,
    ___syscall221: ___syscall221,
    _emscripten_asm_const_iiii: _emscripten_asm_const_iiii,
    _emscripten_asm_const_i: _emscripten_asm_const_i,
    ___lock: ___lock,
    ___syscall6: ___syscall6,
    ___setErrNo: ___setErrNo,
    ___syscall140: ___syscall140,
    ___syscall146: ___syscall146,
    ___syscall5: ___syscall5,
    _emscripten_memcpy_big: _emscripten_memcpy_big,
    ___syscall54: ___syscall54,
    ___unlock: ___unlock,
    ___syscall145: ___syscall145,
    _emscripten_asm_const_iii: _emscripten_asm_const_iii,
    DYNAMICTOP_PTR: DYNAMICTOP_PTR,
    tempDoublePtr: tempDoublePtr,
    ABORT: ABORT,
    STACKTOP: STACKTOP,
    STACK_MAX: STACK_MAX,
    cttz_i8: cttz_i8
};
var asm = function (e, r) {
        var t = new Int8Array(r),
            n = new Int16Array(r),
            o = new Int32Array(r),
            i = new Uint8Array(r),
            a = (new Uint16Array(r), new Uint32Array(r), new Float32Array(r), new Float64Array(r)),
            s = byteLength,
            u = 0 | e.DYNAMICTOP_PTR,
            c = 0 | e.tempDoublePtr,
            l = (e.ABORT, 0 | e.STACKTOP),
            f = 0 | e.STACK_MAX,
            d = 0 | e.cttz_i8,
            S = 0,
            E = 0,
            _ = Math.imul,
            m = Math.clz32,
            h = e.enlargeMemory,
            p = e.getTotalMemory,
            b = e.abortOnCannotGrowMemory,
            k = e.abortStackOverflow,
            A = e.nullFunc_ii,
            F = e.nullFunc_iiii,
            v = e.___syscall221,
            M = e._emscripten_asm_const_iiii,
            y = e._emscripten_asm_const_i,
            T = e.___lock,
            g = e.___syscall6,
            w = e.___setErrNo,
            O = e.___syscall140,
            R = e.___syscall146,
            N = e.___syscall5,
            P = e._emscripten_memcpy_big,
            C = e.___syscall54,
            D = e.___unlock,
            L = e.___syscall145,
            I = e._emscripten_asm_const_iii;

        function x(e, r) {
            r |= 0;
            var n, i = 0,
                a = 0;
            n = 0 | function (e, r) {
                e |= 0, r |= 0;
                var n = 0,
                    i = 0,
                    a = 0,
                    s = 0,
                    u = 0,
                    c = 0;
                n = l, (0 | (l = l + 48 | 0)) >= (0 | f) && k(48);
                i = n + 32 | 0, a = n + 16 | 0, s = n, 0 | ie(3788, 0 | t[r >> 0], 4) ? (u = 0 | (d = r, S = 0, E = 0, _ = 0, m = 0, S = 0 == (0 | he(d |= 0, 43)), E = 0 | t[d >> 0], _ = S ? E << 24 >> 24 != 114 & 1 : 2, S = 0 == (0 | he(d, 120)), m = S ? _ : 128 | _, _ = 0 == (0 | he(d, 101)), d = _ ? m : 524288 | m, m = E << 24 >> 24 == 114 ? d : 64 | d, d = E << 24 >> 24 == 119 ? 512 | m : m, 0 | (E << 24 >> 24 == 97 ? 1024 | d : d)), o[s >> 2] = e, o[s + 4 >> 2] = 32768 | u, o[s + 8 >> 2] = 438, (0 | (e = 0 | X(0 | N(5, 0 | s)))) >= 0 ? (524288 & u | 0 && (o[a >> 2] = e, o[a + 4 >> 2] = 2, o[a + 8 >> 2] = 1, v(221, 0 | a)), (a = 0 | function (e, r) {
                    e |= 0, r |= 0;
                    var n = 0,
                        i = 0,
                        a = 0,
                        s = 0,
                        u = 0,
                        c = 0,
                        d = 0,
                        S = 0,
                        E = 0,
                        _ = 0,
                        m = 0,
                        h = 0,
                        p = 0;
                    n = l, (0 | (l = l + 64 | 0)) >= (0 | f) && k(64);
                    if (i = n + 40 | 0, a = n + 24 | 0, s = n + 16 | 0, u = n, c = n + 56 | 0, 0 | ie(3788, (d = 0 | t[r >> 0]) << 24 >> 24, 4))
                        if (S = 0 | V(1156)) {
                            m = (_ = S) + 124 | 0;
                            do {
                                o[_ >> 2] = 0, _ = _ + 4 | 0
                            } while ((0 | _) < (0 | m));
                            0 | he(r, 43) || (o[S >> 2] = d << 24 >> 24 == 114 ? 8 : 4), 0 | he(r, 101) ? (o[u >> 2] = e, o[u + 4 >> 2] = 2, o[u + 8 >> 2] = 1, v(221, 0 | u), h = 0 | t[r >> 0]) : h = d, h << 24 >> 24 == 97 ? (o[s >> 2] = e, o[s + 4 >> 2] = 3, 1024 & (h = 0 | v(221, 0 | s)) || (o[a >> 2] = e, o[a + 4 >> 2] = 4, o[a + 8 >> 2] = 1024 | h, v(221, 0 | a)), a = 128 | o[S >> 2], o[S >> 2] = a, p = a) : p = 0 | o[S >> 2], o[S + 60 >> 2] = e, o[S + 44 >> 2] = S + 132, o[S + 48 >> 2] = 1024, t[(a = S + 75 | 0) >> 0] = -1, 0 == (8 & p | 0) && (o[i >> 2] = e, o[i + 4 >> 2] = 21523, o[i + 8 >> 2] = c, 0 == (0 | C(54, 0 | i))) && (t[a >> 0] = 10), o[S + 32 >> 2] = 4, o[S + 36 >> 2] = 3, o[S + 40 >> 2] = 2, o[S + 12 >> 2] = 1, 0 | o[1073] || (o[S + 76 >> 2] = -1),
                                function (e) {
                                    e |= 0;
                                    var r = 0,
                                        t = 0;
                                    r = 0 | Ae(), o[e + 56 >> 2] = o[r >> 2], 0 | (t = 0 | o[r >> 2]) && (o[t + 52 >> 2] = e);
                                    o[r >> 2] = e, Fe()
                                }(S), E = S
                        } else E = 0;
                    else S = 0 | G(), o[S >> 2] = 22, E = 0;
                    return l = n, 0 | E
                }(e, r)) ? c = a : (o[i >> 2] = e, g(6, 0 | i), c = 0)) : c = 0) : (a = 0 | G(), o[a >> 2] = 22, c = 0);
                var d, S, E, _, m;
                return l = n, 0 | c
            }(e |= 0, 964);
            do {
                if (0 | n) {
                    if (Te(n, 0, 2), e = 0 | Re(n), De(n), !(i = 0 | V(e + 1 | 0))) {
                        Ce(1230), ve(n);
                        break
                    }
                    return (0 | (a = 0 | Oe(i, 1, e, n))) < (0 | e) && Ce(1256), o[r >> 2] = i, t[i + e >> 0] = 0, ve(n), 0 | a
                }
            } while (0);
            return o[r >> 2] = 0, 0 | -1
        }

        function H(e, r, n) {
            e |= 0, r |= 0, n |= 0;
            var a, s, u, c, d, S, E, _ = 0,
                m = 0;
            if (a = l, (0 | (l = l + 32 | 0)) >= (0 | f) && k(32), s = a + 20 | 0, u = a + 12 | 0, c = a + 8 | 0, d = a + 4 | 0, S = a, E = a + 24 | 0, o[(_ = a + 16 | 0) >> 2] = e, o[u >> 2] = r, o[c >> 2] = n, o[d >> 2] = o[u >> 2], o[S >> 2] = o[_ >> 2], !(0 | o[d >> 2])) return o[s >> 2] = 0, m = 0 | o[s >> 2], l = a, 0 | m;
            for (o[S >> 2] = ~o[S >> 2]; _ = 0 | o[c >> 2], o[c >> 2] = _ + -1, _;) _ = 0 | o[d >> 2], o[d >> 2] = _ + 1, t[E >> 0] = 0 | t[_ >> 0], o[S >> 2] = (0 | o[S >> 2]) >>> 4 ^ o[8 + ((15 & o[S >> 2] ^ 15 & (0 | i[E >> 0])) << 2) >> 2], o[S >> 2] = (0 | o[S >> 2]) >>> 4 ^ o[8 + ((15 & o[S >> 2] ^ (0 | i[E >> 0]) >> 4) << 2) >> 2];
            return o[s >> 2] = ~o[S >> 2], m = 0 | o[s >> 2], l = a, 0 | m
        }

        function B(e, r) {
            e |= 0, r |= 0;
            var t, n, i, a, s, u = 0;
            return t = l, (0 | (l = l + 16 | 0)) >= (0 | f) && k(16), n = t + 12 | 0, a = t + 4 | 0, s = t, o[(i = t + 8 | 0) >> 2] = e, o[a >> 2] = r, 0 | o[i >> 2] ? 15 != (0 | o[a >> 2]) && 15 != (0 - (0 | o[a >> 2]) | 0) ? (o[n >> 2] = -1e4, u = 0 | o[n >> 2], l = t, 0 | u) : (o[36 + (0 | o[i >> 2]) >> 2] = 0, o[40 + (0 | o[i >> 2]) >> 2] = 0, o[24 + (0 | o[i >> 2]) >> 2] = 0, o[8 + (0 | o[i >> 2]) >> 2] = 0, o[20 + (0 | o[i >> 2]) >> 2] = 0, o[44 + (0 | o[i >> 2]) >> 2] = 0, r = 0 | V(43784), o[s >> 2] = r, 0 | o[s >> 2] ? (o[28 + (0 | o[i >> 2]) >> 2] = o[s >> 2], o[o[s >> 2] >> 2] = 0, o[10992 + (0 | o[s >> 2]) >> 2] = 0, o[10996 + (0 | o[s >> 2]) >> 2] = 0, o[43780 + (0 | o[s >> 2]) >> 2] = 1, o[11e3 + (0 | o[s >> 2]) >> 2] = 1, o[11004 + (0 | o[s >> 2]) >> 2] = 0, o[11008 + (0 | o[s >> 2]) >> 2] = o[a >> 2], o[n >> 2] = 0, u = 0 | o[n >> 2], l = t, 0 | u) : (o[n >> 2] = -4, u = 0 | o[n >> 2], l = t, 0 | u)) : (o[n >> 2] = -2, u = 0 | o[n >> 2], l = t, 0 | u);
            return 0
        }

        function U(e, r, t, n) {
            e |= 0, r |= 0, t |= 0, n |= 0;
            var i, a, s, u, c, d, S, E, _, m, h, p, b, A = 0,
                F = 0,
                v = 0,
                M = 0,
                y = 0;
            if (i = l, (0 | (l = l + 64 | 0)) >= (0 | f) && k(64), a = i + 48 | 0, u = i + 40 | 0, c = i + 36 | 0, d = i + 32 | 0, S = i + 28 | 0, E = i + 24 | 0, A = i + 20 | 0, _ = i + 16 | 0, m = i + 12 | 0, h = i + 8 | 0, p = i + 4 | 0, b = i, o[(s = i + 44 | 0) >> 2] = e, o[u >> 2] = r, o[c >> 2] = t, o[d >> 2] = n, o[_ >> 2] = 8, 0 | o[s >> 2] && 0 | o[28 + (0 | o[s >> 2]) >> 2]) {
                if (1 == (0 | o[u >> 2]) && (o[u >> 2] = 2), 0 != (0 | o[u >> 2]) & 2 != (0 | o[u >> 2]) & 4 != (0 | o[u >> 2])) return o[a >> 2] = -2, F = 0 | o[a >> 2], l = i, 0 | F;
                if (o[S >> 2] = o[28 + (0 | o[s >> 2]) >> 2], (0 | o[11008 + (0 | o[S >> 2]) >> 2]) > 0 && (o[_ >> 2] = 1 | o[_ >> 2]), o[p >> 2] = o[4 + (0 | o[s >> 2]) >> 2], o[A >> 2] = o[11e3 + (0 | o[S >> 2]) >> 2], o[11e3 + (0 | o[S >> 2]) >> 2] = 0, (0 | o[43780 + (0 | o[S >> 2]) >> 2]) < 0) return o[a >> 2] = -3, F = 0 | o[a >> 2], l = i, 0 | F;
                if (4 != (0 | o[u >> 2]) && 0 != (0 | o[11004 + (0 | o[S >> 2]) >> 2])) return o[a >> 2] = -2, F = 0 | o[a >> 2], l = i, 0 | F;
                if (n = 11004 + (0 | o[S >> 2]) | 0, o[n >> 2] = o[n >> 2] | 4 == (0 | o[u >> 2]), 4 == (0 | o[u >> 2]) & 0 != (0 | o[A >> 2])) return o[_ >> 2] = 4 | o[_ >> 2], o[m >> 2] = o[4 + (0 | o[s >> 2]) >> 2], o[h >> 2] = o[16 + (0 | o[s >> 2]) >> 2], A = 0 | Y(0 | o[S >> 2], 0 | o[o[s >> 2] >> 2], m, 0 | o[12 + (0 | o[s >> 2]) >> 2], 0 | o[12 + (0 | o[s >> 2]) >> 2], h, 0 | o[_ >> 2], 0 | o[c >> 2], 0 | o[d >> 2]), o[b >> 2] = A, o[43780 + (0 | o[S >> 2]) >> 2] = o[b >> 2], A = 0 | o[s >> 2], o[A >> 2] = (0 | o[A >> 2]) + (0 | o[m >> 2]), A = 4 + (0 | o[s >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) - (0 | o[m >> 2]), A = 8 + (0 | o[s >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) + (0 | o[m >> 2]), o[40 + (0 | o[s >> 2]) >> 2] = o[28 + (0 | o[S >> 2]) >> 2], A = 12 + (0 | o[s >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) + (0 | o[h >> 2]), A = 16 + (0 | o[s >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) - (0 | o[h >> 2]), A = 20 + (0 | o[s >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) + (0 | o[h >> 2]), (0 | o[b >> 2]) < 0 ? (o[a >> 2] = -3, F = 0 | o[a >> 2], l = i, 0 | F) : 0 | o[b >> 2] ? (o[43780 + (0 | o[S >> 2]) >> 2] = -1, o[a >> 2] = -5, F = 0 | o[a >> 2], l = i, 0 | F) : (o[a >> 2] = 1, F = 0 | o[a >> 2], l = i, 0 | F);
                if (4 != (0 | o[u >> 2]) && (o[_ >> 2] = 2 | o[_ >> 2]), 0 | o[10996 + (0 | o[S >> 2]) >> 2]) return o[E >> 2] = o[((0 | o[10996 + (0 | o[S >> 2]) >> 2]) >>> 0 < (0 | o[16 + (0 | o[s >> 2]) >> 2]) >>> 0 ? 10996 + (0 | o[S >> 2]) | 0 : 16 + (0 | o[s >> 2]) | 0) >> 2], je(0 | o[12 + (0 | o[s >> 2]) >> 2], 11012 + (0 | o[S >> 2]) + (0 | o[10992 + (0 | o[S >> 2]) >> 2]) | 0, 0 | o[E >> 2]), A = 12 + (0 | o[s >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) + (0 | o[E >> 2]), A = 16 + (0 | o[s >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) - (0 | o[E >> 2]), A = 20 + (0 | o[s >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) + (0 | o[E >> 2]), A = 10996 + (0 | o[S >> 2]) | 0, o[A >> 2] = (0 | o[A >> 2]) - (0 | o[E >> 2]), o[10992 + (0 | o[S >> 2]) >> 2] = (0 | o[10992 + (0 | o[S >> 2]) >> 2]) + (0 | o[E >> 2]) & 32767, v = 0 | o[43780 + (0 | o[S >> 2]) >> 2] ? 0 : 0 != (0 | o[10996 + (0 | o[S >> 2]) >> 2]) ^ 1, o[a >> 2] = v ? 1 : 0, F = 0 | o[a >> 2], l = i, 0 | F;
                for (;;) {
                    if (o[m >> 2] = o[4 + (0 | o[s >> 2]) >> 2], o[h >> 2] = 32768 - (0 | o[10992 + (0 | o[S >> 2]) >> 2]), v = 0 | Y(0 | o[S >> 2], 0 | o[o[s >> 2] >> 2], m, 11012 + (0 | o[S >> 2]) | 0, 11012 + (0 | o[S >> 2]) + (0 | o[10992 + (0 | o[S >> 2]) >> 2]) | 0, h, 0 | o[_ >> 2], 0 | o[c >> 2], 0 | o[d >> 2]), o[b >> 2] = v, o[43780 + (0 | o[S >> 2]) >> 2] = o[b >> 2], v = 0 | o[s >> 2], o[v >> 2] = (0 | o[v >> 2]) + (0 | o[m >> 2]), v = 4 + (0 | o[s >> 2]) | 0, o[v >> 2] = (0 | o[v >> 2]) - (0 | o[m >> 2]), v = 8 + (0 | o[s >> 2]) | 0, o[v >> 2] = (0 | o[v >> 2]) + (0 | o[m >> 2]), o[40 + (0 | o[s >> 2]) >> 2] = o[28 + (0 | o[S >> 2]) >> 2], o[10996 + (0 | o[S >> 2]) >> 2] = o[h >> 2], o[E >> 2] = o[((0 | o[10996 + (0 | o[S >> 2]) >> 2]) >>> 0 < (0 | o[16 + (0 | o[s >> 2]) >> 2]) >>> 0 ? 10996 + (0 | o[S >> 2]) | 0 : 16 + (0 | o[s >> 2]) | 0) >> 2], je(0 | o[12 + (0 | o[s >> 2]) >> 2], 11012 + (0 | o[S >> 2]) + (0 | o[10992 + (0 | o[S >> 2]) >> 2]) | 0, 0 | o[E >> 2]), v = 12 + (0 | o[s >> 2]) | 0, o[v >> 2] = (0 | o[v >> 2]) + (0 | o[E >> 2]), v = 16 + (0 | o[s >> 2]) | 0, o[v >> 2] = (0 | o[v >> 2]) - (0 | o[E >> 2]), v = 20 + (0 | o[s >> 2]) | 0, o[v >> 2] = (0 | o[v >> 2]) + (0 | o[E >> 2]), v = 10996 + (0 | o[S >> 2]) | 0, o[v >> 2] = (0 | o[v >> 2]) - (0 | o[E >> 2]), o[10992 + (0 | o[S >> 2]) >> 2] = (0 | o[10992 + (0 | o[S >> 2]) >> 2]) + (0 | o[E >> 2]) & 32767, (0 | o[b >> 2]) < 0) {
                        M = 27;
                        break
                    }
                    if (!(1 != (0 | o[b >> 2]) | 0 != (0 | o[p >> 2]))) {
                        M = 29;
                        break
                    }
                    if (v = 0 == (0 | o[b >> 2]), 4 == (0 | o[u >> 2])) {
                        if (v) {
                            M = 32;
                            break
                        }
                        if (0 | o[16 + (0 | o[s >> 2]) >> 2]) continue;
                        M = 34;
                        break
                    }
                    if (v) {
                        M = 39;
                        break
                    }
                    if (!(0 | o[4 + (0 | o[s >> 2]) >> 2])) {
                        M = 39;
                        break
                    }
                    if (!(0 | o[16 + (0 | o[s >> 2]) >> 2])) {
                        M = 39;
                        break
                    }
                    if (0 | o[10996 + (0 | o[S >> 2]) >> 2]) {
                        M = 39;
                        break
                    }
                }
                if (27 == (0 | M)) return o[a >> 2] = -3, F = 0 | o[a >> 2], l = i, 0 | F;
                if (29 == (0 | M)) return o[a >> 2] = -5, F = 0 | o[a >> 2], l = i, 0 | F;
                if (32 == (0 | M)) return o[a >> 2] = 0 | o[10996 + (0 | o[S >> 2]) >> 2] ? -5 : 1, F = 0 | o[a >> 2], l = i, 0 | F;
                if (34 == (0 | M)) return o[a >> 2] = -5, F = 0 | o[a >> 2], l = i, 0 | F;
                if (39 == (0 | M)) return y = 0 | o[b >> 2] ? 0 : 0 != (0 | o[10996 + (0 | o[S >> 2]) >> 2]) ^ 1, o[a >> 2] = y ? 1 : 0, F = 0 | o[a >> 2], l = i, 0 | F
            }
            return o[a >> 2] = -2, F = 0 | o[a >> 2], l = i, 0 | F
        }

        function Y(e, r, a, s, u, c, d, S, E) {
            e |= 0, r |= 0, a |= 0, s |= 0, u |= 0, c |= 0, d |= 0, S |= 0, E |= 0;
            var _, m, h, p, b, A, F, v, M, y, T, g, w, O, R, N, P, C, D, L, x, H, B, U, Y, z, V, K, j, X, G, W, q, Z, Q, $, J, ee, re, te, ne, oe, ie, ae, se, ue, ce, le, fe, de, Se, Ee, _e, me, he, pe, be, ke, Ae, Fe, ve, Me, ye, Te, ge, we, Oe, Re, Ne, Pe, Ce, De, Le, Ie, He = 0,
                Be = 0,
                Ue = 0,
                Ye = 0,
                ze = 0,
                Ve = 0,
                Ke = 0,
                Xe = 0,
                Ge = 0,
                We = 0,
                qe = 0,
                Ze = 0,
                Qe = 0,
                $e = 0,
                Je = 0,
                er = 0,
                rr = 0;
            if (_ = l, (0 | (l = l + 432 | 0)) >= (0 | f) && k(432), m = _ + 416 | 0, p = _ + 408 | 0, b = _ + 404 | 0, A = _ + 400 | 0, He = _ + 396 | 0, F = _ + 392 | 0, v = _ + 388 | 0, M = _ + 384 | 0, y = _ + 380 | 0, T = _ + 376 | 0, g = _ + 372 | 0, w = _ + 368 | 0, O = _ + 364 | 0, R = _ + 360 | 0, N = _ + 356 | 0, P = _ + 352 | 0, C = _ + 348 | 0, D = _ + 344 | 0, L = _ + 340 | 0, x = _ + 336 | 0, H = _ + 332 | 0, B = _ + 328 | 0, U = _ + 324 | 0, Y = _ + 320 | 0, z = _ + 316 | 0, V = _ + 312 | 0, K = _ + 308 | 0, j = _ + 304 | 0, X = _ + 300 | 0, G = _ + 296 | 0, W = _ + 292 | 0, q = _ + 288 | 0, Z = _ + 284 | 0, Q = _ + 280 | 0, $ = _ + 276 | 0, J = _ + 272 | 0, ee = _ + 268 | 0, re = _ + 264 | 0, te = _ + 260 | 0, ne = _ + 192 | 0, oe = _ + 128 | 0, ie = _ + 120 | 0, ae = _ + 116 | 0, se = _ + 112 | 0, ue = _ + 108 | 0, ce = _ + 420 | 0, le = _ + 104 | 0, fe = _ + 100 | 0, de = _ + 96 | 0, Se = _ + 92 | 0, Ee = _ + 88 | 0, _e = _ + 84 | 0, me = _ + 80 | 0, he = _ + 76 | 0, pe = _ + 72 | 0, be = _ + 68 | 0, ke = _ + 64 | 0, Ae = _ + 60 | 0, Fe = _ + 56 | 0, ve = _ + 52 | 0, Me = _ + 48 | 0, ye = _ + 44 | 0, Te = _ + 40 | 0, ge = _ + 36 | 0, we = _ + 32 | 0, Oe = _ + 28 | 0, Re = _ + 24 | 0, Ne = _ + 20 | 0, Pe = _ + 16 | 0, Ce = _ + 12 | 0, De = _ + 8 | 0, Le = _ + 4 | 0, Ie = _, o[(h = _ + 412 | 0) >> 2] = e, o[p >> 2] = r, o[b >> 2] = a, o[A >> 2] = s, o[He >> 2] = u, o[F >> 2] = c, o[v >> 2] = d, o[M >> 2] = S, o[y >> 2] = E, o[T >> 2] = -1, o[P >> 2] = o[p >> 2], o[C >> 2] = (0 | o[p >> 2]) + (0 | o[o[b >> 2] >> 2]), o[D >> 2] = o[He >> 2], o[L >> 2] = (0 | o[He >> 2]) + (0 | o[o[F >> 2] >> 2]), Be = 4 & o[v >> 2] | 0 ? -1 : (0 | o[He >> 2]) - (0 | o[A >> 2]) + (0 | o[o[F >> 2] >> 2]) - 1 | 0, o[x >> 2] = Be, 0 == (1 + (0 | o[x >> 2]) & o[x >> 2] | 0) && (0 | o[He >> 2]) >>> 0 >= (0 | o[A >> 2]) >>> 0) {
                switch (o[g >> 2] = o[4 + (0 | o[h >> 2]) >> 2], o[N >> 2] = o[56 + (0 | o[h >> 2]) >> 2], o[w >> 2] = o[32 + (0 | o[h >> 2]) >> 2], o[O >> 2] = o[36 + (0 | o[h >> 2]) >> 2], o[R >> 2] = o[40 + (0 | o[h >> 2]) >> 2], o[H >> 2] = o[60 + (0 | o[h >> 2]) >> 2], 0 | o[o[h >> 2] >> 2]) {
                    case 0:
                        o[12 + (0 | o[h >> 2]) >> 2] = 0, o[8 + (0 | o[h >> 2]) >> 2] = 0, o[R >> 2] = 0, o[O >> 2] = 0, o[w >> 2] = 0, o[g >> 2] = 0, o[N >> 2] = 0, o[28 + (0 | o[h >> 2]) >> 2] = 1, o[16 + (0 | o[h >> 2]) >> 2] = 1, 1 & o[v >> 2] | 0 ? (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0 ? Ue = 9 : (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, Ye = 0 | i[Be >> 0], ze = 0 | o[h >> 2], Ue = 15) : Ue = 31;
                        break;
                    case 1:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, Ye = 0 | i[Be >> 0], ze = 0 | o[h >> 2], Ue = 15) : Ue = 9;
                        break;
                    case 2:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, Ve = 0 | o[h >> 2], Ke = 0 | i[Be >> 0], Ue = 22) : Ue = 16;
                        break;
                    case 36:
                        Ue = 30;
                        break;
                    case 3:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[B >> 2] = i[Be >> 0], Ue = 39) : Ue = 33;
                        break;
                    case 5:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[U >> 2] = i[Be >> 0], Ue = 49) : Ue = 43;
                        break;
                    case 6:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[Y >> 2] = i[Be >> 0], Ue = 61) : Ue = 55;
                        break;
                    case 7:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, Xe = 0 | t[Be >> 0], Ge = 0 | o[O >> 2], We = 0 | o[h >> 2], Ue = 70) : Ue = 64;
                        break;
                    case 39:
                        Ue = 73;
                        break;
                    case 51:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[z >> 2] = i[Be >> 0], Ue = 83) : Ue = 77;
                        break;
                    case 52:
                        Ue = 85;
                        break;
                    case 9:
                        Ue = 89;
                        break;
                    case 38:
                        Ue = 91;
                        break;
                    case 40:
                        Ue = 94;
                        break;
                    case 10:
                        Ue = 100;
                        break;
                    case 11:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[X >> 2] = i[Be >> 0], Ue = 121) : Ue = 115;
                        break;
                    case 14:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[W >> 2] = i[Be >> 0], Ue = 133) : Ue = 127;
                        break;
                    case 35:
                        Ue = 144;
                        break;
                    case 16:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[Se >> 2] = i[Be >> 0], Ue = 185) : Ue = 179;
                        break;
                    case 17:
                        Ue = 194;
                        break;
                    case 18:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[Ee >> 2] = i[Be >> 0], Ue = 203) : Ue = 197;
                        break;
                    case 21:
                        Ue = 208;
                        break;
                    case 23:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[pe >> 2] = i[Be >> 0], Ue = 231) : Ue = 225;
                        break;
                    case 24:
                        Ue = 238;
                        break;
                    case 25:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[Fe >> 2] = i[Be >> 0], Ue = 267) : Ue = 261;
                        break;
                    case 26:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[ye >> 2] = i[Be >> 0], Ue = 286) : Ue = 280;
                        break;
                    case 27:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[ge >> 2] = i[Be >> 0], Ue = 301) : Ue = 295;
                        break;
                    case 37:
                        Ue = 305;
                        break;
                    case 53:
                        Ue = 308;
                        break;
                    case 32:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[we >> 2] = i[Be >> 0], Ue = 326) : Ue = 320;
                        break;
                    case 41:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[Re >> 2] = i[Be >> 0], Ue = 338) : Ue = 332;
                        break;
                    case 42:
                        (0 | o[P >> 2]) >>> 0 < (0 | o[C >> 2]) >>> 0 ? (Be = 0 | o[P >> 2], o[P >> 2] = Be + 1, o[Oe >> 2] = i[Be >> 0], Ue = 347) : Ue = 341;
                        break;
                    case 34:
                        Ue = 348;
                        break;
                    default:
                        Ue = 350
                }
                do {
                    if (9 == (0 | Ue)) {
                        if (2 & o[v >> 2] | 0) {
                            o[T >> 2] = 1, qe = 1, Ze = 0 | o[h >> 2], Ue = 349;
                            break
                        }
                        Ye = 0, ze = 0 | o[h >> 2], Ue = 15;
                        break
                    }
                } while (0);
                15 == (0 | Ue) && (o[ze + 8 >> 2] = Ye, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0 ? Ue = 16 : (Ye = 0 | o[P >> 2], o[P >> 2] = Ye + 1, Ve = 0 | o[h >> 2], Ke = 0 | i[Ye >> 0], Ue = 22));
                do {
                    if (16 == (0 | Ue)) {
                        if (2 & o[v >> 2] | 0) {
                            o[T >> 2] = 1, qe = 2, Ze = 0 | o[h >> 2], Ue = 349;
                            break
                        }
                        Ve = 0 | o[h >> 2], Ke = 0, Ue = 22;
                        break
                    }
                } while (0);
                22 == (0 | Ue) && (o[Ve + 12 >> 2] = Ke, Qe = 0 | (((o[8 + (0 | o[h >> 2]) >> 2] << 8) + (0 | o[12 + (0 | o[h >> 2]) >> 2]) | 0) >>> 0) % 31 || 32 & o[12 + (0 | o[h >> 2]) >> 2] | 0 ? 1 : 8 != (15 & o[8 + (0 | o[h >> 2]) >> 2] | 0), o[O >> 2] = 1 & Qe, 4 & o[v >> 2] || ($e = 1 << 8 + ((0 | o[8 + (0 | o[h >> 2]) >> 2]) >>> 4) >>> 0 > 32768 ? 1 : (1 + (0 | o[x >> 2]) | 0) >>> 0 < 1 << 8 + ((0 | o[8 + (0 | o[h >> 2]) >> 2]) >>> 4) >>> 0, o[O >> 2] = o[O >> 2] | 1 & $e), Ue = 0 | o[O >> 2] ? 30 : 31), 30 == (0 | Ue) && (o[T >> 2] = -1, qe = 36, Ze = 0 | o[h >> 2], Ue = 349);
                e: for (;;) {
                    switch (0 | Ue) {
                        case 31:
                            Ue = 0, I(2, (0 | o[y >> 2]) + (0 | o[H >> 2]) | 0, 0 | o[M >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 3 ? 32 : 40;
                            break;
                        case 33:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 3, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[B >> 2] = 0, Ue = 39;
                            continue e;
                            break;
                        case 39:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[B >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 3 ? 32 : 40;
                            break;
                        case 43:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 5, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[U >> 2] = 0, Ue = 49;
                            continue e;
                            break;
                        case 49:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[U >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < (7 & o[g >> 2]) >>> 0 ? 42 : 50;
                            break;
                        case 55:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 6, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[Y >> 2] = 0, Ue = 61;
                            continue e;
                            break;
                        case 61:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[Y >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 8 ? 54 : 62;
                            break;
                        case 64:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 7, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            Xe = 0, Ge = 0 | o[O >> 2], We = 0 | o[h >> 2], Ue = 70;
                            continue e;
                            break;
                        case 70:
                            Ue = 0, t[We + 10528 + Ge >> 0] = Xe, Ue = 71;
                            break;
                        case 73:
                            Ue = 0, o[T >> 2] = -1, qe = 39, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 77:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 51, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[z >> 2] = 0, Ue = 83;
                            continue e;
                            break;
                        case 83:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[z >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 8 ? 76 : 84;
                            break;
                        case 85:
                            if (Ue = 0, (0 | o[D >> 2]) >>> 0 >= (0 | o[L >> 2]) >>> 0) {
                                o[T >> 2] = 2, qe = 52, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            $e = 255 & o[w >> 2], Qe = 0 | o[D >> 2], o[D >> 2] = Qe + 1, t[Qe >> 0] = $e, o[O >> 2] = (0 | o[O >> 2]) - 1, Ue = 74;
                            break;
                            break;
                        case 89:
                            if (Ue = 0, (0 | o[D >> 2]) >>> 0 < (0 | o[L >> 2]) >>> 0) {
                                Ue = 91;
                                continue e
                            }
                            o[T >> 2] = 2, qe = 9, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 91:
                            if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                if (!(2 & o[v >> 2])) {
                                    Ue = 94;
                                    continue e
                                }
                                o[T >> 2] = 1, qe = 38, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            Je = ((($e = ((0 | o[L >> 2]) - (0 | o[D >> 2]) | 0) >>> 0 < ((0 | o[C >> 2]) - (0 | o[P >> 2]) | 0) >>> 0) ? 0 | o[L >> 2] : 0 | o[C >> 2]) - ($e ? 0 | o[D >> 2] : 0 | o[P >> 2]) | 0) >>> 0 < (0 | o[O >> 2]) >>> 0 ? (($e = ((0 | o[L >> 2]) - (0 | o[D >> 2]) | 0) >>> 0 < ((0 | o[C >> 2]) - (0 | o[P >> 2]) | 0) >>> 0) ? 0 | o[L >> 2] : 0 | o[C >> 2]) - ($e ? 0 | o[D >> 2] : 0 | o[P >> 2]) | 0 : 0 | o[O >> 2], o[V >> 2] = Je, je(0 | o[D >> 2], 0 | o[P >> 2], 0 | o[V >> 2]), o[P >> 2] = (0 | o[P >> 2]) + (0 | o[V >> 2]), o[D >> 2] = (0 | o[D >> 2]) + (0 | o[V >> 2]), o[O >> 2] = (0 | o[O >> 2]) - (0 | o[V >> 2]), Ue = 88;
                            break;
                        case 94:
                            Ue = 0, o[T >> 2] = -1, qe = 40, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 100:
                            Ue = 0, o[T >> 2] = -1, qe = 10, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 115:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 11, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[X >> 2] = 0, Ue = 121;
                            continue e;
                            break;
                        case 121:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[X >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < (0 | t[1331 + (0 | o[O >> 2]) >> 0]) >>> 0 ? 114 : 122;
                            break;
                        case 127:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 14, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[W >> 2] = 0, Ue = 133;
                            continue e;
                            break;
                        case 133:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[W >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 3 ? 126 : 134;
                            break;
                        case 144:
                            Ue = 0, o[T >> 2] = -1, qe = 35, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 179:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 16, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[Se >> 2] = 0, Ue = 185;
                            continue e;
                            break;
                        case 185:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[Se >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 15 ? 170 : 187;
                            break;
                        case 194:
                            Ue = 0, o[T >> 2] = -1, qe = 17, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 197:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 18, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[Ee >> 2] = 0, Ue = 203;
                            continue e;
                            break;
                        case 203:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[Ee >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < (0 | o[R >> 2]) >>> 0 ? 196 : 204;
                            break;
                        case 208:
                            Ue = 0, o[T >> 2] = -1, qe = 21, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 225:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 23, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[pe >> 2] = 0, Ue = 231;
                            continue e;
                            break;
                        case 231:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[pe >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 15 ? 216 : 233;
                            break;
                        case 238:
                            if (Ue = 0, (0 | o[D >> 2]) >>> 0 >= (0 | o[L >> 2]) >>> 0) {
                                o[T >> 2] = 2, qe = 24, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            $e = 255 & o[O >> 2], Qe = 0 | o[D >> 2], o[D >> 2] = Qe + 1, t[Qe >> 0] = $e, Ue = 212;
                            break;
                            break;
                        case 261:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 25, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[Fe >> 2] = 0, Ue = 267;
                            continue e;
                            break;
                        case 267:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[Fe >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < (0 | o[R >> 2]) >>> 0 ? 260 : 268;
                            break;
                        case 280:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 26, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[ye >> 2] = 0, Ue = 286;
                            continue e;
                            break;
                        case 286:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[ye >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 15 ? 271 : 288;
                            break;
                        case 295:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 27, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[ge >> 2] = 0, Ue = 301;
                            continue e;
                            break;
                        case 301:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[ge >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < (0 | o[R >> 2]) >>> 0 ? 294 : 302;
                            break;
                        case 305:
                            Ue = 0, o[T >> 2] = -1, qe = 37, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 308:
                            if (Ue = 0, (0 | o[D >> 2]) >>> 0 >= (0 | o[L >> 2]) >>> 0) {
                                o[T >> 2] = 2, qe = 53, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            $e = 0 | o[H >> 2], o[H >> 2] = $e + 1, Qe = 0 | t[(0 | o[A >> 2]) + ($e - (0 | o[w >> 2]) & o[x >> 2]) >> 0], $e = 0 | o[D >> 2], o[D >> 2] = $e + 1, t[$e >> 0] = Qe, Ue = 307;
                            break;
                            break;
                        case 320:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 32, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[we >> 2] = 0, Ue = 326;
                            continue e;
                            break;
                        case 326:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[we >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < (7 & o[g >> 2]) >>> 0 ? 319 : 327;
                            break;
                        case 332:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 41, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[Re >> 2] = 0, Ue = 338;
                            continue e;
                            break;
                        case 338:
                            Ue = 0, o[N >> 2] = o[N >> 2] | o[Re >> 2] << o[g >> 2], o[g >> 2] = 8 + (0 | o[g >> 2]), Ue = (0 | o[g >> 2]) >>> 0 < 8 ? 331 : 339;
                            break;
                        case 341:
                            if (Ue = 0, 2 & o[v >> 2] | 0) {
                                o[T >> 2] = 1, qe = 42, Ze = 0 | o[h >> 2], Ue = 349;
                                continue e
                            }
                            o[Oe >> 2] = 0, Ue = 347;
                            continue e;
                            break;
                        case 347:
                            Ue = 0, o[16 + (0 | o[h >> 2]) >> 2] = o[16 + (0 | o[h >> 2]) >> 2] << 8 | o[Oe >> 2], o[O >> 2] = 1 + (0 | o[O >> 2]), Ue = 328;
                            break;
                        case 348:
                            Ue = 0, o[T >> 2] = 0, qe = 34, Ze = 0 | o[h >> 2], Ue = 349;
                            continue e;
                            break;
                        case 349:
                            Ue = 0, o[Ze >> 2] = qe, Ue = 350;
                            continue e;
                            break;
                        case 350:
                            if (Ue = 0, o[4 + (0 | o[h >> 2]) >> 2] = o[g >> 2], o[56 + (0 | o[h >> 2]) >> 2] = o[N >> 2], o[32 + (0 | o[h >> 2]) >> 2] = o[w >> 2], o[36 + (0 | o[h >> 2]) >> 2] = o[O >> 2], o[40 + (0 | o[h >> 2]) >> 2] = o[R >> 2], o[60 + (0 | o[h >> 2]) >> 2] = o[H >> 2], o[o[b >> 2] >> 2] = (0 | o[P >> 2]) - (0 | o[p >> 2]), o[o[F >> 2] >> 2] = (0 | o[D >> 2]) - (0 | o[He >> 2]), 0 != (9 & o[v >> 2] | 0) & (0 | o[T >> 2]) >= 0) {
                                Ue = 351;
                                break e
                            }
                            break e;
                            break
                    }
                    if (32 != (0 | Ue)) {
                        r: do {
                            if (40 == (0 | Ue)) {
                                if (Ue = 0, o[20 + (0 | o[h >> 2]) >> 2] = 7 & o[N >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> 3, o[g >> 2] = (0 | o[g >> 2]) - 3, o[24 + (0 | o[h >> 2]) >> 2] = (0 | o[20 + (0 | o[h >> 2]) >> 2]) >>> 1, !(0 | o[24 + (0 | o[h >> 2]) >> 2])) {
                                    if ((0 | o[g >> 2]) >>> 0 < (7 & o[g >> 2]) >>> 0) {
                                        Ue = 42;
                                        break
                                    }
                                    Ue = 50;
                                    break
                                }
                                if (3 == (0 | o[24 + (0 | o[h >> 2]) >> 2])) {
                                    Ue = 100;
                                    continue e
                                }
                                if (1 != (0 | o[24 + (0 | o[h >> 2]) >> 2])) {
                                    o[O >> 2] = 0, Ue = 112;
                                    break
                                }
                                for (o[K >> 2] = 64 + (0 | o[h >> 2]), o[44 + (0 | o[h >> 2]) >> 2] = 288, o[44 + (0 | o[h >> 2]) + 4 >> 2] = 32, Qe = 64 + (0 | o[h >> 2]) + 3488 | 0, o[Qe >> 2] = 84215045, o[Qe + 4 >> 2] = 84215045, o[Qe + 8 >> 2] = 84215045, o[Qe + 12 >> 2] = 84215045, o[Qe + 16 >> 2] = 84215045, o[Qe + 20 >> 2] = 84215045, o[Qe + 24 >> 2] = 84215045, o[Qe + 28 >> 2] = 84215045, o[j >> 2] = 0; !((0 | o[j >> 2]) >>> 0 > 143);) Qe = 0 | o[K >> 2], o[K >> 2] = Qe + 1, t[Qe >> 0] = 8, o[j >> 2] = 1 + (0 | o[j >> 2]);
                                for (; !((0 | o[j >> 2]) >>> 0 > 255);) Qe = 0 | o[K >> 2], o[K >> 2] = Qe + 1, t[Qe >> 0] = 9, o[j >> 2] = 1 + (0 | o[j >> 2]);
                                for (; !((0 | o[j >> 2]) >>> 0 > 279);) Qe = 0 | o[K >> 2], o[K >> 2] = Qe + 1, t[Qe >> 0] = 7, o[j >> 2] = 1 + (0 | o[j >> 2]);
                                for (;;) {
                                    if ((0 | o[j >> 2]) >>> 0 > 287) {
                                        Ue = 136;
                                        break r
                                    }
                                    Qe = 0 | o[K >> 2], o[K >> 2] = Qe + 1, t[Qe >> 0] = 8, o[j >> 2] = 1 + (0 | o[j >> 2])
                                }
                            }
                        } while (0);
                        if (42 != (0 | Ue)) {
                            50 == (0 | Ue) && (Ue = 0, o[N >> 2] = (0 | o[N >> 2]) >>> (7 & o[g >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (7 & o[g >> 2]), o[O >> 2] = 0, Ue = 51);
                            r: for (;;) {
                                switch (0 | Ue) {
                                    case 51:
                                        if (Ue = 0, (0 | o[O >> 2]) >>> 0 >= 4) {
                                            if (Qe = i[10528 + (0 | o[h >> 2]) >> 0] | i[10528 + (0 | o[h >> 2]) + 1 >> 0] << 8, o[O >> 2] = Qe, (0 | Qe) != (65535 ^ (i[10528 + (0 | o[h >> 2]) + 2 >> 0] | i[10528 + (0 | o[h >> 2]) + 3 >> 0] << 8) | 0)) {
                                                Ue = 73;
                                                continue e
                                            }
                                            Ue = 74;
                                            continue r
                                        }
                                        if (!(0 | o[g >> 2])) {
                                            Ue = 63;
                                            break r
                                        }
                                        if ((0 | o[g >> 2]) >>> 0 < 8) {
                                            Ue = 54;
                                            continue r
                                        }
                                        Ue = 62;
                                        continue r;
                                        break;
                                    case 54:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 55;
                                            continue e
                                        }
                                        Ue = 60;
                                        break r;
                                        break;
                                    case 62:
                                        Ue = 0, t[10528 + (0 | o[h >> 2]) + (0 | o[O >> 2]) >> 0] = o[N >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> 8, o[g >> 2] = (0 | o[g >> 2]) - 8, Ue = 71;
                                        continue r;
                                        break;
                                    case 71:
                                        Ue = 0, o[O >> 2] = 1 + (0 | o[O >> 2]), Ue = 51;
                                        continue r;
                                        break;
                                    case 74:
                                        if (Ue = 0, !(0 | o[O >> 2] && 0 != (0 | o[g >> 2]))) {
                                            Ue = 88;
                                            continue r
                                        }
                                        if ((0 | o[g >> 2]) >>> 0 < 8) {
                                            Ue = 76;
                                            continue r
                                        }
                                        Ue = 84;
                                        continue r;
                                        break;
                                    case 76:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 77;
                                            continue e
                                        }
                                        Ue = 82;
                                        break r;
                                        break;
                                    case 84:
                                        Ue = 0, o[w >> 2] = 255 & o[N >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> 8, o[g >> 2] = (0 | o[g >> 2]) - 8, Ue = 85;
                                        continue e;
                                        break;
                                    case 88:
                                        if (Ue = 0, 0 | o[O >> 2]) {
                                            Ue = 89;
                                            continue e
                                        }
                                        Ue = 316;
                                        break;
                                    case 112:
                                        if (Ue = 0, (0 | o[O >> 2]) >>> 0 < 3) {
                                            if ((0 | o[g >> 2]) >>> 0 < (0 | t[1331 + (0 | o[O >> 2]) >> 0]) >>> 0) {
                                                Ue = 114;
                                                continue r
                                            }
                                            Ue = 122;
                                            continue r
                                        }
                                        xe(64 + (0 | o[h >> 2]) + 6976 | 0, 0, 288), o[O >> 2] = 0, Ue = 124;
                                        break;
                                        break;
                                    case 114:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 115;
                                            continue e
                                        }
                                        Ue = 120;
                                        break r;
                                        break;
                                    case 122:
                                        Ue = 0, o[44 + (0 | o[h >> 2]) + (o[O >> 2] << 2) >> 2] = o[N >> 2] & (1 << t[1331 + (0 | o[O >> 2]) >> 0]) - 1, o[N >> 2] = (0 | o[N >> 2]) >>> (0 | t[1331 + (0 | o[O >> 2]) >> 0]), o[g >> 2] = (0 | o[g >> 2]) - (0 | t[1331 + (0 | o[O >> 2]) >> 0]), Qe = 44 + (0 | o[h >> 2]) + (o[O >> 2] << 2) | 0, o[Qe >> 2] = (0 | o[Qe >> 2]) + (0 | o[72 + (o[O >> 2] << 2) >> 2]), o[O >> 2] = 1 + (0 | o[O >> 2]), Ue = 112;
                                        continue r;
                                        break;
                                    case 126:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 127;
                                            continue e
                                        }
                                        Ue = 132;
                                        break r;
                                        break;
                                    case 134:
                                        Ue = 0, o[G >> 2] = 7 & o[N >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> 3, o[g >> 2] = (0 | o[g >> 2]) - 3, t[64 + (0 | o[h >> 2]) + 6976 + (0 | i[1335 + (0 | o[O >> 2]) >> 0]) >> 0] = o[G >> 2], o[O >> 2] = 1 + (0 | o[O >> 2]), Ue = 124;
                                        break;
                                    case 136:
                                        if (Ue = 0, (0 | o[24 + (0 | o[h >> 2]) >> 2]) >= 0) {
                                            o[Q >> 2] = 64 + (0 | o[h >> 2]) + (3488 * (0 | o[24 + (0 | o[h >> 2]) >> 2]) | 0), $e = (Qe = oe) + 64 | 0;
                                            do {
                                                o[Qe >> 2] = 0, Qe = Qe + 4 | 0
                                            } while ((0 | Qe) < (0 | $e));
                                            for (xe(288 + (0 | o[Q >> 2]) | 0, 0, 2048), xe(2336 + (0 | o[Q >> 2]) | 0, 0, 1152), o[$ >> 2] = 0; !((0 | o[$ >> 2]) >>> 0 >= (0 | o[44 + (0 | o[h >> 2]) + (o[24 + (0 | o[h >> 2]) >> 2] << 2) >> 2]) >>> 0);) Qe = oe + (i[(0 | o[Q >> 2]) + (0 | o[$ >> 2]) >> 0] << 2) | 0, o[Qe >> 2] = 1 + (0 | o[Qe >> 2]), o[$ >> 2] = 1 + (0 | o[$ >> 2]);
                                            for (o[ee >> 2] = 0, o[re >> 2] = 0, o[ne + 4 >> 2] = 0, o[ne >> 2] = 0, o[$ >> 2] = 1; !((0 | o[$ >> 2]) >>> 0 > 15);) o[ee >> 2] = (0 | o[ee >> 2]) + (0 | o[oe + (o[$ >> 2] << 2) >> 2]), Qe = (0 | o[re >> 2]) + (0 | o[oe + (o[$ >> 2] << 2) >> 2]) << 1, o[re >> 2] = Qe, o[ne + (1 + (0 | o[$ >> 2]) << 2) >> 2] = Qe, o[$ >> 2] = 1 + (0 | o[$ >> 2]);
                                            if (65536 != (0 | o[re >> 2]) & (0 | o[ee >> 2]) >>> 0 > 1) {
                                                Ue = 144;
                                                continue e
                                            }
                                            for (o[q >> 2] = -1, o[te >> 2] = 0; !((0 | o[te >> 2]) >>> 0 >= (0 | o[44 + (0 | o[h >> 2]) + (o[24 + (0 | o[h >> 2]) >> 2] << 2) >> 2]) >>> 0);) {
                                                o[ie >> 2] = 0, o[ue >> 2] = i[(0 | o[Q >> 2]) + (0 | o[te >> 2]) >> 0];
                                                t: do {
                                                    if (0 | o[ue >> 2]) {
                                                        for (Qe = ne + (o[ue >> 2] << 2) | 0, $e = 0 | o[Qe >> 2], o[Qe >> 2] = $e + 1, o[se >> 2] = $e, o[ae >> 2] = o[ue >> 2]; !((0 | o[ae >> 2]) >>> 0 <= 0);) o[ie >> 2] = o[ie >> 2] << 1 | 1 & o[se >> 2], o[ae >> 2] = (0 | o[ae >> 2]) - 1, o[se >> 2] = (0 | o[se >> 2]) >>> 1;
                                                        if ((0 | o[ue >> 2]) >>> 0 <= 10)
                                                            for (n[ce >> 1] = o[ue >> 2] << 9 | o[te >> 2];;) {
                                                                if ((0 | o[ie >> 2]) >>> 0 >= 1024) break t;
                                                                n[288 + (0 | o[Q >> 2]) + (o[ie >> 2] << 1) >> 1] = 0 | n[ce >> 1], o[ie >> 2] = (0 | o[ie >> 2]) + (1 << o[ue >> 2])
                                                            }
                                                        for ($e = 0 | n[288 + (0 | o[Q >> 2]) + ((1023 & o[ie >> 2]) << 1) >> 1], o[Z >> 2] = $e, $e || (n[288 + (0 | o[Q >> 2]) + ((1023 & o[ie >> 2]) << 1) >> 1] = o[q >> 2], o[Z >> 2] = o[q >> 2], o[q >> 2] = (0 | o[q >> 2]) - 2), o[ie >> 2] = (0 | o[ie >> 2]) >>> 9, o[J >> 2] = o[ue >> 2]; $e = (0 | o[J >> 2]) >>> 0 > 11, Qe = (0 | o[ie >> 2]) >>> 1, o[ie >> 2] = Qe, o[Z >> 2] = (0 | o[Z >> 2]) - (1 & Qe), $e;) 0 | n[2336 + (0 | o[Q >> 2]) + (0 - (0 | o[Z >> 2]) - 1 << 1) >> 1] ? o[Z >> 2] = n[2336 + (0 | o[Q >> 2]) + (0 - (0 | o[Z >> 2]) - 1 << 1) >> 1] : (n[2336 + (0 | o[Q >> 2]) + (0 - (0 | o[Z >> 2]) - 1 << 1) >> 1] = o[q >> 2], o[Z >> 2] = o[q >> 2], o[q >> 2] = (0 | o[q >> 2]) - 2), o[J >> 2] = (0 | o[J >> 2]) - 1;
                                                        n[2336 + (0 | o[Q >> 2]) + (0 - (0 | o[Z >> 2]) - 1 << 1) >> 1] = o[te >> 2]
                                                    }
                                                } while (0);
                                                o[te >> 2] = 1 + (0 | o[te >> 2])
                                            }
                                            2 == (0 | o[24 + (0 | o[h >> 2]) >> 2]) ? (o[O >> 2] = 0, Ue = 167) : Ue = 210
                                        } else Ue = 211;
                                        break;
                                    case 170:
                                        if (Ue = 0, o[fe >> 2] = n[64 + (0 | o[h >> 2]) + 6976 + 288 + ((1023 & o[N >> 2]) << 1) >> 1], (0 | o[fe >> 2]) >= 0) {
                                            if (o[de >> 2] = o[fe >> 2] >> 9, !(0 | o[de >> 2])) {
                                                Ue = 178;
                                                break r
                                            }
                                            if ((0 | o[g >> 2]) >>> 0 >= (0 | o[de >> 2]) >>> 0) {
                                                Ue = 187;
                                                continue r
                                            }
                                            Ue = 178;
                                            break r
                                        }
                                        if ((0 | o[g >> 2]) >>> 0 <= 10) {
                                            Ue = 178;
                                            break r
                                        }
                                        o[de >> 2] = 10;
                                        do {
                                            if ($e = ~o[fe >> 2], Qe = 0 | o[N >> 2], Ke = 0 | o[de >> 2], o[de >> 2] = Ke + 1, o[fe >> 2] = n[64 + (0 | o[h >> 2]) + 6976 + 2336 + ($e + (Qe >>> Ke & 1) << 1) >> 1], (0 | o[fe >> 2]) >= 0) break
                                        } while ((0 | o[g >> 2]) >>> 0 >= (1 + (0 | o[de >> 2]) | 0) >>> 0);
                                        if ((0 | o[fe >> 2]) >= 0) {
                                            Ue = 187;
                                            continue r
                                        }
                                        Ue = 178;
                                        break r;
                                        break;
                                    case 187:
                                        if (Ue = 0, Ke = 0 | n[64 + (0 | o[h >> 2]) + 6976 + 288 + ((1023 & o[N >> 2]) << 1) >> 1], o[fe >> 2] = Ke, (0 | Ke) >= 0) o[de >> 2] = o[fe >> 2] >> 9, o[fe >> 2] = 511 & o[fe >> 2];
                                        else {
                                            o[de >> 2] = 10;
                                            do {
                                                Ke = ~o[fe >> 2], Qe = 0 | o[N >> 2], $e = 0 | o[de >> 2], o[de >> 2] = $e + 1, o[fe >> 2] = n[64 + (0 | o[h >> 2]) + 6976 + 2336 + (Ke + (Qe >>> $e & 1) << 1) >> 1]
                                            } while ((0 | o[fe >> 2]) < 0)
                                        }
                                        if (o[w >> 2] = o[fe >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> (0 | o[de >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (0 | o[de >> 2]), $e = 0 | o[w >> 2], (0 | o[w >> 2]) >>> 0 < 16) {
                                            Qe = 0 | o[O >> 2], o[O >> 2] = Qe + 1, t[10532 + (0 | o[h >> 2]) + Qe >> 0] = $e, Ue = 167;
                                            break
                                        }
                                        if (!(16 != (0 | $e) | 0 != (0 | o[O >> 2]))) {
                                            Ue = 194;
                                            continue e
                                        }
                                        if (o[R >> 2] = t[(0 | o[w >> 2]) - 16 + 1354 >> 0], (0 | o[g >> 2]) >>> 0 < (0 | o[R >> 2]) >>> 0) {
                                            Ue = 196;
                                            continue r
                                        }
                                        Ue = 204;
                                        continue r;
                                        break;
                                    case 196:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 197;
                                            continue e
                                        }
                                        Ue = 202;
                                        break r;
                                        break;
                                    case 204:
                                        Ue = 0, o[le >> 2] = o[N >> 2] & (1 << o[R >> 2]) - 1, o[N >> 2] = (0 | o[N >> 2]) >>> (0 | o[R >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (0 | o[R >> 2]), o[le >> 2] = (0 | o[le >> 2]) + (0 | t[(0 | o[w >> 2]) - 16 + 1358 >> 0]), er = 16 == (0 | o[w >> 2]) ? 0 | i[10532 + (0 | o[h >> 2]) + ((0 | o[O >> 2]) - 1) >> 0] : 0, xe(10532 + (0 | o[h >> 2]) + (0 | o[O >> 2]) | 0, 255 & er | 0, 0 | o[le >> 2]), o[O >> 2] = (0 | o[O >> 2]) + (0 | o[le >> 2]), Ue = 167;
                                        break;
                                    case 212:
                                        if (Ue = 0, ((0 | o[C >> 2]) - (0 | o[P >> 2]) | 0) >= 4 && ((0 | o[L >> 2]) - (0 | o[D >> 2]) | 0) >= 2) {
                                            if ((0 | o[g >> 2]) >>> 0 < 15 && (o[N >> 2] = o[N >> 2] | (i[o[P >> 2] >> 0] | i[1 + (0 | o[P >> 2]) >> 0] << 8) << o[g >> 2], o[P >> 2] = 2 + (0 | o[P >> 2]), o[g >> 2] = 16 + (0 | o[g >> 2])), $e = 0 | n[64 + (0 | o[h >> 2]) + 288 + ((1023 & o[N >> 2]) << 1) >> 1], o[be >> 2] = $e, (0 | $e) >= 0) o[ke >> 2] = o[be >> 2] >> 9;
                                            else {
                                                o[ke >> 2] = 10;
                                                do {
                                                    $e = ~o[be >> 2], Qe = 0 | o[N >> 2], Ke = 0 | o[ke >> 2], o[ke >> 2] = Ke + 1, o[be >> 2] = n[64 + (0 | o[h >> 2]) + 2336 + ($e + (Qe >>> Ke & 1) << 1) >> 1]
                                                } while ((0 | o[be >> 2]) < 0)
                                            }
                                            if (o[O >> 2] = o[be >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> (0 | o[ke >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (0 | o[ke >> 2]), 256 & o[O >> 2] | 0) {
                                                Ue = 257;
                                                break
                                            }
                                            if ((0 | o[g >> 2]) >>> 0 < 15 && (o[N >> 2] = o[N >> 2] | (i[o[P >> 2] >> 0] | i[1 + (0 | o[P >> 2]) >> 0] << 8) << o[g >> 2], o[P >> 2] = 2 + (0 | o[P >> 2]), o[g >> 2] = 16 + (0 | o[g >> 2])), Ke = 0 | n[64 + (0 | o[h >> 2]) + 288 + ((1023 & o[N >> 2]) << 1) >> 1], o[be >> 2] = Ke, (0 | Ke) >= 0) o[ke >> 2] = o[be >> 2] >> 9;
                                            else {
                                                o[ke >> 2] = 10;
                                                do {
                                                    Ke = ~o[be >> 2], Qe = 0 | o[N >> 2], $e = 0 | o[ke >> 2], o[ke >> 2] = $e + 1, o[be >> 2] = n[64 + (0 | o[h >> 2]) + 2336 + (Ke + (Qe >>> $e & 1) << 1) >> 1]
                                                } while ((0 | o[be >> 2]) < 0)
                                            }
                                            if (o[N >> 2] = (0 | o[N >> 2]) >>> (0 | o[ke >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (0 | o[ke >> 2]), t[o[D >> 2] >> 0] = o[O >> 2], 256 & o[be >> 2] | 0) {
                                                o[D >> 2] = 1 + (0 | o[D >> 2]), o[O >> 2] = o[be >> 2], Ue = 257;
                                                break
                                            }
                                            t[1 + (0 | o[D >> 2]) >> 0] = o[be >> 2], o[D >> 2] = 2 + (0 | o[D >> 2]), Ue = 212;
                                            continue r
                                        }
                                        if ((0 | o[g >> 2]) >>> 0 >= 15) {
                                            Ue = 233;
                                            continue r
                                        }
                                        if (((0 | o[C >> 2]) - (0 | o[P >> 2]) | 0) < 2) {
                                            Ue = 216;
                                            continue r
                                        }
                                        o[N >> 2] = o[N >> 2] | i[o[P >> 2] >> 0] << o[g >> 2] | i[1 + (0 | o[P >> 2]) >> 0] << 8 + (0 | o[g >> 2]), o[P >> 2] = 2 + (0 | o[P >> 2]), o[g >> 2] = 16 + (0 | o[g >> 2]), Ue = 233;
                                        continue r;
                                        break;
                                    case 216:
                                        if (Ue = 0, o[me >> 2] = n[64 + (0 | o[h >> 2]) + 288 + ((1023 & o[N >> 2]) << 1) >> 1], (0 | o[me >> 2]) >= 0) {
                                            if (o[he >> 2] = o[me >> 2] >> 9, !(0 | o[he >> 2])) {
                                                Ue = 224;
                                                break r
                                            }
                                            if ((0 | o[g >> 2]) >>> 0 >= (0 | o[he >> 2]) >>> 0) {
                                                Ue = 233;
                                                continue r
                                            }
                                            Ue = 224;
                                            break r
                                        }
                                        if ((0 | o[g >> 2]) >>> 0 <= 10) {
                                            Ue = 224;
                                            break r
                                        }
                                        o[he >> 2] = 10;
                                        do {
                                            if ($e = ~o[me >> 2], Qe = 0 | o[N >> 2], Ke = 0 | o[he >> 2], o[he >> 2] = Ke + 1, o[me >> 2] = n[64 + (0 | o[h >> 2]) + 2336 + ($e + (Qe >>> Ke & 1) << 1) >> 1], (0 | o[me >> 2]) >= 0) break
                                        } while ((0 | o[g >> 2]) >>> 0 >= (1 + (0 | o[he >> 2]) | 0) >>> 0);
                                        if ((0 | o[me >> 2]) >= 0) {
                                            Ue = 233;
                                            continue r
                                        }
                                        Ue = 224;
                                        break r;
                                        break;
                                    case 233:
                                        if (Ue = 0, Ke = 0 | n[64 + (0 | o[h >> 2]) + 288 + ((1023 & o[N >> 2]) << 1) >> 1], o[me >> 2] = Ke, (0 | Ke) >= 0) o[he >> 2] = o[me >> 2] >> 9, o[me >> 2] = 511 & o[me >> 2];
                                        else {
                                            o[he >> 2] = 10;
                                            do {
                                                Ke = ~o[me >> 2], Qe = 0 | o[N >> 2], $e = 0 | o[he >> 2], o[he >> 2] = $e + 1, o[me >> 2] = n[64 + (0 | o[h >> 2]) + 2336 + (Ke + (Qe >>> $e & 1) << 1) >> 1]
                                            } while ((0 | o[me >> 2]) < 0)
                                        }
                                        if (o[O >> 2] = o[me >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> (0 | o[he >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (0 | o[he >> 2]), !((0 | o[O >> 2]) >>> 0 >= 256)) {
                                            Ue = 238;
                                            continue e
                                        }
                                        Ue = 257;
                                        break;
                                    case 260:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 261;
                                            continue e
                                        }
                                        Ue = 266;
                                        break r;
                                        break;
                                    case 268:
                                        Ue = 0, o[Ae >> 2] = o[N >> 2] & (1 << o[R >> 2]) - 1, o[N >> 2] = (0 | o[N >> 2]) >>> (0 | o[R >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (0 | o[R >> 2]), o[O >> 2] = (0 | o[O >> 2]) + (0 | o[Ae >> 2]), Ue = 269;
                                        break;
                                    case 271:
                                        if (Ue = 0, o[ve >> 2] = n[64 + (0 | o[h >> 2]) + 3488 + 288 + ((1023 & o[N >> 2]) << 1) >> 1], (0 | o[ve >> 2]) >= 0) {
                                            if (o[Me >> 2] = o[ve >> 2] >> 9, !(0 | o[Me >> 2])) {
                                                Ue = 279;
                                                break r
                                            }
                                            if ((0 | o[g >> 2]) >>> 0 >= (0 | o[Me >> 2]) >>> 0) {
                                                Ue = 288;
                                                continue r
                                            }
                                            Ue = 279;
                                            break r
                                        }
                                        if ((0 | o[g >> 2]) >>> 0 <= 10) {
                                            Ue = 279;
                                            break r
                                        }
                                        o[Me >> 2] = 10;
                                        do {
                                            if ($e = ~o[ve >> 2], Qe = 0 | o[N >> 2], Ke = 0 | o[Me >> 2], o[Me >> 2] = Ke + 1, o[ve >> 2] = n[64 + (0 | o[h >> 2]) + 3488 + 2336 + ($e + (Qe >>> Ke & 1) << 1) >> 1], (0 | o[ve >> 2]) >= 0) break
                                        } while ((0 | o[g >> 2]) >>> 0 >= (1 + (0 | o[Me >> 2]) | 0) >>> 0);
                                        if ((0 | o[ve >> 2]) >= 0) {
                                            Ue = 288;
                                            continue r
                                        }
                                        Ue = 279;
                                        break r;
                                        break;
                                    case 288:
                                        if (Ue = 0, Ke = 0 | n[64 + (0 | o[h >> 2]) + 3488 + 288 + ((1023 & o[N >> 2]) << 1) >> 1], o[ve >> 2] = Ke, (0 | Ke) >= 0) o[Me >> 2] = o[ve >> 2] >> 9, o[ve >> 2] = 511 & o[ve >> 2];
                                        else {
                                            o[Me >> 2] = 10;
                                            do {
                                                Ke = ~o[ve >> 2], Qe = 0 | o[N >> 2], $e = 0 | o[Me >> 2], o[Me >> 2] = $e + 1, o[ve >> 2] = n[64 + (0 | o[h >> 2]) + 3488 + 2336 + (Ke + (Qe >>> $e & 1) << 1) >> 1]
                                            } while ((0 | o[ve >> 2]) < 0)
                                        }
                                        if (o[w >> 2] = o[ve >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> (0 | o[Me >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (0 | o[Me >> 2]), o[R >> 2] = o[332 + (o[w >> 2] << 2) >> 2], o[w >> 2] = o[460 + (o[w >> 2] << 2) >> 2], 0 | o[R >> 2]) {
                                            if ((0 | o[g >> 2]) >>> 0 < (0 | o[R >> 2]) >>> 0) {
                                                Ue = 294;
                                                continue r
                                            }
                                            Ue = 302;
                                            continue r
                                        }
                                        Ue = 303;
                                        break;
                                    case 294:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 295;
                                            continue e
                                        }
                                        Ue = 300;
                                        break r;
                                        break;
                                    case 302:
                                        Ue = 0, o[Te >> 2] = o[N >> 2] & (1 << o[R >> 2]) - 1, o[N >> 2] = (0 | o[N >> 2]) >>> (0 | o[R >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (0 | o[R >> 2]), o[w >> 2] = (0 | o[w >> 2]) + (0 | o[Te >> 2]), Ue = 303;
                                        break;
                                    case 307:
                                        if (Ue = 0, $e = 0 | o[O >> 2], o[O >> 2] = $e + -1, 0 | $e) {
                                            Ue = 308;
                                            continue e
                                        }
                                        Ue = 211;
                                        break;
                                    case 319:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 320;
                                            continue e
                                        }
                                        Ue = 325;
                                        break r;
                                        break;
                                    case 327:
                                        Ue = 0, o[N >> 2] = (0 | o[N >> 2]) >>> (7 & o[g >> 2]), o[g >> 2] = (0 | o[g >> 2]) - (7 & o[g >> 2]), o[O >> 2] = 0, Ue = 328;
                                        continue r;
                                        break;
                                    case 328:
                                        if (Ue = 0, (0 | o[O >> 2]) >>> 0 >= 4) {
                                            Ue = 348;
                                            continue e
                                        }
                                        if (!(0 | o[g >> 2])) {
                                            Ue = 340;
                                            break r
                                        }
                                        if ((0 | o[g >> 2]) >>> 0 < 8) {
                                            Ue = 331;
                                            continue r
                                        }
                                        Ue = 339;
                                        continue r;
                                        break;
                                    case 331:
                                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                            Ue = 332;
                                            continue e
                                        }
                                        Ue = 337;
                                        break r;
                                        break;
                                    case 339:
                                        Ue = 0, o[Oe >> 2] = 255 & o[N >> 2], o[N >> 2] = (0 | o[N >> 2]) >>> 8, o[g >> 2] = (0 | o[g >> 2]) - 8, Ue = 347;
                                        continue e;
                                        break
                                }
                                do {
                                    if (124 == (0 | Ue)) {
                                        if (Ue = 0, (0 | o[O >> 2]) >>> 0 < (0 | o[44 + (0 | o[h >> 2]) + 8 >> 2]) >>> 0) {
                                            if ((0 | o[g >> 2]) >>> 0 < 3) {
                                                Ue = 126;
                                                continue r
                                            }
                                            Ue = 134;
                                            continue r
                                        }
                                        o[44 + (0 | o[h >> 2]) + 8 >> 2] = 19, Ue = 136;
                                        continue r
                                    }
                                    if (167 == (0 | Ue)) {
                                        if (Ue = 0, (0 | o[O >> 2]) >>> 0 >= ((0 | o[44 + (0 | o[h >> 2]) >> 2]) + (0 | o[44 + (0 | o[h >> 2]) + 4 >> 2]) | 0) >>> 0) {
                                            if (((0 | o[44 + (0 | o[h >> 2]) >> 2]) + (0 | o[44 + (0 | o[h >> 2]) + 4 >> 2]) | 0) != (0 | o[O >> 2])) {
                                                Ue = 208;
                                                continue e
                                            }
                                            je(64 + (0 | o[h >> 2]) | 0, 10532 + (0 | o[h >> 2]) | 0, 0 | o[44 + (0 | o[h >> 2]) >> 2]), je(64 + (0 | o[h >> 2]) + 3488 | 0, 10532 + (0 | o[h >> 2]) + (0 | o[44 + (0 | o[h >> 2]) >> 2]) | 0, 0 | o[44 + (0 | o[h >> 2]) + 4 >> 2]), Ue = 210;
                                            break
                                        }
                                        if ((0 | o[g >> 2]) >>> 0 >= 15) {
                                            Ue = 187;
                                            continue r
                                        }
                                        if (((0 | o[C >> 2]) - (0 | o[P >> 2]) | 0) < 2) {
                                            Ue = 170;
                                            continue r
                                        }
                                        o[N >> 2] = o[N >> 2] | i[o[P >> 2] >> 0] << o[g >> 2] | i[1 + (0 | o[P >> 2]) >> 0] << 8 + (0 | o[g >> 2]), o[P >> 2] = 2 + (0 | o[P >> 2]), o[g >> 2] = 16 + (0 | o[g >> 2]), Ue = 187;
                                        continue r
                                    }
                                    if (257 == (0 | Ue))
                                        if (Ue = 0, $e = 511 & o[O >> 2], o[O >> 2] = $e, 256 != (0 | $e)) {
                                            if (o[R >> 2] = o[84 + ((0 | o[O >> 2]) - 257 << 2) >> 2], o[O >> 2] = o[208 + ((0 | o[O >> 2]) - 257 << 2) >> 2], 0 | o[R >> 2]) {
                                                if ((0 | o[g >> 2]) >>> 0 < (0 | o[R >> 2]) >>> 0) {
                                                    Ue = 260;
                                                    continue r
                                                }
                                                Ue = 268;
                                                continue r
                                            }
                                            Ue = 269
                                        } else Ue = 316;
                                    else if (303 == (0 | Ue)) {
                                        if (Ue = 0, o[H >> 2] = (0 | o[D >> 2]) - (0 | o[A >> 2]), (0 | o[w >> 2]) >>> 0 > (0 | o[H >> 2]) >>> 0 && 4 & o[v >> 2] | 0) {
                                            Ue = 305;
                                            continue e
                                        }
                                        if (o[_e >> 2] = (0 | o[A >> 2]) + ((0 | o[H >> 2]) - (0 | o[w >> 2]) & o[x >> 2]), (((0 | o[D >> 2]) >>> 0 > (0 | o[_e >> 2]) >>> 0 ? 0 | o[D >> 2] : 0 | o[_e >> 2]) + (0 | o[O >> 2]) | 0) >>> 0 > (0 | o[L >> 2]) >>> 0) {
                                            Ue = 307;
                                            continue r
                                        }
                                        do {
                                            t[o[D >> 2] >> 0] = 0 | t[o[_e >> 2] >> 0], t[1 + (0 | o[D >> 2]) >> 0] = 0 | t[1 + (0 | o[_e >> 2]) >> 0], t[2 + (0 | o[D >> 2]) >> 0] = 0 | t[2 + (0 | o[_e >> 2]) >> 0], o[D >> 2] = 3 + (0 | o[D >> 2]), o[_e >> 2] = 3 + (0 | o[_e >> 2]), $e = (0 | o[O >> 2]) - 3 | 0, o[O >> 2] = $e
                                        } while ((0 | $e) > 2);
                                        (0 | o[O >> 2]) > 0 ? (t[o[D >> 2] >> 0] = 0 | t[o[_e >> 2] >> 0], (0 | o[O >> 2]) > 1 && (t[1 + (0 | o[D >> 2]) >> 0] = 0 | t[1 + (0 | o[_e >> 2]) >> 0]), o[D >> 2] = (0 | o[D >> 2]) + (0 | o[O >> 2]), Ue = 211) : Ue = 211
                                    }
                                } while (0);
                                if (210 != (0 | Ue))
                                    if (211 != (0 | Ue))
                                        if (269 != (0 | Ue))
                                            if (316 != (0 | Ue));
                                            else {
                                                if (Ue = 0, 0 != (1 & o[20 + (0 | o[h >> 2]) >> 2] | 0) ^ 1) {
                                                    Ue = 31;
                                                    continue e
                                                }
                                                if (!(1 & o[v >> 2])) {
                                                    Ue = 348;
                                                    continue e
                                                }
                                                if ((0 | o[g >> 2]) >>> 0 < (7 & o[g >> 2]) >>> 0) {
                                                    Ue = 319;
                                                    continue
                                                }
                                                Ue = 327
                                            }
                                else {
                                    if (Ue = 0, (0 | o[g >> 2]) >>> 0 >= 15) {
                                        Ue = 288;
                                        continue
                                    }
                                    if (((0 | o[C >> 2]) - (0 | o[P >> 2]) | 0) < 2) {
                                        Ue = 271;
                                        continue
                                    }
                                    o[N >> 2] = o[N >> 2] | i[o[P >> 2] >> 0] << o[g >> 2] | i[1 + (0 | o[P >> 2]) >> 0] << 8 + (0 | o[g >> 2]), o[P >> 2] = 2 + (0 | o[P >> 2]), o[g >> 2] = 16 + (0 | o[g >> 2]), Ue = 288
                                } else Ue = 0, Ue = 212;
                                else Ue = 0, $e = 24 + (0 | o[h >> 2]) | 0, o[$e >> 2] = (0 | o[$e >> 2]) - 1, Ue = 136
                            }
                            switch (0 | Ue) {
                                case 60:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[Y >> 2] = i[$e >> 0], Ue = 61;
                                    continue e;
                                    break;
                                case 63:
                                    if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                        Ue = 64;
                                        continue e
                                    }
                                    $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, Xe = 0 | t[$e >> 0], Ge = 0 | o[O >> 2], We = 0 | o[h >> 2], Ue = 70;
                                    continue e;
                                    break;
                                case 82:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[z >> 2] = i[$e >> 0], Ue = 83;
                                    continue e;
                                    break;
                                case 120:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[X >> 2] = i[$e >> 0], Ue = 121;
                                    continue e;
                                    break;
                                case 132:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[W >> 2] = i[$e >> 0], Ue = 133;
                                    continue e;
                                    break;
                                case 178:
                                    if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                        Ue = 179;
                                        continue e
                                    }
                                    $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[Se >> 2] = i[$e >> 0], Ue = 185;
                                    continue e;
                                    break;
                                case 202:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[Ee >> 2] = i[$e >> 0], Ue = 203;
                                    continue e;
                                    break;
                                case 224:
                                    if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                        Ue = 225;
                                        continue e
                                    }
                                    $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[pe >> 2] = i[$e >> 0], Ue = 231;
                                    continue e;
                                    break;
                                case 266:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[Fe >> 2] = i[$e >> 0], Ue = 267;
                                    continue e;
                                    break;
                                case 279:
                                    if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                        Ue = 280;
                                        continue e
                                    }
                                    $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[ye >> 2] = i[$e >> 0], Ue = 286;
                                    continue e;
                                    break;
                                case 300:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[ge >> 2] = i[$e >> 0], Ue = 301;
                                    continue e;
                                    break;
                                case 325:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[we >> 2] = i[$e >> 0], Ue = 326;
                                    continue e;
                                    break;
                                case 337:
                                    Ue = 0, $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[Re >> 2] = i[$e >> 0], Ue = 338;
                                    continue e;
                                    break;
                                case 340:
                                    if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                        Ue = 341;
                                        continue e
                                    }
                                    $e = 0 | o[P >> 2], o[P >> 2] = $e + 1, o[Oe >> 2] = i[$e >> 0], Ue = 347;
                                    continue e;
                                    break
                            }
                        } else {
                            if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                                Ue = 43;
                                continue
                            }
                            Qe = 0 | o[P >> 2], o[P >> 2] = Qe + 1, o[U >> 2] = i[Qe >> 0], Ue = 49
                        }
                    }
                    else {
                        if (Ue = 0, (0 | o[P >> 2]) >>> 0 >= (0 | o[C >> 2]) >>> 0) {
                            Ue = 33;
                            continue
                        }
                        Qe = 0 | o[P >> 2], o[P >> 2] = Qe + 1, o[B >> 2] = i[Qe >> 0], Ue = 39
                    }
                }
                if (351 == (0 | Ue)) {
                    for (o[Ne >> 2] = o[He >> 2], o[Pe >> 2] = o[o[F >> 2] >> 2], o[De >> 2] = 65535 & o[28 + (0 | o[h >> 2]) >> 2], o[Le >> 2] = (0 | o[28 + (0 | o[h >> 2]) >> 2]) >>> 16, o[Ie >> 2] = ((0 | o[Pe >> 2]) >>> 0) % 5552 | 0; 0 | o[Pe >> 2];) {
                        for (o[Ce >> 2] = 0; !((7 + (0 | o[Ce >> 2]) | 0) >>> 0 >= (0 | o[Ie >> 2]) >>> 0);) o[De >> 2] = (0 | o[De >> 2]) + (0 | i[o[Ne >> 2] >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[De >> 2] = (0 | o[De >> 2]) + (0 | i[1 + (0 | o[Ne >> 2]) >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[De >> 2] = (0 | o[De >> 2]) + (0 | i[2 + (0 | o[Ne >> 2]) >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[De >> 2] = (0 | o[De >> 2]) + (0 | i[3 + (0 | o[Ne >> 2]) >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[De >> 2] = (0 | o[De >> 2]) + (0 | i[4 + (0 | o[Ne >> 2]) >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[De >> 2] = (0 | o[De >> 2]) + (0 | i[5 + (0 | o[Ne >> 2]) >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[De >> 2] = (0 | o[De >> 2]) + (0 | i[6 + (0 | o[Ne >> 2]) >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[De >> 2] = (0 | o[De >> 2]) + (0 | i[7 + (0 | o[Ne >> 2]) >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[Ce >> 2] = 8 + (0 | o[Ce >> 2]), o[Ne >> 2] = 8 + (0 | o[Ne >> 2]);
                        for (; !((0 | o[Ce >> 2]) >>> 0 >= (0 | o[Ie >> 2]) >>> 0);) He = 0 | o[Ne >> 2], o[Ne >> 2] = He + 1, o[De >> 2] = (0 | o[De >> 2]) + (0 | i[He >> 0]), o[Le >> 2] = (0 | o[Le >> 2]) + (0 | o[De >> 2]), o[Ce >> 2] = 1 + (0 | o[Ce >> 2]);
                        o[De >> 2] = ((0 | o[De >> 2]) >>> 0) % 65521 | 0, o[Le >> 2] = ((0 | o[Le >> 2]) >>> 0) % 65521 | 0, o[Pe >> 2] = (0 | o[Pe >> 2]) - (0 | o[Ie >> 2]), o[Ie >> 2] = 5552
                    }
                    o[28 + (0 | o[h >> 2]) >> 2] = (o[Le >> 2] << 16) + (0 | o[De >> 2]), 0 == (0 | o[T >> 2]) && 1 & o[v >> 2] | 0 && (0 | o[28 + (0 | o[h >> 2]) >> 2]) != (0 | o[16 + (0 | o[h >> 2]) >> 2]) && (o[T >> 2] = -2)
                }
                return o[m >> 2] = o[T >> 2], rr = 0 | o[m >> 2], l = _, 0 | rr
            }
            return o[o[F >> 2] >> 2] = 0, o[o[b >> 2] >> 2] = 0, o[m >> 2] = -3, rr = 0 | o[m >> 2], l = _, 0 | rr
        }

        function z(e) {
            e |= 0;
            var r, t, n, i = 0;
            return r = l, (0 | (l = l + 16 | 0)) >= (0 | f) && k(16), t = r + 4 | 0, o[(n = r) >> 2] = e, 0 | o[n >> 2] ? (0 | o[28 + (0 | o[n >> 2]) >> 2] && (K(0 | o[28 + (0 | o[n >> 2]) >> 2]), o[28 + (0 | o[n >> 2]) >> 2] = 0), o[t >> 2] = 0, i = 0 | o[t >> 2], l = r, 0 | i) : (o[t >> 2] = -2, i = 0 | o[t >> 2], l = r, 0 | i)
        }

        function V(e) {
            e |= 0;
            var r, t = 0,
                n = 0,
                i = 0,
                a = 0,
                s = 0,
                u = 0,
                c = 0,
                d = 0,
                S = 0,
                E = 0,
                _ = 0,
                m = 0,
                h = 0,
                p = 0,
                b = 0,
                A = 0,
                F = 0,
                v = 0,
                M = 0,
                y = 0,
                T = 0,
                g = 0,
                w = 0,
                O = 0,
                R = 0,
                N = 0,
                P = 0,
                C = 0,
                D = 0,
                L = 0,
                I = 0,
                x = 0,
                H = 0,
                B = 0,
                U = 0,
                Y = 0,
                z = 0,
                V = 0,
                K = 0,
                j = 0,
                X = 0,
                W = 0,
                q = 0,
                Z = 0,
                Q = 0,
                $ = 0,
                J = 0,
                ee = 0,
                re = 0,
                te = 0,
                ne = 0,
                oe = 0,
                ie = 0,
                ae = 0,
                se = 0,
                ue = 0,
                ce = 0,
                le = 0,
                fe = 0,
                de = 0,
                Se = 0,
                Ee = 0,
                _e = 0,
                me = 0,
                he = 0,
                pe = 0,
                be = 0,
                ke = 0,
                Ae = 0,
                Fe = 0,
                ve = 0,
                Me = 0,
                ye = 0,
                Te = 0;
            r = l, (0 | (l = l + 16 | 0)) >= (0 | f) && k(16), t = r;
            do {
                if (e >>> 0 < 245) {
                    if (i = (n = e >>> 0 < 11 ? 16 : e + 11 & -8) >>> 3, 3 & (s = (a = 0 | o[948]) >>> i) | 0) return S = 0 | o[(d = (c = 3832 + ((u = (1 & s ^ 1) + i | 0) << 1 << 2) | 0) + 8 | 0) >> 2], (0 | c) == (0 | (_ = 0 | o[(E = S + 8 | 0) >> 2])) ? o[948] = a & ~(1 << u) : (o[_ + 12 >> 2] = c, o[d >> 2] = _), _ = u << 3, o[S + 4 >> 2] = 3 | _, o[(u = S + _ + 4 | 0) >> 2] = 1 | o[u >> 2], l = r, 0 | E;
                    if (n >>> 0 > (E = 0 | o[950]) >>> 0) {
                        if (0 | s) return s = 0 | o[(d = (S = 3832 + ((c = ((u = (i = (u = ((_ = s << i & ((u = 2 << i) | 0 - u)) & 0 - _) - 1 | 0) >>> (_ = u >>> 12 & 16)) >>> 5 & 8) | _ | (i = (s = i >>> u) >>> 2 & 4) | (s = (S = s >>> i) >>> 1 & 2) | (S = (d = S >>> s) >>> 1 & 1)) + (d >>> S) | 0) << 1 << 2) | 0) + 8 | 0) >> 2], (0 | S) == (0 | (_ = 0 | o[(i = s + 8 | 0) >> 2])) ? (u = a & ~(1 << c), o[948] = u, m = u) : (o[_ + 12 >> 2] = S, o[d >> 2] = _, m = a), _ = (c << 3) - n | 0, o[s + 4 >> 2] = 3 | n, o[(c = s + n | 0) + 4 >> 2] = 1 | _, o[c + _ >> 2] = _, 0 | E && (s = 0 | o[953], S = 3832 + ((d = E >>> 3) << 1 << 2) | 0, m & (u = 1 << d) ? (h = 0 | o[(u = S + 8 | 0) >> 2], p = u) : (o[948] = m | u, h = S, p = S + 8 | 0), o[p >> 2] = s, o[h + 12 >> 2] = s, o[s + 8 >> 2] = h, o[s + 12 >> 2] = S), o[950] = _, o[953] = c, l = r, 0 | i;
                        if (i = 0 | o[949]) {
                            if (b = 0 | o[4096 + (((c = (S = (c = (i & 0 - i) - 1 | 0) >>> (_ = c >>> 12 & 16)) >>> 5 & 8) | _ | (S = (s = S >>> c) >>> 2 & 4) | (s = (u = s >>> S) >>> 1 & 2) | (u = (d = u >>> s) >>> 1 & 1)) + (d >>> u) << 2) >> 2], u = (-8 & o[b + 4 >> 2]) - n | 0, d = 0 | o[b + 16 + ((0 == (0 | o[b + 16 >> 2]) & 1) << 2) >> 2])
                                for (s = b, b = u, u = d;;) {
                                    if (_ = (S = (d = (-8 & o[u + 4 >> 2]) - n | 0) >>> 0 < b >>> 0) ? d : b, d = S ? u : s, !(u = 0 | o[u + 16 + ((0 == (0 | o[u + 16 >> 2]) & 1) << 2) >> 2])) {
                                        A = d, F = _;
                                        break
                                    }
                                    s = d, b = _
                                } else A = b, F = u;
                            if (A >>> 0 < (b = A + n | 0) >>> 0) {
                                s = 0 | o[A + 24 >> 2], u = 0 | o[A + 12 >> 2];
                                do {
                                    if ((0 | u) == (0 | A)) {
                                        if (d = 0 | o[(_ = A + 20 | 0) >> 2]) M = d, y = _;
                                        else {
                                            if (!(c = 0 | o[(S = A + 16 | 0) >> 2])) {
                                                v = 0;
                                                break
                                            }
                                            M = c, y = S
                                        }
                                        for (;;)
                                            if (0 | (d = 0 | o[(_ = M + 20 | 0) >> 2])) M = d, y = _;
                                            else {
                                                if (!(d = 0 | o[(_ = M + 16 | 0) >> 2])) break;
                                                M = d, y = _
                                            } o[y >> 2] = 0, v = M
                                    } else _ = 0 | o[A + 8 >> 2], o[_ + 12 >> 2] = u, o[u + 8 >> 2] = _, v = u
                                } while (0);
                                do {
                                    if (0 | s) {
                                        if (u = 0 | o[A + 28 >> 2], (0 | A) == (0 | o[(_ = 4096 + (u << 2) | 0) >> 2])) {
                                            if (o[_ >> 2] = v, !v) {
                                                o[949] = i & ~(1 << u);
                                                break
                                            }
                                        } else if (o[s + 16 + (((0 | o[s + 16 >> 2]) != (0 | A) & 1) << 2) >> 2] = v, !v) break;
                                        o[v + 24 >> 2] = s, 0 | (u = 0 | o[A + 16 >> 2]) && (o[v + 16 >> 2] = u, o[u + 24 >> 2] = v), 0 | (u = 0 | o[A + 20 >> 2]) && (o[v + 20 >> 2] = u, o[u + 24 >> 2] = v)
                                    }
                                } while (0);
                                return F >>> 0 < 16 ? (s = F + n | 0, o[A + 4 >> 2] = 3 | s, o[(i = A + s + 4 | 0) >> 2] = 1 | o[i >> 2]) : (o[A + 4 >> 2] = 3 | n, o[b + 4 >> 2] = 1 | F, o[b + F >> 2] = F, 0 | E && (i = 0 | o[953], u = 3832 + ((s = E >>> 3) << 1 << 2) | 0, a & (_ = 1 << s) ? (T = 0 | o[(_ = u + 8 | 0) >> 2], g = _) : (o[948] = a | _, T = u, g = u + 8 | 0), o[g >> 2] = i, o[T + 12 >> 2] = i, o[i + 8 >> 2] = T, o[i + 12 >> 2] = u), o[950] = F, o[953] = b), l = r, 0 | (A + 8 | 0)
                            }
                            w = n
                        } else w = n
                    } else w = n
                } else if (e >>> 0 <= 4294967231)
                    if (i = -8 & (u = e + 11 | 0), _ = 0 | o[949]) {
                        s = 0 - i | 0, O = (d = u >>> 8) ? i >>> 0 > 16777215 ? 31 : i >>> ((R = 14 - ((d = ((S = d << (u = (d + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4) | u | (S = ((c = S << d) + 245760 | 0) >>> 16 & 2)) + (c << S >>> 15) | 0) + 7 | 0) & 1 | R << 1 : 0, R = 0 | o[4096 + (O << 2) >> 2];
                        e: do {
                            if (R)
                                for (S = 0, c = s, u = R, d = i << (31 == (0 | O) ? 0 : 25 - (O >>> 1) | 0), L = 0;;) {
                                    if ((I = (-8 & o[u + 4 >> 2]) - i | 0) >>> 0 < c >>> 0) {
                                        if (!I) {
                                            x = u, H = 0, B = u, D = 61;
                                            break e
                                        }
                                        U = u, Y = I
                                    } else U = S, Y = c;
                                    if (z = 0 == (0 | (I = 0 | o[u + 20 >> 2])) | (0 | I) == (0 | (u = 0 | o[u + 16 + (d >>> 31 << 2) >> 2])) ? L : I, I = 0 == (0 | u)) {
                                        N = z, P = U, C = Y, D = 57;
                                        break
                                    }
                                    S = U, c = Y, d <<= 1 & (1 ^ I), L = z
                                } else N = 0, P = 0, C = s, D = 57
                        } while (0);
                        if (57 == (0 | D)) {
                            if (0 == (0 | N) & 0 == (0 | P)) {
                                if (!(s = _ & ((R = 2 << O) | 0 - R))) {
                                    w = i;
                                    break
                                }
                                V = 0, K = 0 | o[4096 + (((R = (n = (R = (s & 0 - s) - 1 | 0) >>> (s = R >>> 12 & 16)) >>> 5 & 8) | s | (n = (b = n >>> R) >>> 2 & 4) | (b = (a = b >>> n) >>> 1 & 2) | (a = (E = a >>> b) >>> 1 & 1)) + (E >>> a) << 2) >> 2]
                            } else V = P, K = N;
                            K ? (x = V, H = C, B = K, D = 61) : (j = V, X = C)
                        }
                        if (61 == (0 | D))
                            for (;;) {
                                if (D = 0, b = (E = (a = (-8 & o[B + 4 >> 2]) - i | 0) >>> 0 < H >>> 0) ? a : H, a = E ? B : x, !(B = 0 | o[B + 16 + ((0 == (0 | o[B + 16 >> 2]) & 1) << 2) >> 2])) {
                                    j = a, X = b;
                                    break
                                }
                                x = a, H = b, D = 61
                            }
                        if (0 != (0 | j) && X >>> 0 < ((0 | o[950]) - i | 0) >>> 0) {
                            if (j >>> 0 >= (b = j + i | 0) >>> 0) return l = r, 0 | 0;
                            a = 0 | o[j + 24 >> 2], E = 0 | o[j + 12 >> 2];
                            do {
                                if ((0 | E) == (0 | j)) {
                                    if (s = 0 | o[(n = j + 20 | 0) >> 2]) q = s, Z = n;
                                    else {
                                        if (!(L = 0 | o[(R = j + 16 | 0) >> 2])) {
                                            W = 0;
                                            break
                                        }
                                        q = L, Z = R
                                    }
                                    for (;;)
                                        if (0 | (s = 0 | o[(n = q + 20 | 0) >> 2])) q = s, Z = n;
                                        else {
                                            if (!(s = 0 | o[(n = q + 16 | 0) >> 2])) break;
                                            q = s, Z = n
                                        } o[Z >> 2] = 0, W = q
                                } else n = 0 | o[j + 8 >> 2], o[n + 12 >> 2] = E, o[E + 8 >> 2] = n, W = E
                            } while (0);
                            do {
                                if (a) {
                                    if (E = 0 | o[j + 28 >> 2], (0 | j) == (0 | o[(n = 4096 + (E << 2) | 0) >> 2])) {
                                        if (o[n >> 2] = W, !W) {
                                            n = _ & ~(1 << E), o[949] = n, Q = n;
                                            break
                                        }
                                    } else if (o[a + 16 + (((0 | o[a + 16 >> 2]) != (0 | j) & 1) << 2) >> 2] = W, !W) {
                                        Q = _;
                                        break
                                    }
                                    o[W + 24 >> 2] = a, 0 | (n = 0 | o[j + 16 >> 2]) && (o[W + 16 >> 2] = n, o[n + 24 >> 2] = W), (n = 0 | o[j + 20 >> 2]) ? (o[W + 20 >> 2] = n, o[n + 24 >> 2] = W, Q = _) : Q = _
                                } else Q = _
                            } while (0);
                            do {
                                if (X >>> 0 >= 16) {
                                    if (o[j + 4 >> 2] = 3 | i, o[b + 4 >> 2] = 1 | X, o[b + X >> 2] = X, _ = X >>> 3, X >>> 0 < 256) {
                                        a = 3832 + (_ << 1 << 2) | 0, (n = 0 | o[948]) & (E = 1 << _) ? ($ = 0 | o[(E = a + 8 | 0) >> 2], J = E) : (o[948] = n | E, $ = a, J = a + 8 | 0), o[J >> 2] = b, o[$ + 12 >> 2] = b, o[b + 8 >> 2] = $, o[b + 12 >> 2] = a;
                                        break
                                    }
                                    if (ee = (a = X >>> 8) ? X >>> 0 > 16777215 ? 31 : X >>> ((s = 14 - ((a = ((n = a << (E = (a + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4) | E | (n = ((_ = n << a) + 245760 | 0) >>> 16 & 2)) + (_ << n >>> 15) | 0) + 7 | 0) & 1 | s << 1 : 0, s = 4096 + (ee << 2) | 0, o[b + 28 >> 2] = ee, o[(n = b + 16 | 0) + 4 >> 2] = 0, o[n >> 2] = 0, !(Q & (n = 1 << ee))) {
                                        o[949] = Q | n, o[s >> 2] = b, o[b + 24 >> 2] = s, o[b + 12 >> 2] = b, o[b + 8 >> 2] = b;
                                        break
                                    }
                                    for (n = X << (31 == (0 | ee) ? 0 : 25 - (ee >>> 1) | 0), _ = 0 | o[s >> 2];;) {
                                        if ((-8 & o[_ + 4 >> 2] | 0) == (0 | X)) {
                                            D = 97;
                                            break
                                        }
                                        if (!(s = 0 | o[(re = _ + 16 + (n >>> 31 << 2) | 0) >> 2])) {
                                            D = 96;
                                            break
                                        }
                                        n <<= 1, _ = s
                                    }
                                    if (96 == (0 | D)) {
                                        o[re >> 2] = b, o[b + 24 >> 2] = _, o[b + 12 >> 2] = b, o[b + 8 >> 2] = b;
                                        break
                                    }
                                    if (97 == (0 | D)) {
                                        s = 0 | o[(n = _ + 8 | 0) >> 2], o[s + 12 >> 2] = b, o[n >> 2] = b, o[b + 8 >> 2] = s, o[b + 12 >> 2] = _, o[b + 24 >> 2] = 0;
                                        break
                                    }
                                } else s = X + i | 0, o[j + 4 >> 2] = 3 | s, o[(n = j + s + 4 | 0) >> 2] = 1 | o[n >> 2]
                            } while (0);
                            return l = r, 0 | (j + 8 | 0)
                        }
                        w = i
                    } else w = i;
                else w = -1
            } while (0);
            if ((j = 0 | o[950]) >>> 0 >= w >>> 0) return X = j - w | 0, re = 0 | o[953], X >>> 0 > 15 ? (ee = re + w | 0, o[953] = ee, o[950] = X, o[ee + 4 >> 2] = 1 | X, o[ee + X >> 2] = X, o[re + 4 >> 2] = 3 | w) : (o[950] = 0, o[953] = 0, o[re + 4 >> 2] = 3 | j, o[(X = re + j + 4 | 0) >> 2] = 1 | o[X >> 2]), l = r, 0 | (re + 8 | 0);
            if ((re = 0 | o[951]) >>> 0 > w >>> 0) return X = re - w | 0, o[951] = X, ee = (j = 0 | o[954]) + w | 0, o[954] = ee, o[ee + 4 >> 2] = 1 | X, o[j + 4 >> 2] = 3 | w, l = r, 0 | (j + 8 | 0);
            if (0 | o[1066] ? te = 0 | o[1068] : (o[1068] = 4096, o[1067] = 4096, o[1069] = -1, o[1070] = -1, o[1071] = 0, o[1059] = 0, j = -16 & t ^ 1431655768, o[t >> 2] = j, o[1066] = j, te = 4096), j = w + 48 | 0, (te = (X = te + (t = w + 47 | 0) | 0) & (ee = 0 - te | 0)) >>> 0 <= w >>> 0) return l = r, 0 | 0;
            if (0 | (Q = 0 | o[1058]) && (J = ($ = 0 | o[1056]) + te | 0) >>> 0 <= $ >>> 0 | J >>> 0 > Q >>> 0) return l = r, 0 | 0;
            e: do {
                if (4 & o[1059]) ce = 0, D = 133;
                else {
                    Q = 0 | o[954];
                    r: do {
                        if (Q) {
                            for (J = 4240; !(($ = 0 | o[J >> 2]) >>> 0 <= Q >>> 0 && ($ + (0 | o[(ne = J + 4 | 0) >> 2]) | 0) >>> 0 > Q >>> 0);) {
                                if (!($ = 0 | o[J + 8 >> 2])) {
                                    D = 118;
                                    break r
                                }
                                J = $
                            }
                            if ((_ = X - re & ee) >>> 0 < 2147483647)
                                if ((0 | ($ = 0 | Ve(0 | _))) == ((0 | o[J >> 2]) + (0 | o[ne >> 2]) | 0)) {
                                    if (-1 != (0 | $)) {
                                        ie = _, ae = $, D = 135;
                                        break e
                                    }
                                    oe = _
                                } else se = $, ue = _, D = 126;
                            else oe = 0
                        } else D = 118
                    } while (0);
                    do {
                        if (118 == (0 | D))
                            if (-1 != (0 | (Q = 0 | Ve(0))) && (i = Q, _ = (W = (0 == (($ = (_ = 0 | o[1067]) + -1 | 0) & i | 0) ? 0 : ($ + i & 0 - _) - i | 0) + te | 0) + (i = 0 | o[1056]) | 0, W >>> 0 > w >>> 0 & W >>> 0 < 2147483647)) {
                                if (0 | ($ = 0 | o[1058]) && _ >>> 0 <= i >>> 0 | _ >>> 0 > $ >>> 0) {
                                    oe = 0;
                                    break
                                }
                                if ((0 | ($ = 0 | Ve(0 | W))) == (0 | Q)) {
                                    ie = W, ae = Q, D = 135;
                                    break e
                                }
                                se = $, ue = W, D = 126
                            } else oe = 0
                    } while (0);
                    do {
                        if (126 == (0 | D)) {
                            if (W = 0 - ue | 0, !(j >>> 0 > ue >>> 0 & ue >>> 0 < 2147483647 & -1 != (0 | se))) {
                                if (-1 == (0 | se)) {
                                    oe = 0;
                                    break
                                }
                                ie = ue, ae = se, D = 135;
                                break e
                            }
                            if ((Q = t - ue + ($ = 0 | o[1068]) & 0 - $) >>> 0 >= 2147483647) {
                                ie = ue, ae = se, D = 135;
                                break e
                            }
                            if (-1 == (0 | Ve(0 | Q))) {
                                Ve(0 | W), oe = 0;
                                break
                            }
                            ie = Q + ue | 0, ae = se, D = 135;
                            break e
                        }
                    } while (0);
                    o[1059] = 4 | o[1059], ce = oe, D = 133
                }
            } while (0);
            if (133 == (0 | D) && te >>> 0 < 2147483647 && !(-1 == (0 | (oe = 0 | Ve(0 | te))) | 1 ^ (ue = (se = (te = 0 | Ve(0)) - oe | 0) >>> 0 > (w + 40 | 0) >>> 0) | oe >>> 0 < te >>> 0 & -1 != (0 | oe) & -1 != (0 | te) ^ 1) && (ie = ue ? se : ce, ae = oe, D = 135), 135 == (0 | D)) {
                oe = (0 | o[1056]) + ie | 0, o[1056] = oe, oe >>> 0 > (0 | o[1057]) >>> 0 && (o[1057] = oe), oe = 0 | o[954];
                do {
                    if (oe) {
                        for (ce = 4240;;) {
                            if ((0 | ae) == ((le = 0 | o[ce >> 2]) + (de = 0 | o[(fe = ce + 4 | 0) >> 2]) | 0)) {
                                D = 145;
                                break
                            }
                            if (!(se = 0 | o[ce + 8 >> 2])) break;
                            ce = se
                        }
                        if (145 == (0 | D) && 0 == (8 & o[ce + 12 >> 2] | 0) && oe >>> 0 < ae >>> 0 & oe >>> 0 >= le >>> 0) {
                            o[fe >> 2] = de + ie, se = oe + (ue = 0 == (7 & (se = oe + 8 | 0) | 0) ? 0 : 0 - se & 7) | 0, te = (0 | o[951]) + (ie - ue) | 0, o[954] = se, o[951] = te, o[se + 4 >> 2] = 1 | te, o[se + te + 4 >> 2] = 40, o[955] = o[1070];
                            break
                        }
                        for (ae >>> 0 < (0 | o[952]) >>> 0 && (o[952] = ae), te = ae + ie | 0, se = 4240;;) {
                            if ((0 | o[se >> 2]) == (0 | te)) {
                                D = 153;
                                break
                            }
                            if (!(ue = 0 | o[se + 8 >> 2])) break;
                            se = ue
                        }
                        if (153 == (0 | D) && 0 == (8 & o[se + 12 >> 2] | 0)) {
                            o[se >> 2] = ae, o[(ce = se + 4 | 0) >> 2] = (0 | o[ce >> 2]) + ie, ue = ae + (0 == (7 & (ce = ae + 8 | 0) | 0) ? 0 : 0 - ce & 7) | 0, t = te + (0 == (7 & (ce = te + 8 | 0) | 0) ? 0 : 0 - ce & 7) | 0, ce = ue + w | 0, j = t - ue - w | 0, o[ue + 4 >> 2] = 3 | w;
                            do {
                                if ((0 | t) != (0 | oe)) {
                                    if ((0 | t) == (0 | o[953])) {
                                        ne = (0 | o[950]) + j | 0, o[950] = ne, o[953] = ce, o[ce + 4 >> 2] = 1 | ne, o[ce + ne >> 2] = ne;
                                        break
                                    }
                                    if (1 == (3 & (ne = 0 | o[t + 4 >> 2]) | 0)) {
                                        ee = -8 & ne, re = ne >>> 3;
                                        e: do {
                                            if (ne >>> 0 < 256) {
                                                if (X = 0 | o[t + 8 >> 2], (0 | (Q = 0 | o[t + 12 >> 2])) == (0 | X)) {
                                                    o[948] = o[948] & ~(1 << re);
                                                    break
                                                }
                                                o[X + 12 >> 2] = Q, o[Q + 8 >> 2] = X;
                                                break
                                            }
                                            X = 0 | o[t + 24 >> 2], Q = 0 | o[t + 12 >> 2];
                                            do {
                                                if ((0 | Q) == (0 | t)) {
                                                    if (_ = 0 | o[($ = (W = t + 16 | 0) + 4 | 0) >> 2]) Ee = _, _e = $;
                                                    else {
                                                        if (!(i = 0 | o[W >> 2])) {
                                                            Se = 0;
                                                            break
                                                        }
                                                        Ee = i, _e = W
                                                    }
                                                    for (;;)
                                                        if (0 | (_ = 0 | o[($ = Ee + 20 | 0) >> 2])) Ee = _, _e = $;
                                                        else {
                                                            if (!(_ = 0 | o[($ = Ee + 16 | 0) >> 2])) break;
                                                            Ee = _, _e = $
                                                        } o[_e >> 2] = 0, Se = Ee
                                                } else $ = 0 | o[t + 8 >> 2], o[$ + 12 >> 2] = Q, o[Q + 8 >> 2] = $, Se = Q
                                            } while (0);
                                            if (!X) break;
                                            $ = 4096 + ((Q = 0 | o[t + 28 >> 2]) << 2) | 0;
                                            do {
                                                if ((0 | t) == (0 | o[$ >> 2])) {
                                                    if (o[$ >> 2] = Se, 0 | Se) break;
                                                    o[949] = o[949] & ~(1 << Q);
                                                    break e
                                                }
                                                if (o[X + 16 + (((0 | o[X + 16 >> 2]) != (0 | t) & 1) << 2) >> 2] = Se, !Se) break e
                                            } while (0);
                                            if (o[Se + 24 >> 2] = X, 0 | ($ = 0 | o[(Q = t + 16 | 0) >> 2]) && (o[Se + 16 >> 2] = $, o[$ + 24 >> 2] = Se), !($ = 0 | o[Q + 4 >> 2])) break;
                                            o[Se + 20 >> 2] = $, o[$ + 24 >> 2] = Se
                                        } while (0);
                                        me = t + ee | 0, he = ee + j | 0
                                    } else me = t, he = j;
                                    if (o[(re = me + 4 | 0) >> 2] = -2 & o[re >> 2], o[ce + 4 >> 2] = 1 | he, o[ce + he >> 2] = he, re = he >>> 3, he >>> 0 < 256) {
                                        ne = 3832 + (re << 1 << 2) | 0, (J = 0 | o[948]) & ($ = 1 << re) ? (pe = 0 | o[($ = ne + 8 | 0) >> 2], be = $) : (o[948] = J | $, pe = ne, be = ne + 8 | 0), o[be >> 2] = ce, o[pe + 12 >> 2] = ce, o[ce + 8 >> 2] = pe, o[ce + 12 >> 2] = ne;
                                        break
                                    }
                                    ne = he >>> 8;
                                    do {
                                        if (ne) {
                                            if (he >>> 0 > 16777215) {
                                                ke = 31;
                                                break
                                            }
                                            ke = he >>> ((_ = 14 - ((re = ((J = ne << ($ = (ne + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4) | $ | (J = ((Q = J << re) + 245760 | 0) >>> 16 & 2)) + (Q << J >>> 15) | 0) + 7 | 0) & 1 | _ << 1
                                        } else ke = 0
                                    } while (0);
                                    if (ne = 4096 + (ke << 2) | 0, o[ce + 28 >> 2] = ke, o[(ee = ce + 16 | 0) + 4 >> 2] = 0, o[ee >> 2] = 0, !((ee = 0 | o[949]) & (_ = 1 << ke))) {
                                        o[949] = ee | _, o[ne >> 2] = ce, o[ce + 24 >> 2] = ne, o[ce + 12 >> 2] = ce, o[ce + 8 >> 2] = ce;
                                        break
                                    }
                                    for (_ = he << (31 == (0 | ke) ? 0 : 25 - (ke >>> 1) | 0), ee = 0 | o[ne >> 2];;) {
                                        if ((-8 & o[ee + 4 >> 2] | 0) == (0 | he)) {
                                            D = 194;
                                            break
                                        }
                                        if (!(ne = 0 | o[(Ae = ee + 16 + (_ >>> 31 << 2) | 0) >> 2])) {
                                            D = 193;
                                            break
                                        }
                                        _ <<= 1, ee = ne
                                    }
                                    if (193 == (0 | D)) {
                                        o[Ae >> 2] = ce, o[ce + 24 >> 2] = ee, o[ce + 12 >> 2] = ce, o[ce + 8 >> 2] = ce;
                                        break
                                    }
                                    if (194 == (0 | D)) {
                                        ne = 0 | o[(_ = ee + 8 | 0) >> 2], o[ne + 12 >> 2] = ce, o[_ >> 2] = ce, o[ce + 8 >> 2] = ne, o[ce + 12 >> 2] = ee, o[ce + 24 >> 2] = 0;
                                        break
                                    }
                                } else ne = (0 | o[951]) + j | 0, o[951] = ne, o[954] = ce, o[ce + 4 >> 2] = 1 | ne
                            } while (0);
                            return l = r, 0 | (ue + 8 | 0)
                        }
                        for (ce = 4240; !((j = 0 | o[ce >> 2]) >>> 0 <= oe >>> 0 && (Fe = j + (0 | o[ce + 4 >> 2]) | 0) >>> 0 > oe >>> 0);) ce = 0 | o[ce + 8 >> 2];
                        j = (ce = (j = (ce = Fe + -47 | 0) + (0 == (7 & (ue = ce + 8 | 0) | 0) ? 0 : 0 - ue & 7) | 0) >>> 0 < (ue = oe + 16 | 0) >>> 0 ? oe : j) + 8 | 0, t = ae + (te = 0 == (7 & (t = ae + 8 | 0) | 0) ? 0 : 0 - t & 7) | 0, se = ie + -40 - te | 0, o[954] = t, o[951] = se, o[t + 4 >> 2] = 1 | se, o[t + se + 4 >> 2] = 40, o[955] = o[1070], o[(se = ce + 4 | 0) >> 2] = 27, o[j >> 2] = o[1060], o[j + 4 >> 2] = o[1061], o[j + 8 >> 2] = o[1062], o[j + 12 >> 2] = o[1063], o[1060] = ae, o[1061] = ie, o[1063] = 0, o[1062] = j, j = ce + 24 | 0;
                        do {
                            t = j, o[(j = j + 4 | 0) >> 2] = 7
                        } while ((t + 8 | 0) >>> 0 < Fe >>> 0);
                        if ((0 | ce) != (0 | oe)) {
                            if (j = ce - oe | 0, o[se >> 2] = -2 & o[se >> 2], o[oe + 4 >> 2] = 1 | j, o[ce >> 2] = j, t = j >>> 3, j >>> 0 < 256) {
                                te = 3832 + (t << 1 << 2) | 0, (ne = 0 | o[948]) & (_ = 1 << t) ? (ve = 0 | o[(_ = te + 8 | 0) >> 2], Me = _) : (o[948] = ne | _, ve = te, Me = te + 8 | 0), o[Me >> 2] = oe, o[ve + 12 >> 2] = oe, o[oe + 8 >> 2] = ve, o[oe + 12 >> 2] = te;
                                break
                            }
                            if (ye = (te = j >>> 8) ? j >>> 0 > 16777215 ? 31 : j >>> ((J = 14 - ((te = ((ne = te << (_ = (te + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4) | _ | (ne = ((t = ne << te) + 245760 | 0) >>> 16 & 2)) + (t << ne >>> 15) | 0) + 7 | 0) & 1 | J << 1 : 0, J = 4096 + (ye << 2) | 0, o[oe + 28 >> 2] = ye, o[oe + 20 >> 2] = 0, o[ue >> 2] = 0, !((ne = 0 | o[949]) & (t = 1 << ye))) {
                                o[949] = ne | t, o[J >> 2] = oe, o[oe + 24 >> 2] = J, o[oe + 12 >> 2] = oe, o[oe + 8 >> 2] = oe;
                                break
                            }
                            for (t = j << (31 == (0 | ye) ? 0 : 25 - (ye >>> 1) | 0), ne = 0 | o[J >> 2];;) {
                                if ((-8 & o[ne + 4 >> 2] | 0) == (0 | j)) {
                                    D = 216;
                                    break
                                }
                                if (!(J = 0 | o[(Te = ne + 16 + (t >>> 31 << 2) | 0) >> 2])) {
                                    D = 215;
                                    break
                                }
                                t <<= 1, ne = J
                            }
                            if (215 == (0 | D)) {
                                o[Te >> 2] = oe, o[oe + 24 >> 2] = ne, o[oe + 12 >> 2] = oe, o[oe + 8 >> 2] = oe;
                                break
                            }
                            if (216 == (0 | D)) {
                                j = 0 | o[(t = ne + 8 | 0) >> 2], o[j + 12 >> 2] = oe, o[t >> 2] = oe, o[oe + 8 >> 2] = j, o[oe + 12 >> 2] = ne, o[oe + 24 >> 2] = 0;
                                break
                            }
                        }
                    } else {
                        0 == (0 | (j = 0 | o[952])) | ae >>> 0 < j >>> 0 && (o[952] = ae), o[1060] = ae, o[1061] = ie, o[1063] = 0, o[957] = o[1066], o[956] = -1, j = 0;
                        do {
                            o[(t = 3832 + (j << 1 << 2) | 0) + 12 >> 2] = t, o[t + 8 >> 2] = t, j = j + 1 | 0
                        } while (32 != (0 | j));
                        j = ae + (ne = 0 == (7 & (j = ae + 8 | 0) | 0) ? 0 : 0 - j & 7) | 0, t = ie + -40 - ne | 0, o[954] = j, o[951] = t, o[j + 4 >> 2] = 1 | t, o[j + t + 4 >> 2] = 40, o[955] = o[1070]
                    }
                } while (0);
                if ((ie = 0 | o[951]) >>> 0 > w >>> 0) return ae = ie - w | 0, o[951] = ae, oe = (ie = 0 | o[954]) + w | 0, o[954] = oe, o[oe + 4 >> 2] = 1 | ae, o[ie + 4 >> 2] = 3 | w, l = r, 0 | (ie + 8 | 0)
            }
            return ie = 0 | G(), o[ie >> 2] = 12, l = r, 0 | 0
        }

        function K(e) {
            var r, t = 0,
                n = 0,
                i = 0,
                a = 0,
                s = 0,
                u = 0,
                c = 0,
                l = 0,
                f = 0,
                d = 0,
                S = 0,
                E = 0,
                _ = 0,
                m = 0,
                h = 0,
                p = 0,
                b = 0,
                k = 0,
                A = 0,
                F = 0,
                v = 0,
                M = 0,
                y = 0,
                T = 0,
                g = 0,
                w = 0,
                O = 0;
            if (e |= 0) {
                t = e + -8 | 0, n = 0 | o[952], r = t + (e = -8 & (i = 0 | o[e + -4 >> 2])) | 0;
                do {
                    if (1 & i) f = t, d = e, S = t;
                    else {
                        if (a = 0 | o[t >> 2], !(3 & i)) return;
                        if (u = a + e | 0, (s = t + (0 - a) | 0) >>> 0 < n >>> 0) return;
                        if ((0 | s) == (0 | o[953])) {
                            if (3 != (3 & (l = 0 | o[(c = r + 4 | 0) >> 2]) | 0)) {
                                f = s, d = u, S = s;
                                break
                            }
                            return o[950] = u, o[c >> 2] = -2 & l, o[s + 4 >> 2] = 1 | u, void(o[s + u >> 2] = u)
                        }
                        if (l = a >>> 3, a >>> 0 < 256) {
                            if (a = 0 | o[s + 8 >> 2], (0 | (c = 0 | o[s + 12 >> 2])) == (0 | a)) {
                                o[948] = o[948] & ~(1 << l), f = s, d = u, S = s;
                                break
                            }
                            o[a + 12 >> 2] = c, o[c + 8 >> 2] = a, f = s, d = u, S = s;
                            break
                        }
                        a = 0 | o[s + 24 >> 2], c = 0 | o[s + 12 >> 2];
                        do {
                            if ((0 | c) == (0 | s)) {
                                if (_ = 0 | o[(E = (l = s + 16 | 0) + 4 | 0) >> 2]) p = _, b = E;
                                else {
                                    if (!(m = 0 | o[l >> 2])) {
                                        h = 0;
                                        break
                                    }
                                    p = m, b = l
                                }
                                for (;;)
                                    if (0 | (_ = 0 | o[(E = p + 20 | 0) >> 2])) p = _, b = E;
                                    else {
                                        if (!(_ = 0 | o[(E = p + 16 | 0) >> 2])) break;
                                        p = _, b = E
                                    } o[b >> 2] = 0, h = p
                            } else E = 0 | o[s + 8 >> 2], o[E + 12 >> 2] = c, o[c + 8 >> 2] = E, h = c
                        } while (0);
                        if (a) {
                            if (c = 0 | o[s + 28 >> 2], (0 | s) == (0 | o[(E = 4096 + (c << 2) | 0) >> 2])) {
                                if (o[E >> 2] = h, !h) {
                                    o[949] = o[949] & ~(1 << c), f = s, d = u, S = s;
                                    break
                                }
                            } else if (o[a + 16 + (((0 | o[a + 16 >> 2]) != (0 | s) & 1) << 2) >> 2] = h, !h) {
                                f = s, d = u, S = s;
                                break
                            }
                            o[h + 24 >> 2] = a, 0 | (E = 0 | o[(c = s + 16 | 0) >> 2]) && (o[h + 16 >> 2] = E, o[E + 24 >> 2] = h), (E = 0 | o[c + 4 >> 2]) ? (o[h + 20 >> 2] = E, o[E + 24 >> 2] = h, f = s, d = u, S = s) : (f = s, d = u, S = s)
                        } else f = s, d = u, S = s
                    }
                } while (0);
                if (!(S >>> 0 >= r >>> 0) && 1 & (e = 0 | o[(t = r + 4 | 0) >> 2])) {
                    if (2 & e) o[t >> 2] = -2 & e, o[f + 4 >> 2] = 1 | d, o[S + d >> 2] = d, v = d;
                    else {
                        if (h = 0 | o[953], (0 | r) == (0 | o[954])) {
                            if (p = (0 | o[951]) + d | 0, o[951] = p, o[954] = f, o[f + 4 >> 2] = 1 | p, (0 | f) != (0 | h)) return;
                            return o[953] = 0, void(o[950] = 0)
                        }
                        if ((0 | r) == (0 | h)) return h = (0 | o[950]) + d | 0, o[950] = h, o[953] = S, o[f + 4 >> 2] = 1 | h, void(o[S + h >> 2] = h);
                        h = (-8 & e) + d | 0, p = e >>> 3;
                        do {
                            if (e >>> 0 < 256) {
                                if (b = 0 | o[r + 8 >> 2], (0 | (n = 0 | o[r + 12 >> 2])) == (0 | b)) {
                                    o[948] = o[948] & ~(1 << p);
                                    break
                                }
                                o[b + 12 >> 2] = n, o[n + 8 >> 2] = b;
                                break
                            }
                            b = 0 | o[r + 24 >> 2], n = 0 | o[r + 12 >> 2];
                            do {
                                if ((0 | n) == (0 | r)) {
                                    if (c = 0 | o[(E = (i = r + 16 | 0) + 4 | 0) >> 2]) A = c, F = E;
                                    else {
                                        if (!(_ = 0 | o[i >> 2])) {
                                            k = 0;
                                            break
                                        }
                                        A = _, F = i
                                    }
                                    for (;;)
                                        if (0 | (c = 0 | o[(E = A + 20 | 0) >> 2])) A = c, F = E;
                                        else {
                                            if (!(c = 0 | o[(E = A + 16 | 0) >> 2])) break;
                                            A = c, F = E
                                        } o[F >> 2] = 0, k = A
                                } else E = 0 | o[r + 8 >> 2], o[E + 12 >> 2] = n, o[n + 8 >> 2] = E, k = n
                            } while (0);
                            if (0 | b) {
                                if (n = 0 | o[r + 28 >> 2], (0 | r) == (0 | o[(s = 4096 + (n << 2) | 0) >> 2])) {
                                    if (o[s >> 2] = k, !k) {
                                        o[949] = o[949] & ~(1 << n);
                                        break
                                    }
                                } else if (o[b + 16 + (((0 | o[b + 16 >> 2]) != (0 | r) & 1) << 2) >> 2] = k, !k) break;
                                o[k + 24 >> 2] = b, 0 | (s = 0 | o[(n = r + 16 | 0) >> 2]) && (o[k + 16 >> 2] = s, o[s + 24 >> 2] = k), 0 | (s = 0 | o[n + 4 >> 2]) && (o[k + 20 >> 2] = s, o[s + 24 >> 2] = k)
                            }
                        } while (0);
                        if (o[f + 4 >> 2] = 1 | h, o[S + h >> 2] = h, (0 | f) == (0 | o[953])) return void(o[950] = h);
                        v = h
                    }
                    if (d = v >>> 3, v >>> 0 < 256) return S = 3832 + (d << 1 << 2) | 0, (e = 0 | o[948]) & (t = 1 << d) ? (M = 0 | o[(t = S + 8 | 0) >> 2], y = t) : (o[948] = e | t, M = S, y = S + 8 | 0), o[y >> 2] = f, o[M + 12 >> 2] = f, o[f + 8 >> 2] = M, void(o[f + 12 >> 2] = S);
                    T = (S = v >>> 8) ? v >>> 0 > 16777215 ? 31 : v >>> ((e = 14 - ((S = ((y = S << (M = (S + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4) | M | (y = ((t = y << S) + 245760 | 0) >>> 16 & 2)) + (t << y >>> 15) | 0) + 7 | 0) & 1 | e << 1 : 0, e = 4096 + (T << 2) | 0, o[f + 28 >> 2] = T, o[f + 20 >> 2] = 0, o[f + 16 >> 2] = 0, y = 0 | o[949], t = 1 << T;
                    do {
                        if (y & t) {
                            for (M = v << (31 == (0 | T) ? 0 : 25 - (T >>> 1) | 0), S = 0 | o[e >> 2];;) {
                                if ((-8 & o[S + 4 >> 2] | 0) == (0 | v)) {
                                    g = 73;
                                    break
                                }
                                if (!(d = 0 | o[(w = S + 16 + (M >>> 31 << 2) | 0) >> 2])) {
                                    g = 72;
                                    break
                                }
                                M <<= 1, S = d
                            }
                            if (72 == (0 | g)) {
                                o[w >> 2] = f, o[f + 24 >> 2] = S, o[f + 12 >> 2] = f, o[f + 8 >> 2] = f;
                                break
                            }
                            if (73 == (0 | g)) {
                                b = 0 | o[(M = S + 8 | 0) >> 2], o[b + 12 >> 2] = f, o[M >> 2] = f, o[f + 8 >> 2] = b, o[f + 12 >> 2] = S, o[f + 24 >> 2] = 0;
                                break
                            }
                        } else o[949] = y | t, o[e >> 2] = f, o[f + 24 >> 2] = e, o[f + 12 >> 2] = f, o[f + 8 >> 2] = f
                    } while (0);
                    if (f = (0 | o[956]) - 1 | 0, o[956] = f, !f) {
                        for (O = 4248; f = 0 | o[O >> 2];) O = f + 8 | 0;
                        o[956] = -1
                    }
                }
            }
        }

        function j(e, r, t) {
            e |= 0, r |= 0, t |= 0;
            var n, i, a, s, u, c = 0,
                d = 0,
                S = 0,
                E = 0,
                _ = 0,
                m = 0,
                h = 0,
                p = 0,
                b = 0,
                A = 0,
                F = 0,
                v = 0,
                M = 0;
            n = l, (0 | (l = l + 48 | 0)) >= (0 | f) && k(48), i = n + 16 | 0, c = n, a = n + 32 | 0, d = 0 | o[(s = e + 28 | 0) >> 2], o[a >> 2] = d, S = (0 | o[(u = e + 20 | 0) >> 2]) - d | 0, o[a + 4 >> 2] = S, o[a + 8 >> 2] = r, o[a + 12 >> 2] = t, r = S + t | 0, S = e + 60 | 0, o[c >> 2] = o[S >> 2], o[c + 4 >> 2] = a, o[c + 8 >> 2] = 2, d = 0 | X(0 | R(146, 0 | c));
            e: do {
                if ((0 | r) != (0 | d)) {
                    for (c = 2, E = r, _ = a, m = d; !((0 | m) < 0);) {
                        if (E = E - m | 0, A = ((p = m >>> 0 > (h = 0 | o[_ + 4 >> 2]) >>> 0) << 31 >> 31) + c | 0, F = m - (p ? h : 0) | 0, o[(b = p ? _ + 8 | 0 : _) >> 2] = (0 | o[b >> 2]) + F, o[(h = b + 4 | 0) >> 2] = (0 | o[h >> 2]) - F, o[i >> 2] = o[S >> 2], o[i + 4 >> 2] = b, o[i + 8 >> 2] = A, (0 | E) == (0 | (m = 0 | X(0 | R(146, 0 | i))))) {
                            v = 3;
                            break e
                        }
                        c = A, _ = b
                    }
                    o[e + 16 >> 2] = 0, o[s >> 2] = 0, o[u >> 2] = 0, o[e >> 2] = 32 | o[e >> 2], M = 2 == (0 | c) ? 0 : t - (0 | o[_ + 4 >> 2]) | 0
                } else v = 3
            } while (0);
            return 3 == (0 | v) && (v = 0 | o[e + 44 >> 2], o[e + 16 >> 2] = v + (0 | o[e + 48 >> 2]), o[s >> 2] = v, o[u >> 2] = v, M = t), l = n, 0 | M
        }

        function X(e) {
            var r = 0,
                t = 0;
            return (e |= 0) >>> 0 > 4294963200 ? (r = 0 | G(), o[r >> 2] = 0 - e, t = -1) : t = e, 0 | t
        }

        function G() {
            return 652
        }

        function W(e, r) {
            r |= 0;
            var n = 0,
                o = 0,
                i = 0,
                a = 0;
            if (n = 0 | t[(e |= 0) >> 0], o = 0 | t[r >> 0], n << 24 >> 24 == 0 || n << 24 >> 24 != o << 24 >> 24) i = o, a = n;
            else {
                n = r, r = e;
                do {
                    n = n + 1 | 0, e = 0 | t[(r = r + 1 | 0) >> 0], o = 0 | t[n >> 0]
                } while (e << 24 >> 24 != 0 && e << 24 >> 24 == o << 24 >> 24);
                i = o, a = e
            }
            return (255 & a) - (255 & i) | 0
        }

        function q(e, r, i, s, u) {
            e |= 0, r |= 0, i |= 0, s |= 0, u |= 0;
            var c, d, S, _, m, h, p, b, A, F = 0,
                v = 0,
                M = 0,
                y = 0,
                T = 0,
                g = 0,
                w = 0,
                O = 0,
                R = 0,
                N = 0,
                P = 0,
                C = 0,
                D = 0,
                L = 0,
                I = 0,
                x = 0,
                H = 0,
                B = 0,
                U = 0,
                Y = 0,
                z = 0,
                V = 0,
                K = 0,
                j = 0,
                X = 0,
                G = 0,
                W = 0,
                q = 0,
                Z = 0,
                Q = 0,
                ce = 0,
                le = 0,
                fe = 0,
                de = 0,
                Se = 0,
                Ee = 0,
                _e = 0,
                me = 0,
                he = 0,
                pe = 0,
                be = 0,
                ke = 0,
                Ae = 0,
                Fe = 0,
                ve = 0,
                Me = 0,
                ye = 0,
                Te = 0,
                ge = 0,
                we = 0,
                Oe = 0,
                Re = 0,
                Ne = 0,
                Pe = 0,
                Ce = 0,
                De = 0,
                Ie = 0,
                xe = 0,
                He = 0,
                Be = 0,
                Ue = 0,
                Ye = 0,
                ze = 0,
                Ve = 0,
                Ke = 0,
                je = 0,
                Xe = 0,
                Ge = 0,
                We = 0;
            c = l, (0 | (l = l + 64 | 0)) >= (0 | f) && k(64), S = c, F = c + 24 | 0, _ = c + 8 | 0, m = c + 20 | 0, o[(d = c + 16 | 0) >> 2] = r, h = 0 != (0 | e), b = p = F + 40 | 0, A = F + 39 | 0, F = _ + 4 | 0, v = 0, M = 0, y = 0, T = r;
            e: for (;;) {
                do {
                    if ((0 | M) > -1) {
                        if ((0 | v) > (2147483647 - M | 0)) {
                            o[(r = 652) >> 2] = 75, g = -1;
                            break
                        }
                        g = v + M | 0;
                        break
                    }
                    g = M
                } while (0);
                if (!((r = 0 | t[T >> 0]) << 24 >> 24)) {
                    w = 87;
                    break
                }
                O = r, R = T;
                r: for (;;) {
                    switch (O << 24 >> 24) {
                        case 37:
                            N = R, P = R, w = 9;
                            break r;
                            break;
                        case 0:
                            C = R, D = R;
                            break r;
                            break;
                        default:
                    }
                    r = R + 1 | 0, o[d >> 2] = r, O = 0 | t[r >> 0], R = r
                }
                r: do {
                    if (9 == (0 | w))
                        for (;;) {
                            if (w = 0, 37 != (0 | t[P + 1 >> 0])) {
                                C = N, D = P;
                                break r
                            }
                            if (r = N + 1 | 0, L = P + 2 | 0, o[d >> 2] = L, 37 != (0 | t[L >> 0])) {
                                C = r, D = L;
                                break
                            }
                            N = r, P = L, w = 9
                        }
                } while (0);
                if (L = C - T | 0, h && $(e, T, L), 0 | L) v = L, M = g, T = D;
                else {
                    (r = (0 | t[(L = D + 1 | 0) >> 0]) - 48 | 0) >>> 0 < 10 ? (x = (I = 36 == (0 | t[D + 2 >> 0])) ? r : -1, H = I ? 1 : y, B = I ? D + 3 | 0 : L) : (x = -1, H = y, B = L), o[d >> 2] = B, I = ((L = 0 | t[B >> 0]) << 24 >> 24) - 32 | 0;
                    r: do {
                        if (I >>> 0 < 32)
                            for (r = 0, U = L, Y = I, z = B;;) {
                                if (!(75913 & (V = 1 << Y))) {
                                    K = r, j = U, X = z;
                                    break r
                                }
                                if (G = V | r, V = z + 1 | 0, o[d >> 2] = V, (Y = ((W = 0 | t[V >> 0]) << 24 >> 24) - 32 | 0) >>> 0 >= 32) {
                                    K = G, j = W, X = V;
                                    break
                                }
                                r = G, U = W, z = V
                            } else K = 0, j = L, X = B
                    } while (0);
                    if (j << 24 >> 24 == 42) {
                        if ((I = (0 | t[(L = X + 1 | 0) >> 0]) - 48 | 0) >>> 0 < 10 && 36 == (0 | t[X + 2 >> 0])) o[u + (I << 2) >> 2] = 10, q = 0 | o[s + ((0 | t[L >> 0]) - 48 << 3) >> 2], Z = 1, Q = X + 3 | 0;
                        else {
                            if (0 | H) {
                                ce = -1;
                                break
                            }
                            h ? (I = 3 + (0 | o[i >> 2]) & -4, z = 0 | o[I >> 2], o[i >> 2] = I + 4, q = z, Z = 0, Q = L) : (q = 0, Z = 0, Q = L)
                        }
                        o[d >> 2] = Q, le = (L = (0 | q) < 0) ? 0 - q | 0 : q, fe = L ? 8192 | K : K, de = Z, Se = Q
                    } else {
                        if ((0 | (L = 0 | J(d))) < 0) {
                            ce = -1;
                            break
                        }
                        le = L, fe = K, de = H, Se = 0 | o[d >> 2]
                    }
                    do {
                        if (46 == (0 | t[Se >> 0])) {
                            if (42 != (0 | t[Se + 1 >> 0])) {
                                o[d >> 2] = Se + 1, Ee = L = 0 | J(d), _e = 0 | o[d >> 2];
                                break
                            }
                            if ((z = (0 | t[(L = Se + 2 | 0) >> 0]) - 48 | 0) >>> 0 < 10 && 36 == (0 | t[Se + 3 >> 0])) {
                                o[u + (z << 2) >> 2] = 10, z = 0 | o[s + ((0 | t[L >> 0]) - 48 << 3) >> 2], I = Se + 4 | 0, o[d >> 2] = I, Ee = z, _e = I;
                                break
                            }
                            if (0 | de) {
                                ce = -1;
                                break e
                            }
                            h ? (I = 3 + (0 | o[i >> 2]) & -4, z = 0 | o[I >> 2], o[i >> 2] = I + 4, me = z) : me = 0, o[d >> 2] = L, Ee = me, _e = L
                        } else Ee = -1, _e = Se
                    } while (0);
                    for (L = 0, z = _e;;) {
                        if (((0 | t[z >> 0]) - 65 | 0) >>> 0 > 57) {
                            ce = -1;
                            break e
                        }
                        if (he = z + 1 | 0, o[d >> 2] = he, !(((be = 255 & (pe = 0 | t[(0 | t[z >> 0]) - 65 + (1362 + (58 * L | 0)) >> 0])) + -1 | 0) >>> 0 < 8)) break;
                        L = be, z = he
                    }
                    if (!(pe << 24 >> 24)) {
                        ce = -1;
                        break
                    }
                    I = (0 | x) > -1;
                    do {
                        if (pe << 24 >> 24 == 19) {
                            if (I) {
                                ce = -1;
                                break e
                            }
                            w = 49
                        } else {
                            if (I) {
                                o[u + (x << 2) >> 2] = be, r = 0 | o[(U = s + (x << 3) | 0) + 4 >> 2], o[(Y = S) >> 2] = o[U >> 2], o[Y + 4 >> 2] = r, w = 49;
                                break
                            }
                            if (!h) {
                                ce = 0;
                                break e
                            }
                            ee(S, be, i)
                        }
                    } while (0);
                    if (49 != (0 | w) || (w = 0, h)) {
                        r = 0 != (0 | L) & 3 == (15 & (I = 0 | t[z >> 0]) | 0) ? -33 & I : I, I = -65537 & fe, Y = 0 == (8192 & fe | 0) ? fe : I;
                        r: do {
                            switch (0 | r) {
                                case 110:
                                    switch ((255 & L) << 24 >> 24) {
                                        case 0:
                                            o[o[S >> 2] >> 2] = g, v = 0, M = g, y = de, T = he;
                                            continue e;
                                            break;
                                        case 1:
                                            o[o[S >> 2] >> 2] = g, v = 0, M = g, y = de, T = he;
                                            continue e;
                                            break;
                                        case 2:
                                            U = 0 | o[S >> 2], o[U >> 2] = g, o[U + 4 >> 2] = ((0 | g) < 0) << 31 >> 31, v = 0, M = g, y = de, T = he;
                                            continue e;
                                            break;
                                        case 3:
                                            n[o[S >> 2] >> 1] = g, v = 0, M = g, y = de, T = he;
                                            continue e;
                                            break;
                                        case 4:
                                            t[o[S >> 2] >> 0] = g, v = 0, M = g, y = de, T = he;
                                            continue e;
                                            break;
                                        case 6:
                                            o[o[S >> 2] >> 2] = g, v = 0, M = g, y = de, T = he;
                                            continue e;
                                            break;
                                        case 7:
                                            U = 0 | o[S >> 2], o[U >> 2] = g, o[U + 4 >> 2] = ((0 | g) < 0) << 31 >> 31, v = 0, M = g, y = de, T = he;
                                            continue e;
                                            break;
                                        default:
                                            v = 0, M = g, y = de, T = he;
                                            continue e
                                    }
                                    break;
                                case 112:
                                    ke = 120, Ae = Ee >>> 0 > 8 ? Ee : 8, Fe = 8 | Y, w = 61;
                                    break;
                                case 88:
                                case 120:
                                    ke = r, Ae = Ee, Fe = Y, w = 61;
                                    break;
                                case 111:
                                    ve = U = 0 | te(V = 0 | o[(U = S) >> 2], W = 0 | o[U + 4 >> 2], p), Me = 0, ye = 1826, Te = 0 == (8 & Y | 0) | (0 | Ee) > (0 | (G = b - U | 0)) ? Ee : G + 1 | 0, ge = Y, we = V, Oe = W, w = 67;
                                    break;
                                case 105:
                                case 100:
                                    if (V = 0 | o[(W = S) >> 2], (0 | (G = 0 | o[W + 4 >> 2])) < 0) {
                                        W = 0 | Le(0, 0, 0 | V, 0 | G), U = E, o[(Re = S) >> 2] = W, o[Re + 4 >> 2] = U, Ne = 1, Pe = 1826, Ce = W, De = U, w = 66;
                                        break r
                                    }
                                    Ne = 0 != (2049 & Y | 0) & 1, Pe = 0 == (2048 & Y | 0) ? 0 == (1 & Y | 0) ? 1826 : 1828 : 1827, Ce = V, De = G, w = 66;
                                    break r;
                                    break;
                                case 117:
                                    Ne = 0, Pe = 1826, Ce = 0 | o[(G = S) >> 2], De = 0 | o[G + 4 >> 2], w = 66;
                                    break;
                                case 99:
                                    t[A >> 0] = o[S >> 2], Ie = A, xe = 0, He = 1826, Be = p, Ue = 1, Ye = I;
                                    break;
                                case 109:
                                    ze = 0 | oe(0 | o[(G = 652) >> 2]), w = 71;
                                    break;
                                case 115:
                                    ze = 0 | (G = 0 | o[S >> 2]) ? G : 1836, w = 71;
                                    break;
                                case 67:
                                    o[_ >> 2] = o[S >> 2], o[F >> 2] = 0, o[S >> 2] = _, Ve = -1, Ke = _, w = 75;
                                    break;
                                case 83:
                                    G = 0 | o[S >> 2], Ee ? (Ve = Ee, Ke = G, w = 75) : (ae(e, 32, le, 0, Y), je = 0, w = 84);
                                    break;
                                case 65:
                                case 71:
                                case 70:
                                case 69:
                                case 97:
                                case 103:
                                case 102:
                                case 101:
                                    v = 0 | ue(e, +a[S >> 3], le, Ee, Y, r), M = g, y = de, T = he;
                                    continue e;
                                    break;
                                default:
                                    Ie = T, xe = 0, He = 1826, Be = p, Ue = Ee, Ye = Y
                            }
                        } while (0);
                        r: do {
                            if (61 == (0 | w)) w = 0, ve = r = 0 | re(L = 0 | o[(r = S) >> 2], z = 0 | o[r + 4 >> 2], p, 32 & ke), Me = (G = 0 == (8 & Fe | 0) | 0 == (0 | L) & 0 == (0 | z)) ? 0 : 2, ye = G ? 1826 : 1826 + (ke >> 4) | 0, Te = Ae, ge = Fe, we = L, Oe = z, w = 67;
                            else if (66 == (0 | w)) w = 0, ve = 0 | ne(Ce, De, p), Me = Ne, ye = Pe, Te = Ee, ge = Y, we = Ce, Oe = De, w = 67;
                            else if (71 == (0 | w)) w = 0, Ie = ze, xe = 0, He = 1826, Be = (L = 0 == (0 | (z = 0 | ie(ze, 0, Ee)))) ? ze + Ee | 0 : z, Ue = L ? Ee : z - ze | 0, Ye = I;
                            else if (75 == (0 | w)) {
                                for (w = 0, z = Ke, L = 0, G = 0;;) {
                                    if (!(r = 0 | o[z >> 2])) {
                                        Xe = L, Ge = G;
                                        break
                                    }
                                    if ((0 | (V = 0 | se(m, r))) < 0 | V >>> 0 > (Ve - L | 0) >>> 0) {
                                        Xe = L, Ge = V;
                                        break
                                    }
                                    if (!(Ve >>> 0 > (r = V + L | 0) >>> 0)) {
                                        Xe = r, Ge = V;
                                        break
                                    }
                                    z = z + 4 | 0, L = r, G = V
                                }
                                if ((0 | Ge) < 0) {
                                    ce = -1;
                                    break e
                                }
                                if (ae(e, 32, le, Xe, Y), Xe)
                                    for (G = Ke, L = 0;;) {
                                        if (!(z = 0 | o[G >> 2])) {
                                            je = Xe, w = 84;
                                            break r
                                        }
                                        if ((0 | (L = (V = 0 | se(m, z)) + L | 0)) > (0 | Xe)) {
                                            je = Xe, w = 84;
                                            break r
                                        }
                                        if ($(e, m, V), L >>> 0 >= Xe >>> 0) {
                                            je = Xe, w = 84;
                                            break
                                        }
                                        G = G + 4 | 0
                                    } else je = 0, w = 84
                            }
                        } while (0);
                        if (67 == (0 | w)) w = 0, L = b - ve + (1 & (1 ^ (I = 0 != (0 | we) | 0 != (0 | Oe)))) | 0, Ie = (G = 0 != (0 | Te) | I) ? ve : p, xe = Me, He = ye, Be = p, Ue = G ? (0 | Te) > (0 | L) ? Te : L : Te, Ye = (0 | Te) > -1 ? -65537 & ge : ge;
                        else if (84 == (0 | w)) {
                            w = 0, ae(e, 32, le, je, 8192 ^ Y), v = (0 | le) > (0 | je) ? le : je, M = g, y = de, T = he;
                            continue
                        }
                        ae(e, 32, V = (0 | le) < (0 | (I = (G = (0 | Ue) < (0 | (L = Be - Ie | 0)) ? L : Ue) + xe | 0)) ? I : le, I, Ye), $(e, He, xe), ae(e, 48, V, I, 65536 ^ Ye), ae(e, 48, G, L, 0), $(e, Ie, L), ae(e, 32, V, I, 8192 ^ Ye), v = V, M = g, y = de, T = he
                    } else v = 0, M = g, y = de, T = he
                }
            }
            e: do {
                if (87 == (0 | w))
                    if (e) ce = g;
                    else if (y) {
                    for (he = 1;;) {
                        if (!(T = 0 | o[u + (he << 2) >> 2])) {
                            We = he;
                            break
                        }
                        if (ee(s + (he << 3) | 0, T, i), (0 | (he = he + 1 | 0)) >= 10) {
                            ce = 1;
                            break e
                        }
                    }
                    for (;;) {
                        if (0 | o[u + (We << 2) >> 2]) {
                            ce = -1;
                            break e
                        }
                        if ((0 | (We = We + 1 | 0)) >= 10) {
                            ce = 1;
                            break
                        }
                    }
                } else ce = 0
            } while (0);
            return l = c, 0 | ce
        }

        function Z(e) {
            return 0, 0
        }

        function Q(e) {
            0
        }

        function $(e, r, t) {
            r |= 0, t |= 0, 32 & o[(e |= 0) >> 2] || Ee(r, t, e)
        }

        function J(e) {
            var r = 0,
                n = 0,
                i = 0,
                a = 0,
                s = 0;
            if (r = 0 | o[(e |= 0) >> 2], (n = (0 | t[r >> 0]) - 48 | 0) >>> 0 < 10)
                for (i = 0, a = r, r = n;;) {
                    if (n = r + (10 * i | 0) | 0, a = a + 1 | 0, o[e >> 2] = a, (r = (0 | t[a >> 0]) - 48 | 0) >>> 0 >= 10) {
                        s = n;
                        break
                    }
                    i = n
                } else s = 0;
            return 0 | s
        }

        function ee(e, r, t) {
            e |= 0, r |= 0, t |= 0;
            var n = 0,
                i = 0,
                s = 0,
                u = 0,
                c = 0;
            e: do {
                if (r >>> 0 <= 20) {
                    switch (0 | r) {
                        case 9:
                            n = 3 + (0 | o[t >> 2]) & -4, i = 0 | o[n >> 2], o[t >> 2] = n + 4, o[e >> 2] = i;
                            break e;
                            break;
                        case 10:
                            i = 3 + (0 | o[t >> 2]) & -4, n = 0 | o[i >> 2], o[t >> 2] = i + 4, o[(i = e) >> 2] = n, o[i + 4 >> 2] = ((0 | n) < 0) << 31 >> 31;
                            break e;
                            break;
                        case 11:
                            n = 3 + (0 | o[t >> 2]) & -4, i = 0 | o[n >> 2], o[t >> 2] = n + 4, o[(n = e) >> 2] = i, o[n + 4 >> 2] = 0;
                            break e;
                            break;
                        case 12:
                            n = 7 + (0 | o[t >> 2]) & -8, s = 0 | o[(i = n) >> 2], u = 0 | o[i + 4 >> 2], o[t >> 2] = n + 8, o[(n = e) >> 2] = s, o[n + 4 >> 2] = u;
                            break e;
                            break;
                        case 13:
                            u = 3 + (0 | o[t >> 2]) & -4, n = 0 | o[u >> 2], o[t >> 2] = u + 4, u = (65535 & n) << 16 >> 16, o[(n = e) >> 2] = u, o[n + 4 >> 2] = ((0 | u) < 0) << 31 >> 31;
                            break e;
                            break;
                        case 14:
                            u = 3 + (0 | o[t >> 2]) & -4, n = 0 | o[u >> 2], o[t >> 2] = u + 4, o[(u = e) >> 2] = 65535 & n, o[u + 4 >> 2] = 0;
                            break e;
                            break;
                        case 15:
                            u = 3 + (0 | o[t >> 2]) & -4, n = 0 | o[u >> 2], o[t >> 2] = u + 4, u = (255 & n) << 24 >> 24, o[(n = e) >> 2] = u, o[n + 4 >> 2] = ((0 | u) < 0) << 31 >> 31;
                            break e;
                            break;
                        case 16:
                            u = 3 + (0 | o[t >> 2]) & -4, n = 0 | o[u >> 2], o[t >> 2] = u + 4, o[(u = e) >> 2] = 255 & n, o[u + 4 >> 2] = 0;
                            break e;
                            break;
                        case 17:
                            u = 7 + (0 | o[t >> 2]) & -8, c = +a[u >> 3], o[t >> 2] = u + 8, a[e >> 3] = c;
                            break e;
                            break;
                        case 18:
                            u = 7 + (0 | o[t >> 2]) & -8, c = +a[u >> 3], o[t >> 2] = u + 8, a[e >> 3] = c;
                            break e;
                            break;
                        default:
                            break e
                    }
                }
            } while (0)
        }

        function re(e, r, n, o) {
            n |= 0, o |= 0;
            var a = 0,
                s = 0;
            if (0 == (0 | (e |= 0)) & 0 == (0 | (r |= 0))) a = n;
            else
                for (s = n, n = r, r = e;;) {
                    if (t[(e = s + -1 | 0) >> 0] = 0 | i[1878 + (15 & r) >> 0] | o, 0 == (0 | (r = 0 | He(0 | r, 0 | n, 4))) & 0 == (0 | (n = E))) {
                        a = e;
                        break
                    }
                    s = e
                }
            return 0 | a
        }

        function te(e, r, n) {
            n |= 0;
            var o = 0,
                i = 0;
            if (0 == (0 | (e |= 0)) & 0 == (0 | (r |= 0))) o = n;
            else
                for (i = n, n = r, r = e;;) {
                    if (t[(e = i + -1 | 0) >> 0] = 7 & r | 48, 0 == (0 | (r = 0 | He(0 | r, 0 | n, 3))) & 0 == (0 | (n = E))) {
                        o = e;
                        break
                    }
                    i = e
                }
            return 0 | o
        }

        function ne(e, r, n) {
            n |= 0;
            var o = 0,
                i = 0,
                a = 0,
                s = 0,
                u = 0,
                c = 0;
            if ((r |= 0) >>> 0 > 0 | 0 == (0 | r) & (e |= 0) >>> 0 > 4294967295) {
                for (o = n, i = e, a = r; r = 0 | Ke(0 | i, 0 | a, 10, 0), t[(o = o + -1 | 0) >> 0] = 255 & r | 48, r = i, i = 0 | ze(0 | i, 0 | a, 10, 0), a >>> 0 > 9 | 9 == (0 | a) & r >>> 0 > 4294967295;) a = E;
                s = i, u = o
            } else s = e, u = n;
            if (s)
                for (n = s, s = u;;) {
                    if (t[(u = s + -1 | 0) >> 0] = 48 | (n >>> 0) % 10, n >>> 0 < 10) {
                        c = u;
                        break
                    }
                    n = (n >>> 0) / 10 | 0, s = u
                } else c = u;
            return 0 | c
        }

        function oe(e) {
            return 776, 0 | function (e, r) {
                e |= 0, r |= 0;
                var n = 0,
                    a = 0,
                    s = 0,
                    u = 0,
                    c = 0,
                    l = 0;
                n = 0;
                for (;;) {
                    if ((0 | i[1896 + n >> 0]) == (0 | e)) {
                        a = 2;
                        break
                    }
                    if (87 == (0 | (s = n + 1 | 0))) {
                        u = 1984, c = 87, a = 5;
                        break
                    }
                    n = s
                }
                2 == (0 | a) && (n ? (u = 1984, c = n, a = 5) : l = 1984);
                if (5 == (0 | a))
                    for (;;) {
                        a = 0, n = u;
                        do {
                            e = n, n = n + 1 | 0
                        } while (0 != (0 | t[e >> 0]));
                        if (!(c = c + -1 | 0)) {
                            l = n;
                            break
                        }
                        u = n, a = 5
                    }
                return 0 | (f = l, d = 0 | o[r + 20 >> 2], 0 | function (e, r) {
                    e |= 0;
                    var n = 0;
                    return 0 | (0 | (n = (r |= 0) ? 0 | function (e, r, n) {
                        r |= 0, n |= 0;
                        var i = 0,
                            a = 0,
                            s = 0,
                            u = 0,
                            c = 0,
                            l = 0,
                            f = 0,
                            d = 0,
                            S = 0,
                            E = 0,
                            _ = 0,
                            m = 0,
                            h = 0,
                            p = 0,
                            b = 0;
                        i = 1794895138 + (0 | o[(e |= 0) >> 2]) | 0, a = 0 | Se(0 | o[e + 8 >> 2], i), s = 0 | Se(0 | o[e + 12 >> 2], i), u = 0 | Se(0 | o[e + 16 >> 2], i);
                        e: do {
                            if (a >>> 0 < r >>> 2 >>> 0 && (c = r - (a << 2) | 0, s >>> 0 < c >>> 0 & u >>> 0 < c >>> 0) && 0 == (3 & (u | s) | 0)) {
                                for (c = s >>> 2, l = u >>> 2, f = 0, d = a;;) {
                                    if (h = 0 | Se(0 | o[e + ((m = (_ = (E = f + (S = d >>> 1) | 0) << 1) + c | 0) << 2) >> 2], i), !((p = 0 | Se(0 | o[e + (m + 1 << 2) >> 2], i)) >>> 0 < r >>> 0 & h >>> 0 < (r - p | 0) >>> 0)) {
                                        b = 0;
                                        break e
                                    }
                                    if (0 | t[e + (p + h) >> 0]) {
                                        b = 0;
                                        break e
                                    }
                                    if (!(h = 0 | W(n, e + p | 0))) break;
                                    if (p = (0 | h) < 0, 1 == (0 | d)) {
                                        b = 0;
                                        break e
                                    }
                                    f = p ? f : E, d = p ? S : d - S | 0
                                }
                                f = 0 | Se(0 | o[e + ((d = _ + l | 0) << 2) >> 2], i), b = (c = 0 | Se(0 | o[e + (d + 1 << 2) >> 2], i)) >>> 0 < r >>> 0 & f >>> 0 < (r - c | 0) >>> 0 && 0 == (0 | t[e + (c + f) >> 0]) ? e + c | 0 : 0
                            } else b = 0
                        } while (0);
                        return 0 | b
                    }(0 | o[r >> 2], 0 | o[r + 4 >> 2], e) : 0) ? n : e)
                }(f |= 0, d |= 0));
                var f, d
            }(e |= 0, 0 | o[194])
        }

        function ie(e, r, n) {
            e |= 0;
            var i, a = 0,
                s = 0,
                u = 0,
                c = 0,
                l = 0,
                f = 0,
                d = 0,
                S = 0,
                E = 0,
                m = 0,
                h = 0,
                p = 0,
                b = 0,
                k = 0,
                A = 0,
                F = 0,
                v = 0,
                M = 0,
                y = 0;
            i = 255 & (r |= 0), a = 0 != (0 | (n |= 0));
            e: do {
                if (a & 0 != (3 & e | 0))
                    for (s = 255 & r, u = e, c = n;;) {
                        if ((0 | t[u >> 0]) == s << 24 >> 24) {
                            l = u, f = c, d = 6;
                            break e
                        }
                        if (!((m = 0 != (0 | (E = c + -1 | 0))) & 0 != (3 & (S = u + 1 | 0) | 0))) {
                            h = S, p = E, b = m, d = 5;
                            break
                        }
                        u = S, c = E
                    } else h = e, p = n, b = a, d = 5
            } while (0);
            5 == (0 | d) && (b ? (l = h, f = p, d = 6) : (k = h, A = 0));
            e: do {
                if (6 == (0 | d))
                    if (h = 255 & r, (0 | t[l >> 0]) == h << 24 >> 24) k = l, A = f;
                    else {
                        p = 0 | _(i, 16843009);
                        r: do {
                            if (f >>> 0 > 3) {
                                for (b = l, a = f; !((-2139062144 & (n = o[b >> 2] ^ p) ^ -2139062144) & n + -16843009 | 0);) {
                                    if (n = b + 4 | 0, !((e = a + -4 | 0) >>> 0 > 3)) {
                                        F = n, v = e, d = 11;
                                        break r
                                    }
                                    b = n, a = e
                                }
                                M = b, y = a
                            } else F = l, v = f, d = 11
                        } while (0);
                        if (11 == (0 | d)) {
                            if (!v) {
                                k = F, A = 0;
                                break
                            }
                            M = F, y = v
                        }
                        for (;;) {
                            if ((0 | t[M >> 0]) == h << 24 >> 24) {
                                k = M, A = y;
                                break e
                            }
                            if (p = M + 1 | 0, !(y = y + -1 | 0)) {
                                k = p, A = 0;
                                break
                            }
                            M = p
                        }
                    }
            } while (0);
            return 0 | (0 | A ? k : 0)
        }

        function ae(e, r, t, n, o) {
            e |= 0, r |= 0, t |= 0, n |= 0, o |= 0;
            var i, a, s = 0;
            if (i = l, (0 | (l = l + 256 | 0)) >= (0 | f) && k(256), a = i, (0 | t) > (0 | n) & 0 == (73728 & o | 0)) {
                if (xe(0 | a, 0 | r, 0 | ((o = t - n | 0) >>> 0 < 256 ? o : 256)), o >>> 0 > 255) {
                    r = t - n | 0, n = o;
                    do {
                        $(e, a, 256), n = n + -256 | 0
                    } while (n >>> 0 > 255);
                    s = 255 & r
                } else s = o;
                $(e, a, s)
            }
            l = i
        }

        function se(e, r) {
            r |= 0;
            return 0 | ((e |= 0) ? 0 | function (e, r, n) {
                e |= 0, r |= 0, n |= 0;
                var i = 0;
                do {
                    if (e) {
                        if (r >>> 0 < 128) {
                            t[e >> 0] = r, i = 1;
                            break
                        }
                        if (n = 188 + (0 | de()) | 0, !(0 | o[o[n >> 2] >> 2])) {
                            if (57216 == (-128 & r | 0)) {
                                t[e >> 0] = r, i = 1;
                                break
                            }
                            o[(n = 652) >> 2] = 84, i = -1;
                            break
                        }
                        if (r >>> 0 < 2048) {
                            t[e >> 0] = r >>> 6 | 192, t[e + 1 >> 0] = 63 & r | 128, i = 2;
                            break
                        }
                        if (r >>> 0 < 55296 | 57344 == (-8192 & r | 0)) {
                            t[e >> 0] = r >>> 12 | 224, t[e + 1 >> 0] = r >>> 6 & 63 | 128, t[e + 2 >> 0] = 63 & r | 128, i = 3;
                            break
                        }
                        if ((r + -65536 | 0) >>> 0 < 1048576) {
                            t[e >> 0] = r >>> 18 | 240, t[e + 1 >> 0] = r >>> 12 & 63 | 128, t[e + 2 >> 0] = r >>> 6 & 63 | 128, t[e + 3 >> 0] = 63 & r | 128, i = 4;
                            break
                        }
                        o[(n = 652) >> 2] = 84, i = -1;
                        break
                    }
                    i = 1
                } while (0);
                return 0 | i
            }(e, r, 0) : 0)
        }

        function ue(e, r, n, a, s, u) {
            e |= 0, r = +r, n |= 0, a |= 0, s |= 0, u |= 0;
            var c, d, S, m, h, p, b, A, F = 0,
                v = 0,
                M = 0,
                y = 0,
                T = 0,
                g = 0,
                w = 0,
                O = 0,
                R = 0,
                N = 0,
                P = 0,
                C = 0,
                D = 0,
                L = 0,
                I = 0,
                x = 0,
                H = 0,
                B = 0,
                U = 0,
                Y = 0,
                z = 0,
                V = 0,
                K = 0,
                j = 0,
                X = 0,
                G = 0,
                W = 0,
                q = 0,
                Z = 0,
                Q = 0,
                J = 0,
                ee = 0,
                re = 0,
                te = 0,
                oe = 0,
                ie = 0,
                se = 0,
                ue = 0,
                fe = 0,
                de = 0,
                Se = 0,
                Ee = 0,
                _e = 0,
                me = 0,
                he = 0,
                pe = 0,
                be = 0,
                ke = 0,
                Ae = 0,
                Fe = 0,
                ve = 0,
                Me = 0,
                ye = 0,
                Te = 0,
                ge = 0,
                we = 0,
                Oe = 0,
                Re = 0,
                Ne = 0,
                Pe = 0,
                Ce = 0,
                De = 0,
                Le = 0,
                He = 0,
                Ue = 0;
            c = l, (0 | (l = l + 560 | 0)) >= (0 | f) && k(560), d = c + 8 | 0, h = m = c + 524 | 0, p = c + 512 | 0, o[(S = c) >> 2] = 0, b = p + 12 | 0, ce(r), (0 | E) < 0 ? (F = -r, v = 1, M = 1843) : (F = r, v = 0 != (2049 & s | 0) & 1, M = 0 == (2048 & s | 0) ? 0 == (1 & s | 0) ? 1844 : 1849 : 1846), ce(F), A = 2146435072 & E;
            do {
                if (A >>> 0 < 2146435072 | 2146435072 == (0 | A) & !1) {
                    if ((y = 0 != (r = 2 * +le(F, S))) && (o[S >> 2] = (0 | o[S >> 2]) - 1), 97 == (0 | (T = 32 | u))) {
                        w = 0 == (0 | (g = 32 & u)) ? M : M + 9 | 0, O = 2 | v, R = 12 - a | 0;
                        do {
                            if (!(a >>> 0 > 11 | 0 == (0 | R))) {
                                N = 8, P = R;
                                do {
                                    P = P + -1 | 0, N *= 16
                                } while (0 != (0 | P));
                                if (45 == (0 | t[w >> 0])) {
                                    C = -(N + (-r - N));
                                    break
                                }
                                C = r + N - N;
                                break
                            }
                            C = r
                        } while (0);
                        for ((0 | (D = 0 | ne(P = (0 | (R = 0 | o[S >> 2])) < 0 ? 0 - R | 0 : R, ((0 | P) < 0) << 31 >> 31, b))) == (0 | b) ? (t[(P = p + 11 | 0) >> 0] = 48, L = P) : L = D, t[L + -1 >> 0] = 43 + (R >> 31 & 2), t[(R = L + -2 | 0) >> 0] = u + 15, D = (0 | a) < 1, P = 0 == (8 & s | 0), I = m, x = C; H = ~~x, B = I + 1 | 0, t[I >> 0] = i[1878 + H >> 0] | g, x = 16 * (x - +(0 | H)), 1 != (B - h | 0) || P & D & 0 == x ? U = B : (t[B >> 0] = 46, U = I + 2 | 0), 0 != x;) I = U;
                        ae(e, 32, n, g = (D = b - R | 0) + O + (P = 0 != (0 | a) & ((I = U - h | 0) + -2 | 0) < (0 | a) ? a + 2 | 0 : I) | 0, s), $(e, w, O), ae(e, 48, n, g, 65536 ^ s), $(e, m, I), ae(e, 48, P - I | 0, 0, 0), $(e, R, D), ae(e, 32, n, g, 8192 ^ s), Y = g;
                        break
                    }
                    g = (0 | a) < 0 ? 6 : a, y ? (D = (0 | o[S >> 2]) - 28 | 0, o[S >> 2] = D, z = 268435456 * r, V = D) : (z = r, V = 0 | o[S >> 2]), I = D = (0 | V) < 0 ? d : d + 288 | 0, x = z;
                    do {
                        P = ~~x >>> 0, o[I >> 2] = P, I = I + 4 | 0, x = 1e9 * (x - +(P >>> 0))
                    } while (0 != x);
                    if ((0 | V) > 0)
                        for (y = D, R = I, O = V;;) {
                            if (w = (0 | O) < 29 ? O : 29, (P = R + -4 | 0) >>> 0 >= y >>> 0) {
                                B = P, P = 0;
                                do {
                                    j = 0 | Ke(0 | (K = 0 | Ie(0 | (H = 0 | Be(0 | o[B >> 2], 0, 0 | w)), 0 | E, 0 | P, 0)), 0 | (H = E), 1e9, 0), o[B >> 2] = j, P = 0 | ze(0 | K, 0 | H, 1e9, 0), B = B + -4 | 0
                                } while (B >>> 0 >= y >>> 0);
                                P ? (o[(B = y + -4 | 0) >> 2] = P, X = B) : X = y
                            } else X = y;
                            for (B = R; !(B >>> 0 <= X >>> 0 || 0 | o[(H = B + -4 | 0) >> 2]);) B = H;
                            if (P = (0 | o[S >> 2]) - w | 0, o[S >> 2] = P, !((0 | P) > 0)) {
                                G = X, W = B, q = P;
                                break
                            }
                            y = X, R = B, O = P
                        } else G = D, W = I, q = V;
                    if ((0 | q) < 0)
                        for (O = 1 + ((g + 25 | 0) / 9 | 0) | 0, R = 102 == (0 | T), y = G, P = W, H = q;;) {
                            if (j = (0 | (K = 0 - H | 0)) < 9 ? K : 9, y >>> 0 < P >>> 0) {
                                K = (1 << j) - 1 | 0, Z = 1e9 >>> j, Q = 0, J = y;
                                do {
                                    ee = 0 | o[J >> 2], o[J >> 2] = (ee >>> j) + Q, Q = 0 | _(ee & K, Z), J = J + 4 | 0
                                } while (J >>> 0 < P >>> 0);
                                J = 0 == (0 | o[y >> 2]) ? y + 4 | 0 : y, Q ? (o[P >> 2] = Q, re = J, te = P + 4 | 0) : (re = J, te = P)
                            } else re = 0 == (0 | o[y >> 2]) ? y + 4 | 0 : y, te = P;
                            if (Z = (te - (J = R ? D : re) >> 2 | 0) > (0 | O) ? J + (O << 2) | 0 : te, H = (0 | o[S >> 2]) + j | 0, o[S >> 2] = H, (0 | H) >= 0) {
                                oe = re, ie = Z;
                                break
                            }
                            y = re, P = Z
                        } else oe = G, ie = W;
                    if (P = D, oe >>> 0 < ie >>> 0)
                        if (y = 9 * (P - oe >> 2) | 0, (H = 0 | o[oe >> 2]) >>> 0 < 10) se = y;
                        else
                            for (O = y, y = 10;;) {
                                if (R = O + 1 | 0, H >>> 0 < (y = 10 * y | 0) >>> 0) {
                                    se = R;
                                    break
                                }
                                O = R
                            } else se = 0;
                    if ((0 | (H = g - (102 != (0 | T) ? se : 0) + (((y = 0 != (0 | g)) & (O = 103 == (0 | T))) << 31 >> 31) | 0)) < ((9 * (ie - P >> 2) | 0) - 9 | 0)) {
                        if (H = D + 4 + (((0 | (R = H + 9216 | 0)) / 9 | 0) - 1024 << 2) | 0, (0 | (I = 1 + ((0 | R) % 9 | 0) | 0)) < 9)
                            for (R = I, I = 10;;) {
                                if (Z = 10 * I | 0, 9 == (0 | (R = R + 1 | 0))) {
                                    ue = Z;
                                    break
                                }
                                I = Z
                            } else ue = 10;
                        if ((T = (H + 4 | 0) == (0 | ie)) & 0 == (0 | (R = ((I = 0 | o[H >> 2]) >>> 0) % (ue >>> 0) | 0))) me = H, he = se, pe = oe;
                        else if (N = 0 == (1 & ((I >>> 0) / (ue >>> 0) | 0) | 0) ? 9007199254740992 : 9007199254740994, x = R >>> 0 < (Z = (0 | ue) / 2 | 0) >>> 0 ? .5 : T & (0 | R) == (0 | Z) ? 1 : 1.5, v ? (fe = (Z = 45 == (0 | t[M >> 0])) ? -x : x, de = Z ? -N : N) : (fe = x, de = N), Z = I - R | 0, o[H >> 2] = Z, de + fe != de) {
                            if (R = Z + ue | 0, o[H >> 2] = R, R >>> 0 > 999999999)
                                for (R = oe, Z = H;;) {
                                    if (I = Z + -4 | 0, o[Z >> 2] = 0, I >>> 0 < R >>> 0 ? (o[(T = R + -4 | 0) >> 2] = 0, Se = T) : Se = R, T = 1 + (0 | o[I >> 2]) | 0, o[I >> 2] = T, !(T >>> 0 > 999999999)) {
                                        Ee = Se, _e = I;
                                        break
                                    }
                                    R = Se, Z = I
                                } else Ee = oe, _e = H;
                            if (Z = 9 * (P - Ee >> 2) | 0, (R = 0 | o[Ee >> 2]) >>> 0 < 10) me = _e, he = Z, pe = Ee;
                            else
                                for (I = Z, Z = 10;;) {
                                    if (T = I + 1 | 0, R >>> 0 < (Z = 10 * Z | 0) >>> 0) {
                                        me = _e, he = T, pe = Ee;
                                        break
                                    }
                                    I = T
                                }
                        } else me = H, he = se, pe = oe;
                        be = he, ke = ie >>> 0 > (I = me + 4 | 0) >>> 0 ? I : ie, Ae = pe
                    } else be = se, ke = ie, Ae = oe;
                    for (I = ke;;) {
                        if (I >>> 0 <= Ae >>> 0) {
                            Fe = 0;
                            break
                        }
                        if (0 | o[(Z = I + -4 | 0) >> 2]) {
                            Fe = 1;
                            break
                        }
                        I = Z
                    }
                    H = 0 - be | 0;
                    do {
                        if (O) {
                            if ((0 | (Z = (1 & (1 ^ y)) + g | 0)) > (0 | be) & (0 | be) > -5 ? (ve = u + -1 | 0, Me = Z + -1 - be | 0) : (ve = u + -2 | 0, Me = Z + -1 | 0), !(Z = 8 & s)) {
                                if (Fe && 0 != (0 | (R = 0 | o[I + -4 >> 2])))
                                    if ((R >>> 0) % 10 | 0) ye = 0;
                                    else
                                        for (T = 0, J = 10;;) {
                                            if (K = T + 1 | 0, 0 | (R >>> 0) % ((J = 10 * J | 0) >>> 0)) {
                                                ye = K;
                                                break
                                            }
                                            T = K
                                        } else ye = 9;
                                if (T = (9 * (I - P >> 2) | 0) - 9 | 0, 102 == (32 | ve)) {
                                    Te = ve, ge = (0 | Me) < (0 | (R = (0 | (J = T - ye | 0)) > 0 ? J : 0)) ? Me : R, we = 0;
                                    break
                                }
                                Te = ve, ge = (0 | Me) < (0 | (T = (0 | (R = T + be - ye | 0)) > 0 ? R : 0)) ? Me : T, we = 0;
                                break
                            }
                            Te = ve, ge = Me, we = Z
                        } else Te = u, ge = g, we = 8 & s
                    } while (0);
                    if (P = 0 != (0 | (g = ge | we)) & 1, y = 102 == (32 | Te)) Oe = 0, Re = (0 | be) > 0 ? be : 0;
                    else {
                        if (T = 0 | ne(O = (0 | be) < 0 ? H : be, ((0 | O) < 0) << 31 >> 31, b), ((O = b) - T | 0) < 2)
                            for (R = T;;) {
                                if (t[(J = R + -1 | 0) >> 0] = 48, !((O - J | 0) < 2)) {
                                    Ne = J;
                                    break
                                }
                                R = J
                            } else Ne = T;
                        t[Ne + -1 >> 0] = 43 + (be >> 31 & 2), t[(R = Ne + -2 | 0) >> 0] = Te, Oe = R, Re = O - R | 0
                    }
                    if (ae(e, 32, n, R = v + 1 + ge + P + Re | 0, s), $(e, M, v), ae(e, 48, n, R, 65536 ^ s), y) {
                        j = J = m + 9 | 0, Q = m + 8 | 0, K = H = Ae >>> 0 > D >>> 0 ? D : Ae;
                        do {
                            if (B = 0 | ne(0 | o[K >> 2], 0, J), (0 | K) == (0 | H))(0 | B) == (0 | J) ? (t[Q >> 0] = 48, Pe = Q) : Pe = B;
                            else if (B >>> 0 > m >>> 0)
                                for (xe(0 | m, 48, B - h | 0), w = B;;) {
                                    if (!((ee = w + -1 | 0) >>> 0 > m >>> 0)) {
                                        Pe = ee;
                                        break
                                    }
                                    w = ee
                                } else Pe = B;
                            $(e, Pe, j - Pe | 0), K = K + 4 | 0
                        } while (K >>> 0 <= D >>> 0);
                        if (0 | g && $(e, 1894, 1), K >>> 0 < I >>> 0 & (0 | ge) > 0)
                            for (D = ge, j = K;;) {
                                if ((Q = 0 | ne(0 | o[j >> 2], 0, J)) >>> 0 > m >>> 0)
                                    for (xe(0 | m, 48, Q - h | 0), H = Q;;) {
                                        if (!((y = H + -1 | 0) >>> 0 > m >>> 0)) {
                                            Ce = y;
                                            break
                                        }
                                        H = y
                                    } else Ce = Q;
                                if ($(e, Ce, (0 | D) < 9 ? D : 9), H = D + -9 | 0, !((j = j + 4 | 0) >>> 0 < I >>> 0 & (0 | D) > 9)) {
                                    De = H;
                                    break
                                }
                                D = H
                            } else De = ge;
                        ae(e, 48, De + 9 | 0, 9, 0)
                    } else {
                        if (D = Fe ? I : Ae + 4 | 0, (0 | ge) > -1)
                            for (J = 0 == (0 | we), K = j = m + 9 | 0, g = 0 - h | 0, H = m + 8 | 0, B = ge, y = Ae;;) {
                                (0 | (P = 0 | ne(0 | o[y >> 2], 0, j))) == (0 | j) ? (t[H >> 0] = 48, Le = H) : Le = P;
                                do {
                                    if ((0 | y) == (0 | Ae)) {
                                        if (P = Le + 1 | 0, $(e, Le, 1), J & (0 | B) < 1) {
                                            He = P;
                                            break
                                        }
                                        $(e, 1894, 1), He = P
                                    } else {
                                        if (Le >>> 0 <= m >>> 0) {
                                            He = Le;
                                            break
                                        }
                                        for (xe(0 | m, 48, Le + g | 0), P = Le;;) {
                                            if (!((O = P + -1 | 0) >>> 0 > m >>> 0)) {
                                                He = O;
                                                break
                                            }
                                            P = O
                                        }
                                    }
                                } while (0);
                                if ($(e, He, (0 | B) > (0 | (Q = K - He | 0)) ? Q : B), !((y = y + 4 | 0) >>> 0 < D >>> 0 & (0 | (P = B - Q | 0)) > -1)) {
                                    Ue = P;
                                    break
                                }
                                B = P
                            } else Ue = ge;
                        ae(e, 48, Ue + 18 | 0, 18, 0), $(e, Oe, b - Oe | 0)
                    }
                    ae(e, 32, n, R, 8192 ^ s), Y = R
                } else B = 0 != (32 & u | 0), ae(e, 32, n, D = v + 3 | 0, -65537 & s), $(e, M, v), $(e, F != F | !1 ? B ? 1870 : 1874 : B ? 1862 : 1866, 3), ae(e, 32, n, D, 8192 ^ s), Y = D
            } while (0);
            return l = c, 0 | ((0 | Y) < (0 | n) ? n : Y)
        }

        function ce(e) {
            e = +e;
            var r;
            return a[c >> 3] = e, r = 0 | o[c >> 2], E = 0 | o[c + 4 >> 2], 0 | r
        }

        function le(e, r) {
            return + +fe(e = +e, r |= 0)
        }

        function fe(e, r) {
            e = +e, r |= 0;
            var t, n, i, s = 0,
                u = 0,
                l = 0;
            switch (a[c >> 3] = e, 2047 & (i = 0 | He(0 | (t = 0 | o[c >> 2]), 0 | (n = 0 | o[c + 4 >> 2]), 52))) {
                case 0:
                    0 != e ? (s = +fe(0x10000000000000000 * e, r), u = (0 | o[r >> 2]) - 64 | 0) : (s = e, u = 0), o[r >> 2] = u, l = s;
                    break;
                case 2047:
                    l = e;
                    break;
                default:
                    o[r >> 2] = (2047 & i) - 1022, o[c >> 2] = t, o[c + 4 >> 2] = -2146435073 & n | 1071644672, l = +a[c >> 3]
            }
            return +l
        }

        function de() {
            return 588
        }

        function Se(e, r) {
            r |= 0;
            var t;
            return t = 0 | Xe(0 | (e |= 0)), 0 | (0 == (0 | r) ? e : t)
        }

        function Ee(e, r, n) {
            e |= 0, r |= 0;
            var i = 0,
                a = 0,
                s = 0,
                u = 0,
                c = 0,
                l = 0,
                f = 0,
                d = 0,
                S = 0,
                E = 0,
                _ = 0;
            (a = 0 | o[(i = (n |= 0) + 16 | 0) >> 2]) ? (s = a, u = 5) : 0 | _e(n) ? c = 0 : (s = 0 | o[i >> 2], u = 5);
            e: do {
                if (5 == (0 | u)) {
                    if (l = i = 0 | o[(a = n + 20 | 0) >> 2], (s - i | 0) >>> 0 < r >>> 0) {
                        c = 0 | qe[7 & o[n + 36 >> 2]](n, e, r);
                        break
                    }
                    r: do {
                        if ((0 | t[n + 75 >> 0]) > -1) {
                            for (i = r;;) {
                                if (!i) {
                                    f = 0, d = e, S = r, E = l;
                                    break r
                                }
                                if (10 == (0 | t[e + (_ = i + -1 | 0) >> 0])) break;
                                i = _
                            }
                            if ((_ = 0 | qe[7 & o[n + 36 >> 2]](n, e, i)) >>> 0 < i >>> 0) {
                                c = _;
                                break e
                            }
                            f = i, d = e + i | 0, S = r - i | 0, E = 0 | o[a >> 2]
                        } else f = 0, d = e, S = r, E = l
                    } while (0);
                    je(0 | E, 0 | d, 0 | S), o[a >> 2] = (0 | o[a >> 2]) + S, c = f + S | 0
                }
            } while (0);
            return 0 | c
        }

        function _e(e) {
            var r = 0,
                n = 0,
                i = 0;
            return n = 0 | t[(r = (e |= 0) + 74 | 0) >> 0], t[r >> 0] = n + 255 | n, 8 & (n = 0 | o[e >> 2]) ? (o[e >> 2] = 32 | n, i = -1) : (o[e + 8 >> 2] = 0, o[e + 4 >> 2] = 0, r = 0 | o[e + 44 >> 2], o[e + 28 >> 2] = r, o[e + 20 >> 2] = r, o[e + 16 >> 2] = r + (0 | o[e + 48 >> 2]), i = 0), 0 | i
        }

        function me(e) {
            var r, n = 0,
                i = 0,
                a = 0,
                s = 0,
                u = 0,
                c = 0,
                l = 0,
                f = 0;
            r = e |= 0;
            e: do {
                if (3 & r)
                    for (a = e, s = r;;) {
                        if (!(0 | t[a >> 0])) {
                            u = s;
                            break e
                        }
                        if (!(3 & (s = c = a + 1 | 0))) {
                            n = c, i = 4;
                            break
                        }
                        a = c
                    } else n = e, i = 4
            } while (0);
            if (4 == (0 | i)) {
                for (i = n; !((-2139062144 & (l = 0 | o[i >> 2]) ^ -2139062144) & l + -16843009);) i = i + 4 | 0;
                if ((255 & l) << 24 >> 24)
                    for (l = i;;) {
                        if (!(0 | t[(i = l + 1 | 0) >> 0])) {
                            f = i;
                            break
                        }
                        l = i
                    } else f = i;
                u = f
            }
            return u - r | 0
        }

        function he(e, r) {
            var n;
            return n = 0 | function (e, r) {
                e |= 0;
                var n = 0,
                    i = 0,
                    a = 0,
                    s = 0,
                    u = 0,
                    c = 0,
                    l = 0,
                    f = 0,
                    d = 0;
                n = 255 & (r |= 0);
                e: do {
                    if (n) {
                        if (3 & e)
                            for (s = 255 & r, u = e;;) {
                                if ((c = 0 | t[u >> 0]) << 24 >> 24 == 0 || c << 24 >> 24 == s << 24 >> 24) {
                                    i = u;
                                    break e
                                }
                                if (!(3 & (c = u + 1 | 0))) {
                                    a = c;
                                    break
                                }
                                u = c
                            } else a = e;
                        u = 0 | _(n, 16843009), s = 0 | o[a >> 2];
                        r: do {
                            if ((-2139062144 & s ^ -2139062144) & s + -16843009) d = a;
                            else
                                for (c = a, l = s;;) {
                                    if ((-2139062144 & (f = l ^ u) ^ -2139062144) & f + -16843009 | 0) {
                                        d = c;
                                        break r
                                    }
                                    if ((-2139062144 & (l = 0 | o[(f = c + 4 | 0) >> 2]) ^ -2139062144) & l + -16843009 | 0) {
                                        d = f;
                                        break
                                    }
                                    c = f
                                }
                        } while (0);
                        for (u = 255 & r, s = d;;) {
                            if ((c = 0 | t[s >> 0]) << 24 >> 24 == 0 || c << 24 >> 24 == u << 24 >> 24) {
                                i = s;
                                break
                            }
                            s = s + 1 | 0
                        }
                    } else i = e + (0 | me(e)) | 0
                } while (0);
                return 0 | i
            }(e |= 0, r |= 0), 0 | ((0 | t[n >> 0]) == (255 & r) << 24 >> 24 ? n : 0)
        }

        function pe(e, r) {
            r |= 0;
            var t;
            return ((0 | function (e, r, t, n) {
                e |= 0, n |= 0;
                var i = 0,
                    a = 0,
                    s = 0,
                    u = 0,
                    c = 0;
                i = 0 | _(t = t | 0, r = r | 0), a = 0 == (0 | r) ? 0 : t, (0 | o[n + 76 >> 2]) > -1 ? (t = 0 == (0 | Z()), s = 0 | Ee(e, i, n), t || Q(), u = s) : u = 0 | Ee(e, i, n);
                c = (0 | u) == (0 | i) ? a : (u >>> 0) / (r >>> 0) | 0;
                return 0 | c
            }(e |= 0, 1, t = 0 | me(e), r)) != (0 | t)) << 31 >> 31 | 0
        }

        function be(e) {
            var r = 0,
                t = 0;
            0 | o[(e |= 0) + 68 >> 2] && (t = e + 112 | 0, 0 | (r = 0 | o[e + 116 >> 2]) && (o[r + 112 >> 2] = o[t >> 2]), e = 0 | o[t >> 2], o[(e ? e + 116 | 0 : 820) >> 2] = r)
        }

        function ke(e, r) {
            e |= 0, r |= 0;
            var n, a, s, u = 0,
                c = 0,
                d = 0,
                S = 0,
                E = 0,
                _ = 0;
            n = l, (0 | (l = l + 16 | 0)) >= (0 | f) && k(16), s = 255 & r, t[(a = n) >> 0] = s, (c = 0 | o[(u = e + 16 | 0) >> 2]) ? (d = c, S = 4) : 0 | _e(e) ? E = -1 : (d = 0 | o[u >> 2], S = 4);
            do {
                if (4 == (0 | S)) {
                    if ((u = 0 | o[(c = e + 20 | 0) >> 2]) >>> 0 < d >>> 0 && (0 | (_ = 255 & r)) != (0 | t[e + 75 >> 0])) {
                        o[c >> 2] = u + 1, t[u >> 0] = s, E = _;
                        break
                    }
                    E = 1 == (0 | qe[7 & o[e + 36 >> 2]](e, a, 1)) ? 0 | i[a >> 0] : -1
                }
            } while (0);
            return l = n, 0 | E
        }

        function Ae() {
            return T(4352), 4360
        }

        function Fe() {
            D(4352)
        }

        function ve(e) {
            var r, t = 0,
                n = 0,
                i = 0,
                a = 0,
                s = 0;
            return t = (0 | o[(e |= 0) + 76 >> 2]) > -1 ? 0 | Z() : 0, be(e), (r = 0 != (1 & o[e >> 2] | 0)) || (n = 0 | Ae(), a = e + 56 | 0, 0 | (i = 0 | o[e + 52 >> 2]) && (o[i + 56 >> 2] = o[a >> 2]), 0 | (s = 0 | o[a >> 2]) && (o[s + 52 >> 2] = i), (0 | o[n >> 2]) == (0 | e) && (o[n >> 2] = s), Fe()), s = 0 | Me(e), n = 0 | We[1 & o[e + 12 >> 2]](e) | s, 0 | (s = 0 | o[e + 92 >> 2]) && K(s), r ? 0 | t && Q() : K(e), 0 | n
        }

        function Me(e) {
            e |= 0;
            var r = 0,
                t = 0,
                n = 0,
                i = 0,
                a = 0,
                s = 0,
                u = 0;
            do {
                if (e) {
                    if ((0 | o[e + 76 >> 2]) <= -1) {
                        r = 0 | ye(e);
                        break
                    }
                    t = 0 == (0 | Z()), n = 0 | ye(e), t || Q(), r = n
                } else {
                    if (i = 0 | o[240] ? 0 | Me(0 | o[240]) : 0, n = 0 | Ae(), t = 0 | o[n >> 2])
                        for (n = t, t = i;;) {
                            if (s = (0 | o[n + 76 >> 2]) > -1 ? 0 | Z() : 0, u = (0 | o[n + 20 >> 2]) >>> 0 > (0 | o[n + 28 >> 2]) >>> 0 ? 0 | ye(n) | t : t, 0 | s && Q(), !(n = 0 | o[n + 56 >> 2])) {
                                a = u;
                                break
                            }
                            t = u
                        } else a = i;
                    Fe(), r = a
                }
            } while (0);
            return 0 | r
        }

        function ye(e) {
            var r, t, n = 0,
                i = 0,
                a = 0,
                s = 0,
                u = 0;
            return t = (e |= 0) + 28 | 0, (0 | o[(r = e + 20 | 0) >> 2]) >>> 0 > (0 | o[t >> 2]) >>> 0 && (qe[7 & o[e + 36 >> 2]](e, 0, 0), 0 == (0 | o[r >> 2])) ? n = -1 : ((a = 0 | o[(i = e + 4 | 0) >> 2]) >>> 0 < (u = 0 | o[(s = e + 8 | 0) >> 2]) >>> 0 && qe[7 & o[e + 40 >> 2]](e, a - u | 0, 1), o[e + 16 >> 2] = 0, o[t >> 2] = 0, o[r >> 2] = 0, o[s >> 2] = 0, o[i >> 2] = 0, n = 0), 0 | n
        }

        function Te(e, r, t) {
            return 0 | function (e, r, t) {
                r |= 0, t |= 0;
                var n = 0,
                    i = 0,
                    a = 0;
                (0 | o[76 + (e |= 0) >> 2]) > -1 ? (n = 0 == (0 | Z()), i = 0 | ge(e, r, t), n || Q(), a = i) : a = 0 | ge(e, r, t);
                return 0 | a
            }(e |= 0, r |= 0, t |= 0)
        }

        function ge(e, r, t) {
            e |= 0, r |= 0;
            var n, i = 0,
                a = 0;
            return i = 1 == (0 | (t |= 0)) ? r - (0 | o[e + 8 >> 2]) + (0 | o[e + 4 >> 2]) | 0 : r, n = e + 28 | 0, (0 | o[(r = e + 20 | 0) >> 2]) >>> 0 > (0 | o[n >> 2]) >>> 0 && (qe[7 & o[e + 36 >> 2]](e, 0, 0), 0 == (0 | o[r >> 2])) ? a = -1 : (o[e + 16 >> 2] = 0, o[n >> 2] = 0, o[r >> 2] = 0, (0 | qe[7 & o[e + 40 >> 2]](e, i, t)) < 0 ? a = -1 : (o[e + 8 >> 2] = 0, o[e + 4 >> 2] = 0, o[e >> 2] = -17 & o[e >> 2], a = 0)), 0 | a
        }

        function we(e) {
            var r, t = 0;
            return t = 128 & o[(e |= 0) >> 2] && (0 | o[e + 20 >> 2]) >>> 0 > (0 | o[e + 28 >> 2]) >>> 0 ? 2 : 1, 0 | ((0 | (r = 0 | qe[7 & o[e + 40 >> 2]](e, 0, t))) < 0 ? r : r - (0 | o[e + 8 >> 2]) + (0 | o[e + 4 >> 2]) + (0 | o[e + 20 >> 2]) - (0 | o[e + 28 >> 2]) | 0)
        }

        function Oe(e, r, n, i) {
            e |= 0, i |= 0;
            var a, s, u, c, l, f, d = 0,
                S = 0,
                E = 0,
                m = 0,
                h = 0,
                p = 0,
                b = 0,
                k = 0;
            a = 0 | _(n |= 0, r |= 0), s = 0 == (0 | r) ? 0 : n, d = (0 | o[i + 76 >> 2]) > -1 ? 0 | Z() : 0, S = 0 | t[(n = i + 74 | 0) >> 0], t[n >> 0] = S + 255 | S, n = 0 | o[(S = i + 4 | 0) >> 2], m = (E = (0 | o[i + 8 >> 2]) - n | 0) >>> 0 < a >>> 0 ? E : a, (0 | E) > 0 ? (je(0 | e, 0 | n, 0 | m), o[S >> 2] = n + m, h = a - m | 0, p = e + m | 0) : (h = a, p = e);
            e: do {
                if (h) {
                    for (e = i + 32 | 0, m = h, n = p; !(0 | (u = i, c = void 0, l = void 0, f = void 0, c = 0, l = 0, f = 0, l = 0 | t[(c = 74 + (u |= 0) | 0) >> 0], t[c >> 0] = l + 255 | l, c = u + 28 | 0, (0 | o[(l = u + 20 | 0) >> 2]) >>> 0 > (0 | o[c >> 2]) >>> 0 && qe[7 & o[u + 36 >> 2]](u, 0, 0), o[u + 16 >> 2] = 0, o[c >> 2] = 0, o[l >> 2] = 0, 4 & (l = 0 | o[u >> 2]) ? (o[u >> 2] = 32 | l, f = -1) : (c = (0 | o[u + 44 >> 2]) + (0 | o[u + 48 >> 2]) | 0, o[u + 8 >> 2] = c, o[u + 4 >> 2] = c, f = l << 27 >> 31), 0 | f) || ((S = 0 | qe[7 & o[e >> 2]](i, n, m)) + 1 | 0) >>> 0 < 2);) {
                        if (!(E = m - S | 0)) {
                            b = 13;
                            break e
                        }
                        m = E, n = n + S | 0
                    }
                    0 | d && Q(), k = ((a - m | 0) >>> 0) / (r >>> 0) | 0
                } else b = 13
            } while (0);
            return 13 == (0 | b) && (d ? (Q(), k = s) : k = s), 0 | k
        }

        function Re(e) {
            return 0 | (r = e |= 0, t = 0, n = 0, i = 0, (0 | o[76 + (r |= 0) >> 2]) > -1 ? (t = 0 == (0 | Z()), n = 0 | we(r), t || Q(), i = n) : i = 0 | we(r), 0 | i);
            var r, t, n, i
        }

        function Ne(e, r) {
            e |= 0, r |= 0;
            var n, i;
            return n = l, (0 | (l = l + 16 | 0)) >= (0 | f) && k(16), o[(i = n) >> 2] = r, r = 0 | function (e, r, n) {
                e |= 0, r |= 0, n |= 0;
                var i, a, s, u = 0,
                    c = 0,
                    d = 0,
                    S = 0,
                    E = 0,
                    _ = 0,
                    m = 0,
                    h = 0,
                    p = 0,
                    b = 0,
                    A = 0,
                    F = 0;
                i = l, (0 | (l = l + 224 | 0)) >= (0 | f) && k(224), a = i + 120 | 0, s = i, c = i + 136 | 0, S = 40 + (d = u = i + 80 | 0) | 0;
                do {
                    o[d >> 2] = 0, d = d + 4 | 0
                } while ((0 | d) < (0 | S));
                return o[a >> 2] = o[n >> 2], (0 | q(0, r, a, s, u)) < 0 ? E = -1 : (_ = (0 | o[e + 76 >> 2]) > -1 ? 0 | Z() : 0, d = 32 & (n = 0 | o[e >> 2]), (0 | t[e + 74 >> 0]) < 1 && (o[e >> 2] = -33 & n), 0 | o[(n = e + 48 | 0) >> 2] ? A = 0 | q(e, r, a, s, u) : (m = 0 | o[(S = e + 44 | 0) >> 2], o[S >> 2] = c, o[(h = e + 28 | 0) >> 2] = c, o[(p = e + 20 | 0) >> 2] = c, o[n >> 2] = 80, o[(b = e + 16 | 0) >> 2] = c + 80, c = 0 | q(e, r, a, s, u), m ? (qe[7 & o[e + 36 >> 2]](e, 0, 0), F = 0 == (0 | o[p >> 2]) ? -1 : c, o[S >> 2] = m, o[n >> 2] = 0, o[b >> 2] = 0, o[h >> 2] = 0, o[p >> 2] = 0, A = F) : A = c), u = 0 | o[e >> 2], o[e >> 2] = u | d, 0 | _ && Q(), E = 0 == (32 & u | 0) ? A : -1), l = i, 0 | E
            }(0 | o[208], e, i), l = n, 0 | r
        }

        function Pe(e) {
            return 0 | function (e, r) {
                var n, i, a = 0,
                    s = 0,
                    u = 0,
                    c = 0,
                    l = 0;
                n = 255 & (e |= 0), i = 255 & e, (0 | o[76 + (r |= 0) >> 2]) >= 0 && 0 != (0 | Z()) ? ((0 | i) != (0 | t[r + 75 >> 0]) && (s = 0 | o[(a = r + 20 | 0) >> 2]) >>> 0 < (0 | o[r + 16 >> 2]) >>> 0 ? (o[a >> 2] = s + 1, t[s >> 0] = n, u = i) : u = 0 | ke(r, e), Q(), c = u) : l = 3;
                do {
                    if (3 == (0 | l)) {
                        if ((0 | i) != (0 | t[r + 75 >> 0]) && (s = 0 | o[(u = r + 20 | 0) >> 2]) >>> 0 < (0 | o[r + 16 >> 2]) >>> 0) {
                            o[u >> 2] = s + 1, t[s >> 0] = n, c = i;
                            break
                        }
                        c = 0 | ke(r, e)
                    }
                } while (0);
                return 0 | c
            }(e |= 0, 0 | o[208])
        }

        function Ce(e) {
            e |= 0;
            var r, n = 0,
                i = 0,
                a = 0,
                s = 0;
            r = 0 | o[208], n = (0 | o[r + 76 >> 2]) > -1 ? 0 | Z() : 0;
            do {
                if ((0 | pe(e, r)) < 0) i = 1;
                else {
                    if (10 != (0 | t[r + 75 >> 0]) && (s = 0 | o[(a = r + 20 | 0) >> 2]) >>> 0 < (0 | o[r + 16 >> 2]) >>> 0) {
                        o[a >> 2] = s + 1, t[s >> 0] = 10, i = 0;
                        break
                    }
                    i = (0 | ke(r, 10)) < 0
                }
            } while (0);
            return 0 | n && Q(), i << 31 >> 31 | 0
        }

        function De(e) {
            var r = 0;
            (0 | o[(e |= 0) + 76 >> 2]) > -1 ? (r = 0 == (0 | Z()), ge(e, 0, 0), o[e >> 2] = -33 & o[e >> 2], r || Q()) : (ge(e, 0, 0), o[e >> 2] = -33 & o[e >> 2])
        }

        function Le(e, r, t, n) {
            return (r |= 0) - (n |= 0) >>> 0, 0 | (E = r - n - ((t |= 0) >>> 0 > (e |= 0) >>> 0 | 0) >>> 0, e - t >>> 0 | 0)
        }

        function Ie(e, r, t, n) {
            var o;
            return 0 | (E = (r |= 0) + (n |= 0) + ((o = (e |= 0) + (t |= 0) >>> 0) >>> 0 < e >>> 0 | 0) >>> 0, 0 | o)
        }

        function xe(e, r, n) {
            r |= 0;
            var i, a = 0,
                s = 0,
                u = 0;
            if (i = (e |= 0) + (n |= 0) | 0, r &= 255, (0 | n) >= 67) {
                for (; 3 & e;) t[e >> 0] = r, e = e + 1 | 0;
                for (s = (a = -4 & i | 0) - 64 | 0, u = r | r << 8 | r << 16 | r << 24;
                    (0 | e) <= (0 | s);) o[e >> 2] = u, o[e + 4 >> 2] = u, o[e + 8 >> 2] = u, o[e + 12 >> 2] = u, o[e + 16 >> 2] = u, o[e + 20 >> 2] = u, o[e + 24 >> 2] = u, o[e + 28 >> 2] = u, o[e + 32 >> 2] = u, o[e + 36 >> 2] = u, o[e + 40 >> 2] = u, o[e + 44 >> 2] = u, o[e + 48 >> 2] = u, o[e + 52 >> 2] = u, o[e + 56 >> 2] = u, o[e + 60 >> 2] = u, e = e + 64 | 0;
                for (;
                    (0 | e) < (0 | a);) o[e >> 2] = u, e = e + 4 | 0
            }
            for (;
                (0 | e) < (0 | i);) t[e >> 0] = r, e = e + 1 | 0;
            return i - n | 0
        }

        function He(e, r, t) {
            return e |= 0, r |= 0, (0 | (t |= 0)) < 32 ? (E = r >>> t, e >>> t | (r & (1 << t) - 1) << 32 - t) : (E = 0, r >>> t - 32 | 0)
        }

        function Be(e, r, t) {
            return e |= 0, r |= 0, (0 | (t |= 0)) < 32 ? (E = r << t | (e & (1 << t) - 1 << 32 - t) >>> 32 - t, e << t) : (E = e << t - 32, 0)
        }

        function Ue(e) {
            var r = 0;
            return (0 | (r = 0 | t[d + (255 & (e |= 0)) >> 0])) < 8 ? 0 | r : (0 | (r = 0 | t[d + (e >> 8 & 255) >> 0])) < 8 ? r + 8 | 0 : (0 | (r = 0 | t[d + (e >> 16 & 255) >> 0])) < 8 ? r + 16 | 0 : 24 + (0 | t[d + (e >>> 24) >> 0]) | 0
        }

        function Ye(e, r, t, n, i) {
            i |= 0;
            var a, s = 0,
                u = 0,
                c = 0,
                l = 0,
                f = 0,
                d = 0,
                S = 0,
                _ = 0,
                h = 0,
                p = 0,
                b = 0,
                k = 0,
                A = 0,
                F = 0,
                v = 0,
                M = 0,
                y = 0,
                T = 0,
                g = 0,
                w = 0,
                O = 0,
                R = 0,
                N = 0,
                P = 0,
                C = 0,
                D = 0;
            if (s = e |= 0, a = t |= 0, f = l = n |= 0, !(c = u = r |= 0)) return d = 0 != (0 | i), f ? d ? (o[i >> 2] = 0 | e, o[i + 4 >> 2] = 0 & r, 0 | (E = S = 0, _ = 0)) : 0 | (E = S = 0, _ = 0) : (d && (o[i >> 2] = (s >>> 0) % (a >>> 0), o[i + 4 >> 2] = 0), 0 | (E = S = 0, _ = (s >>> 0) / (a >>> 0) >>> 0));
            d = 0 == (0 | f);
            do {
                if (a) {
                    if (!d) {
                        if ((h = (0 | m(0 | f)) - (0 | m(0 | c)) | 0) >>> 0 <= 31) {
                            A = p = h + 1 | 0, F = s >>> (p >>> 0) & (k = h - 31 >> 31) | c << (b = 31 - h | 0), v = c >>> (p >>> 0) & k, M = 0, y = s << b;
                            break
                        }
                        return i ? (o[i >> 2] = 0 | e, o[i + 4 >> 2] = u | 0 & r, 0 | (E = S = 0, _ = 0)) : 0 | (E = S = 0, _ = 0)
                    }
                    if ((b = a - 1 | 0) & a | 0) {
                        A = k = 33 + (0 | m(0 | a)) - (0 | m(0 | c)) | 0, F = (h = 32 - k | 0) - 1 >> 31 & c >>> ((g = k - 32 | 0) >>> 0) | (c << h | s >>> (k >>> 0)) & (w = g >> 31), v = w & c >>> (k >>> 0), M = s << (p = 64 - k | 0) & (T = h >> 31), y = (c << p | s >>> (g >>> 0)) & T | s << h & k - 33 >> 31;
                        break
                    }
                    return 0 | i && (o[i >> 2] = b & s, o[i + 4 >> 2] = 0), 1 == (0 | a) ? 0 | (E = S = u | 0 & r, _ = 0 | e) : (b = 0 | Ue(0 | a), 0 | (E = S = c >>> (b >>> 0) | 0, _ = c << 32 - b | s >>> (b >>> 0) | 0))
                }
                if (d) return 0 | i && (o[i >> 2] = (c >>> 0) % (a >>> 0), o[i + 4 >> 2] = 0), 0 | (E = S = 0, _ = (c >>> 0) / (a >>> 0) >>> 0);
                if (!s) return 0 | i && (o[i >> 2] = 0, o[i + 4 >> 2] = (c >>> 0) % (f >>> 0)), 0 | (E = S = 0, _ = (c >>> 0) / (f >>> 0) >>> 0);
                if (!((b = f - 1 | 0) & f)) return 0 | i && (o[i >> 2] = 0 | e, o[i + 4 >> 2] = b & c | 0 & r), S = 0, _ = c >>> ((0 | Ue(0 | f)) >>> 0), 0 | (E = S, _);
                if ((b = (0 | m(0 | f)) - (0 | m(0 | c)) | 0) >>> 0 <= 30) {
                    A = k = b + 1 | 0, F = c << (h = 31 - b | 0) | s >>> (k >>> 0), v = c >>> (k >>> 0), M = 0, y = s << h;
                    break
                }
                return i ? (o[i >> 2] = 0 | e, o[i + 4 >> 2] = u | 0 & r, 0 | (E = S = 0, _ = 0)) : 0 | (E = S = 0, _ = 0)
            } while (0);
            if (A) {
                n = 0 | Ie(0 | (r = 0 | t), 0 | (t = l | 0 & n), -1, -1), l = E, u = y, y = M, M = v, v = F, F = A, A = 0;
                do {
                    e = u, u = y >>> 31 | u << 1, y = A | y << 1, Le(0 | n, 0 | l, 0 | (s = v << 1 | e >>> 31 | 0), 0 | (e = v >>> 31 | M << 1 | 0)), A = 1 & (f = (c = E) >> 31 | ((0 | c) < 0 ? -1 : 0) << 1), v = 0 | Le(0 | s, 0 | e, f & r | 0, (((0 | c) < 0 ? -1 : 0) >> 31 | ((0 | c) < 0 ? -1 : 0) << 1) & t | 0), M = E, F = F - 1 | 0
                } while (0 != (0 | F));
                O = u, R = y, N = M, P = v, C = 0, D = A
            } else O = y, R = M, N = v, P = F, C = 0, D = 0;
            return A = R, R = 0, 0 | i && (o[i >> 2] = P, o[i + 4 >> 2] = N), 0 | (E = S = (0 | A) >>> 31 | (O | R) << 1 | 0 & (R << 1 | A >>> 31) | C, _ = -2 & (A << 1 | 0) | D)
        }

        function ze(e, r, t, n) {
            return 0 | Ye(e |= 0, r |= 0, t |= 0, n |= 0, 0)
        }

        function Ve(e) {
            var r, t;
            return (0 | (e = (e |= 0) + 15 & -16 | 0)) > 0 & (0 | (t = (r = 0 | o[u >> 2]) + e | 0)) < (0 | r) | (0 | t) < 0 ? (b(), w(12), -1) : (o[u >> 2] = t, (0 | t) > (0 | p()) && 0 == (0 | h()) ? (o[u >> 2] = r, w(12), -1) : 0 | r)
        }

        function Ke(e, r, t, n) {
            var i, a;
            return i = l, l = l + 16 | 0, Ye(e |= 0, r |= 0, t |= 0, n |= 0, a = 0 | i), l = i, 0 | (E = 0 | o[a + 4 >> 2], 0 | o[a >> 2])
        }

        function je(e, r, n) {
            e |= 0, r |= 0;
            var i, a, s = 0;
            if ((0 | (n |= 0)) >= 8192) return 0 | P(0 | e, 0 | r, 0 | n);
            if (i = 0 | e, a = e + n | 0, (3 & e) == (3 & r)) {
                for (; 3 & e;) {
                    if (!n) return 0 | i;
                    t[e >> 0] = 0 | t[r >> 0], e = e + 1 | 0, r = r + 1 | 0, n = n - 1 | 0
                }
                for (n = (s = -4 & a | 0) - 64 | 0;
                    (0 | e) <= (0 | n);) o[e >> 2] = o[r >> 2], o[e + 4 >> 2] = o[r + 4 >> 2], o[e + 8 >> 2] = o[r + 8 >> 2], o[e + 12 >> 2] = o[r + 12 >> 2], o[e + 16 >> 2] = o[r + 16 >> 2], o[e + 20 >> 2] = o[r + 20 >> 2], o[e + 24 >> 2] = o[r + 24 >> 2], o[e + 28 >> 2] = o[r + 28 >> 2], o[e + 32 >> 2] = o[r + 32 >> 2], o[e + 36 >> 2] = o[r + 36 >> 2], o[e + 40 >> 2] = o[r + 40 >> 2], o[e + 44 >> 2] = o[r + 44 >> 2], o[e + 48 >> 2] = o[r + 48 >> 2], o[e + 52 >> 2] = o[r + 52 >> 2], o[e + 56 >> 2] = o[r + 56 >> 2], o[e + 60 >> 2] = o[r + 60 >> 2], e = e + 64 | 0, r = r + 64 | 0;
                for (;
                    (0 | e) < (0 | s);) o[e >> 2] = o[r >> 2], e = e + 4 | 0, r = r + 4 | 0
            } else
                for (s = a - 4 | 0;
                    (0 | e) < (0 | s);) t[e >> 0] = 0 | t[r >> 0], t[e + 1 >> 0] = 0 | t[r + 1 >> 0], t[e + 2 >> 0] = 0 | t[r + 2 >> 0], t[e + 3 >> 0] = 0 | t[r + 3 >> 0], e = e + 4 | 0, r = r + 4 | 0;
            for (;
                (0 | e) < (0 | a);) t[e >> 0] = 0 | t[r >> 0], e = e + 1 | 0, r = r + 1 | 0;
            return 0 | i
        }

        function Xe(e) {
            return (255 & (e |= 0)) << 24 | (e >> 8 & 255) << 16 | (e >> 16 & 255) << 8 | e >>> 24 | 0
        }

        function Ge(e, r, t) {
            return 0, 0, 0, F(1), 0
        }
        var We = [function (e) {
                return 0, A(0), 0
            }, function (e) {
                e |= 0;
                var r, t, n, i = 0;
                return r = l, (0 | (l = l + 16 | 0)) >= (0 | f) && k(16), t = r, i = 0 | (n = 0 | o[e + 60 >> 2], 0 | (n |= 0)), o[t >> 2] = i, i = 0 | X(0 | g(6, 0 | t)), l = r, 0 | i
            }],
            qe = [Ge, function (e, r, n) {
                e |= 0, r |= 0, n |= 0;
                var i, a = 0;
                return i = l, (0 | (l = l + 32 | 0)) >= (0 | f) && k(32), a = i, o[e + 36 >> 2] = 3, 0 == (64 & o[e >> 2] | 0) && (o[a >> 2] = o[e + 60 >> 2], o[a + 4 >> 2] = 21523, o[a + 8 >> 2] = i + 16, 0 | C(54, 0 | a)) && (t[e + 75 >> 0] = -1), a = 0 | j(e, r, n), l = i, 0 | a
            }, function (e, r, t) {
                e |= 0, r |= 0, t |= 0;
                var n, i, a, s = 0;
                return n = l, (0 | (l = l + 32 | 0)) >= (0 | f) && k(32), a = n + 20 | 0, o[(i = n) >> 2] = o[e + 60 >> 2], o[i + 4 >> 2] = 0, o[i + 8 >> 2] = r, o[i + 12 >> 2] = a, o[i + 16 >> 2] = t, (0 | X(0 | O(140, 0 | i))) < 0 ? (o[a >> 2] = -1, s = -1) : s = 0 | o[a >> 2], l = n, 0 | s
            }, j, function (e, r, n) {
                e |= 0, r |= 0, n |= 0;
                var i, a, s, u = 0,
                    c = 0,
                    d = 0,
                    S = 0,
                    E = 0;
                return i = l, (0 | (l = l + 32 | 0)) >= (0 | f) && k(32), u = i, o[(c = i + 16 | 0) >> 2] = r, d = c + 4 | 0, s = 0 | o[(a = e + 48 | 0) >> 2], o[d >> 2] = n - (0 != (0 | s) & 1), S = e + 44 | 0, o[c + 8 >> 2] = o[S >> 2], o[c + 12 >> 2] = s, o[u >> 2] = o[e + 60 >> 2], o[u + 4 >> 2] = c, o[u + 8 >> 2] = 2, (0 | (c = 0 | X(0 | L(145, 0 | u)))) >= 1 ? c >>> 0 > (u = 0 | o[d >> 2]) >>> 0 ? (d = 0 | o[S >> 2], o[(S = e + 4 | 0) >> 2] = d, o[e + 8 >> 2] = d + (c - u), 0 | o[a >> 2] ? (o[S >> 2] = d + 1, t[r + (n + -1) >> 0] = 0 | t[d >> 0], E = n) : E = n) : E = c : (o[e >> 2] = o[e >> 2] | 48 & c ^ 16, E = c), l = i, 0 | E
            }, Ge, Ge, Ge];
        return {
            _llvm_bswap_i32: Xe,
            _i64Subtract: Le,
            ___udivdi3: ze,
            setThrew: function (e, r) {
                e |= 0, r |= 0, S || (S = e, _0x5a7807 = r)
            },
            _bitshift64Lshr: He,
            _bitshift64Shl: Be,
            _fflush: Me,
            ___errno_location: G,
            _extract: function (e) {
                return function (e, r) {
                    e |= 0, r |= 0;
                    var n, a, s, u, c, d, S, E, _ = 0,
                        m = 0,
                        h = 0,
                        p = 0,
                        b = 0,
                        A = 0,
                        F = 0,
                        v = 0,
                        T = 0,
                        g = 0,
                        w = 0,
                        O = 0,
                        R = 0,
                        N = 0,
                        P = 0,
                        C = 0,
                        D = 0,
                        L = 0,
                        I = 0,
                        Y = 0,
                        j = 0,
                        X = 0;
                    if (r = l, (0 | (l = l + 4192 | 0)) >= (0 | f) && k(4192), n = r + 32 | 0, a = r + 24 | 0, s = r + 16 | 0, u = r + 8 | 0, _ = r, c = r + 40 | 0, S = r + 88 | 0, o[(d = r + 36 | 0) >> 2] = 0, (0 | (E = 0 | x(e, d))) < 22) return o[_ >> 2] = 182, Ne(967, _), K(0 | o[d >> 2]), l = r, 0;
                    _ = E + -22 | 0;
                    e: do {
                        if ((0 | _) > 22) {
                            for (m = (e = 0 | o[d >> 2]) + E | 0, h = _; 101010256 != ((0 | i[1 + (A = 1 + (b = 1 + (p = e + h | 0) | 0) | 0) >> 0]) << 24 | (0 | i[A >> 0]) << 16 | (0 | i[b >> 0]) << 8 | 0 | i[p >> 0] | 0) || (p + 22 + ((0 | i[1 + (b = p + 20 | 0) >> 0]) << 8 | 0 | i[b >> 0]) | 0) != (0 | m);)
                                if ((0 | (h = h + -1 | 0)) <= 22) break e;
                            if (A = e + ((0 | i[1 + (b = 1 + (m = 1 + (h = p + 16 | 0) | 0) | 0) >> 0]) << 24 | (0 | i[b >> 0]) << 16 | (0 | i[m >> 0]) << 8 | 0 | i[h >> 0]) | 0, 33639248 == ((0 | i[A + 3 >> 0]) << 24 | (0 | i[A + 2 >> 0]) << 16 | (0 | i[A + 1 >> 0]) << 8 | 0 | i[A >> 0] | 0))
                                for (h = A, m = 0;;) {
                                    if (b = ((0 | i[h + 27 >> 0]) << 24 | (0 | i[h + 26 >> 0]) << 16 | (0 | i[h + 25 >> 0]) << 8 | 0 | i[h + 24 >> 0]) + m | 0, h = h + (46 + ((0 | i[h + 29 >> 0]) << 8 | 0 | i[h + 28 >> 0]) + ((0 | i[h + 31 >> 0]) << 8 | 0 | i[h + 30 >> 0]) + ((0 | i[h + 33 >> 0]) << 8 | 0 | i[h + 32 >> 0])) | 0, 33639248 != ((0 | i[h + 3 >> 0]) << 24 | (0 | i[h + 2 >> 0]) << 16 | (0 | i[h + 1 >> 0]) << 8 | 0 | i[h >> 0] | 0)) {
                                        F = b;
                                        break
                                    }
                                    m = b
                                } else F = 0;
                            m = c + 4 | 0, h = c + 12 | 0, b = c + 16 | 0;
                            r: do {
                                if (33639248 == ((0 | i[A + 3 >> 0]) << 24 | (0 | i[A + 2 >> 0]) << 16 | (0 | i[A + 1 >> 0]) << 8 | 0 | i[A >> 0] | 0)) {
                                    for (v = 0, T = A; g = 0 | t[T + 10 >> 0], w = 0 | t[T + 11 >> 0], O = (0 | i[T + 19 >> 0]) << 24 | (0 | i[T + 18 >> 0]) << 16 | (0 | i[T + 17 >> 0]) << 8 | 0 | i[T + 16 >> 0], R = (0 | i[T + 23 >> 0]) << 24 | (0 | i[T + 22 >> 0]) << 16 | (0 | i[T + 21 >> 0]) << 8 | 0 | i[T + 20 >> 0], N = (0 | i[T + 27 >> 0]) << 24 | (0 | i[T + 26 >> 0]) << 16 | (0 | i[T + 25 >> 0]) << 8 | 0 | i[T + 24 >> 0], P = (0 | i[T + 29 >> 0]) << 8 | 0 | i[T + 28 >> 0], C = (0 | i[T + 33 >> 0]) << 8 | 0 | i[T + 32 >> 0], D = (0 | i[T + 31 >> 0]) << 8 | 0 | i[T + 30 >> 0], xe(0 | S, 0, 4096), !(P >>> 0 > 4095);) {
                                        switch (je(0 | S, T + 46 | 0, 0 | P), Y = 28 + (L = e + ((0 | i[T + 45 >> 0]) << 24 | (0 | i[T + 44 >> 0]) << 16 | (0 | i[T + 43 >> 0]) << 8 | 0 | i[T + 42 >> 0]) | 0) | 0, j = L + 30 + ((0 | i[1 + (I = L + 26 | 0) >> 0]) << 8 | 0 | i[I >> 0]) + ((0 | i[Y + 1 >> 0]) << 8 | 0 | i[Y >> 0]) | 0, (65535 & ((255 & w) << 8 | 255 & g)) << 16 >> 16) {
                                            case 0:
                                                M(0, 0 | S, 0 | N, 0 | j), X = 15;
                                                break;
                                            case 8:
                                                X = 15;
                                                break;
                                            default:
                                        }
                                        if (15 == (0 | X) && (X = 0, 0 | (g = 0 | V(N)))) {
                                            Y = (w = c) + 48 | 0;
                                            do {
                                                o[w >> 2] = 0, w = w + 4 | 0
                                            } while ((0 | w) < (0 | Y));
                                            do {
                                                if (!(0 | B(c, -15))) {
                                                    if (o[c >> 2] = j, o[m >> 2] = R, o[h >> 2] = g, o[b >> 2] = N, w = 1 == (0 | U(c, 4, F, v)), z(c), !w) {
                                                        K(g);
                                                        break
                                                    }
                                                    if ((0 | (w = 0 | H(0, g, N))) == (0 | O)) {
                                                        M(0, 0 | S, 0 | N, 0 | g), K(g);
                                                        break
                                                    }
                                                    o[s >> 2] = w, o[s + 4 >> 2] = O, Ne(1175, s), K(g);
                                                    break
                                                }
                                                K(g)
                                            } while (0)
                                        }
                                        if (Pe(10), 33639248 != ((0 | i[3 + (T = T + (P + 46 + D + C) | 0) >> 0]) << 24 | (0 | i[T + 2 >> 0]) << 16 | (0 | i[T + 1 >> 0]) << 8 | 0 | i[T >> 0] | 0)) break r;
                                        v = N + v | 0
                                    }
                                    return o[a >> 2] = 240, Ne(967, a), K(0 | o[d >> 2]), l = r, 0
                                }
                            } while (0);
                            return y(1), o[n >> 2] = 307, Ne(967, n), K(0 | o[d >> 2]), l = r, 0
                        }
                    } while (0);
                    o[u >> 2] = 188, Ne(967, u), K(0 | o[d >> 2]), l = r
                }(e |= 0, 0), 1
            },
            _memset: xe,
            _sbrk: Ve,
            _memcpy: je,
            stackAlloc: function (e) {
                var r;
                return r = l, (0 | (l = (l = l + (e |= 0) | 0) + 15 & -16)) >= (0 | f) && k(0 | e), 0 | r
            },
            ___uremdi3: Ke,
            getTempRet0: function () {
                return 0 | E
            },
            setTempRet0: function (e) {
                E = e |= 0
            },
            _i64Add: Ie,
            dynCall_iiii: function (e, r, t, n) {
                return r |= 0, t |= 0, n |= 0, 0 | qe[7 & (e |= 0)](0 | r, 0 | t, 0 | n)
            },
            _emscripten_get_global_libc: function () {
                return 4288
            },
            dynCall_ii: function (e, r) {
                return r |= 0, 0 | We[1 & (e |= 0)](0 | r)
            },
            stackSave: function () {
                return 0 | l
            },
            _free: K,
            runPostSets: function () {},
            establishStackSpace: function (e, r) {
                l = e |= 0, f = r |= 0
            },
            stackRestore: function (e) {
                l = e |= 0
            },
            _malloc: V,
            _emscripten_replace_memory: function (e) {
                return !(16777215 & s(e) || s(e) <= 16777215 || s(e) > 2147483648) && (t = new Int8Array(e), n = new Int16Array(e), o = new Int32Array(e), i = new Uint8Array(e), new Uint16Array(e), new Uint32Array(e), new Float32Array(e), a = new Float64Array(e), r = e, !0)
            }
        }
    }(Module.asmLibraryArg, buffer),
    real__llvm_bswap_i32 = asm._llvm_bswap_i32;
asm._llvm_bswap_i32 = function () {
    return real__llvm_bswap_i32.apply(null, arguments)
};
var real_getTempRet0 = asm.getTempRet0;
asm.getTempRet0 = function () {
    return real_getTempRet0.apply(null, arguments)
};
var real____udivdi3 = asm.___udivdi3;
asm.___udivdi3 = function () {
    return real____udivdi3.apply(null, arguments)
};
var real_setThrew = asm.setThrew;
asm.setThrew = function () {
    return real_setThrew.apply(null, arguments)
};
var real__bitshift64Lshr = asm._bitshift64Lshr;
asm._bitshift64Lshr = function () {
    return real__bitshift64Lshr.apply(null, arguments)
};
var real__bitshift64Shl = asm._bitshift64Shl;
asm._bitshift64Shl = function () {
    return real__bitshift64Shl.apply(null, arguments)
};
var real__fflush = asm._fflush;
asm._fflush = function () {
    return real__fflush.apply(null, arguments)
};
var real__extract = asm._extract;
asm._extract = function () {
    return real__extract.apply(null, arguments)
};
var real__sbrk = asm._sbrk;
asm._sbrk = function () {
    return real__sbrk.apply(null, arguments)
};
var real____errno_location = asm.___errno_location;
asm.___errno_location = function () {
    return real____errno_location.apply(null, arguments)
};
var real____uremdi3 = asm.___uremdi3;
asm.___uremdi3 = function () {
    return real____uremdi3.apply(null, arguments)
};
var real_stackAlloc = asm.stackAlloc;
asm.stackAlloc = function () {
    return real_stackAlloc.apply(null, arguments)
};
var real__i64Subtract = asm._i64Subtract;
asm._i64Subtract = function () {
    return real__i64Subtract.apply(null, arguments)
};
var real_setTempRet0 = asm.setTempRet0;
asm.setTempRet0 = function () {
    return real_setTempRet0.apply(null, arguments)
};
var real__i64Add = asm._i64Add;
asm._i64Add = function () {
    return real__i64Add.apply(null, arguments)
};
var real__emscripten_get_global_libc = asm._emscripten_get_global_libc;
asm._emscripten_get_global_libc = function () {
    return real__emscripten_get_global_libc.apply(null, arguments)
};
var real_stackSave = asm.stackSave;
asm.stackSave = function () {
    return real_stackSave.apply(null, arguments)
};
var real__free = asm._free;
asm._free = function () {
    return real__free.apply(null, arguments)
};
var real_establishStackSpace = asm.establishStackSpace;
asm.establishStackSpace = function () {
    return real_establishStackSpace.apply(null, arguments)
};
var real_stackRestore = asm.stackRestore;
asm.stackRestore = function () {
    return real_stackRestore.apply(null, arguments)
};
var real__malloc = asm._malloc;
asm._malloc = function () {
    return real__malloc.apply(null, arguments)
};
var _llvm_bswap_i32 = Module._llvm_bswap_i32 = asm._llvm_bswap_i32,
    getTempRet0 = Module.getTempRet0 = asm.getTempRet0,
    ___udivdi3 = Module.___udivdi3 = asm.___udivdi3,
    setThrew = Module.setThrew = asm.setThrew,
    _bitshift64Lshr = Module._bitshift64Lshr = asm._bitshift64Lshr,
    _bitshift64Shl = Module._bitshift64Shl = asm._bitshift64Shl,
    _fflush = Module._fflush = asm._fflush,
    _extract = Module._extract = asm._extract,
    _memset = Module._memset = asm._memset,
    _sbrk = Module._sbrk = asm._sbrk,
    _memcpy = Module._memcpy = asm._memcpy,
    ___errno_location = Module.___errno_location = asm.___errno_location,
    ___uremdi3 = Module.___uremdi3 = asm.___uremdi3,
    stackAlloc = Module.stackAlloc = asm.stackAlloc,
    _i64Subtract = Module._i64Subtract = asm._i64Subtract,
    setTempRet0 = Module.setTempRet0 = asm.setTempRet0,
    _i64Add = Module._i64Add = asm._i64Add,
    _emscripten_get_global_libc = Module._emscripten_get_global_libc = asm._emscripten_get_global_libc,
    stackSave = Module.stackSave = asm.stackSave,
    _free = Module._free = asm._free,
    runPostSets = Module.runPostSets = asm.runPostSets,
    establishStackSpace = Module.establishStackSpace = asm.establishStackSpace,
    stackRestore = Module.stackRestore = asm.stackRestore,
    _malloc = Module._malloc = asm._malloc,
    _emscripten_replace_memory = Module._emscripten_replace_memory = asm._emscripten_replace_memory,
    dynCall_ii = Module.dynCall_ii = asm.dynCall_ii,
    dynCall_iiii = Module.dynCall_iiii = asm.dynCall_iiii,
    initialStackTop;

function ExitStatus(e) {
    this.name = "ExitStatus", this.message = "Program terminated with exit(" + e + ")", this.status = e
}
Runtime.stackAlloc = Module.stackAlloc, Runtime.stackSave = Module.stackSave, Runtime.stackRestore = Module.stackRestore, Runtime.establishStackSpace = Module.establishStackSpace, Runtime.setTempRet0 = Module.setTempRet0, Runtime.getTempRet0 = Module.getTempRet0, Module.asm = asm, ExitStatus.prototype = new Error, ExitStatus.prototype.constructor = ExitStatus;
var preloadStartTime = null,
    calledMain = !1;

function run(e) {
    function r() {
        Module.calledRun || (Module.calledRun = !0, ABORT || (ensureInitRuntime(), preMain(), ENVIRONMENT_IS_WEB && null !== preloadStartTime && Module.printErr("pre-main prep time: " + (Date.now() - preloadStartTime) + " ms"), Module.onRuntimeInitialized && Module.onRuntimeInitialized(), Module._main && shouldRunNow && Module.callMain(e), postRun()))
    }
    e = e || Module.arguments, null === preloadStartTime && (preloadStartTime = Date.now()), runDependencies > 0 || (writeStackCookie(), preRun(), runDependencies > 0 || Module.calledRun || (Module.setStatus ? (Module.setStatus("Running..."), setTimeout((function () {
        setTimeout((function () {
            Module.setStatus("")
        }), 1), r()
    }), 1)) : r(), checkStackCookie()))
}

function exit(e, r) {
    r && Module.noExitRuntime ? Module.printErr("exit(" + e + ") implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)") : (Module.noExitRuntime ? Module.printErr("exit(" + e + ") called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)") : (ABORT = !0, EXITSTATUS = e, STACKTOP = initialStackTop, exitRuntime(), Module.onExit && Module.onExit(e)), Module.quit(e, new ExitStatus(e)))
}
dependenciesFulfilled = function e() {
    Module.calledRun || run(), Module.calledRun || (dependenciesFulfilled = e)
}, Module.callMain = Module.callMain = function (e) {
    assert(0 == runDependencies, "cannot call main when async dependencies remain! (listen on __ATMAIN__)"), assert(0 == __ATPRERUN__.length, "cannot call main when preRun functions remain to be called"), e = e || [], ensureInitRuntime();
    var r = e.length + 1;

    function t() {
        for (var e = 0; e < 3; e++) n.push(0)
    }
    var n = [allocate(intArrayFromString(Module.thisProgram), "i8", ALLOC_NORMAL)];
    t();
    for (var o = 0; o < r - 1; o += 1) n.push(allocate(intArrayFromString(e[o]), "i8", ALLOC_NORMAL)), t();
    n.push(0), n = allocate(n, "i32", ALLOC_NORMAL);
    try {
        exit(Module._main(r, n, 0), !0)
    } catch (e) {
        if (e instanceof ExitStatus) return;
        if ("SimulateInfiniteLoop" == e) return void(Module.noExitRuntime = !0);
        var i = e;
        e && "object" == typeof e && e.stack && (i = [e, e.stack]), Module.printErr("exception thrown: " + i), Module.quit(1, e)
    } finally {
        calledMain = !0
    }
}, Module.run = Module.run = run, Module.exit = Module.exit = exit;
var abortDecorators = [];

function abort(e) {
    Module.onAbort && Module.onAbort(e), void 0 !== e ? (Module.print(e), Module.printErr(e), e = JSON.stringify(e)) : e = "", ABORT = !0, EXITSTATUS = 1;
    var r = "abort(" + e + ") at " + stackTrace();
    throw abortDecorators && abortDecorators.forEach((function (t) {
        r = t(r, e)
    })), r
}
if (Module.abort = Module.abort = abort, Module.preInit)
    for ("function" == typeof Module.preInit && (Module.preInit = [Module.preInit]); Module.preInit.length > 0;) Module.preInit.pop()();
var shouldRunNow = !0;
Module.noInitialRun && (shouldRunNow = !1), run(), onmessage = async function (e) {
    let contents = e.data.contents instanceof Uint8Array ? e.data.contents:new Uint8Array(await e.data.contents.arrayBuffer());
    Module.FS_createDataFile("/", "1.zip", contents, !0, !1), Module.cwrap("extract", "number", ["string"])("1.zip"), FS.unlink("1.zip")
};