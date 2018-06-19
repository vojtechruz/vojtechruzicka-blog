---
title: 'Easy git hooks with Husky'
date: "2018-06-21T22:12:03.284Z"
tags: ['Git']
path: '/githooks-husky'
featuredImage: './husky.jpg'
disqusArticleIdentifier: '99006 http://vojtechruzicka.com/?p=99006'
excerpt: 'Effortless creation and management of git hooks for your Node/NPM projects with Husky.'
---

![Husky](husky.jpg)

In this article you will learn how to easily create and manage git hooks for your Node/NPM projects using Husky.

## Git hooks
Simply put, git hooks are custom scripts, which can be rung automatically bu git when certain events occur. There are client-side hooks which are triggered when on actions such as commiting or merging. Server-side hooks run in situations such as receiving push data from the client.

The hooks can perform any custom logic and most importantly reject the action performed if something is not in order. For example you can abort commit if its message does does not contain issue tracker's issue ID. Or you can reject it if static code analysis fails. It can be pretty useful if you want to make sure your codebase stays clean or you want to enforce certain quality policies.

But how can you actually install and manage these hooks? Whenever you clone a git repository, all the git's data for your project are stored in `.git` directory inside your folder. It contains several files and sub-directories, one of which is called `hooks`. Inside you'll find a bunch of files.

![Git Hooks Directory](./git-hooks.png)

Each of them is a script, which will be executed once a specific event occurs. The name of the event is determinded by the name of the file. So for example - `pre-commit` will be executed before you commit your changes.

As you can see, all the files have extension `sample`. Git will ignore these files unless you rename them - you need to remove the `.sample` extension to enable these hooks. Inside the sample files you can find some description and sample implementation, which you can use as a starting point when implementing your own hooks.

## What is it good for?
Now, let's look at some specific examples what can be achieved with git hooks.


    prettify
    tests
    snyk
    linting
## Problems
While githooks are very useful, there are some problems with them.

### Distribution to team members
With server-side hooks the distribution is easy. You usually have just one primary server repository. This means all the team members usually push their changes to one central place. You set up your hooks there and you're done.

With client-side hooks, this gets more complicated. When you clone a repository, the hooks are not transferred to the client. That means a freshly cloned repo will have no hooks at all no matter what hooks you have server-side. If you want your team members to have unified set of git hooks, you need to distribute them somehow and make sure they are included in their git hooks sub-directory.

The most basic solution is to have some shared location, where you store your hooks and then tell your developers to download them and put theim in their hooks directory. Of course you cannot be sure that they will actually do it. The first problem is they need to know they should do this and how. And even if they do, they may be lazy or just ignore your policy.

You can improve this basic solution a bit by having hooks in your project's repo and just let your developers run a custom script [like this one](https://gist.github.com/tilap/0590e78c9cfd8f6548f5), which copies them over to their hooks directory. Alternatively, git offers an option to change the destination of the hooks directory to a custom location:

```cmd
git config core.hooksPath YOUR_DIRECTORY
```

These solutions make the distribution easier, but don't sole the core issues.

## Developers with different operating systems

## Husky
### Installation
You can install [husky](https://github.com/typicode/husky) simply by running:

```cmd
npm install husky --save-dev
```

Or with yarn:

```cmd
yarn add husky --dev
```

### Continuous integration
One thing to note is that husky will install the hooks only when not running on a Continuous Integration server. Husky [can detect](https://github.com/watson/is-ci) it is running as a part of CI job and will not install any hooks. 

Autofixing w/ lint-staged
Jetbrains IDE integration
    bug
        https://github.com/okonet/lint-staged/issues/151
        https://youtrack.jetbrains.com/issue/IDEA-135454
    workaround

## Ignoring
Cient-side hooks can be useful, but you cannot rely on them too much. They are just the first level of defense. You cannot be 100% sure that they get executed. They can be ignored on demand by adding a command-line option:

```cmd
git commit --no-verify
```

To make it even easier, the hooks can be disabled using certain environmental variables. Because of this, it is still useful to enforce the same functionality on the server. 
    
## Performance
While client side hooks such as pre-commit can be very useful, you need to keep in mind that they take some time to exectute. Commits, which are usually very fast as they happen only on the client can suddenly take very long time. You may be tempted to run all the test, static code analysis, prettification and more before each commit. When a commit takes ages, your developers will not be happy and may be tempted to ignore the hooks when performing  their git commands. So you should find the right balance what needs to be performed on client and what can be a server-side hook.
     
## Conclusion      
Husky is a useful tool, which allows efortless creation and management of git hooks on client. You no longer need to distribute your hooks manually and worry about OS compatibility. As with everyhting, keep the number of your client-side hooks in moderation to avoid long execution times.    
    