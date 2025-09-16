# second.py  -- visualization module (no Flask server on import)

import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud, STOPWORDS
import io, base64
import os

def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png", dpi=150)
    buf.seek(0)
    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    plt.close(fig)
    return img_b64

def make_bar_chart(sent_counts):
    order = ['positive', 'neutral', 'negative']
    counts = [sent_counts.get(k, 0) for k in order]
    labels = ['Positive', 'Neutral', 'Negative']

    fig, ax = plt.subplots(figsize=(7,4))
    sns.barplot(x=labels, y=counts, palette=['#2ecc71', '#95a5a6', '#e74c3c'], edgecolor="black", ax=ax)
    ax.set_title("Sentiment Distribution (Bar Chart)")
    ax.set_xlabel("Sentiment")
    ax.set_ylabel("Number of Comments")
    for i, v in enumerate(counts):
        ax.text(i, v + max(1, max(counts)*0.01), str(v), ha='center', va='bottom')
    return fig

def make_pie_chart(sent_counts):
    labels_map = {'positive': 'Positive', 'neutral': 'Neutral', 'negative': 'Negative'}
    order = ['positive', 'neutral', 'negative']
    counts = [sent_counts.get(k, 0) for k in order]
    labels = [labels_map[k] for k in order]
    colors = ['#2ecc71', '#95a5a6', '#e74c3c']
    explode = tuple(0.05 if c > 0 else 0 for c in counts)

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

def create_visuals_from_processed_csv(processed_csv_path: str) -> dict:
    """
    Read processed CSV and return a dict with base64 PNG strings and optional summary.
    Required columns (case-insensitive): 'content' and 'sentiment'
    """
    if not os.path.exists(processed_csv_path):
        raise FileNotFoundError(f"Processed CSV not found: {processed_csv_path}")

    df = pd.read_csv(processed_csv_path)
    cols_map = {c.lower(): c for c in df.columns}
    if "content" not in cols_map or "sentiment" not in cols_map:
        raise ValueError("Processed CSV must contain 'content' and 'sentiment' columns (case-insensitive).")

    content_col = cols_map["content"]
    sentiment_col = cols_map["sentiment"]

    df[sentiment_col] = df[sentiment_col].astype(str).str.lower().str.strip()
    sent_counts = df[sentiment_col].value_counts().to_dict()

    bar_fig = make_bar_chart(sent_counts)
    pie_fig = make_pie_chart(sent_counts)
    text = " ".join(df[content_col].fillna("").astype(str).tolist())
    wc_fig = make_wordcloud(text)

    return {
        "bar_png_b64": fig_to_base64(bar_fig),
        "pie_png_b64": fig_to_base64(pie_fig),
        "wordcloud_png_b64": fig_to_base64(wc_fig),
        "summary": ""  # hook for summarizer if you want to add
    }

# Optional: allow quick local test when running second.py directly
if __name__ == "__main__":
    sample = "dropbox_with_sentiment.csv"
    if os.path.exists(sample):
        visuals = create_visuals_from_processed_csv(sample)
        print("Generated visuals from", sample)
        # write outputs for manual checking (optional)
        with open("debug_bar.b64.txt", "w") as f:
            f.write(visuals["bar_png_b64"][:200])  # partial b64 preview
    else:
        print("Place a 'dropbox_with_sentiment.csv' in this folder to test.")
