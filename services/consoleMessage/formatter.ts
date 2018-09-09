import { Status } from "../../clientServerApi/webSocket/types/status";
import { Observable } from "rxjs"
import { inject, injectable } from "inversify"
import { TYPES } from "../../types";
import { SocketPoolFactory } from "../../clientServerApi/webSocket/socketPool";
import { padStart } from "lodash";
import { ConsoleMessage } from "./message";

@injectable()
export class ConsoleMessageFormatter {

    private getTimestampPrefix(timestamp: number) {
        const date = new Date(0);
        date.setUTCMilliseconds(timestamp);
        const timestampPrefix = `[${date.toLocaleTimeString()}] `;
        return timestampPrefix;
    }

    format(timestamp: number, lines: string | string[]) {
        const prefix = this.getTimestampPrefix(timestamp);
        lines = Array.isArray(lines) ? lines : [lines];
        return lines.map((line, i) => {
            return this.formatLine(prefix, line, i === 0);
        }).join('\n');
    }

    private formatLine(tsPrefix: string, line: string, firstLine: boolean) {
        if (firstLine) {
            return `${tsPrefix}${line}`;
        }
        return padStart(line, tsPrefix.length + line.length);
    }

    formatFirstLine(timestamp: number, line: string) {
        return this.formatLine(this.getTimestampPrefix(timestamp), line, true);
    }

    formatSubsequentLine(timestamp: number, line: string) {
        return this.formatLine(this.getTimestampPrefix(timestamp), line, false);
    }
}