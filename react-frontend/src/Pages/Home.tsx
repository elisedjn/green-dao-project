import React, { useContext } from 'react';
import Button from '../Components/Atoms/Button';
import Subtitle from '../Components/Atoms/Subtitle';
import ImpactCard from '../Components/Molecules/ImpactCard';
import ProjectCard from '../Components/Molecules/ProjectCard';
import Navbar from '../Components/Molecules/Navbar';
import Footer from '../Components/Molecules/Footer';
import './Home.scss';
import { GlobalContext } from '../utils/GlobalContext';

const Home = () => {
  const { highlightedProjects, ourImpact } = useContext(GlobalContext);
  return (
    <div className='home-page'>
      <Navbar />
      <div className='inner-homepage'>
        <div className='intro'>
          Welcome to D2R! We are a non-profit organization with a mission to drive
          positive environmental impact. Scroll down to learn about the regenerative
          projects we support, and how you can get involved.
        </div>
        <div className='highlighted-projects'>
          <Subtitle>Currently impacting these Projects</Subtitle>
          <div className='projects-list'>
            {highlightedProjects.map((project, index) => (
              <ProjectCard project={project} key={index} /> //key is mandatory when rendering a component inside a map
            ))}
          </div>
        </div>
        <div className='dao-description'>
          <div className='one-text'>
            <h5>What is it?</h5>
            <p>
              EnviDAO is a non-profit, decentralized organization established to discover,
              promote, and fund global environmental regeneration initiatives. We aim to
              provide a simple, efficient way for anyone to contribute to a curated
              selection of high-impact, low-overhead sustainability projects. Donations
              can be contributed to our funding pool with your credit card, or you can use
              your web3 browser wallet to get involved and help guide our mission!
            </p>
            <Button onClick={() => console.log('Donate!')}>Donate Now</Button>
          </div>

          <div className='one-text'>
            <h5>Wanna join?</h5>
            <p>
              100% of funds collected by this project are sent directly and automatically
              to the protocols voted most impactful by our members. Funding proposals,
              votes, and monetary transactions are secured and made fully transparent by
              the Ethereum(Rinkeby) blockchain. Membership is open to any individual human
              interested learning about in ReFi (regenerative finance) initiatives and
              contributing to positive environmental impact.
            </p>
            <Button onClick={() => console.log('Join!')}>Join</Button>
          </div>
        </div>
        {!!ourImpact && (
          <div className='dao-impact'>
            <Subtitle>Donate to Regenerate impact</Subtitle>
            <ImpactCard {...ourImpact} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
