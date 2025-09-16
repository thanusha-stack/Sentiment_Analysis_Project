# app.py
from flask import Flask, request, render_template_string
import pandas as pd
import matplotlib
matplotlib.use("Agg")   # use non-interactive backend for server
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud, STOPWORDS
import io, base64

app = Flask(__name__)

# --- Helper functions to create images and return base64 strings ---
def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png", dpi=150)
    buf.seek(0)
    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    plt.close(fig)
    return img_b64

def make_bar_chart(sent_counts):
    # Ensure ordering: positive, neutral, negative (if present)
    order = ['positive', 'neutral', 'negative']
    counts = [sent_counts.get(k, 0) for k in order]
    labels = ['Positive', 'Neutral', 'Negative']

    fig, ax = plt.subplots(figsize=(7,4))
    sns.barplot(x=labels, y=counts, palette=['#2ecc71', '#95a5a6', '#e74c3c'], edgecolor="black", ax=ax)
    ax.set_title("Sentiment Distribution (Bar Chart)")
    ax.set_xlabel("Sentiment")
    ax.set_ylabel("Number of Comments")
    for i, v in enumerate(counts):
        ax.text(i, v + max(counts)*0.01, str(v), ha='center', va='bottom')
    return fig

def make_pie_chart(sent_counts):
    # Match same ordering/colors as bar chart
    labels_map = {'positive': 'Positive', 'neutral': 'Neutral', 'negative': 'Negative'}
    order = ['positive', 'neutral', 'negative']
    counts = [sent_counts.get(k, 0) for k in order]
    labels = [labels_map[k] for k in order]
    colors = ['#2ecc71', '#95a5a6', '#e74c3c']  # green, grey, red
    explode = tuple(0.05 if c > 0 else 0 for c in counts)  # only explode non-zero slices

    fig, ax = plt.subplots(figsize=(6,6))
    wedges, texts, autotexts = ax.pie(
        counts,
        labels=labels,
        autopct=lambda p: ('{:.1f}%'.format(p) if p > 0 else ''),
        startangle=90,
        colors=colors,
        shadow=True,
        explode=explode,
        pctdistance=0.75
    )
    ax.set_title("Sentiment Distribution (Pie Chart)")
    # slightly increase font size for pct texts
    for t in autotexts:
        t.set_fontsize(10)
    return fig

def make_wordcloud(text):
    wc = WordCloud(
        width=900,
        height=400,
        background_color='white',
        stopwords=set(STOPWORDS),
        collocations=False
    ).generate(text if text.strip() else "no comments")
    fig, ax = plt.subplots(figsize=(12,5))
    ax.imshow(wc, interpolation='bilinear')
    ax.axis('off')
    ax.set_title("Word Cloud of Comments")
    return fig

# --- Simple HTML template (can be replaced by frontend later) ---
HTML_TEMPLATE = """
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sentiment Visualizer</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; background:#f7f9fb; color:#222; }
    .container { max-width:1000px; margin:auto; background:white; padding:20px; border-radius:8px; box-shadow:0 4px 18px rgba(0,0,0,0.08); }
    h1 { margin-top:0; }
    .row { display:flex; gap:20px; flex-wrap:wrap; }
    .card { flex:1 1 300px; padding:10px; border-radius:6px; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.04); text-align:center; }
    img { max-width:100%; height:auto; border-radius:4px; }
    .form { margin-bottom:15px; }
    label { display:block; margin-bottom:6px; font-weight:600; }
    input[type=file] { padding:6px; }
    input[type=submit] { padding:10px 16px; border-radius:6px; background:#2b7cff; color:white; border:none; cursor:pointer; }
    .note { font-size:0.9rem; color:#555; margin-top:8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sentiment Visualizer (Backend Prototype)</h1>
    <p>Upload a processed CSV (<strong>content</strong> and <strong>sentiment</strong> columns required). If no file is uploaded, server will try <code>dropbox_with_sentiment.csv</code>.</p>

    <form method="post" enctype="multipart/form-data" class="form">
      <label for="file">Choose CSV file (optional):</label>
      <input type="file" name="file" accept=".csv">
      <div style="margin-top:12px;">
        <input type="submit" value="Generate Visuals">
      </div>
    </form>

    {% if error %}
      <div style="color:#b00020; font-weight:700;">Error: {{ error }}</div>
    {% endif %}

    {% if bar_img %}
      <div class="row" style="margin-top:18px;">
        <div class="card">
          <h3>Bar Chart</h3>
          <img src="data:image/png;base64,{{ bar_img }}" alt="bar chart">
        </div>
        <div class="card">
          <h3>Pie Chart</h3>
          <img src="data:image/png;base64,{{ pie_img }}" alt="pie chart">
        </div>
      </div>

      <div class="row" style="margin-top:18px;">
        <div class="card" style="flex:1 1 100%;">
          <h3>Word Cloud</h3>
          <img src="data:image/png;base64,{{ wc_img }}" alt="word cloud">
        </div>
      </div>
    {% endif %}

    <div class="note">
      <strong>Note:</strong> This backend returns images as base64 embedded PNGs. Your frontend teammate can call the same endpoint (POST with file) and use the returned images or swap the HTML for a React UI that fetches the images as JSON.
    </div>
  </div>
</body>
</html>
"""

# --- Routes ---
@app.route("/", methods=["GET", "POST"])
def index():
    error = None
    bar_img = pie_img = wc_img = None

    if request.method == "POST":
        # If a file was uploaded, use it; otherwise fallback to default file
        uploaded = request.files.get("file", None)
        try:
            if uploaded and uploaded.filename:
                df = pd.read_csv(uploaded)
            else:
                df = pd.read_csv("dropbox_with_sentiment.csv")
        except Exception as e:
            error = f"Failed to read CSV: {e}"
            return render_template_string(HTML_TEMPLATE, error=error)

        # basic validation: ensure required columns exist
        cols = set([c.lower() for c in df.columns])
        # make column names lowercase for safety, but keep original df for content
        if 'content' not in cols or 'sentiment' not in cols:
            error = "CSV must contain 'content' and 'sentiment' columns (case-insensitive)."
            return render_template_string(HTML_TEMPLATE, error=error)

        # normalize column access (case-insensitive)
        # find actual column names
        content_col = next(c for c in df.columns if c.lower() == 'content')
        sentiment_col = next(c for c in df.columns if c.lower() == 'sentiment')

        # normalize sentiment values to lowercase strings
        df[sentiment_col] = df[sentiment_col].astype(str).str.lower().str.strip()
        # compute counts
        sent_counts = df[sentiment_col].value_counts().to_dict()

        # create bar chart
        bar_fig = make_bar_chart(sent_counts)
        bar_img = fig_to_base64(bar_fig)

        # create pie chart
        pie_fig = make_pie_chart(sent_counts)
        pie_img = fig_to_base64(pie_fig)

        # create word cloud from content column
        text = " ".join(df[content_col].fillna("").astype(str).tolist())
        wc_fig = make_wordcloud(text)
        wc_img = fig_to_base64(wc_fig)

        return render_template_string(HTML_TEMPLATE, bar_img=bar_img, pie_img=pie_img, wc_img=wc_img)

    # GET
    return render_template_string(HTML_TEMPLATE)

if __name__ == "__main__":
    app.run(debug=True)
