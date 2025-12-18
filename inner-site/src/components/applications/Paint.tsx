import React, { useRef, useState, useEffect } from 'react';
import Window from '../os/Window';

export interface PaintProps extends WindowAppProps {
    onSetWallpaper?: (imageData: string) => void;
}

const Paint: React.FC<PaintProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing && e.type !== 'mousedown') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleSetWallpaper = () => {
        const canvas = canvasRef.current;
        if (canvas && props.onSetWallpaper) {
            const imageData = canvas.toDataURL('image/png');
            props.onSetWallpaper(imageData);
            props.onClose();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    return (
        <Window
            top={50}
            left={100}
            width={1400}
            height={950}
            windowTitle="Paint"
            windowBarIcon="windowGameIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={'Draw and press Enter to set as wallpaper'}
        >
            <div style={styles.container}>
                <div style={styles.toolbar}>
                    <div style={styles.toolGroup}>
                        <label style={styles.label}>Color:</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={styles.colorPicker}
                        />
                    </div>
                    <div style={styles.toolGroup}>
                        <label style={styles.label}>Size:</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            style={styles.slider}
                        />
                        <span style={styles.sizeLabel}>{brushSize}px</span>
                    </div>
                    <button className="site-button" onClick={clearCanvas} style={styles.button}>
                        Clear
                    </button>
                    <button className="site-button" onClick={handleSetWallpaper} style={styles.button}>
                        Set as Wallpaper (Enter)
                    </button>
                </div>
                <canvas
                    ref={canvasRef}
                    width={1360}
                    height={820}
                    style={styles.canvas}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSetWallpaper();
                        }
                    }}
                    tabIndex={0}
                />
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#c0c0c0',
        padding: 8,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 8,
        backgroundColor: '#c0c0c0',
        marginBottom: 8,
    },
    toolGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontFamily: 'MSSerif',
        fontSize: 12,
    },
    colorPicker: {
        width: 40,
        height: 30,
        border: '2px solid #000',
        cursor: 'pointer',
    },
    slider: {
        width: 100,
    },
    sizeLabel: {
        fontFamily: 'MSSerif',
        fontSize: 12,
        minWidth: 40,
    },
    button: {
        marginLeft: 8,
    },
    canvas: {
        backgroundColor: '#ffffff',
        border: '2px solid #000',
        cursor: 'crosshair',
    },
};

export default Paint;
