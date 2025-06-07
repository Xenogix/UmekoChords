class ScheduledTask {
    public readonly beat: number;
    public readonly promise: Promise<void>;
    public readonly task: () => void;
    public resolve: () => void = () => {};

    constructor(beat: number, task: () => void) {
        this.beat = beat;
        this.task = task;
        this.promise = new Promise<void>((resolve) => {
            this.resolve = resolve;
        });
    }
}

export class GameScheduler {

    private readonly beatSubdivision: number = 16;

    private absoluteTime: number = 0;

    private bpmChangeAbsoluteTime: number = 0;

    private bpmChangeBeat: number = 0;

    private beat: number = 0;

    private requestedBpm: number | undefined = undefined;

    private microsecondsPerBeat: number;

    // Represents the scheduled tasks for each beat.
    private scheduledTasks: Array<ScheduledTask> = new Array();

    constructor(bpm?: number) {
        // Convert BPM to microseconds per beat subdivision
        this.microsecondsPerBeat = this.bpmToMicrosecondsPerBeat(bpm ?? 60) / this.beatSubdivision;
    }

    /**
     * Update the game scheduler.
     * This method should be called every frame to update the game state.
     * @param delta Time delta in microseconds since the last update.
     */
    public update(delta: number): void {
        this.absoluteTime += delta;

        while (true) {
            const lastBeatTime = this.bpmChangeAbsoluteTime + ((this.beat - this.bpmChangeBeat) * this.microsecondsPerBeat);
            const nextBeatTime = lastBeatTime + this.microsecondsPerBeat;

            if (this.absoluteTime < nextBeatTime) break;
            if (this.requestedBpm !== undefined) {
                this.microsecondsPerBeat = this.bpmToMicrosecondsPerBeat(this.requestedBpm) / this.beatSubdivision;
                this.bpmChangeAbsoluteTime = this.absoluteTime;
                this.bpmChangeBeat = this.beat;
                this.requestedBpm = undefined;
                continue;
            }

            this.beat++;

            const tasksForCurrentBeat = this.scheduledTasks.filter(task => task.beat === this.beat);
            for (const taskEntry of tasksForCurrentBeat) {
                try {
                    taskEntry.task();
                    taskEntry.resolve();
                } catch (e) {
                    console.error('Scheduled task failed at beat', this.beat, e);
                }
            }
            this.scheduledTasks = this.scheduledTasks.filter(task => task.beat !== this.beat);
        }
    }

    public getCurrentBeat(): number {
        return Math.floor(this.beat / this.beatSubdivision);
    }

    public getFractionalBeat(): number {
        const lastBeatTime = this.bpmChangeAbsoluteTime + ((this.beat - this.bpmChangeBeat) * this.microsecondsPerBeat);
        const nextBeatTime = lastBeatTime + this.microsecondsPerBeat;
        const fractionalBeat = (this.absoluteTime - lastBeatTime) / (nextBeatTime - lastBeatTime);
        return (this.beat + fractionalBeat) / this.beatSubdivision;
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
        const absoluteBeat = Math.round(beatNumber * this.beatSubdivision);
        if (absoluteBeat <= this.beat) {
            return Promise.reject(new Error('Cannot schedule a task for a beat that has already passed'));
        }

        const scheduledTask = new ScheduledTask(absoluteBeat, task);
        this.scheduledTasks.push(scheduledTask);
        
        return scheduledTask.promise;
    }

    /**
     * Schedule a task to be executed in a specific number of beats from the current beat.
     * @param beatCount The number of beats from the current beat at which the task should be executed.
     * @param task The task to be executed.
     */
    public scheduleTaskIn(beatCount: number, task: () => void): Promise<void> {
        return this.scheduleTask((this.beat / this.beatSubdivision) + beatCount, task);
    }

    public reset(bpm?: number): void {
        this.beat = 0;
        this.absoluteTime = 0;
        this.bpmChangeAbsoluteTime = 0;
        this.scheduledTasks = [];

        if(bpm) {
            this.microsecondsPerBeat = this.bpmToMicrosecondsPerBeat(bpm) / this.beatSubdivision;
            this.requestedBpm = undefined;
        }
    }

    private bpmToMicrosecondsPerBeat(bpm: number): number {
        return (60 / bpm) * 1000000;
    }
}