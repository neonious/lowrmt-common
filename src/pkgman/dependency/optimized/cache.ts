import { pathExists } from "fs-extra";
import { join } from "path";
import { readFilesRecursive } from "../../files/read";
import { writeFiles } from "../../files/write";
import { DependencyContent } from "./content";
import * as os from "os";

const MODULE_CACHE = join(os.homedir(), ".neonious", "pkgman", "cache");

export function getCacheDir(name: string, version: string) {
  return join(MODULE_CACHE, name, version);
}

export async function tryGetOptimizedDependencyFromCache(
  name: string,
  version: string
): Promise<DependencyContent | void> {
  if (await pathExists(getCacheDir(name, version))) {
    return await readFilesRecursive(getCacheDir(name, version));
  }
}

export async function setOptimizedDependency(
  name: string,
  version: string,
  content: DependencyContent
) {
  await writeFiles(getCacheDir(name, version), content);
}
