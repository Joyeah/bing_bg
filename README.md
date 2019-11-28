# bing_bg
This is the background image download tool for cn.bing.com.

This tool will download all background images of cn.bing.com homepage.You can run it every day  or every few days.

#### Install

> git https://github.com/Joyeah/bing_bg.git
>
> cd bing_bg
>
> yarn install 

#### Configuration

1. reset `executablePath` to your chrome path or set it empty
2. set `imgdir` to your image dir path 

#### Usage

> yarn run start

or 

> run.bat  #on win

or 

> run_all.bat  #on win

#### Dependence

puppeteer-core.js

bunyan.js

moment.js

config.js