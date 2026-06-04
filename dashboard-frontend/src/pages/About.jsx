import AboutTitle from '../assets/AboutODIN.png'
import TeamPhoto  from '../assets/CapitolTechnologyUniversityTeamPhoto.png'
import './About.css'

export default function About() {
  return (
    <div className="about">

      <div className="about-hero">
        <img src={AboutTitle} alt="About ODIN" className="about-title-img" />
      </div>

      <div className="about-content">

        <div className="about-team-photo">
          <img src={TeamPhoto} alt="Capitol Technology University Team" className="team-photo" />
          <p className="team-caption">
            From left to right: Professor Jeff Volosin, Phil Alsop, Zoé Denito, Eddie Zhou,
            Daniel Geer, Elijah Mister, Owen Coffee, Jason Gedlu, Taylor Fryer, James Gross,
            Joe Moser, and Professor Rishabh Maharaja
          </p>
        </div>

        <section className="about-section">
          <p className="about-para">
            ODIN (Observation &amp; Detection Interpreted by Neural-networks) is a student-led
            experiment focused on assessing the practicality of Artificial Intelligence systems
            operating directly on space hardware. ODIN combines high-energy electromagnetic
            radiation sensing with onboard AI to explore how AI can optimize science data return
            when bandwidth and time are limited.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-heading">Objectives</h2>
          <ul className="about-list">
            <li>Evaluate the feasibility of embedding AI on space hardware</li>
            <li>Produce histograms of high-energy gamma ray radiation</li>
            <li>Demonstrate a small form factor and low cost platform for space-based AI experiments</li>
            <li>Develop a full ground segment for data telemetry and visualization</li>
            <li>Provide a real-time dashboard to display payload health and data</li>
          </ul>
        </section>

        <section className="about-section">
          <h2 className="about-heading">Hardware</h2>
          <ul className="about-list">
            <li>Two Spectrometers</li>
            <li>One Jetson Orin Nano</li>
            <li>One STM32</li>
            <li>One Iridium 9704 Antenna</li>
          </ul>
        </section>

        <section className="about-section">
          <h2 className="about-heading">The Team</h2>
          <ul className="about-list">
            <li><span className="role">Director, Astronautical Engineering</span> Professor Jeff Volosin</li>
            <li><span className="role">Principal Investigator</span> Professor Rishabh Maharaja</li>
            <li><span className="role">Team Lead</span> Elijah Mister</li>
            <li><span className="role">Deputy Team Lead / Power &amp; Instrumentation Lead</span> Owen Coffee</li>
            <li><span className="role">Mechanical Lead</span> James Gross</li>
            <li><span className="role">Comms Lead</span> Eddie Zhou</li>
            <li><span className="role">Flight Software Lead</span> Daniel Geer</li>
            <li><span className="role">AI &amp; Data Lead</span> Taylor Fryer</li>
            <li><span className="role">Mechanical</span> Phil Alsop</li>
            <li><span className="role">Flight Software</span> Zoé Denito</li>
            <li><span className="role">AI &amp; Data</span> Jason Gedlu</li>
            <li><span className="role">AI &amp; Data</span> Joe Moser</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
