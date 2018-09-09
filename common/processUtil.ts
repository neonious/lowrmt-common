import * as os from 'os';
import * as execa from 'execa';

export function runNonWindowsCmd(...args: any[]) {
    const args2 = args.slice();
    if (os.platform() === 'win32') {
        const cmd = args2[0];
        args2[0] = 'wsl';
        if (Array.isArray(args2[1])) {
            args2[1].unshift(cmd);
        } else {
            args2.splice(1, 0, [cmd]);
        }
    }
    return execa.apply(execa, args2);
}
