---
title: "FluxMC: Rapid and High-Fidelity Inference for Space-Based Gravitational-Wave Observations"
description: Machine learning-enhanced Bayesian inference framework combining Flow Matching with Parallel Tempering MCMC for space-based gravitational-wave parameter estimation
created_at: 2026-04-03
source: external
type: paper
url: https://arxiv.org/abs/2604.04957
author: Bo Liang et al.
publication: arXiv
arxiv_id: "2604.04957"
original: _originals/2604.04957.pdf
---

Bayesian inference in the physical sciences faces a fundamental challenge: the imperative for high-fidelity physical modeling often clashes with the intrinsic limitations of stochastic sampling algorithms. Complex, high-dimensional parameter spaces expose the universal vulnerability of conventional methods, e.g., Markov Chain Monte Carlo (MCMC), which struggle with the prohibitive costs of likelihood evaluations and the risk of entrapment in local optima. To resolve this impasse, we introduce FluxMC (Flow-guided Unbiased eXploration Monte Carlo), a machine learning-enhanced framework designed to shift the inference paradigm from blind local search to globally guided transport. It integrates Flow Matching with Parallel Tempering MCMC, effectively combining the global foresight of generative AI with the rigorous asymptotic convergence and local robustness of temperature-based sampling. We showcase the efficacy of this framework through the lens of space-based gravitational-wave (GW) astronomy -- a field representing the frontier of challenging parameter inversion. In the analysis of massive black hole binaries using high-fidelity waveforms (IMRPhenomHM), FluxMC achieves robust convergence in under five hours, whereas traditional Parallel Tempering MCMC fails to converge even after hundreds of hours, yielding high Jensen-Shannon divergences (JSD) of O(10^-1). Our method reduces the distributional error by two to three orders of magnitude. Furthermore, for computationally efficient models (IMRPhenomD), it eliminates systematic biases caused by local-optima entrapment. Ultimately, FluxMC removes the necessity to compromise between model accuracy and analysis speed, establishing a new computational foundation where scientific discovery is limited only by observational data quality, not by algorithmic capacity.
