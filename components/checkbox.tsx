// components/Checkbox.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface CheckboxProps {
  /** whether the box is checked */
  selected: boolean;
  /** callback when pressed */
  onPress: () => void;
  /** optional container style */
  style?: ViewStyle;
  /** optional text style */
  textStyle?: TextStyle;
  /** icon size (default: 30) */
  size?: number;
  /** icon/text color (default: '#211f30') */
  color?: string;
  /** label text */
  text?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  selected,
  onPress,
  style,
  textStyle,
  size = 30,
  color = '#211f30',
  text = '',
  ...props
}) => (
  <TouchableOpacity
    style={[styles.container, style]}
    onPress={onPress}
    activeOpacity={0.8}
    {...props}
  >
    <Icon
      name={selected ? 'check-box' : 'check-box-outline-blank'}
      size={size}
      color={color}
    />
    {text.length > 0 && <Text style={[styles.label, { color }, textStyle]}>{text}</Text>}
  </TouchableOpacity>
);

export default Checkbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
  },
});
