import React, { useState } from 'react';

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

export function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const project = projects[currentIndex];

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    if (!project) {
        return null;
    }

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">{project.title}</h2>
            
            <div className="flex items-center justify-center gap-8 w-full max-w-4xl">
                <button 
                    onClick={() => setCurrentIndex(currentIndex === 0 ? projects.length - 1 : currentIndex - 1)} 
                    className="flex justify-center items-center text-2xl w-12 h-12 rounded-full bg-gray-200 hover:bg-blue-700 hover:text-white transition duration-200"
                >
                    &lt;
                </button>

                <img 
                    src={project.image} 
                    alt={project.title} 
                    onClick={() => setIsOpen(true)}
                    className="w-full h-96 object-contain object-center cursor-pointer"
                />

                <button 
                    onClick={() => setCurrentIndex((currentIndex + 1) % projects.length)} 
                    className="flex justify-center items-center text-2xl w-12 h-12 rounded-full bg-gray-200 hover:bg-blue-700 hover:text-white transition duration-200"
                >
                    &gt;
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center">
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="fixed top-6 right-6 text-5xl cursor-pointer hover:text-red-500 transition duration-200"
                    >
                        &times;
                    </button>

                    <div className="relative shadow-2xl p-6 rounded-3xl max-w-4xl w-11/12 bg-white text-center">
                        <div className="relative flex items-center justify-center px-16">
                            <button 
                                onClick={() => setCurrentIndex(currentIndex === 0 ? projects.length - 1 : currentIndex - 1)} 
                                className="absolute left-0 top-1/2 -translate-y-1/2 flex justify-center items-center text-2xl w-12 h-12 rounded-full bg-gray-200 hover:bg-blue-700 hover:text-white transition duration-200"
                            >
                                &lt;
                            </button>

                            <img 
                                src={project.image} 
                                alt={project.title} 
                                className="max-w-full h-96 object-contain rounded-xl mx-auto" 
                            />

                            <button 
                                onClick={() => setCurrentIndex((currentIndex + 1) % projects.length)} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 flex justify-center items-center text-2xl w-12 h-12 rounded-full bg-gray-200 hover:bg-blue-700 hover:text-white transition duration-200"
                            >
                                &gt;
                            </button>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                            <p className="text-lg text-gray-700">{project.fullDesc}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}