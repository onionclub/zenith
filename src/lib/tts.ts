type TTSCallback = (index: number) => void

let isActive = false
let stopIndex = 0  // remembers sentence position when user stops

export function isReading(): boolean {
  return isActive
}

export function getStopIndex(): number {
  return stopIndex
}

export function getAvailableVoices(): { name: string; lang: string; local: boolean }[] {
  const voices = speechSynthesis.getVoices()
  console.log(`TTS: ${voices.length} voices available:`, voices.map(v => `${v.name} (${v.lang}, local=${v.localService})`))
  return voices.map(v => ({
    name: v.name,
    lang: v.lang,
    local: v.localService,
  }))
}

function getBestVoice(preferredName?: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  if (voices.length === 0) return null

  // If user has a preferred voice, try to use it
  if (preferredName && preferredName !== 'auto') {
    const match = voices.find(v => v.name === preferredName)
    if (match) return match
  }

  const enVoices = voices.filter(v => v.lang.startsWith('en'))

  // Priority 1: locally installed natural voices (work offline)
  let pick = enVoices.find(v =>
    v.localService &&
    (v.name.includes('Natural') || v.name.includes('Neural'))
  )
  // Priority 2: online natural voices (Edge cloud, need internet)
  if (!pick) {
    pick = enVoices.find(v =>
      !v.localService &&
      (v.name.includes('Online') || v.name.includes('Natural') || v.name.includes('Neural'))
    )
  }
  // Priority 3: any local Microsoft English voice
  if (!pick) {
    pick = enVoices.find(v => v.localService && v.name.includes('Microsoft'))
  }
  // Priority 4: any local English voice
  if (!pick) {
    pick = enVoices.find(v => v.localService)
  }
  // Priority 5: any voice at all
  if (!pick) {
    pick = enVoices[0]
  }

  return pick || null
}

function splitSentences(text: string): string[] {
  return text.match(/[^.!?\n]+[.!?\n]*/g)?.map(s => s.trim()).filter(s => s.length > 0) || [text]
}

export function startReadingFrom(
  text: string,
  startIdx: number,
  onSentence: TTSCallback,
  onEnd: () => void,
  preferredVoice?: string,
): void {
  stopReading()

  const sentences = splitSentences(text)
  if (sentences.length === 0 || startIdx >= sentences.length) return

  const voice = getBestVoice(preferredVoice)
  if (!voice && speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => {
      startReadingFrom(text, startIdx, onSentence, onEnd, preferredVoice)
    }, { once: true })
    return
  }

  isActive = true
  let idx = startIdx

  const speakNext = () => {
    if (!isActive || idx >= sentences.length) {
      isActive = false
      onEnd()
      return
    }

    stopIndex = idx
    onSentence(idx)

    const utterance = new SpeechSynthesisUtterance(sentences[idx])
    utterance.rate = 0.95
    utterance.pitch = 1.0
    if (voice) utterance.voice = voice

    utterance.onend = () => {
      idx++
      speakNext()
    }

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') {
        isActive = false
        onEnd()
        return
      }
      console.warn('TTS error:', e.error)
      idx++
      speakNext()
    }

    speechSynthesis.speak(utterance)
  }

  speakNext()
}

export function stopReading(): void {
  isActive = false
  // stopIndex retains its last value so caller can highlight the sentence
  speechSynthesis.cancel()
}

// Preload voices — call on app init
export function preloadVoices(): void {
  speechSynthesis.getVoices()
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => {}, { once: true })
  }
}
