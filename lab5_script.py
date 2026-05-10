import sys

# Example of a for loop with 'break' and 'continue'
# Using the list of fruits from the previous lab
fruits = ["apple", "banana", "cherry", "date", "elderberry"]

print("Example 1: Using 'continue' to skip 'cherry'")
for fruit in fruits:
    if fruit == "cherry":
        print("Skipping cherry...")
        continue
    print(f"I like {fruit}")

print("\nExample 2: Using 'break' to stop at 'date'")
for fruit in fruits:
    if fruit == "date":
        print("Reached date. Stopping the loop.")
        break
    print(f"Current fruit: {fruit}")
