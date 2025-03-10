import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import PreviousChats from "./previousChats"
import { Separator } from "@radix-ui/react-separator";

export function Sidesheet({ userID, isOpen, onOpenChange, }: { userID: string, isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    userID = "asdfadsf"; // TODO: change this later
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Home</SheetTitle>
                </SheetHeader>
                <Separator></Separator>

                {/* TODO: add a list of */}

                <div className="flex flex-col gap-5">
                    <SheetDescription>
                        Previously Viewed
                    </SheetDescription>
                    <PreviousChats userID={userID}></PreviousChats>
                </div>
            </SheetContent>
        </Sheet>
    )
}
