import { initializeAnimation } from './animation_setup.tsx';
import { MicVolume } from './mic_volume.tsx';
import { animationContext } from './context.tsx';

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// Create the black landing page
const landingPage = document.createElement('div');
landingPage.className = 'absolute inset-0 bg-black flex justify-center items-center z-10 transition-opacity duration-1000';
document.body.appendChild(landingPage);

// Create the "Enter" button
const enterButton = document.createElement('button');
enterButton.innerText = 'hello, connect to speakers or headphones!';
enterButton.className = 'px-4 py-2 text-lg border-none rounded-md cursor-pointer bg-black text-white transition-transform duration-200 hover:scale-110';
landingPage.appendChild(enterButton);

// Audio setup for two tracks
const audioElement1 = new Audio('/audio/v3.mp3');
const audioElement2 = new Audio('/audio/as_the_world_falls_down_aaron_richards_cover.mp3');

audioElement1.loop = false;
audioElement2.loop = true;
audioElement1.volume = 1;
audioElement2.volume = 1;

// Function to play track 1 and wait for it to finish before playing track 2
const playTracks = async () => {
    try {
        await audioElement1.play();
        await new Promise(resolve => audioElement1.addEventListener('ended', resolve, { once: true }));
        await audioElement2.play(); // Starts looping after track 1 finishes
    } catch (error) {
        console.error('Error playing audio:', error);
    }
};


// Word timing configuration
const per_word_timeouts = [0, 1500, 1000, 800, 2000]; // last entry is the hold
const sum_timeouts_ms = per_word_timeouts.reduce((acc, num) => acc + num, 0);
const total_timeout_on_word = per_word_timeouts.map((_, index, array) =>
    array.slice(0, index + 1).reduce((acc, num) => acc + num, 0)
);
const intermediate_fadeout = 500;

// Create the intermediate page
const createIntermediatePage = () => {
    const intermediatePage = document.createElement('div');
    intermediatePage.className = 'absolute inset-0 bg-black flex justify-center items-center z-10 opacity-100 transition-opacity duration-1000';
    intermediatePage.style.transform = 'translateY(-5%)'; // Move everything up slightly
    document.body.appendChild(intermediatePage);

    const words = ['Listen', 'to', 'the', 'Line'];
    words.forEach((word, index) => {
        const wordElement = document.createElement('div');
        wordElement.innerText = word;
        wordElement.className = `text-white text-3xl font-bold opacity-0 transition-opacity duration-1000`;
        wordElement.style.transform = `translateY(${index * 25}px)`; // Reduce stacking gap
        intermediatePage.appendChild(wordElement);

        // Fade in words one by one
        setTimeout(() => {
            wordElement.classList.add('opacity-100');
        }, total_timeout_on_word[index]);
    });

    // Fade out the intermediate page before transitioning
    setTimeout(() => {
        intermediatePage.classList.remove('opacity-100'); // Remove full opacity
        intermediatePage.classList.add('opacity-0'); // Apply fade-out effect
    }, sum_timeouts_ms - intermediate_fadeout); // Start fade-out 1s before transition

    // Remove page & start animation after fade-out
    setTimeout(() => {
        intermediatePage.remove();
        initializeAnimation(document); // Initialize the animation
    }, sum_timeouts_ms);
};


// Handle "Enter" button click
enterButton.addEventListener('click', () => {
    // Start playing audio
    playTracks();

    // Fade out the landing page
    landingPage.classList.add('opacity-0');

    setTimeout(() => {
        landingPage.remove();
        createIntermediatePage(); // Show the intermediate page
    }, 1000); // Match the fade-out duration (1s)
});
