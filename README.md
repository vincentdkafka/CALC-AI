# 🧠 AI Calculator – Apple-Inspired Smart Math Assistant

An intelligent calculator powered by Python and TypeScript, inspired by the sleek design and functionality of Apple’s AI calculator. It does more than crunch numbers — it *understands* math problems presented in natural language or image format and solves them with precision.

---

## 🚀 Features


- 💬 **Natural Language Understanding**: Type questions like “What’s the derivative of x²?” and get instant answers.
- 🧮 **Symbolic & Numeric Computation**: Handles both algebraic and numerical problems.
- 📉 **Beautiful Output**: Uses MathJax to render math expressions in a clean, elegant way.
- 🖌️ **Canvas Drawing Support**: Draw problems on a canvas, and it recognizes and solves them.
- ⚡ **Real-Time Results**: Fast computation with responsive frontend interactions.
  

---

## 🧰 Tech Stack

| Layer        | Tools & Libraries                        |
|--------------|------------------------------------------|
| **Frontend** | React, TypeScript, TailwindCSS, MathJax  |
| **Backend**  | Python (FastAPI or Flask), SymPy, Tesseract OCR |
| **AI/ML**    | OpenCV, EasyOCR, scikit-learn (optional) |
| **Other**    | Axios, Canvas API, Vite (or CRA)         |

---

## 📦 Installation
### Clone the Repo

```bash
git clone https://github.com/yourusername/ai-calculator.git
cd ai-calculator
```

**Backend Setup (Python)**
```
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend Setup (React Typescript)
```
cd frontend
npm install
npm run dev  # or npm start
```

🧪 Sample Use Cases
✏️ Draw a fraction or integral on canvas and get the result.
🌀 It answer in realtime

    
