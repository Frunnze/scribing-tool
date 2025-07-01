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


Shield: [![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

This work is licensed under a
[Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc].

[![CC BY-NC 4.0][cc-by-nc-image]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg