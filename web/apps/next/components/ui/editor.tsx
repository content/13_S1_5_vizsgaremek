"use client";


interface SimpleHtmlEditorProps {
    initialContent?: string | undefined;
    editorRef: React.RefObject<HTMLDivElement | null>;
}


const Editor = ({ initialContent = "'<p>Kezdj el írni...</p>'", editorRef  }: SimpleHtmlEditorProps) => {

    // const onChange = (content: string) => {
    // }

    // const handleInput = (e: React.FormEvent<HTMLDivElement>): void => {
    //     if (onChange && editorRef.current) {
    //         onChange(editorRef.current.innerHTML);
    //     }
    // };
    
    const executeCommand = (command: string, value: string | null = null): void => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value || undefined);
            // if (onChange) {
            //     onChange(editorRef.current.innerHTML);
            // }
        }
    };

    return (
        <>
            <div className="bg-zinc-700 border border-zinc-600 rounded-lg overflow-hidden mb-6 h-[500px]">
                {/* Toolbar */}
                <div className="bg-zinc-800 border-b border-zinc-800 p-3">
                    <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => executeCommand('bold')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm font-bold"
                        title="Félkövér"
                        type="button"
                    >
                        B
                    </button>
                    <button
                        onClick={() => executeCommand('italic')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm italic"
                        title="Dőlt"
                        type="button"
                    >
                        I
                    </button>
                    <button
                        onClick={() => executeCommand('underline')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm underline"
                        title="Aláhúzott"
                        type="button"
                    >
                        U
                    </button>
                    <div className="w-px bg-zinc-300 mx-1"></div>
                    <button
                        onClick={() => executeCommand('formatBlock', '<h1>')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-lg font-bold"
                        title="Címsor 1"
                        type="button"
                    >
                        H1
                    </button>
                    <button
                        onClick={() => executeCommand('formatBlock', '<h2>')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm font-bold"
                        title="Címsor 2"
                        type="button"
                    >
                        H2
                    </button>
                    <button
                        onClick={() => executeCommand('formatBlock', '<h3>')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm font-semibold"
                        title="Címsor 3"
                        type="button"
                    >
                        H3
                    </button>
                    <button
                        onClick={() => executeCommand('formatBlock', '<p>')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm"
                        title="Normál bekezdés"
                        type="button"
                    >
                        P
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button
                        onClick={() => executeCommand('insertUnorderedList')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm"
                        title="Felsorolás"
                        type="button"
                    >
                        • Lista
                    </button>
                    <button
                        onClick={() => executeCommand('insertOrderedList')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm"
                        title="Számozott lista"
                        type="button"
                    >
                        1. Lista
                    </button>
                    {/* <div className="w-px bg-gray-300 mx-1"></div>
                    <button
                        onClick={handleLinkCreation}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm"
                        title="Link hozzáadása"
                        type="button"
                    >
                        🔗 Link
                    </button>
                    <button
                        onClick={() => executeCommand('unlink')}
                        className="px-3 py-1 bg-zinc-700 hover:bg-gray-300 rounded text-sm"
                        title="Link eltávolítása"
                        type="button"
                    >
                        ⛓️‍💥
                    </button> */}
                    </div>
                </div>
            
                {/* Editor Area */}
                <div
                    ref={editorRef}
                    contentEditable={true}
                    // onInput={handleInput}
                    className="p-4 min-h-64 focus:outline-none bg-zinc-700 text-black overflow-y-auto h-full"
                    style={{
                        lineHeight: '1.6',
                        fontSize: '16px',
                        color: "black !important"
                    }}
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{ __html: initialContent }}
                />
                
            </div>
            
            { /* Styling for the editor */}
            <style dangerouslySetInnerHTML={{
                __html: `
                [contenteditable] h1 {
                    font-size: 2em !important;
                    font-weight: bold !important;
                    margin: 0.67em 0 !important;
                    display: block !important;
                }
                [contenteditable] h2 {
                    font-size: 1.5em !important;
                    font-weight: bold !important;
                    margin: 0.83em 0 !important;
                    display: block !important;
                }
                [contenteditable] h3 {    
                    font-size: 1.17em !important;
                    font-weight: bold !important;
                    margin: 1em 0 !important;
                    display: block !important;
                }
                [contenteditable] ul {
                    list-style-type: disc !important;
                    padding-left: 2em !important;
                    margin: 1em 0 !important;
                    display: block !important;
                }
                [contenteditable] ol {
                    list-style-type: decimal !important;
                    padding-left: 2em !important;
                    margin: 1em 0 !important;
                    display: block !important;
                }
                [contenteditable] li {
                    margin: 0.5em 0 !important;
                    display: list-item !important;
                }
                [contenteditable] blockquote {
                    border-left: 4px solid #ccc !important;
                    margin: 1em 0 !important;
                    padding: 0 1em !important;
                    color: #666 !important;
                    font-style: italic !important;
                    display: block !important;
                }
                [contenteditable] a {
                    color: #0066cc !important;
                    text-decoration: underline !important;
                }
                [contenteditable] p {
                    margin: 1em 0 !important;
                    display: block !important;
                }
                [contenteditable] strong, [contenteditable] b {
                    font-weight: bold !important;
                }
                [contenteditable] em, [contenteditable] i {
                    font-style: italic !important;
                }
                `
            }} />
        </>
    );
};

export default Editor;