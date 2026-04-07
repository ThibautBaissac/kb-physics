---
title: "Analog vs. Digital: The Race Is On To Simulate Our Quantum Universe"
description: "Physicists race to simulate quantum fields using digital qudit computers and analog atom simulators, targeting QCD and early-universe conditions"
created_at: 2025-09-05
source: external
type: articles
url: https://www.quantamagazine.org/analog-vs-digital-the-race-is-on-to-simulate-our-quantum-universe-20250905/
author: Shalma Wegsman
publication: Quanta Magazine
---

# Analog vs. Digital: The Race Is On To Simulate Our Quantum Universe

Physicists are racing to emulate the jittery quantum fields that fill the universe.

## Introduction

Faithful simulations of the world are impossible to create using ordinary computers. Simulating physical reality is, however, the original, express purpose of quantum computers. In 1981, long before quantum computers gained notoriety as potential tools for breaking encryption, physicist Richard Feynman planted the seed for what is now a multibillion-dollar effort to build them, famously quipping: "Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical."

Quantum computers, though still small and rudimentary, have now grown sufficiently advanced that physicists are using them to simulate tiny pieces of nature.

In a lab in Innsbruck, Austria, physicists recently used a quantum computer to simulate a 2D patch of the electromagnetic field. They observed quantum jitter in their digital field—pairs of particles springing from nothing and vanishing again.

The electromagnetic field is already well understood. But physicists' long-term goal is to simulate complex physical processes that are beyond the reach of pen-and-paper calculations. "We have this big dream that a future quantum simulator can help us with our burning questions," said Christine Muschik, a theoretical physicist at the University of Waterloo in Canada, who joined forces with Martin Ringbauer's lab at the University of Innsbruck for the electromagnetic field simulation.

These questions include what happens to matter in extreme conditions, such as those that existed in the universe in its earliest moments. "In principle, once we have a large-scale quantum simulator, we'll be able to scan any time in the early universe," said Jad Halimeh, a physicist at the Ludwig Maximilian University of Munich.

Simulations of complicated chemical reactions and phases of matter could also aid drug discovery and the design of new materials with useful properties, such as room-temperature superconductivity.

Physicists are racing along several routes toward simulations of the unknown.

Some teams employ standard quantum computers: programmable machines that implement algorithms by inducing interactions between quantum bits, or "qubits." Unlike ordinary bits, these computing elements are made of quantum objects that can be in two possible states, labeled 0 and 1, at the same time.

Other groups, such as the creators of the 2D electromagnetic field, employ quantum computers based on quantum digits, or "qudits." These quantum objects can exist in three or more possible states and can therefore encode more information. "Now we can dream much bigger," Muschik said.

Still other teams use analog quantum simulators, which model one quantum system with another that's easier to construct. It's like putting a model airplane in a wind tunnel to learn about the aerodynamics of the real thing.

"Now there's a competition," Halimeh said. "This is a big open question: What is the future, analog or digital?"

## Quantum on Quantum

To simulate nature is to simulate quantum fields—fluidlike entities that fill the universe. When energy disturbs quantum fields, they ripple, and these ripples are elementary particles. Quantum fields underlie all the matter and force particles in the universe.

The effort to study the real-time behavior of fields and particles by simulating them on computers is not new. For decades, physicists have attempted to do so by approximating the quantum field as a discrete lattice of points. That way they can solve the equations of physics only at those points, circumventing the impossible task of simulating a field's true infinite resolution. But even with this approximation, classical computer simulations hit a wall.

That's because of the enormous complexity introduced by a quantum phenomenon called entanglement. Before a quantum particle is measured, the particle can be in many possible states at once. Then, when two particles interact, their uncertain states become dependent on each other. Measuring one particle's position, for instance, changes the possibilities of where the other can be found. This is entanglement.

Mathematically, entangled particles must be described collectively. In a system with many interacting quantum particles, the mathematical description of their interdependencies quickly grows in complexity. "At some point it exponentially explodes," said Mikhail Lukin, a physicist at Harvard University and a leader in quantum simulation efforts. "You run out of memory on a classical computer."

For this reason, classical simulations of quantum particles are limited to tiny system sizes and low spatial dimensions.

But a quantum computer, being built out of quantum pieces, has entanglement baked in. "Quantum computers deal with this like peanuts. It's extremely cheap," Halimeh said.

## Next-Level Computing

Most digital quantum computers hold information in qubits made of atoms or superconducting circuits that can be in some probabilistic combination of states 0 and 1 at the same time. When qubits interact, their possible states become entangled, and these interactions can encode calculations.

For years, Muschik used qubits to simulate quantum electrodynamics, the quantum theory of the electromagnetic field. That changed when she met Ringbauer during an overlapping appointment at the University of Innsbruck. "It was a natural match," Muschik said, between her algorithm and his "beautiful machine."

Ringbauer's team was building a quantum computer that used not qubits but qudits—each with five possible states. The extra possibilities allowed each particle to hold more information, often reducing the number of steps needed for a complex computation. Not every simulation would benefit from being run with qudits, but the complexity of quantum fields lent itself to the approach. When Muschik translated her simulation from qubit logic into qudits, her circuits shrank tenfold. "It was like putting them on a diet," she said. The shorter algorithm ran faster, and with fewer errors. "I was completely sold."

The team published their first results in 2016, demonstrating a one-dimensional simulation of the electromagnetic field. Now, nearly a decade later, they've successfully scaled up to 2D, simulating an electromagnetic flatland with far richer dynamics.

The qudit simulator is built out of calcium-40 ions, a common building block of quantum computers. Each ion's outer electrons can take on eight different energy levels; five were chosen to represent the quantum digits. These energized states only last for a second before the electrons lose their energy and settle back into the ground state, so the calculations need to finish quickly; the sequence of steps in their simulation took only 10 to 20 milliseconds.

To form a square patch of the electromagnetic field, they use five ions—four sitting at the corners, and one in the center. In the future, they hope to scale up the project. "We have this building block … and we can now just stack them next to each other to build up a big lattice," Ringbauer said.

Even with just five ions, the team could detect signals representing pairs of particles spontaneously arising in their simulated field as the algorithm induced interactions between the qudits. "In the beginning you see lots of pairs being created," Ringbauer said. Then the pairs start colliding and annihilating, "and so you get this oscillating behavior in the particle density."

Their result, which appeared in *Nature Physics* in March, is the first quantum simulation of particles and their quantum force field in 2D, and one of the first successful runs of a full-fledged qudit algorithm. A qubit-based simulation of a quantum field by a different team quickly followed, appearing in *Nature* in June.

But to really simulate nature, these researchers will need to scale up and into 3D.

## The Universe on a Tabletop

As for how best to reach that goal, some physicists are making a different bet. With analog simulators, physicists map a quantum system of interest onto an analogous system—one that obeys equations of the same form but is easier to configure and observe in a lab. Then they let their laboratory system evolve naturally, without running a step-by-step algorithm as in a digital quantum computer. "You build a model that is like the thing you want to study, and then you just watch how it behaves," Ringbauer said.

Usually, the model systems consist of atoms cooled almost to absolute zero, where quantum effects take over. "If you cool them down, these atoms start dancing together. You can't describe them separately anymore," Halimeh said.

A milestone for the analog approach came in 2020, when Halimeh and Bing Yang, an experimental physicist in Shenzhen, China, and collaborators published an analog simulation of quantum electrodynamics in one dimension, using an array of 71 rubidium atoms. And while analog simulators like that one have yet to scale to two dimensions, they've recently gotten close. In a paper published in *Nature* in June, physicists made a 2D simulation of "string breaking," in which the electric field between two particles acts like a string that "breaks" when a new pair of particles is created in between them.

However, the simulation doesn't include all the dynamics present in 2D quantum electrodynamics. It's missing a magnetic field, as Halimeh noted in a response.

## The Road Ahead

For quantum simulators, the real trophy will be the field underlying the strong force. This force binds quarks and gluons together to make protons and neutrons. The quantum field theory describing it, called quantum chromodynamics, or QCD, is mathematically much more complex than the theory of the electromagnetic field. But it likely holds the key to understanding how matter behaves in extreme conditions, and how to create new types of exotic materials.

"In QCD, there's just an enormous amount of things we cannot calculate," Muschik said. "Our lack of understanding is just so much more gigantic."

Simulating the full dynamics of QCD is a distant goal, but some researchers argue that qudit-based computers provide the best chance of getting there.

In a recent preprint, Halimeh, Ringbauer and collaborators proposed an algorithm that uses qudits to simulate the collisions of hadrons—particles such as protons that are made out of quarks and gluons. When two hadrons collide, they break down into a mess of quarks and gluons, and then quickly recombine in a process called hadronization. Researchers hope that simulating this process will reveal how hadrons formed during the birth of the universe.

Yang, on the other hand, thinks that analog simulations are better suited for understanding complicated quark-gluon interactions, since the particles tend to come in large numbers. With analog simulators, "you can go to really large systems," he said.

Last year, Yang began to use analog simulations to tackle how the strong force might have behaved during some of the universe's very earliest moments, when the quarks and gluons that later became bound up in hadrons may have existed as an unbound soup, called quark-gluon plasma. In December 2024, Yang, Halimeh and collaborators used a rubidium-atom analog simulator to emulate the transition between the bound and unbound states of quarks.

Perhaps the dichotomy between digital and analog quantum simulations won't last. In many cases, the same hardware can be used for both. In February, a group of researchers published the result of a hybrid analog-digital simulation, run on one of Google's quantum computers. The project aimed to bring together the versatility of digital computing and the ease of analog time evolution.

"They're all studying different aspects in a different way," Lukin said of the various approaches. "It's quite an interesting time. But it's also quite early."
