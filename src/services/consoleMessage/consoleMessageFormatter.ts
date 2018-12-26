import { padStart } from "lodash";

export function getConsoleLineFormatter(timestamp: number) {
  const date = new Date(0);
  date.setUTCMilliseconds(timestamp);
  const timestampPrefix = `[${date.toLocaleTimeString()}] `;
  return {
    formatFirstLine(line: string) {
      return `${timestampPrefix}${line}`;
    },
    formatSubsequentLine(line: string) {
      return padStart(line, timestampPrefix.length + line.length);
    }
  };
}
