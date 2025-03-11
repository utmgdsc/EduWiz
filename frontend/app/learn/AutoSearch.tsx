"use client"
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

const AutoSearch = ({ query }: { query: string }) => {
    const [results, setResults] = useState<SearchResult[]>([]);
    const router = useRouter();

    useEffect(() => {
        const updateSearchResults = async () => {
            setResults(await getSearchResults(query));
        }
        updateSearchResults();
    }, [query])

    return (
        <main className="h-full">
            <ScrollArea className="h-full w-full">
                <ul>
                    {results.length > 0 ? (
                        results.map((item, index) => (
                            <li key={index} className="mb-2">
                                <Button
                                    className="h-full w-full justify-start bg-secondary text-foreground hover:bg-background border"
                                    onClick={(e) => {
                                        router.push("/")
                                        {/*TODO: update this so that it pushes to the correct page*/ }
                                    }}
                                >
                                    <div className="flex flex-col text-left">
                                        <label className="font-bold text-lg">{item.title}</label>
                                        <label className="font-normal font-mono text-gray-400">Generated on {item.date.toDateString()}</label>
                                    </div>
                                </Button>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-500">No results found</p>
                    )}
                </ul>
            </ScrollArea>
        </main>
    );
};

export default AutoSearch;
