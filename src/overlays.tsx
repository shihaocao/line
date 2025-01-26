import { getReadmeContent } from './blurb.tsx';
import { animationContext } from './context.tsx';

export function setup_overlays(document: Document) {
    // Create container for overlays and slider
    const container = document.createElement('div');
    container.className = `
        absolute top-12 left-2 bg-black/50 text-white rounded-lg p-2 space-y-2 
        overflow-hidden hidden transition-[max-height] duration-500 ease-in-out
    `;
    document.body.appendChild(container);

    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = `
        absolute top-2 left-2 bg-black/70 text-white rounded-lg p-2 text-sm flex items-center 
        focus:outline-none transition-transform duration-300 ease-in-out
    `;
    hamburger.innerText = '☰'; // Hamburger icon
    document.body.appendChild(hamburger);

    // Add toggle functionality to the hamburger menu
    hamburger.addEventListener('click', () => {
        const isHidden = container.classList.contains('hidden');
        container.classList.toggle('hidden', !isHidden);
        hamburger.classList.toggle('rotate-90', !isHidden); // Rotate icon when expanded
    });

    // Add overlays
    const overlay = document.createElement('div');
    overlay.className = `p-2 bg-black/50 rounded-lg text-sm`;
    overlay.innerText = 'Physics Timesteps: 0';
    container.appendChild(overlay);

    const volumeOverlay = document.createElement('div');
    volumeOverlay.className = `p-2 bg-black/50 rounded-lg text-sm`;
    volumeOverlay.innerText = 'Mic Volume: 0';
    container.appendChild(volumeOverlay);

    function add_slider(label_name: string) {
        // Add slider
        const sliderContainer = document.createElement('div');
        sliderContainer.className = `
            p-2 bg-black/50 rounded-lg text-sm flex items-center space-x-2
        `;

        const sliderLabel = document.createElement('label');
        sliderLabel.className = `mr-2`;
        sliderLabel.innerText = label_name;
        const slider = document.createElement('input');
        slider.type = 'range';
 
        slider.step = '0.01';
        slider.className = `w-full`;

        sliderContainer.appendChild(sliderLabel);
        sliderContainer.appendChild(slider);
        container.appendChild(sliderContainer);

        return slider;
    }

    {
        const slider = add_slider('Show Debug');
        slider.min = '0';
        slider.max = '1';
        slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            animationContext.debugBodyContext.lineOpacity = value;
            animationContext.debugBodyContext.bodyOpacity = value;
        });    
    }
    {
        const slider = add_slider('Tail Length');
        slider.min = '0';
        slider.max = '1';
        // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            animationContext.debugBodyContext.tail_length_factor = value;
            animationContext.mainBodyContext.tail_length_factor = value;
        });    
    }

    {
        const slider = add_slider('Speed');
        slider.min = '0.5';
        slider.max = '2';
        slider.value = `${animationContext.phsyics_multipler}`;
        // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            animationContext.phsyics_multipler = value;
        });    
    }

    {
        const slider = add_slider('Restoring');
        slider.min = '0.1';
        slider.max = '3';
        slider.value = `${animationContext.restoring_multiplier}`;
        // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            animationContext.restoring_multiplier = value;
        });    
    }

    {
        const slider = add_slider('Camera Rot');
        slider.min = '0.1';
        slider.max = '2';
        slider.value = `${animationContext.camera_rot}`;
        // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            animationContext.camera_rot = value;
        });    
    }

    {
        const slider = add_slider('Snow Speed');
        slider.min = '0.1';
        slider.max = '3';
        slider.value = `${animationContext.snow_speed}`;
        // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            animationContext.snow_speed = value;
        });    
    }

    // I don't really like drag because my phsyics engine doesn't simulate drag well.
    // Nor do I simulate it well
    // {
    //     const slider = add_slider('Drag');
    //     slider.min = '0.1';
    //     slider.max = '1000';
    //     slider.value = `${animationContext.drag_multipler}`;
    //     // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
    //     slider.addEventListener('input', () => {
    //         const value = parseFloat(slider.value);
    //         animationContext.restoring_multiplier = value;
    //     });    
    // }

    // Create scrolling overlay
    const scrollingOverlay = document.createElement('div');
    scrollingOverlay.className = `
        absolute bottom-5 left-[10%] right-[10%] h-[10%] overflow-y-auto p-2 
        bg-black/70 text-white rounded-lg text-sm leading-relaxed 
        shadow-md transition-all duration-300 ease-in-out
    `;
    scrollingOverlay.innerHTML = getReadmeContent();

    // Add mouseover and mouseout event listeners
    scrollingOverlay.addEventListener('mouseover', () => {
        scrollingOverlay.classList.remove('h-[10%]');
        scrollingOverlay.classList.add('h-[25%]');
    });

    scrollingOverlay.addEventListener('mouseout', () => {
        scrollingOverlay.classList.remove('h-[25%]');
        scrollingOverlay.classList.add('h-[10%]');
    });

    document.body.appendChild(scrollingOverlay);

    // Add fade mask
    const fadeMask = document.createElement('div');
    fadeMask.className = `
        absolute top-0 left-0 w-full h-full bg-black pointer-events-none 
        transition-opacity duration-100 ease-in-out
    `;
    document.body.appendChild(fadeMask);

    // Return an update function
    return function update_overlays() {
        fadeMask.style.opacity = `${1 - animationContext.brightness}`;

        overlay.innerText = `Physics Timesteps: ${animationContext.physics_timestep}`;
        volumeOverlay.innerText = `Mic Volume: ${animationContext.micVolume}`;
    };
}
