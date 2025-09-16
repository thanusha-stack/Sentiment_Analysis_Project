# app.py
import os, uuid
from flask import Flask, request, render_template, redirect, url_for, flash
from werkzeug.utils import secure_filename

import prs     # preprocess module
import second     # visualizer module (create_visuals_from_processed_csv + HTML_TEMPLATE)

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
ALLOWED_EXT = {".csv"}

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

app = Flask(__name__)
app.secret_key = "dev-secret"

def allowed(filename):
    _, ext = os.path.splitext(filename)
    return ext.lower() in ALLOWED_EXT

@app.route("/", methods=["GET"])
def index():
    # show upload page (templates/index.html)
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        flash("No file part")
        return redirect(url_for("index"))

    f = request.files["file"]
    if f.filename == "":
        flash("No selected file")
        return redirect(url_for("index"))

    if not allowed(f.filename):
        flash("Only CSV files allowed")
        return redirect(url_for("index"))

    filename = secure_filename(f.filename)
    uid = uuid.uuid4().hex[:8]
    upload_path = os.path.join(UPLOAD_DIR, f"{uid}_{filename}")
    processed_path = os.path.join(PROCESSED_DIR, f"{uid}_processed.csv")

    f.save(upload_path)

    try:
        # 1) Preprocess (first.py)
        prs.preprocess_file(upload_path, processed_path)

        # 2) Visualize (second.py)
        visuals = second.create_visuals_from_processed_csv(processed_path)

        # Render result page using result.html
        return render_template("result.html", visuals=visuals)

    except Exception as e:
        app.logger.exception("Processing failed")
        flash(f"Processing failed: {e}")
        return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)
