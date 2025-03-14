import pygame
from pygame.locals import *
from OpenGL.GL import *
from OpenGL.GLU import *
import numpy as np
import random
from dataclasses import dataclass, field

# Parameters
A, B, C = 5, 5, 5
speed = 0.1
max_points = 5000
G = 15  # Gravitational constant to control the strength of gravity-like pull
A_MAX = 0.25

@dataclass
class State:
    position: np.ndarray = field(default_factory=lambda: np.array([0.0, 0.0, 0.0]))
    velocity: np.ndarray = field(default_factory=lambda: np.array([0.0, 0.0, 0.0]))
    acceleration: np.ndarray = field(default_factory=lambda: np.array([0.0, 0.0, 0.0]))

# Initialize the state
state = State()
IV = 2.7
state.position = (IV,0,0)
state.velocity = (0,IV,0.1*IV)

# Initialize list to store trace points
trace_points = []

def random_acceleration():
    """Generate a random acceleration vector with components in the range (-1, 1)."""
    return np.array([A_MAX*random.uniform(-1, 1) for _ in range(3)])

def gravitational_acceleration(position):
    """Calculate gravitational acceleration towards the origin based on distance (1/r^2)."""
    r = np.linalg.norm(position)  # Distance from origin
    if r == 0:
        return np.array([0.0, 0.0, 0.0])  # Avoid division by zero at the origin
    return -G * (position / r) / (r ** 2)  # Gravitational force direction and magnitude

def add_trace_point():
    """Update state based on current acceleration and add the position to trace."""
    # Update acceleration with a new random vector
    state.acceleration = random_acceleration()
    state.acceleration += gravitational_acceleration(state.position)

    # Euler integration to update velocity and position
    state.velocity += state.acceleration * speed  # v = v + a * dt
    state.position += state.velocity * speed  # x = x + v * dt

    # Add the current position to the trace points
    trace_points.append(tuple(state.position))

    # Keep the trace at a manageable length
    if len(trace_points) > max_points:
        trace_points.pop(0)

    # Optional: Print the current state for debugging
    print(f"Position: {state.position}, Velocity: {state.velocity}, Acceleration: {state.acceleration}")

def draw_trace():
    """Draw the trace as a series of lines between consecutive points."""
    glBegin(GL_LINE_STRIP)  # GL_LINE_STRIP to connect points with a continuous line
    glColor3f(1, 0, 0)  # Set line color to red
    for point in trace_points:
        glVertex3fv(point)
    glEnd()

def main():
    pygame.init()
    display = (800, 600)
    pygame.display.set_mode(display, DOUBLEBUF | OPENGL)
    
    # Define the distance R for the camera position
    R = 25  # Further back to capture a larger view

    # Set perspective and view
    gluPerspective(45, (display[0] / display[1]), 0.1, 50.0)
    gluLookAt(R, R, R, 0, 0, 0, 0, 1, 0)

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                return

        # Add a new point to the trace based on the evolving state
        add_trace_point()

        # Clear screen and draw the trace
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        draw_trace()
        
        pygame.display.flip()
        pygame.time.wait(10)

if __name__ == "__main__":
    main()
