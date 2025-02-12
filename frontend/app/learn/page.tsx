"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button"
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import AutoSearch from "./AutoSearch";

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [searchMode, setSearchMode] = useState(true);
    // video generation states: 0 = not started, 1 = generated, 2 = completed, -1 = error
    const [videoGenerationState, setVideoGenerationState] = useState(0);

    const sendPrompt = async () => {
        // implement this function so that it sends a request to the backend API
        console.log("prompt sent");
        setPrompt("");
        setSearchMode(false); // at this point a prompt is sent so the user is no longer, but waiting for video to stream
        
        setVideoGenerationState(1);
        // TODO: LOGIC TO GENERATE VIDEO GOES HERE
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2-second delay
            console.log("two second delay successfully passed");
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setVideoGenerationState(2);
        }

    }
    return (
        <main className="h-full">

            {/*textbox and sent button*/}
            <div className="flex flex-col h-full justify-start" style={{ padding: '20px 20px 20px 20px', gap: "20px" }}>
                <div className="flex items-center" style={{ gap: "20px" }}>
                    <Button className="h-full">Chats</Button>
                    <Textarea 
                        placeholder = "What would you like to learn today?"
                        value = {prompt}
                        onChange = {(e) => setPrompt(e.target.value)}
                        onKeyDown = {(e) => {
                            if (e.key == "Enter"){
                                e.preventDefault();
                                sendPrompt();
                            }
                        }}
                        />
                    <Button className="h-full" onClick={sendPrompt}>Send</Button>
                </div>

                {/* video placeholder and search suggestions box*/}
                {/* TODO: implement video box there*/}
                <div className="rounded-md h-full w-full" >
                    {(searchMode) ? (
                        <AutoSearch query={prompt}/>
                    ) : (
                        (videoGenerationState == 1) ? 
                            (<div className="bg-gray-200">
                                <p className="text-black-500">Video will appear here</p>
                            </div>) : (
                            <div>
                                <p>video is playing here now</p>
                            </div>)
                    )}
                </div>
                
            </div>
        </main>
    );
}
