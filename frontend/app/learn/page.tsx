"use client"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import AutoSearch from "./AutoSearch";
import { useSearchParams } from "next/navigation";

export default function Home() {
    const searchParams = useSearchParams();
    const chatID = searchParams.get('id');

    const [prompt, setPrompt] = useState("");
    const [searchMode, setSearchMode] = useState(true);
    // video generation states: 0 = not started, 1 = generated, 2 = completed, -1 = error
    const [videoGenerationState, setVideoGenerationState] = useState(0);

    const sendPrompt = async () => {
        // TODO: implement this function so that it sends a request to the backend API
        setPrompt("");
        setSearchMode(false); // at this point a prompt is sent so the user is no longer, but waiting for video to stream
        setVideoGenerationState(1);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2-second delay
            console.log("two second delay successfully passed");
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setVideoGenerationState(2);
        }
    }

    useEffect(() => {
        if (chatID !== null){ // if user is loading in pre existing chat
            // TODO: load in pre existing chat
        }
    }, [])


    return (
        <main className="h-full">
            {/*textbox and sent button*/}
            <div className="flex flex-col h-full justify-start" style={{ padding: '20px 20px 20px 20px', gap: "20px" }}>
                <div className="flex items-center" style={{ gap: "20px" }}>

                    <Textarea
                        placeholder="What would you like to learn today?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key == "Enter") {
                                e.preventDefault();
                                sendPrompt();
                            }
                        }}
                    />
                    <Button className="h-full" onClick={sendPrompt}>Send</Button>
                </div>

                {/* video placeholder and search suggestions box*/}
                {/* TODO: implement video box here */}
                <div className="rounded-md h-full w-full" >
                    {(searchMode) ? (
                        <AutoSearch query={prompt} />
                    ) : (
                        <div className="flex flex-row h-full w-full" style={{ gap: "20px" }}>
                            <div className="rounded-md border p-4 self-start aspect-video max-h-full w-full">
                                {(videoGenerationState == 1) ?
                                    (<p className="text-black">Video will appear here</p>)
                                    : (<p>video is playing here now</p>)
                                }
                            </div>
                            {/* TODO: CHATBOX GOES HERE*/}
                        </div>
                    )
                    }
                </div>

            </div>
        </main>
    );
}
