export function delay(millis: number) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, millis);
    });
}

export function promiseAllProps<T>(object: Dict<Promise<T>>): Promise<Dict<T>> {
    var keys = Object.keys(object);
    var values = [];
    var key;

    for (key in object) {
        values.push(object[key]);
    }

    return Promise.all(values).then(function (results) {
        return keys.reduce(function (fulfilledObject: Dict<T>, key, index) {
            fulfilledObject[key] = results[index];

            return fulfilledObject;
        }, {});
    });
};