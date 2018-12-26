import { Observable } from 'rxjs/Observable';
import {from} from 'rxjs/observable/from';
import {defer} from 'rxjs/observable/defer';
import {publish} from 'rxjs/operators/publish';
import {refCount} from 'rxjs/operators/refCount';
import {first} from 'rxjs/operators/first';

export function cacheElementUntil<T>(
    observable: Observable<T>,
    untilCondition: (cached: T, observable: Observable<T>) => Observable<any>) {

    const set = new Set<T>();
    observable = observable.pipe(publish()).pipe(refCount());

    const subscription = observable.subscribe(
        el => {
            set.add(el);
            untilCondition(el, observable).pipe(first()).subscribe(() => {
                set.delete(el);
            })
        }
    );

    return {
        cache: defer(() => from(set as any as T[])),
        subscription
    }
}
