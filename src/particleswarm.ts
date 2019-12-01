export interface Particle {
    position: [number, number];
    velocity: [number, number];

    bestLocal: Particle['position'];
    bestGlobal: Particle['position'];
}

type InitialPositions = Particle['position'][];

export class Particleswarm {
    // inertia
    w: number = 0.5;

    // acceleration
    c_l: number = 0.5;
    c_g: number = 0.5;

    // stochastic
    r_l: number = 0.5;
    r_g: number = 0.5;

    particles: Particle[];

    constructor(
        initialPositions: InitialPositions,
        private readonly ratingFnc: (pos: Particle['position']) => number,
        private readonly isBetter = (a: number, b: number) => a < b
    ) {
        this.particles = this.constructInitialParticles(initialPositions);
    }

    constructInitialParticles(initialPositions: InitialPositions): Particle[] {
        const particles: Particle[] = initialPositions.map(position => ({
            position,
            velocity: [0, 0],
            bestLocal: position,
            bestGlobal: [0, 0]
        }));

        const best = this.calculateBestGlobal(particles);

        for (const particle of particles)
            particle.bestGlobal = best;

        return particles;
    }

    calculateNewVelocity(p: Particle) {
        const newVelocity = [0, 0];

        for (let i = 0; i < 2; i++)
            newVelocity[i] = this.w * p.velocity[i]
                + this.c_l * this.r_l * (p.bestLocal[i] - p.position[i])
                + this.c_g * this.r_g * (p.bestGlobal[i] - p.position[i]);

        return newVelocity as Particle['velocity'];
    }

    calculateBestLocal(particle: Particle): Particle['position'] {
        return this.isBetter(
            this.ratingFnc(particle.position),
            this.ratingFnc(particle.bestLocal)
        ) ? particle.position : particle.bestLocal;
    }

    calculateBestGlobal(particles: Particle[]): Particle['position'] {
        let best = particles[0].position;
        let bestRating = this.ratingFnc(best);

        for (let i = 1; i < particles.length; i++) {
            const current = particles[i].bestLocal;
            const currentRating = this.ratingFnc(current);

            if (this.isBetter(currentRating, bestRating)) {
                best = current;
                bestRating = currentRating;
            }
        }

        return best;
    }

    calculateNewPosition(p: Particle) {
        const newPosition = [0, 0];

        for (let i = 0; i < 2; i++)
            newPosition[i] = p.position[i] + p.velocity[i];

        return newPosition as Particle['position'];
    }

    calculateSpread() {
        const rating: number[] = new Array(this.particles.length);
        let mediumRating = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const currentRating = this.ratingFnc(this.particles[i].position);;
            rating[i] = currentRating;
            mediumRating += currentRating;
        }

        mediumRating /= this.particles.length;

        let spread = 0;

        for (let i = 0; i < rating.length; i++)
            spread += Math.abs(rating[i] - mediumRating);

        return spread /= rating.length;
    }

    updateParticles(particles = this.particles) {
        const spreadBefore = this.calculateSpread();

        for (const particle of particles) {
            particle.velocity = this.calculateNewVelocity(particle);
            particle.position = this.calculateNewPosition(particle);
            particle.bestLocal = this.calculateBestLocal(particle);
        }

        const spreadAfter = this.calculateSpread();

        const best = this.calculateBestGlobal(particles);

        for (const particle of particles)
            particle.bestGlobal = best;

        return spreadBefore - spreadAfter;
    }
}