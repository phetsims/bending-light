Implementation Notes for 'Bending Light' sim

This repository contains the code for three simulations: Intro, Prisms, and More Tools.

Source code directory structure is as follows:
    common - contains code that is used by >1 screen
    intro - contains code used by the "intro" screen
    prisms - contains code used by "prisms" screen
    more-tools - contains code used by "more tools" screen

Each of the above directories is further divided into model and view packages. Model and view of the intro and prisms
screens extends BendingLightModel and BendingLightView of the common directory respectively. More Tools screen is the
extension of Intro screen.

All the rays in sim are represented as a webGL node with a canvas fallback. The detection for webGL/canvas is handled
by the code.

Properties are named with the suffix 'Property', e.g. positionProperty.