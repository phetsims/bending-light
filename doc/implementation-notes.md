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

Model-view transforms are used in the simulation to map between model and view coordinate frames. The default origin
for model is at the center of the screen with variable horizontal and vertical offset that can be defined in each
screen. In model positive x is to the right, positive y is up. In view the default origin is at (0,0) and positive x
is to the right, positive y is down.

The components laser, tools, light rays, prisms in the simulation are attached to different layers.
    mediumNode
    beforeLightLayer2
    beforeLightLayer
    singleColorLightNode
    afterLightLayer
    laserViewLayer
    afterLightLayer2
All these layers are defined and added in the BendingLightView. All the rays in sim are represented as a webGL node
with a canvas fallback. The detection for webGL/canvas is handled by the code. Canvas fallback for white light is
bounded to dev bounds to overcome performance issues. Dragging of the tools, laser and prisms is restricted to dev
bounds.

Properties are named with the suffix 'Property', e.g. positionProperty.