import { Observable } from 'rxjs';

export function cacheElementUntil<T>(
    observable: Observable<T>,
    untilCondition: (cached: T, observable: Observable<T>) => Observable<any>) {

    const set = new Set<T>();
    observable = observable.publish().refCount();

    const subscription = observable.subscribe(
        el => {
            set.add(el);
            untilCondition(el, observable).first().subscribe(() => {
                set.delete(el);
            })
        }
    );

    return {
        cache: Observable.defer(() => Observable.from(set as any as T[])),
        subscription
    }
}
