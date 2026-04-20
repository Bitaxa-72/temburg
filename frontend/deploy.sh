#!/bin/bash
# Deploy Termburg frontend to production server
npm run build && \
tar -czf - -C build . | ssh root@89.23.96.172 "rm -rf /var/www/termburg.ceosivaev.ru/* && tar -xzf - -C /var/www/termburg.ceosivaev.ru"
echo "Deployed to https://termburg.ceosivaev.ru"
