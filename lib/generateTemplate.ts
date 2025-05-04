import { input, select } from '@inquirer/prompts';
import clipboard from 'clipboardy';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { filterValidTemplates } from './filterValidTemplates';
import { getTemplatePaths } from './pathUtils';

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

    const { templatePath, tokenPath } = getTemplatePaths(baseName);

    if (!existsSync(templatePath) || !existsSync(tokenPath)) {
        console.error(`❌ Required files not found for template '${baseName}'.`);
        process.exit(1);
    }

    const originalTemplate = JSON.parse(await readFile(templatePath, 'utf-8'));
    const tokenFile = JSON.parse(await readFile(tokenPath, 'utf-8'));

    // Validate the parsed JSON
    if (typeof originalTemplate !== 'object' || originalTemplate === null) {
        console.error("❌ Invalid original template:", originalTemplate);
        process.exit(1);
    }

    if (typeof tokenFile !== 'object' || tokenFile === null) {
        console.error("❌ Invalid token file:", tokenFile);
        process.exit(1);
    }

    const escapeRegExp = (string: string): string => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters for RegExp
    };

    const escapeJSONString = (string: string): string => {
        return string.replace(/\\/g, '\\\\') // Escape backslashes
            .replace(/"/g, '\\"')  // Escape double quotes
            .replace(/\n/g, '\\n') // Escape newlines
            .replace(/\r/g, '\\r') // Escape carriage returns
            .replace(/\t/g, '\\t'); // Escape tabs
    };

    const replaceTokens = (data: any, map: Record<string, string>): any => {
        try {
            // Validate token map values
            Object.values(map).forEach((value) => {
                if (typeof value !== 'string') {
                    console.error("❌ Invalid token value:", value);
                    throw new Error("Token values must be strings.");
                }
            });

            const stringifiedData = JSON.stringify(data);
            const replacedData = Object.keys(map).reduce((result, token) => {
                const tokenPlaceholder = escapeRegExp(token); // Escape token for RegExp
                const escapedReplacement = escapeJSONString(map[token]); // Escape replacement string
                return result.replace(new RegExp(tokenPlaceholder, 'g'), escapedReplacement);
            }, stringifiedData);

            return JSON.parse(replacedData);
        } catch (error) {
            console.error("❌ Error during token replacement:", error);
            console.error("Data being processed:", data);
            console.error("Token map:", map);
            throw error;
        }
    };

    if (Array.isArray(tokenFile)) {
        let isFirst = true;
        for (const set of tokenFile) {
            const rendered = replaceTokens(originalTemplate, set);

            if (!skipClipboard) {
                const stringified = JSON.stringify(rendered);
                clipboard.writeSync(stringified);

                if (isFirst) {
                    console.log('✅ The first template has been added to your clipboard.');
                    isFirst = false;
                } else {
                    console.log('📋 Copied next variation to clipboard.');
                }
            } else {
                console.log(JSON.stringify(rendered, null, 2));
            }

            if (!isFirst) {
                await input({ message: 'Press enter to copy the next version to your clipboard.' });
            }
        }
    } else {
        const rendered = replaceTokens(originalTemplate, tokenFile);
        if (!skipClipboard) {
            const stringified = JSON.stringify(rendered);
            clipboard.writeSync(stringified);
            console.log('✅ Template successfully copied to clipboard:');
        } else {
            console.log('✅ Template successfully generated:');
            console.log(JSON.stringify(rendered, null, 2));
        }
    }
}
