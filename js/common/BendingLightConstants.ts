// Copyright 2015-2022, University of Colorado Boulder

/**
 * This class is a collection of constants that configure global properties.
 * If you change something here, it will change *everywhere* in this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector3 from '../../../dot/js/Vector3.js';
import VisibleColor from '../../../scenery-phet/js/VisibleColor.js';
import bendingLight from '../bendingLight.js';

// constants (these are vars because other constants refer to them)
const SPEED_OF_LIGHT = 2.99792458E8;
const WAVELENGTH_RED = 650E-9; // meters

//only go to 700nm because after that the reds are too black
const LASER_MAX_WAVELENGTH = 700; // nm

// so the refracted wave mode doesn't get too big because at angle = PI it would become infinite.
// this value was determined by printing out actual angle values at runtime and sampling a good value.
const MAX_ANGLE_IN_WAVE_MODE = 3.0194;

// CIE 1931 2-angle tristimulus values, from http://cvrl.ioo.ucl.ac.uk/cmfs.htm. Maps wavelength (in nm) to an
// X,Y,Z value in the XYZ color space.
const XYZ: Record<number, { x: number; y: number; z: number }> = {
  360: { x: 0.0001299, y: 0.000003917, z: 0.0006061 },
  365: { x: 0.0002321, y: 0.000006965, z: 0.001086 },
  370: { x: 0.0004149, y: 0.00001239, z: 0.001946 },
  375: { x: 0.0007416, y: 0.00002202, z: 0.003486 },
  380: { x: 0.001368, y: 0.000039, z: 0.006450001 },
  385: { x: 0.002236, y: 0.000064, z: 0.01054999 },
  390: { x: 0.004243, y: 0.00012, z: 0.02005001 },
  395: { x: 0.00765, y: 0.000217, z: 0.03621 },
  400: { x: 0.01431, y: 0.000396, z: 0.06785001 },
  405: { x: 0.02319, y: 0.00064, z: 0.1102 },
  410: { x: 0.04351, y: 0.00121, z: 0.2074 },
  415: { x: 0.07763, y: 0.00218, z: 0.3713 },
  420: { x: 0.13438, y: 0.004, z: 0.6456 },
  425: { x: 0.21477, y: 0.0073, z: 1.0390501 },
  430: { x: 0.2839, y: 0.0116, z: 1.3856 },
  435: { x: 0.3285, y: 0.01684, z: 1.62296 },
  440: { x: 0.34828, y: 0.023, z: 1.74706 },
  445: { x: 0.34806, y: 0.0298, z: 1.7826 },
  450: { x: 0.3362, y: 0.038, z: 1.77211 },
  455: { x: 0.3187, y: 0.048, z: 1.7441 },
  460: { x: 0.2908, y: 0.06, z: 1.6692 },
  465: { x: 0.2511, y: 0.0739, z: 1.5281 },
  470: { x: 0.19536, y: 0.09098, z: 1.28764 },
  475: { x: 0.1421, y: 0.1126, z: 1.0419 },
  480: { x: 0.09564, y: 0.13902, z: 0.8129501 },
  485: { x: 0.05795001, y: 0.1693, z: 0.6162 },
  490: { x: 0.03201, y: 0.20802, z: 0.46518 },
  495: { x: 0.0147, y: 0.2586, z: 0.3533 },
  500: { x: 0.0049, y: 0.323, z: 0.272 },
  505: { x: 0.0024, y: 0.4073, z: 0.2123 },
  510: { x: 0.0093, y: 0.503, z: 0.1582 },
  515: { x: 0.0291, y: 0.6082, z: 0.1117 },
  520: { x: 0.06327, y: 0.71, z: 0.07824999 },
  525: { x: 0.1096, y: 0.7932, z: 0.05725001 },
  530: { x: 0.1655, y: 0.862, z: 0.04216 },
  535: { x: 0.2257499, y: 0.9148501, z: 0.02984 },
  540: { x: 0.2904, y: 0.954, z: 0.0203 },
  545: { x: 0.3597, y: 0.9803, z: 0.0134 },
  550: { x: 0.4334499, y: 0.9949501, z: 0.008749999 },
  555: { x: 0.5120501, y: 1, z: 0.005749999 },
  560: { x: 0.5945, y: 0.995, z: 0.0039 },
  565: { x: 0.6784, y: 0.9786, z: 0.002749999 },
  570: { x: 0.7621, y: 0.952, z: 0.0021 },
  575: { x: 0.8425, y: 0.9154, z: 0.0018 },
  580: { x: 0.9163, y: 0.87, z: 0.001650001 },
  585: { x: 0.9786, y: 0.8163, z: 0.0014 },
  590: { x: 1.0263, y: 0.757, z: 0.0011 },
  595: { x: 1.0567, y: 0.6949, z: 0.001 },
  600: { x: 1.0622, y: 0.631, z: 0.0008 },
  605: { x: 1.0456, y: 0.5668, z: 0.0006 },
  610: { x: 1.0026, y: 0.503, z: 0.00034 },
  615: { x: 0.9384, y: 0.4412, z: 0.00024 },
  620: { x: 0.8544499, y: 0.381, z: 0.00019 },
  625: { x: 0.7514, y: 0.321, z: 0.0001 },
  630: { x: 0.6424, y: 0.265, z: 0.00005 },
  635: { x: 0.5419, y: 0.217, z: 0.00003 },
  640: { x: 0.4479, y: 0.175, z: 0.00002 },
  645: { x: 0.3608, y: 0.1382, z: 0.00001 },
  650: { x: 0.2835, y: 0.107, z: 0 },
  655: { x: 0.2187, y: 0.0816, z: 0 },
  660: { x: 0.1649, y: 0.061, z: 0 },
  665: { x: 0.1212, y: 0.04458, z: 0 },
  670: { x: 0.0874, y: 0.032, z: 0 },
  675: { x: 0.0636, y: 0.0232, z: 0 },
  680: { x: 0.04677, y: 0.017, z: 0 },
  685: { x: 0.0329, y: 0.01192, z: 0 },
  690: { x: 0.0227, y: 0.00821, z: 0 },
  695: { x: 0.01584, y: 0.005723, z: 0 },
  700: { x: 0.01135916, y: 0.004102, z: 0 },
  705: { x: 0.008110916, y: 0.002929, z: 0 },
  710: { x: 0.005790346, y: 0.002091, z: 0 },
  715: { x: 0.004109457, y: 0.001484, z: 0 },
  720: { x: 0.002899327, y: 0.001047, z: 0 },
  725: { x: 0.00204919, y: 0.00074, z: 0 },
  730: { x: 0.001439971, y: 0.00052, z: 0 },
  735: { x: 0.000999949, y: 0.0003611, z: 0 },
  740: { x: 0.000690079, y: 0.0002492, z: 0 },
  745: { x: 0.000476021, y: 0.0001719, z: 0 },
  750: { x: 0.000332301, y: 0.00012, z: 0 },
  755: { x: 0.000234826, y: 0.0000848, z: 0 },
  760: { x: 0.000166151, y: 0.00006, z: 0 },
  765: { x: 0.000117413, y: 0.0000424, z: 0 },
  770: { x: 0.0000830753, y: 0.00003, z: 0 },
  775: { x: 0.0000587065, y: 0.0000212, z: 0 },
  780: { x: 0.0000415099, y: 0.00001499, z: 0 },
  785: { x: 0.0000293533, y: 0.0000106, z: 0 },
  790: { x: 0.0000206738, y: 0.0000074657, z: 0 },
  795: { x: 0.0000145598, y: 0.0000052578, z: 0 },
  800: { x: 0.000010254, y: 0.0000037029, z: 0 },
  805: { x: 0.00000722146, y: 0.0000026078, z: 0 },
  810: { x: 0.00000508587, y: 0.0000018366, z: 0 },
  815: { x: 0.00000358165, y: 0.0000012934, z: 0 },
  820: { x: 0.00000252253, y: 9.1093e-7, z: 0 },
  825: { x: 0.00000177651, y: 6.4153e-7, z: 0 },
  830: { x: 0.00000125114, y: 4.5181e-7, z: 0 }
};

// CIE Standard Illuminant D65 relative spectral power distribution (e.g. white light wavelength distribution)
// From http://www.cie.co.at/publ/abst/datatables15_2004/sid65.txt, with wavelength < 360 removed to match our XYZ
// table. The relative values between wavelengths are what is important here.
const D65: Record<number, number> = {
  360: 46.6383,
  365: 49.3637,
  370: 52.0891,
  375: 51.0323,
  380: 49.9755,
  385: 52.3118,
  390: 54.6482,
  395: 68.7015,
  400: 82.7549,
  405: 87.1204,
  410: 91.486,
  415: 92.4589,
  420: 93.4318,
  425: 90.057,
  430: 86.6823,
  435: 95.7736,
  440: 104.865,
  445: 110.936,
  450: 117.008,
  455: 117.41,
  460: 117.812,
  465: 116.336,
  470: 114.861,
  475: 115.392,
  480: 115.923,
  485: 112.367,
  490: 108.811,
  495: 109.082,
  500: 109.354,
  505: 108.578,
  510: 107.802,
  515: 106.296,
  520: 104.79,
  525: 106.239,
  530: 107.689,
  535: 106.047,
  540: 104.405,
  545: 104.225,
  550: 104.046,
  555: 102.023,
  560: 100,
  565: 98.1671,
  570: 96.3342,
  575: 96.0611,
  580: 95.788,
  585: 92.2368,
  590: 88.6856,
  595: 89.3459,
  600: 90.0062,
  605: 89.8026,
  610: 89.5991,
  615: 88.6489,
  620: 87.6987,
  625: 85.4936,
  630: 83.2886,
  635: 83.4939,
  640: 83.6992,
  645: 81.863,
  650: 80.0268,
  655: 80.1207,
  660: 80.2146,
  665: 81.2462,
  670: 82.2778,
  675: 80.281,
  680: 78.2842,
  685: 74.0027,
  690: 69.7213,
  695: 70.6652,
  700: 71.6091,
  705: 72.979,
  710: 74.349,
  715: 67.9765,
  720: 61.604,
  725: 65.7448,
  730: 69.8856,
  735: 72.4863,
  740: 75.087,
  745: 69.3398,
  750: 63.5927,
  755: 55.0054,
  760: 46.4182,
  765: 56.6118,
  770: 66.8054,
  775: 65.0941,
  780: 63.3828,
  785: 63.8434,
  790: 64.304,
  795: 61.8779,
  800: 59.4519,
  805: 55.7054,
  810: 51.959,
  815: 54.6998,
  820: 57.4406,
  825: 58.8765,
  830: 60.312
};

// {Object} - Maps wavelength (nm) to {Vector3} XYZ colorspace values multiplied times the D65 intensity. Combines
//            the D65 and XYZ responses, so it contains "how bright in XYZ" each wavelength will be for white light.
const XYZ_INTENSITIES: Record<number, Vector3> = {};

// Cache the magnitudes as well so they don't need to be computed many times during each draw
const XYZ_INTENSITIES_MAGNITUDE: Record<number, number> = {};

for ( const wavelength in XYZ ) {
  const intensity = D65[ wavelength ];
  const xyz = XYZ[ wavelength ];

  XYZ_INTENSITIES[ wavelength ] = new Vector3( xyz.x * intensity, xyz.y * intensity, xyz.z * intensity );
  XYZ_INTENSITIES_MAGNITUDE[ wavelength ] = XYZ_INTENSITIES[ wavelength ].magnitude;
}

// {Vector3} - Maximum value for each component of XYZ_INTENSITIES.
const MAX_XYZ_INTENSITY = ( () => {
  // max of XYZ * D65 for each channel
  let maxX = 0;
  let maxY = 0;
  let maxZ = 0;

  for ( const wavelength in XYZ_INTENSITIES ) {
    const xyz = XYZ_INTENSITIES[ wavelength ];
    maxX = Math.max( maxX, xyz.x );
    maxY = Math.max( maxY, xyz.y );
    maxZ = Math.max( maxZ, xyz.z );
  }
  return new Vector3( maxX, maxY, maxZ );
} )();

// {Object} - Maps wavelength (nm) to {Vector3} XYZ colorspace values, with each component separately normalized, so
//            that each XYZ value is in the range [0,1]. Multiplying any entry componentwise with MAX_XYZ_INTENSITY
//            will result in the original XYZ_INTENSITIES value.
const NORMALIZED_XYZ_INTENSITIES = ( () => {
  const result: Record<number, Vector3> = {};

  for ( const wavelength in XYZ_INTENSITIES ) {
    const xyz = XYZ_INTENSITIES[ wavelength ];
    result[ wavelength ] = new Vector3(
      xyz.x / MAX_XYZ_INTENSITY.x,
      xyz.y / MAX_XYZ_INTENSITY.y,
      xyz.z / MAX_XYZ_INTENSITY.z
    );
  }
  return result;
} )();

// {Array.<Number>} - Our range of visible wavelengths we will display (should have ~16 values so we have 4 bits left
//                    to store color values in after quantization). The more wavelengths we display, the fewer bits
//                    will be available.
const WHITE_LIGHT_WAVELENGTHS = _.range( 400, 700, 10 ); // excludes maximum value

// {Matrix3} - Maps color vectors in the XYZ colorspace into RGB (using the sRGB primaries, but not applying the
//             nonlinear mapping part of sRGB).
const XYZ_TO_RGB_MATRIX = new Matrix3().rowMajor(
  3.2404542, -1.5371385, -0.4985314,
  -0.9692660, 1.8760108, 0.0415560,
  0.0556434, -0.2040259, 1.0572252
);

const BendingLightConstants = {
  SCREEN_VIEW_OPTIONS: {
    layoutBounds: new Bounds2( 0, 0, 834, 504 )
  },
  LASER_MAX_WAVELENGTH: LASER_MAX_WAVELENGTH,
  LASER_MIN_WAVELENGTH: VisibleColor.MIN_WAVELENGTH,
  SPEED_OF_LIGHT: SPEED_OF_LIGHT,
  MAX_ANGLE_IN_WAVE_MODE: MAX_ANGLE_IN_WAVE_MODE,
  WAVELENGTH_RED: WAVELENGTH_RED,

  D65: D65,
  XYZ_INTENSITIES: XYZ_INTENSITIES,
  XYZ_INTENSITIES_MAGNITUDE: XYZ_INTENSITIES_MAGNITUDE,
  WHITE_LIGHT_WAVELENGTHS: WHITE_LIGHT_WAVELENGTHS,
  NORMALIZED_XYZ_INTENSITIES: NORMALIZED_XYZ_INTENSITIES,
  MAX_XYZ_INTENSITY: MAX_XYZ_INTENSITY,
  // NUM_RAY_SATURATION: NUM_RAY_SATURATION,
  XYZ_TO_RGB_MATRIX: XYZ_TO_RGB_MATRIX,

  PRISM_NODE_ALPHA: 0.5
};

bendingLight.register( 'BendingLightConstants', BendingLightConstants );

export default BendingLightConstants;