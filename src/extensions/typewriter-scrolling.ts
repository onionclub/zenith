import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

const typewriterPluginKey = new PluginKey('typewriterScrolling')

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  while (el) {
    const style = window.getComputedStyle(el)
    const overflowY = style.overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return el
    el = el.parentElement
  }
  return null
}

const TypewriterScrolling = Extension.create({
  name: 'typewriterScrolling',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: typewriterPluginKey,
        view: () => ({
          update: (view) => {
            const editorEl = view.dom.closest('.tiptap')
            if (!editorEl || !editorEl.classList.contains('is-typewriter-mode')) return

            const { selection } = view.state
            const { $head } = selection

            const scrollParent = findScrollParent(view.dom)
            if (!scrollParent) return

            const cursorCoords = view.coordsAtPos($head.pos)
            if (!cursorCoords) return

            const viewportHeight = scrollParent.clientHeight
            const scrollTop = scrollParent.scrollTop
            const centerY = scrollTop + viewportHeight / 2
            const cursorY = cursorCoords.top - scrollParent.getBoundingClientRect().top + scrollTop

            const threshold = viewportHeight * 0.15

            if (cursorY > centerY + threshold || cursorY < centerY - threshold) {
              const targetScroll = cursorY - viewportHeight / 2
              scrollParent.scrollTo({
                top: Math.max(0, targetScroll),
                behavior: 'smooth',
              })
            }
          },
        }),
      }),
    ]
  },
})

export default TypewriterScrolling
