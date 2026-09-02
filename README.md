

═══════════════════════════════════════════════════

# DARIVS Fediversity — Self-Hosted Charitable Platform
> ⚠️ **Project Status: Pre-Grant Proof of Concept**
> 
> This repository currently contains an early-stage architectural prototype developed to demonstrate technical feasibility and team capability while our NGI Fediversity grant application (2026-08-0d7) is under eligibility review.
>
> **Important**: The current implementation is a foundational skeleton only. Substantial rework is expected once the grant is confirmed, including:
> - Production-grade cryptography (current signing is simplified for prototyping)
> - Independent security audit and hardening (Weeks 14-15)
> - Full GDPR and multi-jurisdiction legal compliance review
> - Production database migrations and data integrity testing
> - Comprehensive integration and load testing across real federated instances
> - UI/UX development (Weeks 8-10, not yet started)
>
> The grant funding (€40,000) is allocated to the engineering time, independent security audit (€8,000), infrastructure, and compliance work required to take this prototype to a production-ready, community-adopted standard — work that cannot be completed as volunteer effort within a reasonable timeframe.
>
> See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full 16-week roadmap.

---




[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

DARIVS is a self-hosted, decentralized charitable 
prediction platform with service portability at its core.
Funding (pending): NGI Fediversity (€40,000, application under eligibility review)
**Status:** Week 1/16 Complete ✅  

**Build Time:** 16 weeks  
**Start Date:** May 12, 2026  

## Problem

Centralized charity platforms create vendor lock-in 
and data silos. NGOs cannot:
- Control their donation infrastructure
- Own their user data
- Migrate to other platforms
- Participate in decentralized networks

## Solution

DARIVS enables **service portability** so any 
foundation can self-host independently while 
participating in a federated charitable ecosystem.

**Users can migrate without losing history.**

## Features

✅ Self-hosted by design (not SaaS)
✅ Service portability (federation protocol)
✅ Data decoupling (users ≠ charities ≠ payments)
✅ Immutable audit trail (SHA-256 hash chain)
✅ 85% charitable allocation (irrevocable)
✅ Multi-jurisdiction compliance (6 regions)
✅ Open source (MIT license)
## 🔍 Чем отличается от существующих федеративных решений

| Решение | Что покрывает | Чего не хватает для DARIVS |
|---|---|---|
| ActivityPub (Mastodon и др.) | Федеративный протокол для соцсетей | Не специализирован под charity/donation flows, нет модели immutable audit trail для транзакций |
| Solid Project | Data ownership и децентрализация данных | Общая инфраструктура data pods, не заточена под donation allocation и charitable prediction |
| Централизованные charity-платформы (GoFundMe и т.п.) | Donation processing | Vendor lock-in, нет service portability, NGO не владеет инфраструктурой |

DARIVS применяет принципы федерации (portability, self-hosting) конкретно к charitable-домену: SHA-256 immutable audit trail для donation flows, irrevocable 85% allocation, и миграция пользователей между инстансами без потери истории — комбинация, отсутствующая в существующих fediverse- или charity-специфичных решениях.

## Quick Start

```bash
git clone https://github.com/arvened/darivs-fediversity.git
cd darivs-fediversity
docker-compose up -d
