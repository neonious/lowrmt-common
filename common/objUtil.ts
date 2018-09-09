import * as _ from 'lodash';

export const toPairsDeep: ((obj: object) => [string, any][]) = (obj: object) => _.flatMap(
    _.toPairs(obj), ([k, v]) =>
        _.isPlainObject(v) ? toPairsDeep(v) : [[k, v] as [string, any]]);

export const someDeep = (obj: object, fn: (value: any) => boolean): boolean => _.some(obj, v => _.isPlainObject(v) ? someDeep(v, fn) : fn(v));