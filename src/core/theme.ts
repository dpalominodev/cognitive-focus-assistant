import { MD3DarkTheme } from 'react-native-paper';

export const AppTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    
    // Color Principal (Botones, Selectores): Morado Focus
    primary: '#6C63FF', 
    onPrimary: '#FFFFFF',
    primaryContainer: '#4a43b8',
    
    // Color Secundario (Acentos, Victorias): Cian Neón
    secondary: '#00F3FF',
    onSecondary: '#000000',
    secondaryContainer: '#004d4d',
    
    // Color de Fondo (Toda la app)
    background: '#000000', 
    
    // Color de Superficies (Tarjetas, Modales)
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    
    // Color de Error (Fallos, Castigos)
    error: '#FF5555',
    onError: '#000000',
    
    // Bordes y líneas
    outline: '#333333',
    outlineVariant: '#444444',
  },
  roundness: 16,
};