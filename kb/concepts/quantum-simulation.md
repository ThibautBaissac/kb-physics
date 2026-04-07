---
title: Quantum Simulation
description: Using quantum computers or analog quantum systems to simulate quantum fields and many-body physics beyond classical computation limits
type: concept
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [concepts/quantum-entanglement.md, concepts/qudits.md, concepts/quantum-chromodynamics.md, theories/quantum-field-theory.md]
sources: [2025-09-05-analog-vs-digital-quantum-simulation.md]
---

# Quantum Simulation

Quantum simulation is the use of controllable quantum systems to emulate the behavior of other quantum systems that are too complex for classical computation. The idea originates with Richard Feynman's 1981 insight: "Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical."

## Why Classical Computers Fail

Simulating quantum fields requires tracking the [entanglement](../concepts/quantum-entanglement.md) between particles. As particles interact, their states become correlated in ways that must be described collectively. The mathematical description of these interdependencies grows exponentially with system size. "At some point it exponentially explodes," says [Mikhail Lukin](../people/mikhail-lukin.md) (Harvard). "You run out of memory on a classical computer."

Classical approaches approximate quantum fields as discrete lattices of points, but even this cannot overcome the exponential scaling. Quantum computers, built from quantum pieces, have entanglement baked in, making these simulations tractable.

## Three Approaches

### Digital (Qubit-Based)

Standard quantum computers use qubits — quantum objects in a probabilistic combination of states 0 and 1. Algorithms induce interactions between qubits to encode calculations. A qubit-based simulation of a quantum field appeared in *Nature* in June 2025.

### Digital (Qudit-Based)

[Qudits](../concepts/qudits.md) — quantum objects with three or more possible states — can encode more information per particle, often reducing the number of computational steps. [Christine Muschik](../people/christine-muschik.md) (Waterloo) and [Martin Ringbauer](../people/martin-ringbauer.md) (Innsbruck) used a five-state qudit computer built from calcium-40 ions to achieve the first 2D simulation of quantum electrodynamics (*Nature Physics*, March 2025). Translating from qubits to qudits shrank circuits tenfold.

### Analog

Analog quantum simulators map a target quantum system onto an analogous laboratory system — typically ultracold atoms — that obeys equations of the same form. The system evolves naturally rather than running step-by-step algorithms. [Jad Halimeh](../people/jad-halimeh.md) (Munich) and [Bing Yang](../people/bing-yang.md) (Shenzhen) published a 1D analog simulation of quantum electrodynamics using 71 rubidium atoms (2020). A 2D "string breaking" simulation followed in *Nature* in June 2025, though it omitted magnetic field dynamics.

Hybrid analog-digital approaches are also emerging: in February 2025, a team ran a hybrid simulation on a Google quantum computer.

## The Goal: Quantum Chromodynamics

The ultimate target is simulating [quantum chromodynamics](../concepts/quantum-chromodynamics.md) (QCD), the theory of the strong force. QCD governs how quarks and gluons bind into protons and neutrons, but its full real-time dynamics remain incalculable. Halimeh, Ringbauer, and collaborators have proposed a qudit algorithm for simulating hadron collisions and hadronization — the process by which quarks recombined into hadrons in the early universe. Yang argues analog simulators are better suited for the large particle counts involved in quark-gluon plasma.

## Open Question: Analog vs. Digital?

"Now there's a competition," Halimeh says. "This is a big open question: What is the future, analog or digital?" Digital approaches offer programmability; analog approaches scale to larger systems. The answer may be hybrid.

## Sources

- [Analog vs. Digital: The Race Is On To Simulate Our Quantum Universe](../raw/articles/2025-09-05-analog-vs-digital-quantum-simulation.md)
