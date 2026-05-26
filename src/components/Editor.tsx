import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CharacterCount from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import SlashCommand from '../extensions/slash-command'
import ImagePaste from '../extensions/image-paste'
import FocusMode from '../extensions/focus-mode'
import TypewriterScrolling from '../extensions/typewriter-scrolling'
import BubbleMenuToolbar from './BubbleMenuToolbar'
import StatusBar from './StatusBar'
import { readTextFile } from '@tauri-apps/plugin-fs'
import { BaseDirectory } from '@tauri-apps/plugin-fs'
import useStore from '../store/useStore'
import { saveDocument } from '../lib/fs'

function Editor() {
  const activeDocPath = useStore((s) => s.activeDocPath)
  const isFocusMode = useStore((s) => s.isFocusMode)
  const isTypewriterMode = useStore((s) => s.isTypewriterMode)
  const setSaveStatus = useStore((s) => s.setSaveStatus)
  const setEditorInstance = useStore((s) => s.setEditorInstance)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLoadingRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Typography,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({
        allowBase64: false,
        inline: false,
      }),
      CharacterCount,
      SlashCommand,
      ImagePaste,
      FocusMode,
      TypewriterScrolling,
    ],
    editorProps: {
      attributes: {
        class: [
          'tiptap',
          isFocusMode && 'is-focus-mode',
          isTypewriterMode && 'is-typewriter-mode',
        ]
          .filter(Boolean)
          .join(' '),
      },
    },
    immediatelyRender: false,
  })

  // Load document content when activeDocPath changes
  useEffect(() => {
    if (!editor || !activeDocPath) return

    const loadContent = async () => {
      isLoadingRef.current = true
      try {
        const raw = await readTextFile(activeDocPath, {
          baseDir: BaseDirectory.AppData,
        })
        const json = JSON.parse(raw)
        editor.commands.setContent(json)
      } catch {
        // File may not exist yet
      } finally {
        isLoadingRef.current = false
      }
    }
    loadContent()
  }, [editor, activeDocPath])

  // Auto-save on editor update with 800ms debounce
  const handleUpdate = useCallback(() => {
    if (isLoadingRef.current) return

    setSaveStatus('saving')

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(async () => {
      if (!editor || !activeDocPath) return

      try {
        const json = editor.getJSON()
        await saveDocument(activeDocPath, json)
        setSaveStatus('saved')
      } catch {
        setSaveStatus('idle')
      }
    }, 800)
  }, [editor, activeDocPath, setSaveStatus])

  useEffect(() => {
    if (!editor) return
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, handleUpdate])

  // Store editor instance for global access (export, save shortcuts)
  useEffect(() => {
    setEditorInstance(editor)
    return () => setEditorInstance(null)
  }, [editor, setEditorInstance])

  // Update editor element classes when modes toggle
  useEffect(() => {
    if (!editor) return
    const el = editor.view.dom
    el.classList.toggle('is-focus-mode', isFocusMode)
    el.classList.toggle('is-typewriter-mode', isTypewriterMode)
  }, [editor, isFocusMode, isTypewriterMode])

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  return (
    <>
      {editor && <BubbleMenuToolbar editor={editor} />}
      <EditorContent editor={editor} />
      <StatusBar editor={editor} />
    </>
  )
}

export default Editor
