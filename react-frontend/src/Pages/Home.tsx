import React from 'react';
import Button from '../Components/Atoms/Button';
import Subtitle from '../Components/Atoms/Subtitle';
import ImpactCard from '../Components/Molecules/ImpactCard';
import ProjectCard from '../Components/Molecules/ProjectCard';
import Navbar from '../Components/Molecules/Navbar';
import { Project } from '../utils/types';
import './Home.scss';

const Home = () => {
  //Later we will get the highlighted project id with a view function from the smart contract and get the corresponding data from the data base. From now we just use dummy data.
  const sampleProjects: Project[] = [
    {
      id: 0,
      title: 'Sample Project 1',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
      image:
        'https://images.theconversation.com/files/137600/original/image-20160913-4948-6fyxz.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=900.0&fit=crop',
      link: '',
    },
    {
      id: 1,
      title: 'Sample Project 2',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. ',
      image: 'https://storage.googleapis.com/pod_public/1300/120225.jpg',
      link: '',
    },
    {
      id: 2,
      title: 'Sample Project 3',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
      image:
        'https://thumbs.dreamstime.com/b/large-group-african-safari-animals-wildlife-conservation-concept-174172993.jpg',
      link: '',
    },
  ];
  return (
    <div className='home-page'>
      <Navbar />
      <div className='inner-homepage'>
        <div className='intro'>
          Welcome to D2R! We are a non-profit organization with a mission to drive
          positive environmental impact. Scroll down to learn about the regenerative
          projects we support, and how you can get involved.
        </div>
        <Button onClick={() => console.log('contribute')}>Contribute</Button>
        <div className='highlighted-projects'>
          <Subtitle>Currently impacting these Projects</Subtitle>
          <div className='projects-list'>
            {sampleProjects.map((project, index) => (
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
        <div className='dao-impact'>
          <Subtitle>ENVIDAO impact</Subtitle>
          <ImpactCard
            balance={10}
            members={20}
            projectsContributed={30}
            donators={100}
            alreadySent={50}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
