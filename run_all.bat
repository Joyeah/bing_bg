@rem run one of blow:
set NODE_ENV = production
node index.js --all | node_modules\.bin\bunyan -o short -l warn
@rem yarn run start