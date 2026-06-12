---
title: 'OWASP Top Ten 2025'
date: '2026-06-22'
topics: ['Security']
path: '/owasp-top-ten-2025/'
excerpt:
  'OWASP released the 2025 edition of the Top 10 Web Application Security Risks. What are the changes since 2021,
  and is your application vulnerable?'
draftStatus: 'draft'
relatedPosts: ['/owasp-top-ten-2017/']
featuredImage: './featured.png'
---

## What is OWASP?

<!-- TODO:  OWASP stands for **O**pen **W**eb **A**pplication **S**ecurity **P**roject. It is a non-profit organization dedicated
to improving the security of software, raising awareness of security issues, and providing tools and resources to
mitigate security risks. -->

[OWASP](https://owasp.org/) is an acronym for **O**pen **W**eb **A**pplication **S**ecurity **P**roject. It open-source non profit organization, which focuses on improving security of software. It aims to raise awareness of security issues and provides free tools and resources to mitigate them.

It cover broad range of tools, resources and activities. They [organize various events](https://owasp.org/events/) including their own AppSec conference. OWASP consists of various projects with different focus including [Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/), [GenAI Security Project](https://genai.owasp.org/), [Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/), [variaous cheatsheets](https://owasp.org/www-project-cheat-sheets/) and [other projects](https://owasp.org/projects/).

## OWASP Top Ten
Even though OWASP consists of many projects, one of them is particulary popular - [OWASP Top Ten Web Application Security Risks](https://owasp.org/www-project-top-ten/), usually referred to as OWASP Top 10 for short.

It is an ordered list of top ten security risks, which is released periodically every couple of years since 2003. The most recent one was released at the end of 2025, with 2021 and 2017 before that. The document is very and does barely go in any detail.

You could argue that reducing security risks to just 10 items on couple of pages is very reductive and web app security is way broader issue. But the point of this list is not to bring exhaustive guide on security risks, but rather increase awarness of the broad public audience. With just a short list it is easy to keep track what is happening in the security area, how it evolves and what to keep eye on. Then you can dive deeper into individual items with other OWASP resources.

## Top Ten 2025

<!-- TODO: brief intro on methodology, data sources, community survey items -->

| Item                                      | Description                     |
|-------------------------------------------|---------------------------------|
| 1. Broken Access Control                  | <!-- TODO: one-line summary --> |
| 2. Security Misconfiguration              | <!-- TODO: one-line summary --> |
| 3. Software Supply Chain Failures         | <!-- TODO: one-line summary --> |
| 4. Cryptographic Failures                 | <!-- TODO: one-line summary --> |
| 5. Injection                              | <!-- TODO: one-line summary --> |
| 6. Insecure Design                        | <!-- TODO: one-line summary --> |
| 7. Authentication Failures                | <!-- TODO: one-line summary --> |
| 8. Software or Data Integrity Failures    | <!-- TODO: one-line summary --> |
| 9. Security Logging and Alerting Failures | <!-- TODO: one-line summary --> |
| 10. Mishandling of Exceptional Conditions | <!-- TODO: one-line summary --> |

## What Changed Since 2021

<!-- TODO: brief summary of overall changes before the detailed breakdown -->

### Removed

<!-- TODO: what items were dropped and why (e.g. merged, prevalence dropped) -->

### Merged

<!-- TODO: what items were merged, and which new item they became -->

### New Items

<!-- TODO: for each new item: what it is, why it was added (data-driven vs community survey), how to mitigate -->

### 2021 vs 2025 Comparison

| 2021                                           | 2025                     |
|------------------------------------------------|--------------------------|
| A01 Broken Access Control                      | A01:2025 - Broken Access Control |
| A02 Cryptographic Failures                     | A02:2025 - Security Misconfiguration |
| A03 Injection                                  | A03:2025 - Software Supply Chain Failures |
| A04 Insecure Design                            | A04:2025 - Cryptographic Failures |
| A05 Security Misconfiguration                  | A05:2025 - Injection |
| A06 Vulnerable and Outdated Components         | A06:2025 - Insecure Design |
| A07 Identification and Authentication Failures | A07:2025 - Authentication Failures |
| A08 Software and Data Integrity Failures       | A08:2025 - Software or Data Integrity Failures |
| A09 Security Logging and Monitoring Failures                                               | A09:2025 - Security Logging and Alerting Failures |
| A10 Server Side Request Forgery (SSRF)                                               | A10:2025 - Mishandling of Exceptional Conditions |

## Beyond the Top Ten
<!-- TODO: top ten is just for awareness and not covering everying, hwere to look deeper? -->
