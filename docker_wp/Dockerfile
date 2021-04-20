FROM wordpress:php7.4-apache

RUN apt update -y \
    && apt install curl python3 python3-pip -y

# RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
#     && python get-pip.py \
#     && pip install awscli
RUN pip3 install awscli

RUN apt install supervisor -y
RUN apt install procps -y
RUN apt install cron -y
RUN apt install rsync -y

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt install nodejs -y
RUN npm -g i nodemon

RUN docker-php-ext-install pdo_mysql