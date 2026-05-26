import TurndownService from 'turndown'
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'

export async function exportToMarkdown(html: string): Promise<void> {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  })

  const markdown = td.turndown(html)

  const filePath = await save({
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  })

  if (!filePath) return

  await writeTextFile(filePath, markdown)
}

export function exportToPDF(): void {
  window.print()
}
