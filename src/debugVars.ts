import chalk from 'chalk';

export function debugLog(...msg: string[]) {
  process.env.PERFLOG === 'true' && console.debug(chalk.grey(...msg));
}

function getStr(start: number) {
  const el = Date.now() - start;
  let sec = el / 1000;
  return `${sec.toFixed(2)}s`;
}

export function debugLogTime(start: number, ...msgs: string[]) {
  if (process.env.PERFLOG === 'true') {
    debugLog(getStr(start), ...msgs);
  }
}

export function debugLogError(e: object | string) {
  if (process.env.NODE_ENV !== 'production') {
    const msg =
      e instanceof Error
        ? e.stack
          ? `${e.message} | stack: ${e.stack}`
          : e.toString()
        : JSON.stringify(e, null, 4);
    console.error(chalk.bold.red(msg));
  }
}
