import { useEffect, useState } from "react";
import { Play, Clock, Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Video } from "@/lib/firebase/schema";

// Sample data for demonstration
const sampleVideos = [
    { id: 1, title: "Introduction to Machine Learning", subject: "Computer Science", thumbnail: "https://images.unsplash.com/photo-1544731612-de7f96afe55f?q=80&w=2070" },
    { id: 2, title: "Understanding Photosynthesis", subject: "Biology", thumbnail: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=2089" },
    { id: 3, title: "World War II: Key Events", subject: "History", thumbnail: "https://images.unsplash.com/photo-1581850518616-bcb8077a2336?q=80&w=2070" },
    { id: 4, title: "Solving Quadratic Equations", subject: "Mathematics",thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070" },
    { id: 5, title: "Chemical Reactions Explained", subject: "Chemistry",  thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070" },
    { id: 6, title: "Introduction to Poetry", subject: "Literature",  thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073" },
];

// Popular subject categories
const subjectCategories = [
    "Mathematics", "Science", "History", "Literature", "Computer Science",
    "Physics", "Chemistry", "Biology", "Art", "Music"
];

interface DiscoverSectionProps {
    onVideoSelect: (video: Video) => void;
}

const DiscoverSection = ({ onVideoSelect }: DiscoverSectionProps) => {
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [videosLoading, setVideosLoading] = useState(true)
    const filteredVideos = activeSubject
        ? sampleVideos.filter(video => video.subject === activeSubject)
        : sampleVideos;

    // TODO: create backend api endpoint for videos to retrieve them for this, it should include the following stuff:
    // request videos in batches of up to 6, with certain filters added
    // TODO: improve consistency of styles for buttons and stuff

    useEffect(() => {
        const loadVideos = async () => {
            // send request to backend and then set the messages state variable as needed
            await new Promise((resolve) => setTimeout(resolve, 3000));
            setVideosLoading(false)
        }
        loadVideos()
    }, [])

    const handleVideoClick = (video: Video) => {
        onVideoSelect(video)
    };


    return (
        <div className="bg-zinc-900 rounded-lg p-6 mt-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Discover Educational Videos</h2>

                {/* Subject Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {subjectCategories.map((subject) => (
                        <Button variant={activeSubject === subject ? "default" : "outline"} key={subject} onClick={() => setActiveSubject(activeSubject === subject ? null : subject)}>
                            {subject}
                        </Button>

                    ))}
                </div>

                {/* Filter Bar */}
                {/* TODO: make filter butters more consistent */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-foreground">
                        {filteredVideos.length} videos available
                    </p>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredVideos.map((video) => (
                    <Card
                        key={video.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleVideoClick(video.title)}
                    >
                        <AspectRatio ratio={16 / 9} className="bg-gray-100">
                            {videosLoading ? <Skeleton>

                            </Skeleton> : <>
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100">
                                        <Play className="h-6 w-6 text-blue-600" />
                                    </Button>
                                </div> </>
                            }
                        </AspectRatio>
                        <CardHeader className="p-3 pb-0">
                            {videosLoading ? <Skeleton className="h-5 w-[250px]" ></Skeleton> : <CardTitle className="text-base font-semibold line-clamp-2">{video.title}</CardTitle>}
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                                {videosLoading ? <Skeleton className="h-4 w-[120px]" /> :
                                    <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                                        {video.subject}
                                    </span>
                                }
                            </div>
                        </CardContent>
                    </Card>


                ))}
            </div>

            {/* Pagination */}
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default DiscoverSection;
