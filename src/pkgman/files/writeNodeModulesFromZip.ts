import { writeFile, mkdirp } from "fs-extra";
import * as JSZip from "jszip";
import { join, dirname } from "path";
import { toPairs } from 'lodash';
const rimraf = require("rimraf");

export async function writeNodeModulesFromZip({
  zipFile,
  path
}: {
  zipFile: Buffer;
  path: string;
}) {
  const zip = await JSZip.loadAsync(zipFile);
  await new Promise((resolve, reject) =>
    rimraf(path, (err: unknown) => (err ? reject(err) : resolve()))
  );
  for (const [name,obj] of toPairs(zip.files)) {
    if (!obj.dir){
      const buff = await zip.file(name).async("nodebuffer");
      const fullpath = join(path, name);
      await mkdirp(dirname(fullpath));
      await writeFile(fullpath, buff);
    }
  }
}
