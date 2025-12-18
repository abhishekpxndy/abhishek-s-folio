import React, { useState } from 'react';
import computer from '../../../assets/pictures/projects/software/computer.mp4';
import scroll from '../../../assets/pictures/projects/software/scroll.mp4';
import Frame from '../../../assets/pictures/projects/software/Frame.png';
import screen from '../../../assets/pictures/projects/software/screen.jpg';
import chat1 from '../../../assets/pictures/projects/software/chat1.png';
import chat2 from '../../../assets/pictures/projects/software/chat2.png';
import userflow1 from '../../../assets/pictures/projects/software/userflow1.png';
import wireframe1 from '../../../assets/pictures/projects/software/wireframe1.jpeg';
import firstscreen from '../../../assets/pictures/projects/software/firstscreen.png';
import research1 from '../../../assets/pictures/projects/software/research1.png';
import joinparty from '../../../assets/pictures/projects/software/joinparty.png';
import secondscreen from '../../../assets/pictures/projects/software/secondscreen.png';
import thirdscreen from '../../../assets/pictures/projects/software/thirdscreen.png';
import search1 from '../../../assets/pictures/projects/software/search1.png';
import fourthscreen from '../../../assets/pictures/projects/software/fourthscreen.png';

import ResumeDownload from '../ResumeDownload';
import VideoAsset from '../../general/VideoAsset';
import FullscreenMedia from '../../general/FullscreenMedia';

export interface SoftwareProjectsProps {}

const SoftwareProjects: React.FC<SoftwareProjectsProps> = (props) => {
    const [expandedSections, setExpandedSections] = useState({
        portfolio: false,
        gsts: false,
        skipScroll: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    return (
        <div className="site-page-content">
            <h1>Design</h1>
            <h3>Case Studies</h3>
            <br />
            <p>
                Below are some of my favorite projects I have worked on
                over the last few months.
            </p>
            <br />
            <ResumeDownload />
            <br />
             <div className="text-block">
                <h2 
                    onClick={() => toggleSection('gsts')}
                    style={styles.collapsibleHeader}
                >
                    YouTube Watch Party {expandedSections.gsts ? '----- Close' : '----- Open'}
                </h2>
                {expandedSections.gsts && (
                    <>
                        <br />
                         <p> 
                            YouTube Watch Party is a feature that allows multiple users to 
                            watch videos together and chat in real&nbsp;time. </p>
                    <div className="captioned-image">
                    <FullscreenMedia type="image">
                        <img src={Frame} alt="meowmewo" 
                        style={styles.newImageStyle} />
                    </FullscreenMedia>
                    </div>
     
                <div className="captioned-image">
                   <FullscreenMedia type="image">
                       <img src={chat1} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                </div>
                <div className="captioned-image">
                   <FullscreenMedia type="image">
                       <img src={chat2} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                </div>
                <div className="captioned-image">
                   <FullscreenMedia type="image">
                       <img src={research1} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                </div>
                <p>
                   People often want to watch videos with friends who are far away.
                   Right now, they depend on third-party apps or screen-sharing, which causes:

                  <ul>
  <li>Lag and poor sync</li>
  <li>No native chat experience</li>
  <li>Multiple steps to set up</li>
</ul>

                  Users want <b>a simple, built-in way</b> on YouTube to watch together and talk together.

                </p>
                <br />
                 <div className="captioned-image">
                   <FullscreenMedia type="image">
                       <img src={userflow1} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                </div>


                <p>
                   I explored layouts for:

                  <ul>
  <li>Video + chat placement</li>
  <li>Member list</li>
  <li>Controls (sync, play/pause, mic, leave party)</li>
</ul>
                </p>
                <div className="captioned-image">
                   <FullscreenMedia type="image">
                       <img src={wireframe1} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                </div>
                <br/>
                <p>
                   Final UI
                   </p>
                   <br/>
                <div className="captioned-image">
                   <FullscreenMedia type="image">
                       <img src={firstscreen} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                   <FullscreenMedia type="image">
                       <img src={search1} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                   <FullscreenMedia type="image">
                       <img src={secondscreen} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                   <FullscreenMedia type="image">
                       <img src={thirdscreen} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                   <FullscreenMedia type="image">
                       <img src={fourthscreen} alt="meowmewo" 
                        style={styles.newImageStyle} />
                   </FullscreenMedia>
                </div>

                <p>
                  This feature improves:

                  <ul>
                   <li>Remote social experiences</li>
                   <li>Watch-together engagement</li>
                   <li>Chat activity on YouTube</li>
                   <li>Time spent on the platform</li>

                  A native solution reduces the need for external apps.
</ul>
                </p>


                    </>
                )}
            </div>
            <div className="text-block">
                <h2 
                    onClick={() => toggleSection('portfolio')}
                    style={styles.collapsibleHeader}
                >
                    abhishekpxndy.vercel.app {expandedSections.portfolio ? '----- Close' : '----- Open'}
                </h2>
                {expandedSections.portfolio && (
                    <>
                        <br />
                <p>
                   abhishekpxndy.vercel.app is both my personal portfolio and 
                   the site you are currently viewing. Building this project was 
                   a rewarding experience that challenged me creatively and technically.

                   Towards the end of 2025, I knew I wanted to go beyond a 
                   template-based portfolio and create something interactive 
                   that truly showcased my skills during my job search. While 
                   exploring inspiration on platforms like {' '}
                   <a

                      rel="noreferrer"
                      target="_blank"
                      href="https://www.awwwards.com/"
                      
                      >Awwwards</a>
                   , I came across 
                   exceptional portfolios such as {' '}
                     <a

                      rel="noreferrer"
                      target="_blank"
                      href="https://samsy.ninja/"
                      
                      >samsy.ninja</a>{' '}
                        and {' '}
                     <a

                      rel="noreferrer"
                      target="_blank"
                      href="https://www.igloo.inc/"
                      
                      >igloo.inc</a>
                   , which really expanded my vision of what a web portfolio could be.

                   Curious about how these experiences were built, I researched 
                   further and discovered that they leveraged WebGL. This led me 
                   deeper into learning Three.js, a powerful library that 
                   simplifies the complexity of WebGL and enables developers to 
                   create interactive 3D experiences, animations, visual effects, 
                   games, and immersive web environments without needing to write 
                   low-level shader code.

                   From there, I spent time watching tutorials, practicing Blender, 
                   and studying Three.js development. I started building the site in early 
                   October, and the process became a significant learning journey—one that 
                   blended design, programming, and storytelling into a single creative 
                   experience.
                </p>
                <br />
                <div className="captioned-image">
                    <VideoAsset src={computer} />
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 1:</b> Blender Scene of the 3D website.
                            The scene from Blender was baked and exported in a
                            GLTF format.
                        </sub>
                    </p>
                </div>
                <p>
                    Now, a quick technical breakdown of the site. The website is
                    split into two parts, the 3D site, and the 2D OS site. The
                    3D site uses Three.js to render the scene and renders the 2D
                    site inside of it using an iframe. The 2D OS site is a
                    simple react site that is hosted{' '}
                    as a standalone web app. The actual rendering of
                    the 2D site is accomplished using a CSS renderer provided by
                    Three.js that transforms the html of the 2D site with 3D CSS
                    transforms to give the illusion of three dimensionality.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://abhishekpxndy.vercel.app"
                        >
                            <p>
                                <b>[3D Site]</b> - abhishekpxndy.vercel.app
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://inner-site-for-3d-room-portfolio.vercel.app/"
                        >
                            <p>
                                <b>[2D OS Site]</b> - 2dos.vercel.app
                            </p>
                        </a>
                    </li>

                </ul>
                <p>
                    I'm skipping over a lot of details in exchange for brevity,
                    but I do plan on doing a more in depth breakdown for those
                    interested sometime in the future. To get updates with that
                    project feel free to follow me on LinkedIn{' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://www.linkedin.com/in/abhishek-pandey-3a28381a5/"
                    >
                        @abhishekpxndy
                    </a>
                </p>
                    </>
                )}
            </div>
           
            <div className="text-block">
                <h2 
                    onClick={() => toggleSection('skipScroll')}
                    style={styles.collapsibleHeader}
                >
                    Pulse Fitness (Web App) {expandedSections.skipScroll ? '----- Close' : '----- Open'}
                </h2>
                {expandedSections.skipScroll && (
                    <>
                <p>
                    <span><h4 style={{display: 'inline'}}>Pulse Fitness — Turning Missed Payments into Clear Insights </h4>(Freelance Project)</span><br /><br />
                    <span><h4 style={{display: 'inline'}}>Timeline:</h4> September 2025 – November 2025</span><br />
                    <span><h4 style={{display: 'inline'}}>Platform:</h4> Web App</span><br />
                    <span><h4 style={{display: 'inline'}}>Tools:</h4> Figma (Wireframes → High‑fidelity UI)</span>
                    <hr style={{marginTop: '10px', marginBottom: '10px', border: '1px solid #ccc'}} />
                </p>
                <br />
                <p>Pulse Fitness was operating the way many gyms still do :
                                <ul>
                   <li>Member data tracked manually</li>
                   <li>Employee details stored in Excel sheets</li>
                   <li>Payments updated irregularly</li>
                   <li>No central dashboard</li>
                   <li>No alerts for expired memberships</li>
                    </ul>

                  Everything worked — until it didn’t.
                  <br />
                  <br />
                  One day, while cross‑checking records, the owner noticed something odd.
                  <ul><h3 style={{display: 'inline'}}>|</h3> Himesh’s membership had expired three months ago.</ul>
                  Himesh paid immediately when informed — but that raised a bigger question:
                  <ul><h3 style={{display: 'inline'}}>|</h3> How many other members were training unpaid?</ul>
                  And more importantly:
                  <span><ul><h3 style={{display: 'inline'}}>|</h3> How many more would go unnoticed?</ul></span>
                   <hr style={{marginTop: '10px', marginBottom: '10px', border: '1px solid #ccc'}} />
                  <br />
                   <h4>Understanding the Users</h4>
                   <br />
                  <h5 style={{display: 'inline'}}>Primary User : </h5> Gym Owner
                     
                   <ul>
                      <li>Busy managing the floor</li>
                      <li>Not tech‑savvy</li>
                      <li>Needs quick answers, not complex dashboards</li>
                  </ul>
                  <h5 style={{display: 'inline'}}>Secondary Users : </h5> Staff / Trainers
                     
                   <ul>
                      <li>Update attendance</li>
                      <li>Check member status</li>
                      <li>Minimal interaction, maximum clarity</li>
                  </ul>

                
                </p>
                <div className="captioned-image">
                    <VideoAsset src={scroll} />
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 3:</b> Skip the Scroll in action, finding
                            the highest rated comments and scrolling right to
                            them
                        </sub>
                    </p>
                </div>
                <p>
                    The extension is open source and currently released on the
                    Chrome web store. Skip the Scroll is obviously not a project
                    with massive scope, but was fun to make and dive into the
                    world of browser extensions. I wanted to showcase since it's
                    a developer tool and I wanna give it some visibility for
                    those who might find it useful.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>

                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://chrome.google.com/webstore/detail/skip-the-scroll/mfehannpjmgfagldoilpngeoecdfgmnd"
                        >
                            <p>
                                <b>[Chrome Web Store]</b> - Skip the Scroll
                            </p>
                        </a>
                    </li>
                </ul>
                <p>
                    If you are a developer and have also found yourself
                    scrolling through github comment after github comment saying
                    "i also have this problem...", then I highly recommend you
                    check out Skip the Scroll to save you some of your precious
                    time. If you like it, feel free to star it on GitHub and
                    rate it on the Chrome web store.
                </p>
                    </>
                )}
            </div>
            <ResumeDownload />
        </div>
    );
};

const styles: StyleSheetCSS = {
    video: {
        width: '100%',
        padding: 12,
    },
    caption: {
        width: '80%',
    },
    collapsibleHeader: {
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #ccc',
        marginBottom: '8px',
        transition: 'background-color 0.2s ease',
    },
    newImageStyle: {
        width: '100%',
        height: 'auto',
        // Enhanced quality for iframe embedding
        imageRendering: 'auto' as const,
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        willChange: 'transform',
        // Improve sharpness in 3D iframe
        WebkitFilter: 'contrast(1.02) saturate(1.01)',
        filter: 'contrast(1.02) saturate(1.01)',
        // Prevent interpolation blur
        msInterpolationMode: 'bicubic',
    } as React.CSSProperties,
};

export default SoftwareProjects;
