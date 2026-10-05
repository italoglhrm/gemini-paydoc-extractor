import { useCallback, useEffect, useReducer, useRef } from 'react'
import { ApiError, extractDocument } from '@/lib/api'
import { validateFile, type FileProblem } from '@/lib/files'
import type { TranslateParams, TranslationKey } from '@/lib/i18n'
import type { ExtractResponse } from '@/types'

// The extraction flow, held in memory only:
//
//   idle --choose file--> ready --Extract--> extracting --ok--> success
//     ^                    |  ^                 |  \--fail--> error --Retry--> extracting
//     \---New document-----+--+--Cancel---------/
//
// Choosing another file from any state aborts a request in flight and goes back to `ready`.

export type Status = 'idle' | 'ready' | 'extracting' | 'success' | 'error'

/**
 * Where keyboard focus should move after a transition whose focused control disappears: choosing a
 * file replaces the drop zone, Remove and New document replace the preview, Cancel replaces itself.
 * `tick` changes on every request, so the same target can be requested twice in a row.
 */
interface FocusRequest {
  target: 'extract' | 'zone'
  tick: number
}

/** What to announce to assistive technology: a dictionary key and its parameters. */
interface Announcement {
  key: TranslationKey
  params?: TranslateParams
}

interface State {
  status: Status
  file: File | null
  /** Why the last chosen file was rejected, if it was. */
  problem: FileProblem | null
  result: ExtractResponse | null
  /** Changes with every successful result, so the result panel remounts and starts on its first tab. */
  runId: number
  error: ApiError | null
  announce: Announcement | null
  focus: FocusRequest | null
}

type Action =
  | { type: 'select'; file: File }
  | { type: 'reject'; problem: FileProblem }
  | { type: 'reset' }
  | { type: 'start' }
  | { type: 'success'; result: ExtractResponse }
  | { type: 'fail'; error: ApiError }
  | { type: 'cancel' }

const initial: State = {
  status: 'idle',
  file: null,
  problem: null,
  result: null,
  runId: 0,
  error: null,
  announce: null,
  focus: null,
}

const requestFocus = (state: State, target: FocusRequest['target']): FocusRequest => ({
  target,
  tick: (state.focus?.tick ?? 0) + 1,
})

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'select':
      return {
        ...initial,
        runId: state.runId,
        status: 'ready',
        file: action.file,
        announce: { key: 'statusReady', params: { name: action.file.name } },
        focus: requestFocus(state, 'extract'),
      }
    case 'reject':
      return { ...state, problem: action.problem, announce: null }
    case 'reset':
      return { ...initial, runId: state.runId, focus: requestFocus(state, 'zone') }
    case 'start':
      return { ...state, status: 'extracting', result: null, error: null, announce: { key: 'statusExtracting' } }
    case 'success': {
      const n = action.result.low_confidence_fields.length
      const announce: Announcement =
        n === 0 ? { key: 'statusDone' } : { key: n === 1 ? 'statusDoneReviewOne' : 'statusDoneReviewMany', params: { n } }
      return { ...state, status: 'success', result: action.result, runId: state.runId + 1, announce }
    }
    case 'fail':
      return { ...state, status: 'error', error: action.error, announce: { key: 'statusFailed' } }
    case 'cancel':
      return { ...state, status: 'ready', announce: { key: 'statusCancelled' }, focus: requestFocus(state, 'extract') }
  }
}

export function useExtraction() {
  const [state, dispatch] = useReducer(reducer, initial)
  const abortRef = useRef<AbortController | null>(null)

  const abortInFlight = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  // Nothing should outlive the page: a request in flight is cancelled on unmount.
  useEffect(() => abortInFlight, [abortInFlight])

  const selectFile = useCallback(
    (file: File) => {
      const problem = validateFile(file)
      if (problem) {
        dispatch({ type: 'reject', problem })
        return
      }
      abortInFlight()
      dispatch({ type: 'select', file })
    },
    [abortInFlight],
  )

  const removeFile = useCallback(() => {
    abortInFlight()
    dispatch({ type: 'reset' })
  }, [abortInFlight])

  const cancel = useCallback(() => {
    abortInFlight()
    dispatch({ type: 'cancel' })
  }, [abortInFlight])

  const { file } = state
  const extract = useCallback(async () => {
    if (!file) return
    abortInFlight()
    const controller = new AbortController()
    abortRef.current = controller
    dispatch({ type: 'start' })
    try {
      const result = await extractDocument(file, controller.signal)
      if (!controller.signal.aborted) dispatch({ type: 'success', result })
    } catch (error) {
      // A cancelled or superseded request must never overwrite what the user is looking at now.
      if (controller.signal.aborted) return
      if (error instanceof ApiError && error.kind === 'aborted') return
      dispatch({ type: 'fail', error: error instanceof ApiError ? error : new ApiError('unexpected') })
    }
  }, [file, abortInFlight])

  return { ...state, selectFile, removeFile, extract, cancel }
}
