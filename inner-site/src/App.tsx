import { useEffect } from 'react';
import './App.css';
import Desktop from './components/os/Desktop';

function App() {
    useEffect(() => {
        if (window.self !== window.top) {
            document.body.classList.add('iframe-mode');
        }
        
        const monitoredElements = new WeakSet();
        let currentVolume = 0.5;
        let fadeInterval: NodeJS.Timeout | null = null;

        const OriginalAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        
        function PatchedAudioContext(...args: any[]) {
            const ctx = new OriginalAudioContext(...args);
            
            const masterGain = ctx.createGain();
            masterGain.gain.value = currentVolume;
            
            const originalDestination = ctx.destination;
            
            masterGain.connect(originalDestination);
            
            Object.defineProperty(ctx, 'destination', {
                get: () => masterGain,
                configurable: true
            });
            
            ctx.masterGain = masterGain;
            (window as any).nostalgistMasterGain = masterGain;
            
            return ctx;
        }

        (window as any).AudioContext = PatchedAudioContext;
        if ((window as any).webkitAudioContext) {
            (window as any).webkitAudioContext = PatchedAudioContext;
        }

        const fadeVolumeTo = (targetVolume: number, duration: number = 1200) => {
            if (!(window as any).nostalgistMasterGain) return;

            if (fadeInterval) {
                clearInterval(fadeInterval);
            }

            const startVolume = (window as any).nostalgistMasterGain.gain.value;
            const volumeDifference = targetVolume - startVolume;
            const steps = 60;
            const stepDuration = duration / steps;
            const volumeStep = volumeDifference / steps;
            let currentStep = 0;

            fadeInterval = setInterval(() => {
                if (currentStep >= steps) {
                    (window as any).nostalgistMasterGain.gain.value = targetVolume;
                    clearInterval(fadeInterval!);
                    fadeInterval = null;
                    return;
                }

                const newVolume = startVolume + (volumeStep * currentStep);
                (window as any).nostalgistMasterGain.gain.value = newVolume;
                currentStep++;
            }, stepDuration);
        };

        const handleCameraMessage = (event: MessageEvent) => {
            if (event.data && event.data.type) {
                if (event.data.type === 'cameraAtMonitor') {
                    currentVolume = 1.0;
                    fadeVolumeTo(1.0, 1200);
                } else if (event.data.type === 'cameraAwayFromMonitor') {
                    currentVolume = 0.09;
                    fadeVolumeTo(0.09, 1200);
                }
            }
        };

        window.addEventListener('message', handleCameraMessage);

        const setupAudioMonitoring = () => {
            const audioElements = document.querySelectorAll('audio, video');
            
            audioElements.forEach(element => {
                const media = element as HTMLMediaElement;
                
                if (monitoredElements.has(media)) return;
                monitoredElements.add(media);

                media.addEventListener('play', () => {
                    window.parent.postMessage({ type: 'audioPlaying' }, '*');
                });
                
                media.addEventListener('pause', () => {
                    window.parent.postMessage({ type: 'audioPaused' }, '*');
                });
                
                media.addEventListener('ended', () => {
                    window.parent.postMessage({ type: 'audioEnded' }, '*');
                });
            });
        };

        setupAudioMonitoring();

        const observer = new MutationObserver(() => {
            setupAudioMonitoring();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        const interval = setInterval(setupAudioMonitoring, 2000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
            if (fadeInterval) {
                clearInterval(fadeInterval);
            }
            window.removeEventListener('message', handleCameraMessage);
        };
    }, []);

    return (
        <div className="App">
            <Desktop />
        </div>
    );
}

export default App;
