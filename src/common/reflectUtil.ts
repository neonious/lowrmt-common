import { CancellationTokenSource, CancelledError } from "../common/cancelToken";

export function createTryFinallyDecorator(callback: (args: any[]) => { beginFunc: () => void, endFunc: () => void }) {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        let method = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const { beginFunc, endFunc } = callback(args);

            beginFunc();

            return onEnd(() => method && method.apply(this, arguments),
                () => endFunc(),
                e => endFunc(),
                true);
        }
    }
};

function onEnd(exec: () => any, successCallback: (result: any) => void, errorCallback: (err: any) => void, replicateResult: boolean) {
    let result: Promise<void> | undefined
    try {
        result = exec();
    } catch (e) {
        errorCallback(e);
        if (replicateResult)
            throw e;
        return;
    }

    if (!result || typeof result.then !== 'function') {
        successCallback(result);
    } else {
        result
            .then(r => {
                successCallback(r);
            })
            .catch(e => {
                errorCallback(e);
            });
    }
    if (replicateResult)
        return result;
}

export interface DebounceFunctionOptions {
    readonly timeout: number;
    getKey(args: any[]): string;
}

export function debounceFunction({ timeout, getKey }: DebounceFunctionOptions) {
    const dict: Dict<() => void> = Object.create(null);

    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        const method = descriptor.value;

        descriptor.value = function (...args: any[]) {

            const key = getKey(args);
            dict[key] && dict[key]();
            const tokenSource = args.find(a => !!(a as CancellationTokenSource).createLinkedTokenSource) as CancellationTokenSource;
            const def: { promise: Promise<void>, resolve: () => void, reject: (err: any) => void } = Object.create(null);
            def.promise = new Promise(function (resolve, reject) {
                def.resolve = resolve;
                def.reject = reject;
            })
            let triggered = false;
            const args1 = arguments;
            const myThis = this;
            const timer = window.setTimeout(() => {
                triggered = true;
                onEnd(() => method && method.apply(myThis, args1),
                    (result) => {
                        // later ex if result !== undefined
                        def.resolve();
                    },
                    e => {
                        if (e instanceof CancelledError) {
                            return def.resolve();
                        }
                        def.reject(e);
                    },
                    false
                )
            }, timeout);
            dict[key] = () => {
                if (!triggered) {
                    window.clearTimeout(timer);
                    def.resolve();
                }
                tokenSource && tokenSource.cancel();
            }
            return def.promise;
        }
    }
}