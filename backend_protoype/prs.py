# first.py
import pandas as pd
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F
from tqdm import tqdm
import os

# ---------- Config (tweak if needed) ----------
MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment"
DEFAULT_BATCH_SIZE = 32
DEFAULT_MAX_LENGTH = 256
USE_MIXED_PRECISION = True
# ----------------------------------------------

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_tokenizer = None
_model = None

def init_model():
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=True)
        _model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        _model.to(_device)
        _model.eval()
    return _tokenizer, _model

def preprocess_file(input_csv_path: str, output_csv_path: str,
                    batch_size: int = DEFAULT_BATCH_SIZE,
                    max_length: int = DEFAULT_MAX_LENGTH) -> str:
    """
    Read input_csv_path, run sentiment inference, save processed CSV to output_csv_path,
    and return output_csv_path.
    """
    tokenizer, model = init_model()

    df = pd.read_csv(input_csv_path)
    if "content" not in df.columns:
        raise ValueError("Input CSV must contain a 'content' column")
    df["content"] = df["content"].fillna("").astype(str)

    idx2label = {0: "negative", 1: "neutral", 2: "positive"}
    texts = df["content"].tolist()

    all_probs = []
    for i in tqdm(range(0, len(texts), batch_size), desc="Inference batches"):
        batch_texts = texts[i : i + batch_size]
        enc = tokenizer(
            batch_texts,
            padding=True,
            truncation=True,
            max_length=max_length,
            return_tensors="pt",
        )
        # move tensors to device
        enc = {k: v.to(_device) for k, v in enc.items()}

        with torch.no_grad():
            if USE_MIXED_PRECISION and _device.type == "cuda":
                # new recommended API
                with torch.amp.autocast(device_type="cuda"):
                    outputs = model(**enc)
            else:
                outputs = model(**enc)
            logits = outputs.logits
            probs = F.softmax(logits, dim=1).cpu().numpy()
            all_probs.append(probs)

    probs_np = np.vstack(all_probs) if len(all_probs) else np.zeros((len(texts), 3))

    df["prob_negative"] = probs_np[:, 0]
    df["prob_neutral"]  = probs_np[:, 1]
    df["prob_positive"] = probs_np[:, 2]
    df["sentiment"] = [idx2label[int(i)] for i in probs_np.argmax(axis=1)]
    df["sentiment_confidence"] = probs_np.max(axis=1)

    os.makedirs(os.path.dirname(output_csv_path) or ".", exist_ok=True)
    df.to_csv(output_csv_path, index=False)
    return output_csv_path

# CLI support: can run first.py directly
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", "-i", required=True)
    parser.add_argument("--output", "-o", default="processed/dropbox_with_sentiment.csv")
    parser.add_argument("--batch_size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--max_length", type=int, default=DEFAULT_MAX_LENGTH)
    args = parser.parse_args()
    print("Using device:", _device)
    out = preprocess_file(args.input, args.output, args.batch_size, args.max_length)
    print("Saved:", out)
