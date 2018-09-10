import * as fs from 'fs-extra';
import * as findUp from 'find-up';
import { join } from 'path';

export async function loadJsonFile<T>(file: string, def?: T): Promise<T> {
    if (!await fs.pathExists(file)) {
        if (def)
            return def;
        throw new Error('Json file not found');
    }
    const content = (await fs.readFile(file)).toString();
    return JSON.parse(content);
}

export async function saveJsonFile(file: string, obj: any) {
    const json = JSON.stringify(obj, null, 4);
    await fs.writeFile(file, json, { encoding: 'utf8' });
}

export async function loadJsonFindFile<T>(names: string[], def?: T) {
    const configPath = await findUp(names);
    if (!configPath) {
        if (def)
            return def;
        throw new Error('Json file not found');
    }
    return await loadJsonFile<T>(configPath, def);
}

export async function saveJsonFindFile(names: string[], obj: any) {
    const configPath = await findUp(names) || join(process.cwd(), names[0]);
    await saveJsonFile(configPath, obj)
}