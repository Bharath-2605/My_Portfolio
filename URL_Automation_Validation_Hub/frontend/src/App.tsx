import { AnimatePresence, MotionConfig } from 'framer-motion'
import { CompletedScreen } from './components/CompletedScreen'
import { ErrorState } from './components/ErrorState'
import { FileReadyScreen } from './components/FileReadyScreen'
import { Header } from './components/Header'
import { ProcessingScreen } from './components/ProcessingScreen'
import { Stage } from './components/Stage'
import { UploadScreen } from './components/UploadScreen'
import { useAutomationFlow } from './hooks/useAutomationFlow'
import { useTheme } from './hooks/useTheme'
import { EMPTY_STATS } from './types'

function App() {
  const flow = useAutomationFlow()
  const { theme, toggleTheme } = useTheme()
  const processing = flow.phase === 'processing'
  const canRetry =
    flow.errorKind !== 'invalid_format' && flow.errorKind !== 'file_too_large' && Boolean(flow.selected)

  return (
    <MotionConfig reducedMotion="user">
      <div className={processing ? 'app is-processing' : 'app'}>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Header phase={flow.phase} theme={theme} onToggleTheme={toggleTheme} />
        <main id="main" className="app-main" aria-busy={processing}>
          <AnimatePresence mode="wait">
            {flow.phase === 'idle' ? (
              <Stage key="idle">
                <UploadScreen onFile={flow.selectFile} />
              </Stage>
            ) : flow.phase === 'fileSelected' && flow.selected ? (
              <Stage key="ready">
                <FileReadyScreen
                  file={flow.selected}
                  busy={flow.busy}
                  onChangeFile={flow.reset}
                  onProcess={() => void flow.start()}
                />
              </Stage>
            ) : processing ? (
              <Stage key="processing">
                <ProcessingScreen
                  message={flow.snapshot?.message ?? 'Processing your file...'}
                  progress={flow.snapshot?.progress ?? 0}
                  stats={flow.snapshot?.stats ?? EMPTY_STATS}
                  urls={flow.snapshot?.recentUrls ?? []}
                />
              </Stage>
            ) : flow.phase === 'completed' && flow.snapshot?.results ? (
              <Stage key="done">
                <CompletedScreen
                  results={flow.snapshot.results}
                  downloading={flow.downloading}
                  downloadStarted={flow.downloadStarted}
                  onDownload={() => void flow.download()}
                  onReset={flow.reset}
                />
              </Stage>
            ) : flow.phase === 'error' ? (
              <Stage key="error">
                <ErrorState
                  message={flow.errorMessage}
                  canRetry={canRetry}
                  onRetry={() => void flow.start()}
                  onChooseAnother={flow.reset}
                />
              </Stage>
            ) : null}
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}

export default App
