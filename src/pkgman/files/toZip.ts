import * as JSZip from 'jszip';
import { toPairs } from 'lodash';
import { FilesFromFolder } from './files';

export function toZip(files: FilesFromFolder) {
  const zip = new JSZip();
  for (const [relPath, content] of toPairs(files)) {
    zip.file(relPath, content);
  }
  return zip.generateAsync({ type: 'nodebuffer' });
}
