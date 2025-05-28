export class GameScheduler {

    private absoluteTime: number = 0;

    private lastBpmBeat: number = 0;

    private beat: number = 0;

    private requestedBpm: number | undefined = undefined;

    // Beats per microsecond
    private microsecondsPerBeat: number;

    // Represents the scheduled tasks for each beat.
    private scheduledTasks: Map<number, { promise: Promise<void>, resolve: () => void, task: () => void }> = new Map();

    constructor(bpm?: number) {
        // Convert BPM to microseconds per beat
        this.microsecondsPerBeat = this.bpmToMicrosecondsPerBeat(bpm ?? 60);
    }

    /**
     * Update the game scheduler.
     * This method should be called every frame to update the game state.
     * @param delta Time delta in microseconds since the last update.
     */
    public update(delta: number): void {
        this.absoluteTime += delta;

        while (true) {
            const lastBeatTime = this.lastBpmBeat + (this.beat * this.microsecondsPerBeat);
            const nextBeatTime = lastBeatTime + this.microsecondsPerBeat;

            if (this.absoluteTime < nextBeatTime) break;
            if (this.requestedBpm !== undefined) {
                this.microsecondsPerBeat = this.bpmToMicrosecondsPerBeat(this.requestedBpm);
                this.lastBpmBeat = this.absoluteTime;
                this.requestedBpm = undefined;
                continue;
            }

            this.beat++;
            console.log(this.scheduledTasks);

            const taskEntry  = this.scheduledTasks.get(this.beat);
            if (taskEntry ) {
                try {
                    taskEntry .task();
                    taskEntry .resolve();
                } catch (e) {
                    console.error('Scheduled task failed at beat', this.beat, e);
                }
                this.scheduledTasks.delete(this.beat);
            }
        }
    }

    public getCurrentBeat(): number {
        return this.beat;
    }

    public getFractionalBeat(): number {
        const lastBeatTime = this.lastBpmBeat + (this.beat * this.microsecondsPerBeat);
        const nextBeatTime = lastBeatTime + this.microsecondsPerBeat;
        return (this.absoluteTime - lastBeatTime) / (nextBeatTime - lastBeatTime);
    }

    public setBpm(bpm: number): void {
        this.requestedBpm = bpm;
    }

    /**
     * Schedule a task to be executed at a specific beat.
     * @param beatNumber The beat number at which the task should be executed.
     * @param task The task to be executed.
     */
    public scheduleTask(beatNumber: number, task: () => void): Promise<void> {
        if (beatNumber <= this.beat) {
            return Promise.reject(new Error('Cannot schedule a task for a beat that has already passed'));
        }

        let resolveTask!: () => void;
        const promise = new Promise<void>((resolve) => { resolveTask = resolve; });
        this.scheduledTasks.set(beatNumber, { promise, resolve: resolveTask, task });
        return promise;
    }

    /**
     * Schedule a task to be executed in a specific number of beats from the current beat.
     * @param beatNumber The number of beats from the current beat at which the task should be executed.
     * @param task The task to be executed.
     */
    public scheduleTaskIn(beatCount : number, task: () => void): Promise<void> {
        return this.scheduleTask(this.beat + beatCount, task);
    }

    public reset(bpm?: number): void {
        this.beat = 0;
        this.absoluteTime = 0;
        this.lastBpmBeat = 0;
        this.scheduledTasks.clear();

        // Reset BPM if provided
        // This allow for an instant reset of the BPM without waiting for the next beat
        if(bpm) {
            this.setBpm(bpm);
        }
    }

    private bpmToMicrosecondsPerBeat(bpm: number): number {
        return (60 / bpm) * 1000000;
    }
}