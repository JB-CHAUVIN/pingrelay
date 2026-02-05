# WhatsApp TutosExcel

# 1 - Lancer Docker WAHA

```
docker login -u devlikeapro -p dckr_pat_bxOPsnGm4ueZxAe1HmRea0ls_eo
docker pull devlikeapro/waha-plus:latest

docker run -d \
  -p 127.0.0.1:3001:3001/tcp \
  -e WAHA_DASHBOARD_USERNAME=jbe \
  -e WAHA_DASHBOARD_PASSWORD=AzkdoDDJDJOJDeoeoeeozjOZOOkokd900922 \
  -e WHATSAPP_API_PORT=3001 \
  -e WHATSAPP_API_HOSTNAME=tutosexcel-waha.jbchauvin.fr \
  devlikeapro/waha-plus
```

# 2 - Lancer le projet

```
yarn install
```

# 3 - Infos

API key : DOKDOKé2O2KAsOKdEOKOEKdkdokdok222kOkdokdo