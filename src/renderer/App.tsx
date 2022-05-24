/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-children-prop */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './Markdown.scss';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGemoji from 'remark-gemoji';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { EditorView } from '@codemirror/view';
// @ts-ignore
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// @ts-ignore
import remarkToc from 'remark-toc';
import rehypeRaw from 'rehype-raw';

import 'katex/dist/katex.min.css';

const Main = () => {
  const [_content, _setContent] = useState('');
  const [_currentFile, _setCurrentFile] = useState('');
  const [_isSaved, _setIsSaved] = useState(true);

  const currentFile = useRef(_currentFile);
  const content = useRef(_content);
  const isSaved = useRef(_isSaved);

  const setCurrentFile = (newCurrentFile: string) => {
    currentFile.current = newCurrentFile;
    _setCurrentFile(newCurrentFile);
  };

  const setContent = (newContent: string) => {
    content.current = newContent;
    _setContent(newContent);
  };

  const setIsSaved = (newIsSaved: boolean) => {
    isSaved.current = newIsSaved;
    _setIsSaved(newIsSaved);
  };

  useEffect(() => {
    // @ts-ignore
    document.getElementById('close-btn').onclick = () => {
      window.electron.ipcRenderer.sendMessage('ipc', ['closeWindow']);
    };
    // @ts-ignore
    document.getElementById('min-btn').onclick = () => {
      window.electron.ipcRenderer.sendMessage('ipc', ['minimizeWindow']);
    };
    // @ts-ignore
    document.getElementById('max-btn').onclick = () => {
      window.electron.ipcRenderer.sendMessage('ipc', ['maximizeWindow']);
    };

    window.electron.ipcRenderer.on('ipc', (args) => {
      switch ((args as never)[0]) {
        case 'open-file':
          window.electron.ipcRenderer.sendMessage('ipc', ['openFileDialog']);
          break;
        case 'open-file-content':
          setCurrentFile((args as never)[1]);
          window.electron
            .readFile((args as never)[1])
            .then((e) => {
              setContent(e);
              setIsSaved(true);
              return 0;
            })
            .catch((e) => console.log(e));
          break;
        case 'new-file':
          if (!isSaved.current) {
            window.electron.ipcRenderer.sendMessage('ipc', [
              'newFileConfirmation',
            ]);
            break;
          }
          setCurrentFile('');
          setContent('');
          setIsSaved(true);
          break;
        case 'new-file-confirmed':
          setCurrentFile('');
          setContent('');
          setIsSaved(true);
          break;
        case 'save-file':
          if (currentFile.current) {
            window.electron
              .writeFile(currentFile.current, content.current)
              .then(() => {
                setIsSaved(true);
                return 0;
              })
              .catch((e) => {
                throw e;
              });
          }
          break;
        default:
          break;
      }
      return 0;
    });
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      <div id="title-bar">
        <div id="title">
          {_currentFile.split('/').pop() || 'Untitled'}
          {!_isSaved && '*'} - Markdown Editory
        </div>
        <div id="title-bar-btns" className="flex gap-2">
          <button id="close-btn" className="w-3 h-3 rounded-full bg-rose-500" />
          <button id="min-btn" className="w-3 h-3 rounded-full bg-yellow-500" />
          <button id="max-btn" className="w-3 h-3 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="w-full h-full flex pt-[32px]">
        <div className="w-1/2 h-full flex flex-col bg-zinc-900 bg-opacity-70 border-r border-zinc-500 border-opacity-60">
          <CodeMirror
            value={_content}
            theme="dark"
            extensions={[markdown(), EditorView.lineWrapping]}
            onChange={(e) => {
              setContent(e);
              if (Math.abs(e.length - _content.length) === 1) {
                setIsSaved(false);
              }
            }}
          />
        </div>
        <div className="w-1/2 h-full overflow-y-auto overflow-x-hidden p-12 content bg-zinc-900 bg-opacity-70">
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a
                  className="cursor-pointer"
                  aria-label={href}
                  onClick={() => {
                    window.electron.ipcRenderer.sendMessage('ipc', [
                      'openExternal',
                      href,
                    ]);
                  }}
                >
                  {children}
                </a>
              ),
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, '')}
                    style={oneDark}
                    customStyle={{
                      backgroundColor: 'transparent',
                      padding: '0 1rem',
                    }}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
            remarkPlugins={[remarkGfm, remarkMath, remarkGemoji, remarkToc]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
          >
            {_content}
          </ReactMarkdown>
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
