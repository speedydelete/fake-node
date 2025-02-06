"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.versions = exports.version = exports.traceDeprecation = exports.title = exports.throwDeprecation = exports.stdout = exports.stdin = exports.stderr = exports.sourceMapsEnabled = exports.release = exports.ppid = exports.platform = exports.pid = exports.permission = exports.noDeprecation = exports.mainModule = exports.finalization = exports.features = exports.exitCode = exports.execPath = exports.execArgv = exports.env = exports.disconnect = exports.debugPort = exports.connected = exports.config = exports.channel = exports.argv0 = exports.argv = exports.arch = exports.allowedNodeEnvironmentFlags = void 0;
exports.abort = abort;
exports.chdir = chdir;
exports.constrainedMemory = constrainedMemory;
exports.availableMemory = availableMemory;
exports.cpuUsage = cpuUsage;
exports.cwd = cwd;
exports.dlopen = dlopen;
exports.emitWarning = emitWarning;
exports.exit = exit;
exports.getActiveResourcesInfo = getActiveResourcesInfo;
exports.getBuiltinModule = getBuiltinModule;
exports.getegid = getegid;
exports.geteuid = geteuid;
exports.getgid = getgid;
exports.getgroups = getgroups;
exports.getuid = getuid;
exports.hasUncaughtExecptionCaptureCallback = hasUncaughtExecptionCaptureCallback;
exports.hrtime = hrtime;
exports.initgroups = initgroups;
exports.kill = kill;
exports.loadEnvFile = loadEnvFile;
exports.memoryUsage = memoryUsage;
exports.nextTick = nextTick;
exports.ref = ref;
exports.setegid = setegid;
exports.seteuid = seteuid;
exports.setgid = setgid;
exports.setgroups = setgroups;
exports.setuid = setuid;
exports.setSourceMapsEnabledVal = setSourceMapsEnabledVal;
exports.setUncaughtExceptionCaptureCallback = setUncaughtExceptionCaptureCallback;
exports.umask = umask;
exports.unref = unref;
exports.uptime = uptime;
const os = __importStar(require("os"));
function abort() {
    window.close();
}
exports.allowedNodeEnvironmentFlags = new Set();
exports.arch = os.arch();
exports.argv = __fakeNode__.argvs.get(__fakeNode_pid__);
exports.argv0 = __fakeNode__.argv0s.get(__fakeNode_pid__);
exports.channel = undefined;
function chdir(path) {
    __fakeNode__.chdir(__fakeNode_pid__, path);
}
exports.config = {};
exports.connected = undefined;
function constrainedMemory() {
    return 0;
}
function availableMemory() {
    return __fakeNode__.window.navigator.deviceMemory * 2 ** 30;
}
function cpuUsage(previousValue) {
    return { user: -1, system: -1 };
}
function cwd() {
    return __fakeNode__.cwd();
}
exports.debugPort = -1;
exports.disconnect = undefined;
function dlopen(module, filename, flags = os.constants.dlopen.RTLD_LAZY) {
    throw new TypeError('process.dlopen is not supported in fake-node');
}
function emitWarning(warning, type_or_options, code, ctor = emitWarning, detail) {
    throw new TypeError('process.emitWarning is not supported in fake-node');
}
exports.env = __fakeNode__.env;
exports.execArgv = fn.execArgv;
exports.execPath = fn.execPath;
function exit(code = 0) {
    fn.console.log('Exit code', code);
    fn.window.close();
}
exports.exitCode = 0;
exports.features = {
    cached_builtins: true,
    debug: false,
    inspector: false,
    ipv6: true,
    require_module: true,
    tls: false,
    tls_alpn: false,
    tls_ocsp: false,
    tls_sni: false,
    typescript: false,
    uv: false,
};
exports.finalization = {
    register(ref, callback) {
        throw new TypeError('process.finalization is not supported in fake-node');
    },
    registerBeforeExit(ref, callback) {
        throw new TypeError('process.finalization is not supported in fake-node');
    },
    unregister(ref) {
        throw new TypeError('process.finalization is not supported in fake-node');
    },
};
function getActiveResourcesInfo() {
    return [];
}
function getBuiltinModule(id) {
    return fn.modules[id];
}
function getegid() {
    return fn.getegid();
}
function geteuid() {
    return fn.geteuid();
}
function getgid() {
    return fn.getgid();
}
function getgroups() {
    return [fn.getgid()].concat(fn.getgroups());
}
function getuid() {
    return fn.getuid();
}
let errorCallback = null;
function hasUncaughtExecptionCaptureCallback() {
    return errorCallback !== null;
}
function hrtime(time) {
    let value = fn.performance.now();
    if (time !== undefined) {
        value -= time[0] + time[1] / 1000000;
    }
    return [Math.floor(value), (value - Math.floor(value) * 1000000)];
}
hrtime.bigint = function () {
    return BigInt(fn.performance.now());
};
function initgroups(user, extraGroup) {
    throw new TypeError('process.initgroups is not supported in fake-node');
}
function kill(pid, signal) {
    throw new TypeError('process.kill is not supported in fake-node');
}
function loadEnvFile(path) {
    fn.loadEnvFile(path);
}
exports.mainModule = fn.currentFile;
function memoryUsage() {
    throw new TypeError('process.memoryUsage is not supported in fake-node');
}
memoryUsage.rss = function () {
    throw new TypeError('process.memoryUsage is not supported in fake-node');
};
function nextTick(callback, ...args) {
    fn.setTimeout(callback, 0, ...args);
}
exports.noDeprecation = false;
exports.permission = {
    has(scope, reference) {
        throw new TypeError('process.permission.has is not supported in fake-node');
    }
};
function ref(maybeRefable) {
    throw new TypeError('process.ref is not supported in fake-node');
}
exports.pid = 1;
exports.platform = os.platform();
exports.ppid = 1;
exports.release = {
    name: 'fake-node',
    sourceUrl: '', // todo: add something here
    headersUrl: '',
    lts: 'Hydrogen',
};
function setegid(id) {
    fn.setegid(id);
}
function seteuid(id) {
    fn.seteuid(id);
}
function setgid(id) {
    fn.setgid(id);
}
function setgroups(groups) {
    fn.setgroups(groups);
}
function setuid(id) {
    fn.setuid(id);
}
function setSourceMapsEnabledVal(val) {
    throw new TypeError('process.setSourceMapsEnabledVal is not supported in fake-node');
}
function setUncaughtExceptionCaptureCallback(func) {
    if (errorCallback !== null) {
        fn.removeErrorCallback(func);
    }
    errorCallback = fn.addErrorCallback(func);
}
exports.sourceMapsEnabled = false;
exports.stderr = undefined; // todo: put stuff here
exports.stdin = undefined;
exports.stdout = undefined;
exports.throwDeprecation = false;
exports.title = ''; // todo: put something here
exports.traceDeprecation = false;
function umask(mask) {
    throw new TypeError('process.umask is not supported in fake-node');
}
function unref(maybeRefable) {
    throw new TypeError('process.unref is not supported in fake-node');
}
function uptime() {
    return fn.performance.now() / 1000;
}
exports.version = os.version();
exports.versions = [exports.version];
