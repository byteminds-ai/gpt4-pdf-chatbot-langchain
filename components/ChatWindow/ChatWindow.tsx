import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import LoadingDots from '@/components/ui/LoadingDots';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface ChatWindowProps {
    messages: Message[];
    loading: boolean;
    onSubmit: (e: any, query: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, loading, onSubmit }) => {
    const [query, setQuery] = useState<string>('');
    const messageListRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        textAreaRef.current?.focus();
    }, []);

    const chatMessages = useMemo(() => {
        return [
            ...messages,
            ...(loading
                ? [
                    {
                        type: 'apiMessage',
                        message: '...',
                        sourceDocs: [],
                    },
                ]
                : []),
        ];
    }, [messages, loading]);

    //prevent empty submissions
    const handleEnter = (e: any) => {
        if (e.key === 'Enter' && query) {
            handleSubmit(e);
        } else if (e.key == 'Enter') {
            e.preventDefault();
        }
    };

    //handle form submission
    function handleSubmit(e: any) {
        e.preventDefault();
        onSubmit(e, query);
        setQuery('');
    }

    return (
        <>
            <div className="flex-grow">
                <main className="container mx-auto px-4">
                    <div className="mx-auto flex flex-col gap-4">
                        <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
                            Chat With Your Own Data
                        </h1>
                        <main className={styles.main}>
                            <div className={styles.cloud}>
                                <div ref={messageListRef} className={styles.messagelist}>
                                    {chatMessages.map((message, index) => {
                                        let icon;
                                        let className;
                                        if (message.type === 'apiMessage') {
                                            icon = (
                                                <Image
                                                    src="/bot-image.png"
                                                    alt="AI"
                                                    width="40"
                                                    height="40"
                                                    className={styles.boticon}
                                                    priority
                                                />
                                            );
                                            className = styles.apimessage;
                                        } else {
                                            icon = (
                                                <Image
                                                    src="/usericon.png"
                                                    alt="Me"
                                                    width="30"
                                                    height="30"
                                                    className={styles.usericon}
                                                    priority
                                                />
                                            );
                                            className =
                                                loading && index === chatMessages.length - 1
                                                    ? styles.usermessagewaiting
                                                    : styles.usermessage;
                                        }
                                        return (
                                            <>
                                                <div key={index} className={className}>
                                                    {icon}
                                                    <div className={styles.markdownanswer}>
                                                        <ReactMarkdown linkTarget="_blank">
                                                            {message.message}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={styles.center}>
                                <div className={styles.cloudform}>
                                    <form onSubmit={handleSubmit}>
                                        <textarea
                                            disabled={loading}
                                            onKeyDown={handleEnter}
                                            ref={textAreaRef}
                                            autoFocus={false}
                                            rows={1}
                                            maxLength={512}
                                            id="userInput"
                                            name="userInput"
                                            placeholder={
                                                loading
                                                    ? 'Waiting for response...'
                                                    : 'Type your question here'
                                            }
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            className={styles.textarea}
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={styles.generatebutton}
                                        >
                                            {loading ? (
                                                <div className={styles.loadingwheel}>
                                                    <LoadingDots color="#000" />
                                                </div>
                                            ) : (
                                                // Send icon SVG in input field
                                                <svg
                                                    viewBox="0 0 20 20"
                                                    className={styles.svgicon}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                                                </svg>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </main>
                    </div>
                </main>
            </div>
        </>
    );
};
export default ChatWindow;

