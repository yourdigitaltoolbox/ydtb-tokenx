import { input, select } from '@inquirer/prompts';
import clipboard from 'clipboardy';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { filterValidTemplates } from './filterValidTemplates';

export async function generateFromTemplate(preselected?: string, skipClipboard: boolean = false) {
    const folders = await filterValidTemplates();

    if (folders.length === 0) {
        console.error("❌ No valid templates found in this directory.");
        process.exit(1);
    }

    let baseName = preselected;
    if (!baseName || !folders.includes(baseName)) {
        baseName = await select({
            message: 'Select a template to generate from:',
            choices: folders.map((name) => ({ name, value: name })),
        });
    }

    const templatePath = join(process.cwd(), baseName, `${baseName}.template.json`);
    const tokenPath = join(process.cwd(), baseName, `${baseName}.tokens.json`);

    if (!existsSync(templatePath) || !existsSync(tokenPath)) {
        console.error(`❌ Required files not found for template '${baseName}'.`);
        process.exit(1);
    }

    const originalTemplate = JSON.parse(await readFile(templatePath, 'utf-8')); // Keep a copy of the original template
    const tokenFile = JSON.parse(await readFile(tokenPath, 'utf-8'));

    const replaceTokens = (data: any, map: Record<string, string>): any => {
        const stringifiedData = JSON.stringify(data);
        const replacedData = Object.keys(map).reduce((result, token) => {
            const tokenPlaceholder = `${token}`;
            return result.replace(new RegExp(tokenPlaceholder, 'g'), map[token]);
        }, stringifiedData);
        return JSON.parse(replacedData);
    };

    if (Array.isArray(tokenFile)) {
        let isFirst = true; // Flag to track the first iteration
        for (const set of tokenFile) {
            const rendered = replaceTokens(originalTemplate, set); // Use the original template for each iteration

            console.log(set);

            if (!skipClipboard) {
                const stringified = JSON.stringify(rendered); // Stringify without newlines or formatting
                clipboard.writeSync(stringified);

                if (isFirst) {
                    console.log('✅ The first template has been added to your clipboard.');
                    isFirst = false; // Set the flag to false after the first iteration
                } else {
                    console.log('📋 Copied next variation to clipboard.');
                }
            } else {
                console.log(JSON.stringify(rendered, null, 2)); // Pretty print to console
            }

            // Prompt the user only after handling the clipboard or console output
            if (!isFirst) {
                await input({ message: 'Press enter to copy the next version to your clipboard.' });
            }
        }
    } else {
        const rendered = replaceTokens(originalTemplate, tokenFile); // Use the original template
        if (!skipClipboard) {
            const stringified = JSON.stringify(rendered); // Stringify without newlines or formatting
            clipboard.writeSync(stringified);
            console.log('✅ Template successfully copied to clipboard:');
        } else {
            console.log('✅ Template successfully generated:');
            console.log(JSON.stringify(rendered, null, 2)); // Pretty print to console
        }
    }
}
