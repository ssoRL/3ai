class CogRendererProvider{
    private static renderers: Map<number, InvoluteCogRenderer> = new Map();

    public static getRenderer(tooth_count: number): InvoluteCogRenderer{
        let current_renderer = CogRendererProvider.renderers.get(tooth_count);
        if(current_renderer !== undefined){
            // If there is already a renderer of this number, return it to reuse the path
            return current_renderer;
        }else{
            // otherwise, create a new one and save it for future use
            let new_renderer = new InvoluteCogRenderer(tooth_count);
            CogRendererProvider.renderers.set(tooth_count, new_renderer);
            return new_renderer;
        }
    }
}