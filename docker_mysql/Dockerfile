# FROM mysql:5.7.26
FROM mysql:8.0.29


RUN unlink /etc/localtime \
    && ln -s /usr/share/zoneinfo/Asia/Hong_Kong /etc/localtime

# # https://ubuntuforums.org/showthread.php?t=2415997
# ADD key.txt /root

# RUN apt-key list | grep expired

# # key expired, update key
# # https://serverok.in/mysql-8-apt-error-the-following-signatures-were-invalid
# # https://stackoverflow.com/questions/66217436/gpg-keyserver-receive-failed-no-name
# # https://keyring.debian.org/
# # RUN apt-key adv --keyserver keyring.debian.org --recv-keys 8C718D3B5072E1F5
# # RUN apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 8C718D3B5072E1F5
# # RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 8C718D3B5072E1F5
# # RUN apt-key adv --recv-keys 8C718D3B5072E1F5
# # RUN apt-key adv --refresh-keys
# RUN  /bin/sh -c set -ex; \
#     key='A4A9406876FCBD3C456770C88C718D3B5072E1F5'; \
#     export GNUPGHOME="$(mktemp -d)"; \
#     gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
#     gpg --batch --export "$key" > /etc/apt/trusted.gpg.d/mysql.gpg; \
#     gpgconf --kill all; \
#     rm -rf "$GNUPGHOME"; \
#     apt-key list > /dev/null
# RUN apt-key list | grep expired -C 2


RUN microdnf update -y
RUN microdnf install -y curl python3 python3-pip supervisor procps cron rsync

# RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
#     && python get-pip.py \
#     && pip install awscli
RUN pip3 install awscli

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN microdnf install nodejs -y
RUN npm -g i nodemon
