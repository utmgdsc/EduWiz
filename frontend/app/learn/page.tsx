"use client"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea"
import AutoSearch from "./AutoSearch";
import VideoLoadingScreen from "./VideoLoadingScreen";
import { Sidesheet } from "@/components/Sidesheet";
import { useRouter } from 'next/navigation'
import ManimRenderService from "@/lib/ManimRenderService";
import { Send, Clapperboard } from 'lucide-react';



export default function Home() {
    const router = useRouter()

    const [prompt, setPrompt] = useState("");
    const jobIDRef = useRef<string | null>(null)
    const [videoGenerationState, setVideoGenerationState] = useState(0); // 0 = not started, 1 = generating, 2 = completed, -1 = error
    const jobStatusRef = useRef<string | null>(null)
    const [jobStatus, setJobStatus] = useState<string | null>(null)
    const unsubscribeJobStatus = useRef<() => void | null>(null)

    const videoURLRef = useRef<string | null>(null)

    const sendPrompt = async () => {
        try {
            // TODO: un comment lines below if they are commented
            
            const id = await ManimRenderService.submitRenderJob(prompt)
            jobIDRef.current = id
            
            unsubscribeJobStatus.current = ManimRenderService.subscribeToJobStatus(id, (status) => {
                // callback function for when status changes
                setJobStatus(status.status as string)
                if (ManimRenderService.isJobComplete(status.status as string)) {
                    setVideoGenerationState(2)
                    videoURLRef.current = ManimRenderService.getVideoUrl(jobIDRef.current as string)
                    unsubscribeJobStatus.current!()
                }
                if (ManimRenderService.hasJobError(status.status as string)) {
                    setVideoGenerationState(-1)
                    unsubscribeJobStatus.current!()
                }
            })
            setVideoGenerationState(1)
        } catch (error) {
            setVideoGenerationState(0);
            console.error("Error sending prompt to server", error);
        } finally {
            // TODO: remove this, it is only here now for testing purposes
            //videoURLRef.current = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
            //setVideoGenerationState(2);
        }
    }


    useEffect(() => {
        // setting up the page based on whether or not it's for an existing video or a new one
        const setupPage = async () => {
            // TODO: setup page if a video id was already provided, load in that video
            /*
            const validVideoID = await videoExists(videoID)
            if (validVideoID) {

            }  else if (validVideoID === false){

            }
            // do nothing if there is no valid video id provided
            */
        }
        //setupPage();
    }, [])

    return (
        <main className="h-screen">
            <Sidesheet userID="asdfasdf"></Sidesheet>

            {/*textbox and sent button*/}
            <div className="flex flex-col h-full justify-start" style={{ padding: '20px 20px 20px 20px', gap: "10px" }}>
                <div className="flex flex-row items-stretch" style={{ gap: "10px" }}>
                    <div>
                        <Button className="h-full" onClick={() => {
                            console.log("asdfds")
                            window.location.reload()
                            }}>
                                <Clapperboard />
                                New Video
                        </Button>
                    </div>
                    <Textarea
                        className="font-mono"
                        placeholder="What would you like to learn today?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        id="prompt-field"
                        disabled={videoGenerationState !== 0}
                        onKeyDown={(e) => {
                            if (e.key == "Enter") {
                                e.preventDefault();
                                sendPrompt();
                            }
                        }}
                    />
                    <div>
                        <Button className="h-full"
                            onClick={sendPrompt} id="send-button"
                            disabled={videoGenerationState !== 0}
                        ><Send /></Button>
                    </div>
                </div>

                {/* video placeholder and search suggestions box*/}
                {
                    // TODO: change loadingStatus to actually be the loading status here
                    (videoGenerationState === 0) ? (
                        <AutoSearch query={prompt} />
                    ) : (videoGenerationState === 1) ? (
                        <div className="h-full flex flex-col justify-center">
                            <VideoLoadingScreen loadingStatus={jobStatus} />
                        </div>
                        
                    ) : ( videoGenerationState === 2) ? (
                            <video controls>
                                <source src={videoURLRef.current as string} type="video/mp4" />
                            </video> ) : <p>Error</p>
                }

            </div>
        </main>
    );
}
