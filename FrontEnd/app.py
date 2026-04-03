from flask import Flask, render_template, request, send_from_directory
import torch
from model.handwriting_rnn import HandwritingRNN
from model.generate import generate_strokes
from model.render import render_strokes
from model.pdf_export import export_to_pdf
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/outputs/'

model = HandwritingRNN()
model.load_state_dict(torch.load('handwriting_model.pth', map_location='cpu'))
model.eval()

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        assignment_text = request.form['assignment_text']
        strokes = generate_strokes(model, assignment_text)
        image_filename = render_strokes(strokes, output_dir=os.path.join('app', app.config['UPLOAD_FOLDER']))
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        pdf_filename = export_to_pdf(image_path, output_dir=os.path.join('app', app.config['UPLOAD_FOLDER']))
        return render_template('index.html', image_filename=image_filename, pdf_filename=pdf_filename)
    return render_template('index.html')

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(os.path.join('app', app.config['UPLOAD_FOLDER']), filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)