import { useState, useEffect } from 'react';
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import axios from 'axios';
import './App.css';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Theme
import { Copy } from 'lucide-react'; // For copy icon
import { Toaster, toast } from 'react-hot-toast'; // For toast notification (optional)

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);
  const [review, setReview] = useState('');
  const [executionResult, setExecutionResult] = useState('');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    try {
      setShowConsole(false);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ai/get-review`, { code });
      setReview(response.data);
      toast.success('Review received!');
    } catch (error) {
      console.error('Review error:', error);
    }
  }

  function runCode() {
    try {
      setShowConsole(true);
      setReview('');

      const logs = [];
      const originalConsoleLog = console.log;

      console.log = (...args) => {
        logs.push(args.join(' '));
        originalConsoleLog(...args);
      };

      const sandbox = new Function(code);
      sandbox();

      console.log = originalConsoleLog;
      setConsoleOutput(logs);
      setExecutionResult('');
    } catch (error) {
      setExecutionResult('Error: ' + error.message);
      setConsoleOutput([]);
    }
  }

  function CodeBlock({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(children);
        toast.success('Code copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy!', err);
      }
    };

    return !inline && match ? (
      <div style={{ position: 'relative' }}>
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
        <button
          onClick={copyToClipboard}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: '#111',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          <Copy size={14} />
        </button>
      </div>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <>
      <main>
        <header>
          <h2>CodeGenie - AI Powered Code Review and Execution System</h2>
          <h4>Write your code, get a review, and execute it!</h4>
          <p>Note: This is a demo version and currently supports only JavaScript. The AI model is not perfect and may not always provide accurate reviews.</p>
        </header>
        <div className="code-area">
          <div className="left">
            <div className="code">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={(code) => prism.highlight(code, prism.languages.javascript, 'javascript')}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 16,
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  height: "100%",
                  width: "100%"
                }}
              />
            </div>
            <div className="button-container">
              <div onClick={runCode} className="run">Run</div>
              <div onClick={reviewCode} className="review">Review</div>
            </div>
          </div>

          <div className="right">
            {showConsole && (
              <div className="console-area">
                <h3>Console:</h3>
                <div className="console-output">
                  {consoleOutput.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}
            {executionResult && (
              <div className="execution-result">
                <pre>{executionResult}</pre>
              </div>
            )}
            {!showConsole && (
              <div className="review-area">
                <ReactMarkdown
                  components={{
                    code: CodeBlock
                  }}
                >
                  {review}
                </ReactMarkdown>
              </div>
            )}
            <Toaster />
          </div>
        </div>
        <footer>
          © 2025 CodeGenie. All rights reserved.
          <p>Made with ❤️ by Bhavesh</p>
          <p>Powered by AI</p>
          <a href="https://github.com/bhaveshjain2603" target="_blank">GitHub</a> <br />
          <a href="https://sbk-portfolio.vercel.app" target="_blank">Portfolio</a>
        </footer>
      </main>
    </>
  );
}

export default App;