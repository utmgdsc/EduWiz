"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Sidesheet } from "@/components/Sidesheet";
import { House, CircleUser, LogOut, Settings } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import ChatBox from "./Chatbox";
import CommandBar from "./CommandBar";

import VideoLoadingScreen from "./VideoLoadingScreen";
import DiscoverSection from "./Discover";

import { realtime } from "@/lib/firebase";
import { S3_CONFIG, S3BucketService } from "@/lib/s3";
import ManimRenderService from "@/lib/ManimRenderService";
import { useAuthorization } from "@/lib/context/auth";

export default function LearnPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuthorization();

    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [finalPrompt, setFinalPrompt] = useState("");
    const [prompt, setPrompt] = useState("");
    const jobIDRef = useRef<string | null>(null);
    const [videoGenerationState, setVideoGenerationState] = useState(0); // 0 = not started, 1 = generating, 2 = completed, -1 = error
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const unsubscribeJobStatus = useRef<() => void | null>(null);
    const videoURLRef = useRef<string | null>(null);

    const s3Bucket = S3BucketService.fromConfig(S3_CONFIG, "uploads");

    // Initialize with search query if provided
    useEffect(() => {
        const query = searchParams.get('query');
        if (query) {
            setPrompt(query);
            // Auto-trigger video generation if coming from landing page
            setTimeout(() => {
                sendPrompt(query);
            }, 500); // Small delay to ensure component is fully loaded
        }
    }, [searchParams]);


    const sendPrompt = async (promptValue = prompt) => {
        if (!user) {
            toast.error("Please sign in to generate videos");
            return;
        }


        try {
            setFinalPrompt(promptValue);
            const id = await ManimRenderService.submitRenderJob(
                promptValue,
                user,
                realtime
            );
            jobIDRef.current = id;

            unsubscribeJobStatus.current = ManimRenderService.subscribeToJobStatus(
                id,
                realtime,
                async (status) => {
                    // Callback function for when status changes
                    setJobStatus(status.status as string);
                    
                    if (ManimRenderService.isJobComplete(status.status as string)) {
                        setVideoGenerationState(2);

                        const videoData = await ManimRenderService.getVideoData(
                            jobIDRef.current as string,
                            user
                        );

                        const url = await s3Bucket.upload(videoData, "videos");
                        setVideoURL(url);
                        videoURLRef.current = url;

                        unsubscribeJobStatus.current!();
                    }
                    
                    if (ManimRenderService.hasJobError(status.status as string)) {
                        toast.error("Error generating video");
                        setVideoGenerationState(-1);
                        unsubscribeJobStatus.current!();
                    }
                }
            );
            setVideoGenerationState(1);
        } catch (error) {
            toast.error("Error generating video");
            setVideoGenerationState(-1);
        }
    };

    const handleVideoSelect = (selectedPrompt: string) => {
        setPrompt(selectedPrompt);
        sendPrompt(selectedPrompt);
    };

    return (
        <main className="h-screen">
            <Sidesheet userID={user?.uid || ""}></Sidesheet>
            <div className="flex flex-col h-full justify-start" style={{ padding: '20px 20px 20px 20px', gap: "10px" }}>
                <div className="flex items-center justify-between">
                    <CommandBar 
                        onGenerate={() => sendPrompt()} 
                        prompt={prompt} 
                        setPrompt={setPrompt} 
                    />
                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="p-2 m-[10px]" variant="outline">
                                    <CircleUser />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 gap-3">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>

                                <DropdownMenuItem onClick={() => window.location.href = "/settings"}>

                                        <Settings />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="bg-red-500 mt-1">
                                        <LogOut />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button 
                            className="p-2 m-[10px]" 
                            variant="outline" 
                            onClick={() => { router.push('/') }}
                        >
                            <House />
                        </Button>
                    </div>
                </div>

                {/* Video section */}
                <div className="flex-1">
                    {videoGenerationState === 0 ? (
                        <DiscoverSection onVideoSelect={handleVideoSelect} />
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full">
                            <p className="p-10 flex items-center text-zinc-200 italic">
                                {finalPrompt}
                            </p>
                            {videoGenerationState === 1 ? (
                                <div className="h-full flex flex-col justify-center">
                                    <VideoLoadingScreen loadingStatus={jobStatus} />
                                </div>
                            ) : videoGenerationState === 2 ? (
                                <video controls className="max-w-full max-h-[70vh]">
                                    <source src={videoURLRef.current as string} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="text-red-500 text-center p-8">
                                    An error occurred while generating your video. Please try again.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {(videoGenerationState === 2) && <ChatBox></ChatBox>}
        </main>
    );
}