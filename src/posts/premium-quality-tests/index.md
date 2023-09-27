---
title: Premium Quality Tests
date: "2017-05-02T22:12:03.284Z"
tags: ['Testing']
path: '/premium-quality-tests'
featuredImage: './premium.png'
excerpt: 'Test quality is just as important as that of production code. Tests should not be excluded from quality checks and the same quality rules should be applied.'
---
![premium quality tests](./premium.png)

Test quality is just as important as that of production code. Tests should not be excluded from quality checks and the same quality rules should be applied.

Relaxed rules for tests
-----------------------

On one of my previous projects, we introduced SonarQube static code analysis checks to detect bad practices and code smells automatically. Before that, our codebase started to rot slowly and this was supposed to be the solution for that. It worked. Everybody was eager to keep the code clean. We were zealously purging all the remaining issues and then we were vigorously keeping zero items. Everybody was happy. We did, however, make one huge mistake. We decided the exclude all the tests from the checks. Even in code reviews, we did not insist on keeping the quality up to the level of the production code. Tests were allowed to be a mess as long as they were actually testing well the production code.

Short term
----------

At first, it all makes sense. You need to deliver the new features. The business does not care about the tests at all. They just want their business functionality delivered as soon as possible. It was hard enough to convince them that we actually need to dedicate some time to write tests. Now you want me to go to them again and justify that we actually need to spend even more?

And the developers? It is hard enough now to make them write tests already. Many of them consider tests necessary evil anyway and write just bare minimum so their changes don\'t get rejected in the code review. They will not be happy to spend more time and effort on tests. They won\'t be glad that their test code gets questioned in the same way as the production one.

Long Term
---------

In the long term it, however, starts to be obvious that having low-quality tests leads to many problems. Below are some of the main disadvantages of such approach.

### Maintainability

Imagine your tests contain a lot of duplication, spaghetti code, are hard to read and understand, in short - they are messy. And your production code keeps evolving and changing all the time as the new requirements arrive. You need to change your tests accordingly. The messier they are, the harder it is to change them properly. That means that over time, the time and effort to make changes in your code keeps rising because of the tests. The developers are more and more reluctant to make the changes in the tests. That will possibly result in commenting out some old tests (\"I will fix it later\"), not writing new ones or filling the existing ones with even more dirty code to achieve a quick and easy solution.

### Fear of refactoring

This applies not only to new features but also to the refactoring of the existing codebase. If making changes results in a lot of pain in the affected test, developers will avoid doing so. While they cannot avoid implementing the new features, they can certainly avoid refactoring. That means the technical debt will keep accumulating and the codebase will inevitably rot. This will, as a result, lead to even more reluctance to make any changes, making it harder and harder over time to break the cycle.

### Documentation

The value of tests is not only in actually making sure the code does not contain bugs. It documents the classes, which it tests. It shows how to use them properly. It shows all the corner cases and special rules. Unlike regular documentation, tests do not get obsolete and inaccurate. If you change your business code, you need to update the tests as well. Otherwise, they fail. If you forget to update your documentation (or comments), there is no such safeguard. When you want to understand some code, the good way is to look at the tests. Provided proper test suite is maintained. That means that test code should be really easy to read and understand, same as production one.

### Bad habits

You should not write clean code just sometimes. It should be a habit for you. Natural way you write and structure your code. It is much harder to develop and keep such habits when you apply the good coding practices just to a portion of your code. You should write proper code no matter what.

Conclusion
----------

Tests are as important as your production code and should be treated as such. Excluding them from the quality checks is short-sighted and never a good idea. It makes writing tests easier at first, but in the long run, it leads to disaster. The time invested in writing proper tests at the beginning will greatly pay off over time.
