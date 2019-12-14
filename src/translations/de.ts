import { Translations } from "@common/translations/base/translations";

export class GermanTranslations implements Translations {

    g = {
        browse: 'Dateiauswahl...',
        sysstate_err: 'Nicht verbunden',
        notify_settings_saved: 'Einstellungen gespeichert',
        save_settings_button: 'Speichern',
        err_tooshort: 'Die Eingabe ist zu kurz',
        err_notmin8chars: 'Falls Passwort gesetzt wird, muss es mindestens 8 Buchstaben lang sein',
        err_toolong: 'Die Eingabe ist zu lang',
        err_mustbeset: 'Diese Feld ist pflicht',
        err_notvalid: 'Die Eingabe ist ungültig',
        err_notinsamenetwork: 'Die IP Adresse ist nicht im selben Netzwerk',
        placeholder_enter_to_change: 'Eingeben, um zu ändern'
    };
    programming = {
    };
    settings = {
    };
    app = {
        broken_text1: 'Dsa Gerät funktioniert nicht richtig. Bitte lade die Seite neu.',
        broken_text2: 'Wir würden gerne von dir hören, so dass wir diese Probleme in zukünftigen Versionen beheben können. Vielen Dank für den Kontakt mit uns!',
        nojs_text1: 'Die Software des Gerätes basiert zum großen Teil auf JavaScript und kann daher nur mit einem Browser mit aktiviertem JavaScript benutzt werden. In allen aktuellen Browsern wird JavaScript als sichere und stabile Technologie unterstützt, die dynamische Inhalte auf viele Webseiten darstellen.',
        nojs_text2: 'Bitte ändere deine Browser Einstellungen und lade die Seite neu.',
        timeout_text1: 'Die Verbindung zu deinem Gerät funktioniert nicht richtig.',
        timeout_text2: 'Bitte überprüfe ob das Gerät noch läuft, das Kabel (falls verwendet) eingesteckt ist und dein Router noch funktioniert. In der Zwischenzeit probieren wir es periodisch neu.'
    };
    logoutDialog = {
        cancel: 'Zurück',
        logout_button: 'Ausloggen',
        really_logout: 'Wirklich ausloggen?'
    };
    login =
        {
            welcome: 'Willkommen zu low.js',
            sessionExpired: 'Deine Sitzung ist abgelaufen!',
            enterPwToContinue: 'Bitte gebe dein Passwort ein',
            ifLostPwReset: 'Falls das Passwort verloren wurde, muss das Gerät zurückgesetzt werden.',
            wrongPw: 'Passwort ist falsch',
            login: 'Einloggen'
        };
    systemsettings = {
        ntpserver: 'NTP Server'
    };
    codesettings = {
        console_kb: 'Konsolenspeicher (kB)',
        autostart: 'Autostart'
    };
    usersettings = {
        password: 'Passwort',
        pw_do_not_match: 'Keine Übereinstimmung',
        placeholder_repeat_password: 'Wiederholen'
    };
    networksettings = {
        title_wifi: 'W-LAN',
        title_ethernet: 'Ethernet',
        wifissid: 'SSID',
        wifipassword: 'Passwort',
        static_ip: 'IP-Adresse',
        static_net: 'Subnetzmaske',
        static_gw: 'Gateway',
        static_dns: 'DNS',
        dhcp: 'DHCP (von/bis)',
        availablenetworks: 'Verfügbare Netzwerke',
        dhcp_mode: 'DHCP',
        dhcp_mode_client: 'IP von server beziehen',
        dhcp_mode_server: 'Als server nutzen',
        dhcp_mode_static: 'Manuell IP vergeben',
        ap_on_off: 'Modus',
        ap_mode_station: 'Mit AP verbinden',
        ap_mode_ap: 'Access Point',
        loading_wifis: 'Scanne...'
    };
    websettings = {
        http: 'HTTP Port',
        https: 'HTTPS Port',
        cert_path: 'Zertifikatpfad',
        cert_key_path: 'Schlüsselpfad',
        cert_ca_path: 'CA Zertifikat Pfad',
    };
    neon_comsettings = {
        enable: 'Aktiviert',
        name: 'Name',
        type: 'Typ',
        type_local: 'Lokal',
        type_internet: 'Internet'
    };
    navigation = {
        language_menu: 'Sprache',
        en: 'English',
        de: 'Deutsch',
        logout_button: 'Ausloggen'
    };
    maincontent = {
        programming_tab: 'Programmierung',
        settings_tab: 'Einstellungen'
    };
    code = {
        save_button: 'Speichern',
        code_saved_notify: 'Code gespeichert',
        start_debug: 'Start',
        stop_debug: 'Stopp'
    }
}

export var translations = new GermanTranslations();
