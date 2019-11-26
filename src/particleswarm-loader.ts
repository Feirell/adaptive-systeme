import { PRNG } from './prng';
import { Particleswarm, Particle } from "./particleswarm";

const functionToBeInvestigate = (x: number, y: number) => (1 - x) ** 2 + 100 * (y - x ** 2) ** 2;

const drawFunction = (imageData: ImageData, fnc: (x: number, y: number) => number, scale: number, resScale: number) => {
    const height = imageData.height;
    const width = imageData.width;

    let max = fnc(0, 0);

    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++) {
            const scaledY = scale * (y - height * 0.5);
            const scaledX = scale * (x - width * 0.5);

            const c = fnc(scaledX, scaledY);
            if (c > max)
                max = c;
        }

    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++) {
            const scaledY = scale * (y - height * 0.5);
            const scaledX = scale * (x - width * 0.5);

            const res = fnc(scaledX, scaledY);
            // const resScaled = 1 - 1 / (1 + res * resScale);
            const resScaled = res / max;

            const start = (x * width + y) * 4;
            imageData.data[start + 0] = resScaled * 255;
            imageData.data[start + 1] = resScaled * 255;
            imageData.data[start + 2] = resScaled * 255;
            imageData.data[start + 3] = 255;
        }

    return imageData;
}

const drawParticles = (imageData: ImageData, particles: Particle[], scale: number) => {
    const height = imageData.height;
    const width = imageData.width;

    // for (let x = 0; x < width; x++)
    //     for (let y = 0; y < height; y++) {
    //         const scaledY = scale * (y - height * 0.5);
    //         const scaledX = scale * (x - width * 0.5);

    //     }


    const drawRectangle = (x: number, y: number) => {
        for (let xd = -1; xd < 2; xd++)
            for (let yd = -1; yd < 2; yd++) {
                const index = ((x + xd) * width + (y + yd)) * 4;

                imageData.data[index + 0] = 255;
                imageData.data[index + 1] = 0;
                imageData.data[index + 2] = 0;
                imageData.data[index + 3] = 255;
            }
    }

    for (const particle of particles) {
        const pos = particle.position;

        const unscaledX = Math.round(pos[0] / scale + height * 0.5);
        const unscaledY = Math.round(pos[1] / scale + width * 0.5);

        drawRectangle(unscaledX, unscaledY);
    }

    return imageData;
}

document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.getElementsByTagName('main')[0];
    const canvasElement = document.getElementsByTagName('canvas')[0] as HTMLCanvasElement;

    const width = 600;
    const height = 600;

    canvasElement.setAttribute('width', '' + width);
    canvasElement.setAttribute('height', '' + height);

    const context = canvasElement.getContext('2d');

    const scale = 0.5;
    const imageData = context.createImageData(width, height);
    drawFunction(imageData, functionToBeInvestigate, scale, 0.0005);
    context.putImageData(imageData, 0, 0);

    const prng = new PRNG(0x00FEA123);

    const initialPosition = [];

    for (let i = 0; i < 100; i++) {
        initialPosition.push([
            (prng.nextFloat() - 0.5) * width,
            (prng.nextFloat() - 0.5) * height
        ]);
    }

    const ps = new Particleswarm(initialPosition,
        pos => functionToBeInvestigate(pos[0], pos[1]),
        (a, b) => a < b);

    const copy = imageData.data.slice(0);

    let k = 10;
    const loop = () => {
        imageData.data.set(copy);
        ps.updateParticles();
        context.putImageData(drawParticles(imageData, ps.particles, scale), 0, 0);
        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
});