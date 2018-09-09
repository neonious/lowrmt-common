import { Status } from "../../clientServerApi/webSocket/types/status";
import { Observable } from "rxjs";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { SocketPoolFactory } from "../../clientServerApi/webSocket/socketPool";
import { padStart } from "lodash";

@injectable()
export class ConsoleMessageFormatter {
    
    getConsoleLineFormatter(timestamp: number) {
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
        }
    }
}