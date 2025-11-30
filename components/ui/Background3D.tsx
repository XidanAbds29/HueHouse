'use client';

import { motion } from 'framer-motion';

export function Background3D() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#fdfbf7]">
            {/* Noise Texture Overlay - Subtle Grain */}
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay z-50"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
            />

            {/* Base Gradient Layer - Warm Cream */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fdfbf7] via-[#f7f1e3] to-[#f0e6da] opacity-80" />

            {/* Moving Mesh Gradients */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-gradient-to-r from-[#ffeaa7] to-[#fab1a0] rounded-full blur-[120px] opacity-20 mix-blend-multiply"
            />

            <motion.div
                animate={{
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.5, 1],
                    rotate: [0, -15, 0]
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-[20%] right-[-10%] w-[70vw] h-[70vw] bg-gradient-to-l from-[#81ecec] to-[#74b9ff] rounded-full blur-[140px] opacity-15 mix-blend-multiply"
            />

            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-t from-[#fdcb6e] to-[#ffeaa7] rounded-full blur-[100px] opacity-20 mix-blend-multiply"
            />

            {/* Highlight Layer for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/40 to-transparent pointer-events-none" />
        </div>
    );
}
