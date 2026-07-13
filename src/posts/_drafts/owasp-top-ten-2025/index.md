---
title: 'OWASP Top Ten 2025'
date: '2026-07-15'
topics: ['Security']
path: '/owasp-top-ten-2025/'
excerpt:
  'OWASP released the 2025 edition of the Top 10 Web Application Security Risks. What are the changes since 2021,
  and is your application vulnerable?'
draftStatus: 'draft'
relatedPosts: ['/owasp-top-ten-2017/', '/snyk-detecting-dependencies-with-known-vulnerabilities/', '/detecting-dependencies-known-vulnerabilities/', '/preventing-clickjacking/']
featuredImage: './featured.png'
---

## What is OWASP?

[OWASP](https://owasp.org/) is an acronym for **O**pen **W**eb **A**pplication **S**ecurity **P**roject.
It is an open-source non-profit organization, which focuses on improving software security.
OWASP aims to raise awareness of security issues and provides free tools and resources to mitigate them.

It covers a broad range of tools, resources, and activities. They [organize various events](https://owasp.org/events/)
including their own AppSec conference. OWASP consists of various projects with different focus
including [Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/),
[GenAI Security Project](https://genai.owasp.org/),
[Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/),
[various cheat sheets,](https://owasp.org/www-project-cheat-sheets/) and [other projects](https://owasp.org/projects/).

## OWASP Top Ten

Even though OWASP consists of many projects, one of them is particularly
popular - [OWASP Top Ten Web Application Security Risks](https://owasp.org/www-project-top-ten/), usually referred
to as OWASP Top 10 for short.

It is an ordered list of top ten security risks, which is released periodically every couple of years since 2003.
The most recent one was released at the end of 2025, with 2021 and 2017 before that. The document is very brief
and barely goes into any detail.

You could argue that reducing security risks to just 10 items on a couple of pages is very reductive
and that web app security is a much broader issue. But the point of the list is not to be an exhaustive guide
on security risks, but rather to increase awareness of the broad public audience.
With just a short list it is easy to keep track of what is happening in the security area,
how it evolves, and what to keep an eye on. Then you can dive deeper into individual items with other OWASP resources.

## Methodology

### Data sources

The methodology of determining the top ten security risks has matured significantly over the years and is now
very transparent. It is calculated based on vast amounts of data gathered from various sources such as security
tooling vendors, vulnerability databases, bug bounties, and more.

Vulnerability data from applications is, however, a backward-looking metric and is only able to cover well documented
vulnerabilities which are already properly supported by security analysis tooling. It does not reflect
the latest trends, emerging threats, or how the situation will develop in the future. Some vulnerabilities are also
on higher level such as architecture or are hard to cover by automated analysis.

To address both historical and future trends, the methodology chooses 8 out of 10 risks based only on the data
and the remaining two items are based on a community survey of security experts.

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

Now when all the reported weaknesses are sorted into risk groups, the order needs to be determined.
That is based on [Risk Score](https://owasp.org/Top10/2025/0x02_2025-What_are_Application_Security_Risks/) formula.
There are multiple factors affecting the final score.

Simply put, the main factors are:

1. How prevalent is the weakness
2. How severe is the technical impact
3. How easy is it to exploit

The prevalence is the major factor with exploitability and impact being secondary.

Prevalence is based on the data gathered by OWASP, but how do you quantify technical impact and exploitability?

A CWE is a definition of a weakness, such as SQL Injection, but the impact and exploitability can differ in each application.
Here comes into play CVE, which is a specific instance of CWE in a particular product.

> [CWE-149 Improper Neutralization of Quoting Syntax](https://cwe.mitre.org/data/definitions/149.html)
>
> Generic definition of the weakness
>
> [CVE-2025-1094](https://nvd.nist.gov/vuln/detail/cve-2025-1094)
>
> Specific SQL Injection vulnerability in specific PostgreSQL versions

Those CVEs already have impact and exploitability scores defined and can be used for risk score calculation.

What is important to understand is that the impact is technical and not business. The same vulnerability can have the same
technical impact but drastically different business impact based on the company. The same SQL injection vulnerability can
lead to leaking unimportant read only data in one company and exposing sensitive data or dropping the entire DB in
another.

An important part of secure design is therefore considering how technical vulnerabilities translate into business risks
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

| 2021                                                        | 2025                                                                                                                                     |
|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| 1. Broken Access Control                                    | 1. Broken Access Control                                                                                                                 |
| 2. Cryptographic Failures                                   | 2. Security Misconfiguration {% badge "up", "↑ 3" %}                                                                                     |
| 3. Injection                                                | 3. Software Supply Chain Failures {% badge "up", "↑ 3" %} {% badge "extended", "Extended" %} {% badge "community", "Community Survey" %} |
| 4. Insecure Design                                          | 4. Cryptographic Failures {% badge "down", "↓ 2" %}                                                                                      |
| 5. Security Misconfiguration                                | 5. Injection {% badge "down", "↓ 2" %}                                                                                                   |
| 6. Vulnerable and Outdated Components                       | 6. Insecure Design {% badge "down", "↓ 2" %}                                                                                             |
| 7. Identification and Authentication Failures               | 7. Authentication Failures {% badge "renamed" %}                                                                                         |
| 8. Software and Data Integrity Failures                     | 8. Software or Data Integrity Failures {% badge "renamed" %}                                                                             |
| 9. Security Logging and Monitoring Failures                 | 9. Security Logging and Alerting Failures {% badge "renamed" %} {% badge "community", "Community Survey" %}                              |
| 10. Server Side Request Forgery (SSRF) {% badge "merged" %} | 10. Mishandling of Exceptional Conditions {% badge "new" %}                                                                              |

If you'd like to compare with an even older version, you can check my article on OWASP Top 10 2017.

{% linkedPost "/owasp-top-ten-2017/" %}

## What changed since 2021

### Broken Access Control still on top

This item ranked as #1 both in 2021 and 2025, while being #2 in 2017 and 2013 after Injection. Despite being in top positions since the very beginning in 2003 and being a well-documented and known risk, it still stays on top. Every application from OWASP's dataset had some sort of access control related vulnerability. Every single one! This area is complex and contains a high number of weaknesses, which results in high prevalence. The potential impact of access related attacks can be very severe including loss of data, exposure of sensitive information or even complete system takeover.

Access control related issues result in user action outside of their permissions and boundaries. This includes weaknesses such as Cross-Site Request Forgery, [misconfiguration of sensitive cookies](/protect-http-cookies/), Path Traversal, Insecure Storage of Sensitive Data and missing or incorrect authorization.

There are many mitigation strategies, such as:

- Least privilege possible. Deny by default.
- Short-lived sessions and tokens. Properly invalidate after logout.
- Rate limits to minimize automated attacks.
- Prefer established authentication and authorization tooling. Prefer declarative over imperative.
- Make access control part of your testing workflow.

### Merged: Server Side Request Forgery
In the previous version, Server Side Request Forgery (SSRF) was added as a new item in the 10th position. In 2025, it was merged into Broken Access Control as it is fundamentally an Access Control issue. This better reflects item granularity and unifies categorization. The reason why it was separate in 2021 was that it was ranked as #1 in the community survey, and explicitly having it as an item helps to raise awareness. But even back then it was considered for later addition to a broader category. Even though it is no longer a standalone item, it is still good to keep SSRF in mind when considering access control.

SSRF vulnerabilities allow attackers to trick a server-side application into making a request to an unintended location. This allows attackers to reach resources inaccessible from the outside. It can lead to accessing internal-only services, leaking sensitive data, or mapping internal networks for further exploitation.

Prevention includes:
- Avoid depending on client-provided data to determine the target location of network calls.
- Deny access by default, whitelisting only exceptions instead of using blacklists.
- Do not directly send responses received from external calls to the client.
- Internal network segmentation.
- Monitoring even internal traffic and alerting on unusual behavior. 

### Rising threats
There are two items which jumped up significantly, both by 3 positions. **Security Misconfiguration** now sits in second place, after Broken Access Control. This area includes all the configuration settings which are incorrect from the security perspective, creating vulnerabilities. It is very broad, and with systems getting more and more complex and more configurable, it is easy to miss an item or two in your configuration. In fact, same as with access control issues, every single tested application has some sort of security misconfiguration.

Common examples of config issues include relying on an external unsafe configuration source, [missing security headers](/preventing-clickjacking/), a permissive cross-origin policy, or enabling unnecessary features that widen the potential attack surface. Make sure you review your configurations regularly, keep configuration centralised, enable only necessary features, automate as much as possible, regularly scan for misplaced secrets, and keep as much configuration as possible the same across environments.

The second item rising from the sixth to the third place is **Software Supply Chain Failures**. It was originally introduced almost at the end of the list in 2013 under name **Using Components with Known Vulnerabilities**, later expanded and renamed to **Vulnerable and Outdated Components**. The area has grown in importance over the years and this year was broadened to contain all the supply chain related issues, not only vulnerable dependencies. It is getting more and more common that a reliable vendor gets compromised and a malicious package that your application depends on is released. It does not even have to be a direct dependency - you can get such a package as part of your transitive dependencies (dependencies of your dependencies). Your application can get compromised at any point in its lifecycle - from a malicious IDE plugin or an outdated dependency to the CI/CD process or a code or artifact repository. This area is getting more and more attention - it is one of two items added based on a community survey (the other being **Security Logging and Alerting Failures**) - reaching number 1 in the result list with a vast majority of votes.

These days there are powerful tools to detect vulnerable dependencies, such as [Snyk](/snyk-detecting-dependencies-with-known-vulnerabilities/), [OWASP dependency check](/detecting-dependencies-known-vulnerabilities/) or even [your IDE](/idea-snyk-plugin/). But be careful as detecting the vulnerability is one thing and upgrading another. New versions may break compatibility, require newer versions of runtime or the component may be long time abandoned and unmaintained. Maintain list of your dependencies (such as Software Bill of Materials) and actively scan for vulnerable and outdated component versions, including transitive dependencies, unmaintained and end-of-life components, but be mindful about upgrading and do it for a reason - getting new version needlessly may result in introducing new vulnerabilities or compromised package. Obtain only components from trusted sources, signed if possible to avoid tampering. Remove anything unused to reduce attack surface.

### Traditional risks moving down
Three items that were in the top 4 in 2021 have all moved down by two positions:

- **Cryptographic Failures**: #2 -> #4
- **Injection** #3 -> #5
- **Insecure Design** #4 -> #6

As you can see, all of them moved by 3 places, while preserving their relative positions. This suggests that their importance has not dropped significantly, but they were rather pushed by two major categories moving up, which we discussed above. With systems getting more and more config driven, **Security Misconfiguration** has risen significantly. **Software Supply Chain Failures** had significant support in the community survey and since the category was significantly broadened, it now contains more weaknesses.

Still, over time items in the OWASP top ten tend to gradually go down as awareness increases and tooling gets better at identifying these issues. For example, injection used to be #1 for a long time, but eventually ended up in fifth place. It is still very much relevant (same as cryptographic failures and insecure design) though and should not be taken lightly.

### New: Mishandling of Exceptional Conditions

This is the only truly new item in 2025, sitting on the last place. Many issues covered by this category were previously considered as part of bad code quality and design. But given the importance of this area, it deserved its own new category.

It covers errors and unexpected states. Applications often fail to predict and prevent such situations. If such a situation happens, it is important to identify it and react properly. Exceptional states are not necessarily only technical issues, but also logical flaws or bad design of domain logic and business processes. This makes it very important to keep in mind these issues early in the design and development process as they are much more difficult and expensive to fix later on.

These weaknesses are serious on their own and can lead to various security issues, such as denial of service, data corruption, or even complete system compromise. However, they are also often used as a bridge to more efficient and targeted attacks. For example, sending detailed error information can expose important details about your system which is then used for other attacks. Exposing which frameworks, libraries, and versions are used can lead to exploiting their known vulnerabilities. Leaking database internals can lead to better targeted SQL injection.

Mitigations for these weaknesses include:
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
