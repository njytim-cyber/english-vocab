import re
import os

filepath = os.path.join(os.path.dirname(__file__), '../sample-questions/sample-questions.json')

with open(filepath, 'r') as f:
    content = f.read()

# Regex to find the list
match = re.search(r'original_questions_data\s*=\s*(\[\s*\{.*\}\s*\])', content, re.DOTALL)

if match:
    json_content = match.group(1)
    with open(filepath, 'w') as f:
        f.write(json_content)
    print("Successfully cleaned sample-questions.json")
else:
    print("Could not find original_questions_data list")
