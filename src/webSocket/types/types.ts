import { Status } from '@common/webSocket/types/status';

export interface ScanWifi {
    [id: string]: {
        title: string;
        encrypted: boolean;
    }
}

export interface DuplexStreams {
    ScanWifi: {
        fromServer: ScanWifi;
    },
    Status: {
        toServer: Status.ToServer;
        fromServer: Status.FromServer;
    }
}


