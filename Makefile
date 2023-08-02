DESTDIR?=/usr/local/alert2twcall
OWNER?=root
GROUP?=root
SYSTEMDDIR=/lib/systemd/system

all:build
build:
	npm install

# run as root:
install:
	install -o ${OWNER} -g ${GROUP} -d ${DESTDIR}
	cp -R app.js bin node_modules ${DESTDIR}
	chown -R ${OWNER}:${GROUP} ${DESTDIR}

install_systemd:
	install -o ${OWNER} -g ${GROUP} examples/alert2twcall.service /lib/systemd/system
	install -o ${OWNER} -g ${GROUP} examples/alert2twcall.default /etc/default/alert2twcall

.PHONY: build install install_systemd
