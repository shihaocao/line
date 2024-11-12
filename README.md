# Line

## 11/03
I want to animate a line tracing itself out, I think it will look pretty.

Here is my first pass, I used used a particle like physics model, orbiting the origin dependent on gravity plus acceleration. It is too orbit like, also there is some clipping glitch somewhere.

![First Orbit Rendering](documentation/first-render.png)

## 11/04

I figured out orbit controls in pygame + pyopengl. This makes me trumendously happy, and thank goodness I dont have to do anything related to three js.

![With Axes and Orbit](documentation/orbit_controls_and_stacked_cubic.png)

## 11/10

This has been cool so far but I decided that it must be done in 3js so that I can serve it on a website. A python program is neat but you can't distribute that to people so 3js it is.

You can launch the dev environment via `npx vite` and it animates nicely. I like it.

## 11/11

I've taken the time to basically create an orbit simulation. One theory I had to make it look better was to make sure the whole system started with a nonzero angularmomentum. Where as if I randomly set it across a large sample, the angular momentum would be near zero sometimes. It looks nice.

![With Axes and Orbit](documentation/orbits.gif)

But I think the real issue is actually energy. It is too easy to "eject" a few bodies out to infinity because it will have positive energy.
I think I will try implementing a system where energy is capped at some small negative value. I think I can implement this by saying, if an interaction would increase a bodies energy over the limit, do not transfer the energy. This should also prevent a body from having all of its energy robbed.

