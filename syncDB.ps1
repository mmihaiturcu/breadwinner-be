cd edgedb
edgedb instance destroy "breadwinner" --force
Remove-Item -Recurse -Force './dbschema/migrations'
edgedb instance create breadwinner
edgedb project init --non-interactive --link --server-instance breadwinner 
edgedb migration create --non-interactive
edgedb migrate
npx edgeql-js