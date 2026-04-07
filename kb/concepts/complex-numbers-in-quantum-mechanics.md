---
title: Complex Numbers in Quantum Mechanics
description: The role of imaginary number i in quantum theory — whether complex numbers are essential or a mathematical convenience, and the 2025 real-valued reformulations
type: concept
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [concepts/wave-function.md, concepts/hilbert-space.md, concepts/quantum-entanglement.md, open-questions/measurement-problem.md]
sources: [2025-11-07-imaginary-numbers-quantum-mechanics.md]
---

# Complex Numbers in Quantum Mechanics

The imaginary number *i* (√−1) has been embedded at the heart of quantum mechanics since its founding. The Schrödinger equation — the fundamental law of motion for quantum entities — is explicitly complex-valued. The [wave function](wave-function.md) it governs is a vector in a complex [Hilbert space](hilbert-space.md), even though all physical measurements return real values. As [Bill Wootters](../people/bill-wootters.md) (Williams College) noted, "Quantum theory really is the first physical theory where the complex numbers seem to be right smack in the middle of the theory."

## Historical Context

Complex numbers originated with René Descartes in 1637 as "imaginary" solutions to polynomial equations. Though initially viewed with derision, they became indispensable across mathematics, optics, and signal analysis. Schrödinger himself was uncomfortable with their central role in quantum mechanics and hoped for a purely real formulation, but adopted complex numbers because they were "extraordinarily much simpler for computational purposes."

## Early Real-Valued Attempts

In 1960, the Swiss physicist Ernst Stueckelberg developed a real-valued quantum mechanics that mapped the wave function from a complex-valued space to a real one, using tricks to mimic the rotations around an imaginary axis. But the real-valued theory was cumbersome — a two-particle wave function requiring 16 real numbers instead of 4 complex ones. Despite this clunkiness, in 2008–2009 two groups showed that real-valued theories could reproduce standard Bell test results.

## The 2021 Test

[Nicolas Gisin](../people/nicolas-gisin.md) and colleagues realized they could test whether complex numbers are essential by designing a more complicated Bell test. Instead of the standard two-particle, two-participant setup (Alice and Bob), they devised a protocol with two entangled-photon sources and three participants (Alice, Bob, and Charlie). They found that real-valued and complex-valued quantum theories predicted different ceilings on [entanglement](quantum-entanglement.md) correlations.

A team at the University of Science and Technology of China (USTC) ran the experiment and found correlations far exceeding the real-valued limit — seemingly proving that complex numbers are essential.

## The 2025 Reversal

Three independent results overturned the 2021 conclusion:

1. **German team** (Michael Epping, Anton Trushechkin, et al.): Showed that the 2021 studies assumed a specific form of the tensor product — the mathematical operation for combining quantum states. The standard tensor product is just one case of a more general class of vector-combination rules. Using different rules, they constructed a real-valued theory giving identical predictions to complex quantum theory.

2. **French team** (Mischa Woods, Timothée Hoffreumon): Independently developed an equivalent real-valued formulation using the same insight about generalized tensor products. By analogy: the Pythagorean theorem (*a*² + *b*² = *c*²) holds in flat space but not on curved surfaces — similarly, the standard tensor product is the "flat space" special case.

3. **Quantum computing** ([Craig Gidney](../people/craig-gidney.md), Google Quantum AI): Found a way to eliminate T gates — logic gates that rotate qubit states around the complex plane — from any quantum algorithm, numerically proving that quantum computing doesn't require complex numbers.

## The Lingering Essence

Despite these results, the real-valued theories retain the hallmarks of complex-number arithmetic. They do not contain *i* but copy its ability to rotate vectors — effectively "simulating complex numbers by means of real numbers" (Trushechkin). As [Vlatko Vedral](../people/vlatko-vedral.md) (Oxford) put it: "You can write them down whichever way you like, but it's unavoidable that they have to multiply exactly as though they were complex numbers."

This raises a deep question about mathematical formalism and physical reality. Even if *i* is not strictly necessary, complex numbers produce a formulation "particularly well suited to quantum mechanics" (Jill North, Rutgers). One possibility is that spin — a quantum property with no classical analogue — may be what makes complex numbers so natural a fit.

Vedral's preference would be to find simpler axioms for quantum mechanics — intuitive principles from which the theory could be re-derived in a new form altogether: "We really don't have a single alternative to how quantum mechanics was already done 100 years ago. And the question is, why?"

## Sources

- [Physicists Take the Imaginary Numbers Out of Quantum Mechanics](../raw/articles/2025-11-07-imaginary-numbers-quantum-mechanics.md)
