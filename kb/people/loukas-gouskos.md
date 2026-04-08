---
title: Loukas Gouskos
description: Physicist who proposed the machine-learning detour that led to the point-cloud jet tagger for Higgs-to-charm-quark measurements at CMS
type: person
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [people/huilin-qu.md, experiments/large-hadron-collider.md, concepts/higgs-boson.md, theories/standard-model.md]
sources: [2025-08-05-impossible-higgs-boson-measurement.md]
tags: [particle-physics, experimental-methods]
---

# Loukas Gouskos

Loukas Gouskos is a physicist who proposed and co-led the unconventional machine-learning research program that enabled the first sensitive measurement of the [Higgs boson](../concepts/higgs-boson.md)'s coupling to charm quarks at the [Large Hadron Collider](../experiments/large-hadron-collider.md).

## The "Mission: Impossible" Detour

While a postdoc at UC Santa Barbara working alongside PhD student [Huilin Qu](../people/huilin-qu.md) under Professor Joe Incandela, Gouskos proposed suspending new-particle searches for a year to build advanced machine-learning tools instead. He framed the objective as **"Mission: Impossible"** — making a measurement everyone assumed was beyond LHC reach.

His core intuition: by investing in better jet-tagging algorithms, the team could access [Standard Model](../theories/standard-model.md) measurements previously ruled inaccessible. Specifically, Gouskos targeted the Higgs boson's decay to **charm quarks**, occurring at ~3% frequency — 20× rarer than bottom-quark decays.

## Jet Identification Challenge

As Gouskos explains, "We never see the quarks. Instead, they turn into something we call jets; each one is a spray of about 50 to 100 particles." Existing algorithms classified bottom-quark jets well (exploiting their large mass and distinctive decay signatures), but charm quarks' intermediate properties defeated these methods.

Gouskos advocated "injecting physics knowledge" into the algorithm — encoding how to reconstruct parent-particle masses from secondary-particle properties — rather than relying purely on data-driven learning.

## Validation and Impact

The team validated their tagger on Z boson → charm-quark-pair decays before applying it to Higgs data. Gouskos described the agreement with predictions as "spot on." The subsequent Higgs analysis improved sensitivity by **four orders of magnitude**, bringing the measurement from undetectable to approaching the [Standard Model](../theories/standard-model.md) prediction range.

## Sources

- ['Impossible' Higgs boson measurement within reach, thanks to a detour](../raw/articles/2025-08-05-impossible-higgs-boson-measurement.md)
