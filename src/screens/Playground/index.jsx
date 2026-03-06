import React, { useContext, useState } from 'react'
import EditorContainer from './EditorContainer'
import InputConsole from './InputConsole'
import OutputConsole from './OutputConsole'
import Navbar from './Navbar'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { languageMap, PlaygroundContext } from '../../context/PlaygroundContext'
import { ModalContext } from '../../context/ModalContext'
import Modal from '../../components/Modal'
import axios from 'axios'

// Public Judge0 CE – no API key (https://ce.judge0.com)
const JUDGE0_PUBLIC = 'https://ce.judge0.com'
const MainContainer = styled.div`
  display: grid;
  grid-template-columns: ${({ isFullScreen }) => isFullScreen ? '1fr' : '2fr 1fr'};
  min-height: ${({ isFullScreen }) => isFullScreen ? '100vh' : 'calc(100vh - 4.5rem)'};
  @media (max-width: 768px){
    grid-template-columns: 1fr;
  }
`

const Consoles = styled.div`
  display: grid;
  width: 100%;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr;
`

const Playground = () => {
  const { folderId, playgroundId } = useParams()
  const { folders, savePlayground } = useContext(PlaygroundContext)
  const { isOpenModal, openModal, closeModal } = useContext(ModalContext)
  const { title, language, code } = folders[folderId].playgrounds[playgroundId]

  const [currentLanguage, setCurrentLanguage] = useState(language)
  const [currentCode, setCurrentCode] = useState(code)
  const [currentInput, setCurrentInput] = useState('')
  const [currentOutput, setCurrentOutput] = useState('')
  const [isFullScreen, setIsFullScreen] = useState(false)

  // all logic of the playground
  const saveCode = () => {
    savePlayground(folderId, playgroundId, currentCode, currentLanguage)
  }

  const getSubmission = async (token) => {
    const { data } = await axios.get(
      `${JUDGE0_PUBLIC}/submissions/${token}`,
      { params: { base64_encoded: 'false' } }
    )
    return data
  }

  const speakOutput = (text) => {
    try {
      const synth = typeof window !== 'undefined' && (window.speechSynthesis || window.webkitSpeechSynthesis)
      if (!text || !synth) return
      const toSpeak = text.replace(/\n+/g, ' ').trim()
      if (!toSpeak) return
      synth.cancel()
      const Utterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
      if (!Utterance) return
      const utterance = new Utterance(toSpeak)
      utterance.rate = 0.95
      synth.speak(utterance)
    } catch (_) {
      // Speech unavailable or blocked – works on Windows & Mac in Chrome, Edge, Firefox, Safari
    }
  }

  const runCode = async () => {
    openModal({
      show: true,
      modalType: 6,
      identifiers: { folderId: '', cardId: '' }
    })
    const languageId = languageMap[currentLanguage]?.id ?? languageMap.javascript.id

    try {
      const { data: postRes } = await axios.post(
        `${JUDGE0_PUBLIC}/submissions`,
        {
          source_code: currentCode,
          language_id: languageId,
          stdin: currentInput
        },
        {
          params: { base64_encoded: 'false', wait: 'true' },
          headers: { 'Content-Type': 'application/json' }
        }
      )

      let res = postRes
      if (res.token != null && res.stdout == null && res.stderr == null) {
        let statusId = res.status_id ?? res.status?.id
        while (statusId != null && statusId <= 2) {
          await new Promise((r) => setTimeout(r, 600))
          res = await getSubmission(res.token)
          statusId = res.status_id ?? res.status?.id
        }
      }

      const statusId = res.status_id ?? res.status?.id
      const statusName = res.status?.description || 'Done'
      const out = res.stdout ?? ''
      const compileOut = res.compile_output ?? ''
      const err = res.stderr ?? ''

      let finalOutput = ''
      if (statusId !== 3) {
        finalOutput = compileOut || err || res.message || 'No output'
      } else {
        finalOutput = out
      }
      const outputText = `${statusName}\n\n${finalOutput}`
      setCurrentOutput(outputText)
      speakOutput(outputText)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Execution failed'
      setCurrentOutput(`Error\n\n${msg}`)
      speakOutput(`Error. ${msg}`)
    }
    closeModal()
  }

  const getFile = (e, setState) => {
    const input = e.target;
    if ("files" in input && input.files.length > 0) {
      placeFileContent(input.files[0], setState);
    }
  };

  const placeFileContent = (file, setState) => {
    readFileContent(file)
      .then((content) => {
        setState(content)
      })
      .catch((error) => console.log(error));
  };

  function readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  return (
    <div>
      <Navbar isFullScreen={isFullScreen} />
      <MainContainer isFullScreen={isFullScreen}>
        <EditorContainer
          title={title}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          currentCode={currentCode}
          setCurrentCode={setCurrentCode}
          folderId={folderId}
          playgroundId={playgroundId}
          saveCode={saveCode}
          runCode={runCode}
          getFile={getFile}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
        />
        <Consoles>
          <InputConsole
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            getFile={getFile}
          />
          <OutputConsole
            currentOutput={currentOutput}
          />
        </Consoles>
      </MainContainer>
      {isOpenModal.show && <Modal />}
    </div>
  )
}

export default Playground