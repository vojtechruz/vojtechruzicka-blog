---
title: 'Comparing files and dolders in IntelliJ IDEA'
date: "2019-10-25T22:12:03.284Z"
tags: ["IDEA"]
path: '/idea-compare-files-and-folders'
featuredImage: './idea-compare.jpg'
disqusArticleIdentifier: '99041 http://vojtechruzicka.com/?p=99041'
excerpt: 'Numerous ways of comparing files, folders and code snippets in IntelliJ IDEA.'
---

![IntelliJ IDEA compare files and folders](./idea-compare.jpg)

## Comparing project files
Let's say there are two similar files in your project and you need to compare them line by line. With IDEA, that's very easy. Just select both files in your project window (holding <kbd>Ctrl</kbd> for multi selection).

Now you have two options:
1. Right click one of the files and select `Compare Files`
2. Press <kbd>Ctrl</kbd> + <kbd>D</kbd>

Now the new window opens, which contains two panels, each with one file. This is very similar to diff in Version Control Systems such as Git

![IDEA Compare files](idea-compare-files.png)

Each difference is color coded:
- No coloring means content is the same
- Blue means changes on the same line
- Green means new content
- Gray means removed content

You can click arrow icons `»` and `«` to apply particular change from one file to another.

This comparison works for images too, although you cannot see and apply individual differences.

## Comparing with non-project file
Another case is when you need to compare a file from your project with another file outside of it.

The process is again very similar. Select a single file in your project window and:

1. Right click one of the files and select `Compare With...`
2. Press <kbd>Ctrl</kbd> + <kbd>D</kbd>

Now the comparison is the same as in the example above.

## Comparing with clipboard
Maybe you have a file in your project and you need to compare it with some external content, which is not saved as a file on your machine. Maybe it is a code snippet from web, for example from stack overflow.

First you need to open the file from your project in your editor. The copy to clipboard the snipped you want to compare (<kbd>Ctrl</kbd>+<kbd>C</kbd>).

Now you have two options. Either compare the whole file agains the clipboard or just a selection. If you want the whole file to be compared, just right click anywhere in the editor and select `Compare with Clipboard` from the context menu. If you want just a selection instead, select some fragment of the file first and then right click as before. 

## Custom comparison
What about the case when you want to compare two non-file code snippets from external sources. You can do this too! Just run `Find Action` via <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> and then search for `Open Blank Diff Window`.

This opens a brand new diff window with both panels blank, so you can copy and paste both snippets to be compared.

## Comparing with the local previous version of the file
Even if you're not using any Version Control system, IDEA stores historical versions of your local files. You can right click in your editor and select `Local hostory → Show history`.

![Local History](idea-local-history.png)

Here you can browse older versions of your current file and see the difference between the old and the current version and apply any changes if required.

## Compare with VCS
If you're using a Version Control System, you have several more comparison options. For example, if you're using Git, you can go to `VCS → Git` or right click your editor and select `Git`. Now you can

**Compare with the same repository version**
Compares the current local file with the version in your remote repository 

**Compare with branch**
Compares the local file with the same file in a different branch

**Show history**
Compares the local file with its previous versions

## Comparing Folders
Comparison works not only for individual files but also for the whole directories. The process is the same as for files - just select two folders in your Project window and press <kbd>Ctrl</kbd> + <kbd>D</kbd> or right click and `Compare Directories`.

![Compare directories](idea-compare-directories.png)

Here you can see list of all the file present in both or in either one of the directories. You can easily spot which files are present in just one folder and which in both. These in both, you can compare as usual.

### Synchronizing folders
The directory diff tool is useful not only for spotting differences in both directories, but also for sycnhronizing changes. You can apply changes for individual sections of each file as usual. But you can also mark files present only in one of the directories to be either kept or synchronized to the other direcotry. You cam change desired action for each file in the `*` column. Once you are satisfied, you can hit either `Synchronize elected` or `Synchronize all`.

![Synchronize Folders](idea-synchronize-directories.png)