import React from "react";
import { Loader2 } from "lucide-react";

const VideoLoadingScreen = ({ loadingStatus }: { loadingStatus: string | null}) => {
    let stage = "Generating . . ."
    if (loadingStatus === "started_generation") { stage = "Generating . . ." }
    else if (loadingStatus === "ended_generation") { stage = "Finished generating" }
    else if (loadingStatus === "started_rendering") { stage = "Renderingf . . ." }
    else if (loadingStatus === "ended_rendering") { stage = "Finished Rendering" }
    else if (loadingStatus === "completed") { stage = "Done!" }
    return (
        <main>
            <div className="flex flex-col gap-4">
                <Loader2 className=" self-center w-20 h-20 animate-spin" />
                <label className=" self-center font-mono">{stage}</label>
            </div>
        </main>
    )
}

export default VideoLoadingScreen;