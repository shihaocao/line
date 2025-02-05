export class BodyContext {
    public lineOpacity: number = 1;
    public bodyOpacity: number = 1;
    public tail_length_factor: number = 1;
    public sat: number = 0;
    public hue: number = 1;
    public lightness: number = 1;
}

export class AnimationContext {
    public physics_timestep: number = 0;
    public phsyics_multipler: number = 1.2;
    public restoring_multiplier: number = 1;
    public drag_multipler: number = 1;

    public camera_rot: number = 1;
    public snow_speed: number = 0.5;

    public render_buffer_height_max: number = 800; // I'm too lazy to make a constants file
    public render_buffer_height: number = 500;
    public render_aspect_ratio: number = 16/9;

    public time_elapsed: number = 0;
    public brightness: number = 1; // Default brightness
    public micVolume: number = 0.5; // Default mic volume
    public debugOpacity: number = 0;

    public debug_fade_in_end_s: number = 90 - 5;
    public debug_fade_in_start_s: number = this.debug_fade_in_end_s - 22;
    public debug_fade_out_end_s: number = this.debug_fade_in_end_s + 3;

    public mainBodyContext: BodyContext = new BodyContext();
    public debugBodyContext: BodyContext = new BodyContext();
    public debugBodyContext2: BodyContext = new BodyContext();
    public offBodyContext: BodyContext = new BodyContext();
    // No constructor logic needed unless defaults are complex
}

export const animationContext = new AnimationContext();
animationContext.debugBodyContext.bodyOpacity = 0;
animationContext.debugBodyContext.lineOpacity = 0;
animationContext.mainBodyContext.lineOpacity = 0.7;
animationContext.offBodyContext.bodyOpacity = 0;
animationContext.offBodyContext.lineOpacity = 0;
const saturation = 0.7; // Fixed pastel-like saturation
const lightness = 0.7; // Fixed pastel-like lightness
animationContext.debugBodyContext.sat = saturation;
animationContext.debugBodyContext2.sat = saturation;
animationContext.debugBodyContext.lightness = lightness;
animationContext.debugBodyContext2.lightness = lightness;
animationContext.debugBodyContext2 = structuredClone(animationContext.debugBodyContext);
animationContext.debugBodyContext.hue = 195/360;
animationContext.debugBodyContext2.hue = 318/360;