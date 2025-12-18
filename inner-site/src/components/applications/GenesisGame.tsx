import React, { useState } from 'react';
import NostalgistPlayer from '../nes/NostalgistPlayer';
import Window from '../os/Window';

export interface GenesisGameAppProps extends WindowAppProps {
    romUrl?: string;
    gameName?: string;
}

const GenesisGameApp: React.FC<GenesisGameAppProps> = (props) => {
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);

    const romUrl = props.romUrl || 'sonic.gen';
    const gameName = props.gameName || 'Genesis Game';

    return (
        <Window
            top={10}
            left={10}
            width={width}
            height={height}
            windowTitle={gameName}
            windowBarColor="#1C1C1C"
            windowBarIcon="windowGameIcon"
            bottomLeftText={'Genesis Emulator - Nostalgist.js'}
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            startMaximized={true}
        >
            <div style={{ backgroundColor: '#000', height: '100%', width: '100%', overflow: 'hidden' }}>
                <NostalgistPlayer romUrl={romUrl} width={width} height={height} core="genesis_plus_gx" />
            </div>
        </Window>
    );
};

export default GenesisGameApp;
