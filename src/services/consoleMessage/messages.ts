import { ConsoleMessage } from "@common/services/consoleMessage/message";
import { Observable } from "rxjs/Observable";
import { filter } from "rxjs/operators/filter";
import { map } from "rxjs/operators/map";
import { concatMap } from "rxjs/operators/concatMap";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { Status } from "@common/webSocket/types/status";
import { websocketApi } from "@common/webSocket/socketPool";

export function getConsoleMessages(): Observable<ConsoleMessage> {
  const socket = websocketApi.Status;
  return socket.onMessage
    .pipe(filter(Status.isConsole))
    .pipe(
      filter(s => {
        return typeof s.console !== "string";
      })
    )
    .pipe(map(s => s.console as Status.Console.Log | Status.Console.Log[]))
    .pipe(concatMap(l => (Array.isArray(l) ? from(l) : of(l))))
    .pipe(
      map(log => {
        const { s: timestamp, l, t: message } = log;
        const level = l || "l";
        if (message.indexOf("\n") !== -1) {
          let lines = message.split("\n");
          if(lines[lines.length - 1] == '')
              lines.pop();		// we now send a \n as last char
          return {
            timestamp,
            level,
            lines
          };
        } else {
          return {
            timestamp,
            level,
            lines: message
          };
        }
      })
    );
}
