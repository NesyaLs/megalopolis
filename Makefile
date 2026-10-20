all: build

build:
	npx tsc -p tsconfig.json

eslint:
	npx eslint src tst

test:
	npx jest

run: build
	@node dist/main.js

watch:
	npx tsc -w -p tsconfig.json

clean:
	rm -f *~ src/*.js
