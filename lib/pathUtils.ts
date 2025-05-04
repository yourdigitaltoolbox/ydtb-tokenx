import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Resolves the path to the `data` folder and ensures it exists.
 * @returns The absolute path to the `data` folder.
 */
export function getDataFolder(): string {
    const dataFolder = join(process.cwd(), 'data');
    if (!existsSync(dataFolder)) {
        mkdirSync(dataFolder, { recursive: true });
    }
    return dataFolder;
}

/**
 * Resolves the paths for a specific template's files and ensures the folder exists.
 * @param baseName - The name of the template.
 * @returns An object containing paths for the template, tokens, and raw files.
 */
export function getTemplatePaths(baseName: string): {
    rawPath: string;
    templatePath: string;
    tokenPath: string;
} {
    const dataFolder = getDataFolder();
    const templateFolder = join(dataFolder, baseName);

    // Ensure the template folder exists
    if (!existsSync(templateFolder)) {
        mkdirSync(templateFolder, { recursive: true });
    }

    return {
        rawPath: join(templateFolder, `${baseName}-original.json`),
        templatePath: join(templateFolder, `${baseName}.template.json`),
        tokenPath: join(templateFolder, `${baseName}.tokens.json`),
    };
}