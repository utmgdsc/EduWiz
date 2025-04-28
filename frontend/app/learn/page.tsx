"use client";
import React, { useEffect, useState, useRef } from "react";
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

import ChatBox from "./Chatbox";
import CommandBar from "./CommandBar";

import VideoLoadingScreen from "./VideoLoadingScreen";
import DiscoverSection from "./Discover";

import { firestore, realtime } from "@/lib/firebase";
import { S3_CONFIG, S3BucketService } from "@/lib/s3";
import ManimRenderService from "@/lib/ManimRenderService";
import { useAuthorization } from "@/lib/context/auth";

import { createVideo } from "@/lib/firebase/video";
import { Video, RENDER_STATUS, Chat } from "@/lib/firebase/schema";
import { createChat, getChat, updateChat } from "@/lib/firebase/chat";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
    const { user, loading: userLoading, SignOutUser } = useAuthorization();
    const router = useRouter();
    const searchParams = useSearchParams();

    const hasSearchedRef = useRef(false);
    const [prompt, setPrompt] = useState("");
    const jobIDRef = useRef<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const unsubscribeJobStatus = useRef<() => void | null>(null);
    const [videoGenerationState, setVideoGenerationState] = useState(0); // 0 = not started, 1 = generating, 2 = completed, -1 = error
    const videoURLRef = useRef<string | null>(null);
    const chatDocIDRef = useRef<null | string>(null);
    const [finalPrompt, setFinalPrompt] = useState("");

    const s3Bucket = S3BucketService.fromConfig(S3_CONFIG, "uploads");

    const promptRef = useRef<string>("");

    useEffect(() => {
        const query = searchParams.get('query');
        if (query && !hasSearchedRef.current) {
            hasSearchedRef.current = true;
            setPrompt(query);
            setFinalPrompt(query);
            promptRef.current = query;
            setTimeout(() => {
                sendPrompt();
            }, 500);
        }
    }, [searchParams]);

    const sendPrompt = async () => {
        if (!user) return;
        try {
            console.log(promptRef.current);
            const id = await ManimRenderService.submitRenderJob(
                promptRef.current,
                user,
                realtime
            );
            jobIDRef.current = id;

            unsubscribeJobStatus.current = ManimRenderService.subscribeToJobStatus(
                id,
                realtime,
                async (status) => {
                    setJobStatus(status.status as string);
                    if (ManimRenderService.isJobComplete(status.status as string)) {
                        setVideoGenerationState(2);

                        const videoData = await ManimRenderService.getVideoData(
                            jobIDRef.current as string,
                            user
                        );
                        const url = await s3Bucket.upload(videoData, "videos");
                        unsubscribeJobStatus.current!();
                        videoURLRef.current = url;

                        const video: Omit<Video, "id"> = {
                            video_url: url,
                            context: promptRef.current,
                            created_at: new Date(),
                            status: RENDER_STATUS.COMPLETE,
                            embedding: [1, 2, 3, 4],
                        };
                        const videoDocRef = await createVideo(video);
                        await updateChat(chatDocIDRef.current!, { video: { id: videoDocRef.id, ...video } });
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
        }
    };

    const createNewChat = async () => {
        if (!user) return;

        setFinalPrompt(prompt);
        promptRef.current = prompt; // <-- update promptRef
        const chat: Omit<Chat, "id" | "video" | "created_at"> = {
            user_id: user!.uid,
            prompt: prompt,
            conversation: [],
        };
        chatDocIDRef.current = (await createChat(chat))!.id;
        await updateChat(chatDocIDRef.current, { id: chatDocIDRef.current });
        await sendPrompt();
    };

    const handleVideoSelect = (selectedPrompt: string) => {
        // handle selecting existing videos (not implemented here yet)
    };

    useEffect(() => {
        const setupPage = async () => {
            const chatParamID = searchParams.get("id");
            if (chatParamID === null) return;
            const loadedChat = await getChat(chatParamID, user!.uid);
            if (loadedChat === null) return;

            chatDocIDRef.current = chatParamID;
            setFinalPrompt(loadedChat.prompt);
            promptRef.current = loadedChat.prompt; // <-- update promptRef

            if (loadedChat.video !== null) {
                setVideoGenerationState(2);
                videoURLRef.current = loadedChat.video.video_url;
            } else {
                await sendPrompt();
            }
        };

        if (userLoading) return;
        if (!user) router.push("/login");
        setupPage();
    }, [searchParams, userLoading]);

    return (
        <main className="h-screen">
            <Sidesheet user={user!} />

            <div className="flex flex-col h-full justify-start p-5 gap-3">
                <div className="flex items-center justify-between">
                    <CommandBar onGenerate={createNewChat} prompt={prompt} setPrompt={setPrompt} />
                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="p-2 m-2" variant="outline">
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
                                    <DropdownMenuItem className="bg-red-500 mt-1" onClick={SignOutUser}>
                                        <LogOut />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button className="p-2 m-2" variant="outline" onClick={() => { window.location.href = "/learn" }}>
                            <House />
                        </Button>
                    </div>
                </div>

                {/* Video Section */}
                <div>
                    {videoGenerationState === 0 ? (
                        <DiscoverSection onVideoSelect={handleVideoSelect} />
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full">
                            {videoGenerationState === 1 ? (
                                <div className="h-full flex flex-col justify-center">
                                    <VideoLoadingScreen loadingStatus={jobStatus} />
                                </div>
                            ) : (
                                <video controls>
                                    <source src={videoURLRef.current as string} type="video/mp4" />
                                </video>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {videoGenerationState === 2 && <ChatBox chatDocID={chatDocIDRef.current!} />}
        </main>
    );
}
