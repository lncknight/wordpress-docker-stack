FROM wordpress:php7.4-apache

RUN apt update -y \
    && apt install curl python -y

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python get-pip.py \
    && pip install awscli

RUN apt install supervisor -y
RUN apt install procps -y
RUN apt install cron -y
RUN apt install rsync -y