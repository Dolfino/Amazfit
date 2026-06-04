#!/bin/bash

# Define paths
WORKSPACE_DIR="/home/dns/Desenvolvimento/Amazfit"
BACKEND_DIR="$WORKSPACE_DIR/app/backend"
FRONTEND_DIR="$WORKSPACE_DIR/app/frontend"
VENV_PYTHON="/home/dns/Desenvolvimento/Fit/.venv/bin/python"

echo "🚀 Iniciando o FITParse Analyzer localmente..."

# 1. Start Backend
echo "📡 Iniciando o Backend FastAPI (porta 8000)..."
if [ ! -f "$VENV_PYTHON" ]; then
    echo "⚠️  Virtualenv não encontrado em $VENV_PYTHON."
    echo "Tentando usar o python3 local..."
    VENV_PYTHON="python3"
fi

cd "$BACKEND_DIR" || exit 1
$VENV_PYTHON main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$WORKSPACE_DIR/.backend.pid"
echo "✅ Backend iniciado com PID $BACKEND_PID. Logs em app/backend/backend.log"

# 2. Start Frontend
echo "💻 Iniciando o Frontend React (Vite)..."
cd "$FRONTEND_DIR" || exit 1
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$WORKSPACE_DIR/.frontend.pid"
echo "✅ Frontend iniciado com PID $FRONTEND_PID. Logs em app/frontend/frontend.log"

echo ""
echo "🎉 Aplicação iniciada com sucesso!"
echo "👉 Backend: http://localhost:8000"
echo "👉 Frontend: http://localhost:5173"
echo "👉 Para monitorar os logs do frontend: tail -f app/frontend/frontend.log"
echo "👉 Para monitorar os logs do backend: tail -f app/backend/backend.log"
echo "👉 Para parar a aplicação, execute: ./stop.sh"
