---
title: "Physicists Take the Imaginary Numbers Out of Quantum Mechanics"
description: "Real-valued reformulations of quantum theory show imaginary numbers aren't essential, but complex arithmetic's hallmarks persist"
created_at: 2025-11-07
source: external
type: article
url: https://www.quantamagazine.org/physicists-take-the-imaginary-numbers-out-of-quantum-mechanics-20251107/
author: Daniel Garisto
publication: Quanta Magazine
---

# Physicists Take the Imaginary Numbers Out of Quantum Mechanics

Quantum mechanics has at last been formulated exclusively with real numbers, bringing a mathematical puzzle at the heart of the theory into a new era of inquiry.

## Introduction

A century ago, the strange behavior of atoms and elementary particles led physicists to formulate a new theory of nature. That theory, quantum mechanics, found immediate success, proving its worth with accurate calculations of hydrogen's emission and absorption of light. There was, however, a snag. The central equation of quantum mechanics featured the imaginary number *i*, the square root of −1.

Physicists knew *i* was a mathematical fiction. Real physical quantities like mass and momentum never yield a negative amount when squared. Yet this unreal number that behaves as *i*² = −1 seemed to sit at the heart of the quantum world.

After deriving the *i*-riddled equation — essentially the law of motion for quantum entities — Erwin Schrödinger expressed the hope that it would be replaced by an entirely real version. Schrödinger's distaste notwithstanding, *i* stuck around, and new generations of physicists took up his equation without much concern.

Then, in 2021, the role of imaginary numbers in quantum theory attracted newfound interest. A team of researchers proposed a way to empirically determine whether *i* is essential to quantum theory or a mere mathematical convenience. Two teams quickly followed up to perform the intricate experiments and found supposedly unequivocal evidence that quantum theory needs *i*.

This year, however, a series of papers has overturned that conclusion.

In March, a group of theorists based in Germany rebutted the 2021 studies, putting forward a real-valued version of quantum theory that's exactly equivalent to the standard version. Two theorists in France followed up with their own formulation of a real-valued quantum theory. And in September, another researcher approached the question from the perspective of quantum computing and arrived at the same answer: *i* isn't necessary for describing quantum reality after all.

Although the real-valued theories avoid explicit use of *i*, they do retain hallmarks of its distinct arithmetic. This leads some to wonder whether the imaginary aspect of quantum mechanics — or even reality itself — is truly vanquished.

"The mathematical formulation does guide what we infer about the nature of the physical world," said Jill North, a philosopher of physics at Rutgers University.

## Impossible Values

Living in Amsterdam in 1637 at the peak of tulip mania (the Dutch frenzy for flowers which led to impossibly valued tulip bulbs), René Descartes grappled with equations whose solutions also seemed to have impossible values. Using *x*³ − 6*x*² + 13*x* − 10 = 0 as an example, Descartes wrote that its solutions "are not always real; but sometimes only imaginary." The three numbers you can plug in for *x* are 2, 2 − *i* and 2 + *i*. The latter two numbers, each of which has both a real part and an imaginary part in the form *a* + *ib*, came to be called complex numbers.

Descartes viewed them with derision, but complex numbers were later adopted for their utility in fields as diverse as geometry, optics and signal analysis.

Schrödinger grudgingly acknowledged their ease of use in quantum theory. His equation governs the evolution of the wave function, an entity representing the possible quantum states of an object. (These states can interfere destructively and constructively like waves.) Schrödinger's wave function was complex-valued, even though actual measurements of quantum systems always return real values. "Quantum theory really is the first physical theory where the complex numbers seem to be right smack in the middle of the theory," said Bill Wootters, a quantum information theorist at Williams College.

One way to represent a complex number like *a* + *ib* is as a point on a plane, where *a* is the position on the *x*-axis (which can be thought of as the real number line) and *b* is the position on an imaginary *y*-axis. Each complex number is an arrow, called a vector, pointing from the origin to the complex coordinate (*a*, *b*). These complex vectors obey the unusual math of complex numbers: Multiplying by *i*, for example, rotates the vector 90 degrees.

These properties made them a natural fit for the quantum states of the wave function — also vectors obeying odd combination rules.

Physicists tried now and again to define equivalent vectors with real numbers. In 1960 the Swiss physicist Ernst Stueckelberg developed a real-valued quantum mechanics that mapped the wave function from a complex-valued space to a real one, using a few tricks to get real numbers to mimic the rotations around an imaginary axis. But where complex-valued theory was compact, the real-valued theory was cumbersome. The wave function for two particles involves four complex numbers; extending Stueckelberg's formulation to two particles increases the description to 16 real numbers.

The clunkiness of real-valued quantum theories notwithstanding, in 2008 and 2009, two groups showed it was possible to use these theories to re-create the standard results of the Bell test — a crucial probe of quantum theory's properties. "For a lot of things, you actually can get away with the real theory," Wootters said. But would the real-valued theory always produce the same results?

## Key Assumptions

In 2021, a group of researchers including Nicolas Gisin, a physicist at Constructor University and the University of Geneva, realized that they could test the limits of real-valued theories by making a Bell test more complicated.

Canonically, Bell tests involve the creation of a pair of "entangled" particles: particles whose possible states are linked, such as photons with correlated polarizations. The particles are separated and sent to two participants nicknamed Alice and Bob, who measure their polarizations and compare notes.

Gisin's team instead considered a bespoke Bell test with two separate sources of entangled particles and three participants: Alice, Bob and Charlie. Running the numbers, they found that there was a ceiling on how correlated the polarizations of the entangled particles could be for a real-valued quantum theory, and a different, higher ceiling for a complex-valued quantum theory. This was no longer a matter of calculational ease or philosophy: An empirical test existed that could rule out real-valued quantum mechanics.

Soon after, a group at the University of Science and Technology of China (USTC) in Hefei ran the protocol and found that the observed correlations between entangled photons far exceeded the limit for the real-valued theory. Complex numbers seemed essential for describing these quantum states.

But the statistically overwhelming result didn't quell the questions.

"Complex numbers are just two real numbers with some calculation rules," said Michael Epping, a physicist at the German Aerospace Center and a co-author on the new German paper. "Why shouldn't you be able to describe quantum mechanics just using real numbers?"

Mischa Woods of the École Normale Supérieure in Lyon and Timothée Hoffreumon of Paris-Saclay University, co-authors on the new French paper, were also dubious. In the 2021 paper, Gisin and his colleagues made a critical assumption about the "tensor product," a mathematical operation that wrangles the complex vectors describing Alice's particle and Charlie's particle into one entangled state. Gisin and his co-authors assumed that a real-valued version of quantum theory would use the same mathematical formulation of the tensor product to combine states.

But the French and German teams argue that that form of tensor product is the wrong rule for a real-valued theory. By way of analogy, in flat space, the hypotenuse of a right triangle is always *a*² + *b*² = *c*². But that rule doesn't hold for a triangle in curved space, like one that's stamped on the surface of a sphere. A recent argument, adopted by the two teams, is that the standard tensor product is a specific case of a more general class of vector-combination rules. They developed different combination rules to create real-valued quantum theories that give exactly the same predictions as a complex quantum theory.

A new development in quantum computing also shows how to avoid complex numbers. Quantum computers use "logic gates" to manipulate quantum bits. One common logic gate, called a T gate, rotates the vector representing the quantum bit's state around the complex plane. In September, Craig Gidney, a quantum computing expert at Google Quantum AI, found a way to eliminate T gates from any quantum algorithm — numerically proving that quantum computing doesn't require complex numbers.

## What Comes Naturally

The feasibility of real-valued quantum theory raises provocative questions. Foremost among them: Why is it so much more complicated? The question has been with us since the birth of quantum mechanics; Schrödinger attempted to work with a real-valued wave equation but turned to a complex one because it was "extraordinarily much simpler for computational purposes," as he described it in his notes.

Today it seems that quantum theory does not explicitly need *i*, but there may still be something natural about the simplicity Schrödinger found. "Complex quantum theory, with its natural tensor product, remains far more concise, elegant and mathematically straightforward," said Chao-Yang Lu, an experimental physicist at USTC who was part of the team that carried out the bespoke Bell test proposed by Gisin's team.

"Even when you translate quantum theory into real numbers, you still see the hallmark of complex-number arithmetic," Wootters said.

Even those who emancipated the theory from complex numbers admit that the latter are a natural fit. The real-valued theories do not contain *i*, but they copy its ability to rotate vectors. We "simulate complex numbers by means of real numbers," said Anton Trushechkin, a physicist at Heinrich Heine University Düsseldorf and co-author on the German paper.

North, the philosopher of physics, agrees with Lu. "Even if complex numbers aren't truly necessary, they do give rise to a formulation that seems particularly well suited to quantum mechanics," she said. Her goal is to "pinpoint something peculiarly quantum mechanical" that contributes to that good fit. One possibility might be spin, a property of quantum particles that has no classical counterpart.

The lingering essence of complex numbers in the real-valued theories gives some researchers pause; reports of *i*'s demise may be somewhat exaggerated. "You can write them down whichever way you like, but it's unavoidable that they have to multiply exactly as though they were complex numbers," said Vlatko Vedral, a physicist at the University of Oxford. His preference would be to find simpler axioms for quantum mechanics — intuitive principles that would let theorists re-derive the theory in a new form altogether.

"We really don't have a single alternative to how quantum mechanics was already done 100 years ago," he said. "And the question is, why? Why can't we go beyond this?"

---

**Update:** 11/14/25

The article has been updated to mention Nicolas Gisin's affiliation with Constructor University.
