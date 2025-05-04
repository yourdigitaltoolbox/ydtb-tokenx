import { promptTemplateRework } from './lib/promptTemplateRework';
import { generateFromTemplate } from './lib/generateTemplate';
import { createNewTemplateFromClipboard } from './lib/createNewTemplate';

function printHelp() {
    const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
    const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
    const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;

    console.log(`\n${cyan('Usage')}: tokenize [options]\n\n${yellow('Options')}:
  ${green('--rework')}            Open tokenization UI for an existing template
  ${green('--generate')}          Render template(s) with token values and copy to clipboard or print
  ${green('--template=name')}     Specify a template folder name to rework or generate from
  ${green('--no-copy')}           Skip copying to clipboard, print JSON output instead
  ${green('-h, --help')}          Show this help message\n`);
}

async function main() {
    const args = process.argv.slice(2);
    const isHelp = args.includes('--help') || args.includes('-h');
    const isReworkMode = args.includes('--rework');
    const isGenerateMode = args.includes('--generate');
    const specificTemplate = args.find(arg => arg.startsWith('--template='))?.split('=')[1];

    if (isHelp || (args.length > 0 && !isReworkMode && !isGenerateMode && !specificTemplate)) {
        printHelp();
        return;
    }

    if (isGenerateMode) {
        const skipClipboard = args.includes('--no-copy');
        await generateFromTemplate(specificTemplate, skipClipboard);
        return;
    }

    if (isReworkMode || specificTemplate) {
        await promptTemplateRework(specificTemplate);
        return;
    }

    await createNewTemplateFromClipboard();
}

main();
