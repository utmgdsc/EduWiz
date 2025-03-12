"use client"
import React, {useState} from "react";
import { Loader2 } from "lucide-react";

const VideoLoadingScreen = ({ loadingStatus }: { loadingStatus: string | null }) => {
    
    let rawLoadingPercentage = 0
    let loadingPercentage = 0
    let stage = "Generating . . ."
    let indeterminate = true
    console.log(loadingStatus)
    if (!isNaN(Number(loadingStatus))) {
        indeterminate = false
        rawLoadingPercentage = (Number(loadingStatus))
        loadingPercentage = (Number(loadingStatus) / 100 * 650)
        stage = `Rendering . . . ${rawLoadingPercentage}%`
    }
    if (loadingStatus === "started_generation") { stage = "Generating . . ." }
    else if (loadingStatus === "ended_generation") { stage = "Finished generating" }
    else if (loadingStatus === "ended_rendering") { 
        stage = "Finished Rendering"
        loadingPercentage = 650 
    }
    else if (loadingStatus === "completed") { 
        loadingPercentage = 650 
        stage = "Done!" }

    return (
        <main>
            <div className="flex flex-col gap-4">
                <svg viewBox="0 0 400 400" className="self-center animate-spin" width="200px" height="200px">
                    <circle cx="200" cy="200" fill="none" r="100" strokeWidth="10" stroke="#FFFFFF" 
                    strokeDasharray={`${indeterminate ? '300' : loadingPercentage} 1400`} />
                </svg>
                <label className=" self-center font-mono">{stage}</label>
            </div>
        </main>
    )
}

export default VideoLoadingScreen;