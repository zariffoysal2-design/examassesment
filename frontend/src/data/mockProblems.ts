import type { Problem } from '../types';

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: 1,
    problemNumber: 1,
    title: "Pass or Fail Grade Calculator",
    topic: "Conditional Statements",
    difficulty: "Easy",
    points: 15,
    timeLimitSec: 2.0,
    memoryLimitMb: 256,
    description:
      "Write a program that takes a student's score (0 to 100) and prints 'PASS' if the score is 50 or greater, otherwise print 'FAIL'. If the score is outside the range 0 to 100, print 'INVALID'.",
    inputDescription:
      "A single integer representing the student's score.",
    outputDescription:
      "Print 'PASS', 'FAIL', or 'INVALID' depending on the input score.",
    sampleInput: "75",
    sampleOutput: "PASS",
    starterCode: `# Problem 1: Pass or Fail Grade Calculator
# Read score from standard input and evaluate result

score = int(input().strip())

# Write your solution below
if score < 0 or score > 100:
    print("INVALID")
elif score >= 50:
    print("PASS")
else:
    print("FAIL")
`,
    sampleTestCases: [
      { id: "p1-s1", input: "75", expectedOutput: "PASS", isSample: true },
      { id: "p1-s2", input: "42", expectedOutput: "FAIL", isSample: true },
      { id: "p1-s3", input: "105", expectedOutput: "INVALID", isSample: true },
    ],
    hiddenTestCases: [
      { id: "p1-h1", input: "50", expectedOutput: "PASS", isSample: false },
      { id: "p1-h2", input: "0", expectedOutput: "FAIL", isSample: false },
      { id: "p1-h3", input: "100", expectedOutput: "PASS", isSample: false },
      { id: "p1-h4", input: "-5", expectedOutput: "INVALID", isSample: false },
      { id: "p1-h5", input: "49", expectedOutput: "FAIL", isSample: false },
    ],
  },
  {
    id: 2,
    problemNumber: 2,
    title: "Sum of Even Numbers in Range",
    topic: "Loops",
    difficulty: "Easy/Medium",
    points: 15,
    timeLimitSec: 2.0,
    memoryLimitMb: 256,
    description:
      "Given two positive integers L and R (where L <= R), calculate and print the sum of all EVEN numbers in the inclusive range [L, R].",
    inputDescription:
      "Two space-separated positive integers L and R.",
    outputDescription:
      "Print a single integer representing the sum of even numbers from L to R.",
    sampleInput: "1 10",
    sampleOutput: "30",
    starterCode: `# Problem 2: Sum of Even Numbers in Range
# Read L and R from input

L, R = map(int, input().split())

# Write your solution below
total = 0
for num in range(L, R + 1):
    if num % 2 == 0:
        total += num

print(total)
`,
    sampleTestCases: [
      { id: "p2-s1", input: "1 10", expectedOutput: "30", isSample: true },
      { id: "p2-s2", input: "4 4", expectedOutput: "4", isSample: true },
      { id: "p2-s3", input: "5 9", expectedOutput: "14", isSample: true },
    ],
    hiddenTestCases: [
      { id: "p2-h1", input: "2 20", expectedOutput: "110", isSample: false },
      { id: "p2-h2", input: "1 100", expectedOutput: "2550", isSample: false },
      { id: "p2-h3", input: "15 15", expectedOutput: "0", isSample: false },
      { id: "p2-h4", input: "10 15", expectedOutput: "36", isSample: false },
      { id: "p2-h5", input: "100 200", expectedOutput: "7650", isSample: false },
    ],
  },
  {
    id: 3,
    problemNumber: 3,
    title: "Array Peak and Difference Finder",
    topic: "Arrays",
    difficulty: "Medium",
    points: 20,
    timeLimitSec: 2.0,
    memoryLimitMb: 256,
    description:
      "You are given an array of N integers. Find the absolute difference between the maximum element and the minimum element in the array.",
    inputDescription:
      "The first line contains an integer N (the size of the array). The second line contains N space-separated integers.",
    outputDescription:
      "Print the difference (Max - Min).",
    sampleInput: "5\n3 10 2 8 1",
    sampleOutput: "9",
    starterCode: `# Problem 3: Array Peak and Difference Finder
# Read N and the array elements

n = int(input().strip())
arr = list(map(int, input().split()))

# Write your solution below
max_val = max(arr)
min_val = min(arr)
print(max_val - min_val)
`,
    sampleTestCases: [
      { id: "p3-s1", input: "5\n3 10 2 8 1", expectedOutput: "9", isSample: true },
      { id: "p3-s2", input: "1\n42", expectedOutput: "0", isSample: true },
      { id: "p3-s3", input: "4\n-10 0 10 -20", expectedOutput: "30", isSample: true },
    ],
    hiddenTestCases: [
      { id: "p3-h1", input: "6\n100 200 500 50 10 999", expectedOutput: "989", isSample: false },
      { id: "p3-h2", input: "3\n-5 -5 -5", expectedOutput: "0", isSample: false },
      { id: "p3-h3", input: "5\n1 2 3 4 5", expectedOutput: "4", isSample: false },
      { id: "p3-h4", input: "4\n-100 -200 -300 -400", expectedOutput: "300", isSample: false },
      { id: "p3-h5", input: "7\n9 1 8 2 7 3 6", expectedOutput: "8", isSample: false },
    ],
  },
  {
    id: 4,
    problemNumber: 4,
    title: "Prime Palindrome Checker",
    topic: "Functions",
    difficulty: "Medium",
    points: 20,
    timeLimitSec: 2.0,
    memoryLimitMb: 256,
    description:
      "Write a program that determines if a given integer N is both a Prime number and a Palindrome (reads the same forward and backward). Print 'YES' if it is both, otherwise print 'NO'.",
    inputDescription:
      "A single integer N.",
    outputDescription:
      "Print 'YES' or 'NO'.",
    sampleInput: "131",
    sampleOutput: "YES",
    starterCode: `# Problem 4: Prime Palindrome Checker
# Define helper functions and check if N is a prime palindrome

def is_prime(num):
    if num <= 1:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

def is_palindrome(num):
    s = str(num)
    return s == s[::-1]

n = int(input().strip())

if is_prime(n) and is_palindrome(n):
    print("YES")
else:
    print("NO")
`,
    sampleTestCases: [
      { id: "p4-s1", input: "131", expectedOutput: "YES", isSample: true },
      { id: "p4-s2", input: "121", expectedOutput: "NO", isSample: true },
      { id: "p4-s3", input: "11", expectedOutput: "YES", isSample: true },
    ],
    hiddenTestCases: [
      { id: "p4-h1", input: "7", expectedOutput: "YES", isSample: false },
      { id: "p4-h2", input: "10", expectedOutput: "NO", isSample: false },
      { id: "p4-h3", input: "929", expectedOutput: "YES", isSample: false },
      { id: "p4-h4", input: "1", expectedOutput: "NO", isSample: false },
      { id: "p4-h5", input: "383", expectedOutput: "YES", isSample: false },
    ],
  },
  {
    id: 5,
    problemNumber: 5,
    title: "Longest Substring Without Repeating Characters",
    topic: "Algorithmic Thinking",
    difficulty: "Hard",
    points: 30,
    timeLimitSec: 2.0,
    memoryLimitMb: 256,
    description:
      "Given a string S, find the length of the longest substring without repeating characters.",
    inputDescription:
      "A single line containing the string S.",
    outputDescription:
      "Print an integer representing the maximum length of a substring with all distinct characters.",
    sampleInput: "abcabcbb",
    sampleOutput: "3",
    starterCode: `# Problem 5: Longest Substring Without Repeating Characters
# Solve using sliding window or two pointers technique

def longest_unique_substring(s):
    char_map = {}
    left = 0
    max_len = 0
    
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
        
    return max_len

s = input().strip()
print(longest_unique_substring(s))
`,
    sampleTestCases: [
      { id: "p5-s1", input: "abcabcbb", expectedOutput: "3", isSample: true },
      { id: "p5-s2", input: "bbbbb", expectedOutput: "1", isSample: true },
      { id: "p5-s3", input: "pwwkew", expectedOutput: "3", isSample: true },
    ],
    hiddenTestCases: [
      { id: "p5-h1", input: "", expectedOutput: "0", isSample: false },
      { id: "p5-h2", input: "au", expectedOutput: "2", isSample: false },
      { id: "p5-h3", input: "dvdf", expectedOutput: "3", isSample: false },
      { id: "p5-h4", input: "anviaj", expectedOutput: "5", isSample: false },
      { id: "p5-h5", input: "tmmzuxt", expectedOutput: "5", isSample: false },
    ],
  },
];
