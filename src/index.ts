import { test1 } from './example';

const loadingButton = document.createElement('button');
loadingButton.textContent = 'Trigger loading';
loadingButton.addEventListener('click', test1);
document.body.append(loadingButton);
