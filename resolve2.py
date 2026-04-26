import os

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        new_lines = []
        state = "NORMAL"
        changed = False

        for line in lines:
            if line.startswith("<<<<<<< HEAD"):
                state = "IN_HEAD"
                changed = True
            elif line.startswith("======="):
                state = "IN_THEIRS"
                changed = True
            elif line.startswith(">>>>>>>"):
                state = "NORMAL"
                changed = True
            else:
                if state == "NORMAL" or state == "IN_HEAD":
                    new_lines.append(line)
        
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"Resolved: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def walk(dir_path):
    for root, dirs, files in os.walk(dir_path):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md', '.txt')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    walk(os.getcwd())
