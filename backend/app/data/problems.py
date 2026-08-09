from typing import List, Dict, Any, Optional

# Central Server-Side Source of Truth for Assessment Problems
PROBLEMS_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "problem_number": 1,
        "title": "Pass or Fail Grade Calculator",
        "topic": "Conditional Statements",
        "difficulty": "Easy",
        "points": 15,
        "time_limit": 2.0,
        "memory_limit": 256,
        "description": "Write a program that takes a student's score (0 to 100) and prints 'PASS' if the score is 50 or greater, otherwise print 'FAIL'. If the score is outside the range 0 to 100, print 'INVALID'.",
        "input_description": "A single integer representing the student's score.",
        "output_description": "Print 'PASS', 'FAIL', or 'INVALID' depending on the input score.",
        "sample_input": "75",
        "sample_output": "PASS",
        "starter_code": """# Problem 1: Pass or Fail Grade Calculator
score = int(input().strip())

# TODO: print "INVALID" if score is outside 0-100,
# "PASS" if score >= 50, otherwise "FAIL"
""",
        "sample_test_cases": [
            {"input": "75", "expected_output": "PASS"},
            {"input": "42", "expected_output": "FAIL"},
            {"input": "105", "expected_output": "INVALID"},
        ],
        "hidden_test_cases": [
            {"input": "50", "expected_output": "PASS"},
            {"input": "0", "expected_output": "FAIL"},
            {"input": "100", "expected_output": "PASS"},
            {"input": "-5", "expected_output": "INVALID"},
            {"input": "49", "expected_output": "FAIL"},
        ],
    },
    {
        "id": 2,
        "problem_number": 2,
        "title": "Sum of Even Numbers in Range",
        "topic": "Loops",
        "difficulty": "Easy/Medium",
        "points": 15,
        "time_limit": 2.0,
        "memory_limit": 256,
        "description": "Given two positive integers L and R (where L <= R), calculate and print the sum of all EVEN numbers in the inclusive range [L, R].",
        "input_description": "Two space-separated positive integers L and R.",
        "output_description": "Print a single integer representing the sum of even numbers from L to R.",
        "sample_input": "1 10",
        "sample_output": "30",
        "starter_code": """# Problem 2: Sum of Even Numbers in Range
L, R = map(int, input().split())

# TODO: compute and print the sum of all even numbers in [L, R]
""",
        "sample_test_cases": [
            {"input": "1 10", "expected_output": "30"},
            {"input": "4 4", "expected_output": "4"},
            {"input": "5 9", "expected_output": "14"},
        ],
        "hidden_test_cases": [
            {"input": "2 20", "expected_output": "110"},
            {"input": "1 100", "expected_output": "2550"},
            {"input": "15 15", "expected_output": "0"},
            {"input": "10 15", "expected_output": "36"},
            {"input": "100 200", "expected_output": "7650"},
        ],
    },
    {
        "id": 3,
        "problem_number": 3,
        "title": "Array Peak and Difference Finder",
        "topic": "Arrays",
        "difficulty": "Medium",
        "points": 20,
        "time_limit": 2.0,
        "memory_limit": 256,
        "description": "You are given an array of N integers. Find the absolute difference between the maximum element and the minimum element in the array.",
        "input_description": "The first line contains an integer N (the size of the array). The second line contains N space-separated integers.",
        "output_description": "Print the difference (Max - Min).",
        "sample_input": "5\n3 10 2 8 1",
        "sample_output": "9",
        "starter_code": """# Problem 3: Array Peak and Difference Finder
n = int(input().strip())
arr = list(map(int, input().split()))

# TODO: print the difference between the max and min values in arr
""",
        "sample_test_cases": [
            {"input": "5\n3 10 2 8 1", "expected_output": "9"},
            {"input": "1\n42", "expected_output": "0"},
            {"input": "4\n-10 0 10 -20", "expected_output": "30"},
        ],
        "hidden_test_cases": [
            {"input": "6\n100 200 500 50 10 999", "expected_output": "989"},
            {"input": "3\n-5 -5 -5", "expected_output": "0"},
            {"input": "5\n1 2 3 4 5", "expected_output": "4"},
            {"input": "4\n-100 -200 -300 -400", "expected_output": "300"},
            {"input": "7\n9 1 8 2 7 3 6", "expected_output": "8"},
        ],
    },
    {
        "id": 4,
        "problem_number": 4,
        "title": "Prime Palindrome Checker",
        "topic": "Functions",
        "difficulty": "Medium",
        "points": 20,
        "time_limit": 2.0,
        "memory_limit": 256,
        "description": "Write a program that determines if a given integer N is both a Prime number and a Palindrome (reads the same forward and backward). Print 'YES' if it is both, otherwise print 'NO'.",
        "input_description": "A single integer N.",
        "output_description": "Print 'YES' or 'NO'.",
        "sample_input": "131",
        "sample_output": "YES",
        "starter_code": """# Problem 4: Prime Palindrome Checker
def is_prime(num):
    # TODO: return True if num is a prime number, False otherwise
    pass

def is_palindrome(num):
    # TODO: return True if num reads the same forward and backward
    pass

n = int(input().strip())
# TODO: print "YES" if n is both prime and a palindrome, else "NO"
""",
        "sample_test_cases": [
            {"input": "131", "expected_output": "YES"},
            {"input": "121", "expected_output": "NO"},
            {"input": "11", "expected_output": "YES"},
        ],
        "hidden_test_cases": [
            {"input": "7", "expected_output": "YES"},
            {"input": "10", "expected_output": "NO"},
            {"input": "929", "expected_output": "YES"},
            {"input": "1", "expected_output": "NO"},
            {"input": "383", "expected_output": "YES"},
        ],
    },
    {
        "id": 5,
        "problem_number": 5,
        "title": "Longest Substring Without Repeating Characters",
        "topic": "Algorithmic Thinking",
        "difficulty": "Hard",
        "points": 30,
        "time_limit": 2.0,
        "memory_limit": 256,
        "description": "Given a string S, find the length of the longest substring without repeating characters.",
        "input_description": "A single line containing the string S.",
        "output_description": "Print an integer representing the maximum length of a substring with all distinct characters.",
        "sample_input": "abcabcbb",
        "sample_output": "3",
        "starter_code": """# Problem 5: Longest Substring Without Repeating Characters
def longest_unique_substring(s):
    # TODO: return the length of the longest substring of s
    # that contains no repeating characters
    pass

s = input().strip()
print(longest_unique_substring(s))
""",
        "sample_test_cases": [
            {"input": "abcabcbb", "expected_output": "3"},
            {"input": "bbbbb", "expected_output": "1"},
            {"input": "pwwkew", "expected_output": "3"},
        ],
        "hidden_test_cases": [
            {"input": "", "expected_output": "0"},
            {"input": "au", "expected_output": "2"},
            {"input": "dvdf", "expected_output": "3"},
            {"input": "anviaj", "expected_output": "5"},
            {"input": "tmmzuxt", "expected_output": "5"},
        ],
    },
]


def get_public_problems() -> List[Dict[str, Any]]:
    """
    Returns public problem metadata.
    MUST NEVER EXPOSE HIDDEN TEST CASES.
    """
    public_list = []
    for prob in PROBLEMS_DATA:
        public_list.append({
            "id": prob["id"],
            "problem_number": prob["problem_number"],
            "title": prob["title"],
            "topic": prob["topic"],
            "difficulty": prob["difficulty"],
            "points": prob["points"],
            "time_limit": prob["time_limit"],
            "memory_limit": prob["memory_limit"],
            "description": prob["description"],
            "input_description": prob["input_description"],
            "output_description": prob["output_description"],
            "sample_input": prob["sample_input"],
            "sample_output": prob["sample_output"],
            "starter_code": prob["starter_code"],
        })
    return public_list


def get_problem_by_id(problem_id: int) -> Optional[Dict[str, Any]]:
    for prob in PROBLEMS_DATA:
        if prob["id"] == problem_id:
            return prob
    return None