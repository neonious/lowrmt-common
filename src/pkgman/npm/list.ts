import * as execa from 'execa';
import { chain } from 'lodash';
import { DefinedError } from '../err';

export async function npmList(installDir: string) {
  let execOut;
  try {
    execOut = await execa('npm', ['ls', '--depth=0', '-json'], {
      cwd: installDir
    });
  } catch (e) {
    throw new DefinedError('npm', e);
  }
  const outObj = JSON.parse(execOut.stdout);
  const pkgsByVersions = chain(outObj.dependencies)
    .mapValues((v, k) => v.version as string)
    .value();
  return pkgsByVersions;
}
