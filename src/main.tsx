import { initializeAnimation } from './animation_setup.tsx';

// Initialize the animation setup
initializeAnimation(document);

// Audio setup
const audioElement = new Audio('src/audio/as_the_world_falls_down_aaron_richards_cover.mp3');
audioElement.loop = true;

document.body.addEventListener('click', () => {
    audioElement.play().catch((error) => {
        console.error('Error playing audio:', error);
    });
});
