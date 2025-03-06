"use client"
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupLabel, SidebarMenuButton } from "@/components/ui/sidebar";
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
            <ScrollArea className="h-full w-full rounded-md border p-4">
                <ul>
                    {results.length > 0 ? (
                        results.map((item, index) => (
                            <li key={index} className="mb-2 flex-col">
                                <SidebarMenuButton 
                                className="h-full"
                                onClick={(e) => {
                                    router.push("/")
                                    {/*TODO: update this so that it pushes to the correct page*/}
                                }}
                                >
                                    <div className="flex-col text-left">
                                        {item.title}
                                        <SidebarGroupLabel>Generated on {item.date.toDateString()}</SidebarGroupLabel>                           
                                    </div>
                                </SidebarMenuButton>
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
