
import sys
from weasyprint import HTML

def generate_pdf(html_content, output_path):
    HTML(string=html_content).write_pdf(output_path)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_pdf.py <html_content> <output_path>")
        sys.exit(1)
    
    html_input = sys.argv[1]
    output_file = sys.argv[2]
    generate_pdf(html_input, output_file)
