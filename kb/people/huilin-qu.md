---
title: Huilin Qu
description: CERN research physicist who co-developed ParticleNet — a point-cloud machine-learning architecture for jet tagging that enabled the first sensitive Higgs-to-charm-quark measurements at the LHC
type: person
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [people/loukas-gouskos.md, experiments/large-hadron-collider.md, concepts/higgs-boson.md, theories/standard-model.md]
sources: [2025-08-05-impossible-higgs-boson-measurement.md]
tags: [particle-physics, experimental-methods]
---

# Huilin Qu

Huilin Qu is a research physicist at CERN working on the CMS experiment at the [Large Hadron Collider](../experiments/large-hadron-collider.md). He is best known for co-developing a machine-learning architecture for particle jet identification that made previously "impossible" [Higgs boson](../concepts/higgs-boson.md) measurements accessible.

## Background

Qu was inspired to enter experimental particle physics by watching the 2012 Higgs boson discovery webcast from his university auditorium. He subsequently pursued his PhD at UC Santa Barbara under Professor Joe Incandela (one of the two CMS spokespersons who announced the Higgs discovery) alongside postdoc [Loukas Gouskos](../people/loukas-gouskos.md).

## The Machine-Learning Detour

Rather than searching directly for new particles, Gouskos proposed a year-long detour to build machine-learning tools. Qu and Gouskos drew inspiration from self-driving car technology — representing particle jets as **spatial point clouds** rather than images or sequences. In self-driving systems, sensors assign each detected point spatial coordinates and other properties; Qu's team applied the same representation to the 50–100 particles in a hadronic jet.

The key innovations were:
- **Point-cloud jet representation**: treating jets as collections of three-dimensional coordinate points rather than fixed-grid images
- **Physics-injected learning**: encoding knowledge of parent-particle mass reconstruction and decay kinematics into the algorithm
- **Custom GPU cluster**: when CERN's computing capacity proved insufficient, Qu built a gaming-grade GPU system after watching instructional YouTube videos

The resulting classifier identifies the originating quark species in under 30 milliseconds with less than 1% misidentification — surpassing traditional methods by an order of magnitude.

## Higgs-to-Charm Measurement

The primary motivation was measuring the [Higgs boson](../concepts/higgs-boson.md)'s coupling to **charm quarks** — second-generation particles. The [Standard Model](../theories/standard-model.md) predicts this decay occurs ~3% of the time, roughly 20× less frequently than decay to bottom quarks. The intermediate mass of charm quarks (lighter than bottom, heavier than up/down/strange) made conventional tagging techniques ineffective.

Before applying the tool to Higgs analysis, Qu and Gouskos validated it on Z boson → charm-quark-pair decays, a more common process. Agreement with predictions was "spot on."

Applied to Higgs data, the tool improved sensitivity limits by **four orders of magnitude**: from "cannot exceed 10,000 times the Standard Model prediction" down to "four or five times the expected value." Direct observation still requires more data, but Qu notes: "People thought we wouldn't have this level of sensitivity until the end of the HL-LHC, and we have already surpassed those projections."

## Sources

- ['Impossible' Higgs boson measurement within reach, thanks to a detour](../raw/articles/2025-08-05-impossible-higgs-boson-measurement.md)
