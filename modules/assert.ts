
export class AssertionError extends Error {

    message: string;
    actual: any;
    expected: any;
    operator: string;
    generatedMessage: boolean;
    name: 'AssertionError' = 'AssertionError';

    constructor({message, actual, expected, operator}: {message?: string | Error, actual?: any, expected?: any, operator: string}) {
        super();
        this.actual = actual;
        this.expected = expected.
        this.operator = operator;
        if (message !== undefined) {
            this.message = message instanceof Error ? message.message : message;
            this.generatedMessage = false;
        } else {
            // todo: finish this
            this.message = `expected ${expected} but got ${actual} using ${operator}`;
            this.generatedMessage = true;
        }
    }

    get [Symbol.toStringTag]() {
        return 'AssertionError';
    }

}

export function deepEqual(actual: any, expected: any, message?: string | Error): void {
    if (typeof actual === 'object' && actual !== null) {
        if (typeof expected === 'object' && expected !== null) {
            // todo: finish this
            let expectedKeys = Object.keys(expected);
            for (const key of Object.keys(actual)) {
                if (!expectedKeys.includes(key)) {
                    throw new AssertionError({message, actual, expected, operator: 'deepEqual'});
                }
                expectedKeys = expectedKeys.filter(x => x !== key);
            }
            if (expectedKeys.length > 0) {
                throw new AssertionError({message, actual, expected, operator: 'deepEqual'});
            }
        } else {
            throw new AssertionError({message, actual, expected, operator: 'deepEqual'});
        }
    } else {
        if (actual != expected && !(Number.isNaN(actual) && Number.isNaN(expected))) {
            throw new AssertionError({message, actual, expected, operator: 'deepEqual'});
        }
    }
}

export function deepStrictEqual(actual: any, expected: any, message?: string | Error): void {
    if (typeof actual === 'object' && actual !== null) {
        if (typeof expected === 'object' && expected !== null) {
            // todo: finish this 
            let expectedKeys = Object.keys(expected);
            for (const key of Object.keys(actual)) {
                if (!expectedKeys.includes(key)) {
                    throw new AssertionError({message, actual, expected, operator: 'deepStrictEqual'});
                }
                expectedKeys = expectedKeys.filter(x => x !== key);
            }
            if (expectedKeys.length > 0) {
                throw new AssertionError({message, actual, expected, operator: 'deepStrictEqual'});
            }
        } else {
            throw new AssertionError({message, actual, expected, operator: 'deepStrictEqual'});
        }
    } else {
        if (actual !== expected && !(Number.isNaN(actual) && Number.isNaN(expected))) {
            throw new AssertionError({message, actual, expected, operator: 'deepStrictEqual'});
        }
    }
}

export function doesNotMatch(string: string, regexp: RegExp, message?: string | Error): void {
    if (string.match(regexp)) {
        throw new AssertionError({message, operator: 'doesNotMatch'});
    }
}

export function equal(expected: any, actual: any, message?: string | Error): void {
    if (actual != expected && !(Number.isNaN(actual) && Number.isNaN(expected))) {
        throw new AssertionError({message, actual, expected, operator: 'equal'});
    }
}

export function fail(message: string | Error = 'Failed'): void {
    throw new AssertionError({message, operator: 'fail'});
}

export function ifError(value: any): void {
    if (value !== undefined && value !== null) {
        throw new AssertionError({operator: 'ifError'});
    }
}

export function match(string: string, regexp: RegExp, message?: string | Error): void {
    if (!string.match(regexp)) {
        throw new AssertionError({message, operator: 'match'});
    }
}

export function notDeepEqual(actual: any, expected: any, message?: string | Error): void {
    try {
        deepEqual(actual, expected);
    } catch (error) {
        if (error instanceof AssertionError) {
            return;
        } else {
            throw error;
        }
    }
    throw new AssertionError({message, actual, expected, operator: 'notDeepEqual'});
}

export function notDeepStrictEqual(actual: any, expected: any, message?: string | Error): void {
    try {
        deepStrictEqual(actual, expected);
    } catch (error) {
        if (error instanceof AssertionError) {
            return;
        } else {
            throw error;
        }
    }
    throw new AssertionError({message, actual, expected, operator: 'notDeepStrictEqual'});
}

export function notEqual(actual: any, expected: any, message?: string | Error): void {
    try {
        equal(actual, expected);
    } catch (error) {
        if (error instanceof AssertionError) {
            return;
        } else {
            throw error;
        }
    }
    throw new AssertionError({message, actual, expected, operator: 'notEqual'});
}

export function notStrictEqual(actual: any, expected: any, message?: string | Error): void {
    try {
        strictEqual(actual, expected);
    } catch (error) {
        if (error instanceof AssertionError) {
            return;
        } else {
            throw error;
        }
    }
    throw new AssertionError({message, actual, expected, operator: 'notStrictEqual'});
}

export function ok(value: any, message?: string | Error): void {
    if (!value) {
        throw new AssertionError({message, operator: 'ok'})
    }
}

export function strictEqual(expected: any, actual: any, message?: string | Error): void {
    if (actual !== expected && !(Number.isNaN(actual) && Number.isNaN(expected))) {
        throw new AssertionError({message, actual, expected, operator: 'strictEqual'});
    }
}

export function assert(value: any, message?: string | Error): void {
    ok(value, message);
}

Object.assign(assert, {
    deepEqual,
    deepStrictEqual,
    doesNotMatch,
    equal,
    fail,
    ifError,
    match,
    notDeepEqual,
    notDeepStrictEqual,
    notEqual,
    notStrictEqual,
    ok,
    strictEqual,
    strict: {
        deepEqual: deepStrictEqual,
        deepStrictEqual,
        doesNotMatch,
        equal: strictEqual,
        fail,
        ifError,
        match,
        notDeepEqual: notDeepStrictEqual,
        notDeepStrictEqual,
        notEqual: notStrictEqual,
        notStrictEqual,
        ok,
        strictEqual,
    },
});
