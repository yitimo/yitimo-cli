import { createRoot } from 'react-dom/client'
import React from 'react'
import App from './App'

const app = createRoot(document.getElementById('app')!)

// @ts-ignore
app.render(<App />)
