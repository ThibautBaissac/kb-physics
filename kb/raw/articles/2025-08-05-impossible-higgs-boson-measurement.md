---
title: "'Impossible' Higgs boson measurement within reach, thanks to a detour"
description: How CMS physicists used machine learning inspired by self-driving cars to measure Higgs boson decay into charm quarks — previously considered undetectable at the LHC
created_at: 2025-08-05
source: external
type: article
url: https://www.symmetrymagazine.org/article/impossible-higgs-boson-measurement-within-reach-thanks-to-a-detour
author: Sarah Charley
publication: Symmetry Magazine
---

# 'Impossible' Higgs boson measurement within reach, thanks to a detour

Physicist Huilin Qu vividly remembers the 2012 announcement of the Higgs boson discovery. During a webcast from his university auditorium, he decided to pursue research with the CMS experiment's spokesperson after watching the presentation.

Two years later, Qu was pursuing his PhD at UC Santa Barbara under Professor Joe Incandela, alongside postdoc Loukas Gouskos. Their initial goal focused on discovering new particles at the Large Hadron Collider. However, Gouskos proposed an unconventional detour: pausing their search for one year to develop innovative machine-learning tools.

Gouskos believed this approach would enable them to study Higgs properties previously considered impossible to test at the LHC. He described the undertaking as "Mission: Impossible," with their objective being to make it possible.

## The Higgs Field and Particle Interactions

The Higgs boson is a rare, short-lived particle created by concentrating enormous energy into the Higgs field — a substance permeating the universe. Particles interacting strongly with this field gain mass. When Higgs bosons decay, they preferentially transform into mass-interacting particles.

Scientists determine particle-Higgs interactions by examining decay frequencies. Most Higgs bosons decay into bottom quarks, confirming their mass relationship. However, whether the Higgs interacts with lighter-generation quarks remains experimentally unconfirmed, despite theoretical predictions.

Qu and Gouskos targeted observing Higgs decay into charm quarks — second-generation particles. This decay occurs approximately 3% of the time, making it "20 times smaller than the decay rate of Higgs bosons into bottom quarks," according to Qu, who is now a CERN research physicist.

## The Challenge of Identifying Quarks

Discovering Higgs-to-bottom-quark decay required six additional years after the original Higgs discovery in 2012. The Higgs was initially discovered through rarer decay channels, such as transforming into photons, which occur only 0.2% of the time but are easily distinguishable.

Quarks present significantly greater complications. As Gouskos explains, "We never see the quarks. Instead, they turn into something we call jets; each one is a spray of about 50 to 100 particles."

Machine-learning algorithms successfully identified bottom-quark jets by analyzing their large mass and decay patterns. However, charm quarks' intermediate properties rendered this technique ineffective.

## Machine-Learning Innovation

Qu notes that "identifying the original quark that instigated a particle jet is a nearly impossible task for humans." Human performance would resemble random guessing when confronted with jets containing hundreds or thousands of measurable input features per particle.

Qu and Gouskos's team initially employed image-recognition and natural-language-processing approaches before realizing a better solution existed: self-driving car technology. As Qu describes, "Self-driving cars use sensors to create a collection of points in space, and each point is assigned spatial coordinates and other properties." This framework allowed them to represent jets as spatial point clouds rather than sequential data.

The team incorporated physics-specific rules into their algorithm. Gouskos explains that "injecting physics knowledge helps the algorithm learn," including methods for reconstructing parent-particle masses from secondary-particle properties.

## Computing Resources

As their model became increasingly sophisticated, computational demands exceeded CERN's available GPU capacity. The team sourced powerful graphics processors from the gaming industry and constructed their own computer after Qu watched instructional YouTube videos. The custom system proved highly effective for training their charm-quark identification algorithms.

Testing revealed remarkable improvements: jets were classified in under 30 milliseconds with less than 1% misidentification rates — surpassing traditional techniques by an order of magnitude. Initial CMS collaboration responses suggested skepticism, with colleagues believing "There must be something wrong. It cannot be true."

## Validation and Results

Before applying their tool to Higgs analysis, the team validated it using Z bosons decaying into charm-quark pairs — a more common process. Results demonstrated "spot on" agreement between observed data and predictions, as Gouskos notes.

Subsequently testing their machine-learning approach on actual Higgs-to-charm-quark decay searches, the team improved previous limits by four orders of magnitude. Previous data suggested decay rates could not exceed 10,000 times the Standard Model prediction; their analysis reduced this to "four or five times the expected value."

Although direct observation remains elusive pending additional data collection, results indicate that observation becomes feasible with sufficient future measurements. Qu emphasizes the significance: "People thought we wouldn't have this level of sensitivity until the end of the HL-LHC, and we have already surpassed those projections."
