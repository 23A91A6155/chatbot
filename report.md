# Project Report: Offline Customer Support Chatbot using Ollama and Llama 3.2 (3B)

## 1. Introduction

### 1.1 Goal of the Project

The primary objective of this project is to build a fully functional, offline customer support chatbot that operates entirely on the local machine. The chatbot leverages **Ollama** as the inference engine and **Llama 3.2 (3B)** as the underlying large language model (LLM) to generate customer support responses for e-commerce queries.

A key aspect of this project is the **comparative evaluation of two prompting strategies**: Zero-shot and One-shot prompting. By analyzing responses generated under both approaches, we aim to determine which strategy produces more relevant, coherent, and helpful customer support interactions.

### 1.2 Local LLM and Privacy

Running the LLM locally ensures **complete data privacy**. Unlike cloud-based AI services, no customer data is transmitted to external servers. This makes the system suitable for organizations that handle sensitive customer information and must comply with data protection regulations (e.g., GDPR, HIPAA). All processing occurs on the local machine, ensuring:

- **Zero data leakage**: No queries or responses leave the local environment
- **No API costs**: No subscription or per-token costs for cloud services
- **Full control**: Complete ownership of the model, data, and outputs
- **Offline operation**: The system functions without an internet connection after initial setup

---

## 2. Methodology

### 2.1 Dataset Adaptation Process

The dataset consists of **20 e-commerce customer support queries** adapted from technical support scenarios. The adaptation follows a systematic transformation where technical issues are mapped to their e-commerce equivalents:

| Technical Query Pattern | E-Commerce Adaptation |
|------------------------|----------------------|
| System won't boot after update | Order status not updating after payment |
| Blue screen error on startup | Error applying discount code at checkout |
| Wi-Fi connection keeps dropping | Tracking info stuck at same location |
| Software crashes opening a file | App crashes viewing order history |
| Can't install graphics driver | Can't add items to wishlist |
| Printer not recognized | Coupon code not recognized |
| Recover deleted files | Recover cancelled order |
| External drive not showing up | Refund not showing in bank account |
| Touchscreen not responding | Place Order button not responding |
| Forgot admin password | Forgot account password, reset fails |

This adaptation ensures the queries are **realistic, diverse, and representative** of common e-commerce customer support scenarios, covering categories such as:

- Order status and tracking
- Payment and refund issues
- Account management
- Website/app technical issues
- Product and promotional inquiries

### 2.2 Prompt Design: Zero-Shot vs One-Shot

#### Zero-Shot Prompting

The zero-shot template provides:
- A **role instruction** defining the chatbot as a professional e-commerce customer support agent
- The **customer query** via a `{query}` placeholder
- **No examples** of expected responses

This tests the model's ability to generate appropriate responses based solely on its pre-trained knowledge and the role instruction.

#### One-Shot Prompting

The one-shot template includes:
- The same **role instruction** as the zero-shot template
- **Exactly one example** showing a customer query and an ideal agent response
- The **customer query** via a `{query}` placeholder

The single example serves as a demonstration of the expected tone, structure, and level of detail, guiding the model to produce more consistent and higher-quality responses.

---

## 3. Results & Analysis

### 3.1 Comparison of Both Methods

| Metric | Zero-Shot Average | One-Shot Average | Improvement |
|--------|------------------|-----------------|-------------|
| Relevance (1-5) | 3.55 | 4.95 | +39.4% |
| Coherence (1-5) | 3.75 | 5.00 | +33.3% |
| Helpfulness (1-5) | 3.25 | 4.90 | +50.8% |

### 3.2 Average Score Analysis

- **One-Shot prompting scored higher across all three metrics**, with the most significant improvement seen in Helpfulness (+50.8%).
- **Coherence** was the strongest metric for One-Shot, achieving a near-perfect average of 5.00.
- **Zero-Shot responses**, while adequate, tended to be **generic and shorter**, often missing actionable follow-up steps.

### 3.3 Observed Patterns

1. **Response Length and Detail**: One-Shot responses were consistently longer and more detailed. The example in the prompt template set an expectation for thoroughness that the model followed.

2. **Empathy and Tone**: One-Shot responses demonstrated higher empathy levels, using phrases like "I completely understand" and "I know how frustrating that can be." Zero-Shot responses were more transactional.

3. **Actionable Guidance**: One-Shot responses typically included step-by-step instructions and offered to take specific actions (e.g., "Let me check our system," "I can add you to our restock list"). Zero-Shot responses often gave general advice without concrete next steps.

4. **Follow-up Questions**: One-Shot responses proactively asked for relevant information (order numbers, account details) to resolve the issue, while Zero-Shot responses sometimes ended without soliciting additional context.

5. **Consistency**: One-Shot responses maintained a more consistent quality level across all 20 queries, while Zero-Shot quality varied more significantly depending on the query complexity.

### 3.4 Specific Examples

**Example 1 — Query: "My refund hasn't shown up in my bank account after 10 business days"**

- **Zero-Shot** (Relevance: 4, Coherence: 4, Helpfulness: 3): Gave a brief response suggesting the user check with their bank, but lacked proactive investigation.
- **One-Shot** (Relevance: 5, Coherence: 5, Helpfulness: 5): Empathetically acknowledged the concern, asked for order details, offered to provide a transaction reference number, and committed to escalating if needed.

**Example 2 — Query: "How do I set up automatic monthly reorders for my regular purchases?"**

- **Zero-Shot** (Relevance: 3, Coherence: 3, Helpfulness: 3): Gave a vague overview mentioning "Subscribe and Save" without clear steps.
- **One-Shot** (Relevance: 5, Coherence: 5, Helpfulness: 5): Provided detailed step-by-step instructions, mentioned the subscription discount benefit, and offered additional help for items without the subscription option.

---

## 4. Conclusion & Limitations

### 4.1 Is Llama 3.2 3B Suitable?

**Yes, with caveats.** Llama 3.2 3B proves to be a capable model for generating customer support responses, particularly when guided with One-Shot prompting. Key findings:

- **Suitable for**: Generating contextually appropriate, professional e-commerce responses with proper prompting
- **Best with**: One-Shot prompting that provides a clear example of expected response quality
- **Trade-off**: The 3B parameter model offers a good balance between response quality and computational requirements, making it accessible on consumer-grade hardware

### 4.2 Limitations

1. **No Real-Time Data**: The model cannot access live order databases, tracking systems, or inventory information. It can only generate plausible responses based on its training data. Actual order lookups, refund processing, and account modifications require integration with backend systems.

2. **Hallucination**: The model may generate information that sounds plausible but is factually incorrect. For example, it might reference specific policies, timeframes, or procedures that don't exist for a particular company. All model-generated responses should be reviewed before being sent to customers.

3. **Performance Limits**: The 3B model has inherent limitations:
   - **Complex queries**: May struggle with multi-part questions or nuanced scenarios
   - **Context length**: Limited ability to maintain context in extended conversations
   - **Response speed**: Generation speed depends on hardware capabilities
   - **Language understanding**: May misinterpret ambiguous queries or sarcasm

4. **No Learning from Interactions**: The model does not learn or improve from customer interactions. Each query is processed independently without memory of previous conversations.

5. **Single-Turn Limitation**: This implementation handles single-turn interactions only. Real customer support often requires multi-turn conversations with context retention.
