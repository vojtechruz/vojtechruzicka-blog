---
title: 'Commitlint: validate your commit conventions automatically'
date: "2019-11-11T22:12:03.284Z"
tags: ["Git"]
path: '/commitlint'
featuredImage: './commitlint.png'
disqusArticleIdentifier: '99043 http://vojtechruzicka.com/?p=99043'
excerpt: 'Automatically check and enforce your commit conventions either with various available configurations.'
---

![Commitlint](commitlint.jpg)

Automatically check and enforce your commit conventions either with various available configurations.

## Commit conventions
Although you can put pretty much anything in your commit messages, it is beneficial to have more standardized and structured approach. It is better to stick to a convention, so all your commit messgaes follow the same structure. This has many advantages.

- Your commit history is more readable and easier to navigate
- You can automatically generate changelogs
- Based on type of changes you can properly bump your version when using [samentic versioning](https://semver.org/): 
  - major: when introducing breaking chnages 
  - minor: when adding a feature
  - fix: when adding a fix

There are various conventions, one example can be [Conventional Commits](https://www.conventionalcommits.org/).

Conventions can be very useful, but only as long as you can make sure everybody follows them. You can rely on your developers discipline, but it is risky. Especially with external contributors to your codebase who may not be familiar enough with your convention. What's much better is having an automated tool to check your commits for you and reject them if they don't follow your conventions.

## Githooks & Husky
Fortunately, Git already allow you to perform some actions when specific events are triggered. It is called git hooks. You can react in many phases of the git workflow such as:

- pre-commit
- pre-push
- pre-rebase
- post-update

The bad news is that this is configured locally in your `.git` directory, so by default each developer needs to be sure to install their hooks. If they don't, there are no checks and you cannot check your conventions.

Fortunately, there is a tool called Husky for Node/NPM projects, which solves this issue. You can define your hooks in your project and they are automatically installed for you when running the project. This way all the developers will have proper hooks installed with no effort. If you need to change your hooks, you can do it n just one place, and it gets propagated to all your developers. You can read more about Husky in one of my previous posts:

TODO link to husky

While Husky can be used to enforce your commit conventions, it can do much more. You can run your static code analysis, tests, automatic code formatting and much more when commiting.

## Commitlint
Commitlint is an automated tool which can check your commit conventions for you and reject the commit if it does not follow your rules. These rules, of course, can be configured. Under the hood, Commitlint uses Husky git hooks.

## Local setup

### Husky
Since Commitlint utilizes Husky, we need to install it first. Husky is provided as dev-dependency, so it is used only locally and not bundled with your production code.

```
npm install --save-dev husky
```

Now we need to register a hook for checking a commit message. The hook is called `commit-msg` and can be registered in your `package.json`.

```
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }  
  }
}
```

Alternatively, you can use a dedicated `.huskyrc` file, which contains only Husky configuration:

```
{
  "hooks": {
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}
```

### Commitlint
Now when We have Husky, we need to install Commitlint CLI, which will be executed by Husky hook to validate commit messages. Again, it is jsut a dev dependency, which is not included in your production bundle.

```
npm install --save-dev @commitlint/cli
```

### Convention configuration
Commitlint is just a tool for checking if your messages follow your conventions. It does not for you to use a specific convention, you can use whatever you want, it is fully configurable. It offers some configurations out of Currently supported configurations are:

- [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)
- [@commitlint/config-lerna-scopes](@commitlint/config-lerna-scopes)
- [@commitlint/config-patternplate](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-patternplate)
- [@commitlint/config-angular](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-angular)
- [@commitlint/config-angular-type-enum](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-angular-type-enum)

Let's use `@commitlint/config-conventional` for now, but the process would be the same for any different configuration. We just need to install the proper package:

```
npm install --save-dev @commitlint/config-conventional
```

### Verifying the setup
Now we're good to go. Let's just make sure everything works. Let's make sure our commit messages are tested against the [Conventional Commits](https://www.conventionalcommits.org/) specification. Let's try an ordidary, not structured commit message first.

```

```

```

```

## Conclusion