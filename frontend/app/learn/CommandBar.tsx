import { Clapperboard } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import React, { useEffect, useState } from "react";

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

const CommandBar = ({onGenerate, prompt, setPrompt}: {onGenerate: () => void, prompt: any, setPrompt: any}) => {
    const [focus, setFocus] = useState(false)
    const [results, setResults] = useState<SearchResult[]>([]);

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
        setPrompt("")
    }

    return (
        <main>
            <Command className={`rounded-lg border shadow-md transition-all duration-100 ${focus ? "outline outline-2 outline-blue-500 w-[100vh]" : "w-[60vh]"
                }`} shouldFilter={false}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
            >
                <CommandInput placeholder="Learn something new . . ." value={prompt} onValueChange={(value) => setPrompt(value)} onKeyDown={(event) => {
                    if (event.key === "Enter"){sendInput()}
                }} />
                <CommandList>
                    {
                        (focus === true) ? (
                            <>
                                <CommandGroup>
                                    <CommandItem onClick={() => {sendInput}}>
                                        <Clapperboard />
                                        <span>Generate Video</span>
                                        <CommandShortcut>Enter</CommandShortcut>
                                    </CommandItem>
                                </CommandGroup>
                                <CommandGroup>
                                    {
                                        results.map((item, index) => (
                                            <CommandItem key={index}>
                                                <span>{item.title}</span>
                                            </CommandItem>
                                        ))
                                    }
                                </CommandGroup>
                            </>
                        )
                            : null}
                </CommandList>
            </Command>
        </main>
    );
};

export default CommandBar;
