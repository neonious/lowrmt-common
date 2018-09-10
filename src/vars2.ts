export const buildSrcDir = '/.build/src';
export const srcDir = '/src';
export const buildDir = '/.build';

const mb = 1024 * 1024;
export const statsMaxValues = {
    cpu: 1,
    net: undefined,
    ram: 4 * mb,
    flash: 4 * mb           // TP only has 4 MB
}