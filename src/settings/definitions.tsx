import { ipAddressCharsCsv } from '../common/regexConst';
import { isUndefined } from 'lodash';
import * as React from 'react';
import { Translations } from '../translations/base/translations';
export interface StateChangeEvent {
    key: SettingsKey, value: any, inactive?: boolean
}
interface IdEqualsValue {
    keys: string | string[];
    func: (...values: StateChangeEvent[]) => boolean;
}

export type Condition = { condition?: IdEqualsValue; }
export type ConditionSelect = {
    value: string;
    label: (trans: Translations) => string;
} & Condition;

type SettingDefBase = {
    allowNull?:boolean;
    label: (trans: Translations) => string;
    description?: (trans: Translations) => string | React.ReactNode;
    validate?: (value: any, t: Translations) => string | undefined;
} & Condition;

export type SelectDef = {
    $type: 'select',
    values: ConditionSelect[],
    default?: string;
} & SettingDefBase

type InputBase2<T extends string> = {
    $type: T;
    placeHolder?: (t: Translations) => string,
    icon?: string;
    regex?: RegExp | null;
} & SettingDefBase;

interface NumberDef extends InputBase2<'number'> {
    default?: number;
}
interface StringDef extends InputBase2<'string'> {
    default?: string;
}
interface IpDef extends InputBase2<'ip'> {
    default?: string;
}
interface PasswordDef extends InputBase2<'password'> {
    default?: string;
}
type BoolDef = {
    $type: 'boolean',
    default?: boolean;
} & SettingDefBase;
type FileInputDef = {
    $type: 'fileinput';
    default?: string;
} & SettingDefBase;

export type InputBase = NumberDef | StringDef | IpDef | PasswordDef;

export type SettingDef = FileInputDef | InputBase | BoolDef | SelectDef;

function getNetworkPartialDef(pre: string) {
    const noClient = {
        condition: {
            keys: [pre + '__enabled', pre + '__dhcp'],
            func: (en, dhcp) => en.value && dhcp.value !== 'client'
        }
    } as SettingDef;

    const onlyServer = {
        condition: {
            keys: [pre + '__enabled', pre + '__dhcp',],
            func: (en, dhcp) => en.value && dhcp.value === 'server'
        }
    } as SettingDef

    return {
        [pre + '__static_ip']: {
            $type: 'ip',
            label: t => t.networksettings.static_ip,
            icon: 'fa icon-sitemap',
            ...noClient
        } as SettingDef,
        [pre + '__static_net']: {
            $type: 'ip',
            label: t => t.networksettings.static_net,
            icon: 'fa icon-sitemap',
            ...noClient
        } as SettingDef,
        [pre + '__static_gw']: {
            $type: 'ip',
            label: t => t.networksettings.static_gw,
            icon: 'fa icon-server',
            ...noClient
        } as SettingDef,
        [pre + '__dhcps_min']: {
            $type: 'ip',
            label: t => 'DCHP min. IP',
            icon: 'fa icon-sitemap',
            ...onlyServer
        } as SettingDef,
        [pre + '__dhcps_max']: {
            $type: 'ip',
            label: t => 'DCHP max. IP',
            icon: 'fa icon-sitemap',
            ...onlyServer
        } as SettingDef
    } as {
            [id: string]: SettingDef;
        }
}

function getEnabledCondition(pre: string) {
    return {
        condition: {
            keys: pre + '__enabled',
            func: (en: any) => en.value
        } as Condition
    }
}
const wifiEnabled = getEnabledCondition('wifi');
const ethEnabled = getEnabledCondition('eth');

export const definitions = {
    interfaces: {
        wifi__enabled: {
            $type: 'boolean',
            label: t => 'Enabled'
        } as SettingDef,
        wifi__mode: {
            $type: 'select',
            label: t => 'Mode',
            values: [
                {
                    value: 'ap',
                    label: t => t.networksettings.ap_mode_ap
                },
                {
                    value: 'station',
                    label: t => t.networksettings.ap_mode_station
                }
            ],
            ...wifiEnabled
        } as SettingDef,
        wifi__ssid: {
            $type: 'string',
            icon: 'fa icon-wifi',
            label: t => t.networksettings.wifissid,
            ...wifiEnabled
        } as SettingDef,
        wifi__password: {
            $type: 'password',
            icon: 'fa icon-key',
            label: t => 'Password',
            ...wifiEnabled
        } as SettingDef,
        wifi__dhcp: {
            $type: 'select',
            label: t => 'DHCP',
            values: [
                {
                    value: 'server',
                    label: t => t.networksettings.dhcp_mode_server
                },
                {
                    value: 'client',
                    label: t => t.networksettings.dhcp_mode_client,
                    condition: {
                        keys: ['wifi__enabled', 'wifi__mode'],
                        func: (en, mode) => en.value && mode.value !== 'ap'
                    }
                },
                {
                    value: 'static',
                    label: t => t.networksettings.dhcp_mode_static
                }
            ],
            ...wifiEnabled
        } as SettingDef,
        ...getNetworkPartialDef('wifi'),
        wifi__factory_ssid_pass: {
            $type: 'boolean',
            label: t => '<No label>'
        } as SettingDef,

        eth__enabled: {
            $type: 'boolean',
            label: t => 'Enabled'
        } as SettingDef,
        eth__dhcp: {
            $type: 'select',
            label: t => 'DHCP',
            values: [
                {
                    value: 'server',
                    label: t => t.networksettings.dhcp_mode_server
                },
                {
                    value: 'client',
                    label: t => t.networksettings.dhcp_mode_client
                },
                {
                    value: 'static',
                    label: t => t.networksettings.dhcp_mode_static
                }
            ],
            ...ethEnabled
        } as SettingDef,
        ...getNetworkPartialDef('eth')
    },
    network: {
        network__dns: {
            $type: 'string', // weil ist csv, nicht ip
            icon: 'fa icon-server',
            label: t => 'DNS Server',
            regex: ipAddressCharsCsv,
            description: t => `You may specify multiple servers, separated by spaces and/or commas.`
        } as SettingDef,
        network__hostname: {
            $type: 'string',
            icon: 'fa icon-server',
            label: t => 'Host name',
            description: t => `The host name of the device.`
        } as SettingDef,
        network__time: {
            $type: 'string',
            icon: 'fa icon-server',
            label: t => t.systemsettings.ntpserver,
            description: t => `You may specify multiple servers, separated by spaces and/or commas.`
        } as SettingDef,
        network__track: {
            $type: 'boolean',
            label: t => 'Enable "Find My Neonious"',
            description: t => <span>If enabled, and your device has internet accesss, you can look up your device's ip addresses at <a href='https://www.neonious.com/FindMyNeonious' target='_blank'>neonious.com/FindMyNeonious</a>.</span>
        } as SettingDef,
    },
    web: {
        web__password: {
            $type: 'password',
            icon: 'fa icon-key',
            placeHolder: t => t.g.placeholder_enter_to_change,
            label: t => t.usersettings.password,
            noread: true
        } as SettingDef,
        web__http_enabled: {
            $type: 'boolean',
            label: t => 'HTTP enabled'
        } as SettingDef,
        web__http: {
            $type: 'number',
            icon: 'fa icon-globe',
            label: t => t.websettings.http
        } as SettingDef,
        web__https_enabled: {
            $type: 'boolean',
            label: t => 'HTTPS enabled'
        } as SettingDef,
        web__https: {
            $type: 'number',
            icon: 'fa icon-globe',
            label: t => t.websettings.https
        } as SettingDef,
        web__redirect_to_https: {
            $type: 'boolean',
            icon: 'fa icon-globe',
            label: t => 'Redirect to HTTPS',
            description: t => 'Redirect all HTTP requests to HTTPs port.'
        } as SettingDef,
        web__cert_and_key_path_enabled: {
            $type: 'boolean',
            label: t => 'Enable'
        } as SettingDef,
        web__cert_path: {
            $type: 'string',
            label: t => t.websettings.cert_path
        } as SettingDef,
        web__cert_key_path: {
            $type: 'string',
            label: t => t.websettings.cert_key_path
        } as SettingDef,
        web__cert_ca_path_enabled: {
            $type: 'boolean',
            label: t => 'Enable CA path'
        } as SettingDef,
        web__cert_ca_path: {
            $type: 'string',
            label: t => t.websettings.cert_ca_path
        } as SettingDef,
    }, // later trans in this file
    editor: {
        editor__auto_closing_brackets: {
            $type: 'boolean',
            label: t => 'Auto close brackets',
            default: true
        } as SettingDef,
        editor__auto_save_on_start: {
            $type: 'boolean',
            label: t => 'Auto save on run',
            default: false
        } as SettingDef,
        editor__font_size: {
            $type: 'number',
            icon: 'fa icon-font-size',
            label: t => 'Font size',
            default: 12,
            validate: (value: number | undefined, t: Translations) => {
                if (isUndefined(value) || value <= 0) {
                    return 'The font size must be a positive integer.'
                } else if (value > 96) {
                    return 'The maximum value for the font size is 96.';
                }
            }
        } as SettingDef,
        editor__minimap: {
            $type: 'boolean',
            label: t => 'Enable minimap',
            default: true,
            description: t => 'Enables or disables the document preview which can be seen on the right side next to the editing area.'
        } as SettingDef,
        editor__wordwrap: {
            $type: 'boolean',
            label: t => 'Enable wordwrap',
            default: true
        } as SettingDef,
    },
    code: {
        code__console_kb: {
            $type: 'number',
            icon: 'fa icon-terminal',
            description: t => 'If the console log grows beyond this point, old messages are discarded.',
            label: t => t.codesettings.console_kb
        } as SettingDef,
        code__auto_start: {
            $type: 'boolean',
            description: t => 'If enabled, your program will run when neonious one boots.',
            label: t => t.codesettings.autostart
        } as SettingDef,
        code__auto_restart_on_fatal: {
            $type: 'boolean',
            description: t => 'If enabled, your program will restart when a fatal exception happens.',
            label: t => 'Auto restart on fatal exception'
        } as SettingDef,
        code__main: {
            $type: 'string',
            label: t => 'Main entry file',
        } as SettingDef,
        code__watchdog_mode: {
            $type: 'select',
            label: t => 'Mode',
            values: [
                {
                    value: 'off',
                    label: t => 'Disabled'
                },
                {
                    value: 'software',
                    label: t => 'Software/engine based'
                },
                {
                    value: 'hardware',
                    label: t => 'Hardware based'
                }
            ]
        } as SettingDef,
        code__watchdog_timeout_secs:{
            $type: 'number',
            description: t => 'Seconds after which the watchdog will timeout and restart the program (software) or the device (hardware).',
            label: t => 'Seconds till timeout'
        } as SettingDef,
        code__kick_watchdog_event_loop:{
            $type:'boolean',
            label:t => 'Shall the watchdog be reset in the event loop?'
        } as SettingDef,
        code__only_static_files: {
            $type: 'boolean',
            description: t => 'If enabled, device will only look for code files in static area (for use with custom firmware images)',
            label: t => 'Only static code files'
        } as SettingDef,
    },
    sdcard: {
        sdcard__enabled:{
            $type:'boolean',
            label:t => 'Shall the SD card be mounted?'
        }as SettingDef,
        sdcard__mount:{
            $type:'string',
            label:t => 'The directory path under which the SD card shall be mounted, starting with /.'
        }as SettingDef,
        sdcard__mode:{
            $type:'string',
            label:t => 'spi - Slowest, most compatible. Pins configurable\nsd1line - Uses pins 2, 13, 14, 15, 21\nsd4line - Fastest mode, uses pins 2, 4, 12, 13, 14, 15, 21'
        }as SettingDef,
        sdcard__pin_miso:{
            $type: 'number',
            label:t => 'Pin number for MISO in SPI mode'
        }as SettingDef,
        sdcard__pin_mosi:{
            $type: 'number',
            label:t => 'Pin number for MOSI in SPI mode'
        }as SettingDef,
        sdcard__pin_sclk:{
            $type: 'number',
            label:t => 'Pin number for SCLK in SPI mode'
        }as SettingDef, 
        sdcard__pin_cs:{
            $type: 'number',
            label:t => 'Pin number for CS in SPI mode. May be omitted.'
        }as SettingDef, 
        sdcard__pin_cd:{
            allowNull:true,
            $type: 'number',
            label:t => '' // todo setting description
        }as SettingDef, 
        sdcard__pin_wp:{
            allowNull:true,
            $type: 'number',
            label:t => '' // todo setting description
        }as SettingDef,
        sdcard__clock_speed:{
            $type: 'number',
            label:t => 'Transfer speed in Hz'
        }as SettingDef,
    }
}

export type SettingPageKey = keyof typeof definitions;
type PageKey<K extends SettingPageKey> = keyof typeof definitions[K];

type WifiNet = 'wifi__static_ip' | 'wifi__static_net' | 'wifi__static_gw' | 'wifi__dhcps_min' | 'wifi__dhcps_max';
type EthNet = 'eth__static_ip' | 'eth__static_net' | 'eth__static_gw' | 'eth__dhcps_min' | 'eth__dhcps_max';
export type SettingsKey = 'wifi__enabled' | 'wifi__ssid' | 'wifi__password' | 'wifi__mode' | 'wifi__dhcp' | WifiNet | EthNet | 'eth__enabled' | 'eth__dhcp' | PageKey<'network'> | PageKey<'web'> | PageKey<'editor'> | PageKey<'code'>;
