import React, { useEffect, useRef, useState } from 'react';
import { Nostalgist } from 'nostalgist';

interface NostalgistPlayerProps {
    romUrl: string;
    width: number;
    height: number;
    core?: string;
}

const NostalgistPlayer: React.FC<NostalgistPlayerProps> = ({ romUrl, core = 'fceumm' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const nostalgistRef = useRef<any>(null);
    const [currentVolume, setCurrentVolume] = useState(0.09); // Start with low volume

    // Listen for volume control messages
    useEffect(() => {
        const handleVolumeMessage = (event: MessageEvent) => {
            if (event.data && event.data.type) {
                if (event.data.type === 'cameraAtMonitor') {
                    setCurrentVolume(1.0);
                } else if (event.data.type === 'cameraAwayFromMonitor') {
                    setCurrentVolume(0.09);
                }
            }
        };

        window.addEventListener('message', handleVolumeMessage);
        return () => window.removeEventListener('message', handleVolumeMessage);
    }, []);

    // Apply volume changes to the emulator
    useEffect(() => {
        if (nostalgistRef.current) {
            try {
                // Try different methods to control Nostalgist volume
                if (nostalgistRef.current.setVolume) {
                    nostalgistRef.current.setVolume(currentVolume);
                } else if (nostalgistRef.current.audio && nostalgistRef.current.audio.setVolume) {
                    nostalgistRef.current.audio.setVolume(currentVolume);
                } else if (nostalgistRef.current.core && nostalgistRef.current.core.setVolume) {
                    nostalgistRef.current.core.setVolume(currentVolume);
                }
            } catch (e) {
                console.warn('🎮 Could not set Nostalgist volume:', e);
            }
        }
    }, [currentVolume]);

    useEffect(() => {
        let mounted = true;

        const initEmulator = async () => {
            if (!canvasRef.current) return;

            try {
                setIsLoading(true);
                
                // Fetch the ROM file as a blob
                const fullRomUrl = `/${romUrl}`;
                
                const response = await fetch(fullRomUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ROM: ${response.statusText}`);
                }
                
                const blob = await response.blob();
                const file = new File([blob], romUrl, { type: 'application/octet-stream' });

                const emulator = await Nostalgist.launch({
                    core: core, // NES or Genesis core
                    rom: file,
                    element: canvasRef.current,
                    style: {
                        width: '100%',
                        height: '100%',
                    },
                });

                if (mounted) {
                    nostalgistRef.current = emulator;
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error loading Nostalgist:', err);
                if (mounted) {
                    setError(`Failed to load emulator: ${err}`);
                    setIsLoading(false);
                }
            }
        };

        initEmulator();

        return () => {
            mounted = false;
            if (nostalgistRef.current) {
                nostalgistRef.current.exit?.();
            }
        };
    }, [romUrl]);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    objectFit: 'contain',
                }}
            />
            {isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        color: '#fff',
                        fontSize: 18,
                        textAlign: 'center',
                    }}
                >
                    <div>Loading NES Emulator...</div>
                    <div style={{ fontSize: 12, marginTop: 10, color: '#999' }}>
                        Powered by Nostalgist.js
                    </div>
                </div>
            )}
            {error && (
                <div
                    style={{
                        position: 'absolute',
                        color: '#f00',
                        fontSize: 16,
                        textAlign: 'center',
                        padding: 20,
                    }}
                >
                    {error}
                </div>
            )}
            {!isLoading && !error && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        fontSize: 16,
                        color: '#fff',
                        textAlign: 'center',
                        padding: '8px 15px',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                    }}
                >
                    Controls: Arrow Keys = D-Pad | Z = A | X = B | Enter = Start | Shift = Select
                </div>
            )}
        </div>
    );
};

export default NostalgistPlayer;
