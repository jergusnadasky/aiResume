# -------- CONFIG --------
FRONTEND_DIR=resume-ui
BACKEND_DIR=backend
BACKEND_APP=app.main:app
BACKEND_PORT=8000
OLLAMA_MODEL=llama3

# -------- PHONY --------
.PHONY: all frontend backend ai clean


# -------- FRONTEND --------
frontend:
	cd $(FRONTEND_DIR) && npm install && npm run dev

# -------- BACKEND --------
backend:
	cd $(BACKEND_DIR) && pip install -r requirements.txt && \
	uvicorn $(BACKEND_APP) --host 0.0.0.0 --port $(BACKEND_PORT) --reload

# -------- AI (OLLAMA) --------
ai:
	ollama pull $(OLLAMA_MODEL)
	ollama serve

# -------- CLEAN --------
clean:
	rm -rf backend/app/**/__pycache__
	rm -rf resume-ui/node_modules
