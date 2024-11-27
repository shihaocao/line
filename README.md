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

---

So I implemented an energy limiting. I made a slight algorithimic change to, if you are over the energy limit, and an interaction would increase the energy further, don't do the interaction. I felt like I was still seeing weird things though so I printed total system energy and it was not constant. I will have to look at this deeper. It looks like energy
isn't constant even with energy limiting off.

Nonetheless the graphics are cool and we aren't launching projectiles out of orbit!

## 11/12

It turns out that the concept of an energy limit, or a speed limit on the particles is deeply non physical, since this would let it travel into an area of lower gravitational potential without accelerating its KE. This leaves us with the potential for getting trapped in lower energy states as we enter a very tight orbit.

![Energy Limit Not Working](documentation/energy_limit_not_working.png)

I think my next plan for a cool animation would be some sort of:

Faux drag force making sure we never accelerate off into the distance, and then an energy balancer. If the system loses too much energy add a bit more in. This should put us in stable equilibrium but not send us to infinity.

Here is my final animation without energy limiting:
![With Axes and Orbit Finished](documentation/finished-orbits.gif)

## 11/24

Today I added snow, it is a bit cheap, it is just a hexagon (circle with 6 points). I think the snow looks nice. I also hid the other bodies driving the physics, and I really like how natural and alive that one line looks.

I tried increasing the line thickness but I couldn't get it to work faster so skipped ahead to the snow.

![Just a line with snow](documentation/line_snow.gif)

## 11/26

I made the light follow the line.

![Just a line with snow + light](documentation/line_snow_light.gif)
