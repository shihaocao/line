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
state.velocity = (0.2*IV,IV,0.1*IV)

# Initialize list to store trace points
trace_points = []

def random_acceleration():
    """Generate a random acceleration vector with components in the range (-1, 1)."""
    return np.array([A_MAX*random.uniform(-1, 1) for _ in range(3)])

def gravitational_acceleration(position, g_param = 25, power=2):
    """Calculate gravitational acceleration towards the origin based on distance (1/r^2)."""
    r = np.linalg.norm(position)  # Distance from origin
    if r == 0:
        return np.array([0.0, 0.0, 0.0])  # Avoid division by zero at the origin
    return -g_param * (position / r) / (r ** power)  # Gravitational force direction and magnitude

def add_trace_point():
    """Update state based on current acceleration and add the position to trace."""
    # Update acceleration with a new random vector
    state.acceleration = random_acceleration()
    state.acceleration += gravitational_acceleration(state.position, g_param=25, power=2)
    state.acceleration += gravitational_acceleration(state.position, g_param=-12, power=3)

    # Euler integration to update velocity and position
    state.velocity += state.acceleration * speed  # v = v + a * dt
    state.position += state.velocity * speed  # x = x + v * dt

    # Add the current position to the trace points
    trace_points.append(tuple(state.position))

    # Keep the trace at a manageable length
    if len(trace_points) > max_points:
        trace_points.pop(0)

    # Optional: Print the current state for debugging
    # print(f"Position: {state.position}, Velocity: {state.velocity}, Acceleration: {state.acceleration}")

def draw_trace():
    """Draw the trace as a series of lines between consecutive points."""
    glBegin(GL_LINE_STRIP)  # GL_LINE_STRIP to connect points with a continuous line
    glColor3f(1, 1, 1)
    for point in trace_points:
        glVertex3fv(point)
    glEnd()

def draw_axes():
    # Pastel colors for X, Y, Z axes
    pastel_red = (1.0, 0.6, 0.6)    # X-axis
    pastel_green = (0.6, 1.0, 0.6)  # Y-axis
    pastel_blue = (0.6, 0.6, 1.0)   # Z-axis
    length = 10.0

    glBegin(GL_LINES)
    
    # X-axis (red)
    glColor3fv(pastel_red)
    glVertex3f(0, 0, 0)
    glVertex3f(length, 0, 0)
    
    # Y-axis (green)
    glColor3fv(pastel_green)
    glVertex3f(0, 0, 0)
    glVertex3f(0, length, 0)
    
    # Z-axis (blue)
    glColor3fv(pastel_blue)
    glVertex3f(0, 0, 0)
    glVertex3f(0, 0, length)

    glEnd()

def main():
    pygame.init()
    display = (800, 600)
    pygame.display.set_mode(display, DOUBLEBUF | OPENGL)
    
    # Define the distance R for the camera position
    R = 25  # Further back to capture a larger view
    rotate_x, rotate_y = 0, 0
    zoom = -5.0
    # Set perspective and view
    def set_defaults():
        nonlocal R, rotate_x, rotate_y
        R = 25
        rotate_x, rotate_y = 0, 0

    def apply_views():
        glLoadIdentity()  # Reset transformations
        max_clip_dist = 150
        gluPerspective(45, (display[0] / display[1]), 0.1, max_clip_dist)
        gluLookAt(R, R, R, 0, 0, 0, 0, 1, 0)
        glRotatef(rotate_x, 1, 0, 0)
        glRotatef(rotate_y, 0, 1, 0)

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEMOTION:
                if pygame.mouse.get_pressed()[0]:  # Left button for rotation
                    rotate_x += event.rel[1]
                    rotate_y += event.rel[0]
                    print("pressed!")
            elif event.type == pygame.MOUSEBUTTONDOWN:
                print("nmouse button down!")

                if event.button == 4:  # Scroll up
                    R += 0.5
                elif event.button == 5:  # Scroll down
                    R -= 0.5
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:  # Check if 'R' key is pressed
                    print("R key pressed!")
                    set_defaults()

        # Add a new point to the trace based on the evolving state
        add_trace_point()

        # Clear screen and draw the trace

        # un commenting this doesn't work
        # gluLookAt(R, R, R, 0, 0, 0, 0, 1, 0)

        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        apply_views()

        draw_trace()
        draw_axes()

        pygame.display.flip()
        pygame.time.wait(10)

if __name__ == "__main__":
    main()
