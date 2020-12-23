import { ActivationManager, ActivationOptions } from './lib/activation-manager';
import { wait } from './lib/utils';

type MaskOptions = {
    isBlocking: boolean;
} & ActivationOptions;

type DialogOptions = {
    isTopmost?: boolean;
};

const loadingTrigger = new ActivationManager({
    label: 'loadingTrigger',
    debug: true,
});
const maskTrigger = new ActivationManager<MaskOptions>({
    label: 'maskTrigger',
    debug: true,
});
const dialogTrigger = new ActivationManager({
    label: 'dialogTrigger',
    debug: true,
});

export const test1 = async () => {
    // first loading
    const firstId = maskTrigger.activate({ isBlocking: true });
    loadingTrigger.activate(
        {
            deactivationCallback: () => {
                maskTrigger.deactivate(firstId);
            },
        },
        firstId,
    );

    console.log('Wait 1s ======');

    await wait(1000);

    // second loading
    const secondId = maskTrigger.activate({ isBlocking: true });
    loadingTrigger.activate(
        {
            deactivationCallback: () => {
                maskTrigger.deactivate(secondId);
            },
        },
        secondId,
    );

    console.log('Wait 2s, then deactivate first loading ======');
    await wait(1000);
    loadingTrigger.deactivate(firstId);

    // second loading end

    console.log('Wait 1s, then deactivate second loading ======');
    await wait(1000);
    loadingTrigger.deactivate(secondId);

    // first loading end
};
