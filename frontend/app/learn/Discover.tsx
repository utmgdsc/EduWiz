import { useState } from "react";
import { Search, Play, Clock, Bookmark, Filter, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Sample data for demonstration
const sampleVideos = [
    { id: 1, title: "Introduction to Machine Learning", subject: "Computer Science", duration: "10:25", views: 1250, thumbnail: "https://images.unsplash.com/photo-1544731612-de7f96afe55f?q=80&w=2070" },
    { id: 2, title: "Understanding Photosynthesis", subject: "Biology", duration: "8:15", views: 980, thumbnail: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=2089" },
    { id: 3, title: "World War II: Key Events", subject: "History", duration: "15:40", views: 2450, thumbnail: "https://images.unsplash.com/photo-1581850518616-bcb8077a2336?q=80&w=2070" },
    { id: 4, title: "Solving Quadratic Equations", subject: "Mathematics", duration: "12:10", views: 1870, thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070" },
    { id: 5, title: "Chemical Reactions Explained", subject: "Chemistry", duration: "9:55", views: 1560, thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070" },
    { id: 6, title: "Introduction to Poetry", subject: "Literature", duration: "7:30", views: 920, thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073" },
];

// Popular subject categories
const subjectCategories = [
    "Mathematics", "Science", "History", "Literature", "Computer Science",
    "Physics", "Chemistry", "Biology", "Art", "Music"
];

interface DiscoverSectionProps {
    onVideoSelect: (prompt: string) => void;
}

const DiscoverSection = ({ onVideoSelect }: DiscoverSectionProps) => {
    const [activeSubject, setActiveSubject] = useState<string | null>(null);

    // TODO: create useEffect functionality with loading screen
    // TODO: create backend api endpoint for videos to retrieve them for this, it should include the following stuff:
        // request videos in batches of up to 6, with certain filters added
    // TODO: improve consistency of styles for buttons and stuff
    // TODO: fix the pagination 
    const handleVideoClick = (title: string) => {
        onVideoSelect(`Show me a video about ${title}`);
    };

    // Filter videos based on active subject
    const filteredVideos = activeSubject
        ? sampleVideos.filter(video => video.subject === activeSubject)
        : sampleVideos;

    return (
        <div className="bg-zinc-900 rounded-lg p-6 mt-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Discover Educational Videos</h2>

                {/* Subject Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {subjectCategories.map((subject) => (
                        <Button variant="outline" key={subject} onClick={() => setActiveSubject(activeSubject === subject ? null : subject)}>
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
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100">
                                    <Play className="h-6 w-6 text-blue-600" />
                                </Button>
                            </div>
                        </AspectRatio>
                        <CardHeader className="p-3 pb-0">
                            <CardTitle className="text-base font-semibold line-clamp-2">{video.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                                <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                                    {video.subject}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="p-3 pt-0 flex justify-between items-center text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{video.duration}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation();
                                // Handle bookmark functionality
                            }}>
                                <Bookmark className="h-4 w-4" />
                            </Button>
                        </CardFooter>
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
