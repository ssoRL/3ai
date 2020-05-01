class CogRendererProvider{
    private static driver_renderers: Map<number, InvoluteCogRenderer> = new Map();
    private static driven_renderers: Map<number, InvoluteCogRenderer> = new Map();

    public static getRenderer(tooth_count: number, is_driver: boolean): InvoluteCogRenderer{
        let current_renderer = is_driver 
            ? CogRendererProvider.driver_renderers.get(tooth_count)
            : CogRendererProvider.driven_renderers.get(tooth_count);
        if(current_renderer !== undefined){
            // If there is already a renderer of this number, return it to reuse the path
            return current_renderer;
        }else{
            // otherwise, create a new one and save it for future use
            let new_renderer = new InvoluteCogRenderer(tooth_count, is_driver);
            if(is_driver) {
                CogRendererProvider.driver_renderers.set(tooth_count, new_renderer);
            } else {
                CogRendererProvider.driven_renderers.set(tooth_count, new_renderer);
            }
            return new_renderer;
        }
    }
}