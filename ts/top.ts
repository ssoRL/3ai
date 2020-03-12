function main(){
    let cog12 = new Cog(200, 200, 12, true);
    let cog6 = new Cog(200 + 114 + 57 + 30, 200, 6, false);
    let canvas : HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    if(ctx !== null){
        cog12.draw(ctx);
        cog6.draw(ctx);
    }
}

window.addEventListener("DOMContentLoaded", (event) => {
    main();
});