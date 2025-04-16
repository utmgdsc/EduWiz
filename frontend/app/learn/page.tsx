"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

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

import { realtime } from "@/lib/firebase";
import { S3_CONFIG, S3BucketService } from "@/lib/s3";
import ManimRenderService from "@/lib/ManimRenderService";
import { useAuthorization } from "@/lib/context/auth";

import { useAuthorization } from "@/lib/context/auth";


export default function Home() {
  const router = useRouter();
  const { user } = useAuthorization();

  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState("")
  const [prompt, setPrompt] = useState("");
  const jobIDRef = useRef<string | null>(null);
  const [videoGenerationState, setVideoGenerationState] = useState(0); // 0 = not started, 1 = generating, 2 = completed, -1 = error
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const unsubscribeJobStatus = useRef<() => void | null>(null);


  const videoURLRef = useRef<string | null>(null)

  const s3Bucket = S3BucketService.fromConfig(S3_CONFIG, "uploads");

  const sendPrompt = async () => {
    if (!user) return;
    try {
      // TODO: un comment lines below if they are commented
      setFinalPrompt(prompt)
      const id = await ManimRenderService.submitRenderJob(
        prompt,
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

            const videoData = await ManimRenderService.getVideoData(
              jobIDRef.current as string,
              user
            );

            const url = await s3Bucket.upload(videoData, "videos");
            setVideoURL(url);

            unsubscribeJobStatus.current!();
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
      // TODO: remove this, it is only here now for testing purposes
      //videoURLRef.current = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
      //setVideoGenerationState(2);
    }
  };


    const handleVideoSelect = (selectedPrompt: string) => {
        // TODO: implement logic ot send user to a video
    };

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
            <div className="flex flex-col h-full justify-start" style={{ padding: '20px 20px 20px 20px', gap: "10px" }}>

                <div className="flex items-center justify-between">
                    <CommandBar onGenerate={() => { sendPrompt() }} prompt={prompt} setPrompt={setPrompt} />
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

                        <Button className="p-2 m-[10px]" variant="outline" onClick={() => { window.location.reload() }}>
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
                                    <p className="p-10 flex items-center text-zinc-200 italic">
                                        {finalPrompt}
                                    </p>
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
            {(videoGenerationState === 2) && <ChatBox></ChatBox>}

        </main>
    );
}
