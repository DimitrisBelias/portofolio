import React from 'react'
import ReactDOM from 'react-dom/client'
import Lenis from 'lenis'
import App from './App'
import './index.css'

const lenis = new Lenis()

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
