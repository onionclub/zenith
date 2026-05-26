import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import SlashCommandMenu from '../components/SlashCommandMenu'

const commands = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'heading-1',
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'heading-2',
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'heading-3',
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple list',
    icon: 'bullet-list',
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Task List',
    description: 'Track tasks with checkboxes',
    icon: 'task-list',
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: 'Code Block',
    description: 'Write code snippets',
    icon: 'code-block',
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: 'Blockquote',
    description: 'Quote or highlight text',
    icon: 'blockquote',
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: 'Table',
    description: 'Add a 3x3 table',
    icon: 'table',
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
  },
  {
    title: 'Image',
    description: 'Insert an image from disk',
    icon: 'image',
    command: async ({ editor, range }: { editor: any; range: any }) => {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const { readFile } = await import('@tauri-apps/plugin-fs')
      const { invoke } = await import('@tauri-apps/api/core')
      const { convertFileSrc } = await import('@tauri-apps/api/core')

      const selected = await open({
        multiple: false,
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }],
      })

      if (!selected) return

      const filePath = selected as string
      const data = await readFile(filePath)
      const fileName = `img_${Date.now()}.png`
      const absolutePath = await invoke<string>('save_image', { fileName, data: Array.from(data) })

      const assetUrl = convertFileSrc(absolutePath)
      editor.chain().focus().deleteRange(range).setImage({ src: assetUrl }).run()
    },
  },
]

const renderSlashCommand = () => {
  let component: ReactRenderer | null = null
  let popup: TippyInstance[] | null = null

  const destroy = () => {
    if (popup) {
      popup.forEach((p) => p.destroy())
      popup = null
    }
    if (component) {
      component.destroy()
      component = null
    }
  }

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(SlashCommandMenu, {
        editor: props.editor,
        props: {
          items: props.items,
          command: props.command,
          editor: props.editor,
        },
      })

      if (!props.clientRect) {
        return
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        arrow: false,
        theme: 'light-border',
        offset: [0, 8],
      })
    },

    onUpdate: (props: any) => {
      if (component) {
        component.updateProps({
          items: props.items,
          command: props.command,
          editor: props.editor,
        })
      }

      if (popup) {
        popup.forEach((p) => {
          if (props.clientRect) {
            p.setProps({
              getReferenceClientRect: props.clientRect,
            })
          }
        })
      }
    },

    onKeyDown: (props: any) => {
      if (props.event.key === 'Escape') {
        destroy()
        return true
      }
      return false
    },

    onExit: () => {
      destroy()
    },
  }
}

const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
        items: ({ query }: { query: string }) => {
          const filtered = commands.filter((item) =>
            item.title.toLowerCase().startsWith(query.toLowerCase()),
          )
          return filtered.length > 0 ? filtered : commands
        },
        render: renderSlashCommand,
      } as SuggestionOptions),
    ]
  },
})

export default SlashCommand
