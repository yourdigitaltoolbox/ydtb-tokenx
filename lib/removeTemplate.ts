import { select, confirm } from '@inquirer/prompts';
import { rm } from 'fs/promises';
import { join } from 'path';
import { filterValidTemplates } from './filterValidTemplates';
import { getTemplatePaths, getDataFolder } from './pathUtils';

export async function removeTemplate(preselected?: string) {
    const folders = await filterValidTemplates();

    if (folders.length === 0) {
        console.error("❌ No valid templates found in this directory.");
        process.exit(1);
    }

    let baseName = preselected;
    if (!baseName || !folders.includes(baseName)) {
        baseName = await select({
            message: 'Select a template to remove:',
            choices: folders.map((name) => ({ name, value: name })),
        });
    }

    const dir = join(getDataFolder(), baseName);
    const confirmDelete = await confirm({ message: `Are you sure you want to delete the template '${baseName}'? This action cannot be undone.` });

    if (confirmDelete) {
        await rm(dir, { recursive: true, force: true });
        console.log(`✅ Template '${baseName}' has been removed.`);
    } else {
        console.log("❌ Deletion canceled.");
    }
}