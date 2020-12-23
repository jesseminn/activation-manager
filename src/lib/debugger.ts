export type DebuggerOptions = {
    label: string;
    enabled: boolean;
};

export class Debugger {
    private label = '';
    private enabled = false;

    constructor(options: DebuggerOptions) {
        this.label = options.label;
        this.enabled = options.enabled;
    }

    log(...args: any[]) {
        console.log(`[${this.label}]`, ...args, '----------');
    }

    debug(...args: any[]) {
        if (this.enabled) {
            this.log(...args);
        }
    }
}
