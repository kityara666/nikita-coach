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
                    <div className="relative shadow-2xl p-4 rounded-3xl max-w-5xl w-11/12 bg-white text-center">
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="absolute top-4 right-5 text-3xl cursor-pointer"
                        >
                            Close
                        </button>
                        
                        <img 
                            src={project.image} 
                            alt={project.title} 
                            className="max-w-full h-auto rounded-xl mx-auto mb-4" 
                        />
                        <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                        <p className="text-lg">{project.fullDesc}</p>
                    </div>
                </div>
            )}
        </div>
    );
}