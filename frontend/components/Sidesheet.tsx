import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import PreviousChats from "./previousChats"
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { SquarePen, CircleUser, ChevronRight } from 'lucide-react';
import { useEffect, useState } from "react";

export function Sidesheet({ userID}: { userID: string}) {
    userID = "asdfadsf"; // TODO: change this later
    const [showSidesheetPrompt, setShowSidesheetPrompt] = useState(false)
    const [isOpen, onOpenChange] = useState(false)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setShowSidesheetPrompt(e.clientX < 50)
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    })

    return (
        <main>

            {/*button to show the sidebar prompt  ${showSidesheetPrompt ? "translate-x-0" : "-translate-x-full}*/}
            <button
                className={
                    `fixed top-1/2 left-0 transition-transform duration-200 ease-in-out z-50 p-4
                        ${showSidesheetPrompt ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={() => onOpenChange(true)}>
                <div className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-secondary hover:bg-background border ">
                    <ChevronRight />
                </div>
            </button>


            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>Home</SheetTitle>
                    </SheetHeader>

                    {/* TODO: add a list of */}
                    <div className="flex flex-col gap-3">
                        <div>
                            <Button className="h-full w-full justify-start bg-secondary text-foreground hover:bg-background border mt-2 mb-2">
                                <CircleUser />
                                Account
                            </Button>
                            <Button className="h-full w-full justify-start bg-secondary text-foreground hover:bg-background border">
                                <SquarePen></SquarePen>
                                Feedback
                            </Button>
                        </div>
                        <Separator></Separator>
                        <SheetDescription>
                            Previously Viewed
                        </SheetDescription>
                        <PreviousChats userID={userID}></PreviousChats>
                    </div>
                </SheetContent>
            </Sheet>
        </main>
    )
}
