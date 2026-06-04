#!/bin/bash

WORKSPACE_DIR="/home/dns/Desenvolvimento/Amazfit"
BACKEND_PID_FILE="$WORKSPACE_DIR/.backend.pid"
FRONTEND_PID_FILE="$WORKSPACE_DIR/.frontend.pid"

echo "🛑 Parando o FITParse Analyzer..."

# 1. Stop Frontend
if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Parando Frontend (PID $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "✅ Frontend parado."
    else
        echo "⚠️  Processo do Frontend ($FRONTEND_PID) não está rodando."
    fi
    rm "$FRONTEND_PID_FILE"
else
    echo "⚠️  Arquivo de PID do Frontend não encontrado."
fi

# 2. Stop Backend
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Parando Backend (PID $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "✅ Backend parado."
    else
        echo "⚠️  Processo do Backend ($BACKEND_PID) não está rodando."
    fi
    rm "$BACKEND_PID_FILE"
else
    echo "⚠️  Arquivo de PID do Backend não encontrado."
fi

# 3. Port cleanup double check
echo "Verificando portas..."
PORT_8000_PID=$(lsof -t -i:8000 2>/dev/null)
if [ ! -z "$PORT_8000_PID" ]; then
    echo "Liberando porta 8000 restante (PID $PORT_8000_PID)..."
    kill -9 $PORT_8000_PID
fi

PORT_5173_PID=$(lsof -t -i:5173 2>/dev/null)
if [ ! -z "$PORT_5173_PID" ]; then
    echo "Liberando porta 5173 restante (PID $PORT_5173_PID)..."
    kill -9 $PORT_5173_PID
fi

echo "✅ Todos os serviços foram finalizados com sucesso!"
