import { MD3DarkTheme as DefaultTheme, useTheme as usePaperTheme } from 'react-native-paper';

// 1. Definimos la estructura de nuestros colores personalizados
export const customColors = {
  success: '#00B386',
  warning: '#FFB74D',
  chartGradientStart: '#6C63FF',
  chartGradientEnd: '#292556',
};

// 2. Creamos el tema extendiendo el default
export const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C63FF',
    onPrimary: '#FFFFFF',
    secondary: '#03DAC6',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
    onSurface: '#E1E1E1',
    // Aquí inyectamos nuestros colores
    custom: customColors,
  },
  roundness: 12,
};

// 3. Magia de TypeScript: Extraemos el TIPO exacto de nuestro tema
export type AppThemeType = typeof AppTheme;

// 4. Creamos un Hook personalizado para usar en la app
// En lugar de usar 'useTheme', usaremos 'useAppTheme' y TypeScript ya sabrá todo.
export const useAppTheme = () => usePaperTheme<AppThemeType>();