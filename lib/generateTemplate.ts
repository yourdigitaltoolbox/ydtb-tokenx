import { input, select } from '@inquirer/prompts';
import clipboard from 'clipboardy';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function generateFromTemplate(preselected?: string, skipClipboard: boolean = false) {
    const folders = (await readdir(process.cwd(), { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

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

    const template = JSON.parse(await readFile(templatePath, 'utf-8'));
    const tokenFile = JSON.parse(await readFile(tokenPath, 'utf-8'));

    const replaceTokens = (data: any, map: Record<string, string>): any => {
        if (Array.isArray(data)) return data.map(item => replaceTokens(item, map));
        if (typeof data === 'object' && data !== null) {
            const result: any = {};
            for (const key in data) {
                result[key] = replaceTokens(data[key], map);
            }
            return result;
        }
        if (typeof data === 'string' && tokenFile[data]) {
            return tokenFile[data];
        }
        return data;
    };

    if (Array.isArray(tokenFile)) {
        for (const set of tokenFile) {
            await input({ message: 'Press enter to copy the next version to your clipboard.' });
            const rendered = replaceTokens(template, set);
            if (!skipClipboard) {
                clipboard.writeSync(JSON.stringify(rendered, null, 2));
                console.log('📋 Copied next variation to clipboard.');
            } else {
                console.log(JSON.stringify(rendered, null, 2));
            }
        }
    } else {
        const rendered = replaceTokens(template, tokenFile);
        if (!skipClipboard) {
            clipboard.writeSync(JSON.stringify(rendered, null, 2));
            console.log('📋 Copied template with tokens replaced to clipboard.');
        } else {
            console.log(JSON.stringify(rendered, null, 2));
        }
    }
}
