import React, { useState } from 'react';
import rehypeHighlight from 'rehype-highlight';
import rehypePrettyCode from 'rehype-pretty-code';
import Markdown from "react-markdown";
import { toast } from 'react-hot-toast'; // ADD THIS

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      
      // Replaced alert with toast
      toast.success('Code copied to clipboard! ✅');
      
      // Log to browser console
      console.log('Code copied:', code);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      alert('Failed to copy code');
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      className="copy-button"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? '✅ Copied!' : '📋 Copy'}
    </button>
  );
}

function MyMarkdownRenderer({ content }) {
  return (
    <Markdown
      rehypePlugins={[rehypeHighlight, rehypePrettyCode]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const code = String(children).replace(/\n$/, '');
          
          if (!inline) {
            return (
              <div className="code-block-wrapper">
                <pre className={className}>
                  <code {...props}>{children}</code>
                  <CopyButton code={code} />
                </pre>
              </div>
            );
          }
          return <code className={className} {...props}>{children}</code>;
        }
      }}
    >
      {content}
    </Markdown>
  );
}

export default MyMarkdownRenderer;