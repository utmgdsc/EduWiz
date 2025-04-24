"use client";
import React, { useEffect, useState, useRef } from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu"
import ChatBox from "./Chatbox";
import DiscoverSection from "./Discover";
import CommandBar from "./CommandBar";
import VideoLoadingScreen from "./VideoLoadingScreen";

import { firestore, realtime } from "@/lib/firebase";
import { S3_CONFIG, S3BucketService } from "@/lib/s3";
import ManimRenderService from "@/lib/ManimRenderService";

import { useAuthorization } from "@/lib/context/auth";
import { createVideo } from "@/lib/firebase/video";
import { Video, RENDER_STATUS, Chat, LLMMessage } from "@/lib/firebase/schema";
import { CHAT_COLLECTION_NAME, createChat, getChat, updateChat } from "@/lib/firebase/chat";
import { doc, DocumentReference, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
    const { user, loading: userLoading, SignOutUser } = useAuthorization();

    const router = useRouter();
    const searchParams = useSearchParams()
    var chatParamID = searchParams.get("id")

    const [prompt, setPrompt] = useState("");
    const jobIDRef = useRef<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const unsubscribeJobStatus = useRef<() => void | null>(null);

    const [videoGenerationState, setVideoGenerationState] = useState(0); // 0 = not started, 1 = generating, 2 = completed, -1 = error

    const videoURLRef = useRef<string | null>(null)
    const chatDocIDRef = useRef<null | string>(null)
    const [finalPrompt, setFinalPrompt] = useState("")

    const s3Bucket = S3BucketService.fromConfig(S3_CONFIG, "uploads");

    const sendPrompt = async () => {

        if (!user) return;
        try {
            const id = await ManimRenderService.submitRenderJob(
                finalPrompt,
                user,
                realtime
            );
            jobIDRef.current = id;

            unsubscribeJobStatus.current = ManimRenderService.subscribeToJobStatus(
                id,
                realtime,
                async (status) => {
                    // callback function for when status changes
                    setJobStatus(status.status as string);
                    if (ManimRenderService.isJobComplete(status.status as string)) {
                        setVideoGenerationState(2);

                        // getting video url, setting as current video
                        const videoData = await ManimRenderService.getVideoData(
                            jobIDRef.current as string,
                            user
                        );
                        const url = await s3Bucket.upload(videoData, "videos");
                        unsubscribeJobStatus.current!();
                        videoURLRef.current = url

                        // adding video to database (video collection and to chat document)
                        const video: Omit<Video, "id"> = {
                            video_url: url,
                            context: prompt,
                            created_at: new Date(),
                            status: RENDER_STATUS.COMPLETE,
                            embedding: [1, 2, 3, 4]
                        }
                        const videoDocRef = await createVideo(video)
                        updateChat(chatDocIDRef.current!, { video: { id: videoDocRef.id, ...video } })  // adding video to the chat document

                    }
                    if (ManimRenderService.hasJobError(status.status as string)) {
                        toast.error("Error generating video");
                        setVideoGenerationState(0);
                        unsubscribeJobStatus.current!();
                    }
                }
            );
            setVideoGenerationState(1);
        } catch (error) {
            toast.error("Error generating video");
            setVideoGenerationState(0);
        } finally {
            // below exist for testing purposes, ensure they are commented out before running
            
            /*
            var url = "asdf"
            const video: Omit<Video, "id"> = {
                video_url: url,
                context: finalPrompt,
                created_at: new Date(),
                status: RENDER_STATUS.COMPLETE,
                embedding: [1, 2, 3, 4]
            }
            const videoDocRef = await createVideo(video) // adding video to database

            updateChat(chatDocIDRef.current!, { video: { id: videoDocRef.id, ...video } })  // adding video to the chat document
            videoURLRef.current = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
            setVideoGenerationState(2);*/
            
        }
    };

    const createNewChat = async () => {
        if (!user) return;
        
        // creating chat
        setFinalPrompt(prompt)
        const chat: Omit<Chat, "id" | "video" | "created_at"> = {
            user_id: user!.uid,
            prompt: prompt,
            conversation: []
        }
        chatDocIDRef.current = (await createChat(chat))!.id
        await updateChat(chatDocIDRef.current, {id: chatDocIDRef.current})
        await sendPrompt() // generate video
    }

    const handleVideoSelect = (selectedPrompt: string) => {
        /* logic to send user to an existing video
            first check if a chat exists with this video already, if so load in that chat
            if no chat exists with this video, create a new chat with this video, send user to that chat
        */
    };

    useEffect(() => {
        const setupPage = async () => {
            chatParamID = searchParams.get("id")
            if (chatParamID === null) return
            const loadedChat = await getChat(chatParamID, user!.uid)
            if (loadedChat === null) return

            // if valid chat id provided
            chatDocIDRef.current = chatParamID
            setFinalPrompt(loadedChat.prompt)

            // if video already exists in chat display it
            if (loadedChat.video !== null){
                setVideoGenerationState(2)
                videoURLRef.current = loadedChat.video.video_url
            }
            // if video does not exist in the chat, start creating it
            else{
                await sendPrompt()
            }
        }
        if (userLoading) return
        if (!user) router.push("/login")
        setupPage();
    }, [searchParams, userLoading])

    return (
        <main className="h-screen">
        
            <Sidesheet user={user!}></Sidesheet>
            
            <div className="flex flex-col h-full justify-start" style={{ padding: '20px 20px 20px 20px', gap: "10px" }}>

                <div className="flex items-center justify-between">
                    <CommandBar onGenerate={() => { createNewChat() }} prompt={prompt} setPrompt={setPrompt} />
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
                                    <DropdownMenuItem>
                                        <Settings />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="bg-red-500 mt-1" onClick={SignOutUser}>
                                        <LogOut />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button className="p-2 m-[10px]" variant="outline" onClick={() => { window.location.href = "/learn" }}>
                            <House />
                        </Button>
                    </div>
                </div>

                {/* video placeholder and search suggestions box*/}
                <div>
                    {
                        (videoGenerationState === 0) ?
                            <DiscoverSection onVideoSelect={handleVideoSelect} />
                            : (
                                <div className="flex flex-col items-center justify-center w-full">
                                    {
                                        (videoGenerationState == 1) ? (
                                            <div className="h-full flex flex-col justify-center">
                                                <VideoLoadingScreen loadingStatus={jobStatus} />
                                            </div>

                                        ) : (
                                            <video controls>
                                                <source src={videoURLRef.current as string} type="video/mp4" />
                                            </video>
                                        )
                                    }
                                </div>
                            )
                    }
                </div>
            </div>
            {(videoGenerationState === 2) && <ChatBox chatDocID={chatDocIDRef.current!}></ChatBox>}

        </main>
    );
}
