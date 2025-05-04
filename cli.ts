#!/usr/bin/env bun

import { promptTemplateRework } from './lib/promptTemplateRework';
import { generateFromTemplate } from './lib/generateTemplate';
import { createNewTemplateFromClipboard } from './lib/createNewTemplate';
import { printHelp } from './lib/printHelp';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { removeTemplate } from './lib/removeTemplate';

export async function main() {
    // Ensure the script runs from its own directory
    const scriptDir = dirname(fileURLToPath(import.meta.url));
    process.chdir(scriptDir);

    const args = process.argv.slice(2);
    const isHelp = args.includes('--help') || args.includes('-h');
    const isReworkMode = args.includes('--rework');
    const isGenerateMode = args.includes('--generate');
    const isRemoveMode = args.includes('--remove');
    const specificTemplate = args.find(arg => arg.startsWith('--template='))?.split('=')[1];
    const templateToRemove = args.find(arg => arg.startsWith('--remove='))?.split('=')[1];

    if (isHelp || (args.length > 0 && !isReworkMode && !isGenerateMode && !isRemoveMode && !specificTemplate)) {
        printHelp();
        return;
    }

    if (isGenerateMode) {
        const skipClipboard = args.includes('--no-copy');
        await generateFromTemplate(specificTemplate, skipClipboard);
        return;
    }

    if (isRemoveMode) {
        await removeTemplate(templateToRemove);
        return;
    }

    if (isReworkMode || specificTemplate) {
        await promptTemplateRework(specificTemplate);
        return;
    }

    await createNewTemplateFromClipboard();
}

main();
