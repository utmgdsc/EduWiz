import { Clapperboard } from "lucide-react"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import React, { useEffect, useState, useRef } from "react";

interface SearchResult {
    id: number,
    title: string,
    date: Date
}

const getSearchResults = async (query: string): Promise<SearchResult[]> => {
    // TODO: THESE ARE MOCK SEARCH RESULTS, THEY WILL NEED TO BE RETURNED
    const s = { id: 12312, title: "Pythogorean theorem", date: new Date() };
    const r = { id: 133, title: "Newton's first law", date: new Date() };
    const t = { id: 9393, title: "Thermodynamics", date: new Date() };
    return [s, r, t];
}

const CommandBar = ({ onGenerate, prompt, setPrompt }: { onGenerate: () => void, prompt: any, setPrompt: any }) => {
    // TODO: the search result suggestions don't do anything at the moment, change that later
    const [focus, setFocus] = useState(false)
    const [results, setResults] = useState<SearchResult[]>([]);
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
                                                <CommandItem key={index}>
                                                    <span>{item.title}</span>
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
