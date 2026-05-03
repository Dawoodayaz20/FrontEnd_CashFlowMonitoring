import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ChatContextProvider } from './pages/FlowManagerPage/ChatContext.tsx';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <ChatContextProvider>
        <App />
      </ChatContextProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
