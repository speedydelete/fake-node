
type Parsed = object;

export function decode(str: string) {
    return parse(str);
}

export function encode(obj: Parsed): string {
    return stringify(obj);
}

export function parse(str: string): Parsed {
    let obj = Object.create(null);
    const params = new URLSearchParams(str);
    for (const key of params.keys()) {
        obj[key] = params.getAll(key);
    }
    return obj;
}

export function stringify(obj: Parsed): string {
    let params = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            params.append(key, value);
        } else {
            for (const item of Object.keys(value)) {
                params.append(key, item);
            }
        }
    }
    return params.toString();
}
