import { padStart } from "lodash";

function getTimestampPrefix(timestamp: number) {
  const date = new Date(0);
  date.setUTCMilliseconds(timestamp);
  const timestampPrefix = `[${date.toLocaleTimeString()}] `;
  return timestampPrefix;
}

export function format(timestamp: number, lines: string | string[]) {
  const prefix = getTimestampPrefix(timestamp);
  lines = Array.isArray(lines) ? lines : [lines];
  return lines
    .map((line, i) => {
      return formatLine(prefix, line, i === 0);
    })
    .join("\n");
}

function formatLine(tsPrefix: string, line: string, firstLine: boolean) {
  if (firstLine) {
    return `${tsPrefix}${line}`;
  }
  return padStart(line, tsPrefix.length + line.length);
}

export function formatFirstLine(timestamp: number, line: string) {
  return formatLine(getTimestampPrefix(timestamp), line, true);
}

export function formatSubsequentLine(timestamp: number, line: string) {
  return formatLine(getTimestampPrefix(timestamp), line, false);
}
