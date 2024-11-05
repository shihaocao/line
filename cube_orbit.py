import pygame
from pygame.locals import *
from OpenGL.GL import *
from OpenGL.GLU import *

# Initialize Pygame and OpenGL settings
pygame.init()
display = (800, 600)
pygame.display.set_mode(display, DOUBLEBUF | OPENGL)
glEnable(GL_DEPTH_TEST)

# Perspective and initial translation
gluPerspective(45, (display[0] / display[1]), 0.1, 100.0)
glTranslatef(0.0, 0.0, -5)

# Cube vertices, surfaces, and colors
cube_vertices = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
]
cube_surfaces = [
    [0, 1, 2, 3], [3, 2, 7, 6], [6, 7, 5, 4],
    [4, 5, 1, 0], [1, 5, 6, 2], [4, 0, 3, 7]
]
cube_colors = [(1,0,0), (0,1,0), (0,0,1), (1,1,0), (1,0,1), (0,1,1), (1,1,1), (0,0,0)]

def draw_cube():
    glBegin(GL_QUADS)
    for surface in cube_surfaces:
        for vertex in surface:
            glColor3fv(cube_colors[vertex])
            glVertex3fv(cube_vertices[vertex])
    glEnd()

# Variables for interaction
rotate_x, rotate_y = 0, 0
zoom = -5.0
R = 5

# Main loop
running = True
while running:
    # for event in pygame.event.get():
    #     if event.type == pygame.QUIT:
    #         running = False
    #     elif event.type == pygame.MOUSEMOTION:
    #         if pygame.mouse.get_pressed()[0]:  # Left button for rotation
    #             rotate_x += event.rel[1]
    #             rotate_y += event.rel[0]
    #     elif event.type == pygame.MOUSEBUTTONDOWN:
    #         if event.button == 4:  # Scroll up
    #             zoom += 0.5
    #         elif event.button == 5:  # Scroll down
    #             zoom -= 0.5

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
    glLoadIdentity()
    gluLookAt(R, R, R, 0, 0, 0, 0, 1, 0)
    # glRotatef(rotate_x, 1, 0, 0)
    # glRotatef(rotate_y, 0, 1, 0)

    draw_cube()
    pygame.display.flip()
    pygame.time.wait(10)

pygame.quit()
