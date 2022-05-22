import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './Markdown.scss';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from "@codemirror/lang-markdown";
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const Main = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    document.getElementById("close-btn").onclick = () => {
      window.electron.ipcRenderer.sendMessage('ipc-example', ['closeWindow']);
    }
    document.getElementById("min-btn").onclick = () => {
      window.electron.ipcRenderer.sendMessage('ipc-example', ['minimizeWindow']);
    }
    document.getElementById("max-btn").onclick = () => {
      window.electron.ipcRenderer.sendMessage('ipc-example', ['maximizeWindow']);
    }
  });

  return (
    <div className="w-full h-screen flex flex-col">
      <div id="title-bar">
        <div id="title">Markdown Editory</div>
        <div id="title-bar-btns" className="flex gap-2">
          <button id="close-btn" className="w-3 h-3 rounded-full bg-rose-500"></button>
          <button id="min-btn" className="w-3 h-3 rounded-full bg-yellow-500"></button>
          <button id="max-btn" className="w-3 h-3 rounded-full bg-green-500"></button>
        </div>
      </div>
      <div className="w-full h-full flex pt-[32px]">
        <div className="w-1/2 h-full flex flex-col bg-black">
          <CodeMirror
            value={content}
            theme="dark"
            extensions={[markdown()]}
            onChange={setContent}
          />
        </div>
        <div className="w-1/2 h-full overflow-y-auto overflow-x-hidden p-12 content bg-zinc-900 bg-opacity-60">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
