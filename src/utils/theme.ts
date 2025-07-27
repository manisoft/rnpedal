import { Appearance } from 'react-native';

export const getMapStyleUrl = () => {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === 'dark'
        ? 'https://tiles.stadiamaps.com/tiles/alidade_dark/{z}/{x}/{y}.png'
        : 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png';
};
