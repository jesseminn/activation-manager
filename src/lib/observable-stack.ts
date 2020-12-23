import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Debugger, DebuggerOptions } from './debugger';
import { Maybe } from './types';

export class ObservableStack<T> {
    private _stack$ = new BehaviorSubject<T[]>([]);
    private stack: Maybe<T[]>;
    get stack$() {
        return this._stack$;
    }
    private debugger: Maybe<Debugger>;

    constructor(debuggerOptions?: DebuggerOptions) {
        this._stack$.subscribe(v => {
            this.stack = v;
        });

        if (debuggerOptions) {
            this.debugger = new Debugger(debuggerOptions);
        }
    }

    push(value: T) {
        const stack = this.stack || [];
        const newStack = [value, ...stack];

        if (this.debugger) {
            this.debugger.debug('Pushing');
            this.debugger.debug('Original stack: ', stack);
            this.debugger.debug('New stack: ', newStack);
        }

        this._stack$.next(newStack);
    }

    pop() {
        const stack = this.stack || [];
        const newStack = stack.slice(1);

        if (this.debugger) {
            this.debugger.debug('Popping');
            this.debugger.debug('Original stack: ', stack);
            this.debugger.debug('New stack: ', newStack);
        }

        this._stack$.next(newStack);
    }

    peak() {
        return this._stack$.pipe(
            map(stack => {
                return Array.isArray(stack) ? stack[0] : undefined;
            }),
            distinctUntilChanged(),
        );
    }

    deleteIndex(index: number) {
        const stack = this.stack || [];
        const newStack = [...stack.slice(0, index), ...stack.slice(index + 1)];

        if (this.debugger) {
            this.debugger.debug('Deleting');
            this.debugger.debug('Original stack: ', stack);
            this.debugger.debug('New stack: ', newStack);
        }

        this._stack$.next(newStack);
    }

    delete(target: T) {
        const stack = this.stack || [];
        const targetIndex = stack.findIndex(item => item === target);

        if (targetIndex < 0) return;

        this.deleteIndex(targetIndex);
    }
}
