import React from 'react';
import { Link } from '../general';

import forhire from '../../assets/pictures/forHireGif.gif';
import { useNavigate } from 'react-router-dom';

export interface HomeProps {}

const Home: React.FC<HomeProps> = (props) => {
    const navigate = useNavigate();

    const goToContact = () => {
        navigate('/contact');
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.name}>Abhishek Pandey</h1>
                <h2>Creator of this site</h2>
            </div>
            <div style={styles.buttons}>
                <Link containerStyle={styles.link} to="about" text="ABOUT" />
                <Link
                    containerStyle={styles.link}
                    to="experience"
                    text="EXPERIENCE"
                />
                <Link
                    containerStyle={styles.link}
                    to="projects"
                    text="PROJECTS"
                />
                <Link
                    containerStyle={styles.link}
                    to="contact"
                    text="CONTACT"
                />
            </div>
            <div style={styles.forHireContainer} onMouseDown={goToContact}>
                {/* <img src={forhire} alt="" /> */}
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    page: {
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
    },
    header: {
        textAlign: 'center',
        marginBottom: 64,
        marginTop: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    image: {
        width: 800,
    },
    link: {
        padding: 16,
    },
    nowHiring: {
        backgroundColor: 'red',
        padding: 16,
    },
    forHireContainer: {
        marginTop: 64,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    name: {
        fontSize: 72,
        marginBottom: 16,
        lineHeight: 0.9,
    },
};

export default Home;
