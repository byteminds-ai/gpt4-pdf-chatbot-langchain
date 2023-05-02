import React, { useState } from 'react';
import { Message } from '@/types/chat';
import ChatWindow from '@/components/ChatWindow/ChatWindow';

const MorseChat: React.FC = () => {
    const [messageState, setMessageState] = useState<{
        messages: Message[];
        history: [string, string][];
    }>({
        messages: [
            {
                message: 'Hi, what would you like to learn about the Pine Cone Docs? You can find the complete docs at https://docs.pinecone.io/docs/overview',
                type: 'apiMessage',
            },
        ],
        history: [],
    });

    const [loading, setLoading] = useState<boolean>(false);

    const { messages, history } = messageState;

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
                    type: 'pinecone-docs'
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
        <ChatWindow messages={messages} loading={loading} onSubmit={handleSubmit} />
    );
};

export default MorseChat;
