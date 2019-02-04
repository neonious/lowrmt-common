import { readFile } from 'fs-extra';
import { toPairs } from 'lodash';
import { join } from 'path';
import { PackageLock, PackageLockDeps } from './readPackageLock';

interface DependencyTree {
  [relPath: string]: {
    name: string;
    version: string;
  };
}

function getDependencyTreeInternal(
  result: DependencyTree,
  obj?: PackageLockDeps,
  rel?: string
) {
  for (const [name, { version, dependencies }] of toPairs(obj || {})) {
    const fp = rel ? join(rel, 'node_modules', name) : name;
    result[fp] = {
      name,
      version
    };
    if (dependencies) {
      getDependencyTreeInternal(result, dependencies, fp);
    }
  }
  return result;
}

export async function getDependencyTree(
  packageLock: PackageLock
): Promise<DependencyTree> {
  return getDependencyTreeInternal({}, packageLock.dependencies);
}
