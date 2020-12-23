import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ObservableStack } from './observable-stack';
import { Callback, Maybe } from './types';

export type ActivationManagerOptions = {
    label?: string;
    debug?: boolean;
};

export type ActivationOptions = {
    duration?: number;
    deactivationCallback?: Callback;
};

export class ActivationManager<T extends ActivationOptions> {
    private label = '';
    private debug = false;
    private activationCount = 0;
    private readonly activationStack$: ObservableStack<Symbol>;
    private readonly optionsMap = new Map<Symbol, T>();
    public readonly currentActivationId$: Observable<Maybe<Symbol>>;
    public readonly currentActivationId: Maybe<Symbol>;
    public readonly currentOptions$: Observable<Maybe<T>>;
    public beforeActivation$ = new Subject();
    public afterActivation$ = new Subject();
    public beforeDeactivation$ = new Subject();
    public afterDeactivation$ = new Subject();

    constructor(options?: ActivationManagerOptions) {
        this.label = options && typeof options.label === 'string' ? options.label : '';
        this.debug = options && typeof options.debug === 'boolean' ? options.debug : false;
        this.activationStack$ = new ObservableStack({
            label: this.label,
            enabled: this.debug,
        });
        this.currentActivationId$ = this.activationStack$.peak();
        this.currentOptions$ = this.currentActivationId$.pipe(
            map(v => {
                return typeof v === 'symbol' ? this.optionsMap.get(v) : null;
            }),
        );
    }

    activate(options: T, useId?: Symbol) {
        this.activationCount += 1;
        const label = !!this.label ? `${this.label}-${this.activationCount}` : undefined;
        const activationId = useId || Symbol(label);
        const duration = options && options.duration;

        this.beforeActivation$.next();

        this.optionsMap.set(activationId, options);
        this.activationStack$.push(activationId);

        setTimeout(() => {
            this.afterActivation$.next();
        });

        if (typeof duration === 'number' && duration >= 0) {
            setTimeout(() => {
                this.deactivate(activationId);
            }, duration);
        }

        return activationId;
    }

    deactivate(activationId: Symbol) {
        if (!this.optionsMap.has(activationId)) return;

        this.beforeActivation$.next();

        const option = this.optionsMap.get(activationId);
        const deactivationCallback = option && option.deactivationCallback;
        this.optionsMap.delete(activationId);
        this.activationStack$.delete(activationId);
        if (typeof deactivationCallback === 'function') {
            deactivationCallback();
        }

        setTimeout(() => {
            this.afterDeactivation$.next();
        });
    }
}

export class SingleActivationManager<T extends ActivationOptions> extends ActivationManager<T> {
    activate(option: T) {
        // Always close current one
        this.deactivate();

        const currentActivationId = super.activate(option);

        return currentActivationId;
    }

    deactivate() {
        if (typeof this.currentActivationId === 'symbol') {
            super.deactivate(this.currentActivationId);
        }
    }
}
