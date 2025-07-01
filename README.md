## Install
- git clone https://github.com/frunnze/scribing-tool
- cd scribing-tool
- create .env and add OPENAI_API_KEY as shown in .env.example
- cd flask_app
- pip install -r requirements.txt
- Ensure redis is installed on your PC
- python3 run.py
- cd ..
- cd react_app
- npm i
- npm run dev
- Access http://localhost:5173/


## Technical Decisions & Trade-Oﬀs
- Used tech stack: React, Flask, websockets, redis


Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg