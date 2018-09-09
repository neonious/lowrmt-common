import { isArray } from 'util';

export class CancelledError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export class CancelToken {
    static readonly None = new CancelToken(false);
    private _actions: Function[] = [];
    private _isCancellationRequested = false;

    constructor(cancelled: boolean) {
        this._isCancellationRequested = cancelled;
    }

    get isCancellationRequested(): boolean {
        return this._isCancellationRequested;
    }

    register(action: () => void) {
        if (this._isCancellationRequested) {
            action();
        }
        this._actions.push(action);
    }

    throwIfCancellationRequested() {
        if (this._isCancellationRequested) {
            throw new CancelledError();
        }
    }

    _cancel() {
        if (!this._isCancellationRequested) {
            this._isCancellationRequested = true;
            for (const action of this._actions) {
                action();
            }
        }
    }
}

export class CancellationTokenSource {
    private _token = new CancelToken(false);

    get isCancellationRequested(): boolean {
        return this._token.isCancellationRequested;
    }

    get token() {
        return this._token;
    }

    cancel() {
        this._token._cancel();
    }

    createLinkedTokenSource(token1: CancelToken, token2: CancelToken): CancellationTokenSource;
    createLinkedTokenSource(tokens: CancelToken[]): CancellationTokenSource;
    createLinkedTokenSource(tokens: CancelToken[] | CancelToken, token2?: CancelToken): CancellationTokenSource {
        if (isArray(tokens)) {
            const source = new CancellationTokenSource();
            for (const t of tokens) {
                t.register(() => {
                    source.cancel();
                })
            }
            return source;
        }
        if (!token2) {
            return this.createLinkedTokenSource([tokens]);
        }
        return this.createLinkedTokenSource([tokens, token2]);
    }
}
