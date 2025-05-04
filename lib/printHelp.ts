export function printHelp() {
    const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
    const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
    const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;

    console.log(`\n${cyan('Usage')}: tokenize [options]\n\n${yellow('Options')}:
  ${green('--rework')}            Open tokenization UI for an existing template
  ${green('--generate')}          Render template(s) with token values and copy to clipboard or print
  ${green('--template=name')}     Specify a template folder name to rework or generate from
  ${green('--no-copy')}           Skip copying to clipboard, print JSON output instead
  ${green('--remove')}            Remove a template (prompt for selection)
  ${green('--remove=name')}       Remove a specific template by name
  ${green('-h, --help')}          Show this help message\n`);
}