import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, radii, shadow } from '../theme/tokens';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          ...(elevated ? shadow.card : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
