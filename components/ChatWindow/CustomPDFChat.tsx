import React, { useState } from 'react';
import { Message } from '@/types/chat';
import ChatWindow from './ChatWindow';

const CustomPDFChat: React.FC = () => {

    const [messageState, setMessageState] = useState<{
        messages: Message[];
        history: [string, string][];
    }>({
        messages: [],
        history: [],
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ingested, setIngested] = useState<boolean>(false);
    const [fileSize, setFileSize] = useState(0);
    const [directory, setDirectory] = useState<string>('hsnw');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 2 * 1024 * 1024) {
                setError('File size should not exceed 2MB.');
                setFile(null);
                setFileSize(0);
            } else {
                setFile(selectedFile);
                setFileSize(selectedFile.size);
            }
        }
    };

    const handleIngestDocument = async (e: React.FormEvent) => {
        if (!file || fileSize > 2 * 1024 * 1024) {
            setError('File size must be under 2MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'pdf'); // or 'doc' depending on the type of file you are uploading
        setLoading(true);
        try {
            const response = await fetch('/api/ingest-hsnw', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            // If the ingestion is successful, set the state to show the ChatWindow
            setIngested(true);
            setDirectory((await response.json()).directory);
        } catch (error) {
            console.error('Error ingesting the document:', error);
            setError('Something went wrong, try ingesting again');
        } finally {
            setLoading(false);
        }
    };

    const renderUploadSection = () => (
        <div>
            <h2>Upload PDF or DOC file (up to 2MB)</h2>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
            {file && (
                <div>
                    <p>File: {file.name}</p>
                </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {file && (
                <button className="bg-blue-500 text-white p-2" onClick={handleIngestDocument}>
                    Ingest Document
                </button>
            )}
        </div>
    );


    const { messages, history } = messageState;

    // Implement the handleSubmit function similar to MorseChat.tsx
    async function handleSubmit(e: any, query: string) {
        e.preventDefault();

        setMessageState((state) => ({
            ...state,
            messages: [
                ...state.messages,
                {
                    type: 'userMessage',
                    message: query,
                },
            ],
        }));

        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: query,
                    history,
                    type: 'buffer',
                    directory,
                }),
            });
            const data = await response.json();

            setMessageState((state) => ({
                ...state,
                messages: [
                    ...state.messages,
                    {
                        type: 'apiMessage',
                        message: data.text,
                    },
                ],
                history: [...state.history, [query, data.text]],
            }));

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log('error', error);
        }
    }

    return (
        <div>
            {!ingested && renderUploadSection()}
            {ingested && (
                <ChatWindow messages={messages} loading={loading} onSubmit={handleSubmit} />
            )}
        </div>
    );
};

export default CustomPDFChat;
