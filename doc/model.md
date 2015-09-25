Model for Bending Light  
Sam Reid 
5/9/2011  

The bending light model uses Snell's Law at each interface for computing reflected/refracted angle: 
http://en.wikipedia.org/wiki/Snell's_law

The reflected/refracted light powers are calculated using the Fresnel Equations for "s-polarized" (perpendicular) light:
http://en.wikipedia.org/wiki/Fresnel_equations

The wave is propagated according to the wave equation: cos(k * x - omega * t + phase)

When showing multiple reflections in the Prisms screen, light rays are terminated after 50 reflections/refractions to
ensure computability.

There is no attenuation in the simulation, either at surfaces or in vacuum. At each surface, the `power_in = power_out`

The Sellmeier equation is used to compute the index of refraction of glass as a function of wavelength:
http://en.wikipedia.org/wiki/Sellmeier_equation

The index of refraction of air is computed according to:
http://refractiveindex.info/?group=GASES&material=Air
r_air(wavelength) = 1 + 5792105E-8 / (238.0185 - Math.pow( wavelength * 1E6, -2 )) + 167917E-8 / (57.362 - Math.pow( wavelength * 1E6, -2 ))

To compute the white-light representation, the light ray paths are rasterized according to the Bresenham Line algorithm 
(which interpolates a line between two points), and individual rays are added up, increasing both the intensity and 
saturating the wavelength to make it appear whiter. White light is actually depicted as gray to make the sim work against 
a white background.