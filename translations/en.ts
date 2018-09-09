import { Translations } from "./base/translations";

export class EnglishTranslations implements Translations {

    g = {
        browse: 'Browse...',
        sysstate_err: 'Not connected',
        notify_settings_saved: 'Settings saved',
        save_settings_button: 'Save',
        err_tooshort: 'The input is too short',
        err_notmin8chars: 'If set, must be at least 8 characters',
        err_toolong: 'The input is too long',
        err_mustbeset: 'The field is required',
        err_notvalid: 'The input is invalid',
        err_notinsamenetwork: 'The IP is not in the same network',
        placeholder_enter_to_change: 'Enter to change'
    };
    programming = {
    };
    settings = {
    };
    app = {
        broken_text1: 'The neonious one is not working properly. Please reload.',
        broken_text2: 'We really would like your feedback, so we can fix these problems in future releases. Thank you for reaching out to us!',
        nojs_text1: 'The neonious one software relies heavily on JavaScript and thus can only be used when JavaScript is enabled in your browser. In all current browsers JavaScript is implemented as a secure and stable technology with which dynamic content is being served on many websites.',
        nojs_text2: 'Please change your browser settings and reload this website.',
        timeout_text1: 'The connection to your neonious one is not working properly.',
        timeout_text2: 'Please check whether your neonious one is still running, the cable (if applicable) is still plugged in and your router is still running. In the meantime, we will retry periodically.'
    };
    logoutDialog = {
        cancel: 'Back',
        logout_button: 'Logout',
        really_logout: 'Really logout?'
    };
    login =
        {
            welcome: 'Welcome to neonious one',
            sessionExpired: 'Your session has expired!',
            enterPwToContinue: 'Please enter your password',
            ifLostPwReset: 'If you lost your password, the neonious one has to be reset.',
            wrongPw: 'Incorrect password',
            login: 'Login'
        };
    systemsettings = {
        ntpserver: 'NTP Server'
    };
    codesettings = {
        console_kb: 'Console storage (kB)',
        autostart: 'Auto start'
    };
    usersettings = {
        password: 'Password',
        pw_do_not_match: 'No match',
        placeholder_repeat_password: 'Repeat'
    };
    networksettings = {
        title_wifi: 'WiFi',
        title_ethernet: 'Ethernet',
        wifissid: 'SSID',
        wifipassword: 'Password',
        static_ip: 'IP address',
        static_net: 'Subnet mask',
        static_gw: 'Gateway',
        static_dns: 'DNS',
        dhcp: 'DHCP (from/to)',
        availablenetworks: 'Available networks',
        dhcp_mode: 'DHCP',
        dhcp_mode_client: 'Request IP from server',
        dhcp_mode_server: 'Act as server',
        dhcp_mode_static: 'Use manually set IP',
        ap_on_off: 'Mode',
        ap_mode_station: 'Connect to AP',
        ap_mode_ap: 'Access Point',
        loading_wifis: 'Scanning...'
    };
    websettings = {
        http: 'HTTP port',
        https: 'HTTPS port',
        cert_path: 'Certificate path',
        cert_key_path: 'Key path',
        cert_ca_path: 'CA certificate path',
    };
    neon_comsettings = {
        enable: 'Enabled',
        name: 'Name',
        type: 'Type',
        type_local: 'Local',
        type_internet: 'Internet'
    };
    navigation = {
        language_menu: 'Language',
        en: 'English',
        de: 'Deutsch',
        logout_button: 'Logout'
    };
    maincontent = {
        programming_tab: 'Programming',
        settings_tab: 'Settings'
    };
    code = {
        save_button: 'Save',
        code_saved_notify: 'Code saved',
        start_debug: 'Start',
        stop_debug: 'Stop'
    }
}

export var englishTranslations = new EnglishTranslations();