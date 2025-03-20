"use client"
import React, { useEffect, useState } from "react";
import { MessageSquareText } from 'lucide-react';

const ChatBox = () => {

    const [showChatPrompt, setShowChatPrompt] = useState(true)
    const [isOpen, onOpenChange] = useState(false)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent): void => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            // showing the chat open prompt if mouse is within 200px of the screens right and bottom
            if (e.clientX > screenWidth - 200 && e.clientY > screenHeight - 200) {
                setShowChatPrompt(true);
            } else {
                setShowChatPrompt(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [])

    return (
        <main className="z-500">
            {isOpen === false ?
                <button
                    className={
                        `fixed bottom-0 right-0 transition-transform duration-200 ease-in-out z-50 p-4
                            ${showChatPrompt ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={() => onOpenChange(true)}>
                    <div className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-secondary hover:bg-background border ">
                        <MessageSquareText />
                    </div>
                </button> : 
                <div className={
                    `fixed bottom-0 right-0 transition-transform duration-200 ease-in-out z-50 p-4`}>
                    asdf
                </div>
            }
        </main>
    );
};

export default ChatBox;
