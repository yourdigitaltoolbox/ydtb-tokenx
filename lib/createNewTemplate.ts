import { input, confirm } from '@inquirer/prompts';
import clipboard from 'clipboardy';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

import { tokenReplacementLoop } from './tokenReplacementLoop';
import { promptTemplateRework } from './promptTemplateRework';


export async function createNewTemplateFromClipboard() {
    // Step 1: Grab clipboard contents
    const clipboardText = clipboard.readSync();

    let parsedJSON: any;
    try {
        parsedJSON = JSON.parse(clipboardText);
    } catch (err) {
        console.warn("⚠️ Clipboard does not contain valid JSON.");

        const shouldContinue = await confirm({ message: 'Do you want to rework an existing template?' });
        if (!shouldContinue) {
            console.log("👋 Exiting...");
            process.exit(0);
        }

        await promptTemplateRework();
        return;
    }

    // Step 1.1: Validate JSON structure
    if (parsedJSON.type !== "elementor") {
        console.warn("⚠️ JSON does not have 'type' set to 'elementor'. Exiting...");
        process.exit(1);
    }

    // Step 1.2: Clean htmlCache
    cleanHtmlCache(parsedJSON);

    // Step 2: Prompt for name
    const baseName = await input({ message: 'Enter a name for this widget/template:' });
    if (!baseName.trim()) {
        console.error("❌ Name is required.");
        process.exit(1);
    }

    // Step 3: Create folder and write files
    const dir = join(process.cwd(), baseName);
    if (!existsSync(dir)) {
        await mkdir(dir);
    }

    const rawPath = join(dir, `${baseName}-original.json`);
    const templatePath = join(dir, `${baseName}.template.json`);
    const tokenPath = join(dir, `${baseName}.tokens.json`);

    await writeFile(rawPath, JSON.stringify(parsedJSON, null, 2));
    await writeFile(templatePath, JSON.stringify(parsedJSON, null, 2));
    await writeFile(tokenPath, JSON.stringify({}, null, 2));

    console.log(`✅ Files created in ./${baseName}/`);
    console.log(`📝 Now ready to tokenize your template.`);

    await tokenReplacementLoop(templatePath, tokenPath);
}

export function cleanHtmlCache(obj: any): void {
    if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
            if (key === "htmlCache") {
                obj[key] = null; // Set htmlCache to null
            } else if (typeof obj[key] === "object") {
                cleanHtmlCache(obj[key]); // Recursively clean nested objects
            }
        }
    }
}