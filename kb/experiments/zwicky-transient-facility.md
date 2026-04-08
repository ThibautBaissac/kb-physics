---
title: Zwicky Transient Facility
description: Time-domain sky survey at Palomar Mountain, California (since 2018) — issues ~200,000 public alerts per night and serves as the proof-of-concept precursor to the Rubin Observatory's 10M-alert-per-night LSST
type: experiment
evidence: secondary
created_at: 2026-04-07
updated_at: 2026-04-07
related: [experiments/vera-c-rubin-observatory.md, concepts/time-domain-astronomy.md, concepts/supernova.md]
sources: [2025-06-10-algorithms-sort-universe-of-change.md]
---

# Zwicky Transient Facility (ZTF)

The Zwicky Transient Facility is a wide-field sky survey operating from the Samuel Oschin Telescope at Palomar Mountain, California, run by a consortium including Caltech's IPAC Science & Data Center for Astrophysics and Planetary Sciences. Since 2018, ZTF has been systematically surveying the northern sky to detect and classify transient astrophysical phenomena — objects that change their brightness or position over time.

## How It Works

ZTF employs **image differencing**: repeated images of the same sky patch are compared algorithmically to identify changes. Each detected change triggers an automatic electronic **alert** containing:

- Date and time of the detection
- Sky coordinates
- Brightness and brightness change
- Historical context for that sky location

ZTF typically issues approximately **200,000 public alerts per night**, making it impossible for any single group to manually process the stream. The alerts are instead consumed by **alert brokers** — machine-learning-powered computing systems that classify events and route sub-streams to communities with specific scientific interests. See [time-domain astronomy](../concepts/time-domain-astronomy.md) for the broader context.

## Role as Rubin Precursor

ZTF has served as the critical test bed for the alert-broker ecosystem that the [Vera C. Rubin Observatory](../experiments/vera-c-rubin-observatory.md) will depend on. Several years before Rubin's LSST began, ZTF started streaming its alert feed to six broker systems, stress-testing the infrastructure and workflows that will need to handle Rubin's ~10 million nightly alerts. As Guillermo [Cabrera-Vives](../people/guillermo-cabrera-vives.md) notes: "ZTF has been a valuable precursor, helping the community prepare for the scale and speed of data Rubin will produce."

## Key Personnel

- [Ben Rusholme](../people/ben-rusholme.md) — Chief engineer and senior scientist at IPAC/Caltech; oversees ZTF operations

## Scientific Targets

ZTF was named after Swiss astronomer Fritz Zwicky, who co-discovered the existence of dark matter via galaxy cluster dynamics. Its science program includes:

- Supernovae (both discovery and classification)
- Variable stars and active galactic nuclei
- Near-Earth objects and solar system bodies
- Multi-messenger event follow-up (e.g., gravitational-wave optical counterparts)
- Rare transients with hours-scale timescales (merging neutron stars, kilonovae)

## Sources

- [The algorithms that help scientists sort through a universe of change](../raw/articles/2025-06-10-algorithms-sort-universe-of-change.md)
