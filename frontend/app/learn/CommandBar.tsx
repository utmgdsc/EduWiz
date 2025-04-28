import { Clapperboard } from "lucide-react"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import React, { useEffect, useState, useRef } from "react";
import { Video } from "@/lib/firebase/schema";

interface SearchResult {
    id: number,
    title: string,
    date: Date
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


const getSearchResults = async (query: string): Promise<Video[]> => {

    /* query for reference
            limit=query.top_k,
        vector_field=query.field,
        query_vector=Vector(query.vector),
        distance_measure=DistanceMeasure[query.distance_measure],
        distance_threshold=query.threshold,
    */

    // vectorizing query
    const vectorResponse = await fetch(`${API_BASE_URL}/vector/embed`,{
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ document: query }),
          });
    const vector = (await vectorResponse.json()).embedding

    // getting videos
    const videosResponse = await fetch(`${API_BASE_URL}/vector/search`,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            field: "embedding", vector: vector, distance_measure: 'EUCLIDEAN', collection: "video"
          }),
      });

    // returning videos
    return await videosResponse.json()
}

const CommandBar = ({ onGenerate, prompt, setPrompt, selectVideo }: { onGenerate: () => void, prompt: any, setPrompt: any, selectVideo: any }) => {
    // TODO: the search result suggestions don't do anything at the moment, change that later
    const [focus, setFocus] = useState(false)
    const [results, setResults] = useState<Video[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const updateSearchResults = async () => {
            setResults(await getSearchResults(prompt));
        }
        if (prompt === "") {
            setResults([])
        } else {
            updateSearchResults();
        }
    }, [prompt])

    const sendInput = () => {
        onGenerate()
        setFocus(false)
        setPrompt("")
        if (inputRef.current) inputRef.current.blur()
    }

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setFocus((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <main>
            {focus && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-40"
                ></div>
            )}
            <div className={`self-center w-full flex justify-center transition-all duration-300 ${focus ? "absolute top-40 z-50 p-2" : ""
                }`}>
                <Command className={`rounded-lg border shadow-md transition-all duration-100 ${focus ? "outline outline-2 outline-blue-500 w-[100vh]" : "w-[60vh]"
                    }`} shouldFilter={false}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                >
                    <CommandInput ref={inputRef} placeholder="Learn something new . . ." value={prompt} onValueChange={(value) => setPrompt(value)} />
                    <CommandList>
                        {
                            (focus === true) ? (
                                <>
                                    <CommandGroup>
                                        <CommandItem onSelect={() => { sendInput() }}>
                                            <Clapperboard />
                                            <span>Generate Video</span>
                                            <CommandShortcut>Enter</CommandShortcut>
                                        </CommandItem>
                                    </CommandGroup>
                                    <CommandSeparator alwaysRender={true}></CommandSeparator>
                                    <CommandGroup>
                                        {
                                            results.map((item, index) => (
                                                <CommandItem key={index} onSelect={() => {
                                                    selectVideo(item)}}>
                                                    <span>{item.context}</span>
                                                    <CommandShortcut>Enter</CommandShortcut>
                                                </CommandItem>
                                            ))
                                        }
                                    </CommandGroup>
                                </>
                            )
                                : null}
                    </CommandList>
                </Command>
            </div>
        </main>
    );
};

export default CommandBar;
