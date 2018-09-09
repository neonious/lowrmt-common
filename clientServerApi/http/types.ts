import { keyBy } from 'lodash';
import { keys } from 'ts-transformer-keys';
import { Status } from '../webSocket/types/status';

export interface PackageInfo {
    name: string;
    author: string;
    desc?: string;
    maxVersion: string;
}

export namespace HttpApiTypes {

    export type NoParams = 'Logout' | 'ResyncTime' | 'ClearLog';

    export namespace NoParams {
        export const Keys = keys<{ [K in NoParams]: void }>();
        export const byKeys = keyBy(Keys);
    }

    export interface FromServer {
        GetSettings: any;
        IsLoggedIn: {
            loggedIn: boolean;
        };
        UpdateAndLogout: {
            willUpdate: boolean;
        };
        GetSoftwareVersion: {
            version: string;
        }
        GetUpdateInfo: {
            update: false | {
                version: string
                changelog: string
            }
        }
        Stop: "NOT_RUNNING" | undefined
    }

    export namespace FromServer {
        export const Keys = keys<FromServer>();
        export const byKeys = keyBy(Keys);
    }

    export interface ToServer {
        SetSettings: {
            settings: any
        };
        UpdatePackage: {
            package: string;
            command: 'install' | 'remove';
            version: string;
        }
    }

    export namespace ToServer {
        export const Keys = keys<ToServer>();
        export const byKeys = keyBy(Keys);
    }

    export interface Duplex {

        Login: {
            input: {
                password: string;
            };
            output: {
                session: string;
                err?: false;
            } | {
                err: 'PASSWORD_INVALID'
            }
        };
        ValidateSettings: {
            input: {
                settings: any;
            };
            output: any
        };
        GetPackageInfos: {
            input: { name: string, version: string }[],
            output: PackageInfo[]
        };
        PackageSearch: {
            input: { query: string, startIndex?: number },
            output: PackageInfo[]
        }
        Start: {
            input: {
                action: 'start';
                file: string;
            }
            output: "FILE_NOT_FOUND" | "ALREADY_RUNNING" | undefined
        }
        Status: {
            input: {
                code: true
            }
            output: {
                code: {
                    status: 'running' | 'stopped' | 'paused'
                };
            }
        }
    }

    export namespace Duplex {
        export const Keys = keys<Duplex>();
        export const byKeys = keyBy(Keys);
    }


    export const noParameterKeys = Object.assign({}, HttpApiTypes.NoParams.byKeys, HttpApiTypes.FromServer.byKeys);
    export const resultMethods = Object.assign({}, HttpApiTypes.FromServer.byKeys, HttpApiTypes.Duplex.byKeys);
    export const noResultMethods = Object.assign({}, HttpApiTypes.NoParams.byKeys, HttpApiTypes.ToServer.byKeys);
    export const allKeys = Object.assign({}, resultMethods, noResultMethods);
}
