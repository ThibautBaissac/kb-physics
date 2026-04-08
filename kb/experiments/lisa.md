---
title: LISA and Space-Based Gravitational-Wave Observatories
description: Planned millihertz gravitational-wave observatories (LISA, Taiji, TianQin) that will detect massive black hole mergers, enabling precision tests of general relativity and cosmology
type: experiment
evidence: primary
created_at: 2026-04-08
updated_at: 2026-04-08
related: [experiments/gravitational-wave-detectors.md, concepts/massive-black-hole-binaries.md, concepts/black-hole-physics.md, concepts/no-hair-theorem.md, concepts/dark-energy.md]
sources: [2026-04-03-fluxmc-gravitational-wave-inference.md]
tags: [general-relativity, black-holes, experimental-methods]
---

# LISA and Space-Based Gravitational-Wave Observatories

Space-based gravitational-wave observatories will open the **millihertz frequency band** (0.1–100 mHz), inaccessible to ground-based detectors like [LIGO, Virgo, and KAGRA](../experiments/gravitational-wave-detectors.md), which operate in the 10–1000 Hz range. The millihertz band is where [massive black hole binary](../concepts/massive-black-hole-binaries.md) mergers emit their strongest signals.

## LISA (Laser Interferometer Space Antenna)

LISA is an ESA-led mission (with NASA participation) planned for launch in the mid-2030s.

- **Configuration**: Three spacecraft in a triangular formation trailing Earth in a heliocentric orbit
- **Arm length**: L = 2.5 × 10⁹ m (2.5 million km)
- **Laser propagation time**: d = 8.3 seconds
- **Noise budget**: Optical Metrology System (OMS) noise A_OMS = 15 × 10⁻¹² m/√Hz; test-mass residual acceleration (ACC) noise A_ACC ≈ 3 × 10⁻¹⁵ m/s²/√Hz
- **Data channels**: Time-Delay Interferometry (TDI) combinations suppress laser frequency noise

### Key Science Targets

1. **Massive black hole binary mergers** — The most energetic astrophysical events since the Big Bang, with signal-to-noise ratios up to O(10³)–O(10⁴)
2. **Standard sirens** — Coalescing MBHBs enable direct luminosity distance measurements, probing the expansion history and the Hubble tension
3. **Tests of general relativity** — Inspiral-merger-ringdown consistency tests in the strong-field regime
4. **Black hole seed mechanisms** — Precise mass and spin measurements discriminate between hierarchical formation models

### Detection Rate

An anticipated O(10²) events per year, with signal durations spanning months — creating significant data analysis demands.

## Taiji

Taiji is a Chinese space-based GW observatory with a similar design to LISA.

- **Arm length**: L = 3 × 10⁹ m (3 million km), slightly longer than LISA
- **Laser propagation time**: d ≈ 10 seconds
- **Noise budget**: A_OMS = 8 × 10⁻¹² m/√Hz; A_ACC = 3 × 10⁻¹⁵ m/s²/√Hz
- **Status**: Under development by the Chinese Academy of Sciences

Both LISA and Taiji share the same noise spectral model (OMS + ACC components) but differ in their noise budget parameters.

## TianQin

A third planned space-based GW mission (Chinese), with shorter arm lengths and a geocentric orbit. Complementary to LISA and Taiji.

## Data Analysis Challenges

The high signal-to-noise ratios and long signal durations of space-based GW observations create severe challenges for Bayesian parameter estimation:

- **High dimensionality**: 11 physical parameters per MBHB signal (chirp mass, mass ratio, two spins, coalescence time, phase, luminosity distance, inclination, ecliptic longitude, ecliptic latitude, polarization)
- **Multimodal posteriors**: The likelihood surface exhibits well-known degeneracies — particularly in extrinsic parameters (sky location, distance, polarization) — that trap conventional MCMC samplers in local optima
- **Computational cost**: Traditional Parallel Tempering MCMC requires hundreds of hours per event with high-fidelity waveform models (IMRPhenomHM), rendering real-time analysis impossible

Machine learning-enhanced methods like FluxMC (Flow-guided Unbiased eXploration Monte Carlo) address these challenges by combining Flow Matching with Parallel Tempering MCMC, achieving convergence in under 5 hours where traditional methods fail after hundreds of hours. FluxMC reduces distributional error (Jensen-Shannon divergence) by ~180× compared to conventional PTMCMC.

## Sources

- [FluxMC: Rapid and High-Fidelity Inference for Space-Based Gravitational-Wave Observations](../raw/papers/2026-04-03-fluxmc-gravitational-wave-inference.md)
