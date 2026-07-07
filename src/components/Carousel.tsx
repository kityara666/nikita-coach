import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
    Carousel, 
    CarouselContent, 
    CarouselItem, 
    CarouselPrevious, 
    CarouselNext 
} from "@/components/ui/carousel";

import fencesImg from '../img/Fences.png';
import plumbingImg from '../img/Plumbing.png';
import remodelingImg from '../img/Remodeling.png';

const projects = [
    {
        title: "Fences",
        shortDesc: "Wood fence installation.",
        fullDesc: "Complete replacement of the old fence with high-quality cedar.",
        image: fencesImg
    },
    {
        title: "Plumbing",
        shortDesc: "Leak repair and faucet swap.",
        fullDesc: "Fixed a leaky pipe under the kitchen sink and installed a new faucet.",
        image: plumbingImg
    },
    {
        title: "Bathroom & Kitchen Remodeling",
        shortDesc: "Modern updates for your kitchen and bathroom spaces.",
        fullDesc: "We handle all cosmetic and structural updates, including tile installation, cabinet mounting, new light fixtures, and plumbing hookups. From minor refreshing to complete transformations.",
        image: remodelingImg
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
                            <h2 className="text-3xl font-bold mb-4">{p.title}</h2>
                            <img 
                                src={p.image} 
                                alt={p.title} 
                                onClick={() => setActiveProject(p)}
                                className="w-full h-96 object-contain object-center cursor-pointer"
                            />
                            <p className="mt-2 text-gray-600">{p.shortDesc}</p>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

            {activeProject && (
                <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center">
                    <Button 
                        onClick={() => setActiveProject(null)} 
                        variant='ghost'
                        size="lg" 
                        className="absolute right-2 top-2"
                    >
                        &times;
                    </Button>

                    <div className="relative shadow-2xl p-6 rounded-3xl max-w-4xl w-11/12 bg-white text-center">
                        <div className="relative flex items-center justify-center px-16">
                            <img 
                                src={activeProject.image} 
                                alt={activeProject.title} 
                                className="max-w-full h-96 object-contain rounded-xl mx-auto" 
                            />
                        </div>

                        <div className="mt-4">
                            <h3 className="text-2xl font-bold mb-2">{activeProject.title}</h3>
                            <p className="text-lg text-gray-700">{activeProject.fullDesc}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}