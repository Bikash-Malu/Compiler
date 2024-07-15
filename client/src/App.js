import React, { useState, useRef } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import 'tailwindcss/tailwind.css';

const App = () => {
    const [code, setCode] = useState('// Write your code here\n');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const editorRef = useRef(null);

    const handleCompile = () => {
        axios.post('http://localhost:5000/compile', { language, code })
            .then(response => {
                setOutput(response.data);
            })
            .catch(error => {
                setOutput(error.response ? error.response.data : error.message);
            });
    };

    const handleClearCode = () => {
        setCode('// Write your code here\n');
    };

    const getLanguage = (lang) => {
        switch (lang) {
            case 'javascript':
                return 'javascript';
            case 'python':
                return 'python';
            case 'java':
                return 'java';
            case 'c':
                return 'c';
            case 'cpp':
                return 'cpp';
            default:
                return 'javascript';
        }
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        if (language === 'javascript') {
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false
            });
        } else {
            monaco.languages.register({ id: language });
            monaco.languages.setMonarchTokensProvider(language, {
            });
            monaco.editor.setModelMarkers(editor.getModel(), language, []);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <div className="w-full max-w-6xl bg-gray-800 p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center">Code Compiler</h1>
                <div className="mb-6">
                    <label htmlFor="language" className="block text-gray-300 mb-2">Select Language</label>
                    <select
                        id="language"
                        value={language}
                        onChange={e => setLanguage(getLanguage(e.target.value))}
                        className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:border-blue-300"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
                <Editor
                    height="60vh"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value)}
                    theme="vs-dark"
                    onMount={handleEditorDidMount}
                    className="mb-6"
                />
                <div className="flex justify-between mb-6">
                    <button
                        onClick={handleCompile}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                        Compile
                    </button>
                    <button
                        onClick={handleClearCode}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded ml-2"
                    >
                        Clear Code
                    </button>
                </div>
                <pre className="mt-6 bg-gray-700 p-4 rounded text-white whitespace-pre-wrap">{output}</pre>
            </div>
        </div>
    );
};

export default App;
