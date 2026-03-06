const fs = require('fs');
const pathPath = require('path');

const fileTheme = 'components/theme/theme-provider.tsx';
let str = fs.defaultURL ? fs.readFileSync(pathPath.defaultURL) : fs.readFileSync(pathPath.join(process.cwd(), fileTheme), 'utf8');

// Ensure that "defaultTheme" doesn't do "system" defaulting to dark by OS default in layout. Instead we want "light/dark / system". Let's check `theme-provider.tsx` code: localStorage is used. default state is "system".
