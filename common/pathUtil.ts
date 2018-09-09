import { keyBy } from 'lodash';
import { extname, isAbsolute, relative } from 'path';

export function getPathWithoutExtension(path: string) {
    const ext = extname(path);
    const result = ext ? path.slice(0, -ext.length) : path;
    return result;
}

export function isAParentOf(parent: string, path: string) {
    const rel = relative(parent, path);
    return !!rel && !rel.startsWith('..') && !isAbsolute(rel);
}

export function getUnusedName(existingNames: string[], reqName: string): string {

    let map = keyBy(existingNames);
    let curText = reqName;
    let counter = 2;

    if (curText in map) {
        const ext = extname(reqName);
        let woExt = getPathWithoutExtension(reqName);
        woExt = /(.*?)\s*(?:\((\d+)\))?$/.exec(woExt)![1];

        while (curText in map) {
            curText = `${woExt} (${(counter++)})${ext}`;
        }
    }

    return curText;
}

const jsExts = new Set(['.js', '.jsx']);

export function isJavascriptFile(file: string) {
    const ext = extname(file).toLowerCase();
    return jsExts.has(ext);
}