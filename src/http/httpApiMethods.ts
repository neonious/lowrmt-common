export interface PkgVersions {
  [name: string]: string;
}

export interface PkgInfoValue {
  author?: string;
  description: string;
  registryVersion: string;
}

export interface PkgInfos {
  [name: string]: PkgInfoValue;
}

export function parsePkgExpr(p: string): { name: string; version?: string } {
  const atidx = p.lastIndexOf("@");
  if (atidx > 0) {
    // if 0 then is scoped npm pkg, not anything to do with a version
    const name = p.substr(0, atidx);
    const version = p.substr(atidx + 1);
    return { name, version };
  }
  return { name: p };
}

export type PackageOp = { expr: string; type: AddRemove };

export type PackagesOp = { exprs: string[]; type: AddRemove };

export interface PkgSearchInput {
  query: string;
  startIndex: number;
  maxResults: number;
}

export type AddRemove = "add" | "remove";

export interface PkgAddRemoveServerInput extends PkgAddRemoveInput {
  existingPkgs: PkgVersions;
}

export interface PkgAddRemoveInput {
  id: string;
  type: AddRemove;
  pkgs: string[];
}

export interface HttpMethods {
  ResyncTime: undefined;
  ClearLog: undefined;
  SetLowSyncHadPut: undefined;
  GetSettings: { output: {} };
  IsLoggedIn: {
    output: {
      loggedIn: boolean;
    };
    noSession: true;
  };
  UpdateAndLogout: {
    output: {
      willUpdate: boolean;
    };
    noSession: true;
  };
  GetSoftwareVersion: {
    output: {
      version: string;
      noPassword?: boolean;
    };
    noSession: true;
  };
  GetUpdateInfo: {
    output: {
      update:
        | false
        | {
            version: string;
            changelog: string;
          };
    };
  };
  Stop: { output: "NOT_RUNNING" | undefined };
  SetSettings: {
    input: {
      settings: {};
    };
  };
  PkgAddRemove: {
    input: PkgAddRemoveInput;
    internet: true;
  };
  ValidateSettings: {
    input: {
      settings: {};
    };
    output: {};
  };
  PkgListInstalled: {
    output: PkgVersions;
  };
  PkgInfo: {
    input: PkgVersions;
    output: PkgInfos;
    internet: true;
  };
  PkgSearch: {
    input: PkgSearchInput;
    output: PkgInfos;
    internet: true;
  };
  Start: {
    input: {
      action: "start";
      file?: string;
    };
    output: "FILE_NOT_FOUND" | "ALREADY_RUNNING" | "UPDATING_SYS" | undefined;
  };
  Status: {
    input: {
      code: true;
    };
    output: {
      code: {
        status: "running" | "stopped" | "paused" | "updating_sys";
      };
    };
  };
}
