import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { getDataFolder, getTemplatePaths } from './pathUtils';

/**
 * Filters valid template folders in the current working directory.
 * Excludes specific folders and ensures required files exist.
 * 
 * @param excludedFolders - List of folder names to exclude.
 * @returns Array of valid template folder names.
 */
export async function filterValidTemplates(excludedFolders: string[] = []): Promise<string[]> {
    const dataFolder = getDataFolder();
    const folders = await readdir(dataFolder, { withFileTypes: true });

    return folders
        .filter((entry) => entry.isDirectory() && !excludedFolders.includes(entry.name))
        .map((entry) => entry.name)
        .filter((name) => {
            console.log(`Checking template folder: ${name}`);
            const { templatePath, tokenPath } = getTemplatePaths(name);
            return existsSync(templatePath) && existsSync(tokenPath);
        });
}