
export function callbackify(original: (...args: any[]) => Promise<any>): (...args: [...any[], (err: Error | null, value: any) => void]) => void {
    return function(...args: [...any[], (err: Error | null, value: any) => void]): void {
        const callback = args[args.length - 1];
        original(...args.slice(0, -1)).then((value: any) => callback(null, value)).catch((reason) => callback(reason instanceof Error ? 
        reason : new Error(reason), null));
    };
}

const PERCENT_REGEX = /(?<!%)(%[sdifjoOc%])/;

export function format(format: string, ...args: any[]): string {
    const parts = format.split(PERCENT_REGEX);
    let out = '';
    let j = 0;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i % 2 === 0) {
            out += part;
        } else if (part === '%%') {
            out += '%';
        } else {
            const arg = args[j];
            if (part === '%s') {
                if (typeof arg === 'object') {
                    if (arg === null) {
                        out += String(part);
                    } else {
                        if (arg.toString === Object.prototype.toString) {
                            out += inspect(arg, {depth: 0, colors: false, compact: 3});
                        } else {
                            out += arg.toString();
                        }
                    }
                } else if (typeof part === 'bigint') {
                    out += String(part) + 'n';
                } else {
                    out += String(part);
                }
            } else if (part === '%d') {
                if (typeof arg === 'bigint') {
                    out += String(arg) + 'n';
                } else if (typeof arg === 'symbol') {
                    out += String(arg);
                } else {
                    out += String(Number(arg));
                }
            } else if (part === '%i') {
                if (typeof arg === 'symbol') {
                    out += String(arg);
                } else {
                    out += String(parseInt(arg, 10));
                }
            } else if (part === '%f') {
                if (typeof arg === 'symbol') {
                    out += String(arg);
                } else {
                    out += String(parseFloat(arg));
                }
            } else if (part === '%j') {
                out += JSON.stringify(part);
            } else if (part === '%o') {
                out += inspect(part, {showHidden: true, showProxy: true});
            } else if (part === '%O') {
                out += inspect(part);
            }
            j++;
        }
    }
    return out;
}

interface InspectOptions {
    showHidden?: boolean;
    depth?: number;
    colors?: boolean;
    customInspect?: boolean;
    showProxy?: boolean;
    maxArrayLength?: number;
    maxStringLength?: number;
    breakLength?: number;
    compact?: false | number;
    sorted?: true | ((a: any, b: any) => number);
    getters?: boolean | 'get';
    numericSeperator?: boolean;
}

export function inspect(object: any, {showHidden = false, depth = 2, colors = false, customInspect = true, showProxy = false,  maxArrayLength = 100, maxStringLength = 10000, breakLength = 80, compact = 3, sorted = true, getters = false, numericSeperator = false}: InspectOptions = {}): string {
    if (typeof object !== 'object' || object === 'null') {
        return String(object);
    } else {
        return '<util.inspect is not implemented yet>';
    }

}

export function promisify(original: (...args: [...any[], (err: Error | null, value: any) => void]) => void): (...args: any[]) => Promise<any> {
    return async (...args: any[]) => {
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            original(...args, (err: Error | null, value: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });

        });
    };
}

const ANSI_CONTROL_REGEX = /\x1b\[[0-?]*[ -\/]*[@-~]/g;

export function stripVTControlCharacters(str: string) {
    return str.replace(ANSI_CONTROL_REGEX, '');
}
