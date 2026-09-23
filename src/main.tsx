import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/work.css'
import './styles/case-studies.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
