import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

const focusModePluginKey = new PluginKey('focusMode')

const FocusMode = Extension.create({
  name: 'focusMode',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: focusModePluginKey,
        view: () => ({
          update: (view) => {
            try {
              if (!view || !view.state) return
              const { selection } = view.state
            const { $head } = selection
            const prosemirror = view.dom

            // Find the top-level block node at the cursor
            const depth = $head.depth > 0 ? 1 : 0
            if (depth === 0) return
            const blockStartPos = $head.start(depth)
            const blockEl = view.nodeDOM(blockStartPos) as HTMLElement | null

            // Remove .has-focus from all direct children
            prosemirror.querySelectorAll('.has-focus').forEach((el) => {
              el.classList.remove('has-focus')
            })

            // Add .has-focus to the block containing the cursor
            if (blockEl) {
              blockEl.classList.add('has-focus')
            }
            } catch (e) {
              // Plugin should never crash the editor
            }
          },
        }),
      }),
    ]
  },
})

export default FocusMode
