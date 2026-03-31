import React from 'react';
import { icons, LucideProps } from 'lucide-react';

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

// Map common icon names to valid Lucide icon names
const ICON_MAP: Record<string, string> = {
  // Direct mappings
  'star': 'Star', 'circle': 'Circle', 'zap': 'Zap', 'heart': 'Heart',
  'sun': 'Sun', 'moon': 'Moon', 'rocket': 'Rocket', 'book': 'Book',
  'music': 'Music', 'fish': 'Fish', 'palette': 'Palette', 'check': 'Check',
  'x': 'X', 'minus': 'Minus', 'triangle': 'Triangle', 'square': 'Square',
  'leaf': 'Leaf', 'cloud': 'Cloud', 'flame': 'Flame', 'drop': 'Droplets',
  'bolt': 'Zap', 'award': 'Award', 'crown': 'Crown', 'trophy': 'Trophy',
  'shield': 'Shield', 'wand': 'Wand2', 'gem': 'Gem', 'flower': 'Flower2',
  'flower2': 'Flower2', 'bug': 'Bug', 'bird': 'Bird', 'cat': 'Cat',
  'dog': 'Dog', 'turtle': 'Turtle', 'whale': 'Whale', 'pizza': 'Pizza',
  'apple': 'Apple', 'banana': 'Banana', 'coffee': 'Coffee', 'cake': 'Cake',
  'cookie': 'Cookie', 'gamepad': 'Gamepad2', 'running': 'PersonStanding',
  'swords': 'Swords', 'diamond': 'Diamond',
  // Extra common ones
  'number': 'Hash', 'text': 'Type', 'image': 'Image', 'video': 'Video',
  'home': 'Home', 'user': 'User', 'settings': 'Settings', 'globe': 'Globe',
  'map': 'Map', 'clock': 'Clock', 'calendar': 'Calendar', 'bell': 'Bell',
  'mail': 'Mail', 'phone': 'Phone', 'camera': 'Camera', 'pen': 'Pen',
  'pencil': 'Pencil', 'scissors': 'Scissors', 'ruler': 'Ruler',
  'calculator': 'Calculator', 'flask': 'FlaskConical', 'atom': 'Atom',
  'dna': 'Dna', 'mountain': 'Mountain', 'tree': 'TreePine', 'waves': 'Waves',
  'snowflake': 'Snowflake', 'lightning': 'Zap', 'wind': 'Wind',
  'droplets': 'Droplets', 'planet': 'Globe', 'telescope': 'Telescope',
  'microscope': 'Microscope', 'school': 'School', 'graduation': 'GraduationCap',
  'book-open': 'BookOpen', 'bookmark': 'Bookmark', 'library': 'Library',
  'puzzle': 'Puzzle', 'dice': 'Dice1', 'target': 'Target',
  // Food
  'carrot': 'Carrot', 'egg': 'Egg', 'fish-symbol': 'Fish', 'milk': 'Milk',
  // Shapes
  'hexagon': 'Hexagon', 'octagon': 'Octagon', 'pentagon': 'Pentagon',
};

function toTitleCase(str: string): string {
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  if (!name) return <span className="w-5 h-5 inline-block" />;

  // Try direct map
  const mapped = ICON_MAP[name.toLowerCase()];
  const titleName = mapped || toTitleCase(name);

  const LucideIcon = (icons as Record<string, React.FC<LucideProps>>)[titleName];

  if (!LucideIcon) {
    // Fallback to a generic icon
    const Fallback = icons['Sparkles'] as React.FC<LucideProps>;
    return <Fallback {...props} />;
  }

  return <LucideIcon {...props} />;
};

export default DynamicIcon;
