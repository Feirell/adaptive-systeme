export interface WorkerMessage<Payload> {
    channel: 'normal' | 'error' | 'control',
    type: string,
    payload: Payload,
    timestamp: number
}

export interface TransferError {
    message: string,
    stack: string,
    name: string
}

const makeObjectSimple = (val: any): any => {
    if (val instanceof Error) {
        return { message: val.message, stack: val.stack, name: val.name };
    } else if (typeof val == 'object') {
        const str = JSON.stringify(val, (key, value) => value == val ? value : makeObjectSimple(value));
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error('could not parse:', str, 'from', val);
            return val;
        }
    } else
        return val;
}

export class WorkerHelper<Payload = any> {
    public readonly ready = this.expectType('ready');
    private readyState = false;
    constructor(private readonly worker: Worker = self as any) {
        this.sendControl('ready');
        this.ready.then(() => this.readyState = true);
    }

    async waitForAnyMessage() {
        await this.ready;
        return new Promise<WorkerMessage<any>>((res, rej) => {
            const detach = (event: MessageEvent) => {
                if (!event.target)
                    throw new Error('event.target is falsy');

                event.target.removeEventListener('message', msgListener);
                event.target.removeEventListener('messageerror', errListener);
            }

            const msgListener = ((event: MessageEvent) => {
                detach(event);
                res(event.data);
            }) as EventListener;

            const errListener = ((event: MessageEvent) => {
                detach(event);
                rej(event);
            }) as EventListener;

            this.worker.addEventListener('message', msgListener);
            this.worker.addEventListener('messageerror', errListener);
        })
    }

    async expectType(type: string, throwOnUnexpected = false) {
        while (true) {
            const msg = await this.waitForAnyMessage();

            if (msg.type == type)
                return msg;

            if (throwOnUnexpected)
                throw new Error('received message with type ' + msg.type + ' which was not expected, expected was ' + type);
        }

    }

    async waitForType(type: string) {
        while (true) {
            const msg = await this.waitForAnyMessage();
            if (msg.type == type)
                return msg;
        }
    }

    sendMessage(type: string, payload?: Payload, channel: WorkerMessage<any>['channel'] = 'normal') {
        if (channel != 'control' && !this.readyState)
            throw new Error('you can not send a message till this.ready resolved');

        this.worker.postMessage({
            channel,
            type,
            payload: makeObjectSimple(payload),
            timestamp: Date.now()
        } as WorkerMessage<any>)
    }

    sendError(error: string, err?: any) {
        this.sendMessage(error, err, 'error');
    }

    private sendControl(type: string) {
        this.sendMessage(type, undefined, 'control');
    }
}