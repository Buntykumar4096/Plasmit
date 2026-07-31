import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.resolve("src");
const supportedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss"]);
const maximumLines = 1000;

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? collectSourceFiles(entryPath) : [entryPath];
    }),
  );
  return nestedFiles.flat();
}

const sourceFiles = (await collectSourceFiles(sourceRoot)).filter((file) =>
  supportedExtensions.has(path.extname(file)) &&
  !file.includes(`${path.sep}data${path.sep}`) &&
  !file.endsWith(`-data${path.extname(file)}`) &&
  !file.includes(`${path.sep}types${path.sep}`),
);
const oversizedFiles = [];

for (const file of sourceFiles) {
  const contents = await readFile(file, "utf8");
  const lines = contents.split(/\r?\n/).length;
  if (lines > maximumLines) {
    oversizedFiles.push({ file: path.relative(process.cwd(), file), lines });
  }
}

if (oversizedFiles.length > 0) {
  oversizedFiles
    .sort((left, right) => right.lines - left.lines)
    .forEach(({ file, lines }) => console.error(`${file}: ${lines} lines`));
  console.error(`\n${oversizedFiles.length} files exceed ${maximumLines} lines.`);
  process.exitCode = 1;
} else {
  console.log(`All ${sourceFiles.length} source files are within ${maximumLines} lines.`);
}
