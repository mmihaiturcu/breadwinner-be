# Breadwinner

## EdgeDB commands

edgedb instance destroy "breadwinner" --force

edgedb instance start breadwinner

npx edgeql-js

## Redis startup command

sudo service redis-server start

## Haproxy

Config is in /etc/haproxy/haproxy.cfg

After making changes run
sudo service haproxy start
