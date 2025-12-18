import React, { useCallback, useEffect, useState } from 'react';
import Colors from '../../constants/colors';
import ShowcaseExplorer from '../applications/ShowcaseExplorer';
import NesGame from '../applications/NesGame';
import GenesisGame from '../applications/GenesisGame';
import Paint from '../applications/Paint';
import Reviews from '../applications/Reviews';
import ShutdownSequence from './ShutdownSequence';
import Toolbar from './Toolbar';
import DesktopShortcut, { DesktopShortcutProps } from './DesktopShortcut';
import { IconName } from '../../assets/icons';
import Credits from '../applications/Credits';

export interface DesktopProps {}

type ExtendedWindowAppProps<T> = T & WindowAppProps;

const APPLICATIONS: {
    [key in string]: {
        key: string;
        name: string;
        shortcutIcon: IconName;
        component: React.FC<ExtendedWindowAppProps<any>>;
    };
} = {
    // computer: {
    //     key: 'computer',
    //     name: 'This Computer',
    //     shortcutIcon: 'computerBig',
    //     component: ThisComputer,
    // },
    showcase: {
        key: 'showcase',
        name: 'My Showcase',
        shortcutIcon: 'showcaseIcon',
        component: ShowcaseExplorer,
    },
    tinytoon: {
        key: 'tinytoon',
        name: 'Tiny Toon Adventures',
        shortcutIcon: 'bugsIcon',
        component: GenesisGame,
    },
    sonic: {
        key: 'sonic',
        name: 'Sonic The Hedgehog',
        shortcutIcon: 'sonicIcon',
        component: GenesisGame,
    },
    supermario: {
        key: 'supermario',
        name: 'Super Mario Bros',
        shortcutIcon: 'superMarioIcon',
        component: NesGame,
    },
    mightyfinalfight: {
        key: 'mightyfinalfight',
        name: 'Mighty Final Fight',
        shortcutIcon: 'mightyFinalFightIcon',
        component: NesGame,
    },
    paint: {
        key: 'paint',
        name: 'Paint',
        shortcutIcon: 'windowGameIcon',
        component: Paint,
    },
    reviews: {
        key: 'reviews',
        name: 'Reviews',
        shortcutIcon: 'reviewIcon',
        component: Reviews,
    },
    credits: {
        key: 'credits',
        name: 'Credits',
        shortcutIcon: 'credits',
        component: Credits,
    },
};

const Desktop: React.FC<DesktopProps> = (props) => {
    const [windows, setWindows] = useState<DesktopWindows>({});

    const [shortcuts, setShortcuts] = useState<DesktopShortcutProps[]>([]);

    const [shutdown, setShutdown] = useState(false);
    const [numShutdowns, setNumShutdowns] = useState(1);
    const [wallpaper, setWallpaper] = useState<string | null>(null);

    // Detect if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    useEffect(() => {
        if (shutdown === true) {
            rebootDesktop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shutdown]);

    useEffect(() => {
        const newShortcuts: DesktopShortcutProps[] = [];
        Object.keys(APPLICATIONS).forEach((key) => {
            const app = APPLICATIONS[key];
            
            // Skip games on mobile devices
            if (isMobile && (key === 'tinytoon' || key === 'sonic' || key === 'supermario' || key === 'mightyfinalfight')) {
                return;
            }
            
            newShortcuts.push({
                shortcutName: app.name,
                icon: app.shortcutIcon,
                onOpen: () => {
                    const props: any = {
                        onInteract: () => onWindowInteract(app.key),
                        onMinimize: () => minimizeWindow(app.key),
                        onClose: () => removeWindow(app.key),
                        key: app.key,
                    };
                    
                    if (key === 'paint') {
                        props.onSetWallpaper = handleSetWallpaper;
                    }
                    
                    // Set ROM and game name for games
                    if (key === 'tinytoon') {
                        props.romUrl = 'Tiny Toon Adventures - Buster\'s Hidden Treasure (USA).gen';
                        props.gameName = 'Tiny Toon Adventures';
                    } else if (key === 'sonic') {
                        props.romUrl = 'Sonic The Hedgehog (USA, Europe).gen';
                        props.gameName = 'Sonic The Hedgehog';
                    } else if (key === 'supermario') {
                        props.romUrl = 'supermario.nes';
                        props.gameName = 'Super Mario Bros';
                    } else if (key === 'mightyfinalfight') {
                        props.romUrl = 'Mighty Final Fight (USA).nes';
                        props.gameName = 'Mighty Final Fight';
                    }
                    
                    addWindow(app.key, <app.component {...props} />);
                },
            });
        });

        newShortcuts.forEach((shortcut) => {
            if (shortcut.shortcutName === 'My Showcase') {
                shortcut.onOpen();
            }
        });

        setShortcuts(newShortcuts);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rebootDesktop = useCallback(() => {
        setWindows({});
    }, []);

    const removeWindow = useCallback((key: string) => {
        // Absolute hack and a half
        setTimeout(() => {
            setWindows((prevWindows) => {
                const newWindows = { ...prevWindows };
                delete newWindows[key];
                return newWindows;
            });
        }, 100);
    }, []);

    const minimizeWindow = useCallback((key: string) => {
        setWindows((prevWindows) => {
            const newWindows = { ...prevWindows };
            newWindows[key].minimized = true;
            return newWindows;
        });
    }, []);

    const getHighestZIndex = useCallback((): number => {
        let highestZIndex = 0;
        Object.keys(windows).forEach((key) => {
            const window = windows[key];
            if (window) {
                if (window.zIndex > highestZIndex)
                    highestZIndex = window.zIndex;
            }
        });
        return highestZIndex;
    }, [windows]);

    const toggleMinimize = useCallback(
        (key: string) => {
            const newWindows = { ...windows };
            const highestIndex = getHighestZIndex();
            if (
                newWindows[key].minimized ||
                newWindows[key].zIndex === highestIndex
            ) {
                newWindows[key].minimized = !newWindows[key].minimized;
            }
            newWindows[key].zIndex = getHighestZIndex() + 1;
            setWindows(newWindows);
        },
        [windows, getHighestZIndex]
    );

    const onWindowInteract = useCallback(
        (key: string) => {
            setWindows((prevWindows) => ({
                ...prevWindows,
                [key]: {
                    ...prevWindows[key],
                    zIndex: 1 + getHighestZIndex(),
                },
            }));
        },
        [setWindows, getHighestZIndex]
    );

    const startShutdown = useCallback(() => {
        setTimeout(() => {
            setShutdown(true);
            setNumShutdowns(numShutdowns + 1);
        }, 600);
    }, [numShutdowns]);

    const handleSetWallpaper = useCallback((imageData: string) => {
        setWallpaper(imageData);
    }, []);

    const addWindow = useCallback(
        (key: string, element: JSX.Element) => {
            setWindows((prevState) => ({
                ...prevState,
                [key]: {
                    zIndex: getHighestZIndex() + 1,
                    minimized: false,
                    component: element,
                    name: APPLICATIONS[key].name,
                    icon: APPLICATIONS[key].shortcutIcon,
                },
            }));
        },
        [getHighestZIndex]
    );

    return !shutdown ? (
        <div style={Object.assign({}, styles.desktop, wallpaper && {
            backgroundImage: `url(${wallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        })}>
            {/* For each window in windows, loop over and render  */}
            {Object.keys(windows).map((key) => {
                const element = windows[key].component;
                if (!element) return <div key={`win-${key}`}></div>;
                return (
                    <div
                        key={`win-${key}`}
                        style={Object.assign(
                            {},
                            { zIndex: windows[key].zIndex },
                            windows[key].minimized && styles.minimized
                        )}
                    >
                        {React.cloneElement(element, {
                            key,
                            onInteract: () => onWindowInteract(key),
                            onClose: () => removeWindow(key),
                        })}
                    </div>
                );
            })}
            {/* Left side shortcuts */}
            {shortcuts
                .filter((s) => s.shortcutName !== 'Reviews' && s.shortcutName !== 'Credits')
                .map((shortcut, i) => {
                    return (
                        <div
                            style={{
                                position: 'absolute',
                                top: 24 + i * 160,
                                left: 24,
                            }}
                            key={shortcut.shortcutName}
                        >
                            <DesktopShortcut
                                icon={shortcut.icon}
                                shortcutName={shortcut.shortcutName}
                                onOpen={shortcut.onOpen}
                            />
                        </div>
                    );
                })}
            {/* Right side shortcuts */}
            {shortcuts
                .filter((s) => s.shortcutName === 'Reviews' || s.shortcutName === 'Credits')
                .map((shortcut, i) => {
                    return (
                        <div
                            style={{
                                position: 'absolute',
                                top: 24 + i * 160,
                                right: 24,
                            }}
                            key={shortcut.shortcutName}
                        >
                            <DesktopShortcut
                                icon={shortcut.icon}
                                shortcutName={shortcut.shortcutName}
                                onOpen={shortcut.onOpen}
                            />
                        </div>
                    );
                })}
            <Toolbar
                windows={windows}
                toggleMinimize={toggleMinimize}
                shutdown={startShutdown}
            />
        </div>
    ) : (
        <ShutdownSequence
            setShutdown={setShutdown}
            numShutdowns={numShutdowns}
        />
    );
};

const styles: StyleSheetCSS = {
    desktop: {
        minHeight: '100%',
        flex: 1,
        backgroundColor: Colors.turquoise,
    },
    shutdown: {
        minHeight: '100%',
        flex: 1,
        backgroundColor: '#1d2e2f',
    },
    shortcutContainer: {
        position: 'absolute',
    },
    shortcuts: {
        position: 'absolute',
        top: 16,
        left: 6,
    },
    shortcutsRight: {
        position: 'absolute',
        top: 16,
        right: 6,
    },
    minimized: {
        pointerEvents: 'none',
        opacity: 0,
    },
};

export default Desktop;
