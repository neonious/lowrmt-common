
export function decodeToText(buf: Uint8Array) {// better than textencoder, because async
    return new Promise<string>(resolve => {
        var bb = new Blob([buf.buffer]);
        var f = new FileReader();
        f.onload = function (e) {
            const str = (e.target as any).result;
            resolve(str);
        }
        f.readAsText(bb);
    });
}

export function encodeFromText(string: string) { // better than textencoder, because async
    return new Promise<Uint8Array>(resolve => {
        var bb = new Blob([string]);
        var f = new FileReader();
        f.onload = function (e) {
            const buffer = (e.target as any).result as ArrayBuffer;
            const arr = new Uint8Array(buffer);
            resolve(arr);
        }
        f.readAsArrayBuffer(bb);
    })
}

export function tryParseInt(str: string, defaultValue: any) {
    var retValue = defaultValue;
    if (str !== null) {
        if (str.length > 0) {
            if (!isNaN(str as any)) {
                retValue = parseInt(str);
            }
        }
    }
    return retValue;
}