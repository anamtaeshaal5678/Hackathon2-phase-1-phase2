import os
import ast
import sys

def get_imports(path):
    with open(path, 'r', encoding='utf-8') as f:
        try:
            tree = ast.parse(f.read())
        except:
            return set()
            
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for name in node.names:
                imports.add(name.name.split('.')[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module.split('.')[0])
    return imports

def main():
    all_imports = set()
    for root, dirs, files in os.walk("."):
        for file in files:
            if file.endswith(".py") and "venv" not in root:
                path = os.path.join(root, file)
                all_imports.update(get_imports(path))
    
    print("Detected Imports:")
    for imp in sorted(all_imports):
        print(f"- {imp}")

if __name__ == "__main__":
    main()
