export class BodyContext {
    public lineOpacity: number = 1;
    public bodyOpacity: number = 1;
    public tail_length_factor: number = 1;
}

export class AnimationContext {
    public physics_timestep: number = 0;
    public phsyics_multipler: number = 1.2;
    public restoring_multiplier: number = 1;
    public drag_multipler: number = 1;

    public camera_rot: number = 1;
    public snow_speed: number = 0.5;

    public render_buffer_height_max: number = 800; // I'm too lazy to make a constants file
    public render_buffer_height: number = 400;
    public render_aspect_ratio: number = 16/9;

    public time_elapsed: number = 0;
    public brightness: number = 1; // Default brightness
    public micVolume: number = 0.5; // Default mic volume
    public debugOpacity: number = 0;

    public mainBodyContext: BodyContext = new BodyContext();
    public debugBodyContext: BodyContext = new BodyContext();
    public offBodyContext: BodyContext = new BodyContext();
    // No constructor logic needed unless defaults are complex
}

export const animationContext = new AnimationContext();
animationContext.debugBodyContext.bodyOpacity = 0;
animationContext.debugBodyContext.lineOpacity = 0;
animationContext.mainBodyContext.lineOpacity = 0.5;
animationContext.offBodyContext.bodyOpacity = 0;
animationContext.offBodyContext.lineOpacity = 0;
