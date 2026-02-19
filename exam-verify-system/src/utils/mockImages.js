// Generate placeholder avatar with terracotta accent
export const generateAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=d97757&color=faf9f5&bold=true&format=svg`;
};

// Generate QR code placeholder
export const generateQRPlaceholder = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U4ZTZkYyIvPjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcng9IjEyIiBmaWxsPSIjZmFmOWY1Ii8+PHJlY3QgeD0iMTQwIiB5PSIxNDAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iOCIgZmlsbD0iI2Q5Nzc1NyIgb3BhY2l0eT0iMC4zIi8+PC9zdmc+';
};

// Mock student photos
export const mockStudentPhotos = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
];

// Hero mockup images - selecting high quality Unsplash photos that match the requested scenes
export const heroMockups = {
  examHall: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?w=1200&q=80', // University architecture
  scanning: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80', // Digital verification
  queuing: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', // Students in hall
  comparison: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80', // Planning/Paperwork (the "Before")
  success: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80', // Students working (the "After")
};

