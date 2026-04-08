---
title: W Boson Polarization
description: The three spin states of the W boson, with longitudinal polarization encoding information about the Higgs field in the early universe and enabling precision tests of the Higgs mechanism
type: concept
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [concepts/higgs-boson.md, theories/standard-model.md, experiments/large-hadron-collider.md, concepts/neutrino.md, people/aram-apyan.md]
sources: [2025-07-22-lhc-relics-early-universe-particle-spins.md]
---

# W Boson Polarization

Polarization describes how a particle spins relative to its direction of motion. For the [W boson](../theories/standard-model.md) — one of the carriers of the weak nuclear force — polarization comes in three states:

- **Transverse (left-handed):** Spin rotates clockwise relative to the direction of motion
- **Transverse (right-handed):** Spin rotates counterclockwise relative to the direction of motion
- **Longitudinal:** Spin is perpendicular to the direction of motion

As physicist Aram Apyan explains: "Polarization is how a particle spins relative to its motion." Crucially, "the particles are not actually rotating — there's no classical equivalence." These are quantum mechanical states.

## Connection to the Higgs Mechanism

Longitudinal polarization is not merely a curiosity — it is a direct fossil of the early universe. When the [Higgs field](../concepts/higgs-boson.md) switched on as the universe cooled after the Big Bang (~10⁻¹² seconds), W and Z bosons absorbed parts of the Higgs field and acquired mass. That absorbed component of the Higgs field *became* the longitudinal polarization state.

As Max Stange (ATLAS, Brandeis) describes it: "Finding W bosons with longitudinal polarization is like finding people with a high percentage of Neanderthal DNA; they carry inside them information about an ancient ancestor, which in our case is the Higgs field as it existed in the early universe."

At low energies, W bosons exist in a quantum mixture of all three polarization states simultaneously. As their energies increase, they increasingly favor the longitudinal state — the one that connects to the Higgs field. This makes high-energy W boson pair production at the [LHC](../experiments/large-hadron-collider.md) the primary arena for this measurement.

## Longitudinally Polarized W Boson Pairs as a Higgs Probe

Pairs of W bosons that are *both* longitudinally polarized can interact with each other via an intermediary [Higgs boson](../concepts/higgs-boson.md) — a process called WW scattering. This makes them, according to Apyan, "a really sensitive test of the Higgs mechanism" and "one of the main processes that will eventually give us a complete understanding" of how the Higgs field gives particles their mass.

## The Measurement Challenge

Measuring W boson polarization is indirect — only inferred from the momenta, energies, and angles of the particles the W decays into. This is, as physicist Daniel Camarero Muñoz says, "kind of like detective work."

The specific challenge in the ATLAS analysis is that the W boson decays of interest include [neutrinos](../concepts/neutrino.md), which pass through detectors without a trace. A single neutrino can be accounted for using momentum conservation, but W boson *pairs* produce two neutrinos, creating an unresolvable directional ambiguity.

### Machine-Learning Solution

To tackle this, [Aram Apyan](../people/aram-apyan.md) and colleagues at ATLAS deployed machine-learning techniques including **boosted decision trees** and **deep neural networks**. Neural networks were trained to recognize the angular and kinematic signatures of longitudinal polarization despite the missing neutrino information.

A key concern was training bias: neural networks learn from simulated data, so they risk encoding theoretical assumptions as if they were experimental discoveries. The team addressed this with a multi-step validation system — several groups of neural networks evaluating and cross-checking each other's performance to suppress training biases.

When applied to real LHC data, the algorithms found **evidence for W boson pairs with at least one longitudinally polarized member**, with strong agreement with theoretical predictions.

## Status and Outlook

As of 2025, the ATLAS result constitutes evidence, not discovery (the threshold in particle physics is typically 5σ statistical significance). The next steps are:

1. Refine analysis techniques
2. Expand the dataset with more LHC collisions
3. Reach discovery-threshold significance for mixed polarization pairs
4. Eventually isolate pairs in which **both** W bosons are longitudinally polarized — the smoking-gun Higgs mechanism signature

## Sources

- [LHC scientists find relics of early universe living on in particle spins](../raw/articles/2025-07-22-lhc-relics-early-universe-particle-spins.md)
