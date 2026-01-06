import { motion } from 'motion/react';
import { useState } from 'react';

export function DesignsPage() {
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  const designs = [
    {
      id: 'design-1',
      title: 'Editorial Layout System',
      description: 'A modular typographic system for contemporary art publications, exploring the relationship between text and image through structured grid layouts and expressive typography.',
      category: 'Print Design',
      preview: 'https://images.unsplash.com/photo-1620483474144-23931ab57ecd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwZGVzaWduJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2NjcyMjkwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'design-2',
      title: 'Visual Identity',
      description: 'Brand identity for an experimental gallery space, combining minimal geometric forms with handwritten accents to bridge institutional and intimate.',
      category: 'Branding',
      preview: 'https://images.unsplash.com/photo-1643926502904-3ef4554bf53b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwZWRpdG9yaWFsJTIwZmFzaGlvbiUyMGZpbG18ZW58MXx8fHwxNzY2NzIyOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'design-3',
      title: 'Typographic Posters',
      description: 'A series of experimental posters exploring the materiality of type, layering, and negative space through both digital and analog processes.',
      category: 'Typography',
      preview: 'https://images.unsplash.com/photo-1765029582791-7daa2b796431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwZmluZSUyMGFydCUyMGNoYXJjb2FsfGVufDF8fHx8MTc2NjcyMjkwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'design-4',
      title: 'Book Design',
      description: 'A tactile exploration of narrative through physical form, binding, and paper selection. Each page designed to create a rhythmic reading experience.',
      category: 'Publication',
      preview: 'https://images.unsplash.com/photo-1667904700051-200f9e91264a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwYWJzdHJhY3QlMjBhcnR8ZW58MXx8fHwxNzY2NzIyOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  // Split "Design" into individual letters for animation
  const designLetters = "Design".split("");

  return (
    <div className="min-h-screen py-20 px-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Page Title */}
        <motion.div 
          className="mb-20 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="editorial-heading text-7xl inline-flex">
            {designLetters.map((letter, index) => (
              <motion.span
                key={index}
                className="inline-block"
                whileHover={{ 
                  scale: 1.15,
                  y: -8
                }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                {letter}
              </motion.span>
            ))}
          </h1>
          <p className="text-gray-600 text-sm mt-3 tracking-wide">
            Typography, editorial systems, and visual identity across print and digital media
          </p>
          {/* Small red mark accent */}
          <div className="absolute -bottom-2 left-0 red-mark red-mark-horizontal opacity-60"></div>
        </motion.div>

        {/* Designs Grid - Offset for depth */}
        <div className="grid grid-cols-2 gap-16">
          {designs.map((design, index) => (
            <motion.div
              key={design.id}
              className="group cursor-pointer relative"
              onClick={() => setSelectedDesign(selectedDesign === design.id ? null : design.id)}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ 
                transform: `translateY(${(index % 2) * 30}px)` 
              }}
            >
              {/* Preview Image */}
              <div className="mounted-image aspect-[4/3] mb-6 overflow-hidden relative">
                <motion.img
                  src={design.preview}
                  alt={design.title}
                  className="w-full h-full object-cover grayscale"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.12 }}
                  transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
                />
                
                {/* Bohemian red mark accent on first design */}
                {index === 0 && (
                  <div className="absolute bottom-4 left-4 red-mark red-mark-horizontal opacity-60"></div>
                )}
                {index === 2 && (
                  <div className="absolute top-4 right-4 red-mark red-mark-vertical opacity-50"></div>
                )}
              </div>

              {/* Design Info */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="editorial-heading text-3xl group-hover:text-[var(--accent-red)] transition-colors duration-500">{design.title}</h3>
                </div>

                <div className="small-caps text-xs text-[var(--accent-red)] tracking-[0.2em] mb-3">
                  {design.category}
                </div>

                <motion.div
                  initial={false}
                  animate={{ 
                    height: selectedDesign === design.id ? 'auto' : 0,
                    opacity: selectedDesign === design.id ? 1 : 0 
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="text-mounted mt-4 relative">
                    {/* Small red mark on expanded description */}
                    <div className="absolute -top-2 -left-2 red-mark red-mark-horizontal opacity-50"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {design.description}
                    </p>
                  </div>
                </motion.div>

                {selectedDesign !== design.id && (
                  <motion.p
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600 leading-relaxed line-clamp-2"
                  >
                    {design.description}
                  </motion.p>
                )}

                <motion.button
                  className="small-caps text-xs text-gray-600 hover:text-[var(--accent-red)] tracking-wider transition-colors mt-4"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedDesign === design.id ? 'Close' : 'View Details'} →
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}