---
title: Qudits
description: Quantum digits with three or more possible states, enabling more efficient quantum computation than two-state qubits
type: concept
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [concepts/quantum-simulation.md, concepts/quantum-entanglement.md, concepts/quantum-chromodynamics.md, theories/quantum-field-theory.md]
sources: [2025-09-05-analog-vs-digital-quantum-simulation.md]
---

# Qudits

Qudits (quantum digits) are quantum computing elements that can exist in three or more possible states simultaneously, generalizing the two-state qubit. Where a qubit encodes information as a probabilistic combination of 0 and 1, a qudit with *d* levels encodes information across *d* states.

## Advantage Over Qubits

The extra states allow each particle to hold more information, often reducing the number of computational steps needed for complex operations. This is particularly advantageous for [quantum simulation](../concepts/quantum-simulation.md) of [quantum field theories](../theories/quantum-field-theory.md), whose inherent complexity maps naturally onto higher-dimensional state spaces. When [Christine Muschik](../people/christine-muschik.md) translated her quantum electrodynamics simulation from qubit logic into qudits, "her circuits shrank tenfold. It was like putting them on a diet." The shorter algorithms run faster and with fewer errors.

## Implementation: Calcium-40 Ions

[Martin Ringbauer](../people/martin-ringbauer.md)'s team at the University of Innsbruck built a qudit quantum computer from calcium-40 ions. Each ion's outer electrons can occupy eight different energy levels; five were chosen to represent the quantum digits. These excited states persist for about one second before electrons decay to the ground state, constraining computation times to 10–20 milliseconds.

## 2D Quantum Electrodynamics Simulation

Using five calcium-40 ion qudits — four at corners and one in the center — the Innsbruck team achieved the first quantum simulation of particles and their quantum force field in two dimensions (*Nature Physics*, March 2025). They observed virtual particle-antiparticle pairs spontaneously arising and annihilating in the simulated electromagnetic field. This was also one of the first successful runs of a full-fledged qudit algorithm.

## Path to QCD

Qudit-based approaches may provide the best route to simulating [quantum chromodynamics](../concepts/quantum-chromodynamics.md). [Jad Halimeh](../people/jad-halimeh.md), Ringbauer, and collaborators have proposed a qudit algorithm for simulating hadron collisions and hadronization — the process that formed protons and neutrons in the early universe.

## Sources

- [Analog vs. Digital: The Race Is On To Simulate Our Quantum Universe](../raw/articles/2025-09-05-analog-vs-digital-quantum-simulation.md)
