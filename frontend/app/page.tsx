"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button"
import React from "react";
import { Textarea } from "@/components/ui/textarea"

export default function Home() {
    return (
        <main>
            {/*TODO: next up make side bar with all chats next?*/}
            {/**/}
            <div>
                <div className="flex flex-col h-screen justify-end" style={{ padding: '20px 20px 20px 20px' }}>
                    <div className="flex items-center" style={{ gap: "10px" }}>
                        <Textarea />
                        <Button className="h-full">Send</Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
