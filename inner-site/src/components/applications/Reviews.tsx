import React, { useState, useEffect } from 'react';
import Window from '../os/Window';
import colors from '../../constants/colors';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

export interface ReviewsProps extends WindowAppProps {}

interface Review {
    id: string;
    name: string;
    message: string;
    timestamp: number;
}

const Reviews: React.FC<ReviewsProps> = (props) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
           
            if (db) {
                const reviewsRef = collection(db, 'reviews');
                const q = query(reviewsRef, orderBy('timestamp', 'desc'));
                
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const reviewsData: Review[] = [];
                    snapshot.forEach((doc) => {
                        reviewsData.push({
                            id: doc.id,
                            ...doc.data()
                        } as Review);
                    });
                    setReviews(reviewsData);
                    setIsLoading(false);
                });

                return unsubscribe;
            }
        } catch (error) {
            console.error('Firebase not configured, using localStorage:', error);
        }
        
        setIsLoading(false);
        const stored = localStorage.getItem('portfolio_reviews');
        if (stored) {
            setReviews(JSON.parse(stored));
        }
    };

    const submitReview = async () => {
        if (!message.trim()) {
            setSubmitMessage('Please write a message');
            return;
        }

        setIsSubmitting(true);

        const newReview: Review = {
            id: Date.now().toString(),
            name: name.trim() || 'Anonymous',
            message: message.trim(),
            timestamp: Date.now(),
        };

        try {
            if (db) {
                await addDoc(collection(db, 'reviews'), {
                    name: newReview.name,
                    message: newReview.message,
                    timestamp: newReview.timestamp,
                });
            } else {
                throw new Error('Firebase not configured');
            }

            setSubmitMessage('Thank you for your review!');
            setName('');
            setMessage('');
            
            setTimeout(() => {
                setSubmitMessage('');
            }, 3000);
        } catch (error) {
            const stored = localStorage.getItem('portfolio_reviews');
            const existingReviews = stored ? JSON.parse(stored) : [];
            const updatedReviews = [...existingReviews, newReview];
            localStorage.setItem('portfolio_reviews', JSON.stringify(updatedReviews));
            setReviews(updatedReviews);
            
            setSubmitMessage('Thank you for your review! (Saved locally)');
            setName('');
            setMessage('');
            
            setTimeout(() => {
                setSubmitMessage('');
            }, 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Window
            top={50}
            left={150}
            width={700}
            height={600}
            windowTitle="Reviews"
            windowBarIcon="windowExplorerIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={'© Copyright 2026 Abhishek Pandey'}
        >
            <div style={styles.container}>
                <div style={styles.formSection}>
                    <h3 style={styles.heading}>Leave a Review</h3>
                    <div style={styles.form}>
                        <label style={styles.label}>
                            <p>Your Name (optional):</p>
                        </label>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Anonymous"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                        />
                        <label style={styles.label}>
                            <p>
                                <span style={styles.required}>*</span> Your Review:
                            </p>
                        </label>
                        <textarea
                            style={styles.textarea}
                            placeholder="Share your thoughts..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                        />
                        <div style={styles.buttonContainer}>
                            <button
                                className="site-button"
                                style={styles.button}
                                onClick={submitReview}
                                disabled={isSubmitting || !message.trim()}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                            {submitMessage && (
                                <p style={Object.assign({}, styles.message, {
                                    color: submitMessage.includes('Error') ? colors.red : colors.blue
                                })}>
                                    {submitMessage}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div style={styles.reviewsSection}>
                    <h3 style={styles.heading}>
                        Reviews ({reviews.length})
                    </h3>
                    <div style={styles.reviewsGrid}>
                        {isLoading ? (
                            <p style={styles.noReviews}>
                                Loading reviews...
                            </p>
                        ) : reviews.length === 0 ? (
                            <p style={styles.noReviews}>
                                No reviews yet. Be the first to leave one!
                            </p>
                        ) : (
                            reviews
                                .slice()
                                .reverse()
                                .map((review) => (
                                    <div key={review.id} style={styles.reviewTile}>
                                        <div style={styles.reviewHeader}>
                                            <p style={styles.reviewName}>
                                                <b>{review.name}</b>
                                            </p>
                                            <p style={styles.reviewDate}>
                                                {formatDate(review.timestamp)}
                                            </p>
                                        </div>
                                        <p style={styles.reviewMessage}>
                                            {review.message}
                                        </p>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
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
        overflow: 'hidden',
    },
    formSection: {
        padding: 16,
        borderBottom: '2px solid #808080',
        backgroundColor: '#c0c0c0',
    },
    heading: {
        marginBottom: 12,
        fontFamily: 'MSSerif',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: 4,
        fontFamily: 'MSSerif',
        fontSize: 12,
    },
    required: {
        color: 'red',
    },
    input: {
        marginBottom: 12,
        padding: 4,
        fontFamily: 'MSSerif',
    },
    textarea: {
        marginBottom: 12,
        padding: 4,
        height: 80,
        fontFamily: 'MSSerif',
        resize: 'none',
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
    },
    button: {
        minWidth: 120,
    },
    message: {
        fontFamily: 'MSSerif',
        fontSize: 12,
    },
    reviewsSection: {
        flex: 1,
        padding: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    reviewsGrid: {
        flex: 1,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
        alignContent: 'start',
    },
    noReviews: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        color: '#666',
        fontFamily: 'MSSerif',
        padding: 32,
    },
    reviewTile: {
        backgroundColor: '#ffffff',
        border: '2px solid #000',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        height: 180,
        maxHeight: 180,
        boxShadow: '2px 2px 0px #000',
        overflow: 'hidden',
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottom: '1px solid #ccc',
        flexShrink: 0,
    },
    reviewName: {
        fontFamily: 'MSSerif',
        fontSize: 13,
        color: colors.blue,
    },
    reviewDate: {
        fontFamily: 'MSSerif',
        fontSize: 11,
        color: '#666',
    },
    reviewMessage: {
        fontFamily: 'MSSerif',
        fontSize: 14,
        lineHeight: 1.5,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        flex: 1,
        overflowY: 'auto',
        paddingRight: 4,
    },
};

export default Reviews;
