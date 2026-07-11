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
It is an open-source non-profit organization, which focuses on improving software security.
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

You could argue that reducing security risks to just 10 items on a couple of pages is very reductive
and that web app security is way broader issue. But the point of the list is not to be an exhaustive guide
on security risks, but rather to increase awareness of the broad public audience.
With just a short list it is easy to keep track of what is happening in the security area,
how it evolves and what to keep an eye on. Then you can dive deeper into individual items with other OWASP resources.

## Methodology

### Data sources

The methodology of determining the top ten security risks has matured significantly over the years and is now
very transparent. It is calculated based on vast amounts of data gathered from various sources such as security
tooling vendors, vulnerability databases, bug bounties and more.

Vulnerability data from applications are however a metric looking back and are only able to cover well documented
vulnerabilities which are already properly supported by security analysis tooling. It does not reflect what
are the latest trends, emerging threats and how will the situation develop in the future. Some vulnerabilities are also
on higher level such as architecture or are hard to cover by automated analysis.

To address both historical and future trends, the methodology chooses 8 out of 10 risks based only on the data
and the rest two items are based on community survey of security experts.

### Risk categorization

Historically, the top ten used to contain some very specific weaknesses such as Cross-Site Scripting (XSS)
or Cross-Site Request Forgery (CSRF). Over the years, the categories became much broader, such as Broken Access Control
or Insecure Design.

But the source data consists of specific reported weaknesses, which are much more specific - such as SQL Injection.
These are known as [Common Weakness Enumeration (CWE)](https://cwe.mitre.org/index.html) and are well documented and categorized.
Example of such weakness is [CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute](https://cwe.mitre.org/data/definitions/614.html).

All the reported CWEs are then categorized by OWASP into groups such as Injection or Authentication Failures - these
are already items which are later included in the top ten.

### Risk Score Calculation

Now when  all the reported weaknesses are sorted into risk groups, the order needs to be determined.
That is based on [Risk Score](https://owasp.org/Top10/2025/0x02_2025-What_are_Application_Security_Risks/) formula.
There are multiple factors affecting the final score.

Simply put, the main factors are:

1. How prevalent is the weakness
2. How severe is the technical impact
3. How easy is it to exploit

The prevalence is the major factor with exploitability and impact being secondary.

Prevalence is based on the data gathered by OWASP, but how do you quantify technical impact and exploitability?

CWE is definition of a weakness, such as SQL Injection, but the impact and exploitability can be different in each application.
Here comes into play CVE, which is a specific instance of CWE in a particular product.

> [CWE-149 Improper Neutralization of Quoting Syntax](https://cwe.mitre.org/data/definitions/149.html)
>
> Generic definition of the weakness
>
> [CVE-2025-1094](https://nvd.nist.gov/vuln/detail/cve-2025-1094)
>
> Specific SQL Injection vulnerability in specific PostgreSQL versions

Those CVEs already have impact and exploitability scores defined and can be used for risk score calculation.

What is important to understand is that the impact is technical and not business. Same vulnerability can have the same
technical impact but drastically different business impact based on the company. Same SQL injection vulnerability can
lead to leaking unimportant read only data in one company and exposing sensitive data or dropping the entire DB in
another.

Important part of secure design is therefore considering how technical vulnerabilities translate into business risks
and how to mitigate them.

## Top Ten 2025

| Item                                                                                  | Description                                                                                                                                                                                           |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1. Broken Access Control                                                              | Gain access to restricted information or actions by bypassing auth checks, impersonating users, missing access controls.                                                                              |
| 2. Security Misconfiguration                                                          | Incorrect setup using default settings, enabling unused features, verbose errors with sensitive information.                                                                                          |
| 3. Software Supply Chain Failures {% badge "community", "Community Survey" %}         | Outdated vulnerable components, untrusted dependencies, build pipeline with weak security.                                                                                                            |
| 4. Cryptographic Failures                                                             | Weak or missing cryptography for data in transit or at rest, leaked security keys.                                                                                                                    |
| 5. Injection                                                                          | User supplied data not sanitized when used as part of dynamic command or query - malicious code execution such as SQL injection, Cross-Site Scripting.                                                |
| 6. Insecure Design                                                                    | Architecture and design flaws, unexpected states in business logic, lack of secure development lifecycle and threat modelling.                                                                        |
| 7. Authentication Failures                                                            | Vulnerability to automated and brute force attacks, weak passwords, lacking multi-factor auth, vulnerable account recovery, incorrect session and token invalidation.                                 |
| 8. Software or Data Integrity Failures                                                | Lack of validation of code and data coming from external sources can lead to malicious code execution or unexpected states. Software auto update, insecure deserialization, unexpected source change. |
| 9. Security Logging and Alerting Failures {% badge "community", "Community Survey" %} | Insufficient logging and monitoring results in attacks being detected late or never. Log tampering, sensitive data leakage through logs and alerts.                                                   |
| 10. Mishandling of Exceptional Conditions                                             | Not reacting to unexpected conditions, detecting them or preventing them. This can lead to many other vulnerabilities including crashing the system or complete takeover.                             |

### 2021 vs 2025 comparison

Looking at the current ten items tells you only part of the story. What's interesting is to compare how
the list changed since the last one to see how the risks are developing and where security is heading.

| 2021                                                        | 2025                                                                                                                       |
|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| 1. Broken Access Control                                    | 1. Broken Access Control                                                                                                   |
| 2. Cryptographic Failures                                   | 2. Security Misconfiguration {% badge "up", "↑ 3" %}                                                                       |
| 3. Injection                                                | 3. Software Supply Chain Failures {% badge "merged" %} {% badge "up", "↑ 3" %} {% badge "community", "Community Survey" %} |
| 4. Insecure Design                                          | 4. Cryptographic Failures {% badge "down", "↓ 2" %}                                                                        |
| 5. Security Misconfiguration                                | 5. Injection {% badge "down", "↓ 2" %}                                                                                     |
| 6. Vulnerable and Outdated Components                       | 6. Insecure Design {% badge "down", "↓ 2" %}                                                                               |
| 7. Identification and Authentication Failures               | 7. Authentication Failures {% badge "renamed" %}                                                                           |
| 8. Software and Data Integrity Failures                     | 8. Software or Data Integrity Failures {% badge "renamed" %}                                                               |
| 9. Security Logging and Monitoring Failures                 | 9. Security Logging and Alerting Failures {% badge "renamed" %} {% badge "community", "Community Survey" %}                |
| 10. Server Side Request Forgery (SSRF) {% badge "merged" %} | 10. Mishandling of Exceptional Conditions {% badge "new" %}                                                                |

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

This is the only truly new item in 2025, sitting on the last place. Many issues covered by this category were previously considered as part of bad code quality and design. But given the importance of this area, it deserved its own new category.

It covers errors and unexpected states. Applications often fail to predict and prevent such situations. If such situation happens, it is important to indentify it and react properly. Exceptional states are not necessarily only technical issues, but also logical flaws or bad design of domain logic and business processes. This makes it very important to keep in mind these issues early in the design and development process as they are much more difficult and expensive to fix later on.

These weaknesses are serious on their own and can lead to various security issues, such as denial of service, data corruption, or even complete system compromise. However they are also often used as a bridge to more efficient and targeted attacks. For example, sending detailed error information can expose important details about your system which is then used for other attacks. Exposing which frameworks and libraries and versions are used can lead to exploiting their known vulnerabilities. Leaking database internals can lead to better targeted SQL injection.

Mitigatios for these weaknesses include:
- Proper error handling, logging, and alerting. Do not expose sensitive information in error messages and logs.
- Input validation and sanitization. Also prevents injection attacks.
- Limit resource utilization. Rate limiting, throttling, resource quotas.
- Centralised error handling.

### Renames and minor adjustments

Three items were renamed to better reflect their scope and focus:

- **Identification and Authentication Failures** → **Authentication Failures**. The name better represents CWEs assigned to this category and is not misleading.
- **Software and Data Integrity Failures** → **Software or Data Integrity Failures**. This reflects that those are two independent categories and weakness in just one of them is enough to cause a security issue, not both at once.
- **Security Logging and Monitoring Failures** → **Security Logging and Alerting Failures**. This change aims to emphasize that logging alone is not enough. It is crucial to have proper alerting in place so you can quickly know about security incidents and react in time. Unnoticed incidents give an attacker an opportunity to cause more damage and try different attack vectors.

## Beyond the Top Ten

Now you've familiarized yourself with the top ten security risks of web applications and it will help you stay
more vigilant and aware of potential issues. However, as I mentioned, the top ten is an awareness document rather
than a detailed guide. It covers just the tip of the iceberg and very briefly. You should definitely not stop
your security education at the top ten. The next step is to get to know these risks in more detail and learn about others.

Another useful resource is [MITRE CWE Top 25](https://cwe.mitre.org/top25/), which instead of broad categories focuses on ranking much more specific weaknesses - on CWE level.
That means classic weaknesses such as Cross-Site Scripting, SQL Injection or Out-of-bound reads and writes.
It is good to keep in mind both of the lists - OWASP Top 10 for realizing broader risk areas
and MITRE CWE list for specific lower level weaknesses.

More OWASP Resources:

- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
: Detailed list of security requirements for designing, developing, and testing web applications.
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/):
Comprehensive guide on how to test security of web apps.
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/):
Collection of very condensed guides on various topics as a quick reference.
- [OWASP API Security](https://owasp.org/www-project-api-security/):
Top ten focused on API security.
- [OWASP Gen AI Security Project](https://genai.owasp.org/): Guidance and resources focused on generative AI security.