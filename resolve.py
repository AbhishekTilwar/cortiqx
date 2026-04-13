import os
import re

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Match <<<<<<< HEAD ... ======= ... >>>>>>> ...
        pattern = re.compile(r'<<<<<<< HEAD\r?\n(.*?)(?=======\r?\n)=======\r?\n.*?>>>>>>> .*?(?:\r?\n|$)', re.DOTALL)
        
        new_content, num_replacements = pattern.subn(r'\1', content)
        
        if num_replacements > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
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
