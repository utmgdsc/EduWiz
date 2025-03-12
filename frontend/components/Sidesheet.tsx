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
import { SquarePen, CircleUser } from 'lucide-react';

export function Sidesheet({ userID, isOpen, onOpenChange, }: { userID: string, isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    userID = "asdfadsf"; // TODO: change this later
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Home</SheetTitle>
                </SheetHeader>

                {/* TODO: add a list of */}


                <div className="flex flex-col gap-3">
                    <div>
                        <Button className="h-full w-full justify-start bg-secondary text-foreground hover:bg-background border mt-2 mb-2">
                            <CircleUser/>
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
    )
}
