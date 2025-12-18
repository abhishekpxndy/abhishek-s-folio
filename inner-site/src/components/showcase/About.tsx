import React from 'react';
import me from '../../assets/pictures/workingAtComputer.jpg';
import meNow from '../../assets/pictures/current me.png';
import { Link } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';

export interface AboutProps {}

const About: React.FC<AboutProps> = (props) => {
    return (
        <div className="site-page-content">
            {/* <img src={me} style={styles.topImage} alt="" /> */}
            <h1 style={{ marginLeft: -16 }}>Welcome</h1>
            <h3>Hi, I'm Abhishek Pandey</h3>
            <br />
            <div className="text-block">
                <p>
                    Exploring interactivity, real-time 3D graphics, UI/UX and motion. 
                </p>
                <p>
                     If you'd like to make something exciting together, feel free to reach out! using {' '}
                    <Link to="/contact">this form</Link> or shoot me an email at{' '}
                    <a 
                        href="https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm"
                        target="_blank"
                        rel="noreferrer"
                    >
                        abhishekpxndy@gmail.com
                    </a>
                </p>
            </div>
            <ResumeDownload />
            <div className="text-block">
              
                <p>
                   My creative perspective is 
                    shaped by everyday experiences, childhood memories, nostalgia, 
                    and the music that inspires me.
                    <br / >

                    My shift into design began through my childhood friend,{' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://www.linkedin.com/in/soorajnair19/"
                    >
                        Sooraj Nair
                    </a>
                    — a software engineer, UI/UX designer, and currently the Community 
                    Head of Friends of Figma Mumbai. While helping him at design events, 
                    I was exposed to diverse speakers and conversations that revealed the 
                    depth of the design ecosystem. I became fascinated by how a product 
                    evolves through multiple stages before reaching users.
                </p>
                
                <br />
                <div style={{}}>
                    <div
                        style={{
                            flex: 1,
                            textAlign: 'justify',
                            alignSelf: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <h3>My Hobbies</h3>
                        <br />
                        <p>
                            Beyond design, I have a lot of hobbies that I
                            enjoy doing in my free time. The more tangible
                            hobbies I have are playing {' '}
                            <Link to="/projects/music">piano</Link>{' '}
                            and clicking {' '}
                            <Link to="/projects/art"> photos</Link>. You can
                            read more about each of these on their respective
                            pages under my projects tab.
                            <br />
                             Some other hobbies I
                            enjoy are working out, cooking, and (unsurprisingly)
                            playing video games.
                            <br />
                            .. / .-.. .. -.- . / .. -.-. . / -.-. .-. . .- --

                        </p>
                        <br />
                        <p>
                           
                        </p>
                    </div>
                    <div style={styles.verticalImage}>
                        <img src={meNow} style={styles.image} alt="" />
                        <p>
                            <sub>
                                <b>Figure 2:</b> Me, April 2022
                            </sub>
                        </p>
                    </div>
                </div>
                <br />
                <br />
                <p>
                    Thanks for visiting my portfolio! Feel free to look around, 
                    explore the projects, and see what catches your eye. And 
                    if you discover the hidden Easter egg, tag me on Instagram —I’d 
                    love to hear about it.{' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://www.instagram.com/abhishekpxndy/"
                    >
                        @abhishekpxndy
                    </a>{' '}
                    Good luck and have fun!
                </p>
                <br />
                <p>
                    If you have any questions or comments I would love to hear
                    them. You can reach me through the{' '}
                    <Link to="/contact">contact page</Link> or shoot me an email
                    at{' '}
                    <a 
                        href="https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm"
                        target="_blank"
                        rel="noreferrer"
                    >
                        abhishekpxndy@gmail.com
                    </a>
                </p>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    contentHeader: {
        marginBottom: 16,
        fontSize: 48,
    },
    image: {
        height: 'auto',
        width: '100%',
    },
    topImage: {
        height: 'auto',
        width: '100%',
        marginBottom: 32,
    },
    verticalImage: {
        alignSelf: 'center',
        // width: '80%',
        marginLeft: 32,
        flex: 0.8,

        alignItems: 'center',
        // marginBottom: 32,
        textAlign: 'center',
        flexDirection: 'column',
    },
};

export default About;
