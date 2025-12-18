import React, { useState, useEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';

interface FullscreenMediaProps {
    children: React.ReactNode;
    type: 'image' | 'video';
}

const FullscreenMedia: React.FC<FullscreenMediaProps> = ({ children, type }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
            document.body.classList.add('fullscreen-active');
            // Also ensure all parent containers allow overflow
            const sitePageElements = document.querySelectorAll('.site-page, .site-page-content');
            sitePageElements.forEach(el => {
                (el as HTMLElement).style.overflow = 'visible';
            });
        } else {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('fullscreen-active');
            // Restore original overflow
            const sitePageElements = document.querySelectorAll('.site-page, .site-page-content');
            sitePageElements.forEach(el => {
                (el as HTMLElement).style.overflow = '';
            });
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
            document.body.classList.remove('fullscreen-active');
            // Restore original overflow
            const sitePageElements = document.querySelectorAll('.site-page, .site-page-content');
            sitePageElements.forEach(el => {
                (el as HTMLElement).style.overflow = '';
            });
        };
    }, [isFullscreen]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Clone the children and apply fullscreen styles
    const renderFullscreenContent = () => {
        if (React.isValidElement(children)) {
            return cloneElement(children, {
                ...children.props,
                style: {
                    ...children.props.style,
                    width: '100vw',
                    height: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    objectFit: 'contain',
                    display: 'block',
                }
            });
        }
        return children;
    };

    return (
        <>
            <div style={styles.mediaContainer} className="fullscreen-media-container">
                {children}
                <button
                    onClick={toggleFullscreen}
                    style={styles.expandButton}
                    className="fullscreen-expand-button"
                    title="View fullscreen"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                </button>
            </div>

            {isFullscreen && createPortal(
                <div style={styles.fullscreenOverlay} onClick={toggleFullscreen}>
                    <div style={styles.fullscreenContent} onClick={(e) => e.stopPropagation()}>
                        {renderFullscreenContent()}
                        <button
                            onClick={toggleFullscreen}
                            style={styles.closeButton}
                            className="fullscreen-close-button"
                            title="Close fullscreen"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

const styles: StyleSheetCSS = {
    mediaContainer: {
        position: 'relative',
        display: 'inline-block',
        width: '100%',
    },
    expandButton: {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
        transition: 'opacity 0.2s ease, background-color 0.2s ease, transform 0.1s ease',
        zIndex: 10,
        fontSize: '14px',
    },
    fullscreenOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        cursor: 'pointer',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
    },
    fullscreenContent: {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
    },
    closeButton: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
        transition: 'opacity 0.2s ease, background-color 0.2s ease',
        zIndex: 1000000,
        fontSize: '16px',
        fontWeight: 'bold',
    },
};

export default FullscreenMedia;