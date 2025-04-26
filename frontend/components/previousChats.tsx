"use client"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useChats } from "@/hooks/useChats";
import { User } from "@firebase/auth";
import { Chat } from "@/lib/firebase/schema";

const PreviousChats = ({ user}: { user: User }) => {
    const [previousChats, setPreviousChats] = useState<Chat[]>([]);
    const {chats, loading, error} = useChats(user)
    const router = useRouter();

    useEffect(() => {
        if (loading === false && chats !== undefined){
            setPreviousChats(chats!)
        }
    }, [loading])

    return (
        <main className="h-full">
            <ScrollArea className="h-full w-full">
                <ul>
                    {
                        previousChats.map((item, index) => (
                            <li key={index} className="mb-2">
                                {
                                    <Button
                                        className="h-full w-full justify-start bg-secondary text-foreground hover:bg-background border"
                                        onClick={() => {
                                            router.push(`/learn?id=${item.id}`)
                                        }}>
                                        {item.prompt}
                                    </Button>

                                }
                            </li>
                        ))
                    }
                </ul>
            </ScrollArea>
        </main>
    )
}

export default PreviousChats