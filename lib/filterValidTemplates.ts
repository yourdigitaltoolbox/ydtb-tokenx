import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Filters valid template folders in the current working directory.
 * Excludes specific folders and ensures required files exist.
 * 
 * @param excludedFolders - List of folder names to exclude.
 * @returns Array of valid template folder names.
 */
export async function filterValidTemplates(excludedFolders: string[] = ['node_modules', 'lib', '.git']): Promise<string[]> {
    const folders = await readdir(process.cwd(), { withFileTypes: true });

    return folders
        .filter((entry) => entry.isDirectory() && !excludedFolders.includes(entry.name))
        .map((entry) => entry.name)
        .filter((name) => {
            const templatePath = join(process.cwd(), name, `${name}.template.json`);
            const tokenPath = join(process.cwd(), name, `${name}.tokens.json`);
            return existsSync(templatePath) && existsSync(tokenPath);
        });
}