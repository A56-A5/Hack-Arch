import os

PROJECT_ROOT = "./vuln_app"

def build_context():
    code = ""

    for root, _, files in os.walk(PROJECT_ROOT):
        for f in files:
            if f.endswith(".py"):
                path = os.path.join(root, f)

                try:
                    with open(path, "r", encoding="utf-8") as file:
                        code += f"\n# FILE: {path}\n" + file.read()
                except:
                    continue

    return code


if __name__ == "__main__":
    print(build_context())