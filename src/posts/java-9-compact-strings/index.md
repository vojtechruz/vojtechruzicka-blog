---
title: 'Java 9: Compact Strings'
date: "2017-05-23T22:12:03.284Z"
path: '/java-9-compact-strings'
tags: ['Java']
featuredImage: './compact-strings.jpg'
disqusArticleIdentifier: '874 http://vojtechruzicka.com/?p=874'
---

Java 9 brings a new, improved string, which in most cases, will reduce String memory consumption to half.
<!--more-->

String memory consumption
-------------------------

The value of each String is internally contained in a char\[\] array. Each character is two bytes, sixteen bits. As this is UTF-16, it allows even representation of all the special characters. The problem is, that the vast majority of the strings in applications can be expressed by just one byte using ISO-8859-1/Latin-1 as they contain no special characters. If such strings could be represented with just one byte per character, that would mean only half of the memory would be used.

String instances are stored on the heap. Quite a big portion of the heap memory is actually consumed by Strings. According to [some studies](http://cr.openjdk.java.net/~shade/density/state-of-string-density-v1.txt), Strings usually occupy as much as 25% of the heap memory. Making String twice as small would mean not only a significant memory consumption reduction but also a substantial reduction of Garbage Collection overhead.

Java 6 Compressed Strings
-------------------------

The string memory consumption issue is not new. It has been discussed for quite some time already. In fact, in Java 6, a new feature was introduced to address this issue - Compressed Strings.

The idea was - instead of using char\[\] array for the internal representation an Object could be used. If necessary, two bytes per character would still be used assigning char\[\] array to that object. If not, one byte per character is sufficient and byte\[\] array can be used.

This was an optional, experimental feature, which could be enabled on demand using a -XX flag. However, there were various issues with this feature, which Aleksey Shipilev expressed in his [Q&A for InfoQ](https://www.infoq.com/news/2016/02/compact-strings-Java-JDK9):

> UseCompressedStrings feature was rather conservative: while distinguishing between char\[\] and byte\[\] case, and trying to compress the char\[\] into byte\[\] on String construction, it done most String operations on char\[\], which required to unpack the String. Therefore, it benefited only a special type of workloads, where most strings are compressible (so compression does not go to waste), and only a limited amount of known String operations are performed on them (so no unpacking is needed). In great many workloads, enabling -XX:+UseCompressedStrings was a pessimization.
>
> UseCompressedStrings implementation was basically an optional feature that maintained a completely distinct String implementation in alt-rt.jar, which was loaded once the VM option is supplied. Optional features are harder to test, since they double the number of option combinations to try.

Because of that, Compressed Strings support was later removed and is no longer available.

Java 9 Compact Strings
----------------------

While the implementation of Compressed Strings was flawed in many ways, the main idea was still valid. The implementation was just not solid enough. In Java 9, a new feature was introduced as a replacement of Compressed Strings - Compact Strings.

Instead of having char\[\] array, String is now represented as byte\[\] array. Depending on which characters it contains, it will either use UTF-16 or Latin-1, that is - either one or two bytes per character. There is a new field inside the String class - coder, which indicates which variant is used. Unlike Compressed Strings, this feature is enabled by default. If necessary (in a case where there are mainly UTF-16 Strings used), it can still be disabled by -XX:-CompactStrings.

The change does not affect any public interfaces of String or any other related classes. Many of the classes were reworked to support the new String representation, such as StringBuffer or StringBuilder.

### Performance Impact

Unlike Compressed Strings, the new solution does not contain any String repacking, thus should be much more performant. In addition to significant memory footprint reduction, it should provide a performance gain when processing 1-byte Strings as there is much less data to be processed. Garbage Collection overhead will be reduced as well. Processing of 2-byte string does mean a minor performance hit because there is some additional logic for handling both cases for Strings. But overall, performance should be improved as 2-byte Strings should represent just a minority of all String instances. In case there are performance issues in situations, where the majority of Strings are 2-byte, the feature can always be disabled.

Conclusion
----------

Java 9 introduces a new feature, which does reduce the memory footprint of String to half in most of the cases. It is backward compatible, no public interfaces were changed. If required, it can be disabled by an -XX flag. It is a successor to the Compressed Strings from Java 6.

Further Reading
---------------

-   [Aleksey Shipilëv on Compact Strings](https://www.youtube.com/watch?v=wIyeOaitmWM)
-   [JEP 254: Compact Strings](http://openjdk.java.net/jeps/254)