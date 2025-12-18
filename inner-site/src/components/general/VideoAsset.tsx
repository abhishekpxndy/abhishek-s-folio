import React, { useEffect, useState } from 'react';
import FullscreenMedia from './FullscreenMedia';

export interface VideoAssetProps {
    src: string;
}

const VideoAsset: React.FC<VideoAssetProps> = ({ src }) => {
    const id = `video-${src}`;
    const [, setHasLoaded] = useState(false);

    useEffect(() => {
        const vid = document.getElementById(id);
        if (vid) {
            vid.oncanplay = function () {
                setHasLoaded(true);
            };
        }
    }, [id]);

    return (
        <FullscreenMedia type="video">
            <video
                id={`video-${src}`}
                style={Object.assign({}, styles.video)}
                src={src}
                autoPlay
                muted
                loop
                disablePictureInPicture
            />
        </FullscreenMedia>
    );
};

const styles: StyleSheetCSS = {
    container: {
        width: '100%',
    },
    loading: {
        width: '100%',
    },
    video: {
        width: '100%',
    },
    loadingBox: {
        backgroundColor: 'red',
    },
};

export default VideoAsset;
