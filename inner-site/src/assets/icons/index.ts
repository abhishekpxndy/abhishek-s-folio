import React from 'react';

import windowResize from './windowResize.png';
import maximize from './maximize.png';
import minimize from './minimize.png';
import computerBig from './computerBig.png';
import computerSmall from './computerSmall.png';
import myComputer from './myComputer.png';
import showcaseIcon from './showcaseIcon.png';
import mightyFinalFightIcon from './Mighty Final Fight (USA) 000.png';
import sonicIcon from './Sonic The Hedgehog (USA, Europe)_title.png';
import superMarioIcon from './Super_Mario_Bros._box.webp';
import credits from './credits.png';
import volumeOn from './volumeOn.png';
import BugsBunny from './bugs.png';
import volumeOff from './volumeOff.png';
import windowGameIcon from './windowGameIcon.png';
import windowExplorerIcon from './windowExplorerIcon.png';
import windowsStartIcon from './windowsStartIcon.png';
import close from './close.png';
import reviewIcon from './reviewIcon.png';

const icons = {
    windowResize: windowResize,
    maximize: maximize,
    minimize: minimize,
    computerBig: computerBig,
    computerSmall: computerSmall,
    myComputer: myComputer,
    showcaseIcon: showcaseIcon,
    bugsIcon: BugsBunny,
    mightyFinalFightIcon: mightyFinalFightIcon,
    sonicIcon: sonicIcon,
    superMarioIcon: superMarioIcon,
    volumeOn: volumeOn,
    volumeOff: volumeOff,
    credits: credits,
    close: close,
    windowGameIcon: windowGameIcon,
    windowExplorerIcon: windowExplorerIcon,
    windowsStartIcon: windowsStartIcon,
    reviewIcon: reviewIcon,
};

export type IconName = keyof typeof icons;

const getIconByName = (
    iconName: IconName
    // @ts-ignore
): React.FC<React.SVGAttributes<SVGElement>> => icons[iconName];

export default getIconByName;
