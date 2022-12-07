# graphql-playground
A small playground to experiment GraphQL pentesting 

## install

```bash
apt install nodejs npm
git clone https://github.com/NAs3c/graphql-playground.git && cd graphql-playground
npm install . --legacy-peer-deps # TODO : fix dependency fail
```
Replace your external IP in www/index.html (const db_url)

## launch
```bash
node server.js &
cd www && python3 -m http.server 8000
```
App is available at <external_ip>:8000
