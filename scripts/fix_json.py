import os

filepath = os.path.join(os.path.dirname(__file__), '../sample-questions/sample-questions.json')

with open(filepath, 'r') as f:
    lines = f.readlines()

# Find the line with just "]" that closes the main list
cut_index = -1
for i, line in enumerate(lines):
    if line.strip() == "]":
        # Check if it's around line 422 (based on previous view)
        # and followed by python comments
        if i > 400:
            cut_index = i
            break

if cut_index != -1:
    lines = lines[:cut_index+1]
    with open(filepath, 'w') as f:
        f.writelines(lines)
    print(f"Truncated file at line {cut_index+1}")
else:
    print("Could not find cut point")
