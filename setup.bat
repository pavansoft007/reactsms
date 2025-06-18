@echo off
echo Setting up project with Yarn...

echo Installing root dependencies...
call yarn install

echo Installing client dependencies...
cd client
call yarn install
cd ..

echo Installing server dependencies...
cd server
call yarn install
cd ..

echo Setup complete! You can now run:
echo   yarn dev - to start both client and server
echo   yarn client - to start only the client  
echo   yarn server - to start only the server
pause
