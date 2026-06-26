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

[OWASP](https://owasp.org/) is an acronym for **O**pen **W**eb **A**pplication **S**ecurity **P**roject.
It is an open-source non-profit organization, which focuses on improving security of software.
OWASP aims to raise awareness of security issues and provides free tools and resources to mitigate them.

It covers a broad range of tools, resources and activities. They [organize various events](https://owasp.org/events/)
including their own AppSec conference. OWASP consists of various projects with different focus
including [Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/),
[GenAI Security Project](https://genai.owasp.org/),
[Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/),
[various cheat sheets](https://owasp.org/www-project-cheat-sheets/) and [other projects](https://owasp.org/projects/).

## OWASP Top Ten

Even though OWASP consists of many projects, one of them is particularly
popular - [OWASP Top Ten Web Application Security Risks](https://owasp.org/www-project-top-ten/), usually referred
to as OWASP Top 10 for short.

It is an ordered list of top ten security risks, which is released periodically every couple of years since 2003.
The most recent one was released at the end of 2025, with 2021 and 2017 before that. The document is very brief
and does barely go in any detail.

You could argue that reducing security risks to just 10 items on couple of pages is very reductive
and that web app security is way broader issue. But the point of the list is not to be an exhaustive guide
on security risks, but rather to increase awareness of the broad public audience.
With just a short list it is easy to keep track of what is happening in the security area,
how it evolves and what to keep an eye on. Then you can dive deeper into individual items with other OWASP resources.

## Top Ten 2025

<!-- TODO: brief intro on methodology, data sources, community survey items -->

| Item                                      | Description                                                                                                                                                                                           |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1. Broken Access Control                  | Gain access to restricted information or actions by bypassing auth checks, impersonating users, missing access controls.                                                                              |
| 2. Security Misconfiguration              | Incorrect setup using default settings, enabling unused features, verbose errors with sensitive information.                                                                                          |
| 3. Software Supply Chain Failures {% badge "community", "Community Survey" %}         | Outdated vulnerable components, untrusted dependencies, build pipeline with weak security.                                                                                                            |
| 4. Cryptographic Failures                 | Weak or missing cryptography for data in transit or at rest, leaked security keys.                                                                                                                    |
| 5. Injection                              | User supplied data not sanitized when used as part of dynamic command or query - malicious code execution such as SQL injection, Cross-Site Scripting.                                                |
| 6. Insecure Design                        | Architecture and design flaws, unexpected states in business logic, lack of secure development lifecycle and threat modelling.                                                                        |
| 7. Authentication Failures                | Vulnerability to automated and brute force attacks, weak passwords, lacking multi-factor auth, vulnerable account recovery, incorrect session and token invalidation.                                 |
| 8. Software or Data Integrity Failures    | Lack of validation of code and data coming from external sources can lead to malicious code execution or unexpected states. Software auto update, insecure deserialization, unexpected source change. |
| 9. Security Logging and Alerting Failures {% badge "community", "Community Survey" %} | Insufficient logging and monitoring results in atacks being detected late or never. Log tampering, sensitive data leakage through logs and alerts.                                                    |
| 10. Mishandling of Exceptional Conditions | Not reacting to unexpected conditions, detecting them or preventing them. This can lead to may other vulnerabilities including crashing the system or complete takeover.                              |

### 2021 vs 2025 comparison

Looking at the current ten items tells you only part of the story. What's interesting is to compare how
the list changed since the last one to see how the risks are developing and where security is heading.

| 2021                                                        | 2025                                                                           |
|-------------------------------------------------------------|--------------------------------------------------------------------------------|
| 1. Broken Access Control                                    | 1. Broken Access Control                                                       |
| 2. Cryptographic Failures                                   | 2. Security Misconfiguration {% badge "up", "↑ 3" %}                           |
| 3. Injection                                                | 3. Software Supply Chain Failures {% badge "merged" %} {% badge "up", "↑ 3" %} {% badge "community", "Community Survey" %} |
| 4. Insecure Design                                          | 4. Cryptographic Failures {% badge "down", "↓ 2" %}                            |
| 5. Security Misconfiguration                                | 5. Injection {% badge "down", "↓ 2" %}                                         |
| 6. Vulnerable and Outdated Components                       | 6. Insecure Design {% badge "down", "↓ 2" %}                                   |
| 7. Identification and Authentication Failures               | 7. Authentication Failures {% badge "renamed" %}                               |
| 8. Software and Data Integrity Failures                     | 8. Software or Data Integrity Failures {% badge "renamed" %}                   |
| 9. Security Logging and Monitoring Failures                 | 9. Security Logging and Alerting Failures {% badge "renamed" %} {% badge "community", "Community Survey" %} |
| 10. Server Side Request Forgery (SSRF) {% badge "merged" %} | 10. Mishandling of Exceptional Conditions {% badge "new" %}                    |

If you'd like to compare with an even older version, you can check my article on OWASP Top 10 2017.

{% linkedPost "/owasp-top-ten-2017/" %}

## What changed since 2021

### Broken Access Control still on top

<!-- TODO:  -->

### Rising threats
<!-- TODO:  -->

### Traditional risks moving down
<!-- TODO:  -->

### Broadening categories

<!-- TODO:  -->

### New: Mishandling of Exceptional Conditions

This is the only truly new item in 2025, sitting on the last place.

<!-- TODO:  -->

### Renames and minor adjustments

<!-- TODO: for each new item: what it is, why it was added (data-driven vs community survey), how to mitigate -->

## Beyond the Top Ten

Now you've familiarized yourself with the top ten security risks of web applications and it will help you stay
more vigilant and aware of potential issues. However, as I mentioned, the top ten is an awareness document rather
than a detailed guide. It covers just the tip of the iceberg and very briefly. You should definitely not stop
your security education at the top ten. The next step is to get to know these risks in more detail and learn about others.

- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
: Detailed list of security requirements for designing, developing, and testing web applications.
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/):
Comprehensive guide on how to test security of web apps.
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/):
Collection of very condensed guides on various topics as a quick reference.
- [OWASP API Security](https://owasp.org/www-project-api-security/):
Top ten focused on API security.
- [OWASP Gen AI Security Project](https://genai.owasp.org/): Guidance and resources focused on generative AI security.
