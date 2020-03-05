import { keyBy } from 'lodash';
import { Translations } from '../translations/base/translations';

interface ValidationData {
    translation(translation: Translations): string;
}

export const validationDefs = {
    TOO_SHORT: {
        translation: t => t.g.err_tooshort,
    } as ValidationData,
    NOT_MIN_8CHARS: {
        translation: t => t.g.err_notmin8chars,
    } as ValidationData,
    TOO_LONG: {
        translation: t => t.g.err_toolong,
    } as ValidationData,
    MUST_BE_SET: {
        translation: t => t.g.err_mustbeset,
    } as ValidationData,
    INVALID: {
        translation: t => t.g.err_notvalid,
    } as ValidationData,
    NOT_SAME_NETWORK: {
        translation: t => t.g.err_notinsamenetwork,
    } as ValidationData,
    NOT_IP: {
        translation: t => 'The IP address is not valid'
    } as ValidationData, // later trans
    REQUIRES_NEONIOUS_ONE: {
        translation: t => 'Set PHY parameters and reboot before enabling Ethernet'
    } as ValidationData,
    NOT_POSITIVE_INT: {
        translation: t => 'You must enter a positive integer'
    } as ValidationData,
    IP_REQUIRED: {
        translation: t => 'An IP must be entered'
    } as ValidationData,
    BEFORE_MIN: {
        translation: t => 'The IP must not be less than the min. IP'
    } as ValidationData,
    AFTER_MAX: {
        translation: t => 'The IP must not be greater than the max. IP'
    } as ValidationData,
    IN_RANGE_IP: {
        translation: t => 'The IP address must not be in range of the min/max range'
    } as ValidationData,
    PART_NOT_IP: {
        translation: t => 'An invalid IP address was specified, separate addresses by spaces and/or commas'
    } as ValidationData,
    INVALID_1_65535: {
        translation: t => 'The port must be a valid port between 1 and 65535'
    } as ValidationData,
    SAME_AS_HTTP: {
        translation: t => 'The port must differ from the HTTP port'
    } as ValidationData,
    INVALID_PATH: {
        translation: t => 'The input is not a valid path'
    } as ValidationData,
    FILE_NOT_FOUND: {
        translation: t => 'The file does not exist. Please upload the file with the file explorer of the IDE'
    } as ValidationData,
    INVALID_FORMAT: {
        translation: t => 'The input has an invalid format'
    } as ValidationData,
    NO_HTTP_HTTPS: {
        translation: t => 'HTTP and HTTPS must be enabled'
    } as ValidationData,
    ONE_REQUIRED: {
        translation: t => 'HTTP or HTTPS must be enabled'
    } as ValidationData,
    EXPECTED_BOOLEAN: {
        translation: t => 'Must be true or false'
    } as ValidationData,
    NOT_ABSOLUTE_PATH: {
        translation: t => 'Is not an absolute path beginning with \'/\''
    } as ValidationData,
    UNKNOWN_MODE: {
        translation: t => 'Mode must be sd4line, sd1line or spi'
    } as ValidationData,
    NOT_A_NUMBER: {
        translation: t => 'Must be an integer'
    } as ValidationData,
    NOT_A_POSITIVE_NUMBER: {
        translation: t => 'Must be a positive integer'
    } as ValidationData,
    NOT_A_ESP32_PIN: {
        translation: t => 'Pin is not an ESP32 pin'
    } as ValidationData
}

export function isValidationKey(key: string): key is ValidationKey {
    return key in validationDefs;
}

export function getTranslation(key: ValidationKey, t: Translations) {
    if (!validationDefs[key])
    {
        console.warn('MISSING VALIDATION KEY TRANSLATION', key);
        return key;
    }
    return validationDefs[key].translation(t);
}

export type ValidationKey = keyof typeof validationDefs;

export const validationsByKey = Object.freeze(keyBy(Object.keys(validationDefs)) as {[K in ValidationKey]: K });

export const validationKeys = Object.keys(validationDefs) as ValidationKey[];
