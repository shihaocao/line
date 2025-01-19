export class BodyContext {
    public lineOpacity: number = 1;
    public bodyOpacity: number = 1;
}

export class AnimationContext {
    public brightness: number = 1; // Default brightness
    public micVolume: number = 0.5; // Default mic volume
    public debugOpacity: number = 0;

    public mainBodyContext: BodyContext
    public debugBodyContext: BodyContext

    // No constructor logic needed unless defaults are complex
}

export const animationContext = new AnimationContext();
