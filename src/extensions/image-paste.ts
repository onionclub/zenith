import { Extension } from '@tiptap/core'
import { invoke } from '@tauri-apps/api/core'
import { convertFileSrc } from '@tauri-apps/api/core'

const ImagePaste = Extension.create({
  name: 'imagePaste',

  addProseMirrorPlugins() {
    return [
      new (this.editor.constructor as any).pm.state.Plugin({
        props: {
          handlePaste: (view: any, event: ClipboardEvent) => {
            const items = Array.from(event.clipboardData?.items || [])
            const imageItem = items.find((item) => item.type.startsWith('image/'))

            if (!imageItem) return false

            event.preventDefault()

            const blob = imageItem.getAsFile()
            if (!blob) return true

            const fileName = `img_${Date.now()}.png`

            blob
              .arrayBuffer()
              .then((arrayBuffer) => {
                const data = Array.from(new Uint8Array(arrayBuffer))
                return invoke<string>('save_image', { fileName, data })
              })
              .then((absolutePath) => {
                const assetUrl = convertFileSrc(absolutePath)
                const { state, dispatch } = view
                const { tr } = state
                const node = state.schema.nodes.image?.create({ src: assetUrl })
                if (node) {
                  dispatch(tr.replaceSelectionWith(node).scrollIntoView())
                }
              })
              .catch((err) => {
                console.error('Image paste failed:', err)
              })

            return true
          },
        },
      }),
    ]
  },
})

export default ImagePaste
