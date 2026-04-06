import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { DOMParser } from "@xmldom/xmldom";

const siteDir = "_site";
let hasErrors = false;
let fileCount = 0;

function collectXmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectXmlFiles(full));
    } else if (extname(entry).toLowerCase() === ".xml") {
      files.push(full);
    }
  }
  return files;
}

const xmlFiles = collectXmlFiles(siteDir);

if (xmlFiles.length === 0) {
  console.error("❌ No XML files found in", siteDir);
  process.exit(1);
}

for (const file of xmlFiles) {
  const xml = readFileSync(file, "utf-8");
  const errors = [];
  const parser = new DOMParser({
    onError: (level, msg) => {
      if (level === "error" || level === "fatalError") {
        errors.push(msg);
      }
    },
  });

  try {
    parser.parseFromString(xml, "text/xml");
  } catch (e) {
    errors.push(e.message);
  }

  if (errors.length) {
    console.error(`❌ ${file}:\n  ${errors.join("\n  ")}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${file}`);
  }
  fileCount++;
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log(`\n✅ All ${fileCount} XML files are well-formed`);
}
