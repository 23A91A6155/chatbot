# Setup Guide: Offline Customer Support Chatbot

This guide walks you through setting up and running the Offline Customer Support Chatbot on your local machine.

---

## Prerequisites

- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: 3.8 or higher
- **RAM**: At least 8 GB (16 GB recommended for smooth performance)
- **Disk Space**: At least 5 GB free for the Llama 3.2 3B model

---

## Step 1: Install Ollama

### Windows

1. Visit the official Ollama website: [https://ollama.com/download](https://ollama.com/download)
2. Download the Windows installer
3. Run the installer and follow the on-screen instructions
4. After installation, Ollama will run as a background service

### macOS

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Verify Installation

```bash
ollama --version
```

---

## Step 2: Pull the Llama 3.2 3B Model

Open a terminal/command prompt and run:

```bash
ollama pull llama3.2:3b
```

This will download the Llama 3.2 3B model (~2 GB). Wait for the download to complete.

---

## Step 3: Run the Model

Start the model to verify it works:

```bash
ollama run llama3.2:3b
```

Type a test message (e.g., "Hello") and press Enter. If you get a response, the model is working correctly. Type `/bye` to exit.

> **Note**: You don't need to keep `ollama run` active. The `ollama serve` background process (which starts automatically) is sufficient for the chatbot script to connect via the API.

---

## Step 4: Set Up Python Virtual Environment

Navigate to the project directory and create a virtual environment:

```bash
# Navigate to the project directory
cd chatbot

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

---

## Step 5: Install Python Dependencies

With the virtual environment activated, install the required packages:

```bash
pip install requests
```

> **Note**: The `json` and `os` modules are part of Python's standard library and do not require installation.

---

## Step 6: Run the Chatbot

Make sure Ollama is running in the background (`ollama serve` or the Ollama desktop app), then execute:

```bash
python chatbot.py
```

### What Happens When You Run It

1. The script loads both prompt templates from the `prompts/` directory
2. It iterates through all 20 e-commerce customer queries
3. For each query, it generates:
   - A Zero-Shot response (using the template without examples)
   - A One-Shot response (using the template with one example)
4. Progress is printed to the console
5. All results are saved to `eval/results.md`

### Expected Output

```
============================================================
Offline Customer Support Chatbot
Model: llama3.2:3b
Endpoint: http://localhost:11434/api/generate
Total Queries: 20
============================================================

[1/20] Processing: My order status hasn't updated after the payment was co...
  → Generating Zero-Shot response...
  → Generating One-Shot response...
  ✓ Done.

[2/20] Processing: I keep getting an error message when trying to apply a ...
  → Generating Zero-Shot response...
  → Generating One-Shot response...
  ✓ Done.
...
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ConnectionError: Could not connect to Ollama` | Make sure Ollama is running: `ollama serve` |
| `Model not found` | Pull the model first: `ollama pull llama3.2:3b` |
| `pip not found` | Make sure your virtual environment is activated |
| Slow responses | This is normal for the 3B model on CPU. GPU acceleration significantly helps. |
