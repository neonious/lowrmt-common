import { isUndefined } from "util";
import { ConsoleLevel } from "../../services/consoleMessage/message";
import {
  PkgVersions,
  AddRemove
} from "@common/http/httpApiMethods";

export namespace Status {
  export namespace FileEvent {
    export interface EndInitial {
      readonly end_initial: true;
    }

    export interface Modify {
      readonly modify: {
        readonly path: string;
        readonly cid?: string;
        readonly aid?: string;
        readonly type?: string;
        readonly compressed?: boolean;
      };
    }

    export interface Delete {
      readonly delete: string;
    }

    export interface Move {
      readonly move: {
        readonly src: string;
        readonly dst: string;
        readonly dstType?: string;
      };
    }

    export interface Copy {
      readonly copy: {
        readonly src: string;
        readonly dst: string;
        readonly dstType?: string;
      };
    }

    export interface Progress {
      readonly progress: {
        readonly path: string;
        readonly cid: string;
        readonly aid: string;
        readonly size: number;
        readonly done?: true; // only for hidden files instead of modified event that signals finished progress
      };
    }

    export function isEndInitial(obj: Status): obj is FileEvent.EndInitial {
      return !!(obj as FileEvent.EndInitial).end_initial;
    }

    export function isProgress(obj: Status): obj is FileEvent.Progress {
      return !!(obj as FileEvent.Progress).progress;
    }

    export function isCopy(obj: Status): obj is FileEvent.Copy {
      return !!(obj as FileEvent.Copy).copy;
    }

    export function isDelete(obj: Status): obj is FileEvent.Delete {
      return !!(obj as FileEvent.Delete).delete;
    }

    export function isMove(obj: Status): obj is FileEvent.Move {
      return !!(obj as FileEvent.Move).move;
    }

    export function isModify(obj: Status): obj is FileEvent.Modify {
      return !!(obj as FileEvent.Modify).modify;
    }
  }

  export type FileEvent =
    | FileEvent.Copy
    | FileEvent.Delete
    | FileEvent.Modify
    | FileEvent.Move
    | FileEvent.Progress
    | FileEvent.EndInitial;

  export namespace WebDav {
    export interface Operation {
      move?: {
        from: string;
        to: string;
      };
      copy?: {
        from: string;
        to: string;
      };
      createDirectory?: string;
      createFile?: string;
      unlink?: string;
      lock?: string;
      unlock?: string;
    }
  }

  export interface WebDav {
    webdav: WebDav.Operation;
  }

  export namespace Console {
    export interface Log {
      s: number; // utc timestamp
      l?: ConsoleLevel; // if no l, it is log
      t: string;
    }
  }

  export interface Console {
    console: Console.Log | Console.Log[] | "clear";
  }

  export function isConsole(obj: Status): obj is Console {
    return !!(obj as Console).console;
  }

  export interface PkgMan {
    pkgman:
      | {
          type: AddRemove;
          id: string;
          pkgs: string[];
        }
      | {
          type: "progress";
          id: string;
          frac: number;
        }
      | {
          type: "fail";
          id: string;
          inconsistent?: boolean;
          insufficientSpace?: boolean;
          serverRawBody?:string;
        }
      | {
          type: "done";
          id: string;
          finalPkgs: PkgVersions;
        };
  }

  export function isPkgMan(obj: Status): obj is PkgMan {
    return !!(obj as PkgMan).pkgman;
  }

  export namespace Stats {
    export namespace Stat {
      export const Keys: (keyof Stat)[] = [
        "cpu_load",
        "flash_left_b",
        "network_bs",
        "ram_left_b",
        "flash_avail_b"
      ];
    }

    export interface Stat {
      network_bs?: number;
      cpu_load?: number;
      ram_left_b?: number;
      flash_left_b?: number;
      flash_avail_b?: number;
    }
  }

  export interface Stats {
    stats: Stats.Stat | Stats.Stat[];
  }

  export function isStats(obj: Status): obj is Stats {
    return !!(obj as Stats).stats;
  }

  export interface Sys {
    status: any;
  }

  export function isStatus(obj: Status): obj is Sys {
    return !!(obj as Sys).status;
  }

  export namespace Update {
    export interface Update {
      version: string;
      changelog: string;
    }
  }

  export interface Update {
    update: false | Update.Update;
  }

  export function isUpdate(obj: Status): obj is Update {
    return !isUndefined((obj as Update).update);
  }

  export namespace Code {
    export type Status = "running" | "paused" | "stopped";
  }

  export function isCode(obj: Status): obj is Code {
    return !!(obj as Code).code;
  }

  export interface Code {
    code: {
      status: Code.Status;
    };
  }

  export type FromServer =
    | Status.Stats
    | Status.Console
    | Status.Sys
    | Status.Code
    | Status.PkgMan
    | Status.Update
    | FileEvent;

  export namespace ToServer {
    export type Action = "stop" | "suspend" | "resume";
  }

  export type ToServer =
    | {
        action: ToServer.Action;
      }
    | { action: "start"; file: string }
    | { code: true }
    | { status: true };
}

export type Status = Status.FromServer;
