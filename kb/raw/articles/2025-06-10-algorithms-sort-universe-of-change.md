---
title: "The algorithms that help scientists sort through a universe of change"
description: How alert brokers and machine-learning algorithms help astronomers filter millions of nightly transient alerts from ZTF and Vera C. Rubin Observatory
created_at: 2025-06-10
source: external
type: article
url: https://www.symmetrymagazine.org/article/the-algorithms-that-help-scientists-sort-through-a-universe-of-change
author: Chris Patrick
publication: Symmetry Magazine
---

# The algorithms that help scientists sort through a universe of change

Looking up at the stars at night, it may not be obvious that the universe is constantly changing. But it is: Stars are dying; comets are flying; and supermassive black holes are growing ever more massive.

The field of time-domain astronomy studies varying celestial objects, but how do astronomers catch the most ephemeral of these phenomena before they fizzle?

First, time-domain experiments must identify changes. To do so, they take images of the same slice of sky over time and compare them to one another, says Ben Rusholme, chief engineer and senior scientist at the IPAC Science & Data Center for Astrophysics and Planetary Sciences at Caltech. "It's like a sophisticated game of spot the difference," says Rusholme, who works for the Zwicky Transient Facility, a time-domain survey that has been tracking changes in the northern sky from Palomar Mountain in California since 2018.

Once the survey spots a difference—an object that has changed its brightness and/or position in the sky—ZTF rapidly and automatically issues an electronic alert to the astronomical community.

An alert contains information about the object, including the date and time it was noticed, its location, its brightness, and its relevant historical context. The goal of automating the alerts is to give astronomers enough time to identify and follow up on important transient phenomena. For example, if a survey detects merging neutron stars or black holes, the optical emission from these events can fade within hours, leaving astronomers a limited time to obtain follow-up observations with other kinds of telescopes.

"Alerts are at the heart of time-domain astronomy," says Guillermo Cabrera-Vives, a full professor at the University of Concepción in Chile. "Without them, we would miss many of the most exciting and short-lived phenomena in the universe."

But there's a problem with these alerts: There are too many for any one institution to handle.

Every night, ZTF typically sends out 200,000 public alerts.

The advent of large-scale surveys like ZTF has resulted in an unprecedented amount of astronomical data. When the soon-to-be most powerful of these surveys, the NSF–DOE Vera C. Rubin Observatory, turns on later this year, it will send out approximately 10 million alerts per night from its mountaintop post in Chile.

It's impossible for astronomers, each with their own scientific targets, to sift through all of these alerts themselves.

"One modern challenge, as time-domain surveys have become increasingly prolific and find hundreds of time-domain events per night, is the needle-in-a-haystack challenge," says Melissa Graham, a research scientist at the University of Washington.

As a data-management science analyst and the lead community scientist for Rubin Observatory, Graham is preparing to help astronomers from around the world analyze Rubin's alerts. She'll also be scouring Rubin's alerts for her own "needles:" supernovae, which she's been studying since her graduate thesis. "We need a way to identify rare and unique events, the exemplars of their class that can provide particular physical insight," she says.

And so scientists have created entities to mediate interactions between the surveys issuing alerts and the researchers interested in the alerts: brokers. Brokers are computing systems that filter the flood of alerts streaming from surveys like ZTF and Rubin. They quickly classify alerts and divert the resultant sub-streams to interested communities.

"The use of machine learning is a key component in this process, and different broker teams are experimenting with different strategies," says Julien Peloton, a research engineer at the Irène Joliot-Curie Physics of the two Infinities Laboratory and head of the technical team at Fink, a broker based in France.

Brokers use different platforms, algorithms, and user interfaces. They also differ in scope. While Fink is more of a general-purpose broker, others focus on picking out certain astronomical phenomena.

The first broker-like computing systems appeared in the early 2000s, though scientists used these simply to distribute information about transient events they wished to share with subscribers. Over time, the systems evolved to offer more services and, instead of relying on lists curated by scientists, the systems began to do their own filtering to create more focused streams of information. But it was only during the buildup to Rubin Observatory that most astronomers started using the term "broker."

A few years ago, ZTF began streaming alerts to six such systems as a proof-of-concept for Rubin, which would need to rely on them to deal with its deluge of data. "ZTF has been a valuable precursor, helping the community prepare for the scale and speed of data Rubin will produce," says Cabrera-Vives, who leads a broker based in Chile.

Cabrera-Vives was developing algorithms to detect supernovae in real time with a colleague when he realized their computing system could be transformed into a more general-purpose broker. Cabrera-Vives and his team named the system ALeRCE, or Automatic Learning for the Rapid Classification of Events, after the coniferous alerce trees that can grow to enormous heights in the temperate rainforests in southern Chile and Argentina.

Along with five other brokers, ALeRCE and Fink will work with Rubin's full stream of alerts. To keep up with the challenges of big data, broker teams must continually improve their hardware, software, machine-learning models and interfaces with the scientific community.

"Alert brokers are still a relatively new technology for astronomy, and the teams are doing brilliantly in the face of their challenges," says Graham, who works to support the broker teams' development efforts.

Cooperation is key. "Broker teams cooperate a lot to avoid reinventing the wheel and make sure we're all going in the right direction," Peloton says.

While innovative algorithms and computing technology are necessary, Peloton believes it's just as important to ensure the usability of the brokers. "For me, the biggest difficulty is always to make sure that what I develop and deploy is useful," he says. "I spend a lot of time reaching out to the community to understand their needs."

In the age of big data, scientists at every level—the ones running surveys producing and analyzing data; the ones building the brokers that filter the data; and the ones pursuing a better understanding of the phenomena the data reveal—all need to work together to do the best science possible, Rusholme says. "Astronomy is changing to large-scale systematic observation that requires experts with different skills," he says. "It's no longer a single scientist working alone. It requires a village."

The village is large, Graham says, but so is the universe. "It's a fast-paced field. Every night is a new sky. It can surprise you."
