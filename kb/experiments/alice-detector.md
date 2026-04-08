---
title: ALICE Detector
description: CERN's dedicated heavy-ion experiment at the LHC, designed to study quark-gluon plasma by colliding lead nuclei at extreme energies
type: experiment
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [experiments/large-hadron-collider.md, concepts/quantum-chromodynamics.md, people/sarah-porteboeuf.md, people/roderik-bruce.md]
sources: [2025-12-09-curiouser-alice-detector.md]
---

# ALICE Detector

ALICE (A Large Ion Collider Experiment) is one of the four main detectors at CERN's [Large Hadron Collider](../experiments/large-hadron-collider.md). Unlike CMS and ATLAS, which focus on proton-proton collisions, ALICE is dedicated to studying the collisions of heavy lead nuclei — conditions designed to recreate the quark-gluon plasma (QGP) that permeated the universe microseconds after the Big Bang.

ALICE relies on its inner tracking system to reconstruct the thousands of charged particle tracks produced in a single lead-lead collision, making detector integrity critical to data quality.

## Upgrades and the 2019–2022 Shutdown

ALICE underwent major detector upgrades between 2019 and 2021 during the LHC's Long Shutdown 2. The collaboration hadn't collected new lead-ion data since 2018 due to the planned maintenance period, followed by an unplanned helium leak in 2022 that delayed restart.

This made the 2023 lead-ion run a particularly high-stakes data-collection window.

## The 2023 Lead-207 Mystery

When ALICE's 2023 lead-ion run began, Run Coordinator [Sarah Porteboeuf](../people/sarah-porteboeuf.md) immediately noticed a serious anomaly: "During the first two minutes of data taking, I saw that our inner tracking system had a problem: There was a hole." A large sector of the inner tracker had gone dark — threatening to eliminate roughly one-quarter of the detector's functionality.

Detector misconfiguration was ruled out quickly. The source was the LHC beam itself.

[Roderik Bruce](../people/roderik-bruce.md), a CERN accelerator physicist, led beam diagnostics. Simulations pointed to contamination by lead-207 ions — isotopes with half a percent less mass than the intended lead-208 beam. Because the lighter ions bend more strongly in the LHC's magnets, they developed an oscillating secondary beam that traveled off-axis, eventually oversaturating the inner tracker's chips through the collimator protection system.

The contamination traced back to IR7, a collimator section ~10 km upstream of ALICE. The LHC's beam cleaning system was occasionally stripping neutrons from lead-208 ions, converting them into lead-207 — an unintended byproduct of routine beam halo removal.

## Solution and Outcome

The fix was elegant: deliberately induce an out-of-phase oscillation in the contaminating lead-207 beam, causing it to miss the ALICE collimator entirely and instead strike distant absorbers. This reduced the background signal rate by a factor of 100.

Despite losing the first 10 days of data to diagnosis and repair, ALICE ultimately collected more data during 2023 than in all prior lead-ion runs combined. Porteboeuf: "This was an excellent year."

The episode illustrates how tightly coupled detector performance is to beam physics — and how collaborative problem-solving across accelerator and detector communities drives results at the LHC.

## Sources

- [Curiouser and curiouser: a riddle at the ALICE detector](../raw/articles/2025-12-09-curiouser-alice-detector.md)
