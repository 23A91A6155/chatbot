# Offline Customer Support Chatbot using Ollama and Llama 3.2 (3B)

A fully functional, privacy-first customer support chatbot that runs entirely on your local machine. It uses **Ollama** with the **Llama 3.2 (3B)** model to generate e-commerce customer support responses and evaluates **Zero-shot vs One-shot prompting** strategies.

---

## Features

- **100% Offline**: Runs locally with no external API calls — complete data privacy
- **Dual Prompting Strategies**: Compares Zero-Shot and One-Shot prompting approaches
- **20 Realistic Queries**: E-commerce queries adapted from technical support patterns
- **Automated Evaluation**: Generates a structured results table with quality scores
- **Clean Architecture**: Modular code with separated prompts, evaluation, and documentation

---

## Folder Structure

```
chatbot/
├── README.md                        # Project overview (this file)
├── setup.md                         # Installation and setup instructions
├── chatbot.py                       # Main chatbot script
├── report.md                        # Detailed analysis and findings report
├── prompts/                         # Prompt templates directory
│   ├── zero_shot_template.txt       # Zero-shot prompt (no examples)
│   └── one_shot_template.txt        # One-shot prompt (1 example)
└── eval/                            # Evaluation results directory
    └── results.md                   # Results table with scores
```

---

## How to Run

### 1. Install Ollama

Download and install from [https://ollama.com](https://ollama.com), then pull the model:

```bash
ollama pull llama3.2:3b
```

### 2. Set Up Python Environment

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install requests
```

### 3. Run the Chatbot

```bash
python chatbot.py
```

The script will process all 20 queries with both prompting methods and save results to `eval/results.md`.

> For detailed setup instructions, see [setup.md](setup.md).

---

## Example Output

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

============================================================
Results saved to: eval/results.md
Total entries: 40 (Zero-Shot + One-Shot for each query)
============================================================
```

---

## Key Results (Summary)

| Metric | Zero-Shot Avg | One-Shot Avg | Improvement |
|--------|--------------|-------------|-------------|
| Relevance | 3.55 | 4.95 | +39.4% |
| Coherence | 3.75 | 5.00 | +33.3% |
| Helpfulness | 3.25 | 4.90 | +50.8% |

> One-Shot prompting significantly outperforms Zero-Shot across all evaluation metrics. See [report.md](report.md) for the full analysis.

---

## Technologies Used

- **Python 3.8+** — Core programming language
- **Ollama** — Local LLM inference engine
- **Llama 3.2 (3B)** — Large language model
- **requests** — HTTP library for API communication
