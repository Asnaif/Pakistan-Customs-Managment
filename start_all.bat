@echo off
echo Starting Customs PMM Dashboard...

cd backend
start cmd /k "npm run dev"

cd ../frontend
start cmd /k "npm run dev"

echo Both servers are starting in separate windows.
