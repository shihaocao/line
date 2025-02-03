import { getReadmeContent } from './blurb.tsx';
import { animationContext } from './context.tsx';
const animation_delta = 5300; // from sum overlay
export function setup_overlays(document: Document) {


    const createIntermediatePage = (start, words, perWordTime) => {
        const intermediate_fadeout = 2000;
        const hold_time = 2000;
    
        const per_word_timeouts = [
            start,
            ...Array(words.length - 1).fill(perWordTime),
            hold_time + intermediate_fadeout
        ];
    
        const sum_timeouts_ms = per_word_timeouts.reduce((acc, num) => acc + num, 0);
        const total_timeout_on_word = per_word_timeouts.map((_, index, array) =>
            array.slice(0, index + 1).reduce((acc, num) => acc + num, 0)
        );
    
        const intermediatePage = document.createElement('div');
        intermediatePage.className = 'absolute inset-0 flex justify-center items-start pt-32 z-10 opacity-100 transition-opacity duration-3000';
        intermediatePage.style.transition = 'opacity 3s ease-in-out';
        intermediatePage.style.transform = 'translate(-10px, -5%)'; // Shift everything left by 10 pixels
        intermediatePage.style.pointerEvents = 'none';  // Allows clicks to pass through

        document.body.appendChild(intermediatePage);
    
        words.forEach((word, index) => {
            const wordElement = document.createElement('div');
            wordElement.innerText = word;
            wordElement.className = `text-white text-sm font-serif italic font-light opacity-0 transition-opacity duration-1000`;
            wordElement.style.transform = `translateX(${index * 6}px)`;
            intermediatePage.appendChild(wordElement);
    
            setTimeout(() => {
                wordElement.classList.add('opacity-100');
            }, total_timeout_on_word[index]);
        });
    
        setTimeout(() => {
            intermediatePage.classList.remove('opacity-100');
            intermediatePage.classList.add('opacity-0');
        }, sum_timeouts_ms - intermediate_fadeout);
    
        setTimeout(() => {
            intermediatePage.remove();
        }, sum_timeouts_ms);
    };
    
    const s0 = 19 * 1000;
    const s1 = 32.5 * 1000;
    const s2 = 48 * 1000;
    const s3 = 63 * 1000;
    // const s0 = 5 * 1000;
    // const s1 = 10 * 1000;
    // const s2 = 15 * 1000;
    // const s3 = 20 * 1000;

    createIntermediatePage(s0 - animation_delta,
        ['...a ', 'shimmering', 'line', 'spoke', 'to', 'me.'], 170);
    
    createIntermediatePage(s1 - animation_delta,
        ['...empathize ', 'with ', 'the ', 'movements ', 'that ', 'were ', 'out ', 'of ', 'reach.'], 190);
    
    createIntermediatePage(s2 - animation_delta,
        ['...will', 'you', 'show', 'me', 'what', 'is', 'special', 'to', 'you?'], 160);
    

    createIntermediatePage(
        s3 - animation_delta,
        ['...still', 'so', 'much', 'I', 'have', 'yet', 'to', 'unfold.'],
        170
    );

    // "only time will tell how we dance"
    const s4 = 80 * 1000; // Example start time at 75 seconds
    createIntermediatePage(
        s4 - animation_delta,
        ['...only', 'time', 'will', 'tell', 'how', 'we', 'dance.'],
        170
    );

    const container = document.createElement('div');
    container.className = `
        absolute top-12 left-2 bg-black/50 text-white rounded-lg p-2 space-y-2 
        overflow-hidden hidden transition-[max-height] duration-500 ease-in-out
    `;
    document.body.appendChild(container);

    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = `
        absolute top-2 left-2 bg-black/70 text-white rounded-lg p-2 text-md flex items-center 
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

    // Flash the hamburger button after 10 seconds
    setTimeout(() => {
        // Add a flashing animation class
        hamburger.classList.add('flash');
        
        // Remove the flashing class after a short duration
        setTimeout(() => {
            hamburger.classList.remove('flash');
        }, 1000);
    }, animationContext.debug_fade_in_end_s * 1000); // Wait 10 seconds before starting the flash

    // Add overlays
    const overlay = document.createElement('div');
    overlay.className = `p-2 bg-black/50 rounded-lg text-sm`;
    overlay.innerText = 'Physics Timesteps: 0';
    container.appendChild(overlay);

    // Ironic, i'm taking this out because it doesn't add that much.
    // const volumeOverlay = document.createElement('div');
    // volumeOverlay.className = `p-2 bg-black/50 rounded-lg text-sm`;
    // volumeOverlay.innerText = 'Mic Volume: 0';
    // container.appendChild(volumeOverlay);

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

    // {
    //     const slider = add_slider('Speed');
    //     slider.min = '0.5';
    //     slider.max = '2';
    //     slider.value = `${animationContext.phsyics_multipler}`;
    //     // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
    //     slider.addEventListener('input', () => {
    //         const value = parseFloat(slider.value);
    //         animationContext.phsyics_multipler = value;
    //     });    
    // }

    // {
    //     const slider = add_slider('Restoring');
    //     slider.min = '0.1';
    //     slider.max = '3';
    //     slider.value = `${animationContext.restoring_multiplier}`;
    //     // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
    //     slider.addEventListener('input', () => {
    //         const value = parseFloat(slider.value);
    //         animationContext.restoring_multiplier = value;
    //     });    
    // }

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

    {
        const slider = add_slider('Render Res');
        slider.min = '50';
        slider.max = `${animationContext.render_buffer_height_max}`
        slider.value = `${animationContext.render_buffer_height}`;
        // slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            animationContext.render_buffer_height = value;
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

    // Create the container for the overlay and the toggle button
    const overlayContainer = document.createElement('div');
    overlayContainer.className = `
        absolute bottom-5 left-[10%] right-[10%] overflow-hidden 
        rounded-lg transparent text-white text-sm leading-relaxed 
        shadow-md transition-all duration-300 ease-in-out
    `;
    overlayContainer.style.height = "2rem"; // Initial height (only showing the arrow)

    // Create the toggle button
    const toggleButton = document.createElement('div');
    toggleButton.className = "w-full text-center cursor-pointer py-1";
    toggleButton.style.backgroundColor = "transparent";
    toggleButton.innerHTML = "▲"; // Initial arrow pointing up

    // Create the scrolling overlay
    const scrollingOverlay = document.createElement('div');
    scrollingOverlay.className = `
        overflow-y-auto p-2 transition-all duration-300 ease-in-out
    `;
    scrollingOverlay.style.backgroundColor = "transparent"
    scrollingOverlay.style.height = "0"; // Initially hidden
    scrollingOverlay.style.opacity = "0"; // Invisible until expanded
    scrollingOverlay.innerHTML = getReadmeContent();

    // Toggle function for expanding/collapsing
    let expanded = false;
    toggleButton.addEventListener('click', () => {
        expanded = !expanded;
        if (expanded) {
            const rem_height = 16;
            const overlay_rem_height = 2+rem_height;
            scrollingOverlay.style.height = `${rem_height}rem`; // Expanded height
            scrollingOverlay.style.opacity = "1";
            overlayContainer.style.height = `${overlay_rem_height}rem`; // Adjust container height
            toggleButton.innerHTML = "▼"; // Change arrow direction
        } else {
            scrollingOverlay.style.height = "0";
            scrollingOverlay.style.opacity = "0";
            overlayContainer.style.height = "2rem"; // Minimized height
            toggleButton.innerHTML = "▲";
        }
    });

    // Append elements
    overlayContainer.appendChild(toggleButton);
    overlayContainer.appendChild(scrollingOverlay);
    document.body.appendChild(overlayContainer);

    // Add fade mask
    const fadeMask = document.createElement('div');
    fadeMask.className = `
        absolute top-0 left-0 w-full h-full bg-black pointer-events-none 
        transition-opacity duration-100 ease-in-out
    `;
    document.body.appendChild(fadeMask);

    // Effects

    const maxAutoDebugOpacity = 0.3;
    const a = animationContext;
    const fade_in_dur = a.debug_fade_in_end_s - a.debug_fade_in_start_s;
    const fade_out_dur = a.debug_fade_out_end_s - a.debug_fade_in_end_s;
    function debugLineVisibility(elapsed: number) {
        if(elapsed > a.debug_fade_in_start_s && elapsed < a.debug_fade_in_end_s) {
            // Fade in
            const val = maxAutoDebugOpacity * (elapsed - a.debug_fade_in_start_s) / (fade_in_dur);
            animationContext.debugBodyContext.bodyOpacity = val;
            animationContext.debugBodyContext.lineOpacity = val;
        } else if (elapsed > a.debug_fade_in_end_s && elapsed < a.debug_fade_out_end_s) {
            // Fade out
            const val = maxAutoDebugOpacity * (a.debug_fade_out_end_s - elapsed) / (fade_out_dur);
            animationContext.debugBodyContext.bodyOpacity = val;
            animationContext.debugBodyContext.lineOpacity = val;
        }
    }

    // Brightness timing markers
    const fadeInEndTime = 2.0; // seconds
    const fadeOutStartTime = 160.0; // seconds
    const fadeOutEndTime = 180.0; // seconds

    // Calculate brightness based on time
    function calculateBrightness(elapsed: number): number {
        if (elapsed <= fadeInEndTime) {
            return elapsed / fadeInEndTime; // Fade in: interpolate from 0 to 1
        } else {
            return 1; // Between fade in and fade out: brightness is 1
        }
    }

    // Return an update function
    return function update_overlays() {
        debugLineVisibility(animationContext.time_elapsed);
        animationContext.brightness = calculateBrightness(animationContext.time_elapsed);

        fadeMask.style.opacity = `${1 - animationContext.brightness}`;

        overlay.innerText = `Physics Timesteps: ${animationContext.physics_timestep}`;
    };
}
