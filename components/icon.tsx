import React from 'react';
import HomeIcon from './homeicon';

const iconMap = {
  home: HomeIcon,
};

type IconProps = {
  name: keyof typeof iconMap;
  size?: number;
  color?: string;
};

const Icon: React.FC<IconProps> = ({ name, size, color }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <IconComponent size={size} color={color} />;
};

export default Icon;
