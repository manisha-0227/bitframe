import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AiOutlineRobot, AiOutlineClose, AiOutlineSend } from 'react-icons/ai';
import { BiMicrophone, BiMicrophoneOff } from 'react-icons/bi';
import { generateCodeWithAI } from '../services/aiService';

const AssistantContainer = styled.div`
  position: fixed;
  bottom: ${({ isOpen }) => isOpen ? '20px' : '-500px'};
  right: 20px;
  width: 450px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: bottom 0.3s ease-in-out;
  border: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
`;

const AssistantHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
  color: white;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const AssistantBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: 400px;
  background: #f8f9fa;
`;

const Message = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${({ isUser }) => isUser ? '#667eea' : '#e9ecef'};
  color: ${({ isUser }) => isUser ? 'white' : '#333'};
  align-self: ${({ isUser }) => isUser ? 'flex-end' : 'flex-start'};
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.5;
  white-space: pre-line;
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background: white;
  border-radius: 0 0 12px 12px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: none;
  min-height: 50px;
  max-height: 120px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
`;

const VoiceButton = styled.button`
  padding: 0.75rem;
  background: ${({ isListening }) => isListening ? '#ff4444' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 45px;
  font-size: 1.2rem;
  position: relative;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  ${({ isListening }) => isListening && `
    animation: pulse 1.5s ease-in-out infinite;
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
      }
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: ${({ disabled }) => disabled ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
  min-width: 80px;
  justify-content: center;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  z-index: 999;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
`;

const AIAssistant = ({ currentCode, currentLanguage, onCodeUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to chat
    const newUserMessage = {
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Call AI service
      const result = await generateCodeWithAI(userMessage, currentCode, currentLanguage);

      if (result.success && result.code) {
        // Update the code in the editor FIRST (before showing message)
        if (onCodeUpdate && typeof onCodeUpdate === 'function') {
          // Directly update the editor with the generated code
          onCodeUpdate(result.code);
          
          // Add AI response to chat after updating
          const aiMessage = {
            text: '✅ Code generated and inserted into editor!',
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          
          // Optional: Scroll to top of editor to show the new code
          setTimeout(() => {
            const editorElement = document.querySelector('.cm-editor');
            if (editorElement) {
              editorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        } else {
          // Fallback if onCodeUpdate is not available
          const aiMessage = {
            text: '⚠️ Code generated but could not update editor. Please copy the code manually.',
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Show error message - only show in chat, not as separate error
        const errorText = result.error || 'Failed to generate code. Please try again.';
        const errorMessage = {
          text: errorText,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        // Don't set separate error state to avoid duplicates
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred. Please try again.';
      const errorMessage = {
        text: errorMsg,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update input value with both interim and final transcripts
        if (finalTranscript) {
          setInputValue(prev => prev + finalTranscript);
        } else if (interimTranscript) {
          // Show interim results (optional - you can remove this if you want only final results)
          // setInputValue(prev => prev.replace(/\[.*?\]$/, '') + '[' + interimTranscript + ']');
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error. ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone found.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission denied.';
            break;
          default:
            errorMessage += event.error;
        }
        
        const errorMsg = {
          text: errorMessage,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const errorMsg = {
        text: 'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Start listening
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  return (
    <>
      <ToggleButton onClick={handleToggle} title="AI Assistant">
        <AiOutlineRobot />
      </ToggleButton>
      <AssistantContainer isOpen={isOpen}>
        <AssistantHeader>
          <HeaderTitle>
            <AiOutlineRobot />
            <span>AI Code Assistant</span>
          </HeaderTitle>
          <CloseButton onClick={handleClose}>
            <AiOutlineClose />
          </CloseButton>
        </AssistantHeader>
        <AssistantBody>
          <MessagesContainer>
            {messages.length === 0 && (
              <Message isUser={false}>
                👋 Hi! I'm your AI coding assistant. Describe what you want to do with your code, and I'll help you generate or modify it.
                <br /><br />
                <strong>Examples:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>"Add error handling to this function"</li>
                  <li>"Optimize this code for better performance"</li>
                  <li>"Add comments explaining the logic"</li>
                  <li>"Create a function to calculate factorial"</li>
                </ul>
              </Message>
            )}
            {messages.map((msg, index) => (
              <Message key={index} isUser={msg.isUser}>
                {msg.text}
              </Message>
            ))}
            {isLoading && (
              <LoadingIndicator>
                <div className="spinner" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #667eea',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Generating code...</span>
              </LoadingIndicator>
            )}
          </MessagesContainer>
          <InputContainer>
            <InputWrapper>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening... Speak your request..." : "Describe what you want to do with your code or click mic to speak..."}
                disabled={isLoading || isListening}
                rows={2}
              />
              <VoiceButton
                onClick={toggleListening}
                isListening={isListening}
                disabled={isLoading}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <BiMicrophoneOff /> : <BiMicrophone />}
              </VoiceButton>
              <SendButton
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading || isListening}
              >
                <AiOutlineSend />
                Send
              </SendButton>
            </InputWrapper>
          </InputContainer>
        </AssistantBody>
      </AssistantContainer>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;

