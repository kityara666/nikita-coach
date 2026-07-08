import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
    Carousel, 
    CarouselContent, 
    CarouselItem, 
    CarouselPrevious, 
    CarouselNext 
} from "@/components/ui/carousel";

import noobaccount from '../img/mega-noob-account.png';
import mediumaccount from '../img/noob-account.png';
import bossaccount from '../img/boss-account.png';

const projects = [
    {
        title: "Before Coaching (Herald - Guardian)",
        shortDesc: "Macro-game chaos and low win rate.",
        fullDesc: "Profile with around a 45% win rate. Random hero pool, lost lanes, lack of understanding of personal mistakes, and zero map control throughout the game.",
        image: noobaccount
    },
    {
        title: "Progress (Archon - Ancient)",
        shortDesc: "Confident laning and solid hero pool.",
        fullDesc: "Win rate increased to 55%+. Built a reliable pool of 3-4 signature heroes. Perfected the laning stage, creep aggro, farming timings, and positioning in team fights.",
        image: mediumaccount
    },
    {
        title: "Result (Immortal)",
        shortDesc: "Reaching the high-MMR bracket.",
        fullDesc: "Consistent gameplay with high impact in every match. Deep understanding of drafts, win conditions, and macro movements. The coveted Immortal rank has been achieved!",
        image: bossaccount
    }
];

export function ProjectCarousel() {
    const [activeProject, setActiveProject] = useState<typeof projects[0] | null>(null);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActiveProject(null);
            }
        };

        if (activeProject) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeProject]);

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-10">
            <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                    {projects.map((p) => (
                        <CarouselItem key={p.title} className="flex flex-col items-center">
                            <h2 className="text-3xl font-bold mb-4 text-violet-400">{p.title}</h2>
                            <img 
                                src={p.image} 
                                alt={p.title} 
                                onClick={() => setActiveProject(p)}
                                className="w-full h-96 object-contain object-center cursor-pointer"
                            />
                            <p className="mt-2 text-violent-600">{p.shortDesc}</p>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

            {activeProject && (
                <div className="fixed inset-0 bg-zinc-950/90 z-50 flex items-center justify-center">
                    <Button 
                        onClick={() => setActiveProject(null)} 
                        variant='ghost'
                        size="lg" 
                        className="absolute right-2 top-2"
                    >
                        &times;
                    </Button>

                    <div className="relative shadow-2xl p-6 rounded-3xl max-w-4xl w-11/12 bg-zinc-900 text-center">
                        <div className="relative flex items-center justify-center px-16">
                            <img 
                                src={activeProject.image} 
                                alt={activeProject.title} 
                                className="max-w-full h-96 object-contain rounded-xl mx-auto" 
                            />
                        </div>

                        <div className="mt-4">
                            <h3 className="text-2xl font-bold mb-2 text-violet-400">{activeProject.title}</h3>
                            <p className="text-lg">{activeProject.fullDesc}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}