FROM cnbcool/default-dev-env:latest

RUN { \
    apt update ; \
    apt install -y libglib2.0-dev  libnss3 libx11-xcb1 libxcomposite1 \
        libasound2 libatk1.0-0 libatk-bridge2.0-0 libcairo2 libcups2 libdbus-1-3 \
        libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 \
        libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
        libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
        libxrender1 libxss1 libxtst6 ncat ; \
    sed -i 's/ZSH_THEME=".*"/ZSH_THEME="agnoster"/' ~/.zshrc ; \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash ; \
    \. "$HOME/.nvm/nvm.sh" ; \
    nvm install 24 ; \
    node -v ; \
    nvm current ; \
    npm -v ; \
    npm install -g yarn ; \
    npm install -g pnpm ; \
}