export interface PackageInfo {
  name: string;
  author: string;
  desc?: string;
  maxVersion: string;
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
  };
  UpdateAndLogout: {
    output: {
      willUpdate: boolean;
    };
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
  UpdatePackage: {
    input: {
      package: string;
      command: "install" | "remove";
      version: string;
    };
  };
  ValidateSettings: {
    input: {
      settings: {};
    };
    output: {};
  };
  GetPackageInfos: {
    input: { name: string; version: string }[];
    output: PackageInfo[];
  };
  PackageSearch: {
    input: { query: string; startIndex?: number };
    output: PackageInfo[];
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
