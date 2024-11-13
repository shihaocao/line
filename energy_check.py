import numpy as np
from dataclasses import dataclass
import matplotlib.pyplot as plt

# Define gravitational constant
G = 0.01
KINETIC_ENERGY_LIMIT = 1e6  # Kinetic energy limit in Joules

@dataclass
class Body:
    pos: np.ndarray  # Position vector (x, y, z)
    vel: np.ndarray  # Velocity vector (vx, vy, vz)
    acc: np.ndarray  # Acceleration vector (ax, ay, az)
    mass: float      # Mass of the body

class System:
    def __init__(self, bodies):
        self.bodies = bodies
        self.positions = {i: [body.pos.copy()] for i, body in enumerate(bodies)}  # Track positions

    def compute_gravitational_acceleration(self):
        for body in self.bodies:
            body.acc = np.zeros(3)
        
        for i, body_i in enumerate(self.bodies):
            for j, body_j in enumerate(self.bodies):
                if i != j:
                    r_vec = body_j.pos - body_i.pos
                    distance = np.linalg.norm(r_vec)
                    if distance > 1e-3:  # Avoiding very small distances
                        # Calculate the tentative force and resulting acceleration
                        force_magnitude = G * body_i.mass * body_j.mass / distance**2
                        tentative_acc = force_magnitude * r_vec / (distance * body_i.mass)
                        
                        # Compute the tentative new velocity and kinetic energy
                        tentative_vel = body_i.vel + tentative_acc * dt
                        tentative_kinetic_energy = 0.5 * body_i.mass * np.linalg.norm(tentative_vel)**2
                        
                        # Only apply acceleration if it does not exceed the kinetic energy limit
                        if tentative_kinetic_energy <= KINETIC_ENERGY_LIMIT:
                            body_i.acc += tentative_acc

    def update_positions(self, dt):
        for i, body in enumerate(self.bodies):
            body.vel += body.acc * dt
            body.pos += body.vel * dt
            # Record position after update
            self.positions[i].append(body.pos.copy())

    def compute_kinetic_energy(self):
        return sum(0.5 * body.mass * np.linalg.norm(body.vel)**2 for body in self.bodies)

    def compute_gravitational_energy(self):
        total_energy = 0
        for i, body_i in enumerate(self.bodies):
            for j, body_j in enumerate(self.bodies):
                if i < j:
                    r_vec = body_j.pos - body_i.pos
                    distance = np.linalg.norm(r_vec)
                    total_energy -= G * body_i.mass * body_j.mass / distance
        return total_energy

    def simulate(self, timesteps, dt):
        kinetic_energies = []
        gravitational_energies = []
        
        for _ in range(timesteps):
            self.compute_gravitational_acceleration()
            self.update_positions(dt)
            
            kinetic_energies.append(self.compute_kinetic_energy())
            gravitational_energies.append(self.compute_gravitational_energy())
        
        return kinetic_energies, gravitational_energies

# Set up initial conditions for bodies
bodies = [
    Body(pos=np.array([0.0, 0.0, 0.0]), vel=np.array([0.0, 0.0, 0.0]), acc=np.zeros(3), mass=2e3),
    Body(pos=np.array([0.5, 0.0, 0.0]), vel=np.array([0.0, 3, 0.0]), acc=np.zeros(3), mass=1.5e3),
    Body(pos=np.array([0, 0.5, 0.0]), vel=np.array([3, 3, 0.0]), acc=np.zeros(3), mass=1e3),
]

# Initialize the system with bodies
system = System(bodies)

# Run the simulation
timesteps = 1000
dt = 0.0002  # time step in seconds

kinetic_energies, gravitational_energies = system.simulate(timesteps, dt)

# Plot energy results
plt.figure(figsize=(10, 6))
plt.plot(kinetic_energies, label='Kinetic Energy')
plt.plot(gravitational_energies, label='Gravitational Energy')
plt.plot(np.array(kinetic_energies) + np.array(gravitational_energies), label='Total Energy')
plt.xlabel('Timestep')
plt.ylabel('Energy (Joules)')
plt.title('Energy of N-Body System Over Time')
plt.legend()
plt.savefig("energy_plot.png")  # Saves the energy plot

# Plot trajectory results
plt.figure(figsize=(10, 6))
for i, pos_history in system.positions.items():
    pos_history = np.array(pos_history)
    plt.plot(pos_history[:, 0], pos_history[:, 1], label=f'Body {i} Trajectory')

plt.xlabel('X Position')
plt.ylabel('Y Position')
plt.title('Trajectories of Bodies in N-Body System')
plt.legend()
plt.savefig("traj.png")  # Saves the trajectory plot
