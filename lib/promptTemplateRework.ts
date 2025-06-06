import { select } from '@inquirer/prompts';
import { tokenReplacementLoop } from './tokenReplacementLoop';
import { filterValidTemplates } from './filterValidTemplates';
import { getTemplatePaths } from './pathUtils';

export async function promptTemplateRework(preselected?: string) {
    const folders = await filterValidTemplates();

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

    const { templatePath, tokenPath } = getTemplatePaths(baseName);

    await tokenReplacementLoop(baseName);
}
