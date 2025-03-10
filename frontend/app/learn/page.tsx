"use client"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import AutoSearch from "./AutoSearch";
import { useSearchParams } from "next/navigation";
import { Sidesheet } from "@/components/Sidesheet";

import { useRouter } from 'next/navigation'

const videoExists = async(videoID: string | null) => {
    // TODO: return true if the video exists, false otherwise
    return true;
}

export default function Home() {
    const router = useRouter()
    const searchParams = useSearchParams();
    var videoID = searchParams.get('id'); //TODO: use this later to allow users to view already-made videos, this is same as job id
    const [pageLoading, setPageLoading] = useState(false)

    const [prompt, setPrompt] = useState("");
    const [searchMode, setSearchMode] = useState(true);
    const [videoGenerationState, setVideoGenerationState] = useState(0); // 0 = not started, 1 = generating, 2 = completed, -1 = error
    const [sideSheetShowing, setSideSheetShowing] = useState(false);

    const [videoURL, setVideoURL] = useState<null | string>(null)
    
    const sendPrompt = async () => {
        setSearchMode(false); // at this point a prompt is sent so the user is waiting for video to stream
        try {
            setVideoGenerationState(1);
            let newVideoID = "asdfasdfasdf" // TODO: send video generation prompt to server and get job ID
            setVideoURL(newVideoID) 
            router.push(`/learn/?id=${newVideoID}`);    
        } catch (error) {
            setVideoGenerationState(0);
            console.error("Error sending prompt to server", error);
        } finally {
            setVideoGenerationState(2);
        }
    }

    const getVideoURL = async() => {
        // TODO: get video URL from the video ID
        return ""
    }

    useEffect(() => {

    }, [])

    useEffect(() => {
        // setting up the page based on whether or not it's for an existing video or a new one
        const setupPage = async () => {
            const validVideoID = await videoExists(videoID)
            if (validVideoID) {  //if valid video id, load in page with that video id
                // TODO: set appropriate video url, set video generation state to complete
                // TODO: set the text prompt
                console.log("valid video url")
                setVideoURL(await getVideoURL());
            }  else if (validVideoID === false){
                // TODO: if video id is invalid, show not found page
            }
            // do nothing if there is no valid video id provided
        }
        setupPage();
    }, [])


    return (
        <main className="h-full">
            <Sidesheet userID="asdfasdf" isOpen={sideSheetShowing} onOpenChange={setSideSheetShowing}></Sidesheet>

            {/*textbox and sent button*/}
            <div className="flex flex-col h-full justify-start" style={{ padding: '20px 20px 20px 20px', gap: "20px" }}>
                <div className="flex flex-row items-stretch" style={{ gap: "20px" }}>
                    <div>
                        <Button className="h-full" onClick={() => { setSideSheetShowing(true) }}>Open Sidebar</Button>
                    </div>
                    <Textarea
                        placeholder="What would you like to learn today?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        id="prompt-field"
                        onKeyDown={(e) => {
                            if (e.key == "Enter") {
                                e.preventDefault();
                                sendPrompt();
                            }
                        }}
                    />
                    <div>
                        <Button className="h-full" onClick={sendPrompt} id="send-button">Send</Button>
                    </div>
                </div>

                {/* video placeholder and search suggestions box*/}
                <div className="rounded-md" >
                    {(searchMode) ? (
                        <AutoSearch query={prompt} />
                    ) : (
                        <div className="rounded-md border p-4">
                            {(videoGenerationState == 1) ?
                                (<p className="text-black">Video will appear here</p>)
                                : (
                                    (<p className="text-black">Video will appear here</p>)
                                )
                            }
                        </div>
                    )
                    }
                </div>

            </div>
        </main>
    );
}
