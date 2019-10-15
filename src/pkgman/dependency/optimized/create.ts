import { readFile } from "fs-extra";
import { basename, resolve } from "path";
import { DependencyContent } from "./content";
import { getFilesRecursive } from "../../../common/file/readDirRecursive";
import { DefinedError } from "../../err";

const ignoreExt = "md ts tsx map".split(" ").map(s => `.${s}`);
const ignoreNames = "licence license changes".split(" ");
const ignoreStartsWith = ". licence- license-".split(" ");

function includeInOptimizedDependency(relPath: string): boolean {
  const name = basename(relPath).toLowerCase();
  if (ignoreExt.some(s => name.endsWith(s))) return false;
  if (ignoreNames.some(s => s === name)) return false;
  if (ignoreStartsWith.some(s => name.startsWith(s))) return false;
  return true;
}

const EXCLUDE_SIZE = 200 * 1024;

export async function createOptimizedDependency(
  root: string,
  parentRel?: string
): Promise<DependencyContent> {
  const files = await getFilesRecursive(root, (relPath, stats) => {
    if (stats.isFile()) {
      if (!includeInOptimizedDependency(relPath)) return true;
      if (stats.size > EXCLUDE_SIZE) return true;
    } else {
      if (basename(relPath) === "node_modules") return true;
    }
    return false;
  });
  const result: DependencyContent = {};
  for (const relPath of files) {
    const lower = relPath.toLowerCase();
    if (
      (lower.endsWith(".js") || lower.endsWith(".mjs")) &&
      !lower.endsWith(".min.js")
    ) {
      const buffer = await readFile(resolve(root, relPath));
      const source = buffer.toString();
      const babel = require("@babel/core");
      let transpiled;
      try {
        transpiled = babel.transform(source, {
          presets: [
            require("@babel/preset-env")
            // [
            //   ,
            //   {
            //     targets: {
            //       ie: "10"
            //     }
            //   }
            // ]
          ],
          parserOpts: {
            allowReturnOutsideFunction: true
          }
        }).code as string;
      } catch (e) {
        throw new DefinedError("transpile", e);
      }
      let minified;
      try {
        const UglifyJS = require("uglify-es");
        minified = UglifyJS.minify(transpiled, {semicolon: true}).code as string;
      } catch (e) {
        minified = transpiled;
      }
      if (!minified) minified = transpiled;

      result[relPath] = Buffer.from(minified, "utf8");
    } else {
      result[relPath] = await readFile(resolve(root, relPath));
    }
  }

  return result;
}
