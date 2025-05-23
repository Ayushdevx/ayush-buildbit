'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import GrapesJS, { Editor as GrapesEditor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './editor.css'; 
import 'grapesjs-preset-webpage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import parserPostCSS from 'grapesjs-parser-postcss';
import Loading from '../loading/loading';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Editor = ({ initialHtml, setHtml, id }: { initialHtml: string; id: string; setHtml: (html: string) => void }) => {
  const editorRef = useRef<GrapesEditor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true); // Initially true, assuming initialHtml is saved
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [editing, setEditing] = useState(false);
  const [userResponded, setUserResponded] = useState(true);
  const [aiEditResponse, setAiEditResponse] = useState('');

  const debounce = (func: (...args: string[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: string[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };
  // Save to database function
  const saveToDatabase = useCallback(
    debounce(async (completeHtml: string) => {
      setIsSaving(true);
      setIsSaved(false); // Mark as unsaved when saving starts
      try {
        const response = await fetch('/api/projects', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completeHtml, id }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Failed to save content to database:', data.error || 'Unknown error');
          toast.error('Failed to save changes');
          setIsSaved(false); // Keep as unsaved if save failed
        } else {
          console.log('Content saved successfully');
          toast.success('Changes saved');
          setIsSaved(true); // Mark as saved
        }
      } catch (error) {
        console.error('Error saving to database:', error);
        toast.error('Network error while saving');
        setIsSaved(false); // Keep as unsaved if error occurred
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [id] // Include id in useCallback dependencies
  );




  const getFullHtml = useCallback(() => {
    if (!editorRef.current) return '';

    const editor = editorRef.current;
    const html = editor.getHtml();
    const css = editor.getCss();
    const scripts = editor.getComponents().filter((c: { is: (arg0: string) => string; }) => c.is('script')).map(c => c.get('content')).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Website</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${scripts}
  </script>
</body>
</html>`;
  }, []);

  const updateHtmlAndTriggerSave = useCallback(() => {
    const completeHtml = getFullHtml();
    setHtml(completeHtml); // Update local state
    setIsSaved(false); // Mark as unsaved immediately on change
    saveToDatabase(completeHtml); // Debounced save to DB
  }, [getFullHtml, setHtml, saveToDatabase]);

  

  useEffect(() => {
    if (!editorRef.current) { // Initialize editor only once
      const editor = GrapesJS.init({
        container: '#gjs',
        fromElement: true,
        storageManager: false,
        plugins: ['gjs-preset-webpage', parserPostCSS],
        allowScripts: 1, // Allow <script> tags in the canvas
        canvas: {
          styles: [],
          scripts: ['https://cdn.tailwindcss.com'], // Add external scripts here if needed
        },
      });

      editorRef.current = editor;

      // Set initial components
      editor.setComponents(initialHtml, { keepScripts: true });

      editor.on('component:update', updateHtmlAndTriggerSave);
      editor.on('style:change', updateHtmlAndTriggerSave);

      editor.on('update', () => {
        // This fires on many types of changes, not just clicks.
        // It might be too broad for just closing on a "canvas click".
        if (showAiDialog) {
          setShowAiDialog(false);
        }
      });

      // Explicit save command for the button
      editor.Commands.add('save-db', {
        run: () => {
          const completeHtml = getFullHtml();
          setHtml(completeHtml); // Update local state
          saveToDatabase(completeHtml); // Explicitly trigger save
        },
      });

      editor.Commands.add('download', {
        run: () => {
          handleExport();
        },
      });

      // Add the save button to the panel
      editor.Panels.addButton('options', {
        id: 'save',
        // className will be updated dynamically via render method
        command: 'save-db',
        attributes: { title: 'Save to Database' },
      });

      editor.Panels.addButton('options', {
        id: 'download',
        className: 'fa fa-download',
        command: 'download',
        attributes: { title: 'Download' },
      });

      // Custom render method for the save button to change its icon
      editor.on('panel:run:options:save', () => {
        const btn = editor.Panels.getButton('options', 'save');
        if (btn) {
          // This will be handled by React state and render loop, not directly here
          // The idea is to update the className based on isSaving/isSaved state
          // We'll manage this in the JSX, not directly in GrapesJS panel definition
        }
      });


      editor.on('load', () => {
        const canvasBody = editor.Canvas.getBody();

        const removeOutlines = () => {
          const elements = canvasBody.querySelectorAll(
            '*[data-gjs-highlightable], .gjs-dashed'
          );

          elements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.outlineWidth !== '0px') {
              (el as HTMLElement).style.outline = 'none';
            }
          });
        };

        // Call it initially
        removeOutlines();

        const observer = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              removeOutlines();
            } else if (mutation.type === 'childList') {
              removeOutlines();
            }
          }
        });

        observer.observe(canvasBody, { attributes: true, childList: true, subtree: true });

        

        // Cleanup function for useEffect
        return () => {
          editor.destroy();
          observer.disconnect();
          editorRef.current = null;
        };
      });
    } else {
      // If editor already initialized, only update components if initialHtml changes
      // This is less ideal, prefer to set initial content only once.
      // If you truly need to re-render the editor with new initialHtml, consider
      // adding a `key` to the Editor component to force remount.
      // For now, we'll assume initialHtml is truly *initial*.
      // editorRef.current.setComponents(initialHtml, { keepScripts: true });
    }
  }, []); // Empty dependency array to run once on mount

  // Effect to update the save button's icon based on state
  useEffect(() => {
    if (editorRef.current) {
      const saveButton = editorRef.current.Panels.getButton('options', 'save');
      if (saveButton) {
        if (isSaving) {
          saveButton.set('className', 'fa fa-spinner fa-spin'); // Loading icon
          saveButton.set('attributes', { title: 'Saving...' });
        } else if (isSaved) {
          saveButton.set('className', 'fa fa-save'); // Saved icon
          saveButton.set('attributes', { title: 'Saved' });
        } else {
          saveButton.set('className', 'fa fa-exclamation-triangle'); // Unsaved icon
          saveButton.set('attributes', { title: 'Unsaved Changes' });
        }
      }
    }
  }, [isSaving, isSaved]);


  const handleExport = async () => {
    if (!editorRef.current) return;

    const zip = new JSZip();
    zip.file('index.html', getFullHtml());// Include the CSS file

   
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `BuildBit-${Date.now()}.zip`);
   
  };

  const handleEdit = async () => {
    if (!editorRef.current) return;
    setEditing(true);
    const completeHtml = getFullHtml();
    const response = await fetch('/api/aiEdit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: editPrompt, html: completeHtml }),
    });
    if (!response.ok) {
      console.error('Failed to edit content');
      setEditing(false);
      return;
    }
    const data = await response.json();
    if (typeof data === 'string') {
      setUserResponded(false);
      setAiEditResponse(data);
      setEditing(false);
      setEditPrompt('');
    } else {
      setUserResponded(true);
      setEditing(false);
      console.error('Invalid response from AI edit:', data);
    }
  };

  const handleAccept = () => {
    if (!editorRef.current) return;
    setUserResponded(true);
    setShowAiDialog(false);
    setEditPrompt('');
    editorRef.current.setComponents(aiEditResponse, { keepScripts: true });
    setHtml(aiEditResponse);
    saveToDatabase(aiEditResponse);
  };
  const handleReject = () => {
    if (!editorRef.current) return;
    setUserResponded(true);
    setShowAiDialog(false);
    setEditPrompt('');
    editorRef.current.setComponents(initialHtml, { keepScripts: true });
    setHtml(initialHtml);
  };

  
  return (
    <div className="relative h-screen w-screen">
      {/* Loading overlay when editing with AI */}
      {editing && (
        <div className="absolute w-screen h-screen z-100 bg-neutral-950/70 backdrop-blur-sm">
          <div className="flex items-center justify-center h-full w-full overflow-hidden">
            <Loading text={"Generating Design"} />
          </div>
        </div>
      )}
        {/* Enhanced AI response preview with improved accept/reject options */}
      {!userResponded && (
        <div className="absolute w-screen h-screen z-30 bg-neutral-950/85 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full w-full"
          >
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-900/95 p-5 border-b border-neutral-800 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-robot text-blue-400"></i>
                </div>
                <div>
                  <h2 className="text-white text-lg font-semibold">AI Generated Design</h2>
                  <p className="text-neutral-400 text-xs">Review the AI-generated changes before applying</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 border border-neutral-700/50">
                  <i className="fa-solid fa-xmark"></i>
                  Reject & Edit
                </button>
                <button
                  onClick={handleAccept}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/20">
                  <i className="fa-solid fa-check"></i>
                  Apply Changes
                </button>
              </div>
            </div>
            
            <div className="relative w-full h-full">
              {/* Preview hint overlay */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-neutral-900/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg z-10 pointer-events-none border border-neutral-800/50 flex items-center gap-2">
                <i className="fa-solid fa-eye text-blue-400"></i>
                <span className="text-white text-xs font-medium">Preview Mode</span>
              </div>
              
              <iframe
                className="w-full h-full border-0"
                srcDoc={aiEditResponse}
                title="AI Edit Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </motion.div>
        </div>
      )}
        {/* Enhanced AI Prompt Dialog */}
      {showAiDialog ? (
        <div
          onClick={() => { setShowAiDialog(false); }}
          className="absolute w-screen h-screen z-10 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 transition-all">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => { e.stopPropagation(); }}
            className="bg-neutral-900 rounded-xl border border-neutral-700/70 shadow-2xl w-full max-w-lg p-5 relative overflow-hidden"
          >
            {/* Decorative gradient background */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
            
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-white text-xl font-semibold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i>
                </div>
                AI Design Assistant
              </h3>
              <button 
                onClick={() => setShowAiDialog(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-neutral-400 text-sm mb-2">What changes would you like to make to your design?</p>
              <textarea
                onChange={(e) => { setEditPrompt(e.target.value); }}
                value={editPrompt}
                placeholder="Example: 'Make it a dark theme website with blue accents, improve the header layout, and add a contact form section at the bottom'"
                className="bg-neutral-800/70 backdrop-blur-sm border border-neutral-700/70 rounded-lg w-full p-4 text-white text-sm font-medium min-h-[180px] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all resize-none"
                autoFocus
              />
            </div>
            
            <div className="flex items-center text-xs text-neutral-500 mb-4">
              <i className="fa-solid fa-lightbulb mr-2 text-amber-400"></i>
              <p>Be specific about colors, layout changes, and content additions for best results.</p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAiDialog(false)}
                className="px-5 py-2.5 text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-700"
              >
                Cancel
              </button>
              <button
                disabled={editPrompt.length < 1}
                className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg
                  ${editPrompt.length < 1 ? 'opacity-50 cursor-not-allowed from-neutral-700 to-neutral-600 shadow-none' : 'hover:shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700'}`}
                onClick={handleEdit}
              >
                <i className="fa-solid fa-bolt-lightning"></i>
                Generate Design
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="absolute bottom-6 left-6 z-20">
          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAiDialog(true)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3.5 flex items-center gap-2.5 shadow-xl hover:shadow-blue-500/30 transition-all"
            title="Edit with AI"
          >
            <i className="fa-solid fa-wand-magic-sparkles fa-bounce text-white"></i>
            <span className="text-white font-medium pr-2 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
              AI Editor
            </span>
          </motion.button>
        </div>
      )}
      <div id="gjs" className="static"></div>
      </div>
  );
};

export default Editor;