/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';

const image = new Image();
const unlock = simLauncher.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;