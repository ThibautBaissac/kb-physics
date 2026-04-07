---
title: Quantum Thermodynamics
description: Field exploring how quantum effects — entanglement, coherence, superposition — modify classical thermodynamic laws, including anomalous heat flow and information-entropy equivalence
type: concept
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [concepts/quantum-entanglement.md, concepts/wave-function.md, concepts/black-hole-entropy.md, open-questions/measurement-problem.md]
sources: [2025-10-01-thermometer-measuring-quantumness.md]
---

# Quantum Thermodynamics

Quantum thermodynamics explores how quantum mechanical phenomena — [entanglement](../concepts/quantum-entanglement.md), coherence, superposition — alter the classical laws of thermodynamics. The field seeks quantum engines that outperform classical ones, quantum batteries that charge faster, and new tools for probing quantum systems through thermodynamic measurements.

## The Second Law and Information

The classical second law of thermodynamics, formulated by Rudolf Clausius in 1850, states that heat flows spontaneously from hotter bodies to colder ones, and the total entropy of an isolated system can only increase. James Clerk Maxwell challenged this in 1867 with a thought experiment: a tiny "demon" that observes individual gas molecules and selectively sorts fast-moving (hot) molecules from slow-moving (cold) ones, seemingly decreasing entropy without expending energy.

### Landauer's Principle

The resolution came a century later. Rolf Landauer showed in 1961 that erasing the demon's memory — necessary once it fills — produces entropy exceeding what the sorting removes. This established a fundamental equivalence between information and entropy: information is a thermodynamic resource that can be converted into work. Physicists experimentally confirmed this information-to-energy conversion in 2010.

### Quantum Enhancement

Quantum mechanics allows information processing in ways classical physics cannot — the basis of quantum computing and quantum cryptography. This means the classical second law, as Clausius formulated it, is the "classical limit" of a more complete quantum formulation.

## Anomalous Heat Flow

When quantum [entanglement](../concepts/quantum-entanglement.md) is present, heat can flow from cold to hot — apparently violating the second law. Hossein Partovi (California State University) identified this implication in 2008: entanglement between a hot and cold body can reverse spontaneous heat flow.

This reversal is a form of refrigeration. Classically, refrigeration requires burning fuel to pump heat the "wrong" way. In the quantum case, the fuel is the correlations themselves. As [Nicole Yunger Halpern](../people/nicole-yunger-halpern.md) explains: "you burn the correlations." The anomalous heat flow destroys entanglement — particles with initially correlated properties become independent.

David Jennings and Terry Rudolph (Imperial College London, 2010) formalized this by reformulating the second law to include mutual information, calculating limits on how much classical heat flow can be altered or reversed by consuming quantum correlations.

## A Quantum Demon as Catalyst

[Patryk Lipka-Bartosik](../people/patryk-lipka-bartosik.md) (Polish Academy of Sciences) developed a scheme realizing a 2004 idea by Časlav Brukner and [Vlatko Vedral](../people/vlatko-vedral.md) to use thermodynamic properties as entanglement witnesses. The scheme introduces a third system — a quantum Maxwell's demon with "quantum memory" — mediating heat flow between correlated hot and cold quantum systems. Because the demon's memory is entangled with both systems, it acts as a catalyst: accessing and exploiting all correlations systematically, then returning to its original state. This boosts anomalous heat flow beyond what's achievable without such a catalyst.

## Thermometer for Quantumness

[Alexssandre de Oliveira Jr.](../people/alexssandre-de-oliveira.md), Lipka-Bartosik, and Jonatan Bohr Brask (Technical University of Denmark) transformed this catalytic setup into a non-destructive detector of quantum entanglement (2025). Instead of mediating between two correlated quantum systems, the quantum memory sits between a quantum system (e.g., an array of qubits in a quantum computer) and a simple heat sink that is not directly entangled with the system.

The memory, entangled with both, catalyzes heat flow beyond what's classically possible. Entanglement within the quantum system converts into extra heat entering the sink. Measuring the sink's energy reveals entanglement in the quantum system — without disturbing it. Because the system and sink aren't themselves entangled, the measurement doesn't collapse the quantum state.

This offers a simple, non-invasive probe of quantumness. As de Oliveira explains: "If you simply tried to make a measurement on the system directly, you'd destroy its entanglement before the process could even unfold."

### Practical Implementation

[Vedral](../people/vlatko-vedral.md) endorses the scheme's simplicity: designate one qubit as the quantum memory, couple it to particles serving as the heat sink, and measure the sink's energy. Requirements include very precise system control (to isolate the entanglement signal from other heat sources) and the caveat that the method won't detect all entangled states.

Roberto Serra's group at the Federal University of ABC (São Paulo, Brazil) is exploring experimental realization using nuclear magnetic resonance — carbon and hydrogen spins in chloroform molecules as qubits, a system they previously used to demonstrate heat transfer between quantum bits (2016).

### Testing Quantum Gravity

The thermometer idea extends to fundamental physics. If gravity is quantum, two massive objects should become entangled through gravitational interaction alone. Detecting that gravity-induced entanglement via simple thermodynamic measurements could verify whether gravity is truly quantized — probing one of physics' deepest open questions with, as Vedral puts it, "something as easy and macroscopic as this."

## Sources

- [A Thermometer for Measuring Quantumness](../raw/articles/2025-10-01-thermometer-measuring-quantumness.md)
