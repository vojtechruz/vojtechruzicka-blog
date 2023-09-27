---
title: 'Bit Manipulation in Java – Bitwise and Bit Shift operations'
date: "2017-09-02T22:12:03.284Z"
tags: ['Java']
path: '/bit-manipulation-java-bitwise-bit-shift-operations'
featuredImage: './binary.jpg'
excerpt: 'Java enables you to manipulate integers on a bit level, that means operating on specific bits, which represent an integer number. In some cases, it can be really handy.'
---
![bit manipulation java](./binary.jpg)

Java enables you to manipulate integers on a bit level, that means operating on specific bits, which represent an integer number. In some cases, it can be really handy.

## Bitwise operators

You are no doubt familiar with arithmetic operators such as + - \* / or %. You also know for sure logical operators such as & or \|. Turns out there is another, a slightly less known set of operators, which manipulate numbers on bit level. Internally, every number is stored in a binary format - that is 0 and 1.

These operators can be performed on integer types and its variants - that is

-   byte (8 bit)
-   short (16 bit)
-   int (32 bit)
-   long (64 bit)
-   and even char (16 bit)

### Unary bitwise complement operator \[\~\]

This fancy name basically means bit negation. It takes every single bit of the number and flips its value. That is - 0 becomes 1 and vice versa. Unary means that it needs just one operand. The operator is \~ and it is just placed before the number:

```java
~someVariable
```

or

```java
~42
```

For example, let\'s use \~42:

1.  The binary representation of 42 is 101010.
2.  Because 42 is int, it is represented as a 32-bit value, that is 32x ones or zeros.
3.  So all the positions to the left of 101010 are actually filled with zeros up to 32 bits total.
4.  That is 00000000 00000000 00000000 00101010
5.  Flipped value of the number above would then be 11111111 11111111 11111111 11010101

### Bitwise AND \[&\]

Unlike bitwise complement operator, other bitwise operators need two operands.

A & B means that all the bits of both numbers are compared one by one and the resulting number is calculated based on values of the bits from numbers A and B. Bitwise AND is similar to logical AND in a sense that it results in 1 only when the two compared bits are both equal to 1. Otherwise, it results in 0.

For example: 1010 & 1100 would result in 1000 as the first bit from the left is the only one where both operands contain 1.

### Bitwise OR \[\|\]

Bitwise OR results in 1 when at least one of the compared bits is 1 (or both), otherwise it results in 0.

### Bitwise Exclusive OR (XOR) \[\^\]

Exclusive OR (XOR) results in 1 only if both the compared bits have a different value, otherwise, it results in 0.

### Bitwise Operators comparison

Below is a table showing a comparison of results of all the bitwise operators mentioned above based on different values of the compared bits (A and B).

  A  | B | A & B | A \| B | A \^ B
  ---|---|-------|--------|--------
  1  | 0 | 0     | 1      | 1
  0  | 1 | 0     | 1      | 1
  1  | 1 | 1     | 1      | 0
  0  | 0 | 0     | 0      | 0

Bit Shift Operators
-------------------

### Signed Left Shift \[\<\<\]

Signed Left Shift takes two operands. It takes the bit pattern of the first operand and shifts it to the left by the number of places given by the second operand. For example 5 \<\< 3: What happens in this case - Every bit in the binary representation of the integer 5 is shifted by 3 positions to the left. All the places on the left are padded by zeros. That is:

```java
00000000 00000000 00000000 00000101
```

becomes

```java
00000000 00000000 00000000 00101000
```

You can note that the integer result of 5 \<\< 3 is 40. That shows that shifting a number by one is equivalent to multiplying it by 2, or more generally left shifting a number by *n* positions is equivalent to multiplication by 2^*n*.

There are several additional interesting aspects to this:

-   Even though you can use shifting of byte, short or char, they are promoted to 32-bit integer before the shifting
-   Bit-shift operators never throw an exception
-   The right operand (the number of positions to shift) is reduced to modulo 32. That is 5 \<\<35 is equivalent to 5 \<\< 3.

### Negative Integers in Java

There are actually two types of right shift. Signed and unsigned. The difference is how they treat negative numbers. To understand the difference, it is necessary to know how negative numbers are represented in Java. Binary representation on its own does not provide information whether the number is negative. There needs to be a special rule to define how to represent negative numbers in binary. There are several approaches to this problem.

One solution is that the leftmost (Most Significant) bit is a sign bit. That means that its value indicates whether the number is positive or negative. This has, however, some disadvantages such as that there are two ways of representing zero.

Java uses another approach, which is called *two\'s complement*. Negative numbers are representing by negating (flipping) all the bits and then adding 1. Still, if the leftmost bit is 0, the number is positive. Otherwise, it is negative.

### Signed Right Shift \[\>\>\]

Signed right shift moves all the bits by given number of positions to the right. However, it preserves the sign. Positive numbers remain positive and negative ones remain negative. Similar to left shift, the right shift of *n* positions is equivalent to division by 2*^n*. Or division by 2^*n* -1 in case of odd numbers.

### Unsigned Right Shift \[\>\>\>\]

Unlike the signed shift, the unsigned one does not take sign bits into consideration, it just shifts all the bits to the right and pads the result with zeros from the left. That means that for negative numbers, the result is always positive. Signed and unsigned right shifts have the same result for positive numbers.

### Compound Assignment Operators
Java offers a shorter syntax for assigning results of arithmetic or bitwise operations. So instead of writing this:

```java
x = x + 1;
```

You can use a shorter version, which will handle both addition and assignment with just one operator:

```java
x += 1;
```

You are probably familiar with compound assignment operators for arithmetic operations such as `+=`, `-=` or `*=`. But in addition to these, Java also offers variants for bitwise operators:

  Operator  | Example  | Is equivalent to |
------------|----------|------------------|
  \|=       | x \|= 5  | x = x \| 5       |
  ^=        | x ^= 5   | x = x ^ 5        |
  &=        | x &= 5   | x = x & 5        |
  <<=       | x <<= 5  | x = x << 5       |
  >>=       | x >>= 5  | x = x >> 5       |
  >>>=      | x >>>= 5 | x = x >>> 5      |
  
Note that there is no compound assignment operator for Unary bitwise complement operator \[\~\].

## Conclusion

Bit manipulation can be very handy in some cases and is really efficient. Increased performance, however, comes at its cost. The readability suffers a lot at it can be really puzzling for somebody who is not familiar with the bit manipulation concept. If the scenario you are using is not performance-critical, you may want to consider, whether the tradeoff of performance for readability is really worth it and maybe rewrite your solution in a more readable way. Don\'t use bit manipulation everywhere possible just because you learned a cool new concept.
