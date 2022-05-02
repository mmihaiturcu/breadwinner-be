cd edgedb
edgedb instance destroy "breadwinnerNightly" --force
Remove-Item -Recurse -Force './dbschema/migrations'
edgedb instance create breadwinnerNightly --nightly
edgedb project init --non-interactive --link --server-instance breadwinnerNightly 
edgedb migration create --non-interactive
edgedb migrate
npx edgeql-js