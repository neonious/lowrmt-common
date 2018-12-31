import chalk from 'chalk';

export function debugLog(...msg: string[]) {
  process.env.PERFLOG === 'true' && console.debug(chalk.grey(...msg));
}

function getStr(start: number) {
  const el = Date.now() - start;
  let sec = el / 1000;
  return `${sec.toFixed(2)}s`;
}

export function debugLogTime(
  start: number,
  ...msgs: string[]
) {
  if (process.env.PERFLOG === 'true') {
    debugLog(getStr(start), ...msgs);
  }
}
