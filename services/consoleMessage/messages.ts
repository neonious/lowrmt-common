import { Status } from "../../clientServerApi/webSocket/types/status";
import { Observable } from "rxjs"
import { inject, injectable } from "inversify"
import { TYPES } from "../../types";
import { SocketPoolFactory } from "../../clientServerApi/webSocket/socketPool";
import { padStart } from "lodash";
import { ConsoleMessage } from "./message";

@injectable()
export class ConsoleMessages {
    constructor(
        @inject(TYPES.SocketPoolFactory) private socketPoolFactory: SocketPoolFactory
    ) { }

    get(): Observable<ConsoleMessage> {
        const socket = this.socketPoolFactory.get('Status');
        return socket.onMessage
            .filter(Status.isConsole)
            .filter(s => { 
                return typeof s.console !== 'string';
            })
            .map(s => s.console as Status.Console.Log | Status.Console.Log[])
            .concatMap(l => Array.isArray(l) ? Observable.from(l) : Observable.of(l))
            .map(log => {
                const { s: timestamp, l, t: message } = log;
                const level = l || 'l';
                if (message.indexOf('\n') !== -1) {
                    const lines = message.split('\n').map(p => p.trim());
                    return {
                        timestamp,
                        level,
                        lines
                    }
                } else {
                    return {
                        timestamp,
                        level,
                        lines: message
                    }
                }
            });
    }
}