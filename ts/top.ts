function main(){
    let cog = new Cog(200, 200, 12);
    let canvas : HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    if(ctx !== null){
        cog.draw(ctx);
    }
}

window.addEventListener("DOMContentLoaded", (event) => {
    main();
});