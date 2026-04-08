---
title: Higgs Boson
description: The last discovered particle of the Standard Model — a scalar boson that gives mass to other particles via the Higgs field; its couplings to second-generation quarks remain under active measurement
type: concept
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [theories/standard-model.md, experiments/large-hadron-collider.md, concepts/hierarchy-problem.md, open-questions/beyond-standard-model.md, people/huilin-qu.md, people/loukas-gouskos.md, concepts/w-boson-polarization.md, people/aram-apyan.md]
sources: [2025-08-05-impossible-higgs-boson-measurement.md, 2026-01-26-particle-physics-dead-dying-hard.md, 2025-07-22-lhc-relics-early-universe-particle-spins.md]
tags: [particle-physics]
---

# Higgs Boson

The Higgs boson is the quantum excitation of the **Higgs field** — a scalar field permeating all of space. Particles that interact strongly with the Higgs field acquire mass; those that don't (like photons) remain massless. Predicted by Peter Higgs, François Englert, and others in 1964, it is the last piece of the [Standard Model](../theories/standard-model.md), discovered at the [Large Hadron Collider](../experiments/large-hadron-collider.md) in 2012.

The Higgs is unstable, decaying almost immediately after production. Studying its decay channels is the primary way physicists measure how strongly the Higgs couples to other particles.

## Decay Channels

The Higgs couples — and therefore decays — preferentially to the most massive particles accessible:

| Decay channel | Branching fraction | Status |
|---|---|---|
| H → bb̄ (bottom quarks) | ~58% | Observed (2018) |
| H → WW* | ~21% | Observed |
| H → gg (gluons) | ~9% | Observed (loop-induced) |
| H → ττ (tau leptons) | ~6% | Observed |
| H → cc̄ (charm quarks) | ~3% | Not yet observed; sensitivity improving |
| H → γγ (photons) | ~0.2% | Observed (loop-induced; discovery channel) |
| H → ZZ* | ~3% | Observed (discovery channel) |

Despite occurring only 0.2% of the time, the photon channel was the *first* mode used to discover the Higgs because photon pairs are easily distinguishable from background. Bottom-quark decays — the most common — required six more years of analysis (2018) due to the difficulty of distinguishing b-quark jets.

## The Charm Quark Challenge

Measuring the Higgs coupling to **charm quarks** (second-generation, ~3% decay rate) is experimentally considered "20 times harder" than the bottom-quark case, according to CERN physicist [Huilin Qu](../people/huilin-qu.md). The problem:

- Quarks are never observed directly; they hadronize into **jets** — sprays of ~50–100 secondary particles
- Charm quarks sit at an awkward intermediate mass: too light for the b-tagging techniques that use large mass and displaced vertices, yet too heavy for light-quark methods
- Backgrounds from other decay channels overwhelm the signal

[Huilin Qu](../people/huilin-qu.md) and [Loukas Gouskos](../people/loukas-gouskos.md) (CMS/UC Santa Barbara) addressed this with a point-cloud machine-learning architecture borrowed from self-driving car technology, representing jets as spatial point clouds rather than fixed-grid images. Their tagger achieves <1% misidentification in <30 ms, an order of magnitude better than prior methods.

Applied to LHC data, this improved sensitivity limits by **four orders of magnitude**: from ≤10,000× the Standard Model prediction down to ~4–5×. The HL-LHC (High-Luminosity LHC) is expected to finally observe the H→cc̄ decay directly.

## W Boson Longitudinal Polarization as a Higgs Probe

A complementary approach to understanding the Higgs mechanism is studying [W boson polarization](../concepts/w-boson-polarization.md). When the Higgs field switched on after the Big Bang, W and Z bosons absorbed parts of the Higgs field and acquired mass — and that absorbed component *became* the W boson's longitudinal polarization state. W bosons carrying longitudinal polarization thus function as fossils of the early Higgs field.

[Aram Apyan](../people/aram-apyan.md) (Brandeis, ATLAS) leads an effort to isolate pairs of longitudinally polarized W bosons at the LHC. Such pairs can interact via an intermediary Higgs boson — a process called WW scattering — making them "a really sensitive test of the Higgs mechanism." As of 2025, ATLAS has found evidence for W boson pairs in which at least one is longitudinally polarized. The eventual goal is to isolate pairs where *both* are longitudinally polarized, which would provide the most direct access to Higgs-mediated WW scattering ever observed.

## Significance for the Standard Model

Each measured Higgs coupling is a test of the [Standard Model](../theories/standard-model.md). The SM predicts that Higgs couplings scale with particle mass — heavier particles couple more strongly. Confirming (or violating) this pattern for second- and first-generation fermions is one of the key open precision measurements. Any deviation would signal [physics beyond the Standard Model](../open-questions/beyond-standard-model.md).

The [hierarchy problem](../concepts/hierarchy-problem.md) — why the Higgs mass sits at 125 GeV rather than the Planck scale — also remains one of the deepest unsolved questions connected to this particle.

## Sources

- ['Impossible' Higgs boson measurement within reach, thanks to a detour](../raw/articles/2025-08-05-impossible-higgs-boson-measurement.md)
- [Is Particle Physics Dead, Dying, or Just Hard?](../raw/articles/2026-01-26-particle-physics-dead-dying-hard.md)
- [LHC scientists find relics of early universe living on in particle spins](../raw/articles/2025-07-22-lhc-relics-early-universe-particle-spins.md)
