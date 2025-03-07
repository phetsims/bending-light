/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAfCAYAAACCox+xAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHsSURBVHjazJjLSsNQEIYnN2sT0GgvYhENuNBlCy5c5hHEJ/AFhPYxXFV3rrQrcaeP4AsIUbwuxCsmrVpqrLnYNPGkuFBEndgemoEwWZxDvvwzw5k5DHyy6SklT9wCdG8N8uxeXF9dYTcwHwAycTupIV4tTA9CMsF0RfFktkG7cMBy/VUCU8Ls4T98eXZSUpcXJ0BMsNALezQ9WNm6LsKUckBgKlhFgnJxDjJyAnpp+2d1KG+fagSk8KciBEJVcsOQy43/vCr4H8h8YRRg+zSPDo0kJUFIjkI/rQPCsjzwYqr/IAwngCCmYwDCDoAgpeOhCC+NUftIWJVIRQTgKCbr+sYmThHfb4NrN6mBZDMZLIgHjtWgB5LFgrQ9eLOeqYGMyDI+NI5lUgOp1mo/nzHMJ5CAKOJaL9RAdN2IoIhND+T+Xv/lyP2SI2Fo6FWNbhjxKN9qtRoPEEPXI+SI84rsLaO3kXe3NziQwPfBdSxqipwfH0UIDUUQ0ioySBCiiGv3vw3ogDgxAAkohwYN4rZioAhJpD3SQUHTskHgsHMDroRrnc6C0aJMepXDS39pJmcDzwY9+UO3xcLJnRi+rkUBKT2YnGLaopqS3oBj/e4gPA7qzQHwfGYVM25+0zic+ohTexT28DZAwy5+F2AAFG/UY3yVU3AAAAAASUVORK5CYII=';
export default image;