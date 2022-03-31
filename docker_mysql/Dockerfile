FROM mysql:5.7.26

# key expired, update key
# https://serverok.in/mysql-8-apt-error-the-following-signatures-were-invalid
# https://stackoverflow.com/questions/66217436/gpg-keyserver-receive-failed-no-name
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 8C718D3B5072E1F5

RUN apt update -y
RUN apt install curl python3 python3-pip supervisor procps cron rsync -y

# RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
#     && python get-pip.py \
#     && pip install awscli
RUN pip3 install awscli

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt install nodejs -y
RUN npm -g i nodemon
