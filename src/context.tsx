export class BodyContext {
    public lineOpacity: number = 1;
    public bodyOpacity: number = 1;
}

export class AnimationContext {
    public brightness: number = 1; // Default brightness
    public micVolume: number = 0.5; // Default mic volume
    public debugOpacity: number = 0;

    public mainBodyContext: BodyContext = new BodyContext();
    public debugBodyContext: BodyContext = new BodyContext();

    // No constructor logic needed unless defaults are complex
}

export const animationContext = new AnimationContext();
animationContext.debugBodyContext.bodyOpacity = 0;
animationContext.debugBodyContext.lineOpacity = 0;