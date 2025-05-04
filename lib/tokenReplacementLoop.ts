import { input, confirm } from '@inquirer/prompts';
import { writeFile, readFile } from 'fs/promises';
import { getTemplatePaths } from './pathUtils';

export async function tokenReplacementLoop(baseName: string) {
    const { templatePath, tokenPath } = getTemplatePaths(baseName);

    let template = JSON.parse(await readFile(templatePath, 'utf-8'));
    let tokens: Record<string, string> = JSON.parse(await readFile(tokenPath, 'utf-8'));
    let tokenCount = Object.keys(tokens).length;

    while (true) {
        const searchString = await input({ message: 'Enter a string to search for (or press ENTER to finish):' });
        if (!searchString) break;

        let replaced = false;
        const processFields = async (obj: any): Promise<any> => {
            if (Array.isArray(obj)) {
                const results = [];
                for (const item of obj) {
                    results.push(await processFields(item));
                }
                return results;
            } else if (obj !== null && typeof obj === 'object') {
                const newObj: any = {};
                for (const key of Object.keys(obj)) {
                    if (typeof obj[key] === 'string' && obj[key].toLowerCase().includes(searchString.toLowerCase())) {
                        const shouldReplace = await confirm({ message: `We found in key '${key}': ${obj[key]}\nIs this the one you want to tokenize?` });
                        if (shouldReplace) {
                            const token = `%text${++tokenCount}%`;
                            tokens[token] = obj[key];
                            newObj[key] = token;
                            replaced = true;
                        } else {
                            newObj[key] = obj[key];
                        }
                    } else {
                        newObj[key] = await processFields(obj[key]);
                    }
                }
                return newObj;
            }
            return obj;
        };

        template = await processFields(template);

        if (replaced) {
            await writeFile(templatePath, JSON.stringify(template, null, 2));
            await writeFile(tokenPath, JSON.stringify(tokens, null, 2));
            console.log(`🔁 Token(s) added for matches to "${searchString}".`);
        } else {
            console.log(`⚠️ No matches confirmed for "${searchString}".`);
        }
    }

    console.log("✅ Tokenization complete.");
}