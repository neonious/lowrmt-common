import * as execa from 'execa';
import { mkdirp, readFile } from 'fs-extra';
import { mapKeys, toPairs } from 'lodash';
import { join, resolve } from 'path';
import { getOrCreateOptimizedDependency } from '../dependency/optimized/get';
import { PackageLock } from '../dependency/readPackageLock';
import { getDependencyTree } from '../dependency/tree';
import { FilesFromFolder } from '../files/files';
import * as assert from 'assert';
import { DefinedError } from '../err';

export interface NpmInstallOptions {
  packages: Set<string>;
  path: string;
}

/**
 * Will internally use the npm cache, so no need to worry about http requests from npm that are not needed.
 */
export async function getOptimizedModules({
  packages,
  path
}: NpmInstallOptions) {
  await mkdirp(path);

  await execa('npm', ['init', '-y'], { cwd: path });
  try {
    await execa('npm', ['install', ...packages], { cwd: path });
  } catch (e) {
    throw new DefinedError('npm', e);
  }

  const pkgLock = JSON.parse(
    (await readFile(join(path, 'package-lock.json'))).toString()
  ) as PackageLock;
  const deps = await getDependencyTree(pkgLock);
  const result: FilesFromFolder = {};
  for (const [relPath, { name, version }] of toPairs(deps)) {
    const optimizedDep = await getOrCreateOptimizedDependency(
      name,
      version,
      resolve(path, 'node_modules', relPath)
    );
    Object.assign(result, mapKeys(optimizedDep, (v, k) => join(relPath, k)));
  }
  return result;
}
