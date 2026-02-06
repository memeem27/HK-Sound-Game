import json

with open("list.txt", "r", encoding="utf-8") as f:
    files = [line.strip() for line in f if line.strip()]

with open("list.json", "w", encoding="utf-8") as f:
    json.dump(files, f, indent=2)

print("list.json created with", len(files), "entries.")
