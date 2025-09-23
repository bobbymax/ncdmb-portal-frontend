import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for ResponseData files
const baseDir = path.join(__dirname, "src/app/Repositories");

// Find all `data.ts` files dynamically
const resourceFiles = [];
fs.readdirSync(baseDir).forEach((repo) => {
  const dataPath = path.join(baseDir, repo, "data.ts");
  if (fs.existsSync(dataPath)) {
    resourceFiles.push({ key: repo, path: `../app/Repositories/${repo}/data` });
  }
});

// Generate TypeScript file content
const fileContent = `
export const resourceFiles = ${JSON.stringify(resourceFiles, null, 2)};
`;

// Write the output to `resourceFiles.ts`
fs.writeFileSync(
  path.join(__dirname, "src/resources/resourceIdentifier.ts"),
  fileContent,
  "utf8"
);

// Successfully generated resourceFiles.ts with dynamic imports
