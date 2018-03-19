---
title: 'OWASP Top Ten 2017'
date: "2018-01-01T22:12:03.284Z"
tags: ['Security']
path: '/owasp-top-ten-2017'
featuredImage: './owasp.jpg'
disqusArticleIdentifier: '1305 http://vojtechruzicka.com/?p=1305'
---
![owasp top ten](./owasp.jpg)

OWASP released 2017 version of top 10 Web Application Security Vulnerabilities. What are they, what is new and is your app vulnerable?
<!--more-->

What is OWASP?
--------------

OWASP Stands for Open Web Application Security Project. It is a non-profit organization dedicated to improving the security of software, raising awareness of security issues and providing tools and resources to mitigate security risks. It consists of [numerous projects](https://www.owasp.org/index.php/Category:OWASP_Project) with various focuses. Examples of such projects are OWASP Application [Security Verification Standard Project](https://www.owasp.org/index.php/Category:OWASP_Application_Security_Verification_Standard_Project), [OWASP Testing Guide](https://www.owasp.org/index.php/OWASP_Testing_Project) or [OWASP Dependency-Check](https://www.vojtechruzicka.com/detecting-dependencies-known-vulnerabilities/).

OWASP Top Ten
-------------

OWASP Top Ten is one of the OWASP projects, probably the most famous one. It is a list of Top 10 most critical web application security risks. It is not an exhaustive guide (there are other OWASP projects for that), but a rather short document, where each vulnerability is described on just one page. The intent is, therefore, to raise awareness about security vulnerabilities rather than provide a comprehensive description. This makes it a good starting point when you want to start taking your application's security more seriously and also a nice \'executive summary\' material when you need to convince the management, that you need to allocate some of your resources to security reinforcement.

OWASP Top Ten is released periodically every few years. The most recent version was released in December of 2017. The previous versions were 2013, 2010 and 2007.

Top Ten 2017, the first attempt
-------------------------------

The [first attempt](https://www.owasp.org/images/3/3c/OWASP_Top_10_-_2017_Release_Candidate1_English.pdf) to release OWASP Top Ten 2017 was in April of 2017. It was [heavily criticized](https://danielmiessler.com/blog/comments-owasp-top-10-2017-draft/) and the release was rescheduled after the first Release Candidate. What was wrong?

The changes were basically:

-   One Item removed
-   Two similar items merged
-   Two new items added

The problem was  mainly with the two new items:

1.  Insufficient attack protection
2.  Unprotected APIs

First of all, the two items were not added based on the actual data gathered. They were not a result of a process and methodology applied to the other eight items. They were chosen just based on the judgment of the authors. This gives you a weird mix of items, where some of them are added based on a methodology and data and some not. With no clear indication of which is which. Moreover, the independence of the project [was questioned](https://medium.com/@JoshCGrossman/behind-the-the-owasp-top-10-2017-rc1-df43236f79ff) as one of the items was added based on a suggestion of a commercial company (and only on a suggestion of that company), which by coincidence offers a product addressing the issue. What\'s more, it was specifically mentioned in the OWASP Top Ten Document. The two new items were also rather general and not a specific exploitable vulnerability on the same level such as XSS or CSRF. The type and granularity of the ten items were therefore not consistent.

Top Ten 2017, take two
----------------------

After the widespread criticism of the first version, OWASP took the feedback seriously and made a lot of changes. First of all, there was a change in the leadership. Then the methodology. Everything is now available on [GitHub](https://github.com/OWASP/Top10) - The document, issues, feedback, and even the [data gathered](https://github.com/OWASP/Top10/tree/master/2017/datacall) based on which the top ten issues are chosen. What a refreshing change compared to mailing lists.

Only 8 of 10 items are now chosen based on vulnerability data gathered from companies. The other two items are chosen based on a community survey. This way OWASP Top Ten contains both vulnerabilities based on current hard data as well as forward-looking items based on expert opinion of the community. The order of the items in the list is now determined by the risk factor rather than any other means.

After the first attempt failed, the new and shiny version of OWASP Top Ten 2017 was finally released in December 2017. It consists of the following ten items:

  Item                                             | Description
  -------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  1\. Injection                                    | Injection flaws, such as SQL injection, occur when untrusted data is sent to an interpreter as part of a command or query. It can trick the interpreter into executing unintended commands or accessing data.
  2\. Broken Authentication                        | Application functions related to authentication and session management are often implemented incorrectly, allowing attackers to assume other users' identities.
  3\. Sensitive Data Exposure                      | Many web applications and APIs do not properly protect sensitive data. Attackers may steal or modify such weakly protected data. Sensitive data may be compromised without extra protection, such as encryption at rest or in transit.
  4\. XML External Entities (XXE)                  | External entities in XML can be used to disclose internal files, remote code execution or DDoS attacks.
  5\. Broken Access Control                        | Attackers can exploit access restriction flaws to access unauthorized functionality and data.
  6\. Security Misconfiguration                    | Use of insecure default configurations, incomplete or ad hoc configurations, open cloud storage, misconfigured HTTP headers, and verbose error messages containing sensitive information.
  7\. Cross-Site Scripting (XSS)                   | Applications use unsanitized user-supplied data in a web page. It allows execution of scripts in the victim's browser.
  8\. Insecure Deserialization                     | Insecure deserialization often leads to remote code execution, replay attacks, injection attacks, and privilege escalation attacks.
  9\. Using Components with Known Vulnerabilities  | Components, such as libraries, frameworks run with the same privileges as the application. Components with known vulnerabilities may undermine application defenses.
  10\. Insufficient Logging & Monitoring           | Insufficient logging and monitoring, with missing incident response, prevents rapid reaction and allows continuous probing for vulnerabilities.

What changed
------------

#### Cross-side request forgery removed

CSRF is a type of attack where an unsuspected authenticated user is tricked into performing restricted actions.

Removing this is actually quite a big moment as CSRF was one of the evergreens in OWASP Top Ten. When it was included for the first time, basically no application was protected as the vulnerability was completely new. These days, fortunately, it is a wide-known vulnerability and many frameworks provide CSRF protection by including special CSRF tokens out of the box. Most of the applications are therefore safe even if the developers have no clue what CSRF actually is. According to the data gathered only about 5% of the apps were vulnerable.

#### Unvalidated redirects and forwards removed

This vulnerability uses redirect and forward mechanisms of trusted web applications to transfer users from trusted websites to malicious ones.

This vulnerability still affects 8% of the applications, but it was edged out from the list by XXE.

#### Insecure Direct Object References merged with Missing function-level access control

The two items are no longer separate issues but are now merged into one item called Broken Access control.

#### New Item: XML External Entities

This is the only new item which is based on actual vulnerability data gathered and not from a community survey.

The problem is that unlike Cross Site Scripting, Injection or Cross Site Request Forgery, this vulnerability is relatively unknown. Many of the current security tests do not take XXE into consideration. At the same time, consequences of a successful attack can be severe.

XXE is a type of vulnerability, which usually occurs when processing XML using outdated or misconfigured XML processors. This vulnerability can be exploited in many ways including, but not limited to, remote code execution, denial of service, port scanning or sensitive data disclosure. To mitigate the risk, you should consider using other data formats such as JSON where possible. Always use up to date version of XML parsers and processors. Where possible turn off processing of XML external entities. Unfortunately, it is usually enabled by default and needs to be explicitly disabled. Consider validating XML content server-side using a whitelist of possible values when external entities are necessary. For more details see [OWASP XXE Prevention cheat-sheet](https://www.owasp.org/index.php/XML_External_Entity_(XXE)_Prevention_Cheat_Sheet).

#### New Item: Insufficient Logging and Monitoring

This item was included based on community survey as one of the two items selected this way. Community-selected items were included for the first time in 2017.

When an attacker is trying to exploit a vulnerability to perform a successful attack, they have to know about the vulnerability in the first place. Because of this, there is usually a lot of probing preceding the attack searching for common vulnerabilities. All the applications contain some kind of vulnerability and it is only a matter of time until it is found and exploited. When there is no detection of such probing, it can freely continue without any countermeasure. If the attack is successful, there needs to be some kind of intrusion detection mechanism, which will inform you that you were targeted by an attack. If you detect this early, you can usually prevent further damage. Sadly, the average time until such breach is detected is [191 days](https://www-01.ibm.com/common/ssi/cgi-bin/ssialias?htmlfid=SEL03130WWEN&), which gives the attacker plenty of time to wreak havoc.

The bottom line is - this vulnerability makes all your other vulnerabilities much more exploitable and makes it hard to do a rapid response after an attack. Make sure you don\'t neglect logging and all your logs are easily available. It is worth having automatic notifications in case of any not standard behavior. There is also an [OWASP guide](https://www.owasp.org/index.php/OWASP_Proactive_Controls#8:_Implement_Logging_and_Intrusion_Detection) covering this topic and of course [OWASP AppSensor](https://www.owasp.org/index.php/OWASP_AppSensor_Project), which is a conceptual framework and methodology providing guidance to implement intrusion detection and automatic response into applications.

#### New Item: Insecure Deserialization

This is the second item included based on the community survey. While deserialization flaws are usually quite hard to detect and exploit, the impact can be devastating as it can lead to remote code execution, which is one of the worst attacks.

An application is vulnerable when accepting serialized objects (note that this does not apply only to java serialization but the process in general) from external sources. If a malicious serialized object is provided, it can lead to unexpected behavior such as remote code execution or complete system takeover. This does not apply only to inter-system communication, where serialization is involved, but also in situations such as caching.

The only robust protection is to use serialization solutions, where only primitive data types are allowed. If that is not possible, there are some ways to mitigate the risk such as

-   Logging all unexpected serialization inputs with automatic notifications to have early warning.
-   Deserialization modules should run with the least privileges possible.
-   Integrity checks of serialized objects to prevent data tampering

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  2013                                                                                                       |2017
  -----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------
  1\. Injection                                                                                              | 1\. Injection
  2\. Broken Authentication and Session Management                                                           | 2\. Broken Authentication
  3\. Cross-Site Scripting                                                                                   | 3\. Sensitive Data Exposure
  4\. Insecure Direct Object References **(Merged with 7)**                                                  | 4\. XML External Entities **(NEW)**
  5\. Security Misconfiguration                                                                              | 5\. Broken Access Control **(Merged 4+7)**
  6\. Sensitive Data Exposure                                                                                | 6\. Security Misconfiguration
  7\. Missing Function Level Access Control **(Merged with 4)**                                              | 7\. Cross-Site Scripting
  8\. Cross-Site Request Forgery **(Removed)**                                                               | 8\. Insecure Deserialization **(NEW, Community)**
  9\. Using Components with Known Vulnerabilities                                                            | 9\. Using Components with Known Vulnerabilities
  10\. Unvalidated Redirects and Forwards **(Removed)**                                                      | 10\. Insufficient Logging & Monitoring **(NEW, Community)**
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

More From OWASP
---------------

Okay, you are now familiar with OWASP Top Ten. You've read the document back and forth. You are now zealously making sure your apps are as safe as possible. What's next?

First of all, you should realize, that Top Ten is just a tip of the iceberg. You shouldn't definitely stop at 10. There are many, many more vulnerabilities and risks to look for. While top ten is good in raising awareness, it is by no means \'Security Bible\'. For detailed guides and explanations, you'll have to look elsewhere. But where to start? With other OWASP projects, of course!

Some of the interesting projects are:

-   [OWASP Developer Guide](https://www.owasp.org/index.php/OWASP_Guide_Project)
-   [OWASP Testing Guide](https://www.owasp.org/index.php/OWASP_Testing_Project)
-   [OWASP Cheat Sheets](https://www.owasp.org/index.php/OWASP_Cheat_Sheet_Series)
-   [OWASP Code Review Guide](https://www.owasp.org/index.php/Category:OWASP_Code_Review_Project)

One more thing worth mentioning is that Top Ten is not suitable for a security verification checklist due to its limited scope. Turns out there is a better match -- an OWASP project specifically focused on this area - [OWASP Application Security Verification Standard Project](https://www.owasp.org/index.php/Category:OWASP_Application_Security_Verification_Standard_Project).
