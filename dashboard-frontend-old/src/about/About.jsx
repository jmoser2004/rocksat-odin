import AboutTitle from '../assets/AboutODIN.png'
import TeamPhoto from '../assets/CapitolTechnologyUniversityTeamPhoto.png'
import './test-about.css'

function About()
{
    return (
        <div className="aboutBody">
            <div className='aboutTitleDiv'>
                <img className='aboutTitle' src={AboutTitle} />
            </div>
            <div className='teamPhotoDiv'>
                <img className='teamPhoto' src={TeamPhoto} />
                <h3 className='teamPhotoTitle'>From left to right: Professor Jeff Volosin, Phil Alsop, Zoé Denito, Eddie Zhou, Daniel Geer, Elijah Mister, Owen Coffee, Jason Gedlu, Taylor Fryer, James Gross, Joe Moser, and Professor Rishabh Maharaja</h3>
            </div>
            <div className="aboutParaWrapper">
                <p className="aboutPara">
                    ODIN (Observation & Detection Interpreted by Neural-networks) is a student-led experiment focused on assessing the practicality of Artificial Intelligence systems operating directly on space hardware.
                    ODIN will combine high-energy electromagnetic radiation sensing with onboard AI to explore how AI can optimize science data return when bandwidth and time are limited.
                </p>
            </div>
            <div className='aboutParaWrapper'>
                <h2 className='aboutHeader'>Objectives</h2>
                <p className='aboutPara'>
                    <li>Evaluate the feasibility of embedding AI on space hardware</li>
                    <li>Produce histograms of high energy gamma ray radiation</li>
                    <li>Demonstrate a small form factor and low cost platform for space-based AI experiments</li>
                    <li>Develop a full ground segment for data telemetry and visualization</li>
                    <li>Provide a real-time dashboard to display payload health and data</li>
                </p>
            </div>
            <div className='aboutParaWrapper'>
                <h2 className='aboutHeader'>Hardware</h2>
                <p className='aboutPara'>
                    <li>Two Spectrometers</li>
                    <li>One Jetson Orin Nano</li>
                    <li>One STM32</li>
                    <li>One Iridium 9704 Antenna</li>
                </p>
            </div>
            <div className='aboutParaWrapper'>
                <h2 className='aboutHeader'>The Team</h2>
                <p className='aboutPara'>
                    <li>Professor Jeff Velosin - Director, Astronautical Engineering</li>
                    <li>Professor Rishabh Maharaja - Principle Investigator</li>
                    <li>Elijah Mister - Team Lead</li>
                    <li>Owen Coffee - Deputy Team Lead / Power & Instrumentation Lead</li>
                    <li>James Gross - Mechanical Lead</li>
                    <li>Eddie Zhou - Comms Lead</li>
                    <li>Daniel Geer - Flight Software Lead</li>
                    <li>Taylor Fryer - AI & Data Lead</li>
                    <li>Phil Alsop - Mechanical</li>
                    <li>Zoé Denito - Flight Software</li>
                    <li>Jason Gedlu - AI & Data</li>
                    <li>Joe Moser - AI & Data</li>
                </p>
            </div>
        </div>
    )
}

export default About;