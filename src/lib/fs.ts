import {
  BaseDirectory,
  readDir,
  readTextFile,
  writeTextFile,
  remove,
  exists,
  mkdir,
} from '@tauri-apps/plugin-fs'
import type { Document } from '../store/useStore'

const DOCS_DIR = 'documents'

async function ensureDocsDir(): Promise<void> {
  const dirExists = await exists(DOCS_DIR, { baseDir: BaseDirectory.AppData })
  if (!dirExists) {
    await mkdir(DOCS_DIR, { baseDir: BaseDirectory.AppData, recursive: true })
  }
}

function extractTitle(json: Record<string, unknown>): string {
  const content = json.content as Array<Record<string, unknown>> | undefined
  if (!content) return 'Untitled'
  const firstHeading = content.find(
    (node) => node.type === 'heading' && (node.attrs as Record<string, unknown>)?.level === 1,
  )
  if (firstHeading) {
    const headingContent = firstHeading.content as Array<Record<string, unknown>> | undefined
    if (headingContent && headingContent.length > 0) {
      const text = headingContent
        .filter((n) => n.type === 'text')
        .map((n) => (n.text as string) || '')
        .join('')
      if (text.trim()) return text.trim()
    }
  }
  return 'Untitled'
}

function resolveTitle(json: Record<string, unknown>): string {
  return (json.title as string) || extractTitle(json)
}

export async function loadDocuments(): Promise<Document[]> {
  await ensureDocsDir()

  const entries = await readDir(DOCS_DIR, { baseDir: BaseDirectory.AppData })
  const docs: Document[] = []

  for (const entry of entries) {
    if (!entry.name.endsWith('.json')) continue

    try {
      const raw = await readTextFile(`${DOCS_DIR}/${entry.name}`, {
        baseDir: BaseDirectory.AppData,
      })
      const json = JSON.parse(raw)
      const title = resolveTitle(json)

      docs.push({
        id: entry.name.replace('.json', ''),
        title,
        path: `${DOCS_DIR}/${entry.name}`,
        updatedAt: Date.now(),
        group: (json as any).group || '',
        tags: (json as any).tags || [],
      })
    } catch {
      // Skip malformed files
    }
  }

  docs.sort((a, b) => b.updatedAt - a.updatedAt)
  return docs
}

export async function deleteDocument(path: string): Promise<void> {
  await remove(path, { baseDir: BaseDirectory.AppData })
}

export async function saveDocument(path: string, json: Record<string, unknown>): Promise<void> {
  await ensureDocsDir()
  await writeTextFile(path, JSON.stringify(json, null, 2), {
    baseDir: BaseDirectory.AppData,
  })
}

export function generateUniqueTitle(wanted: string, existing: string[]): string {
  if (!existing.includes(wanted)) return wanted
  let n = 2
  let candidate = `${wanted} (${n})`
  while (existing.includes(candidate)) {
    n++
    candidate = `${wanted} (${n})`
  }
  return candidate
}

export async function renameDocument(path: string, newTitle: string): Promise<string> {
  const raw = await readTextFile(path, { baseDir: BaseDirectory.AppData })
  const json = JSON.parse(raw)
  json.title = newTitle
  await saveDocument(path, json)
  return newTitle
}

export async function renameGroup(oldName: string, newName: string): Promise<void> {
  const entries = await readDir(DOCS_DIR, { baseDir: BaseDirectory.AppData })
  for (const entry of entries) {
    if (!entry.name.endsWith('.json')) continue
    try {
      const path = `${DOCS_DIR}/${entry.name}`
      const raw = await readTextFile(path, { baseDir: BaseDirectory.AppData })
      const json = JSON.parse(raw)
      if (json.group === oldName) {
        json.group = newName
        await saveDocument(path, json)
      }
    } catch { /* skip malformed files */ }
  }
}

export async function createDocument(): Promise<Document> {
  await ensureDocsDir()

  const timestamp = Date.now()
  const fileName = `untitled-${timestamp}`
  const filePath = `${DOCS_DIR}/${fileName}.json`

  const content = {
    title: 'Untitled',
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Untitled' }],
      },
      { type: 'paragraph' },
    ],
  }

  await saveDocument(filePath, content)

  return {
    id: fileName,
    title: 'Untitled',
    path: filePath,
    updatedAt: timestamp,
    group: '',
    tags: [],
  }
}
