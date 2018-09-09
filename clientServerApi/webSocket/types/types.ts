import { keys } from 'ts-transformer-keys';
import { Status } from './status';

export namespace ScanWifi{
    export type FromServer = ScanWifi;
}

export interface ScanWifi {
    [id: string]: {
        title: string;
        encrypted: boolean;
    }
}

export namespace FromServerStreams {
    export const Keys = keys<FromServerStreams>();
}

export interface FromServerStreams {
    ScanWifi: ScanWifi.FromServer;
}

export namespace DuplexStreams {
    export const Keys = keys<DuplexStreams>();
}

export interface DuplexStreams {
    Status: {
        toServer: Status.ToServer;
        fromServer: Status.FromServer;
    }
}


