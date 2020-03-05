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

        eth__phy: {
            $type: 'select',
            label: t => 'PHY chip',
            values: [
                {
                    value: 'LAN8720',
                    label: t => 'LAN8720'
                },
                {
                    value: 'IP101',
                    label: t => 'IP101'
                }
            ]
        } as SettingDef,
        eth__phy_addr:{
            $type: 'number',
            label:t => 'PHY chip address'
        }as SettingDef,
        eth__pin_reset:{
            $type: 'number',
            label:t => 'Pin number for PHY reset'
        }as SettingDef,
        eth__pin_power:{
            $type: 'number',
            label:t => 'Pin number for PHY power'
        }as SettingDef,
        eth__pin_clk_mode: {
            $type: 'select',
            label: t => 'Pin number and mode for clock',
            values: [
                {
                    value: '0_in',
                    label: t => 'GPIO0, 50 Mhz input'
                },
                {
                    value: '0_out',
                    label: t => 'GPIO0, 50 Mhz output'
                }
            ]
        } as SettingDef,
        eth__pin_mdc:{
            $type: 'number',
            label:t => 'Pin number for MDC'
        }as SettingDef,
        eth__pin_mdio:{
            $type: 'number',
            label:t => 'Pin number for MDIO'
        }as SettingDef,
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
            ...ethEnabled,
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
        network__timezone: {
            $type: 'select',
            label: t => "Local time zone",
            values: [
                {label: t => "Africa/Abidjan", value: "Africa/Abidjan"},
{label: t => "Africa/Accra", value: "Africa/Accra"},
{label: t => "Africa/Addis_Ababa", value: "Africa/Addis_Ababa"},
{label: t => "Africa/Algiers", value: "Africa/Algiers"},
{label: t => "Africa/Asmara", value: "Africa/Asmara"},
{label: t => "Africa/Bamako", value: "Africa/Bamako"},
{label: t => "Africa/Bangui", value: "Africa/Bangui"},
{label: t => "Africa/Banjul", value: "Africa/Banjul"},
{label: t => "Africa/Bissau", value: "Africa/Bissau"},
{label: t => "Africa/Blantyre", value: "Africa/Blantyre"},
{label: t => "Africa/Brazzaville", value: "Africa/Brazzaville"},
{label: t => "Africa/Bujumbura", value: "Africa/Bujumbura"},
{label: t => "Africa/Cairo", value: "Africa/Cairo"},
{label: t => "Africa/Casablanca", value: "Africa/Casablanca"},
{label: t => "Africa/Ceuta", value: "Africa/Ceuta"},
{label: t => "Africa/Conakry", value: "Africa/Conakry"},
{label: t => "Africa/Dakar", value: "Africa/Dakar"},
{label: t => "Africa/Dar_es_Salaam", value: "Africa/Dar_es_Salaam"},
{label: t => "Africa/Djibouti", value: "Africa/Djibouti"},
{label: t => "Africa/Douala", value: "Africa/Douala"},
{label: t => "Africa/El_Aaiun", value: "Africa/El_Aaiun"},
{label: t => "Africa/Freetown", value: "Africa/Freetown"},
{label: t => "Africa/Gaborone", value: "Africa/Gaborone"},
{label: t => "Africa/Harare", value: "Africa/Harare"},
{label: t => "Africa/Johannesburg", value: "Africa/Johannesburg"},
{label: t => "Africa/Juba", value: "Africa/Juba"},
{label: t => "Africa/Kampala", value: "Africa/Kampala"},
{label: t => "Africa/Khartoum", value: "Africa/Khartoum"},
{label: t => "Africa/Kigali", value: "Africa/Kigali"},
{label: t => "Africa/Kinshasa", value: "Africa/Kinshasa"},
{label: t => "Africa/Lagos", value: "Africa/Lagos"},
{label: t => "Africa/Libreville", value: "Africa/Libreville"},
{label: t => "Africa/Lome", value: "Africa/Lome"},
{label: t => "Africa/Luanda", value: "Africa/Luanda"},
{label: t => "Africa/Lubumbashi", value: "Africa/Lubumbashi"},
{label: t => "Africa/Lusaka", value: "Africa/Lusaka"},
{label: t => "Africa/Malabo", value: "Africa/Malabo"},
{label: t => "Africa/Maputo", value: "Africa/Maputo"},
{label: t => "Africa/Maseru", value: "Africa/Maseru"},
{label: t => "Africa/Mbabane", value: "Africa/Mbabane"},
{label: t => "Africa/Mogadishu", value: "Africa/Mogadishu"},
{label: t => "Africa/Monrovia", value: "Africa/Monrovia"},
{label: t => "Africa/Nairobi", value: "Africa/Nairobi"},
{label: t => "Africa/Ndjamena", value: "Africa/Ndjamena"},
{label: t => "Africa/Niamey", value: "Africa/Niamey"},
{label: t => "Africa/Nouakchott", value: "Africa/Nouakchott"},
{label: t => "Africa/Ouagadougou", value: "Africa/Ouagadougou"},
{label: t => "Africa/Porto-Novo", value: "Africa/Porto-Novo"},
{label: t => "Africa/Sao_Tome", value: "Africa/Sao_Tome"},
{label: t => "Africa/Tripoli", value: "Africa/Tripoli"},
{label: t => "Africa/Tunis", value: "Africa/Tunis"},
{label: t => "Africa/Windhoek", value: "Africa/Windhoek"},
{label: t => "America/Adak", value: "America/Adak"},
{label: t => "America/Anchorage", value: "America/Anchorage"},
{label: t => "America/Anguilla", value: "America/Anguilla"},
{label: t => "America/Antigua", value: "America/Antigua"},
{label: t => "America/Araguaina", value: "America/Araguaina"},
{label: t => "America/Argentina/Buenos_Aires", value: "America/Argentina/Buenos_Aires"},
{label: t => "America/Argentina/Catamarca", value: "America/Argentina/Catamarca"},
{label: t => "America/Argentina/Cordoba", value: "America/Argentina/Cordoba"},
{label: t => "America/Argentina/Jujuy", value: "America/Argentina/Jujuy"},
{label: t => "America/Argentina/La_Rioja", value: "America/Argentina/La_Rioja"},
{label: t => "America/Argentina/Mendoza", value: "America/Argentina/Mendoza"},
{label: t => "America/Argentina/Rio_Gallegos", value: "America/Argentina/Rio_Gallegos"},
{label: t => "America/Argentina/Salta", value: "America/Argentina/Salta"},
{label: t => "America/Argentina/San_Juan", value: "America/Argentina/San_Juan"},
{label: t => "America/Argentina/San_Luis", value: "America/Argentina/San_Luis"},
{label: t => "America/Argentina/Tucuman", value: "America/Argentina/Tucuman"},
{label: t => "America/Argentina/Ushuaia", value: "America/Argentina/Ushuaia"},
{label: t => "America/Aruba", value: "America/Aruba"},
{label: t => "America/Asuncion", value: "America/Asuncion"},
{label: t => "America/Atikokan", value: "America/Atikokan"},
{label: t => "America/Bahia", value: "America/Bahia"},
{label: t => "America/Bahia_Banderas", value: "America/Bahia_Banderas"},
{label: t => "America/Barbados", value: "America/Barbados"},
{label: t => "America/Belem", value: "America/Belem"},
{label: t => "America/Belize", value: "America/Belize"},
{label: t => "America/Blanc-Sablon", value: "America/Blanc-Sablon"},
{label: t => "America/Boa_Vista", value: "America/Boa_Vista"},
{label: t => "America/Bogota", value: "America/Bogota"},
{label: t => "America/Boise", value: "America/Boise"},
{label: t => "America/Cambridge_Bay", value: "America/Cambridge_Bay"},
{label: t => "America/Campo_Grande", value: "America/Campo_Grande"},
{label: t => "America/Cancun", value: "America/Cancun"},
{label: t => "America/Caracas", value: "America/Caracas"},
{label: t => "America/Cayenne", value: "America/Cayenne"},
{label: t => "America/Cayman", value: "America/Cayman"},
{label: t => "America/Chicago", value: "America/Chicago"},
{label: t => "America/Chihuahua", value: "America/Chihuahua"},
{label: t => "America/Costa_Rica", value: "America/Costa_Rica"},
{label: t => "America/Creston", value: "America/Creston"},
{label: t => "America/Cuiaba", value: "America/Cuiaba"},
{label: t => "America/Curacao", value: "America/Curacao"},
{label: t => "America/Danmarkshavn", value: "America/Danmarkshavn"},
{label: t => "America/Dawson", value: "America/Dawson"},
{label: t => "America/Dawson_Creek", value: "America/Dawson_Creek"},
{label: t => "America/Denver", value: "America/Denver"},
{label: t => "America/Detroit", value: "America/Detroit"},
{label: t => "America/Dominica", value: "America/Dominica"},
{label: t => "America/Edmonton", value: "America/Edmonton"},
{label: t => "America/Eirunepe", value: "America/Eirunepe"},
{label: t => "America/El_Salvador", value: "America/El_Salvador"},
{label: t => "America/Fortaleza", value: "America/Fortaleza"},
{label: t => "America/Fort_Nelson", value: "America/Fort_Nelson"},
{label: t => "America/Glace_Bay", value: "America/Glace_Bay"},
{label: t => "America/Godthab", value: "America/Godthab"},
{label: t => "America/Goose_Bay", value: "America/Goose_Bay"},
{label: t => "America/Grand_Turk", value: "America/Grand_Turk"},
{label: t => "America/Grenada", value: "America/Grenada"},
{label: t => "America/Guadeloupe", value: "America/Guadeloupe"},
{label: t => "America/Guatemala", value: "America/Guatemala"},
{label: t => "America/Guayaquil", value: "America/Guayaquil"},
{label: t => "America/Guyana", value: "America/Guyana"},
{label: t => "America/Halifax", value: "America/Halifax"},
{label: t => "America/Havana", value: "America/Havana"},
{label: t => "America/Hermosillo", value: "America/Hermosillo"},
{label: t => "America/Indiana/Indianapolis", value: "America/Indiana/Indianapolis"},
{label: t => "America/Indiana/Knox", value: "America/Indiana/Knox"},
{label: t => "America/Indiana/Marengo", value: "America/Indiana/Marengo"},
{label: t => "America/Indiana/Petersburg", value: "America/Indiana/Petersburg"},
{label: t => "America/Indiana/Tell_City", value: "America/Indiana/Tell_City"},
{label: t => "America/Indiana/Vevay", value: "America/Indiana/Vevay"},
{label: t => "America/Indiana/Vincennes", value: "America/Indiana/Vincennes"},
{label: t => "America/Indiana/Winamac", value: "America/Indiana/Winamac"},
{label: t => "America/Inuvik", value: "America/Inuvik"},
{label: t => "America/Iqaluit", value: "America/Iqaluit"},
{label: t => "America/Jamaica", value: "America/Jamaica"},
{label: t => "America/Juneau", value: "America/Juneau"},
{label: t => "America/Kentucky/Louisville", value: "America/Kentucky/Louisville"},
{label: t => "America/Kentucky/Monticello", value: "America/Kentucky/Monticello"},
{label: t => "America/Kralendijk", value: "America/Kralendijk"},
{label: t => "America/La_Paz", value: "America/La_Paz"},
{label: t => "America/Lima", value: "America/Lima"},
{label: t => "America/Los_Angeles", value: "America/Los_Angeles"},
{label: t => "America/Lower_Princes", value: "America/Lower_Princes"},
{label: t => "America/Maceio", value: "America/Maceio"},
{label: t => "America/Managua", value: "America/Managua"},
{label: t => "America/Manaus", value: "America/Manaus"},
{label: t => "America/Marigot", value: "America/Marigot"},
{label: t => "America/Martinique", value: "America/Martinique"},
{label: t => "America/Matamoros", value: "America/Matamoros"},
{label: t => "America/Mazatlan", value: "America/Mazatlan"},
{label: t => "America/Menominee", value: "America/Menominee"},
{label: t => "America/Merida", value: "America/Merida"},
{label: t => "America/Metlakatla", value: "America/Metlakatla"},
{label: t => "America/Mexico_City", value: "America/Mexico_City"},
{label: t => "America/Miquelon", value: "America/Miquelon"},
{label: t => "America/Moncton", value: "America/Moncton"},
{label: t => "America/Monterrey", value: "America/Monterrey"},
{label: t => "America/Montevideo", value: "America/Montevideo"},
{label: t => "America/Montreal", value: "America/Montreal"},
{label: t => "America/Montserrat", value: "America/Montserrat"},
{label: t => "America/Nassau", value: "America/Nassau"},
{label: t => "America/New_York", value: "America/New_York"},
{label: t => "America/Nipigon", value: "America/Nipigon"},
{label: t => "America/Nome", value: "America/Nome"},
{label: t => "America/Noronha", value: "America/Noronha"},
{label: t => "America/North_Dakota/Beulah", value: "America/North_Dakota/Beulah"},
{label: t => "America/North_Dakota/Center", value: "America/North_Dakota/Center"},
{label: t => "America/North_Dakota/New_Salem", value: "America/North_Dakota/New_Salem"},
{label: t => "America/Ojinaga", value: "America/Ojinaga"},
{label: t => "America/Panama", value: "America/Panama"},
{label: t => "America/Pangnirtung", value: "America/Pangnirtung"},
{label: t => "America/Paramaribo", value: "America/Paramaribo"},
{label: t => "America/Phoenix", value: "America/Phoenix"},
{label: t => "America/Port-au-Prince", value: "America/Port-au-Prince"},
{label: t => "America/Port_of_Spain", value: "America/Port_of_Spain"},
{label: t => "America/Porto_Velho", value: "America/Porto_Velho"},
{label: t => "America/Puerto_Rico", value: "America/Puerto_Rico"},
{label: t => "America/Punta_Arenas", value: "America/Punta_Arenas"},
{label: t => "America/Rainy_River", value: "America/Rainy_River"},
{label: t => "America/Rankin_Inlet", value: "America/Rankin_Inlet"},
{label: t => "America/Recife", value: "America/Recife"},
{label: t => "America/Regina", value: "America/Regina"},
{label: t => "America/Resolute", value: "America/Resolute"},
{label: t => "America/Rio_Branco", value: "America/Rio_Branco"},
{label: t => "America/Santarem", value: "America/Santarem"},
{label: t => "America/Santiago", value: "America/Santiago"},
{label: t => "America/Santo_Domingo", value: "America/Santo_Domingo"},
{label: t => "America/Sao_Paulo", value: "America/Sao_Paulo"},
{label: t => "America/Scoresbysund", value: "America/Scoresbysund"},
{label: t => "America/Sitka", value: "America/Sitka"},
{label: t => "America/St_Barthelemy", value: "America/St_Barthelemy"},
{label: t => "America/St_Johns", value: "America/St_Johns"},
{label: t => "America/St_Kitts", value: "America/St_Kitts"},
{label: t => "America/St_Lucia", value: "America/St_Lucia"},
{label: t => "America/St_Thomas", value: "America/St_Thomas"},
{label: t => "America/St_Vincent", value: "America/St_Vincent"},
{label: t => "America/Swift_Current", value: "America/Swift_Current"},
{label: t => "America/Tegucigalpa", value: "America/Tegucigalpa"},
{label: t => "America/Thule", value: "America/Thule"},
{label: t => "America/Thunder_Bay", value: "America/Thunder_Bay"},
{label: t => "America/Tijuana", value: "America/Tijuana"},
{label: t => "America/Toronto", value: "America/Toronto"},
{label: t => "America/Tortola", value: "America/Tortola"},
{label: t => "America/Vancouver", value: "America/Vancouver"},
{label: t => "America/Whitehorse", value: "America/Whitehorse"},
{label: t => "America/Winnipeg", value: "America/Winnipeg"},
{label: t => "America/Yakutat", value: "America/Yakutat"},
{label: t => "America/Yellowknife", value: "America/Yellowknife"},
{label: t => "Antarctica/Casey", value: "Antarctica/Casey"},
{label: t => "Antarctica/Davis", value: "Antarctica/Davis"},
{label: t => "Antarctica/DumontDUrville", value: "Antarctica/DumontDUrville"},
{label: t => "Antarctica/Macquarie", value: "Antarctica/Macquarie"},
{label: t => "Antarctica/Mawson", value: "Antarctica/Mawson"},
{label: t => "Antarctica/McMurdo", value: "Antarctica/McMurdo"},
{label: t => "Antarctica/Palmer", value: "Antarctica/Palmer"},
{label: t => "Antarctica/Rothera", value: "Antarctica/Rothera"},
{label: t => "Antarctica/Syowa", value: "Antarctica/Syowa"},
{label: t => "Antarctica/Troll", value: "Antarctica/Troll"},
{label: t => "Antarctica/Vostok", value: "Antarctica/Vostok"},
{label: t => "Arctic/Longyearbyen", value: "Arctic/Longyearbyen"},
{label: t => "Asia/Aden", value: "Asia/Aden"},
{label: t => "Asia/Almaty", value: "Asia/Almaty"},
{label: t => "Asia/Amman", value: "Asia/Amman"},
{label: t => "Asia/Anadyr", value: "Asia/Anadyr"},
{label: t => "Asia/Aqtau", value: "Asia/Aqtau"},
{label: t => "Asia/Aqtobe", value: "Asia/Aqtobe"},
{label: t => "Asia/Ashgabat", value: "Asia/Ashgabat"},
{label: t => "Asia/Atyrau", value: "Asia/Atyrau"},
{label: t => "Asia/Baghdad", value: "Asia/Baghdad"},
{label: t => "Asia/Bahrain", value: "Asia/Bahrain"},
{label: t => "Asia/Baku", value: "Asia/Baku"},
{label: t => "Asia/Bangkok", value: "Asia/Bangkok"},
{label: t => "Asia/Barnaul", value: "Asia/Barnaul"},
{label: t => "Asia/Beirut", value: "Asia/Beirut"},
{label: t => "Asia/Bishkek", value: "Asia/Bishkek"},
{label: t => "Asia/Brunei", value: "Asia/Brunei"},
{label: t => "Asia/Chita", value: "Asia/Chita"},
{label: t => "Asia/Choibalsan", value: "Asia/Choibalsan"},
{label: t => "Asia/Colombo", value: "Asia/Colombo"},
{label: t => "Asia/Damascus", value: "Asia/Damascus"},
{label: t => "Asia/Dhaka", value: "Asia/Dhaka"},
{label: t => "Asia/Dili", value: "Asia/Dili"},
{label: t => "Asia/Dubai", value: "Asia/Dubai"},
{label: t => "Asia/Dushanbe", value: "Asia/Dushanbe"},
{label: t => "Asia/Famagusta", value: "Asia/Famagusta"},
{label: t => "Asia/Gaza", value: "Asia/Gaza"},
{label: t => "Asia/Hebron", value: "Asia/Hebron"},
{label: t => "Asia/Ho_Chi_Minh", value: "Asia/Ho_Chi_Minh"},
{label: t => "Asia/Hong_Kong", value: "Asia/Hong_Kong"},
{label: t => "Asia/Hovd", value: "Asia/Hovd"},
{label: t => "Asia/Irkutsk", value: "Asia/Irkutsk"},
{label: t => "Asia/Jakarta", value: "Asia/Jakarta"},
{label: t => "Asia/Jayapura", value: "Asia/Jayapura"},
{label: t => "Asia/Jerusalem", value: "Asia/Jerusalem"},
{label: t => "Asia/Kabul", value: "Asia/Kabul"},
{label: t => "Asia/Kamchatka", value: "Asia/Kamchatka"},
{label: t => "Asia/Karachi", value: "Asia/Karachi"},
{label: t => "Asia/Kathmandu", value: "Asia/Kathmandu"},
{label: t => "Asia/Khandyga", value: "Asia/Khandyga"},
{label: t => "Asia/Kolkata", value: "Asia/Kolkata"},
{label: t => "Asia/Krasnoyarsk", value: "Asia/Krasnoyarsk"},
{label: t => "Asia/Kuala_Lumpur", value: "Asia/Kuala_Lumpur"},
{label: t => "Asia/Kuching", value: "Asia/Kuching"},
{label: t => "Asia/Kuwait", value: "Asia/Kuwait"},
{label: t => "Asia/Macau", value: "Asia/Macau"},
{label: t => "Asia/Magadan", value: "Asia/Magadan"},
{label: t => "Asia/Makassar", value: "Asia/Makassar"},
{label: t => "Asia/Manila", value: "Asia/Manila"},
{label: t => "Asia/Muscat", value: "Asia/Muscat"},
{label: t => "Asia/Nicosia", value: "Asia/Nicosia"},
{label: t => "Asia/Novokuznetsk", value: "Asia/Novokuznetsk"},
{label: t => "Asia/Novosibirsk", value: "Asia/Novosibirsk"},
{label: t => "Asia/Omsk", value: "Asia/Omsk"},
{label: t => "Asia/Oral", value: "Asia/Oral"},
{label: t => "Asia/Phnom_Penh", value: "Asia/Phnom_Penh"},
{label: t => "Asia/Pontianak", value: "Asia/Pontianak"},
{label: t => "Asia/Pyongyang", value: "Asia/Pyongyang"},
{label: t => "Asia/Qatar", value: "Asia/Qatar"},
{label: t => "Asia/Qyzylorda", value: "Asia/Qyzylorda"},
{label: t => "Asia/Riyadh", value: "Asia/Riyadh"},
{label: t => "Asia/Sakhalin", value: "Asia/Sakhalin"},
{label: t => "Asia/Samarkand", value: "Asia/Samarkand"},
{label: t => "Asia/Seoul", value: "Asia/Seoul"},
{label: t => "Asia/Shanghai", value: "Asia/Shanghai"},
{label: t => "Asia/Singapore", value: "Asia/Singapore"},
{label: t => "Asia/Srednekolymsk", value: "Asia/Srednekolymsk"},
{label: t => "Asia/Taipei", value: "Asia/Taipei"},
{label: t => "Asia/Tashkent", value: "Asia/Tashkent"},
{label: t => "Asia/Tbilisi", value: "Asia/Tbilisi"},
{label: t => "Asia/Tehran", value: "Asia/Tehran"},
{label: t => "Asia/Thimphu", value: "Asia/Thimphu"},
{label: t => "Asia/Tokyo", value: "Asia/Tokyo"},
{label: t => "Asia/Tomsk", value: "Asia/Tomsk"},
{label: t => "Asia/Ulaanbaatar", value: "Asia/Ulaanbaatar"},
{label: t => "Asia/Urumqi", value: "Asia/Urumqi"},
{label: t => "Asia/Ust-Nera", value: "Asia/Ust-Nera"},
{label: t => "Asia/Vientiane", value: "Asia/Vientiane"},
{label: t => "Asia/Vladivostok", value: "Asia/Vladivostok"},
{label: t => "Asia/Yakutsk", value: "Asia/Yakutsk"},
{label: t => "Asia/Yangon", value: "Asia/Yangon"},
{label: t => "Asia/Yekaterinburg", value: "Asia/Yekaterinburg"},
{label: t => "Asia/Yerevan", value: "Asia/Yerevan"},
{label: t => "Atlantic/Azores", value: "Atlantic/Azores"},
{label: t => "Atlantic/Bermuda", value: "Atlantic/Bermuda"},
{label: t => "Atlantic/Canary", value: "Atlantic/Canary"},
{label: t => "Atlantic/Cape_Verde", value: "Atlantic/Cape_Verde"},
{label: t => "Atlantic/Faroe", value: "Atlantic/Faroe"},
{label: t => "Atlantic/Madeira", value: "Atlantic/Madeira"},
{label: t => "Atlantic/Reykjavik", value: "Atlantic/Reykjavik"},
{label: t => "Atlantic/South_Georgia", value: "Atlantic/South_Georgia"},
{label: t => "Atlantic/Stanley", value: "Atlantic/Stanley"},
{label: t => "Atlantic/St_Helena", value: "Atlantic/St_Helena"},
{label: t => "Australia/Adelaide", value: "Australia/Adelaide"},
{label: t => "Australia/Brisbane", value: "Australia/Brisbane"},
{label: t => "Australia/Broken_Hill", value: "Australia/Broken_Hill"},
{label: t => "Australia/Currie", value: "Australia/Currie"},
{label: t => "Australia/Darwin", value: "Australia/Darwin"},
{label: t => "Australia/Eucla", value: "Australia/Eucla"},
{label: t => "Australia/Hobart", value: "Australia/Hobart"},
{label: t => "Australia/Lindeman", value: "Australia/Lindeman"},
{label: t => "Australia/Lord_Howe", value: "Australia/Lord_Howe"},
{label: t => "Australia/Melbourne", value: "Australia/Melbourne"},
{label: t => "Australia/Perth", value: "Australia/Perth"},
{label: t => "Australia/Sydney", value: "Australia/Sydney"},
{label: t => "Europe/Amsterdam", value: "Europe/Amsterdam"},
{label: t => "Europe/Andorra", value: "Europe/Andorra"},
{label: t => "Europe/Astrakhan", value: "Europe/Astrakhan"},
{label: t => "Europe/Athens", value: "Europe/Athens"},
{label: t => "Europe/Belgrade", value: "Europe/Belgrade"},
{label: t => "Europe/Berlin", value: "Europe/Berlin"},
{label: t => "Europe/Bratislava", value: "Europe/Bratislava"},
{label: t => "Europe/Brussels", value: "Europe/Brussels"},
{label: t => "Europe/Bucharest", value: "Europe/Bucharest"},
{label: t => "Europe/Budapest", value: "Europe/Budapest"},
{label: t => "Europe/Busingen", value: "Europe/Busingen"},
{label: t => "Europe/Chisinau", value: "Europe/Chisinau"},
{label: t => "Europe/Copenhagen", value: "Europe/Copenhagen"},
{label: t => "Europe/Dublin", value: "Europe/Dublin"},
{label: t => "Europe/Gibraltar", value: "Europe/Gibraltar"},
{label: t => "Europe/Guernsey", value: "Europe/Guernsey"},
{label: t => "Europe/Helsinki", value: "Europe/Helsinki"},
{label: t => "Europe/Isle_of_Man", value: "Europe/Isle_of_Man"},
{label: t => "Europe/Istanbul", value: "Europe/Istanbul"},
{label: t => "Europe/Jersey", value: "Europe/Jersey"},
{label: t => "Europe/Kaliningrad", value: "Europe/Kaliningrad"},
{label: t => "Europe/Kiev", value: "Europe/Kiev"},
{label: t => "Europe/Kirov", value: "Europe/Kirov"},
{label: t => "Europe/Lisbon", value: "Europe/Lisbon"},
{label: t => "Europe/Ljubljana", value: "Europe/Ljubljana"},
{label: t => "Europe/London", value: "Europe/London"},
{label: t => "Europe/Luxembourg", value: "Europe/Luxembourg"},
{label: t => "Europe/Madrid", value: "Europe/Madrid"},
{label: t => "Europe/Malta", value: "Europe/Malta"},
{label: t => "Europe/Mariehamn", value: "Europe/Mariehamn"},
{label: t => "Europe/Minsk", value: "Europe/Minsk"},
{label: t => "Europe/Monaco", value: "Europe/Monaco"},
{label: t => "Europe/Moscow", value: "Europe/Moscow"},
{label: t => "Europe/Oslo", value: "Europe/Oslo"},
{label: t => "Europe/Paris", value: "Europe/Paris"},
{label: t => "Europe/Podgorica", value: "Europe/Podgorica"},
{label: t => "Europe/Prague", value: "Europe/Prague"},
{label: t => "Europe/Riga", value: "Europe/Riga"},
{label: t => "Europe/Rome", value: "Europe/Rome"},
{label: t => "Europe/Samara", value: "Europe/Samara"},
{label: t => "Europe/San_Marino", value: "Europe/San_Marino"},
{label: t => "Europe/Sarajevo", value: "Europe/Sarajevo"},
{label: t => "Europe/Saratov", value: "Europe/Saratov"},
{label: t => "Europe/Simferopol", value: "Europe/Simferopol"},
{label: t => "Europe/Skopje", value: "Europe/Skopje"},
{label: t => "Europe/Sofia", value: "Europe/Sofia"},
{label: t => "Europe/Stockholm", value: "Europe/Stockholm"},
{label: t => "Europe/Tallinn", value: "Europe/Tallinn"},
{label: t => "Europe/Tirane", value: "Europe/Tirane"},
{label: t => "Europe/Ulyanovsk", value: "Europe/Ulyanovsk"},
{label: t => "Europe/Uzhgorod", value: "Europe/Uzhgorod"},
{label: t => "Europe/Vaduz", value: "Europe/Vaduz"},
{label: t => "Europe/Vatican", value: "Europe/Vatican"},
{label: t => "Europe/Vienna", value: "Europe/Vienna"},
{label: t => "Europe/Vilnius", value: "Europe/Vilnius"},
{label: t => "Europe/Volgograd", value: "Europe/Volgograd"},
{label: t => "Europe/Warsaw", value: "Europe/Warsaw"},
{label: t => "Europe/Zagreb", value: "Europe/Zagreb"},
{label: t => "Europe/Zaporozhye", value: "Europe/Zaporozhye"},
{label: t => "Europe/Zurich", value: "Europe/Zurich"},
{label: t => "Indian/Antananarivo", value: "Indian/Antananarivo"},
{label: t => "Indian/Chagos", value: "Indian/Chagos"},
{label: t => "Indian/Christmas", value: "Indian/Christmas"},
{label: t => "Indian/Cocos", value: "Indian/Cocos"},
{label: t => "Indian/Comoro", value: "Indian/Comoro"},
{label: t => "Indian/Kerguelen", value: "Indian/Kerguelen"},
{label: t => "Indian/Mahe", value: "Indian/Mahe"},
{label: t => "Indian/Maldives", value: "Indian/Maldives"},
{label: t => "Indian/Mauritius", value: "Indian/Mauritius"},
{label: t => "Indian/Mayotte", value: "Indian/Mayotte"},
{label: t => "Indian/Reunion", value: "Indian/Reunion"},
{label: t => "Pacific/Apia", value: "Pacific/Apia"},
{label: t => "Pacific/Auckland", value: "Pacific/Auckland"},
{label: t => "Pacific/Bougainville", value: "Pacific/Bougainville"},
{label: t => "Pacific/Chatham", value: "Pacific/Chatham"},
{label: t => "Pacific/Chuuk", value: "Pacific/Chuuk"},
{label: t => "Pacific/Easter", value: "Pacific/Easter"},
{label: t => "Pacific/Efate", value: "Pacific/Efate"},
{label: t => "Pacific/Enderbury", value: "Pacific/Enderbury"},
{label: t => "Pacific/Fakaofo", value: "Pacific/Fakaofo"},
{label: t => "Pacific/Fiji", value: "Pacific/Fiji"},
{label: t => "Pacific/Funafuti", value: "Pacific/Funafuti"},
{label: t => "Pacific/Galapagos", value: "Pacific/Galapagos"},
{label: t => "Pacific/Gambier", value: "Pacific/Gambier"},
{label: t => "Pacific/Guadalcanal", value: "Pacific/Guadalcanal"},
{label: t => "Pacific/Guam", value: "Pacific/Guam"},
{label: t => "Pacific/Honolulu", value: "Pacific/Honolulu"},
{label: t => "Pacific/Kiritimati", value: "Pacific/Kiritimati"},
{label: t => "Pacific/Kosrae", value: "Pacific/Kosrae"},
{label: t => "Pacific/Kwajalein", value: "Pacific/Kwajalein"},
{label: t => "Pacific/Majuro", value: "Pacific/Majuro"},
{label: t => "Pacific/Marquesas", value: "Pacific/Marquesas"},
{label: t => "Pacific/Midway", value: "Pacific/Midway"},
{label: t => "Pacific/Nauru", value: "Pacific/Nauru"},
{label: t => "Pacific/Niue", value: "Pacific/Niue"},
{label: t => "Pacific/Norfolk", value: "Pacific/Norfolk"},
{label: t => "Pacific/Noumea", value: "Pacific/Noumea"},
{label: t => "Pacific/Pago_Pago", value: "Pacific/Pago_Pago"},
{label: t => "Pacific/Palau", value: "Pacific/Palau"},
{label: t => "Pacific/Pitcairn", value: "Pacific/Pitcairn"},
{label: t => "Pacific/Pohnpei", value: "Pacific/Pohnpei"},
{label: t => "Pacific/Port_Moresby", value: "Pacific/Port_Moresby"},
{label: t => "Pacific/Rarotonga", value: "Pacific/Rarotonga"},
{label: t => "Pacific/Saipan", value: "Pacific/Saipan"},
{label: t => "Pacific/Tahiti", value: "Pacific/Tahiti"},
{label: t => "Pacific/Tarawa", value: "Pacific/Tarawa"},
{label: t => "Pacific/Tongatapu", value: "Pacific/Tongatapu"},
{label: t => "Pacific/Wake", value: "Pacific/Wake"},
{label: t => "Pacific/Wallis", value: "Pacific/Wallis"},
{label: t => "Etc/GMT", value: "Etc/GMT"},
{label: t => "Etc/GMT-0", value: "Etc/GMT-0"},
{label: t => "Etc/GMT-1", value: "Etc/GMT-1"},
{label: t => "Etc/GMT-2", value: "Etc/GMT-2"},
{label: t => "Etc/GMT-3", value: "Etc/GMT-3"},
{label: t => "Etc/GMT-4", value: "Etc/GMT-4"},
{label: t => "Etc/GMT-5", value: "Etc/GMT-5"},
{label: t => "Etc/GMT-6", value: "Etc/GMT-6"},
{label: t => "Etc/GMT-7", value: "Etc/GMT-7"},
{label: t => "Etc/GMT-8", value: "Etc/GMT-8"},
{label: t => "Etc/GMT-9", value: "Etc/GMT-9"},
{label: t => "Etc/GMT-10", value: "Etc/GMT-10"},
{label: t => "Etc/GMT-11", value: "Etc/GMT-11"},
{label: t => "Etc/GMT-12", value: "Etc/GMT-12"},
{label: t => "Etc/GMT-13", value: "Etc/GMT-13"},
{label: t => "Etc/GMT-14", value: "Etc/GMT-14"},
{label: t => "Etc/GMT0", value: "Etc/GMT0"},
{label: t => "Etc/GMT+0", value: "Etc/GMT+0"},
{label: t => "Etc/GMT+1", value: "Etc/GMT+1"},
{label: t => "Etc/GMT+2", value: "Etc/GMT+2"},
{label: t => "Etc/GMT+3", value: "Etc/GMT+3"},
{label: t => "Etc/GMT+4", value: "Etc/GMT+4"},
{label: t => "Etc/GMT+5", value: "Etc/GMT+5"},
{label: t => "Etc/GMT+6", value: "Etc/GMT+6"},
{label: t => "Etc/GMT+7", value: "Etc/GMT+7"},
{label: t => "Etc/GMT+8", value: "Etc/GMT+8"},
{label: t => "Etc/GMT+9", value: "Etc/GMT+9"},
{label: t => "Etc/GMT+10", value: "Etc/GMT+10"},
{label: t => "Etc/GMT+11", value: "Etc/GMT+11"},
{label: t => "Etc/GMT+12", value: "Etc/GMT+12"},
{label: t => "Etc/UCT", value: "Etc/UCT"},
{label: t => "Etc/UTC", value: "Etc/UTC"},
{label: t => "Etc/Greenwich", value: "Etc/Greenwich"},
{label: t => "Etc/Universal", value: "Etc/Universal"},
{label: t => "Etc/Zulu", value: "Etc/Zulu"}
            ],
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
