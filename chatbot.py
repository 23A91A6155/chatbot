"""
Offline Customer Support Chatbot using Ollama and Llama 3.2 (3B)

This script connects to a locally running Ollama instance to generate
customer support responses using both Zero-shot and One-shot prompting
strategies. Results are saved to eval/results.md for comparison.
"""

import requests
import json
import os

# ============================================================
# Constants
# ============================================================
OLLAMA_ENDPOINT = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:3b"


# ============================================================
# Function: query_ollama
# ============================================================
def query_ollama(prompt):
    """
    Sends a prompt to the Ollama API and returns the response text.

    Args:
        prompt (str): The full prompt string to send to the model.

    Returns:
        str: The generated response text from the model.
    """
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_ENDPOINT, json=payload)
        response.raise_for_status()
        result = response.json()
        return result["response"]
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to Ollama. Make sure Ollama is running on localhost:11434.")
        return "[Connection Error: Ollama is not running]"
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Request failed: {e}")
        return f"[Request Error: {e}]"
    except (KeyError, json.JSONDecodeError) as e:
        print(f"ERROR: Failed to parse response: {e}")
        return f"[Parse Error: {e}]"


# ============================================================
# Load Prompt Templates
# ============================================================
def load_template(filepath):
    """Load a prompt template from a text file."""
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


# Get the directory where chatbot.py is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

zero_shot_template = load_template(os.path.join(SCRIPT_DIR, "prompts", "zero_shot_template.txt"))
one_shot_template = load_template(os.path.join(SCRIPT_DIR, "prompts", "one_shot_template.txt"))


# ============================================================
# E-Commerce Customer Queries (20 queries)
# Adapted from technical support style → e-commerce support style
# ============================================================
queries = [
    # Technical: "My system won't boot after the latest update"
    "My order status hasn't updated after the payment was confirmed two days ago",

    # Technical: "I'm getting a blue screen error on startup"
    "I keep getting an error message when trying to apply a discount code at checkout",

    # Technical: "My Wi-Fi connection keeps dropping"
    "My tracking information keeps showing the same location for the past five days",

    # Technical: "The software crashes every time I open a specific file"
    "The app crashes every time I try to view my order history",

    # Technical: "I can't install the latest driver for my graphics card"
    "I can't add items to my wishlist — the button doesn't seem to work",

    # Technical: "My printer is not being recognized by the computer"
    "My coupon code is not being recognized at checkout even though it hasn't expired",

    # Technical: "How do I recover deleted files from my hard drive?"
    "How do I recover a cancelled order and place it again?",

    # Technical: "My external hard drive is not showing up"
    "My refund hasn't shown up in my bank account after 10 business days",

    # Technical: "The touchscreen on my laptop is not responding"
    "The 'Place Order' button on the checkout page is not responding when I click it",

    # Technical: "I forgot my administrator password"
    "I forgot my account password and the reset email never arrives",

    # Technical: "My antivirus software keeps blocking a safe program"
    "My payment keeps getting declined even though my card details are correct",

    # Technical: "How do I set up dual monitors on Windows?"
    "How do I set up automatic monthly reorders for my regular purchases?",

    # Technical: "My laptop battery drains very quickly"
    "My loyalty points balance dropped unexpectedly without any redemption",

    # Technical: "The sound on my computer suddenly stopped working"
    "The email notifications for my orders suddenly stopped working",

    # Technical: "How do I transfer data from my old phone to my new one?"
    "How do I transfer my account and order history to a new email address?",

    # Technical: "My USB port is not working properly"
    "My gift card balance is not loading properly on the payment page",

    # Technical: "I'm getting spam emails and I don't know how to stop them"
    "I'm getting spam promotional emails and I don't know how to unsubscribe",

    # Technical: "My computer is running very slow after a recent update"
    "The website is running very slow and pages take forever to load after the recent update",

    # Technical: "I accidentally uninstalled an important program"
    "I accidentally removed an item from my cart and now it shows as out of stock",

    # Technical: "How do I set up a VPN on my home network?"
    "How do I set up address-based delivery preferences for my account?"
]


# ============================================================
# Main Execution: Loop, Query, and Save Results
# ============================================================
def main():
    results = []

    print("=" * 60)
    print("Offline Customer Support Chatbot")
    print(f"Model: {MODEL_NAME}")
    print(f"Endpoint: {OLLAMA_ENDPOINT}")
    print(f"Total Queries: {len(queries)}")
    print("=" * 60)

    for idx, query in enumerate(queries, start=1):
        print(f"\n[{idx}/{len(queries)}] Processing: {query[:60]}...")

        # --- Zero-Shot Response ---
        zero_shot_prompt = zero_shot_template.replace("{query}", query)
        print(f"  → Generating Zero-Shot response...")
        zero_shot_response = query_ollama(zero_shot_prompt)

        # --- One-Shot Response ---
        one_shot_prompt = one_shot_template.replace("{query}", query)
        print(f"  → Generating One-Shot response...")
        one_shot_response = query_ollama(one_shot_prompt)

        # Clean responses for markdown table (replace newlines and pipes)
        zero_clean = zero_shot_response.strip().replace("\n", " ").replace("|", "\\|")
        one_clean = one_shot_response.strip().replace("\n", " ").replace("|", "\\|")

        results.append({
            "num": idx,
            "query": query,
            "zero_shot": zero_clean,
            "one_shot": one_clean
        })

        print(f"  ✓ Done.")

    # ============================================================
    # Save Results to eval/results.md
    # ============================================================
    eval_dir = os.path.join(SCRIPT_DIR, "eval")
    os.makedirs(eval_dir, exist_ok=True)
    results_path = os.path.join(eval_dir, "results.md")

    print(f"\nSaving results to {results_path}...")

    with open(results_path, "w", encoding="utf-8") as f:
        f.write("# Evaluation Results: Zero-Shot vs One-Shot Prompting\n\n")
        f.write(f"**Model:** {MODEL_NAME}  \n")
        f.write(f"**Total Queries:** {len(queries)}  \n")
        f.write(f"**Total Rows:** {len(queries) * 2} (2 methods × {len(queries)} queries)  \n\n")

        f.write("| Query # | Customer Query | Prompting Method | Response | Relevance (1-5) | Coherence (1-5) | Helpfulness (1-5) |\n")
        f.write("|---------|---------------|-----------------|----------|-----------------|-----------------|-------------------|\n")

        for r in results:
            # Zero-Shot row
            f.write(f"| {r['num']} | {r['query']} | Zero-Shot | {r['zero_shot']} | - | - | - |\n")
            # One-Shot row
            f.write(f"| {r['num']} | {r['query']} | One-Shot | {r['one_shot']} | - | - | - |\n")

    print(f"\n{'=' * 60}")
    print(f"Results saved to: {results_path}")
    print(f"Total entries: {len(results) * 2} (Zero-Shot + One-Shot for each query)")
    print(f"{'=' * 60}")
    print("\nDone! Open eval/results.md to review the results.")


if __name__ == "__main__":
    main()
