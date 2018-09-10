import { Observable } from "rxjs";

export interface HandlerEvent<T> {
    add(func: (t: T) => void): () => void;
    addAsync(func: (t: T) => Promise<void>): () => void;
    asObservable(): Observable<T>;
}

export class HandlerEventHub<T> implements HandlerEvent<T> {
    private handlers = new Set<(t: T) => void>();
    private asyncHandlers = new Set<(t: T) => Promise<void>>();

    constructor(private name?: string) { }

    async fire(t: T): Promise<void> {
        this.handlers.forEach(h => h(t));
        await Promise.all(Array.from(this.asyncHandlers).map(h => h(t)));
    }

    add(func: (t: T) => void) {
        this.handlers.add(func);
        return () => this.handlers.delete(func);
    }

    addAsync(func: (t: T) => Promise<void>) {
        this.asyncHandlers.add(func);
        return () => this.asyncHandlers.delete(func);
    }

    asObservable() {
        return new Observable<T>(subscriber => {
            return this.add(t => {
                subscriber.next(t);
            });
        })
    }
}