// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // 우리가 만든 App.jsx를 불러옵니다.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)