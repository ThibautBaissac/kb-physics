---
title: Large Hadron Collider
description: CERN's 27-km supercollider — discovered the Higgs boson (2012) but found no new physics beyond the Standard Model, triggering a crisis in particle physics
type: experiment
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [theories/standard-model.md, concepts/hierarchy-problem.md, concepts/scattering-amplitudes.md, concepts/magic-states.md, concepts/toponium.md, concepts/quantum-entanglement.md, experiments/future-colliders.md, experiments/alice-detector.md, open-questions/beyond-standard-model.md, concepts/higgs-boson.md, people/huilin-qu.md, people/loukas-gouskos.md, concepts/w-boson-polarization.md, people/aram-apyan.md]
sources: [2026-01-26-particle-physics-dead-dying-hard.md, 2025-11-25-magic-at-lhc.md, 2025-12-09-curiouser-alice-detector.md, 2025-08-05-impossible-higgs-boson-measurement.md, 2025-07-22-lhc-relics-early-universe-particle-spins.md, 2025-07-08-top-quark-pairs-toponium-lhc.md]
---

# Large Hadron Collider

The Large Hadron Collider (LHC) is a 27-kilometer supercollider at CERN, near Geneva, that collides protons at the highest energies ever achieved in a laboratory. It was built for billions of euros with the dual purpose of confirming the [Standard Model](../theories/standard-model.md) and discovering physics beyond it.

## The Higgs Discovery (2012)

In July 2012, LHC physicists announced the discovery of the Higgs boson, the last piece of the Standard Model. The Higgs imbues other elementary particles with mass, enabling the formation of atoms. By the time it was found, there was already little doubt about its existence.

## The Null Result

More striking was what did *not* emerge. Physicists expected to find supersymmetric partner particles, dark matter candidates, or other signs of new physics that would address the [hierarchy problem](../concepts/hierarchy-problem.md). Instead, only the 25 known particles of the Standard Model were observed.

Mikhail Shifman: "Of course, it is disappointing. We're not gods. We're not prophets. In the absence of some guidance from experimental data, how do you guess something about nature?"

## Current Operations

The LHC continues running and will for at least another decade. Recent improvements include:

- **AI-assisted analysis:** Pattern recognizers classify collision events more accurately than human-made algorithms, improving [scattering amplitude](../concepts/scattering-amplitudes.md) measurements
- **Hidden valleys:** [Matt Strassler](../people/matt-strassler.md) (Harvard) argues that lighter novel particles could still lurk in unexplored regions of the data — "There's a huge amount of unexplored territory there"
- **Precision Standard Model tests:** Every improvement in statistics has so far matched Standard Model predictions exactly

### Higgs Coupling to Charm Quarks

One notable ML-driven breakthrough: [Huilin Qu](../people/huilin-qu.md) and [Loukas Gouskos](../people/loukas-gouskos.md) (CMS) developed a **point-cloud jet tagger** inspired by self-driving car technology to measure the [Higgs boson](../concepts/higgs-boson.md)'s coupling to charm quarks — a decay that occurs ~3% of the time and was previously considered undetectable at the LHC. Their algorithm, trained on a custom GPU cluster and incorporating physics-specific rules, achieves <1% misidentification. It improved sensitivity limits by four orders of magnitude, from ≤10,000× the Standard Model prediction to ~4–5×. As Qu notes: "People thought we wouldn't have this level of sensitivity until the end of the HL-LHC, and we have already surpassed those projections."

Michelangelo Mangano (CERN): "The fact that it's not giving positive results does not mean we are stuck, dead, or wasting our time."

### W Boson Polarization and the Higgs Mechanism

A separate ATLAS analysis by [Aram Apyan](../people/aram-apyan.md) (Brandeis) targets [W boson longitudinal polarization](../concepts/w-boson-polarization.md) — the spin state that W bosons acquired when they absorbed parts of the Higgs field as the universe cooled after the Big Bang. Longitudinally polarized W boson pairs can scatter via an intermediary Higgs boson, providing a direct probe of the Higgs mechanism.

The challenge is that the relevant W boson decays include two neutrinos, which leave no detector trace, creating an unresolvable directional ambiguity. The team deployed neural networks with a multi-step bias-suppression validation framework. Applied to real data, the analysis found evidence for W boson pairs with at least one longitudinally polarized member, with strong agreement with Standard Model predictions. The ultimate target — both W bosons longitudinally polarized — remains for future higher-luminosity data.

## Quantum Information at the LHC (2023–2025)

Seventeen years after startup, the LHC has opened a new frontier: using particle collisions to study quantum information. Ninety million times a year, proton collisions produce top quark and anti-top quark pairs — the heaviest known elementary particles — that are [quantum entangled](../concepts/quantum-entanglement.md). Because top quarks decay before combining with other quarks, their quantum states can be directly recorded.

Key milestones:
- **2023:** ATLAS measured [entanglement](../concepts/quantum-entanglement.md) between top and anti-top quarks for the first time
- **2025:** CMS detected [magic states](../concepts/magic-states.md) in entangled top quark pairs — the first detection of quantum magic in particle physics, demonstrating [contextuality](../concepts/contextuality.md) in collider data
- **2025:** CMS and ATLAS confirmed [toponium](../concepts/toponium.md), a top-antitop quasi-bound state predicted in 1990 — CMS at 5σ (cross section 8.8 ± 1.3 pb, from analysis of 2016–2018 data) and ATLAS at 7.7σ (9.0 ± 1.3 pb, full Run-2), presented at EPS-HEP in Marseille. CMS originally stumbled on the excess while searching for Higgs boson variants; detection was also independently enabled by quantum information techniques

[Alan Barr](../people/alan-barr.md) (Oxford) frames this as treating "the process of colliding things together and forming new particles as a quantum processor." [Regina Demina](../people/regina-demina.md) (Rochester) described it as "like a gold rush right now."

Open questions include whether entanglement persists through top quark decay, and whether the [Page-Wootters mechanism](../concepts/page-wootters-mechanism.md) — emergent time from entanglement — could be demonstrated with elementary particles.

## Heavy-Ion Program (ALICE)

The [ALICE detector](../experiments/alice-detector.md) is the LHC's dedicated heavy-ion experiment, colliding lead nuclei to study the quark-gluon plasma. Its 2023 lead-ion run produced a notable operational puzzle: the inner tracking system developed a mysterious "hole" traced to lead-207 contamination in the beam. Accelerator physicist [Roderik Bruce](../people/roderik-bruce.md) diagnosed the cause and the team devised a fix that reduced background signals by a factor of 100 — ultimately allowing ALICE to collect more data than all prior lead-ion runs combined.

## Legacy

The LHC confirmed the Standard Model with exquisite precision but produced no evidence of new physics, triggering a decade-long crisis. This has motivated proposals for [future colliders](../experiments/future-colliders.md), a shift toward amplitude-based theoretical approaches, and most recently, a convergence with quantum information theory.

## Sources

- [Is Particle Physics Dead, Dying, or Just Hard?](../raw/articles/2026-01-26-particle-physics-dead-dying-hard.md)
- [Particle Physicists Detect 'Magic' at the Large Hadron Collider](../raw/articles/2025-11-25-magic-at-lhc.md)
- [Curiouser and curiouser: a riddle at the ALICE detector](../raw/articles/2025-12-09-curiouser-alice-detector.md)
- ['Impossible' Higgs boson measurement within reach, thanks to a detour](../raw/articles/2025-08-05-impossible-higgs-boson-measurement.md)
- [LHC scientists find relics of early universe living on in particle spins](../raw/articles/2025-07-22-lhc-relics-early-universe-particle-spins.md)
- [Elusive romance of top-quark pairs observed at the LHC](../raw/articles/2025-07-08-top-quark-pairs-toponium-lhc.md)
