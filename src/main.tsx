import { initializeAnimation } from './animation_setup.tsx';
import { MicVolume } from './mic_volume.tsx';
import {animationContext} from './context.tsx';

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// Create the black landing page
const landingPage = document.createElement('div');
landingPage.style.position = 'absolute';
landingPage.style.width = '100%';
landingPage.style.height = '100%';
landingPage.style.backgroundColor = 'black';
landingPage.style.display = 'flex';
landingPage.style.justifyContent = 'center';
landingPage.style.alignItems = 'center';
landingPage.style.zIndex = '10';
landingPage.style.transition = 'opacity 1s ease';
document.body.appendChild(landingPage);

// Create the "Enter" button
const enterButton = document.createElement('button');
enterButton.innerText = 'hello, enjoy';
enterButton.style.padding = '10px 20px';
enterButton.style.fontSize = '20px';
enterButton.style.border = 'none';
enterButton.style.borderRadius = '5px';
enterButton.style.cursor = 'pointer';
enterButton.style.backgroundColor = '#000';
enterButton.style.color = '#fff';
enterButton.style.transition = 'transform 0.2s ease';

enterButton.addEventListener('mouseenter', () => {
    enterButton.style.transform = 'scale(1.1)';
});
enterButton.addEventListener('mouseleave', () => {
    enterButton.style.transform = 'scale(1)';
});

landingPage.appendChild(enterButton);

// Audio setup
const audioElement = new Audio('/audio/as_the_world_falls_down_aaron_richards_cover.mp3');
audioElement.loop = true;

// Handle "Enter" button click
enterButton.addEventListener('click', () => {
    // Start playing audio
    audioElement.play().catch((error) => {
        console.error('Error playing audio:', error);
    });

    // Fade out the landing page
    landingPage.style.opacity = '0';

    // Initialize MicVolume with the audio element
    const micVolume = new MicVolume(audioElement);

    // After fade-out, remove the landing page and initialize animation
    setTimeout(() => {
        landingPage.remove();
        initializeAnimation(document); // Initialize the animation

        // Start monitoring volume
        setInterval(() => {
            const volume = micVolume.updateVolume();
            animationContext.micVolume = volume;
            // console.log('Average Volume:', volume);
        }, 20); // Update volume every 100ms
    }, 1000); // Match the fade-out duration (1s)
});
