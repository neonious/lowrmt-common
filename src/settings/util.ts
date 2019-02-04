import { definitions, SettingDef, SettingPageKey, SettingsKey } from '../settings/definitions';
import { forOwn, keys, cloneDeep } from 'lodash';
import { Translations } from '../translations/base/translations';

const pageByKey: { [K in SettingsKey]: SettingPageKey } = Object.create(null);
const keysByPage: { [K in SettingPageKey]: SettingsKey[] } = Object.create(null);
const defByKey: { [K in SettingsKey]: SettingDef } = Object.create(null);
const settingKeys: SettingsKey[] = [];
const dKeysToKey: Dict<SettingsKey> = {};
const keysToDKeys: Dict<string> = {};

forOwn(definitions, (subDefinitions, pageKey: SettingPageKey) => {
    forOwn(subDefinitions, (definition: SettingDef, key: SettingsKey) => {
        pageByKey[key] = pageKey;
        keysByPage[pageKey] = keysByPage[pageKey] || [];
        keysByPage[pageKey].push(key);
        defByKey[key] = definition;
        settingKeys.push(key);

        const keyParts = key.split('__');
        const dotKey = `${keyParts[0]}.${keyParts[1]}`;
        dKeysToKey[dotKey] = key;
        keysToDKeys[key] = dotKey;
    });
});
const pageKeys = keys(keysByPage) as SettingPageKey[];

type BySettingsKey = Record<SettingsKey, any>;

export function toSettingsStructure(flat: BySettingsKey, page?: SettingPageKey) {

    const result = Object.create(null);
    forOwn(flat, (value, key: SettingsKey) => {
        if ((!page || getPage(key) === page)) {
            const index = key.indexOf('__');
            const topKey = key.substr(0, index);
            const subKey = key.substr(index + 2);
            result[topKey] = result[topKey] || Object.create(null);
            result[topKey][subKey] = value;
        }
    });
    return result;
}

export function toFlatStructure<TValue>(obj: any): Record<SettingsKey, TValue> {
    const flat: BySettingsKey = Object.create(null);
    forOwn(obj, (subObj, topKey) => {
        forOwn(subObj, (value, subKey) => {

            let key = `${topKey}__${subKey}` as SettingsKey;
            if (!hasKey(key)) {
                console.error(`Unknown key ${topKey}.${subKey} for value ${value}, ommiting key/value pair`); 
                return;
            }
            flat[key] = value;
        });
    });
    return flat;
}

export function getPages() {
    return pageKeys;
}

export function getKeys(page: SettingPageKey) {
    return keysByPage[page];
}

export function getType(key: SettingsKey) {
    return defByKey[key].$type;
}

export function hasKey(key: SettingsKey) {
    return key in defByKey;
}

export function getDef(key: SettingsKey) {
    return defByKey[key];
}

export const getPage = (key: SettingsKey) => {
    return pageByKey[key]
};

export function getDefinition(key: SettingsKey) {
    return defByKey[key];
}

export function getSettingDefinitions() {
    return Object.freeze(defByKey);
}

export function getAllKeys() {
    return settingKeys;
}

export function getDotKeyMapping() {
    return dKeysToKey;
}

export function validateAll(key: SettingsKey, value: any, translations: Translations): string | true {
    const def = getDef(key);
    const { validate, allowNull } = def;
    if (validate) {
        const message = validate(value, translations);
        if (message)
            return message;
    }
    if (value===null && !allowNull){
        return 'Value must not be null';
    }
    if (value!==null){
        const wrongDataTypeMsg = (dt: string) => `Wrong data type. Must be a ${dt}.`;
        switch (def.$type) {
            case 'boolean':
                if (typeof value !== 'boolean') {
                    return wrongDataTypeMsg('boolean');
                }
                break;
            case 'string':
            case 'ip':
            case 'password':
            case 'fileinput':
                if (typeof value !== 'string') {
                    return wrongDataTypeMsg('string');
                }
                break;
            case 'number':
                if (typeof value !== 'number') {
                    return wrongDataTypeMsg('number');
                }
                break;
        }
    }
    if ('regex' in def) {
        if (def.regex && value && !def.regex.test(value)) {
            return 'Wrong format.';
        }
    }
    return true;
}

export function fillFlatStructureWithDefaults(flatSettings: Dict<any>) {
    const defsByKey = getSettingDefinitions()
    forOwn(defsByKey, (def, key: SettingsKey) => {
        if (!(key in flatSettings)) {
            let defValue: any;
            if ('default' in def) {
                defValue = cloneDeep(def.default);
            } else {
                switch (def.$type) {
                    case 'boolean':
                        defValue = false;
                        break;
                    case 'string':
                    case 'ip':
                    case 'password':
                    case 'fileinput':
                        defValue = '';
                        break;
                    case 'number':
                        defValue = undefined;
                        break;
                    default:
                        console.warn('No default value defined for type', def.$type)
                }
            }
            flatSettings[key] = defValue;
        }
    });
}

export function getDotKeyFromKey(key: string): string {
    return keysToDKeys[key];
}