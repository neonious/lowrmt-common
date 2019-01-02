import { SettingPageKey, SettingsKey } from '../settings/definitions';
import { forOwn } from 'lodash';
import { Translations } from '../translations/base/translations';
import { Status } from '../webSocket/types/status';

// later typescript suggestion make it possible to define a type where first level keys is a type and the subtype is just taken as is as another type

interface StatusData {
    readonly settingKey?: SettingsKey;
    readonly level?: StatusLevel;
    readonly page: SettingPageKey;
    readonly translation: (t: Translations) => string;
}

export function parseStatuses(status: Status.Sys) {
    const keys: StatusKey[] = [];
    forOwn(status, (subKey, topKey) => {
        const key = `${topKey}_${subKey}`
        if (!(key in statusDefs)) {
            console.error(`Unknown status for: ${topKey}.${subKey} (not impl.?), discarding!`);
            return;
        }
        keys.push(key as StatusKey);
    });
    return keys;
}

export type StatusKey = 'eth_NOT_ENABLED' | 'eth_CONNECTING_DHCP' | 'eth_CONNECTED' | 'eth_NO_CABLE' | 'wifi_NOT_ENABLED' | 'wifi_CONNECTING_DHCP' | 'wifi_CONNECTED' | 'wifi_AP_RUNNING' | 'wifi_NO_SSID_SET' | 'wifi_E_CONNECTING_SSID_NOT_FOUND' | 'wifi_E_CONNECTING_SSID_WRONG_CRED' | 'wifi_E_CONNECTING_SSID_BAD_LINK' | 'wifi_CONNECTING_SSID' | 'time_NO_NTP_ENTERED' | 'time_NO_GATEWAY_SET' | 'time_SYNCING' | 'time_E_NO_INTERFACE_UP' | 'time_E_NO_RESPONSE' | 'time_SYNCED';

export type StatusDefinitions = {[K in StatusKey]: StatusData };

export type StatusLevel = 'success' | 'progress' | 'error';

export const statusDefs: StatusDefinitions = {
    eth_NOT_ENABLED: {
        page: 'interfaces',
        translation: t => 'Not enabled'
    },
    eth_CONNECTING_DHCP: {
        settingKey: 'eth__dhcp',
        page: 'interfaces',
        level: 'progress',
        translation: t => 'Connecting (DHCP)'
    },
    eth_CONNECTED: {
        page: 'interfaces',
        level: 'success',
        translation: t => 'Connected'
    },
    eth_NO_CABLE: {
        page: 'interfaces',
        translation: t => 'No cable'
    },
    wifi_NOT_ENABLED: {
        page: 'interfaces',
        translation: t => 'Not enabled'
    },
    wifi_CONNECTING_DHCP: {
        settingKey: 'wifi__dhcp',
        page: 'interfaces',
        level: 'progress',
        translation: t => 'Connecting (DHCP)'
    },
    wifi_CONNECTED: {
        page: 'interfaces',
        level: 'success',
        translation: t => 'Connected'
    },
    wifi_AP_RUNNING: {
        settingKey: 'wifi__mode',
        page: 'interfaces',
        translation: t => 'Access point is running'
    },
    wifi_NO_SSID_SET: {
        settingKey: 'wifi__ssid',
        page: 'interfaces',
        translation: t => 'No SSID set'
    },
    wifi_E_CONNECTING_SSID_NOT_FOUND: {
        settingKey: 'wifi__ssid',
        page: 'interfaces',
        level: 'error',
        translation: t => 'SSID was not found, retrying...'
    },
    wifi_E_CONNECTING_SSID_WRONG_CRED: {
        settingKey: 'wifi__ssid',
        page: 'interfaces',
        level: 'error',
        translation: t => 'Authentication failed'
    },
    wifi_E_CONNECTING_SSID_BAD_LINK: {
        settingKey: 'wifi__ssid',
        page: 'interfaces',
        level: 'error',
        translation: t => 'Bad connection, try reducing the distance to the WiFi access point.'
    },
    wifi_CONNECTING_SSID: {
        settingKey: 'wifi__ssid',
        page: 'interfaces',
        level: 'progress',
        translation: t => 'Connecting to SSID'
    },
    time_NO_NTP_ENTERED: {
        settingKey: 'network__time',
        page: 'network',
        translation: t => 'No server entered'
    },
    time_NO_GATEWAY_SET: {
        settingKey: 'network__time',
        page: 'network',
        translation: t => 'No gateway set'
    },
    time_SYNCING: {
        settingKey: 'network__time',
        page: 'network',
        level: 'progress',
        translation: t => 'Syncing'
    },
    time_E_NO_INTERFACE_UP: {
        settingKey: 'network__time',
        page: 'network',
        level: 'error',
        translation: t => 'No interface up'
    },
    time_E_NO_RESPONSE: {
        settingKey: 'network__time',
        page: 'network',
        level: 'error',
        translation: t => 'No response'
    },
    time_SYNCED: {
        settingKey: 'network__time',
        page: 'network',
        level: 'success',
        translation: t => 'Synced'
    }
}

export function getStatusDef(key: StatusKey) {
    return statusDefs[key];
}