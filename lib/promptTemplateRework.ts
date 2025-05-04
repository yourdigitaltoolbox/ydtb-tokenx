import { select } from '@inquirer/prompts';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { tokenReplacementLoop } from './tokenReplacementLoop';


export async function promptTemplateRework(preselected?: string) {
    const folders = (await readdir(process.cwd(), { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => {
            const templatePath = join(process.cwd(), name, `${name}.template.json`);
            const tokenPath = join(process.cwd(), name, `${name}.tokens.json`);
            return existsSync(templatePath) && existsSync(tokenPath);
        });

    if (folders.length === 0) {
        console.error("❌ No valid templates found in this directory.");
        process.exit(1);
    }

    let baseName = preselected;
    if (baseName && !folders.includes(baseName)) {
        console.warn(`⚠️ Template '${baseName}' not found or missing required files. Falling back to template selection.`);
        baseName = undefined;
    }

    if (!baseName) {
        baseName = await select({
            message: 'Select a template to rework:',
            choices: folders.map((name) => ({ name, value: name })),
        });
    }

    const templatePath = join(process.cwd(), baseName, `${baseName}.template.json`);
    const tokenPath = join(process.cwd(), baseName, `${baseName}.tokens.json`);

    await tokenReplacementLoop(templatePath, tokenPath);
}
