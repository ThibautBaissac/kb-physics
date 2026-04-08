---
title: Quantum Chromodynamics
description: The quantum field theory of the strong force, governing how quarks and gluons bind into protons and neutrons — largely unsimulatable
type: concept
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [theories/quantum-field-theory.md, concepts/quantum-simulation.md, concepts/qudits.md, concepts/renormalization.md, concepts/asymptotic-freedom.md, theories/standard-model.md, concepts/toponium.md]
sources: [2025-09-05-analog-vs-digital-quantum-simulation.md, 2025-07-08-top-quark-pairs-toponium-lhc.md]
tags: [nuclear-and-subatomic, quantum-field-theory]
---

# Quantum Chromodynamics

Quantum chromodynamics (QCD) is the [quantum field theory](../theories/quantum-field-theory.md) describing the strong force — one of the four fundamental forces of nature. It governs how quarks and gluons interact, binding them together to form protons, neutrons, and other hadrons. QCD is a core component of the [Standard Model](../theories/standard-model.md).

## Complexity

QCD is mathematically far more complex than quantum electrodynamics (the theory of the electromagnetic field). The strong force exhibits [asymptotic freedom](../concepts/asymptotic-freedom.md) — weakening at short distances but strengthening at longer distances, which is why quarks are never found in isolation ("confinement").

"In QCD, there's just an enormous amount of things we cannot calculate," says [Christine Muschik](../people/christine-muschik.md) (Waterloo). "Our lack of understanding is just so much more gigantic."

## Quark-Gluon Plasma

In the universe's earliest moments, quarks and gluons may have existed as an unbound soup called quark-gluon plasma, before cooling and binding into hadrons. Understanding this transition is a key goal of [quantum simulation](../concepts/quantum-simulation.md) efforts. In December 2024, [Bing Yang](../people/bing-yang.md), [Jad Halimeh](../people/jad-halimeh.md), and collaborators used a rubidium-atom analog simulator to emulate the transition between bound and unbound quark states.

## Hadronization

When hadrons collide at high energies, they break into quarks and gluons that rapidly recombine — a process called hadronization. Simulating this process could reveal how hadrons formed during the birth of the universe. Halimeh, [Martin Ringbauer](../people/martin-ringbauer.md), and collaborators have proposed a [qudit](../concepts/qudits.md)-based algorithm for simulating hadron collisions.

## Quarkonium and the Non-Relativistic Regime

When a quark-antiquark pair is produced nearly at rest, QCD allows them to exchange gluons and form quasi-bound states called **quarkonium**. These include charmonium (charm-anticharm, discovered 1974 in the "November Revolution"), bottomonium (bottom-antibottom, 1977), and [toponium](../concepts/toponium.md) (top-antitop, confirmed at the LHC in 2025).

Top quarks decay so quickly (~10⁻²⁵ s) that toponium's window for binding is extraordinarily narrow, and the effect is only visible at near-threshold production energies. Resolving the exact nature of the 2025 excess — whether true top-antitop binding or an unknown resonance near twice the top mass — requires advanced QCD calculations in the non-relativistic regime, where perturbative methods become less reliable.

## Sources

- [Analog vs. Digital: The Race Is On To Simulate Our Quantum Universe](../raw/articles/2025-09-05-analog-vs-digital-quantum-simulation.md)
- [Elusive romance of top-quark pairs observed at the LHC](../raw/articles/2025-07-08-top-quark-pairs-toponium-lhc.md)
