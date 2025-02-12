import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button";

interface SearchResult {
    title: string,
    id: number
}

const getSearchResults = (query: string): SearchResult[] => {
    // THESE ARE MOCK SEARCH RESULTS, THEY WILL NEED TO BE RETURNED
    console.log("updating search results");
    const s = {title: "asdfasdf", id: 12312};
    return [s];
}

const AutoSearch = ({ query }: {query: string}) => {

    // THESE ARE JUST MOCK RESULTS, THESE WILL LATER BE REPLACED BY ACTUAL RESULTS
    const results = getSearchResults(query);

    return (
        <main className="h-full">
            <ScrollArea className="h-full w-full rounded-md border p-4">
                <ul>
                    {results.length > 0 ? (
                        results.map((item, index) => (
                            <li key={index} className="p-1 border-b last:border-none">
                                <Button className="w-full">
                                    {item.title}
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
